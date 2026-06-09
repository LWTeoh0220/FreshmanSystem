import React, { useRef, useEffect, useState } from 'react';
import { MAP_DATA, COLLISION_BOXES, BUILDING_POIS } from './campusData';
import { usePlayer } from '../../contexts/PlayerContext';
import { NPC_DATA } from './npcData';
import DialogueBox from './DialogueBox';

const VIEW_W = 1200;
const VIEW_H = 700;
const ZOOM = 1.6; // 放大倍率
const PLAYER_SPEED = 3.5;

function drawHighDefCharacter(ctx, px, py, camera, nearPoiName, direction, isMoving, time, avatarType, playerLevel, charSprites) {
  const sx = (px - camera.x) * ZOOM;
  const sy = (py - camera.y) * ZOOM;

  const lvl = Math.min(4, Math.max(1, playerLevel));
  const gender = avatarType === 'avatar_girl_wizard' ? 'F' : 'M';
  const dirsMap = {0: 'a', 1: 'b', 3: 'c', 2: 'd'}; // 0=Front, 1=Left, 2=Right, 3=Back
  const dirChar = dirsMap[direction];
  const spriteKey = `L${lvl}${gender}${dirChar}`;
  const charImg = charSprites ? charSprites[spriteKey] : null;

  if (charImg && charImg.complete) {
    // Better Natural Walking Animation (Squash & Stretch + slight bobbing)
    const bobbing = isMoving ? Math.abs(Math.sin(time / 100)) * 3 : 0;
    const squash = isMoving ? 1 - Math.abs(Math.sin(time / 100)) * 0.04 : 1; 
    const floatOffset = (lvl >= 4) ? Math.sin(time / 400) * 5 : 0; // Floating effect for lvl 4

    ctx.save();
    // Translate the origin to the character's feet
    ctx.translate(sx, sy - bobbing - floatOffset);
    
    // Draw shadow underneath
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    if (lvl >= 4) {
      ctx.ellipse(0, 10 * ZOOM + floatOffset, 14 * ZOOM, 5 * ZOOM, 0, 0, Math.PI * 2);
    } else {
      ctx.ellipse(0, 8 * ZOOM + bobbing, 12 * ZOOM, 4 * ZOOM, 0, 0, Math.PI * 2);
    }
    ctx.fill();

    // Apply squash and stretch scaling at the feet
    ctx.scale(1, squash);

    // Draw sprite (anchor feet exactly where shadow is)
    // CRITICAL: We scale based on the original image dimensions.
    // The user cropped them independently, so maintaining charImg.width / height is necessary.
    // scale = 0.25 keeps them roughly the same size as they were intended.
    const scale = 0.25;
    const drawW = charImg.width * scale * ZOOM;
    const drawH = charImg.height * scale * ZOOM;
    
    // Offset slightly left to center the sprite, offset up so feet are on origin
    ctx.drawImage(charImg, 0, 0, charImg.width, charImg.height, -drawW / 2, 10 * ZOOM - drawH, drawW, drawH);

    ctx.restore();
  }

  if (nearPoiName) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    const text = `[E] 探索 ${nearPoiName}`;
    ctx.font = 'bold 12px sans-serif';
    const textWidth = ctx.measureText(text).width;
    const floatY = sy - 35 * ZOOM + Math.sin(time / 200) * 3;
    ctx.fillRect(sx - textWidth / 2 - 5, floatY - 12, textWidth + 10, 18);
    ctx.fillStyle = '#FFD700'; 
    ctx.textAlign = 'center';
    ctx.fillText(text, sx, floatY);
  }
}

