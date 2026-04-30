import base64
import io
import numpy as np
from PIL import Image

def base64_to_ndarray(base64_string):
    """Convert base64 string to numpy array (OpenCV format: RGB)"""
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    
    img_data = base64.b64decode(base64_string)
    img = Image.open(io.BytesIO(img_data))
    if img.mode != 'RGB':
        img = img.convert('RGB')
    return np.array(img)

def ndarray_to_base64(image_array, format="PNG", quality=None):
    """Convert numpy array to base64 string"""
    img = Image.fromarray(image_array)
    buffered = io.BytesIO()
    
    # Map format strings
    save_format = format.upper()
    if save_format == "JPG":
        save_format = "JPEG"
    
    save_params = {}
    if save_format == "JPEG" and quality is not None:
        save_params["quality"] = quality
        
    img.save(buffered, format=save_format, **save_params)
    return base64.b64encode(buffered.getvalue()).decode('utf-8')
