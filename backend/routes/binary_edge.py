import asyncio
import cv2
import numpy as np
import base64
from fastapi import APIRouter, Request, Header
from fastapi.responses import Response, JSONResponse
from backend.processing.binary_edge import apply_threshold, detect_edges, apply_morphology

router = APIRouter()

async def get_image_from_body(request: Request) -> np.ndarray:
    body = await request.body()
    nparr = np.frombuffer(body, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)

def ndarray_to_jpeg_bytes(img: np.ndarray) -> bytes:
    _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return buffer.tobytes()

def ndarray_to_base64(img: np.ndarray) -> str:
    _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return base64.b64encode(buffer).decode('utf-8')

@router.post("/threshold")
async def threshold(
    request: Request,
    x_minips_value: int = Header(127, alias="X-MiniPS-Threshold-Value"),
    x_minips_method: str = Header("binary", alias="X-MiniPS-Threshold-Method"),
    x_minips_auto: bool = Header(False, alias="X-MiniPS-Auto")
):
    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    
    if x_minips_auto:
        result, params = await loop.run_in_executor(
            request.app.state.executor,
            apply_threshold,
            img, x_minips_value, x_minips_method, True
        )
        return JSONResponse({
            "image": ndarray_to_base64(result),
            "params": params
        })

    result = await loop.run_in_executor(
        request.app.state.executor,
        apply_threshold,
        img, x_minips_value, x_minips_method
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")

@router.post("/edge")
async def edge(
    request: Request,
    x_minips_method: str = Header("canny", alias="X-MiniPS-Edge-Method"),
    x_minips_low: int = Header(100, alias="X-MiniPS-Edge-Low"),
    x_minips_high: int = Header(200, alias="X-MiniPS-Edge-High"),
    x_minips_ksize: int = Header(3, alias="X-MiniPS-Edge-Ksize"),
    x_minips_sigma: float = Header(1.0, alias="X-MiniPS-Edge-Sigma"),
    x_minips_auto: bool = Header(False, alias="X-MiniPS-Auto")
):
    img = await get_image_from_body(request)
    scale = img.shape[1] / 1024.0
    
    loop = asyncio.get_event_loop()
    
    if x_minips_auto:
        result, params = await loop.run_in_executor(
            request.app.state.executor,
            detect_edges,
            img, x_minips_method, scale, x_minips_low, x_minips_high, x_minips_ksize, x_minips_sigma, True
        )
        return JSONResponse({
            "image": ndarray_to_base64(result),
            "params": params
        })

    result = await loop.run_in_executor(
        request.app.state.executor,
        detect_edges,
        img, x_minips_method, scale, x_minips_low, x_minips_high, x_minips_ksize, x_minips_sigma, False
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")

@router.post("/morphology")
async def morphology(
    request: Request,
    x_minips_operation: str = Header("erosion", alias="X-MiniPS-Morph-Op"),
    x_minips_kernel: int = Header(3, alias="X-MiniPS-Morph-Kernel")
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
        apply_morphology,
        img, x_minips_operation, k
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")
