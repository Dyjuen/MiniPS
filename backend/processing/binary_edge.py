import cv2
import numpy as np

def apply_threshold(image_ndarray, value=127, method="binary"):
    """Apply thresholding to image"""
    # Ensure grayscale
    if len(image_ndarray.shape) == 3:
        gray = cv2.cvtColor(image_ndarray, cv2.COLOR_RGB2GRAY)
    else:
        gray = image_ndarray
        
    thresh_type = cv2.THRESH_BINARY
    if method == "otsu":
        thresh_type += cv2.THRESH_OTSU
        
    _, result = cv2.threshold(gray, value, 255, thresh_type)
    return result

def detect_edges(image_ndarray, method="canny", scale=1.0):
    """Detect edges in image"""
    # Ensure grayscale
    if len(image_ndarray.shape) == 3:
        gray = cv2.cvtColor(image_ndarray, cv2.COLOR_RGB2GRAY)
    else:
        gray = image_ndarray
        
    if method == "canny":
        # Scale Canny thresholds by resolution? 
        # Usually Canny is more sensitive at high res.
        # But fixed pixel thresholds are standard. 
        # Just return result.
        return cv2.Canny(gray, 100, 200)
    elif method == "sobel":
        # Sobel radius is fixed (3x3), but we can blur before to normalize
        sigma = 1.0 * scale
        gray = cv2.GaussianBlur(gray, (0, 0), sigma)
        grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        return cv2.convertScaleAbs(cv2.magnitude(grad_x, grad_y))
    
    return gray

def apply_morphology(image_ndarray, operation="erosion", kernel_size=3):
    """Apply morphological operations. kernel_size must be pre-scaled."""
    kernel = np.ones((kernel_size, kernel_size), np.uint8)
    
    if operation == "erosion":
        return cv2.erode(image_ndarray, kernel, iterations=1)
    elif operation == "dilation":
        return cv2.dilate(image_ndarray, kernel, iterations=1)
        
    return image_ndarray
