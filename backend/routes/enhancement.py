import asyncio
import cv2
import numpy as np
from fastapi import APIRouter, Request, Response, Header
from fastapi.responses import Response
from backend.processing.enhance import (
    adjust_brightness_contrast, 
    histogram_equalization, 
    sharpen_image, 
    smooth_image
)

router = APIRouter()

async def get_image_from_body(request: Request) -> np.ndarray:
    body = await request.body()
    nparr = np.frombuffer(body, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)

def ndarray_to_jpeg_bytes(img: np.ndarray) -> bytes:
    _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return buffer.tobytes()

@router.post("/brightness")
async def brightness(
    request: Request,
    x_minips_brightness: int = Header(0, alias="X-MiniPS-Brightness"),
    x_minips_contrast: int = Header(0, alias="X-MiniPS-Contrast")
):
    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        request.app.state.executor, 
        adjust_brightness_contrast, 
        img, x_minips_brightness, x_minips_contrast
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")

@router.post("/histogram-eq")
async def histogram_eq(request: Request):
    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        request.app.state.executor,
        histogram_equalization,
        img
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")

@router.post("/sharpen")
async def sharpen(
    request: Request,
    x_minips_intensity: float = Header(1.0, alias="X-MiniPS-Intensity")
):
    img = await get_image_from_body(request)
    
    # NORMALIZATION: Scale sigma/radius by resolution
    # Reference: 1024px. If image is 4096px, scale is 4.0.
    scale = img.shape[1] / 1024.0
    
    loop = asyncio.get_event_loop()
    # Processing engine needs to support sigma/radius scaling
    result = await loop.run_in_executor(
        request.app.state.executor,
        sharpen_image,
        img, x_minips_intensity, scale
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")

@router.post("/smooth")
async def smooth(
    request: Request,
    x_minips_kernel: float = Header(3.0, alias="X-MiniPS-Kernel")
):
    img = await get_image_from_body(request)
    
    # NORMALIZATION: Scale kernel size
    scale = img.shape[1] / 1024.0
    k = int(x_minips_kernel * scale)
    if k % 2 == 0: k += 1
    if k < 1: k = 1
    
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        request.app.state.executor,
        smooth_image,
        img, k
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")
