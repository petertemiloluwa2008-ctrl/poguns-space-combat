'use client';

import { useState } from 'react';
import { AudioManager } from '@/game/audio/AudioManager';
import { AudioEvent } from '@/game/audio/audioEvents';
import { ProfileManager } from '@/game/profileManager';
import { ShipId, SHIPS } from '@/game/ships';
import { ShipSelectModal } from './ShipSelectModal';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  stage: number;
  stageName: string;
  shipId?: ShipId;
  weaponTier?: number;
  onRestart: () => void;
  onMainMenu: () => void;
  onSelectShip?: (shipId: ShipId) => void;
}

export default function GameOverScreen({
  score,
  highScore,
  stage,
  stageName,
  shipId = 'vanguard',
  weaponTier = 1,
  onRestart,
  onMainMenu,
  onSelectShip,
}: GameOverScreenProps) {
  const [showShipModal, setShowShipModal] = useState(false);
  const profile = ProfileManager.getInstance().getActiveProfile();
  const isNewHighScore = score >= highScore && score > 0;
  const currentShip = SHIPS[shipId] || SHIPS.vanguard;

  const handleHover = () => {
    AudioManager.getInstance().playEvent(AudioEvent.UI_HOVER);
  };

  const handleTryAgain = () => {
    AudioManager.getInstance().playEvent(AudioEvent.PLAY_CLICK);
    onRestart();
  };

  const handleMainMenu = () => {
    AudioManager.getInstance().playEvent(AudioEvent.UI_CLICK);
    onMainMenu();
  };

  const handleShipSelected = (newShipId: ShipId) => {
    if (onSelectShip) onSelectShip(newShipId);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md select-none z-20 p-4 md:p-6 overflow-y-auto">
      <h2
        className="text-5xl md:text-7xl font-black text-red-500 mb-3 tracking-widest drop-shadow-[0_0_35px_rgba(255,59,92,0.8)] animate-pulse"
        style={{ fontFamily: 'Orbitron, sans-serif' }}
      >
        GAME OVER
      </h2>

      <div className="text-center mb-5 space-y-3 bg-slate-950/80 border border-slate-800 p-5 rounded-2xl max-w-sm w-full shadow-2xl">
        <div>
          <span className="text-xs text-gray-400 font-mono tracking-widest block">FINAL SCORE</span>
          <span
            className="text-3xl font-black text-white tracking-wider"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            {score.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-800">
          <div>
            <span className="text-[10px] text-gray-400 font-mono tracking-widest block">
              STAGE REACHED
            </span>
            <span className="text-xs font-bold text-cyan-400 font-mono">
              STG {stage}: {stageName}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 font-mono tracking-widest block">
              WEAPON LEVEL
            </span>
            <span className="text-xs font-bold text-pink-400 font-mono">
              TIER {weaponTier}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between px-2">
          <span className="text-xs text-gray-400 font-mono tracking-widest">ACTIVE SHIP:</span>
          <button
            onClick={() => setShowShipModal(true)}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold font-mono underline"
          >
            {currentShip.name} (Change)
          </button>
        </div>

        <div>
          <span className="text-xs text-gray-400 font-mono tracking-widest block">
            HIGH SCORE
          </span>
          <span className="text-base font-bold text-yellow-400 tracking-wider font-mono">
            {highScore.toLocaleString()}
          </span>
        </div>

        {isNewHighScore && (
          <div
            className="text-cyan-300 text-xs font-bold tracking-widest mt-2 border border-cyan-500/40 bg-cyan-950/40 py-1.5 px-3 rounded animate-pulse"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            ★ NEW HIGH SCORE! ★
          </div>
        )}
      </div>

      {/* Action Buttons: TRY AGAIN & MAIN MENU */}
      <div className="flex flex-col gap-2.5 w-64 pointer-events-auto">
        <button
          onClick={handleTryAgain}
          onMouseEnter={handleHover}
          className="px-8 py-3.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-bold text-base rounded-xl transition-all duration-200 tracking-widest shadow-[0_0_25px_rgba(255,20,147,0.6)] hover:shadow-[0_0_35px_rgba(255,20,147,0.9)] hover:scale-105 active:scale-95 text-center"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          TRY AGAIN
        </button>

        <button
          onClick={handleMainMenu}
          onMouseEnter={handleHover}
          className="px-8 py-2.5 bg-slate-900 hover:bg-slate-800 text-gray-300 hover:text-white font-medium text-xs rounded-xl border border-slate-700 hover:border-slate-500 transition-all duration-200 tracking-widest text-center font-mono"
        >
          MAIN MENU
        </button>
      </div>

      <p className="text-xs text-gray-500 font-mono tracking-widest mt-4">
        Press <span className="text-white font-bold">[ R ]</span> to Quick Restart
      </p>

      {/* Ship Select Modal */}
      {showShipModal && (
        <ShipSelectModal
          currentShipId={shipId}
          isOpen={showShipModal}
          onSelect={handleShipSelected}
          onClose={() => setShowShipModal(false)}
        />
      )}
    </div>
  );
}
