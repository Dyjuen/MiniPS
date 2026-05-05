import React, { useState } from 'react';
import SliderControl from '../../SliderControl';
import { useApi } from '../../../hooks/useApi';
import * as api from '../../../services/api';
import { useAppState } from '../../../hooks/useAppState';

export default function MoreTab() {
  const { fullResBlob, proxyBlob, setFullResBlob, setProxyBlob, addToast, resetSignal } = useAppState();
  const { executeOp, isLoading } = useApi();
  const [quality, setQuality] = useState(85);
  const [method, setMethod] = useState('huffman');

  React.useEffect(() => {
    setQuality(85);
    setMethod('huffman');
  }, [resetSignal]);
  
  const originalSize = 284;
  const estSize = Math.round(originalSize * (quality / 100));

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

  const handleDownload = (blob) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'minips_output.jpg';
    link.click();
  };

  return (
    <div className="tab-content">
      <section>
        <h4>Compression simulation</h4>
        <SliderControl label="Quality" min={1} max={100} value={quality} unit="%" onChange={setQuality} />
        <p className="small-text">Estimated size: {estSize} KB</p>
        <div className="btn-group">
          <button onClick={async () => {
            const res = await executeOp('JPEG Sim', api.applyJpegSim, fullResBlob, quality);
            if (res) handleDownload(res);
          }}>Save (JPEG)</button>
          <button onClick={async () => {
            const res = await executeOp('JPEG Sim', api.applyJpegSim, fullResBlob, quality);
            if (res) updateBlobs(res);
          }}>Simulate</button>
        </div>
      </section>

      <section>
        <h4>Lossless encoding</h4>
        <div className="select-control">
          <label>Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="huffman">Huffman</option>
            <option value="rle">RLE</option>
            <option value="lzw">LZW</option>
            <option value="arithmetic">Arithmetic</option>
          </select>
        </div>
        <button className="btn-block" onClick={async () => {
          await executeOp('Encode', api.applyEncode, fullResBlob, method);
          // In real Photoshop, this shows a popup with stats.
          addToast(`Encoded with ${method}`, 'info');
        }}>Run Stats</button>
      </section>
    </div>
  );
}
