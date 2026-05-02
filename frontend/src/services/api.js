import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const postOp = async (endpoint, image, params = {}) => {
  const response = await api.post(endpoint, { image, params });
  if (!response.data.success) throw new Error(response.data.error || 'API Error');
  return response.data;
};

// Enhancement
export const applyBrightness = (image, brightness, contrast) => postOp('/enhance/brightness', image, { brightness, contrast });
export const applyHistogramEq = (image) => postOp('/enhance/histogram-eq', image);
export const applySharpen = (image, intensity) => postOp('/enhance/sharpen', image, { intensity });
export const applySmooth = (image, kernel_size) => postOp('/enhance/smooth', image, { kernel_size });

// Transform
export const applyRotate = (image, angle, interpolation = 'bilinear') => postOp('/transform/rotate', image, { angle, interpolation });
export const applyFlip = (image, direction) => postOp('/transform/flip', image, { direction });
export const applyResize = (image, width, height, interpolation = 'bilinear') => postOp('/transform/resize', image, { width, height, interpolation });
export const applyTranslate = (image, tx, ty) => postOp('/transform/translate', image, { tx, ty });

// Restoration
export const applyGaussian = (image, kernel_size, sigma = 1.0) => postOp('/restore/gaussian', image, { kernel_size, sigma });
export const applyMedian = (image, kernel_size) => postOp('/restore/median', image, { kernel_size });
export const applyDenoise = (image, method = 'salt_pepper', intensity = 0.5) => postOp('/restore/denoise', image, { method, intensity });

// Binary & Edge
export const applyThreshold = (image, value, method = 'binary') => postOp('/binary/threshold', image, { value, method });
export const applyEdge = (image, method = 'canny') => postOp('/binary/edge', image, { method });
export const applyMorphology = (image, operation, kernel_size) => postOp('/binary/morphology', image, { operation, kernel_size });

// Color
export const applyGrayscale = (image) => postOp('/color/grayscale', image);
export const applyChannelSplit = (image, channel) => postOp('/color/channel-split', image, { channel });
export const applyColorAdjust = (image, hue, saturation) => postOp('/color/adjust', image, { hue, saturation });

// Segmentation
export const applySegThreshold = (image, value) => postOp('/segment/threshold', image, { value });
export const applySegEdge = (image, method = 'canny') => postOp('/segment/edge', image, { method });
export const applySegRegion = (image, seed_x, seed_y, tolerance = 10) => postOp('/segment/region', image, { seed_x, seed_y, tolerance });

// Compression
export const applyJpegSim = (image, quality) => postOp('/compress/jpeg', image, { quality });
export const applyEncode = (image, method, bits = 4) => postOp('/compress/encode', image, { method, bits });

// Histogram Data
export const getHistogramData = (image) => postOp('/histogram/generate', image);

// ML
export const runDetection = (image, type, confidence) => postOp('/ml/detect', image, { type, confidence });

export default api;
