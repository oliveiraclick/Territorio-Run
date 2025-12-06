
import React, { useState, useEffect, useRef } from 'react';
import GameMap from './components/Map/GameMap';
import StatPanel from './components/UI/StatPanel';
import Controls from './components/UI/Controls';
import ActivityFeed from './components/UI/ActivityFeed';
import NamingModal from './components/UI/NamingModal';
import AuthScreen from './components/UI/AuthScreen';
import { ConfigPanel } from './components/ConfigPanel';
import { StarBar } from './components/UI/StarBar';
import { RunMetrics } from './components/UI/RunMetrics';
import { TutorialScreen } from './components/UI/TutorialScreen';
import { ProfileScreen } from './components/UI/ProfileScreen';
import { SplashScreen } from './components/UI/SplashScreen';
import { Coordinate, Territory, ActivityEvent, User } from './types';
import { calculateTotalDistance, generateRandomColor } from './utils/geoUtils';
import { generateTerritoryInfo, generateRivalName } from './services/geminiService';
import { getOrCreateUser, fetchAllTerritories, createTerritory, updateTerritoryOwner } from './services/gameService';
import { addStars, STAR_REWARDS, isNightTime, calculateLevel } from './utils/starSystem';
import { calculatePolygonArea } from './utils/metricsCalculator';
import { Watch, Menu, AlertTriangle, Satellite, User as UserIcon, Settings, HelpCircle } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [currentPath, setCurrentPath] = useState<Coordinate[]>([]);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(0);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [distance, setDistance] = useState(0);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapFocusTarget, setMapFocusTarget] = useState<Coordinate | null>(null);

  const [showNamingModal, setShowNamingModal] = useState(false);
  const [suggestedName, setSuggestedName] = useState("");
  const [suggestedDescription, setSuggestedDescription] = useState("");
  const [pendingStrategicValue, setPendingStrategicValue] = useState(0);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [runStartTime, setRunStartTime] = useState(0);
  const [userStars, setUserStars] = useState(0);

  const simulationInterval = useRef<any>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    // Remove loading screen immediately after React loads
    const loader = document.getElementById('loading-screen');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    }
  }, []);

  useEffect(() => {
    const savedUserStr = localStorage.getItem('territory_user_session');
    if (savedUserStr) {
      setCurrentUser(JSON.parse(savedUserStr));
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchAllTerritories();
      setTerritories(data);
    };
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = async (name: string, phone: string, password: string) => {
    setLoadingAuth(true);
    try {
      const user = await getOrCreateUser(name, phone, password);
      if (user) {
        localStorage.setItem('territory_user_session', JSON.stringify(user));
        setCurrentUser(user);
      } else {
        alert("Erro ao conectar com o servidor. Tente novamente.");
      }
    } catch (e: any) {
      alert(e.message || "Falha no acesso. Verifique seus dados.");
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Deseja desconectar?")) {
      setShowProfile(false);
      localStorage.removeItem('territory_user_session');
      setCurrentUser(null);
    }
  }

  useEffect(() => {
    if (!currentUser) return;
    if (!navigator.geolocation) {
      setLocationError("Geolocalização não suportada.");
      return;
    }
    const handlePosition = (pos: GeolocationPosition) => {
      setLocationError(null);
      const newCoord = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        timestamp: pos.timestamp
      };
      setUserLocation(newCoord);
      setGpsAccuracy(pos.coords.accuracy);

      if (isRunning && !isSimulating) {
        setCurrentPath(prev => {
          const updated = [...prev, newCoord];
          setDistance(calculateTotalDistance(updated));
          return updated;
        });
      }
    };
    const handleError = (err: GeolocationPositionError) => {
      if (err.code === 1) setLocationError("Permissão de GPS negada.");
      else if (err.code === 2) setLocationError("Sinal de GPS fraco.");
      else if (err.code === 3) setLocationError("Timeout no GPS.");
    };
    const options = { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 };
    navigator.geolocation.getCurrentPosition(handlePosition, handleError, options);
    watchId.current = navigator.geolocation.watchPosition(handlePosition, handleError, options);
    return () => { if (watchId.current) navigator.geolocation.clearWatch(watchId.current); };
  }, [isRunning, isSimulating, currentUser]);

  const toggleSimulation = () => {
    if (isSimulating) {
      setIsSimulating(false);
      if (simulationInterval.current) clearInterval(simulationInterval.current);
      return;
    }
    setIsSimulating(true);
    let lat = userLocation?.lat || -23.550520;
    let lng = userLocation?.lng || -46.633308;
    simulationInterval.current = window.setInterval(() => {
      if (!isRunning) return;
      lat += (Math.random() - 0.5) * 0.0005;
      lng += (Math.random() - 0.5) * 0.0005;
      const simCoord = { lat, lng, timestamp: Date.now() };
      setUserLocation(simCoord);
      setGpsAccuracy(5);
      setCurrentPath(prev => {
        const updated = [...prev, simCoord];
        setDistance(calculateTotalDistance(updated));
        return updated;
      });
    }, 1000);
  };

  const handleEventClick = (event: ActivityEvent) => {
    if (event.territoryId) {
      const targetTerritory = territories.find(t => t.id === event.territoryId);
      if (targetTerritory && targetTerritory.coordinates.length > 0) {
        const latSum = targetTerritory.coordinates.reduce((sum, c) => sum + c.lat, 0);
        const lngSum = targetTerritory.coordinates.reduce((sum, c) => sum + c.lng, 0);
        setMapFocusTarget({ lat: latSum / targetTerritory.coordinates.length, lng: lngSum / targetTerritory.coordinates.length, timestamp: Date.now() });
        setTimeout(() => setMapFocusTarget(null), 5000);
      }
    }
  };

  const handleStart = () => {
    if (!userLocation && !isSimulating) { alert("Aguardando GPS..."); return; }
    setIsRunning(true);
    setCurrentPath([]);
    setDistance(0);
    setRunStartTime(Date.now());
  };

  const handleStop = async () => {
    setIsRunning(false);
    if (simulationInterval.current) clearInterval(simulationInterval.current);
    setIsSimulating(false);
    if (currentPath.length < 5) { alert("Trajeto muito curto."); return; }
    setProcessing(true);
    const info = await generateTerritoryInfo(currentPath, distance);
    setSuggestedName(info.name);
    setSuggestedDescription(info.description);
    setPendingStrategicValue(info.strategicValue);
    setProcessing(false);
    setShowNamingModal(true);
  };

  const handleConfirmTerritory = async (finalName: string) => {
    if (!currentUser) return;
    const tempId = Date.now().toString();
    const newTerritory: Territory = {
      id: tempId, name: finalName, coordinates: currentPath,
      ownerId: currentUser.id, ownerName: currentUser.name,
      color: generateRandomColor(), value: pendingStrategicValue,
      conqueredAt: Date.now(), description: suggestedDescription
    };
    setTerritories(prev => [...prev, newTerritory]);
    await createTerritory(newTerritory);

    // Calcular estrelas ganhas
    let starsGained = STAR_REWARDS.CONQUER_TERRITORY;
    const area = calculatePolygonArea(currentPath);
    const distanceStars = Math.floor(distance * STAR_REWARDS.DISTANCE_KM);
    starsGained += distanceStars;

    // Bônus noturno
    if (isNightTime()) {
      starsGained += STAR_REWARDS.NIGHT_CONQUEST;
    }

    // Bônus território grande
    if (area > 10000) {
      starsGained += STAR_REWARDS.LARGE_TERRITORY;
    }

    const newStars = userStars + starsGained;
    setUserStars(newStars);

    setEvents(prev => [
      { id: Date.now().toString(), type: 'stars', message: `+${starsGained} ⭐ estrelas ganhas!`, timestamp: Date.now() },
      { id: (Date.now() + 1).toString(), type: 'conquer', message: `Você conquistou "${finalName}"!`, timestamp: Date.now(), territoryId: tempId },
      ...prev
    ]);
    setShowNamingModal(false);
  };

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!currentUser) {
    return (
      <>
        {loadingAuth && (
          <div className="fixed inset-0 z-[100] bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
        <AuthScreen onRegister={handleRegister} />
      </>
    );
  }

  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-orange-50 via-blue-50 to-cyan-50 text-gray-800 font-sans overflow-hidden">
      <div className="absolute top-0 left-0 w-full z-20 p-4 pt-4 flex justify-between items-center pointer-events-none">
        <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full pointer-events-auto border border-gray-200 shadow-sm">
          <div className={`w-2 h-2 rounded-full ${userLocation ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 animate-pulse'}`}></div>
          <span className="text-xs font-bold tracking-widest text-gray-700">{userLocation ? 'GPS ONLINE' : 'GPS BUSCANDO'}</span>
        </div>
        <div className="flex items-center space-x-2 pointer-events-auto">
          <button onClick={() => setShowTutorial(true)} className="flex items-center space-x-2 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full border border-gray-200 hover:border-blue-500 transition-colors shadow-sm" title="Como Jogar">
            <HelpCircle size={14} className="text-blue-500" />
          </button>
          <button onClick={() => setShowConfigPanel(true)} className="flex items-center space-x-2 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full border border-gray-200 hover:border-orange-500 transition-colors shadow-sm">
            <Settings size={14} className="text-orange-500" />
          </button>
          <button onClick={() => setShowProfile(true)} className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-blue-500 backdrop-blur-md rounded-full border-0 hover:shadow-lg transition-all shadow-sm" title="Perfil">
            <UserIcon size={14} className="text-white" />
            <span className="text-xs font-bold uppercase text-white">{currentUser.name}</span>
          </button>
        </div>
      </div>

      {locationError && (
        <div className="absolute top-24 left-4 right-4 z-50 bg-red-900/90 border border-red-500 text-white p-4 rounded-lg flex items-center space-x-3 backdrop-blur-md">
          <AlertTriangle className="text-red-300" />
          <span className="text-sm font-bold">{locationError}</span>
        </div>
      )}

      {/* StarBar */}
      <div className="absolute top-16 left-4 right-4 z-20">
        <StarBar stars={userStars} compact />
      </div>

      <GameMap currentPath={currentPath} territories={territories} userLocation={userLocation} gpsAccuracy={gpsAccuracy} focusTarget={mapFocusTarget} />

      {/* RunMetrics durante corrida */}
      {isRunning && currentPath.length > 0 && (
        <RunMetrics
          coordinates={currentPath}
          distance={distance}
          startTime={runStartTime}
          isRunning={isRunning}
        />
      )}

      <StatPanel distance={distance} territoriesCount={territories.filter(t => t.ownerId === currentUser.id).length} isRunning={isRunning} />
      <ActivityFeed events={events} onEventClick={handleEventClick} />

      <NamingModal isOpen={showNamingModal} suggestedName={suggestedName} suggestedDescription={suggestedDescription} strategicValue={pendingStrategicValue} onConfirm={handleConfirmTerritory} onCancel={() => setShowNamingModal(false)} />

      {showConfigPanel && <ConfigPanel onClose={() => setShowConfigPanel(false)} />}
      {showTutorial && <TutorialScreen onClose={() => setShowTutorial(false)} />}
      {showProfile && (
        <ProfileScreen
          user={currentUser}
          territories={territories}
          totalDistance={distance}
          totalStars={userStars}
          onClose={() => setShowProfile(false)}
          onLogout={handleLogout}
        />
      )}

      {processing && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-neon-green mb-4"></div>
          <h2 className="text-xl font-bold text-neon-green animate-pulse">ANALISANDO DADOS...</h2>
        </div>
      )}

      <Controls isRunning={isRunning} onStart={handleStart} onStop={handleStop} onSimulate={toggleSimulation} isSimulating={isSimulating} />

      <div className="absolute bottom-2 left-4 z-10 opacity-50 pointer-events-none">
        <div className="flex items-center space-x-1 text-[10px] text-gray-500">
          <Satellite size={10} />
          <span>v7.0 • Sistema de Configuração Centralizado</span>
        </div>
      </div>
    </div>
  );
}
