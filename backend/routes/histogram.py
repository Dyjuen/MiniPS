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
    
    # get_histogram_chart returns base64 string currently.
    # We should probably change it to return raw bytes if we want full binary.
    # For now, keeping as is but offloading to process pool.
    chart_b64 = await loop.run_in_executor(
        request.app.state.executor,
        get_histogram_chart,
        img, x_minips_mode
    )
    
    # Histogram chart is a UI element (plot), keeping as base64 for easy <img> src injection 
    # or returning as PNG bytes.
    # Let's return as PNG bytes for consistency.
    import base64
    chart_bytes = base64.b64decode(chart_b64)
    return Response(content=chart_bytes, media_type="image/png")
