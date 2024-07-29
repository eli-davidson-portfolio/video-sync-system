import React, { useState, useEffect } from 'react';
import ServerClock from './components/serverClock';
import ClientClock from './components/clientClock';
import SyncStats from './components/syncStats';
import './App.css';
import { createWorker, sendToWorker } from './workerManager';

function App() {
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [syncResult, setSyncResult] = useState(null);
  const [serverTime, setServerTime] = useState(null);

  useEffect(() => {
    const timeSyncWorker = createWorker('timeSync', {
      url: 'ws://localhost:8080',
    });

    timeSyncWorker.onmessage = function (e) {
      const { type, data } = e.data;
      switch (type) {
        case 'connectionStatus':
          setConnectionStatus(data.status);
          break;
        case 'timeSyncResult':
          setSyncResult(data);
          break;
        case 'serverTimeUpdate':
          setServerTime({
            ...data.time,
            clientReceivedTime: performance.now(),
          });
          break;
        default:
          console.log('Unhandled message type:', type);
      }
    };

    sendToWorker('timeSync', { type: 'startSync' });

    return () => {
      sendToWorker('timeSync', { type: 'disconnect' });
      // Assuming workerManager has a method to terminate workers
      // If not, you'll need to implement it
      // terminateWorker("timeSync");
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Time Synchronization Dashboard</h1>
        <div className="connection-status">
          Status:{' '}
          <span className={`status-${connectionStatus.toLowerCase()}`}>
            {connectionStatus}
          </span>
        </div>
      </header>
      <main className="App-main">
        <div className="clock-container">
          <ServerClock serverTime={serverTime} />
          <ClientClock />
        </div>
        <SyncStats syncResult={syncResult} />
      </main>
    </div>
  );
}

export default App;
