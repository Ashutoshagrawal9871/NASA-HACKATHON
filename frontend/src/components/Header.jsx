import React from 'react';

export default function Header({ onOpenMethodology }) {
  return (
    <header className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-50 px-4 py-3 shadow-xl backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-sky-500/20 border border-sky-400/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                FieldSignals
              </h1>
              <span className="bg-sky-950 text-sky-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-sky-800/80">
                NASA Space Apps 2026
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Climate-Adaptive Agronomic Intelligence • Powered by NASA Earth Observations
            </p>
          </div>
        </div>

        {/* Global actions and attribution */}
        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={onOpenMethodology}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 font-medium transition flex items-center space-x-1.5 shadow-sm focus-visible:ring-2 focus-visible:ring-sky-500"
            aria-label="Open Methodology, Scientific Integrity and Citation Details"
          >
            <span aria-hidden="true">📖</span>
            <span>Methodology & Citations</span>
          </button>
          
          <div className="hidden lg:block text-right text-[11px] text-slate-400 border-l border-slate-800 pl-3 leading-tight">
            <div className="font-medium text-slate-300">NASA POWER (MERRA-2) & GIBS (MODIS)</div>
            <div className="text-slate-500">© OpenStreetMap • ISRIC SoilGrids</div>
          </div>
        </div>
      </div>
    </header>
  );
}
