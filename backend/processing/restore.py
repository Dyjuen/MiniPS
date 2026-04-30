import cv2
import numpy as np

def gaussian_blur(image_ndarray, kernel_size=5, sigma=1.0):
    """Apply Gaussian Blur"""
    if kernel_size % 2 == 0:
        kernel_size += 1
    return cv2.GaussianBlur(image_ndarray, (kernel_size, kernel_size), sigma)

def median_filter(image_ndarray, kernel_size=3):
    """Apply Median Filter"""
    if kernel_size % 2 == 0:
        kernel_size += 1
    return cv2.medianBlur(image_ndarray, kernel_size)

def denoise_image(image_ndarray, method="salt_pepper", intensity=0.5):
    """
    Remove noise from image.
    method: "salt_pepper"
    intensity: strength of noise removal (not used in median, but for generic denoise)
    """
    if method == "salt_pepper":
        # Median filter is best for salt and pepper
        # map intensity 0.1-1.0 to kernel size 3-15
        k_size = int(intensity * 14) + 1
        if k_size < 3: k_size = 3
        if k_size % 2 == 0: k_size += 1
        return cv2.medianBlur(image_ndarray, k_size)
    
    # Generic denoising (Non-local Means)
    # fastNlMeansDenoisingColored(src, dst, h, hColor, templateWindowSize, searchWindowSize)
    h = int(intensity * 10) + 1
    if len(image_ndarray.shape) == 3:
        return cv2.fastNlMeansDenoisingColored(image_ndarray, None, h, h, 7, 21)
    else:
        return cv2.fastNlMeansDenoising(image_ndarray, None, h, 7, 21)
