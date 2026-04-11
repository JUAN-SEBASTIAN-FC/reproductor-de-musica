import React, { useEffect, useState, useRef } from 'react';
import { useAudioPlayer } from '../context/AudioPlayerContext';

const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds)) return "0:00";
  const m = Math.floor(timeInSeconds / 60);
  const s = Math.floor(timeInSeconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const ProgressBar = () => {
  const { audioElement, seek } = useAudioPlayer();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressBarRef = useRef(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (!audioElement) return;

    const updateProgress = () => {
      if (!isDraggingRef.current) {
        setCurrentTime(audioElement.currentTime);
      }
    };

    const updateDuration = () => {
      setDuration(audioElement.duration || 0);
    };

    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('loadedmetadata', updateDuration);
    audioElement.addEventListener('durationchange', updateDuration);

    // Initial setup if already playing or loaded
    updateDuration();
    updateProgress();

    return () => {
      audioElement.removeEventListener('timeupdate', updateProgress);
      audioElement.removeEventListener('loadedmetadata', updateDuration);
      audioElement.removeEventListener('durationchange', updateDuration);
    };
  }, [audioElement]);

  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    updateSeek(e);
  };

  const handlePointerMove = (e) => {
    if (isDraggingRef.current) {
      updateSeek(e);
    }
  };

  const handlePointerUp = (e) => {
    if (isDraggingRef.current) {
      updateSeek(e, true);
      isDraggingRef.current = false;
    }
  };

  const updateSeek = (e, applySeek = false) => {
    if (!progressBarRef.current || duration === 0) return;
    
    // Support touch and mouse
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    if (!clientX) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = pos / rect.width;
    const newTime = percentage * duration;
    
    setCurrentTime(newTime); // Optimistic UI update

    if (applySeek) {
      seek(newTime);
    }
  };

  useEffect(() => {
    const handleGlobalUp = () => {
      if (isDraggingRef.current) {
        seek(currentTime);
        isDraggingRef.current = false;
      }
    };

    const handleGlobalMove = (e) => {
      if (isDraggingRef.current) {
        updateSeek(e);
      }
    };

    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('touchend', handleGlobalUp);
    window.addEventListener('touchmove', handleGlobalMove);

    return () => {
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('touchend', handleGlobalUp);
      window.removeEventListener('touchmove', handleGlobalMove);
    };
  }, [currentTime, duration, seek]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="progress-container">
      <span>{formatTime(currentTime)}</span>
      <div 
        className="progress-bar" 
        ref={progressBarRef}
        onPointerDown={handlePointerDown}
      >
        <div 
          className="progress-fill" 
          style={{ width: `${progressPercent}%` }}
        ></div>
        <div 
          className="progress-thumb" 
          style={{ left: `${progressPercent}%` }}
        ></div>
      </div>
      <span>{formatTime(duration)}</span>
    </div>
  );
};
