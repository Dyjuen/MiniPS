import React, { useState, useEffect, useRef, useMemo } from 'react';
import Draggable from 'react-draggable';
import { useAppState } from '../hooks/useAppState';
import { useApi } from '../hooks/useApi';
import * as api from '../services/api';
import SliderControl from './SliderControl';

export default function ExportModal() {
  const nodeRef = useRef(null);
  const { 
    isExportModalOpen, 
    setIsExportModalOpen, 
    fullResBlob, 
    proxyBlob, 
    proxyUrl, 
    setCurrentImage,
    addToast,
    imageMetadata 
  } = useAppState();
  
  const { previewOp, executeOp, isLoading, lastHeaders } = useApi();
  
  const [filename, setFilename] = useState('minips_output');
  const [format, setFormat] = useState('jpeg');
  const [method, setMethod] = useState('huffman');
  const [quality, setQuality] = useState(85);
  const [bits, setBits] = useState(4);

  const stats = useMemo(() => {
    if (!lastHeaders) return null;
    const ratio = lastHeaders.get('X-MiniPS-Ratio');
    const compSize = lastHeaders.get('X-MiniPS-Compressed-Size');
    if (!ratio || !compSize) return null;
    return {
      ratio: parseFloat(ratio).toFixed(2),
      size: (parseInt(compSize) / 1024).toFixed(1)
    };
  }, [lastHeaders]);

  // If quantization is selected, force PNG format
  useEffect(() => {
    if (method === 'quantization') {
      if (format !== 'png') setFormat('png');
    }
  }, [method, format]);

  // Live preview for JPEG quality and Quantization
  useEffect(() => {
    if (!isExportModalOpen || !proxyBlob || !proxyUrl) return;

    const previewFormat = (format === 'raw' || format === 'tiff' || format === 'bmp') ? 'png' : format;

    if (method === 'quantization') {
      // Live preview for quantization (bit depth reduction)
      previewOp(proxyBlob, api.applyEncode, method, previewFormat, bits, quality);
    } else if (previewFormat === 'jpeg') {
      // Live preview for standard JPEG compression
      previewOp(proxyBlob, api.applyJpegSim, quality, imageMetadata.w, imageMetadata.h);
    } else {
      // Reset preview if no simulation applies
      setCurrentImage(proxyUrl);
    }
    
    // On unmount or mode change, revert preview
    return () => {
      setCurrentImage(proxyUrl);
    };
  }, [quality, bits, format, method, proxyBlob, proxyUrl, setCurrentImage, isExportModalOpen, previewOp, imageMetadata.w, imageMetadata.h]);

  if (!isExportModalOpen) return null;

  const handleClose = () => {
    setCurrentImage(proxyUrl); // Ensure we revert preview
    setIsExportModalOpen(false);
  };

  const handleExport = async () => {
    if (!fullResBlob) return;
    
    let resBlob = null;
    try {
      if (format === 'jpeg' && method !== 'quantization') {
        resBlob = await executeOp('Export JPEG', api.applyJpegSim, fullResBlob, quality);
      } else {
        // Quantization or other lossless methods
        resBlob = await executeOp('Export Encode', api.applyEncode, fullResBlob, method, format, bits, quality);
      }
      
      if (resBlob) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(resBlob);
        const ext = format === 'raw' ? method : format;
        link.download = `${filename}.${ext}`;
        link.click();
        addToast(`Exported successfully as ${ext.toUpperCase()}`, 'success');
        handleClose();
      }
    } catch (e) {
      addToast(`Export failed: ${e.message}`, 'error');
    }
  };

  return (
    <Draggable nodeRef={nodeRef} handle=".modal-header">
      <div ref={nodeRef} className="export-modal" style={{
        position: 'absolute',
        top: '100px',
        left: '100px',
        width: '320px',
        backgroundColor: '#2a2a2a',
        border: '1px solid #444',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        zIndex: 1000,
        color: '#e0e0e0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="modal-header" style={{
          padding: '10px 15px',
          borderBottom: '1px solid #444',
          cursor: 'grab',
          backgroundColor: '#333',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '14px' }}>Export & Compression</h3>
          <button onClick={handleClose} style={{ 
            background: 'none', 
            border: 'none', 
            color: '#aaa', 
            cursor: 'pointer',
            fontSize: '16px' 
          }}>✕</button>
        </div>
        
        <div className="modal-body" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="input-group">
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>File Name</label>
            <input 
              type="text" 
              value={filename} 
              onChange={e => setFilename(e.target.value)}
              style={{ width: '100%', padding: '6px', background: '#1e1e1e', color: '#fff', border: '1px solid #555', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <div className="input-group">
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>Output Format</label>
            <select 
              value={format} 
              onChange={e => setFormat(e.target.value)}
              style={{ width: '100%', padding: '6px', background: '#1e1e1e', color: '#fff', border: '1px solid #555', borderRadius: '4px', boxSizing: 'border-box' }}
            >
              <option value="jpeg" disabled={method === 'quantization'}>JPEG</option>
              <option value="png">PNG</option>
              <option value="tiff" disabled={method === 'quantization'}>TIFF (Pro Compressed)</option>
              <option value="gif" disabled={method === 'quantization'}>GIF (LZW 8-bit)</option>
              <option value="bmp" disabled={method === 'quantization'}>BMP (Legacy)</option>
              {method !== 'quantization' && (
                <option value="raw">Raw Bitstream (.{method})</option>
              )}
            </select>
          </div>

          <div className="input-group">
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>Encoding Method (Simulation)</label>
            <select 
              value={method} 
              onChange={e => setMethod(e.target.value)}
              style={{ width: '100%', padding: '6px', background: '#1e1e1e', color: '#fff', border: '1px solid #555', borderRadius: '4px', boxSizing: 'border-box' }}
            >
              <option value="huffman">Huffman</option>
              <option value="arithmetic">Arithmetic</option>
              <option value="lzw">LZW</option>
              <option value="rle">RLE</option>
              <option value="quantization">Quantization</option>
            </select>
          </div>

          {stats && (
            <div className="stats-box" style={{ 
              background: '#1e1e1e', 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #444',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: '#aaa' }}>Estimated Size:</span>
                <span style={{ color: '#00ff00', fontWeight: 'bold' }}>{stats.size} KB</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#aaa' }}>Ratio:</span>
                <span style={{ color: '#00ff00', fontWeight: 'bold' }}>{stats.ratio}x</span>
              </div>
            </div>
          )}

          {method === 'quantization' && (
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>Quantization Bits</label>
              <SliderControl 
                label="" 
                min={1} 
                max={8} 
                value={bits} 
                onChange={setBits} 
                unit=" bits"
              />
            </div>
          )}

          {format === 'jpeg' && (
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>JPEG Quality</label>
              <SliderControl 
                label="" 
                min={1} 
                max={100} 
                value={quality} 
                onChange={setQuality} 
              />
            </div>
          )}

          <p style={{ fontSize: '10px', color: '#888', margin: 0, fontStyle: 'italic' }}>
            {format === 'raw' ? (
              <span style={{ color: '#ff9800' }}>⚠️ Warning: Raw bitstreams cannot be opened by standard image viewers. No headers included.</span>
            ) : (
              `* Lossless methods (Huffman/LZW/RLE) are simulated for preview. The downloaded file is re-encoded as standard ${format.toUpperCase()} for compatibility.`
            )}
          </p>
        </div>

        {isLoading && (
          <div style={{
            height: '4px',
            width: '100%',
            background: '#1e1e1e',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div className="loading-bar-animation" style={{
              height: '100%',
              width: '50%',
              background: '#007acc',
              position: 'absolute',
              left: '-50%',
              animation: 'loading-slide 1s infinite ease-in-out'
            }} />
          </div>
        )}

        <div className="modal-footer" style={{
          padding: '10px 15px',
          borderTop: '1px solid #444',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button onClick={handleClose} style={{
            padding: '6px 12px',
            background: 'transparent',
            border: '1px solid #555',
            color: '#e0e0e0',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>Cancel</button>
          <button onClick={handleExport} disabled={isLoading} style={{
            padding: '6px 12px',
            background: '#007acc',
            border: 'none',
            color: '#fff',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            {isLoading ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </Draggable>

  );
}
