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

def segment_by_edge(image_ndarray, method="canny"):
    """Segment image using edge detection result as mask"""
    if len(image_ndarray.shape) == 3:
        gray = cv2.cvtColor(image_ndarray, cv2.COLOR_RGB2GRAY)
    else:
        gray = image_ndarray
        
    if method == "canny":
        edges = cv2.Canny(gray, 100, 200)
    else:
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
