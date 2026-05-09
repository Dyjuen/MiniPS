import React, { useState, useEffect } from 'react';
import SliderControl from '../../SliderControl';
import { useApi } from '../../../hooks/useApi';
import { useAppState } from '../../../hooks/useAppState';
import * as api from '../../../services/api';

export default function RestoreTab() {
  const { proxyBlob, proxyUrl, fullResBlob, setCurrentImage, addToast, resetSignal, applyEditedBlob } = useAppState();
  const { executeOp, previewOp, isLoading } = useApi();

  const [gBlur, setGBlur] = useState(0);
  const [mFilter, setMFilter] = useState(0);
  const [noise, setNoise] = useState(0);
  const [noiseMethod, setNoiseMethod] = useState('salt_pepper');
  const [hue, setHue] = useState(0);
  const [sat, setSat] = useState(0);

  useEffect(() => {
    setGBlur(0);
    setMFilter(0);
    setNoise(0);
    setHue(0);
    setSat(0);
  }, [resetSignal]);

  // Live Previews (No Debounce) with Snap-back
  useEffect(() => {
    if (!proxyBlob || !proxyUrl) return;
    if (gBlur > 0) {
      previewOp(proxyBlob, api.applyGaussian, gBlur);
    } else {
      setCurrentImage(proxyUrl);
    }
  }, [gBlur, proxyBlob, proxyUrl, setCurrentImage]);

  useEffect(() => {
    if (!proxyBlob || !proxyUrl) return;
    if (mFilter > 0) {
      previewOp(proxyBlob, api.applyMedian, mFilter);
    } else {
      setCurrentImage(proxyUrl);
    }
  }, [mFilter, proxyBlob, proxyUrl, setCurrentImage]);

  useEffect(() => {
    if (!proxyBlob || !proxyUrl) return;
    if (noise > 0) {
      previewOp(proxyBlob, api.applyDenoise, noiseMethod, noise);
    } else {
      setCurrentImage(proxyUrl);
    }
  }, [noise, noiseMethod, proxyBlob, proxyUrl, setCurrentImage]);

  useEffect(() => {
    if (!proxyBlob || !proxyUrl) return;
    if (hue !== 0 || sat !== 0) {
      previewOp(proxyBlob, api.applyColorAdjust, hue, sat);
    } else {
      setCurrentImage(proxyUrl);
    }
  }, [hue, sat, proxyBlob, proxyUrl, setCurrentImage]);

  const handleApply = async () => {
    if (!fullResBlob) return;
    let result = fullResBlob;
    if (gBlur > 0) result = await executeOp('Gaussian Blur', api.applyGaussian, result, gBlur);
    if (mFilter > 0) result = await executeOp('Median Filter', api.applyMedian, result, mFilter);
    if (noise > 0) result = await executeOp('Denoise', api.applyDenoise, result, noiseMethod, noise);
    if (hue !== 0 || sat !== 0) result = await executeOp('Color Adjust', api.applyColorAdjust, result, hue, sat);

    if (result && result !== fullResBlob) {
      applyEditedBlob(result);
      setGBlur(0); setMFilter(0); setNoise(0); setHue(0); setSat(0);
      addToast('Applied to full resolution', 'success');
    }
  };

  return (
    <div className="tab-content">
      <section>
        <h4>Gaussian blur</h4>
        <SliderControl label="Blur strength" min={0} max={100} value={gBlur} unit="%" onChange={setGBlur} />
      </section>

      <section>
        <h4>Median filter</h4>
        <SliderControl label="Filter strength" min={0} max={100} value={mFilter} unit="%" onChange={setMFilter} />
      </section>

      <section>
        <h4>Noise reduction</h4>
        <SliderControl label="Reduction strength" min={0} max={100} value={noise} unit="%" onChange={setNoise} />
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
          <button onClick={async () => { const res = await executeOp('Grayscale', api.applyGrayscale, fullResBlob); if (res) applyEditedBlob(res); }}>Grayscale</button>
          <button onClick={async () => { const res = await executeOp('Split R', api.applyChannelSplit, fullResBlob, 'R'); if (res) applyEditedBlob(res); }}>Split R</button>
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
