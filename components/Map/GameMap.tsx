import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Polygon, Circle, useMap, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import { Coordinate, Territory, Sponsor } from '../../types';
import { LocateFixed, Satellite, User, Trophy, Store } from 'lucide-react';

// Fix for default Leaflet marker icons in React
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface GameMapProps {
  currentPath: Coordinate[];
  territories: Territory[];
  userLocation: Coordinate | null;
  gpsAccuracy?: number;
  focusTarget?: Coordinate | null; // New prop to force map center
  selectedTerritoryId?: string | null;
  onForceRefresh?: () => void;
  sponsors?: Sponsor[];
}

// Component to recenter map when user moves, with manual override option
const MapController = ({ location, focusTarget, onForceRefresh }: { location: Coordinate | null, focusTarget: Coordinate | null, onForceRefresh?: () => void }) => {
  const map = useMap();
  const [shouldAutoCenter, setShouldAutoCenter] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const ZOOM_LEVEL = 17; // Reduced zoom level for better visibility

  // Force center on first valid location load OR if distance is too large (fix for "Wrong Location")
  useEffect(() => {
    if (location && !focusTarget) {
      const currentCenter = map.getCenter();
      const dist = map.distance([location.lat, location.lng], currentCenter);

      if (shouldAutoCenter) {
        // If distance > 500 meters, SNAP to location instead of flying (avoids disorientation)
        if (dist > 500) {
          map.setView([location.lat, location.lng], ZOOM_LEVEL);
        } else {
          // Otherwise fly smoothly
          map.flyTo([location.lat, location.lng], ZOOM_LEVEL, { animate: true, duration: 1 });
        }
      }
    }
  }, [location, map, shouldAutoCenter, focusTarget]);

  // Handle External Focus Request (e.g. clicking a territory alert)
  useEffect(() => {
    if (focusTarget) {
      setShouldAutoCenter(false); // Stop tracking user temporarily
      map.flyTo([focusTarget.lat, focusTarget.lng], 17, { animate: true, duration: 1.5 });
    }
  }, [focusTarget, map]);

  // Detect interaction to disable auto-center
  useEffect(() => {
    const disableAutoCenter = () => setShouldAutoCenter(false);

    // Listen for any interaction that changes the view
    map.on('dragstart', disableAutoCenter);
    map.on('zoomstart', disableAutoCenter);
    map.on('touchstart', disableAutoCenter); // Creating this listener to catch touch start on mobile

    return () => {
      map.off('dragstart', disableAutoCenter);
      map.off('zoomstart', disableAutoCenter);
      map.off('touchstart', disableAutoCenter);
    }
  }, [map]);

  const handleRecenter = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent map click
    setShouldAutoCenter(true);
    if (location) {
      map.setView([location.lat, location.lng], ZOOM_LEVEL); // Snap immediately on manual click
    }
  };

  const handleRefreshGPS = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onForceRefresh) {
      setIsRefreshing(true);
      // Visual feedback only, standard timeout to reset
      setTimeout(() => setIsRefreshing(false), 2000);
      onForceRefresh();
    }
  }

  return (
    <>
      {/* Force GPS Refresh Button */}
      <button
        onClick={handleRefreshGPS}
        className={`absolute bottom-48 right-4 z-[400] p-3 rounded-full shadow-lg border transition-all duration-300 ${isRefreshing
          ? "bg-blue-600 text-white border-blue-400 animate-spin"
          : "bg-zinc-800 text-gold-500 border-gold-500/50 hover:bg-zinc-700"
          }`}
        title="Buscar Satélite agora"
      >
        <Satellite size={24} className={isRefreshing ? "animate-pulse" : ""} />
      </button>

      {/* Recenter Button */}
      <button
        onClick={handleRecenter}
        className={`absolute bottom-32 right-4 z-[400] p-3 rounded-full shadow-lg border transition-all duration-300 ${shouldAutoCenter
          ? "bg-gray-900/50 text-neon-green border-neon-green/50"
          : "bg-neon-red text-white border-neon-red animate-pulse shadow-[0_0_10px_rgba(255,7,58,0.5)]"
          }`}
        title="Centralizar em mim"
      >
        <LocateFixed size={24} />
      </button>
    </>
  );
};

