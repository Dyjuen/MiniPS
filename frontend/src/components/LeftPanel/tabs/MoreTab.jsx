import React, { useState } from 'react';
import SliderControl from '../../SliderControl';

export default function MoreTab() {
  const [quality, setQuality] = useState(85);
  const [conf, setConf] = useState(70);
  
  const originalSize = 284;
  const estSize = Math.round(originalSize * (quality / 100));

  const logAction = (name, val) => console.log(`More: ${name}`, val);

  return (
    <div className="tab-content">
      <section>
        <h4>Compression</h4>
        <div className="select-control">
          <label>Format</label>
          <select onChange={(e) => logAction('Format', e.target.value)}>
            <option>JPEG lossy</option>
            <option>PNG lossless</option>
            <option>BMP</option>
          </select>
        </div>
        <SliderControl label="Quality" min={1} max={100} value={quality} unit="%" onChange={(v) => setQuality(v)} />
        <p className="small-text">Estimated size: {estSize} KB</p>
        <div className="btn-group">
          <button onClick={() => logAction('Save Compressed', quality)}>Save Compressed</button>
          <button onClick={() => logAction('Simulate')}>Simulate</button>
        </div>
        <div className="select-control">
          <label>Method</label>
          <select onChange={(e) => logAction('Comp Method', e.target.value)}>
            <option>Huffman</option>
            <option>Arithmetic</option>
            <option>LZW</option>
            <option>RLE</option>
            <option>Quantization</option>
          </select>
        </div>
      </section>

      <section>
        <h4>Object recognition (CNN)</h4>
        <div className="select-control">
          <label>Detection type</label>
          <select onChange={(e) => logAction('Detection type', e.target.value)}>
            <option>Human</option>
            <option>Animal</option>
            <option>General objects</option>
          </select>
        </div>
        <SliderControl label="Min confidence" min={10} max={100} value={conf} unit="%" onChange={(v) => setConf(v)} />
        <button className="btn-block" onClick={() => logAction('Run Detection', conf)}>Run Detection</button>
        <div className="result-area">No detection results yet</div>
      </section>
    </div>
  );
}
