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

def detect_edges(image_ndarray, method="canny"):
    """Detect edges in image"""
    # Ensure grayscale
    if len(image_ndarray.shape) == 3:
        gray = cv2.cvtColor(image_ndarray, cv2.COLOR_RGB2GRAY)
    else:
        gray = image_ndarray
        
    if method == "canny":
        return cv2.Canny(gray, 100, 200)
    elif method == "sobel":
        grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        return cv2.convertScaleAbs(cv2.magnitude(grad_x, grad_y))
    elif method == "prewitt":
        kernelx = np.array([[1, 1, 1], [0, 0, 0], [-1, -1, -1]])
        kernely = np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]])
        img_prewittx = cv2.filter2D(gray, -1, kernelx)
        img_prewitty = cv2.filter2D(gray, -1, kernely)
        return cv2.addWeighted(img_prewittx, 0.5, img_prewitty, 0.5, 0)
    elif method == "roberts":
        kernelx = np.array([[1, 0], [0, -1]])
        kernely = np.array([[0, 1], [-1, 0]])
        img_robertsx = cv2.filter2D(gray, -1, kernelx)
        img_robertsy = cv2.filter2D(gray, -1, kernely)
        return cv2.addWeighted(img_robertsx, 0.5, img_robertsy, 0.5, 0)
    elif method == "laplacian":
        return cv2.convertScaleAbs(cv2.Laplacian(gray, cv2.CV_64F))
    elif method == "log":
        blurred = cv2.GaussianBlur(gray, (3, 3), 0)
        return cv2.convertScaleAbs(cv2.Laplacian(blurred, cv2.CV_64F))
    
    return gray

def apply_morphology(image_ndarray, operation="erosion", kernel_size=3):
    """Apply morphological operations"""
    kernel = np.ones((kernel_size, kernel_size), np.uint8)
    
    if operation == "erosion":
        return cv2.erode(image_ndarray, kernel, iterations=1)
    elif operation == "dilation":
        return cv2.dilate(image_ndarray, kernel, iterations=1)
        
    return image_ndarray