export default function CampusMap() {


  const canvasRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  
  const imgRef = useRef(null);
  const hisMuseumImgRef = useRef(null);
  const charImgRef = useRef(null);
  
  const [isPoiEditMode, setIsPoiEditMode] = useState(false);
  const [isWallEditMode, setIsWallEditMode] = useState(false);
  const [isDrawingMuseum, setIsDrawingMuseum] = useState(false);
  
  const [exportedJson, setExportedJson] = useState("");
  
  const [npcs, setNpcs] = useState(() => JSON.parse(JSON.stringify(NPC_DATA)));
  const [dialogueState, setDialogueState] = useState(null);
  const npcImgRef = useRef(null);
  
  const poisRef = useRef([...BUILDING_POIS]);
  const wallsRef = useRef([...COLLISION_BOXES]);

  const posRef = useRef({ px: 0, py: 0 });
  const cameraRef = useRef({ x: 0, y: 0 });
  const keysRef = useRef({ w: false, a: false, s: false, d: false, e: false });
  
  const directionRef = useRef(0); // 0: down, 1: left, 2: right, 3: up
  const isMovingRef = useRef(false);

  const dragStartRef = useRef(null);
  const currentDragRef = useRef(null);

  const isEPressedRef = useRef(false);

  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [playerPct, setPlayerPct] = useState({ x: 50, y: 50 });

  const { activeAvatar, level, setLevel, setActiveAvatar } = usePlayer();

  useEffect(() => {
    let loadedCount = 0;
    
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === 4 + 32) {
        setImageLoaded(true);
        updateExport();
      }
    };

    const img = new Image();
    img.src = MAP_DATA.imageUrl;
    img.onload = () => {
      imgRef.current = img;
      posRef.current.px = (MAP_DATA.startX / 100) * img.width;
      posRef.current.py = (MAP_DATA.startY / 100) * img.height;
      setPlayerPct({ x: MAP_DATA.startX, y: MAP_DATA.startY });
      checkAllLoaded();
    };

    const museumImg = new Image();
    museumImg.src = '/campus_hisMuseum.png';
    museumImg.onload = () => {
      hisMuseumImgRef.current = museumImg;
      checkAllLoaded();
    };

    npcImgRef.current = {};
    const studentsImg = new Image();
    studentsImg.src = '/npcs/studentsNPC_transparent.png';
    studentsImg.onload = () => {
      npcImgRef.current.students = studentsImg;
      checkAllLoaded();
    };
    
    const facultyImg = new Image();
    facultyImg.src = '/npcs/facultyNPC_transparent.png';
    facultyImg.onload = () => {
      npcImgRef.current.faculty = facultyImg;
      checkAllLoaded();
    };

    const sprites = {};
    const levels = [1, 2, 3, 4];
    const genders = ['M', 'F'];
    const dirs = ['a', 'b', 'c', 'd'];
    
    levels.forEach(l => {
      genders.forEach(g => {
        dirs.forEach(d => {
          const img = new Image();
          img.src = `/sprites/L${l}${g}${d}.png`;
          img.onload = checkAllLoaded;
          sprites[`L${l}${g}${d}`] = img;
        });
      });
    });
    charImgRef.current = sprites;

  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (keysRef.current.hasOwnProperty(key)) keysRef.current[key] = true;
      if (e.key === 'ArrowUp') keysRef.current.w = true;
      if (e.key === 'ArrowDown') keysRef.current.s = true;
      if (e.key === 'ArrowLeft') keysRef.current.a = true;
      if (e.key === 'ArrowRight') keysRef.current.d = true;
      if (e.key.toLowerCase() === 'e') keysRef.current.e = true;
      
      if (key === 'm') setIsMapExpanded(prev => !prev);
    };
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (keysRef.current.hasOwnProperty(key)) keysRef.current[key] = false;
      if (e.key === 'ArrowUp') keysRef.current.w = false;
      if (e.key === 'ArrowDown') keysRef.current.s = false;
      if (e.key === 'ArrowLeft') keysRef.current.a = false;
      if (e.key === 'ArrowRight') keysRef.current.d = false;
      if (e.key.toLowerCase() === 'e') keysRef.current.e = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  function isWalkable(px, py, imgWidth, imgHeight) {
    if (isWallEditMode) return true; 
    
    const pX = (px / imgWidth) * 100;
    const pY = (py / imgHeight) * 100;
    if (pX < 0 || pX > 100 || pY < 0 || pY > 100) return false;
    
    const activeWalls = isWallEditMode ? wallsRef.current : COLLISION_BOXES;
    for (let box of activeWalls) {
      if (pX >= box.x && pX <= box.x + box.w && pY >= box.y && pY <= box.y + box.h) {
        return false;
      }
    }
    return true;
  }

  const updateExport = () => {
    if (isPoiEditMode) setExportedJson(JSON.stringify(poisRef.current, null, 2));
    else if (isWallEditMode) setExportedJson(JSON.stringify(wallsRef.current, null, 2));
  };

  useEffect(() => {
    if (!imageLoaded || !imgRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    
    let animationId;
    const img = imgRef.current;

    const gameLoop = () => {
      if (selectedBuilding || isMapExpanded) {
        animationId = window.requestAnimationFrame(gameLoop);
        return;
      }

      // Freeze player during dialogue
      if (dialogueState) {
        keysRef.current.w = false;
        keysRef.current.a = false;
        keysRef.current.s = false;
        keysRef.current.d = false;
      }

      // Handle Interaction (E key)
      // Handle Interaction (E key)
      if (keysRef.current.e && !dialogueState && !isWallEditMode && !isPoiEditMode) {
        // Find nearest NPC
        const nearNpc = npcs.find(n => {
           // Skip if already interacted and it's a generic chat/trivia NPC
           if (n.interacted && (n.type === 1 || n.type === 2)) return false;
           
           const dist = Math.sqrt(Math.pow(n.startX - (posRef.current.px/img.width)*100, 2) + Math.pow(n.startY - (posRef.current.py/img.height)*100, 2));
           return dist < 3; // Reduced interaction radius to match character size
        });
        if (nearNpc) {
          setDialogueState({ npc: nearNpc });
          keysRef.current.e = false; // Consume the key press only if we interacted with an NPC
        }
      }

      // --- NPC AI Update ---
      const timeNow = Date.now();
      setNpcs(prevNpcs => {
        return prevNpcs.map(n => {
          let nextX = n.startX;
          let nextY = n.startY;
          let isNpcMoving = false;
          
          if (!dialogueState || dialogueState.npc.id !== n.id) {
            if (n.type === 1 || n.type === 2) {
              if (!n.targetTime || timeNow > n.targetTime) {
                n.targetTime = timeNow + 2000 + Math.random() * 3000;
                n.targetX = n.startX + (Math.random() - 0.5) * n.radius * 2;
                n.targetY = n.startY + (Math.random() - 0.5) * n.radius * 2;
              }
              const dx = n.targetX - n.startX;
              const dy = n.targetY - n.startY;
              const dist = Math.sqrt(dx*dx + dy*dy);
              if (dist > 0.5) {
                let tempX = nextX + (dx/dist) * 0.05;
                let tempY = nextY + (dy/dist) * 0.05;
                // Check wall collision
                if (isWalkable((tempX/100)*img.width, (tempY/100)*img.height, img.width, img.height)) {
                   nextX = tempX;
                   nextY = tempY;
                   isNpcMoving = true;
                } else {
                   // Hit a wall, force retarget next frame
                   n.targetTime = 0;
                }
              }
            } else if (n.type === 4) {
              const px = (posRef.current.px / img.width) * 100;
              const py = (posRef.current.py / img.height) * 100;
              const distToPlayer = Math.sqrt(Math.pow(px - n.startX, 2) + Math.pow(py - n.startY, 2));
              if (distToPlayer < n.radius) {
                const dx = px - n.startX;
                const dy = py - n.startY;
                if (distToPlayer > 3) {
                  let tempX = nextX + (dx/distToPlayer) * 0.08;
                  let tempY = nextY + (dy/distToPlayer) * 0.08;
                  if (isWalkable((tempX/100)*img.width, (tempY/100)*img.height, img.width, img.height)) {
                     nextX = tempX;
                     nextY = tempY;
                     isNpcMoving = true;
                  }
                }
              }
            }
          }
          return { ...n, startX: nextX, startY: nextY, isMoving: isNpcMoving };
        });
      });
      // --------------------

      let dx = 0; let dy = 0;
      if (keysRef.current.w) { dy -= 1; directionRef.current = 3; }
      if (keysRef.current.s) { dy += 1; directionRef.current = 0; }
      if (keysRef.current.a) { dx -= 1; directionRef.current = 1; }
      if (keysRef.current.d) { dx += 1; directionRef.current = 2; }

      if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

      let playerMoved = false;
      if (dx !== 0 || dy !== 0) {
        const nextX = posRef.current.px + dx * PLAYER_SPEED;
        if (isWalkable(nextX, posRef.current.py, img.width, img.height)) posRef.current.px = nextX;
        const nextY = posRef.current.py + dy * PLAYER_SPEED;
        if (isWalkable(posRef.current.px, nextY, img.width, img.height)) posRef.current.py = nextY;
        playerMoved = true;
      }
      isMovingRef.current = playerMoved;
      
      if (playerMoved) {
        // Red dot calculation (Adding 14 * ZOOM offset so it aligns exactly with the character's feet)
        setPlayerPct({
          x: (posRef.current.px / img.width) * 100,
          y: ((posRef.current.py + 14 * ZOOM) / img.height) * 100
        });
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

      const activeWalls = isWallEditMode ? wallsRef.current : COLLISION_BOXES;

      for (let box of activeWalls) {
        if (box.name === '校史馆' && hisMuseumImgRef.current) {
          const bx = (box.x / 100) * img.width;
          const by = (box.y / 100) * img.height;
          const bw = (box.w / 100) * img.width;
          const bh = (box.h / 100) * img.height;

          const sx = (bx - cameraRef.current.x) * ZOOM;
          const sy = (by - cameraRef.current.y) * ZOOM;
          const sw = bw * ZOOM;
          const sh = bh * ZOOM;

          if (sx + sw > 0 && sx < VIEW_W && sy + sh > 0 && sy < VIEW_H) {
            ctx.drawImage(hisMuseumImgRef.current, sx, sy, sw, sh);
          }
        }
      }

      if (isWallEditMode) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        for (let box of activeWalls) {
          const bx = (box.x / 100) * img.width;
          const by = (box.y / 100) * img.height;
          const bw = (box.w / 100) * img.width;
          const bh = (box.h / 100) * img.height;
          
          const sx = (bx - cameraRef.current.x) * ZOOM;
          const sy = (by - cameraRef.current.y) * ZOOM;
          const sw = bw * ZOOM;
          const sh = bh * ZOOM;

          ctx.fillRect(sx, sy, sw, sh);
          ctx.strokeRect(sx, sy, sw, sh);

          ctx.fillStyle = 'white';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(box.name, sx + sw / 2, sy + sh / 2);
        }

        if (dragStartRef.current && currentDragRef.current) {
          const startX = dragStartRef.current.x;
          const startY = dragStartRef.current.y;
          const currX = currentDragRef.current.x;
          const currY = currentDragRef.current.y;

          const bx = (Math.min(startX, currX) / 100) * img.width;
          const by = (Math.min(startY, currY) / 100) * img.height;
          const bw = (Math.abs(currX - startX) / 100) * img.width;
          const bh = (Math.abs(currY - startY) / 100) * img.height;

          const sx = (bx - cameraRef.current.x) * ZOOM;
          const sy = (by - cameraRef.current.y) * ZOOM;
          const sw = bw * ZOOM;
          const sh = bh * ZOOM;

          ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
          ctx.fillRect(sx, sy, sw, sh);
          ctx.strokeStyle = 'green';
          ctx.strokeRect(sx, sy, sw, sh);
        }
      }

      let nearPoi = null;
      const INTERACT_DIST = 25; 
      const time = Date.now();
      ctx.lineWidth = 2 * ZOOM;

      const activePois = isPoiEditMode ? poisRef.current : BUILDING_POIS;

      // Draw NPCs
      const nImgs = npcImgRef.current;
      let showInteractPrompt = false;

      if (nImgs && nImgs.students && nImgs.faculty) {
        
        npcs.forEach(n => {
           const nImg = nImgs[n.sheet || 'students'];
           const frameW = nImg.width / 12; // Assume 12 columns
           const frameH = nImg.height / 8; // Assume 8 rows
           
           const nx = (n.startX / 100) * img.width;
           const ny = (n.startY / 100) * img.height;
           const dsx = (nx - cameraRef.current.x) * ZOOM;
           const dsy = (ny - cameraRef.current.y) * ZOOM;
           
           // Check distance for [E] prompt
           const pxPixels = posRef.current.px;
           const pyPixels = posRef.current.py;
           const distToPlayer = Math.sqrt(Math.pow(nx - pxPixels, 2) + Math.pow(ny - pyPixels, 2));
           
           if (distToPlayer < 25 && !dialogueState) {
             showInteractPrompt = true;
           }
           
           const bobbing = n.isMoving ? Math.abs(Math.sin(time / 100)) * 3 : 0;
           const squash = n.isMoving ? 1 - Math.abs(Math.sin(time / 100)) * 0.04 : 1;
           
           ctx.save();
           ctx.translate(dsx, dsy - bobbing);
           
           // Shadow
           ctx.fillStyle = 'rgba(0,0,0,0.3)';
           ctx.beginPath();
           ctx.ellipse(0, 8 * ZOOM + bobbing, 10 * ZOOM, 3 * ZOOM, 0, 0, Math.PI * 2);
           ctx.fill();
           
           ctx.scale(1, squash);
           
           // Calculate perfect integer crop to avoid bleeding
           const cropX = Math.floor(n.spriteX * 3 * frameW + frameW); 
           const cropY = Math.floor(n.spriteY * 4 * frameH); 
           const cropW = Math.floor(frameW);
           const cropH = Math.floor(frameH);
           
           // Scale by 0.85x from previous size (47.5 * 0.85 = 40.4)
           const drawH = 40.4 * ZOOM;
           const drawW = (cropW / cropH) * 40.4 * ZOOM;
           
           // Apply padding to avoid fetching adjacent pixels
           ctx.drawImage(nImg, cropX + 1, cropY + 1, cropW - 2, cropH - 2, -drawW/2, -drawH + 10 * ZOOM, drawW, drawH);
           ctx.restore();
           
           // Name plate
           ctx.fillStyle = 'rgba(0,0,0,0.5)';
           ctx.fillRect(dsx - 40, dsy - drawH - 15, 80, 15);
           ctx.fillStyle = '#fff';
           ctx.font = '10px sans-serif';
           ctx.textAlign = 'center';
           ctx.fillText(n.name, dsx, dsy - drawH - 5);
           
           // Quest Marker (!) if type 3
           if (n.type === 3) {
             const bounce = Math.abs(Math.sin(time / 200)) * 5;
             ctx.fillStyle = '#FFD700';
             ctx.font = 'bold 16px sans-serif';
             ctx.fillText('!', dsx, dsy - drawH - 20 - bounce);
           }
        });
      }
      
      // Draw [E] Interact Prompt
      if (showInteractPrompt) {
         const psx = (posRef.current.px - cameraRef.current.x) * ZOOM;
         const psy = (posRef.current.py - cameraRef.current.y) * ZOOM;
         ctx.fillStyle = 'rgba(30, 27, 24, 0.8)';
         ctx.fillRect(psx - 25, psy - 80, 50, 24);
         ctx.strokeStyle = '#b89b72';
         ctx.strokeRect(psx - 25, psy - 80, 50, 24);
         ctx.fillStyle = '#e0cda5';
         ctx.font = 'bold 12px monospace';
         ctx.textAlign = 'center';
         ctx.fillText('[E] 對話', psx, psy - 64);
      }

      activePois.forEach((poi, index) => {
        const bx = (poi.x / 100) * img.width;
        const by = (poi.y / 100) * img.height;
        const sx = (bx - cameraRef.current.x) * ZOOM;
        const sy = (by - cameraRef.current.y) * ZOOM;

        const distToPlayer = Math.sqrt((posRef.current.px - bx) ** 2 + (posRef.current.py - by) ** 2);
        if (distToPlayer < INTERACT_DIST) {
          nearPoi = poi;
        }

        if (sx < -50 || sx > VIEW_W + 50 || sy < -50 || sy > VIEW_H + 50) return;

        const pulse = Math.abs(Math.sin(time / 500));
        
        ctx.fillStyle = `rgba(255, 215, 0, ${0.4 + pulse * 0.4})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 4 * ZOOM, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(sx, sy, (6 + pulse * 2) * ZOOM, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(index + 1, sx, sy - 10 * ZOOM);
      });

      if (nearPoi && keysRef.current.e && !isWallEditMode && !isPoiEditMode) {
        if (!isEPressedRef.current) {
          setSelectedBuilding(nearPoi);
          isEPressedRef.current = true;
        }
      }
      if (!keysRef.current.e) {
        isEPressedRef.current = false;
      }

      // Draw the new high def 4-direction character
      drawHighDefCharacter(
        ctx, 
        posRef.current.px, 
        posRef.current.py, 
        cameraRef.current, 
        nearPoi ? nearPoi.name : null,
        directionRef.current,
        isMovingRef.current,
        time,
        activeAvatar,
        level,
        charImgRef.current
      );

      animationId = window.requestAnimationFrame(gameLoop);
    };

    const getPercentCoord = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const absX = cameraRef.current.x + clickX / ZOOM;
      const absY = cameraRef.current.y + clickY / ZOOM;
      return {
        x: (absX / img.width) * 100,
        y: (absY / img.height) * 100
      };
    };

    const handleMouseDown = (e) => {
      if (isWallEditMode) {
        dragStartRef.current = getPercentCoord(e);
        currentDragRef.current = getPercentCoord(e);
      }
    };

    const handleMouseMove = (e) => {
      if (isWallEditMode && dragStartRef.current) {
        currentDragRef.current = getPercentCoord(e);
      }
    };

    const handleMouseUp = (e) => {
      if (isWallEditMode && dragStartRef.current && currentDragRef.current) {
        const start = dragStartRef.current;
        const end = currentDragRef.current;
        
        const minX = Math.min(start.x, end.x);
        const maxX = Math.max(start.x, end.x);
        const minY = Math.min(start.y, end.y);
        const maxY = Math.max(start.y, end.y);

        if (maxX - minX > 0.5 && maxY - minY > 0.5) {
          wallsRef.current.push({
            x: parseFloat(minX.toFixed(2)),
            y: parseFloat(minY.toFixed(2)),
            w: parseFloat((maxX - minX).toFixed(2)),
            h: parseFloat((maxY - minY).toFixed(2)),
            name: isDrawingMuseum ? '校史馆' : 'Custom Wall'
          });
          updateExport();
        }
        dragStartRef.current = null;
        currentDragRef.current = null;
        return;
      }

      if (isPoiEditMode && !dragStartRef.current) {
        const p = getPercentCoord(e);
        const newIndex = poisRef.current.length + 1;
        const name = `地标 #${newIndex}`;
        
        poisRef.current.push({
          id: name,
          name: name,
          x: parseFloat(p.x.toFixed(2)),
          y: parseFloat(p.y.toFixed(2)),
          imageUrl: `https://placehold.co/800x500/111827/ffffff?text=${encodeURIComponent(name)}`
        });
        updateExport();
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    gameLoop();

    return () => {
      window.cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [imageLoaded, selectedBuilding, isPoiEditMode, isWallEditMode, isDrawingMuseum, isMapExpanded, activeAvatar, level]);

  const handleSavePois = () => {
    if (import.meta.hot) {
      import.meta.hot.send('custom:save-pois', poisRef.current);
      alert("✅ 已成功将所有【地标点】复写到 campusData.js！");
    }
  };

  const handleSaveWalls = () => {
    if (import.meta.hot) {
      import.meta.hot.send('custom:save-walls', wallsRef.current);
      alert("✅ 已成功将所有【透明墙壁】复写到 campusData.js！");
    }
  };

  return (
    
    <div className="flex flex-col items-center gap-4 my-8 w-full">
      <div className="w-[1200px] flex justify-between items-center bg-gray-100 p-4 rounded shadow">
        <h2 className="text-xl font-bold text-gray-800">🏫 校园导航系统</h2>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              setIsPoiEditMode(!isPoiEditMode);
              setIsWallEditMode(false);
              updateExport();
            }}
            className={`px-4 py-2 rounded font-bold text-white transition-colors ${isPoiEditMode ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isPoiEditMode ? '退出地标编辑' : '进入地标编辑 📍'}
          </button>
          <button 
            onClick={() => {
              setIsWallEditMode(!isWallEditMode);
              setIsPoiEditMode(false);
              updateExport();
            }}
            className={`px-4 py-2 rounded font-bold text-white transition-colors ${isWallEditMode ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            {isWallEditMode ? '退出墙壁编辑' : '进入墙壁编辑 🧱'}
          </button>
        </div>
      </div>

      {isWallEditMode && (
        <div className="w-[1200px] flex gap-4 items-center bg-purple-100 p-4 rounded shadow border border-purple-300">
          <label className="flex items-center gap-2 font-bold text-purple-900 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-5 h-5 accent-purple-600"
              checked={isDrawingMuseum}
              onChange={(e) => setIsDrawingMuseum(e.target.checked)}
            />
            ☑️ 设定下一道墙壁为「校史馆贴图」
          </label>
          <div className="flex-1"></div>
          <button 
            onClick={() => { wallsRef.current = []; updateExport(); }}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 shadow"
          >
            清空所有墙壁
          </button>
          <button 
            onClick={handleSaveWalls}
            className="px-4 py-2 bg-purple-600 text-white font-bold rounded hover:bg-purple-700 shadow"
          >
            💾 存档墙壁
          </button>
        </div>
      )}

      {isPoiEditMode && (
        <div className="w-[1200px] flex gap-4 items-center bg-green-100 p-4 rounded shadow border border-green-300">
          <span className="font-bold text-green-900">点击画面放置发光地标。</span>
          <div className="flex-1"></div>
          <button 
            onClick={() => { poisRef.current = []; updateExport(); }}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 shadow"
          >
            清空所有地标
          </button>
          <button 
            onClick={handleSavePois}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 shadow"
          >
            💾 存档地标
          </button>
        </div>
      )}

      
      <div className="flex justify-center items-start gap-6 w-full max-w-[1600px] px-4">
        {/* Left sidebar: Male */}
        <div className="w-[160px] bg-[#f4e8d1] border-4 border-[#8b5a2b] p-2 rounded-xl shadow-xl flex flex-col gap-2 flex-shrink-0">
           <h3 className="text-center font-bold text-[#1e3a8a] border-b-2 border-[#8b5a2b] pb-1">👨‍🦳 魔法学徒<br/>(男性)</h3>
           {[1, 2, 3, 4].map(l => (
             <div key={l} onClick={() => { setLevel(l); setActiveAvatar('avatar_default'); }} className={`bg-white border-2 ${level === l && activeAvatar === 'avatar_default' ? 'border-yellow-400 shadow-[0_0_10px_yellow]' : 'border-[#a67c52]'} rounded flex flex-col items-center pt-2 relative overflow-hidden cursor-pointer hover:bg-yellow-50 hover:scale-105 active:scale-95 transition-all`}>
                <span className="absolute top-1 left-1 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded shadow z-10 font-black">Lv.{l}</span>
                <div style={{ width: 96, height: 160, backgroundImage: `url('/sprites/L${l}Ma.png')`, backgroundPosition: 'center', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', transform: 'scale(0.85)', transformOrigin: 'top center', marginBottom: '-10px' }}></div>
                <div className="text-xs font-bold text-gray-600 pb-2 z-10">
                  {l === 1 ? '学徒' : l === 2 ? '见习法师' : l === 3 ? '大魔法师' : '传说使徒'}
                </div>
             </div>
           ))}
        </div>

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

        {/* 还原成原本的满屏建筑图鉴 */}
        {selectedBuilding && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-8 animate-in fade-in zoom-in duration-200" onClick={() => setSelectedBuilding(null)}>
            <div 
              className="relative bg-[#f4e8d1] w-full max-w-3xl rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] border-4 border-[#8b5a2b] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#8b5a2b] p-4 text-center border-b-4 border-[#5c3a18]">
                <h2 className="text-3xl font-black text-[#f4e8d1] drop-shadow-md">
                  {selectedBuilding.name}
                </h2>
              </div>
              <div className="p-6 flex flex-col items-center">
                <div className="w-full h-[400px] bg-black rounded-lg overflow-hidden border-2 border-[#8b5a2b] shadow-inner relative flex items-center justify-center group">
                  <img 
                    src={selectedBuilding.imageUrl} 
                    alt={selectedBuilding.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded text-white text-sm font-bold backdrop-blur-md border border-white/20">
                    📸 实景照片展示
                  </div>
                </div>
                <button 
                  onClick={() => { setSelectedBuilding(null); keysRef.current.e = false; }}
                  className="mt-6 px-8 py-3 bg-[#8b5a2b] hover:bg-[#a67c52] text-white font-bold text-xl rounded shadow-[0_4px_0_#5c3a18] active:translate-y-[4px] active:shadow-none transition-all"
                >
                  关闭图鉴
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 右下角常驻迷你小地图 (Mini-map) */}
      <DialogueBox 
        dialogueState={dialogueState} 
        onComplete={(isQuest) => {
          if (dialogueState?.npc) {
            setNpcs(prev => prev.map(n => n.id === dialogueState.npc.id ? { ...n, interacted: true } : n));
          }
          setDialogueState(null);
        }} 
      />

        {!selectedBuilding && !isMapExpanded && imageLoaded && (
          <div className="absolute bottom-4 right-4 z-40 bg-white/10 p-1 rounded border-2 border-[#8b5a2b] shadow-lg backdrop-blur cursor-pointer hover:scale-105 transition-transform" onClick={() => setIsMapExpanded(true)}>
            <div className="relative w-48 bg-[#e0cda5] overflow-hidden border border-[#5c3a18]">
              <img src={MAP_DATA.imageUrl} alt="minimap" className="w-full h-auto block opacity-80" />
              {/* 玩家位置红点 */}
              <div 
                className="absolute w-3 h-3 bg-red-600 rounded-full border-2 border-white shadow shadow-red-900/50 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                style={{ left: `${playerPct.x}%`, top: `${playerPct.y}%` }}
              ></div>
            </div>
            <div className="text-center text-xs font-bold text-[#8b5a2b] mt-1 bg-[#f4e8d1] rounded">
              🗺️ 校园雷达 [按 M 放大]
            </div>
          </div>
        )}

        {/* 展开的大地图 */}
        {isMapExpanded && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8 animate-in fade-in zoom-in duration-200" onClick={() => setIsMapExpanded(false)}>
            <div className="relative w-full max-w-4xl bg-[#f4e8d1] p-4 rounded-xl border-4 border-[#8b5a2b] shadow-[0_0_50px_rgba(0,0,0,0.8)]" onClick={e => e.stopPropagation()}>
              <h3 className="text-2xl font-bold text-center text-[#5c3a18] mb-4 drop-shadow-sm">🗺️ 北科大全区导览图</h3>
              <div className="relative w-full bg-black border-2 border-[#8b5a2b] overflow-hidden rounded shadow-inner">
                <img src={MAP_DATA.imageUrl} alt="large map" className="w-full h-auto block" />
                
                {/* 玩家位置指示 */}
                <div 
                  className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-full"
                  style={{ left: `${playerPct.x}%`, top: `${playerPct.y}%` }}
                >
                  <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg animate-bounce mb-1">
                    📍 您的位置
                  </div>
                  <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-lg"></div>
                </div>

                {/* 标示出所有地标点 */}
                {BUILDING_POIS.map((poi, idx) => (
                  <div 
                    key={poi.id}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full border border-yellow-800 shadow transform -translate-x-1/2 -translate-y-1/2 cursor-help group"
                    style={{ left: `${poi.x}%`, top: `${poi.y}%` }}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap bg-black/80 text-white text-[10px] px-1 rounded z-10">
                      {poi.name}
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setIsMapExpanded(false)}
                className="mt-4 w-full py-2 bg-[#8b5a2b] hover:bg-[#a67c52] text-white font-bold rounded shadow transition-colors"
              >
                关闭地图 [M]
              </button>
            </div>
          </div>
        )}

        {!isPoiEditMode && !isWallEditMode && (
          <div className="absolute bottom-4 left-4 bg-white/90 px-4 py-2 rounded-sm font-bold text-sm text-gray-800 border-2 border-black pointer-events-none shadow-lg flex items-center gap-4">
            <div>
              <p>▶ WASD / 方向键移动</p>
              <p className="mt-1 text-yellow-600">▶ 靠近发光地标按下 [E] 键调查</p>
            </div>
            {/* Show avatar indicator to tell user how to switch */}
            <div className="border-l-2 border-gray-300 pl-4">
              <p className="text-xs text-gray-500">当前形象: {activeAvatar === 'avatar_default' ? '👨‍🦳 男魔法师' : '👵 女魔法师'}</p>
              <p className="text-xs text-blue-600">可在右上角头像选单切换</p>
            </div>
          </div>
        )}
      </div>

        {/* Right sidebar: Female */}
        <div className="w-[160px] bg-[#f4e8d1] border-4 border-[#8b5a2b] p-2 rounded-xl shadow-xl flex flex-col gap-2 flex-shrink-0">
           <h3 className="text-center font-bold text-[#581c87] border-b-2 border-[#8b5a2b] pb-1">👵 魔法学徒<br/>(女性)</h3>
           {[1, 2, 3, 4].map(l => (
             <div key={l} onClick={() => { setLevel(l); setActiveAvatar('avatar_girl_wizard'); }} className={`bg-white border-2 ${level === l && activeAvatar !== 'avatar_default' ? 'border-yellow-400 shadow-[0_0_10px_yellow]' : 'border-[#a67c52]'} rounded flex flex-col items-center pt-2 relative overflow-hidden cursor-pointer hover:bg-yellow-50 hover:scale-105 active:scale-95 transition-all`}>
                <span className="absolute top-1 left-1 text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded shadow z-10 font-black">Lv.{l}</span>
                <div style={{ width: 96, height: 160, backgroundImage: `url('/sprites/L${l}Fa.png')`, backgroundPosition: 'center', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', transform: 'scale(0.85)', transformOrigin: 'top center', marginBottom: '-10px' }}></div>
                <div className="text-xs font-bold text-gray-600 pb-2 z-10">
                  {l === 1 ? '学徒' : l === 2 ? '见习法师' : l === 3 ? '大魔法师' : '传说使徒'}
                </div>
             </div>
           ))}
        </div>
      </div>

      {(isPoiEditMode || isWallEditMode) && (
        <div className="w-[1200px] bg-gray-900 p-4 rounded shadow-lg text-white">
          <h3 className="text-lg font-bold text-green-400 mb-2">📋 JSON 代码汇出</h3>
          <p className="text-sm text-gray-400 mb-4">画完后请点选右上方存档按钮自动写入。</p>
          <textarea 
            readOnly 
            value={exportedJson}
            className="w-full h-64 bg-gray-800 p-4 font-mono text-sm border border-gray-700 rounded outline-none"
          />
        </div>
      )}
    </div>
  );
}
