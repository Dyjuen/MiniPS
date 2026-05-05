import asyncio
from concurrent.futures import ProcessPoolExecutor
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import Config

# Future routers
# from backend.routes.enhancement import router as enhancement_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Process Pool for CPU-bound math
    app.state.executor = ProcessPoolExecutor()
    yield
    # Shutdown: Clean up pool
    app.state.executor.shutdown()

def create_app():
    app = FastAPI(
        title="MiniPS API",
        description="Ultra-performance image processing",
        lifespan=lifespan
    )
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=Config.CORS_ORIGINS if hasattr(Config, 'CORS_ORIGINS') else ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "message": "MiniPS FastAPI is running"}

    # Register Routers (Migration in progress)
    from backend.routes.enhancement import router as enhancement_router
    from backend.routes.transform import router as transform_router
    from backend.routes.binary_edge import router as binary_router
    from backend.routes.color import router as color_router
    from backend.routes.restoration import router as restoration_router
    from backend.routes.compression import router as compression_router
    from backend.routes.histogram import router as histogram_router
    from backend.routes.segmentation import router as segmentation_router
    app.include_router(enhancement_router, prefix="/api/enhance")
    app.include_router(transform_router, prefix="/api/transform")
    app.include_router(binary_router, prefix="/api/binary")
    app.include_router(color_router, prefix="/api/color")
    app.include_router(restoration_router, prefix="/api/restore")
    app.include_router(compression_router, prefix="/api/compress")
    app.include_router(histogram_router, prefix="/api/histogram")
    app.include_router(segmentation_router, prefix="/api/segment")
    
    return app

app = create_app()

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("backend.app:app", host='0.0.0.0', port=5000, reload=True)
