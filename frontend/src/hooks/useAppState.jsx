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
  const [sessionBase, setSessionBase] = useState(null); // Added for parametric session tracking

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const [proxyBlob, setProxyBlob] = useState(null);
  const [fullResBlob, setFullResBlob] = useState(null);

  const handleLoadImage = (file) => {
    const url = URL.createObjectURL(file);
    setCurrentImage(url);
    setFullResBlob(file);
    setAppliedOps([]);
    setZoomLevel(100);
    setHistory([url]);
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

      // Create 1024px proxy
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => setProxyBlob(blob), 'image/jpeg', 0.9);
    };
    img.src = url;
  };

  const handleReset = () => {
    if (fullResBlob) {
      const url = URL.createObjectURL(fullResBlob);
      setCurrentImage(url);
    }
    setAppliedOps([]);
  };

  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.min(400, Math.max(25, prev + delta)));
  };

  const value = {
    currentImage, setCurrentImage,
    proxyBlob, setProxyBlob,
    fullResBlob, setFullResBlob,
    originalImage, setOriginalImage,
...
    handleLoadImage,
    handleReset,
    handleZoom
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  return useContext(AppContext);
}
