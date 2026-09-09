'use client';

import { forwardRef } from 'react';

interface GameCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const GameCanvas = forwardRef<HTMLCanvasElement, GameCanvasProps>(({ canvasRef }, ref) => {
  return (
    <div className="relative w-full max-w-[1280px] max-h-[720px] aspect-[16/9] flex items-center justify-center p-2">
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        tabIndex={0}
        className="w-full h-full object-contain rounded-lg border-2 border-[#FF1493] shadow-[0_0_25px_rgba(255,20,147,0.35)] outline-none bg-[#050510]"
      />
    </div>
  );
});

GameCanvas.displayName = 'GameCanvas';

export default GameCanvas;
