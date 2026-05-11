import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Draggable from 'react-draggable';
import { useAppState } from '../hooks/useAppState';
import { useApi } from '../hooks/useApi';
import * as api from '../services/api';

export default function LevelsModal() {
  const nodeRef = useRef(null);
  const canvasRef = useRef(null);
  const { 
    isLevelsModalOpen, 
    setIsLevelsModalOpen, 
    fullResBlob, 
    proxyBlob, 
    proxyUrl, 
    setCurrentImage,
    addToast,
    applyEditedBlob
  } = useAppState();
  
  const { previewOp, isLoading } = useApi();
  
  const [bins, setBins] = useState(null);
  const [channel, setChannel] = useState('all');
  const [black, setBlack] = useState(0);
  const [mid, setMid] = useState(128);
  const [white, setWhite] = useState(255);
  const [lastFetchedKey, setLastFetchedKey] = useState("");

  const blackRef = useRef(null);
  const midRef = useRef(null);
  const whiteRef = useRef(null);

  // Fetch histogram data
  useEffect(() => {
    if (!isLevelsModalOpen || !proxyBlob) return;
    
    const key = `${proxyBlob.size}-${channel}`;
    
    const fetchBins = async () => {
      try {
        const data = await api.getHistogramBins(proxyBlob);
        if (!data || !data[channel]) return;
        setBins(data);
        
        if (key !== lastFetchedKey) {
          // Reset handles
          setMid(128);
          setBlack(0);
          setWhite(255);
          setLastFetchedKey(key);
        }
      } catch (err) {
        addToast('Failed to load histogram data', 'error');
      }
    };
    
    fetchBins();
  }, [isLevelsModalOpen, proxyBlob, channel, addToast, lastFetchedKey]);

  // Calculate LUT for live histogram simulation
  const lut = useMemo(() => {
    const table = new Uint8Array(256);
    const range = white - black || 1;
    const norm_mid = Math.max(0.01, Math.min(0.99, (mid - black) / range));
    const gamma = Math.log(0.5) / Math.log(norm_mid);
    
    for (let i = 0; i < 256; i++) {
      let val = (i - black) / range;
      val = Math.max(0, Math.min(1, val));
      val = Math.pow(val, 1 / gamma);
      table[i] = Math.round(val * 255);
    }
    return table;
  }, [black, mid, white]);

  // Draw histogram
  useEffect(() => {
    if (!bins || !bins[channel] || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const channelBins = bins[channel];
    
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    
    // Remap bins for simulation using interpolation to avoid spikes and gaps
    const displayedBins = new Array(256).fill(0);
    for (let i = 0; i < 255; i++) {
      const start = lut[i];
      const end = lut[i+1];
      const val = channelBins[i];
      // Fill all bins between start and end (handles gaps/combing)
      for (let j = Math.min(start, end); j <= Math.max(start, end); j++) {
        displayedBins[j] = Math.max(displayedBins[j], val);
      }
    }
    // Handle last bin
    displayedBins[lut[255]] = Math.max(displayedBins[lut[255]], channelBins[255]);
    
    const maxBin = Math.max(...displayedBins) || 1;
    const barWidth = w / 256;
    
    const colors = {
      all: '#888',
      r: '#ff4444',
      g: '#44ff44',
      b: '#4444ff'
    };
    
    // Draw original ghosted histogram
    ctx.fillStyle = '#333';
    ctx.globalAlpha = 0.3;
    const originalMax = Math.max(...channelBins) || 1;
    for (let i = 0; i < 256; i++) {
      const bh = (channelBins[i] / originalMax) * h;
      ctx.fillRect(i * barWidth, h - bh, barWidth, bh);
    }

    // Draw remapped histogram
    ctx.fillStyle = colors[channel] || '#888';
    ctx.globalAlpha = 0.8;
    for (let i = 0; i < 256; i++) {
      const bh = (displayedBins[i] / maxBin) * h;
      ctx.fillRect(i * barWidth, h - bh, barWidth, bh);
    }
  }, [bins, channel, lut]);

  // Live preview
  useEffect(() => {
    if (!isLevelsModalOpen || !proxyBlob || !bins) return;
    previewOp(proxyBlob, api.applyLevels, black, mid, white, channel);
  }, [black, mid, white, channel, proxyBlob, isLevelsModalOpen, bins, previewOp]);

  // Revert preview on unmount
  useEffect(() => {
    return () => {
      if (proxyUrl) setCurrentImage(proxyUrl);
    };
  }, [proxyUrl, setCurrentImage]);

  if (!isLevelsModalOpen) return null;

  const handleClose = () => {
    if (proxyUrl) setCurrentImage(proxyUrl);
    setIsLevelsModalOpen(false);
  };

  const handleApply = async () => {
    if (!fullResBlob) return;
    try {
      const { blob } = await api.applyLevels(fullResBlob, black, mid, white, channel);
      applyEditedBlob(blob);
      setIsLevelsModalOpen(false);
      addToast('Levels applied', 'success');
    } catch (err) {
      addToast('Apply failed', 'error');
    }
  };

  const handleHandleDrag = (type, e, data) => {
    const val = Math.round(data.x);
    
    if (type === 'black') {
      setBlack(Math.min(val, mid - 2));
    } else if (type === 'mid') {
      setMid(Math.max(black + 2, Math.min(val, white - 2)));
    } else if (type === 'white') {
      setWhite(Math.max(val, mid + 2));
    }
  };

  return (
    <Draggable nodeRef={nodeRef} handle=".modal-header" bounds="parent">
      <div ref={nodeRef} className="levels-modal" style={{
        position: 'absolute',
        top: '150px',
        left: '150px',
        width: '320px',
        backgroundColor: '#2a2a2a',
        border: '1px solid #444',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        zIndex: 1001,
        color: '#e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none'
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
          <h3 style={{ margin: 0, fontSize: '14px' }}>Levels</h3>
          <button onClick={handleClose} style={{ 
            background: 'none', 
            border: 'none', 
            color: '#aaa', 
            cursor: 'pointer',
            fontSize: '16px' 
          }}>✕</button>
        </div>

        <div className="modal-body" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="channel-select" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '12px' }}>Channel:</label>
            <select 
              value={channel} 
              onChange={e => setChannel(e.target.value)}
              style={{ flex: 1, padding: '4px', background: '#1e1e1e', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
            >
              <option value="all">RGB (All)</option>
              <option value="r">Red</option>
              <option value="g">Green</option>
              <option value="b">Blue</option>
            </select>
          </div>

          <div className="histogram-area" style={{ 
            position: 'relative', 
            height: '100px', 
            background: '#111', 
            border: '1px solid #444',
            margin: '0 10px' 
          }}>
            <canvas 
              ref={canvasRef} 
              width={256} 
              height={100} 
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
            
            <div className="handles-container" style={{ position: 'absolute', bottom: '-10px', left: 0, width: '256px', height: '20px' }}>
              {/* Black Handle */}
              <Draggable 
                nodeRef={blackRef}
                axis="x" 
                bounds={{ left: 0, right: mid - 2 }} 
                position={{ x: black, y: 0 }}
                onDrag={(e, data) => handleHandleDrag('black', e, data)}
              >
                <div ref={blackRef} style={{ position: 'absolute', cursor: 'ew-resize', zIndex: 3 }}>
                  <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '10px solid #000', filter: 'drop-shadow(0 0 1px #fff)', transform: 'translateX(-6px)' }} />
                </div>
              </Draggable>

              {/* Mid Handle */}
              <Draggable 
                nodeRef={midRef}
                axis="x" 
                bounds={{ left: black + 2, right: white - 2 }} 
                position={{ x: mid, y: 0 }}
                onDrag={(e, data) => handleHandleDrag('mid', e, data)}
              >
                <div ref={midRef} style={{ position: 'absolute', cursor: 'ew-resize', zIndex: 2 }}>
                  <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '10px solid #888', filter: 'drop-shadow(0 0 1px #fff)', transform: 'translateX(-6px)' }} />
                </div>
              </Draggable>

              {/* White Handle */}
              <Draggable 
                nodeRef={whiteRef}
                axis="x" 
                bounds={{ left: mid + 2, right: 255 }} 
                position={{ x: white, y: 0 }}
                onDrag={(e, data) => handleHandleDrag('white', e, data)}
              >
                <div ref={whiteRef} style={{ position: 'absolute', cursor: 'ew-resize', zIndex: 3 }}>
                  <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '10px solid #fff', filter: 'drop-shadow(0 0 1px #000)', transform: 'translateX(-6px)' }} />
                </div>
              </Draggable>
            </div>
          </div>

          <div className="values-display" style={{ display: 'flex', justifyContent: 'space-between', padding: '0 5px', fontSize: '11px', color: '#aaa', marginTop: '10px' }}>
            <span>{black}</span>
            <span>{mid}</span>
            <span>{white}</span>
          </div>
        </div>

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
            cursor: 'pointer',
            fontSize: '12px'
          }}>Cancel</button>
          <button onClick={handleApply} style={{
            padding: '6px 12px',
            background: '#007acc',
            border: 'none',
            color: '#fff',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}>Apply</button>
        </div>
      </div>
    </Draggable>
  );
}
