'use client';

import { AudioManager } from '@/game/audio/AudioManager';
import { AudioEvent } from '@/game/audio/audioEvents';

interface PauseScreenProps {
  onResume: () => void;
  onMainMenu: () => void;
}

export default function PauseScreen({ onResume, onMainMenu }: PauseScreenProps) {
  const handleHover = () => {
    AudioManager.getInstance().playEvent(AudioEvent.UI_HOVER);
  };

  const handleResume = () => {
    AudioManager.getInstance().playEvent(AudioEvent.UI_CLICK);
    onResume();
  };

  const handleMainMenu = () => {
    AudioManager.getInstance().playEvent(AudioEvent.UI_CLICK);
    onMainMenu();
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-md select-none z-20">
      <div className="text-center mb-8">
        <h2
          className="text-5xl md:text-6xl font-black text-white mb-2 tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          GAME PAUSED
        </h2>
        <p className="text-sm font-mono text-[#FF1493] tracking-widest">
          AUDIO MUFFLED • SIMULATION SUSPENDED
        </p>
      </div>

      <div className="flex flex-col gap-4 w-60 pointer-events-auto mb-6">
        <button
          onClick={handleResume}
          onMouseEnter={handleHover}
          className="px-8 py-3.5 bg-[#FF1493] hover:bg-[#FF1493]/90 text-white font-bold text-lg rounded-lg transition-all duration-200 tracking-widest shadow-[0_0_20px_rgba(255,20,147,0.5)] hover:shadow-[0_0_30px_rgba(255,20,147,0.8)] hover:scale-105 active:scale-95 text-center"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          RESUME
        </button>

        <button
          onClick={handleMainMenu}
          onMouseEnter={handleHover}
          className="px-8 py-3 bg-black/70 hover:bg-white/10 text-gray-300 hover:text-white font-medium text-sm rounded-lg border border-white/20 hover:border-white/40 transition-all duration-200 tracking-widest text-center font-mono hover:scale-102 active:scale-98"
        >
          MAIN MENU
        </button>
      </div>

      <p className="text-xs text-gray-400 font-mono tracking-widest">
        Press <span className="text-white font-bold">[ P ]</span> to Resume
      </p>
    </div>
  );
}
