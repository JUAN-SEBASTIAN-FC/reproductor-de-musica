import React, { useRef, useEffect } from 'react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { ImageIcon } from '../utils/Icons';

export const NowPlayingPanel = () => {
  const { currentTrack, audioElement, updateTrackImage } = useAudioPlayer();
  const videoContainerRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    // Append the global video element to this panel if it exists
    if (audioElement && videoContainerRef.current) {
      videoContainerRef.current.appendChild(audioElement);
    }
    
    // When component unmounts (e.g. mobile resize hiding the panel), 
    // reparent it to body so it doesn't get destroyed and stops playing.
    return () => {
      if (audioElement && document.body) {
        document.body.appendChild(audioElement);
        // Ensure it's hidden when in body
        audioElement.style.display = 'none';
      }
    };
  }, [audioElement]);
  
  // When mounted in the panel, ensure it is visible
  useEffect(() => {
    if (audioElement) {
      audioElement.style.display = 'block';
    }
  }, [currentTrack, audioElement]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && currentTrack) {
      updateTrackImage(currentTrack.id, file);
    }
  };

  // Determine what type of file it is
  const isVideo = currentTrack?.file?.type?.startsWith('video/');

  return (
    <div className="content-area">
      <div className={`now-playing-view ${isVideo ? 'is-video' : ''}`}>
        <div className={`media-container ${isVideo ? 'is-video' : ''}`}>
          {/* Placeholder o Imagen cargada */}
          {!isVideo && (
            <div className="media-placeholder">
              {currentTrack?.imageUrl ? (
                <img src={currentTrack.imageUrl} alt="Cover" className="cover-image" />
              ) : (
                <span>{currentTrack ? currentTrack.name.charAt(0).toUpperCase() : '?'}</span>
              )}
              
              {currentTrack && (
                <>
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={imageInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleImageUpload}
                  />
                  <button 
                    className="upload-cover-btn"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <ImageIcon size={14} color="#fff" />
                    Cambiar Portada
                  </button>
                </>
              )}
            </div>
          )}
          
          {/* Mount para inyectar `<video>` global */}
          <div 
            ref={videoContainerRef} 
            className={`video-mount ${isVideo ? 'visible' : 'hidden'}`}
          ></div>
        </div>
      </div>
    </div>
  );
};
