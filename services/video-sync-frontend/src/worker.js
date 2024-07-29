let socket = null;
let syncResults = [];
const MAX_SAMPLES = 100;
let currentSyncInterval = 1000; // Initial sync interval: 1 second
const MAX_SYNC_INTERVAL = 60000; // Maximum sync interval: 1 minute
let syncIntervalId = null;
let serverTimeUpdateInterval = null;
let lastEstimatedServerTime = null;
let lastEstimationTime = null;

const getHighResTime = () => {
  return performance.timeOrigin + performance.now();
};


function stopServerTimeUpdates() {
  if (serverTimeUpdateInterval) {
    clearInterval(serverTimeUpdateInterval);
    serverTimeUpdateInterval = null;
  }
}

function connect() {
  return new Promise((resolve, reject) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      resolve();
      return;
    }

    socket = new WebSocket('ws://localhost:8080/ws');

    socket.onopen = function () {
      postMessage({ type: 'connectionStatus', status: 'Connected' });
      startSyncProcess();
      startServerTimeUpdates();
      resolve();
    };

    socket.onmessage = function (event) {
      const data = JSON.parse(event.data);
      if (data.type === 'timeSync') {
        handleTimeSync(data);
      } else {
        postMessage({ type: 'message', data: event.data });
      }
    };

    socket.onclose = function (event) {
      if (event.wasClean) {
        postMessage({
          type: 'connectionStatus',
          status: 'Disconnected cleanly',
        });
      } else {
        postMessage({ type: 'connectionStatus', status: 'Connection died' });
      }
      socket = null;
      stopSyncProcess();
      stopServerTimeUpdates();
      setTimeout(connect, 5000); // Attempt to reconnect after 5 seconds
      reject(new Error('WebSocket closed'));
    };

    socket.onerror = function (error) {
      postMessage({
        type: 'connectionStatus',
        status: 'Error: ' + error.message,
      });
      reject(error);
    };
  });
}

function disconnect() {
  if (socket) {
    socket.close();
    socket = null;
    stopSyncProcess();
    stopServerTimeUpdates();
    postMessage({ type: 'connectionStatus', status: 'Disconnected' });
  } else {
    postMessage({ type: 'connectionStatus', status: 'Not connected' });
  }
}

function startSyncProcess() {
  sendTimeSync();
  syncIntervalId = setInterval(sendTimeSync, currentSyncInterval);
}

function stopSyncProcess() {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
}

function sendTimeSync() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const t1 = getHighResTime();
    socket.send(JSON.stringify({ type: 'timeSync', t1: t1 }));
  } else {
    connect()
      .then(() => {
        const t1 = getHighResTime();
        socket.send(JSON.stringify({ type: 'timeSync', t1: t1 }));
      })
      .catch((error) => {
        postMessage({
          type: 'error',
          message: 'Failed to connect: ' + error.message,
        });
      });
  }
}

function calculateStats() {
  const offsets = syncResults.map((r) => r.offset);
  const delays = syncResults.map((r) => r.delay);
  const timestamps = syncResults.map((r) => r.t1);

  return {
    offsetEMA: calculateEMA(offsets, 20),
    delayEMA: calculateEMA(delays, 20),
    offsetMedian: calculateMedian(offsets),
    delayMedian: calculateMedian(delays),
    offsetConfidenceInterval: confidenceInterval(offsets),
    delayConfidenceInterval: confidenceInterval(delays),
    jitter: calculateJitter(delays),
    driftRate: calculateDrift(offsets, timestamps),
    allanDeviation: Math.sqrt(allanVariance(offsets, 1)),
    outliers: detectOutliers(offsets),
  };
}

function getServerTime() {
  const currentTime = getHighResTime();

  if (lastEstimatedServerTime === null || lastEstimationTime === null) {
    console.log('Invalid server time: No initial estimation available', {
      lastEstimatedServerTime,
      lastEstimationTime,
    });
    return null;
  }

  const timeSinceLastEstimation = currentTime - lastEstimationTime;

  // Log sync results for debugging
  console.log('Sync results:', syncResults);

  const drift = calculateDrift(
    syncResults.map((r) => r.offset),
    syncResults.map((r) => r.t1),
  );

  console.log('Drift calculation:', {
    drift,
    offsetsLength: syncResults.length,
    firstOffset: syncResults[0]?.offset,
    lastOffset: syncResults[syncResults.length - 1]?.offset,
  });

  const estimatedServerTime =
    lastEstimatedServerTime + timeSinceLastEstimation * (1 + drift);

  console.log('Server time calculation:', {
    lastEstimatedServerTime,
    timeSinceLastEstimation,
    drift,
    estimatedServerTime,
  });

  if (isNaN(estimatedServerTime) || !isFinite(estimatedServerTime)) {
    console.log('Invalid server time calculated:', {
      lastEstimatedServerTime,
      lastEstimationTime,
      currentTime,
      timeSinceLastEstimation,
      drift,
      estimatedServerTime,
    });
    return null;
  }

  return {
    highResTime: estimatedServerTime,
    standardTime: Math.floor(estimatedServerTime),
  };
}


