import base64
import io
import numpy as np
from PIL import Image

def base64_to_ndarray(base64_string):
    """Convert base64 string to numpy array (OpenCV format)"""
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    
    img_data = base64.b64decode(base64_string)
    img = Image.open(io.BytesIO(img_data))
    return np.array(img)

def ndarray_to_base64(image_array, format="PNG"):
    """Convert numpy array to base64 string"""
    img = Image.fromarray(image_array)
    buffered = io.BytesIO()
    img.save(buffered, format=format)
    return base64.b64encode(buffered.getvalue()).decode('utf-8')
