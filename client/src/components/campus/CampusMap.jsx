import React, { useRef, useEffect } from 'react';
import { generateMap, BUILDING_LABELS } from './campusData';

const TILE_COLORS = {
  0: '#3a7a20',   // 草地
  1: '#686058',   // 馬路
  2: '#b86858',   // 校內磚紅走道
  3: '#a08060',   // 建築（先統一用這個顏色）
  4: '#2d6818',   // 樹
};

const TS = 16;
const VIEW_W = 1200;
const VIEW_H = 620;

function drawLabels(ctx, labels, camera) {
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';

  labels.forEach(b => {
    const bx = b.x * TS - camera.x;
    const by = b.y * TS - camera.y;
    const bw = b.w * TS;
    const bh = b.h * TS;

    if (bx + bw < 0 || bx > VIEW_W || by + bh < 0 || by > VIEW_H) return;

    const cx = bx + bw / 2;
    const cy = by + bh / 2;
    const lw = ctx.measureText(b.name).width + 8;

    ctx.fillStyle = 'rgba(244,232,209,0.90)';
    ctx.fillRect(cx - lw/2, cy - 8, lw, 16);
    ctx.fillStyle = '#3a2a18';
    ctx.fillText(b.name, cx, cy + 4);
  });
}

function render(ctx, map, camera) {
  const startCol = Math.max(0, Math.floor(camera.x / TS));
  const startRow = Math.max(0, Math.floor(camera.y / TS));
  const endCol = Math.min(160, startCol + Math.ceil(VIEW_W / TS) + 1);
  const endRow = Math.min(90,  startRow + Math.ceil(VIEW_H / TS) + 1);

  for (let r = startRow; r < endRow; r++) {
    for (let c = startCol; c < endCol; c++) {
      const tile = map[r][c];
      const px = c * TS - camera.x;
      const py = r * TS - camera.y;
      ctx.fillStyle = TILE_COLORS[tile] || '#3a7a20';
      ctx.fillRect(px, py, TS, TS);
    }
  }

  drawLabels(ctx, BUILDING_LABELS, camera);
}

export default function CampusMap() {
  const canvasRef = useRef(null);
  const mapDataRef = useRef(generateMap());
  
  const posRef = useRef({ px: 31 * 16, py: 30 * 16 });
  const cameraRef = useRef({ x: 0, y: 0 });
  const keysRef = useRef({ w: false, a: false, s: false, d: false });

  function isWalkable(map, px, py) {
    // 檢查四個角，避免卡牆
    const margin = 4;
    const corners = [
      [px + margin, py + margin],
      [px + 16 - margin, py + margin],
      [px + margin, py + 16 - margin],
      [px + 16 - margin, py + 16 - margin],
    ];
    for (let [cx, cy] of corners) {
      const col = Math.floor(cx / 16);
      const row = Math.floor(cy / 16);
      if (col < 0 || row < 0 || col >= 160 || row >= 90) return false;
      if (map[row][col] === 3 || map[row][col] === 4) return false;
    }
    return true;
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (keysRef.current.hasOwnProperty(key)) keysRef.current[key] = true;
      if (e.key === 'ArrowUp') keysRef.current.w = true;
      if (e.key === 'ArrowDown') keysRef.current.s = true;
      if (e.key === 'ArrowLeft') keysRef.current.a = true;
      if (e.key === 'ArrowRight') keysRef.current.d = true;
    };
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (keysRef.current.hasOwnProperty(key)) keysRef.current[key] = false;
      if (e.key === 'ArrowUp') keysRef.current.w = false;
      if (e.key === 'ArrowDown') keysRef.current.s = false;
      if (e.key === 'ArrowLeft') keysRef.current.a = false;
      if (e.key === 'ArrowRight') keysRef.current.d = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const gameLoop = () => {
      let dx = 0; let dy = 0;
      if (keysRef.current.w) dy -= 1;
      if (keysRef.current.s) dy += 1;
      if (keysRef.current.a) dx -= 1;
      if (keysRef.current.d) dx += 1;

      if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

      const speed = 3.5;
      if (dx !== 0 || dy !== 0) {
        const nextX = posRef.current.px + dx * speed;
        if (isWalkable(mapDataRef.current, nextX, posRef.current.py)) {
          posRef.current.px = nextX;
        }
        const nextY = posRef.current.py + dy * speed;
        if (isWalkable(mapDataRef.current, posRef.current.px, nextY)) {
          posRef.current.py = nextY;
        }
      }

      cameraRef.current.x = Math.max(0, Math.min(160*16 - VIEW_W, posRef.current.px - VIEW_W/2));
      cameraRef.current.y = Math.max(0, Math.min(90*16  - VIEW_H, posRef.current.py - VIEW_H/2));

      ctx.clearRect(0, 0, VIEW_W, VIEW_H);
      render(ctx, mapDataRef.current, cameraRef.current);

      // Draw player (a simple red square)
      const screenPx = posRef.current.px - cameraRef.current.x;
      const screenPy = posRef.current.py - cameraRef.current.y;
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(screenPx, screenPy, 16, 16);

      animationId = window.requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => window.cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="relative w-[1200px] h-[620px] border-4 border-[#8b5a2b] mx-auto overflow-hidden bg-[#3a7a20]">
      <canvas ref={canvasRef} width={VIEW_W} height={VIEW_H} className="block outline-none" tabIndex="0" />
      <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded shadow font-bold text-sm text-black">
        <p>⌨️ WASD / 方向鍵 移動</p>
      </div>
    </div>
  );
}
