import React from 'react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { ProgressBar } from './ProgressBar';
import { 
  PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon, 
  ShuffleIcon, RepeatIcon, RepeatOneIcon, VolumeIcon, VolumeMuteIcon,
  HeartFilledIcon, HeartOutlineIcon
} from '../utils/Icons';

export const PlayerControls = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    volume,
    handleVolumeChange,
    playlist,
    favorites,
    toggleFavorite
  } = useAudioPlayer();

  const handleMuteToggle = () => {
    if (volume > 0) {
      handleVolumeChange(0);
    } else {
      handleVolumeChange(1);
    }
  };

  const isCurrentFav = currentTrack ? favorites.includes(currentTrack.name) : false;

  return (
    <div className="player-footer glass">
      {/* Current Song Info */}
      <div className="player-info">
        <div className="album-art-placeholder">
          {currentTrack ? 
            <div style={{color: 'var(--bg-main)', fontWeight: 'bold', fontSize: '24px'}}>
              {currentTrack.name?.charAt(0).toUpperCase()}
            </div> 
            : null
          }
        </div>
        <div className="player-info-text">
          <h4>{currentTrack ? currentTrack.name : "Aura Stream"}</h4>
          <p>{currentTrack ? currentTrack.artist : "Premium Audio"}</p>
        </div>
        
        {currentTrack && (
          <button 
            className="with-tooltip"
            onClick={() => toggleFavorite(currentTrack.name)} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginLeft: '8px' }}
            data-tooltip={isCurrentFav ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            {isCurrentFav ? <HeartFilledIcon size={18} /> : <HeartOutlineIcon size={18} color="var(--text-secondary)" />}
          </button>
        )}
      </div>

      {/* Main Controls & Progress */}
      <div className="player-controls-container">
        <div className="player-controls">
          <button 
            className={`control-btn with-tooltip ${isShuffle ? 'active' : ''}`} 
            onClick={toggleShuffle} 
            data-tooltip="Aleatorio"
          >
            <ShuffleIcon size={18} />
          </button>
          
          <button className="control-btn with-tooltip" onClick={prevTrack} data-tooltip="Anterior">
            <SkipBackIcon size={20} />
          </button>
          
          <button className="control-btn play with-tooltip" onClick={togglePlay} data-tooltip={isPlaying ? "Pausar" : "Reproducir"}>
            {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
          </button>
          
          <button className="control-btn with-tooltip" onClick={nextTrack} data-tooltip="Siguiente">
            <SkipForwardIcon size={20} />
          </button>
          
          <button 
            className={`control-btn with-tooltip ${repeatMode !== 'none' ? 'active' : ''}`} 
            onClick={toggleRepeat} 
            data-tooltip={repeatMode === 'none' ? "Sin repetir" : repeatMode === 'all' ? "Repetir lista" : "Repetir 1 canción"}
          >
            {repeatMode === 'one' ? <RepeatOneIcon size={18} /> : <RepeatIcon size={18} />}
          </button>
        </div>
        
        <ProgressBar />
      </div>

      {/* Volume Control */}
      <div className="player-volume">
        <button className="control-btn with-tooltip" onClick={handleMuteToggle} data-tooltip={volume === 0 ? "Activar sonido" : "Silenciar"}>
          {volume === 0 ? <VolumeMuteIcon size={18} /> : <VolumeIcon size={18} />}
        </button>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="volume-slider"
        />
      </div>
    </div>
  );
};
