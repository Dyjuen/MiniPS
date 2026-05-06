import React, { createContext, useContext, useState, useMemo } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentImage, setCurrentImage] = useState(null);
  const [imageMetadata, setImageMetadata] = useState({
    filename: '',
    resolution: '',
    format: '',
    fileSize: '',
    w: 0,
    h: 0
  });
  const [zoomLevel, setZoomLevel] = useState(100);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [pixelRgb, setPixelRgb] = useState({ r: 0, g: 0, b: 0 });
  const [appliedOps, setAppliedOps] = useState([]);
  const [activeTab, setActiveTab] = useState('Enhance');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cropRect, setCropRect] = useState(null);
  const [selectedTool, setSelectedTool] = useState('move');

  const [originalBlob, setOriginalBlob] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [fullResBlob, setFullResBlob] = useState(null);
  const [proxyBlob, setProxyBlob] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [resetSignal, setResetSignal] = useState(0);

  // Stable URL for the base proxy
  const proxyUrl = useMemo(() => proxyBlob ? URL.createObjectURL(proxyBlob) : null, [proxyBlob]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const createProxy = (img) => {
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => setProxyBlob(blob), 'image/jpeg', 0.9);
  };

  const handleLoadImage = (file) => {
    const url = URL.createObjectURL(file);
    setCurrentImage(url);
    setOriginalUrl(url);
    setOriginalBlob(file);
    setFullResBlob(file);
    setAppliedOps([]);
    setZoomLevel(100);
    setHistory([url]);
    setHistoryIndex(0);
    setIsCompareMode(false);

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
      createProxy(img);
    };
    img.src = url;
  };

  const handleReset = () => {
    if (originalBlob) {
      const url = URL.createObjectURL(originalBlob);
      setCurrentImage(url);
      setOriginalUrl(url);
      setFullResBlob(originalBlob);
      setAppliedOps([]);
      setResetSignal(prev => prev + 1);
      setIsCompareMode(false);
      
      const img = new Image();
      img.onload = () => createProxy(img);
      img.src = url;
    }
  };

  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.min(400, Math.max(25, prev + delta)));
  };

  const value = {
    currentImage, setCurrentImage,
    originalBlob, setOriginalBlob,
    originalUrl, setOriginalUrl,
    isCompareMode, setIsCompareMode,
    fullResBlob, setFullResBlob,
    proxyBlob, setProxyBlob,
    proxyUrl,
    imageMetadata, setImageMetadata,
    zoomLevel, setZoomLevel,
    cursorPos, setCursorPos,
    pixelRgb, setPixelRgb,
    appliedOps, setAppliedOps,
    activeTab, setActiveTab,
    history, setHistory,
    historyIndex, setHistoryIndex,
    toasts, addToast,
    resetSignal,
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
