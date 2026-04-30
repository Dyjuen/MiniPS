import cv2
import numpy as np

def get_interp_method(method):
    """Map string method to OpenCV interpolation constant"""
    if method == "nearest":
        return cv2.INTER_NEAREST
    return cv2.INTER_LINEAR # default bilinear

def rotate_image(image_ndarray, angle, interpolation="bilinear"):
    """Rotate image by angle (0-360)"""
    (h, w) = image_ndarray.shape[:2]
    center = (w // 2, h // 2)
    
    # Get rotation matrix
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    
    # Calculate new bounding box (optional, but good for "Photoshop" feel)
    cos = np.abs(M[0, 0])
    sin = np.abs(M[0, 1])
    nW = int((h * sin) + (w * cos))
    nH = int((h * cos) + (w * sin))
    M[0, 2] += (nW / 2) - center[0]
    M[1, 2] += (nH / 2) - center[1]
    
    interp = get_interp_method(interpolation)
    return cv2.warpAffine(image_ndarray, M, (nW, nH), flags=interp)

def flip_image(image_ndarray, direction="horizontal"):
    """Flip image horizontally or vertically"""
    if direction == "horizontal":
        return cv2.flip(image_ndarray, 1)
    elif direction == "vertical":
        return cv2.flip(image_ndarray, 0)
    return image_ndarray

def crop_image(image_ndarray, x, y, width, height):
    """Crop image to specified rectangle"""
    h, w = image_ndarray.shape[:2]
    # Clip coordinates to image boundaries
    x1 = max(0, int(x))
    y1 = max(0, int(y))
    x2 = min(w, x1 + int(width))
    y2 = min(h, y1 + int(height))
    
    return image_ndarray[y1:y2, x1:x2]

def resize_image(image_ndarray, width, height, interpolation="bilinear"):
    """Resize image to target width and height"""
    interp = get_interp_method(interpolation)
    return cv2.resize(image_ndarray, (int(width), int(height)), interpolation=interp)

def translate_image(image_ndarray, tx, ty):
    """Translate (shift) image by tx, ty"""
    M = np.float32([[1, 0, tx], [0, 1, ty]])
    h, w = image_ndarray.shape[:2]
    return cv2.warpAffine(image_ndarray, M, (w, h))

def affine_transform(image_ndarray, matrix, interpolation="bilinear"):
    """Apply generic 2x3 affine matrix"""
    M = np.float32(matrix)
    h, w = image_ndarray.shape[:2]
    interp = get_interp_method(interpolation)
    return cv2.warpAffine(image_ndarray, M, (w, h), flags=interp)
