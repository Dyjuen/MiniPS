# Mini Photoshop — Ultra Performance Design (Revised)

> **Optimization Strategy:** Raw Binary Streams + Process Isolation + Flow Control
> **Stack:** FastAPI (Python) + React

---

## 1. Project Overview

Local high-performance image tool. Optimized for zero-latency slider feel on 16MP images via tiered rendering and raw byte transfer.

---

## 2. Core Constraints (Strict)

- **Timeline:** 5-week surgical delivery.
- **Modules:** Enhance, Transform, Binary/Edge, Color (ML Deferred).
- **Latency:** Sub-50ms round-trip interaction.

---

## 3. High-Performance Architecture

### Raw Binary Pipe
- **No Multipart:** `FormData` parsing is slow. Frontend sends raw `Blob` body.
- **Headers as Meta:** Parameters (`brightness`, `threshold`) sent via custom HTTP headers (`X-MiniPS-Val`).

### Server-Side Cancellation
- **Async Signal:** Backend checks `request.is_disconnected()` inside CPU-bound loops.
- **Process Isolation:** OpenCV math runs in `ProcessPoolExecutor` to bypass Python GIL.

### Tiered Rendering
- **Interact:** 1024px Proxy. Raw JPEG response (faster encoding than WEBP).
- **Commit:** Full-res process on "Apply".

---

## 4. Tech Stack

| Layer | Tech |
|---|---|
| Backend | FastAPI + Uvicorn + ProcessPoolExecutor |
| Processing | OpenCV (C++ Kernels) |
| Frontend | React + Zustand + OffscreenCanvas (Preview) |
| Transfer | Raw Binary (Octet-Stream) |

---

## 5. Interaction Model (Frontend)

1. **Locking:** Allow only 1 active request. If slider moves during request, queue *only* the latest position.
2. **Abort:** Cancel previous request immediately on move.
3. **UI indicator:** Show "Proxy Active" badge during interaction.

---

## 6. Decision Log

| # | Decision | Rationale | Resolution |
|---|---|---|---|
| 21 | **Raw Body over Multipart** | Removes boundary parsing overhead. | FIXED |
| 22 | **JPEG Previews** | Faster encoding/decoding than WEBP for rapid refresh. | FIXED |
| 23 | **ProcessPoolExecutor** | Ensures UI/IO stays responsive during heavy math. | FIXED |
| 24 | **Scope Freeze (4 Mods)** | Ensures 5-week delivery. | FIXED |
| 25 | **No Debounce** | Debounce is fake speed. Use one-in-flight lock for real speed. | FIXED |

---
