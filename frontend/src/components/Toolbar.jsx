import React, { useRef } from 'react';
import { useAppState } from '../hooks/useAppState';

export default function Toolbar() {
  const { 
    currentImage,
    setCurrentImage,
    handleLoadImage, 
    handleReset, 
    handleZoom,
    history,
    historyIndex,
    setHistoryIndex 
  } = useAppState();

  const fileInputRef = useRef(null);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1;
      setHistoryIndex(idx);
      setCurrentImage(history[idx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const idx = historyIndex + 1;
      setHistoryIndex(idx);
      setCurrentImage(history[idx]);
    }
  };

  const handleSave = () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = 'processed_image.png';
    link.click();
  };

  const buttons = [
    { label: 'Load', action: () => fileInputRef.current.click() },
    { label: 'Save', action: handleSave },
    { label: 'Crop', action: () => console.log('Crop') },
    { label: 'Move', action: () => console.log('Move') },
    { label: 'Zoom+', action: () => handleZoom(25) },
    { label: 'Zoom-', action: () => handleZoom(-25) },
    { label: 'Rotate CW', action: () => console.log('Rotate CW') },
    { label: 'Flip H', action: () => console.log('Flip H') },
    { label: 'Flip V', action: () => console.log('Flip V') },
    { label: 'Undo', action: handleUndo },
    { label: 'Redo', action: handleRedo },
    { label: 'Reset', action: handleReset, className: 'btn-danger' },
  ];

  return (
    <div className="toolbar">
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={(e) => e.target.files[0] && handleLoadImage(e.target.files[0])}
      />
      {buttons.map((btn, i) => (
        <button 
          key={i} 
          className={`toolbar-btn ${btn.className || ''}`} 
          onClick={btn.action}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
