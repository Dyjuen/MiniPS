import React, { useState, useEffect, useRef } from 'react';
import SliderControl from '../../SliderControl';
import { useApi } from '../../../hooks/useApi';
import { useAppState } from '../../../hooks/useAppState';
import * as api from '../../../services/api';

export default function EnhanceTab() {
  const { currentImage, setCurrentImage, addToast, sessionBase, setSessionBase } = useAppState();
  const { executeOp, previewOp, applyTabOps, isLoading } = useApi();
  
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [sharpness, setSharpness] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [scale, setScale] = useState(100);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [interpolation, setInterpolation] = useState('bilinear');

  const isApplied = useRef(false);
  const isMounted = useRef(false);

  useEffect(() => {
    if (currentImage && !sessionBase) {
      console.log('EnhanceTab: captured global sessionBase');
      setSessionBase(currentImage);
    }
    isMounted.current = true;
  }, [currentImage, sessionBase]);

  // Debounce effects for preview
  useEffect(() => {
    if (!isMounted.current || !sessionBase) return;
    const timer = setTimeout(() => {
      if (brightness !== 0 || contrast !== 0) {
        previewOp(sessionBase, api.applyBrightness, brightness, contrast);
      } else if (isMounted.current) {
        setCurrentImage(sessionBase);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [brightness, contrast, sessionBase]);

  useEffect(() => {
    if (!isMounted.current || !sessionBase) return;
    const timer = setTimeout(() => {
      if (sharpness !== 1) {
        previewOp(sessionBase, api.applySharpen, sharpness);
      } else if (isMounted.current) {
        setCurrentImage(sessionBase);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [sharpness, sessionBase]);

  useEffect(() => {
    if (!isMounted.current || !sessionBase) return;
    const timer = setTimeout(() => {
      if (rotate !== 0) {
        previewOp(sessionBase, api.applyRotate, rotate, interpolation);
      } else if (isMounted.current) {
        setCurrentImage(sessionBase);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [rotate, interpolation, sessionBase]);

  useEffect(() => {
    if (!isMounted.current || !sessionBase) return;
    const timer = setTimeout(() => {
      if (scale !== 100) {
        previewOp(sessionBase, api.applyResize, Math.round(scale), Math.round(scale), interpolation);
      } else if (isMounted.current) {
        setCurrentImage(sessionBase);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [scale, sessionBase]);

  useEffect(() => {
    if (!isMounted.current || !sessionBase) return;
    const timer = setTimeout(() => {
      if (translateX !== 0 || translateY !== 0) {
        previewOp(sessionBase, api.applyTranslate, translateX, translateY);
      } else if (isMounted.current) {
        setCurrentImage(sessionBase);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [translateX, translateY, sessionBase]);


  const handleApply = async () => {
    const ops = [];
    if (brightness !== 0 || contrast !== 0) {
      ops.push({ name: 'Brightness/Contrast', fn: api.applyBrightness, args: [brightness, contrast] });
    }
    if (sharpness !== 1) {
      ops.push({ name: 'Sharpen', fn: api.applySharpen, args: [sharpness] });
    }
    if (rotate !== 0) {
      ops.push({ name: 'Rotate', fn: api.applyRotate, args: [rotate, interpolation] });
    }
    if (scale !== 100) {
      ops.push({ name: 'Resize', fn: api.applyResize, args: [Math.round(scale), Math.round(scale), interpolation] });
    }
    if (translateX !== 0 || translateY !== 0) {
      ops.push({ name: 'Translate', fn: api.applyTranslate, args: [translateX, translateY] });
    }

    if (ops.length === 0) {
      addToast('No changes to apply', 'info');
      return;
    }

    const result = await applyTabOps(sessionBase, ops);
    if (result) {
      setSessionBase(result);
      isApplied.current = true;
      // Reset local state
      setBrightness(0);
      setContrast(0);
      setSharpness(1);
      setRotate(0);
      setScale(100);
      setTranslateX(0);
      setTranslateY(0);
      isApplied.current = false;
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
          <button onClick={() => executeOp('Histogram Eq.', api.applyHistogramEq)}>Histogram Eq.</button>
          <button onClick={() => executeOp('Smoothing', api.applySmooth, 3)}>Smoothing</button>
        </div>
      </section>

      <section>
        <h4>Geometric transform</h4>
        <SliderControl label="Rotate" min={0} max={360} value={rotate} unit="°" onChange={setRotate} />
        <SliderControl label="Scale" min={10} max={200} value={scale} unit="%" onChange={setScale} />
        <SliderControl label="Translate X" min={-300} max={300} value={translateX} onChange={setTranslateX} />
        <SliderControl label="Translate Y" min={-300} max={300} value={translateY} onChange={setTranslateY} />
        <div className="btn-group">
          <button onClick={() => executeOp('Flip H', api.applyFlip, 'horizontal')}>Flip H</button>
          <button onClick={() => executeOp('Flip V', api.applyFlip, 'vertical')}>Flip V</button>
        </div>
        <div className="select-control">
          <label>Interpolation</label>
          <select value={interpolation} onChange={(e) => setInterpolation(e.target.value)}>
            <option value="nearest">Nearest neighbor</option>
            <option value="bilinear">Bilinear</option>
          </select>
        </div>
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

