import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    if (typeof Worker !== "undefined") {
      const newWorker = new Worker(new URL("./worker.js", import.meta.url));
      setWorker(newWorker);

      newWorker.onmessage = function (e) {
        if (e.data.type === "connectionStatus") {
          setConnectionStatus(e.data.status);
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>WebSocket Connection Demo</h1>
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
      </header>
    </div>
  );
}

export default App;
