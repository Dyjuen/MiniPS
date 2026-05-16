import cv2
import numpy as np

def apply_threshold(image_ndarray, value=127, method="binary", auto=False):
    """Apply thresholding to image"""
    # Ensure grayscale
    if len(image_ndarray.shape) == 3:
        gray = cv2.cvtColor(image_ndarray, cv2.COLOR_RGB2GRAY)
    else:
        gray = image_ndarray
        
    thresh_type = cv2.THRESH_BINARY
    if auto or method == "otsu":
        thresh_type += cv2.THRESH_OTSU
        
    val, result = cv2.threshold(gray, value, 255, thresh_type)
    return (result, {"value": int(val)}) if auto else result

def detect_edges(image_ndarray, method="canny", scale=1.0, low_threshold=100, high_threshold=200, ksize=3, sigma=1.0, auto=False):
    """Detect edges in image with specific parameters or auto-calculation."""
    # Ensure grayscale
    if len(image_ndarray.shape) == 3:
        gray = cv2.cvtColor(image_ndarray, cv2.COLOR_RGB2GRAY)
    else:
        gray = image_ndarray.copy()
        
    applied_params = {}

    if method == "canny":
        if auto:
            # Median-based heuristic for Canny thresholds
            v = np.median(gray)
            sigma_val = 0.33
            low_threshold = int(max(0, (1.0 - sigma_val) * v))
            high_threshold = int(min(255, (1.0 + sigma_val) * v))
            applied_params = {"low_threshold": low_threshold, "high_threshold": high_threshold}
        
        # Aperture size for Canny (must be 3, 5, or 7)
        aperture = ksize if ksize in [3, 5, 7] else 3
        res = cv2.Canny(gray, low_threshold, high_threshold, apertureSize=aperture)
        return (res, applied_params) if auto else res

    elif method == "sobel":
        if auto:
            # Default "auto" for Sobel is just standard params
            ksize = 3
            sigma = 1.0
            applied_params = {"ksize": ksize, "sigma": sigma}
        
        # Ensure ksize is odd and valid for Sobel
        k = ksize if ksize % 2 != 0 and 1 <= ksize <= 31 else 3
        gray_blur = cv2.GaussianBlur(gray, (0, 0), sigma * scale)
        grad_x = cv2.Sobel(gray_blur, cv2.CV_64F, 1, 0, ksize=k)
        grad_y = cv2.Sobel(gray_blur, cv2.CV_64F, 0, 1, ksize=k)
        res = cv2.convertScaleAbs(cv2.magnitude(grad_x, grad_y))
        return (res, applied_params) if auto else res

    elif method == "prewitt":
        if auto:
            sigma = 1.0
            applied_params = {"sigma": sigma}
        gray_blur = cv2.GaussianBlur(gray, (0, 0), sigma * scale)
        kernel_x = np.array([[1, 0, -1], [1, 0, -1], [1, 0, -1]], dtype=np.float32)
        kernel_y = np.array([[1, 1, 1], [0, 0, 0], [-1, -1, -1]], dtype=np.float32)
        grad_x = cv2.filter2D(gray_blur, cv2.CV_64F, kernel_x)
        grad_y = cv2.filter2D(gray_blur, cv2.CV_64F, kernel_y)
        res = cv2.convertScaleAbs(cv2.magnitude(grad_x, grad_y))
        return (res, applied_params) if auto else res

    elif method == "roberts":
        if auto:
            sigma = 0.5
            applied_params = {"sigma": sigma}
        gray_blur = cv2.GaussianBlur(gray, (0, 0), sigma * scale)
        kernel_x = np.array([[1, 0], [0, -1]], dtype=np.float32)
        kernel_y = np.array([[0, 1], [-1, 0]], dtype=np.float32)
        grad_x = cv2.filter2D(gray_blur, cv2.CV_64F, kernel_x)
        grad_y = cv2.filter2D(gray_blur, cv2.CV_64F, kernel_y)
        res = cv2.convertScaleAbs(cv2.magnitude(grad_x, grad_y))
        return (res, applied_params) if auto else res

    elif method == "laplacian":
        if auto:
            ksize = 3
            sigma = 1.0
            applied_params = {"ksize": ksize, "sigma": sigma}
        k = ksize if ksize % 2 != 0 else 3
        gray_blur = cv2.GaussianBlur(gray, (0, 0), sigma * scale)
        lap = cv2.Laplacian(gray_blur, cv2.CV_64F, ksize=k)
        res = cv2.convertScaleAbs(lap, alpha=1.5)
        return (res, applied_params) if auto else res

    elif method == "log":
        if auto:
            sigma = 1.5
            applied_params = {"sigma": sigma}
        gray_blur = cv2.GaussianBlur(gray, (0, 0), sigma * scale)
        log_res = cv2.Laplacian(gray_blur, cv2.CV_64F)
        res = cv2.convertScaleAbs(log_res, alpha=2.0)
        return (res, applied_params) if auto else res
    
    return (gray, {}) if auto else gray

def apply_morphology(image_ndarray, operation="erosion", kernel_size=3):
    """Apply morphological operations. kernel_size must be pre-scaled."""
    kernel = np.ones((kernel_size, kernel_size), np.uint8)
    
    if operation == "erosion":
        return cv2.erode(image_ndarray, kernel, iterations=1)
    elif operation == "dilation":
        return cv2.dilate(image_ndarray, kernel, iterations=1)
        
    return image_ndarray
