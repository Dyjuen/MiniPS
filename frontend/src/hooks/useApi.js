import { useState, useCallback } from 'react';
import { useAppState } from './useAppState';
import * as api from '../services/api';

export function useApi() {
  const { 
    currentImage, 
    setCurrentImage, 
    appliedOps, 
    setAppliedOps,
    history,
    setHistory,
    historyIndex,
    setHistoryIndex,
    addToast
  } = useAppState();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeOp = useCallback(async (opName, apiFn, ...args) => {
    if (!currentImage) {
      addToast('Please load an image first', 'error');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFn(currentImage, ...args);
      let newImage = data.image;
      
      if (newImage && !newImage.startsWith('data:')) {
        newImage = `data:image/png;base64,${newImage}`;
      }
      
      setCurrentImage(newImage);
      setAppliedOps([...appliedOps, opName]);
      
      // Update history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newImage);
      if (newHistory.length > 11) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      return data;
    } catch (err) {
      console.error(`Error applying ${opName}:`, err);
      const msg = err.response?.data?.error || err.message;
      setError(msg);
      addToast(`Operation failed: ${msg}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentImage, appliedOps, history, historyIndex, setCurrentImage, setAppliedOps, setHistory, setHistoryIndex, addToast]);

  return { executeOp, isLoading, error };
}
