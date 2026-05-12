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
    elif method == "prewitt":
        sigma = 1.0 * scale
        gray = cv2.GaussianBlur(gray, (0, 0), sigma)
        kernel_x = np.array([[1, 0, -1], [1, 0, -1], [1, 0, -1]], dtype=np.float32)
        kernel_y = np.array([[1, 1, 1], [0, 0, 0], [-1, -1, -1]], dtype=np.float32)
        grad_x = cv2.filter2D(gray, cv2.CV_64F, kernel_x)
        grad_y = cv2.filter2D(gray, cv2.CV_64F, kernel_y)
        return cv2.convertScaleAbs(cv2.magnitude(grad_x, grad_y))
    elif method == "roberts":
        # Roberts is 2x2, very sensitive to noise but also very sensitive to blur.
        # Use very small fixed blur.
        gray = cv2.GaussianBlur(gray, (0, 0), 0.5)
        kernel_x = np.array([[1, 0], [0, -1]], dtype=np.float32)
        kernel_y = np.array([[0, 1], [-1, 0]], dtype=np.float32)
        grad_x = cv2.filter2D(gray, cv2.CV_64F, kernel_x)
        grad_y = cv2.filter2D(gray, cv2.CV_64F, kernel_y)
        return cv2.convertScaleAbs(cv2.magnitude(grad_x, grad_y))
    elif method == "laplacian":
        # Laplacian: Reduce blur to keep edges sharp, then normalize for visibility
        blur_sigma = max(0.5, min(scale * 0.5, 1.0))
        gray = cv2.GaussianBlur(gray, (0, 0), blur_sigma)
        lap = cv2.Laplacian(gray, cv2.CV_64F)
        return cv2.convertScaleAbs(lap, alpha=1.5) # Slight boost
    elif method == "log":
        # LoG: Slightly more blur than Laplacian, then normalize
        blur_sigma = max(1.0, min(scale, 2.0))
        gray = cv2.GaussianBlur(gray, (0, 0), blur_sigma)
        log_res = cv2.Laplacian(gray, cv2.CV_64F)
        return cv2.convertScaleAbs(log_res, alpha=2.0) # More boost for LoG
    
    return gray

def apply_morphology(image_ndarray, operation="erosion", kernel_size=3):
    """Apply morphological operations. kernel_size must be pre-scaled."""
    kernel = np.ones((kernel_size, kernel_size), np.uint8)
    
    if operation == "erosion":
        return cv2.erode(image_ndarray, kernel, iterations=1)
    elif operation == "dilation":
        return cv2.dilate(image_ndarray, kernel, iterations=1)
        
    return image_ndarray
