import cv2
import matplotlib.pyplot as plt
import io
import base64
import numpy as np

# Use non-interactive backend for matplotlib
import matplotlib
matplotlib.use('Agg')

def get_histogram_chart(image_ndarray, mode="grayscale"):
    """Generate a histogram chart base64 string using matplotlib"""
    plt.figure(figsize=(6, 4))
    
    if mode == "grayscale":
        if len(image_ndarray.shape) == 3:
            gray = cv2.cvtColor(image_ndarray, cv2.COLOR_RGB2GRAY)
        else:
            gray = image_ndarray
        
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        plt.plot(hist, color='black')
        plt.fill_between(range(256), hist.flatten(), color='gray', alpha=0.3)
        plt.title('Grayscale Histogram')
        plt.xlabel('Pixel Intensity')
        plt.ylabel('Pixel Count')
        plt.xlim([0, 256])
        
    elif mode == "rgb":
        if len(image_ndarray.shape) == 2:
            # If grayscale, just show black
            hist = cv2.calcHist([image_ndarray], [0], None, [256], [0, 256])
            plt.plot(hist, color='black')
        else:
            colors = ('r', 'g', 'b')
            for i, col in enumerate(colors):
                hist = cv2.calcHist([image_ndarray], [i], None, [256], [0, 256])
                plt.plot(hist, color=col)
                plt.xlim([0, 256])
            plt.title('RGB Histogram')
            plt.xlabel('Pixel Intensity')
            plt.ylabel('Pixel Count')
            
    # Save to buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    plt.close()
    buf.seek(0)
    
    return base64.b64encode(buf.getvalue()).decode('utf-8')
def get_histogram_data(image_ndarray):
    """Return raw histogram bins for all channels as JSON-serializable dict"""
    if len(image_ndarray.shape) == 2:
        # Grayscale
        hist = cv2.calcHist([image_ndarray], [0], None, [256], [0, 256]).flatten().tolist()
        return {
            "all": hist,
            "r": hist,
            "g": hist,
            "b": hist
        }
    
    # RGB
    # OpenCV uses BGR
    b_hist = cv2.calcHist([image_ndarray], [0], None, [256], [0, 256]).flatten().tolist()
    g_hist = cv2.calcHist([image_ndarray], [1], None, [256], [0, 256]).flatten().tolist()
    r_hist = cv2.calcHist([image_ndarray], [2], None, [256], [0, 256]).flatten().tolist()
    
    # Calculate luminance histogram for 'all'
    gray = cv2.cvtColor(image_ndarray, cv2.COLOR_BGR2GRAY)
    all_hist = cv2.calcHist([gray], [0], None, [256], [0, 256]).flatten().tolist()
    
    return {
        "all": all_hist,
        "r": r_hist,
        "g": g_hist,
        "b": b_hist
    }