function handleTimeSync(data) {
  const t4 = getHighResTime();
  const { t1, t2, t3 } = data;

  const delay = t4 - t1 - (t3 - t2);
  const offset = (t2 - t1 + (t3 - t4)) / 2;

  const result = { t1, t2, t3, t4, delay, offset };
  syncResults.push(result);
  if (syncResults.length > MAX_SAMPLES) {
    syncResults.shift();
  }

  const stats = calculateStats();
  updateSyncInterval(stats);

  // Update our estimate of the server time
  lastEstimatedServerTime = t3 + offset;
  lastEstimationTime = t4;

  console.log('Time sync update:', {
    t1,
    t2,
    t3,
    t4,
    delay,
    offset,
    lastEstimatedServerTime,
    lastEstimationTime,
  });

  if (isNaN(lastEstimatedServerTime) || !isFinite(lastEstimatedServerTime)) {
    console.log('Invalid lastEstimatedServerTime calculated:', {
      t3,
      offset,
      lastEstimatedServerTime,
    });
  }

  postMessage({
    type: 'timeSyncResult',
    ...result,
    ...stats,
  });
}

function updateSyncInterval(stats) {
  const { offsetMedian, jitter } = stats;
  const absOffset = Math.abs(offsetMedian);

  if (absOffset > 10 || jitter > 5) {
    currentSyncInterval = 1000; // Reset to initial interval
  } else if (absOffset > 5 || jitter > 2) {
    currentSyncInterval = Math.min(currentSyncInterval * 2, MAX_SYNC_INTERVAL);
  } else {
    currentSyncInterval = Math.min(
      currentSyncInterval * 1.5,
      MAX_SYNC_INTERVAL,
    );
  }

  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = setInterval(sendTimeSync, currentSyncInterval);
  }
}

function startServerTimeUpdates() {
  if (serverTimeUpdateInterval) {
    clearInterval(serverTimeUpdateInterval);
  }
  serverTimeUpdateInterval = setInterval(() => {
    const serverTime = getServerTime();
    if (serverTime) {
      postMessage({ type: 'serverTimeUpdate', time: serverTime });
    } else {
      console.log('Unable to get valid server time for update');
    }
  }, 50); // Update every 50ms
}
function calculateEMA(samples, period, smoothing = 2) {
  const k = smoothing / (period + 1);
  let ema = samples[0];
  for (let i = 1; i < samples.length; i++) {
    ema = samples[i] * k + ema * (1 - k);
  }
  return ema;
}

function calculateMedian(samples) {
  const sorted = samples.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

function confidenceInterval(samples) {
  const n = samples.length;
  const mean = samples.reduce((a, b) => a + b) / n;
  const stdDev = Math.sqrt(
    samples.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n,
  );
  const error = (stdDev / Math.sqrt(n)) * 1.96; // 1.96 is the z-score for 95% confidence
  return [mean - error, mean + error];
}

function calculateJitter(delays) {
  const differences = delays
    .slice(1)
    .map((delay, i) => Math.abs(delay - delays[i]));
  return differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
}


function calculateDrift(offsets, timestamps) {
  const n = offsets.length;

  if (n < 2) {
    console.log('Not enough data to calculate drift', { n });
    return 0;
  }

  const sumXY = offsets.reduce(
    (sum, offset, i) => sum + offset * timestamps[i],
    0,
  );
  const sumX = timestamps.reduce((sum, t) => sum + t, 0);
  const sumY = offsets.reduce((sum, offset) => sum + offset, 0);
  const sumX2 = timestamps.reduce((sum, t) => sum + t * t, 0);

  const drift = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  console.log('Drift calculation details:', {
    n,
    sumXY,
    sumX,
    sumY,
    sumX2,
    drift,
  });

  if (isNaN(drift) || !isFinite(drift)) {
    console.log('Invalid drift calculated', { drift });
    return 0;
  }

  return drift;
}


function allanVariance(samples, tau) {
  let sum = 0;
  for (let i = 0; i < samples.length - 2 * tau; i += tau) {
    const y1 = samples[i + tau] - samples[i];
    const y2 = samples[i + 2 * tau] - samples[i + tau];
    sum += Math.pow(y2 - y1, 2);
  }
  return sum / (2 * tau * tau * (samples.length / tau - 2));
}

function detectOutliers(samples) {
  const sorted = samples.slice().sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length / 4)];
  const q3 = sorted[Math.floor((3 * sorted.length) / 4)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  return samples.filter((x) => x < lowerBound || x > upperBound);
}
self.onmessage = function (event) {
  if (event.data.type === 'connect') {
    connect();
  } else if (event.data.type === 'disconnect') {
    disconnect();
  } else if (event.data.type === 'getHighResTime') {
    postMessage({ type: 'highResTime', time: getHighResTime() });
  } else if (event.data.type === 'sendTimeSync') {
    sendTimeSync();
  } else if (event.data.type === 'getServerTime') {
    postMessage({ type: 'serverTime', time: getServerTime() });
  } else if (event.data.type === 'getHighResServerTime') {
    const serverTime = getServerTime();
    if (serverTime) {
      postMessage({ type: 'highResServerTime', time: serverTime.highResTime });
    } else {
      postMessage({
        type: 'error',
        message: 'Server time not yet synchronized',
      });
    }
  }
};

// Start connection immediately
connect();
