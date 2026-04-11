import React, { useState, useEffect } from 'react';
import { AudioPlayerProvider, useAudioPlayer } from './context/AudioPlayerContext';
import { UploadZone } from './components/UploadZone';
import { SongList } from './components/SongList';
import { PlayerControls } from './components/PlayerControls';
import { NowPlayingPanel } from './components/NowPlayingPanel';
import { SearchIcon, SunIcon, MoonIcon } from './utils/Icons';
import './App.css';


function Sidebar({ currentRoute, setCurrentRoute }) {
  return (
    <aside className="sidebar">
      <div className="brand" onClick={() => setCurrentRoute('home')} style={{cursor: 'pointer'}}>
        <h1>Aura Stream</h1>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{textAlign: 'center', color: 'var(--text-secondary)', fontSize: '20px', marginBottom: '24px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase'}}>Menú</p>
        <ul className="sidebar-menu">
          <li className={`menu-item ${currentRoute === 'nowplaying' ? 'active' : ''}`} onClick={() => setCurrentRoute('nowplaying')}>Reproductor</li>
          <li className={`menu-item ${currentRoute === 'home' ? 'active' : ''}`} onClick={() => setCurrentRoute('home')}>Inicio</li>
          <li className={`menu-item ${currentRoute === 'library' ? 'active' : ''}`} onClick={() => setCurrentRoute('library')}>Mi Biblioteca</li>
          <li className={`menu-item ${currentRoute === 'favorites' ? 'active' : ''}`} onClick={() => setCurrentRoute('favorites')}>Favoritos</li>
        </ul>
      </div>
    </aside>
  );
}

function HomeView() {
  return (
    <div className="content-area">
      <UploadZone />
      <section>
        <h3 className="section-title">Tracks Subidos Recientemente</h3>
        <SongList />
      </section>
    </div>
  );
}

function LibraryView({ searchKeyword }) {
  return (
    <div className="content-area">
      <h3 className="section-title" style={{ marginTop: '24px' }}>Toda tu música</h3>
      <p style={{color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px'}}>
        Las canciones residen en la memoria de esta sesión.
      </p>
      <SongList searchKeyword={searchKeyword} />
    </div>
  );
}

function FavoritesView({ searchKeyword }) {
  return (
    <div className="content-area">
      <h3 className="section-title" style={{ marginTop: '24px' }}>Canciones Favoritas</h3>
      <p style={{color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px'}}>
        Las pistas que has marcado con corazón.
      </p>
      <SongList searchKeyword={searchKeyword} filterFavorites={true} />
    </div>
  );
}

function MainApp() {
  const { currentTrack } = useAudioPlayer();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentRoute, setCurrentRoute] = useState('home');
  
  // Theming Logic
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('aura_theme');
    return saved || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aura_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="app-container">
      <Sidebar 
        currentRoute={currentRoute} 
        setCurrentRoute={setCurrentRoute} 
      />

      <main className="main-content">
        <header className="header">
          <div className="header-title" style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
            <h2>
              {currentRoute === 'nowplaying' && (currentTrack ? currentTrack.name : 'Reproductor')}
              {currentRoute === 'home' && 'Inicio'}
              {currentRoute === 'library' && 'Biblioteca Local'}
              {currentRoute === 'favorites' && 'Tus Favoritos'}
            </h2>
            {currentRoute === 'nowplaying' && currentTrack && (
               <span style={{color: 'var(--text-secondary)', fontSize: '15px'}}>{currentTrack.artist}</span>
            )}
          </div>
          <div className="header-actions">
            {(currentRoute === 'library' || currentRoute === 'favorites') && (
              <div className="search-bar">
                <SearchIcon size={18} color="var(--text-secondary)" />
                <input 
                  type="text" 
                  placeholder="Buscar título, artista..." 
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
            )}
            <button className="theme-toggle-round with-tooltip tooltip-bottom" onClick={toggleTheme} data-tooltip="Tema Claro/Oscuro">
              {theme === 'dark' ? <SunIcon size={20}/> : <MoonIcon size={20}/>}
            </button>
          </div>
        </header>

        {currentRoute === 'nowplaying' && <NowPlayingPanel />}
        {currentRoute === 'home' && <HomeView />}
        {currentRoute === 'library' && <LibraryView searchKeyword={searchKeyword} />}
        {currentRoute === 'favorites' && <FavoritesView searchKeyword={searchKeyword} />}
        
      </main>

      <PlayerControls />
    </div>
  );
}

function App() {
  return (
    <AudioPlayerProvider>
      <MainApp />
    </AudioPlayerProvider>
  );
}

export default App;
