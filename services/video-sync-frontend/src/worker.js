let socket = null;

function connect() {
  if (socket) {
    postMessage({ type: "connectionStatus", status: "Already connected" });
    return;
  }

  socket = new WebSocket("ws://localhost:8080/ws");

  socket.onopen = function (e) {
    postMessage({ type: "connectionStatus", status: "Connected" });
  };

  socket.onmessage = function (event) {
    postMessage({ type: "message", data: event.data });
  };

  socket.onclose = function (event) {
    if (event.wasClean) {
      postMessage({ type: "connectionStatus", status: "Disconnected cleanly" });
    } else {
      postMessage({ type: "connectionStatus", status: "Connection died" });
    }
    socket = null;
  };

  socket.onerror = function (error) {
    postMessage({
      type: "connectionStatus",
      status: "Error: " + error.message,
    });
  };
}

function disconnect() {
  if (socket) {
    socket.close();
    socket = null;
    postMessage({ type: "connectionStatus", status: "Disconnected" });
  } else {
    postMessage({ type: "connectionStatus", status: "Not connected" });
  }
}

self.onmessage = function (e) {
  if (e.data.type === "connect") {
    connect();
  } else if (e.data.type === "disconnect") {
    disconnect();
  }
};
