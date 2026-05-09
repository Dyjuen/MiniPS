import React, { useState, useEffect } from 'react';
import SliderControl from '../../SliderControl';
import { useApi } from '../../../hooks/useApi';
import { useAppState } from '../../../hooks/useAppState';
import * as api from '../../../services/api';

export default function EnhanceTab() {
  const { 
    setCurrentImage, 
    addToast, 
    proxyBlob, 
    proxyUrl,
    fullResBlob,
    applyEditedBlob
  } = useAppState();
  
  const { executeOp, previewOp, isLoading } = useApi();
  
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [sharpness, setSharpness] = useState(0);
  const [smoothing, setSmoothing] = useState(0);

  const { resetSignal } = useAppState();

  useEffect(() => {
    setBrightness(0);
    setContrast(0);
    setSharpness(0);
    setSmoothing(0);
  }, [resetSignal]);

  // Live Preview Effects with Snap-back
  useEffect(() => {
    if (!proxyBlob || !proxyUrl) return;
    if (brightness !== 0 || contrast !== 0) {
      previewOp(proxyBlob, api.applyBrightness, brightness, contrast);
    } else {
      setCurrentImage(proxyUrl);
    }
  }, [brightness, contrast, proxyBlob, proxyUrl, setCurrentImage]);

  useEffect(() => {
    if (!proxyBlob || !proxyUrl) return;
    if (sharpness > 0) {
      const intensity = (sharpness / 100) * 5.0;
      previewOp(proxyBlob, api.applySharpen, intensity);
    } else {
      setCurrentImage(proxyUrl);
    }
  }, [sharpness, proxyBlob, proxyUrl, setCurrentImage]);

  useEffect(() => {
    if (!proxyBlob || !proxyUrl) return;
    if (smoothing > 0) {
      const kernel = Math.round((smoothing / 100) * 48) + 3;
      previewOp(proxyBlob, api.applySmooth, kernel);
    } else {
      setCurrentImage(proxyUrl);
    }
  }, [smoothing, proxyBlob, proxyUrl, setCurrentImage]);

  const handleApply = async () => {
    if (!fullResBlob) return;
    let resultBlob = fullResBlob;
    
    if (brightness !== 0 || contrast !== 0) {
      resultBlob = await executeOp('Brightness/Contrast', api.applyBrightness, resultBlob, brightness, contrast);
    }
    if (sharpness > 0) {
      const intensity = (sharpness / 100) * 5.0;
      resultBlob = await executeOp('Sharpen', api.applySharpen, resultBlob, intensity);
    }
    if (smoothing > 0) {
      const kernel = Math.round((smoothing / 100) * 48) + 3;
      resultBlob = await executeOp('Smoothing', api.applySmooth, resultBlob, kernel);
    }

    if (resultBlob && resultBlob !== fullResBlob) {
      applyEditedBlob(resultBlob);
      setBrightness(0); setContrast(0); setSharpness(0); setSmoothing(0);
      addToast('Applied to full resolution', 'success');
    }
  };

  return (
    <div className="tab-content">
      <section>
        <h4>Brightness & contrast</h4>
        <SliderControl label="Brightness" min={-100} max={100} value={brightness} onChange={setBrightness} />
        <SliderControl label="Contrast" min={-100} max={100} value={contrast} onChange={setContrast} />
        <SliderControl label="Sharpness" min={0} max={100} value={sharpness} onChange={setSharpness} />
        <SliderControl label="Smoothing" min={0} max={100} value={smoothing} onChange={setSmoothing} />
        <div className="btn-group">
          <button onClick={async () => {
            const res = await executeOp('Histogram Eq.', api.applyHistogramEq, fullResBlob);
            if (res) applyEditedBlob(res);
          }}>Histogram Eq.</button>
        </div>
      </section>

      <section className="apply-section">
        <button className="btn-block btn-primary" onClick={handleApply} disabled={isLoading}>Apply to Full Res</button>
      </section>
    </div>
  );
}
