import React from "react";

const SyncStats = ({ syncResult }) => {
  if (!syncResult) return null;

  const formatDriftRate = (rate) => {
    if (Math.abs(rate) < 0.000001) {
      return "0 ms/s (no significant drift)";
    }
    return `${rate.toFixed(6)} ms/s (${
      rate > 0 ? "gaining" : "losing"
    } 1 second every ${(1000 / Math.abs(rate) / 3600).toFixed(1)} hours)`;
  };

  return (
    <div className="sync-stats">
      <h2>Synchronization Statistics</h2>
      <div className="stat-grid">
        <div className="stat-item">
          <span className="stat-label">Round-trip Delay:</span>
          <span className="stat-value">{syncResult.delay.toFixed(3)} ms</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Clock Offset:</span>
          <span className="stat-value">{syncResult.offset.toFixed(3)} ms</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Jitter:</span>
          <span className="stat-value">{syncResult.jitter.toFixed(3)} ms</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Drift Rate:</span>
          <span className="stat-value">
            {formatDriftRate(syncResult.driftRate)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SyncStats;
