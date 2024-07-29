import { getHighResTime } from '../utils/workerUtils';

let offsetSamples = [];
const MAX_SAMPLES = 10;
let lastEstimatedOffset = 0;
let lastSyncTime = 0;

export function handleTimeSync(message) {
  const { t1, t2, t3 } = message;
  const t4 = getHighResTime();

  const roundTripDelay = (t4 - t1) - (t3 - t2);
  const offset = ((t2 - t1) + (t3 - t4)) / 2;

  // Update offset samples
  offsetSamples.push(offset);
  if (offsetSamples.length > MAX_SAMPLES) {
    offsetSamples.shift();
  }

  // Calculate median offset
  const sortedOffsets = [...offsetSamples].sort((a, b) => a - b);
  const medianOffset = sortedOffsets[Math.floor(sortedOffsets.length / 2)];

  lastEstimatedOffset = medianOffset;
  lastSyncTime = t4;

  return {
    roundTripDelay,
    offset: medianOffset,
    syncTime: t4,
  };
}

export function estimateServerTime() {
  const now = getHighResTime();
  const timeSinceLastSync = now - lastSyncTime;
  return now + lastEstimatedOffset + calculateDrift(timeSinceLastSync);
}

function calculateDrift(timeSinceLastSync) {
  // This is a simple linear drift model. You might want to use a more
  // sophisticated model based on your specific requirements.
  const DRIFT_RATE = 0.001; // 1ms drift per second, adjust as needed
  return DRIFT_RATE * (timeSinceLastSync / 1000);
}