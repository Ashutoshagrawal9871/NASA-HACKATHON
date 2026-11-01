import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Configure Leaflet default markers from locally bundled package assets
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapClickHandler({ onSelectCoordinates }) {
  useMapEvents({
    click(e) {
      onSelectCoordinates(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({ latitude, longitude, onSelectCoordinates, onPresetSelect }) {
  const [inputLat, setInputLat] = useState(latitude);
  const [inputLon, setInputLon] = useState(longitude);
  const [showGibsLayer, setShowGibsLayer] = useState(false);
  const [showSoilGridsLayer, setShowSoilGridsLayer] = useState(false);
  const [gibsDate, setGibsDate] = useState("2024-06-09");
  const [layerError, setLayerError] = useState(null);

  useEffect(() => {
    setInputLat(latitude.toFixed(4));
    setInputLon(longitude.toFixed(4));
  }, [latitude, longitude]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const lat = parseFloat(inputLat);
    const lon = parseFloat(inputLon);
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      onSelectCoordinates(lat, lon);
    }
  };

  const isPunjab = Math.abs(latitude - 30.9010) < 0.001 && Math.abs(longitude - 75.8573) < 0.001;
  const isIowa = Math.abs(latitude - 42.0308) < 0.001 && Math.abs(longitude - (-93.6319)) < 0.001;
  const isNairobi = Math.abs(latitude - (-1.2921)) < 0.001 && Math.abs(longitude - 36.8219) < 0.001;

  const handleTileError = (layerName) => {
    setLayerError(`Notice: ${layerName} tile server experienced a timeout or network interruption. Base map remains functional.`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Header and Preset Selection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>🗺️ Step 1: Global Coordinate & Location Selection</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select Punjab to follow our primary narrative, click anywhere on Earth, or enter coordinates.
          </p>
        </div>

        {/* Demo Presets with active indicator */}
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Geographic Presets">
          <span className="text-xs text-slate-400 font-medium mr-1">Presets:</span>
          <button
            type="button"
            onClick={() => { setLayerError(null); onPresetSelect(30.9010, 75.8573, "Punjab, India (Rabi Season)"); }}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition focus-visible:ring-2 focus-visible:ring-sky-500 ${
              isPunjab
                ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-1 ring-blue-400'
                : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
            }`}
          >
            🌾 Punjab, India <span className="text-[10px] opacity-90 font-normal">(Narrative Anchor)</span>
          </button>
          <button
            type="button"
            onClick={() => { setLayerError(null); onPresetSelect(42.0308, -93.6319, "Iowa, USA (Summer Season)"); }}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition focus-visible:ring-2 focus-visible:ring-sky-500 ${
              isIowa
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
            }`}
          >
            🌽 Iowa, USA
          </button>
          <button
            type="button"
            onClick={() => { setLayerError(null); onPresetSelect(-1.2921, 36.8219, "Nairobi, Kenya (Long Rains)"); }}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition focus-visible:ring-2 focus-visible:ring-sky-500 ${
              isNairobi
                ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
            }`}
          >
            🌿 Nairobi, Kenya
          </button>
        </div>
      </div>

      {/* Lat/Lon Manual Entry Form */}
      <form onSubmit={handleManualSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="input-lat" className="block text-xs font-medium text-slate-300 mb-1">
            Latitude (-90° to +90°)
          </label>
          <input
            id="input-lat"
            type="number"
            step="any"
            value={inputLat}
            onChange={(e) => setInputLat(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 tabular-nums"
          />
        </div>
        <div>
          <label htmlFor="input-lon" className="block text-xs font-medium text-slate-300 mb-1">
            Longitude (-180° to +180°)
          </label>
          <input
            id="input-lon"
            type="number"
            step="any"
            value={inputLon}
            onChange={(e) => setInputLon(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 tabular-nums"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium py-2 px-4 rounded-lg transition shadow-sm focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            Update Coordinates
          </button>
        </div>
      </form>

      {/* Layer Toggles & GIBS Date Selector */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-slate-400 font-medium">Map Overlays:</span>
            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showGibsLayer}
                onChange={(e) => { setLayerError(null); setShowGibsLayer(e.target.checked); }}
                className="rounded bg-slate-900 border-slate-700 text-sky-600 focus:ring-sky-500"
              />
              <span className="font-medium">🛰️ NASA GIBS MODIS NDVI (Visual Backdrop)</span>
            </label>
            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showSoilGridsLayer}
                onChange={(e) => { setLayerError(null); setShowSoilGridsLayer(e.target.checked); }}
                className="rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium">🌱 SoilGrids WMS (Evidence Card 2: Modeled Topsoil pH)</span>
            </label>
          </div>

          {showGibsLayer && (
            <div className="flex flex-wrap items-center gap-2 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
              <label htmlFor="gibs-date-select" className="text-slate-300 text-[11px] font-medium">
                GIBS 16-Day Composite:
              </label>
              <select
                id="gibs-date-select"
                value={gibsDate}
                onChange={(e) => setGibsDate(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-white text-[11px] focus:outline-none focus:border-sky-500"
                title="Curated 16-day composite date from NASA GIBS ESDIS archive"
              >
                <option value="2024-06-09">2024-06-09 (Summer Composite)</option>
                <option value="2024-05-24">2024-05-24 (Late Spring Composite)</option>
                <option value="2024-05-08">2024-05-08 (Mid Spring Composite)</option>
                <option value="2024-04-22">2024-04-22 (Early Spring Composite)</option>
                <option value="2024-04-06">2024-04-06 (Late Winter Composite)</option>
              </select>
            </div>
          )}
        </div>

        {/* Layer Explanations with Evidence Card 2 details */}
        {(showGibsLayer || showSoilGridsLayer) && (
          <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-900">
            {showGibsLayer && (
              <p>
                • <strong>NASA GIBS MODIS NDVI:</strong> 250m visual vegetation index imagery from Terra satellite. <span className="text-amber-300">Visual context only; pixel colors are never decoded into numeric NDVI.</span>
              </p>
            )}
            {showSoilGridsLayer && (
              <p>
                • <strong className="text-emerald-300">Evidence Card 2 (ISRIC SoilGrids WMS):</strong> Machine-learning modeled global soil pH at 0–5 cm depth. <span className="text-amber-300">Statistical model prediction, not a farm-level soil test.</span>
              </p>
            )}
          </div>
        )}

        {/* Tile Error Alert Banner */}
        {layerError && (
          <div className="text-[11px] bg-amber-950/70 border border-amber-800/80 text-amber-200 px-2.5 py-1.5 rounded flex items-center justify-between">
            <span>{layerError}</span>
            <button
              onClick={() => setLayerError(null)}
              className="text-amber-400 hover:text-white ml-2 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Leaflet Map Box */}
      <div className="h-[380px] rounded-xl overflow-hidden border border-slate-800 relative z-0 shadow-inner">
        <MapContainer
          center={[latitude, longitude]}
          zoom={6}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          {/* Base OSM Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={18}
            eventHandlers={{
              tileerror: () => handleTileError('OpenStreetMap')
            }}
          />

          {/* NASA GIBS MODIS NDVI WMTS Layer */}
          {showGibsLayer && (
            <TileLayer
              attribution='Imagery &copy; NASA EOSDIS GIBS'
              url={`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_16Day/default/${gibsDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png`}
              opacity={0.65}
              maxZoom={9}
              eventHandlers={{
                tileerror: () => handleTileError('NASA GIBS WMTS')
              }}
            />
          )}

          {/* ISRIC SoilGrids WMS Layer */}
          {showSoilGridsLayer && (
            <WMSTileLayer
              attribution='&copy; ISRIC &mdash; World Soil Information (SoilGrids 250m)'
              url="https://maps.isric.org/mapserv?map=/map/phh2o.map"
              params={{
                layers: 'phh2o_0-5cm_mean',
                format: 'image/png',
                transparent: true,
                version: '1.3.0'
              }}
              opacity={0.6}
              eventHandlers={{
                tileerror: () => handleTileError('SoilGrids WMS')
              }}
            />
          )}

          <MapClickHandler onSelectCoordinates={onSelectCoordinates} />

          <Marker position={[latitude, longitude]}>
            <Popup>
              <div className="text-slate-900 text-xs">
                <strong>Target Coordinate</strong><br />
                Lat: {latitude.toFixed(4)}°<br />
                Lon: {longitude.toFixed(4)}°<br />
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                  Grid Center: {(Math.floor(latitude * 2) / 2).toFixed(2)}°, {(Math.floor(longitude * 1.6) / 1.6).toFixed(2)}°
                </span>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Coordinate & Grid Resolution Readout Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Selected Location: <strong>{latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E</strong></span>
        </div>
        <div className="text-[11px] text-slate-400">
          Spatial Resolution: <strong>0.5° × 0.625°</strong> MERRA-2 Grid Cell (~50 km)
        </div>
      </div>
    </div>
  );
}
