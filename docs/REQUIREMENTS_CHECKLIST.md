# FieldSignals: Requirements Checklist & Implementation Mapping

This matrix maps the official NASA Space Apps Challenge 2026 requirements (“Field Shift: Adapting Farms with NASA Data”) to the actual implemented components.

---

## 1. Challenge Requirements Mapping

| Official Requirement | Implementation Status | Implemented Component / Limitation |
| :--- | :---: | :--- |
| **1. NASA Earth Observations** | **IMPLEMENTED** | • NASA POWER API v2 daily reanalysis (`T2M`, `PRECTOTCORR`) in `server.js`.<br>• NASA GIBS WMTS `MODIS_Terra_L3_NDVI_16Day` visual backdrop in `MapPicker.jsx`.<br>• Point marker displays coordinate location with documented $0.5^\circ \times 0.625^\circ$ MERRA-2 reanalysis grid cell dimensions. |
| **2. Local Soil Information** | **IMPLEMENTED** | • User soil lab entry form (`SoilInputForm.jsx`) with pH, SOC %, Lab, Date, Method.<br>• Provenance badge separating user lab inputs from NASA data.<br>• Fictional demo button explicitly labeled as synthetic demonstration data.<br>• Client-side and server-side range and date validation.<br>• ISRIC SoilGrids WMS visual overlay in `MapPicker.jsx`. |
| **3. Crop Characteristics** | **BOUNDED & HONEST** | • Numeric crop-fit scoring disabled to prevent scientific hallucination.<br>• Descriptive crop roles displayed strictly as sequence participants in verified trial records. |
| **4. Farmer Priorities** | **IMPLEMENTED** | • User preference filter buttons (`PriorityFilter.jsx`): System Productivity, Soil Organic Carbon, Economic Return.<br>• Unevaluated metrics display *"Not measured in this study"* fallback. |
| **5. Crop Rotation Strategies** | **IMPLEMENTED** | • Verified historical case study explorer (`VaranasiExplorer.jsx`) citing Saha et al. (2012) treatments T7, T10, T3, and T1 control with exact page & table citations. |
| **6. Adaptation & Soil Health** | **IMPLEMENTED** | • 1991–2019 baseline anomaly engine (`ClimateVisualizer.jsx`) for climate shifts.<br>• Legume green manure soil organic carbon study associations highlighted from Table 2, p. 719 (0.50% vs 0.44% control; reported as measured trial comparison without implying proven causation). |

---

## 2. Component Register

| Component File | Role & Data Flow |
| :--- | :--- |
| `frontend/src/App.jsx` | Main application shell, state coordinator, and API orchestrator. |
| `frontend/src/components/MapPicker.jsx` | Leaflet map with global coordinates, point marker with NASA POWER grid scale context, NASA GIBS WMTS, and presets. |
| `frontend/src/components/ClimateVisualizer.jsx` | Temperature and precipitation baseline anomaly cards, independent coverage badges, LST labels, and 24h cache badge. |
| `frontend/src/components/SoilInputForm.jsx` | User lab report form with provenance warning badge, validation alerts, and synthetic demo loader. |
| `frontend/src/components/PriorityFilter.jsx` | User preference controls with unmeasured variable fallbacks. |
| `frontend/src/components/VaranasiExplorer.jsx` | Historical case study showcase with exact Table 1 & Table 2 citations. |
| `frontend/src/components/FarmerSummary.jsx` | Deterministic template-based summary generator (zero AI). |
| `frontend/src/components/MethodologyModal.jsx` | In-app methodology popup detailing data limits and baseline rules. |
| `frontend/server.js` | Authoritative Express backend handling NASA POWER queries, parallel batching, 24h caching, LST dates, static dist SPA serving, health endpoint, and baseline anomaly math. |
| `frontend/test-offline.js` | Automated offline & HTTP route test suite (105/105 tests passing). |
| `frontend/test-production.js` | Automated production smoke test suite (15/15 checks passing). |
| `backend/` | Archived Java Spring Boot prototype (retained for reference; non-authoritative). |
