import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import WorkflowRibbon from './components/WorkflowRibbon';
import MapPicker from './components/MapPicker';
import ClimateVisualizer from './components/ClimateVisualizer';
import SoilInputForm from './components/SoilInputForm';
import PriorityFilter from './components/PriorityFilter';
import VaranasiExplorer from './components/VaranasiExplorer';
import FarmerSummary from './components/FarmerSummary';
import MethodologyModal from './components/MethodologyModal';

export default function App() {
  const [latitude, setLatitude] = useState(30.9010);
  const [longitude, setLongitude] = useState(75.8573);
  const [locationLabel, setLocationLabel] = useState("Punjab, India (Rabi Season)");

  const [startMMDD, setStartMMDD] = useState("11-01");
  const [endMMDD, setEndMMDD] = useState("04-30");
  const [selectedYear, setSelectedYear] = useState(2023);

  const [anomalyData, setAnomalyData] = useState(null);
  const [loadingAnomaly, setLoadingAnomaly] = useState(false);
  const [anomalyError, setAnomalyError] = useState(null);

  // Initialize soil data as empty by default (user can click "Load Synthetic Demo Sample")
  const [soilData, setSoilData] = useState({
    ph: '',
    socPercent: '',
    textureClass: '',
    testingLaboratory: '',
    sampleDate: '',
    analyticalMethod: '',
    userConfirmedLocalTest: false
  });

  const [selectedPriority, setSelectedPriority] = useState('PRODUCTIVITY');
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [activeStep, setActiveStep] = useState('step-location');

  // ScrollSpy: Automatically update activeStep in the Workflow Ribbon as the user scrolls
  useEffect(() => {
    const stepIds = ['step-location', 'step-climate', 'step-soil', 'step-evidence', 'step-summary'];
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const ribbonOffset = 180; // Offset for sticky header and ribbon
      
      let currentSection = stepIds[0];
      for (const id of stepIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop - ribbonOffset;
          if (scrollY >= top) {
            currentSection = id;
          }
        }
      }
      setActiveStep(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch seasonal anomaly data with in-flight request cancellation (prevents race conditions)
  useEffect(() => {
    const controller = new AbortController();
    setLoadingAnomaly(true);
    setAnomalyError(null);
    setAnomalyData(null); // Clear previous results so stale data is never presented for a new selection

    const url = `/api/analysis/anomaly?latitude=${latitude}&longitude=${longitude}&startMMDD=${startMMDD}&endMMDD=${endMMDD}&selectedYear=${selectedYear}`;

    fetch(url, { signal: controller.signal })
      .then(async res => {
        if (!res.ok) {
          let errorMsg = `NASA POWER API or Backend Service Notice (HTTP ${res.status})`;
          try {
            const errData = await res.json();
            if (errData && errData.message) {
              errorMsg = `${errData.error ? `[${errData.error}] ` : ''}${errData.message}`;
            }
          } catch (_) {
            if (res.status === 500 || res.status === 502 || res.status === 504) {
              errorMsg = `Backend API server is unreachable on port 8080. Start the server with 'node server.js' (or 'npm start') and click Retry.`;
            }
          }
          throw new Error(errorMsg);
        }
        return res.json();
      })
      .then(data => {
        setAnomalyData(data);
        setLoadingAnomaly(false);
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          // Outdated request superseded by newer selection — silently ignore
          return;
        }
        console.error("Error fetching anomaly data:", err);
        setAnomalyError(err.message || "NASA POWER API query encountered a timeout or network issue. Data suppressed.");
        setLoadingAnomaly(false);
      });

    return () => {
      controller.abort();
    };
  }, [latitude, longitude, startMMDD, endMMDD, selectedYear, retryTrigger]);

  const handleSelectCoordinates = (lat, lon) => {
    setLatitude(lat);
    setLongitude(lon);
    setLocationLabel(`Custom Location (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)`);
  };

  const handlePresetSelect = (lat, lon, label) => {
    setLatitude(lat);
    setLongitude(lon);
    setLocationLabel(label);
  };

  const hasSoil = soilData && !soilData.hasErrors && (soilData.ph !== '' || soilData.socPercent !== '' || soilData.testingLaboratory !== '');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <Header onOpenMethodology={() => setIsMethodologyOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Step Journey Progress Ribbon */}
        <WorkflowRibbon
          activeSection={activeStep}
          onNavigate={(id) => setActiveStep(id)}
          locationLabel={locationLabel}
          selectedSeasonLabel={anomalyData?.selectedSeasonLabel}
          hasClimateData={!!anomalyData && !loadingAnomaly}
          hasSoilData={hasSoil}
        />

        {/* Step 1: Location & Growing Season Setup */}
        <section id="step-location" aria-label="Location and Growing Season Selection" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MapPicker
              latitude={latitude}
              longitude={longitude}
              onSelectCoordinates={handleSelectCoordinates}
              onPresetSelect={handlePresetSelect}
            />
          </div>

          {/* Season Setup Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-base" aria-hidden="true">📅</span>
                <h3 className="text-base font-semibold text-white">
                  Growing Season Selection
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Define the seasonal dates for anomaly computation. Cross-year seasons (e.g. Nov–Apr) are indexed by their start year.
              </p>

              <div className="space-y-4 text-xs">
                <div>
                  <label htmlFor="season-preset-select" className="block text-slate-300 font-medium mb-1">
                    Season Type / Preset Window:
                  </label>
                  <select
                    id="season-preset-select"
                    value={`${startMMDD}_${endMMDD}`}
                    onChange={(e) => {
                      const [s, end] = e.target.value.split('_');
                      setStartMMDD(s);
                      setEndMMDD(end);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500 font-medium"
                  >
                    <option value="11-01_04-30">Rabi Season (Nov 01 – Apr 30, 181 Days)</option>
                    <option value="05-01_09-30">Summer / Kharif (May 01 – Sep 30, 153 Days)</option>
                    <option value="03-01_06-30">Long Rains / Spring (Mar 01 – Jun 30, 122 Days)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="season-year-select" className="block text-slate-300 font-medium mb-1">
                    Target Season Start Year:
                  </label>
                  <select
                    id="season-year-select"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500 font-medium"
                  >
                    <option value={2023}>2023 Season (Nov 2023 – Apr 2024)</option>
                    <option value={2022}>2022 Season (Nov 2022 – Apr 2023)</option>
                    <option value={2021}>2021 Season (Nov 2021 – Apr 2022)</option>
                    <option value={2020}>2020 Season (Nov 2020 – Apr 2021)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Time Standard Notice */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300 flex items-center space-x-1.5">
                <span aria-hidden="true">⏱️</span>
                <span>Time Standard & Leap Day Policy:</span>
              </p>
              <p>• Local Solar Time (LST) used exclusively as provided by NASA POWER.</p>
              <p>• February 29 excluded from calculations to maintain uniform 365-day index alignment.</p>
            </div>
          </div>
        </section>

        {/* Step 2: NASA Environmental Data Visualizer */}
        <div id="step-climate">
          <ClimateVisualizer
            anomalyData={anomalyData}
            loading={loadingAnomaly}
            error={anomalyError}
            onRetry={() => setRetryTrigger(c => c + 1)}
          />
        </div>

        {/* Step 3: Local Soil Input Form (Optional) */}
        <div id="step-soil">
          <SoilInputForm
            soilData={soilData}
            onSoilChange={(updated) => setSoilData(updated)}
          />
        </div>

        {/* Step 4: Farmer Priority Filters */}
        <PriorityFilter
          selectedPriority={selectedPriority}
          onPriorityChange={(priority) => setSelectedPriority(priority)}
        />

        {/* Step 5: Historical Varanasi Case Study Showcase */}
        <div id="step-evidence">
          <VaranasiExplorer selectedPriority={selectedPriority} />
        </div>

        {/* Step 6: Deterministic Farmer Summary */}
        <div id="step-summary">
          <FarmerSummary
            anomalyData={anomalyData}
            soilData={soilData}
            selectedPriority={selectedPriority}
            locationLabel={locationLabel}
          />
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 px-4 sm:px-6 text-center text-xs text-slate-500 mt-12 space-y-1">
        <p className="font-medium text-slate-400">
          FieldSignals — Climate-Adaptive Agronomic Intelligence Powered by NASA Earth Observations
        </p>
        <p className="text-[11px]">
          Data sources: NASA POWER MERRA-2 Atmospheric Reanalysis • NASA GIBS WMTS • ISRIC SoilGrids WMS • OpenStreetMap Contributors.
        </p>
        <p className="text-[11px] text-slate-600">
          NASA Space Apps Challenge 2026 Project • Non-commercial research prototype.
        </p>
      </footer>

      {/* Methodology Modal */}
      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />
    </div>
  );
}
