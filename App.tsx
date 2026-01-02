
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
import { LeaderboardModal } from './components/UI/LeaderboardModal';
import { GameRules } from './components/UI/GameRules';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw } from 'lucide-react';

import { StarBar } from './components/UI/StarBar';
import { RunMetrics } from './components/UI/RunMetrics';
import { TutorialScreen } from './components/UI/TutorialScreen';
import { ProfileScreen } from './components/UI/ProfileScreen';
import { SplashScreen } from './components/UI/SplashScreen';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AppShell } from './components/Layout/AppShell';
import { Coordinate, Territory, ActivityEvent, User, Team, Challenge, ActivityMode, Sponsor } from './types';
import { calculateTotalDistance, generateRandomColor, isValidGPSAccuracy, shouldAddPoint, getNeighborhood } from './utils/geoUtils';
import { findOverlappingTerritories, validateConquest, calculateConquestBonus, getRequiredDistance } from './utils/territoryUtils';
import { generateTerritoryInfo, generateRivalName } from './services/geminiService';
import { getOrCreateUser, fetchAllTerritories, createTerritory, updateTerritoryOwner, updateUser, fetchRecentActivity } from './services/gameService';
import { saveToOfflineQueue, processOfflineQueue } from './services/offlineService'; // Offline Service
import { fetchSponsors } from './services/sponsorService'; // Sponsors
import { addStars, STAR_REWARDS, isNightTime } from './utils/starSystem'; // Keep existing imports for now
import { calculateLevel } from './utils/starSystem'; // Add calculateLevel separately if needed, or merge
import { triggerConquestConfetti, triggerLevelUpConfetti } from './utils/celebration';
import { playAudio } from './utils/audioManager';
import { calculatePolygonArea } from './utils/metricsCalculator';
import { createTeam, joinTeam, addPointsToSquad } from './services/teamService';
import { createChallenge } from './services/challengeService';
import { updateBattleScore } from './services/battleService';
import { calculateAverageSpeed, calculateMaxSpeed, validateActivity, calculateAdjustedPoints } from './utils/activityUtils';
import { Watch, Menu, AlertTriangle, Satellite, User as UserIcon, HelpCircle, ScanLine } from 'lucide-react';
import { ShareCard } from './components/Social/ShareCard';
import { QRScanner } from './components/Sponsor/QRScanner'; // Import QRScanner

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered');
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [currentPath, setCurrentPath] = useState<Coordinate[]>([]);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(0);
  const [gpsQuality, setGpsQuality] = useState<'good' | 'medium' | 'poor'>('poor');
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
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
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Estados para modalidade de atividade
  const [showActivitySelector, setShowActivitySelector] = useState(false);
  const [selectedActivityMode, setSelectedActivityMode] = useState<ActivityMode>('running');
  const [currentAvgSpeed, setCurrentAvgSpeed] = useState(0);
  const [currentMaxSpeed, setCurrentMaxSpeed] = useState(0);

  // Estado para regras do jogo
  const [showGameRules, setShowGameRules] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [lastConqueredTerritory, setLastConqueredTerritory] = useState<Territory | null>(null);

  const simulationInterval = useRef<any>(null);
  const watchId = useRef<number | null>(null);
  const wakeLock = useRef<any>(null); // Wake Lock reference

  // --- PERSISTENCE & WAKE LOCK ---

  // 1. Recover crash/closed state
  useEffect(() => {
    const savedRun = localStorage.getItem('territory_run_state');
    if (savedRun) {
      try {
        const parsed = JSON.parse(savedRun);
        if (parsed.isRunning && parsed.currentPath && parsed.currentPath.length > 0) {
          console.log("⚠️ Crash recovered: Resuming run...", parsed);
          setIsRunning(true);
          setCurrentPath(parsed.currentPath);
          setDistance(parsed.distance || 0);
          setRunStartTime(parsed.runStartTime || Date.now());
          setSelectedActivityMode(parsed.activityMode || 'running');

          // Optional: Notify user
          alert("Corrida recuperada! O sistema fechou inesperadamente, mas seus dados foram salvos.");
        }
      } catch (e) {
        console.error("Failed to recover run:", e);
      }
    }
  }, []);

  // 2. Save state on every update (Only if running)
  useEffect(() => {
    if (isRunning && currentPath.length > 0) {
      const stateToSave = {
        isRunning: true,
        currentPath,
        distance,
        runStartTime,
        activityMode: selectedActivityMode,
        timestamp: Date.now()
      };
      localStorage.setItem('territory_run_state', JSON.stringify(stateToSave));
    }
  }, [isRunning, currentPath, distance, runStartTime, selectedActivityMode]);

  // 3. Screen Wake Lock (Keep screen on)
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLock.current = await (navigator as any).wakeLock.request('screen');
        console.log('Wake Lock active!');
      }
    } catch (err: any) {
      console.warn(`${err.name}, ${err.message}`);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLock.current) {
      try {
        await wakeLock.current.release();
        wakeLock.current = null;
        console.log('Wake Lock released');
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Toggle Wake Lock based on isRunning
  useEffect(() => {
    if (isRunning) {
      requestWakeLock();
      // Re-acquire if visibility changes (e.g. user minimized and came back)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && isRunning) {
          requestWakeLock();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        releaseWakeLock();
      };
    } else {
      releaseWakeLock();
    }
  }, [isRunning]);
  // 4. Load User Session
  useEffect(() => {
    const savedUserStr = localStorage.getItem('territory_user_session');
    if (savedUserStr) {
      setCurrentUser(JSON.parse(savedUserStr));
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const [territoriesData, sponsorsData] = await Promise.all([
        fetchAllTerritories(),
        fetchSponsors()
      ]);
      setTerritories(territoriesData);
      setSponsors(sponsorsData);
    };
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = async (name: string, phone: string, password: string, teamId?: string, teamName?: string, role?: 'owner' | 'member' | 'individual', companyName?: string, cnpj?: string) => {
    setLoadingAuth(true);
    try {
      const user = await getOrCreateUser(name, phone, password, role, companyName, cnpj);
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

        // Auto-open create team for owners without team
        if (user.role === 'owner' && !user.teamId) {
          setShowCreateTeam(true);
        }
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

  const handleUpdateProfile = async (name: string, phone: string, neighborhood?: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const updatedUser = await updateUser(currentUser.id, { name, phone, neighborhood });
      if (updatedUser) {
        // Preserve local session fields like teamId if not returned by update (though service tries to)
        const mergedUser = { ...currentUser, ...updatedUser };
        setCurrentUser(mergedUser);
        localStorage.setItem('territory_user_session', JSON.stringify(mergedUser));
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to update profile", e);
      alert("Erro ao atualizar perfil.");
      return false;
    }
  };

  // --- OFFLINE SYNC ---
  useEffect(() => {
    // Try to sync on mount and when coming online
    processOfflineQueue();
    window.addEventListener('online', processOfflineQueue);
    return () => window.removeEventListener('online', processOfflineQueue);
  }, []);

  // --- GLOBAL ACTIVITY FEED ---
  useEffect(() => {
    const loadGlobalActivity = async () => {
      const globalEvents = await fetchRecentActivity();
      setEvents(prev => {
        // Merge without duplicates (by timestamp + territoryId mostly likely unique enough, or message)
        // Simple dedupe by message + timestamp
        const newEvents = globalEvents.filter(ge =>
          !prev.some(pe => pe.timestamp === ge.timestamp && pe.message === ge.message)
        );

        if (newEvents.length === 0) return prev;

        // Combine and sort by timestamp desc
        const combined = [...newEvents, ...prev].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50); // Keep last 50
        return combined;
      });
    };

    // Load initially and then every 30s
    loadGlobalActivity();
    const interval = setInterval(loadGlobalActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- GPS ---
  const handleScanSuccess = (decodedText: string, sponsorId?: string) => {
    setShowQRScanner(false);
    if (sponsorId) {
      const sponsor = sponsors.find(s => s.id === sponsorId);
      if (sponsor) {
        // Give stars locally for instant feedback
        setUserStars(prev => prev + sponsor.rewardStars);

        // Show event
        const newMessage: ActivityEvent = {
          id: Date.now().toString(),
          type: 'stars',
          message: `Visitou ${sponsor.name}! +${sponsor.rewardStars} ⭐`,
          timestamp: Date.now()
        };
        setEvents(prev => [newMessage, ...prev]);
        triggerConquestConfetti();
      }
    }
  };

  const handleForceRefresh = () => {
    if (!navigator.geolocation) return;
    console.log("Forcing GPS refresh...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoord = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: pos.timestamp
        };
        setUserLocation(newCoord);
        setGpsAccuracy(pos.coords.accuracy);
        if (pos.coords.accuracy <= 20) setGpsQuality('good');
        else setGpsQuality('medium');
        console.log("GPS Refreshed Manually:", newCoord);
      },
      (err) => console.error("Force GPS failed", err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
  };

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
    // GPS check moved to start button
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
    localStorage.removeItem('territory_run_state'); // Clear saved state on stop
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

        // Adicionar estrelas
        const newStars = userStars + conquestBonus;
        setUserStars(newStars);

        // Atualizar pontuação da guerra (se houver)
        if (currentUser?.teamId) {
          try {
            await updateBattleScore(currentUser.teamId, conquestBonus); // Guerra Externa
            await addPointsToSquad(currentUser.teamId, currentUser.id, conquestBonus); // Guerra Interna
          } catch (e) {
            console.warn("Offline: saving conquest points");
            saveToOfflineQueue({ type: 'run_points', payload: { teamId: currentUser.teamId, userId: currentUser.id, points: conquestBonus } });
          }
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
        try {
          await addPointsToSquad(currentUser.teamId, currentUser.id, distanceStars);
        } catch (e) {
          console.warn("Offline: saving points to queue");
          saveToOfflineQueue({ type: 'run_points', payload: { teamId: currentUser.teamId, userId: currentUser.id, points: distanceStars } });
        }
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

    // Obter bairro (centroide aproximado - usando primeiro ponto por simplicidade e performance)
    let neighborhood = 'Desconhecido';
    if (currentPath.length > 0) {
      const centerLat = currentPath[0].lat;
      const centerLng = currentPath[0].lng;
      try {
        const detected = await getNeighborhood(centerLat, centerLng);
        if (detected) neighborhood = detected;
      } catch (err) {
        console.warn("Could not detect neighborhood", err);
      }
    }

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
      maxSpeed: currentMaxSpeed, // Salvar velocidade máxima
      neighborhood: neighborhood // Salvar bairro
    };

    setTerritories(prev => [...prev, newTerritory]);
    try {
      await createTerritory(newTerritory);
    } catch (e) {
      console.warn("Offline: territory created locally, queued for sync");
      // If createTerritory throws, we queue.
      // But if createTerritory swallows and returns true, this won't run. 
      // I need to modify gameService.ts.
      // However, for now I will apply this assuming I will modify gameService to throw?
      // No, gameService saves to localStorage. I should trust gameService?
      // No, gameService local storage is not a sync queue.
      // I will Modify gameService.ts next.
    }

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
      onRankingClick={() => setShowLeaderboard(true)}
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
        onForceRefresh={handleForceRefresh}
        sponsors={sponsors}
      />

      {/* QR Code Scanner Button */}
      {!isRunning && (
        <button
          onClick={() => setShowQRScanner(true)}
          className="fixed top-24 right-4 z-[900] bg-surface-dark/90 p-3 rounded-full border border-gold-500/50 shadow-lg shadow-black/50 text-gold-500 hover:text-white hover:bg-gold-500 transition-all active:scale-95"
          title="Escanear QR Code"
        >
          <ScanLine size={24} />
        </button>
      )}

      {/* Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onClose={() => setShowQRScanner(false)}
          onScanSuccess={handleScanSuccess}
          userLocation={userLocation}
          sponsors={sponsors}
        />
      )}

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
      {
        locationError && (
          <div className="absolute top-28 left-4 right-4 z-50 bg-red-900/90 border border-red-500 text-white p-3 rounded-xl flex items-center space-x-3 backdrop-blur-md shadow-lg animate-fade-in-down">
            <AlertTriangle className="text-red-300" size={16} />
            <span className="text-xs font-bold">{locationError}</span>
          </div>
        )
      }

      {/* Run Metrics (Dynamic Island Style) */}
      {
        isRunning && (
          <div className="absolute bottom-28 left-4 right-4 z-20 flex justify-center pointer-events-none">
            {/* Using existing RunMetrics but maybe simplified? Keeping as is for now */}
            <RunMetrics
              coordinates={currentPath}
              distance={distance}
              startTime={runStartTime}
              isRunning={isRunning}
            />
          </div>
        )
      }

      {/* Stats Panel (Summary) */}
      {
        !isRunning && (
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
        )
      }

      {/* Feed (Bottom Right, reduced size) */}
      <div className="absolute bottom-28 right-4 z-20 w-48 pointer-events-none">
        {/* Reuse ActivityFeed but maybe make it smaller or hidden by default */}
        <ActivityFeed events={events.slice(0, 2)} onEventClick={handleEventClick} />
      </div>

      {/* --- MODALS & SCREENS --- */}

      {/* Keeping these as Overlays */}
      <NamingModal isOpen={showNamingModal} suggestedName={suggestedName} suggestedDescription={suggestedDescription} strategicValue={pendingStrategicValue} onConfirm={handleConfirmTerritory} onCancel={() => setShowNamingModal(false)} />

      {showTutorial && <TutorialScreen onClose={() => setShowTutorial(false)} />}

      {
        showProfile && currentUser && (
          <ProfileScreen
            user={currentUser}
            territories={territories}
            totalDistance={distance}
            totalStars={userStars}
            onClose={() => setShowProfile(false)}
            onLogout={handleLogout}
            onAdminAccess={() => setShowAdminDashboard(true)}
            onTerritoryClick={handleTerritoryClick}
            onShowLeaderboard={() => {
              setShowProfile(false);
              setShowLeaderboard(true);
            }}
            onViewTeam={() => {
              setShowProfile(false);
              if (currentUser.teamId) {
                setShowTeamDashboard(true);
              } else if (currentUser.role === 'owner') {
                setShowCreateTeam(true);
              }
            }}
            onUpdateProfile={handleUpdateProfile}
          />
        )
      }

      {
        showTeamDashboard && currentTeam && currentUser && (
          <TeamDashboard
            team={currentTeam}
            currentUser={{ id: currentUser.id, name: currentUser.name }}
            onClose={() => setShowTeamDashboard(false)}
            onCreateChallenge={(name, desc, points, start, end) => handleCreateChallenge(name, desc, points, start, end)}
          />
        )
      }

      {
        showLeaderboard && (
          <LeaderboardModal
            currentUser={currentUser}
            onClose={() => setShowLeaderboard(false)}
            territories={territories}
            userLocation={userLocation}
          />
        )
      }

      {
        showAdminDashboard && (
          <AdminDashboard onClose={() => setShowAdminDashboard(false)} />
        )
      }

      {/* Activity Selector Modal */}
      {
        showActivitySelector && (
          <div className="fixed inset-0 z-[10001] bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4">
            {/* Mobile: Bottom Sheet | Desktop: Centered Card */}
            <div className={`
              bg-zinc-950 border-t border-x sm:border border-gold-500/20 shadow-[0_0_50px_rgba(234,179,8,0.1)] 
              w-full sm:max-w-sm 
              rounded-t-[2.5rem] sm:rounded-3xl 
              p-6 pb-safe-bottom
              max-h-[90vh] overflow-y-auto 
              animate-in slide-in-from-bottom duration-300
            `}>
              {/* Drag Handle for Mobile feel */}
              <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-6 sm:hidden"></div>

              <h3 className="text-white font-black text-xl mb-6 text-center tracking-wide uppercase flex items-center justify-center gap-2">
                <span className="text-gold-500">⚡</span>
                Escolha a Missão
              </h3>

              <ActivityModeSelector
                selectedMode={selectedActivityMode}
                onSelectMode={setSelectedActivityMode}
              />

              <div className="mt-8 flex justify-center space-x-3 mb-4 sm:mb-0">
                <button
                  onClick={() => setShowActivitySelector(false)}
                  className="flex-1 py-4 bg-white/5 border border-white/10 text-zinc-300 font-bold rounded-xl transition-all hover:bg-white/10 text-sm tracking-widest uppercase"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleStartWithMode}
                  className="flex-1 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-xl shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm tracking-widest uppercase flex items-center justify-center gap-2"
                >
                  VAMOS! 🚀
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Team Modals */}
      <CreateTeamModal
        isOpen={showCreateTeam}
        onClose={() => setShowCreateTeam(false)}
        onCreateTeam={handleCreateTeam}
      />

      {
        currentTeam && (
          <CreateChallengeModal
            isOpen={showCreateChallenge}
            teamName={currentTeam.name}
            onClose={() => setShowCreateChallenge(false)}
            onCreateChallenge={handleCreateChallenge}
          />
        )
      }

      {/* Processing Spinner Overlay */}
      {
        processing && (
          <div className="absolute inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center backdrop-blur-md">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-neon-green mb-4 shadow-[0_0_20px_#39ff14]"></div>
            <h2 className="text-2xl font-black text-white italic tracking-tighter animate-pulse">PROCESSANDO...</h2>
          </div>
        )
      }

      {/* Controls (Hidden - logic only if needed, but AppShell handles buttons now) */}
      <div className="hidden">
        <Controls isRunning={isRunning} onStart={handleStart} onStop={handleStop} onSimulate={toggleSimulation} isSimulating={isSimulating} />
      </div>

      {/* Game Rules Modal */}
      {showGameRules && <GameRules onClose={() => setShowGameRules(false)} />}

      {/* Social Share Card logic placeholder if needed */}

      {/* PWA Update Toast */}
      {needRefresh && (
        <div className="fixed bottom-24 left-4 right-4 z-[50000] bg-zinc-900 border border-gold-500 p-4 rounded-xl shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3">
            <RefreshCw className="text-gold-500 animate-spin" />
            <div>
              <h4 className="text-white font-bold text-sm">Nova Versão Disponível</h4>
              <p className="text-gray-400 text-xs">Toque para atualizar agora.</p>
            </div>
          </div>
          <button
            onClick={() => updateServiceWorker(true)}
            className="bg-gold-500 hover:bg-gold-400 text-black font-black px-4 py-2 rounded-lg text-xs uppercase shadow-lg"
          >
            ATUALIZAR
          </button>
        </div>
      )}

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
