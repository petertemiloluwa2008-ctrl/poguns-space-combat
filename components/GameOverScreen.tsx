'use client';

import { AudioManager } from '@/game/audio/AudioManager';
import { AudioEvent } from '@/game/audio/audioEvents';
import { ProfileManager } from '@/game/profileManager';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  stage: number;
  stageName: string;
  onRestart: () => void;
  onMainMenu: () => void;
}

export default function GameOverScreen({
  score,
  highScore,
  stage,
  stageName,
  onRestart,
  onMainMenu,
}: GameOverScreenProps) {
  const profile = ProfileManager.getInstance().getActiveProfile();
  const isNewHighScore = score >= highScore && score > 0;

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

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md select-none z-20 p-6">
      <h2
        className="text-6xl md:text-7xl font-black text-[#FF3B5C] mb-4 tracking-widest drop-shadow-[0_0_35px_rgba(255,59,92,0.8)] animate-pulse"
        style={{ fontFamily: 'Orbitron, sans-serif' }}
      >
        GAME OVER
      </h2>

      <div className="text-center mb-6 space-y-3 bg-black/60 border border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
        <div>
          <span className="text-xs text-gray-400 font-mono tracking-widest block">FINAL SCORE</span>
          <span
            className="text-3xl font-black text-white tracking-wider"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            {score.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-white/10">
          <div>
            <span className="text-[10px] text-gray-400 font-mono tracking-widest block">STAGE REACHED</span>
            <span className="text-sm font-bold text-[#00F0FF] font-mono">
              STG {stage}: {stageName}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 font-mono tracking-widest block">PILOT RANK</span>
            <span className="text-sm font-bold text-[#FF1493] font-mono">
              {profile.rank}
            </span>
          </div>
        </div>

        <div>
          <span className="text-xs text-gray-400 font-mono tracking-widest block">HIGH SCORE</span>
          <span
            className="text-lg font-bold text-[#FFD700] tracking-wider font-mono"
          >
            {highScore.toLocaleString()}
          </span>
        </div>

        {isNewHighScore && (
          <div
            className="text-[#00F0FF] text-xs font-bold tracking-widest mt-2 border border-[#00F0FF]/40 bg-[#00F0FF]/10 py-1.5 px-3 rounded animate-pulse"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            ★ NEW HIGH SCORE! ★
          </div>
        )}
      </div>

      {/* Action Buttons: TRY AGAIN & MAIN MENU */}
      <div className="flex flex-col gap-3 w-64 pointer-events-auto">
        <button
          onClick={handleTryAgain}
          onMouseEnter={handleHover}
          className="px-8 py-4 bg-[#FF1493] hover:bg-[#FF1493]/90 text-white font-bold text-base rounded-xl transition-all duration-200 tracking-widest shadow-[0_0_25px_rgba(255,20,147,0.6)] hover:shadow-[0_0_35px_rgba(255,20,147,0.9)] hover:scale-105 active:scale-95 text-center"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          TRY AGAIN
        </button>

        <button
          onClick={handleMainMenu}
          onMouseEnter={handleHover}
          className="px-8 py-3 bg-black/70 hover:bg-white/10 text-gray-300 hover:text-white font-medium text-xs rounded-xl border border-white/20 hover:border-white/40 transition-all duration-200 tracking-widest text-center font-mono hover:scale-102 active:scale-98"
        >
          MAIN MENU
        </button>
      </div>

      <p className="text-xs text-gray-500 font-mono tracking-widest mt-5">
        Press <span className="text-white font-bold">[ R ]</span> to Restart
      </p>
    </div>
  );
}
