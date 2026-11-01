import React from 'react';

export default function PriorityFilter({ selectedPriority, onPriorityChange }) {
  const priorities = [
    {
      id: 'PRODUCTIVITY',
      label: '🌾 System Productivity',
      metricBadge: 'SRGEY t/ha/yr',
      measured: true,
      desc: 'Highlight sequences yielding highest System Rice Grain Equivalent Yield (Table 1, p. 718).'
    },
    {
      id: 'SOIL_HEALTH',
      label: '🌱 Soil Organic Carbon',
      metricBadge: 'SOC % (0-15cm)',
      measured: true,
      desc: 'Highlight sesbania green manure incorporation trial and reported SOC difference (Table 2, p. 719).'
    },
    {
      id: 'ECONOMIC_RETURN',
      label: '💰 Economic Return',
      metricBadge: 'Not Measured',
      measured: false,
      desc: 'Economic profitability was not reported in reviewed study tables. Rankings strictly suppressed.'
    },
    {
      id: 'WATER_SAVING',
      label: '💧 Water Conservation',
      metricBadge: 'Not Measured',
      measured: false,
      desc: 'Irrigation water volumes were not quantified in the study text. No ranking fabricated.'
    }
  ];

  return (
    <section aria-labelledby="priority-heading" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
      <div className="border-b border-slate-800 pb-2">
        <h3 id="priority-heading" className="text-base font-semibold text-white flex items-center gap-2">
          <span>🎯 Step 4: Farmer Priorities & Research Filter</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Select a priority objective to inspect verified outcomes from the cited Varanasi field experiment. Unevaluated objectives display transparent disclaimers without guessing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {priorities.map((p) => {
          const isSelected = selectedPriority === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onPriorityChange(p.id)}
              className={`p-3.5 rounded-xl border text-left transition focus-visible:ring-2 focus-visible:ring-sky-500 relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-sky-950/80 border-sky-500 text-sky-200 ring-1 ring-sky-500 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-1 mb-1">
                  <span className="font-semibold text-xs text-white">{p.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium border ${
                    p.measured
                      ? 'bg-slate-800 text-slate-300 border-slate-700'
                      : 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                  }`}>
                    {p.metricBadge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                  {p.desc}
                </p>
              </div>

              {!p.measured && isSelected && (
                <div className="mt-2 text-[10px] text-amber-300/90 font-medium bg-amber-950/50 p-1.5 rounded border border-amber-900/60">
                  ⚠️ Priority was not evaluated in Saha et al. (2012). No recommendation generated.
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
