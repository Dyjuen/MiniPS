import React from 'react';
import { useAppState } from '../hooks/useAppState';

export default function StatusBar() {
  const { imageMetadata, zoomLevel, cursorPos } = useAppState();

  return (
    <div className="status-bar">
      <span>{imageMetadata.filename || 'No image'}</span>
      <span style={{ marginLeft: 'auto', marginRight: '20px' }}>
        Pos: {cursorPos.x}, {cursorPos.y}
      </span>
      <span>Zoom: {zoomLevel}%</span>
    </div>
  );
}
