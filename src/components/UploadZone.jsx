import React, { useRef, useState } from 'react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { UploadIcon } from '../utils/Icons';

export const UploadZone = () => {
  const { loadFiles } = useAudioPlayer();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files) => {
    // Validate only audio or video
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('audio/') || file.type.startsWith('video/')
    );
    if (validFiles.length > 0) {
      loadFiles(validFiles);
    } else {
      alert("Formato no soportado. Selecciona pistas de audio o video.");
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div 
      className={`upload-zone ${isDragging ? 'dragging' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        multiple 
        accept="audio/*, video/*" 
        className="upload-input" 
        ref={fileInputRef}
        onChange={onChange}
      />
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
          <UploadIcon size={32} color="var(--accent-cyan)" />
        </div>
      </div>
      <h3 style={{ fontFamily: 'var(--font-primary)', fontSize: '20px', marginBottom: '8px' }}>
        Arrastra tu biblioteca aquí
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
        O haz clic para seleccionar archivos locales (MP3, WAV, MP4)
      </p>
    </div>
  );
};
