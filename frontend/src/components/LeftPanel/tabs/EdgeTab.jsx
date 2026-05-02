import React, { useState } from 'react';
import SliderControl from '../../SliderControl';

export default function EdgeTab() {
  const [threshold, setThreshold] = useState(128);
  const [lowThresh, setLowThresh] = useState(50);
  const [highThresh, setHighThresh] = useState(150);
  const [morphKernel, setMorphKernel] = useState(3);
  const [clusters, setClusters] = useState(3);

  const logAction = (name, val) => console.log(`Edge: ${name}`, val);

  return (
    <div className="tab-content">
      <section>
        <h4>Thresholding</h4>
        <SliderControl label="Threshold" min={0} max={255} value={threshold} onChange={(v) => {setThreshold(v); logAction('Binary Threshold', v)}} />
        <button className="btn-block" onClick={() => logAction('Apply Binary')}>Apply Binary</button>
      </section>

      <section>
        <h4>Edge detection</h4>
        <div className="select-control">
          <label>Method</label>
          <select onChange={(e) => logAction('Edge Method', e.target.value)}>
            <option>Canny</option>
            <option>Sobel</option>
            <option>Prewitt</option>
            <option>Robert</option>
            <option>Laplacian</option>
            <option>LoG</option>
          </select>
        </div>
        <SliderControl label="Low threshold" min={0} max={255} value={lowThresh} onChange={(v) => {setLowThresh(v); logAction('Low Thresh', v)}} />
        <SliderControl label="High threshold" min={0} max={255} value={highThresh} onChange={(v) => {setHighThresh(v); logAction('High Thresh', v)}} />
        <button className="btn-block" onClick={() => logAction('Apply Edge')}>Apply Edge</button>
      </section>

      <section>
        <h4>Morphology</h4>
        <SliderControl label="Kernel size" min={3} max={15} step={2} value={morphKernel} onChange={(v) => {setMorphKernel(v); logAction('Morph Kernel', v)}} />
        <div className="btn-group">
          <button onClick={() => logAction('Erosion')}>Erosion</button>
          <button onClick={() => logAction('Dilation')}>Dilation</button>
        </div>
      </section>

      <section>
        <h4>Segmentation</h4>
        <div className="select-control">
          <label>Method</label>
          <select onChange={(e) => logAction('Seg Method', e.target.value)}>
            <option>Threshold-based</option>
            <option>Edge-based</option>
            <option>Region-based k-means</option>
          </select>
        </div>
        <SliderControl label="Clusters k" min={2} max={8} value={clusters} onChange={(v) => {setClusters(v); logAction('Clusters k', v)}} />
        <button className="btn-block" onClick={() => logAction('Apply Segmentation')}>Apply Segmentation</button>
      </section>
    </div>
  );
}
