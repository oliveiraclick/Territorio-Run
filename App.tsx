
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
import { AppShell } from './components/Layout/AppShell';
import { Coordinate, Territory, ActivityEvent, User, Team, Challenge, ActivityMode } from './types';
import { calculateTotalDistance, generateRandomColor, isValidGPSAccuracy, shouldAddPoint } from './utils/geoUtils';
import { findOverlappingTerritories, validateConquest, calculateConquestBonus, getRequiredDistance } from './utils/territoryUtils';
import { generateTerritoryInfo, generateRivalName } from './services/geminiService';
import { getOrCreateUser, fetchAllTerritories, createTerritory, updateTerritoryOwner } from './services/gameService';
import { addStars, STAR_REWARDS, isNightTime } from './utils/starSystem'; // Keep existing imports for now
import { calculateLevel } from './utils/starSystem'; // Add calculateLevel separately if needed, or merge
import { triggerConquestConfetti, triggerLevelUpConfetti } from './utils/celebration';
import { playAudio } from './utils/audioManager';
import { calculatePolygonArea } from './utils/metricsCalculator';
import { createTeam, joinTeam, addPointsToSquad } from './services/teamService';
import { createChallenge } from './services/challengeService';
import { updateBattleScore } from './services/battleService';
import { calculateAverageSpeed, calculateMaxSpeed, validateActivity, calculateAdjustedPoints } from './utils/activityUtils';
import { Watch, Menu, AlertTriangle, Satellite, User as UserIcon, HelpCircle } from 'lucide-react';
import { ShareCard } from './components/Social/ShareCard';

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
  const [showShareCard, setShowShareCard] = useState(false);
  const [lastConqueredTerritory, setLastConqueredTerritory] = useState<Territory | null>(null);

  const simulationInterval = useRef<any>(null);
  const watchId = useRef<number | null>(null);



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
    if (currentPath.length < 5) { alert("Trajeto muito curto, continue se movendo."); return; }

    // Validar distância mínima
    if (distance < 0.1) {
      alert("Distância insuficiente para conquistar um território (mínimo 100m).");
      setIsRunning(false);
      if (simulationInterval.current) clearInterval(simulationInterval.current);
      setIsSimulating(false);
      setDistance(0);
      setCurrentPath([]);
      return;
    }

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

        setTerritories(prev => prev.map(t => t.id === targetTerritory.id ? updatedTerritory : t));
        await updateTerritoryOwner(targetTerritory.id, currentUser?.id || '', currentUser?.name || '', targetTerritory.color);

        // Adicionar estrelas
        const newStars = userStars + conquestBonus;
        setUserStars(newStars);

        // Atualizar pontuação da guerra (se houver)
        if (currentUser?.teamId) {
          await updateBattleScore(currentUser.teamId, conquestBonus); // Guerra Externa
          await addPointsToSquad(currentUser.teamId, currentUser.id, conquestBonus); // Guerra Interna
        }

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
    const area = calculatePolygonArea(currentPath);

    // Se a área for muito pequena (ex: linha reta), conta apenas como corrida sem conquista
    if (area < 500) { // 500m² threshold
      const distanceStars = Math.floor(distance * STAR_REWARDS.DISTANCE_KM);
      const newStars = userStars + distanceStars;
      setUserStars(newStars);

      // Pelotão
      if (currentUser.teamId) {
        await addPointsToSquad(currentUser.teamId, currentUser.id, distanceStars);
      }

      setEvents(prev => [
        { id: Date.now().toString(), type: 'stars', message: `+${distanceStars} ⭐ pela corrida!`, timestamp: Date.now() },
        ...prev
      ]);

      setProcessing(false);
      alert(`🏃 Corrida finalizada!\nVocê ganhou ${distanceStars} estrelas pela distância.\n(Para conquistar um território, feche um polígono maior)`);
      return;
    }

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

    // Atualizar pontuação do pelotão (Guerra Interna)
    if (currentUser.teamId) {
      await addPointsToSquad(currentUser.teamId, currentUser.id, starsGained);
    }

    // Atualizar pontuação da guerra (se houver)
    if (currentUser?.teamId) {
      await updateBattleScore(currentUser.teamId, starsGained);
    }

    setEvents(prev => [
      { id: Date.now().toString(), type: 'stars', message: `+${starsGained} ⭐ estrelas ganhas!`, timestamp: Date.now() },
      { id: (Date.now() + 1).toString(), type: 'conquer', message: `Você conquistou "${finalName}"!`, timestamp: Date.now(), territoryId: tempId },
      ...prev
    ]);
    setShowNamingModal(false);

    // --- WOW FEATURES ---
    triggerConquestConfetti();
    playAudio(`Território ${finalName} conquistado! Você ganhou ${starsGained} estrelas.`);

    // Check level up (simplificado)
    const oldLevel = calculateLevel(userStars);
    const newLevel = calculateLevel(newStars);
    if (newLevel > oldLevel) {
      setTimeout(() => {
        triggerLevelUpConfetti();
        playAudio(`Parabéns! Você alcançou o nível ${newLevel}!`);
      }, 2000);
    }
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
  const handleCreateTeam = async (data: Partial<Team>): Promise<string | null> => {
    if (!currentUser) return null;

    const team = await createTeam(data, currentUser.id, currentUser.name);
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
    <AppShell
      user={currentUser}
      stars={userStars}
      isRunning={isRunning}
      onProfileClick={() => setShowProfile(true)}
      onMenuClick={() => setShowProfile(true)}
      onStartClick={handleStart}
      onStopClick={handleStop}
      onTeamClick={() => currentUser?.teamId ? setShowTeamDashboard(true) : setShowCreateTeam(true)}
      onRankingClick={() => setShowTeamDashboard(true)} // Or dedicated ranking
      onHelpClick={() => setShowGameRules(true)}
      navContent={
        <div className="pointer-events-auto">
          <TerritoryFilter
            currentFilter={territoryFilter}
            onFilterChange={setTerritoryFilter}
          />
        </div>
      }
    >
      {/* --- MAP LAYER --- */}
      <GameMap
        currentPath={currentPath}
        territories={filteredTerritories}
        userLocation={userLocation}
        gpsAccuracy={gpsAccuracy}
        focusTarget={mapFocusTarget}
        selectedTerritoryId={selectedTerritoryId}
      />

      {/* --- FLOATING OVERLAYS (Managed by Shell Z-Index) --- */}

      {/* GPS Status (Top Left, below bar) */}
      <div className="absolute top-20 left-4 z-20 pointer-events-none">
        <div className={`flex items-center space-x-2 backdrop-blur-md px-3 py-1 rounded-full border shadow-sm transition-all ${gpsQuality === 'good' ? 'bg-green-500/90 border-green-600' :
          gpsQuality === 'medium' ? 'bg-yellow-500/90 border-yellow-600' :
            'bg-red-500/90 border-red-600'
          }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${gpsQuality === 'good' ? 'bg-white' : 'bg-white animate-pulse'}`}></div>
          <span className="text-[10px] font-bold tracking-widest text-white">
            {!userLocation ? 'BUSCANDO GPS' :
              gpsQuality === 'good' ? 'GPS OK' :
                `GPS ${gpsAccuracy.toFixed(0)}m`}
          </span>
        </div>
      </div>

      {/* Error Toast */}
      {locationError && (
        <div className="absolute top-28 left-4 right-4 z-50 bg-red-900/90 border border-red-500 text-white p-3 rounded-xl flex items-center space-x-3 backdrop-blur-md shadow-lg animate-fade-in-down">
          <AlertTriangle className="text-red-300" size={16} />
          <span className="text-xs font-bold">{locationError}</span>
        </div>
      )}

      {/* Run Metrics (Dynamic Island Style) */}
      {isRunning && (
        <div className="absolute bottom-28 left-4 right-4 z-20 flex justify-center pointer-events-none">
          {/* Using existing RunMetrics but maybe simplified? Keeping as is for now */}
          <RunMetrics
            coordinates={currentPath}
            distance={distance}
            startTime={runStartTime}
            isRunning={isRunning}
          />
        </div>
      )}

      {/* Stats Panel (Summary) */}
      {!isRunning && (
        <div className="absolute bottom-28 left-4 z-20 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center gap-4">
            <div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Distância Total</div>
              <div className="text-lg font-black text-white">{distance.toFixed(2)} <span className="text-xs text-gray-500">km</span></div>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Territórios</div>
              <div className="text-lg font-black text-purple-400">{territories.filter(t => t.ownerId === currentUser?.id).length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Feed (Bottom Right, reduced size) */}
      <div className="absolute bottom-28 right-4 z-20 w-48 pointer-events-none">
        {/* Reuse ActivityFeed but maybe make it smaller or hidden by default */}
        <ActivityFeed events={events.slice(0, 2)} onEventClick={handleEventClick} />
      </div>

      {/* --- MODALS & SCREENS --- */}

      {/* Keeping these as Overlays */}
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

      {showTeamDashboard && currentTeam && currentUser && (
        <TeamDashboard
          team={currentTeam}
          currentUser={{ id: currentUser.id, name: currentUser.name }}
          onClose={() => setShowTeamDashboard(false)}
          onCreateChallenge={(name, desc, points, start, end) => handleCreateChallenge(name, desc, points, start, end)}
        />
      )}

      {showAdminDashboard && (
        <AdminDashboard onClose={() => setShowAdminDashboard(false)} />
      )}

      {/* Activity Selector Modal */}
      {showActivitySelector && (
        <div className="fixed inset-0 z-[10001] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-3xl w-full max-w-sm">
            <h3 className="text-white font-black text-xl mb-6 text-center">Escolha sua Modalidade</h3>
            <ActivityModeSelector
              selectedMode={selectedActivityMode}
              onSelectMode={setSelectedActivityMode}
            />
            <div className="mt-8 flex justify-center space-x-3">
              <button
                onClick={() => setShowActivitySelector(false)}
                className="flex-1 py-4 bg-gray-800 text-gray-400 font-bold rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleStartWithMode}
                className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/20"
              >
                VAMOS! 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Modals */}
      <CreateTeamModal
        isOpen={showCreateTeam}
        onClose={() => setShowCreateTeam(false)}
        onCreateTeam={handleCreateTeam}
      />

      {currentTeam && (
        <CreateChallengeModal
          isOpen={showCreateChallenge}
          teamName={currentTeam.name}
          onClose={() => setShowCreateChallenge(false)}
          onCreateChallenge={handleCreateChallenge}
        />
      )}

      {/* Processing Spinner Overlay */}
      {processing && (
        <div className="absolute inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center backdrop-blur-md">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-neon-green mb-4 shadow-[0_0_20px_#39ff14]"></div>
          <h2 className="text-2xl font-black text-white italic tracking-tighter animate-pulse">PROCESSANDO...</h2>
        </div>
      )}

      {/* Controls (Hidden - logic only if needed, but AppShell handles buttons now) */}
      <div className="hidden">
        <Controls isRunning={isRunning} onStart={handleStart} onStop={handleStop} onSimulate={toggleSimulation} isSimulating={isSimulating} />
      </div>

      {/* Game Rules Modal */}
      {showGameRules && <GameRules onClose={() => setShowGameRules(false)} />}

      {/* Social Share Card */}
      {showShareCard && lastConqueredTerritory && currentUser && (
        <ShareCard
          territory={lastConqueredTerritory}
          user={currentUser}
          onClose={() => setShowShareCard(false)}
        />
      )}

    </AppShell>
  );
}
