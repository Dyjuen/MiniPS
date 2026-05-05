import asyncio
import cv2
import numpy as np
from fastapi import APIRouter, Request, Header
from fastapi.responses import Response
from backend.processing.binary_edge import apply_threshold, detect_edges, apply_morphology

router = APIRouter()

async def get_image_from_body(request: Request) -> np.ndarray:
    body = await request.body()
    nparr = np.frombuffer(body, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)

def ndarray_to_jpeg_bytes(img: np.ndarray) -> bytes:
    _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return buffer.tobytes()

@router.post("/threshold")
async def threshold(
    request: Request,
    x_minips_value: int = Header(127, alias="X-MiniPS-Threshold-Value"),
    x_minips_method: str = Header("binary", alias="X-MiniPS-Threshold-Method")
):
    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        request.app.state.executor,
        apply_threshold,
        img, x_minips_value, x_minips_method
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")

@router.post("/edge")
async def edge(
    request: Request,
    x_minips_method: str = Header("canny", alias="X-MiniPS-Edge-Method")
):
    img = await get_image_from_body(request)
    
    # NORMALIZATION for Canny
    scale = img.shape[1] / 1024.0
    
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        request.app.state.executor,
        detect_edges,
        img, x_minips_method, scale
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
