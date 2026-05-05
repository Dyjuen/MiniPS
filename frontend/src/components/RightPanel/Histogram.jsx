import React, { useEffect, useState } from 'react';
import { useAppState } from '../../hooks/useAppState';
import * as api from '../../services/api';

export default function Histogram() {
  const { proxyBlob } = useAppState();
  const [chartUrl, setChartUrl] = useState(null);

  useEffect(() => {
    if (!proxyBlob) return;

    const fetchHistogram = async () => {
      try {
        const blob = await api.getHistogramData(proxyBlob, 'grayscale');
        const url = URL.createObjectURL(blob);
        setChartUrl(url);
      } catch (err) {
        console.error('Histogram fetch failed:', err);
      }
    };

    fetchHistogram();
  }, [proxyBlob]);

  return (
    <div className="histogram-container">
      <h4 className="section-title">Histogram</h4>
      <div className="histogram-view">
        {chartUrl ? (
          <img src={chartUrl} alt="histogram" style={{ width: '100%', height: 'auto' }} />
        ) : (
          <div className="histogram-placeholder">No data</div>
        )}
      </div>
    </div>
  );
}
