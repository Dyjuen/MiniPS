import json
import asyncio
import cv2
import numpy as np
from fastapi import APIRouter, Request, Header
from fastapi.responses import Response
from backend.processing.transform import (
    rotate_image, flip_image, 
    resize_image, translate_image, affine_transform
)
from backend.processing.geometry import apply_affine_transform, apply_clamped_crop

router = APIRouter()

async def get_image_from_body(request: Request) -> np.ndarray:
    body = await request.body()
    nparr = np.frombuffer(body, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)

def ndarray_to_jpeg_bytes(img: np.ndarray) -> bytes:
    _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return buffer.tobytes()

@router.post("/rotate")
async def rotate(
    request: Request,
    x_minips_angle: float = Header(0.0, alias="X-MiniPS-Angle"),
    x_minips_interpolation: str = Header("bilinear", alias="X-MiniPS-Interpolation")
):
    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        request.app.state.executor,
        rotate_image,
        img, x_minips_angle, x_minips_interpolation
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")

@router.post("/flip")
async def flip(
    request: Request,
    x_minips_direction: str = Header("horizontal", alias="X-MiniPS-Direction")
):
    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        request.app.state.executor,
        flip_image,
        img, x_minips_direction
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")

@router.post("/geometry")
async def geometry_transform(
    request: Request,
    x_minips_val: str = Header(..., alias="X-MiniPS-Val")
):
    try:
        params = json.loads(x_minips_val)
    except Exception:
        return Response(content="Invalid JSON in X-MiniPS-Val", status_code=400)

    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        request.app.state.executor,
        apply_affine_transform,
        img, params
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")

@router.post("/crop")
async def crop(
    request: Request,
    x_minips_val: str = Header(..., alias="X-MiniPS-Val")
):
    try:
        params = json.loads(x_minips_val)
    except Exception:
        return Response(content="Invalid JSON in X-MiniPS-Val", status_code=400)
        
    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        request.app.state.executor,
        apply_clamped_crop,
        img, params['x'], params['y'], params['width'], params['height']
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")

@router.post("/resize")
async def resize(
    request: Request,
    x_minips_width: int = Header(..., alias="X-MiniPS-Width"),
    x_minips_height: int = Header(..., alias="X-MiniPS-Height"),
    x_minips_interpolation: str = Header("bilinear", alias="X-MiniPS-Interpolation")
):
    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        request.app.state.executor,
        resize_image,
        img, x_minips_width, x_minips_height, x_minips_interpolation
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")
