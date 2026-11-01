import React, { useState } from 'react';

export default function SoilInputForm({ soilData, onSoilChange }) {
  const [formData, setFormData] = useState(soilData || {
    ph: '',
    socPercent: '',
    textureClass: '',
    testingLaboratory: '',
    sampleDate: '',
    analyticalMethod: '',
    userConfirmedLocalTest: false
  });

  const [validationErrors, setValidationErrors] = useState([]);

  const isValidCalendarYYYYMMDD = (dateStr) => {
    if (typeof dateStr !== 'string') return false;
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return false;
    const y = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const d = parseInt(match[3], 10);
    if (m < 1 || m > 12) return false;
    const isLeap = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
    const maxDays = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return d >= 1 && d <= maxDays[m - 1];
  };

  const validateInput = (data) => {
    const errors = [];
    if (data.ph !== '' && data.ph !== undefined) {
      const p = Number(data.ph);
      if (isNaN(p) || p < 0 || p > 14) {
        errors.push("Soil pH must be between 0 and 14.");
      }
    }
    if (data.socPercent !== '' && data.socPercent !== undefined) {
      const s = Number(data.socPercent);
      if (isNaN(s) || s < 0 || s > 100) {
        errors.push("Soil Organic Carbon (SOC %) must be between 0% and 100%.");
      }
    }
    if (data.sampleDate) {
      if (!isValidCalendarYYYYMMDD(data.sampleDate)) {
        errors.push("Sample extraction date is an impossible or malformed calendar date (e.g. 2024-02-31).");
      } else {
        const d = new Date(data.sampleDate);
        const today = new Date();
        if (d > today) {
          errors.push("Sample extraction date cannot be in the future.");
        }
      }
    }
    return errors;
  };

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    const errors = validateInput(updated);
    setValidationErrors(errors);
    if (onSoilChange) {
      onSoilChange({ ...updated, hasErrors: errors.length > 0 });
    }
  };

  const handleLoadSampleDemo = () => {
    const sample = {
      ph: 7.2,
      socPercent: 0.48,
      textureClass: 'Sandy Loam',
      testingLaboratory: 'Fictional Demonstration Laboratory (Synthetic Example)',
      sampleDate: '2024-01-15',
      analyticalMethod: 'Walkley-Black Method (Example)',
      userConfirmedLocalTest: false // Explicitly unconfirmed synthetic demonstration data
    };
    setFormData(sample);
    setValidationErrors([]);
    onSoilChange(sample);
  };

  const handleClearForm = () => {
    const cleared = {
      ph: '',
      socPercent: '',
      textureClass: '',
      testingLaboratory: '',
      sampleDate: '',
      analyticalMethod: '',
      userConfirmedLocalTest: false
    };
    setFormData(cleared);
    setValidationErrors([]);
    onSoilChange(cleared);
  };

  const hasData = formData.ph !== '' || formData.socPercent !== '' || formData.testingLaboratory !== '';
  const isDemoSample = formData.testingLaboratory?.includes('Synthetic Example');

  return (
    <section aria-labelledby="soil-form-heading" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Header and Quick Buttons */}
      <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
              Evidence Card 3 • Local Chemical Test (User-Reported)
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              Ground-Truth Assay
            </span>
          </div>
          <h3 id="soil-form-heading" className="text-base font-bold text-white flex items-center gap-2">
            <span>🌱 Step 3: Local Soil Lab Test Data Input (Optional)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Enter values copied from an official local soil test report. NASA satellites and reanalysis do not measure farm-level root-zone soil chemistry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSampleDemo}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 px-3 py-1.5 rounded-lg transition font-medium focus-visible:ring-2 focus-visible:ring-sky-500 shadow-sm"
          >
            📋 Load Synthetic Demo Sample
          </button>
          {hasData && (
            <button
              type="button"
              onClick={handleClearForm}
              className="text-xs bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800 px-2.5 py-1.5 rounded-lg transition font-medium focus-visible:ring-2 focus-visible:ring-rose-500 shadow-sm"
            >
              Clear Form
            </button>
          )}
        </div>
      </div>

      {/* Provenance Notice Banner */}
      {isDemoSample ? (
        <div className="bg-purple-950/50 border border-purple-800/80 p-3 rounded-lg text-xs text-purple-200 flex items-start space-x-2">
          <span className="text-base" aria-hidden="true">🧪</span>
          <div>
            <strong className="text-purple-300 block">Synthetic Demonstration Data Active:</strong>
            <p className="text-purple-200/90 text-[11px] mt-0.5">
              These sample values are fictional reference placeholders loaded to demonstrate system behavior. They do not represent a real field or laboratory record.
            </p>
          </div>
        </div>
      ) : hasData ? (
        <div className="bg-sky-950/40 border border-sky-800/60 p-3 rounded-lg text-xs text-sky-200 flex items-start space-x-2">
          <span className="text-base" aria-hidden="true">📄</span>
          <div>
            <strong className="text-sky-300 block">User-Provided Soil Record:</strong>
            <p className="text-sky-200/90 text-[11px] mt-0.5">
              Values entered below are self-reported by the user from external paper or digital soil testing records. FieldSignals does not independently verify physical soil laboratory data.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-950/30 border border-amber-900/40 p-3 rounded-lg text-xs text-amber-200/90 flex items-start space-x-2">
          <span className="text-base" aria-hidden="true">⚠️</span>
          <div>
            <strong className="text-amber-300 block">User-Provided Provenance Notice:</strong>
            <p className="text-[11px] text-amber-200/80 mt-0.5">
              No local soil report entered yet. Soil context is optional; environmental NASA analysis operates independently.
            </p>
          </div>
        </div>
      )}

      {/* Validation Errors Notice */}
      {validationErrors.length > 0 && (
        <div className="bg-rose-950/60 border border-rose-800 p-3 rounded-lg text-xs text-rose-200 space-y-1">
          <div className="font-semibold text-rose-300">Please review soil input entries:</div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Input Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        <div>
          <label htmlFor="soil-ph-input" className="block text-slate-300 font-medium mb-1">
            Measured Soil pH (0 – 14 scale)
          </label>
          <input
            id="soil-ph-input"
            type="number"
            step="0.1"
            min="0"
            max="14"
            value={formData.ph}
            onChange={(e) => handleChange('ph', e.target.value)}
            placeholder="e.g. 7.2"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
          />
          <span className="text-[10px] text-slate-500 mt-1 block">Logarithmic 1:2.5 H₂O suspension</span>
        </div>

        <div>
          <label htmlFor="soil-soc-input" className="block text-slate-300 font-medium mb-1">
            Soil Organic Carbon (SOC % dry mass)
          </label>
          <input
            id="soil-soc-input"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.socPercent}
            onChange={(e) => handleChange('socPercent', e.target.value)}
            placeholder="e.g. 0.48"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
          />
          <span className="text-[10px] text-slate-500 mt-1 block">Walkley-Black or Dry Combustion</span>
        </div>

        <div>
          <label htmlFor="soil-texture-select" className="block text-slate-300 font-medium mb-1">
            Soil Texture Class
          </label>
          <select
            id="soil-texture-select"
            value={formData.textureClass}
            onChange={(e) => handleChange('textureClass', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500"
          >
            <option value="">Select Texture Class (Optional)</option>
            <option value="Clay">Clay</option>
            <option value="Sandy Clay">Sandy Clay</option>
            <option value="Silty Clay">Silty Clay</option>
            <option value="Clay Loam">Clay Loam</option>
            <option value="Sandy Clay Loam">Sandy Clay Loam</option>
            <option value="Silty Clay Loam">Silty Clay Loam</option>
            <option value="Loam">Loam</option>
            <option value="Sandy Loam">Sandy Loam</option>
            <option value="Silt Loam">Silt Loam</option>
            <option value="Silt">Silt</option>
            <option value="Loamy Sand">Loamy Sand</option>
            <option value="Sand">Sand</option>
          </select>
          <span className="text-[10px] text-slate-500 mt-1 block">USDA Soil Taxonomy classification</span>
        </div>

        <div>
          <label htmlFor="soil-lab-input" className="block text-slate-300 font-medium mb-1">
            Issuing Soil Testing Laboratory
          </label>
          <input
            id="soil-lab-input"
            type="text"
            value={formData.testingLaboratory}
            onChange={(e) => handleChange('testingLaboratory', e.target.value)}
            placeholder="e.g. District Soil Testing Lab, Ludhiana"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
          />
          <span className="text-[10px] text-slate-500 mt-1 block">Name of accredited testing entity</span>
        </div>

        <div>
          <label htmlFor="soil-date-input" className="block text-slate-300 font-medium mb-1">
            Sample Extraction Date
          </label>
          <input
            id="soil-date-input"
            type="date"
            value={formData.sampleDate}
            onChange={(e) => handleChange('sampleDate', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500"
          />
          <span className="text-[10px] text-slate-500 mt-1 block">Date soil was collected in field</span>
        </div>

        <div>
          <label htmlFor="soil-method-input" className="block text-slate-300 font-medium mb-1">
            Analytical Testing Method
          </label>
          <input
            id="soil-method-input"
            type="text"
            value={formData.analyticalMethod}
            onChange={(e) => handleChange('analyticalMethod', e.target.value)}
            placeholder="e.g. Potentiometric 1:2.5 / Chromic Acid"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
          />
          <span className="text-[10px] text-slate-500 mt-1 block">Laboratory standard protocol</span>
        </div>
      </div>

      {/* Confirmation Checkbox for Real Data */}
      {hasData && !isDemoSample && (
        <div className="pt-2 border-t border-slate-800">
          <label className="flex items-start space-x-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.userConfirmedLocalTest}
              onChange={(e) => handleChange('userConfirmedLocalTest', e.target.checked)}
              className="mt-0.5 rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-sky-500"
            />
            <span>
              I confirm these soil values were transcribed from an official laboratory soil testing report and represent local ground-truth data for this farm.
            </span>
          </label>
        </div>
      )}
    </section>
  );
}
