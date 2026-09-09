'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { InputState } from '@/game/input';
import { BRAND_PINK, NEON_CYAN, GOLD_ACCENT, DANGER_RED } from '@/game/constants';

interface TouchControlsProps {
  onInputChange: (input: Partial<InputState>) => void;
  onReload: () => void;
  onPowerShot: () => void;
  onBomb: () => void;
  powerShotReady?: boolean;
  powerShotProgress?: number;
  bombs?: number;
}

export default function TouchControls({
  onInputChange,
  onReload,
  onPowerShot,
  onBomb,
  powerShotReady = false,
  powerShotProgress = 0,
  bombs = 0,
}: TouchControlsProps) {
  const [stickPos, setStickPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const baseRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);

  const handleJoystickStart = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    handleJoystickMove(e);
  };

  const handleJoystickMove = useCallback(
    (e: React.TouchEvent | TouchEvent) => {
      if (!baseRef.current || touchIdRef.current === null) return;

      let targetTouch: { clientX: number; clientY: number } | null = null;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === touchIdRef.current) {
          targetTouch = e.touches[i];
          break;
        }
      }
      if (!targetTouch) return;

      const rect = baseRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = targetTouch.clientX - centerX;
      const dy = targetTouch.clientY - centerY;
      const distance = Math.min(48, Math.hypot(dx, dy));
      const angle = Math.atan2(dy, dx);

      const clampedX = Math.cos(angle) * distance;
      const clampedY = Math.sin(angle) * distance;

      setStickPos({ x: clampedX, y: clampedY });

      const threshold = 12;
      onInputChange({
        left: clampedX < -threshold,
        right: clampedX > threshold,
        up: clampedY < -threshold,
        down: clampedY > threshold,
      });
    },
    [onInputChange]
  );

  const handleJoystickEnd = useCallback(
    (e: React.TouchEvent | TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchIdRef.current) {
          touchIdRef.current = null;
          setStickPos({ x: 0, y: 0 });
          onInputChange({ left: false, right: false, up: false, down: false });
          break;
        }
      }
    },
    [onInputChange]
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex justify-between items-end p-4 md:p-6 select-none">
      {/* Left Virtual Joystick */}
      <div className="pointer-events-auto flex flex-col items-center">
        <div
          ref={baseRef}
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          onTouchCancel={handleJoystickEnd}
          className="relative w-28 h-28 md:w-32 md:h-32 rounded-full bg-slate-950/70 border-2 border-pink-500/60 shadow-[0_0_25px_rgba(255,20,147,0.35)] flex items-center justify-center backdrop-blur-md touch-none active:border-pink-400"
        >
          {/* Direction Guides */}
          <span className="absolute top-1.5 text-pink-500 text-[10px] opacity-70">▲</span>
          <span className="absolute bottom-1.5 text-pink-500 text-[10px] opacity-70">▼</span>
          <span className="absolute left-1.5 text-pink-500 text-[10px] opacity-70">◀</span>
          <span className="absolute right-1.5 text-pink-500 text-[10px] opacity-70">▶</span>

          {/* Stick Knob */}
          <div
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-pink-600 to-rose-400 border-2 border-white/90 shadow-[0_0_15px_#FF1493] flex items-center justify-center transition-transform duration-75 ease-out pointer-events-none"
            style={{
              transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
            }}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-white opacity-90 shadow-sm" />
          </div>
        </div>
        <span className="text-[9px] font-mono text-cyan-400 font-bold mt-1.5 tracking-widest uppercase bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800">
          JOYSTICK
        </span>
      </div>

      {/* Right Action Buttons */}
      <div className="pointer-events-auto flex items-end gap-2.5 md:gap-3.5">
        {/* Reload Button */}
        <button
          onClick={onReload}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-950/80 border border-cyan-400/70 text-cyan-400 active:scale-90 font-mono text-xs tracking-wider flex flex-col items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-transform touch-none backdrop-blur-md"
        >
          <span className="text-sm">🔄</span>
          <span className="text-[8px] font-bold">RELOAD</span>
        </button>

        {/* EMP Bomb Button */}
        <button
          onClick={onBomb}
          disabled={bombs <= 0}
          className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-150 touch-none backdrop-blur-md ${
            bombs > 0
              ? 'bg-rose-950/90 border-red-500 text-red-300 shadow-[0_0_20px_rgba(255,0,84,0.6)] active:scale-90 hover:bg-rose-900 animate-pulse'
              : 'bg-slate-950/50 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
          }`}
        >
          <span className="text-base md:text-lg">💣</span>
          <span className="text-[9px] font-black font-mono">x{bombs}</span>
        </button>

        {/* Power Shot Button */}
        <button
          onClick={onPowerShot}
          disabled={!powerShotReady}
          className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-150 touch-none overflow-hidden backdrop-blur-md ${
            powerShotReady
              ? 'bg-gradient-to-tr from-cyan-600 to-blue-500 border-cyan-300 text-white shadow-[0_0_30px_#00F0FF] active:scale-90 animate-bounce'
              : 'bg-slate-950/80 border-slate-700 text-slate-400 active:scale-95'
          }`}
        >
          {/* Circular/vertical charge overlay */}
          {!powerShotReady && (
            <div
              className="absolute bottom-0 left-0 right-0 bg-cyan-500/25 transition-all duration-200 pointer-events-none"
              style={{ height: `${Math.round(powerShotProgress * 100)}%` }}
            />
          )}
          <span className="text-xl md:text-2xl relative z-10">⚡</span>
          <span className="text-[9px] md:text-[10px] font-black tracking-wider uppercase relative z-10">
            {powerShotReady ? 'READY!' : `${Math.round(powerShotProgress * 100)}%`}
          </span>
        </button>
      </div>
    </div>
  );
}
