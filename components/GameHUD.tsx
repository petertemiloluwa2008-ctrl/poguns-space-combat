'use client';

import { useState } from 'react';
import { AudioManager } from '@/game/audio/AudioManager';
import { AudioEvent } from '@/game/audio/audioEvents';
import { GameState } from '@/game/types';

interface GameHUDProps {
  gameState: GameState;
  onPause: () => void;
  onReload: (player?: 'p1' | 'p2') => void;
  onPowerShot?: () => void;
  onBomb?: () => void;
}

export default function GameHUD({
  gameState,
  onPause,
  onReload,
  onPowerShot,
  onBomb,
}: GameHUDProps) {
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
        return 'SINGLE GUN (T1)';
      case 2:
        return 'DUAL LASER (T2)';
      case 3:
        return 'TRIPLE SPREAD (T3)';
      case 4:
        return 'QUAD CANNON (T4)';
      case 5:
        return '★ OVERDRIVE 7-SHOT ★';
      default:
        return `TIER ${tier}`;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none p-3 md:p-6 flex flex-col justify-between select-none">
      {/* Top Header Bar & Boss Meter */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          {/* Brand & Stage Info */}
          <div className="flex items-center gap-2 md:gap-3">
            <div
              className="text-xl md:text-3xl font-black text-pink-500 tracking-widest flex items-center gap-1.5 drop-shadow-[0_0_15px_rgba(255,20,147,0.8)]"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              <span>POGUNS</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] md:text-[10px] text-gray-400 font-mono tracking-widest">
                STAGE {stage} OF 5
              </span>
              <span
                className="text-xs md:text-sm font-bold text-cyan-400 tracking-wider"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {stageName}
              </span>
            </div>
          </div>

          {/* HUD Top Right: Score, Level & Combo */}
          <div className="flex items-center gap-3 md:gap-5 text-white">
            {comboMultiplier > 1.0 && (
              <div
                className="bg-pink-500/20 border border-pink-500 px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg text-[10px] md:text-xs font-bold text-pink-400 tracking-wider animate-pulse shadow-[0_0_12px_#FF1493]"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                🔥 {comboMultiplier.toFixed(1)}x COMBO
              </div>
            )}

            <div className="text-right">
              <span className="text-[9px] md:text-[10px] text-gray-400 block tracking-widest font-mono">
                SCORE
              </span>
              <span
                className="text-lg md:text-2xl font-black text-pink-400 tracking-wider drop-shadow-[0_0_8px_rgba(255,20,147,0.6)]"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {score.toLocaleString()}
              </span>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-[9px] md:text-[10px] text-gray-400 block tracking-widest font-mono">
                PILOT
              </span>
              <span
                className="text-lg md:text-2xl font-black text-cyan-400 tracking-wider"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                LVL {playerLevel}
              </span>
            </div>

            {/* Action Buttons: Pause & Mute */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <button
                onClick={onPause}
                title="Pause Game [P]"
                className="px-2 md:px-2.5 py-1 md:py-1.5 bg-black/70 hover:bg-purple-900/60 border border-purple-500/60 rounded text-white text-xs font-mono transition-all flex items-center gap-1 shadow-lg"
              >
                <span>⏸</span>
                <span className="hidden md:inline">PAUSE</span>
              </button>

              <button
                onClick={toggleSound}
                title={isMuted ? 'Unmute' : 'Mute'}
                className="p-1 md:p-1.5 px-2 bg-black/70 hover:bg-pink-900/50 border border-pink-500/60 rounded text-white text-xs transition-all shadow-lg"
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
            </div>
          </div>
        </div>

        {/* Boss Top Health Meter */}
        {boss && boss.active && (
          <div className="w-full max-w-xl mx-auto bg-black/85 backdrop-blur-md border-2 border-red-500/80 rounded-xl p-2.5 md:p-3 shadow-[0_0_25px_rgba(255,0,84,0.6)] animate-pulse">
            <div className="flex justify-between items-center text-xs font-mono mb-1 text-white">
              <span className="text-red-400 font-bold tracking-widest">
                ⚠ {boss.name} [PHASE {boss.phase}]
              </span>
              <span className="text-gray-300">
                {Math.round((boss.health / boss.maxHealth) * 100)}%
              </span>
            </div>
            <div className="h-3.5 md:h-4 bg-black/90 rounded border border-red-500/40 overflow-hidden p-0.5">
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

      {/* Active Bonus Badges Banner */}
      <div className="flex items-center gap-2 justify-center flex-wrap">
        {p1.isInvincible && (
          <div className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-400 text-yellow-300 text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse shadow-[0_0_15px_rgba(255,215,0,0.5)]">
            <span>★</span>
            <span>INVINCIBLE ({p1.invincibleTimeRemaining}s)</span>
          </div>
        )}
        {p1.isRapidFire && (
          <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse shadow-[0_0_15px_rgba(255,184,0,0.5)]">
            <span>⚡</span>
            <span>HYPER RAPID-FIRE ({p1.rapidFireTimeRemaining}s)</span>
          </div>
        )}
        {p1.isShielded && (
          <div className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400 text-blue-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(58,134,255,0.4)]">
            <span>🛡️</span>
            <span>SHIELD BARRIER ({p1.shieldTimeRemaining}s)</span>
          </div>
        )}
      </div>

      {/* Bottom HUD: Player Vitals, Weapons, Power Shot & Bombs */}
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-2.5 md:gap-3">
        {/* Player 1 Card */}
        <div className="flex-1 bg-slate-950/85 backdrop-blur-md p-3 md:p-3.5 rounded-xl border border-pink-500/40 shadow-[0_0_20px_rgba(255,20,147,0.2)]">
          <div className="flex justify-between items-center text-xs font-mono mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-pink-400 font-bold tracking-wider uppercase">
                {p1.shipName || (mode === 'coop' ? 'PILOT 1 (PINK)' : 'POGUNS VANGUARD')}
              </span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                p1.weaponTier === 5
                  ? 'bg-pink-600 text-white shadow-[0_0_8px_#FF007F] animate-pulse'
                  : 'bg-white/10 text-gray-300'
              }`}
            >
              {getWeaponLabel(p1.weaponTier)}
            </span>
          </div>

          {/* Health Bar */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-white w-12">HP: {p1.health}</span>
            <div className="flex-1 h-3.5 bg-black border border-white/20 rounded overflow-hidden p-0.5">
              <div
                className="h-full rounded-sm transition-all duration-150"
                style={{
                  width: `${Math.max(0, Math.min(100, (p1.health / p1.maxHealth) * 100))}%`,
                  backgroundColor: p1.health <= 25 ? '#FF3B5C' : '#FF1493',
                  boxShadow: `0 0 10px ${p1.health <= 25 ? '#FF3B5C' : '#FF1493'}`,
                }}
              />
            </div>
          </div>

          {/* Special Mechanics Bar: Power Shot & Bombs */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[11px] font-mono">
            {/* Power Shot Meter */}
            <div className="flex items-center gap-1.5">
              <span className="text-cyan-400 font-bold">⚡ LASER:</span>
              <div className="flex-1 h-2 bg-slate-900 border border-cyan-500/40 rounded overflow-hidden">
                <div
                  className={`h-full transition-all duration-200 ${
                    p1.powerShotReady
                      ? 'bg-cyan-300 shadow-[0_0_10px_#00F0FF] animate-pulse'
                      : 'bg-cyan-500'
                  }`}
                  style={{ width: `${Math.round(p1.powerShotProgress * 100)}%` }}
                />
              </div>
              {p1.powerShotReady && (
                <span className="text-[9px] font-bold text-cyan-300 animate-bounce">[SPACE/Z]</span>
              )}
            </div>

            {/* Bomb Inventory */}
            <div className="flex items-center justify-end gap-1.5 text-right">
              <span className="text-red-400 font-bold">💣 BOMBS:</span>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`text-xs ${i < p1.bombs ? 'opacity-100' : 'opacity-20 grayscale'}`}
                  >
                    💣
                  </span>
                ))}
              </div>
              <span className="text-gray-400 text-[10px] hidden sm:inline">[B]</span>
            </div>
          </div>
        </div>

        {/* Player 2 Card (In Co-Op Mode) */}
        {mode === 'coop' && p2 && (
          <div className="flex-1 bg-slate-950/85 backdrop-blur-md p-3 md:p-3.5 rounded-xl border border-cyan-400/40 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
            <div className="flex justify-between items-center text-xs font-mono mb-1.5">
              <span className="text-cyan-400 font-bold tracking-wider uppercase">
                {p2.shipName || 'PILOT 2 (CYAN)'}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  p2.weaponTier === 5
                    ? 'bg-cyan-400 text-black shadow-[0_0_8px_#00F0FF] animate-pulse'
                    : 'bg-white/10 text-gray-300'
                }`}
              >
                {getWeaponLabel(p2.weaponTier)}
              </span>
            </div>

            {/* Health Bar */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-white w-12">HP: {p2.health}</span>
              <div className="flex-1 h-3.5 bg-black border border-white/20 rounded overflow-hidden p-0.5">
                <div
                  className="h-full rounded-sm transition-all duration-150"
                  style={{
                    width: `${Math.max(0, Math.min(100, (p2.health / p2.maxHealth) * 100))}%`,
                    backgroundColor: p2.health <= 25 ? '#FF3B5C' : '#00F0FF',
                    boxShadow: `0 0 10px ${p2.health <= 25 ? '#FF3B5C' : '#00F0FF'}`,
                  }}
                />
              </div>
            </div>

            {/* Special Mechanics Bar: Power Shot & Bombs */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[11px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-cyan-400 font-bold">⚡ LASER:</span>
                <div className="flex-1 h-2 bg-slate-900 border border-cyan-500/40 rounded overflow-hidden">
                  <div
                    className={`h-full transition-all duration-200 ${
                      p2.powerShotReady
                        ? 'bg-cyan-300 shadow-[0_0_10px_#00F0FF] animate-pulse'
                        : 'bg-cyan-500'
                    }`}
                    style={{ width: `${Math.round(p2.powerShotProgress * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-1.5 text-right">
                <span className="text-red-400 font-bold">💣 BOMBS:</span>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={`text-xs ${i < p2.bombs ? 'opacity-100' : 'opacity-20 grayscale'}`}
                    >
                      💣
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
