import asyncio
import cv2
import numpy as np
from fastapi import APIRouter, Request, Header
from fastapi.responses import Response
from backend.processing.restore import (
    gaussian_blur, 
    median_filter, 
    denoise_image
)

router = APIRouter()

async def get_image_from_body(request: Request) -> np.ndarray:
    body = await request.body()
    nparr = np.frombuffer(body, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)

def ndarray_to_jpeg_bytes(img: np.ndarray) -> bytes:
    _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return buffer.tobytes()

@router.post("/gaussian")
async def gaussian(
    request: Request,
    x_minips_percent: int = Header(50, alias="X-MiniPS-Percent")
):
    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        request.app.state.executor,
        gaussian_blur,
        img, x_minips_percent
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")

@router.post("/median")
async def median(
    request: Request,
    x_minips_percent: int = Header(50, alias="X-MiniPS-Percent")
):
    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        request.app.state.executor,
        median_filter,
        img, x_minips_percent
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")

@router.post("/denoise")
async def denoise(
    request: Request,
    x_minips_method: str = Header("salt_pepper", alias="X-MiniPS-Method"),
    x_minips_percent: int = Header(50, alias="X-MiniPS-Percent")
):
    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        request.app.state.executor,
        denoise_image,
        img, x_minips_method, x_minips_percent
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")
