import React, { useState, useEffect } from 'react';

export default function ClimateVisualizer({ anomalyData, loading, error, onRetry }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger smooth bar animations after initial mount
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, [anomalyData]);

  if (loading) {
    return (
      <section aria-labelledby="climate-heading" className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-sky-500 border-t-transparent" aria-hidden="true"></div>
          <div>
            <h3 id="climate-heading" className="text-base font-semibold text-white">
              Querying NASA POWER Reanalysis & Computing 1991–2019 Baseline...
            </h3>
            <p className="text-xs text-slate-400">
              Fetching daily T2M & PRECTOTCORR in Local Solar Time (LST) across 29 candidate seasons in parallel batches.
            </p>
          </div>
        </div>

        {/* Skeleton preview cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 space-y-3 animate-pulse">
            <div className="h-4 bg-slate-800 rounded w-1/3"></div>
            <div className="h-8 bg-slate-800 rounded w-1/2"></div>
            <div className="h-3 bg-slate-800 rounded w-full"></div>
            <div className="h-2 bg-slate-800 rounded w-3/4"></div>
          </div>
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 space-y-3 animate-pulse">
            <div className="h-4 bg-slate-800 rounded w-1/3"></div>
            <div className="h-8 bg-slate-800 rounded w-1/2"></div>
            <div className="h-3 bg-slate-800 rounded w-full"></div>
            <div className="h-2 bg-slate-800 rounded w-3/4"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !anomalyData) {
    return (
      <section aria-labelledby="climate-heading" className="bg-slate-900 border border-amber-900/60 rounded-xl p-6 shadow-xl space-y-3">
        <div className="flex items-start space-x-3">
          <span className="text-2xl" aria-hidden="true">⚠️</span>
          <div className="flex-1">
            <h3 id="climate-heading" className="text-base font-semibold text-amber-300">
              NASA POWER API Service Notice / Network Fallback
            </h3>
            <p className="text-xs text-slate-300 mt-1 font-mono">
              {error || "NASA POWER API is temporarily unreachable or experiencing an upstream timeout."}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Environmental anomaly charts are suspended to prevent guessing. The local soil form and the cited Varanasi rotation showcase remain fully accessible below.
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                🔄 Retry NASA POWER Query
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  const {
    selectedSeasonLabel,
    selectedSeasonValidDaysTemp,
    selectedSeasonValidDaysRain,
    selectedSeasonExpectedDays,
    selectedSeasonCoverageRatioTemp,
    selectedSeasonCoverageRatioRain,
    selectedSeasonCoverageRatio,
    selectedSeasonSufficientCoverage,
    selectedSeasonMeanTemp,
    baselineMeanTemp,
    tempAnomaly,
    selectedSeasonTotalRain,
    baselineMeanTotalRain,
    rainAnomaly,
    qualifyingBaselineSeasonsCount,
    totalCandidateBaselineSeasons,
    baselineValid,
    baselineUpstreamFailuresCount,
    baselineFailedYears,
    baselineStatusNotice,
    timeStandard,
    dataDisclaimer,
    isCached,
    cacheTimestamp
  } = anomalyData;

  const isTempSufficient = (selectedSeasonCoverageRatioTemp ?? 0) >= 0.90 && selectedSeasonMeanTemp !== null;
  const isRainSufficient = (selectedSeasonCoverageRatioRain ?? 0) >= 0.90 && selectedSeasonTotalRain !== null;

  // Temperature scale calculation for comparative visual gauge
  const minTempScale = Math.min(selectedSeasonMeanTemp ?? 15, baselineMeanTemp ?? 15) - 3;
  const maxTempScale = Math.max(selectedSeasonMeanTemp ?? 25, baselineMeanTemp ?? 25) + 3;
  const tempRange = Math.max(1, maxTempScale - minTempScale);
  const baselineTempPct = baselineMeanTemp !== null ? Math.max(5, Math.min(95, ((baselineMeanTemp - minTempScale) / tempRange) * 100)) : 50;
  const targetSelectedTempPct = selectedSeasonMeanTemp !== null ? Math.max(5, Math.min(95, ((selectedSeasonMeanTemp - minTempScale) / tempRange) * 100)) : 50;
  const activeSelectedTempPct = mounted ? targetSelectedTempPct : baselineTempPct;

  // Rain scale calculation for comparative bars
  const maxRainScale = Math.max(selectedSeasonTotalRain ?? 100, baselineMeanTotalRain ?? 100, 10) * 1.25;
  const targetSelectedRainPct = selectedSeasonTotalRain !== null ? Math.min(100, Math.max(3, (selectedSeasonTotalRain / maxRainScale) * 100)) : 0;
  const activeSelectedRainPct = mounted ? targetSelectedRainPct : 0;
  const baselineRainPct = baselineMeanTotalRain !== null ? Math.min(100, Math.max(3, (baselineMeanTotalRain / maxRainScale) * 100)) : 0;

  return (
    <section aria-labelledby="climate-heading" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
      {/* Top Header & Coverage Badge Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/80">
              Evidence Card 1 • NASA Meteorological Reanalysis
            </span>
            {isCached && (
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono font-medium">
                ⚡ Process Cache (24h TTL)
              </span>
            )}
          </div>
          <h3 id="climate-heading" className="text-base font-bold text-white flex items-center gap-2">
            <span>🛰️ Step 2: Atmospheric Climate Signal vs 1991–2019 Normal</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">{selectedSeasonLabel}</p>
        </div>

        {/* Coverage Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className={`px-2.5 py-1 rounded-lg border font-medium flex items-center space-x-1.5 ${
            isTempSufficient ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' : 'bg-amber-950/80 text-amber-300 border-amber-800'
          }`}>
            <span aria-hidden="true">{isTempSufficient ? '✓' : '⚠️'}</span>
            <span>Temp Coverage: {((selectedSeasonCoverageRatioTemp ?? 0) * 100).toFixed(1)}%</span>
            <span className="text-[11px] opacity-80 font-mono">({selectedSeasonValidDaysTemp ?? 0}/{selectedSeasonExpectedDays}d)</span>
          </div>

          <div className={`px-2.5 py-1 rounded-lg border font-medium flex items-center space-x-1.5 ${
            isRainSufficient ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' : 'bg-amber-950/80 text-amber-300 border-amber-800'
          }`}>
            <span aria-hidden="true">{isRainSufficient ? '✓' : '⚠️'}</span>
            <span>Rain Coverage: {((selectedSeasonCoverageRatioRain ?? 0) * 100).toFixed(1)}%</span>
            <span className="text-[11px] opacity-80 font-mono">({selectedSeasonValidDaysRain ?? 0}/{selectedSeasonExpectedDays}d)</span>
          </div>

          <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded-lg border border-slate-700 text-[11px]">
            {timeStandard}
          </span>
        </div>
      </div>

      {/* Narrative Context Banner: The Punjab Signal */}
      <div className="bg-sky-950/30 border border-sky-800/50 p-3 rounded-lg text-xs text-sky-200 flex items-start space-x-2">
        <span className="text-base" aria-hidden="true">💡</span>
        <div className="leading-relaxed">
          <strong className="text-white">Narrative Anchor:</strong> For the selected winter Rabi season in Punjab, NASA POWER MERRA-2 reanalysis reveals the atmospheric baseline context ({selectedSeasonValidDaysTemp ?? 0}/{selectedSeasonExpectedDays} valid days, Feb 29 strictly excluded). Compare this regional climate signal against the historical crop rotations tested at Varanasi below.
        </div>
      </div>

      {/* Comparison Grid (Side-by-Side Visualizations) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* ================= TEMPERATURE VISUAL CARD ================= */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Daily Mean 2m Temperature (T2M)
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Seasonal mean vs 1991–2019 baseline normal
              </div>
            </div>
            <span className="text-xs bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded font-mono">
              °C
            </span>
          </div>

          {isTempSufficient ? (
            <div className="space-y-4">
              {/* Primary Numbers */}
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-900 pb-3">
                <div>
                  <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
                    {selectedSeasonMeanTemp.toFixed(2)}
                  </span>
                  <span className="text-sm text-slate-400 ml-1">°C</span>
                  <span className="text-xs text-slate-400 block mt-0.5">Selected Season Mean</span>
                </div>

                {baselineMeanTemp !== null ? (
                  <div className="text-right">
                    <div className={`text-base font-bold flex items-center justify-end space-x-1 tabular-nums ${
                      tempAnomaly >= 0 ? 'text-rose-400' : 'text-sky-400'
                    }`}>
                      <span aria-hidden="true">{tempAnomaly >= 0 ? '▲' : '▼'}</span>
                      <span>{tempAnomaly >= 0 ? `+${tempAnomaly.toFixed(2)}` : tempAnomaly.toFixed(2)} °C</span>
                    </div>
                    <span className="text-xs text-slate-400 block">
                      {tempAnomaly >= 0 ? 'Warmer than baseline normal' : 'Cooler than baseline normal'}
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-amber-400 bg-amber-950/60 px-2 py-1 rounded border border-amber-800">
                    Baseline Suppressed
                  </div>
                )}
              </div>

              {/* Comparative Differential Visual Scale (Animated) */}
              {baselineMeanTemp !== null && (
                <div className="space-y-2 pt-1" aria-label="Temperature baseline comparison scale">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Baseline Normal: <strong className="text-slate-200">{baselineMeanTemp.toFixed(2)} °C</strong></span>
                    <span>Selected Season: <strong className="text-white">{selectedSeasonMeanTemp.toFixed(2)} °C</strong></span>
                  </div>

                  {/* Horizontal Range Bar */}
                  <div className="relative h-7 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center">
                    {/* Differential band between baseline and selected */}
                    <div
                      className={`absolute top-0 bottom-0 ${tempAnomaly >= 0 ? 'bg-rose-500/25 border-rose-500/50' : 'bg-sky-500/25 border-sky-500/50'} border-y transition-all duration-1000 ease-out motion-reduce:transition-none`}
                      style={{
                        left: `${Math.min(baselineTempPct, activeSelectedTempPct)}%`,
                        width: `${Math.abs(activeSelectedTempPct - baselineTempPct)}%`
                      }}
                      title={`Anomaly Span: ${Math.abs(tempAnomaly).toFixed(2)} °C`}
                    ></div>

                    {/* Baseline Reference Marker (Dashed Line) */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-300 z-10 shadow"
                      style={{ left: `${baselineTempPct}%` }}
                    >
                      <div className="absolute -top-1 -translate-x-1/2 bg-slate-200 text-slate-900 text-[9px] font-bold px-1 rounded-sm uppercase tracking-tighter">
                        Base
                      </div>
                    </div>

                    {/* Selected Season Marker (Solid Pill with animation) */}
                    <div
                      className={`absolute top-0 bottom-0 w-1.5 ${tempAnomaly >= 0 ? 'bg-rose-400 shadow-rose-500/50' : 'bg-sky-400 shadow-sky-500/50'} z-20 shadow-md transition-all duration-1000 ease-out motion-reduce:transition-none`}
                      style={{ left: `${activeSelectedTempPct}%` }}
                    >
                      <div className={`absolute -bottom-1 -translate-x-1/2 ${tempAnomaly >= 0 ? 'bg-rose-500' : 'bg-sky-500'} text-white text-[9px] font-bold px-1 rounded-sm uppercase tracking-tighter`}>
                        Obs
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>{minTempScale.toFixed(0)} °C</span>
                    <span>Reference Scale</span>
                    <span>{maxTempScale.toFixed(0)} °C</span>
                  </div>
                </div>
              )}

              {/* Baseline Metadata Note */}
              <div className="text-[11px] text-slate-400 border-t border-slate-900 pt-2">
                {baselineMeanTemp !== null ? (
                  <p>
                    • 1991–2019 Baseline: <strong className="text-slate-300">{baselineMeanTemp.toFixed(2)} °C</strong> ({qualifyingBaselineSeasonsCount}/{totalCandidateBaselineSeasons} qualifying seasons, ≥90% completeness each).
                  </p>
                ) : (
                  <p className="text-amber-400">
                    ⚠️ {baselineStatusNotice}
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Insufficient data is kept visibly blank — never animated as zero */
            <div className="bg-slate-900/50 border border-dashed border-amber-800/80 p-5 rounded-lg text-xs text-amber-300 space-y-2 text-center">
              <span className="text-xl block">⚠️</span>
              <strong className="block text-amber-200">Temperature Data Suppressed</strong>
              <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
                Selected season valid daily observations fell below the 90% completeness threshold ({selectedSeasonValidDaysTemp ?? 0}/{selectedSeasonExpectedDays} valid days). Data bar is kept visibly blank rather than rendered as zero to prevent distortion.
              </p>
            </div>
          )}
        </div>

        {/* ================= PRECIPITATION VISUAL CARD ================= */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Accumulated Precipitation (PRECTOTCORR)
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Seasonal total vs 1991–2019 baseline total
              </div>
            </div>
            <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono">
              mm
            </span>
          </div>

          {isRainSufficient ? (
            <div className="space-y-4">
              {/* Primary Numbers */}
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-900 pb-3">
                <div>
                  <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
                    {selectedSeasonTotalRain.toFixed(1)}
                  </span>
                  <span className="text-sm text-slate-400 ml-1">mm</span>
                  <span className="text-xs text-slate-400 block mt-0.5">Accumulated Seasonal Rain</span>
                </div>

                {baselineMeanTotalRain !== null ? (
                  <div className="text-right">
                    <div className={`text-base font-bold flex items-center justify-end space-x-1 tabular-nums ${
                      rainAnomaly >= 0 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      <span aria-hidden="true">{rainAnomaly >= 0 ? '▲' : '▼'}</span>
                      <span>{rainAnomaly >= 0 ? `+${rainAnomaly.toFixed(1)}` : rainAnomaly.toFixed(1)} mm</span>
                    </div>
                    <span className="text-xs text-slate-400 block">
                      {rainAnomaly >= 0 ? 'Wetter than baseline normal' : 'Drier than baseline normal'}
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-amber-400 bg-amber-950/60 px-2 py-1 rounded border border-amber-800">
                    Baseline Suppressed
                  </div>
                )}
              </div>

              {/* Comparative Dual Horizontal Bars (Animated) */}
              {baselineMeanTotalRain !== null && (
                <div className="space-y-3 pt-1" aria-label="Precipitation comparison bars">
                  {/* Selected Season Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-300 font-medium">Selected Season:</span>
                      <span className="text-white font-mono font-semibold">{selectedSeasonTotalRain.toFixed(1)} mm</span>
                    </div>
                    <div className="h-3.5 bg-slate-900 rounded-md overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-sky-600 to-emerald-500 rounded-sm transition-all duration-1000 ease-out motion-reduce:transition-none"
                        style={{ width: `${activeSelectedRainPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Baseline Reference Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">1991–2019 Baseline Mean:</span>
                      <span className="text-slate-300 font-mono">{baselineMeanTotalRain.toFixed(1)} mm</span>
                    </div>
                    <div className="h-3.5 bg-slate-900 rounded-md overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-slate-600 rounded-sm"
                        style={{ width: `${baselineRainPct}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0 mm</span>
                    <span>Accumulation Scale</span>
                    <span>{maxRainScale.toFixed(0)} mm</span>
                  </div>
                </div>
              )}

              {/* Baseline Metadata Note */}
              <div className="text-[11px] text-slate-400 border-t border-slate-900 pt-2">
                {baselineMeanTotalRain !== null ? (
                  <p>
                    • 1991–2019 Baseline: <strong className="text-slate-300">{baselineMeanTotalRain.toFixed(1)} mm</strong> ({qualifyingBaselineSeasonsCount}/{totalCandidateBaselineSeasons} qualifying seasons, ≥90% completeness each).
                  </p>
                ) : (
                  <p className="text-amber-400">
                    ⚠️ {baselineStatusNotice}
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Insufficient precipitation is kept visibly blank — never animated as zero */
            <div className="bg-slate-900/50 border border-dashed border-amber-800/80 p-5 rounded-lg text-xs text-amber-300 space-y-2 text-center">
              <span className="text-xl block">⚠️</span>
              <strong className="block text-amber-200">Precipitation Data Suppressed</strong>
              <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
                Selected season valid precipitation observations fell below the 90% completeness threshold ({selectedSeasonValidDaysRain ?? 0}/{selectedSeasonExpectedDays} valid days). Comparison bar is kept visibly blank rather than rendered as zero to prevent distortion.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Disclaimers & Attribution Footer */}
      <footer className="text-[11px] text-slate-500 border-t border-slate-800 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span>Scientific Grounding: </span>
          <span className="text-slate-400">{dataDisclaimer}</span>
        </div>
        <div className="text-slate-500 font-mono text-[10px]">
          MERRA-2 Grid: 0.5° × 0.625°
        </div>
      </footer>
    </section>
  );
}
