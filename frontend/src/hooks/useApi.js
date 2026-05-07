import { useState, useCallback, useRef } from 'react';
import { useAppState } from './useAppState';
import * as api from '../services/api';

export function useApi() {
  const { 
    currentImage,
    setCurrentImage, 
    setOriginalUrl,
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
  const [lastHeaders, setLastHeaders] = useState(null);

  // High performance flow control
  const activeRequest = useRef(null);
  const nextRequest = useRef(null);
  const abortController = useRef(null);

  const executeOp = useCallback(async (opName, apiFn, baseBlob, ...args) => {
    if (!baseBlob) {
      addToast('No image data', 'error');
      return;
    }

    // Cancel in-flight
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const { blob: resultBlob, headers } = await apiFn(baseBlob, ...args);
      setLastHeaders(headers);
      const newImageUrl = URL.createObjectURL(resultBlob);
      
      setCurrentImage(newImageUrl);
      setAppliedOps([...appliedOps, opName]);
      
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newImageUrl);
      if (newHistory.length > 11) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      return resultBlob;
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error(`Error applying ${opName}:`, err);
      setError(err.message);
      addToast(`Operation failed: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [appliedOps, history, historyIndex, setCurrentImage, setAppliedOps, setHistory, setHistoryIndex, addToast]);

  const previewOp = useCallback(async (baseBlob, apiFn, ...args) => {
    if (!baseBlob) return;

    // Implementation of One-In-Flight lock
    if (activeRequest.current) {
      // Buffer latest move
      nextRequest.current = { apiFn, args };
      return;
    }

    const run = async (blob, fn, fnArgs) => {
      activeRequest.current = true;
      try {
        const { blob: resultBlob, headers } = await fn(blob, ...fnArgs);
        setLastHeaders(headers);
        const newImageUrl = URL.createObjectURL(resultBlob);
        setCurrentImage(newImageUrl);
      } catch (err) {
        console.error('Preview failed:', err);
      } finally {
        activeRequest.current = false;
        // Process next buffered request if any
        if (nextRequest.current) {
          const { apiFn: nextFn, args: nextArgs } = nextRequest.current;
          nextRequest.current = null;
          run(blob, nextFn, nextArgs);
        }
      }
    };

    run(baseBlob, apiFn, args);
  }, [setCurrentImage]);

  return { executeOp, previewOp, isLoading, error, lastHeaders };
}
