import React, { useState, useEffect } from "react";

const ServerClock = ({ serverTime }) => {
  const [displayTime, setDisplayTime] = useState("Synchronizing...");
  const [localTimezone, setLocalTimezone] = useState("");

  useEffect(() => {
    // Determine local timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setLocalTimezone(timezone);
  }, []);

  useEffect(() => {
    if (serverTime && serverTime.standardTime) {
      const date = new Date(serverTime.standardTime);
      if (isNaN(date.getTime())) {
        console.log("Invalid date received in ServerClock:", {
          serverTime,
          dateObject: date,
        });
        setDisplayTime("Invalid Date");
      } else {
        // Convert UTC time to local timezone
        const localDate = new Date(
          date.toLocaleString("en-US", { timeZone: localTimezone })
        );
        setDisplayTime(
          localDate.toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
            timeZoneName: "short",
          })
        );
      }
    } else {
      console.log("Invalid serverTime received in ServerClock:", serverTime);
    }
  }, [serverTime, localTimezone]);

  return (
    <div className="clock server-clock">
      <h2>Server Time (Local: {localTimezone})</h2>
      <p>{displayTime}</p>
    </div>
  );
};

export default ServerClock;
