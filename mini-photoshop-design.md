# Mini Photoshop — High Performance Design Document

> **Generated via performance-focused brainstorming session**
> **Optimization Strategy:** Binary Streaming + FastAPI Concurrency + Proxy Rendering
> **Stack:** FastAPI (Python) + React

---

## 1. Project Overview

A high-performance local web-based image processing application. Built with an asynchronous **FastAPI** backend and a React frontend. Engineered for low-latency live previews using binary data streams and tiered resolution processing.

---

## 2. Understanding Summary

- **What:** Optimized image processing web app running on localhost.
- **Goal:** Real-time responsiveness for 16MP images on standard hardware.
- **Constraints:**
  - Backend must be Python.
  - 5-week timeline.
  - Local execution only.
- **Key Performance Pillars:**
  - **Binary-First:** Eliminate Base64 overhead (~33% bandwidth/CPU saving).
  - **Async Concurrency:** FastAPI handles requests without blocking the event loop.
  - **Proxy Rendering:** Live sliders process low-res "proxy" images (~1024px); high-res applied only on "Apply" or "Save".
  - **OpenCV Kernels:** Prefer `cv2` (C++) over Pillow (Python) for heavy math.

---

## 3. Feature Specifications (Core Stay Same, Implementation Changes)

### Tiered Processing Model
- **Live Preview Mode**: Triggered during slider interaction. Frontend sends downscaled proxy image. Backend returns optimized WEBP/JPEG. Result: **<50ms latency**.
- **Full Resolution Mode**: Triggered on "Apply" or "Download". Backend processes original 16MP buffer. Result: **High fidelity**.

---

## 4. Tech Stack

| Layer | Technology |
|---|---|
| Backend language | Python 3.11+ |
| Backend framework | **FastAPI** (Uvicorn) |
| Image processing | **OpenCV (Primary)**, NumPy, Pillow (fallback), scikit-image |
| ML / Object detection | YOLOv8 (nano) via Ultralytics |
| Frontend framework | React (via Vite) |
| State management | Zustand |
| Binary handling | `FormData` (Upload), `Blob` / `URL.createObjectURL` (Display) |

---

## 5. System Architecture (Binary Stream)

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER                          │
│                                                     │
│   ┌─────────────────────────────────────────────┐   │
│   │         React SPA (Vite + Tailwind)         │   │
│   │                                             │   │
│   │  [ Proxy Scaler ] ───▶ [ FormData ] ──────┐ │   │
│   │                                           │ │   │
│   └───────────────────────────────────────────┼─┘   │
└───────────────────────────────────────────────│─────┘
                         │ Binary Stream (Multipart)
┌────────────────────────▼──────────────────────│─────┐
│               FastAPI (Uvicorn)               │     │
│                                               │     │
│   ┌──────────────┐ ┌──────────────┐ ┌─────────▼─┐   │
│   │ Async Router │ │ Thread Pool  │ │ cv2 logic │   │
│   └──────────────┘ └──────────────┘ └───────────┘   │
└─────────────────────────────────────────────────────┘
```

**Workflow:**
1. **Load**: Frontend loads file → creates `fullResBlob` + `proxyBlob` (1024px).
2. **Interact**: Slider move → send `proxyBlob` as binary → FastAPI returns binary result.
3. **Display**: `URL.createObjectURL(responseBlob)` updates Canvas instantly.
4. **Commit**: Click "Apply" → send `fullResBlob` → update permanent state.

---

## 6. Backend Structure (FastAPI)

```
backend/
├── main.py                 # FastAPI entry, lifespan handlers, global CORS
├── dependencies.py         # Auth/Common dependencies
│
├── routers/                # FastAPI APIRouter — one per feature group
│   ├── enhancement.py      # @router.post("/brightness")
│   ├── transform.py
│   └── ...
│
├── processing/             # Pure math/OpenCV logic (framework agnostic)
│   ├── engine.py           # Common cv2 wrapper functions
│   └── ...
│
└── utils/
    ├── buffer_utils.py     # Fast conversion: Bytes ↔ NumPy (cv2.imdecode)
    └── scaling.py          # Server-side downscaling for histogram/previews
```

### Fast Image Decoding (cv2)
```python
# utils/buffer_utils.py
def bytes_to_numpy(file_bytes):
    nparr = np.frombuffer(file_bytes, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)

def numpy_to_webp_stream(image_np):
    success, buffer = cv2.imencode(".webp", image_np, [cv2.IMWRITE_WEBP_QUALITY, 80])
    return BytesIO(buffer)
```

---

## 7. API Contract (Binary Standard)

**Method:** `POST` | **Content-Type:** `multipart/form-data`

### Example: Enhancement
`POST /api/enhance/brightness`

**Request Payload:**
- `file`: (Binary Image Data)
- `brightness`: (Float)
- `contrast`: (Float)

**Response:**
- `Content-Type: application/octet-stream` (Raw binary image bytes)
- Header `X-Image-Width`: 1024

---

## 8. Interaction Model: Proxy + Abort

1. **JS `AbortController`**: Every slider change calls `controller.abort()` on the previous request. FastAPI stops processing immediately.
2. **Debounce**: 150ms delay for network requests; UI slider remains 60fps local.
3. **Memory Management**: Always call `URL.revokeObjectURL()` before creating a new one to prevent browser memory leaks.

---

## 9. Decision Log (Updated)

| # | Decision | Rationale |
|---|---|---|
| 16 | **FastAPI over Flask** | Native support for async/await and streaming; significantly better concurrency for IO-bound image uploads. |
| 17 | **Binary over Base64** | Removes 33% data bloat and expensive string encoding/decoding on both ends. |
| 18 | **Tiered Rendering** | Crucial for "Photoshop-feel". Processing 1024px is ~16x faster than 4096px. |
| 19 | **OpenCV Priority** | OpenCV uses optimized C++ kernels; PIL is slower for large-scale convolutions and spatial filters. |
| 20 | **WEBP for Preview** | Returns smaller payloads than PNG while preserving alpha, speeding up UI refresh. |

---
