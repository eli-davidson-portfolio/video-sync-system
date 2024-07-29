import React from 'react';

const TimestampButton = ({ worker, label }) => {
  const handleClick = () => {
    if (worker) {
      worker.postMessage({ type: 'getHighResServerTime' });
    }
  };

  return <button onClick={handleClick} type="button">{label}</button>;
};

export default TimestampButton;
