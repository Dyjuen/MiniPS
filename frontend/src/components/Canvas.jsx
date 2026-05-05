import React, { useRef, useState, useEffect } from 'react';
import { useAppState } from '../hooks/useAppState';
import { useApi } from '../hooks/useApi';
import * as api from '../services/api';

export default function Canvas() {
  const { 
    currentImage, 
    imageMetadata, 
    zoomLevel, 
    handleZoom, 
    setCursorPos, 
    setPixelRgb,
    appliedOps,
    cropRect,
    setCropRect,
    selectedTool,
    addToast
  } = useAppState();
  
  const { executeOp, isLoading, error } = useApi();
  const imgRef = useRef(null);
  const viewportRef = useRef(null);

  // Dragging state for Crop or Pan
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!imgRef.current || !currentImage) return;
    
    const rect = imgRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (zoomLevel / 100));
    const y = Math.floor((e.clientY - rect.top) / (zoomLevel / 100));
    
    setCursorPos({ x, y });
    
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      if (selectedTool === 'crop' && cropRect) {
        setCropRect(prev => ({
          ...prev,
          x: prev.x + dx,
          y: prev.y + dy
        }));
        setDragStart({ x: e.clientX, y: e.clientY });
      } else if (selectedTool === 'move') {
        setPanOffset(prev => ({
          x: prev.x + dx,
          y: prev.y + dy
        }));
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    }
  };

  const handleMouseDown = (e) => {
    if (!currentImage) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard shortcut for Enter to crop
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && selectedTool === 'crop' && cropRect && currentImage) {
        // Map viewport crop coords back to image coords
        const rect = imgRef.current.getBoundingClientRect();
        const imgScale = zoomLevel / 100;
        
        const realX = Math.floor((cropRect.x - (rect.left - viewportRef.current.getBoundingClientRect().left)) / imgScale);
        const realY = Math.floor((cropRect.y - (rect.top - viewportRef.current.getBoundingClientRect().top)) / imgScale);
        const realW = Math.floor(cropRect.width / imgScale);
        const realH = Math.floor(cropRect.height / imgScale);

        executeOp('Crop', api.applyCrop, realX, realY, realW, realH);
        setCropRect(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTool, cropRect, currentImage, zoomLevel, executeOp, setCropRect]);

  return (
    <div className="canvas">
      {currentImage ? (
        <>
          <div className="canvas-header">
            {imageMetadata.filename} — {imageMetadata.resolution} — {appliedOps[appliedOps.length - 1] || 'No filter'}
            {isLoading && <span className="badge badge-proxy">PROXY MODE ACTIVE</span>}
          </div>
          
          <div 
            className="canvas-viewport" 
            ref={viewportRef}
            onMouseMove={handleMouseMove} 
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ 
              overflow: 'hidden', 
              cursor: selectedTool === 'move' ? (isDragging ? 'grabbing' : 'grab') : 'crosshair' 
            }}
          >
            <div style={{ 
              position: 'relative',
              transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.1s'
            }}>
              <img 
                ref={imgRef}
                src={currentImage} 
                alt="canvas" 
                draggable="false"
                style={{ 
                  width: `${zoomLevel}%`, 
                  transition: 'width 0.3s ease-in-out',
                  display: 'block',
                  userSelect: 'none'
                }}
              />
              {cropRect && (
                <div 
                  className="crop-overlay" 
                  style={{
                    left: cropRect.x,
                    top: cropRect.y,
                    width: cropRect.width,
                    height: cropRect.height
                  }}
                />
              )}
            </div>
            
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
            <button onClick={() => handleZoom(-25)} title="Zoom Out">-</button>
            <span>{zoomLevel}%</span>
            <button onClick={() => handleZoom(25)} title="Zoom In">+</button>
            <button onClick={() => setPanOffset({ x: 0, y: 0 })} title="Reset Pan">⌖</button>
          </div>
        </>
      ) : (
        <div className="canvas-placeholder">Load an image to start</div>
      )}
    </div>
  );
}
