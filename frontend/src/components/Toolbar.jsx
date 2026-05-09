import React, { useRef } from 'react';
import { useAppState } from '../hooks/useAppState';
import { useApi } from '../hooks/useApi';
import * as api from '../services/api';

export default function Toolbar() {
  const { 
    currentImage,
    setCurrentImage,
    fullResBlob,
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
    { label: 'Reset', action: handleReset, className: 'btn-danger', title: 'Reset to Original' },
  ];

  return (
    <div className="toolbar">
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
