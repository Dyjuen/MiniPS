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
| 26 | **Draggable Export Modal** | Use `react-draggable` to view live JPEG compression proxy behind popup. | PLANNED |
| 27 | **Custom Compression Logic** | Educational requirement: use Python implementations for Huffman, LZW, RLE, Quantization. Slow but accurate. | PLANNED |
| 28 | **UI Framework for Transform** | Custom DOM overlay over Canvas libs. Faster. | PLANNED |
| 29 | **CSS Preview for Transform** | CSS preview instant. Server preview laggy for rotation. | PLANNED |
| 30 | **Shift Key Behavior** | Locks crop box to 1:1 aspect ratio. | PLANNED |
| 31 | **Mode Separation** | Crop and Transform separate UI modes. Avoid conflict. | PLANNED |
| 32 | **Transform Order Sync** | OpenCV matrix multiplication order matches CSS right-to-left order exactly. | PLANNED |
| 33 | **Crop Bound Clamp** | Backend clamps crop coords to `0` and `max_width/height`. Prevents slice crash. | PLANNED |
| 34 | **State Reset** | Reset frontend CSS transform state after commit. Prevents double transform. | PLANNED |
| 35 | **Crop Coordinate Space** | Crop box maps to fixed canvas container, not transformed image bounds. | PLANNED |
| 36 | **Explicit Canvas Bounds** | `warpAffine` output size equals input size (clipping). Prevents OOM. | PLANNED |
| 37 | **Dimensions Cap** | Hard cap output to 8000x8000. Prevents massive RAM allocation. | PLANNED |
| 38 | **Lazy Server Apply** | Interaction uses CSS on Proxy only. Backend hit ONLY on "Commit". | PLANNED |
| 39 | **Visible Canvas Bounds** | UI explicitly highlights borders to indicate data clipping limits. | PLANNED |
| 40 | **Mode Distinctiveness** | Unique UI colors/cursors for Crop vs Transform modes. | PLANNED |
| 41 | **Client-side Cap Enforcement** | Frontend hard-stops drag scaling before 8000x8000 limit. | PLANNED |
| 42 | **Explicit Actions** | Add "Apply" and "Cancel" buttons to toolbar for Transform/Crop ops. | PLANNED |

---

## 7. Export & Compression System

### UI Component (Frontend)
- **Trigger:** "File" dropdown -> "Export".
- **Popup/Modal:** Movable via top-bar drag (`react-draggable`).
- **Fields:** 
  - File Name (text)
  - Format (Dropdown: PNG, JPEG)
  - Encoding/Method (Dropdown: Huffman, Arithmetic, LZW, RLE, Quantization)
- **Rules:** If `Quantization` selected, `PNG` format is disabled/forced to non-PNG.
- **JPEG Live Preview:** If `JPEG` format selected, show slider for quality. Connects to `previewOp` API to update main canvas live. 

### Processing (Backend)
- **Endpoint:** POST `/api/export`
- **Logic:** Runs custom encoding methods.
- **UX:** Frontend shows loading/progress bar while waiting.
- **Return:** Raw binary download prompt triggered in browser.

---

## 8. Geometric Transformation (Crop & Transform)

### UI Implementation
- Custom DOM overlay (React). Lighter than full Canvas library.
- **Visuals:** Explicit canvas boundary lines to show clipping region. Distinct colors/cursors for Crop vs Transform modes.
- **Controls:** Explicit "Apply" and "Cancel" buttons in the top toolbar to commit/discard changes.
- **Preview:** Instant client-side CSS `transform` (translate, rotate, scale) applied to image DOM element. Prevents lag.
- **Backend:** Python OpenCV affine transformation matrix.

### A. Crop Mode
- **Interaction:** Drag a square overlay with 4 corner handles. 
- **Aspect Ratio:** Hold `Shift` key while dragging to lock aspect ratio to 1:1 (square).
- **Execution:** Sends `[x, y, width, height]` to backend. Backend slices numpy array.
- **Safety:** Backend clamps coordinates to image bounds. Coordinates relative to fixed canvas container, not transformed image.

### B. Transform Mode
- **Interaction:** Bounding box with 4 corner handles and rotation knob. Boundary lines visible even if translated outside canvas.
- **Features:**
  - *Translate:* Drag image area.
  - *Resize:* Drag corners.
  - *Rotate:* Rotate knob (0°-360°). Pivot = center.
  - *Flip:* UI buttons (Horizontal/Vertical).
- **Preview:** Client-side CSS `transform` on Proxy image. **No server requests during drag/rotate.** Prevents interaction lag.
- **Execution:** Sends parameters to backend on "Apply".
- **Backend Tech:** Affine transformation matrix. Interpolation: Nearest/Bilinear. 
- **Safety (Photoshop Pattern):** 
  - **Clipping:** Output size locked to original image/canvas dimensions. Parts moved outside are discarded.
  - **Cap:** Hard limit resulting dimensions to 8000x8000. Frontend blocks dragging beyond this limit. Abort if exceeded on backend.
- **State:** Reset CSS state to 0 after backend apply.
