import React, { useRef } from 'react';
import { useAppState } from '../hooks/useAppState';
import { useApi } from '../hooks/useApi';
import * as api from '../services/api';

export default function Toolbar() {
  const { 
    currentImage,
    setCurrentImage,
    fullResBlob,
    handleLoadImage, 
    handleReset, 
    handleZoom,
    history,
    historyIndex,
    setHistoryIndex,
    undo,
    redo,
    cropRect,
    setCropRect,
    selectedTool,
    setSelectedTool,
    transformParams,
    setTransformParams,
    addToast,
    applyEditedBlob
  } = useAppState();

  const { executeOp } = useApi();
  const fileInputRef = useRef(null);

  const handleSave = () => {
    if (!currentImage) return addToast('No image to save', 'error');
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = 'processed_image.png';
    link.click();
  };

  const toggleCrop = () => {
    if (selectedTool === 'crop') {
      setSelectedTool('move');
      setCropRect(null);
    } else {
      setSelectedTool('crop');
      setTransformParams({ scaleX: 1, scaleY: 1, rotate: 0, tx: 0, ty: 0, flipH: false, flipV: false });
      setCropRect({ x: 50, y: 50, width: 200, height: 200 });
      addToast('Crop mode active. Drag handles or press Enter.');
    }
  };

  const toggleTransform = () => {
    if (selectedTool === 'transform') {
      setSelectedTool('move');
    } else {
      setSelectedTool('transform');
      setCropRect(null);
      setTransformParams({ scaleX: 1, scaleY: 1, rotate: 0, tx: 0, ty: 0, flipH: false, flipV: false });
      addToast('Transform mode active. Drag image or press Enter.');
    }
  };

  const wrapOp = async (name, fn, ...args) => {
    const res = await executeOp(name, fn, fullResBlob, ...args);
    if (res) applyEditedBlob(res);
  };

  const buttons = [
    { label: 'Load', action: () => fileInputRef.current.click(), title: 'Load Image' },
    { label: 'Save', action: handleSave, title: 'Save Image' },
    { 
      label: 'Crop', 
      action: toggleCrop, 
      title: 'Toggle Crop Tool (C)', 
      className: selectedTool === 'crop' ? 'active' : '' 
    },
    { 
      label: 'Transform', 
      action: toggleTransform, 
      title: 'Toggle Transform Tool (T)', 
      className: selectedTool === 'transform' ? 'active' : '' 
    },
    { 
      label: 'Move', 
      action: () => { setSelectedTool('move'); setCropRect(null); }, 
      title: 'Move Tool (V)',
      className: selectedTool === 'move' ? 'active' : '' 
    },
    { label: 'Zoom+', action: () => handleZoom(25), title: 'Zoom In' },
    { label: 'Zoom-', action: () => handleZoom(-25), title: 'Zoom Out' },
    { 
      label: 'Rotate CW', 
      action: () => {
        if (selectedTool === 'transform') {
          setTransformParams(prev => ({ ...prev, rotate: (prev.rotate + 90) % 360 }));
        } else {
          wrapOp('Rotate 90', api.applyRotate, 90, 'bilinear');
        }
      }, 
      title: 'Rotate 90° Clockwise' 
    },
    { 
      label: 'Flip H', 
      action: () => {
        if (selectedTool === 'transform') {
          setTransformParams(prev => ({ ...prev, flipH: !prev.flipH }));
        } else {
          wrapOp('Flip H', api.applyFlip, 'horizontal');
        }
      }, 
      title: 'Flip Horizontal' 
    },
    { 
      label: 'Flip V', 
      action: () => {
        if (selectedTool === 'transform') {
          setTransformParams(prev => ({ ...prev, flipV: !prev.flipV }));
        } else {
          wrapOp('Flip V', api.applyFlip, 'vertical');
        }
      }, 
      title: 'Flip Vertical' 
    },
    { label: 'Undo', action: undo, title: 'Undo (Ctrl+Z)' },
    { label: 'Redo', action: redo, title: 'Redo (Ctrl+Y)' },
    { label: 'Reset', action: handleReset, className: 'btn-danger', title: 'Reset to Original' },
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
          title={btn.title}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
