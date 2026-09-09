'use client';

import { useState } from 'react';
import { AudioManager } from '@/game/audio/AudioManager';
import { AudioEvent } from '@/game/audio/audioEvents';
import { ProfileManager } from '@/game/profileManager';
import { GameMode, PilotProfile } from '@/game/types';
import ProfileModal from './ProfileModal';

interface StartScreenProps {
  highScore: number;
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  touchEnabled: boolean;
  onToggleTouch: () => void;
  onStart: () => void;
  onQuit?: () => void;
}

export default function StartScreen({
  highScore,
  selectedMode,
  onSelectMode,
  touchEnabled,
  onToggleTouch,
  onStart,
  onQuit,
}: StartScreenProps) {
  const [isMuted, setIsMuted] = useState(AudioManager.getInstance().isMuted());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeProfile, setActiveProfile] = useState<PilotProfile>(
    ProfileManager.getInstance().getActiveProfile()
  );
  const [showQuitModal, setShowQuitModal] = useState(false);

  const handleStartMission = () => {
    AudioManager.getInstance().playEvent(AudioEvent.PLAY_CLICK);
    onStart();
  };

  const handleHover = () => {
    AudioManager.getInstance().playEvent(AudioEvent.UI_HOVER);
  };

  const toggleMute = () => {
    const nextMute = AudioManager.getInstance().toggleMute();
    setIsMuted(nextMute);
    if (!nextMute) {
      AudioManager.getInstance().playEvent(AudioEvent.UI_CLICK);
    }
  };

  const handleProfileUpdated = () => {
    setActiveProfile({ ...ProfileManager.getInstance().getActiveProfile() });
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-md select-none z-20 p-4 overflow-y-auto">
      {/* Top Controls: Profile Badge & Toggles */}
      <div className="absolute top-4 inset-x-6 flex justify-between items-center pointer-events-auto">
        {/* Pilot Profile Button */}
        <button
          onClick={() => {
            AudioManager.getInstance().playEvent(AudioEvent.UI_CLICK);
            setShowProfileModal(true);
          }}
          onMouseEnter={handleHover}
          className="flex items-center gap-2.5 px-3 py-1.5 bg-black/70 hover:bg-[#FF1493]/20 border border-[#FF1493]/50 rounded-xl text-xs font-mono text-white transition-all shadow-[0_0_15px_rgba(255,20,147,0.25)]"
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: activeProfile.shipColor || '#FF1493' }}
          />
          <span className="font-bold">{activeProfile.callsign}</span>
          <span className="px-1.5 py-0.5 bg-[#FF1493]/30 text-[10px] rounded text-[#FF69C9]">
            {activeProfile.rank}
          </span>
          <span className="text-gray-400 text-[10px]">⚙ DOSSIER</span>
        </button>

        {/* Right side Audio & Touch Controls Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              AudioManager.getInstance().playEvent(AudioEvent.UI_CLICK);
              onToggleTouch();
            }}
            onMouseEnter={handleHover}
            title="Toggle On-Screen Touch Controls"
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 border ${
              touchEnabled
                ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_10px_#00F0FF]'
                : 'bg-black/70 border-white/20 text-gray-400 hover:text-white'
            }`}
          >
            <span>📱</span>
            <span>TOUCH: {touchEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={toggleMute}
            onMouseEnter={handleHover}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black/70 hover:bg-[#FF1493]/20 border border-[#FF1493]/40 rounded-lg text-xs font-mono text-white transition-all"
          >
            <span>{isMuted ? '🔇' : '🔊'}</span>
            <span>{isMuted ? 'MUTE' : 'AUDIO'}</span>
          </button>
        </div>
      </div>

      {/* Brand Header */}
      <div className="text-center mt-8 mb-6">
        <h1
          className="text-6xl md:text-8xl font-black text-[#FF1493] tracking-widest drop-shadow-[0_0_35px_rgba(255,20,147,0.7)]"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          POGUNS
        </h1>
        <h2
          className="text-xl md:text-2xl font-bold text-white tracking-[0.3em] mt-1 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          SPACE COMBAT
        </h2>
        <div className="h-0.5 w-48 bg-gradient-to-r from-transparent via-[#FF1493] to-transparent mx-auto mt-3" />
      </div>

      {/* Game Mode Selection (Solo vs 2-Player Co-Op) */}
      <div className="mb-6 pointer-events-auto">
        <label className="text-[11px] text-gray-400 font-mono tracking-widest block text-center mb-2 uppercase">
          SELECT MISSION PROTOCOL
        </label>
        <div className="flex gap-3 bg-black/60 p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => {
              AudioManager.getInstance().playEvent(AudioEvent.UI_CLICK);
              onSelectMode('solo');
            }}
            onMouseEnter={handleHover}
            className={`px-5 py-2.5 rounded-lg font-mono text-xs tracking-wider transition-all ${
              selectedMode === 'solo'
                ? 'bg-[#FF1493] text-white font-bold shadow-[0_0_15px_#FF1493]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🚀 SOLO CAMPAIGN
          </button>

          <button
            onClick={() => {
              AudioManager.getInstance().playEvent(AudioEvent.UI_CLICK);
              onSelectMode('coop');
            }}
            onMouseEnter={handleHover}
            className={`px-5 py-2.5 rounded-lg font-mono text-xs tracking-wider transition-all ${
              selectedMode === 'coop'
                ? 'bg-[#00F0FF] text-black font-bold shadow-[0_0_15px_#00F0FF]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            👥 2-PLAYER CO-OP
          </button>
        </div>
      </div>

      {/* Start Button */}
      <div className="flex flex-col gap-3 mb-6 w-72 pointer-events-auto">
        <button
          onClick={handleStartMission}
          onMouseEnter={handleHover}
          className="group relative px-8 py-4 bg-[#FF1493] hover:bg-[#FF1493]/90 text-white font-bold text-lg rounded-xl transition-all duration-200 tracking-widest shadow-[0_0_25px_rgba(255,20,147,0.6)] hover:shadow-[0_0_35px_rgba(255,20,147,0.9)] hover:scale-105 active:scale-95 text-center"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          <span>START MISSION</span>
        </button>

        <button
          onClick={() => setShowQuitModal(true)}
          onMouseEnter={handleHover}
          className="px-6 py-2 bg-black/60 hover:bg-white/10 text-gray-400 hover:text-white font-mono text-xs rounded-lg border border-white/10 tracking-widest text-center"
        >
          QUIT
        </button>
      </div>

      {/* Controls Card */}
      <div className="bg-black/60 border border-white/10 rounded-xl p-4 mb-4 max-w-lg w-full text-center shadow-xl">
        <h3 className="text-[10px] uppercase text-gray-400 font-mono tracking-widest mb-2.5">
          {selectedMode === 'coop' ? 'CO-OP CONTROLS' : 'FLIGHT & WEAPONS CONTROLS'}
        </h3>
        <div
          className={`grid ${selectedMode === 'coop' ? 'grid-cols-2' : 'grid-cols-3'} gap-2 text-xs text-gray-300 font-mono`}
        >
          {/* P1 Controls */}
          <div className="bg-white/5 p-2 rounded border border-pink-500/20">
            <span className="text-[#FF1493] font-bold block mb-0.5">
              {selectedMode === 'coop' ? 'P1 (PINK SHIP)' : 'PLAYER 1'}
            </span>
            <span className="block text-[11px]">↑ ↓ ← → Move</span>
            <span className="block text-[11px]">SPACE Shoot • R Reload</span>
          </div>

          {/* P2 Controls in Co-Op */}
          {selectedMode === 'coop' && (
            <div className="bg-white/5 p-2 rounded border border-cyan-500/20">
              <span className="text-[#00F0FF] font-bold block mb-0.5">P2 (CYAN SHIP)</span>
              <span className="block text-[11px]">W A S D Move</span>
              <span className="block text-[11px]">F / Q Shoot • E Reload</span>
            </div>
          )}

          {/* Special Mechanics */}
          <div className="bg-white/5 p-2 rounded border border-white/5">
            <span className="text-yellow-400 font-bold block mb-0.5">POWER-UPS & REGEN</span>
            <span className="block text-[11px]">WPN+, HP+, SHIELD</span>
            <span className="block text-[11px]">Auto HP Regen after 4.5s</span>
          </div>
        </div>
      </div>

      {/* High Score & Profile XP */}
      <div
        className="text-[#FF1493] text-sm tracking-widest font-bold drop-shadow-[0_0_8px_rgba(255,20,147,0.5)]"
        style={{ fontFamily: 'Orbitron, sans-serif' }}
      >
        LIFETIME HIGH SCORE: {activeProfile.highScore.toLocaleString()}
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          onClose={() => setShowProfileModal(false)}
          onProfileUpdated={handleProfileUpdated}
        />
      )}

      {/* Quit Modal */}
      {showQuitModal && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-4 z-30">
          <div className="bg-[#0b0b1a] border-2 border-[#FF1493] p-6 rounded-xl max-w-sm w-full text-center shadow-[0_0_30px_rgba(255,20,147,0.4)]">
            <h3
              className="text-xl font-bold text-white mb-2"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              QUIT GAME?
            </h3>
            <p className="text-gray-400 text-xs font-mono mb-6">
              Return to terminal hangar or close application?
            </p>
            <div className="flex gap-3 justify-center pointer-events-auto">
              <button
                onClick={() => setShowQuitModal(false)}
                className="px-4 py-2 bg-[#FF1493] text-white font-mono text-xs rounded hover:bg-[#FF1493]/80 transition-colors"
              >
                STAY IN GAME
              </button>
              <button
                onClick={() => {
                  if (onQuit) onQuit();
                  else window.close();
                }}
                className="px-4 py-2 bg-transparent border border-gray-600 hover:border-gray-400 text-gray-300 font-mono text-xs rounded transition-colors"
              >
                CONFIRM EXIT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
