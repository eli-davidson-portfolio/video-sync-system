// src/App.js
import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [workerResult, setWorkerResult] = useState(null);
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    if (typeof Worker !== "undefined") {
      const newWorker = new Worker(new URL("./worker.js", import.meta.url));
      setWorker(newWorker);

      newWorker.onmessage = function (e) {
        setWorkerResult(e.data);
      };

      return () => {
        newWorker.terminate();
      };
    } else {
      console.log("Your browser does not support web workers.");
    }
  }, []);

  const handleClick = () => {
    if (worker) {
      const number = 5; // Example number to calculate factorial
      worker.postMessage(number);
      return true; // Ensure a return value for the function
    }
    return false; // Ensure a return value for the function
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Web Worker Demo</h1>
        <button onClick={handleClick} type="button">
          Calculate Factorial
        </button>
        {workerResult !== null && <p>Result: {workerResult}</p>}
      </header>
    </div>
  );
}

export default App;
