# FieldSignals — Climate-Adaptive Agronomic Intelligence Powered by NASA Earth Observations

> **NASA Space Apps Challenge 2026 Project**  
> **Challenge:** Field Shift: Adapting Farms with NASA Data  
> **Architecture:** Unified Single-Process Express + React Production Service & Deterministic Climate Anomaly Engine  

---

## 🌟 Executive Summary & Vision

**FieldSignals** is an evidence-first, zero-hallucination web platform designed to help agricultural extension workers, researchers, and farmers explore global environmental changes, evaluate 30-year climate anomalies using NASA Earth Observations, and examine cited historical crop-rotation research trials.

### Core Scientific Safeguards & Non-Negotiable Rules:
1. **Zero Generative AI / LLMs:** All summaries and analysis text are 100% deterministic, template-based, and directly traceable to computed data or cited research papers.
2. **Reanalysis vs. Direct Observation Transparency:** NASA POWER meteorological data is clearly identified as **MERRA-2 atmospheric reanalysis** ($0.5^\circ \text{latitude} \times 0.625^\circ \text{longitude}$ grid cell) — NOT a direct satellite image or farm-level measurement.
3. **NASA GIBS Visual Layer:** Visual vegetation backdrop powered by NASA GIBS WMTS (`MODIS_Terra_L3_NDVI_16Day`, EPSG:3857 template with curated composite date selector). Rendered imagery only; zero numeric color decoding.
4. **Soil Data Provenance:** User soil lab test inputs (pH, SOC %, Lab Name, Date, Method) bear an explicit warning badge: *"⚠️ User-Provided Information from external lab report — not independently verified by FieldSignals"*. Synthetic demonstration data is clearly marked as non-confirmed example data.
5. **Computed Baseline Normal (1991–2019 Start Years):** Compares selected growing seasons against 29 candidate start years ending April 2020. Excludes February 29 for leap-year consistency (strictly 181 expected days for Nov 1 – Apr 30). Requires $\ge 90\%$ per-variable valid observation coverage and $\ge 24$ qualifying baseline seasons. Labeled strictly as a **FieldSignals project policy** (not an official WMO station normal).
6. **Disabled Numeric Crop Suitability Scoring:** Numeric crop suitability scores are **disabled** (*"Suitability scoring disabled — thresholds unverified"*) to protect scientific integrity until complete cultivar records are verified.
7. **Sourced Historical Rotation Showcase (Saha et al. 2012):** Exact treatment metrics from BHU Research Farm, Varanasi, India ($2006\text{--}09$), citing exact tables:
   - **Treatment T7:** Basmati rice – potato – blackgram = **28.88 t/ha/yr** System Rice Grain Equivalent Yield (SRGEY) (*Table 1, p. 718*).
   - **Treatment T10:** Basmati rice – maize (cob) + veg pea (1:2) – greengram = **25.67 t/ha/yr** SRGEY (*Table 1, p. 718*).
   - **Treatment T3:** Early rice – rapeseed – maize (cob) – sesbania (GM) = **13.73 t/ha/yr** SRGEY (*Table 1, p. 718*) and **0.50% Soil Organic Carbon** vs **0.44%** T1 control (*Table 2, p. 719*).
   - **Treatment T1 Control:** Rice – wheat = **12.09 t/ha/yr** SRGEY (*Table 1, p. 718*) and **0.44% SOC** (*Table 2, p. 719*).

---

## 🏗️ Architecture & Technology Stack

- **Supported Authoritative Runtime:** Node.js v18+ (verified on Node.js v24 LTS).
- **Authoritative Backend Service (`frontend/server.js`):** Express REST API proxying NASA POWER API with 6-request parallel batching, 24-hour cache (failed or incomplete requests never cached), exact 181-day non-leap day counting, in-flight request cancellation support, strict calendar boundary validation, comprehensive soil validation, health endpoint (`/api/health`, `/healthz`), and single-process static `dist/` SPA serving.
- **Frontend App (`frontend/src/`):** React 18 + Vite 5 + Tailwind CSS + Leaflet.js with bundled marker assets and bundled Leaflet CSS (no external CDN required for UI rendering).
- **Archived Java Backend Prototype (`backend/`):** Archived Spring Boot prototype (retained for design reference; non-authoritative and not part of the active deployment runtime).

---

## 🚀 Execution & Deployment Instructions

### 1. Prerequisites
- Node.js (v18 or newer installed on system)
- Internet connection (required for live NASA POWER and GIBS tile queries)

