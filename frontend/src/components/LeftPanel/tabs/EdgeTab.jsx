import React, { useState, useEffect, useRef } from 'react';
import SliderControl from '../../SliderControl';
import { useApi } from '../../../hooks/useApi';
import { useAppState } from '../../../hooks/useAppState';
import * as api from '../../../services/api';

export default function EdgeTab() {
  const { 
    proxyBlob, 
    fullResBlob, 
    setFullResBlob, 
    setProxyBlob, 
    addToast,
    resetSignal
  } = useAppState();
  
  const { executeOp, previewOp, isLoading } = useApi();
  
  const [threshold, setThreshold] = useState(128);
  const [edgeMethod, setEdgeMethod] = useState('canny');
  const [morphKernel, setMorphKernel] = useState(3);

  useEffect(() => {
    setThreshold(128);
    setEdgeMethod('canny');
    setMorphKernel(3);
  }, [resetSignal]);

  // Live Preview Effect (Threshold)
  useEffect(() => {
    if (!proxyBlob) return;
    previewOp(proxyBlob, api.applyThreshold, threshold);
  }, [threshold, proxyBlob]);

  const handleApplyThreshold = async () => {
    if (!fullResBlob) return;
    const result = await executeOp('Threshold', api.applyThreshold, fullResBlob, threshold);
    if (result) updateBlobs(result);
  };

  const updateBlobs = (newFullResBlob) => {
    setFullResBlob(newFullResBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => setProxyBlob(b), 'image/jpeg', 0.9);
    };
    img.src = URL.createObjectURL(newFullResBlob);
  };

  return (
    <div className="tab-content">
      <section>
        <h4>Thresholding</h4>
        <SliderControl label="Threshold" min={0} max={255} value={threshold} onChange={setThreshold} />
        <button className="btn-block btn-primary" onClick={handleApplyThreshold} disabled={isLoading}>Apply Threshold</button>
      </section>

      <section>
        <h4>Edge detection</h4>
        <div className="select-control">
          <label>Method</label>
          <select value={edgeMethod} onChange={(e) => setEdgeMethod(e.target.value)}>
            <option value="canny">Canny</option>
            <option value="sobel">Sobel</option>
            <option value="prewitt">Prewitt</option>
            <option value="roberts">Roberts</option>
            <option value="laplacian">Laplacian</option>
            <option value="log">LoG</option>
          </select>
        </div>
        <button className="btn-block" onClick={async () => {
          const res = await executeOp('Edge Detection', api.applyEdge, fullResBlob, edgeMethod);
          if (res) updateBlobs(res);
        }}>Apply Edge</button>
      </section>

      <section>
        <h4>Morphology</h4>
        <SliderControl label="Kernel size" min={3} max={15} step={2} value={morphKernel} onChange={setMorphKernel} />
        <div className="btn-group">
          <button onClick={async () => {
            const res = await executeOp('Erosion', api.applyMorphology, fullResBlob, 'erosion', morphKernel);
            if (res) updateBlobs(res);
          }}>Erosion</button>
          <button onClick={async () => {
            const res = await executeOp('Dilation', api.applyMorphology, fullResBlob, 'dilation', morphKernel);
            if (res) updateBlobs(res);
          }}>Dilation</button>
        </div>
      </section>
    </div>
  );
}
