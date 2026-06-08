import React, { useRef, useEffect } from 'react';
import { TILE_COLORS } from './campusData';

export default function CampusMinimap({ playerX, playerY, mapData }) {
  const canvasRef = useRef(null);
  
  const MAP_W = 160;
  const MAP_H = 90;
  const SCALE = 1; // Mini map size: 160x90 px directly

  useEffect(() => {
    if (!canvasRef.current || !mapData) return;
    const ctx = canvasRef.current.getContext('2d');
    
    // Draw static map
    ctx.clearRect(0, 0, MAP_W * SCALE, MAP_H * SCALE);
    for (let r = 0; r < MAP_H; r++) {
      for (let c = 0; c < MAP_W; c++) {
        ctx.fillStyle = TILE_COLORS[mapData[r][c]];
        ctx.fillRect(c * SCALE, r * SCALE, SCALE, SCALE);
      }
    }
    
    // Draw Player
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(playerX * SCALE, playerY * SCALE, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw a radar pulse circle
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(playerX * SCALE, playerY * SCALE, 4, 0, Math.PI * 2);
    ctx.stroke();

  }, [playerX, playerY, mapData]);

  return (
    <div className="absolute top-6 right-6 bg-[#f4e8d1]/90 p-2 rounded-xl border-4 border-[#8b5a2b] shadow-[0_0_20px_rgba(139,90,43,0.4)] z-50 pointer-events-none">
      <div className="text-center text-[#4a3b32] font-black text-xs mb-2 border-b border-[#8b5a2b]/30 pb-1 tracking-wider">
        🗺️ 北科大地圖
      </div>
      <div className="relative rounded overflow-hidden border border-[#8b5a2b]" style={{ width: `${MAP_W * SCALE}px`, height: `${MAP_H * SCALE}px` }}>
        <canvas ref={canvasRef} width={MAP_W * SCALE} height={MAP_H * SCALE} />
      </div>
      <div className="mt-2 text-[9px] font-bold text-[#7a6350] text-center font-mono">
        LOC: {Math.floor(playerX)}, {Math.floor(playerY)}
      </div>
    </div>
  );
}
