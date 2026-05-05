import React, { useState, useEffect, useRef } from 'react';
import SliderControl from '../../SliderControl';
import { useApi } from '../../../hooks/useApi';
import { useAppState } from '../../../hooks/useAppState';
import * as api from '../../../services/api';

export default function EnhanceTab() {
  const { 
    currentImage, 
    setCurrentImage, 
    addToast, 
    proxyBlob, 
    fullResBlob,
    setFullResBlob,
    setProxyBlob
  } = useAppState();
  
  const { executeOp, previewOp, isLoading } = useApi();
  
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [sharpness, setSharpness] = useState(1);

  // Live Preview Effect (No Debounce)
  useEffect(() => {
    if (!proxyBlob) return;
    if (brightness !== 0 || contrast !== 0) {
      previewOp(proxyBlob, api.applyBrightness, brightness, contrast);
    }
  }, [brightness, contrast, proxyBlob]);

  useEffect(() => {
    if (!proxyBlob) return;
    if (sharpness !== 1) {
      previewOp(proxyBlob, api.applySharpen, sharpness);
    }
  }, [sharpness, proxyBlob]);

  const handleApply = async () => {
    if (!fullResBlob) return;
    
    let resultBlob = fullResBlob;
    
    if (brightness !== 0 || contrast !== 0) {
      resultBlob = await executeOp('Brightness/Contrast', api.applyBrightness, resultBlob, brightness, contrast);
    }
    if (sharpness !== 1) {
      resultBlob = await executeOp('Sharpen', api.applySharpen, resultBlob, sharpness);
    }

    if (resultBlob) {
      setFullResBlob(resultBlob);
      // Update proxy too
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((b) => setProxyBlob(blob), 'image/jpeg', 0.9);
      };
      img.src = URL.createObjectURL(resultBlob);
      
      setBrightness(0);
      setContrast(0);
      setSharpness(1);
      addToast('Applied to full resolution', 'success');
    }
  };

  return (
    <div className="tab-content">
      <section>
        <h4>Brightness & contrast</h4>
        <SliderControl label="Brightness" min={-100} max={100} value={brightness} onChange={setBrightness} />
        <SliderControl label="Contrast" min={-100} max={100} value={contrast} onChange={setContrast} />
        <SliderControl label="Sharpness" min={1} max={5} value={sharpness} step={0.1} onChange={setSharpness} />
        <div className="btn-group">
          <button onClick={() => executeOp('Histogram Eq.', api.applyHistogramEq, fullResBlob)}>Histogram Eq.</button>
          <button onClick={() => executeOp('Smoothing', api.applySmooth, fullResBlob, 3)}>Smoothing</button>
        </div>
      </section>

      <section className="apply-section">
        <button 
          className="btn-block btn-primary" 
          onClick={handleApply}
          disabled={isLoading}
        >
          {isLoading ? 'Applying...' : 'Apply to Full Res'}
        </button>
      </section>
    </div>
  );
}
