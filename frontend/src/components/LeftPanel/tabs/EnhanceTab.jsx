import React, { useState } from 'react';
import SliderControl from '../../SliderControl';

export default function EnhanceTab() {
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [sharpness, setSharpness] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [scale, setScale] = useState(100);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  const logAction = (name, val) => console.log(`Enhance: ${name}`, val);

  return (
    <div className="tab-content">
      <section>
        <h4>Brightness & contrast</h4>
        <SliderControl label="Brightness" min={-100} max={100} value={brightness} onChange={(v) => {setBrightness(v); logAction('Brightness', v)}} />
        <SliderControl label="Contrast" min={-100} max={100} value={contrast} onChange={(v) => {setContrast(v); logAction('Contrast', v)}} />
        <SliderControl label="Sharpness" min={0} max={100} value={sharpness} onChange={(v) => {setSharpness(v); logAction('Sharpness', v)}} />
        <div className="btn-group">
          <button onClick={() => logAction('Histogram Eq.')}>Histogram Eq.</button>
          <button onClick={() => logAction('Smoothing')}>Smoothing</button>
        </div>
      </section>

      <section>
        <h4>Geometric transform</h4>
        <SliderControl label="Rotate" min={0} max={360} value={rotate} unit="°" onChange={(v) => {setRotate(v); logAction('Rotate', v)}} />
        <SliderControl label="Scale" min={10} max={200} value={scale} unit="%" onChange={(v) => {setScale(v); logAction('Scale', v)}} />
        <SliderControl label="Translate X" min={-300} max={300} value={translateX} onChange={(v) => {setTranslateX(v); logAction('Translate X', v)}} />
        <SliderControl label="Translate Y" min={-300} max={300} value={translateY} onChange={(v) => {setTranslateY(v); logAction('Translate Y', v)}} />
        <div className="btn-group">
          <button onClick={() => logAction('Flip H')}>Flip H</button>
          <button onClick={() => logAction('Flip V')}>Flip V</button>
        </div>
        <div className="select-control">
          <label>Interpolation</label>
          <select onChange={(e) => logAction('Interpolation', e.target.value)}>
            <option>Nearest neighbor</option>
            <option>Bilinear</option>
          </select>
        </div>
      </section>
    </div>
  );
}
