import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentImage, setCurrentImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [imageMetadata, setImageMetadata] = useState({
    filename: '',
    resolution: '',
    format: '',
    fileSize: ''
  });
  const [zoomLevel, setZoomLevel] = useState(100);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [pixelRgb, setPixelRgb] = useState({ r: 0, g: 0, b: 0 });
  const [appliedOps, setAppliedOps] = useState([]);
  const [activeTab, setActiveTab] = useState('Enhance');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [toasts, setToasts] = useState([]);
  const [cropRect, setCropRect] = useState(null);
  const [selectedTool, setSelectedTool] = useState('move');

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleLoadImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setCurrentImage(base64);
      setOriginalImage(base64);
      setAppliedOps([]);
      setZoomLevel(100);
      setHistory([base64]);
      setHistoryIndex(0);

      const img = new Image();
      img.onload = () => {
        setImageMetadata({
          filename: file.name,
          resolution: `${img.width}x${img.height}`,
          w: img.width,
          h: img.height,
          format: file.type,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`
        });
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setCurrentImage(originalImage);
    setAppliedOps([]);
  };

  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.min(400, Math.max(25, prev + delta)));
  };

  const value = {
    currentImage, setCurrentImage,
    originalImage, setOriginalImage,
    imageMetadata, setImageMetadata,
    zoomLevel, setZoomLevel,
    cursorPos, setCursorPos,
    pixelRgb, setPixelRgb,
    appliedOps, setAppliedOps,
    activeTab, setActiveTab,
    history, setHistory,
    historyIndex, setHistoryIndex,
    toasts, addToast,
    cropRect, setCropRect,
    selectedTool, setSelectedTool,
    handleLoadImage,
    handleReset,
    handleZoom
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  return useContext(AppContext);
}
