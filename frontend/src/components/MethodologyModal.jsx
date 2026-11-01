import React, { useEffect, useState } from 'react';

export default function MethodologyModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('reanalysis');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'reanalysis', label: '1. NASA POWER (MERRA-2)' },
    { id: 'baseline', label: '2. Baseline Algorithm' },
    { id: 'layers', label: '3. Satellite & Soil Context' },
    { id: 'varanasi', label: '4. Varanasi Field Trial' },
    { id: 'limits', label: '5. Boundaries & Disclaimers' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="methodology-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-slate-200">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-800 px-6 py-4 bg-slate-900/90">
          <div className="flex items-center space-x-2">
            <span className="text-xl" aria-hidden="true">📖</span>
            <h2 id="methodology-modal-title" className="text-lg font-bold text-white">
              Scientific Methodology, Data Provenance & Citations
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-lg border border-slate-700 text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-sky-500"
            aria-label="Close Methodology Modal"
          >
            ✕ Close
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/60 overflow-x-auto text-xs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 font-semibold border-b-2 transition whitespace-nowrap focus-visible:ring-2 focus-visible:ring-sky-500 ${
                activeTab === tab.id
                  ? 'border-sky-500 text-sky-400 bg-sky-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed">
          {activeTab === 'reanalysis' && (
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white">1. NASA POWER Environmental Data Provenance</h3>
              <p className="text-slate-300">
                Meteorological data is queried live from the <strong>NASA Prediction Of Worldwide Energy Resources (POWER) API v2</strong>, specifically the Agroclimatology (<code>ag</code>) community endpoint.
              </p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <p>• <strong>Product & Underlying Model:</strong> NASA Modern-Era Retrospective Analysis for Research and Applications, Version 2 (<strong>MERRA-2</strong>). Atmospheric data is assimilated into a global grid of <strong>0.5° latitude × 0.625° longitude</strong> (approx. 55 km × 70 km per grid cell).</p>
                <p>• <strong>Model vs. Measurement:</strong> MERRA-2 is a meteorological reanalysis product synthesizing satellite observations and numerical weather models. It is <em>not</em> an in-situ weather station or direct field observation.</p>
                <p>• <strong>Variables Used:</strong> <code>T2M</code> (Mean Daily 2m Temperature in °C) and <code>PRECTOTCORR</code> (Total Precipitation in mm/day, precipitation corrected).</p>
                <p>• <strong>Time Standard:</strong> Daily observations and calendar dates use <strong>Local Solar Time (LST)</strong> as standard on NASA POWER.</p>
                <p>• <strong>Missing Values:</strong> Undefined or invalid readings (coded as <code>-999</code>) are strictly treated as missing data and filtered out before mathematical summation.</p>
              </div>
            </section>
          )}

          {activeTab === 'baseline' && (
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white">2. Computed 1991–2019 Baseline Normal & Anomaly Formula</h3>
              <p className="text-slate-300">
                To evaluate seasonal shifts, FieldSignals computes a reference normal across <strong>29 candidate start years (1991 to 2019)</strong>:
              </p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
                <div>Anomaly = Season_Value - Baseline_Normal</div>
                <div className="text-slate-400">Where Baseline_Normal = (1 / N) * Σ (Season_Values) for all qualifying baseline seasons.</div>
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong>Leap Day Policy:</strong> February 29 is strictly excluded from all calculations to maintain a consistent 365-day index across non-leap and leap years (e.g. Rabi season Nov 1 to Apr 30 is strictly 181 expected days).</li>
                <li><strong>Completeness Rule:</strong> Evaluated independently for temperature and precipitation. A season qualifies only if valid observations meet or exceed <strong>90% of expected season days</strong> (e.g. &ge;163 out of 181 days for Rabi).</li>
                <li><strong>Minimum Qualifying Seasons:</strong> At least <strong>24 of 29 baseline seasons</strong> must qualify. If fewer than 24 qualify, or if upstream network requests fail, baseline calculation is suppressed rather than computed on partial data.</li>
                <li><strong>Classification:</strong> Labeled strictly as a <em>FieldSignals analytical project policy</em>, not an official World Meteorological Organization (WMO) station normal.</li>
              </ul>
            </section>
          )}

          {activeTab === 'layers' && (
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white">3. Third-Party Map Overlays & Local Soil Information</h3>
              <div className="space-y-3">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <h4 className="font-semibold text-sky-400">NASA GIBS MODIS NDVI Layer:</h4>
                  <p className="text-slate-300">
                    Sourced from NASA Global Imagery Browse Services (GIBS), part of ESDIS. Utilizes the <code>MODIS_Terra_L3_NDVI_16Day</code> product in EPSG:3857 Web Mercator.
                  </p>
                  <p className="text-amber-300">
                    <strong>Visual Context Only:</strong> This layer provides a visual backdrop of vegetation greenness. FieldSignals never decodes image pixels into numeric NDVI values to avoid false precision.
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <h4 className="font-semibold text-emerald-400">ISRIC SoilGrids WMS Layer:</h4>
                  <p className="text-slate-300">
                    Sourced from ISRIC — World Soil Information (SoilGrids 250m v2.0). Provides a modeled visual WMS layer of pH in H₂O (0–5 cm depth).
                  </p>
                  <p className="text-amber-300">
                    <strong>Statistical ML Context:</strong> SoilGrids estimates are derived from machine learning models fitted on global profile data and environmental covariates. They do not substitute for a physical soil test.
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <h4 className="font-semibold text-slate-300">User-Provided Soil Data:</h4>
                  <p className="text-slate-300">
                    Local soil entries (pH, SOC %, lab, date) are entered manually by the user. FieldSignals displays a prominent provenance notice indicating that this data has not been independently verified.
                  </p>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'varanasi' && (
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white">4. Varanasi Multi-Cropping Research Case Study</h3>
              <p className="text-slate-300">
                To demonstrate evidence-based rotation options without fabricating unverified crop recommendations, FieldSignals showcases data from a published peer-reviewed field trial:
              </p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <p><strong>Primary Citation:</strong> Saha, S., et al. (2012). <em>Production potential, water productivity and soil properties of rice-based cropping sequences under integrated nutrient management.</em> Indian Journal of Agricultural Sciences 82(8): 717–720. DOI: 10.56093/ijas.v82i8.23061</p>
                <p><strong>Experimental Setup:</strong> 3-year randomized block design (2006–07 to 2008–09), 3 replications, conducted at Banaras Hindu University (BHU) Agricultural Research Farm in Varanasi, India.</p>
                <p><strong>Reported Metrics & Verbatim Values:</strong></p>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li><strong>Treatment T7:</strong> Basmati rice – potato – blackgram = <strong>28.88 t/ha/yr SRGEY</strong> (Table 1, p. 718). Top system productivity.</li>
                  <li><strong>Treatment T10:</strong> Basmati rice – maize (cob) + veg pea (1:2) – greengram = <strong>25.67 t/ha/yr SRGEY</strong> (Table 1, p. 718).</li>
                  <li><strong>Treatment T3:</strong> Early rice – rapeseed – maize (cob) – sesbania (GM) = <strong>13.73 t/ha/yr SRGEY</strong> (Table 1, p. 718) and <strong>0.50% SOC</strong> at 0–15 cm (Table 2, p. 719).</li>
                  <li><strong>Treatment T1 Control:</strong> Rice – wheat = <strong>12.09 t/ha/yr SRGEY</strong> (Table 1, p. 718) and <strong>0.44% SOC</strong> (Table 2, p. 719).</li>
                </ul>
              </div>
            </section>
          )}

          {activeTab === 'limits' && (
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white">5. Scientific Limits & Advisory Disclaimers</h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-slate-300">
                <p>• <strong>Disabled Crop Suitability Scoring:</strong> Numeric crop suitability scores are intentionally disabled to prevent scientific hallucination. Crop suitability requires calibrated cultivar thermal and moisture response functions.</p>
                <p>• <strong>Single-Site Trial Evidence:</strong> The rotation evidence is derived from one published experimental site (Varanasi, India). It demonstrates how field research connects with environmental context, not a universal prescription for arbitrary global locations.</p>
                <p>• <strong>Decision Support, Not Advice:</strong> FieldSignals is an exploratory decision-support tool. It does not provide agronomic advice, yield predictions, or financial forecasts. Farmers should consult certified regional extension officers before modifying crop rotations.</p>
              </div>
            </section>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 px-6 py-3.5 bg-slate-900/90 flex justify-between items-center text-xs">
          <span className="text-slate-400">FieldSignals • NASA Space Apps Challenge 2026</span>
          <button
            type="button"
            onClick={onClose}
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-4 py-2 rounded-lg transition focus-visible:ring-2 focus-visible:ring-sky-500 shadow-sm"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}
