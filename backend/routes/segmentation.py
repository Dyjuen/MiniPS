import asyncio
import cv2
import numpy as np
import base64
import json
from fastapi import APIRouter, Request, Header, Response
from fastapi.responses import JSONResponse
from backend.processing.segment import (
    segment_by_threshold, 
    segment_by_edge, 
    segment_by_region
)

router = APIRouter()

async def get_image_from_body(request: Request) -> np.ndarray:
    # This might be tricky if body is mixed. 
    # But usually we send raw image. 
    # If we need seeds, maybe they are in headers or we use multipart.
    # Let's stick to headers for simple values, but seeds as JSON string in header?
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
    x_minips_auto: bool = Header(False, alias="X-MiniPS-Auto")
):
    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    
    if x_minips_auto:
        result, params = await loop.run_in_executor(
            request.app.state.executor,
            segment_by_threshold,
            img, x_minips_value, True
        )
        return JSONResponse({
            "image": ndarray_to_base64(result),
            "params": params
        })

    result = await loop.run_in_executor(
        request.app.state.executor,
        segment_by_threshold,
        img, x_minips_value, False
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")

@router.post("/edge")
async def edge(
    request: Request,
    x_minips_method: str = Header("canny", alias="X-MiniPS-Edge-Method"),
    x_minips_auto: bool = Header(False, alias="X-MiniPS-Auto")
):
    img = await get_image_from_body(request)
    scale = img.shape[1] / 1024.0
    loop = asyncio.get_event_loop()
    
    if x_minips_auto:
        result, params = await loop.run_in_executor(
            request.app.state.executor,
            segment_by_edge,
            img, x_minips_method, scale, True
        )
        return JSONResponse({
            "image": ndarray_to_base64(result),
            "params": params
        })

    result = await loop.run_in_executor(
        request.app.state.executor,
        segment_by_edge,
        img, x_minips_method, scale, False
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")

@router.post("/region")
async def region(
    request: Request,
    x_minips_seeds: str = Header(None, alias="X-MiniPS-Seeds"),
    x_minips_seed_x: int = Header(None, alias="X-MiniPS-Seed-X"),
    x_minips_seed_y: int = Header(None, alias="X-MiniPS-Seed-Y"),
    x_minips_tolerance: int = Header(10, alias="X-MiniPS-Tolerance"),
    x_minips_auto: bool = Header(False, alias="X-MiniPS-Auto")
):
    img = await get_image_from_body(request)
    
    seeds = []
    if x_minips_seeds:
        try:
            seeds = json.loads(x_minips_seeds)
        except:
            pass
    elif x_minips_seed_x is not None and x_minips_seed_y is not None:
        seeds = [[x_minips_seed_x, x_minips_seed_y]]

    loop = asyncio.get_event_loop()
    
    if x_minips_auto:
        result, params = await loop.run_in_executor(
            request.app.state.executor,
            segment_by_region,
            img, seeds, x_minips_tolerance, True
        )
        return JSONResponse({
            "image": ndarray_to_base64(result),
            "params": params
        })

    result = await loop.run_in_executor(
        request.app.state.executor,
        segment_by_region,
        img, seeds, x_minips_tolerance, False
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")
