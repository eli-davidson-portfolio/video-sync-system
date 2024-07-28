import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [worker, setWorker] = useState(null);
  const [timeSyncResult, setTimeSyncResult] = useState(null);

  useEffect(() => {
    if (typeof Worker !== "undefined") {
      const newWorker = new Worker(new URL("./worker.js", import.meta.url));
      setWorker(newWorker);

      newWorker.onmessage = function (e) {
        if (e.data.type === "connectionStatus") {
          setConnectionStatus(e.data.status);
        } else if (e.data.type === "timeSyncResult") {
          setTimeSyncResult(e.data);
        } else if (e.data.type === "error") {
          console.error(e.data.message);
        }
      };

      return () => {
        newWorker.terminate();
      };
    } else {
      console.log("Your browser does not support web workers.");
    }
  }, []);

  const handleConnect = () => {
    if (worker) {
      worker.postMessage({ type: "connect" });
    }
  };

  const handleDisconnect = () => {
    if (worker) {
      worker.postMessage({ type: "disconnect" });
    }
  };

  const handleSendTimeSync = () => {
    if (worker) {
      worker.postMessage({ type: "sendTimeSync" });
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Time Synchronization Demo</h1>
        <p>Connection Status: {connectionStatus}</p>
        <button
          onClick={handleConnect}
          disabled={connectionStatus === "Connected"}
          type="button"
        >
          Connect
        </button>
        <button
          onClick={handleDisconnect}
          disabled={connectionStatus === "Disconnected"}
          type="button"
        >
          Disconnect
        </button>
        <button onClick={handleSendTimeSync} type="button">
          Send Time Sync
        </button>
        {timeSyncResult && (
          <div>
            <h2>Time Sync Results:</h2>
            <p>t1 (Client Send): {timeSyncResult.t1.toFixed(3)} ms</p>
            <p>t2 (Server Receive): {timeSyncResult.t2.toFixed(3)} ms</p>
            <p>t3 (Server Send): {timeSyncResult.t3.toFixed(3)} ms</p>
            <p>t4 (Client Receive): {timeSyncResult.t4.toFixed(3)} ms</p>
            <p>Round-trip Delay: {timeSyncResult.delay.toFixed(3)} ms</p>
            <p>Clock Offset: {timeSyncResult.offset.toFixed(3)} ms</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
