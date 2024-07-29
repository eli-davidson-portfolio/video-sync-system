import React from 'react';
import { useTimeSyncState } from '../hooks/useTimeSyncState';

export const ServerClock: React.FC = () => {
  const { timeSyncState } = useTimeSyncState();

  if (!timeSyncState.serverTime) {
    return <div>Synchronizing...</div>;
  }

  return (
    <div>
      <h2>Server Time</h2>
      <p>{new Date(timeSyncState.serverTime).toLocaleTimeString()}</p>
      <p>Connection Status: {timeSyncState.connectionStatus}</p>
      <p>Offset: {timeSyncState.offset.toFixed(2)} ms</p>
      <p>Round Trip Delay: {timeSyncState.roundTripDelay.toFixed(2)} ms</p>
    </div>
  );
};
