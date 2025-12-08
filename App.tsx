
import React, { useState, useEffect, useRef } from 'react';
import GameMap from './components/Map/GameMap';
import StatPanel from './components/UI/StatPanel';
import Controls from './components/UI/Controls';
import ActivityFeed from './components/UI/ActivityFeed';
import NamingModal from './components/UI/NamingModal';
import AuthScreen from './components/UI/AuthScreen';
import TerritoryFilter from './components/UI/TerritoryFilter';
import CreateTeamModal from './components/Team/CreateTeamModal';
import TeamDashboard from './components/Team/TeamDashboard';
import CreateChallengeModal from './components/Team/CreateChallengeModal';
import ActivityModeSelector from './components/UI/ActivityModeSelector';
import { GameRules } from './components/UI/GameRules';

import { StarBar } from './components/UI/StarBar';
import { RunMetrics } from './components/UI/RunMetrics';
import { TutorialScreen } from './components/UI/TutorialScreen';
import { ProfileScreen } from './components/UI/ProfileScreen';
import { SplashScreen } from './components/UI/SplashScreen';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { Coordinate, Territory, ActivityEvent, User, Team, Challenge, ActivityMode } from './types';
import { calculateTotalDistance, generateRandomColor, isValidGPSAccuracy, shouldAddPoint } from './utils/geoUtils';
import { findOverlappingTerritories, validateConquest, calculateConquestBonus, getRequiredDistance } from './utils/territoryUtils';
import { generateTerritoryInfo, generateRivalName } from './services/geminiService';
import { getOrCreateUser, fetchAllTerritories, createTerritory, updateTerritoryOwner } from './services/gameService';
import { addStars, STAR_REWARDS, isNightTime, calculateLevel } from './utils/starSystem';
import { calculatePolygonArea } from './utils/metricsCalculator';
import { createTeam, joinTeam } from './services/teamService';
import { createChallenge } from './services/challengeService';
import { calculateAverageSpeed, calculateMaxSpeed, validateActivity, calculateAdjustedPoints } from './utils/activityUtils';
import { Watch, Menu, AlertTriangle, Satellite, User as UserIcon, HelpCircle } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [currentPath, setCurrentPath] = useState<Coordinate[]>([]);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(0);
  const [gpsQuality, setGpsQuality] = useState<'good' | 'medium' | 'poor'>('poor');
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

  const [showTutorial, setShowTutorial] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [runStartTime, setRunStartTime] = useState(0);
  const [userStars, setUserStars] = useState(0);

  // Novos estados para conquista
  const [territoryFilter, setTerritoryFilter] = useState<'all' | 'mine' | 'others'>('all');
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(null);

  // Estados para equipes
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showTeamDashboard, setShowTeamDashboard] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [pendingChallenge, setPendingChallenge] = useState<Partial<Challenge> | null>(null);

  // Estados para modalidade de atividade
  const [showActivitySelector, setShowActivitySelector] = useState(false);
  const [selectedActivityMode, setSelectedActivityMode] = useState<ActivityMode>('running');
  const [currentAvgSpeed, setCurrentAvgSpeed] = useState(0);
  const [currentMaxSpeed, setCurrentMaxSpeed] = useState(0);

  // Estado para regras do jogo
  const [showGameRules, setShowGameRules] = useState(false);

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

  const handleRegister = async (name: string, phone: string, password: string, teamId?: string, teamName?: string) => {
    setLoadingAuth(true);
    try {
      const user = await getOrCreateUser(name, phone, password);
      if (user) {
        // Se tem teamId, vincular à equipe
        if (teamId && teamName) {
          await joinTeam(user.id, user.name, teamId, teamName);
          user.teamId = teamId;
          user.teamName = teamName;
          user.role = 'member';
        }

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
      const accuracy = pos.coords.accuracy;
      const newCoord = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        timestamp: pos.timestamp
      };

      // Atualizar qualidade do GPS baseado na precisão
      if (accuracy <= 10) {
        setGpsQuality('good');
      } else if (accuracy <= 20) {
        setGpsQuality('medium');
      } else {
        setGpsQuality('poor');
      }

      setUserLocation(newCoord);
      setGpsAccuracy(accuracy);

      // Validar precisão GPS antes de adicionar ao caminho
      if (isRunning && !isSimulating) {
        // Só adiciona pontos com boa precisão
        if (!isValidGPSAccuracy(accuracy)) {
          console.log(`GPS com baixa precisão: ${accuracy.toFixed(1)}m - ponto ignorado`);
          return;
        }

        setCurrentPath(prev => {
          // Verificar se deve adicionar o ponto (distância mínima)
          const lastPoint = prev.length > 0 ? prev[prev.length - 1] : null;
          if (!shouldAddPoint(newCoord, lastPoint)) {
            console.log('Ponto muito próximo do anterior - ignorado');
            return prev;
          }

          const updated = [...prev, newCoord];
          setDistance(calculateTotalDistance(updated));
          console.log(`Ponto adicionado - Precisão: ${accuracy.toFixed(1)}m, Total: ${updated.length} pontos`);
          return updated;
        });
      }
    };
    const handleError = (err: GeolocationPositionError) => {
      if (err.code === 1) setLocationError("Permissão de GPS negada.");
      else if (err.code === 2) setLocationError("Sinal de GPS fraco.");
      else if (err.code === 3) setLocationError("Timeout no GPS.");
    };
    const options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 1000 };
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
    // Mostrar seletor de modalidade antes de iniciar
    setShowActivitySelector(true);
  };

  const handleStartWithMode = () => {
    if (!userLocation && !isSimulating) { alert("Aguardando GPS..."); return; }
    setShowActivitySelector(false);
    setIsRunning(true);
    setCurrentPath([]);
    setDistance(0);
    setRunStartTime(Date.now());
    setCurrentAvgSpeed(0);
    setCurrentMaxSpeed(0);
  };

  const handleStop = async () => {
    setIsRunning(false);
    if (simulationInterval.current) clearInterval(simulationInterval.current);
    setIsSimulating(false);
    if (currentPath.length < 5) { alert("Trajeto muito curto."); return; }

    setProcessing(true);

    // Calcular velocidades
    const avgSpeed = calculateAverageSpeed(currentPath);
    const maxSpeed = calculateMaxSpeed(currentPath);
    setCurrentAvgSpeed(avgSpeed);
    setCurrentMaxSpeed(maxSpeed);

    // Validar atividade
    const validation = validateActivity(selectedActivityMode, avgSpeed, maxSpeed);

    if (!validation.valid) {
      // Atividade inválida - possível fraude
      setProcessing(false);
      alert(validation.reason);
      setEvents(prev => [{
        id: Date.now().toString(),
        type: 'fraud',
        message: `❌ Atividade bloqueada: ${validation.reason}`,
        timestamp: Date.now()
      }, ...prev]);
      return;
    }

    // Alerta se velocidade suspeita (mas não bloqueia)
    if (validation.suspicionLevel === 'medium' && validation.reason) {
      setEvents(prev => [{
        id: Date.now().toString(),
        type: 'stars',
        message: validation.reason,
        timestamp: Date.now()
      }, ...prev]);
    }

    // Verificar se sobrepõe território de outro jogador
    const overlappingTerritories = findOverlappingTerritories(currentPath, territories, currentUser?.id || '');

    if (overlappingTerritories.length > 0) {
      // Tentativa de conquista!
      const targetTerritory = overlappingTerritories[0]; // Pega o primeiro território sobreposto
      const isValid = validateConquest(distance, targetTerritory);

      if (isValid) {
        // CONQUISTA BEM-SUCEDIDA!
        const isReconquest = targetTerritory.previousOwnerId === currentUser?.id;
        const conquestBonus = calculateConquestBonus(targetTerritory.conquestCount || 0, isReconquest);

        // Atualizar território
        const updatedTerritory: Territory = {
          ...targetTerritory,
          ownerId: currentUser?.id || '',
          ownerName: currentUser?.name || '',
          conqueredAt: Date.now(),
          conquestCount: (targetTerritory.conquestCount || 0) + 1,
          previousOwnerId: targetTerritory.ownerId,
          previousOwnerName: targetTerritory.ownerName,
        };

        setTerritories(prev => prev.map(t => t.id === targetTerritory.id ? updatedTerritory : t));
        await updateTerritoryOwner(targetTerritory.id, currentUser?.id || '', currentUser?.name || '', targetTerritory.color);

        // Adicionar estrelas
        const newStars = userStars + conquestBonus;
        setUserStars(newStars);

        setEvents(prev => [
          { id: Date.now().toString(), type: 'stars', message: `+${conquestBonus} ⭐ por conquistar território!`, timestamp: Date.now() },
          { id: (Date.now() + 1).toString(), type: 'conquer', message: `Você conquistou "${targetTerritory.name}" de ${targetTerritory.ownerName}!`, timestamp: Date.now(), territoryId: targetTerritory.id },
          ...prev
        ]);

        setProcessing(false);
        alert(`🎉 CONQUISTA! Você dominou "${targetTerritory.name}"!\n+${conquestBonus} estrelas`);
        return;
      } else {
        // Falha na conquista
        const required = getRequiredDistance(targetTerritory.originalDistance || 0, targetTerritory.conquestCount || 0);
        setProcessing(false);
        alert(`❌ Conquista falhou!\nVocê percorreu ${distance.toFixed(2)}km\nNecessário: ${required.toFixed(2)}km (+${((targetTerritory.conquestCount || 0) * 10)}%)`);
        return;
      }
    }

    // Novo território (não sobrepõe nenhum existente)
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

    // Verificar se é território de desafio
    const isChallenge = pendingChallenge !== null;

    const newTerritory: Territory = {
      id: tempId, name: finalName, coordinates: currentPath,
      ownerId: currentUser.id, ownerName: currentUser.name,
      color: generateRandomColor(),
      value: calculateAdjustedPoints(pendingStrategicValue, selectedActivityMode), // Ajustar pontos pela modalidade
      conqueredAt: Date.now(), description: suggestedDescription,
      conquestCount: 0,
      originalDistance: distance,
      visibility: isChallenge ? 'team' : 'public',
      teamId: isChallenge ? currentTeam?.id : undefined,
      challengeId: undefined, // Será definido após criar o desafio
      activityMode: selectedActivityMode, // Salvar modalidade
      avgSpeed: currentAvgSpeed, // Salvar velocidade média
      maxSpeed: currentMaxSpeed // Salvar velocidade máxima
    };

    setTerritories(prev => [...prev, newTerritory]);
    await createTerritory(newTerritory);

    // Se for desafio, criar o desafio
    if (isChallenge && pendingChallenge) {
      const challenge = await createChallenge({
        ...pendingChallenge as Omit<Challenge, 'id' | 'createdAt'>,
        territoryId: tempId
      });

      if (challenge) {
        setEvents(prev => [
          { id: Date.now().toString(), type: 'stars', message: `Desafio "${challenge.name}" criado!`, timestamp: Date.now() },
          ...prev
        ]);
      }

      setPendingChallenge(null);
    }

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

  // Handler para clique em card de território
  const handleTerritoryClick = (territoryId: string) => {
    const territory = territories.find(t => t.id === territoryId);
    if (territory && territory.coordinates.length > 0) {
      const latSum = territory.coordinates.reduce((sum, c) => sum + c.lat, 0);
      const lngSum = territory.coordinates.reduce((sum, c) => sum + c.lng, 0);
      setMapFocusTarget({
        lat: latSum / territory.coordinates.length,
        lng: lngSum / territory.coordinates.length,
        timestamp: Date.now()
      });
      setSelectedTerritoryId(territoryId);
      setTimeout(() => {
        setMapFocusTarget(null);
        setSelectedTerritoryId(null);
      }, 5000);
      setShowProfile(false); // Fechar painel ao clicar
    }
  };

  // Filtrar territórios baseado no filtro selecionado
  const filteredTerritories = territories.filter(t => {
    if (territoryFilter === 'mine') return t.ownerId === currentUser?.id;
    if (territoryFilter === 'others') return t.ownerId !== currentUser?.id;
    return true; // 'all'
  });

  // Handler para criar equipe
  const handleCreateTeam = async (name: string): Promise<string | null> => {
    if (!currentUser) return null;

    const team = await createTeam(name, currentUser.id, currentUser.name);
    if (team) {
      setCurrentTeam(team);
      // Atualizar usuário como dono
      currentUser.teamId = team.id;
      currentUser.teamName = team.name;
      currentUser.role = 'owner';
      setCurrentUser({ ...currentUser });
      return team.slug;
    }
    return null;
  };

  // Handler para criar desafio
  const handleCreateChallenge = (name: string, description: string, points: number, startDate: number, endDate: number) => {
    if (!currentTeam || !currentUser) return;

    // Salvar dados do desafio pendente
    setPendingChallenge({
      name,
      description,
      points,
      startDate,
      endDate,
      teamId: currentTeam.id,
      createdBy: currentUser.id,
      isActive: true
    });

    // Fechar modal e iniciar corrida para criar território
    setShowCreateChallenge(false);
    handleStart(); // Inicia corrida automaticamente
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
        <div className={`flex items-center space-x-2 backdrop-blur-md px-3 py-1 rounded-full pointer-events-auto border shadow-sm transition-all ${gpsQuality === 'good' ? 'bg-green-500/90 border-green-600' :
          gpsQuality === 'medium' ? 'bg-yellow-500/90 border-yellow-600' :
            'bg-red-500/90 border-red-600'
          }`}>
          <div className={`w-2 h-2 rounded-full ${gpsQuality === 'good' ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' :
            gpsQuality === 'medium' ? 'bg-white animate-pulse' :
              'bg-white animate-pulse'
            }`}></div>
          <span className="text-xs font-bold tracking-widest text-white">
            {!userLocation ? 'GPS BUSCANDO' :
              gpsQuality === 'good' ? `GPS ÓTIMO (${gpsAccuracy.toFixed(0)}m)` :
                gpsQuality === 'medium' ? `GPS BOM (${gpsAccuracy.toFixed(0)}m)` :
                  `GPS FRACO (${gpsAccuracy.toFixed(0)}m)`}
          </span>
        </div>
        <div className="flex items-center space-x-2 pointer-events-auto">
          <button onClick={() => setShowTutorial(true)} className="flex items-center space-x-2 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full border border-gray-200 hover:border-blue-500 transition-colors shadow-sm" title="Como Jogar">
            <HelpCircle size={14} className="text-blue-500" />
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

      {/* Filtro de Territórios */}
      <div className="absolute top-28 right-4 z-20">
        <TerritoryFilter
          currentFilter={territoryFilter}
          onFilterChange={setTerritoryFilter}
        />
      </div>

      <GameMap
        currentPath={currentPath}
        territories={filteredTerritories}
        userLocation={userLocation}
        gpsAccuracy={gpsAccuracy}
        focusTarget={mapFocusTarget}
      />

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


      {showTutorial && <TutorialScreen onClose={() => setShowTutorial(false)} />}
      {showProfile && (
        <ProfileScreen
          user={currentUser}
          territories={territories}
          totalDistance={distance}
          totalStars={userStars}
          onClose={() => setShowProfile(false)}
          onLogout={handleLogout}
          onAdminAccess={() => {
            setShowProfile(false);
            setShowAdminDashboard(true);
          }}
          onTerritoryClick={handleTerritoryClick}
          onCreateTeam={() => {
            setShowProfile(false);
            setShowCreateTeam(true);
          }}
          onViewTeam={() => {
            setShowProfile(false);
            setShowTeamDashboard(true);
          }}
        />
      )}

      {showAdminDashboard && (
        <AdminDashboard onClose={() => setShowAdminDashboard(false)} />
      )}

      {/* Modal de Seleção de Atividade */}
      {showActivitySelector && (
        <div className="fixed inset-0 z-[10001] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative">
            <ActivityModeSelector
              selectedMode={selectedActivityMode}
              onSelectMode={setSelectedActivityMode}
            />
            <div className="mt-4 flex justify-center space-x-3">
              <button
                onClick={() => setShowActivitySelector(false)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleStartWithMode}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Iniciar Atividade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modais de Equipe */}
      <CreateTeamModal
        isOpen={showCreateTeam}
        onClose={() => setShowCreateTeam(false)}
        onCreateTeam={handleCreateTeam}
      />

      {currentTeam && showTeamDashboard && (
        <TeamDashboard
          team={currentTeam}
          isOwner={currentUser?.role === 'owner'}
          onClose={() => setShowTeamDashboard(false)}
          onCreateChallenge={() => {
            setShowTeamDashboard(false);
            setShowCreateChallenge(true);
          }}
        />
      )}

      {currentTeam && (
        <CreateChallengeModal
          isOpen={showCreateChallenge}
          teamName={currentTeam.name}
          onClose={() => setShowCreateChallenge(false)}
          onCreateChallenge={handleCreateChallenge}
        />
      )}

      {processing && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-neon-green mb-4"></div>
          <h2 className="text-xl font-bold text-neon-green animate-pulse">ANALISANDO DADOS...</h2>
        </div>
      )}

      <Controls isRunning={isRunning} onStart={handleStart} onStop={handleStop} onSimulate={toggleSimulation} isSimulating={isSimulating} />


      {/* Botão de Ajuda */}
      <button
        onClick={() => setShowGameRules(true)}
        className="fixed bottom-20 right-4 z-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
        title="Como Jogar"
      >
        <HelpCircle size={24} />
      </button>

      {/* Modal de Regras */}
      {showGameRules && <GameRules onClose={() => setShowGameRules(false)} />}

      <div className="absolute bottom-2 left-4 z-10 opacity-50 pointer-events-none">
        <div className="flex items-center space-x-1 text-[10px] text-gray-500">
          <Satellite size={10} />
          <span>v8.0 • Sistema Anti-Fraude + Equipes</span>
        </div>
      </div>
    </div>
  );
}
