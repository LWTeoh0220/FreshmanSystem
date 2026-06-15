const fs = require('fs');

let content = fs.readFileSync('client/src/components/campus/CampusMap.jsx', 'utf8');

// 1. Imports
content = content.replace(
  "import { MAP_DATA, COLLISION_BOXES, BUILDING_POIS, HIDDEN_COLLECTIBLES } from './campusData';",
  "import { SCENES } from './campusData';"
);
content = content.replace(
  "import { findPath, hasLineOfSight } from './pathfinding';",
  "import { findPath, hasLineOfSight, buildGrid } from './pathfinding';"
);

// 2. State & Scene Init
content = content.replace(
  "const { activeAvatar, level, setLevel, setActiveAvatar, addReward, inventory, addInventoryItem, collectedHiddenItems, markHiddenItemCollected } = usePlayer();",
  `const { activeAvatar, level, setLevel, setActiveAvatar, addReward, inventory, addInventoryItem, collectedHiddenItems, markHiddenItemCollected, currentSceneId, setCurrentSceneId } = usePlayer();

  const currentScene = SCENES[currentSceneId] || SCENES['malaysia_room'];
  const MAP_DATA = currentScene;
  const COLLISION_BOXES = currentScene.collisions;
  const BUILDING_POIS = currentScene.pois;
  const HIDDEN_COLLECTIBLES = currentScene.collectibles;

  const [isFading, setIsFading] = useState(false);`
);

// 3. useEffect Split
// We need to find the `useEffect` starting around line 206
let effectStart = content.indexOf('useEffect(() => {', content.indexOf('audioRefs.current.night?.play()'));
let effectEnd = content.indexOf('  }, []);', effectStart) + 9;

let effectCode = content.substring(effectStart, effectEnd);

let newEffectCode = `
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
      img.src = \`/npcs/\${sheet}_transparent.png\`;
      img.onload = () => { npcImgRef.current[sheet] = img; checkAllLoaded(); };
      img.onerror = () => { console.error(\`Failed to load \${sheet}\`); checkAllLoaded(); };
    });

    charSpritesRef.current = {};
    const lvls = [1, 2, 3, 4];
    const genders = ['M', 'F'];
    const dirs = ['a', 'b', 'c', 'd'];
    lvls.forEach(l => {
      genders.forEach(g => {
        dirs.forEach(d => {
          const key = \`L\${l}\${g}\${d}\`;
          const img = new Image();
          img.src = \`/characters/\${key}.png\`;
          img.onload = () => { charSpritesRef.current[key] = img; checkAllLoaded(); };
          img.onerror = () => { console.error(\`Failed to load character \${key}\`); checkAllLoaded(); };
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
      pathRef.current = [];
    };
  }, [currentScene]);
`;

content = content.replace(effectCode, newEffectCode);

// 4. Update the render logic for the fade screen
// Around line 1290 return (
content = content.replace(
  '<div className="w-full h-full bg-transparent flex flex-col xl:flex-row relative font-sans overflow-hidden gap-4 p-4">',
  `<div className="w-full h-full bg-transparent flex flex-col xl:flex-row relative font-sans overflow-hidden gap-4 p-4">
      {isFading && (
        <div className="absolute inset-0 bg-black z-[200] animate-in fade-in duration-500 flex items-center justify-center">
          <div className="text-[#d4af37] text-2xl font-black flex items-center gap-4">
            <span className="animate-spin text-4xl">✈️</span> 穿越時空中...
          </div>
        </div>
      )}`
);

// 5. Update POI interaction logic (Line 1460ish)
const interactionLogic = `if (target.type === 4) {`;
const newInteractionLogic = `if (target.type === 11) {
                  // Door interaction! Switch scene
                  setIsFading(true);
                  setTimeout(() => {
                    setCurrentSceneId(currentSceneId === 'malaysia_room' ? 'ntut_campus' : 'malaysia_room');
                    setTimeout(() => setIsFading(false), 800);
                  }, 800);
                }
                if (target.type === 4) {`;
content = content.replace(interactionLogic, newInteractionLogic);


fs.writeFileSync('client/src/components/campus/CampusMap.jsx', content);
console.log("Patched CampusMap.jsx");
