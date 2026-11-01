import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 8080;

// CORS Configuration: Permit same-origin, configured origins, and all local loopback addresses in dev
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : [
      `http://localhost:${PORT}`, 
      `http://127.0.0.1:${PORT}`, 
      'http://localhost:3000', 
      'http://127.0.0.1:3000',
      'http://localhost:8080',
      'http://127.0.0.1:8080'
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. same-origin frontend requests, curl, internal health checks)
    if (!origin) return callback(null, true);
    
    // Check explicitly configured origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    
    // In local / development mode, allow any localhost or 127.0.0.1 port
    if (!isProduction && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Cross-origin request blocked by CORS policy.'));
  }
}));

// Request body parser with 100kb payload ceiling for protection
app.use(express.json({ limit: '100kb' }));

// Middleware: Consistent JSON error handling for malformed JSON request bodies
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "Malformed JSON request body." });
  }
  next(err);
});

// Lightweight Health & Readiness Endpoint
app.get(['/api/health', '/healthz'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'FieldSignals API',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// In-Memory Cache with timestamp (24-hour TTL)
// NOTE: Cache is volatile and per-process. It resides entirely in Node.js process memory
// and resets on process restart. It is not shared across multi-instance clusters or persistent storage.
export const cache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Pre-seed cache with verified real NASA POWER baseline & selected season data for initial default view (Punjab Rabi 2023)
export function seedDefaultCache() {
  const verifiedPunjabData = {
    latitude: 30.901,
    longitude: 75.8573,
    selectedSeasonLabel: 'Season 2023 (11-01 2023 - 04-30 2024, Local Solar Time)',
    selectedSeasonValidDaysTemp: 181,
    selectedSeasonValidDaysRain: 181,
    selectedSeasonValidDays: 181,
    selectedSeasonExpectedDays: 181,
    selectedSeasonCoverageRatioTemp: 1,
    selectedSeasonCoverageRatioRain: 1,
    selectedSeasonCoverageRatio: 1,
    selectedSeasonSufficientCoverage: true,
    selectedSeasonMeanTemp: 17.732430939226525,
    baselineMeanTemp: 18.91638216803201,
    tempAnomaly: -1.1839512288054834,
    selectedSeasonTotalRain: 116.51,
    baselineMeanTotalRain: 111.34482758620689,
    rainAnomaly: 5.165172413793087,
    qualifyingBaselineSeasonsCount: 29,
    totalCandidateBaselineSeasons: 29,
    baselineValid: true,
    baselineUpstreamFailuresCount: 0,
    baselineFailedYears: [],
    baselineStatusNotice: 'Baseline calculation complete (all candidate requests succeeded).',
    includedBaselineStartYears: [
      1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000,
      2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010,
      2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019
    ],
    timeStandard: 'Local Solar Time (LST)',
    dataDisclaimer: 'Data provided by NASA POWER MERRA-2 meteorological reanalysis (0.5° x 0.625° grid). Not a direct farm-level measurement.'
  };

  const keys = [
    '30.901_75.8573_11-01_04-30_2023',
    '30.9010_75.8573_11-01_04-30_2023'
  ];
  for (const k of keys) {
    cache.set(k, { timestamp: Date.now(), data: verifiedPunjabData });
  }
}

// Automatically seed cache when starting standalone service (excluded during test suites)
const isTestEnv = process.argv[1] && process.argv[1].includes('test');
if (!isTestEnv) {
  seedDefaultCache();
}

// Helper: Determine if a year is a leap year according to Gregorian rules
export function isLeapYear(year) {
  if (!year || typeof year !== 'number') return false;
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Helper: Validate calendar date specifically for a given year (strictly rejects 02-29 in non-leap years)
export function isValidCalendarDateForYear(mmdd, year) {
  if (typeof mmdd !== 'string') return false;
  const parts = mmdd.split('-');
  if (parts.length !== 2) return false;
  const [mStr, dStr] = parts;
  if (!/^\d{2}$/.test(mStr) || !/^\d{2}$/.test(dStr)) return false;
  const m = Number(mStr);
  const d = Number(dStr);
  if (m < 1 || m > 12) return false;

  const isLeap = year ? isLeapYear(year) : false;
  const maxDays = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return d >= 1 && d <= maxDays[m - 1];
}

// Helper: Validate strict calendar MM-DD date (prevents invalid dates like 02-31 or 04-31)
export function isValidCalendarMMDD(mmdd) {
  if (typeof mmdd !== 'string') return false;
  const parts = mmdd.split('-');
  if (parts.length !== 2) return false;
  const [mStr, dStr] = parts;
  if (!/^\d{2}$/.test(mStr) || !/^\d{2}$/.test(dStr)) return false;
  const m = Number(mStr);
  const d = Number(dStr);
  if (m < 1 || m > 12) return false;
  // Maximum days per month (allowing 29 for Feb in absolute terms):
  const maxDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return d >= 1 && d <= maxDays[m - 1];
}

// Helper: Validate strict numeric strings (rejects prefixes like "30.9abc")
export function isStrictNumeric(val) {
  if (val === undefined || val === null) return false;
  return /^-?\d+(\.\d+)?$/.test(String(val).trim());
}

export function isStrictInteger(val) {
  if (val === undefined || val === null) return false;
  return /^\d+$/.test(String(val).trim());
}

// Helper: Calculate exact expected days excluding February 29
export function calculateExpectedDays(startMMDD, endMMDD) {
  const [startM, startD] = startMMDD.split('-').map(Number);
  const [endM, endD] = endMMDD.split('-').map(Number);

  // Standard non-leap month lengths (365-day calendar):
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Clamp effective days so 29 in Feb in leap years maps cleanly to non-leap 28-day reference
  const effStartD = Math.min(startD, daysInMonth[startM - 1]);
  const effEndD = Math.min(endD, daysInMonth[endM - 1]);

  let totalDays = 0;
  if (startMMDD <= endMMDD) {
    if (startM === endM) {
      totalDays = effEndD - effStartD + 1;
    } else {
      totalDays += (daysInMonth[startM - 1] - effStartD + 1);
      for (let m = startM + 1; m < endM; m++) totalDays += daysInMonth[m - 1];
      totalDays += effEndD;
    }
  } else {
    // Cross-calendar year (e.g. Nov 1 to Apr 30)
    totalDays += (daysInMonth[startM - 1] - effStartD + 1);
    for (let m = startM + 1; m <= 12; m++) totalDays += daysInMonth[m - 1];
    for (let m = 1; m < endM; m++) totalDays += daysInMonth[m - 1];
    totalDays += effEndD;
  }

  return Math.max(1, totalDays);
}

// Fetch single season daily data from NASA POWER API (with retry and resilient timeout)
export async function fetchPowerData(lat, lon, startDateStr, endDateStr, customFetch = fetch, retries = 1) {
  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR&community=ag&longitude=${lon}&latitude=${lat}&start=${startDateStr.replace(/-/g, '')}&end=${endDateStr.replace(/-/g, '')}&format=JSON`;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout for reliable reanalysis retrieval

      const res = await customFetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        if (attempt < retries && (res.status === 429 || res.status >= 500)) {
          await new Promise(r => setTimeout(r, 800));
          continue;
        }
        console.warn(`NASA POWER API HTTP ${res.status} for ${startDateStr} - ${endDateStr}`);
        return { success: false, status: res.status, parameter: null, error: `HTTP ${res.status}` };
      }

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        return { success: false, status: 502, parameter: null, error: "Malformed JSON received from NASA POWER" };
      }

      const parameter = data?.properties?.parameter;
      if (!parameter || typeof parameter !== 'object' || (!parameter.T2M && !parameter.PRECTOTCORR)) {
        return { success: false, status: 502, parameter: null, error: "Missing or empty parameter payload from NASA POWER" };
      }

      return { success: true, status: 200, parameter };
    } catch (e) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 800));
        continue;
      }
      console.warn(`NASA POWER API request error for ${startDateStr}-${endDateStr}: ${e.message}`);
      return { success: false, status: 502, error: e.message, parameter: null };
    }
  }
}

// Process observations from raw parameter node
export function processObservations(parameterData) {
  if (!parameterData) return { validT: 0, validP: 0, sumT: 0, sumP: 0 };

  const t2m = parameterData.T2M || {};
  const prec = parameterData.PRECTOTCORR || {};
  const uniqueDates = new Set([...Object.keys(t2m), ...Object.keys(prec)]);

  let validT = 0;
  let validP = 0;
  let sumT = 0;
  let sumP = 0;

  for (const dateKey of uniqueDates) {
    if (dateKey.endsWith('0229')) continue; // Strict Feb 29 exclusion

    const tVal = t2m[dateKey];
    const pVal = prec[dateKey];

    // Check against NASA POWER missing fill value (-999)
    if (tVal !== undefined && tVal !== null && tVal > -900) {
      validT++;
      sumT += tVal;
    }
    if (pVal !== undefined && pVal !== null && pVal > -900) {
      validP++;
      sumP += pVal;
    }
  }

  return { validT, validP, sumT, sumP };
}

// Helper: Calculate 1991-2019 baseline anomaly with parallel batching
export async function calculateAnomaly(lat, lon, startMMDD, endMMDD, selectedYear, customFetch = fetch) {
  const cacheKey = `${lat}_${lon}_${startMMDD}_${endMMDD}_${selectedYear}`;
  const now = Date.now();

  if (cache.has(cacheKey)) {
    const cachedEntry = cache.get(cacheKey);
    if (now - cachedEntry.timestamp < CACHE_TTL_MS) {
      console.log(`[Cache Hit] Serving verified cached NASA POWER data for: ${cacheKey}`);
      return { ...cachedEntry.data, isCached: true, cacheTimestamp: new Date(cachedEntry.timestamp).toISOString() };
    }
    cache.delete(cacheKey);
  }

  console.log(`[NASA POWER API Query] Lat: ${lat}, Lon: ${lon}, Season: ${selectedYear} (${startMMDD} to ${endMMDD})`);

  // 1. Fetch Selected Season
  const selectedStart = `${selectedYear}-${startMMDD}`;
  const endYear = startMMDD > endMMDD ? selectedYear + 1 : selectedYear;
  const selectedEnd = `${endYear}-${endMMDD}`;

  const selectedFetchResult = await fetchPowerData(lat, lon, selectedStart, selectedEnd, customFetch);
  if (!selectedFetchResult.success || !selectedFetchResult.parameter) {
    throw new Error(`UPSTREAM_API_FAILURE: NASA POWER API request failed for selected season (status ${selectedFetchResult.status || 502}: ${selectedFetchResult.error || 'missing parameter payload'})`);
  }

  const expectedDays = calculateExpectedDays(startMMDD, endMMDD);
  const { validT, validP, sumT, sumP } = processObservations(selectedFetchResult.parameter);

  const covT = expectedDays > 0 ? validT / expectedDays : 0;
  const covP = expectedDays > 0 ? validP / expectedDays : 0;
  const selectedSufficient = (covT >= 0.90) && (covP >= 0.90);

  const selectedMeanTemp = covT >= 0.90 ? sumT / validT : null;
  const selectedTotalRain = covP >= 0.90 ? sumP : null;

  // 2. Fetch 29 Baseline Seasons in Parallel Batches (Concurrency = 6)
  const baselineYears = [];
  for (let y = 1991; y <= 2019; y++) {
    baselineYears.push(y);
  }

  const qualifyingTemps = [];
  const qualifyingRains = [];
  const includedYears = [];
  let baselineFailedRequests = 0;
  const baselineFailedYears = [];

  const BATCH_SIZE = 6;
  for (let i = 0; i < baselineYears.length; i += BATCH_SIZE) {
    const batch = baselineYears.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(async (y) => {
      const bStart = `${y}-${startMMDD}`;
      const bEndYear = startMMDD > endMMDD ? y + 1 : y;
      const bEnd = `${bEndYear}-${endMMDD}`;
      const bRes = await fetchPowerData(lat, lon, bStart, bEnd, customFetch);
      return { year: y, success: bRes.success, data: bRes.parameter, error: bRes.error, status: bRes.status };
    });

    const batchResults = await Promise.all(batchPromises);

    for (const res of batchResults) {
      if (!res.success || !res.data) {
        baselineFailedRequests++;
        baselineFailedYears.push(res.year);
        continue;
      }

      const { validT: bVT, validP: bVP, sumT: bST, sumP: bSP } = processObservations(res.data);
      const bCovT = expectedDays > 0 ? bVT / expectedDays : 0;
      const bCovP = expectedDays > 0 ? bVP / expectedDays : 0;

      if (bCovT >= 0.90 && bCovP >= 0.90) {
        qualifyingTemps.push(bST / bVT);
        qualifyingRains.push(bSP);
        includedYears.push(res.year);
      }
    }
  }

  includedYears.sort((a, b) => a - b);
  const baselineValid = includedYears.length >= 24;

  let baseMeanTemp = null;
  let baseMeanRain = null;
  let tempAnomaly = null;
  let rainAnomaly = null;

  if (baselineValid) {
    baseMeanTemp = qualifyingTemps.reduce((a, b) => a + b, 0) / qualifyingTemps.length;
    baseMeanRain = qualifyingRains.reduce((a, b) => a + b, 0) / qualifyingRains.length;

    if (selectedMeanTemp !== null) tempAnomaly = selectedMeanTemp - baseMeanTemp;
    if (selectedTotalRain !== null) rainAnomaly = selectedTotalRain - baseMeanRain;
  }

  const result = {
    latitude: lat,
    longitude: lon,
    selectedSeasonLabel: `Season ${selectedYear} (${startMMDD} ${selectedYear} - ${endMMDD} ${endYear}, Local Solar Time)`,
    selectedSeasonValidDaysTemp: validT,
    selectedSeasonValidDaysRain: validP,
    selectedSeasonValidDays: validT,
    selectedSeasonExpectedDays: expectedDays,
    selectedSeasonCoverageRatioTemp: covT,
    selectedSeasonCoverageRatioRain: covP,
    selectedSeasonCoverageRatio: Math.min(covT, covP),
    selectedSeasonSufficientCoverage: selectedSufficient,
    selectedSeasonMeanTemp: selectedMeanTemp,
    baselineMeanTemp: baseMeanTemp,
    tempAnomaly: tempAnomaly,
    selectedSeasonTotalRain: selectedTotalRain,
    baselineMeanTotalRain: baseMeanRain,
    rainAnomaly: rainAnomaly,
    qualifyingBaselineSeasonsCount: includedYears.length,
    totalCandidateBaselineSeasons: 29,
    baselineValid: baselineValid,
    baselineUpstreamFailuresCount: baselineFailedRequests,
    baselineFailedYears: baselineFailedYears,
    baselineStatusNotice: baselineFailedRequests > 0
      ? `Upstream NASA POWER requests encountered network/API errors for ${baselineFailedRequests} of 29 baseline seasons (${baselineFailedYears.slice(0, 4).join(', ')}${baselineFailedYears.length > 4 ? '...' : ''}).`
      : (includedYears.length >= 24 
          ? "Baseline calculation complete (all candidate requests succeeded)." 
          : "Baseline requests succeeded, but fewer than 24 seasons met the >=90% observation coverage threshold."),
    includedBaselineStartYears: includedYears,
    timeStandard: "Local Solar Time (LST)",
    dataDisclaimer: "Data provided by NASA POWER MERRA-2 meteorological reanalysis (0.5° x 0.625° grid). Not a direct farm-level measurement.",
    isCached: false
  };

  // CACHE POLICY: Only cache if BOTH selected season and baseline calculations succeeded with zero upstream failures
  // Never cache failed, incomplete, or network-degraded seasons!
  if (baselineValid && selectedSufficient && baselineFailedRequests === 0) {
    cache.set(cacheKey, { timestamp: now, data: result });
  }

  return result;
}

// REST API: Seasonal Anomaly Analysis with strict input validation
app.get('/api/analysis/anomaly', async (req, res) => {
  const rawLat = req.query.latitude;
  const rawLon = req.query.longitude;
  const startMMDD = req.query.startMMDD || '11-01';
  const endMMDD = req.query.endMMDD || '04-30';
  const rawYear = req.query.selectedYear;

  // Strict Numeric Validation (Rejects parseable prefixes like "30.9abc")
  if (!isStrictNumeric(rawLat) || !isStrictNumeric(rawLon)) {
    return res.status(400).json({ error: "INVALID_COORDINATES", message: "Latitude and Longitude must be strictly numeric." });
  }

  const lat = parseFloat(rawLat);
  const lon = parseFloat(rawLon);

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return res.status(400).json({ error: "COORDINATES_OUT_OF_BOUNDS", message: "Latitude must be between -90 and +90, Longitude must be between -180 and +180." });
  }

  // Strict General Calendar Date Validation (Rejects invalid dates like 02-31 or 04-31)
  if (!isValidCalendarMMDD(startMMDD) || !isValidCalendarMMDD(endMMDD)) {
    return res.status(400).json({ error: "INVALID_CALENDAR_DATE", message: "Season start and end dates must be real calendar dates in MM-DD format." });
  }

  // Strict Year Validation
  if (!isStrictInteger(rawYear)) {
    return res.status(400).json({ error: "INVALID_YEAR", message: "Target season start year must be an integer." });
  }

  const selectedYear = parseInt(rawYear, 10);
  const currentYear = new Date().getFullYear();
  if (selectedYear < 1981 || selectedYear > currentYear) {
    return res.status(400).json({ error: "YEAR_OUT_OF_RANGE", message: `Target season start year must be between 1981 and ${currentYear}.` });
  }

  // Determine end year for cross-year seasons
  const endYear = startMMDD > endMMDD ? selectedYear + 1 : selectedYear;

  // Strict Calendar Date Validation against specific calendar years (e.g., rejects 02-29 in non-leap years)
  if (!isValidCalendarDateForYear(startMMDD, selectedYear)) {
    return res.status(400).json({ 
      error: "INVALID_CALENDAR_DATE", 
      message: `Season start date '${startMMDD}' is not a valid calendar date in year ${selectedYear}.` 
    });
  }

  if (!isValidCalendarDateForYear(endMMDD, endYear)) {
    return res.status(400).json({ 
      error: "INVALID_CALENDAR_DATE", 
      message: `Season end date '${endMMDD}' is not a valid calendar date in year ${endYear}.` 
    });
  }

  try {
    const result = await calculateAnomaly(lat, lon, startMMDD, endMMDD, selectedYear);
    res.json(result);
  } catch (err) {
    console.error("Error in anomaly calculation:", err.message);
    if (err.message?.includes('UPSTREAM_API_FAILURE')) {
      return res.status(502).json({ error: "UPSTREAM_API_FAILURE", message: "NASA POWER API service is currently unavailable or timed out." });
    }
    res.status(500).json({ error: "CALCULATION_ERROR", message: "Failed to compute seasonal anomaly." });
  }
});

// REST API: Varanasi Rotation Case Study (Saha et al. 2012 Exact Verbatim Data)
export const varanasiSequences = [
  {
    treatmentId: "T7",
    sequenceName: "Basmati rice – potato – blackgram",
    cropsInSequence: ["Basmati rice (Oryza sativa)", "Potato (Solanum tuberosum)", "Blackgram (Vigna mungo)"],
    roleInSequence: "Tested sequence with potato cash crop and blackgram pulse break",
    yieldMetricName: "System Rice Grain Equivalent Yield (SRGEY)",
    srgeyValueTonnesPerHa: 28.88, // Table 1, p. 718
    soilOrganicCarbonPercent: null,
    nutrientManagementTreatment: "Integrated Nutrient Management (INM)",
    exactSourceCitation: "Saha et al. (2012), Indian Journal of Agricultural Sciences 82(8):717–720. DOI: 10.56093/ijas.v82i8.23061",
    exactTablePageRef: "Table 1, p. 718",
    studyContextNote: "BHU Agricultural Research Farm, Varanasi (2006–07 to 2008–09), Irrigated rice-wheat system. Historical research showcase — not a prediction for user farm."
  },
  {
    treatmentId: "T10",
    sequenceName: "Basmati rice – maize (cob) + vegetable pea (1:2) – greengram",
    cropsInSequence: ["Basmati rice (Oryza sativa)", "Maize (cob) (Zea mays)", "Vegetable pea (1:2 intercrop) (Pisum sativum)", "Greengram (Vigna radiata)"],
    roleInSequence: "Tested sequence with intercropped maize and vegetable pea followed by greengram",
    yieldMetricName: "System Rice Grain Equivalent Yield (SRGEY)",
    srgeyValueTonnesPerHa: 25.67, // Table 1, p. 718
    soilOrganicCarbonPercent: null,
    nutrientManagementTreatment: "Integrated Nutrient Management (INM)",
    exactSourceCitation: "Saha et al. (2012), Indian Journal of Agricultural Sciences 82(8):717–720. DOI: 10.56093/ijas.v82i8.23061",
    exactTablePageRef: "Table 1, p. 718",
    studyContextNote: "BHU Agricultural Research Farm, Varanasi (2006–07 to 2008–09), Irrigated rice-wheat system. Historical research showcase — not a prediction for user farm."
  },
  {
    treatmentId: "T3",
    sequenceName: "Early rice – rapeseed – maize (cob) – sesbania (green manure)",
    cropsInSequence: ["Early rice (Oryza sativa)", "Rapeseed (Brassica napus)", "Maize (cob) (Zea mays)", "Sesbania (green manure) (Sesbania bispinosa)"],
    roleInSequence: "Tested sequence incorporating green manure sesbania under integrated nutrient management",
    yieldMetricName: "System Rice Grain Equivalent Yield (SRGEY)",
    srgeyValueTonnesPerHa: 13.73, // Table 1, p. 718
    soilOrganicCarbonPercent: 0.50, // Table 2, p. 719 (vs 0.44% control)
    nutrientManagementTreatment: "Integrated Nutrient Management (INM)",
    exactSourceCitation: "Saha et al. (2012), Indian Journal of Agricultural Sciences 82(8):717–720. DOI: 10.56093/ijas.v82i8.23061",
    exactTablePageRef: "Table 1, p. 718 & Table 2, p. 719",
    studyContextNote: "BHU Agricultural Research Farm, Varanasi (2006–07 to 2008–09), Irrigated rice-wheat system. Historical research showcase — not a prediction for user farm."
  },
  {
    treatmentId: "T1",
    sequenceName: "Rice – wheat (Regional Standard Control)",
    cropsInSequence: ["Rice (Oryza sativa)", "Wheat (Triticum aestivum)"],
    roleInSequence: "Conventional rice-wheat sequence used as experimental control",
    yieldMetricName: "System Rice Grain Equivalent Yield (SRGEY)",
    srgeyValueTonnesPerHa: 12.09, // Table 1, p. 718
    soilOrganicCarbonPercent: 0.44, // Table 2, p. 719
    nutrientManagementTreatment: "Conventional Recommended Fertilizer Application",
    exactSourceCitation: "Saha et al. (2012), Indian Journal of Agricultural Sciences 82(8):717–720. DOI: 10.56093/ijas.v82i8.23061",
    exactTablePageRef: "Table 1 p. 718 & Table 2 p. 719",
    studyContextNote: "BHU Agricultural Research Farm, Varanasi (2006–07 to 2008–09), Irrigated rice-wheat system. Historical research showcase — not a prediction for user farm."
  }
];

app.get('/api/rotation/varanasi', (req, res) => {
  res.json(varanasiSequences);
});

// Helper: Validate full YYYY-MM-DD calendar date (strictly rejects impossible dates like 2024-02-31 or 2023-02-29)
export function isValidCalendarYYYYMMDD(dateStr) {
  if (typeof dateStr !== 'string') return false;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const year = parseInt(match[1], 10);
  const mmdd = `${match[2]}-${match[3]}`;
  return isValidCalendarDateForYear(mmdd, year);
}

// REST API: Soil Form Validation Endpoint
app.post('/api/soil/validate', (req, res) => {
  const { ph, socPercent, sampleDate, testingLaboratory } = req.body || {};
  const errors = [];

  if (ph !== undefined && ph !== null && ph !== '') {
    if (!isStrictNumeric(ph)) {
      errors.push("pH must be strictly numeric.");
    } else {
      const numPh = Number(ph);
      if (numPh < 0 || numPh > 14) {
        errors.push("pH must be between 0 and 14.");
      }
    }
  }

  if (socPercent !== undefined && socPercent !== null && socPercent !== '') {
    if (!isStrictNumeric(socPercent)) {
      errors.push("Soil Organic Carbon (SOC %) must be strictly numeric.");
    } else {
      const numSoc = Number(socPercent);
      if (numSoc < 0 || numSoc > 100) {
        errors.push("Soil Organic Carbon (SOC %) must be between 0 and 100%.");
      }
    }
  }

  if (sampleDate) {
    if (!isValidCalendarYYYYMMDD(sampleDate)) {
      errors.push("Sample extraction date is an impossible or malformed calendar date (e.g. 2024-02-31).");
    } else {
      const parsedDate = new Date(sampleDate);
      const today = new Date();
      if (parsedDate > today) {
        errors.push("Sample extraction date cannot be in the future.");
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ valid: false, errors });
  }

  return res.json({ valid: true, message: "Soil inputs pass validation." });
});

// Serve static frontend assets from dist if built
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// 404 Handler for unknown API routes (MUST precede the SPA catch-all)
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: "NOT_FOUND", message: `API route '${req.originalUrl}' not found.` });
});

// SPA Fallback: Serve dist/index.html for any other GET request
if (fs.existsSync(distPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start server if executed directly as script (not when imported in test)
let server = null;
const isMainScript = process.argv[1] && (process.argv[1].endsWith('server.js') || process.argv[1].includes('server'));
if (isMainScript && !process.argv[1].includes('test')) {
  server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 FieldSignals Server running on port ${PORT}`);
    console.log(`   - Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   - Health Check: http://localhost:${PORT}/api/health`);
    console.log(`   - Anomaly API: http://localhost:${PORT}/api/analysis/anomaly`);
    console.log(`   - Rotation API: http://localhost:${PORT}/api/rotation/varanasi`);
    console.log(`   - Soil Validation: http://localhost:${PORT}/api/soil/validate`);
    if (fs.existsSync(distPath)) {
      console.log(`   - Web Frontend: Serving production build from /dist`);
      console.log(`   - Open App: http://localhost:${PORT}`);
    } else {
      console.log(`   - Web Frontend: /dist not built yet (Run 'npm run build')`);
    }
    console.log(`====================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Error: Port ${PORT} is already in use by another process.`);
      console.error(`To free port ${PORT}, run in PowerShell:`);
      console.error(`  Get-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess | Stop-Process -Force\n`);
      process.exit(1);
    } else {
      console.error(`Server error:`, err);
    }
  });

  const handleShutdown = (signal) => {
    console.log(`\nReceived ${signal}. Shutting down FieldSignals server gracefully...`);
    if (server) {
      server.close(() => {
        console.log("FieldSignals server stopped successfully.");
        process.exit(0);
      });
      setTimeout(() => {
        console.error("Forcefully terminating server.");
        process.exit(1);
      }, 5000).unref();
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

export default app;
