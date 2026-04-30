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

def sharpen_image(image_ndarray, intensity=1):
    """
    Sharpen an image using an unsharp mask approach.
    intensity: 1 to 5
    """
    # Base sharpening kernel is too aggressive for high intensity
    # Let's use Gaussian Blur to create a mask
    blurred = cv2.GaussianBlur(image_ndarray, (0, 0), 3)
    # result = original + intensity * (original - blurred)
    # addWeighted: src1 * alpha + src2 * beta + gamma
    # result = image * (1 + intensity) + blurred * (-intensity)
    alpha = 1.0 + (0.5 * intensity)
    beta = -0.5 * intensity
    result = cv2.addWeighted(image_ndarray, alpha, blurred, beta, 0)
    return result

def smooth_image(image_ndarray, kernel_size=3):
    """Apply smoothing (blur) to an image"""
    if kernel_size % 2 == 0:
        kernel_size += 1
    return cv2.blur(image_ndarray, (kernel_size, kernel_size))
