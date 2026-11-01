// Production Smoke Test for FieldSignals Unified Service
// Verifies that Express successfully serves both the REST API and the built Vite SPA from /dist
import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

if (!fs.existsSync(distPath)) {
  console.error("❌ ERROR: 'frontend/dist' does not exist. Run 'npm run build' before running the production smoke test.");
  process.exit(1);
}

const TEST_PORT = 8095;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForServerReady(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.status === 200) return true;
    } catch (_) {}
    await sleep(200);
  }
  return false;
}

async function runProductionSmokeTest() {
  console.log("======================================================");
  console.log("🚀 STARTING PRODUCTION SMOKE TEST ON UNIFIED SERVICE");
  console.log(`   Target: Single process serving API + built Vite SPA`);
  console.log(`   Port: ${TEST_PORT} | Node Env: production`);
  console.log("======================================================");

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

  // 1. Spawn production server process
  const env = { ...process.env, PORT: String(TEST_PORT), NODE_ENV: 'production' };
  const serverProcess = spawn('node', ['server.js'], {
    cwd: __dirname,
    env,
    stdio: 'pipe'
  });

  serverProcess.stderr.on('data', data => {
    // Only print actual error messages, not standard deprecation warnings
    const msg = data.toString();
    if (!msg.includes('ExperimentalWarning')) {
      process.stderr.write(`[server stderr] ${msg}`);
    }
  });

  try {
    const isReady = await waitForServerReady();
    assert(isReady, "Production server started and responded on /api/health within timeout");
    if (!isReady) {
      throw new Error("Server failed to become ready");
    }

    // 2. Test /api/health
    const resHealth = await fetch(`${BASE_URL}/api/health`);
    assert(resHealth.status === 200, `GET /api/health returns HTTP 200 (got ${resHealth.status})`);
    const bodyHealth = await resHealth.json();
    assert(bodyHealth.status === 'ok' && bodyHealth.service === 'FieldSignals API', "Health endpoint confirms operational service without exposing internals");

    // 3. Test /api/rotation/varanasi (Case Study API)
    const resVaranasi = await fetch(`${BASE_URL}/api/rotation/varanasi`);
    assert(resVaranasi.status === 200, `GET /api/rotation/varanasi returns HTTP 200 (got ${resVaranasi.status})`);
    const bodyVaranasi = await resVaranasi.json();
    assert(Array.isArray(bodyVaranasi) && bodyVaranasi.length === 4, "Varanasi route returns exactly 4 cited research treatments");
    const t7 = bodyVaranasi.find(s => s.treatmentId === 'T7');
    assert(t7 && t7.srgeyValueTonnesPerHa === 28.88, "T7 treatment returns exact cited SRGEY 28.88 t/ha/yr");

    // 4. Test /api/soil/validate (Soil API with validation)
    const resSoilValid = await fetch(`${BASE_URL}/api/soil/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ph: 7.0, socPercent: 0.50, sampleDate: "2024-01-15" })
    });
    assert(resSoilValid.status === 200, "POST /api/soil/validate with valid inputs returns HTTP 200");

    const resSoilBad = await fetch(`${BASE_URL}/api/soil/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ph: 16.5 })
    });
    assert(resSoilBad.status === 400, "POST /api/soil/validate with invalid pH returns HTTP 400");

    // 5. Test Frontend Static Asset Serving: Root HTML (SPA)
    const resRoot = await fetch(`${BASE_URL}/`);
    assert(resRoot.status === 200, `GET / serves production index.html (HTTP ${resRoot.status})`);
    const rootHtml = await resRoot.text();
    assert(rootHtml.includes('id="root"') && rootHtml.includes('FieldSignals'), "Root HTML contains React mount container and FieldSignals title");

    // 6. Test Favicon Asset Serving
    const resFavicon = await fetch(`${BASE_URL}/favicon.svg`);
    assert(resFavicon.status === 200, `GET /favicon.svg returns HTTP 200 (got ${resFavicon.status})`);

    // 7. Test API 404 Isolation (Ensures unhandled API routes return JSON 404, NOT the SPA HTML!)
    const resUnknownApi = await fetch(`${BASE_URL}/api/unregistered-route-xyz`);
    assert(resUnknownApi.status === 404, `GET /api/unregistered-route-xyz returns HTTP 404 (got ${resUnknownApi.status})`);
    const bodyUnknownApi = await resUnknownApi.json();
    assert(bodyUnknownApi.error === 'NOT_FOUND', "Unknown API route returns structured JSON 404 without swallowing API errors");

    // 8. Test SPA Wildcard Route Fallback (Non-API client-side route serves index.html)
    const resSpaRoute = await fetch(`${BASE_URL}/methodology-preview`);
    assert(resSpaRoute.status === 200, `GET /methodology-preview serves SPA index.html (HTTP ${resSpaRoute.status})`);
    const spaHtml = await resSpaRoute.text();
    assert(spaHtml.includes('id="root"'), "Client-side fallback route serves SPA index.html correctly");

  } finally {
    console.log("\nStopping production test server process...");
    if (serverProcess.pid) {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', serverProcess.pid.toString(), '/T', '/F'], { shell: true });
      } else {
        serverProcess.kill('SIGTERM');
      }
    }
  }

  console.log(`\n======================================================`);
  console.log(`🎉 PRODUCTION SMOKE TEST SUMMARY: ${passed}/${total} CHECKS PASSED.`);
  console.log(`======================================================`);

  if (passed !== total) {
    process.exit(1);
  }
}

runProductionSmokeTest().catch(err => {
  console.error("Fatal error during smoke test:", err);
  process.exit(1);
});
