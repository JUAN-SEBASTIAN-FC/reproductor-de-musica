import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const AudioPlayerContext = createContext(null);

export const useAudioPlayer = () => useContext(AudioPlayerContext);

export const AudioPlayerProvider = ({ children }) => {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('aura_volume');
    return saved !== null ? parseFloat(saved) : 1;
  });
  
  const [isShuffle, setIsShuffle] = useState(false);
  // repeatMode: 'none', 'all', 'one'
  const [repeatMode, setRepeatMode] = useState('none');
  
  // Favorites stored by track name to persist across sessions (since files are lost on reload)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('aura_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  
  const audioRef = useRef(null);
  if (!audioRef.current) {
    const vid = document.createElement('video');
    vid.playsInline = true;
    vid.style.width = '100%';
    vid.style.height = '100%';
    vid.style.objectFit = 'cover';
    vid.style.borderRadius = '12px';
    audioRef.current = vid;
  }

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const stateRef = useRef({ currentTrackIndex, playlist, isShuffle, repeatMode });
  useEffect(() => {
    stateRef.current = { currentTrackIndex, playlist, isShuffle, repeatMode };
  }, [currentTrackIndex, playlist, isShuffle, repeatMode]);

  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => {
      const { repeatMode, currentTrackIndex, playlist } = stateRef.current;
      
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(e => console.error(e));
      } else if (repeatMode === 'none') {
        // If it's the last song, stop. Otherwise next.
        if (currentTrackIndex === playlist.length - 1) {
          setIsPlaying(false);
        } else {
          nextTrackRef();
        }
      } else {
        // repeatMode === 'all'
        nextTrackRef();
      }
    };
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  const nextTrackRef = useCallback(() => {
    const { currentTrackIndex, playlist, isShuffle, repeatMode } = stateRef.current;
    if (playlist.length === 0) return;
    
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
      // Ensure we don't play the same song twice immediately if possible
      if (nextIndex === currentTrackIndex && playlist.length > 1) {
        nextIndex = (nextIndex + 1) % playlist.length;
      }
    } else {
      nextIndex = currentTrackIndex + 1;
      if (nextIndex >= playlist.length) {
        if (repeatMode === 'none') return; // Stop if at the end and no repeat
        nextIndex = 0; // Loop to start if repeatMode === 'all'
      }
    }
    playTrack(nextIndex, playlist);
  }, []);

  const nextTrack = () => nextTrackRef();

  const prevTrack = () => {
    if (playlist.length === 0) return;
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) {
      if (repeatMode === 'none') return;
      prevIndex = playlist.length - 1;
    }
    playTrack(prevIndex);
  };

  const playTrack = (index, currentList = playlist) => {
    if (index < 0 || index >= currentList.length) return;
    const track = currentList[index];
    
    const audio = audioRef.current;
    audio.src = track.url;
    audio.play()
      .then(() => setIsPlaying(true))
      .catch(err => {
        console.error("Auto-play prevented or error:", err);
        setIsPlaying(false);
      });
    
    setCurrentTrackIndex(index);
  };

  const togglePlay = () => {
    if (currentTrackIndex === -1 && playlist.length > 0) {
      playTrack(0);
      return;
    }
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(e => console.error(e));
    }
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    audioRef.current.volume = newVol;
    localStorage.setItem('aura_volume', newVol);
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);
  
  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'one';
      return 'none';
    });
  };

  const seek = (time) => {
    if (audioRef.current.duration) {
      audioRef.current.currentTime = time;
    }
  };

  const toggleFavorite = (trackName) => {
    setFavorites(prev => {
      let newFavs;
      if (prev.includes(trackName)) {
        newFavs = prev.filter(name => name !== trackName);
      } else {
        newFavs = [...prev, trackName];
      }
      localStorage.setItem('aura_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };
  
  const removeFromLibrary = (idToRemove) => {
    setPlaylist(prev => {
      const indexToRemove = prev.findIndex(t => t.id === idToRemove);
      const filtered = prev.filter(t => t.id !== idToRemove);
      
      // If we are removing the currently playing track
      if (indexToRemove === currentTrackIndex) {
        audioRef.current.pause();
        setIsPlaying(false);
        // Play next if available, or reset
        if (filtered.length > 0) {
          const nextToPlay = indexToRemove >= filtered.length ? 0 : indexToRemove;
          setCurrentTrackIndex(nextToPlay);
          audioRef.current.src = filtered[nextToPlay].url;
          // don't auto play, just cue it depending on preference
        } else {
          setCurrentTrackIndex(-1);
          audioRef.current.src = "";
        }
      } else if (indexToRemove < currentTrackIndex) {
        // Adjust index if we removed a track before current
        setCurrentTrackIndex(currentTrackIndex - 1);
      }
      return filtered;
    });
  };

  // Process selected files
  const loadFiles = async (files) => {
    const existingFiles = playlist.map(t => `${t.originalName}-${t.size}`);
    
    const incomingFiles = Array.from(files).filter(file => {
      const id = `${file.name}-${file.size}`;
      return !existingFiles.includes(id);
    });

    if (incomingFiles.length === 0 && files.length > 0) {
      alert("Estos archivos ya están en tu biblioteca.");
      return;
    }

    const newTracks = await Promise.all(
      incomingFiles.map(async (file, i) => {
        const url = URL.createObjectURL(file);
        let name = file.name.replace(/\.[^/.]+$/, "");
        let artist = "Desconocido";
        
        if (name.includes('-')) {
          const parts = name.split('-');
          artist = parts[0].trim();
          name = parts.slice(1).join('-').trim();
        }

        const getDuration = (src) => new Promise((resolve) => {
          const audio = new Audio();
          audio.addEventListener('loadedmetadata', () => resolve(audio.duration));
          audio.addEventListener('error', () => resolve(0));
          audio.src = src;
        });

        const duration = await getDuration(url);

        return {
          id: Date.now() + i + Math.random().toString(36),
          name,
          artist,
          originalName: file.name,
          size: file.size,
          file,
          url,
          duration 
        };
      })
    );

    setPlaylist(prev => {
      const newList = [...prev, ...newTracks];
      if (currentTrackIndex === -1 && newList.length > 0) {
        setTimeout(() => playTrack(0, newList), 100);
      }
      return newList;
    });
  };

  const updateTrackImage = (trackId, file) => {
    const imageUrl = URL.createObjectURL(file);
    setPlaylist(prev => prev.map(track => {
      if (track.id === trackId) {
        return { ...track, imageUrl };
      }
      return track;
    }));
  };

  const currentTrack = currentTrackIndex >= 0 ? playlist[currentTrackIndex] : null;

  const value = {
    playlist,
    currentTrackIndex,
    currentTrack,
    isPlaying,
    volume,
    isShuffle,
    repeatMode,
    favorites,
    audioElement: audioRef.current,
    loadFiles,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    handleVolumeChange,
    toggleShuffle,
    toggleRepeat,
    seek,
    toggleFavorite,
    removeFromLibrary
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
};
