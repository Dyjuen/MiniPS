import asyncio
import cv2
import numpy as np
from fastapi import APIRouter, Request, Header, Response
from fastapi.responses import JSONResponse
from backend.processing.compress import compress_jpeg_sim, encode_image

router = APIRouter()

async def get_image_from_body(request: Request) -> np.ndarray:
    body = await request.body()
    nparr = np.frombuffer(body, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)

def ndarray_to_jpeg_bytes(img: np.ndarray) -> bytes:
    _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return buffer.tobytes()

@router.post("/jpeg")
async def jpeg_sim(
    request: Request,
    x_minips_quality: int = Header(85, alias="X-MiniPS-Quality")
):
    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        request.app.state.executor,
        compress_jpeg_sim,
        img, x_minips_quality
    )
    return Response(content=ndarray_to_jpeg_bytes(result), media_type="image/jpeg")

@router.post("/encode")
async def encode(
    request: Request,
    x_minips_method: str = Header("huffman", alias="X-MiniPS-Method")
):
    img = await get_image_from_body(request)
    loop = asyncio.get_event_loop()
    
    # encode_image returns (img, o_size, c_size, ratio)
    res_img, o_size, c_size, ratio = await loop.run_in_executor(
        request.app.state.executor,
        encode_image,
        img, x_minips_method, {}
    )
    
    # Encode returns both metadata and image. We use multipart or just return image bytes with headers.
    # For speed, return image bytes and ratio in headers.
    return Response(
        content=ndarray_to_jpeg_bytes(res_img), 
        media_type="image/jpeg",
        headers={
            "X-MiniPS-Ratio": str(ratio),
            "X-MiniPS-Compressed-Size": str(c_size)
        }
    )
