// Comprehensive Automated Test Suite for FieldSignals Analysis Engine & HTTP API Routes
import app, { 
  calculateExpectedDays, 
  processObservations, 
  calculateAnomaly, 
  fetchPowerData,
  cache,
  isLeapYear,
  isValidCalendarDateForYear,
  isValidCalendarMMDD,
  isValidCalendarYYYYMMDD,
  isStrictNumeric,
  isStrictInteger,
  varanasiSequences
} from './server.js';

// Helper: Generate real calendar dates (YYYYMMDD) for a given season range
function generateRealCalendarDates(startYear, startMMDD, endMMDD) {
  const [sMonth, sDay] = startMMDD.split('-').map(Number);
  const [eMonth, eDay] = endMMDD.split('-').map(Number);
  const endYear = startMMDD > endMMDD ? startYear + 1 : startYear;

  const dates = [];
  const current = new Date(Date.UTC(startYear, sMonth - 1, sDay));
  const end = new Date(Date.UTC(endYear, eMonth - 1, eDay));

  while (current <= end) {
    const y = current.getUTCFullYear();
    const m = String(current.getUTCMonth() + 1).padStart(2, '0');
    const d = String(current.getUTCDate()).padStart(2, '0');
    dates.push(`${y}${m}${d}`);
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

async function runTestSuite() {
  console.log("=== RUNNING ENHANCED REAL-CALENDAR & HTTP API TEST SUITE ===");
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  // =========================================================================
  // 1. Gregorian Leap Year Rules & Year-Specific Calendar Validation
  // =========================================================================
  assert(isLeapYear(2024) === true, "Year 2024 is correctly identified as a leap year");
  assert(isLeapYear(2023) === false, "Year 2023 is correctly identified as a non-leap year");
  assert(isLeapYear(2000) === true, "Century leap year 2000 is correctly identified as a leap year");
  assert(isLeapYear(1900) === false, "Century non-leap year 1900 is correctly identified as a non-leap year");

  assert(isValidCalendarDateForYear('02-29', 2024) === true, "February 29 is valid in leap year 2024");
  assert(isValidCalendarDateForYear('02-29', 2023) === false, "February 29 is strictly invalid in non-leap year 2023");
  assert(isValidCalendarDateForYear('02-28', 2023) === true, "February 28 is valid in non-leap year 2023");
  assert(isValidCalendarDateForYear('04-30', 2023) === true, "April 30 is valid in 2023");
  assert(isValidCalendarDateForYear('04-31', 2023) === false, "April 31 is strictly invalid in 2023");

  // General MM-DD validity checks
  assert(isValidCalendarMMDD('11-01') === true, "Valid calendar date 11-01 passes general validation");
  assert(isValidCalendarMMDD('04-30') === true, "Valid calendar date 04-30 passes general validation");
  assert(isValidCalendarMMDD('02-29') === true, "Leap date 02-29 passes month boundary check (max 29)");
  assert(isValidCalendarMMDD('02-30') === false, "Impossible calendar date 02-30 strictly rejected");
  assert(isValidCalendarMMDD('02-31') === false, "Impossible calendar date 02-31 strictly rejected");
  assert(isValidCalendarMMDD('04-31') === false, "Impossible calendar date 04-31 strictly rejected");
  assert(isValidCalendarMMDD('13-01') === false, "Invalid month 13-01 strictly rejected");

  // Gregorian YYYY-MM-DD full calendar date checks
  assert(isValidCalendarYYYYMMDD('2024-02-29') === true, "2024-02-29 is valid in leap year 2024");
  assert(isValidCalendarYYYYMMDD('2023-02-29') === false, "2023-02-29 is strictly rejected in non-leap year 2023");
  assert(isValidCalendarYYYYMMDD('2024-02-31') === false, "Impossible calendar date 2024-02-31 is strictly rejected");
  assert(isValidCalendarYYYYMMDD('2024-04-31') === false, "Impossible calendar date 2024-04-31 is strictly rejected");
  assert(isValidCalendarYYYYMMDD('2024-13-01') === false, "Invalid month date 2024-13-01 is strictly rejected");

  // =========================================================================
  // 2. Strict Numeric Input Validation Tests
  // =========================================================================
  assert(isStrictNumeric('30.9010') === true, "Strict numeric coordinate '30.9010' passes validation");
  assert(isStrictNumeric('-75.8573') === true, "Strict negative numeric coordinate '-75.8573' passes validation");
  assert(isStrictNumeric('0') === true, "Coordinate '0' (Null Island) passes strict numeric check");
  assert(isStrictNumeric('30.9abc') === false, "Coordinate with trailing characters '30.9abc' strictly rejected");
  assert(isStrictInteger('2023') === true, "Strict integer year '2023' passes validation");
  assert(isStrictInteger('2023abc') === false, "Year with trailing characters '2023abc' strictly rejected");

  // =========================================================================
  // 3. Expected Days Calculation across Supported Presets & Boundary Cases
  // =========================================================================
  const rabiDays = calculateExpectedDays('11-01', '04-30');
  assert(rabiDays === 181, `Rabi Season (11-01 to 04-30) expected days is strictly 181 days (got ${rabiDays})`);

  const kharifDays = calculateExpectedDays('05-01', '09-30');
  assert(kharifDays === 153, `Kharif Season (05-01 to 09-30) expected days is strictly 153 days (got ${kharifDays})`);

  const springDays = calculateExpectedDays('03-01', '06-30');
  assert(springDays === 122, `Spring / Long Rains (03-01 to 06-30) expected days is strictly 122 days (got ${springDays})`);

  const winterDays = calculateExpectedDays('01-01', '03-31');
  assert(winterDays === 90, `Winter quarter across February (01-01 to 03-31) is strictly 90 non-leap days (got ${winterDays})`);

  // Clamped leap date expected days check
  const leapStartDays = calculateExpectedDays('02-29', '04-30');
  assert(leapStartDays > 0 && leapStartDays <= 62, "calculateExpectedDays clamps 02-29 gracefully to reference calendar");

  // =========================================================================
  // 4. Real Calendar Date Generation for Leap Year (2023-11-01 to 2024-04-30)
  // =========================================================================
  const realDatesLeap = generateRealCalendarDates(2023, '11-01', '04-30');
  assert(realDatesLeap.includes('20240229'), "Calendar generator contains leap day 20240229 before exclusion");
  assert(realDatesLeap[0] === '20231101' && realDatesLeap[realDatesLeap.length - 1] === '20240430', "Real calendar dates start at 20231101 and end at 20240430");

  // =========================================================================
  // 5. Process Observations: Leap Day 20240229 Exclusion & Deduplication
  // =========================================================================
  const mockParamsLeap = { T2M: {}, PRECTOTCORR: {} };
  for (const dateKey of realDatesLeap) {
    mockParamsLeap.T2M[dateKey] = 20.0;
    mockParamsLeap.PRECTOTCORR[dateKey] = 1.0;
  }
  const processedLeap = processObservations(mockParamsLeap);
  assert(processedLeap.validT === 181, `Feb 29 is strictly excluded from observation set (182 calendar days reduced to 181 valid days)`);

  // =========================================================================
  // 6. Fill Value (-999) Filtering
  // =========================================================================
  const mockParamsFill = {
    T2M: { '20231101': 25.0, '20231102': -999.0, '20231103': 23.0 },
    PRECTOTCORR: { '20231101': 2.0, '20231102': -999.0, '20231103': 3.0 }
  };
  const processedFill = processObservations(mockParamsFill);
  assert(processedFill.validT === 2 && processedFill.sumT === 48.0 && processedFill.sumP === 5.0, "Fill value -999 is strictly treated as missing data and excluded from sum");

  // =========================================================================
  // 7. Mock Successful NASA POWER Anomaly Calculation with Real Calendar Dates
  // =========================================================================
  const mockFetchSuccess = async (url) => {
    const match = url.match(/start=(\d{4})/);
    const yr = match ? parseInt(match[1]) : 2023;
    const realDates = generateRealCalendarDates(yr, '11-01', '04-30');

    const t2m = {};
    const prec = {};
    for (const d of realDates) {
      t2m[d] = 20.0;
      prec[d] = 2.0;
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({ properties: { parameter: { T2M: t2m, PRECTOTCORR: prec } } })
    };
  };

  cache.clear();
  const successfulResult = await calculateAnomaly(30.9, 75.8, '11-01', '04-30', 2023, mockFetchSuccess);
  assert(successfulResult.selectedSeasonSufficientCoverage === true, "100% complete season passes sufficient coverage threshold (>=90%)");
  assert(successfulResult.selectedSeasonMeanTemp === 20.0, `Calculated seasonal mean temp is 20.0 °C (got ${successfulResult.selectedSeasonMeanTemp})`);
  assert(successfulResult.selectedSeasonTotalRain === 362.0, `Calculated total seasonal precipitation is 362.0 mm (got ${successfulResult.selectedSeasonTotalRain})`);
  assert(successfulResult.baselineValid === true, "Baseline calculation succeeds with 29 qualifying candidate seasons");
  assert(successfulResult.baselineUpstreamFailuresCount === 0, "Baseline calculation reports 0 upstream failures");
  assert(cache.size === 1, "Successful verified calculation is stored in cache");

  // =========================================================================
  // 8. Incomplete NASA Response (<90% Coverage) Suppression Test
  // =========================================================================
  const mockFetchIncomplete = async (url) => {
    const realDates = generateRealCalendarDates(2023, '11-01', '04-30').slice(0, 50); // Only first 50 days
    const t2m = {};
    const prec = {};
    for (const d of realDates) {
      t2m[d] = 25.0;
      prec[d] = 1.0;
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({ properties: { parameter: { T2M: t2m, PRECTOTCORR: prec } } })
    };
  };

  cache.clear();
  const incompleteResult = await calculateAnomaly(30.9, 75.8, '11-01', '04-30', 2023, mockFetchIncomplete);
  assert(incompleteResult.selectedSeasonSufficientCoverage === false, "Season with <90% coverage correctly fails sufficient coverage check");
  assert(incompleteResult.selectedSeasonMeanTemp === null, "Seasonal temperature anomaly is suppressed when coverage <90%");
  assert(incompleteResult.selectedSeasonTotalRain === null, "Seasonal precipitation anomaly is suppressed when coverage <90%");
  assert(incompleteResult.tempAnomaly === null, "Temperature anomaly difference is null when coverage <90%");
  assert(cache.size === 0, "Incomplete calculation with suppressed anomaly is NOT cached");

  // =========================================================================
  // 9. Independent Variable Coverage: Temperature Valid but Precipitation Incomplete
  // =========================================================================
  const mockFetchTempOnly = async (url) => {
    const realDates = generateRealCalendarDates(2023, '11-01', '04-30');
    const t2m = {};
    const prec = {};
    for (const d of realDates) {
      t2m[d] = 22.0; // 100% temp
    }
    for (const d of realDates.slice(0, 40)) {
      prec[d] = 1.5; // Only 40 days of rain (<90%)
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({ properties: { parameter: { T2M: t2m, PRECTOTCORR: prec } } })
    };
  };

  cache.clear();
  const tempOnlyResult = await calculateAnomaly(30.9, 75.8, '11-01', '04-30', 2023, mockFetchTempOnly);
  assert(tempOnlyResult.selectedSeasonMeanTemp === 22.0, "Selected season mean temp calculated when T2M coverage >= 90%");
  assert(tempOnlyResult.selectedSeasonTotalRain === null, "Selected season total rain suppressed when PRECTOTCORR coverage < 90%");
  assert(tempOnlyResult.selectedSeasonSufficientCoverage === false, "Overall seasonal sufficiency requires both variables >= 90%");
  assert(cache.size === 0, "Asymmetric incomplete calculation is NOT cached");

  // =========================================================================
  // 10. Baseline Upstream Network Failures Exposed Distinctly
  // =========================================================================
  const mockFetchBaselineFailures = async (url) => {
    const match = url.match(/start=(\d{4})/);
    const yr = match ? parseInt(match[1]) : 2023;
    if (yr >= 1991 && yr <= 2000) {
      // 10 baseline seasons fail due to upstream network issue
      return { ok: false, status: 503, json: async () => ({ error: "Service Unavailable" }) };
    }
    const realDates = generateRealCalendarDates(yr, '11-01', '04-30');
    const t2m = {};
    const prec = {};
    for (const d of realDates) {
      t2m[d] = 21.0;
      prec[d] = 1.8;
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({ properties: { parameter: { T2M: t2m, PRECTOTCORR: prec } } })
    };
  };

  cache.clear();
  const baselineFailResult = await calculateAnomaly(30.9, 75.8, '11-01', '04-30', 2023, mockFetchBaselineFailures);
  assert(baselineFailResult.baselineValid === false, "Baseline is invalid when 10 seasons fail upstream network queries");
  assert(baselineFailResult.baselineUpstreamFailuresCount === 10, "baselineUpstreamFailuresCount accurately reports 10 failed queries");
  assert(baselineFailResult.qualifyingBaselineSeasonsCount === 19, "qualifyingBaselineSeasonsCount reports remaining 19 completed seasons");
  assert(baselineFailResult.baselineFailedYears.length === 10, "baselineFailedYears lists exact years that encountered network errors");
  assert(baselineFailResult.baselineStatusNotice.includes("errors for 10 of 29 baseline seasons"), "baselineStatusNotice explicitly details upstream network failure");
  assert(cache.size === 0, "Calculation with upstream baseline network failures is NOT cached");

  // =========================================================================
  // 11. Upstream API Network Failure & Missing Parameter Error Handling
  // =========================================================================
  const mockFetch503 = async () => ({ ok: false, status: 503, json: async () => ({ error: "Service Unavailable" }) });
  let caughtError503 = null;
  try {
    await calculateAnomaly(30.9, 75.8, '11-01', '04-30', 2023, mockFetch503);
  } catch (err) {
    caughtError503 = err;
  }
  assert(caughtError503 !== null && caughtError503.message.includes('UPSTREAM_API_FAILURE'), "Upstream NASA API HTTP 503 error is propagated as UPSTREAM_API_FAILURE");

  const mockFetchMalformed = async () => ({
    ok: true,
    status: 200,
    json: async () => { throw new Error("Unexpected end of JSON input"); }
  });
  const malformedResult = await fetchPowerData(30.9, 75.8, '2023-11-01', '2024-04-30', mockFetchMalformed);
  assert(malformedResult.success === false && malformedResult.status === 502, "Malformed JSON response from NASA POWER returns status 502 failure");

  const mockFetchEmptyParam = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ properties: {} })
  });
  const emptyParamResult = await fetchPowerData(30.9, 75.8, '2023-11-01', '2024-04-30', mockFetchEmptyParam);
  assert(emptyParamResult.success === false && emptyParamResult.status === 502, "Missing parameter payload from NASA POWER returns status 502 failure");

  // =========================================================================
  // 12. Varanasi Rotation Data Integrity Assertions
  // =========================================================================
  assert(Array.isArray(varanasiSequences) && varanasiSequences.length === 4, "Varanasi API returns exactly 4 tested experimental sequences");
  
  const seqT7 = varanasiSequences.find(s => s.treatmentId === 'T7');
  assert(seqT7 && seqT7.srgeyValueTonnesPerHa === 28.88 && seqT7.exactTablePageRef === "Table 1, p. 718", "API Treatment T7 matches Table 1, p. 718 SRGEY (28.88 t/ha/yr)");

  const seqT10 = varanasiSequences.find(s => s.treatmentId === 'T10');
  assert(seqT10 && seqT10.srgeyValueTonnesPerHa === 25.67 && seqT10.exactTablePageRef === "Table 1, p. 718", "API Treatment T10 matches Table 1, p. 718 SRGEY (25.67 t/ha/yr)");

  const seqT3 = varanasiSequences.find(s => s.treatmentId === 'T3');
  assert(seqT3 && seqT3.srgeyValueTonnesPerHa === 13.73 && seqT3.soilOrganicCarbonPercent === 0.50, "API Treatment T3 matches Table 1 SRGEY (13.73 t/ha/yr) and Table 2 SOC (0.50%)");

  const seqT1 = varanasiSequences.find(s => s.treatmentId === 'T1');
  assert(seqT1 && seqT1.srgeyValueTonnesPerHa === 12.09 && seqT1.soilOrganicCarbonPercent === 0.44, "API Treatment T1 matches Table 1 SRGEY (12.09 t/ha/yr) and Table 2 SOC (0.44%)");

  // =========================================================================
  // 13. Real Express HTTP-Level API Route Integration Tests
  // =========================================================================
  console.log("\n--- STARTING HTTP-LEVEL ROUTE TESTS ON EPHEMERAL LISTENER ---");
  // Use safe non-conflicting local test ports avoiding Windows NAT port reservations
  let httpServer;
  for (const testPort of [8089, 8088, 8087, 8086, 8085, 0]) {
    try {
      httpServer = await new Promise((resolve, reject) => {
        const s = app.listen(testPort, '127.0.0.1', () => resolve(s));
        s.on('error', reject);
      });
      break;
    } catch (_) {
      continue;
    }
  }
  const port = httpServer.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 13a. Anomaly Route: Invalid Coordinates String
    const resInvCoords = await fetch(`${baseUrl}/api/analysis/anomaly?latitude=30.9abc&longitude=75.8&selectedYear=2023`);
    assert(resInvCoords.status === 400, `HTTP GET invalid coordinate '30.9abc' returns HTTP 400 (got ${resInvCoords.status})`);
    const bodyInvCoords = await resInvCoords.json();
    assert(bodyInvCoords.error === "INVALID_COORDINATES", "HTTP response body has error 'INVALID_COORDINATES'");

    // 13b. Anomaly Route: Coordinates Out of Bounds
    const resOutOfBounds = await fetch(`${baseUrl}/api/analysis/anomaly?latitude=95.0&longitude=75.8&selectedYear=2023`);
    assert(resOutOfBounds.status === 400, `HTTP GET latitude 95.0 returns HTTP 400 (got ${resOutOfBounds.status})`);
    const bodyOutOfBounds = await resOutOfBounds.json();
    assert(bodyOutOfBounds.error === "COORDINATES_OUT_OF_BOUNDS", "HTTP response body has error 'COORDINATES_OUT_OF_BOUNDS'");

    // 13c. Anomaly Route: Impossible Calendar Date (02-31)
    const resBadDate = await fetch(`${baseUrl}/api/analysis/anomaly?latitude=30.9&longitude=75.8&startMMDD=02-31&endMMDD=04-30&selectedYear=2023`);
    assert(resBadDate.status === 400, `HTTP GET impossible date '02-31' returns HTTP 400 (got ${resBadDate.status})`);
    const bodyBadDate = await resBadDate.json();
    assert(bodyBadDate.error === "INVALID_CALENDAR_DATE", "HTTP response body has error 'INVALID_CALENDAR_DATE'");

    // 13d. Anomaly Route: Impossible Calendar Date (04-31)
    const resBadDateApr = await fetch(`${baseUrl}/api/analysis/anomaly?latitude=30.9&longitude=75.8&startMMDD=04-31&endMMDD=09-30&selectedYear=2023`);
    assert(resBadDateApr.status === 400, `HTTP GET impossible date '04-31' returns HTTP 400 (got ${resBadDateApr.status})`);
    const bodyBadDateApr = await resBadDateApr.json();
    assert(bodyBadDateApr.error === "INVALID_CALENDAR_DATE", "HTTP response body has error 'INVALID_CALENDAR_DATE'");

    // 13e. Anomaly Route: Leap Date 02-29 in Non-Leap Year 2023
    const resLeapNonLeap = await fetch(`${baseUrl}/api/analysis/anomaly?latitude=30.9&longitude=75.8&startMMDD=02-29&endMMDD=04-30&selectedYear=2023`);
    assert(resLeapNonLeap.status === 400, `HTTP GET 02-29 in non-leap year 2023 returns HTTP 400 (got ${resLeapNonLeap.status})`);
    const bodyLeapNonLeap = await resLeapNonLeap.json();
    assert(bodyLeapNonLeap.error === "INVALID_CALENDAR_DATE", "HTTP response body has error 'INVALID_CALENDAR_DATE' for 02-29 in 2023");
    assert(bodyLeapNonLeap.message.includes('not a valid calendar date in year 2023'), "Error message explicitly identifies non-leap year invalidity");

    // 13f. Anomaly Route: Cross-Year Ending on 02-29 in Non-Leap Year (e.g. 2022 -> 2023)
    const resCrossLeapBad = await fetch(`${baseUrl}/api/analysis/anomaly?latitude=30.9&longitude=75.8&startMMDD=11-01&endMMDD=02-29&selectedYear=2022`);
    assert(resCrossLeapBad.status === 400, `HTTP GET cross-year ending on 02-29 in non-leap year 2023 returns HTTP 400 (got ${resCrossLeapBad.status})`);

    // 13g. Anomaly Route: Malformed Year String
    const resBadYear = await fetch(`${baseUrl}/api/analysis/anomaly?latitude=30.9&longitude=75.8&startMMDD=11-01&endMMDD=04-30&selectedYear=2023abc`);
    assert(resBadYear.status === 400, `HTTP GET malformed year '2023abc' returns HTTP 400 (got ${resBadYear.status})`);
    const bodyBadYear = await resBadYear.json();
    assert(bodyBadYear.error === "INVALID_YEAR", "HTTP response body has error 'INVALID_YEAR'");

    // 13h. Anomaly Route: Year Out of Range (<1981)
    const resOldYear = await fetch(`${baseUrl}/api/analysis/anomaly?latitude=30.9&longitude=75.8&startMMDD=11-01&endMMDD=04-30&selectedYear=1975`);
    assert(resOldYear.status === 400, `HTTP GET out-of-range year 1975 returns HTTP 400 (got ${resOldYear.status})`);
    const bodyOldYear = await resOldYear.json();
    assert(bodyOldYear.error === "YEAR_OUT_OF_RANGE", "HTTP response body has error 'YEAR_OUT_OF_RANGE'");

    // 13i. Anomaly Route: Coordinate Zero (0, 0) is Valid (pre-populated cache verification)
    const cacheKeyZero = `0_0_11-01_04-30_2023`;
    cache.set(cacheKeyZero, {
      timestamp: Date.now(),
      data: {
        latitude: 0,
        longitude: 0,
        selectedSeasonLabel: "Season 2023 (0, 0)",
        selectedSeasonMeanTemp: 26.5,
        baselineMeanTemp: 26.0,
        tempAnomaly: 0.5,
        isCached: true
      }
    });
    const resZero = await fetch(`${baseUrl}/api/analysis/anomaly?latitude=0&longitude=0&startMMDD=11-01&endMMDD=04-30&selectedYear=2023`);
    assert(resZero.status === 200, `HTTP GET coordinate (0, 0) is valid and returns HTTP 200 (got ${resZero.status})`);
    const bodyZero = await resZero.json();
    assert(bodyZero.latitude === 0 && bodyZero.isCached === true, "HTTP response body correctly returned verified data for (0, 0)");

    // 13j. Varanasi Rotation Route: HTTP GET /api/rotation/varanasi
    const resVaranasi = await fetch(`${baseUrl}/api/rotation/varanasi`);
    assert(resVaranasi.status === 200, `HTTP GET /api/rotation/varanasi returns HTTP 200 (got ${resVaranasi.status})`);
    const bodyVaranasi = await resVaranasi.json();
    assert(Array.isArray(bodyVaranasi) && bodyVaranasi.length === 4, "HTTP Varanasi route returns array of 4 sequences");
    assert(bodyVaranasi[0].treatmentId === "T7" && bodyVaranasi[0].srgeyValueTonnesPerHa === 28.88, "HTTP Varanasi route T7 has SRGEY 28.88");

    // 13k. Soil Validation Route: HTTP POST /api/soil/validate (Valid Input)
    const resSoilValid = await fetch(`${baseUrl}/api/soil/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ph: 7.2,
        socPercent: 0.48,
        sampleDate: "2024-01-15",
        testingLaboratory: "Punjab State Agricultural Lab"
      })
    });
    assert(resSoilValid.status === 200, `HTTP POST /api/soil/validate with valid inputs returns HTTP 200 (got ${resSoilValid.status})`);
    const bodySoilValid = await resSoilValid.json();
    assert(bodySoilValid.valid === true, "Valid soil payload returns valid: true");

    // 13l. Soil Validation Route: HTTP POST /api/soil/validate (Invalid pH > 14)
    const resSoilBadPh = await fetch(`${baseUrl}/api/soil/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ph: 16.5 })
    });
    assert(resSoilBadPh.status === 400, `HTTP POST invalid pH 16.5 returns HTTP 400 (got ${resSoilBadPh.status})`);
    const bodySoilBadPh = await resSoilBadPh.json();
    assert(bodySoilBadPh.valid === false && bodySoilBadPh.errors.some(e => e.includes('between 0 and 14')), "Returns error that pH must be between 0 and 14");

    // 13m. Soil Validation Route: HTTP POST /api/soil/validate (Non-numeric pH)
    const resSoilAlphaPh = await fetch(`${baseUrl}/api/soil/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ph: "7.2abc" })
    });
    assert(resSoilAlphaPh.status === 400, `HTTP POST non-numeric pH returns HTTP 400 (got ${resSoilAlphaPh.status})`);
    const bodySoilAlphaPh = await resSoilAlphaPh.json();
    assert(bodySoilAlphaPh.valid === false && bodySoilAlphaPh.errors.some(e => e.includes('strictly numeric')), "Returns error that pH must be strictly numeric");

    // 13n. Soil Validation Route: HTTP POST /api/soil/validate (Future Date)
    const resSoilFuture = await fetch(`${baseUrl}/api/soil/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleDate: "2099-01-01" })
    });
    assert(resSoilFuture.status === 400, `HTTP POST future extraction date returns HTTP 400 (got ${resSoilFuture.status})`);
    const bodySoilFuture = await resSoilFuture.json();
    assert(bodySoilFuture.valid === false && bodySoilFuture.errors.some(e => e.includes('future')), "Returns error that sample date cannot be in the future");

    // 13o. Soil Validation Route: HTTP POST /api/soil/validate (Impossible Calendar Date: 2024-02-31)
    const resSoilFeb31 = await fetch(`${baseUrl}/api/soil/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleDate: "2024-02-31" })
    });
    assert(resSoilFeb31.status === 400, `HTTP POST impossible date 2024-02-31 returns HTTP 400 (got ${resSoilFeb31.status})`);
    const bodySoilFeb31 = await resSoilFeb31.json();
    assert(bodySoilFeb31.valid === false && bodySoilFeb31.errors.some(e => e.includes('impossible or malformed calendar date')), "Returns error that 2024-02-31 is impossible or malformed");

    // 13p. Soil Validation Route: HTTP POST /api/soil/validate (Non-leap February 29: 2023-02-29)
    const resSoilNonLeapFeb29 = await fetch(`${baseUrl}/api/soil/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleDate: "2023-02-29" })
    });
    assert(resSoilNonLeapFeb29.status === 400, `HTTP POST non-leap date 2023-02-29 returns HTTP 400 (got ${resSoilNonLeapFeb29.status})`);
    const bodySoilNonLeapFeb29 = await resSoilNonLeapFeb29.json();
    assert(bodySoilNonLeapFeb29.valid === false && bodySoilNonLeapFeb29.errors.some(e => e.includes('impossible or malformed calendar date')), "Returns error that 2023-02-29 is impossible in non-leap year");

    // 13q. Health & Readiness Route: HTTP GET /api/health
    const resHealth = await fetch(`${baseUrl}/api/health`);
    assert(resHealth.status === 200, `HTTP GET /api/health returns HTTP 200 (got ${resHealth.status})`);
    const bodyHealth = await resHealth.json();
    assert(bodyHealth.status === 'ok' && bodyHealth.service === 'FieldSignals API', "Health check returns status: ok and service identification");

    // 13r. Alternative Health Route: HTTP GET /healthz
    const resHealthz = await fetch(`${baseUrl}/healthz`);
    assert(resHealthz.status === 200, `HTTP GET /healthz returns HTTP 200 (got ${resHealthz.status})`);

    // 13s. Unknown API Route 404 Handler: HTTP GET /api/unknown-endpoint
    const resUnknownApi = await fetch(`${baseUrl}/api/unknown-endpoint`);
    assert(resUnknownApi.status === 404, `HTTP GET /api/unknown-endpoint returns HTTP 404 (got ${resUnknownApi.status})`);
    const bodyUnknownApi = await resUnknownApi.json();
    assert(bodyUnknownApi.error === 'NOT_FOUND', "Unknown API route returns structured JSON error NOT_FOUND");

    // 13t. Malformed JSON Body Protection: HTTP POST with invalid JSON string
    const resBadJson = await fetch(`${baseUrl}/api/soil/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: "{ bad json syntax ..."
    });
    assert(resBadJson.status === 400, `HTTP POST with malformed JSON returns HTTP 400 (got ${resBadJson.status})`);
    const bodyBadJson = await resBadJson.json();
    assert(bodyBadJson.error === 'BAD_REQUEST', "Malformed JSON returns structured BAD_REQUEST error");

  } finally {
    httpServer.close();
  }

  console.log(`\n====================================================`);
  console.log(`🎉 TEST SUMMARY: ${passed}/${total} TESTS PASSED.`);
  console.log(`====================================================`);
}

runTestSuite();
