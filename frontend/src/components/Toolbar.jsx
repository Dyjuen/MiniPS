import React, { useRef } from 'react';
import { useAppState } from '../hooks/useAppState';
import { useApi } from '../hooks/useApi';
import * as api from '../services/api';
import { 
  Crop, 
  Maximize2, 
  Move, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical2, 
  RefreshCw 
} from 'lucide-react';

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
      setCropRect(null);
      addToast('Crop mode active. Click and drag to draw crop box.');
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
      id: 'crop',
      icon: <Crop size={18} />,
      action: toggleCrop, 
      title: 'Crop', 
      className: selectedTool === 'crop' ? 'active' : '' 
    },
    { 
      id: 'transform',
      icon: <Maximize2 size={18} />,
      action: toggleTransform, 
      title: 'Transform', 
      className: selectedTool === 'transform' ? 'active' : '' 
    },
    { 
      id: 'move',
      icon: <Move size={18} />,
      action: () => { setSelectedTool('move'); setCropRect(null); }, 
      title: 'Move',
      className: selectedTool === 'move' ? 'active' : '' 
    },
    { 
      id: 'rotate',
      icon: <RotateCw size={18} />,
      action: () => {
        if (selectedTool === 'transform') {
          setTransformParams(prev => ({ ...prev, rotate: (prev.rotate + 90) % 360 }));
        } else {
          wrapOp('Rotate 90', api.applyRotate, 90, 'bilinear');
        }
      }, 
      title: 'Rotate CW' 
    },
    { 
      id: 'fliph',
      icon: <FlipHorizontal size={18} />,
      action: () => {
        if (selectedTool === 'transform') {
          setTransformParams(prev => ({ ...prev, flipH: !prev.flipH }));
        } else {
          wrapOp('Flip H', api.applyFlip, 'horizontal');
        }
      }, 
      title: 'Flip H' 
    },
    { 
      id: 'flipv',
      icon: <FlipVertical2 size={18} />,
      action: () => {
        if (selectedTool === 'transform') {
          setTransformParams(prev => ({ ...prev, flipV: !prev.flipV }));
        } else {
          wrapOp('Flip V', api.applyFlip, 'vertical');
        }
      }, 
      title: 'Flip V' 
    },
    { 
      id: 'reset',
      icon: <RefreshCw size={18} />,
      action: handleReset, 
      className: 'btn-danger', 
      title: 'Reset',
      style: { marginLeft: 'auto' }
    },
  ];

  const btnStyle = {
    width: '36px',
    height: '36px',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px'
  };

  const dividerStyle = {
    width: '1px',
    height: '24px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: '0 8px'
  };

  return (
    <div className="toolbar" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {buttons.slice(0, 3).map((btn) => (
        <button 
          key={btn.id} 
          className={`toolbar-btn ${btn.className || ''}`} 
          onClick={btn.action}
          title={btn.title}
          style={btnStyle}
        >
          {btn.icon}
        </button>
      ))}
      <div style={dividerStyle}></div>
      {buttons.slice(3, 6).map((btn) => (
        <button 
          key={btn.id} 
          className={`toolbar-btn ${btn.className || ''}`} 
          onClick={btn.action}
          title={btn.title}
          style={btnStyle}
        >
          {btn.icon}
        </button>
      ))}
      {buttons.slice(6).map((btn) => (
        <button 
          key={btn.id} 
          className={`toolbar-btn ${btn.className || ''}`} 
          onClick={btn.action}
          title={btn.title}
          style={{ ...btnStyle, ...btn.style }}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
}
