import cv2
import numpy as np
from backend.processing.binary_edge import detect_edges

def colorize_mask(mask):
    """Convert binary/label mask to random colors using connected components."""
    # If it's already a binary mask (0, 255), find components
    if mask.dtype != np.int32:
        _, labels = cv2.connectedComponents(mask)
    else:
        labels = mask
        
    # Create random color map
    num_labels = np.max(labels) + 1
    colors = np.random.randint(0, 255, size=(num_labels, 3), dtype=np.uint8)
    colors[0] = [0, 0, 0]  # Background is black
    
    # Map labels to colors
    return colors[labels]

def segment_by_threshold(image_ndarray, value=127, auto=False):
    """Segment image using thresholding (multi-color output)"""
    if len(image_ndarray.shape) == 3:
        gray = cv2.cvtColor(image_ndarray, cv2.COLOR_RGB2GRAY)
    else:
        gray = image_ndarray.copy()
        
    applied_params = {}
    if auto:
        value, mask = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        applied_params = {"value": int(value)}
    else:
        _, mask = cv2.threshold(gray, value, 255, cv2.THRESH_BINARY)
        
    res = colorize_mask(mask)
    return (res, applied_params) if auto else res

def segment_by_edge(image_ndarray, method="canny", scale=1.0, auto=False, **kwargs):
    """Segment image using edge detection result as mask (multi-color output)"""
    if auto:
        edges, applied_params = detect_edges(image_ndarray, method=method, scale=scale, auto=True, **kwargs)
    else:
        edges = detect_edges(image_ndarray, method=method, scale=scale, auto=False, **kwargs)
        applied_params = {}
        
    # Close edges to form regions if possible (simple heuristic)
    kernel = np.ones((3,3), np.uint8)
    closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
    
    res = colorize_mask(closed)
    return (res, applied_params) if auto else res

def auto_region_seeds(image_ndarray, n_seeds=5):
    """Find N seeds in homogenous areas using a grid search and local variance."""
    h, w = image_ndarray.shape[:2]
    if len(image_ndarray.shape) == 3:
        gray = cv2.cvtColor(image_ndarray, cv2.COLOR_RGB2GRAY)
    else:
        gray = image_ndarray
        
    grid_h, grid_w = 10, 10
    step_h, step_w = h // grid_h, w // grid_w
    
    candidates = []
    for i in range(grid_h):
        for j in range(grid_w):
            y, x = i * step_h + step_h // 2, j * step_w + step_w // 2
            roi = gray[max(0, y-5):min(h, y+5), max(0, x-5):min(w, x+5)]
            var = np.var(roi)
            candidates.append(((x, y), var))
            
    # Sort by lowest variance and pick top N
    candidates.sort(key=lambda x: x[1])
    return [c[0] for c in candidates[:n_seeds]]

def segment_by_region(image_ndarray, seeds=None, tolerance=10, auto=False):
    """
    Segment image using Region Growing (Flood Fill) with multiple seeds.
    Returns RGB image with distinct colors for each region.
    """
    h, w = image_ndarray.shape[:2]
    applied_params = {}
    
    if auto:
        seeds = auto_region_seeds(image_ndarray)
        tolerance = 15 # Default auto tolerance
        applied_params = {"seeds": seeds, "tolerance": tolerance}
        
    if seeds is None or len(seeds) == 0:
        return (image_ndarray, {}) if auto else image_ndarray

    # Initialize mask for all regions
    final_mask = np.zeros((h, w, 3), np.uint8)
    total_mask = np.zeros((h + 2, w + 2), np.uint8)
    
    img_copy = image_ndarray.copy()
    
    for seed_x, seed_y in seeds:
        seed_x = max(0, min(w - 1, int(seed_x)))
        seed_y = max(0, min(h - 1, int(seed_y)))
        
        # Check if already covered
        if total_mask[seed_y + 1, seed_x + 1]:
            continue
            
        # Temp mask for this region
        temp_mask = np.zeros((h + 2, w + 2), np.uint8)
        
        # Distinct color for this region
        color = np.random.randint(0, 255, size=3).tolist()
        
        flags = 4 | cv2.FLOODFILL_MASK_ONLY | (255 << 8)
        cv2.floodFill(img_copy, temp_mask, (seed_x, seed_y), 255, (tolerance,)*3, (tolerance,)*3, flags)
        
        # Add to final output
        region_area = temp_mask[1:-1, 1:-1] == 255
        final_mask[region_area] = color
        
        # Update total mask
        total_mask |= temp_mask
        
    return (final_mask, applied_params) if auto else final_mask
