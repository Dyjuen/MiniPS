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
    setHistoryIndex
  } = useAppState();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeOp = useCallback(async (opName, apiFn, ...args) => {
    if (!currentImage) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFn(currentImage, ...args);
      const newImage = data.image;
      
      setCurrentImage(newImage);
      setAppliedOps([...appliedOps, opName]);
      
      // Update history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newImage);
      if (newHistory.length > 11) newHistory.shift(); // keep 10 + current
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      return data;
    } catch (err) {
      console.error(`Error applying ${opName}:`, err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentImage, appliedOps, history, historyIndex, setCurrentImage, setAppliedOps, setHistory, setHistoryIndex]);

  return { executeOp, isLoading, error };
}
