'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine, GameState } from '@/game/engine';
import { AudioManager } from '@/game/audio/AudioManager';
import { GameMode } from '@/game/types';
import { ShipId, SHIPS } from '@/game/ships';
import { ProfileManager } from '@/game/profileManager';
import GameCanvas from './GameCanvas';
import GameHUD from './GameHUD';
import StartScreen from './StartScreen';
import PauseScreen from './PauseScreen';
import GameOverScreen from './GameOverScreen';
import VictoryScreen from './VictoryScreen';
import TouchControls from './TouchControls';

export default function SpaceGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [selectedMode, setSelectedMode] = useState<GameMode>('solo');
  const [touchEnabled, setTouchEnabled] = useState(false);
  const [selectedShipId, setSelectedShipId] = useState<ShipId>(() => {
    const profile = ProfileManager.getInstance().getActiveProfile();
    return (profile?.selectedShipId as ShipId) || 'vanguard';
  });

  const [gameState, setGameState] = useState<GameState>(() => {
    const profile = ProfileManager.getInstance().getActiveProfile();
    const ship = SHIPS[profile?.selectedShipId || 'vanguard'] || SHIPS.vanguard;
    return {
      status: 'start',
      mode: 'solo',
      score: 0,
      highScore: profile?.highScore || 0,
      playerLevel: 1,
      playerXp: 0,
      xpToNextLevel: 1000,
      stage: 1,
      maxStages: 5,
      stageName: 'NEON OUTSKIRTS',
      comboMultiplier: 1.0,
      p1: {
        shipId: ship.id,
        shipName: ship.name,
        health: ship.health,
        maxHealth: ship.maxHealth,
        ammo: 30,
        maxAmmo: 30,
        reserveAmmo: 120,
        isReloading: false,
        weaponTier: 1,
        isShielded: false,
        shieldTimeRemaining: 0,
        isInvincible: false,
        invincibleTimeRemaining: 0,
        isRapidFire: false,
        rapidFireTimeRemaining: 0,
        bombs: 2,
        powerShotProgress: 0,
        powerShotReady: false,
        isAlive: true,
        kills: 0,
      },
      playerHealth: ship.health,
      playerMaxHealth: ship.maxHealth,
      ammo: 30,
      maxAmmo: 30,
      reserveAmmo: 120,
      isReloading: false,
      level: 1,
    };
  });

  const handleStateChange = useCallback((state: GameState) => {
    setGameState({ ...state });
  }, []);

  // Detect mobile & touch capability on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobileScreen = window.innerWidth <= 768;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (isMobileScreen || isTouchDevice) {
        setTouchEnabled(true);
      }

      // Prevent accidental bounce or pull-to-refresh on mobile
      const preventDefaultTouch = (e: TouchEvent) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      };
      document.addEventListener('touchmove', preventDefaultTouch, { passive: false });
      return () => {
        document.removeEventListener('touchmove', preventDefaultTouch);
      };
    }
  }, []);

  useEffect(() => {
    if (canvasRef.current && !engineRef.current) {
      const engine = new GameEngine(canvasRef.current, handleStateChange, selectedMode);
      engineRef.current = engine;
      canvasRef.current.focus();
      AudioManager.getInstance().playMusic('menu-theme');
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
      AudioManager.getInstance().stopMusic();
    };
  }, [handleStateChange, selectedMode]);

  const handleModeChange = useCallback((mode: GameMode) => {
    setSelectedMode(mode);
    engineRef.current?.setMode(mode);
  }, []);

  const handleShipSelect = useCallback((shipId: ShipId) => {
    setSelectedShipId(shipId);
    ProfileManager.getInstance().updateProfile({ selectedShipId: shipId });
    engineRef.current?.setPlayerShip(shipId, 'p1');
  }, []);

  const handleStart = useCallback(() => {
    engineRef.current?.setPlayerShip(selectedShipId, 'p1');
    engineRef.current?.setMode(selectedMode);
    engineRef.current?.start();
  }, [selectedMode, selectedShipId]);

  const handleRestart = useCallback(() => {
    engineRef.current?.setPlayerShip(selectedShipId, 'p1');
    engineRef.current?.restart();
  }, [selectedShipId]);

  const handlePause = useCallback(() => {
    engineRef.current?.pause();
  }, []);

  const handleResume = useCallback(() => {
    engineRef.current?.resume();
  }, []);

  const handleMainMenu = useCallback(() => {
    engineRef.current?.goToMainMenu();
  }, []);

  const handleReload = useCallback((player: 'p1' | 'p2' = 'p1') => {
    engineRef.current?.triggerReload(player);
  }, []);

  const handlePowerShot = useCallback((player: 'p1' | 'p2' = 'p1') => {
    engineRef.current?.triggerPowerShot(player);
  }, []);

  const handleBomb = useCallback((player: 'p1' | 'p2' = 'p1') => {
    engineRef.current?.triggerBomb(player);
  }, []);

  const handleTouchInput = useCallback((input: any) => {
    engineRef.current?.setTouchInput(input);
  }, []);

  return (
    <main className="relative w-full h-screen flex items-center justify-center bg-[#050510] overflow-hidden select-none touch-none">
      {/* Game Canvas */}
      <GameCanvas canvasRef={canvasRef} />

      {/* Start Screen */}
      {gameState.status === 'start' && (
        <StartScreen
          highScore={gameState.highScore}
          selectedMode={selectedMode}
          onSelectMode={handleModeChange}
          touchEnabled={touchEnabled}
          onToggleTouch={() => setTouchEnabled((prev) => !prev)}
          selectedShipId={selectedShipId}
          onSelectShip={handleShipSelect}
          onStart={handleStart}
          onQuit={() => {}}
        />
      )}

      {/* In-Game HUD */}
      {gameState.status === 'playing' && (
        <>
          <GameHUD
            gameState={gameState}
            onPause={handlePause}
            onReload={handleReload}
            onPowerShot={() => handlePowerShot('p1')}
            onBomb={() => handleBomb('p1')}
          />

          {/* Virtual Touchscreen Controls */}
          {touchEnabled && (
            <TouchControls
              onInputChange={handleTouchInput}
              onReload={() => handleReload('p1')}
              onPowerShot={() => handlePowerShot('p1')}
              onBomb={() => handleBomb('p1')}
              powerShotReady={gameState.p1.powerShotReady}
              powerShotProgress={gameState.p1.powerShotProgress}
              bombs={gameState.p1.bombs}
            />
          )}
        </>
      )}

      {/* Pause Screen */}
      {gameState.status === 'paused' && (
        <PauseScreen
          onResume={handleResume}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* Game Over Screen */}
      {gameState.status === 'gameOver' && (
        <GameOverScreen
          score={gameState.score}
          highScore={gameState.highScore}
          stage={gameState.stage}
          stageName={gameState.stageName}
          shipId={selectedShipId}
          weaponTier={gameState.p1.weaponTier}
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
          onSelectShip={handleShipSelect}
        />
      )}

      {/* Final Boss Victory Screen */}
      {gameState.status === 'victory' && (
        <VictoryScreen
          score={gameState.score}
          highScore={gameState.highScore}
          level={gameState.playerLevel}
          kills={gameState.p1.kills + (gameState.p2?.kills || 0)}
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
        />
      )}
    </main>
  );
}
