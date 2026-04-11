import React, { useMemo } from 'react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { HeartOutlineIcon, HeartFilledIcon, TrashIcon } from '../utils/Icons';

const SongCard = ({ track, index, originalIndex, isActive }) => {
  const { playTrack, isPlaying, favorites, toggleFavorite, removeFromLibrary } = useAudioPlayer();

  const handlePlay = () => {
    playTrack(originalIndex);
  };

  const isFav = favorites.includes(track.name);

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`song-card ${isActive ? 'active' : ''}`}>
      {/* Index or Equalizer */}
      <div 
        className="song-index" 
        style={{ width: '32px', textAlign: 'center', cursor: 'pointer' }}
        onClick={handlePlay}
      >
        {isActive && isPlaying ? (
          <div className="equalizer" style={{ justifyContent: 'center' }}>
            <div className="eq-bar"></div>
            <div className="eq-bar"></div>
            <div className="eq-bar"></div>
            <div className="eq-bar"></div>
          </div>
        ) : (
          <span>{index + 1}</span>
        )}
      </div>
      
      {/* Track Info */}
      <div className="song-card-info" onClick={handlePlay}>
        <span className="song-title">{track.name || "Pista Desconocida"}</span>
        <span className="song-artist">{track.artist || "Artista Desconocido"}</span>
      </div>
      
      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          className="with-tooltip"
          onClick={(e) => { e.stopPropagation(); toggleFavorite(track.name); }} 
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex' }}
          data-tooltip={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          {isFav ? <HeartFilledIcon size={18} /> : <HeartOutlineIcon size={18} color="var(--text-secondary)" />}
        </button>
        
        <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontFamily: 'var(--font-mono)', width: '45px', textAlign: 'right' }}>
          {formatDuration(track.duration)}
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); removeFromLibrary(track.id); }} 
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
          data-tooltip="Eliminar pista"
          className="control-btn with-tooltip"
        >
          <TrashIcon size={16} />
        </button>
      </div>
    </div>
  );
};

export const SongList = ({ searchKeyword, filterFavorites }) => {
  const { playlist, currentTrackIndex, favorites } = useAudioPlayer();

  const filteredPlaylist = useMemo(() => {
    let list = playlist;
    
    // Filtro por favorito
    if (filterFavorites) {
      list = list.filter(track => favorites.includes(track.name));
    }
    
    // Filtro por texto
    if (searchKeyword) {
      const lowerKey = searchKeyword.toLowerCase();
      list = list.filter(track => 
        (track.name && track.name.toLowerCase().includes(lowerKey)) ||
        (track.artist && track.artist.toLowerCase().includes(lowerKey)) ||
        (track.originalName && track.originalName.toLowerCase().includes(lowerKey))
      );
    }
    
    return list;
  }, [playlist, searchKeyword, filterFavorites, favorites]);

  if (playlist.length === 0) {
    return <div style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>Tu biblioteca está vacía. Añade algunas canciones.</div>;
  }

  if (filteredPlaylist.length === 0) {
    if (filterFavorites) {
      return <div style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>Aún no tienes canciones favoritas guardadas. Haz clic en el corazón para añadirlas.</div>;
    }
    return <div style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>No se encontraron canciones para "{searchKeyword}".</div>;
  }

  return (
    <div className="song-list">
      {filteredPlaylist.map((track, displayIndex) => {
        const originalIndex = playlist.findIndex(t => t.id === track.id);
        const isActive = originalIndex === currentTrackIndex;
        
        return (
          <div key={track.id} style={{ animationDelay: `${displayIndex * 0.05}s` }}>
            <SongCard 
              track={track} 
              index={displayIndex} 
              originalIndex={originalIndex}
              isActive={isActive}
            />
          </div>
        );
      })}
    </div>
  );
};
