import React, { useRef, useEffect, useState } from 'react';
import { MAP_DATA, COLLISION_BOXES } from './campusData';

const VIEW_W = 1200;
const VIEW_H = 700;
const ZOOM = 1.6; // 放大倍率
const PLAYER_SPEED = 3;

function drawPlayer(ctx, px, py, camera) {
  const sx = (px - camera.x) * ZOOM;
  const sy = (py - camera.y) * ZOOM;

  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(sx, sy + 14 * ZOOM, 8 * ZOOM, 3 * ZOOM, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#202020';
  ctx.lineWidth = 1 * ZOOM;

  ctx.fillStyle = '#ffccaa';
  ctx.fillRect(sx - 4 * ZOOM, sy - 8 * ZOOM, 8 * ZOOM, 8 * ZOOM);
  ctx.strokeRect(sx - 4 * ZOOM, sy - 8 * ZOOM, 8 * ZOOM, 8 * ZOOM);

  ctx.fillStyle = '#3060ff';
  ctx.fillRect(sx - 5 * ZOOM, sy, 10 * ZOOM, 10 * ZOOM);
  ctx.strokeRect(sx - 5 * ZOOM, sy, 10 * ZOOM, 10 * ZOOM);

  ctx.fillStyle = '#ff0000';
  ctx.fillRect(sx - 6 * ZOOM, sy + 10 * ZOOM, 5 * ZOOM, 4 * ZOOM);
  ctx.strokeRect(sx - 6 * ZOOM, sy + 10 * ZOOM, 5 * ZOOM, 4 * ZOOM);
  ctx.fillRect(sx + 1 * ZOOM, sy + 10 * ZOOM, 5 * ZOOM, 4 * ZOOM);
  ctx.strokeRect(sx + 1 * ZOOM, sy + 10 * ZOOM, 5 * ZOOM, 4 * ZOOM);
}

export default function CampusMap() {
  const canvasRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef(null);
  
  const posRef = useRef({ px: 0, py: 0 });
  const cameraRef = useRef({ x: 0, y: 0 });
  const keysRef = useRef({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    const img = new Image();
    img.src = MAP_DATA.imageUrl;
    img.onload = () => {
      imgRef.current = img;
      posRef.current.px = (MAP_DATA.startX / 100) * img.width;
      posRef.current.py = (MAP_DATA.startY / 100) * img.height;
      setImageLoaded(true);
    };
  }, []);

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

  function isWalkable(px, py, imgWidth, imgHeight) {
    const pX = (px / imgWidth) * 100;
    const pY = (py / imgHeight) * 100;
    if (pX < 0 || pX > 100 || pY < 0 || pY > 100) return false;
    for (let box of COLLISION_BOXES) {
      if (pX >= box.x && pX <= box.x + box.w && pY >= box.y && pY <= box.y + box.h) {
        return false;
      }
    }
    return true;
  }

  useEffect(() => {
    if (!imageLoaded || !imgRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    
    let animationId;
    const img = imgRef.current;

    const gameLoop = () => {
      let dx = 0; let dy = 0;
      if (keysRef.current.w) dy -= 1;
      if (keysRef.current.s) dy += 1;
      if (keysRef.current.a) dx -= 1;
      if (keysRef.current.d) dx += 1;

      if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

      if (dx !== 0 || dy !== 0) {
        const nextX = posRef.current.px + dx * PLAYER_SPEED;
        if (isWalkable(nextX, posRef.current.py, img.width, img.height)) posRef.current.px = nextX;
        const nextY = posRef.current.py + dy * PLAYER_SPEED;
        if (isWalkable(posRef.current.px, nextY, img.width, img.height)) posRef.current.py = nextY;
      }

      const viewW_inImagePixels = VIEW_W / ZOOM;
      const viewH_inImagePixels = VIEW_H / ZOOM;
      cameraRef.current.x = Math.max(0, Math.min(img.width - viewW_inImagePixels, posRef.current.px - viewW_inImagePixels / 2));
      cameraRef.current.y = Math.max(0, Math.min(img.height - viewH_inImagePixels, posRef.current.py - viewH_inImagePixels / 2));

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      ctx.drawImage(
        img, 
        cameraRef.current.x, cameraRef.current.y, 
        viewW_inImagePixels, viewH_inImagePixels, 
        0, 0, VIEW_W, VIEW_H
      );

      drawPlayer(ctx, posRef.current.px, posRef.current.py, cameraRef.current);

      animationId = window.requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.cancelAnimationFrame(animationId);
    };
  }, [imageLoaded]);

  return (
    <div className="flex flex-col items-center gap-4 my-8">
      <div className="relative w-[1200px] h-[700px] bg-white border border-gray-300 shadow-2xl overflow-hidden rounded-md flex-shrink-0">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white z-10 flex-col">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mb-4"></div>
            <p className="text-xl font-bold">载入完美全景地图中...</p>
          </div>
        )}
        <canvas 
          ref={canvasRef} 
          width={VIEW_W} 
          height={VIEW_H} 
          className="block outline-none" 
          tabIndex="0" 
          style={{ imageRendering: 'pixelated' }}
        />

        <div className="absolute bottom-4 right-4 bg-white/90 px-4 py-2 rounded-sm font-bold text-sm text-gray-800 border-2 border-black pointer-events-none shadow-lg">
          <p>▶ WASD / 方向键移动</p>
        </div>
      </div>
    </div>
  );
}
