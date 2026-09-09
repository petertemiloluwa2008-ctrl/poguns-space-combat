'use client';

import { AudioManager } from '@/game/audio/AudioManager';
import { AudioEvent } from '@/game/audio/audioEvents';
import { ProfileManager } from '@/game/profileManager';

interface VictoryScreenProps {
  score: number;
  highScore: number;
  level: number;
  kills: number;
  onRestart: () => void;
  onMainMenu: () => void;
}

export default function VictoryScreen({
  score,
  highScore,
  level,
  kills,
  onRestart,
  onMainMenu,
}: VictoryScreenProps) {
  const profile = ProfileManager.getInstance().getActiveProfile();

  // Evaluate Mission Rank
  let rank = 'B';
  let rankColor = '#FFB800';
  if (score >= 25000) {
    rank = 'S';
    rankColor = '#FF1493';
  } else if (score >= 18000) {
    rank = 'A';
    rankColor = '#00F0FF';
  }

  const handleHover = () => {
    AudioManager.getInstance().playEvent(AudioEvent.UI_HOVER);
  };

  const handlePlayAgain = () => {
    AudioManager.getInstance().playEvent(AudioEvent.PLAY_CLICK);
    onRestart();
  };

  const handleMenu = () => {
    AudioManager.getInstance().playEvent(AudioEvent.UI_CLICK);
    onMainMenu();
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-lg select-none z-30 p-6">
      {/* Victory Header */}
      <div className="text-center mb-6">
        <span className="text-xs font-mono tracking-[0.4em] text-[#00F0FF] uppercase block mb-1">
          MISSION ACCOMPLISHED — MATRIX OVERRIDDEN
        </span>
        <h2
          className="text-5xl md:text-7xl font-black text-[#FF1493] tracking-widest drop-shadow-[0_0_40px_rgba(255,20,147,0.9)] animate-pulse"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          VICTORY!
        </h2>
        <p className="text-sm font-mono text-gray-300 mt-2">
          DREADNOUGHT PRIME MATRIX DESTROYED • SECTOR SECURED
        </p>
      </div>

      {/* Mission Report Card */}
      <div className="bg-black/70 border-2 border-[#FF1493]/60 rounded-2xl p-6 max-w-md w-full shadow-[0_0_35px_rgba(255,20,147,0.4)] mb-8">
        <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
          <div>
            <span className="text-xs text-gray-400 font-mono tracking-widest block">PILOT</span>
            <span
              className="text-lg font-bold text-white"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              {profile.callsign}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-gray-400 font-mono tracking-widest block">MISSION RANK</span>
            <span
              className="text-3xl font-black"
              style={{ color: rankColor, fontFamily: 'Orbitron, sans-serif' }}
            >
              RANK {rank}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/5 p-3 rounded-lg border border-white/5">
            <span className="text-[11px] text-gray-400 font-mono tracking-wider block">FINAL SCORE</span>
            <span
              className="text-2xl font-black text-[#FF1493]"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              {score.toLocaleString()}
            </span>
          </div>

          <div className="bg-white/5 p-3 rounded-lg border border-white/5">
            <span className="text-[11px] text-gray-400 font-mono tracking-wider block">ENEMIES DESTROYED</span>
            <span
              className="text-2xl font-black text-[#00F0FF]"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              {kills}
            </span>
          </div>

          <div className="bg-white/5 p-3 rounded-lg border border-white/5">
            <span className="text-[11px] text-gray-400 font-mono tracking-wider block">PILOT LEVEL</span>
            <span
              className="text-xl font-bold text-white"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              LVL {level}
            </span>
          </div>

          <div className="bg-white/5 p-3 rounded-lg border border-white/5">
            <span className="text-[11px] text-gray-400 font-mono tracking-wider block">HIGH SCORE</span>
            <span
              className="text-xl font-bold text-[#FFD700]"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              {highScore.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm pointer-events-auto">
        <button
          onClick={handlePlayAgain}
          onMouseEnter={handleHover}
          className="flex-1 py-4 bg-[#FF1493] hover:bg-[#FF1493]/90 text-white font-bold text-base rounded-xl transition-all duration-200 tracking-widest shadow-[0_0_25px_rgba(255,20,147,0.7)] hover:scale-105 active:scale-95 text-center"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          PLAY AGAIN
        </button>

        <button
          onClick={handleMenu}
          onMouseEnter={handleHover}
          className="flex-1 py-4 bg-black/70 hover:bg-white/10 text-gray-300 hover:text-white font-medium text-sm rounded-xl border border-white/20 hover:border-white/40 transition-all duration-200 tracking-widest text-center font-mono hover:scale-102 active:scale-98"
        >
          MAIN MENU
        </button>
      </div>
    </div>
  );
}

