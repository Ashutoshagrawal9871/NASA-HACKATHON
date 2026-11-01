# FieldSignals: Scientific Methodology & Mathematical Formulations

This document specifies the exact equations, baseline rules, time standards, and scientific boundaries implemented in FieldSignals.

---

## 1. NASA Environmental Data Integration

### 1.1 Source & Characterization
- **Primary Source:** NASA Langley Research Center POWER Project (Agroclimatology `ag` community endpoint).
- **Physical Meaning:** Derived from the **MERRA-2 atmospheric data assimilation system** ($0.5^\circ \text{latitude} \times 0.625^\circ \text{longitude}$ native horizontal resolution, approximately ~55 km x 70 km grid cell).
- **Caveat:** It is a meteorological reanalysis product combining numerical atmospheric models and assimilated observational data — NOT direct satellite imagery or farm-level measurements.

### 1.2 Time Standard
- All daily observations are requested, parsed, and indexed strictly in **Local Solar Time (LST)** as returned by NASA POWER.
- LST is distinct from civil timezones. Date bounds are applied consistently in LST.

### 1.3 Missing Fill-Value Handling
- NASA POWER returns `-999` (or values $< -900$) for missing observations.
- All fill values are strictly treated as null/missing; they are never treated as zero.

---

## 2. Baseline Period & Anomaly Engine

### 2.1 Baseline Period Definition
- **Reference Start Years:** $Y = 1991$ through $Y = 2019$ inclusive.
- **Season Definition (Rabi Example):** November 1 of year $Y$ through April 30 of year $Y+1$.
- **Candidate Seasons:** Yields a maximum of **29 candidate seasons**, all completing by April 2020.
- **Project Policy Notice:** This baseline is a **FieldSignals project policy** computed from NASA POWER data. It is NOT an official WMO climatological standard normal.

### 2.2 Leap Day & Calendar Rules
- **Policy:** February 29 is excluded from both the selected target season and all 29 baseline candidate seasons for uniform $365$-day index alignment.
- **Calendar Verification:** Date inputs specifying February 29 are strictly verified against Gregorian calendar rules: February 29 is rejected with HTTP 400 in non-leap years (e.g., 2023) and clamped to the non-leap reference calendar in leap years (e.g., 2024).

### 2.3 Independent Variable Completeness & Upstream Failure Rules
Completeness is calculated independently for Mean Temperature (`T2M`) and Total Precipitation (`PRECTOTCORR`):
$$\text{Coverage}_T = \frac{N_{\text{valid, T2M}}}{N_{\text{expected}}}, \quad \text{Coverage}_P = \frac{N_{\text{valid, PRECTOT}}}{N_{\text{expected}}}$$
where $N_{\text{expected}}$ is the exact count of calendar days in the season excluding Feb 29 (181 days for Nov 1 – Apr 30).

- **Per-Season Threshold:** A season requires $\text{Coverage}_T \ge 0.90$ and $\text{Coverage}_P \ge 0.90$.
- **Minimum Qualifying Baseline Count:** Anomaly calculations require at least **24 qualifying seasons** out of the 29 candidate years. If fewer than 24 qualify, seasonal anomalies are suppressed.
- **Upstream Network Failure Separation:** Baseline queries that fail due to upstream timeouts or HTTP errors are explicitly recorded as network failures, distinct from seasons with sparse observations. Results with baseline network failures are never cached.

### 2.4 Anomaly Formulations
- **Seasonal Mean Temperature:**
  $$T_{\text{season}} = \frac{1}{N_{\text{valid, T}}} \sum_{i=1}^{N_{\text{valid, T}}} T2M_i \quad (°C)$$
  $$\Delta T = T_{\text{selected}} - \left( \frac{1}{B} \sum_{y=1}^{B} T_{\text{season}, y} \right) \quad (°C)$$

- **Seasonal Accumulated Precipitation:**
  $$P_{\text{season}} = \sum_{i=1}^{N_{\text{valid, P}}} PRECTOTCORR_i \quad (mm)$$
  $$\Delta P = P_{\text{selected}} - \left( \frac{1}{B} \sum_{y=1}^{B} P_{\text{season}, y} \right) \quad (mm)$$

---

## 3. Soil Context & Provenance Policy
- Local soil test parameters (pH, Soil Organic Carbon %, Texture) are entered manually by users from external laboratory reports.
- **Provenance Warning:** Displays *"⚠️ User-Provided Information from external lab report — not independently verified by FieldSignals"*.
- **SoilGrids WMS:** ISRIC SoilGrids WMS visual-only overlay is available as map context. It is not decoded into numeric farm measurements.

---

## 4. Crop Characteristics & Scoring Boundaries
- **Status:** Automated numeric crop-fit and suitability scoring is **explicitly disabled** (*"Suitability scoring disabled — thresholds unverified"*).
- Descriptive crop roles are displayed solely as sequence participants within the cited historical research study.

---

## 5. Varanasi Case Study Verification (Saha et al., 2012)
- **Citation:** Saha et al. (2012), *Indian Journal of Agricultural Sciences* 82(8):717–720. DOI: `10.56093/ijas.v82i8.23061`.
- **Site:** BHU Agricultural Research Farm, Varanasi, India (2006–07 to 2008–09), Irrigated rice-wheat system.
- **Verified Findings:**
  - **Treatment T7:** Basmati rice – potato – blackgram = **28.88 t/ha/yr** System Rice Grain Equivalent Yield (SRGEY) (*Table 1, p. 718*).
  - **Treatment T10:** Basmati rice – maize (cob) + veg pea (1:2) – greengram = **25.67 t/ha/yr** SRGEY (*Table 1, p. 718*).
  - **Treatment T3:** Early rice – rapeseed – maize (cob) – sesbania (GM) = **13.73 t/ha/yr** SRGEY (*Table 1, p. 718*) and **0.50% Soil Organic Carbon** vs **0.44%** in T1 control (*Table 2, p. 719*).
  - **Treatment T1 (Control):** Rice – wheat = **12.09 t/ha/yr** SRGEY (*Table 1, p. 718*) and **0.44% SOC** (*Table 2, p. 719*).
- **Scope Limit:** Labeled strictly as a historical research case study showcase. Never represented as a farm-level recommendation.
