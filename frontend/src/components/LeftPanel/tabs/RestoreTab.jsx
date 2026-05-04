import React, { useState, useEffect, useRef } from 'react';
import SliderControl from '../../SliderControl';
import { useApi } from '../../../hooks/useApi';
import { useAppState } from '../../../hooks/useAppState';
import * as api from '../../../services/api';

export default function RestoreTab() {
  const { currentImage, setCurrentImage, addToast, sessionBase, setSessionBase } = useAppState();
  const { executeOp, previewOp, applyTabOps, isLoading } = useApi();

  const [gBlur, setGBlur] = useState(50);
  const [mFilter, setMFilter] = useState(50);
  const [noise, setNoise] = useState(50);
  const [method, setMethod] = useState('salt_pepper');
  const [hue, setHue] = useState(0);
  const [sat, setSat] = useState(0);

  const isApplied = useRef(false);
  const isMounted = useRef(false);
  
  const blurTouched = useRef(false);
  const medianTouched = useRef(false);
  const noiseTouched = useRef(false);

  useEffect(() => {
    if (currentImage && !sessionBase) {
      console.log('RestoreTab: captured global sessionBase');
      setSessionBase(currentImage);
    }
    isMounted.current = true;
  }, [currentImage, sessionBase]);

  // Debounce previews
  useEffect(() => {
    if (!isMounted.current || !sessionBase) return;
    const timer = setTimeout(() => {
      if (blurTouched.current) {
        previewOp(sessionBase, api.applyGaussian, gBlur);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [gBlur, sessionBase]);

  useEffect(() => {
    if (!isMounted.current || !sessionBase) return;
    const timer = setTimeout(() => {
      if (medianTouched.current) {
        previewOp(sessionBase, api.applyMedian, mFilter);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [mFilter, sessionBase]);

  useEffect(() => {
    if (!isMounted.current || !sessionBase) return;
    const timer = setTimeout(() => {
      if (noiseTouched.current) {
        previewOp(sessionBase, api.applyDenoise, method, noise);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [noise, method, sessionBase]);

  useEffect(() => {
    if (!isMounted.current || !sessionBase) return;
    const timer = setTimeout(() => {
      if (hue !== 0 || sat !== 0) {
        previewOp(sessionBase, api.applyColorAdjust, hue, sat);
      } else if (isMounted.current) {
        setCurrentImage(sessionBase);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [hue, sat, sessionBase]);

  const handleApply = async () => {
    const ops = [];
    if (blurTouched.current) {
      ops.push({ name: 'Gaussian Blur', fn: api.applyGaussian, args: [gBlur] });
    }
    if (medianTouched.current) {
      ops.push({ name: 'Median Filter', fn: api.applyMedian, args: [mFilter] });
    }
    if (noiseTouched.current) {
      ops.push({ name: 'Denoise', fn: api.applyDenoise, args: [method, noise] });
    }
    if (hue !== 0 || sat !== 0) {
      ops.push({ name: 'Color Adjust', fn: api.applyColorAdjust, args: [hue, sat] });
    }

    if (ops.length === 0) {
      addToast('No changes to apply', 'info');
      return;
    }

    const result = await applyTabOps(sessionBase, ops);
    if (result) {
      setSessionBase(result);
      isApplied.current = true;
      // Reset touched flags and states
      blurTouched.current = false;
      medianTouched.current = false;
      noiseTouched.current = false;
      setGBlur(50);
      setMFilter(50);
      setNoise(50);
      setHue(0);
      setSat(0);
      isApplied.current = false;
    }
  };

  return (
    <div className="tab-content">
      <section>
        <h4>Gaussian blur</h4>
        <SliderControl
          label="Blur strength"
          min={1} max={100} step={1}
          value={gBlur}
          unit="%"
          defaultValue={50}
          onChange={(v) => { setGBlur(v); blurTouched.current = true; }}
        />
      </section>

      <section>
        <h4>Median filter</h4>
        <SliderControl
          label="Filter strength"
          min={1} max={100} step={1}
          value={mFilter}
          unit="%"
          defaultValue={50}
          onChange={(v) => { setMFilter(v); medianTouched.current = true; }}
        />
      </section>

      <section>
        <h4>Noise reduction</h4>
        <SliderControl
          label="Reduction strength"
          min={1} max={100} step={1}
          value={noise}
          unit="%"
          defaultValue={50}
          onChange={(v) => { setNoise(v); noiseTouched.current = true; }}
        />
        <div className="select-control">
          <label>Method</label>
          <select value={method} onChange={(e) => { setMethod(e.target.value); noiseTouched.current = true; }}>
            <option value="salt_pepper">Salt & Pepper</option>
            <option value="generic">Generic</option>
          </select>
        </div>
      </section>

      <section>
        <h4>Color processing</h4>
        <div className="btn-group">
          <button onClick={() => executeOp('Grayscale', api.applyGrayscale)}>Grayscale</button>
          <button onClick={() => executeOp('Split R', api.applyChannelSplit, 'R')}>Split R</button>
        </div>
        <SliderControl label="Hue" min={-180} max={180} value={hue} unit="°" onChange={setHue} />
        <SliderControl label="Saturation" min={-100} max={100} value={sat} onChange={setSat} />
      </section>

      <section className="apply-section">
        <button 
          className="btn-block btn-primary" 
          onClick={handleApply}
          disabled={isLoading}
        >
          {isLoading ? 'Applying...' : 'Apply All Changes'}
        </button>
      </section>
    </div>
  );
}

