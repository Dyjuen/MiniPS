import React, { useState, useEffect } from 'react';
import SliderControl from '../../SliderControl';
import { useApi } from '../../../hooks/useApi';
import { useAppState } from '../../../hooks/useAppState';
import * as api from '../../../services/api';
import { Sliders, ScanLine, Layers, PieChart, Scan, Minus, Plus, Wand2, Trash2, Crosshair } from 'lucide-react';

export default function EdgeTab() {
  const { 
    proxyBlob, 
    proxyUrl,
    fullResBlob, 
    setCurrentImage,
    addToast,
    resetSignal,
    applyEditedBlob,
    seeds,
    setSeeds,
    setSelectedTool
  } = useAppState();
  
  const { executeOp, previewOp, isLoading } = useApi();
  
  // Threshold state
  const [threshold, setThreshold] = useState(128);

  // Edge state
  const [edgeMethod, setEdgeMethod] = useState('canny');
  const [cannyLow, setCannyLow] = useState(100);
  const [cannyHigh, setCannyHigh] = useState(200);
  const [edgeKsize, setEdgeKsize] = useState(3);
  const [edgeSigma, setEdgeSigma] = useState(1.0);

  // Morphology state
  const [morphKernel, setMorphKernel] = useState(3);

  // Segmentation state
  const [segMethod, setSegMethod] = useState('threshold');
  const [segThreshold, setSegThreshold] = useState(128);
  const [segTolerance, setSegTolerance] = useState(10);

  useEffect(() => {
    setThreshold(128);
    setEdgeMethod('canny');
    setCannyLow(100);
    setCannyHigh(200);
    setEdgeKsize(3);
    setEdgeSigma(1.0);
    setMorphKernel(3);
    setSegMethod('threshold');
    setSegThreshold(128);
    setSegTolerance(10);
    setSeeds([]);
  }, [resetSignal, setSeeds]);

  // Live Preview Effect (Threshold)
  useEffect(() => {
    if (!proxyBlob || !proxyUrl) return;
    if (threshold !== 128) {
      previewOp(proxyBlob, api.applyThreshold, threshold);
    } else {
      setCurrentImage(proxyUrl);
    }
  }, [threshold, proxyBlob, proxyUrl, setCurrentImage, previewOp]);

  const handleApplyThreshold = async (auto = false) => {
    if (!fullResBlob) return;
    const result = await executeOp('Threshold', api.applyThreshold, fullResBlob, threshold, 'binary', auto);
    if (result) {
      const blob = result.blob || result;
      applyEditedBlob(blob, 'Threshold');
      setThreshold(128); // Force reset to default to avoid flicker
    }
  };

  const handleApplyEdge = async (auto = false) => {
    if (!fullResBlob) return;
    const params = { low: cannyLow, high: cannyHigh, ksize: edgeKsize, sigma: edgeSigma };
    const result = await executeOp('Edge Detection', api.applyEdge, fullResBlob, edgeMethod, params, auto);
    if (result) {
      const blob = result.blob || result;
      applyEditedBlob(blob, 'Edge Detection');
      // Reset edge sliders to defaults
      setCannyLow(100);
      setCannyHigh(200);
      setEdgeKsize(3);
      setEdgeSigma(1.0);
    }
  };

  const handleApplySeg = async (auto = false) => {
    if (!fullResBlob) return;
    let result;
    if (segMethod === 'threshold') {
      result = await executeOp('Segmentation', api.applySegThreshold, fullResBlob, segThreshold, auto);
    } else if (segMethod === 'edge') {
      result = await executeOp('Segmentation', api.applySegEdge, fullResBlob, edgeMethod, auto);
    } else if (segMethod === 'region') {
      if (!auto && seeds.length === 0) {
        addToast('Please pick at least one seed point', 'warning');
        return;
      }
      result = await executeOp('Segmentation', api.applySegRegion, fullResBlob, seeds, segTolerance, auto);
    }

    if (result) {
      const blob = result.blob || result;
      applyEditedBlob(blob, 'Segmentation');
      setSegThreshold(128);
      setSegTolerance(10);
      setSeeds([]);
    }
  };

  return (
    <div className="tab-content">
      {/* Thresholding Section */}
      <section>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sliders size={12} /> Thresholding
        </h4>
        <SliderControl label="Threshold" min={0} max={255} value={threshold} onChange={setThreshold} defaultValue={128} />
        <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
          <button 
            className="btn-block btn-primary" 
            onClick={() => handleApplyThreshold(false)} 
            disabled={isLoading}
            style={{ flex: 1, marginTop: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Sliders size={13} /> Apply Threshold
          </button>
          <button 
            className="btn-block" 
            onClick={() => handleApplyThreshold(true)} 
            disabled={isLoading}
            title="Auto Threshold"
            style={{ width: '40px', marginTop: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Wand2 size={13} />
          </button>
        </div>
      </section>

      {/* Edge Detection Section */}
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

        {edgeMethod === 'canny' && (
          <>
            <SliderControl label="Low Thresh" min={0} max={255} value={cannyLow} onChange={setCannyLow} defaultValue={100} />
            <SliderControl label="High Thresh" min={0} max={255} value={cannyHigh} onChange={setCannyHigh} defaultValue={200} />
            <SliderControl label="Aperture" min={3} max={7} step={2} value={edgeKsize} onChange={setEdgeKsize} defaultValue={3} />
          </>
        )}

        {(edgeMethod === 'sobel' || edgeMethod === 'laplacian') && (
          <SliderControl label="Kernel size" min={1} max={31} step={2} value={edgeKsize} onChange={setEdgeKsize} defaultValue={3} />
        )}

        {edgeMethod !== 'canny' && (
          <SliderControl label="Blur Sigma" min={0.1} max={5.0} step={0.1} value={edgeSigma} onChange={setEdgeSigma} defaultValue={1.0} />
        )}

        <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
          <button 
            className="btn-block" 
            style={{ flex: 1, marginTop: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            onClick={() => handleApplyEdge(false)}
            disabled={isLoading}
          >
            <Scan size={13} /> Apply Edge
          </button>
          <button 
            className="btn-block" 
            onClick={() => handleApplyEdge(true)} 
            disabled={isLoading}
            title="Auto Edge"
            style={{ width: '40px', marginTop: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Wand2 size={13} />
          </button>
        </div>
      </section>

      {/* Morphology Section */}
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
              if (res) applyEditedBlob(res.blob || res, 'Erosion');
            }}
          >
            <Minus size={13} /> Erosion
          </button>
          <button 
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={async () => {
              const res = await executeOp('Dilation', api.applyMorphology, fullResBlob, 'dilation', morphKernel);
              if (res) applyEditedBlob(res.blob || res, 'Dilation');
            }}
          >
            <Plus size={13} /> Dilation
          </button>
        </div>
      </section>

      {/* Segmentation Section */}
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
        
        {segMethod === 'threshold' && (
          <SliderControl label="Threshold" min={0} max={255} value={segThreshold} onChange={setSegThreshold} defaultValue={128} />
        )}

        {segMethod === 'region' && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#aaa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Crosshair size={10} /> {seeds.length} seeds set
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  className="btn-sm" 
                  onClick={() => setSelectedTool('region-seed')}
                  style={{ fontSize: '11px', padding: '2px 8px' }}
                >
                  Pick Seed
                </button>
                <button 
                  className="btn-sm btn-ghost" 
                  onClick={() => setSeeds([])}
                  disabled={seeds.length === 0}
                  style={{ padding: '2px 4px' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            {seeds.length > 0 && (
              <div className="seeds-list" style={{ 
                maxHeight: '60px', 
                overflowY: 'auto', 
                fontSize: '10px', 
                color: '#888',
                background: 'rgba(0,0,0,0.2)',
                padding: '4px',
                borderRadius: '4px'
              }}>
                {seeds.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Seed {i+1}: {s[0]}, {s[1]}</span>
                  </div>
                ))}
              </div>
            )}
            <SliderControl label="Tolerance" min={1} max={100} value={segTolerance} onChange={setSegTolerance} defaultValue={10} />
          </div>
        )}

        <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
          <button 
            className="btn-block" 
            onClick={() => handleApplySeg(false)} 
            disabled={isLoading}
            style={{ flex: 1, marginTop: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <PieChart size={13} /> Run Segmentation
          </button>
          <button 
            className="btn-block" 
            onClick={() => handleApplySeg(true)} 
            disabled={isLoading}
            title="Auto Segmentation"
            style={{ width: '40px', marginTop: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Wand2 size={13} />
          </button>
        </div>
      </section>
    </div>
  );
}
