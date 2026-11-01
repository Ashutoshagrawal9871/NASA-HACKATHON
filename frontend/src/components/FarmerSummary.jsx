import React, { useState } from 'react';

export default function FarmerSummary({ anomalyData, soilData, selectedPriority, locationLabel }) {
  const [copied, setCopied] = useState(false);

  if (!anomalyData) return null;

  const {
    selectedSeasonLabel,
    selectedSeasonMeanTemp,
    tempAnomaly,
    selectedSeasonTotalRain,
    rainAnomaly,
    selectedSeasonValidDaysTemp,
    selectedSeasonValidDaysRain,
    selectedSeasonExpectedDays,
    qualifyingBaselineSeasonsCount,
    timeStandard
  } = anomalyData;

  const hasSoilErrors = soilData && soilData.hasErrors;
  const isDemo = soilData?.testingLaboratory?.includes('Synthetic Example');
  const hasSoil = soilData && !hasSoilErrors && (soilData.ph !== '' || soilData.socPercent !== '' || soilData.testingLaboratory !== '');

  const generatePlainText = () => {
    let text = `FIELDSIGNALS EXPLORATORY DECISION-SUPPORT REPORT\n`;
    text += `====================================================\n`;
    text += `Narrative Walkthrough: Punjab → NASA Climate Signal → Soil Context → Varanasi Trial Chain\n`;
    text += `Location: ${locationLabel}\n`;
    text += `Season: ${selectedSeasonLabel}\n\n`;

    text += `1. EVIDENCE CARD 1: NASA POWER METEOROLOGICAL REANALYSIS (MERRA-2)\n`;
    if (selectedSeasonMeanTemp != null) {
      text += `• Daily Mean Temperature: ${selectedSeasonMeanTemp.toFixed(2)} °C (${selectedSeasonValidDaysTemp ?? 0}/${selectedSeasonExpectedDays} valid days, ${timeStandard})\n`;
      text += `  1991–2019 Baseline Normal Anomaly: ${tempAnomaly >= 0 ? `+${tempAnomaly.toFixed(2)}` : tempAnomaly.toFixed(2)} °C (${qualifyingBaselineSeasonsCount} qualifying baseline seasons)\n`;
    } else {
      text += `• Daily Mean Temperature: SUPPRESSED (<90% completeness threshold)\n`;
    }
    if (selectedSeasonTotalRain != null) {
      text += `• Accumulated Precipitation: ${selectedSeasonTotalRain.toFixed(1)} mm (${selectedSeasonValidDaysRain ?? 0}/${selectedSeasonExpectedDays} valid days)\n`;
      text += `  1991–2019 Baseline Normal Anomaly: ${rainAnomaly >= 0 ? `+${rainAnomaly.toFixed(1)}` : rainAnomaly.toFixed(1)} mm\n`;
    } else {
      text += `• Accumulated Precipitation: SUPPRESSED (<90% completeness threshold)\n`;
    }

    text += `\n2. EVIDENCE CARD 2: MODELED SOIL MAP CONTEXT (SOILGRIDS WMS)\n`;
    text += `• Source: ISRIC SoilGrids 250m machine-learning prediction (Topsoil pH 0–5 cm).\n`;
    text += `• Boundary: Statistical spatial interpolation, not a local chemical test.\n`;

    text += `\n3. EVIDENCE CARD 3: LOCAL CHEMICAL SOIL TEST (USER-REPORTED)\n`;
    if (hasSoilErrors) {
      text += `• ⚠️ Local soil form has active validation errors. Data excluded from summary.\n`;
    } else if (hasSoil) {
      text += `• Laboratory: ${soilData.testingLaboratory || 'Unspecified'} (${isDemo ? 'SYNTHETIC DEMO' : 'User-Provided'})\n`;
      text += `• Sample Date: ${soilData.sampleDate || 'Unspecified'}\n`;
      text += `• Soil pH: ${soilData.ph || 'N/A'}\n`;
      text += `• Soil Organic Carbon: ${soilData.socPercent != null ? soilData.socPercent + '%' : 'N/A'}\n`;
      text += `• Texture Class: ${soilData.textureClass || 'Unspecified'}\n`;
      text += `• Provenance: External lab document, unverified by FieldSignals.\n`;
    } else {
      text += `• No local soil report entered. Environmental analysis operates independently.\n`;
    }

    text += `\n4. EVIDENCE CARD 4: HISTORICAL AGRONOMIC FIELD TRIAL (SAHA ET AL. 2012)\n`;
    text += `• Site: BHU Agricultural Research Farm, Varanasi (2006–09, 3-year irrigated rice-wheat trial on sandy clay loam)\n`;
    text += `• Top Experimental Yield Sequence: Basmati rice – potato – blackgram (T7) = 28.88 t/ha/yr SRGEY (Table 1, p. 718)\n`;
    text += `• Soil Health Trial: Early rice – rapeseed – maize – sesbania GM (T3) = 0.50% SOC vs 0.44% control (Table 2, p. 719)\n`;
    text += `• What Was NOT Measured: No economic profitability ($ / ₹) or water conservation volume (m³/ha) reported.\n`;

    text += `\n5. SCIENTIFIC RESTRAINT & ADVISORY BOUNDARY:\n`;
    text += `• FieldSignals provides exploratory climate reanalysis and historical research records only.\n`;
    text += `• Limitation: Historical rotation evidence is strictly limited to one study at a single research site (Varanasi, India).\n`;
    text += `• This report does NOT constitute a weather forecast, crop yield prediction, or agronomic advice. Consult certified local agricultural extension officers before making farming decisions.\n`;
    text += `====================================================\n`;
    return text;
  };

  const handleCopy = () => {
    const text = generatePlainText();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section aria-labelledby="summary-heading" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5 print:border-none print:shadow-none print:p-0">
      {/* Top Header & Export Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 id="summary-heading" className="text-base font-bold text-white flex items-center gap-2">
              <span>📋 Step 5: Farmer & Agronomist Evidence Synthesis Report</span>
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-700">
              Deterministic Summary
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Synthesis across the 4 distinct evidence cards: NASA reanalysis, modeled soil, local lab tests, and historical field trials.
          </p>
        </div>

        {/* Export / Print Buttons */}
        <div className="flex items-center gap-2 no-print">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition focus-visible:ring-2 focus-visible:ring-sky-500 shadow-sm"
            title="Copy plain-text summary to clipboard"
          >
            <span>{copied ? '✓ Copied!' : '📋 Copy Text'}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition focus-visible:ring-2 focus-visible:ring-sky-500 shadow-sm"
            title="Print or export summary as PDF"
          >
            <span>🖨️ Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* 4 Structured Synthesis Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        
        {/* Section 1: NASA Environmental Context */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-start">
            <strong className="text-sky-300 font-semibold block text-sm">
              1. NASA Climate Signal (MERRA-2 Reanalysis)
            </strong>
            <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-800 px-1.5 py-0.5 rounded font-mono">
              Card 1
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Atmospheric conditions from NASA POWER MERRA-2 meteorological reanalysis for {locationLabel}:
          </p>
          <div className="space-y-1 font-mono text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
            <div>
              • <strong>Mean Temperature:</strong> {selectedSeasonMeanTemp != null ? `${selectedSeasonMeanTemp.toFixed(2)} °C` : 'Suppressed'}
              {tempAnomaly != null && (
                <span className={`ml-2 font-bold ${tempAnomaly >= 0 ? 'text-rose-400' : 'text-sky-400'}`}>
                  ({tempAnomaly >= 0 ? `+${tempAnomaly.toFixed(2)}` : tempAnomaly.toFixed(2)} °C anomaly)
                </span>
              )}
            </div>
            <div>
              • <strong>Precipitation:</strong> {selectedSeasonTotalRain != null ? `${selectedSeasonTotalRain.toFixed(1)} mm` : 'Suppressed'}
              {rainAnomaly != null && (
                <span className={`ml-2 font-bold ${rainAnomaly >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  ({rainAnomaly >= 0 ? `+${rainAnomaly.toFixed(1)}` : rainAnomaly.toFixed(1)} mm anomaly)
                </span>
              )}
            </div>
            <div className="text-slate-500 text-[10px] pt-1 border-t border-slate-800">
              Coverage: {selectedSeasonValidDaysTemp ?? 0}/{selectedSeasonExpectedDays}d temp, {selectedSeasonValidDaysRain ?? 0}/{selectedSeasonExpectedDays}d rain ({timeStandard})
            </div>
          </div>
        </div>

        {/* Section 2: Local Soil Report Context */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-start">
            <strong className="text-emerald-300 font-semibold block text-sm">
              2. Soil Context (Modeled vs Lab Test)
            </strong>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono">
              Cards 2 & 3
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Distinguishing regional modeled SoilGrids WMS machine learning prediction from farm-level soil test chemistry:
          </p>
          {hasSoilErrors ? (
            <div className="bg-rose-950/40 border border-rose-900/60 p-2.5 rounded-lg text-rose-300 text-[11px]">
              ⚠️ Local soil entries have active validation errors and were excluded from this summary.
            </div>
          ) : hasSoil ? (
            <div className="space-y-1 font-mono text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <div>• <strong>pH:</strong> {soilData.ph || 'N/A'} (1:2.5 H₂O suspension)</div>
              <div>• <strong>SOC:</strong> {soilData.socPercent ? `${soilData.socPercent}%` : 'N/A'} (Dry mass)</div>
              <div>• <strong>Texture:</strong> {soilData.textureClass || 'Unspecified'}</div>
              <div>• <strong>Lab:</strong> {soilData.testingLaboratory || 'Unspecified'} {isDemo ? '(Synthetic Demo)' : ''}</div>
              <div className="text-slate-500 text-[10px] pt-1 border-t border-slate-800">
                Provenance: {isDemo ? 'Synthetic Demo Placeholder' : 'User-Provided Document (Unverified)'}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-400">
              No farm-level soil test entered. Soil context is optional. Use the SoilGrids map overlay in Step 1 for regional topsoil pH context.
            </div>
          )}
        </div>

        {/* Section 3: Varanasi Agronomic Field Trial Evidence */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-start">
            <strong className="text-purple-300 font-semibold block text-sm">
              3. Agronomic Trial Chain (Saha et al. 2012)
            </strong>
            <span className="text-[10px] bg-purple-950 text-purple-400 border border-purple-800 px-1.5 py-0.5 rounded font-mono">
              Card 4
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Controlled 3-year field study at BHU Farm, Varanasi (irrigated alluvial soil):
          </p>
          <div className="space-y-1.5 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 text-slate-300">
            <div>
              • <strong>Top Experimental Yield (T7):</strong> Basmati rice – potato – blackgram = <strong className="text-white">28.88 t/ha/yr SRGEY</strong> (Table 1, p. 718).
            </div>
            <div>
              • <strong>Soil Health Trial (T3):</strong> Early rice – rapeseed – maize – sesbania GM = <strong className="text-emerald-400">0.50% SOC</strong> vs 0.44% control in T1 (Table 2, p. 719).
            </div>
            <div className="text-rose-300/90 text-[10px] pt-1 border-t border-slate-800">
              ❌ Unmeasured: Saha et al. (2012) did NOT evaluate economic net margin ($ / ₹) or water consumption (m³/ha).
            </div>
          </div>
        </div>

        {/* Section 4: Scientific Boundaries & Honest Limitation */}
        <div className="bg-slate-950 p-4 rounded-xl border border-amber-900/50 space-y-2">
          <strong className="text-amber-300 font-semibold block text-sm">
            4. Scientific Restraint & Limitations
          </strong>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            FieldSignals provides exploratory climate reanalysis and historical research records only:
          </p>
          <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
            <li><strong>Single Site Limitation:</strong> Rotation evidence is strictly bounded to one 3-year historical trial at Varanasi, India.</li>
            <li><strong>Not A Universal Recommendation:</strong> FieldSignals does not generate automated farm advice, crop rankings, or profitability promises.</li>
            <li><strong>Action:</strong> Consult certified local agricultural extension agents and soil testing laboratories before making planting or rotation changes.</li>
          </ul>
        </div>

      </div>

      {/* Narrative Script Pill Bar for Presentation */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-slate-400 font-medium">
          🎬 Presentation Script:
        </span>
        <div className="text-[11px] text-slate-300 font-mono">
          1. Choose Punjab → 2. Read NASA Signal (-1.18°C, +5.2mm) → 3. Distinguish Soil Data → 4. Show Varanasi Evidence Chain & Limitations
        </div>
      </div>
    </section>
  );
}
