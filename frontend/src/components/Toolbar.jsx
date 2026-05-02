import React, { useRef } from 'react';
import { useAppState } from '../hooks/useAppState';

export default function Toolbar() {
  const { handleLoadImage, handleReset, handleZoom } = useAppState();
  const fileInputRef = useRef(null);

  const buttons = [
    { label: 'Load', action: () => fileInputRef.current.click() },
    { label: 'Save', action: () => console.log('Save') },
    { label: 'Crop', action: () => console.log('Crop') },
    { label: 'Move', action: () => console.log('Move') },
    { label: 'Zoom+', action: () => handleZoom(25) },
    { label: 'Zoom-', action: () => handleZoom(-25) },
    { label: 'Rotate CW', action: () => console.log('Rotate CW') },
    { label: 'Flip H', action: () => console.log('Flip H') },
    { label: 'Flip V', action: () => console.log('Flip V') },
    { label: 'Undo', action: () => console.log('Undo') },
    { label: 'Redo', action: () => console.log('Redo') },
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
