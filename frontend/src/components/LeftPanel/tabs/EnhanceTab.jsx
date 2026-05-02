import React, { useState, useEffect, useRef } from 'react';
import SliderControl from '../../SliderControl';
import { useApi } from '../../../hooks/useApi';
import * as api from '../../../services/api';

export default function EnhanceTab() {
  const { executeOp } = useApi();
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [sharpness, setSharpness] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [scale, setScale] = useState(100);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [interpolation, setInterpolation] = useState('bilinear');

  const isInitialMount = useRef(true);

  // Debounce brightness/contrast
  useEffect(() => {
    if (isInitialMount.current) return;
    const timer = setTimeout(() => {
      executeOp('Brightness/Contrast', api.applyBrightness, brightness, contrast);
    }, 300);
    return () => clearTimeout(timer);
  }, [brightness, contrast]);

  // Handle Rotate change
  useEffect(() => {
    if (isInitialMount.current || rotate === 0) return;
    executeOp('Rotate', api.applyRotate, rotate, interpolation);
  }, [rotate]);

  // Handle Interpolation change - re-apply if rotate or scale is active
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (rotate !== 0) {
      executeOp('Rotate', api.applyRotate, rotate, interpolation);
    } else if (scale !== 100) {
      executeOp('Resize', api.applyResize, Math.round(scale), Math.round(scale), interpolation);
    }
  }, [interpolation]);

  return (
    <div className="tab-content">
      <section>
        <h4>Brightness & contrast</h4>
        <SliderControl label="Brightness" min={-100} max={100} value={brightness} onChange={setBrightness} />
        <SliderControl label="Contrast" min={-100} max={100} value={contrast} onChange={setContrast} />
        <SliderControl label="Sharpness" min={1} max={5} value={sharpness} onChange={(v) => {
          setSharpness(v);
          executeOp('Sharpen', api.applySharpen, v);
        }} />
        <div className="btn-group">
          <button onClick={() => executeOp('Histogram Eq.', api.applyHistogramEq)}>Histogram Eq.</button>
          <button onClick={() => executeOp('Smoothing', api.applySmooth, 3)}>Smoothing</button>
        </div>
      </section>

      <section>
        <h4>Geometric transform</h4>
        <SliderControl label="Rotate" min={0} max={360} value={rotate} unit="°" onChange={setRotate} />
        <SliderControl label="Scale" min={10} max={200} value={scale} unit="%" onChange={(v) => {
          setScale(v);
          executeOp('Resize', api.applyResize, Math.round(v), Math.round(v), interpolation);
        }} />
        <SliderControl label="Translate X" min={-300} max={300} value={translateX} onChange={(v) => {
          setTranslateX(v);
          executeOp('Translate', api.applyTranslate, v, translateY);
        }} />
        <SliderControl label="Translate Y" min={-300} max={300} value={translateY} onChange={(v) => {
          setTranslateY(v);
          executeOp('Translate', api.applyTranslate, translateX, v);
        }} />
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
    </div>
  );
}