const sponsorIcon = L.divIcon({
  html: `<div class="bg-yellow-500 rounded-full p-1.5 border-2 border-white shadow-lg flex items-center justify-center w-8 h-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
         </div>`,
  className: 'bg-transparent',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const GameMap: React.FC<GameMapProps> = ({ currentPath, territories, userLocation, gpsAccuracy = 0, focusTarget = null, selectedTerritoryId = null, onForceRefresh, sponsors = [] }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading screen until we are on the client AND have a location
  if (!isClient || !userLocation) {
    return (
      <div className="h-full w-full bg-dark-bg flex flex-col items-center justify-center relative overflow-hidden">
        {/* Grid Background Effect */}
        <div className="absolute inset-0 z-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(#39ff14 1px, transparent 1px), linear-gradient(90deg, #39ff14 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}></div>

        <div className="z-10 flex flex-col items-center animate-pulse">
          <Satellite size={64} className="text-neon-green mb-6" />
          <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-2">BUSCANDO SATÉLITE</h2>
          <p className="text-neon-green font-mono text-sm">TRIANGULANDO POSIÇÃO GPS...</p>
          <div className="mt-8 w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-neon-green animate-progress-indeterminate"></div>
          </div>
          <p className="text-gray-500 text-xs mt-4 max-w-xs text-center px-4">
            Aguardando sinal preciso...<br />
            <span className="text-[10px] opacity-70">Vá para uma área aberta se demorar.</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full z-0 relative">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={17}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        attributionControl={false} // Disable default attribution
      >
        {/* Custom Minimalist Attribution */}
        <div className="leaflet-bottom leaflet-right">
          <div className="leaflet-control bg-transparent text-[8px] text-gray-500 opacity-20 px-1 pointer-events-none select-none">
            Leaflet | © OpenStreetMap
          </div>
        </div>

        {/* Light Mode Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapController location={userLocation} focusTarget={focusTarget} onForceRefresh={onForceRefresh} />

        {/* Existing Territories */}
        {territories.map((terr) => (
          <React.Fragment key={terr.id}>
            <Polygon
              positions={terr.coordinates.map(c => [c.lat, c.lng])}
              pathOptions={{
                color: terr.color,
                fillColor: terr.color,
                fillOpacity: 0.3,
                weight: terr.id === selectedTerritoryId ? 5 : 2,
                dashArray: terr.ownerId !== 'user_1' ? '5, 10' : undefined,
                opacity: terr.id === selectedTerritoryId ? 1 : 0.8
              }}
            >
              <Popup closeButton={false} offset={[0, -5]}>
                <div className="flex flex-col min-w-[150px]">
                  <h3 className="text-sm font-black uppercase tracking-widest mb-1 border-b border-gray-700 pb-1 text-white">
                    {terr.name}
                  </h3>
                  <div className="space-y-1 mt-1">
                    <div className="flex items-center text-xs text-gray-300">
                      <User size={10} className="mr-1 text-neon-green" />
                      <span>Dono: <strong className="text-white">{terr.ownerName || "Desconhecido"}</strong></span>
                    </div>
                    <div className="flex items-center text-xs text-gray-300">
                      <Trophy size={10} className="mr-1 text-yellow-400" />
                      <span>Valor: <strong className="text-yellow-400">{terr.value}</strong> pts</span>
                    </div>
                    {terr.description && (
                      <p className="text-[9px] text-gray-400 italic mt-2 border-t border-gray-800 pt-1 leading-tight">
                        "{terr.description}"
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Polygon>

            {/* Owner Avatar Marker at Centroid */}
            <Marker
              position={[
                terr.coordinates.reduce((sum, c) => sum + c.lat, 0) / terr.coordinates.length,
                terr.coordinates.reduce((sum, c) => sum + c.lng, 0) / terr.coordinates.length
              ]}
              icon={L.divIcon({
                className: 'bg-transparent border-none',
                html: `<div style="
                  width: 32px; 
                  height: 32px; 
                  border-radius: 50%; 
                  background-color: ${terr.color}; 
                  border: 2px solid white; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                  overflow: hidden;
                ">
                  <span style="font-weight: 900; color: white; font-size: 12px; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">
                    ${terr.ownerName ? terr.ownerName[0].toUpperCase() : '?'}
                  </span>
                </div>`
              })}
            >
              <Popup closeButton={false} offset={[0, -5]}>
                <div className="flex flex-col min-w-[150px]">
                  <h3 className="text-sm font-black uppercase tracking-widest mb-1 border-b border-gray-700 pb-1 text-white">
                    {terr.name}
                  </h3>
                  <div className="space-y-1 mt-1">
                    <div className="flex items-center text-xs text-gray-300">
                      <User size={10} className="mr-1 text-neon-green" />
                      <span>Dono: <strong className="text-white">{terr.ownerName || "Desconhecido"}</strong></span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}

        {/* Sponsors */}
        {sponsors.map(s => (
          <Marker
            key={s.id}
            position={[s.coordinates.lat, s.coordinates.lng]}
            icon={sponsorIcon}
          >
            <Popup>
              <div className="font-sans text-center min-w-[150px]">
                <div className="flex items-center justify-center mb-2 bg-gold-100 p-2 rounded-full w-10 h-10 mx-auto">
                  <Store size={20} className="text-gold-600" />
                </div>
                <h3 className="font-bold text-lg text-black">{s.name}</h3>

                <div className="bg-black text-gold-500 font-black text-xs py-1 px-2 rounded-lg my-2 inline-block">
                  +{s.rewardStars} ⭐ RECOMPENSA
                </div>

                {s.discountMessage && (
                  <div className="border border-green-500 bg-green-50 p-2 rounded-lg mb-2">
                    <p className="font-bold text-xs text-green-700">{s.discountMessage}</p>
                  </div>
                )}

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${s.coordinates.lat},${s.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gold-500 hover:bg-gold-600 text-white text-xs font-bold py-2 px-4 rounded-full block mt-2 transition-colors no-underline"
                >
                  IR ATÉ LÁ 📍
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Rota atual - Linha dourada brilhante */}
        {currentPath.length > 0 && (
          <Polyline
            positions={currentPath.map(c => [c.lat, c.lng])}
            pathOptions={{ color: '#39ff14', weight: 4, dashArray: '10, 10', dashOffset: '0' }}
          />
        )}

        {/* User Marker */}
        {userLocation && (
          <>
            {/* GPS Accuracy Circle */}
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              pathOptions={{ fillColor: '#f59e0b', fillOpacity: 0.1, stroke: true, weight: 1, color: '#f59e0b', opacity: 0.3 }}
              radius={Math.max(gpsAccuracy, 10)} // Ensure visible
            />

            {/* Pulsating Effect */}
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              pathOptions={{ fillColor: '#f59e0b', fillOpacity: 0.2, stroke: false }}
              radius={8}
            />
            {/* Center Dot */}
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              pathOptions={{ fillColor: '#f59e0b', fillOpacity: 1, stroke: true, color: '#fff', weight: 3 }}
              radius={5}
            />
          </>
        )}
      </MapContainer>

      <style>{`
        @keyframes progress-indeterminate {
            0% { width: 0%; margin-left: 0%; }
            50% { width: 70%; margin-left: 30%; }
            100% { width: 0%; margin-left: 100%; }
        }
        .animate-progress-indeterminate {
            animation: progress-indeterminate 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default GameMap;