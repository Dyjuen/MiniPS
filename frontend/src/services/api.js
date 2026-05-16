const API_BASE_URL = 'http://localhost:5000/api';

const postBinaryOp = async (endpoint, blob, headers = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: blob,
    headers: {
      'Content-Type': 'application/octet-stream',
      ...headers
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP Error ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    // Convert base64 back to blob if image is present
    if (data.image) {
      const byteCharacters = atob(data.image);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      data.blob = new Blob([byteArray], { type: 'image/jpeg' });
    }
    return { data, headers: response.headers };
  }

  const resultBlob = await response.blob();
  return {
    blob: resultBlob,
    headers: response.headers
  };
};

// Enhancement
export const applyBrightness = (blob, brightness, contrast) => 
  postBinaryOp('/enhance/brightness', blob, {
    'X-MiniPS-Brightness': brightness.toString(),
    'X-MiniPS-Contrast': contrast.toString()
  });

export const applySharpen = (blob, intensity) => 
  postBinaryOp('/enhance/sharpen', blob, {
    'X-MiniPS-Intensity': intensity.toString()
  });

export const applySmooth = (blob, kernel) => 
  postBinaryOp('/enhance/smooth', blob, {
    'X-MiniPS-Kernel': kernel.toString()
  });

export const applyHistogramEq = (blob) => 
  postBinaryOp('/enhance/histogram-eq', blob);

// Color
export const applyGrayscale = (blob) => 
  postBinaryOp('/color/grayscale', blob);

export const applyChannelSplit = (blob, channel, mode) => 
  postBinaryOp('/color/channel-split', blob, {
    'X-MiniPS-Channel': channel,
    'X-MiniPS-Split-Mode': mode
  });

export const applyColorAdjust = (blob, hue, saturation) => 
  postBinaryOp('/color/adjust', blob, {
    'X-MiniPS-Hue': hue.toString(),
    'X-MiniPS-Saturation': saturation.toString()
  });

export const applyLevels = (blob, black, mid, white, channel = 'all') =>
  postBinaryOp('/color/levels', blob, {
    'X-MiniPS-Black': black.toString(),
    'X-MiniPS-Mid': mid.toString(),
    'X-MiniPS-White': white.toString(),
    'X-MiniPS-Channel': channel
  });

// Restoration
export const applyGaussian = (blob, percent) => 
  postBinaryOp('/restore/gaussian', blob, {
    'X-MiniPS-Percent': percent.toString()
  });

export const applyMedian = (blob, percent) => 
  postBinaryOp('/restore/median', blob, {
    'X-MiniPS-Percent': percent.toString()
  });

export const applyDenoise = (blob, method, percent) => 
  postBinaryOp('/restore/denoise', blob, {
    'X-MiniPS-Method': method,
    'X-MiniPS-Percent': percent.toString()
  });

// Transform
export const applyRotate = (blob, angle, interpolation) => 
  postBinaryOp('/transform/rotate', blob, {
    'X-MiniPS-Angle': angle.toString(),
    'X-MiniPS-Interpolation': interpolation
  });

export const applyFlip = (blob, direction) => 
  postBinaryOp('/transform/flip', blob, {
    'X-MiniPS-Direction': direction
  });

export const applyGeometryTransform = (blob, params) => 
  postBinaryOp('/transform/geometry', blob, {
    'X-MiniPS-Val': JSON.stringify(params)
  });

export const applyCrop = (blob, x, y, width, height) => 
  postBinaryOp('/transform/crop', blob, {
    'X-MiniPS-Val': JSON.stringify({ x, y, width, height })
  });

// Binary & Edge
export const applyThreshold = (blob, value, method = 'binary', auto = false) => 
  postBinaryOp('/binary/threshold', blob, {
    'X-MiniPS-Threshold-Value': value.toString(),
    'X-MiniPS-Threshold-Method': method,
    'X-MiniPS-Auto': auto ? 'true' : 'false'
  });

export const applyEdge = (blob, method = 'canny', params = {}, auto = false) => 
  postBinaryOp('/binary/edge', blob, {
    'X-MiniPS-Edge-Method': method,
    'X-MiniPS-Edge-Low': (params.low || 100).toString(),
    'X-MiniPS-Edge-High': (params.high || 200).toString(),
    'X-MiniPS-Edge-Ksize': (params.ksize || 3).toString(),
    'X-MiniPS-Edge-Sigma': (params.sigma || 1.0).toString(),
    'X-MiniPS-Auto': auto ? 'true' : 'false'
  });

export const applyMorphology = (blob, operation, kernel_size) => 
  postBinaryOp('/binary/morphology', blob, {
    'X-MiniPS-Morph-Op': operation,
    'X-MiniPS-Morph-Kernel': kernel_size.toString()
  });

// Segmentation
export const applySegThreshold = (blob, value, auto = false) => 
  postBinaryOp('/segment/threshold', blob, {
    'X-MiniPS-Threshold-Value': value.toString(),
    'X-MiniPS-Auto': auto ? 'true' : 'false'
  });

export const applySegEdge = (blob, method, auto = false) => 
  postBinaryOp('/segment/edge', blob, {
    'X-MiniPS-Edge-Method': method,
    'X-MiniPS-Auto': auto ? 'true' : 'false'
  });

export const applySegRegion = (blob, seeds, tolerance = 10, auto = false) => {
  const headers = {
    'X-MiniPS-Tolerance': tolerance.toString(),
    'X-MiniPS-Auto': auto ? 'true' : 'false'
  };
  
  if (seeds && seeds.length > 0) {
    headers['X-MiniPS-Seeds'] = JSON.stringify(seeds);
  }
  
  return postBinaryOp('/segment/region', blob, headers);
};

// Histogram Data
export const getHistogramData = (blob, mode = 'grayscale') => 
  postBinaryOp('/histogram/analyze', blob, {
    'X-MiniPS-Histogram-Mode': mode
  });

export const getHistogramBins = async (blob) => {
  const response = await fetch(`${API_BASE_URL}/histogram/data`, {
    method: 'POST',
    body: blob,
    headers: { 'Content-Type': 'application/octet-stream' }
  });
  if (!response.ok) throw new Error('Failed to fetch histogram bins');
  return response.json();
};

// Compression
export const applyJpegSim = (blob, quality, targetWidth = 0, targetHeight = 0) => 
  postBinaryOp('/compress/jpeg', blob, {
    'X-MiniPS-Quality': quality.toString(),
    'X-MiniPS-Target-W': targetWidth.toString(),
    'X-MiniPS-Target-H': targetHeight.toString()
  });

export const applyEncode = (blob, method, format = 'jpeg', bits = 4, quality = 85) => 
  postBinaryOp('/compress/encode', blob, {
    'X-MiniPS-Method': method,
    'X-MiniPS-Format': format,
    'X-MiniPS-Bits': bits.toString(),
    'X-MiniPS-Quality': quality.toString()
  });
