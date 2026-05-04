import cv2
import numpy as np

def _percent_to_kernel(percent):
    """
    Map a 1-100 percent value to an odd kernel size.
    Range: 1% -> 3,  100% -> 31
    """
    # Linear interpolation: [1..100] -> [3..31]
    k = int(3 + (percent - 1) / 99 * 28)
    # Ensure odd
    if k % 2 == 0:
        k += 1
    return max(3, k)

def _percent_to_sigma(percent):
    """
    Map a 1-100 percent value to sigma for Gaussian.
    Range: 1% -> 0.3,  100% -> 10.0
    """
    return round(0.3 + (percent - 1) / 99 * 9.7, 2)

def _percent_to_nlm_h(percent):
    """
    Map a 1-100 percent value to NLM filter strength h.
    Range: 1% -> 3,  100% -> 50
    Stronger h = more aggressive noise removal (and more blurring).
    """
    return int(3 + (percent - 1) / 99 * 47)

def gaussian_blur(image_ndarray, percent=50):
    """
    Apply Gaussian Blur.
    percent: 1-100 strength (maps to kernel size + sigma internally).
    """
    kernel_size = _percent_to_kernel(percent)
    sigma = _percent_to_sigma(percent)
    return cv2.GaussianBlur(image_ndarray, (kernel_size, kernel_size), sigma)

def median_filter(image_ndarray, percent=50):
    """
    Apply Median Filter.
    percent: 1-100 strength (maps to odd kernel size 3-31).
    """
    kernel_size = _percent_to_kernel(percent)
    return cv2.medianBlur(image_ndarray, kernel_size)

def denoise_image(image_ndarray, method="salt_pepper", percent=50):
    """
    Remove noise from image.
    method: "salt_pepper" | "generic"
    percent: 1-100 strength of noise removal.
    """
    if method == "salt_pepper":
        # Median filter is best for salt & pepper noise.
        # A stronger percent = larger kernel = removes more noise.
        kernel_size = _percent_to_kernel(percent)
        return cv2.medianBlur(image_ndarray, kernel_size)

    # Generic denoising via Non-local Means.
    # h controls filter strength: higher = more aggressive denoising.
    h = _percent_to_nlm_h(percent)
    if len(image_ndarray.shape) == 3:
        return cv2.fastNlMeansDenoisingColored(image_ndarray, None, h, h, 7, 21)
    else:
        return cv2.fastNlMeansDenoising(image_ndarray, None, h, 7, 21)
