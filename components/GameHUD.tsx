'use client';

import { useState } from 'react';
import { AudioManager } from '@/game/audio/AudioManager';
import { AudioEvent } from '@/game/audio/audioEvents';
import { GameState } from '@/game/types';

interface GameHUDProps {
  gameState: GameState;
  onPause: () => void;
  onReload: (player?: 'p1' | 'p2') => void;
}

export default function GameHUD({ gameState, onPause, onReload }: GameHUDProps) {
  const [isMuted, setIsMuted] = useState(AudioManager.getInstance().isMuted());

  const { score, playerLevel, stage, stageName, comboMultiplier, p1, p2, boss, mode } = gameState;

  const toggleSound = () => {
    const nextMute = AudioManager.getInstance().toggleMute();
    setIsMuted(nextMute);
    if (!nextMute) {
      AudioManager.getInstance().playEvent(AudioEvent.UI_CLICK);
    }
  };

  const getWeaponLabel = (tier: number) => {
    switch (tier) {
      case 1:
        return 'DUAL BLASTER (T1)';
      case 2:
        return 'TRIPLE SPREAD (T2)';
      case 3:
        return 'QUAD CANNON (T3)';
      case 4:
        return 'PENTA BURST (T4)';
      case 5:
        return '★ HYPER OVERDRIVE ★';
      default:
        return `TIER ${tier}`;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none p-4 md:p-6 flex flex-col justify-between select-none">
      {/* Top Header Bar & Boss Meter */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          {/* Brand & Stage Info */}
          <div className="flex items-center gap-3">
            <div
              className="text-2xl md:text-3xl font-black text-[#FF1493] tracking-widest flex items-center gap-2 drop-shadow-[0_0_15px_rgba(255,20,147,0.8)]"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              <span>POGUNS</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-mono tracking-widest">
                STAGE {stage} OF 5
              </span>
              <span
                className="text-xs md:text-sm font-bold text-[#00F0FF] tracking-wider"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {stageName}
              </span>
            </div>
          </div>

          {/* HUD Top Right: Score, Level & Combo */}
          <div className="flex items-center gap-4 md:gap-6 text-white">
            {comboMultiplier > 1.0 && (
              <div
                className="bg-[#FF1493]/20 border border-[#FF1493] px-2.5 py-1 rounded-lg text-xs font-bold text-[#FF1493] tracking-wider animate-pulse shadow-[0_0_12px_#FF1493]"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                🔥 {comboMultiplier.toFixed(1)}x COMBO
              </div>
            )}

            <div className="text-right">
              <span className="text-[10px] text-gray-400 block tracking-widest font-mono">SCORE</span>
              <span
                className="text-xl md:text-2xl font-black text-[#FF1493] tracking-wider drop-shadow-[0_0_8px_rgba(255,20,147,0.6)]"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {score.toLocaleString()}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-gray-400 block tracking-widest font-mono">PILOT</span>
              <span
                className="text-xl md:text-2xl font-black text-[#00F0FF] tracking-wider"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                LVL {playerLevel}
              </span>
            </div>

            {/* Action Buttons: Pause & Mute */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={onPause}
                title="Pause Game [P]"
                className="px-2.5 py-1.5 bg-black/70 hover:bg-[#7C3AED]/40 border border-[#7C3AED]/60 rounded text-white text-xs font-mono transition-all flex items-center gap-1 shadow-lg"
              >
                <span>⏸</span>
                <span className="hidden md:inline">PAUSE</span>
              </button>

              <button
                onClick={toggleSound}
                title={isMuted ? 'Unmute' : 'Mute'}
                className="p-1.5 px-2 bg-black/70 hover:bg-[#FF1493]/30 border border-[#FF1493]/60 rounded text-white text-xs transition-all shadow-lg"
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
            </div>
          </div>
        </div>

        {/* Boss Top Health Meter */}
        {boss && boss.active && (
          <div className="w-full max-w-xl mx-auto bg-black/80 backdrop-blur-md border-2 border-red-500/80 rounded-xl p-3 shadow-[0_0_25px_rgba(255,0,84,0.6)] animate-pulse">
            <div className="flex justify-between items-center text-xs font-mono mb-1 text-white">
              <span className="text-[#FF0054] font-bold tracking-widest">
                ⚠ {boss.name} [PHASE {boss.phase}]
              </span>
              <span className="text-gray-300">
                {Math.round((boss.health / boss.maxHealth) * 100)}%
              </span>
            </div>
            <div className="h-4 bg-black/90 rounded border border-red-500/40 overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 rounded transition-all duration-150 shadow-[0_0_15px_#FF0054]"
                style={{
                  width: `${Math.max(0, Math.min(100, (boss.health / boss.maxHealth) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom HUD: Player Vitals & Weapon Stats */}
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-3">
        {/* Player 1 Card */}
        <div className="flex-1 bg-black/75 backdrop-blur-md p-3.5 rounded-xl border border-[#FF1493]/40 shadow-[0_0_20px_rgba(255,20,147,0.2)]">
          <div className="flex justify-between items-center text-xs font-mono mb-1.5">
            <span className="text-[#FF1493] font-bold tracking-wider">
              {mode === 'coop' ? 'PILOT 1 (PINK)' : 'POGUNS VANGUARD'}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                p1.weaponTier === 5
                  ? 'bg-[#FF007F] text-white shadow-[0_0_8px_#FF007F] animate-pulse'
                  : 'bg-white/10 text-gray-300'
              }`}
            >
              {getWeaponLabel(p1.weaponTier)}
            </span>
          </div>

          {/* Health Bar */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-white w-10">HP: {p1.health}</span>
            <div className="flex-1 h-3.5 bg-black border border-white/20 rounded overflow-hidden p-0.5">
              <div
                className="h-full rounded-sm transition-all duration-150"
                style={{
                  width: `${Math.max(0, Math.min(100, (p1.health / p1.maxHealth) * 100))}%`,
                  backgroundColor: p1.health <= 20 ? '#FF3B5C' : '#FF1493',
                  boxShadow: `0 0 10px ${p1.health <= 20 ? '#FF3B5C' : '#FF1493'}`,
                }}
              />
            </div>
            {p1.isShielded && (
              <span className="text-[10px] font-mono text-[#3A86FF] font-bold animate-pulse">
                🛡 {p1.shieldTimeRemaining}s
              </span>
            )}
          </div>

          {/* Ammo & Reload */}
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-gray-400">
              AMMO:{' '}
              <strong className={p1.ammo === 0 ? 'text-[#FF3B5C] animate-pulse' : 'text-white'}>
                {p1.ammo} / {p1.reserveAmmo}
              </strong>
            </span>

            <div className="pointer-events-auto">
              {p1.isReloading ? (
                <span className="text-[#00F0FF] animate-pulse text-[11px]">RELOADING...</span>
              ) : (
                <button
                  onClick={() => onReload('p1')}
                  className="text-[10px] text-gray-400 hover:text-[#FF1493] underline"
                >
                  RELOAD [R]
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Player 2 Card (In Co-Op Mode) */}
        {mode === 'coop' && p2 && (
          <div className="flex-1 bg-black/75 backdrop-blur-md p-3.5 rounded-xl border border-[#00F0FF]/40 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
            <div className="flex justify-between items-center text-xs font-mono mb-1.5">
              <span className="text-[#00F0FF] font-bold tracking-wider">PILOT 2 (CYAN)</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  p2.weaponTier === 5
                    ? 'bg-[#00F0FF] text-black shadow-[0_0_8px_#00F0FF] animate-pulse'
                    : 'bg-white/10 text-gray-300'
                }`}
              >
                {getWeaponLabel(p2.weaponTier)}
              </span>
            </div>

            {/* Health Bar */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-white w-10">HP: {p2.health}</span>
              <div className="flex-1 h-3.5 bg-black border border-white/20 rounded overflow-hidden p-0.5">
                <div
                  className="h-full rounded-sm transition-all duration-150"
                  style={{
                    width: `${Math.max(0, Math.min(100, (p2.health / p2.maxHealth) * 100))}%`,
                    backgroundColor: p2.health <= 20 ? '#FF3B5C' : '#00F0FF',
                    boxShadow: `0 0 10px ${p2.health <= 20 ? '#FF3B5C' : '#00F0FF'}`,
                  }}
                />
              </div>
              {p2.isShielded && (
                <span className="text-[10px] font-mono text-[#3A86FF] font-bold animate-pulse">
                  🛡 {p2.shieldTimeRemaining}s
                </span>
              )}
            </div>

            {/* Ammo & Reload */}
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-gray-400">
                AMMO:{' '}
                <strong className={p2.ammo === 0 ? 'text-[#FF3B5C] animate-pulse' : 'text-white'}>
                  {p2.ammo} / {p2.reserveAmmo}
                </strong>
              </span>

              <div className="pointer-events-auto">
                {p2.isReloading ? (
                  <span className="text-[#00F0FF] animate-pulse text-[11px]">RELOADING...</span>
                ) : (
                  <button
                    onClick={() => onReload('p2')}
                    className="text-[10px] text-gray-400 hover:text-[#00F0FF] underline"
                  >
                    RELOAD [E]
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
