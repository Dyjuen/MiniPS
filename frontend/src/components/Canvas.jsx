import React, { useRef } from 'react';
import { useAppState } from '../hooks/useAppState';

export default function Canvas() {
  const { 
    currentImage, 
    imageMetadata, 
    zoomLevel, 
    handleZoom, 
    setCursorPos, 
    setPixelRgb,
    appliedOps 
  } = useAppState();
  
  const imgRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!imgRef.current) return;
    
    const rect = imgRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (zoomLevel / 100));
    const y = Math.floor((e.clientY - rect.top) / (zoomLevel / 100));
    
    setCursorPos({ x, y });
    // Simulated RGB for now
    setPixelRgb({ 
      r: Math.floor(Math.random() * 255), 
      g: Math.floor(Math.random() * 255), 
      b: Math.floor(Math.random() * 255) 
    });
  };

  return (
    <div className="canvas">
      {currentImage ? (
        <>
          <div className="canvas-header">
            {imageMetadata.filename} — {imageMetadata.resolution} — {appliedOps[appliedOps.length - 1] || 'No filter'}
          </div>
          
          <div className="canvas-viewport" onMouseMove={handleMouseMove}>
            <img 
              ref={imgRef}
              src={currentImage} 
              alt="canvas" 
              style={{ width: `${zoomLevel}%`, transition: 'width 0.1s' }}
            />
            {isLoading && (
              <div className="canvas-overlay loading">
                <div className="spinner"></div>
              </div>
            )}
            {error && (
              <div className="canvas-overlay error">
                <p>{error}</p>
              </div>
            )}
          </div>

          <div className="canvas-controls">
            <button onClick={() => handleZoom(-25)}>-</button>
            <span>{zoomLevel}%</span>
            <button onClick={() => handleZoom(25)}>+</button>
          </div>
        </>
      ) : (
        <div className="canvas-placeholder">Load an image to start</div>
      )}
    </div>
  );
}
