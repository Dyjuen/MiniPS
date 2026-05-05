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

  return await response.blob();
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
    'X-MiniPS-X': x.toString(),
    'X-MiniPS-Y': y.toString(),
    'X-MiniPS-Width': width.toString(),
    'X-MiniPS-Height': height.toString()
  });

export const applyResize = (blob, width, height, interpolation = 'bilinear') => 
  postBinaryOp('/transform/resize', blob, {
    'X-MiniPS-Width': width.toString(),
    'X-MiniPS-Height': height.toString(),
    'X-MiniPS-Interpolation': interpolation
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

export const applyChannelSplit = (blob, channel) => 
  postBinaryOp('/color/channel-split', blob, {
    'X-MiniPS-Channel': channel
  });

export const applyColorAdjust = (blob, hue, saturation) => 
  postBinaryOp('/color/adjust', blob, {
    'X-MiniPS-Hue': hue.toString(),
    'X-MiniPS-Saturation': saturation.toString()
  });
