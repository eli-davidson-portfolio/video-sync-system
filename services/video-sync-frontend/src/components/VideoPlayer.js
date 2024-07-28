import React, { useRef, useEffect } from "react";

const VideoPlayer = ({ src, onTimeUpdate }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const handleTimeUpdate = () => {
      onTimeUpdate(video.currentTime);
    };
    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [onTimeUpdate]);

  return (
    <video ref={videoRef} controls>
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoPlayer;
