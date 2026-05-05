import React, { useRef } from 'react';
import { useAppState } from '../hooks/useAppState';
import { useApi } from '../hooks/useApi';
import * as api from '../services/api';

export default function Toolbar() {
  const { 
    currentImage,
    setCurrentImage,
    fullResBlob,
    setFullResBlob,
    setProxyBlob,
    handleLoadImage, 
    handleReset, 
    handleZoom,
    history,
    historyIndex,
    setHistoryIndex,
    cropRect,
    setCropRect,
    selectedTool,
    setSelectedTool,
    addToast 
  } = useAppState();

  const { executeOp } = useApi();
  const fileInputRef = useRef(null);

  const updateBlobs = (newFullResBlob) => {
    setFullResBlob(newFullResBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => setProxyBlob(b), 'image/jpeg', 0.9);
    };
    img.src = URL.createObjectURL(newFullResBlob);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1;
      setHistoryIndex(idx);
      setCurrentImage(history[idx]);
      addToast('Undo applied');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const idx = historyIndex + 1;
      setHistoryIndex(idx);
      setCurrentImage(history[idx]);
      addToast('Redo applied');
    }
  };

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
      setCropRect({ x: 50, y: 50, width: 200, height: 150 });
      addToast('Crop mode active. Press Enter on image to crop.');
    }
  };

  const wrapOp = async (name, fn, ...args) => {
    const res = await executeOp(name, fn, fullResBlob, ...args);
    if (res) updateBlobs(res);
  };

  const buttons = [
    { label: 'Load', action: () => fileInputRef.current.click(), title: 'Load Image' },
    { label: 'Save', action: handleSave, title: 'Save Image' },
    { 
      label: 'Crop', 
      action: toggleCrop, 
      title: 'Toggle Crop Overlay', 
      className: selectedTool === 'crop' ? 'active' : '' 
    },
    { 
      label: 'Move', 
      action: () => { setSelectedTool('move'); setCropRect(null); }, 
      title: 'Move Tool',
      className: selectedTool === 'move' ? 'active' : '' 
    },
    { label: 'Zoom+', action: () => handleZoom(25), title: 'Zoom In' },
    { label: 'Zoom-', action: () => handleZoom(-25), title: 'Zoom Out' },
    { 
      label: 'Rotate CW', 
      action: () => wrapOp('Rotate 90', api.applyRotate, 90, 'bilinear'), 
      title: 'Rotate 90° Clockwise' 
    },
    { 
      label: 'Flip H', 
      action: () => wrapOp('Flip H', api.applyFlip, 'horizontal'), 
      title: 'Flip Horizontal' 
    },
    { 
      label: 'Flip V', 
      action: () => wrapOp('Flip V', api.applyFlip, 'vertical'), 
      title: 'Flip Vertical' 
    },
    { label: 'Undo', action: handleUndo, title: 'Undo (Ctrl+Z)' },
    { label: 'Redo', action: handleRedo, title: 'Redo (Ctrl+Y)' },
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
