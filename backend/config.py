import os

class Config:
    # Max payload size: 32MB
    MAX_CONTENT_LENGTH = 32 * 1024 * 1024
    
    # Max image resolution: 4096 x 4096
    MAX_IMAGE_PIXELS = 16777216
    
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp'}
    
    # CORS Configuration
    CORS_ORIGINS = ["http://localhost:5173"]  # Vite default port
