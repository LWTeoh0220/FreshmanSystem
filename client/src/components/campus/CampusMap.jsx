import React, { useRef, useEffect, useState } from 'react';
import { SCENES } from './campusData';
import { usePlayer } from '../../contexts/PlayerContext';
import { TIME_MACHINE_EVENTS, HISTORICAL_WEATHER } from '../../data/timeMachineData';
import { EventMinHeap, DensitySegmentTree } from './timeEngine';
import DialogueBox from './DialogueBox';
import InventoryModal from './InventoryModal';
import JournalModal from './JournalModal';
import { findPath, hasLineOfSight, buildGrid } from './pathfinding';

const VIEW_W = 1200;
const VIEW_H = 700;
const GLOBAL_DEFAULT_ZOOM = 1.6; 
const PLAYER_SPEED = 2.0; 

function drawHighDefCharacter(ctx, px, py, camera, nearPoiName, direction, isMoving, time, avatarType, playerLevel, charSprites, zoomScale, charScale) {
  const sx = (px - camera.x) * zoomScale;
  const sy = (py - camera.y) * zoomScale;

  const lvl = Math.min(4, Math.max(1, playerLevel));
  const gender = avatarType === 'avatar_girl_wizard' ? 'F' : 'M';
  const dirsMap = {0: 'a', 1: 'b', 3: 'c', 2: 'd'}; // 0=Front, 1=Left, 2=Right, 3=Back
  const dirChar = dirsMap[direction];
  const spriteKey = `L${lvl}${gender}${dirChar}`;
  const charImg = charSprites ? charSprites[spriteKey] : null;

  if (charImg && charImg.complete) {
    const bobbing = isMoving ? Math.abs(Math.sin(time / 100)) * 3 : 0;
    const squash = isMoving ? 1 - Math.abs(Math.sin(time / 100)) * 0.04 : 1; 
    const floatOffset = (lvl >= 4) ? Math.sin(time / 400) * 5 : 0; 

    ctx.save();
    ctx.translate(sx, sy - bobbing - floatOffset);
    
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    if (lvl >= 4) {
      ctx.ellipse(0, 10 * zoomScale + floatOffset, 14 * zoomScale, 5 * zoomScale, 0, 0, Math.PI * 2);
    } else {
      ctx.ellipse(0, 8 * zoomScale + bobbing, 12 * zoomScale, 4 * zoomScale, 0, 0, Math.PI * 2);
    }
    ctx.fill();

    ctx.scale(1, squash);

    const drawW = charImg.width * charScale * zoomScale;
    const drawH = charImg.height * charScale * zoomScale;
    
    ctx.drawImage(charImg, 0, 0, charImg.width, charImg.height, -drawW / 2, 22 * zoomScale - drawH, drawW, drawH);

    ctx.restore();
  }

  if (nearPoiName) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    const text = `[E] 探索 ${nearPoiName}`;
    ctx.font = 'bold 12px sans-serif';
    const textWidth = ctx.measureText(text).width;
    const floatY = sy - 35 * zoomScale + Math.sin(time / 200) * 3;
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
  const [isDevMode, setIsDevMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionText, setTransitionText] = useState("");
  
  const [exportedJson, setExportedJson] = useState("");
  
  // Time Machine States
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeSpeed, setTimeSpeed] = useState(60); // 固定 1分鐘/秒 (60倍速)
  const [virtualTime, setVirtualTime] = useState(new Date("2025-09-01T08:00:00").getTime());
  
  const virtualTimeRef = useRef(virtualTime);
  const trackedEventIdRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);
  const timeSpeedRef = useRef(timeSpeed);
  
  const heapRef = useRef(new EventMinHeap());
  const segmentTreeRef = useRef(new DensitySegmentTree());
  const activeEventsRef = useRef([]);
  
  const [tmQuests, setTmQuests] = useState([]);
  const tmQuestsRef = useRef([]);

  useEffect(() => {
    // Sync refs
    virtualTimeRef.current = virtualTime;
    isPlayingRef.current = isPlaying;
    timeSpeedRef.current = timeSpeed;
  }, [virtualTime, isPlaying, timeSpeed]);

  useEffect(() => {
    // Initialize Data Structures
    TIME_MACHINE_EVENTS.forEach(evt => {
      heapRef.current.push(evt);
      const startMs = new Date(evt.timestamp).getTime();
      const endMs = startMs + evt.duration_minutes * 60000;
      segmentTreeRef.current.addDensity(startMs, endMs, evt.popularity_score);
    });
  }, []);

  const npcsRef = useRef([]);
  const isDialogueOpenRef = useRef(false);
  const [dialogueState, setDialogueState] = useState(null);
  const npcImgRef = useRef(null);
  
  const poisRef = useRef([]);
  const wallsRef = useRef([]);

  const posRef = useRef({ px: 0, py: 0 });
  const cameraRef = useRef({ x: 0, y: 0 });
  const keysRef = useRef({ w: false, a: false, s: false, d: false, e: false });
  
  const directionRef = useRef(0); // 0: down, 1: left, 2: right, 3: up
  const isMovingRef = useRef(false);

  const dragStartRef = useRef(null);
  const currentDragRef = useRef(null);
  
  const minimapCanvasRef = useRef(null);
  const targetPathRef = useRef([]);
  const targetDestinationRef = useRef(null);
  const pathRecalcTimeRef = useRef(0);
  const weatherParticlesRef = useRef([]);

  const isEPressedRef = useRef(false);

  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [playerPct, setPlayerPct] = useState({ x: 50, y: 50 });
  const [systemMessage, setSystemMessage] = useState(null);

  const { activeAvatar, level, setLevel, setActiveAvatar, addReward, inventory, addInventoryItem, collectedHiddenItems, markHiddenItemCollected, currentSceneId, setCurrentSceneId } = usePlayer();

  const currentScene = SCENES[currentSceneId] || SCENES['malaysia_room'];
  const ZOOM = currentScene.zoom || GLOBAL_DEFAULT_ZOOM;
  const CHAR_SCALE = currentScene.charScale || 0.25;
  const MAP_DATA = currentScene;
  const COLLISION_BOXES = currentScene.collisions;
  const BUILDING_POIS = currentScene.pois;
  const HIDDEN_COLLECTIBLES = currentScene.collectibles;

  const [isFading, setIsFading] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  const collectedHiddenItemsRef = useRef(collectedHiddenItems);
  const addInventoryItemRef = useRef(addInventoryItem);
  const markHiddenItemCollectedRef = useRef(markHiddenItemCollected);

  useEffect(() => {
    collectedHiddenItemsRef.current = collectedHiddenItems;
    addInventoryItemRef.current = addInventoryItem;
    markHiddenItemCollectedRef.current = markHiddenItemCollected;
  }, [collectedHiddenItems, addInventoryItem, markHiddenItemCollected]);

  const audioRefs = useRef({ day: null, night: null });

  useEffect(() => {
    // Initialize Audio Objects (placeholders for real mp3s)
    audioRefs.current.day = new Audio('/audio/bgm_day.mp3');
    audioRefs.current.day.loop = true;
    audioRefs.current.day.volume = 0.3;
    audioRefs.current.night = new Audio('/audio/bgm_night.mp3');
    audioRefs.current.night.loop = true;
    audioRefs.current.night.volume = 0.3;
    
    return () => {
      audioRefs.current.day.pause();
      audioRefs.current.night.pause();
    }
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      audioRefs.current.day?.pause();
      audioRefs.current.night?.pause();
      return;
    }

    const hours = new Date(virtualTime).getHours();
    if (hours >= 6 && hours < 18) {
      audioRefs.current.night?.pause();
      audioRefs.current.day?.play().catch(e => console.warn("Auto-play prevented"));
    } else {
      audioRefs.current.day?.pause();
      audioRefs.current.night?.play().catch(e => console.warn("Auto-play prevented"));
    }
  }, [virtualTime, isPlaying]);

  
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Asset Loading
  useEffect(() => {
    let loadedCount = 0;
    const totalAssets = 1 + 20 + 32; // 1 Museum + 20 NPCs + 32 Characters
    
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalAssets) {
        setAssetsLoaded(true);
      }
    };

    const museumImg = new Image();
    museumImg.src = '/campus_hisMuseum.png';
    museumImg.onload = () => {
      hisMuseumImgRef.current = museumImg;
      checkAllLoaded();
    };
    museumImg.onerror = () => { console.error("Failed to load museum image"); checkAllLoaded(); };

    npcImgRef.current = {};
    const nSheets = ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09', 's10', 'f01', 'f02', 'f03', 'f04', 'f05', 'f06', 'f07', 'f08', 'f09', 'f10'];
    nSheets.forEach(sheet => {
      const img = new Image();
      img.src = `/npcs/${sheet}_transparent.png`;
      img.onload = () => { npcImgRef.current[sheet] = img; checkAllLoaded(); };
      img.onerror = () => { console.error(`Failed to load ${sheet}`); checkAllLoaded(); };
    });

    charImgRef.current = {};
    const lvls = [1, 2, 3, 4];
    const genders = ['M', 'F'];
    const dirs = ['a', 'b', 'c', 'd'];
    lvls.forEach(l => {
      genders.forEach(g => {
        dirs.forEach(d => {
          const key = `L${l}${g}${d}`;
          const img = new Image();
          img.src = `/sprites/${key}.png`;
          img.onload = () => { charImgRef.current[key] = img; checkAllLoaded(); };
          img.onerror = () => { console.error(`Failed to load character ${key}`); checkAllLoaded(); };
        });
      });
    });
  }, []);

  // Scene Loading
  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.src = currentScene.imageUrl;
    img.onload = () => {
      imgRef.current = img;
      
      // Build collision grid for new scene
      buildGrid(currentScene.collisions);
      
      // Update refs
      wallsRef.current = [...currentScene.collisions];
      poisRef.current = [...currentScene.pois];
      
      // Center player at scene startX, startY
      posRef.current.px = (currentScene.startX / 100) * img.width;
      posRef.current.py = (currentScene.startY / 100) * img.height;
      setPlayerPct({ x: currentScene.startX, y: currentScene.startY });
      
      setImageLoaded(true);
      targetDestinationRef.current = null;
      targetPathRef.current = [];
      
      // Resync events to ensure scene-specific NPCs are loaded
      syncEventsWithTime(virtualTimeRef.current);
    };
  }, [currentScene]);


  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (e.key === 'Escape') {
        e.preventDefault();
        setSystemMessage(null);
        setIsJournalOpen(false);
        setIsInventoryOpen(false);
      }
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

    let lastTime = Date.now();
    let lastUIUpdate = 0;
    let lastCrowdUpdate = 0;

    const gameLoop = () => {
      const timeNow = Date.now();
      const deltaMs = timeNow - lastTime;
      lastTime = timeNow;

      if (selectedBuilding || isMapExpanded) {
        animationId = window.requestAnimationFrame(gameLoop);
        return;
      }

      if (isPlayingRef.current) {
        virtualTimeRef.current += deltaMs * timeSpeedRef.current;
        if (timeNow - lastUIUpdate > 1000) {
          setVirtualTime(virtualTimeRef.current);
          lastUIUpdate = timeNow;
        }

        const heap = heapRef.current;
        while (heap.peek() && heap.getEventTime(heap.peek()) <= virtualTimeRef.current) {
          const evt = heap.pop();
          activeEventsRef.current.push({ ...evt, expiry: new Date(evt.timestamp).getTime() + evt.duration_minutes * 60000 });
          const eventScene = evt.sceneId || 'ntut_campus';
          if (eventScene === currentScene.id) {
            const noticeNpc = {
              id: `notice_${evt.id}`,
              name: "📢 廣播",
              type: 5,
              sheet: "f01",
              startX: evt.x,
              startY: evt.y,
              radius: 0,
              messages: [
                `【${evt.title}】`,
                evt.message
              ]
            };
            npcsRef.current.push(noticeNpc);
          }

          if (evt.quest) {
            tmQuestsRef.current.push({ ...evt.quest, id: evt.id, event: evt, status: 'available' });
            setTmQuests([...tmQuestsRef.current]);
          }
        }

        activeEventsRef.current = activeEventsRef.current.filter(evt => {
          if (virtualTimeRef.current > evt.expiry) {
            npcsRef.current = npcsRef.current.filter(n => n.id !== `notice_${evt.id}`);
            return false;
          }
          return true;
        });

        if (timeNow - lastCrowdUpdate > 1000) {
           lastCrowdUpdate = timeNow;
           let totalDensity = segmentTreeRef.current.getDensityAtTime(virtualTimeRef.current);
           let desiredCrowdSize = Math.min(30, Math.floor(totalDensity / 10)); 
           
           const sceneEvents = activeEventsRef.current.filter(e => (e.sceneId || 'ntut_campus') === currentScene.id);
           if (sceneEvents.length > 0 && desiredCrowdSize > 0) {
              const evts = sceneEvents;
              let currentCrowdCount = npcsRef.current.filter(n => n.id.startsWith('crowd_')).length;
              
              if (currentCrowdCount < desiredCrowdSize) {
                 for(let i=currentCrowdCount; i<desiredCrowdSize; i++) {
                    const evt = evts[Math.floor(Math.random() * evts.length)];
                    let spawnX = evt.x + (Math.random() - 0.5) * 15;
                    let spawnY = evt.y + (Math.random() - 0.5) * 15;
                    
                    // 嚴格限制出生點必須在非隱形牆 (Walkable) 範圍
                    let attempts = 0;
                    while (!isWalkable((spawnX / 100) * img.width, (spawnY / 100) * img.height, img.width, img.height) && attempts < 20) {
                       spawnX = evt.x + (Math.random() - 0.5) * 30;
                       spawnY = evt.y + (Math.random() - 0.5) * 30;
                       attempts++;
                    }

                    npcsRef.current.push({
                       id: `crowd_${Math.random().toString(36).substring(7)}_${evt.id}`,
                       name: "參加者",
                       type: 1,
                       sheet: `s0${Math.floor(Math.random() * 10) + 1}`,
                       startX: spawnX,
                       startY: spawnY,
                       radius: 15, // Provide a larger walking radius around the event
                       messages: ["好熱鬧啊！", "聽說這活動很有名！", "時光機重現的真棒！"]
                    });
                 }
              } else if (currentCrowdCount > desiredCrowdSize) {
                 // 隨機消失一部分 crowd NPCs
                 let toRemove = currentCrowdCount - desiredCrowdSize;
                 npcsRef.current = npcsRef.current.filter(n => {
                    if (n.id.startsWith('crowd_') && toRemove > 0) {
                       toRemove--;
                       return false; // 移除
                    }
                    return true;
                 });
              }
           } else {
              // 沒活動，清除所有人群
              npcsRef.current = npcsRef.current.filter(n => !n.id.startsWith('crowd_'));
           }

           // Check Quest Statuses
           let questsChanged = false;
           tmQuestsRef.current.forEach(q => {
               if (q.status === 'active' || q.status === 'available') {
                  const evtStart = new Date(q.event.timestamp).getTime();
                  const evtEnd = evtStart + q.event.duration_minutes * 60000;
                  const isTimeMatch = virtualTimeRef.current >= evtStart && virtualTimeRef.current < evtEnd;
                  const isExpired = virtualTimeRef.current >= evtEnd;

                  const eventScene = q.event.sceneId || 'ntut_campus';
                  const pX = (posRef.current.px / img.width) * 100;
                  const pY = (posRef.current.py / img.height) * 100;
                  const dist = Math.sqrt(Math.pow(pX - q.event.x, 2) + Math.pow(pY - q.event.y, 2));
                  
                  if (dist < 8 && eventScene === currentScene.id) { 
                     if (q.status === 'active' && isTimeMatch) { // 1a and 1c: correct time, completes regardless of tracking
                        q.status = 'completed';
                        questsChanged = true;
                        addReward(100, 50); // 100 XP, 50 Coins
                        setSystemMessage(`✅ 完成時光任務：${q.title}\n獲得 100 XP, 50 金幣！`);
                        if (trackedEventIdRef.current === q.event.id) {
                           trackedEventIdRef.current = null; // Untrack
                           targetDestinationRef.current = null; // Clear path
                           targetPathRef.current = []; // Clear footprints
                        }
                        keysRef.current = { w: false, a: false, s: false, d: false, e: false, shift: false };
                     } else if (q.status === 'available' && !q.hintShown) {
                        setSystemMessage(`👀 發現目標：${q.title}\n請先打開 [冒險手札] (按鈕 J) 正式接取任務後再進行！`);
                        q.hintShown = true;
                     }
                  }
                  
                  // Handle tracking expiration (1e)
                  if (q.status === 'active' && isExpired && trackedEventIdRef.current === q.event.id && !q.expiredWarningShown) {
                     setSystemMessage(`【時空悖論警告】\n「${q.title}」活動時間已結束！\n請使用時空穿梭儀回到正確的時間點！`);
                     trackedEventIdRef.current = null;
                     targetDestinationRef.current = null;
                     targetPathRef.current = [];
                     q.expiredWarningShown = true; // prevent spamming
                  } else if (q.status === 'available' && virtualTimeRef.current > q.event.expiry) {
                     q.status = 'missed';
                     questsChanged = true;
                  }
               }
           });
           if (questsChanged) {
              setTmQuests([...tmQuestsRef.current]);
           }
        }
      }

      // Freeze player during dialogue or when time is sealed
      if (isDialogueOpenRef.current || !isPlayingRef.current) {
        keysRef.current.w = false;
        keysRef.current.a = false;
        keysRef.current.s = false;
        keysRef.current.d = false;
        keysRef.current.e = false;
      }

      // Handle Interaction (E key)
      if (keysRef.current.e && !isDialogueOpenRef.current && !isWallEditMode && !isPoiEditMode) {
        // Find nearest NPC
        const nearNpc = npcsRef.current.find(n => {
           // Skip if already interacted and it's a generic chat/trivia NPC
           if (n.interacted && (n.type === 1 || n.type === 2)) return false;
           
           const dist = Math.sqrt(Math.pow(n.startX - (posRef.current.px/img.width)*100, 2) + Math.pow(n.startY - (posRef.current.py/img.height)*100, 2));
           return dist < 3; // Reduced interaction radius to match character size
        });
        if (nearNpc) {
          setDialogueState({ npc: nearNpc });
          isDialogueOpenRef.current = true;
          keysRef.current.e = false; // Consume the key press only if we interacted with an NPC
        }
      }

      // --- NPC AI Update ---
      npcsRef.current.forEach(n => {
        let nextX = n.startX;
        let nextY = n.startY;
        let isNpcMoving = false;
        
        if (!isDialogueOpenRef.current && isPlayingRef.current) {
          if (n.type === 1 || n.type === 2) {
            if (!n.targetTime || timeNow > n.targetTime) {
              let foundSafe = false;
              for (let i = 0; i < 10; i++) {
                let tx = n.startX + (Math.random() - 0.5) * n.radius * 2;
                let ty = n.startY + (Math.random() - 0.5) * n.radius * 2;
                if (hasLineOfSight(n.startX, n.startY, tx, ty)) {
                  n.targetX = tx;
                  n.targetY = ty;
                  foundSafe = true;
                  break;
                }
              }
              if (!foundSafe) {
                n.targetX = n.startX;
                n.targetY = n.startY;
              }
              n.targetTime = timeNow + 2000 + Math.random() * 3000;
            }

            // --- Random Muttering (Chat Bubbles) ---
            if (!n.mutterTime || timeNow > n.mutterTime) {
              if (Math.random() > 0.6) {
                const phrases = ["今天的雨怎麼這麼大...", "學餐又爆滿了...", "微積分救命啊...", "快遲到了快遲到了！", "好想喝手搖飲...", "北科大的風真大", "剛才那隻狗好可愛"];
                n.mutterText = phrases[Math.floor(Math.random() * phrases.length)];
                n.mutterClearTime = timeNow + 3000; // Bubble stays for 3s
              }
              n.mutterTime = timeNow + 5000 + Math.random() * 8000;
            }
            if (n.mutterText && timeNow > n.mutterClearTime) {
              n.mutterText = null;
            }
            
            const dx = n.targetX - n.startX;
            const dy = n.targetY - n.startY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist > 0.5) {
              // Time Speed scaling for NPCs
              let speedMultiplier = 1;
              if (timeSpeedRef.current >= 3600) speedMultiplier = 3; // 快步
              if (timeSpeedRef.current >= 86400) speedMultiplier = 8; // 極速
              
              let tempX = nextX + (dx/dist) * 0.05 * speedMultiplier;
              let tempY = nextY + (dy/dist) * 0.05 * speedMultiplier;
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
              
              if (!n.path || !n.pathTime || timeNow > n.pathTime) {
                n.path = findPath(n.startX, n.startY, px, py);
                n.pathTime = timeNow + 500; // Recalculate A* every 500ms
              }
              
              if (distToPlayer > 3) {
                if (n.path && n.path.length > 0) {
                  let wp = n.path[0];
                  let dx = wp.x - n.startX;
                  let dy = wp.y - n.startY;
                  let wpDist = Math.sqrt(dx*dx + dy*dy);
                  
                  if (wpDist < 1) {
                    n.path.shift(); // Move to next waypoint
                  } else {
                    let tempX = nextX + (dx/wpDist) * 0.08;
                    let tempY = nextY + (dy/wpDist) * 0.08;
                    if (isWalkable((tempX/100)*img.width, (tempY/100)*img.height, img.width, img.height)) {
                       nextX = tempX;
                       nextY = tempY;
                       isNpcMoving = true;
                    }
                  }
                }
              } else if (!n.interacted) {
                 // Player got caught by tracker! Trigger dialogue immediately
                 setDialogueState({ npc: n });
                 isDialogueOpenRef.current = true;
                 keysRef.current.w = false;
                 keysRef.current.a = false;
                 keysRef.current.s = false;
                 keysRef.current.d = false;
              }
            }
          }
        }
        n.startX = nextX;
        n.startY = nextY;
        n.isMoving = isNpcMoving;
      });
      // --------------------

      let dx = 0; let dy = 0;
      if (isPlayingRef.current) {
        if (keysRef.current.w) { dy -= 1; directionRef.current = 3; }
        if (keysRef.current.s) { dy += 1; directionRef.current = 0; }
        if (keysRef.current.a) { dx -= 1; directionRef.current = 1; }
        if (keysRef.current.d) { dx += 1; directionRef.current = 2; }
      }

      if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

      let playerMoved = false;
      if (dx !== 0 || dy !== 0) {
        const sceneSpeed = currentScene.speed || 2.0;
        const nextX = posRef.current.px + dx * sceneSpeed;
        if (isWalkable(nextX, posRef.current.py, img.width, img.height)) {
          posRef.current.px = nextX;
        }
        const nextY = posRef.current.py + dy * sceneSpeed;
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

      // --- Weather & Earthquake ---
      let eqX = 0, eqY = 0;
      let weather = null;
      const dNowTime = virtualTimeRef.current;
      for (let w of HISTORICAL_WEATHER) {
         if (dNowTime >= new Date(w.start).getTime() && dNowTime <= new Date(w.end).getTime()) {
            weather = w; break;
         }
      }
      if (weather && weather.type === 'earthquake' && isPlayingRef.current) {
         eqX = (Math.random() - 0.5) * 15 * weather.intensity;
         eqY = (Math.random() - 0.5) * 15 * weather.intensity;
      }

      ctx.save();
      if (eqX !== 0 || eqY !== 0) ctx.translate(eqX, eqY);

      ctx.drawImage(
        img, 
        cameraRef.current.x, cameraRef.current.y, 
        viewW_inImagePixels, viewH_inImagePixels, 
        0, 0, VIEW_W, VIEW_H
      );

      const activeWalls = isWallEditMode ? wallsRef.current : COLLISION_BOXES;

      for (let box of activeWalls) {
        if (box.name === '校史館' && hisMuseumImgRef.current) {
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

      const nImgs = npcImgRef.current;
      let showInteractPrompt = false;

      if (nImgs) {
        
        npcsRef.current.forEach(n => {
           const nImg = nImgs[n.sheet || 's01'];
           if (!nImg) return;
           
           const frameW = nImg.width; 
           const frameH = nImg.height; 
           
           const nx = (n.startX / 100) * img.width;
           const ny = (n.startY / 100) * img.height;
           const dsx = (nx - cameraRef.current.x) * ZOOM;
           const dsy = (ny - cameraRef.current.y) * ZOOM;
           
           // Check if on screen
           if (dsx < -100 || dsx > VIEW_W + 100 || dsy < -100 || dsy > VIEW_H + 100) return;
           
           // Check distance for [E] prompt
           const pxPixels = posRef.current.px;
           const pyPixels = posRef.current.py;
           const distToPlayer = Math.sqrt(Math.pow(nx - pxPixels, 2) + Math.pow(ny - pyPixels, 2));
           
           if (distToPlayer < 25 && !dialogueState) {
             showInteractPrompt = true;
           }
           
           ctx.save();
           ctx.translate(dsx, dsy);
           
           const bobbing = n.isMoving ? Math.abs(Math.sin(time / 100)) * 3 : 0;
           const squash = n.isMoving ? 1 - Math.abs(Math.sin(time / 100)) * 0.04 : 1; 
           
           ctx.translate(0, -bobbing);
           ctx.fillStyle = 'rgba(0,0,0,0.3)';
           ctx.beginPath();
           ctx.ellipse(0, 8 * ZOOM + bobbing, 12 * ZOOM, 4 * ZOOM, 0, 0, Math.PI * 2);
           ctx.fill();
           
           ctx.scale(1, squash);
           
           // No slicing, whole image is one frame
           const cropW = frameW;
           const cropH = frameH;
           
           // Scale by 0.85x from previous size (47.5 * 0.85 = 40.4)
           const drawH = 40.4 * ZOOM;
           const drawW = (cropW / cropH) * 40.4 * ZOOM;
           
           // Draw image directly (shifted down to touch ground)
           ctx.drawImage(nImg, 0, 0, cropW, cropH, -drawW/2, -drawH + 22 * ZOOM, drawW, drawH);
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
        
        if (currentSceneId === 'ntut_campus' || isPoiEditMode) {
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
        } else {
          // Room POIs: just a tiny subtle sparkle to show interaction point, or nothing at all!
          // We'll draw nothing so it doesn't look like a coordinate. The [E] prompt is enough.
        }
      });

      if (nearPoi && keysRef.current.e && !isWallEditMode && !isPoiEditMode) {
        if (!isEPressedRef.current) {
          if (nearPoi.id === 'room_poi_door') {
             setIsTransitioning(true);
             setTransitionText("搭乘長榮航空，準備飛往台灣...");
             setTimeout(() => {
                setCurrentSceneId('ntut_campus');
                setIsTransitioning(false);
             }, 3000);
          } else {
             setSelectedBuilding(nearPoi);
          }
          isEPressedRef.current = true;
        }
      }
      if (!keysRef.current.e) {
        isEPressedRef.current = false;
      }

      // --- Render Hidden Collectibles ---
      let nearHiddenItem = null;
      HIDDEN_COLLECTIBLES.forEach(item => {
        if (collectedHiddenItemsRef.current.includes(item.id)) return;
        
        const bx = (item.x / 100) * img.width;
        const by = (item.y / 100) * img.height;
        const sx = (bx - cameraRef.current.x) * ZOOM;
        const sy = (by - cameraRef.current.y) * ZOOM;

        const distToPlayer = Math.sqrt((posRef.current.px - bx) ** 2 + (posRef.current.py - by) ** 2);
        if (distToPlayer < 25) { // INTERACT_DIST approx
          nearHiddenItem = item;
        }

        if (sx < -50 || sx > VIEW_W + 50 || sy < -50 || sy > VIEW_H + 50) return;

        const pulse = Math.abs(Math.sin(time / 300));
        
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + pulse * 0.5})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 2 * ZOOM, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = `rgba(212, 175, 55, ${0.1 + pulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(sx, sy, (4 + pulse) * ZOOM, 0, Math.PI * 2);
        ctx.stroke();
      });

      if (nearHiddenItem && keysRef.current.e && !isWallEditMode && !isPoiEditMode) {
        if (!isEPressedRef.current) {
          addInventoryItemRef.current(nearHiddenItem);
          markHiddenItemCollectedRef.current(nearHiddenItem.id);
          setSystemMessage(`🎊 發現隱藏物品！獲得 [${nearHiddenItem.name}]`);
          isEPressedRef.current = true;
        }
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
        charImgRef.current,
        ZOOM,
        CHAR_SCALE
      );

      if (currentSceneId === 'ntut_campus') {
        // --- Day / Night Cycle ---
        const currentDate = new Date(virtualTimeRef.current);
        const hours = currentDate.getHours() + currentDate.getMinutes() / 60;
        
        let overlayColor = 'rgba(0,0,0,0)';
        let blendMode = 'source-over';

        if (hours >= 18 || hours < 5) {
          const intensity = hours >= 18 && hours < 19 ? (hours - 18) : (hours >= 4 && hours < 5 ? (5 - hours) : 1);
          overlayColor = `rgba(15, 20, 50, ${0.45 * intensity})`;
          blendMode = 'multiply';
        } else if (hours >= 5 && hours < 7) {
          const intensity = hours < 6 ? (hours - 5) : (7 - hours);
          overlayColor = `rgba(255, 140, 50, ${0.25 * intensity})`;
          blendMode = 'multiply';
        } else if (hours >= 16 && hours < 18) {
          const intensity = hours < 17 ? (hours - 16) : (18 - hours);
          overlayColor = `rgba(255, 80, 0, ${0.3 * intensity})`;
          blendMode = 'multiply';
        }

        if (overlayColor !== 'rgba(0,0,0,0)') {
          ctx.save();
          ctx.globalCompositeOperation = blendMode;
          ctx.fillStyle = overlayColor;
          ctx.fillRect(0, 0, VIEW_W, VIEW_H);
          ctx.restore();
        }

        // --- Weather Particles ---
        if (weather && (weather.type.includes('rain') || weather.type.includes('wind'))) {
           const isHeavy = weather.type === 'rain_heavy';
           const isWind = weather.type === 'wind_strong';
           const speedY = isWind ? 10 : (isHeavy ? 30 : 15);
           const speedX = isWind ? 25 : (isHeavy ? 5 : 2);
           const count = isHeavy ? 5 : (isWind ? 3 : 2);
           
           if (isPlayingRef.current) {
               for (let i = 0; i < count; i++) {
                  weatherParticlesRef.current.push({
                     x: Math.random() * VIEW_W * 1.5 - VIEW_W * 0.25,
                     y: -20,
                     len: Math.random() * 20 + 10,
                     speedX: speedX + Math.random() * 2 - 1,
                     speedY: speedY + Math.random() * 5
                  });
               }
           }
           
           ctx.strokeStyle = 'rgba(150, 200, 255, 0.4)';
           ctx.lineWidth = isHeavy ? 2 : 1;
           ctx.beginPath();
           for (let i = weatherParticlesRef.current.length - 1; i >= 0; i--) {
              let p = weatherParticlesRef.current[i];
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p.x - p.speedX * (p.len / p.speedY), p.y + p.len);
              
              if (isPlayingRef.current) {
                  p.x -= p.speedX;
                  p.y += p.speedY;
              }
              if (p.y > VIEW_H + 50 || p.x < -50) {
                 weatherParticlesRef.current.splice(i, 1);
              }
           }
           ctx.stroke();
        } else {
           weatherParticlesRef.current = [];
        }
      }

      ctx.restore(); // Restore earthquake translation

      // --- Dynamic Path Recalculation ---
      if (targetDestinationRef.current) {
        const dest = targetDestinationRef.current;
        const pPx = (posRef.current.px / img.width) * 100;
        const pPy = (posRef.current.py / img.height) * 100;
        
        const distToDest = Math.sqrt(Math.pow(pPx - dest.x, 2) + Math.pow(pPy - dest.y, 2));
        if (distToDest < 2) { 
          targetDestinationRef.current = null;
          targetPathRef.current = [];
        } else if (timeNow > pathRecalcTimeRef.current) {
          targetPathRef.current = findPath(pPx, pPy, dest.x, dest.y);
          pathRecalcTimeRef.current = timeNow + 500; // Recalculate every 500ms
        }
      }

      // --- Draw Path on Main Canvas ---
      if (targetPathRef.current && targetPathRef.current.length > 0) {
        ctx.save();
        
        const startScreenX = (posRef.current.px - cameraRef.current.x) * ZOOM;
        const startScreenY = (posRef.current.py + 10 - cameraRef.current.y) * ZOOM;
        
        let pathPoints = [{x: startScreenX, y: startScreenY}];
        targetPathRef.current.forEach(pt => {
          pathPoints.push({
            x: (pt.x / 100) * img.width * ZOOM - cameraRef.current.x * ZOOM,
            y: (pt.y / 100) * img.height * ZOOM - cameraRef.current.y * ZOOM
          });
        });

        const footprintSpacing = 16 * ZOOM;
        let distanceCovered = footprintSpacing / 2; // initial offset
        let stepCount = 0;

        ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
        ctx.shadowBlur = 8;

        const waveLength = 120 * ZOOM;
        const speed = 80 * ZOOM;
        const timeSec = Date.now() / 1000;

        for (let i = 0; i < pathPoints.length - 1; i++) {
           let p1 = pathPoints[i];
           let p2 = pathPoints[i+1];
           let dx = p2.x - p1.x;
           let dy = p2.y - p1.y;
           let segLen = Math.sqrt(dx*dx + dy*dy);
           let angle = Math.atan2(dy, dx);
           
           while (distanceCovered <= segLen) {
              let t = distanceCovered / segLen;
              let fx = p1.x + dx * t;
              let fy = p1.y + dy * t;
              
              const isLeft = stepCount % 2 === 0;
              const sideOffset = isLeft ? -5 * ZOOM : 5 * ZOOM;
              
              const px = fx + Math.cos(angle - Math.PI/2) * sideOffset;
              const py = fy + Math.sin(angle - Math.PI/2) * sideOffset;
              
              // Calculate wave alpha
              // totalDistance from player is: (sum of previous segLens) + distanceCovered
              // For simplicity, we just use the stepCount as a proxy for distance
              let distFromStart = stepCount * footprintSpacing;
              let phase = (distFromStart - timeSec * speed) % waveLength;
              if (phase < 0) phase += waveLength;
              let alpha = 0.3 + 0.7 * (1 - Math.abs(phase - waveLength/2) / (waveLength/2));
              
              ctx.save();
              ctx.translate(px, py);
              ctx.rotate(angle);
              
              ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
              
              ctx.beginPath();
              // Heel
              ctx.ellipse(-2 * ZOOM, 0, 1.5 * ZOOM, 1.2 * ZOOM, 0, 0, Math.PI * 2);
              // Sole
              ctx.ellipse(2 * ZOOM, 0, 2.5 * ZOOM, 1.8 * ZOOM, 0, 0, Math.PI * 2);
              ctx.fill();
              
              ctx.restore();
              
              distanceCovered += footprintSpacing;
              stepCount++;
           }
           distanceCovered -= segLen;
        }
        const endPt = targetPathRef.current[targetPathRef.current.length - 1];
        const endPx = (endPt.x / 100) * img.width;
        const endPy = (endPt.y / 100) * img.height;
        ctx.beginPath();
        ctx.fillStyle = `rgba(212, 175, 55, ${0.4 + Math.sin(Date.now() / 200) * 0.3})`;
        ctx.arc((endPx - cameraRef.current.x) * ZOOM, (endPy - cameraRef.current.y) * ZOOM, 12 * ZOOM, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }

      // --- Draw Minimap ---
      if (minimapCanvasRef.current) {
        const mctx = minimapCanvasRef.current.getContext('2d');
        const mSize = minimapCanvasRef.current.width; // Should be 200
        
        // Draw map image
        mctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, mSize, mSize);
        
        // Draw Path on Minimap
        if (targetPathRef.current && targetPathRef.current.length > 0) {
          mctx.beginPath();
          mctx.strokeStyle = 'rgba(212, 175, 55, 1)';
          mctx.lineWidth = 2;
          mctx.setLineDash([4, 4]);
          
          const startX = (posRef.current.px / img.width) * mSize;
          const startY = (posRef.current.py / img.height) * mSize;
          mctx.moveTo(startX, startY);
          targetPathRef.current.forEach(pt => {
             mctx.lineTo((pt.x / 100) * mSize, (pt.y / 100) * mSize);
          });
          mctx.stroke();
          mctx.setLineDash([]);
          
          // Draw target dot
          const endPt = targetPathRef.current[targetPathRef.current.length - 1];
          mctx.beginPath();
          mctx.fillStyle = '#ffaa00';
          mctx.arc((endPt.x / 100) * mSize, (endPt.y / 100) * mSize, 4, 0, Math.PI * 2);
          mctx.fill();
        }

        // Draw player dot
        mctx.beginPath();
        mctx.fillStyle = '#ff3333';
        mctx.strokeStyle = '#ffffff';
        mctx.lineWidth = 1;
        mctx.arc((posRef.current.px / img.width) * mSize, (posRef.current.py / img.height) * mSize, 3, 0, Math.PI * 2);
        mctx.fill();
        mctx.stroke();
      }

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
            name: isDrawingMuseum ? '校史館' : 'Custom Wall'
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
        const name = `地標 #${newIndex}`;
        
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

    const handleDoubleClick = (e) => {
      const p = getPercentCoord(e);
      targetDestinationRef.current = p;
      pathRecalcTimeRef.current = 0; // force instant recalc
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('dblclick', handleDoubleClick);
    window.addEventListener('mouseup', handleMouseUp);
    
    gameLoop();

    return () => {
      window.cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('dblclick', handleDoubleClick);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [imageLoaded, selectedBuilding, isPoiEditMode, isWallEditMode, isDrawingMuseum, isMapExpanded, activeAvatar, level]);

  const handleSavePois = () => {
    if (import.meta.hot) {
      import.meta.hot.send('custom:save-pois', poisRef.current);
      setSystemMessage("✅ 已成功將所有【地標點】複寫到 campusData.js！");
      keysRef.current = { w: false, a: false, s: false, d: false, e: false, shift: false };
    }
  };

  const handleSaveWalls = () => {
    if (import.meta.hot) {
      import.meta.hot.send('custom:save-walls', wallsRef.current);
      setSystemMessage("✅ 已成功將所有【透明牆壁】複寫到 campusData.js！");
      keysRef.current = { w: false, a: false, s: false, d: false, e: false, shift: false };
    }
  };

  const syncEventsWithTime = (newTime) => {
    setVirtualTime(newTime);
    virtualTimeRef.current = newTime;
    // Retain completed and active quests
    const retainedQuests = tmQuestsRef.current.filter(q => q.status === 'completed' || q.status === 'active');
    tmQuestsRef.current = [...retainedQuests];
    
    activeEventsRef.current = [];
    npcsRef.current = npcsRef.current.filter(n => n.type !== 1 && n.type !== 5);

    const activeEvents = TIME_MACHINE_EVENTS.filter(evt => {
      const evtTime = new Date(evt.timestamp).getTime();
      const evtEnd = evtTime + evt.duration_minutes * 60000;
      return newTime >= evtTime && newTime < evtEnd;
    });

    const futureEvents = TIME_MACHINE_EVENTS.filter(evt => {
      const evtTime = new Date(evt.timestamp).getTime();
      return evtTime > newTime;
    });

    // Handle past events that were not completed or active
    const pastEvents = TIME_MACHINE_EVENTS.filter(evt => {
      const evtEnd = new Date(evt.timestamp).getTime() + evt.duration_minutes * 60000;
      return newTime >= evtEnd;
    });

    pastEvents.forEach(evt => {
       if (evt.quest && !tmQuestsRef.current.find(q => q.id === evt.id)) {
         tmQuestsRef.current.push({ ...evt.quest, id: evt.id, event: evt, status: 'missed' });
       }
    });

    activeEvents.forEach(evt => {
      activeEventsRef.current.push({ ...evt, expiry: new Date(evt.timestamp).getTime() + evt.duration_minutes * 60000 });
      
      const eventScene = evt.sceneId || 'ntut_campus';
      if (eventScene === currentScene.id) {
        const noticeNpc = {
          id: `notice_${evt.id}`,
          name: "📢 廣播",
          type: 5,
          sheet: "f01",
          startX: evt.x,
          startY: evt.y,
          radius: 0,
          messages: [
            `【${evt.title}】`,
            evt.message
          ]
        };
        npcsRef.current.push(noticeNpc);
      }

      if (evt.quest && !tmQuestsRef.current.find(q => q.id === evt.id)) {
        tmQuestsRef.current.push({ ...evt.quest, id: evt.id, event: evt, status: 'available' });
      }
    });
    
    setTmQuests([...tmQuestsRef.current]);
    heapRef.current.build(futureEvents);
  };

  const handleTimeAdjust = (ms) => {
    const newTime = Math.max(
      new Date('2025-09-01T08:00:00+08:00').getTime(), 
      Math.min(new Date('2026-06-30T18:00:00+08:00').getTime(), virtualTime + ms)
    );
    syncEventsWithTime(newTime);
  };

  return (
    
    <div className="w-full h-full bg-transparent flex flex-col xl:flex-row relative font-sans overflow-hidden gap-4 p-4">
      {isFading && (
        <div className="absolute inset-0 bg-black z-[200] animate-in fade-in duration-500 flex items-center justify-center">
          <div className="text-[#d4af37] text-2xl font-black flex items-center gap-4">
            <span className="animate-spin text-4xl">✈️</span> 穿越時空中...
          </div>
        </div>
      )}
      
      {/* 畫面暫停遮罩 */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-blue-900/20 pointer-events-none z-30 flex items-center justify-center mix-blend-multiply"></div>
      )}
      
      {!isPlaying && (
         <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none opacity-70">
            <h1 className="text-4xl font-black tracking-widest text-white drop-shadow-[0_0_10px_rgba(0,100,255,0.8)]" style={{ fontFamily: 'serif' }}>時 光 封 印 中</h1>
         </div>
      )}

      {/* System Message Popup */}
      {systemMessage && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] bg-[#2c1a11]/95 border-4 border-[#d4af37] p-8 rounded-lg text-center shadow-[0_0_50px_rgba(212,175,55,0.5)] animate-fade-in-up" style={{imageRendering: 'pixelated'}}>
          <h3 className="text-[#f4e8d1] text-3xl font-black mb-6 drop-shadow-sm">📜 系統通知</h3>
          <p className="text-[#d4af37] text-xl font-bold whitespace-pre-line leading-relaxed">{systemMessage}</p>
          <button 
            onClick={() => {
               setSystemMessage(null);
               keysRef.current = { w: false, a: false, s: false, d: false, e: false, shift: false };
               setTimeout(() => {
                 const canvas = document.querySelector('canvas');
                 if (canvas) canvas.focus();
               }, 50);
            }} 
            className="mt-8 px-8 py-3 bg-[#8b5a2b] hover:bg-[#d4af37] text-[#f4e8d1] hover:text-[#2c1a11] font-black text-xl rounded border-2 border-[#d4af37] transition-colors shadow-lg active:scale-95"
          >
            確認
          </button>
        </div>
      )}

      {/* 開發者工具抽屜按鈕 */}
      <button 
        onClick={() => {
          const newDevMode = !isDevMode;
          setIsDevMode(newDevMode);
          if (!newDevMode) {
            setIsPoiEditMode(false);
            setIsWallEditMode(false);
            setExportedJson(''); // Clear export json
          }
        }}
        className="fixed bottom-20 left-4 z-[200] p-2 bg-black/50 text-white rounded hover:bg-black/80 transition-colors shadow-lg backdrop-blur-sm"
      >
        {isDevMode ? '⬅️ 關閉開發者工具' : '⚙️ 顯示開發者工具'}
      </button>

      {/* 開發者模式側邊抽屜 */}
      <div 
        className="fixed top-0 left-0 h-full w-[320px] bg-[#1a0f0a] border-r-4 border-[#8b5a2b] z-40 p-4 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-y-auto transition-all duration-300"
        style={{ 
          transform: isDevMode ? 'translateX(0)' : 'translateX(-100%)', 
          opacity: isDevMode ? 1 : 0, 
          pointerEvents: isDevMode ? 'auto' : 'none' 
        }}
      >
        <h2 className="text-xl font-bold text-[#d4af37] mb-6 mt-12 border-b border-[#8b5a2b] pb-2">🛠️ 開發者面板</h2>
        
        <div className="flex flex-col gap-4 mb-8">
          <button 
            onClick={() => { setIsPoiEditMode(!isPoiEditMode); setIsWallEditMode(false); updateExport(); }}
            className={`w-full px-4 py-2 rounded-sm font-bold text-white transition-colors ${isPoiEditMode ? 'bg-red-600' : 'bg-green-700'}`}
          >
            {isPoiEditMode ? '退出地標編輯' : '📍 進入地標編輯'}
          </button>
          {isPoiEditMode && (
             <button onClick={handleSavePois} className="w-full px-4 py-2 bg-blue-600 text-white font-bold rounded-sm shadow">💾 存檔地標</button>
          )}

          <button 
            onClick={() => { setIsWallEditMode(!isWallEditMode); setIsPoiEditMode(false); updateExport(); }}
            className={`w-full px-4 py-2 rounded-sm font-bold text-white transition-colors ${isWallEditMode ? 'bg-red-600' : 'bg-purple-700'}`}
          >
            {isWallEditMode ? '退出牆壁編輯' : '🧱 進入牆壁編輯'}
          </button>
          {isWallEditMode && (
             <div className="flex flex-col gap-2 bg-purple-900/30 p-2 rounded">
               <label className="flex items-center gap-2 text-purple-200 text-sm">
                 <input type="checkbox" checked={isDrawingMuseum} onChange={(e) => setIsDrawingMuseum(e.target.checked)} />
                 設定為「校史館」
               </label>
               <button onClick={handleSaveWalls} className="w-full px-4 py-2 bg-purple-600 text-white font-bold rounded-sm shadow">💾 存檔牆壁</button>
             </div>
          )}

          {(isPoiEditMode || isWallEditMode) && (
            <div className="mt-4 bg-[#2c1810] p-3 rounded border border-[#8b5a2b]">
              <h3 className="text-sm font-bold text-[#d4af37] mb-2">📋 JSON 預覽</h3>
              <textarea 
                readOnly 
                value={exportedJson}
                className="w-full h-32 bg-[#1a0f0a] text-xs text-gray-300 p-2 font-mono border border-[#3e2315] rounded outline-none"
              />
            </div>
          )}
        </div>

        {/* Avatars */}
        <div className="flex flex-col gap-4 pb-4">
          <div className="bg-[#f4e8d1] border-2 border-[#8b5a2b] p-3 rounded-sm shadow-xl flex flex-col gap-3">
            <h3 className="text-center font-bold text-[#1e3a8a] border-b-2 border-[#8b5a2b] pb-1 text-sm">👨‍🦳 男學徒</h3>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map(l => (
                <div key={l} onClick={() => { setLevel(l); setActiveAvatar('avatar_default'); }} className={`bg-white border-2 ${level === l && activeAvatar === 'avatar_default' ? 'border-yellow-400 shadow-[0_0_10px_yellow]' : 'border-[#a67c52]'} rounded flex flex-col items-center pt-2 relative overflow-hidden cursor-pointer hover:bg-yellow-50 hover:scale-105 active:scale-95 transition-all`}>
                    <div style={{ width: 96, height: 160, backgroundImage: `url('/sprites/L${l}Ma.png')`, backgroundPosition: 'center', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', transform: 'scale(0.85)', transformOrigin: 'top center', marginBottom: '-10px' }}></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#f4e8d1] border-2 border-[#8b5a2b] p-3 rounded-sm shadow-xl flex flex-col gap-3">
            <h3 className="text-center font-bold text-[#581c87] border-b-2 border-[#8b5a2b] pb-1 text-sm">👵 女學徒</h3>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map(l => (
                <div key={l} onClick={() => { setLevel(l); setActiveAvatar('avatar_girl_wizard'); }} className={`bg-white border-2 ${level === l && activeAvatar !== 'avatar_default' ? 'border-yellow-400 shadow-[0_0_10px_yellow]' : 'border-[#a67c52]'} rounded flex flex-col items-center pt-2 relative overflow-hidden cursor-pointer hover:bg-yellow-50 hover:scale-105 active:scale-95 transition-all`}>
                    <div style={{ width: 96, height: 160, backgroundImage: `url('/sprites/L${l}Fa.png')`, backgroundPosition: 'center', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', transform: 'scale(0.85)', transformOrigin: 'top center', marginBottom: '-10px' }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Center: Full Canvas Map */}
      <div className="relative w-full xl:flex-1 h-full bg-[#1a0f0a] border-4 border-[#8b5a2b] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden rounded-md flex items-center justify-center">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white z-10 flex-col">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mb-4"></div>
              <p className="text-xl font-bold">載入完美全景地圖中...</p>
            </div>
          )}
          <canvas 
            ref={canvasRef} 
            width={VIEW_W} 
            height={VIEW_H} 
            className="block outline-none w-full h-full object-contain" 
            tabIndex="0" 
            style={{ imageRendering: 'pixelated' }}
          />

          {/* Minimap Overlay */}
          <div className="absolute bottom-6 right-6 w-36 h-36 md:w-48 md:h-48 rounded-full border-4 border-[#8b5a2b] shadow-[0_0_20px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(0,0,0,0.5)] overflow-hidden z-20 bg-[#1a0f0a] pointer-events-none opacity-90 transition-opacity hover:opacity-100">
            <canvas ref={minimapCanvasRef} width={200} height={200} className="w-full h-full" style={{ imageRendering: 'pixelated' }} />
            {/* North Compass Pin */}
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-[#d4af37] font-black text-xs drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">N</div>
          </div>

          {/* 還原成原本的滿屏建築圖鑑 */}
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
                  {selectedBuilding.imageUrl ? (
                    <div className="w-full h-[400px] bg-black rounded-lg overflow-hidden border-2 border-[#8b5a2b] shadow-inner relative flex items-center justify-center group">
                      <img 
                        src={selectedBuilding.imageUrl} 
                        alt={selectedBuilding.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded text-white text-sm font-bold backdrop-blur-md border border-white/20">
                        📸 實景照片展示
                      </div>
                    </div>
                  ) : (
                    <div className="w-full min-h-[200px] bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] bg-[#e0cda5] rounded-lg p-6 border-2 border-[#8b5a2b] shadow-inner flex items-center justify-center">
                      <p className="text-xl text-[#3e2315] font-medium leading-loose text-center">
                        {selectedBuilding.description}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-6 flex gap-4">
                    {selectedBuilding.id === 'room_poi_door' && (
                      <button 
                        onClick={() => {
                          setSelectedBuilding(null);
                          keysRef.current.e = false;
                          setCurrentSceneId('ntut_campus');
                          setSystemMessage('✈️ 搭乘長榮航空前往台灣... 降落北科大！');
                        }}
                        className="px-8 py-3 bg-[#2e4a1b] hover:bg-[#3e6323] text-[#e8f4d1] font-bold text-xl rounded shadow-[0_4px_0_#1a2e10] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2"
                      >
                        ✈️ 前往台灣 (北科大校園)
                      </button>
                    )}
                    <button 
                      onClick={() => { setSelectedBuilding(null); keysRef.current.e = false; }}
                      className="px-8 py-3 bg-[#8b5a2b] hover:bg-[#a67c52] text-white font-bold text-xl rounded shadow-[0_4px_0_#5c3a18] active:translate-y-[4px] active:shadow-none transition-all"
                    >
                      關閉
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogueBox 
            dialogueState={dialogueState} 
            onComplete={(isQuest) => {
              const target = npcsRef.current.find(n => n.id === dialogueState.npc.id);
              if (target) {
                target.interacted = true;
                if (target.type === 11) {
                  // Door interaction! Switch scene
                  setIsFading(true);
                  setTimeout(() => {
                    if (currentSceneId === 'malaysia_room') {
                      unlockTitle('剛抵臺的冒險者');
                      setCurrentSceneId('ntut_campus');
                    } else {
                      setCurrentSceneId('malaysia_room');
                    }
                    setTimeout(() => setIsFading(false), 800);
                  }, 800);
                }
                if (target.type === 4) {
                   target.type = 1;
                   target.radius = 10;
                }
                if (target && target.type === 2) {
                  target.question = null; // Trivia answered
                }
              }
              setDialogueState(null);
              isDialogueOpenRef.current = false;
              keysRef.current = { w: false, a: false, s: false, d: false, e: false, shift: false };
            }} 
          />

          {!selectedBuilding && !isMapExpanded && imageLoaded && (
            <div className="absolute bottom-4 right-4 z-40 bg-white/10 p-1 rounded border-2 border-[#8b5a2b] shadow-lg backdrop-blur cursor-pointer hover:scale-105 transition-transform" onClick={() => setIsMapExpanded(true)}>
              <div className="relative w-48 bg-[#e0cda5] overflow-hidden border border-[#5c3a18]">
                <img src={MAP_DATA.imageUrl} alt="minimap" className="w-full h-auto block opacity-80" />
                <div 
                  className="absolute w-3 h-3 bg-red-600 rounded-full border-2 border-white shadow shadow-red-900/50 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                  style={{ left: `${playerPct.x}%`, top: `${playerPct.y}%` }}
                ></div>
              </div>
              <div className="text-center text-xs font-bold text-[#8b5a2b] mt-1 bg-[#f4e8d1] rounded">
                🗺️ 校園雷達 [按 M 放大]
              </div>
            </div>
          )}

          {/* 展開的大地圖 */}
          {isMapExpanded && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8 animate-in fade-in zoom-in duration-200" onClick={() => setIsMapExpanded(false)}>
              <div className="relative w-full max-w-5xl max-h-full bg-[#f4e8d1] border-4 border-[#8b5a2b] rounded-xl shadow-2xl p-4 overflow-y-auto flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                 <div className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold shadow-lg border-2 border-white hover:scale-110 transition-transform cursor-pointer z-50" onClick={() => setIsMapExpanded(false)}>
                   X
                 </div>
                 <h2 className="text-xl md:text-2xl font-black text-[#8b5a2b] mb-2 md:mb-4 shrink-0">🌍 {MAP_DATA.name} (全覽)</h2>
                 <div className="relative w-full flex-1 min-h-0 bg-[#e0cda5] border-2 border-[#5c3a18] overflow-hidden flex items-center justify-center">
                    <img src={MAP_DATA.imageUrl} alt="fullmap" className="max-w-full max-h-[60vh] object-contain" />
                    <div 
                      className="absolute w-6 h-6 bg-red-600 rounded-full border-4 border-white shadow-[0_0_15px_red] transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                      style={{ left: `${playerPct.x}%`, top: `${playerPct.y}%` }}
                    ></div>
                 </div>
                 <button 
                    onClick={(e) => { e.stopPropagation(); setIsMapExpanded(false); }}
                    className="mt-4 px-6 py-2 bg-[#8b5a2b] hover:bg-[#a67c52] text-white font-bold text-lg rounded shadow-[0_4px_0_#5c3a18] active:translate-y-[4px] active:shadow-none transition-all shrink-0"
                  >
                    關閉地圖
                  </button>
              </div>
            </div>
          )}

          {!isPoiEditMode && !isWallEditMode && (
            <div className="absolute bottom-4 left-4 bg-white/90 px-4 py-2 rounded-sm font-bold text-sm text-gray-800 border-2 border-black pointer-events-none shadow-lg flex items-center gap-4">
              <div>
                <p>▶ WASD / 方向鍵移動</p>
                <p className="mt-1 text-yellow-600">▶ 靠近發光地標按下 [E] 鍵調查</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Time Machine UI & Quests */}
        <div className="w-[320px] flex-shrink-0 flex flex-col gap-6 h-full">
          {/* Time Machine UI (Immersive RPG Style) */}
          <div className="w-full bg-[#2c1810] border-[6px] border-[#d4af37] p-5 rounded shadow-[0_0_30px_rgba(212,175,55,0.4)] flex flex-col items-center pointer-events-auto bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] bg-blend-overlay">
            <h2 className="text-[#d4af37] font-black tracking-widest mb-2 flex items-center gap-2 text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ fontFamily: 'serif' }}>
              ✨ 時 光 穿 梭 儀 ✨
            </h2>
            <div className="flex flex-col items-center mb-3 bg-[#1a0f0a] border-2 border-[#8b5a2b] rounded-sm shadow-inner p-2 w-full relative">
              <div className="text-xl font-black text-[#f4e8d1] tracking-wider mb-2" style={{ fontFamily: 'monospace' }}>
                {new Date(virtualTime).toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </div>
              
              <div className="flex gap-3 w-full justify-between mt-1">
                <div className="flex flex-col items-center bg-[#2c1a11] rounded-lg border border-[#8b5a2b]/50 p-1 flex-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
                  <span className="text-[10px] text-[#8b5a2b] font-black tracking-widest mb-1 pointer-events-none">天數校準</span>
                  <div className="flex items-center w-full justify-between px-1">
                    <button onClick={() => handleTimeAdjust(-86400000)} className="w-6 h-6 rounded-full bg-[#4a2e1b] border border-[#8b5a2b] text-[#d4af37] hover:bg-[#d4af37] hover:text-[#4a2e1b] font-black transition-all shadow-[0_2px_4px_rgba(0,0,0,0.5)] active:translate-y-0.5 flex items-center justify-center text-sm leading-none">-</button>
                    <span className="text-xs text-[#f4e8d1] font-bold mx-1">1 Day</span>
                    <button onClick={() => handleTimeAdjust(86400000)} className="w-6 h-6 rounded-full bg-[#4a2e1b] border border-[#8b5a2b] text-[#d4af37] hover:bg-[#d4af37] hover:text-[#4a2e1b] font-black transition-all shadow-[0_2px_4px_rgba(0,0,0,0.5)] active:translate-y-0.5 flex items-center justify-center text-sm leading-none">+</button>
                  </div>
                </div>

                <div className="flex flex-col items-center bg-[#2c1a11] rounded-lg border border-[#8b5a2b]/50 p-1 flex-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
                  <span className="text-[10px] text-[#8b5a2b] font-black tracking-widest mb-1 pointer-events-none">時辰微調</span>
                  <div className="flex items-center w-full justify-between px-1">
                    <button onClick={() => handleTimeAdjust(-3600000)} className="w-6 h-6 rounded-full bg-[#4a2e1b] border border-[#8b5a2b] text-[#d4af37] hover:bg-[#d4af37] hover:text-[#4a2e1b] font-black transition-all shadow-[0_2px_4px_rgba(0,0,0,0.5)] active:translate-y-0.5 flex items-center justify-center text-sm leading-none">-</button>
                    <span className="text-xs text-[#f4e8d1] font-bold mx-1">1 Hr</span>
                    <button onClick={() => handleTimeAdjust(3600000)} className="w-6 h-6 rounded-full bg-[#4a2e1b] border border-[#8b5a2b] text-[#d4af37] hover:bg-[#d4af37] hover:text-[#4a2e1b] font-black transition-all shadow-[0_2px_4px_rgba(0,0,0,0.5)] active:translate-y-0.5 flex items-center justify-center text-sm leading-none">+</button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Timeline Scrubber */}
            <div className="w-full mb-4 flex flex-col gap-1">
              <div className="flex justify-between text-[#d4af37] text-xs font-bold" style={{ fontFamily: 'serif' }}>
                <span>9月</span>
                <span>時空進度條</span>
                <span>6月</span>
              </div>
              <input 
                type="range" 
                min={new Date('2025-09-01T08:00:00+08:00').getTime()} 
                max={new Date('2026-06-30T18:00:00+08:00').getTime()} 
                value={virtualTime}
                onChange={(e) => {
                  const newTime = Number(e.target.value);
                  syncEventsWithTime(newTime);
                }}
                className="w-full h-2 bg-[#3e2723] rounded-lg appearance-none cursor-pointer border border-[#d4af37]"
                style={{
                  accentColor: '#d4af37'
                }}
              />
            </div>

            <div className="flex flex-col space-y-3 w-full">
              <button 
                className={`w-full py-2 font-black rounded-sm shadow-[0_0_10px_rgba(0,0,0,0.5)] border-2 transition-all text-lg ${isPlaying ? 'bg-[#8b0000] border-[#ff4500] text-[#ffddaa] hover:bg-[#a00000]' : 'bg-[#004d00] border-[#00ff00] text-[#aaffaa] hover:bg-[#006600]'}`}
                style={{ fontFamily: 'serif' }}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? '⏸ 封印時間' : '▶ 撥動時針 (1分鐘/秒)'}
              </button>
              
              <button
                className="w-full py-2 font-black rounded-sm shadow-[0_0_10px_rgba(0,0,0,0.5)] border-2 border-[#8b5a2b] bg-[#3e2723] hover:bg-[#5c3a18] text-[#d4af37] transition-all text-lg flex items-center justify-center gap-2"
                style={{ fontFamily: 'serif' }}
                onClick={() => setIsInventoryOpen(true)}
              >
                🎒 冒險者背包
              </button>
            </div>
          </div>

          {/* FFXIV Style Journal Button & Preview */}
          <div className="w-full bg-[#2c1810] border-4 border-[#5c3a18] p-4 rounded shadow-[0_0_15px_rgba(0,0,0,0.8)] relative flex flex-col bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] bg-blend-overlay">
            <h3 className="font-black text-[#d4af37] border-b-2 border-[#8b5a2b] pb-2 mb-3 text-lg flex items-center justify-between" style={{ fontFamily: 'serif' }}>
              <span>📜 任務手帳</span>
              <span className="text-xs bg-[#5c3a18] text-[#f4e8d1] px-2 py-0.5 rounded shadow-inner border border-[#3e2315]">
                完成度: {tmQuests.filter(q => q.status === 'completed').length}/{TIME_MACHINE_EVENTS.filter(e => e.detective_clue).length}
              </span>
            </h3>
            
            <div className="mb-5">
              <p className="text-xs text-[#a67c52] font-bold mb-1 tracking-wider">目前追蹤中的委託：</p>
              <div className="bg-[#1a0f0a] border-2 border-[#3e2315] p-3 rounded text-[#d4af37] font-bold text-sm shadow-inner flex items-center gap-2">
                {targetDestinationRef.current ? '✨ 循著金色足跡前進！' : '🔍 尚無追蹤中的委託'}
              </div>
            </div>

            <button
              onClick={() => setIsJournalOpen(true)}
              className="w-full py-4 bg-gradient-to-b from-[#8b5a2b] to-[#5c3a18] border-2 border-[#e0cda5] text-[#f4e8d1] font-black text-xl rounded shadow-[0_4px_0_#2c1810] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 drop-shadow-lg"
              style={{ fontFamily: 'serif' }}
            >
              📖 開啟手帳 (Journal)
            </button>
          </div>
        </div>


      {/* Backpack Modal */}
      <InventoryModal isOpen={isInventoryOpen} onClose={() => setIsInventoryOpen(false)} />

      {/* FFXIV Style Journal Modal */}
      <JournalModal 
        isOpen={isJournalOpen} 
        onClose={() => setIsJournalOpen(false)} 
        tmQuests={tmQuestsRef.current}
        currentSceneId={currentSceneId}
        onAcceptQuest={(eventId) => {
          const evt = TIME_MACHINE_EVENTS.find(e => e.id === eventId);
          const existingQuest = tmQuestsRef.current.find(q => q.id === eventId);
          if (evt) {
            if (existingQuest) existingQuest.status = 'active';
            else tmQuestsRef.current.push({ ...evt.quest, id: eventId, event: evt, status: 'active' });
            setTmQuests([...tmQuestsRef.current]);
            setSystemMessage(`📝 已承接委託：${evt.quest.title}`);
          }
        }}
        onTrackQuest={(evt) => {
          const evtStart = new Date(evt.timestamp).getTime();
          const evtEnd = evtStart + evt.duration_minutes * 60000;
          const isTimeMatch = virtualTimeRef.current >= evtStart && virtualTimeRef.current < evtEnd;

          if (isTimeMatch) {
            targetDestinationRef.current = { x: evt.x, y: evt.y };
            trackedEventIdRef.current = evt.id;
            targetPathRef.current = []; // Clear footprints for instant switch
            pathRecalcTimeRef.current = 0;
            setSystemMessage(`已標記目的地：${evt.quest.title}\n請循著金色腳印前進！`);
            setIsJournalOpen(false);
          } else {
            setSystemMessage(`【時空悖論警告】\n此任務於 ${new Date(evt.timestamp).toLocaleString()} 發生\n請使用上方的時空穿梭儀跳躍至正確的時間點！`);
          }
        }}
      />

      {/* Airplane Transition Overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-500">
           <div className="text-6xl animate-bounce mb-8">✈️</div>
           <div className="text-2xl text-white font-bold tracking-widest">{transitionText}</div>
           <div className="w-64 h-2 bg-gray-800 rounded-full mt-8 overflow-hidden relative">
             <div className="absolute top-0 bottom-0 left-0 bg-[#d4af37] w-full" style={{transformOrigin: 'left', animation: 'scaleX 2.5s ease-in-out forwards'}}></div>
             <style>{`
                @keyframes scaleX {
                   0% { transform: scaleX(0); }
                   100% { transform: scaleX(1); }
                }
             `}</style>
           </div>
        </div>
      )}
    </div>
  );
}
