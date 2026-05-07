import asyncio
import cv2
import numpy as np
from fastapi import APIRouter, Request, Header, Response
from fastapi.responses import JSONResponse
from PIL import Image
import io
from backend.processing.compress import compress_jpeg_sim, encode_image

router = APIRouter()

def ndarray_to_jpeg_bytes(img: np.ndarray, quality: int = 85) -> bytes:
    _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, quality])
    return buffer.tobytes()

def ndarray_to_png_bytes(img: np.ndarray) -> bytes:
    _, buffer = cv2.imencode('.png', img)
    return buffer.tobytes()

async def get_image_from_body(request: Request) -> np.ndarray:
    body = await request.body()
    nparr = np.frombuffer(body, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)

def ndarray_to_tiff_bytes(img: np.ndarray, method: str = "none") -> bytes:
    # Convert BGR (OpenCV) to RGB (PIL)
    if len(img.shape) == 3 and img.shape[2] == 3:
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    else:
        img_rgb = img
        
    pil_img = Image.fromarray(img_rgb)
    buf = io.BytesIO()
    # Map method to TIFF compression
    comp = None
    if method == "lzw": comp = "tiff_lzw"
    elif method == "rle": comp = "packbits"
    
    pil_img.save(buf, format="TIFF", compression=comp)
    return buf.getvalue()

def ndarray_to_bmp_bytes(img: np.ndarray, method: str = "none") -> bytes:
    # Convert BGR to RGB
    if len(img.shape) == 3 and img.shape[2] == 3:
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    else:
        img_rgb = img
        
    pil_img = Image.fromarray(img_rgb)
    buf = io.BytesIO()
    pil_img.save(buf, format="BMP")
    return buf.getvalue()

def ndarray_to_gif_bytes(img: np.ndarray) -> bytes:
    # Convert BGR to RGB
    if len(img.shape) == 3 and img.shape[2] == 3:
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    else:
        img_rgb = img
        
    pil_img = Image.fromarray(img_rgb)
    if pil_img.mode != 'P':
        pil_img = pil_img.convert('P', palette=Image.ADAPTIVE)
    buf = io.BytesIO()
    pil_img.save(buf, format="GIF")
    return buf.getvalue()

@router.post("/jpeg")
async def jpeg_sim(
    request: Request,
    x_minips_quality: int = Header(85, alias="X-MiniPS-Quality"),
    x_minips_target_w: int = Header(0, alias="X-MiniPS-Target-W"),
    x_minips_target_h: int = Header(0, alias="X-MiniPS-Target-H")
):
    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        request.app.state.executor,
        compress_jpeg_sim,
        img, x_minips_quality, x_minips_target_w, x_minips_target_h
    )
    return Response(content=ndarray_to_jpeg_bytes(result, x_minips_quality), media_type="image/jpeg")

@router.post("/encode")
async def encode(
    request: Request,
    x_minips_method: str = Header("huffman", alias="X-MiniPS-Method"),
    x_minips_format: str = Header("jpeg", alias="X-MiniPS-Format"),
    x_minips_bits: int = Header(4, alias="X-MiniPS-Bits"),
    x_minips_quality: int = Header(85, alias="X-MiniPS-Quality")
):
    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    
    # encode_image returns (img, o_size, c_size, ratio, comp_bytes)
    res_img, o_size, c_size, ratio, comp_bytes = await loop.run_in_executor(
        request.app.state.executor,
        encode_image,
        img, x_minips_method, {"bits": x_minips_bits}
    )
    
    fmt = x_minips_format.lower()
    if fmt == "raw":
        content = comp_bytes
        media_type = "application/octet-stream"
    elif fmt == "png":
        content = ndarray_to_png_bytes(res_img)
        media_type = "image/png"
    elif fmt == "tiff":
        content = ndarray_to_tiff_bytes(res_img, x_minips_method)
        media_type = "image/tiff"
    elif fmt == "gif":
        content = ndarray_to_gif_bytes(res_img)
        media_type = "image/gif"
    elif fmt == "bmp":
        content = ndarray_to_bmp_bytes(res_img, x_minips_method)
        media_type = "image/bmp"
    else:
        content = ndarray_to_jpeg_bytes(res_img, x_minips_quality)
        media_type = "image/jpeg"
        
    return Response(
        content=content, 
        media_type=media_type,
        headers={
            "X-MiniPS-Ratio": str(ratio),
            "X-MiniPS-Compressed-Size": str(c_size)
        }
    )
