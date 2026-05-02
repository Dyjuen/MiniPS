import React from 'react';
import { useAppState } from '../../hooks/useAppState';

export default function ImageInfo() {
  const { imageMetadata, cursorPos, pixelRgb } = useAppState();

  return (
    <div className="image-info">
      <h3>Image Info</h3>
      {imageMetadata.filename ? (
        <ul>
          <li><strong>File:</strong> {imageMetadata.filename}</li>
          <li><strong>Res:</strong> {imageMetadata.resolution}</li>
          <li><strong>Size:</strong> {imageMetadata.fileSize}</li>
          <li><strong>Format:</strong> {imageMetadata.format}</li>
        </ul>
      ) : (
        <p>No image loaded</p>
      )}
      
      <h3>Cursor</h3>
      <p>X: {cursorPos.x}, Y: {cursorPos.y}</p>
      <p>RGB: ({pixelRgb.r}, {pixelRgb.g}, {pixelRgb.b})</p>
      <div 
        style={{ 
          width: '20px', 
          height: '20px', 
          backgroundColor: `rgb(${pixelRgb.r}, ${pixelRgb.g}, ${pixelRgb.b})`,
          border: '1px solid white' 
        }} 
      />
    </div>
  );
}
