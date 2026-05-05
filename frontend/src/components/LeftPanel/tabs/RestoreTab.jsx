import React, { useState, useEffect, useRef } from 'react';
import SliderControl from '../../SliderControl';
import { useApi } from '../../../hooks/useApi';
import { useAppState } from '../../../hooks/useAppState';
import * as api from '../../../services/api';

export default function RestoreTab() {
  const { proxyBlob, fullResBlob, setFullResBlob, setProxyBlob, addToast, resetSignal } = useAppState();
  const { executeOp, previewOp, isLoading } = useApi();

  const [gBlur, setGBlur] = useState(50);
  const [mFilter, setMFilter] = useState(50);
  const [noise, setNoise] = useState(50);
  const [noiseMethod, setNoiseMethod] = useState('salt_pepper');
  const [hue, setHue] = useState(0);
  const [sat, setSat] = useState(0);

  useEffect(() => {
    setGBlur(50);
    setMFilter(50);
    setNoise(50);
    setHue(0);
    setSat(0);
  }, [resetSignal]);

  // Live Previews (No Debounce)
  useEffect(() => {
    if (!proxyBlob) return;
    if (gBlur !== 50) previewOp(proxyBlob, api.applyGaussian, gBlur);
  }, [gBlur, proxyBlob]);

  useEffect(() => {
    if (!proxyBlob) return;
    if (mFilter !== 50) previewOp(proxyBlob, api.applyMedian, mFilter);
  }, [mFilter, proxyBlob]);

  useEffect(() => {
    if (!proxyBlob) return;
    if (noise !== 50) previewOp(proxyBlob, api.applyDenoise, noiseMethod, noise);
  }, [noise, noiseMethod, proxyBlob]);

  useEffect(() => {
    if (!proxyBlob) return;
    if (hue !== 0 || sat !== 0) previewOp(proxyBlob, api.applyColorAdjust, hue, sat);
  }, [hue, sat, proxyBlob]);

  const updateBlobs = (newFullResBlob) => {
    setFullResBlob(newFullResBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => setProxyBlob(b), 'image/jpeg', 0.9);
    };
    img.src = URL.createObjectURL(newFullResBlob);
  };

  const handleApply = async () => {
    if (!fullResBlob) return;
    let result = fullResBlob;
    if (gBlur !== 50) result = await executeOp('Gaussian Blur', api.applyGaussian, result, gBlur);
    if (mFilter !== 50) result = await executeOp('Median Filter', api.applyMedian, result, mFilter);
    if (noise !== 50) result = await executeOp('Denoise', api.applyDenoise, result, noiseMethod, noise);
    if (hue !== 0 || sat !== 0) result = await executeOp('Color Adjust', api.applyColorAdjust, result, hue, sat);

    if (result) {
      updateBlobs(result);
      setGBlur(50); setMFilter(50); setNoise(50); setHue(0); setSat(0);
      addToast('Applied to full resolution', 'success');
    }
  };

  return (
    <div className="tab-content">
      <section>
        <h4>Gaussian blur</h4>
        <SliderControl label="Blur strength" min={1} max={100} value={gBlur} unit="%" onChange={setGBlur} />
      </section>

      <section>
        <h4>Median filter</h4>
        <SliderControl label="Filter strength" min={1} max={100} value={mFilter} unit="%" onChange={setMFilter} />
      </section>

      <section>
        <h4>Noise reduction</h4>
        <SliderControl label="Reduction strength" min={1} max={100} value={noise} unit="%" onChange={setNoise} />
        <div className="select-control">
          <label>Method</label>
          <select value={noiseMethod} onChange={(e) => setNoiseMethod(e.target.value)}>
            <option value="salt_pepper">Salt & Pepper</option>
            <option value="generic">Generic</option>
          </select>
        </div>
      </section>

      <section>
        <h4>Color processing</h4>
        <div className="btn-group">
          <button onClick={async () => { const res = await executeOp('Grayscale', api.applyGrayscale, fullResBlob); if (res) updateBlobs(res); }}>Grayscale</button>
          <button onClick={async () => { const res = await executeOp('Split R', api.applyChannelSplit, fullResBlob, 'R'); if (res) updateBlobs(res); }}>Split R</button>
        </div>
        <SliderControl label="Hue" min={-180} max={180} value={hue} unit="°" onChange={setHue} />
        <SliderControl label="Saturation" min={-100} max={100} value={sat} onChange={setSat} />
      </section>

      <section className="apply-section">
        <button className="btn-block btn-primary" onClick={handleApply} disabled={isLoading}>Apply to Full Res</button>
      </section>
    </div>
  );
}
