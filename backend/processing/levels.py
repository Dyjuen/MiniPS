import cv2
import numpy as np

def apply_levels(img: np.ndarray, black: int, mid: int, white: int, channel: str = "all") -> np.ndarray:
    """
    Apply levels adjustment using a Look-Up Table (LUT).
    black: 0-254
    white: 1-255
    mid: gamma point (maps to normalized value)
    channel: "all" | "r" | "g" | "b"
    """
    # Calculate gamma from mid handle
    # midpoint (0.5) should be at handle position
    # out = ((in - black) / (white - black)) ^ (1/gamma)
    # 0.5 = ((mid - black) / (white - black)) ^ (1/gamma)
    # log(0.5) = (1/gamma) * log((mid - black) / (white - black))
    
    if white <= black:
        white = black + 1
    
    # Normalized mid position in the [black, white] range
    norm_mid = (mid - black) / (white - black)
    norm_mid = np.clip(norm_mid, 0.01, 0.99)
    
    # gamma = log(0.5) / log(norm_mid)
    gamma = np.log(0.5) / np.log(norm_mid)
    
    # Build LUT
    x = np.arange(256).astype(np.float32)
    # 1. Map to 0-1 based on black/white points
    lut = (x - black) / (white - black)
    lut = np.clip(lut, 0, 1)
    # 2. Apply gamma
    lut = np.power(lut, 1.0 / gamma)
    # 3. Map back to 0-255
    lut = (lut * 255).astype(np.uint8)
    
    if channel == "all" or len(img.shape) == 2:
        return cv2.LUT(img, lut)
    
    # Per channel
    res = img.copy()
    ch_idx = {"b": 0, "g": 1, "r": 2}[channel] # OpenCV BGR
    res[:, :, ch_idx] = cv2.LUT(res[:, :, ch_idx], lut)
    return res
