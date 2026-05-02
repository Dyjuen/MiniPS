import React from 'react';

export default function SliderControl({ label, min, max, step = 1, value, onChange, unit = '', defaultValue = 0 }) {
  return (
    <div className="slider-control">
      <div className="slider-header">
        <label className="slider-label">{label}</label>
        <div>
          <span className="slider-value">{value}{unit}</span>
          <button 
            className="btn-reset-small" 
            title="Reset" 
            onClick={() => onChange(defaultValue)}
          >
            ↺
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
