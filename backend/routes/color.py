import asyncio
import cv2
import numpy as np
from fastapi import APIRouter, Request, Header
from fastapi.responses import Response
from backend.processing.color import to_grayscale, split_channels, adjust_color

router = APIRouter()

async def get_image_from_body(request: Request) -> np.ndarray:
    body = await request.body()
    nparr = np.frombuffer(body, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)

def ndarray_to_jpeg_bytes(img: np.ndarray) -> bytes:
    _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return buffer.tobytes()

@router.post("/grayscale")
async def grayscale(request: Request):
    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        request.app.state.executor,
        to_grayscale,
        img
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")

@router.post("/channel-split")
async def channel_split(
    request: Request,
    x_minips_channel: str = Header("R", alias="X-MiniPS-Channel")
):
    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        request.app.state.executor,
        split_channels,
        img, x_minips_channel
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")

@router.post("/adjust")
async def adjust(
    request: Request,
    x_minips_hue: int = Header(0, alias="X-MiniPS-Hue"),
    x_minips_saturation: int = Header(0, alias="X-MiniPS-Saturation")
):
    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        request.app.state.executor,
        adjust_color,
        img, x_minips_hue, x_minips_saturation
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")
