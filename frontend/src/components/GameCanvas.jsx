import React, { useRef, useEffect, useState, useCallback } from "react";
import { GameEngine } from "../game/engine";
import WeaponDock from "./WeaponDock";
import BossHUD from "./BossHUD";
import PlayerHUD from "./PlayerHUD";
import ArmoryShop from "./ArmoryShop";
import GameOverModal from "./GameOverModal";
import VictoryModal from "./VictoryModal";
import RadarMinimap from "./RadarMinimap";
import socketService from "../network/socket";

export default function GameCanvas({ gameConfig, onReturnLobby }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const persistentPlayerStateRef = useRef(null);

  const [currentMapId, setCurrentMapId] = useState(gameConfig?.mapId || 1);
  const [weaponState, setWeaponState] = useState(null);
  const [bossSquadState, setBossSquadState] = useState(null);
  const [playerState, setPlayerState] = useState(null);

  // Modals State
  const [isArmoryOpen, setIsArmoryOpen] = useState(false);
  const [armoryData, setArmoryData] = useState(null);
  const [gameOverStats, setGameOverStats] = useState(null);
  const [victoryStats, setVictoryStats] = useState(null);

  const handleWeaponStateChange = useCallback((state) => {
    setWeaponState(state);
  }, []);

  const handleBossStateChange = useCallback((state) => {
    setBossSquadState(state);
  }, []);

  const handlePlayerStateChange = useCallback((state) => {
    setPlayerState(state);
  }, []);

  const handleSelectWeapon = useCallback((idx) => {
    if (engineRef.current) {
      engineRef.current.selectWeapon(idx);
    }
  }, []);

  const handleOpenArmory = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.isArmoryOpen = true;
      setArmoryData(engineRef.current.getArmoryData());
      setIsArmoryOpen(true);
    }
  }, []);

  const handleCloseArmory = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.isArmoryOpen = false;
    }
    setIsArmoryOpen(false);
  }, []);

  const handleToggleArmory = useCallback(() => {
    setIsArmoryOpen((prev) => {
      const next = !prev;
      if (engineRef.current) {
        engineRef.current.isArmoryOpen = next;
        if (next) {
          setArmoryData(engineRef.current.getArmoryData());
        }
      }
      return next;
    });
  }, []);

  const handleBuyUpgrade = useCallback((type) => {
    if (engineRef.current) {
      const res = engineRef.current.buyUpgrade(type);
      setArmoryData(engineRef.current.getArmoryData());
      return res;
    }
    return { success: false, reason: "Engine chưa sẵn sàng" };
  }, []);

  const handleBuyOrRefillWeapon = useCallback((idx) => {
    if (engineRef.current) {
      const res = engineRef.current.buyOrRefillWeapon(idx);
      setArmoryData(engineRef.current.getArmoryData());
      return res;
    }
    return { success: false, reason: "Engine chưa sẵn sàng" };
  }, []);

  const handleGameOver = useCallback((stats) => {
    setGameOverStats(stats);
  }, []);

  const handleVictory = useCallback((stats) => {
    setVictoryStats(stats);
  }, []);

  const startEngine = useCallback((mapIdToUse) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current = null;
    }

    const engine = new GameEngine(canvas, {
      mode: gameConfig.mode,
      isHost: gameConfig.isHost,
      roomCode: gameConfig.roomCode,
      mapId: mapIdToUse,
      previousPlayerState: persistentPlayerStateRef.current,
      onGameOver: handleGameOver,
      onVictory: handleVictory,
      onToggleArmory: handleToggleArmory,
      onWeaponStateChange: handleWeaponStateChange,
      onBossStateChange: handleBossStateChange,
      onPlayerStateChange: handlePlayerStateChange
    });

    engineRef.current = engine;
    engine.start();
  }, [
    gameConfig,
    handleGameOver,
    handleVictory,
    handleToggleArmory,
    handleWeaponStateChange,
    handleBossStateChange,
    handlePlayerStateChange
  ]);

  const doSwitchToMap = useCallback((nextMap) => {
    if (engineRef.current) {
      persistentPlayerStateRef.current = engineRef.current.getPersistentState();
    }
    setCurrentMapId(nextMap);
    setGameOverStats(null);
    setVictoryStats(null);
    setIsArmoryOpen(false);
    startEngine(nextMap);
  }, [startEngine]);

  const handleRestart = useCallback(() => {
    setGameOverStats(null);
    setVictoryStats(null);
    setIsArmoryOpen(false);
    startEngine(currentMapId);
  }, [currentMapId, startEngine]);

  const handleNextMap = useCallback(() => {
    const nextMap = currentMapId < 10 ? currentMapId + 1 : 1;
    if (gameConfig.mode === "coop" && gameConfig.isHost) {
      socketService.switchMap(nextMap);
    }
    doSwitchToMap(nextMap);
  }, [currentMapId, gameConfig, doSwitchToMap]);

  useEffect(() => {
    if (gameConfig.mode === "coop") {
      const handleMapSwitched = (data) => {
        const nextMap = data?.mapId || 1;
        doSwitchToMap(nextMap);
      };
      socketService.on("map_switched", handleMapSwitched);
      return () => {
        socketService.off("map_switched", handleMapSwitched);
      };
    }
  }, [gameConfig.mode, doSwitchToMap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    startEngine(currentMapId);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
      }
    };
  }, [startEngine, currentMapId]);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden cursor-crosshair">
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Real-time HUD Elements */}
      <PlayerHUD
        playerState={playerState}
        onOpenArmory={handleOpenArmory}
      />
      <RadarMinimap engineRef={engineRef} />
      <BossHUD bossSquadState={bossSquadState} />
      <WeaponDock
        weaponState={weaponState}
        onSelectWeapon={handleSelectWeapon}
      />

      {/* Modal 1: Kho Vũ Khí & Nâng Cấp [Phím B] */}
      {isArmoryOpen && (
        <ArmoryShop
          armoryData={armoryData}
          onBuyUpgrade={handleBuyUpgrade}
          onBuyOrRefillWeapon={handleBuyOrRefillWeapon}
          onClose={handleCloseArmory}
        />
      )}

      {/* Modal 2: Nhiệm Vụ Thất Bại (Game Over) */}
      {gameOverStats && (
        <GameOverModal
          stats={gameOverStats}
          onRestart={handleRestart}
          onReturnLobby={onReturnLobby}
        />
      )}

      {/* Modal 3: Chiến Thắng Bản Đồ (Victory) */}
      {victoryStats && (
        <VictoryModal
          stats={victoryStats}
          isHost={gameConfig?.isHost}
          mode={gameConfig?.mode}
          onNextMap={handleNextMap}
          onRestartMap={handleRestart}
          onReturnLobby={onReturnLobby}
        />
      )}
    </div>
  );
}
