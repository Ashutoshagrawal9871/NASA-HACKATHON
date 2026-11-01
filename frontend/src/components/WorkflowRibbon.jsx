import React from 'react';

export default function WorkflowRibbon({ activeSection, onNavigate, locationLabel, selectedSeasonLabel, hasClimateData, hasSoilData }) {
  const steps = [
    { id: 'step-location', number: '1', title: 'Location & Season', icon: '📍', status: locationLabel ? 'ready' : 'current' },
    { id: 'step-climate', number: '2', title: 'NASA Climate Signal', icon: '🛰️', status: hasClimateData ? 'ready' : 'current' },
    { id: 'step-soil', number: '3', title: 'Soil Lab Record', icon: '🧪', status: hasSoilData ? 'ready' : 'optional' },
    { id: 'step-evidence', number: '4', title: 'Varanasi Trial Chain', icon: '🎯', status: 'ready' },
    { id: 'step-summary', number: '5', title: 'Farmer Summary', icon: '📋', status: hasClimateData ? 'ready' : 'pending' },
  ];

  const handleStepClick = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (onNavigate) onNavigate(id);
  };

  return (
    <nav 
      aria-label="Exploration Workflow Progress" 
      className="sticky top-2 z-30 bg-slate-900/95 border border-slate-800 rounded-xl p-3 shadow-2xl backdrop-blur-md transition-all"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/80">
            Guided Story Arc
          </span>
          <span className="text-xs text-slate-300 font-medium hidden sm:inline">
            Choose Punjab → NASA Climate Signal → Soil Context → Varanasi Trial Chain
          </span>
        </div>
        
        {/* Step Indicator Buttons (Auto-updates with ScrollSpy) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 w-full md:w-auto">
          {steps.map((s) => {
            const isTarget = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => handleStepClick(s.id)}
                className={`flex items-center justify-center sm:justify-start space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  isTarget
                    ? 'bg-sky-600 text-white border border-sky-400 shadow-md shadow-sky-950'
                    : s.status === 'ready'
                    ? 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                    : s.status === 'optional'
                    ? 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-slate-800/60'
                    : 'bg-slate-950/30 text-slate-500 border border-slate-900'
                }`}
                title={`Jump to Step ${s.number}: ${s.title}`}
              >
                <span className="text-sm" aria-hidden="true">{s.icon}</span>
                <span className="truncate">{s.number}. {s.title}</span>
                {s.status === 'optional' && (
                  <span className="text-[9px] text-slate-400 opacity-80 hidden xl:inline">(opt)</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
