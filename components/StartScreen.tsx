'use client';

import { useState } from 'react';
import { AudioManager } from '@/game/audio/AudioManager';
import { AudioEvent } from '@/game/audio/audioEvents';
import { ProfileManager } from '@/game/profileManager';
import { GameMode, PilotProfile } from '@/game/types';
import { ShipId, SHIPS } from '@/game/ships';
import ProfileModal from './ProfileModal';
import { ShipSelectModal } from './ShipSelectModal';

interface StartScreenProps {
  highScore: number;
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  touchEnabled: boolean;
  onToggleTouch: () => void;
  onStart: () => void;
  onQuit?: () => void;
  selectedShipId?: ShipId;
  onSelectShip?: (shipId: ShipId) => void;
}

export default function StartScreen({
  highScore,
  selectedMode,
  onSelectMode,
  touchEnabled,
  onToggleTouch,
  onStart,
  onQuit,
  selectedShipId = 'vanguard',
  onSelectShip,
}: StartScreenProps) {
  const [isMuted, setIsMuted] = useState(AudioManager.getInstance().isMuted());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);
  const [activeProfile, setActiveProfile] = useState<PilotProfile>(
    ProfileManager.getInstance().getActiveProfile()
  );
  const [showQuitModal, setShowQuitModal] = useState(false);

  const currentShip = SHIPS[selectedShipId] || SHIPS.vanguard;

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
    const updated = ProfileManager.getInstance().getActiveProfile();
    setActiveProfile({ ...updated });
    if (onSelectShip && updated.selectedShipId) {
      onSelectShip(updated.selectedShipId);
    }
  };

  const handleShipSelected = (shipId: ShipId) => {
    if (onSelectShip) onSelectShip(shipId);
    handleProfileUpdated();
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md select-none z-20 p-3 md:p-6 overflow-y-auto">
      {/* Top Controls: Profile Badge & Toggles */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-4 pointer-events-auto">
        {/* Pilot Profile Button */}
        <button
          onClick={() => {
            AudioManager.getInstance().playEvent(AudioEvent.UI_CLICK);
            setShowProfileModal(true);
          }}
          onMouseEnter={handleHover}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 hover:bg-pink-950/40 border border-pink-500/50 rounded-xl text-xs font-mono text-white transition-all shadow-[0_0_15px_rgba(255,20,147,0.25)]"
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: currentShip.primaryColor || '#FF1493' }}
          />
          <span className="font-bold">{activeProfile.callsign}</span>
          <span className="px-1.5 py-0.5 bg-pink-500/30 text-[10px] rounded text-pink-300">
            {activeProfile.rank}
          </span>
          <span className="text-gray-400 text-[10px] hidden sm:inline">⚙ DOSSIER</span>
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
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_#00F0FF]'
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black/70 hover:bg-pink-950/30 border border-pink-500/40 rounded-lg text-xs font-mono text-white transition-all"
          >
            <span>{isMuted ? '🔇' : '🔊'}</span>
            <span className="hidden sm:inline">{isMuted ? 'MUTE' : 'AUDIO'}</span>
          </button>
        </div>
      </div>

      {/* Brand Header */}
      <div className="text-center my-2">
        <h1
          className="text-5xl md:text-8xl font-black text-pink-500 tracking-widest drop-shadow-[0_0_35px_rgba(255,20,147,0.7)]"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          POGUNS
        </h1>
        <h2
          className="text-lg md:text-2xl font-bold text-white tracking-[0.3em] mt-1 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          SPACE COMBAT
        </h2>
        <div className="h-0.5 w-48 bg-gradient-to-r from-transparent via-pink-500 to-transparent mx-auto mt-2" />
      </div>

      {/* Spaceship Selection Card */}
      <div className="my-3 pointer-events-auto">
        <button
          onClick={() => {
            AudioManager.getInstance().playEvent(AudioEvent.UI_CLICK);
            setShowShipModal(true);
          }}
          onMouseEnter={handleHover}
          className="flex items-center gap-3 px-4 py-2.5 bg-slate-900/80 hover:bg-slate-800 border border-cyan-400/50 hover:border-cyan-300 rounded-xl transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] group"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg border"
            style={{
              borderColor: currentShip.primaryColor,
              backgroundColor: `${currentShip.primaryColor}20`,
            }}
          >
            {selectedShipId === 'vanguard' && '🚀'}
            {selectedShipId === 'phantom' && '⚡'}
            {selectedShipId === 'titan' && '🛡️'}
            {selectedShipId === 'spectre' && '🔮'}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-mono">ACTIVE SHIP:</span>
              <span className="text-sm font-bold text-white group-hover:text-cyan-300">
                {currentShip.name}
              </span>
            </div>
            <span className="text-[10px] text-cyan-400 font-mono">{currentShip.tagline}</span>
          </div>
          <span className="text-xs px-2 py-1 bg-cyan-950 border border-cyan-500/40 text-cyan-300 rounded font-mono ml-2">
            CHANGE ❯
          </span>
        </button>
      </div>

      {/* Game Mode Selection (Solo vs 2-Player Co-Op) */}
      <div className="mb-4 pointer-events-auto">
        <label className="text-[11px] text-gray-400 font-mono tracking-widest block text-center mb-1.5 uppercase">
          SELECT MISSION PROTOCOL
        </label>
        <div className="flex gap-2.5 bg-black/60 p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => {
              AudioManager.getInstance().playEvent(AudioEvent.UI_CLICK);
              onSelectMode('solo');
            }}
            onMouseEnter={handleHover}
            className={`px-4 md:px-5 py-2 rounded-lg font-mono text-xs tracking-wider transition-all ${
              selectedMode === 'solo'
                ? 'bg-pink-600 text-white font-bold shadow-[0_0_15px_#FF1493]'
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
            className={`px-4 md:px-5 py-2 rounded-lg font-mono text-xs tracking-wider transition-all ${
              selectedMode === 'coop'
                ? 'bg-cyan-400 text-black font-bold shadow-[0_0_15px_#00F0FF]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            👥 2-PLAYER CO-OP
          </button>
        </div>
      </div>

      {/* Start Button */}
      <div className="flex flex-col gap-2.5 mb-4 w-72 pointer-events-auto">
        <button
          onClick={handleStartMission}
          onMouseEnter={handleHover}
          className="group relative px-8 py-3.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-bold text-lg rounded-xl transition-all duration-200 tracking-widest shadow-[0_0_25px_rgba(255,20,147,0.6)] hover:shadow-[0_0_35px_rgba(255,20,147,0.9)] hover:scale-105 active:scale-95 text-center"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          <span>START MISSION</span>
        </button>

        <button
          onClick={() => setShowQuitModal(true)}
          onMouseEnter={handleHover}
          className="px-6 py-1.5 bg-black/60 hover:bg-white/10 text-gray-400 hover:text-white font-mono text-xs rounded-lg border border-white/10 tracking-widest text-center"
        >
          QUIT
        </button>
      </div>

      {/* Controls Card */}
      <div className="bg-black/60 border border-white/10 rounded-xl p-3 md:p-4 mb-3 max-w-lg w-full text-center shadow-xl">
        <h3 className="text-[10px] uppercase text-gray-400 font-mono tracking-widest mb-2">
          {selectedMode === 'coop' ? 'CO-OP CONTROLS' : 'FLIGHT & WEAPONS CONTROLS'}
        </h3>
        <div
          className={`grid ${selectedMode === 'coop' ? 'grid-cols-2' : 'grid-cols-3'} gap-2 text-xs text-gray-300 font-mono`}
        >
          {/* P1 Controls */}
          <div className="bg-white/5 p-2 rounded border border-pink-500/20">
            <span className="text-pink-400 font-bold block mb-0.5">
              {selectedMode === 'coop' ? 'P1 (PINK SHIP)' : 'MANEUVER & FIRE'}
            </span>
            <span className="block text-[11px]">↑ ↓ ← → Move</span>
            <span className="block text-[11px] text-yellow-300">AUTO-FIRING ON</span>
          </div>

          {/* P2 Controls in Co-Op */}
          {selectedMode === 'coop' && (
            <div className="bg-white/5 p-2 rounded border border-cyan-500/20">
              <span className="text-cyan-400 font-bold block mb-0.5">P2 (CYAN SHIP)</span>
              <span className="block text-[11px]">W A S D Move</span>
              <span className="block text-[11px]">Q Power Shot • E Bomb</span>
            </div>
          )}

          {/* Special Mechanics */}
          <div className="bg-white/5 p-2 rounded border border-white/5">
            <span className="text-cyan-300 font-bold block mb-0.5">SPECIAL ARSENAL</span>
            <span className="block text-[11px]">⚡ SPACE / Z: Laser</span>
            <span className="block text-[11px]">💣 B: EMP Shockwave</span>
          </div>

          {selectedMode === 'solo' && (
            <div className="bg-white/5 p-2 rounded border border-white/5">
              <span className="text-yellow-400 font-bold block mb-0.5">FALLING BONUSES</span>
              <span className="block text-[11px]">WPN, Shield, Rapid</span>
              <span className="block text-[11px]">Invuln, Bombs, Crystal</span>
            </div>
          )}
        </div>
      </div>

      {/* High Score & Profile XP */}
      <div
        className="text-pink-400 text-xs md:text-sm tracking-widest font-bold drop-shadow-[0_0_8px_rgba(255,20,147,0.5)]"
        style={{ fontFamily: 'Orbitron, sans-serif' }}
      >
        LIFETIME HIGH SCORE: {activeProfile.highScore.toLocaleString()}
      </div>

      {/* Ship Select Modal */}
      {showShipModal && (
        <ShipSelectModal
          currentShipId={selectedShipId}
          isOpen={showShipModal}
          onSelect={handleShipSelected}
          onClose={() => setShowShipModal(false)}
        />
      )}

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
          <div className="bg-slate-950 border-2 border-pink-500 p-6 rounded-xl max-w-sm w-full text-center shadow-[0_0_30px_rgba(255,20,147,0.4)]">
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
                className="px-4 py-2 bg-pink-600 text-white font-mono text-xs rounded hover:bg-pink-500 transition-colors"
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
