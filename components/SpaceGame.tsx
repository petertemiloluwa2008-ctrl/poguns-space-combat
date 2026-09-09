'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine, GameState } from '@/game/engine';
import { AudioManager } from '@/game/audio/AudioManager';
import { GameMode } from '@/game/types';
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

  const [gameState, setGameState] = useState<GameState>(() => {
    const profile = ProfileManager.getInstance().getActiveProfile();
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
        health: 100,
        maxHealth: 100,
        ammo: 30,
        maxAmmo: 30,
        reserveAmmo: 120,
        isReloading: false,
        weaponTier: 1,
        isShielded: false,
        shieldTimeRemaining: 0,
        isAlive: true,
        kills: 0,
      },
      playerHealth: 100,
      playerMaxHealth: 100,
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

  // Detect touch device capability on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        setTouchEnabled(true);
      }
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

  const handleStart = useCallback(() => {
    engineRef.current?.setMode(selectedMode);
    engineRef.current?.start();
  }, [selectedMode]);

  const handleRestart = useCallback(() => {
    engineRef.current?.restart();
  }, []);

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

  const handleTouchInput = useCallback((input: any) => {
    engineRef.current?.setTouchInput(input);
  }, []);

  return (
    <main className="relative w-full h-screen flex items-center justify-center bg-[#050510] overflow-hidden select-none">
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
          />

          {/* Virtual Touchscreen Controls */}
          {touchEnabled && (
            <TouchControls
              onInputChange={handleTouchInput}
              onReload={() => handleReload('p1')}
              onPause={handlePause}
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
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
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
