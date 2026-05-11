import asyncio
import cv2
import numpy as np
from fastapi import APIRouter, Request, Header, Response
from backend.processing.histogram import get_histogram_chart

router = APIRouter()

async def get_image_from_body(request: Request) -> np.ndarray:
    body = await request.body()
    nparr = np.frombuffer(body, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)

@router.post("/analyze")
async def analyze(
    request: Request,
    x_minips_mode: str = Header("grayscale", alias="X-MiniPS-Histogram-Mode")
):
    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    
    chart_b64 = await loop.run_in_executor(
        request.app.state.executor,
        get_histogram_chart,
        img, x_minips_mode
    )
    
    import base64
    chart_bytes = base64.b64decode(chart_b64)
    return Response(content=chart_bytes, media_type="image/png")

@router.post("/data")
async def data(request: Request):
    img = await get_image_from_body(request)
    from backend.processing.histogram import get_histogram_data
    loop = asyncio.get_event_loop()
    
    result = await loop.run_in_executor(
        request.app.state.executor,
        get_histogram_data,
        img
    )
    from fastapi.responses import JSONResponse
    return JSONResponse(content=result)
