import cv2
import numpy as np

def to_grayscale(image_ndarray):
    """Convert RGB image to Grayscale"""
    if len(image_ndarray.shape) == 2:
        return image_ndarray
    return cv2.cvtColor(image_ndarray, cv2.COLOR_RGB2GRAY)

def split_channels(image_ndarray, channel):
    """Split RGB image into R, G, or B channel"""
    if len(image_ndarray.shape) == 2:
        return image_ndarray # Already grayscale
        
    r, g, b = cv2.split(image_ndarray)
    if channel == 'R':
        return r
    elif channel == 'G':
        return g
    elif channel == 'B':
        return b
    else:
        raise ValueError(f"Invalid channel: {channel}")

def adjust_color(image_ndarray, hue=0, saturation=0):
    """Adjust Hue and Saturation of RGB image"""
    if len(image_ndarray.shape) == 2:
        return image_ndarray # Hue/Sat not applicable to grayscale
        
    # Convert to HSV
    hsv = cv2.cvtColor(image_ndarray, cv2.COLOR_RGB2HSV).astype("float32")
    h, s, v = cv2.split(hsv)
    
    # Adjust Hue (0-179 in OpenCV)
    h = (h + hue) % 180
    
    # Adjust Saturation (0-255)
    s = s + saturation
    s = np.clip(s, 0, 255)
    
    # Merge and convert back to RGB
    hsv_adjusted = cv2.merge([h, s, v]).astype("uint8")
    return cv2.cvtColor(hsv_adjusted, cv2.COLOR_HSV2RGB)
