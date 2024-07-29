import React, { useState, useEffect } from 'react';

const ClientClock = () => {
  const [time, setTime] = useState(new Date());
  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Determine local timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(tz);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="clock client-clock">
      <h2>Client Time (Local: {timezone})</h2>
      <p>
        {time.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          timeZoneName: 'short',
        })}
      </p>
    </div>
  );
};

export default ClientClock;
