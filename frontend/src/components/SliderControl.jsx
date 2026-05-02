import React from 'react';

export default function SliderControl({ label, min, max, step = 1, value, onChange, unit = '' }) {
  return (
    <div className="slider-control">
      <div className="slider-label-row">
        <label>{label}</label>
        <span>{value}{unit}</span>
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
