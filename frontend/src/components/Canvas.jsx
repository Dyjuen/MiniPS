import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useAppState } from '../hooks/useAppState';
import { useApi } from '../hooks/useApi';
import * as api from '../services/api';
import TransformOverlay from './TransformOverlay';
import CropOverlay from './CropOverlay';

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
    setSelectedTool,
    isCompareMode,
    setIsCompareMode,
    transformParams,
    setTransformParams,
    fullResBlob,
    applyEditedBlob
  } = useAppState();
  
  const { executeOp, isLoading, error } = useApi();
  const imgRef = useRef(null);
  const viewportRef = useRef(null);

  // Dragging state for Crop or Pan
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDrawingCrop, setIsDrawingCrop] = useState(false);
  const [drawStartPos, setDrawStartPos] = useState({ x: 0, y: 0 });

  // Pinch state
  const [pinchStartDist, setPinchStartDist] = useState(null);
  const [pinchStartZoom, setPinchStartZoom] = useState(null);

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
    
    setZoomLevel(Math.min(400, Math.max(25, zoomPercent)));
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
    const rawX = (e.clientX - rect.left) / (zoomLevel / 100);
    const rawY = (e.clientY - rect.top) / (zoomLevel / 100);
    const x = Math.floor(rawX);
    const y = Math.floor(rawY);
    
    setCursorPos({ x, y });
    
    if (isDrawingCrop) {
      const dx = rawX - drawStartPos.x;
      const dy = rawY - drawStartPos.y;
      
      let width = Math.abs(dx);
      let height = Math.abs(dy);
      
      if (e.shiftKey) {
        const size = Math.max(width, height);
        width = size;
        height = size;
      }

      let newX = dx < 0 ? drawStartPos.x - width : drawStartPos.x;
      let newY = dy < 0 ? drawStartPos.y - height : drawStartPos.y;

      newX = Math.max(0, Math.min(newX, imageMetadata.w - 1));
      newY = Math.max(0, Math.min(newY, imageMetadata.h - 1));
      width = Math.max(1, Math.min(width, imageMetadata.w - newX));
      height = Math.max(1, Math.min(height, imageMetadata.h - newY));

      setCropRect({ x: newX, y: newY, width, height });
    } else if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      if (selectedTool === 'move') {
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
    
    if (selectedTool === 'crop') {
      const rect = imgRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left) / (zoomLevel / 100);
      const rawY = (e.clientY - rect.top) / (zoomLevel / 100);

      const startX = Math.max(0, Math.min(rawX, imageMetadata.w));
      const startY = Math.max(0, Math.min(rawY, imageMetadata.h));

      setIsDrawingCrop(true);
      setDrawStartPos({ x: startX, y: startY });
      setCropRect({ x: startX, y: startY, width: 0, height: 0 });
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if (isDrawingCrop) {
      setIsDrawingCrop(false);
      setCropRect(prev => {
        if (prev && (prev.width < 10 || prev.height < 10)) return null;
        return prev;
      });
    }
    setIsDragging(false);
  };

  // Pinch handlers
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const handleWheelEvent = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 5 : -5;
        setZoomLevel(prev => Math.min(400, Math.max(25, prev + delta)));
      }
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault(); // Block browser zoom/gestures
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        setPinchStartDist(dist);
        setPinchStartZoom(zoomLevel);
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2 && pinchStartDist !== null) {
        e.preventDefault(); // Block browser zoom/gestures
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const newZoom = pinchStartZoom * (currentDist / pinchStartDist);
        setZoomLevel(Math.min(400, Math.max(25, Math.floor(newZoom))));
      }
    };

    const handleTouchEnd = () => {
      setPinchStartDist(null);
      setPinchStartZoom(null);
    };

    // Register all as non-passive to guarantee preventDefault works
    el.addEventListener('wheel', handleWheelEvent, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('wheel', handleWheelEvent);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [setZoomLevel, pinchStartDist, pinchStartZoom, zoomLevel]);

  const handleApplyCrop = useCallback(async () => {
    if (!cropRect || !currentImage) return;
    const res = await executeOp('Crop', api.applyCrop, fullResBlob, 
      Math.floor(cropRect.x), 
      Math.floor(cropRect.y), 
      Math.floor(cropRect.width), 
      Math.floor(cropRect.height)
    );
    if (res) applyEditedBlob(res);
    setCropRect(null);
    setSelectedTool('move');
  }, [cropRect, currentImage, executeOp, setCropRect, setSelectedTool, fullResBlob, applyEditedBlob]);

  const handleApplyTransform = useCallback(async () => {
    if (!transformParams || !currentImage) return;
    const res = await executeOp('Transform', api.applyGeometryTransform, fullResBlob, transformParams);
    if (res) applyEditedBlob(res);
    setTransformParams({ scaleX: 1, scaleY: 1, rotate: 0, tx: 0, ty: 0, flipH: false, flipV: false });
    setSelectedTool('move');
  }, [transformParams, currentImage, executeOp, setTransformParams, setSelectedTool, fullResBlob, applyEditedBlob]);

  const handleCancel = useCallback(() => {
    setCropRect(null);
    setTransformParams({ scaleX: 1, scaleY: 1, rotate: 0, tx: 0, ty: 0, flipH: false, flipV: false });
    setSelectedTool('move');
  }, [setCropRect, setTransformParams, setSelectedTool]);

  // Handle auto-reset zoom on fit

  const isTransform = selectedTool === 'transform';
  const flipX = transformParams.flipH ? -1 : 1;
  const flipY = transformParams.flipV ? -1 : 1;

  const imgStyle = { 
    width: `${(imageMetadata.w || 0) * (zoomLevel / 100)}px`,
    height: `${(imageMetadata.h || 0) * (zoomLevel / 100)}px`,
    transition: 'transform 0.05s ease-out, width 0.05s ease-out, height 0.05s ease-out',
    display: 'block',
    userSelect: 'none',
    transformOrigin: 'center center',
    transform: isTransform ? `
      translate(${transformParams.tx * (zoomLevel / 100)}px, ${transformParams.ty * (zoomLevel / 100)}px)
      rotate(${transformParams.rotate}deg)
      scale(${transformParams.scaleX * flipX}, ${transformParams.scaleY * flipY})
    ` : 'none'
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
              cursor: selectedTool === 'move' ? (isDragging ? 'grabbing' : 'grab') : 'crosshair',
              touchAction: 'none'
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
                {selectedTool === 'crop' && cropRect && (
                  <CropOverlay 
                    imgRect={{ width: imageMetadata.w, height: imageMetadata.h }}
                    zoom={zoomLevel}
                    onApply={handleApplyCrop}
                    onCancel={handleCancel}
                  />
                )}
                {selectedTool === 'transform' && (
                  <TransformOverlay 
                    imgRect={{ width: imageMetadata.w, height: imageMetadata.h }}
                    zoom={zoomLevel}
                    onApply={handleApplyTransform}
                    onCancel={handleCancel}
                  />
                )}
                {/* Canvas Boundary Indicator */}
                {(selectedTool === 'crop' || selectedTool === 'transform') && (
                  <div 
                    className="canvas-boundary"
                    style={{
                      left: 0,
                      top: 0,
                      width: imageMetadata.w * (zoomLevel/100),
                      height: imageMetadata.h * (zoomLevel/100)
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

