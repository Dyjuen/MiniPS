import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useAppState } from '../hooks/useAppState';
import { useApi } from '../hooks/useApi';
import * as api from '../services/api';

export default function Canvas() {
  const { 
    currentImage,
    originalUrl,
    imageMetadata, 
    zoomLevel, 
    setZoomLevel,
    handleZoom, 
    setCursorPos, 
    appliedOps,
    cropRect,
    setCropRect,
    selectedTool,
    isCompareMode,
    setIsCompareMode,
  } = useAppState();
  
  const { executeOp, isLoading, error } = useApi();
  const imgRef = useRef(null);
  const viewportRef = useRef(null);

  // Dragging state for Crop or Pan
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const autoFit = useCallback(() => {
    if (!viewportRef.current || !imageMetadata.w || !imageMetadata.h) return;

    const vWidth = viewportRef.current.clientWidth;
    const vHeight = viewportRef.current.clientHeight;
    
    // Account for padding and gap
    const padding = 40;
    const gap = isCompareMode ? 20 : 0;
    
    const availableWidth = isCompareMode ? (vWidth / 2) - padding - (gap / 2) : vWidth - padding;
    const availableHeight = vHeight - padding;

    const scale = Math.min(availableWidth / imageMetadata.w, availableHeight / imageMetadata.h);
    const zoomPercent = Math.floor(scale * 100);
    
    setZoomLevel(Math.min(400, Math.max(10, zoomPercent)));
    setPanOffset({ x: 0, y: 0 });
  }, [imageMetadata.w, imageMetadata.h, isCompareMode, setZoomLevel]);

  // Auto-fit on image load or compare toggle
  useEffect(() => {
    if (currentImage) {
      // Small delay to ensure clientWidth is updated if viewport just appeared
      const timer = setTimeout(autoFit, 50);
      return () => clearTimeout(timer);
    }
  }, [currentImage, originalUrl, isCompareMode, autoFit]);

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

  const imgStyle = { 
    width: `${(imageMetadata.w || 0) * (zoomLevel / 100)}px`,
    height: `${(imageMetadata.h || 0) * (zoomLevel / 100)}px`,
    transition: 'none',
    display: 'block',
    userSelect: 'none'
  };

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
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: isCompareMode ? '20px' : '0',
              height: '100%',
              transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.1s'
            }}>
              {isCompareMode && (
                <div className="image-container before">
                  <div className="image-label">BEFORE</div>
                  <img 
                    src={originalUrl} 
                    alt="before" 
                    draggable="false"
                    style={imgStyle}
                  />
                </div>
              )}
              
              <div className="image-container after" style={{ position: 'relative' }}>
                {isCompareMode && <div className="image-label">AFTER</div>}
                <img 
                  ref={imgRef}
                  src={currentImage} 
                  alt="after" 
                  draggable="false"
                  style={imgStyle}
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
            <button 
              className={isCompareMode ? 'active' : ''} 
              onClick={() => setIsCompareMode(!isCompareMode)}
              title="Toggle Before/After Comparison"
            >
              {isCompareMode ? 'Hide Split' : 'Compare'}
            </button>
            <div className="separator"></div>
            <button onClick={() => handleZoom(-25)} title="Zoom Out">-</button>
            <span>{zoomLevel}%</span>
            <button onClick={() => handleZoom(25)} title="Zoom In">+</button>
            <button onClick={autoFit} title="Fit to Screen">Fit</button>
            <button onClick={() => setPanOffset({ x: 0, y: 0 })} title="Reset Pan">⌖</button>
          </div>
        </>
      ) : (
        <div className="canvas-placeholder">Load an image to start</div>
      )}
    </div>
  );
}

