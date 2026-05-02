import React from 'react';
import { useAppState } from '../hooks/useAppState';

export default function StatusBar() {
  const { zoomLevel, cursorPos, pixelRgb, activeTab } = useAppState();

  return (
    <div className="status-bar">
      <div className="status-group">
        <span className="badge-ready">Ready</span>
        <span className="status-item">Zoom: {zoomLevel}%</span>
        <span className="status-item">
          Cursor: {cursorPos.x !== 0 || cursorPos.y !== 0 ? `${cursorPos.x}, ${cursorPos.y}` : '—'}
        </span>
        <span className="status-item">
          RGB: {pixelRgb.r !== 0 || pixelRgb.g !== 0 || pixelRgb.b !== 0 ? `(${pixelRgb.r}, ${pixelRgb.g}, ${pixelRgb.b})` : '—'}
        </span>
        <span className="status-item">Tab: {activeTab || 'Enhance'}</span>
      </div>
      <div className="status-group-right">
        <span>OpenCV + Flask</span>
      </div>
    </div>
  );
}
