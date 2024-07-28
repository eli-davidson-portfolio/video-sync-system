let socket = null;

const getHighResTime = () => {
  return performance.timeOrigin + performance.now();
};

function connect() {
  return new Promise((resolve, reject) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      resolve();
      return;
    }

    socket = new WebSocket("ws://localhost:8080/ws");

    socket.onopen = function (e) {
      postMessage({ type: "connectionStatus", status: "Connected" });
      resolve();
    };

    socket.onmessage = function (event) {
      const data = JSON.parse(event.data);
      if (data.type === "timeSync") {
        handleTimeSync(data);
      } else {
        postMessage({ type: "message", data: event.data });
      }
    };

    socket.onclose = function (event) {
      if (event.wasClean) {
        postMessage({
          type: "connectionStatus",
          status: "Disconnected cleanly",
        });
      } else {
        postMessage({ type: "connectionStatus", status: "Connection died" });
      }
      socket = null;
      reject(new Error("WebSocket closed"));
    };

    socket.onerror = function (error) {
      postMessage({
        type: "connectionStatus",
        status: "Error: " + error.message,
      });
      reject(error);
    };
  });
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

function sendTimeSync() {
  connect()
    .then(() => {
      const t1 = getHighResTime();
      socket.send(JSON.stringify({ type: "timeSync", t1: t1 }));
    })
    .catch((error) => {
      postMessage({
        type: "error",
        message: "Failed to connect: " + error.message,
      });
    });
}

function handleTimeSync(data) {
  const t4 = getHighResTime();
  const { t1, t2, t3 } = data;

  // Calculate round-trip delay and offset
  const delay = t4 - t1 - (t3 - t2);
  const offset = (t2 - t1 + (t3 - t4)) / 2;

  postMessage({
    type: "timeSyncResult",
    t1: t1,
    t2: t2,
    t3: t3,
    t4: t4,
    delay: delay,
    offset: offset,
  });
}

self.onmessage = function (e) {
  if (e.data.type === "connect") {
    connect();
  } else if (e.data.type === "disconnect") {
    disconnect();
  } else if (e.data.type === "getHighResTime") {
    postMessage({ type: "highResTime", time: getHighResTime() });
  } else if (e.data.type === "sendTimeSync") {
    sendTimeSync();
  }
};
