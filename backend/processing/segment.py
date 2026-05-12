import cv2
import numpy as np

def segment_by_threshold(image_ndarray, value=127):
    """Segment image using thresholding (simple mask)"""
    if len(image_ndarray.shape) == 3:
        gray = cv2.cvtColor(image_ndarray, cv2.COLOR_RGB2GRAY)
    else:
        gray = image_ndarray
        
    _, mask = cv2.threshold(gray, value, 255, cv2.THRESH_BINARY)
    return mask

def segment_by_edge(image_ndarray, method="canny", scale=1.0):
    """Segment image using edge detection result as mask"""
    if len(image_ndarray.shape) == 3:
        gray = cv2.cvtColor(image_ndarray, cv2.COLOR_RGB2GRAY)
    else:
        gray = image_ndarray
        
    if method == "canny":
        edges = cv2.Canny(gray, 100, 200)
    elif method == "sobel":
        sigma = 1.0 * scale
        gray = cv2.GaussianBlur(gray, (0, 0), sigma)
        grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        edges = cv2.convertScaleAbs(cv2.magnitude(grad_x, grad_y))
    elif method == "prewitt":
        sigma = 1.0 * scale
        gray = cv2.GaussianBlur(gray, (0, 0), sigma)
        kernel_x = np.array([[1, 0, -1], [1, 0, -1], [1, 0, -1]], dtype=np.float32)
        kernel_y = np.array([[1, 1, 1], [0, 0, 0], [-1, -1, -1]], dtype=np.float32)
        grad_x = cv2.filter2D(gray, cv2.CV_64F, kernel_x)
        grad_y = cv2.filter2D(gray, cv2.CV_64F, kernel_y)
        edges = cv2.convertScaleAbs(cv2.magnitude(grad_x, grad_y))
    elif method == "roberts":
        # Roberts 2x2: use minimal blur
        gray = cv2.GaussianBlur(gray, (0, 0), 0.5)
        kernel_x = np.array([[1, 0], [0, -1]], dtype=np.float32)
        kernel_y = np.array([[0, 1], [-1, 0]], dtype=np.float32)
        grad_x = cv2.filter2D(gray, cv2.CV_64F, kernel_x)
        grad_y = cv2.filter2D(gray, cv2.CV_64F, kernel_y)
        edges = cv2.convertScaleAbs(cv2.magnitude(grad_x, grad_y))
    elif method == "laplacian":
        blur_sigma = max(0.5, min(scale * 0.5, 1.0))
        gray = cv2.GaussianBlur(gray, (0, 0), blur_sigma)
        edges = cv2.convertScaleAbs(cv2.Laplacian(gray, cv2.CV_64F), alpha=1.5)
    elif method == "log":
        blur_sigma = max(1.0, min(scale, 2.0))
        gray = cv2.GaussianBlur(gray, (0, 0), blur_sigma)
        edges = cv2.convertScaleAbs(cv2.Laplacian(gray, cv2.CV_64F), alpha=2.0)
    else:
        sigma = 1.0 * scale
        gray = cv2.GaussianBlur(gray, (0, 0), sigma)
        grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        edges = cv2.convertScaleAbs(cv2.magnitude(grad_x, grad_y))
        
    return edges

def segment_by_region(image_ndarray, seed_x, seed_y, tolerance=10):
    """
    Segment image using Region Growing (Flood Fill)
    Returns mask of the region
    """
    h, w = image_ndarray.shape[:2]
    # Ensure seed is within bounds
    seed_x = max(0, min(w - 1, int(seed_x)))
    seed_y = max(0, min(h - 1, int(seed_y)))
    
    # Create mask (h+2, w+2 for floodFill)
    mask = np.zeros((h + 2, w + 2), np.uint8)
    
    # Copy image to not modify original
    img_copy = image_ndarray.copy()
    
    # FloodFill returns (rect, count, mask)
    # newVal is what the area is filled with in the image
    # loDiff and upDiff are tolerances
    flags = 4 | cv2.FLOODFILL_MASK_ONLY | (255 << 8)
    cv2.floodFill(img_copy, mask, (seed_x, seed_y), 255, (tolerance,)*3, (tolerance,)*3, flags)
    
    # Mask was filled with 255 where region matches. Extract the w*h part.
    return mask[1:-1, 1:-1]
