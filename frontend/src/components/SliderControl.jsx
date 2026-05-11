import React from 'react';
import { RotateCcw } from 'lucide-react';

export default function SliderControl({ label, min, max, step = 1, value, onChange, unit = '', defaultValue = 0 }) {
  return (
    <div className="slider-control">
      <div className="slider-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label className="slider-label">{label}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="slider-value" style={{ fontSize: '12px' }}>{value}{unit}</span>
          <button 
            className="btn-reset-small" 
            title="Reset" 
            onClick={() => onChange(defaultValue)}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              padding: 0, 
              display: 'flex', 
              alignItems: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <RotateCcw size={11} />
          </button>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}
