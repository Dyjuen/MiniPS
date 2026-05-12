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

export const applyHistogramEq = (blob) => postBinaryOp('/enhance/histogram-eq', blob);

export const applySharpen = (blob, intensity) => 
  postBinaryOp('/enhance/sharpen', blob, {
    'X-MiniPS-Intensity': intensity.toString()
  });

export const applySmooth = (blob, kernel_size) => 
  postBinaryOp('/enhance/smooth', blob, {
    'X-MiniPS-Kernel': kernel_size.toString()
  });

// Transform
export const applyRotate = (blob, angle, interpolation = 'bilinear') => 
  postBinaryOp('/transform/rotate', blob, {
    'X-MiniPS-Angle': angle.toString(),
    'X-MiniPS-Interpolation': interpolation
  });

export const applyFlip = (blob, direction) => 
  postBinaryOp('/transform/flip', blob, {
    'X-MiniPS-Direction': direction
  });

export const applyCrop = (blob, x, y, width, height) => 
  postBinaryOp('/transform/crop', blob, {
    'X-MiniPS-Val': JSON.stringify({ x, y, width, height })
  });

export const applyGeometryTransform = (blob, params) => 
  postBinaryOp('/transform/geometry', blob, {
    'X-MiniPS-Val': JSON.stringify(params)
  });

export const applyResize = (blob, width, height, interpolation = 'bilinear') => 
  postBinaryOp('/transform/resize', blob, {
    'X-MiniPS-Width': width.toString(),
    'X-MiniPS-Height': height.toString(),
    'X-MiniPS-Interpolation': interpolation
  });

// Restoration — all sliders use unified percent (1-100)
export const applyGaussian = (blob, percent) => 
  postBinaryOp('/restore/gaussian', blob, {
    'X-MiniPS-Percent': percent.toString()
  });

export const applyMedian = (blob, percent) => 
  postBinaryOp('/restore/median', blob, {
    'X-MiniPS-Percent': percent.toString()
  });

export const applyDenoise = (blob, method = 'salt_pepper', percent = 50) => 
  postBinaryOp('/restore/denoise', blob, {
    'X-MiniPS-Method': method,
    'X-MiniPS-Percent': percent.toString()
  });

// Binary & Edge
export const applyThreshold = (blob, value, method = 'binary') => 
  postBinaryOp('/binary/threshold', blob, {
    'X-MiniPS-Threshold-Value': value.toString(),
    'X-MiniPS-Threshold-Method': method
  });

export const applyEdge = (blob, method = 'canny') => 
  postBinaryOp('/binary/edge', blob, {
    'X-MiniPS-Edge-Method': method
  });

export const applyMorphology = (blob, operation, kernel_size) => 
  postBinaryOp('/binary/morphology', blob, {
    'X-MiniPS-Morph-Op': operation,
    'X-MiniPS-Morph-Kernel': kernel_size.toString()
  });

// Color
export const applyGrayscale = (blob) => postBinaryOp('/color/grayscale', blob);

export const applyChannelSplit = (blob, channel, mode = 'colored') => 
  postBinaryOp('/color/channel-split', blob, {
    'X-MiniPS-Channel': channel,
    'X-MiniPS-Split-Mode': mode
  });

export const applyColorAdjust = (blob, hue, saturation) => 
  postBinaryOp('/color/adjust', blob, {
    'X-MiniPS-Hue': hue.toString(),
    'X-MiniPS-Saturation': saturation.toString()
  });

// Segmentation
export const applySegThreshold = (blob, value) => 
  postBinaryOp('/segment/threshold', blob, {
    'X-MiniPS-Threshold-Value': value.toString()
  });

export const applySegEdge = (blob, method) => 
  postBinaryOp('/segment/edge', blob, {
    'X-MiniPS-Edge-Method': method
  });

export const applySegRegion = (blob, seed_x, seed_y, tolerance = 10) => 
  postBinaryOp('/segment/region', blob, {
    'X-MiniPS-Seed-X': seed_x.toString(),
    'X-MiniPS-Seed-Y': seed_y.toString(),
    'X-MiniPS-Tolerance': tolerance.toString()
  });

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

export const applyLevels = (blob, black, mid, white, channel = 'all') =>
  postBinaryOp('/color/levels', blob, {
    'X-MiniPS-Black': black.toString(),
    'X-MiniPS-Mid': mid.toString(),
    'X-MiniPS-White': white.toString(),
    'X-MiniPS-Channel': channel
  });

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
