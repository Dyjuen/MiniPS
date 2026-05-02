import React, { useState } from 'react';
import SliderControl from '../../SliderControl';

export default function RestoreTab() {
  const [gBlur, setGBlur] = useState(3);
  const [mFilter, setMFilter] = useState(3);
  const [noise, setNoise] = useState(0);
  const [hue, setHue] = useState(0);
  const [sat, setSat] = useState(100);

  const logAction = (name, val) => console.log(`Restore: ${name}`, val);

  return (
    <div className="tab-content">
      <section>
        <h4>Gaussian blur</h4>
        <SliderControl label="Kernel size" min={1} max={21} step={2} value={gBlur} onChange={(v) => {setGBlur(v); logAction('Gaussian Kernel', v)}} />
        <button className="btn-block" onClick={() => logAction('Apply Gaussian')}>Apply Gaussian</button>
      </section>

      <section>
        <h4>Median filter</h4>
        <SliderControl label="Kernel size" min={3} max={11} step={2} value={mFilter} onChange={(v) => {setMFilter(v); logAction('Median Kernel', v)}} />
        <button className="btn-block" onClick={() => logAction('Apply Median')}>Apply Median</button>
      </section>

      <section>
        <h4>Salt & pepper noise</h4>
        <SliderControl label="Noise density" min={0} max={100} value={noise} unit="%" onChange={(v) => {setNoise(v); logAction('Noise Density', v)}} />
        <div className="btn-group">
          <button onClick={() => logAction('Add Noise')}>Add Noise</button>
          <button onClick={() => logAction('Remove Noise')}>Remove Noise</button>
        </div>
      </section>

      <section>
        <h4>Color processing</h4>
        <div className="btn-group">
          <button onClick={() => logAction('Grayscale')}>Grayscale</button>
          <button onClick={() => logAction('Split RGB')}>Split RGB</button>
        </div>
        <SliderControl label="Hue" min={-180} max={180} value={hue} unit="°" onChange={(v) => {setHue(v); logAction('Hue', v)}} />
        <SliderControl label="Saturation" min={0} max={200} value={sat} unit="%" onChange={(v) => {setSat(v); logAction('Saturation', v)}} />
      </section>
    </div>
  );
}