### 2. Run Automated Offline Tests
Verify date math, leap-day handling, fill-value filtering, independent coverage thresholds, API routes, health check, and Saha et al. (2012) citations:
```cmd
npm test
```
*or from `frontend/`:*
```cmd
cd frontend
npm test
```
*(All 105 automated offline & HTTP route tests pass successfully)*

---

### 3. Production Deployment Mode (Recommended for Judges & Hosting)
In production, FieldSignals builds into static assets and runs as a **single Node.js process** that serves both the Express API routes and the built Vite SPA from the same origin:

#### Step A: Build Frontend Production Bundle
```cmd
npm run build
```
*(Generates optimized assets in `frontend/dist` with bundled Leaflet CSS and assets)*

#### Step B: Run Production Smoke Test
Verifies health endpoint, API routes, static asset delivery, and SPA route fallback on the built distribution:
```cmd
npm run smoke:prod
```
*(All 15 production smoke checks pass successfully)*

#### Step C: Start Production Server
```cmd
npm start
```
*or from `frontend/`:*
```cmd
cd frontend
npm start
```
The server will bind to `process.env.PORT` (or default port `8080`):
Open **`http://localhost:8080`** in any web browser.

---

### 4. Local Development Mode (With Vite Hot-Reloading)
If actively developing the React frontend:

1. **Terminal 1 (Backend API):**
   ```cmd
   cd frontend
   npm run server
   ```
   *(Runs Express API on port 8080)*

2. **Terminal 2 (Frontend Dev Server):**
   ```cmd
   cd frontend
   npm run dev
   ```
   *(Runs Vite on port 3000, proxying `/api` requests to port 8080)*

---

## ⚙️ Environment Variables & Operational Configuration

| Variable | Default | Purpose / Production Behavior |
| :--- | :---: | :--- |
| `PORT` | `8080` | Network port for the Express application. Configured automatically by cloud hosts (e.g. Render, Railway, Heroku, Cloud Run). |
| `NODE_ENV` | `development` | Set to `production` in deployed environments. In production, narrow CORS rules apply and the built `dist` folder is served. |
| `ALLOWED_ORIGINS` | `""` | Comma-separated list of permitted cross-origin domains. In production, same-origin requests require no cross-origin permission; external domains are blocked by default unless listed here. |

### In-Memory Cache Operational Notice:
The 24-hour analysis cache (`cache`) is stored strictly in **per-process Node.js memory**. It resets whenever the application restarts or restarts during autoscaling. It is non-durable and not shared across horizontal multi-container instances.

---

## 📂 Project Structure

```
NASA HACKATHON/
├── package.json               # Root workspace scripts (build, start, test, smoke:prod)
├── frontend/
│   ├── server.js              # Authoritative Express API & production SPA server
│   ├── test-offline.js        # Automated offline & HTTP route test suite (105/105 tests passing)
│   ├── test-production.js     # Production smoke test suite (15/15 checks passing)
│   ├── package.json           # Frontend scripts & dependencies
│   ├── vite.config.js         # Vite configuration with local development proxy
│   ├── index.html             # HTML shell referencing bundled assets & favicon.svg
│   ├── public/
│   │   └── favicon.svg        # Clean FieldSignals vector brand icon
│   └── src/
│       ├── App.jsx            # In-flight cancellation, selection reset, and layout
│       └── components/        # MapPicker, ClimateVisualizer, SoilInputForm, PriorityFilter, VaranasiExplorer, FarmerSummary, MethodologyModal
├── backend/                   # Archived Java Spring Boot prototype (non-authoritative)
├── docs/
│   ├── REQUIREMENTS_CHECKLIST.md
│   ├── RESEARCH_MATRIX.md
│   └── METHODOLOGY.md
├── DEMO_SCRIPT.md
└── README.md
```

---

## 📜 Attributions & Disclaimers

- **NASA POWER:** *"Data provided by the NASA Langley Research Center POWER Project funded through the NASA Earth Science/Applied Science Program."*
- **NASA GIBS:** *"We acknowledge the use of imagery provided by services from NASA's Global Imagery Browse Services (GIBS), part of NASA's Earth Science Data and Information System (ESDIS)."*
- **OpenStreetMap:** *"© OpenStreetMap contributors"*
- **ISRIC SoilGrids:** *"SoilGrids modeled soil property estimates © ISRIC — World Soil Information"*
- **Saha et al. (2012):** *"Saha et al. (2012), Indian Journal of Agricultural Sciences 82(8):717–720. DOI: 10.56093/ijas.v82i8.23061"*

> ⚠️ **Boundary Notice:** FieldSignals provides exploratory climate analysis and historical research showcases only. It is not professional agronomic advice, a weather forecast, or a yield prediction. Consult local agricultural extension officers before making farming decisions.
