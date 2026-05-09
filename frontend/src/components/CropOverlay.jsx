import React, { useState, useEffect, useCallback } from 'react';
import { useAppState } from '../hooks/useAppState';

export default function CropOverlay({ imgRect, zoom, onApply, onCancel }) {
  const { cropRect, setCropRect } = useAppState();
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialRect, setInitialRect] = useState(cropRect);

  const handleMouseDown = (e, handle) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialRect(cropRect);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const dx = (e.clientX - dragStart.x) / (zoom / 100);
    const dy = (e.clientY - dragStart.y) / (zoom / 100);

    setCropRect(prev => {
      let next = { ...prev };
      
      if (dragHandle === 'move') {
        next.x = initialRect.x + dx;
        next.y = initialRect.y + dy;
      } else if (dragHandle === 'se') {
        next.width = initialRect.width + dx;
        next.height = initialRect.height + dy;
        if (e.shiftKey) {
          const size = Math.max(next.width, next.height);
          next.width = size;
          next.height = size;
        }
      } else if (dragHandle === 'ne') {
        next.y = initialRect.y + dy;
        next.width = initialRect.width + dx;
        next.height = initialRect.height - dy;
      } else if (dragHandle === 'sw') {
        next.x = initialRect.x + dx;
        next.width = initialRect.width - dx;
        next.height = initialRect.height + dy;
      } else if (dragHandle === 'nw') {
        next.x = initialRect.x + dx;
        next.y = initialRect.y + dy;
        next.width = initialRect.width - dx;
        next.height = initialRect.height - dy;
      }
      
      // Clamp to image bounds
      next.x = Math.max(0, Math.min(next.x, imgRect.width - 10));
      next.y = Math.max(0, Math.min(next.y, imgRect.height - 10));
      next.width = Math.max(10, Math.min(next.width, imgRect.width - next.x));
      next.height = Math.max(10, Math.min(next.height, imgRect.height - next.y));
      
      return next;
    });
  }, [isDragging, dragHandle, dragStart, zoom, initialRect, imgRect, setCropRect]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragHandle(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Keyboard listeners
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Enter') onApply();
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onApply, onCancel]);

  if (!cropRect) return null;

  return (
    <div 
      className="crop-overlay" 
      style={{
        left: cropRect.x * (zoom / 100),
        top: cropRect.y * (zoom / 100),
        width: cropRect.width * (zoom / 100),
        height: cropRect.height * (zoom / 100),
        pointerEvents: 'all'
      }}
      onMouseDown={(e) => handleMouseDown(e, 'move')}
    >
      <div className="crop-handle handle-nw" onMouseDown={(e) => handleMouseDown(e, 'nw')} />
      <div className="crop-handle handle-ne" onMouseDown={(e) => handleMouseDown(e, 'ne')} />
      <div className="crop-handle handle-sw" onMouseDown={(e) => handleMouseDown(e, 'sw')} />
      <div className="crop-handle handle-se" onMouseDown={(e) => handleMouseDown(e, 'se')} />
      
      <div className="action-bar" style={{ pointerEvents: 'all' }}>
        <button className="action-btn cancel" onClick={onCancel}>Cancel</button>
        <button className="action-btn apply" onClick={onApply}>Apply</button>
      </div>
    </div>
  );
}
