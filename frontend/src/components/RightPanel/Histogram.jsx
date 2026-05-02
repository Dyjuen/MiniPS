import React, { useEffect, useRef } from 'react';
import { useAppState } from '../../hooks/useAppState';

export default function Histogram() {
  const { currentImage } = useAppState();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(10, height - 20);
    ctx.lineTo(width, height - 20);
    ctx.stroke();

    // Labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '8px sans-serif';
    ctx.fillText('0', 8, height - 10);
    ctx.fillText('128', width / 2, height - 10);
    ctx.fillText('255', width - 20, height - 10);

    if (currentImage) {
      // Generate mock histogram data
      const data = [];
      for (let i = 0; i < 256; i++) {
        // Random "realistic" bell-ish curve
        const val = Math.random() * 30 + Math.exp(-Math.pow(i - 128, 2) / 2000) * 50;
        data.push(val);
      }

      const max = Math.max(...data);
      const barWidth = (width - 20) / 256;

      ctx.fillStyle = 'rgba(55, 138, 221, 0.7)';
      data.forEach((val, i) => {
        const h = (val / max) * (height - 30);
        ctx.fillRect(10 + i * barWidth, height - 20 - h, barWidth, h);
      });
    }
  }, [currentImage]);

  return (
    <div className="histogram-container">
      <h4 className="section-title">Histogram</h4>
      <canvas ref={canvasRef} width={160} height={100} />
    </div>
  );
}
