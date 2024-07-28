import React, { useState, useEffect } from "react";
import ServerClock from "./components/serverClock";
import ClientClock from "./components/clientClock";
import SyncStats from "./components/syncStats";
import "./App.css";

function App() {
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [syncResult, setSyncResult] = useState(null);
  const [serverTime, setServerTime] = useState(null);
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    if (typeof Worker !== "undefined") {
      const newWorker = new Worker(new URL("./worker.js", import.meta.url));
      setWorker(newWorker);

      newWorker.onmessage = function (e) {
        if (e.data.type === "connectionStatus") {
          setConnectionStatus(e.data.status);
        } else if (e.data.type === "timeSyncResult") {
          setSyncResult(e.data);
        } else if (e.data.type === "serverTimeUpdate") {
          setServerTime({
            ...e.data.time,
            clientReceivedTime: performance.now(),
          });
        }
      };

      return () => {
        newWorker.postMessage({ type: "disconnect" });
        newWorker.terminate();
      };
    } else {
      console.log("Your browser does not support web workers.");
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Time Synchronization Dashboard</h1>
        <div className="connection-status">
          Status:{" "}
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
