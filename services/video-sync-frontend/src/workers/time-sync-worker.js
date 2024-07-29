import {
  initWebSocket,
  sendMessage,
  closeConnection,
} from './modules/webSocketHandler';
import { handleTimeSync, estimateServerTime } from './modules/timeSyncLogic';
import { calculateStats } from './modules/statsCalculator';
import { getHighResTime } from './utils/workerUtils';

let socket;
let syncInterval;
let serverTimeUpdateInterval;

function startSync() {
  if (syncInterval) clearInterval(syncInterval);
  syncInterval = setInterval(() => {
    const t1 = getHighResTime();
    sendMessage(socket, { type: 'timeSync', t1 });
  }, 1000); // Adjust sync interval as needed
}

function stopSync() {
  if (syncInterval) clearInterval(syncInterval);
}

function startServerTimeUpdates() {
  if (serverTimeUpdateInterval) clearInterval(serverTimeUpdateInterval);
  serverTimeUpdateInterval = setInterval(() => {
    const serverTime = estimateServerTime();
    if (serverTime) {
      self.postMessage({ type: 'serverTimeUpdate', time: serverTime });
    }
  }, 50); // Adjust update interval as needed
}

function stopServerTimeUpdates() {
  if (serverTimeUpdateInterval) clearInterval(serverTimeUpdateInterval);
}

function handleMessage(event) {
  const { type, data } = event.data;
  switch (type) {
    case 'init':
      socket = initWebSocket(data.url, {
        onOpen: () => {
          self.postMessage({ type: 'connectionStatus', status: 'Connected' });
          startSync();
          startServerTimeUpdates();
        },
        onClose: () => {
          self.postMessage({
            type: 'connectionStatus',
            status: 'Disconnected',
          });
          stopSync();
          stopServerTimeUpdates();
        },
        onMessage: (message) => {
          if (message.type === 'timeSync') {
            const result = handleTimeSync(message);
            const stats = calculateStats(result);
            self.postMessage({ type: 'timeSyncResult', ...result, ...stats });
          }
        },
      });
      break;
    case 'startSync':
      startSync();
      break;
    case 'stopSync':
      stopSync();
      break;
    case 'disconnect':
      stopSync();
      stopServerTimeUpdates();
      closeConnection(socket);
      break;
    default:
      console.warn(`Unknown message type: ${type}`);
  }
}

function handleError(error) {
  console.error('Worker error:', error);
  self.postMessage({ type: 'error', message: error.message });
}

export function initTimeSyncWorker() {
  self.onmessage = handleMessage;
  self.onerror = handleError;

  return {
    postMessage: self.postMessage.bind(self),
    terminate: () => {
      stopSync();
      stopServerTimeUpdates();
      if (socket) closeConnection(socket);
    },
  };
}
