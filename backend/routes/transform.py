import asyncio
import cv2
import numpy as np
from fastapi import APIRouter, Request, Header
from fastapi.responses import Response
from backend.processing.transform import (
    rotate_image, flip_image, crop_image, 
    resize_image, translate_image, affine_transform
)

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

@router.post("/crop")
async def crop(
    request: Request,
    x_minips_x: int = Header(..., alias="X-MiniPS-X"),
    x_minips_y: int = Header(..., alias="X-MiniPS-Y"),
    x_minips_width: int = Header(..., alias="X-MiniPS-Width"),
    x_minips_height: int = Header(..., alias="X-MiniPS-Height")
):
    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        request.app.state.executor,
        crop_image,
        img, x_minips_x, x_minips_y, x_minips_width, x_minips_height
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
