import React, { useState, useEffect, useRef } from 'react';
import SliderControl from '../../SliderControl';
import { useApi } from '../../../hooks/useApi';
import { useAppState } from '../../../hooks/useAppState';
import * as api from '../../../services/api';

export default function EdgeTab() {
  const { currentImage, setCurrentImage, addToast, sessionBase, setSessionBase } = useAppState();
  const { executeOp, previewOp, applyTabOps, isLoading } = useApi();
  
  const [threshold, setThreshold] = useState(128);
  const [method, setMethod] = useState('canny');
  const [morphOp, setMorphOp] = useState('dilate');
  const [morphKernel, setMorphKernel] = useState(3);
  const [segMethod, setSegMethod] = useState('threshold');

  const isApplied = useRef(false);
  const isMounted = useRef(false);
  const thresholdTouched = useRef(false);
  const morphTouched = useRef(false);

  useEffect(() => {
    if (currentImage && !sessionBase) {
      console.log('EdgeTab: captured global sessionBase');
      setSessionBase(currentImage);
    }
    isMounted.current = true;
  }, [currentImage, sessionBase]);

  useEffect(() => {
    if (!isMounted.current || !sessionBase) return;
    const timer = setTimeout(() => {
      if (thresholdTouched.current) {
        previewOp(sessionBase, api.applyThreshold, threshold);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [threshold, sessionBase]);

  const handleApply = async () => {
    const ops = [];
    if (thresholdTouched.current) {
      ops.push({ name: 'Threshold', fn: api.applyThreshold, args: [threshold] });
    }
    if (morphTouched.current) {
      ops.push({ name: 'Morphology', fn: api.applyMorphology, args: [morphOp, morphKernel] });
    }

    if (ops.length === 0) {
      addToast('No changes to apply', 'info');
      return;
    }

    const result = await applyTabOps(sessionBase, ops);
    if (result) {
      setSessionBase(result);
      isApplied.current = true;
      thresholdTouched.current = false;
      morphTouched.current = false;
      isApplied.current = false;
    }
  };

  return (
    <div className="tab-content">
      <section>
        <h4>Thresholding</h4>
        <SliderControl label="Threshold" min={0} max={255} value={threshold} onChange={(v) => { setThreshold(v); thresholdTouched.current = true; }} />
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
          <button onClick={() => { setMorphOp('erosion'); morphTouched.current = true; executeOp('Erosion', api.applyMorphology, 'erosion', morphKernel); }}>Erosion</button>
          <button onClick={() => { setMorphOp('dilation'); morphTouched.current = true; executeOp('Dilation', api.applyMorphology, 'dilation', morphKernel); }}>Dilation</button>
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

