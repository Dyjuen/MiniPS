import React from 'react';
import { useAppState } from '../../hooks/useAppState';

export default function ImageInfo() {
  const { imageMetadata, cursorPos, pixelRgb, appliedOps } = useAppState();

  const infoRows = [
    { label: 'Filename', value: imageMetadata.filename },
    { label: 'Format', value: imageMetadata.format },
    { label: 'Resolution', value: imageMetadata.resolution },
    { label: 'Color mode', value: imageMetadata.filename ? 'RGB' : '—' },
    { label: 'Channels', value: imageMetadata.filename ? '3' : '—' },
    { label: 'Bit depth', value: imageMetadata.filename ? '8-bit' : '—' },
    { label: 'File size', value: imageMetadata.fileSize },
    { label: 'Cursor', value: `${cursorPos.x}, ${cursorPos.y}` },
    { label: 'Pixel RGB', value: `(${pixelRgb.r}, ${pixelRgb.g}, ${pixelRgb.b})` },
  ];

  const badgeColors = ['#378ADD', '#4CAF50', '#FF9800'];

  return (
    <div className="image-info-scroll">
      <h4 className="section-title">Image Info</h4>
      <table className="info-table">
        <tbody>
          {infoRows.map((row, i) => (
            <tr key={i}>
              <td className="label">{row.label}</td>
              <td className="value">{row.value || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 className="section-title">Applied Operations</h4>
      <div className="ops-container">
        {appliedOps.length > 0 ? (
          <>
            {appliedOps.slice(0, 5).map((op, i) => (
              <span 
                key={i} 
                className="op-badge"
                style={{ backgroundColor: badgeColors[i % badgeColors.length] }}
              >
                {op}
              </span>
            ))}
            {appliedOps.length > 5 && (
              <span className="op-badge more">+{appliedOps.length - 5} more</span>
            )}
          </>
        ) : (
          <p className="no-data">No operations applied yet</p>
        )}
      </div>

      <h4 className="section-title">Compression Info</h4>
      <table className="info-table">
        <tbody>
          <tr><td className="label">Method</td><td className="value">—</td></tr>
          <tr><td className="label">Quality</td><td className="value">—</td></tr>
          <tr><td className="label">Est. Size</td><td className="value">—</td></tr>
        </tbody>
      </table>
    </div>
  );
}
