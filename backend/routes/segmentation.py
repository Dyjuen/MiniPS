import asyncio
import cv2
import numpy as np
from fastapi import APIRouter, Request, Header, Response
from backend.processing.segment import (
    segment_by_threshold, 
    segment_by_edge, 
    segment_by_region
)

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
    x_minips_value: int = Header(127, alias="X-MiniPS-Threshold-Value")
):
    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        request.app.state.executor,
        segment_by_threshold,
        img, x_minips_value
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")

@router.post("/edge")
async def edge(
    request: Request,
    x_minips_method: str = Header("canny", alias="X-MiniPS-Edge-Method")
):
    img = await get_image_from_body(request)
    
    # NORMALIZATION for segmentation edges
    scale = img.shape[1] / 1024.0
    
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        request.app.state.executor,
        segment_by_edge,
        img, x_minips_method, scale
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")

@router.post("/region")
async def region(
    request: Request,
    x_minips_seed_x: int = Header(..., alias="X-MiniPS-Seed-X"),
    x_minips_seed_y: int = Header(..., alias="X-MiniPS-Seed-Y"),
    x_minips_tolerance: int = Header(10, alias="X-MiniPS-Tolerance")
):
    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        request.app.state.executor,
        segment_by_region,
        img, x_minips_seed_x, x_minips_seed_y, x_minips_tolerance
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")
