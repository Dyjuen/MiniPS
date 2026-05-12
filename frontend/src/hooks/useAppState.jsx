import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

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
  const [transformParams, setTransformParams] = useState({
    scaleX: 1,
    scaleY: 1,
    rotate: 0,
    tx: 0,
    ty: 0,
    flipH: false,
    flipV: false
  });

  const [originalBlob, setOriginalBlob] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [fullResBlob, setFullResBlob] = useState(null);
  const [proxyBlob, setProxyBlob] = useState(null);
  const [originalProxyBlob, setOriginalProxyBlob] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [resetSignal, setResetSignal] = useState(0);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLevelsModalOpen, setIsLevelsModalOpen] = useState(false);
  const [seedPoint, setSeedPoint] = useState({ x: null, y: null });

  // Stable URL for the base proxy
  const proxyUrl = useMemo(() => proxyBlob ? URL.createObjectURL(proxyBlob) : null, [proxyBlob]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const createProxy = (img, isInitial = false) => {
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      setProxyBlob(blob);
      if (isInitial) setOriginalProxyBlob(blob);
    }, 'image/jpeg', 0.9);
  };

  const handleLoadImage = useCallback((file) => {
    const url = URL.createObjectURL(file);
    setCurrentImage(url);
    setOriginalUrl(url);
    setOriginalBlob(file);
    setFullResBlob(file);
    setAppliedOps([]);
    setZoomLevel(100);
    setIsCompareMode(false);

    const img = new Image();
    img.onload = () => {
      const metadata = {
        filename: file.name,
        resolution: `${img.width}x${img.height}`,
        w: img.width,
        h: img.height,
        format: file.type,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`
      };
      setImageMetadata(metadata);
      createProxy(img, true);
      setHistory([{ url, blob: file, metadata, ops: [] }]);
      setHistoryIndex(0);
    };
    img.src = url;
  }, []);

  const handleReset = useCallback(() => {
    if (originalBlob) {
      const url = URL.createObjectURL(originalBlob);
      setCurrentImage(url);
      setOriginalUrl(url);
      setFullResBlob(originalBlob);
      setAppliedOps([]);
      setResetSignal(prev => prev + 1);
      setIsCompareMode(false);
      
      const img = new Image();
      img.onload = () => {
        const metadata = {
          filename: originalBlob.name,
          resolution: `${img.width}x${img.height}`,
          w: img.width,
          h: img.height,
          format: originalBlob.type,
          fileSize: `${(originalBlob.size / 1024).toFixed(1)} KB`
        };
        setImageMetadata(metadata);
        createProxy(img, true);
        setHistory([{ url, blob: originalBlob, metadata, ops: [] }]);
        setHistoryIndex(0);
      };
      img.src = url;
    }
  }, [originalBlob]);

  const handleZoom = useCallback((delta) => {
    setZoomLevel(prev => Math.min(400, Math.max(5, prev + delta)));
  }, []);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1;
      const state = history[idx];
      setHistoryIndex(idx);
      setCurrentImage(state.url);
      setFullResBlob(state.blob);
      setImageMetadata(state.metadata);
      setAppliedOps(state.ops || []);
      
      const img = new Image();
      img.onload = () => createProxy(img);
      img.src = state.url;
      addToast('Undo applied');
    }
  }, [history, historyIndex, addToast]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const idx = historyIndex + 1;
      const state = history[idx];
      setHistoryIndex(idx);
      setCurrentImage(state.url);
      setFullResBlob(state.blob);
      setImageMetadata(state.metadata);
      setAppliedOps(state.ops || []);

      const img = new Image();
      img.onload = () => createProxy(img);
      img.src = state.url;
      addToast('Redo applied');
    }
  }, [history, historyIndex, addToast]);

  const applyEditedBlob = useCallback((blob, opName) => {
    setFullResBlob(blob);
    const url = URL.createObjectURL(blob);
    
    // Update appliedOps atomically
    const newOps = opName ? [...appliedOps, opName] : [...appliedOps];
    if (opName) setAppliedOps(newOps);

    const img = new Image();
    img.onload = () => {
      const metadata = {
        ...imageMetadata,
        resolution: `${img.width}x${img.height}`,
        w: img.width,
        h: img.height,
        fileSize: `${(blob.size / 1024).toFixed(1)} KB`
      };
      setImageMetadata(metadata);
      createProxy(img);

      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ url, blob, metadata, ops: newOps });
      if (newHistory.length > 11) newHistory.shift();
      
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    };
    img.src = url;
    setCurrentImage(url);
  }, [imageMetadata, history, historyIndex, appliedOps]);

  const value = {
    currentImage, setCurrentImage,
    originalBlob, setOriginalBlob,
    originalUrl, setOriginalUrl,
    isCompareMode, setIsCompareMode,
    fullResBlob, setFullResBlob,
    proxyBlob, setProxyBlob,
    originalProxyBlob, setOriginalProxyBlob,
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
    transformParams, setTransformParams,
    handleLoadImage,
    handleReset,
    handleZoom,
    isExportModalOpen, setIsExportModalOpen,
    isLevelsModalOpen, setIsLevelsModalOpen,
    seedPoint, setSeedPoint,
    applyEditedBlob,
    undo,
    redo
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  return useContext(AppContext);
}
