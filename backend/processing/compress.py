import cv2
import numpy as np
import io
import zlib
from PIL import Image
from dahuffman import HuffmanCodec

def compress_jpeg_sim(image_ndarray, quality=50, target_w=0, target_h=0):
    """Simulate JPEG compression by encoding and decoding at a specific target resolution"""
    h, w = image_ndarray.shape[:2]
    
    # If target resolution is provided and significantly larger, simulate at that resolution
    # to make the 8x8 blocks appear at the correct relative size.
    use_res_sim = target_w > 0 and target_h > 0 and (target_w > w or target_h > h)
    
    if use_res_sim:
        # Upscale to target resolution using OpenCV for speed
        img_target = cv2.resize(image_ndarray, (target_w, target_h), interpolation=cv2.INTER_LINEAR)
        img = Image.fromarray(img_target)
    else:
        img = Image.fromarray(image_ndarray)
        
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=quality)
    buf.seek(0)
    img_decompressed = Image.open(buf)
    res_np = np.array(img_decompressed)
    
    if use_res_sim:
        # Downscale back to proxy size using INTER_AREA for high-quality reduction
        return cv2.resize(res_np, (w, h), interpolation=cv2.INTER_AREA)
    
    return res_np

def rle_encode(data):
    """Simple RLE encoding on bytes"""
    if len(data) == 0: return b""
    encoded = []
    prev_byte = data[0]
    count = 1
    for i in range(1, len(data)):
        if data[i] == prev_byte and count < 255:
            count += 1
        else:
            encoded.append(count)
            encoded.append(prev_byte)
            prev_byte = data[i]
            count = 1
    encoded.append(count)
    encoded.append(prev_byte)
    return bytes(encoded)

def rle_decode(data):
    """Simple RLE decoding"""
    decoded = []
    for i in range(0, len(data), 2):
        count = data[i]
        byte = data[i+1]
        decoded.extend([byte] * count)
    return bytes(decoded)

def encode_image(image_ndarray, method="huffman", params=None):
    """
    Encode image using various methods.
    Returns (decompressed_image, original_size, compressed_size, ratio)
    """
    orig_shape = image_ndarray.shape
    raw_bytes = image_ndarray.tobytes()
    orig_size = len(raw_bytes)
    
    decompressed_bytes = raw_bytes
    comp_size = orig_size
    
    if method == "rle":
        comp_bytes = rle_encode(raw_bytes)
        comp_size = len(comp_bytes)
        decompressed_bytes = rle_decode(comp_bytes)
    
    elif method == "huffman":
        codec = HuffmanCodec.from_data(raw_bytes)
        comp_bytes = codec.encode(raw_bytes)
        comp_size = len(comp_bytes)
        decompressed_bytes = codec.decode(comp_bytes)
        
    elif method == "lzw":
        import imagecodecs
        comp_bytes = imagecodecs.lzw_encode(raw_bytes)
        comp_size = len(comp_bytes)
        decompressed_bytes = imagecodecs.lzw_decode(comp_bytes)
        
    elif method == "arithmetic":
        import imagecodecs
        # JPEG 2000 uses arithmetic coding (MQ-coder)
        comp_bytes = imagecodecs.jpeg2k_encode(image_ndarray)
        comp_size = len(comp_bytes)
        decompressed_bytes = imagecodecs.jpeg2k_decode(comp_bytes).tobytes()
        
    elif method == "quantization":
        bits = params.get('bits', 4) if params else 4
        levels = 2**bits
        step = 256 // levels
        # Quantize: q = (pixel // step) * step
        quantized = (image_ndarray // step) * step
        image_ndarray = quantized.astype(np.uint8)
        decompressed_bytes = image_ndarray.tobytes()
        # Size doesn't change for raw bytes, but information entropy does.
        # Simulation: pretend it's packed.
        comp_size = int(orig_size * (bits / 8.0))
        comp_bytes = decompressed_bytes # For quantization, the "raw" export is just the quantized pixels
        
    result_img = np.frombuffer(decompressed_bytes, dtype=np.uint8).reshape(orig_shape)
    ratio = orig_size / comp_size if comp_size > 0 else 1
    
    return result_img, orig_size, comp_size, ratio, comp_bytes
