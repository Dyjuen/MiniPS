import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppState } from '../hooks/useAppState';

export default function TransformOverlay({ imgRect, zoom, onApply, onCancel }) {
  const { transformParams, setTransformParams } = useAppState();
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null); // 'move', 'rotate', 'nw', 'n', etc.
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialParams, setInitialParams] = useState(transformParams);
  const overlayRef = useRef(null);

  const handleMouseDown = (e, type) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragType(type);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialParams({ ...transformParams });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const scale = zoom / 100;
    const dx = (e.clientX - dragStart.x) / scale;
    const dy = (e.clientY - dragStart.y) / scale;

    if (dragType === 'move') {
      setTransformParams(prev => ({
        ...prev,
        tx: initialParams.tx + dx,
        ty: initialParams.ty + dy
      }));
    } else if (dragType === 'rotate') {
      if (!overlayRef.current) return;
      const rect = overlayRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const startAngle = Math.atan2(dragStart.y - centerY, dragStart.x - centerX);
      const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      
      const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
      
      setTransformParams(prev => ({
        ...prev,
        rotate: (initialParams.rotate + angleDiff) % 360
      }));
    } else if (dragType.length <= 2) {
      const newParams = { ...initialParams };
      
      let dsX = (dx / imgRect.width) * 2;
      let dsY = (dy / imgRect.height) * 2;

      if (e.shiftKey) {
        // Keep aspect ratio
        const mag = Math.max(Math.abs(dsX), Math.abs(dsY));
        const sign = dsX + dsY > 0 ? 1 : -1;
        dsX = mag * sign;
        dsY = mag * sign;
      }

      if (dragType.includes('e')) newParams.scaleX = initialParams.scaleX + dsX;
      if (dragType.includes('w')) newParams.scaleX = initialParams.scaleX - dsX;
      if (dragType.includes('s')) newParams.scaleY = initialParams.scaleY + dsY;
      if (dragType.includes('n')) newParams.scaleY = initialParams.scaleY - dsY;

      newParams.scaleX = Math.max(0.1, Math.min(10, newParams.scaleX));
      newParams.scaleY = Math.max(0.1, Math.min(10, newParams.scaleY));

      setTransformParams(prev => ({
        ...prev,
        scaleX: newParams.scaleX,
        scaleY: newParams.scaleY
      }));
    }
  }, [isDragging, dragType, dragStart, zoom, initialParams, imgRect, setTransformParams]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
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

  const flipX = transformParams.flipH ? -1 : 1;
  const flipY = transformParams.flipV ? -1 : 1;

  const overlayStyle = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: imgRect.width * (zoom / 100),
    height: imgRect.height * (zoom / 100),
    transformOrigin: 'center center',
    transform: `translate(${transformParams.tx * (zoom / 100)}px, ${transformParams.ty * (zoom / 100)}px) 
                rotate(${transformParams.rotate}deg) 
                scale(${transformParams.scaleX * flipX}, ${transformParams.scaleY * flipY})`,
    pointerEvents: 'none' // Click through to handles
  };

  const handles = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];

  return (
    <>
      <div className="transform-overlay" style={overlayStyle} ref={overlayRef}>
        <div 
          className="transform-knob" 
          onMouseDown={(e) => handleMouseDown(e, 'rotate')}
          style={{ pointerEvents: 'all' }}
        />
        <div 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            cursor: 'move', 
            pointerEvents: 'all' 
          }} 
          onMouseDown={(e) => handleMouseDown(e, 'move')}
        />
        
        {handles.map(h => (
          <div 
            key={h}
            className={`crop-handle handle-${h}`} 
            onMouseDown={(e) => handleMouseDown(e, h)}
            style={{ pointerEvents: 'all' }}
          />
        ))}
      </div>
      
      {/* Action bar outside warped container */}
      <div className="action-bar" style={{ pointerEvents: 'all', bottom: '20px', top: 'auto' }}>
        <button className="action-btn cancel" onClick={onCancel}>Cancel</button>
        <button className="action-btn apply" onClick={onApply}>Apply</button>
      </div>
    </>
  );
}

