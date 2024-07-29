const workers = {};

export function createWorker(type, params) {
  if (workers[type]) {
    console.warn(
      `Worker of type ${type} already exists. Returning existing worker.`,
    );
    return workers[type];
  }

  let worker;

  switch (type) {
    case 'timeSync':
      worker = new Worker(new URL('./workers/main-worker.js', import.meta.url));
      break;
    // ... cases for other worker types
    default:
      throw new Error(`Unsupported worker type: ${type}`);
  }

  worker.onmessage = (event) => {
    // Global message handling, if needed
    console.log(`Received message from ${type} worker:`, event.data);
  };

  worker.onerror = (error) => {
    console.error(`Error in ${type} worker:`, error);
  };

  workers[type] = worker;
  sendToWorker(type, { type: 'init', data: params });

  return worker;
}

export function sendToWorker(type, message) {
  if (workers[type]) {
    workers[type].postMessage(message);
  } else {
    console.error(`Worker of type ${type} does not exist.`);
  }
}

export function terminateWorker(type) {
  if (workers[type]) {
    workers[type].terminate();
    delete workers[type];
    console.log(`Worker of type ${type} has been terminated.`);
  } else {
    console.warn(`No worker of type ${type} exists to terminate.`);
  }
}

export function getWorker(type) {
  return workers[type] || null;
}

export function listActiveWorkers() {
  return Object.keys(workers);
}
