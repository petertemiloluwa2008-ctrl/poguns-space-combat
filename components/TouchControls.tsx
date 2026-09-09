'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { InputState } from '@/game/input';
import { BRAND_PINK, NEON_CYAN } from '@/game/constants';

interface TouchControlsProps {
  onInputChange: (input: Partial<InputState>) => void;
  onReload: () => void;
  onPause: () => void;
}

export default function TouchControls({
  onInputChange,
  onReload,
  onPause,
}: TouchControlsProps) {
  const [touchActive, setTouchActive] = useState(false);
  const [stickPos, setStickPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isShooting, setIsShooting] = useState(false);

  const baseRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);

  const handleJoystickStart = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setTouchActive(true);
    handleJoystickMove(e);
  };

  const handleJoystickMove = useCallback((e: React.TouchEvent | TouchEvent) => {
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
    const distance = Math.min(45, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);

    const clampedX = Math.cos(angle) * distance;
    const clampedY = Math.sin(angle) * distance;

    setStickPos({ x: clampedX, y: clampedY });

    const threshold = 14;
    onInputChange({
      left: clampedX < -threshold,
      right: clampedX > threshold,
      up: clampedY < -threshold,
      down: clampedY > threshold,
    });
  }, [onInputChange]);

  const handleJoystickEnd = useCallback((e: React.TouchEvent | TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setTouchActive(false);
        setStickPos({ x: 0, y: 0 });
        onInputChange({ left: false, right: false, up: false, down: false });
        break;
      }
    }
  }, [onInputChange]);

  const handleShootStart = () => {
    setIsShooting(true);
    onInputChange({ shoot: true });
  };

  const handleShootEnd = () => {
    setIsShooting(false);
    onInputChange({ shoot: false });
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex justify-between items-end p-6 select-none">
      {/* Left Virtual Joystick */}
      <div className="pointer-events-auto flex flex-col items-center">
        <div
          ref={baseRef}
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          onTouchCancel={handleJoystickEnd}
          className="relative w-32 h-32 rounded-full bg-black/55 border-2 border-[#FF1493]/50 shadow-[0_0_20px_rgba(255,20,147,0.3)] flex items-center justify-center backdrop-blur-sm touch-none"
        >
          {/* Outer Direction Arrows */}
          <span className="absolute top-1 text-[#FF1493] text-xs opacity-70">▲</span>
          <span className="absolute bottom-1 text-[#FF1493] text-xs opacity-70">▼</span>
          <span className="absolute left-1 text-[#FF1493] text-xs opacity-70">◀</span>
          <span className="absolute right-1 text-[#FF1493] text-xs opacity-70">▶</span>

          {/* Stick Knob */}
          <div
            className="w-14 h-14 rounded-full bg-[#FF1493] border-2 border-white/80 shadow-[0_0_15px_#FF1493] flex items-center justify-center transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
            }}
          >
            <div className="w-4 h-4 rounded-full bg-white opacity-80" />
          </div>
        </div>
        <span className="text-[10px] font-mono text-gray-400 mt-2 tracking-widest uppercase">
          MANEUVER
        </span>
      </div>

      {/* Right Virtual Buttons */}
      <div className="pointer-events-auto flex items-end gap-3">
        {/* Reload Button */}
        <button
          onClick={onReload}
          className="w-14 h-14 rounded-full bg-black/70 border border-[#00F0FF]/60 hover:bg-[#00F0FF]/20 text-[#00F0FF] active:scale-90 font-mono text-xs tracking-wider flex flex-col items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-transform touch-none"
        >
          <span>↺</span>
          <span className="text-[9px]">RELOAD</span>
        </button>

        {/* Primary Fire Button */}
        <button
          onTouchStart={handleShootStart}
          onTouchEnd={handleShootEnd}
          onMouseDown={handleShootStart}
          onMouseUp={handleShootEnd}
          className={`w-24 h-24 rounded-full border-2 text-white font-bold tracking-widest text-sm flex flex-col items-center justify-center transition-all duration-100 touch-none ${
            isShooting
              ? 'bg-[#FF1493] scale-95 border-white shadow-[0_0_35px_#FF1493]'
              : 'bg-[#FF1493]/85 border-[#FF1493] shadow-[0_0_25px_rgba(255,20,147,0.7)]'
          }`}
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          <span className="text-xl">⚡</span>
          <span>FIRE</span>
        </button>
      </div>
    </div>
  );
}
