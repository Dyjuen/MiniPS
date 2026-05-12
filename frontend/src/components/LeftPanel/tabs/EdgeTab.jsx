import React, { useState, useEffect, useRef } from 'react';
import SliderControl from '../../SliderControl';
import { useApi } from '../../../hooks/useApi';
import { useAppState } from '../../../hooks/useAppState';
import * as api from '../../../services/api';
import { Sliders, ScanLine, Layers, PieChart, Scan, Minus, Plus } from 'lucide-react';

export default function EdgeTab() {
  const { 
    proxyBlob, 
    proxyUrl,
    fullResBlob, 
    setCurrentImage,
    addToast,
    resetSignal,
    applyEditedBlob
  } = useAppState();
  
  const { executeOp, previewOp, isLoading } = useApi();
  
  const [threshold, setThreshold] = useState(128);
  const [edgeMethod, setEdgeMethod] = useState('canny');
  const [morphKernel, setMorphKernel] = useState(3);
  const [segMethod, setSegMethod] = useState('threshold');
  const [segTolerance, setSegTolerance] = useState(10);
  const { seedPoint, setSelectedTool } = useAppState();

  useEffect(() => {
    setThreshold(128);
    setEdgeMethod('canny');
    setMorphKernel(3);
    setSegTolerance(10);
  }, [resetSignal]);

  // Live Preview Effect (Threshold) with Snap-back
  useEffect(() => {
    if (!proxyBlob || !proxyUrl) return;
    if (threshold !== 128) {
      previewOp(proxyBlob, api.applyThreshold, threshold);
    } else {
      setCurrentImage(proxyUrl);
    }
  }, [threshold, proxyBlob, proxyUrl, setCurrentImage, previewOp]);

  const handleApplyThreshold = async () => {
    if (!fullResBlob) return;
    const result = await executeOp('Threshold', api.applyThreshold, fullResBlob, threshold);
    if (result) {
      applyEditedBlob(result, 'Threshold');
      setThreshold(128);
    }
  };

  const handleApplySeg = async () => {
    if (!fullResBlob) return;
    let result;
    if (segMethod === 'threshold') {
      result = await executeOp('Segmentation', api.applySegThreshold, fullResBlob, 127);
    } else if (segMethod === 'edge') {
      result = await executeOp('Segmentation', api.applySegEdge, fullResBlob, 'canny');
    } else if (segMethod === 'region') {
      if (seedPoint.x === null) {
        addToast('Please pick a seed point first', 'warning');
        return;
      }
      result = await executeOp('Segmentation', api.applySegRegion, fullResBlob, seedPoint.x, seedPoint.y, segTolerance);
    }
    if (result) applyEditedBlob(result, 'Segmentation');
  };

  return (
    <div className="tab-content">
      <section>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sliders size={12} /> Thresholding
        </h4>
        <SliderControl label="Threshold" min={0} max={255} value={threshold} onChange={setThreshold} defaultValue={128} />
        <button 
          className="btn-block btn-primary" 
          onClick={handleApplyThreshold} 
          disabled={isLoading}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <Sliders size={13} /> Apply Threshold
        </button>
      </section>

      <section>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ScanLine size={12} /> Edge detection
        </h4>
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
        <button 
          className="btn-block" 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          onClick={async () => {
            const res = await executeOp('Edge Detection', api.applyEdge, fullResBlob, edgeMethod);
            if (res) applyEditedBlob(res, 'Edge Detection');
          }}
        >
          <Scan size={13} /> Apply Edge
        </button>
      </section>

      <section>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={12} /> Morphology
        </h4>
        <SliderControl label="Kernel size" min={3} max={15} step={2} value={morphKernel} onChange={setMorphKernel} defaultValue={3} />
        <div className="btn-group">
          <button 
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={async () => {
              const res = await executeOp('Erosion', api.applyMorphology, fullResBlob, 'erosion', morphKernel);
              if (res) applyEditedBlob(res, 'Erosion');
            }}
          >
            <Minus size={13} /> Erosion
          </button>
          <button 
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={async () => {
              const res = await executeOp('Dilation', api.applyMorphology, fullResBlob, 'dilation', morphKernel);
              if (res) applyEditedBlob(res, 'Dilation');
            }}
          >
            <Plus size={13} /> Dilation
          </button>
        </div>
      </section>

      <section>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PieChart size={12} /> Segmentation
        </h4>
        <div className="select-control">
          <label>Method</label>
          <select value={segMethod} onChange={(e) => setSegMethod(e.target.value)}>
            <option value="threshold">Threshold-based</option>
            <option value="edge">Edge-based</option>
            <option value="region">Region Growing</option>
          </select>
        </div>
        
        {segMethod === 'region' && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: '#aaa' }}>
                Seed: {seedPoint.x !== null ? `${seedPoint.x}, ${seedPoint.y}` : 'Not set'}
              </span>
              <button 
                className="btn-sm" 
                onClick={() => setSelectedTool('region-seed')}
                style={{ fontSize: '11px', padding: '2px 8px' }}
              >
                Pick Seed
              </button>
            </div>
            <SliderControl label="Tolerance" min={1} max={100} value={segTolerance} onChange={setSegTolerance} defaultValue={10} />
          </div>
        )}

        <button 
          className="btn-block" 
          onClick={handleApplySeg} 
          disabled={isLoading}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' }}
        >
          <PieChart size={13} /> Run Segmentation
        </button>
      </section>
    </div>
  );
}
