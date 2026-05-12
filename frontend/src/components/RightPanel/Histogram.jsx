import React, { useEffect, useState } from 'react';
import { useAppState } from '../../hooks/useAppState';
import * as api from '../../services/api';

export default function Histogram() {
  const { proxyBlob, originalProxyBlob, isCompareMode } = useAppState();
  const [chartUrl, setChartUrl] = useState(null);
  const [originalChartUrl, setOriginalChartUrl] = useState(null);

  useEffect(() => {
    if (!proxyBlob) return;

    const fetchHistogram = async () => {
      try {
        const { blob } = await api.getHistogramData(proxyBlob, 'grayscale');
        const url = URL.createObjectURL(blob);
        setChartUrl(url);
      } catch (err) {
        console.error('Histogram fetch failed:', err);
      }
    };

    fetchHistogram();
  }, [proxyBlob]);

  useEffect(() => {
    if (!isCompareMode || !originalProxyBlob) {
      setOriginalChartUrl(null);
      return;
    }

    const fetchOriginalHistogram = async () => {
      try {
        const { blob } = await api.getHistogramData(originalProxyBlob, 'grayscale');
        const url = URL.createObjectURL(blob);
        setOriginalChartUrl(url);
      } catch (err) {
        console.error('Original histogram fetch failed:', err);
      }
    };

    fetchOriginalHistogram();
  }, [isCompareMode, originalProxyBlob]);

  return (
    <div className="histogram-container">
      <h4 className="section-title">Histogram</h4>
      <div className="histogram-view" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {isCompareMode && originalChartUrl && (
          <div className="histogram-item">
            <div className="image-label" style={{ fontSize: '10px', marginBottom: '2px' }}>BEFORE</div>
            <img src={originalChartUrl} alt="before histogram" style={{ width: '100%', height: 'auto', opacity: 0.7 }} />
          </div>
        )}
        <div className="histogram-item">
          {isCompareMode && <div className="image-label" style={{ fontSize: '10px', marginBottom: '2px' }}>AFTER</div>}
          {chartUrl ? (
            <img src={chartUrl} alt="histogram" style={{ width: '100%', height: 'auto' }} />
          ) : (
            <div className="histogram-placeholder">No data</div>
          )}
        </div>
      </div>
    </div>
  );
}
