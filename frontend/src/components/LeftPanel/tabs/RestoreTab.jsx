import React, { useState, useEffect } from 'react';
import SliderControl from '../../SliderControl';
import { useApi } from '../../../hooks/useApi';
import * as api from '../../../services/api';

export default function RestoreTab() {
  const { executeOp } = useApi();
  const [gBlur, setGBlur] = useState(5);
  const [mFilter, setMFilter] = useState(3);
  const [noise, setNoise] = useState(0.5);
  const [hue, setHue] = useState(0);
  const [sat, setSat] = useState(0);

  // Debounce hue/sat
  useEffect(() => {
    if (hue === 0 && sat === 0) return;
    const timer = setTimeout(() => {
      executeOp('Color Adjust', api.applyColorAdjust, hue, sat);
    }, 300);
    return () => clearTimeout(timer);
  }, [hue, sat]);

  return (
    <div className="tab-content">
      <section>
        <h4>Gaussian blur</h4>
        <SliderControl label="Kernel size" min={3} max={15} step={2} value={gBlur} onChange={setGBlur} />
        <button className="btn-block" onClick={() => executeOp('Gaussian Blur', api.applyGaussian, gBlur)}>Apply Gaussian</button>
      </section>

      <section>
        <h4>Median filter</h4>
        <SliderControl label="Kernel size" min={3} max={15} step={2} value={mFilter} onChange={setMFilter} />
        <button className="btn-block" onClick={() => executeOp('Median Filter', api.applyMedian, mFilter)}>Apply Median</button>
      </section>

      <section>
        <h4>Noise reduction</h4>
        <SliderControl label="Intensity" min={0.1} max={1.0} step={0.1} value={noise} onChange={setNoise} />
        <div className="btn-group">
          <button onClick={() => executeOp('Denoise (S&P)', api.applyDenoise, 'salt_pepper', noise)}>Remove S&P</button>
          <button onClick={() => executeOp('Denoise', api.applyDenoise, 'generic', noise)}>Denoise</button>
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
    </div>
  );
}
