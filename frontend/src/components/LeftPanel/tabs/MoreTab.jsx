import React, { useState } from 'react';
import SliderControl from '../../SliderControl';
import { useApi } from '../../../hooks/useApi';
import * as api from '../../../services/api';
import { useAppState } from '../../../hooks/useAppState';

export default function MoreTab() {
  const { currentImage } = useAppState();
  const { executeOp } = useApi();
  const [quality, setQuality] = useState(85);
  const [method, setMethod] = useState('huffman');
  const [detectionType, setDetectionType] = useState('General objects');
  const [detectionResults, setDetectionResults] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  
  const originalSize = 284;
  const estSize = Math.round(originalSize * (quality / 100));

  const handleDownload = (b64) => {
    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${b64}`;
    link.download = 'compressed_image.jpg';
    link.click();
  };

  const handleDetection = async () => {
    setIsDetecting(true);
    setDetectionResults('Running detection...');
    try {
      const data = await api.runDetection(currentImage, detectionType, 0.5);
      if (data.results && data.results.length > 0) {
        setDetectionResults(data.results.map(r => `${r.label}: ${(r.confidence * 100).toFixed(1)}%`).join(', '));
      } else {
        setDetectionResults('No objects detected.');
      }
    } catch (err) {
      setDetectionResults('Detection failed: ' + err.message);
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="tab-content">
      <section>
        <h4>Compression</h4>
        <SliderControl label="Quality" min={1} max={100} value={quality} unit="%" onChange={setQuality} />
        <p className="small-text">Estimated size: {estSize} KB</p>
        <div className="btn-group">
          <button onClick={async () => {
            try {
              const data = await api.applyJpegSim(currentImage, quality);
              handleDownload(data.image);
            } catch (err) {
              alert('Download failed: ' + err.message);
            }
          }}>Save (JPEG)</button>
          <button onClick={() => executeOp('JPEG Sim', api.applyJpegSim, quality)}>Simulate</button>
        </div>
        <div className="select-control">
          <label>Encode Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="huffman">Huffman</option>
            <option value="rle">RLE</option>
            <option value="lzw">LZW</option>
            <option value="arithmetic">Arithmetic</option>
            <option value="quantization">Quantization</option>
          </select>
        </div>
        <button className="btn-block" onClick={async () => {
          const data = await executeOp('Encode', api.applyEncode, method);
          if (data) {
            alert(`Ratio: ${data.ratio.toFixed(2)}x\nSize: ${data.compressed_size} bytes`);
          }
        }}>Run Encoder</button>
      </section>

      <section>
        <h4>Object recognition (CNN)</h4>
        <div className="select-control">
          <label>Detection type</label>
          <select value={detectionType} onChange={(e) => setDetectionType(e.target.value)}>
            <option value="Human">Human</option>
            <option value="Animal">Animal</option>
            <option value="General objects">General objects</option>
          </select>
        </div>
        <button 
          className="btn-block" 
          onClick={handleDetection}
          disabled={isDetecting}
        >
          {isDetecting ? 'Running...' : 'Run Detection'}
        </button>
        <div className="result-area">{detectionResults || 'No detection results yet'}</div>
      </section>
    </div>
  );
}
