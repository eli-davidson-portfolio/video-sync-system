let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 5000; // 5 seconds

export function initWebSocket(url, callbacks) {
  const { onOpen, onClose, onMessage, onError } = callbacks;

  socket = new WebSocket(url);

  socket.onopen = () => {
    console.log('WebSocket connection established');
    reconnectAttempts = 0;
    if (onOpen) onOpen();
  };

  socket.onclose = (event) => {
    console.log('WebSocket connection closed:', event.reason);
    if (onClose) onClose(event);

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      setTimeout(() => {
        reconnectAttempts++;
        console.log(
          `Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`,
        );
        initWebSocket(url, callbacks);
      }, RECONNECT_DELAY);
    } else {
      console.error('Max reconnect attempts reached. Please refresh the page.');
    }
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (onMessage) onMessage(data);
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    if (onError) onError(error);
  };

  return socket;
}

export function sendMessage(socket, message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.error('WebSocket is not open. Message not sent.');
  }
}

export function closeConnection(socket) {
  if (socket) {
    socket.close();
  }
}
