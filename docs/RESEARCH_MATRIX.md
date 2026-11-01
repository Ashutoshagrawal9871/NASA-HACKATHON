# FieldSignals: Research Evidence & Dataset Matrix

This matrix documents every verified data source, API contract, and research citation used in FieldSignals.

---

## 1. NASA Earth Observations & Environmental Data

| Data Source | Product & Parameter | Spatial Resolution | Temporal Coverage | Access Method & License | Status & Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NASA POWER API (v2)** | `T2M` (Mean Daily Temp at 2m, °C)<br>`PRECTOTCORR` (Bias-corrected Total Precip, mm/day) | $0.5^\circ \text{lat} \times 0.625^\circ \text{lon}$ (~55 km x 70 km grid cell) | 1981–present (Daily, Local Solar Time) | Open REST API (`power.larc.nasa.gov`), no API key required. | **Sourced (Reanalysis)**<br>Used for 1991–2019 baseline normal and seasonal anomaly calculations. Fill values (`-999`) strictly filtered. |
| **NASA GIBS WMTS** | `MODIS_Terra_L3_NDVI_16Day` | 250 m | 2000–present (16-day composite) | Open WMTS tile service (`gibs.earthdata.nasa.gov`), EPSG:3857 template. | **Sourced (Satellite Imagery)**<br>Visual vegetation backdrop. Visual tiles only; zero numeric color decoding. |
| **ISRIC SoilGrids** | Modeled pH ($H_2O$ 0–5cm mean) | 250 m | Static global model | Open WMS layer (`maps.isric.org`). | **Sourced (Modeled Map Context)**<br>Visual map overlay only; not used as farm-level lab measurement. |

---

## 2. Agronomic Case Study Evidence: Varanasi Randomized Trial

| Source Publication | Trial Site & Design | Tested Sequences | Measured Outcomes | Citation & Reference |
| :--- | :--- | :--- | :--- | :--- |
| **Saha et al. (2012)**<br>*Indian J. Agric. Sci.* 82(8):717–720.<br>DOI: [10.56093/ijas.v82i8.23061](https://doi.org/10.56093/ijas.v82i8.23061) | BHU Agricultural Research Farm, Varanasi, India (2006–07 to 2008–09).<br>Irrigated rice-wheat cropping system, randomized block design (3 replications). | • **Treatment T7:** Basmati rice – potato – blackgram<br>• **Treatment T10:** Basmati rice – maize (cob) + veg pea (1:2) – greengram<br>• **Treatment T3:** Early rice – rapeseed – maize (cob) – sesbania (GM)<br>• **Treatment T1 (Control):** Rice – wheat | • **T7:** SRGEY = **28.88 t/ha/yr** (*Table 1, p. 718*)<br>• **T10:** SRGEY = **25.67 t/ha/yr** (*Table 1, p. 718*)<br>• **T3:** SRGEY = **13.73 t/ha/yr** (*Table 1, p. 718*), SOC = **0.50%** (*Table 2, p. 719*)<br>• **T1 Control:** SRGEY = **12.09 t/ha/yr** (*Table 1, p. 718*), SOC = **0.44%** (*Table 2, p. 719*) | **Sourced (Peer-Reviewed Trial)**<br>Displayed as an evidence showcase. Not claimed as a universal recommendation for other farms. |

---

## 3. Crop Suitability Scoring Policy
- **Automated Numeric Scoring Status:** **DISABLED.**
- **Scientific Rationale:** Comparing seasonal aggregate climate means against generic literature crop ranges without cultivar-specific, growth-stage-specific temperature thresholds introduces scientific inaccuracies. To prevent hallucinated agricultural advice, numeric scoring is explicitly disabled in FieldSignals.
