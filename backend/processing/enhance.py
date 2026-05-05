import cv2
import numpy as np

def adjust_brightness_contrast(image_ndarray, brightness=0, contrast=0):
    """
    Adjust brightness and contrast of an image.
    brightness: -100 to 100
    contrast: -100 to 100
    """
    alpha = (contrast + 100) / 100.0
    beta = brightness
    result = cv2.convertScaleAbs(image_ndarray, alpha=alpha, beta=beta)
    return result

def histogram_equalization(image_ndarray):
    """Apply histogram equalization to an image"""
    if len(image_ndarray.shape) == 2:
        return cv2.equalizeHist(image_ndarray)
    else:
        # For RGB, convert to YCrCb, equalize Y channel, and convert back
        ycrcb = cv2.cvtColor(image_ndarray, cv2.COLOR_RGB2YCrCb)
        ycrcb[:, :, 0] = cv2.equalizeHist(ycrcb[:, :, 0])
        return cv2.cvtColor(ycrcb, cv2.COLOR_YCrCb2RGB)

def sharpen_image(image_ndarray, intensity=0, scale=1.0):
    """
    Sharpen an image using an unsharp mask approach.
    intensity: 0.0 to 5.0 (0 is no-op)
    scale: resolution multiplier (1.0 for 1024px)
    """
    if intensity == 0:
        return image_ndarray
        
    # Scale the sigma (radius) by resolution to keep effect identical
    # Reference sigma 3.0 at 1024px
    sigma = 3.0 * scale
    
    # GaussianBlur (0,0) tells OpenCV to use sigma
    blurred = cv2.GaussianBlur(image_ndarray, (0, 0), sigma)
    
    # Formula: result = image + intensity * (image - blurred)
    alpha = 1.0 + intensity
    beta = -intensity
    result = cv2.addWeighted(image_ndarray, alpha, blurred, beta, 0)
    return result

def smooth_image(image_ndarray, kernel_size=3):
    """Apply Gaussian smoothing (blur) to an image"""
    if kernel_size % 2 == 0:
        kernel_size += 1
    if kernel_size < 1:
        kernel_size = 1
    return cv2.GaussianBlur(image_ndarray, (kernel_size, kernel_size), 0)
