import cv2
import numpy as np

def gaussian_blur(image_ndarray, percent=50, scale=1.0):
    """
    Apply Gaussian blur.
    percent: 1-100 (strength)
    scale: resolution multiplier
    """
    # Base sigma 5.0 at 100% for 1024px reference
    sigma = (percent / 100.0) * 5.0 * scale
    if sigma <= 0: return image_ndarray
    return cv2.GaussianBlur(image_ndarray, (0, 0), sigma)

def median_filter(image_ndarray, percent=50, scale=1.0):
    """Apply median filter"""
    # Max kernel size 15 at 100% for 1024px reference
    k = int((percent / 100.0) * 15 * scale)
    if k % 2 == 0: k += 1
    if k < 1: k = 1
    return cv2.medianBlur(image_ndarray, k)

def denoise_image(image_ndarray, method='salt_pepper', percent=50, scale=1.0):
    """Denoise image"""
    strength = (percent / 100.0) * 10.0 * scale
    
    if method == 'salt_pepper':
        # Median is effective for salt & pepper
        return median_filter(image_ndarray, percent, scale)
    else:
        # Fast non-local means
        h = strength
        if len(image_ndarray.shape) == 3:
            return cv2.fastNlMeansDenoisingColored(image_ndarray, None, h, h, 7, 21)
        else:
            return cv2.fastNlMeansDenoising(image_ndarray, None, h, 7, 21)
