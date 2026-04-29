# Mini Photoshop — Project Design Document

> **Generated via structured brainstorming session**
> **Team size:** 2 people | **Timeline:** 5 weeks | **Stack:** Flask + React

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Understanding Summary](#2-understanding-summary)
3. [Feature Specifications](#3-feature-specifications)
4. [Tech Stack](#4-tech-stack)
5. [System Architecture](#5-system-architecture)
6. [Backend Structure](#6-backend-structure)
7. [Frontend Structure](#7-frontend-structure)
8. [API Contract](#8-api-contract)
9. [UI Design Specifications](#9-ui-design-specifications)
10. [Implementation Plan](#10-implementation-plan)
11. [Risk Register](#11-risk-register)
12. [Decision Log](#12-decision-log)

---

## 1. Project Overview

A local web-based image processing application inspired by Adobe Photoshop. Built with a Python Flask backend and a React frontend, featuring 11 feature areas covering image management, processing, transformation, segmentation, compression, and ML-based object detection.

---

## 2. Understanding Summary

- **What:** A mini Photoshop web app running entirely on localhost
- **Why:** Coursework assignment with personal challenge to build impressively
- **Who:** 2-person academic team; used by developer/evaluator locally
- **Constraints:**
  - 5-week timeline
  - One Python-focused person (backend), one JS/web-focused person (frontend)
  - Runs locally — no hosting or deployment
  - No library restrictions
  - Performance is not a priority, but images are capped at 4096 × 4096 (16MP)
  - Max request payload: 32MB (Flask `MAX_CONTENT_LENGTH`)
  - Runs in standard web browser (Chrome/Firefox)
- **Non-goals:**
  - No multi-user support
  - No cloud storage or remote hosting
  - No mobile responsiveness
  - Not a production-grade tool

### Assumptions
- Backend is a Python REST API (Flask)
- Frontend is a React SPA communicating via HTTP
- Images are processed server-side and returned as base64
- No database needed — stateless processing per request
- "Photoshop look" means dark theme, panel-based layout, toolbar, sliders
- Flask config enforces `MAX_CONTENT_LENGTH = 32MB` and `MAX_IMAGE_PIXELS = 16,777,216`
- Images exceeding max resolution are downscaled client-side before sending to API

---

## 3. Feature Specifications

### Feature 1 — Image Management
- Load image (JPG, PNG, BMP) — **client-side** via `FileReader` → base64 → Zustand store
- Save image — **client-side** download via `<a download>` from `currentImage` base64
- Format conversion (e.g. PNG → JPEG) — **server-side** via `/api/image/convert`
- Reset to original image
- Before–after preview panel

### Feature 2 — Image Enhancement
- Brightness & Contrast Adjustment (slider)
- Histogram Equalization
- Sharpening
- Smoothing (blur)

### Feature 3 — Geometric Transformation
- Rotate (0°–360°)
- Flip (horizontal/vertical)
- Crop (drag area)
- Resize (scaling)
- Translation (shift position)
- Affine matrix transformation
- Interpolation: nearest / bilinear

### Feature 4 — Image Restoration (Noise Reduction)
- Gaussian Blur
- Median Filter
- Noise removal (salt & pepper)
- Spatial filtering / kernel convolution

### Feature 5 — Binary & Edge Processing
- Thresholding (binary image)
- Edge Detection: Canny, Sobel, Prewitt, Roberts, Laplacian, Laplacian of Gaussian
- Morphology: Erosion, Dilation
- Binary pixel operations / structuring element kernel

### Feature 6 — Color Processing
- RGB → Grayscale
- Channel splitting (R, G, B)
- Color adjustment (hue/saturation)
- Color space transformation / channel array manipulation

### Feature 7 — Image Segmentation
- Threshold-based segmentation
- Edge-based segmentation
- Region-based (simple)
- Clustering / masking / region extraction

### Feature 8 — Image Compression
- Save with different quality levels (low–high)
- JPEG compression simulation
- Methods (all required):
  - **RLE** — custom implementation on raw pixel bytes
  - **Quantization** — color depth reduction via NumPy integer division
  - **Huffman** — via `dahuffman` library on flattened pixel stream
  - **LZW** — via Pillow (GIF/TIFF export) or `imagecodecs.lzw_encode()`
  - **Arithmetic** — via `imagecodecs` arithmetic coder or custom range-coder
- Display: original size, compressed size, compression ratio, decompressed preview

### Feature 9 — Histogram Analysis
- Display grayscale histogram
- Before–after histogram comparison
- Pixel intensity distribution
- matplotlib visualization

### Feature 10 — User Interface (GUI)
- Menu toolbar (File, Edit, Filter, Transform)
- Before vs after preview panel
- Sliders for parameters
- Quick action buttons

### Feature 11 — Object Recognition with ML (CNN) *(Bonus)*
- CNN-based object recognition
- Choose one object category (e.g. human / animal / other)
- Bounding box visualization
- Confidence score display

---

## 4. Tech Stack

| Layer | Technology |
|---|---|
| Backend language | Python 3.11+ |
| Backend framework | Flask |
| Image processing | OpenCV, Pillow, NumPy, scikit-image, dahuffman, imagecodecs |
| Visualization | matplotlib |
| ML / Object detection | YOLOv8 (nano) or MobileNet via TensorFlow/PyTorch |
| CORS handling | flask-cors |
| Frontend framework | React (via Vite) |
| Frontend styling | Tailwind CSS |
| State management | Zustand |
| UI components | lucide-react, rc-slider, react-split-pane, react-dropzone, react-image-crop |
| Dev proxy | Vite proxy → Flask localhost:5000 |

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER                          │
│                                                     │
│   ┌─────────────────────────────────────────────┐   │
│   │         React SPA (Vite + Tailwind)         │   │
│   │                                             │   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│   │  │ Toolbar  │  │ Canvas   │  │  Panels  │  │   │
│   │  │ (Menu)   │  │ (Before/ │  │ (Sliders │  │   │
│   │  │          │  │  After)  │  │  /Params)│  │   │
│   │  └──────────┘  └──────────┘  └──────────┘  │   │
│   └────────────────────┬────────────────────────┘   │
└────────────────────────│────────────────────────────┘
                         │ HTTP REST (JSON + base64)
┌────────────────────────▼────────────────────────────┐
│                  Python Flask API                   │
│                                                     │
│   ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│   │/enhance  │ │/transform│ │ /segment /color  │   │
│   │/restore  │ │/binary   │ │ /compress /hist  │   │
│   └────┬─────┘ └────┬─────┘ └────────┬─────────┘   │
│        └────────────▼────────────────┘              │
│   ┌─────────────────────────────────────────────┐   │
│   │     Processing Modules (NumPy, OpenCV,      │   │
│   │      Pillow, scikit-image, matplotlib)      │   │
│   └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Key principles:**
- Flask on `localhost:5000`, React dev server on `localhost:5173`
- All image processing happens exclusively on the backend
- Images passed as base64 encoded strings in JSON payloads
- Each feature group maps to its own Flask Blueprint and Python module
- Frontend state holds `originalImage` and `currentImage` separately

---

## 6. Backend Structure

```
backend/
├── app.py                  # Flask app entry point, registers blueprints, loads ML model at startup, configures flask-cors for localhost origins
├── config.py               # MAX_CONTENT_LENGTH=32MB, MAX_IMAGE_PIXELS=4096×4096, ALLOWED_FORMATS, CORS origins
├── requirements.txt        # Includes flask-cors, dahuffman, imagecodecs
│
├── routes/                 # Flask Blueprints — one per feature group
│   ├── image_mgmt.py
│   ├── enhancement.py
│   ├── transform.py
│   ├── restoration.py
│   ├── binary_edge.py
│   ├── color.py
│   ├── segmentation.py
│   ├── compression.py
│   ├── histogram.py
│   └── ml.py
│
├── processing/             # Pure image processing logic — no Flask here
│   ├── enhance.py
│   ├── transform.py
│   ├── restore.py
│   ├── binary_edge.py
│   ├── color.py
│   ├── segment.py
│   ├── compress.py
│   ├── histogram.py
│   └── ml/
│       ├── __init__.py
│       ├── detector.py     # Model loading & inference logic
│       └── models/         # Model weights (.pt, .h5, .tflite)
│           └── .gitkeep
│
└── utils/
    ├── image_utils.py      # base64 ↔ numpy/PIL conversions
    └── validators.py       # Enum validation for all string params (method, operation, direction, channel); returns 400 with descriptive error for invalid values
```

### Standard Request/Response Pattern

```json
// Every request
{ "image": "<base64>", "params": { "...feature specific..." } }

// Every success response
{ "success": true, "image": "<base64>", "metadata": { "width": 800, "height": 600 } }

// Every error response
{ "success": false, "error": "descriptive message" }

// ML detection response (extended)
{
  "success": true,
  "image": "<base64 with bounding boxes>",
  "detections": [
    { "label": "person", "confidence": 0.94, "bbox": [x, y, w, h] }
  ]
}
```

---

## 7. Frontend Structure

```
frontend/
├── index.html
├── vite.config.js          # Proxy /api → localhost:5000
├── tailwind.config.js
├── package.json
│
├── public/
│   └── icons/
│
└── src/
    ├── main.jsx
    ├── App.jsx
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Titlebar.jsx
    │   │   ├── Menubar.jsx
    │   │   ├── Toolbar.jsx
    │   │   ├── CanvasPanel.jsx
    │   │   ├── RightPanel.jsx
    │   │   └── BottomBar.jsx
    │   │
    │   ├── tools/
    │   │   ├── EnhancementTools.jsx
    │   │   ├── TransformTools.jsx
    │   │   ├── RestorationTools.jsx
    │   │   ├── BinaryEdgeTools.jsx
    │   │   ├── ColorTools.jsx
    │   │   ├── SegmentationTools.jsx
    │   │   ├── CompressionTools.jsx
    │   │   ├── HistogramTools.jsx
    │   │   └── MLTools.jsx
    │   │
    │   └── ui/
    │       ├── Slider.jsx
    │       ├── Button.jsx
    │       ├── Dropdown.jsx
    │       ├── Toggle.jsx
    │       ├── Modal.jsx
    │       └── HistogramChart.jsx
    │
    ├── hooks/
    │   ├── useImage.js
    │   ├── useApi.js
    │   ├── useHistory.js
    │   └── useDebounce.js       # 300ms debounce for live preview API calls
    │
    ├── api/
    │   └── endpoints.js
    │
    ├── store/
    │   └── imageStore.js
    │
    └── styles/
        ├── globals.css
        └── photoshop.css
```

### Vite Proxy Config

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
}
```

### Zustand Store Shape

```javascript
// store/imageStore.js
{
  originalImage: null,   // never mutated — preserved for reset
  currentImage: null,    // latest processed result
  activeTool: null,      // controls which right panel renders
  history: [],           // max 10 entries; oldest dropped when exceeded
  historyIndex: -1,      // current position for undo/redo navigation
  // Undo: decrement historyIndex, restore that entry as currentImage
  // Redo: increment historyIndex, restore that entry as currentImage
  // New action: truncate history after historyIndex, push new entry, drop oldest if >10
}
```

**Memory estimate:** ~10MB per history entry (base64 of 4096×4096 image) × 10 = ~100MB max.
Consider using `Blob` + `URL.createObjectURL()` for more efficient storage if memory becomes an issue.

### endpoints.js Pattern

```javascript
// Slider-based tools: called via useDebounce, with AbortController
export const applyBrightness = (image, params, signal) =>
  apiPost('/api/enhance/brightness', { image, params }, { signal })

// Button-triggered tools: called on click
export const detectObjects = (image) =>
  apiPost('/api/ml/detect', { image })
```

---

## 8. API Contract

**Base URL:** `http://localhost:5000/api` | **Method:** `POST` (all processing endpoints)

### Image Management
| Endpoint | Params |
|---|---|
| `POST /api/image/convert` | `{ image, format: "jpeg"/"png"/"bmp", quality: 1..100 }` — returns converted image |
| Image load | **Client-side only** — `FileReader` → base64 → Zustand. No backend endpoint. |
| Image save | **Client-side only** — `<a download>` from currentImage. No backend endpoint. |
| Image reset | **Client-side only** — restore `originalImage` from Zustand store. |

### Enhancement
| Endpoint | Params |
|---|---|
| `POST /api/enhance/brightness` | `{ brightness: -100..100, contrast: -100..100 }` |
| `POST /api/enhance/histogram-eq` | none |
| `POST /api/enhance/sharpen` | `{ intensity: 1..5 }` |
| `POST /api/enhance/smooth` | `{ kernel_size: 3..15 }` |

### Geometric Transform
| Endpoint | Params |
|---|---|
| `POST /api/transform/rotate` | `{ angle: 0..360, interpolation: "nearest"/"bilinear" }` |
| `POST /api/transform/flip` | `{ direction: "horizontal"/"vertical" }` |
| `POST /api/transform/affine` | `{ matrix: [[a,b,c],[d,e,f]], interpolation: "nearest"/"bilinear" }` |
| `POST /api/transform/crop` | `{ x, y, width, height }` |
| `POST /api/transform/resize` | `{ width, height, interpolation: "nearest"/"bilinear" }` |
| `POST /api/transform/translate` | `{ tx, ty }` |

### Restoration
| Endpoint | Params |
|---|---|
| `POST /api/restore/gaussian` | `{ kernel_size: 3..15, sigma: 0.1..5.0 }` |
| `POST /api/restore/median` | `{ kernel_size: 3..15 }` |
| `POST /api/restore/denoise` | `{ method: "salt_pepper", intensity: 0.1..1.0 }` |

### Binary & Edge
| Endpoint | Params |
|---|---|
| `POST /api/binary/threshold` | `{ value: 0..255, method: "binary"/"otsu" }` |
| `POST /api/binary/edge` | `{ method: "canny"/"sobel"/"prewitt"/"roberts"/"laplacian"/"log" }` |
| `POST /api/binary/morphology` | `{ operation: "erosion"/"dilation", kernel_size: 3..15 }` |

### Color
| Endpoint | Params |
|---|---|
| `POST /api/color/grayscale` | none |
| `POST /api/color/channel-split` | `{ channel: "R"/"G"/"B" }` |
| `POST /api/color/adjust` | `{ hue: -180..180, saturation: -100..100 }` |

### Segmentation
| Endpoint | Params |
|---|---|
| `POST /api/segment/threshold` | `{ value: 0..255 }` |
| `POST /api/segment/edge` | `{ method: "canny"/"sobel" }` |
| `POST /api/segment/region` | `{ seed_x, seed_y, tolerance: 0..100 }` |

### Compression
| Endpoint | Params |
|---|---|
| `POST /api/compress/jpeg` | `{ quality: 1..100 }` |
| `POST /api/compress/encode` | `{ method: "huffman"/"rle"/"lzw"/"arithmetic"/"quantization" }` — returns `{ image, original_size, compressed_size, ratio, decompressed_image }` |

### Histogram
| Endpoint | Params |
|---|---|
| `POST /api/histogram/analyze` | `{ mode: "grayscale"/"rgb" }` — returns chart as base64 |

> **Note:** `/api/histogram/compare` is removed. Instead, call `/api/histogram/analyze` twice (once for original, once for current) and render the comparison chart client-side in `HistogramChart.jsx`.

### ML Object Detection
| Endpoint | Params |
|---|---|
| `POST /api/ml/detect` | `{ model: "yolo"/"mobilenet" }` — returns image with bboxes + detections array |

---

## 9. UI Design Specifications

### Color Palette

```css
:root {
  --bg-primary:     #1e1e1e;  /* Main background */
  --bg-secondary:   #2c2c2c;  /* Panels, sidebars */
  --bg-tertiary:    #383838;  /* Toolbar, menubar */
  --bg-hover:       #444444;  /* Hover states */
  --bg-active:      #0078d4;  /* Active tool — Photoshop blue */
  --border:         #555555;  /* Panel borders */
  --text-primary:   #cccccc;  /* Main text */
  --text-secondary: #888888;  /* Labels, hints */
  --text-disabled:  #555555;  /* Disabled controls */
  --accent:         #0078d4;  /* Buttons, highlights */
  --accent-hover:   #1a8fe3;  /* Button hover */
  --danger:         #e74c3c;  /* Error states */
  --success:        #27ae60;  /* Success states */
}
```

### Layout Grid

```css
.app-layout {
  display: grid;
  grid-template-rows: 28px 40px 1fr 24px;   /* titlebar, menubar, main, statusbar */
  grid-template-columns: 48px 1fr 280px;    /* toolbar, canvas, right panel */
  height: 100vh;
  background: var(--bg-primary);
}
```

### Layout Diagram

```
┌──────────────────────────────────────────────────┐  ← 28px Titlebar
├──────────────────────────────────────────────────┤  ← 40px Menubar
│      │                              │            │
│ 48px │        Canvas Area           │   280px    │
│ Tool │      (Before / After)        │   Right    │
│ bar  │                              │   Panel    │
│      │                              │            │
├──────────────────────────────────────────────────┤  ← 24px Status Bar
└──────────────────────────────────────────────────┘
```

> **Navigation hierarchy:** The Toolbar + Right Panel is the primary interaction path. The Menubar provides secondary access and keyboard shortcuts.

### Menubar Structure

```
File        Edit          Filter            Transform
────        ────          ──────            ─────────
Open        Undo          Enhancement ▶     Rotate
Save        Redo          Restoration ▶     Flip
Save As     Reset         Edge Detection ▶  Crop
────        ────          Morphology ▶      Resize
Exit        History       Segmentation ▶    Translate
                          Compression ▶
                          ML Detection
```

### Right Panel — Contextual Example

```
┌─────────────────────────┐
│  ENHANCEMENT            │
├─────────────────────────┤
│  Brightness    [-——+]   │
│  -100      0      +100  │
│                         │
│  Contrast      [-——+]   │
│  -100      0      +100  │
├─────────────────────────┤
│  [ Reset to Original ]  │  ← No "Apply" button; changes are live
└─────────────────────────┘
```

### Processing State UX

| State | Visual Feedback | Controls |
|---|---|---|
| **Idle** | Canvas shows current image | All controls enabled |
| **Processing** | Semi-transparent overlay + spinner on canvas | All sliders/buttons disabled |
| **Timeout** (>30s) | Error toast: "Processing timed out" | Controls re-enabled, image reverts to pre-request state |
| **Error** | Red toast with error message, auto-dismiss 5s | Controls re-enabled |
| **Long processing** (>3s) | Show elapsed time: "Processing... (5s)" | Cancel button appears |

**Double-submit prevention:** All interactive controls disabled during API calls.

### Canvas Interactions

#### Crop Mode
- Uses `react-image-crop` library for drag-to-select rectangle
- Shows resize handles on corners and edges
- Displays pixel dimensions of selected area
- "Crop" button applies the selection → sends `{ x, y, width, height }` to `/api/transform/crop`
- **Coordinate mapping:** Library provides coordinates in display-space; scale by `(actualWidth / displayWidth)` ratio before sending to API

#### Seed Point Selection (Segmentation)
- When region segmentation tool is active, cursor changes to crosshair
- Click on canvas → red dot marker at click position
- Coordinates mapped from display-space to image-space (same ratio as crop)
- Seed point sent as `{ seed_x, seed_y, tolerance }` to `/api/segment/region`

### Interaction Model: Live Preview

Parameter-based tools use **live preview** — the image updates in real-time as sliders move.

**How it works:**
1. User moves slider → local state updates immediately (smooth UI)
2. After 300ms of no movement → debounced API call fires
3. Previous in-flight request is cancelled via `AbortController`
4. Response image replaces `currentImage` in Zustand store
5. Canvas updates automatically

**Which tools use live preview:**
| Live Preview (slider-based) | Manual Trigger (button-based) |
|---|---|
| Brightness & Contrast | Histogram Equalization |
| Sharpening intensity | Edge Detection (method select) |
| Blur kernel size | Morphology operations |
| Rotate angle | Flip (toggle) |
| Hue & Saturation | Grayscale conversion |
| Threshold value | ML Object Detection |
| Compression quality | Segmentation |
| Denoise intensity | Channel splitting |

**No "Apply" button** for slider-based tools — changes are applied as the user adjusts.
**No tool-switching confirmation** — the latest slider value is always the applied value.

### NPM Dependencies

```bash
npm install zustand
npm install react-split-pane
npm install rc-slider
npm install lucide-react
npm install react-dropzone
npm install react-image-crop
```

---

## 10. Implementation Plan

### Week 1 — Foundation & Setup

**Python Person:**
- Set up Flask project structure (all folders, blueprints, empty routes)
- Implement `utils/image_utils.py` — base64 ↔ PIL ↔ numpy conversions
- Feature 1: Image Management (load, save)
- Feature 6: Color Processing
- Feature 9: Histogram Analysis

**JS Person:**
- Set up Vite + React + Tailwind
- Implement full app layout (CSS Grid, dark theme)
- Build all reusable UI primitives
- Build `Menubar`, `Toolbar`, `BottomBar` shells
- Build `CanvasPanel` with draggable before/after divider
- Set up Zustand store
- Set up `endpoints.js` with mock responses
- Implement `useDebounce` hook (300ms delay)
- Build processing overlay + spinner component
- Build error toast component

---

### Week 2 — Core Processing Features

**Python Person:**
- Feature 2: Image Enhancement
- Feature 3: Geometric Transformation
- Feature 4: Image Restoration

**JS Person:**
- Build `EnhancementTools.jsx`
- Build `TransformTools.jsx`
- Build `RestorationTools.jsx`
- Connect all 3 panels to real API endpoints
- Build `HistogramChart.jsx`

---

### Week 3 — Advanced Processing Features

**Python Person:**
- Feature 5: Binary & Edge Processing
- Feature 7: Image Segmentation
- Feature 8: Image Compression

**JS Person:**
- Build `BinaryEdgeTools.jsx`
- Build `SegmentationTools.jsx`
- Build `CompressionTools.jsx`
- Build `HistogramTools.jsx`
- Connect all panels to real API endpoints

---

### Week 4 — ML Feature + Integration & Polish

**Python Person:**
- Feature 11: ML Object Detection (YOLOv8n recommended)
- Full end-to-end testing of all endpoints
- Error handling

**JS Person:**
- Build `MLTools.jsx`
- Full UI polish pass (disabled states)
- Implement undo/redo history
- Implement drag & drop image loading

---

### Week 5 — Buffer, Testing & Submission Prep

**Both Together:**
- Integration testing — run every feature end-to-end
- Bug fixes
- Code cleanup & comments
- Write README with setup instructions
- Prepare demo with sample images showcasing every feature
- Final submission packaging

---

## 11. Risk Register

| Risk | Likelihood | Mitigation |
|---|---|---|
| ML model too slow locally | Medium | Use YOLOv8n (nano variant) — fastest inference |
| Compression methods (5 required) | Medium | RLE & Quantization are simple; Huffman via `dahuffman`; LZW via Pillow/imagecodecs; Arithmetic via `imagecodecs`. Libraries reduce risk significantly. |
| Region-based segmentation tricky | Medium | Implement simple flood-fill first, upgrade if time allows |
| Before/after divider complex | Low | `react-split-pane` handles this out of the box |
| Integration issues week 4 | Medium | Both use mock responses weeks 1–3, integration = swapping mocks |
| Crop coordinate mapping | Medium | `react-image-crop` handles UI; only need display→image ratio calculation |
| Seed point canvas click | Low | Simple click handler + coordinate ratio; visual feedback is just a CSS dot |

---

## 12. Decision Log

| # | Decision | Alternatives Considered | Rationale |
|---|---|---|---|
| 1 | Run as local web app (browser) | Desktop app, mobile app | No packaging needed, JS person works in natural habitat, best UI flexibility |
| 2 | Flask as backend framework | FastAPI, Django | Simpler setup, sufficient for this scope; FastAPI's auto-docs advantage not critical |
| 3 | React as frontend framework | Vanilla JS, Vue | Component model essential for complex Photoshop-like panel UI; JS person likely familiar |
| 4 | base64 for image transfer | File upload/download, websockets | Simplest stateless pattern; consistent across all endpoints; no file management needed |
| 5 | Zustand for state management | Redux, Context API | Lightweight, minimal boilerplate, sufficient for this app's state complexity |
| 6 | Feature-based Blueprint structure | Monolithic routes file | Clean separation enables parallel development; Python person can build/test independently |
| 7 | YOLOv8n for ML detection | Custom CNN, MobileNet | Fastest to integrate, best performance/size tradeoff, pretrained weights available |
| 8 | Vite proxy for API calls | CORS configuration | Eliminates CORS issues entirely during development, zero config for JS person |
| 9 | Client-side image load/save | Server-side file management | Simpler, no temp file cleanup, no file system permissions |
| 10 | Cap undo history at 10 + redo | Unlimited history, no redo | Browser memory ceiling ~100MB; redo costs nothing extra |
| 11 | All 5 compression methods with library assist | Tier into must-have/stretch | Required for grading; `dahuffman` + `imagecodecs` reduce implementation risk |
| 12 | Live preview with debounce for slider tools | Apply button model | Better UX — user sees changes instantly without extra clicks |
| 13 | Manual trigger for heavy operations (ML, segmentation) | Live preview for everything | Heavy ops take 1-5s, live preview would feel broken |
| 14 | `react-image-crop` for crop UI | Custom canvas implementation | Saves 1+ days; handles resize handles, aspect ratio, touch |
| 15 | 4096×4096 max resolution with auto-resize | No limit, smaller limit | Balances quality (handles DSLR photos) with base64 payload size |

---

*Document generated from brainstorming session — ready for implementation handoff.*
