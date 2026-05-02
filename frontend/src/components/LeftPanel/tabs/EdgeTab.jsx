import React, { useState } from 'react';
import SliderControl from '../../SliderControl';
import { useApi } from '../../../hooks/useApi';
import * as api from '../../../services/api';

export default function EdgeTab() {
  const { executeOp } = useApi();
  const [threshold, setThreshold] = useState(127);
  const [method, setMethod] = useState('canny');
  const [morphOp, setMorphOp] = useState('erosion');
  const [morphKernel, setMorphKernel] = useState(3);
  const [segMethod, setSegMethod] = useState('threshold');

  return (
    <div className="tab-content">
      <section>
        <h4>Thresholding</h4>
        <SliderControl label="Threshold" min={0} max={255} value={threshold} onChange={setThreshold} />
        <button className="btn-block" onClick={() => executeOp('Binary Threshold', api.applyThreshold, threshold)}>Apply Binary</button>
      </section>

      <section>
        <h4>Edge detection</h4>
        <div className="select-control">
          <label>Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="canny">Canny</option>
            <option value="sobel">Sobel</option>
            <option value="prewitt">Prewitt</option>
            <option value="roberts">Roberts</option>
            <option value="laplacian">Laplacian</option>
            <option value="log">LoG</option>
          </select>
        </div>
        <button className="btn-block" onClick={() => executeOp('Edge Detection', api.applyEdge, method)}>Apply Edge</button>
      </section>

      <section>
        <h4>Morphology</h4>
        <SliderControl label="Kernel size" min={3} max={15} step={2} value={morphKernel} onChange={setMorphKernel} />
        <div className="btn-group">
          <button onClick={() => executeOp('Erosion', api.applyMorphology, 'erosion', morphKernel)}>Erosion</button>
          <button onClick={() => executeOp('Dilation', api.applyMorphology, 'dilation', morphKernel)}>Dilation</button>
        </div>
      </section>

      <section>
        <h4>Segmentation</h4>
        <div className="select-control">
          <label>Method</label>
          <select value={segMethod} onChange={(e) => setSegMethod(e.target.value)}>
            <option value="threshold">Threshold-based</option>
            <option value="edge">Edge-based</option>
          </select>
        </div>
        <button className="btn-block" onClick={() => {
          const fn = segMethod === 'threshold' ? api.applySegThreshold : api.applySegEdge;
          executeOp('Segmentation', fn, segMethod === 'threshold' ? 127 : 'canny');
        }}>Apply Segmentation</button>
      </section>
    </div>
  );
}
