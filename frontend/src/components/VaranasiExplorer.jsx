import React, { useState, useEffect } from 'react';

export default function VaranasiExplorer({ selectedPriority }) {
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    setFetchError(null);
    fetch('/api/rotation/varanasi')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setSequences(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching Varanasi sequences:", err);
        setFetchError(err.message || "Failed to load research data from backend.");
        setLoading(false);
      });
  }, []);

  const maxSrgey = 30; // Scale baseline for visual comparison (T7 max is 28.88)

  return (
    <section aria-labelledby="varanasi-heading" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
      {/* Header with Research Source Info */}
      <div className="border-b border-slate-800 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-purple-300 bg-purple-950/80 px-2.5 py-0.5 rounded border border-purple-800/80">
              Evidence Card 4 • Controlled Agronomic Field Trial
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              Site: BHU Farm, Varanasi (Alluvial Soil)
            </span>
          </div>
          <h3 id="varanasi-heading" className="text-base font-bold text-white flex items-center gap-2">
            <span>🎯 Step 4: Multi-Cropping Rotation Chains & Reported Metrics</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Peer-reviewed findings from Saha et al. (2012), <em>Indian Journal of Agricultural Sciences</em> 82(8):717–720. DOI: 10.56093/ijas.v82i8.23061
          </p>
        </div>

        <div className="text-[11px] text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
          3-Year Field Trial: 2006–07 to 2008–09
        </div>
      </div>

      {/* Prominent Site-Specific Historical Trial Notice */}
      <div className="bg-amber-950/30 border border-amber-800/60 p-3.5 rounded-xl text-xs text-amber-200 flex items-start space-x-2.5">
        <span className="text-base" aria-hidden="true">⚠️</span>
        <div className="leading-relaxed">
          <strong className="font-semibold block text-amber-300">
            Historical Research Showcase — Not a Universal Farm Recommendation:
          </strong>
          <p className="text-[11px] text-amber-200/90 mt-0.5">
            This study evaluated crop intensification within an irrigated rice-wheat agro-ecosystem in Varanasi, India (sandy clay loam soil, randomized block design with 3 replications). These sequences illustrate what was experimentally observed under local soil chemistry and management. They are published scientific benchmark records, <strong>not</strong> a yield forecast, suitability score, or planting recommendation for your farm.
          </p>
        </div>
      </div>

      {/* What The Study Did and Did NOT Measure Callout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="bg-emerald-950/30 border border-emerald-800/60 p-3 rounded-lg text-emerald-200">
          <strong className="text-emerald-300 flex items-center gap-1.5 mb-1">
            <span>✓</span> What Saha et al. (2012) Measured:
          </strong>
          <ul className="text-[11px] text-emerald-200/90 space-y-0.5 list-disc list-inside">
            <li><strong>SRGEY:</strong> System Rice Grain Equivalent Yield (Table 1, p. 718).</li>
            <li><strong>Soil Organic Carbon (SOC %):</strong> Tested on selected treatments T1 and T3 under Integrated Nutrient Management (Table 2, p. 719).</li>
            <li><strong>Crop Residue / Biomass:</strong> Evaluated for green manure incorporation.</li>
          </ul>
        </div>

        <div className="bg-rose-950/30 border border-rose-900/60 p-3 rounded-lg text-rose-200">
          <strong className="text-rose-300 flex items-center gap-1.5 mb-1">
            <span>❌</span> What Saha et al. (2012) Did NOT Measure:
          </strong>
          <ul className="text-[11px] text-rose-200/90 space-y-0.5 list-disc list-inside">
            <li><strong>Economic Profitability ($ / ₹):</strong> No financial net margin data reported.</li>
            <li><strong>Irrigation Water Volume (m³ / ha):</strong> Water savings not quantified.</li>
            <li><strong>Crop Suitability Index:</strong> No farm ranking algorithms or advice provided.</li>
          </ul>
        </div>
      </div>

      {/* Unmeasured Priority Warning */}
      {(selectedPriority === 'ECONOMIC_RETURN' || selectedPriority === 'WATER_SAVING') && (
        <div className="bg-rose-950/40 border border-rose-900/60 p-3.5 rounded-xl text-rose-300 text-xs flex items-start space-x-2.5">
          <span className="text-base" aria-hidden="true">🚫</span>
          <div>
            <strong className="font-semibold block text-rose-200">
              Objective Not Evaluated in This Study:
            </strong>
            <p className="text-[11px] text-rose-300/90 leading-relaxed mt-0.5">
              The selected objective ({selectedPriority === 'ECONOMIC_RETURN' ? 'Economic Return / Profitability' : 'Irrigation Water Conservation'}) was not measured or published in the reviewed text/tables of Saha et al. (2012). To preserve scientific integrity, no ranking or suitability score is generated.
            </p>
          </div>
        </div>
      )}

      {/* Treatment Cards Grid */}
      {loading ? (
        <div className="text-xs text-slate-400 p-8 text-center flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-sky-500 border-t-transparent" aria-hidden="true"></div>
          <span>Loading verified research sequence data from API...</span>
        </div>
      ) : fetchError ? (
        <div className="bg-rose-950/40 border border-rose-900/60 p-4 rounded-xl text-rose-300 text-xs text-center">
          ⚠️ Could not load Varanasi research data: {fetchError}. Ensure the backend server is running.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sequences.map((seq) => {
            const isProductivityHighlight = selectedPriority === 'PRODUCTIVITY' && (seq.treatmentId === 'T7' || seq.treatmentId === 'T10');
            const isSoilHealthHighlight = selectedPriority === 'SOIL_HEALTH' && seq.treatmentId === 'T3';
            const srgeyPct = seq.srgeyValueTonnesPerHa != null ? Math.min(100, (seq.srgeyValueTonnesPerHa / maxSrgey) * 100) : 0;

            return (
              <article
                key={seq.treatmentId}
                className={`bg-slate-950 p-4 rounded-xl border transition flex flex-col justify-between ${
                  isProductivityHighlight || isSoilHealthHighlight
                    ? 'border-sky-500 ring-1 ring-sky-500/50 bg-sky-950/20 shadow-md'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Bar with Treatment ID and Badges */}
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="bg-slate-800 text-slate-200 font-mono text-xs font-bold px-2 py-0.5 rounded border border-slate-700">
                        {seq.treatmentId}
                      </span>
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {seq.sequenceName}
                      </h4>
                    </div>

                    {isProductivityHighlight && (
                      <span className="text-[10px] bg-blue-900/90 text-blue-200 px-2 py-0.5 rounded font-semibold border border-blue-700 whitespace-nowrap">
                        Top Experimental Yield
                      </span>
                    )}
                    {isSoilHealthHighlight && (
                      <span className="text-[10px] bg-emerald-900/90 text-emerald-200 px-2 py-0.5 rounded font-semibold border border-emerald-700 whitespace-nowrap">
                        Green Manure Trial
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    {seq.roleInSequence}
                  </p>

                  {/* VISUAL CROP SEQUENCE CHAIN */}
                  <div className="mb-4">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                      Tested Crop Sequence Chain:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                      {seq.cropsInSequence?.map((crop, idx) => {
                        const commonName = crop.split(' (')[0];
                        const sciName = crop.includes('(') ? `(${crop.split(' (')[1]}` : '';
                        
                        // Functional role badges
                        let roleColor = 'bg-slate-800 text-slate-200 border-slate-700';
                        if (commonName.toLowerCase().includes('rice') || commonName.toLowerCase().includes('wheat')) {
                          roleColor = 'bg-amber-950/70 text-amber-200 border-amber-800/80';
                        } else if (commonName.toLowerCase().includes('potato') || commonName.toLowerCase().includes('maize')) {
                          roleColor = 'bg-sky-950/70 text-sky-200 border-sky-800/80';
                        } else if (commonName.toLowerCase().includes('gram') || commonName.toLowerCase().includes('pea')) {
                          roleColor = 'bg-emerald-950/70 text-emerald-200 border-emerald-800/80';
                        } else if (commonName.toLowerCase().includes('sesbania')) {
                          roleColor = 'bg-teal-950/70 text-teal-200 border-teal-800/80';
                        }

                        return (
                          <React.Fragment key={idx}>
                            <div className={`px-2 py-1 rounded text-xs font-medium border flex items-center space-x-1 ${roleColor}`}>
                              <span>{commonName}</span>
                              {sciName && <span className="text-[10px] opacity-70 italic hidden sm:inline">{sciName}</span>}
                            </div>
                            {idx < seq.cropsInSequence.length - 1 && (
                              <span className="text-slate-500 font-bold text-xs" aria-hidden="true">➔</span>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {/* Experimental Metrics & Visual Yield Scale */}
                  <div className="space-y-3 border-t border-slate-900 pt-3 text-xs">
                    {/* SRGEY Metric Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">System Rice Grain Equiv. Yield (SRGEY):</span>
                        <span className="font-bold text-white font-mono tabular-nums">
                          {seq.srgeyValueTonnesPerHa != null ? `${seq.srgeyValueTonnesPerHa.toFixed(2)} t/ha/yr` : 'N/A'}
                        </span>
                      </div>
                      <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-sky-600 to-blue-500 rounded-full transition-all duration-1000 ease-out motion-reduce:transition-none"
                          style={{ width: `${srgeyPct}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        Source Citation: {seq.exactSourceCitation} ({seq.exactTablePageRef})
                      </span>
                    </div>

                    {/* SOC % Metric (Present ONLY for T3 and T1) */}
                    <div className="pt-1">
                      {seq.soilOrganicCarbonPercent !== null ? (
                        <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-800/60 px-3 py-2 rounded-lg text-emerald-300">
                          <span className="text-xs">Soil Organic Carbon (SOC):</span>
                          <span className="font-bold font-mono text-sm">
                            {seq.soilOrganicCarbonPercent.toFixed(2)}%
                            <span className="text-[10px] font-normal text-emerald-400 ml-1">
                              ({seq.treatmentId === 'T1' ? 'Regional Control' : 'Table 2, p. 719'})
                            </span>
                          </span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center justify-between">
                          <span>Soil Organic Carbon (SOC %):</span>
                          <span className="italic">Not reported in Table 2 for {seq.treatmentId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Notes */}
                <div className="mt-4 pt-2 border-t border-slate-900 text-[10px] text-slate-500 space-y-0.5">
                  <div><strong>Nutrient Management:</strong> {seq.nutrientManagementTreatment}</div>
                  <div className="italic text-slate-400">{seq.studyContextNote}</div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
