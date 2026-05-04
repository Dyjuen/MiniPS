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

  const previewOp = useCallback(async (baseImage, apiFn, ...args) => {
    console.log('previewOp called', { hasBaseImage: !!baseImage, apiFnName: apiFn?.name, args });
    if (!baseImage) {
      console.warn('previewOp: baseImage is null');
      return;
    }
    try {
      const data = await apiFn(baseImage, ...args);
      let newImage = data.image;
      if (newImage && !newImage.startsWith('data:')) {
        newImage = `data:image/png;base64,${newImage}`;
      }
      setCurrentImage(newImage);
      return data;
    } catch (err) {
      console.error('Preview failed:', err);
      const msg = err.response?.data?.error || err.message;
      addToast(`Preview failed: ${msg}`, 'error');
    }
  }, [setCurrentImage, addToast]);

  const applyTabOps = useCallback(async (baseImage, ops) => {
    console.log('applyTabOps called', { hasBaseImage: !!baseImage, numOps: ops?.length });
    if (!baseImage || ops.length === 0) return null;
    setIsLoading(true);
    setError(null);
    try {
      let currentBase = baseImage;
      const opNames = [];
      
      for (const op of ops) {
        console.log('Applying op in batch:', op.name);
        const data = await op.fn(currentBase, ...op.args);
        let newImage = data.image;
        if (newImage && !newImage.startsWith('data:')) {
          newImage = `data:image/png;base64,${newImage}`;
        }
        currentBase = newImage;
        opNames.push(op.name);
      }
      
      setCurrentImage(currentBase);
      const batchName = opNames.join(' + ');
      setAppliedOps([...appliedOps, batchName]);
      
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(currentBase);
      if (newHistory.length > 11) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
      addToast(`Applied: ${batchName}`, 'success');
      return currentBase;
    } catch (err) {
      console.error('Batch apply failed:', err);
      const msg = err.response?.data?.error || err.message;
      setError(msg);
      addToast(`Apply failed: ${msg}`, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [appliedOps, history, historyIndex, setCurrentImage, setAppliedOps, setHistory, setHistoryIndex, addToast]);

  return { executeOp, previewOp, applyTabOps, isLoading, error };
}
