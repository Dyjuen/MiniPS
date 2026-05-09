import cv2
import numpy as np

def apply_affine_transform(img, params):
    """
    Applies a combined transformation: Flip -> Scale -> Rotate -> Translate.
    params: dict with scaleX, scaleY, rotate, tx, ty, flipH, flipV
    """
    h, w = img.shape[:2]
    
    # 1. Flip
    if params.get('flipH'):
        img = cv2.flip(img, 1)
    if params.get('flipV'):
        img = cv2.flip(img, 0)
        
    # 2. Construct Transformation Matrices
    # Center translation
    cx, cy = w / 2, h / 2
    T_to_origin = np.array([[1, 0, -cx], [0, 1, -cy], [0, 0, 1]], dtype=np.float32)
    T_from_origin = np.array([[1, 0, cx], [0, 1, cy], [0, 0, 1]], dtype=np.float32)
    
    # Scale
    S = np.array([[params.get('scaleX', 1), 0, 0], 
                  [0, params.get('scaleY', 1), 0], 
                  [0, 0, 1]], dtype=np.float32)
    
    # Rotate
    angle = np.radians(params.get('rotate', 0))
    cos_a = np.cos(angle)
    sin_a = np.sin(angle)
    R = np.array([[cos_a, -sin_a, 0], 
                  [sin_a, cos_a, 0], 
                  [0, 0, 1]], dtype=np.float32)
    
    # Translate
    T_user = np.array([[1, 0, params.get('tx', 0)], 
                       [0, 1, params.get('ty', 0)], 
                       [0, 0, 1]], dtype=np.float32)
    
    # Combine: M = T_user * T_from * R * S * T_to
    # Note: R and S around center
    M_combined = T_user @ T_from_origin @ R @ S @ T_to_origin
    
    # Warp affine (extract top 2 rows)
    result = cv2.warpAffine(img, M_combined[:2], (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=(0,0,0,0))
    
    return result

def apply_clamped_crop(img, x, y, width, height):
    """
    Crops image with safety clamping.
    """
    h, w = img.shape[:2]
    
    # Clamp inputs
    x = max(0, min(int(x), w - 1))
    y = max(0, min(int(y), h - 1))
    width = max(1, min(int(width), w - x))
    height = max(1, min(int(height), h - y))
    
    return img[y:y+height, x:x+width]
