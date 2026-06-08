# 任務說明：為 MY-NTUT Quest 製作 2D 像素校園地圖系統（精確比例版）

---

## 你需要上傳的圖片（按順序，共 6 張）

請在貼上這份 Prompt 之前，先上傳以下圖片：

1. **Google Maps 北段截圖**（比例尺 10m，顯示光華館、第六教學大樓、宏裕科技研究大樓、國父百年紀念館、化學工程館、生物科技館、分子科學與工程館）
2. **Google Maps 主校區西側截圖**（比例尺 20m，顯示土木館、材資館、第一/二教學大樓、化學館、紅樓、第三/四教學大樓、校史館、共同科館、行政大樓、圖書館）
3. **Google Maps 主校區東側截圖**（比例尺 20m，顯示學生活動中心、綜合科館 ITC、電機工程系）
4. **Google Maps 全校區截圖**（比例尺 50m，顯示東校區宿舍、運動場、億光大樓）
5. **官方校園平面圖**（色塊分區版，有道路和建築中文名稱）
6. **現有網頁截圖**（首頁，顯示 RPG 羊皮紙風格）

---

## 專案背景

這是「MY-NTUT Quest：大馬新生跨國生存與破關導航系統」的 React + Vite 前端專題。整體風格是**經典 RPG 羊皮紙沉浸式**，主色是牛皮紙色系（`#F4E8D1`、`#D2B48C`、`#8b5a2b`），已有完整的 `PlayerContext`（管理 HP/XP/金幣/等級）、任務 DAG、Min-Heap 死線看板、成就牆等功能。

現在要**完全替換**現有的 `/3d-campus` 路由（Three.js 空殼），改成 2D 像素俯視校園地圖遊戲。

---

## 精確比例系統（從 Google Maps 比例尺計算）

| 參數 | 數值 | 說明 |
|------|------|------|
| 現實比例 | 1 格 = 4 公尺 | 由比例尺量測 |
| 渲染解析度 | 1 格 = 16 px | Canvas 渲染大小 |
| 地圖總格數 | **160 格（東西）× 90 格（南北）** | 對應校園約 640m × 360m |
| Canvas 虛擬尺寸 | 2560 × 1440 px | 使用 camera offset 實現捲動 |
| 畫面顯示視窗 | 約 75 × 45 格 | 1200px 寬度的顯示區域 |

---

## 地圖座標系

```
(0,0) ─────────────────── X → (東方向)
  │  八德路二段（北）
  │  新生南路（西邊界）          建國南路（東西分隔，x=105）
  Y  
  ↓（南方向）
(y=90) 忠孝東路三段（南）
```

**關鍵對齊點：**
- 新生南路側門：`x=3, y=38`
- 正校門（忠孝東路正門）：`x=64, y=85`
- 建國南路側門：`x=105, y=38`
- 八德路北界：`y=0`
- 忠孝東路南界：`y=86`
- 建國南路：`x=105 ~ x=110`

---

## 完整建築座標表（嚴格按照 Google Maps 比例尺計算）

每格 = 4 公尺現實距離。所有尺寸均從比例尺量測換算。

```javascript
// campusData.js
export const BUILDINGS = [
  // ─── 北段（八德路沿線，新生側門以北）───
  { id:'guanghua',   name:'光華館',           x:2,  y:4,  w:11, h:9,  color:'#b8d4a8', category:'academic', floors:[] },
  { id:'sunyat',     name:'國父百年紀念館',    x:2,  y:14, w:11, h:6,  color:'#d8c898', category:'heritage', floors:[] },
  { id:'hongyu',     name:'宏裕科技研究大樓',  x:15, y:2,  w:14, h:10, color:'#b8c8d8', category:'research', floors:[] },
  { id:'b6',         name:'第六教學大樓',      x:15, y:13, w:14, h:12, color:'#c8b8d8', category:'academic', floors:[] },
  { id:'biotech',    name:'生物科技館(五館)',  x:31, y:2,  w:9,  h:6,  color:'#a8d8b8', category:'academic', floors:[] },
  { id:'chem_eng',   name:'化學工程館',        x:31, y:10, w:10, h:8,  color:'#a8c8d8', category:'academic', floors:[] },
  { id:'molecular',  name:'分子科學與工程館',  x:43, y:4,  w:12, h:8,  color:'#c8d8a8', category:'academic', floors:[] },

  // ─── 主校區西側核心（新生側門以南）───
  { id:'civil',      name:'土木館',            x:2,  y:27, w:9,  h:8,  color:'#d8b8a8', category:'academic', floors:[] },
  { id:'material',   name:'材資館',            x:2,  y:37, w:11, h:9,  color:'#c8a898', category:'academic', floors:[] },
  { id:'design',     name:'設計館',            x:2,  y:52, w:10, h:9,  color:'#e8b878', category:'academic', floors:[] },
  { id:'b4',         name:'第四教學大樓',      x:14, y:32, w:9,  h:10, color:'#c8b8d8', category:'academic', floors:[] },
  { id:'b1',         name:'第一教學大樓',      x:25, y:25, w:11, h:6,  color:'#c8b8d8', category:'academic', floors:[] },
  { id:'b2',         name:'第二教學大樓',      x:38, y:25, w:12, h:6,  color:'#c8b8d8', category:'academic', floors:[] },
  { id:'chem',       name:'化學館',            x:52, y:25, w:8,  h:8,  color:'#b8c8d8', category:'academic', floors:[] },
  { id:'redhouse',   name:'紅樓',              x:46, y:32, w:5,  h:4,  color:'#e87878', category:'heritage', floors:[] },
  { id:'history',    name:'校史館',            x:25, y:33, w:8,  h:6,  color:'#d8c898', category:'heritage', floors:[] },
  { id:'b3',         name:'第三教學大樓',      x:30, y:40, w:16, h:11, color:'#c8b8d8', category:'academic', floors:[] },
  { id:'library',    name:'圖書館',            x:48, y:38, w:15, h:11, color:'#a8b8e8', category:'facility', floors:[] },
  { id:'admin',      name:'行政大樓',          x:48, y:50, w:14, h:10, color:'#f0c870', category:'admin',    floors:[] },
  { id:'common',     name:'共同科館',          x:25, y:55, w:14, h:8,  color:'#b8d8c8', category:'academic', floors:[] },
  { id:'arts',       name:'藝文中心',          x:40, y:57, w:6,  h:5,  color:'#e8d878', category:'facility', floors:[] },

  // ─── 主校區東側（綜合科館、學生活動中心）───
  { id:'activity',   name:'學生活動中心',      x:65, y:16, w:15, h:9,  color:'#d8a8c8', category:'facility', floors:[] },
  { id:'itc',        name:'綜合科館(ITC)',     x:65, y:27, w:19, h:15, color:'#88a8d8', category:'academic', floors:[] },

  // ─── 東校區（建國南路右側）───
  { id:'dorm_a',     name:'學生宿舍(東A)',     x:112,y:4,  w:12, h:8,  color:'#c8d8f8', category:'dorm',    floors:[] },
  { id:'dorm_b',     name:'學生宿舍(東B)',     x:126,y:4,  w:8,  h:8,  color:'#c8d8f8', category:'dorm',    floors:[] },
  { id:'basketball', name:'籃球場',            x:112,y:14, w:12, h:8,  color:'#90d860', category:'sports',  floors:[] },
  { id:'volleyball', name:'排球場',            x:126,y:14, w:9,  h:6,  color:'#90d860', category:'sports',  floors:[] },
  { id:'stadium',    name:'學生運動場',        x:110,y:30, w:28, h:20, color:'#5aaa30', category:'sports',  floors:[] },
  { id:'yiguang',    name:'億光大樓',          x:112,y:56, w:14, h:10, color:'#c8d8b8', category:'facility',floors:[] },

  // ─── 校外建築（忠孝東路對面）───
  { id:'pioneer',    name:'先鋒國際研發大樓',  x:28, y:80, w:16, h:9,  color:'#d8c8b8', category:'external',floors:[] },
];
```

---

## Tile 類型定義

```javascript
// campusData.js
export const TILE = {
  GRASS:    0,  // 草地    #5a9e3a
  ROAD:     1,  // 主幹道  #787060
  CAMPUS_ROAD: 2, // 校內路 #c0b898
  SIDEWALK: 3,  // 人行道  #d8d0b0
  BUILDING: 4,  // 建築（不可走）
  ENTRANCE: 5,  // 建築入口（可走，觸發互動）
  TREE:     6,  // 樹（不可走）#2d7a1a
  PLAZA:    7,  // 廣場地磚 #e8d8b0
  SPORTS:   8,  // 運動場草皮 #5aaa30
  WATER:    9,  // 水景   #4a90d9
  WALL:    10,  // 圍牆邊界（不可走）
};

export const TILE_COLORS = {
  0: '#5a9e3a',
  1: '#787060',
  2: '#c0b898',
  3: '#d8d0b0',
  4: '#8b7355',  // 建築預設色（會被 BUILDINGS 覆蓋）
  5: '#c07840',
  6: '#2d7a1a',
  7: '#e8d8b0',
  8: '#5aaa30',
  9: '#4a90d9',
  10: '#5a3010',
};
```

---

## 地圖生成邏輯

不要手寫 160×90 的二維陣列。改用**程序化生成**：

```javascript
// campusData.js
export function generateMap() {
  // 1. 初始化全圖為草地
  const map = Array.from({ length: 90 }, () => new Array(160).fill(TILE.GRASS));

  // 2. 填入校外主幹道
  fillRect(map, 0, 0, 160, 3, TILE.ROAD);    // 八德路（北）
  fillRect(map, 0, 86, 160, 4, TILE.ROAD);   // 忠孝東路（南）
  fillRect(map, 0, 0, 3, 90, TILE.ROAD);     // 新生南路（西）
  fillRect(map, 105, 0, 5, 90, TILE.ROAD);   // 建國南路（中）

  // 3. 填入校內道路
  fillRect(map, 3, 22, 103, 3, TILE.CAMPUS_ROAD);  // 北橫道
  fillRect(map, 3, 36, 103, 3, TILE.CAMPUS_ROAD);  // 中橫道
  fillRect(map, 3, 52, 62, 3, TILE.CAMPUS_ROAD);   // 南橫道
  fillRect(map, 63, 22, 3, 64, TILE.CAMPUS_ROAD);  // 中縱道

  // 4. 填入廣場（正門區）
  fillRect(map, 55, 68, 20, 18, TILE.PLAZA);

  // 5. 根據 BUILDINGS 填入建築格子
  BUILDINGS.forEach(b => {
    fillRect(map, b.x, b.y, b.w, b.h, TILE.BUILDING);
    // 每棟建築南側中央設置入口
    const entranceX = b.x + Math.floor(b.w / 2);
    const entranceY = b.y + b.h;
    if (entranceY < 90) map[entranceY][entranceX] = TILE.ENTRANCE;
  });

  // 6. 補充樹木（道路和建築之間的綠化帶）
  // 沿八德路內側種樹（y=3~5 的部分位置）
  for (let x = 5; x < 100; x += 4) {
    if (map[4][x] === TILE.GRASS) map[4][x] = TILE.TREE;
    if (map[3][x] === TILE.GRASS) map[3][x] = TILE.TREE;
  }

  return map;
}

function fillRect(map, x, y, w, h, tileType) {
  for (let row = y; row < y + h && row < 90; row++) {
    for (let col = x; col < x + w && col < 160; col++) {
      map[row][col] = tileType;
    }
  }
}
```

---

## CampusMap.jsx 組件規格

### 檔案位置
```
src/components/campus/CampusMap.jsx
src/components/campus/CampusBattle.jsx
src/components/campus/campusData.js
src/pages/CampusMapPage.jsx
```

### CampusMap.jsx 核心結構

```jsx
import { useRef, useEffect, useCallback, useState } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import { BUILDINGS, NPCS, generateMap, TILE, TILE_COLORS } from './campusData';
import CampusBattle from './CampusBattle';

const TILE_SIZE = 16;
const MAP_W = 160;
const MAP_H = 90;
const VIEW_W = 1200; // 顯示視窗寬（px）
const VIEW_H = 620;  // 顯示視窗高（px）

export default function CampusMap() {
  const canvasRef = useRef(null);
  const { addXP, addCoins, updateHP } = usePlayer(); // ⚠️ 請先確認你的 PlayerContext 函數名稱
  const [battle, setBattle] = useState(null);  // null = 無戰鬥，{npc} = 進行戰鬥
  const [nearNPC, setNearNPC] = useState(null);

  const player = useRef({ px: 64*TILE_SIZE, py: 42*TILE_SIZE }); // 正校門附近初始位置
  const keys = useRef({});
  const camera = useRef({ x: 0, y: 0 });
  const mapData = useRef(generateMap());

  // Game loop、碰撞偵測、渲染邏輯...（見下方詳細說明）
}
```

### 渲染管線

```javascript
function render(ctx, map, cam, playerPos, npcs) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);

  // 計算可見格子範圍（只渲染視窗內的格子，節省效能）
  const startCol = Math.floor(cam.x / TILE_SIZE);
  const startRow = Math.floor(cam.y / TILE_SIZE);
  const endCol = Math.min(MAP_W, startCol + Math.ceil(VIEW_W / TILE_SIZE) + 1);
  const endRow = Math.min(MAP_H, startRow + Math.ceil(VIEW_H / TILE_SIZE) + 1);

  // 渲染底層 Tile
  for (let r = startRow; r < endRow; r++) {
    for (let c = startCol; c < endCol; c++) {
      const tileType = map[r][c];
      ctx.fillStyle = TILE_COLORS[tileType];
      ctx.fillRect(c*TILE_SIZE - cam.x, r*TILE_SIZE - cam.y, TILE_SIZE, TILE_SIZE);
    }
  }

  // 渲染建築（用各自的 color 覆蓋）
  BUILDINGS.forEach(b => {
    const screenX = b.x * TILE_SIZE - cam.x;
    const screenY = b.y * TILE_SIZE - cam.y;
    if (screenX > -b.w*TILE_SIZE && screenX < VIEW_W &&
        screenY > -b.h*TILE_SIZE && screenY < VIEW_H) {
      // 建築本體
      ctx.fillStyle = b.color;
      ctx.fillRect(screenX, screenY, b.w*TILE_SIZE, b.h*TILE_SIZE);
      // 建築輪廓
      ctx.strokeStyle = '#8b5a2b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX+0.5, screenY+0.5, b.w*TILE_SIZE-1, b.h*TILE_SIZE-1);
      // 建築名稱標籤（玩家靠近時才顯示，或建築夠大時顯示）
      if (b.w >= 8) {
        ctx.fillStyle = 'rgba(244,232,209,0.92)';
        const labelW = b.name.length * 12 + 8;
        const labelX = screenX + b.w*TILE_SIZE/2 - labelW/2;
        const labelY = screenY + b.h*TILE_SIZE/2 - 8;
        ctx.fillRect(labelX, labelY, labelW, 18);
        ctx.fillStyle = '#4A3B32';
        ctx.font = '11px "Noto Sans TC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.name, screenX + b.w*TILE_SIZE/2, screenY + b.h*TILE_SIZE/2 + 4);
      }
    }
  });

  // 渲染 NPC（閃爍金色邊框）
  NPCS.forEach(npc => {
    const screenX = npc.x * TILE_SIZE - cam.x;
    const screenY = npc.y * TILE_SIZE - cam.y;
    if (screenX > -32 && screenX < VIEW_W && screenY > -32 && screenY < VIEW_H) {
      ctx.font = '18px serif';
      ctx.textAlign = 'center';
      ctx.fillText(npc.emoji, screenX + 8, screenY + 16);
    }
  });

  // 渲染玩家（中心固定在視窗中央）
  const px = VIEW_W / 2;
  const py = VIEW_H / 2;
  ctx.font = '20px serif';
  ctx.textAlign = 'center';
  ctx.fillText('🧑‍🎓', px, py + 8);
}
```

### 相機跟隨

```javascript
function updateCamera(playerPx, playerPy, cam) {
  // 玩家保持在畫面中央
  cam.x = Math.max(0, Math.min(MAP_W*TILE_SIZE - VIEW_W,
    playerPx - VIEW_W/2));
  cam.y = Math.max(0, Math.min(MAP_H*TILE_SIZE - VIEW_H,
    playerPy - VIEW_H/2));
}
```

### 碰撞偵測

```javascript
function isWalkable(map, tileX, tileY) {
  if (tileX < 0 || tileY < 0 || tileX >= MAP_W || tileY >= MAP_H) return false;
  const t = map[tileY][tileX];
  return t !== TILE.BUILDING && t !== TILE.TREE && t !== TILE.WALL && t !== TILE.ROAD;
}

// 移動時檢查玩家四個角落
function tryMove(map, px, py, dx, dy, speed) {
  const margin = 6; // 玩家碰撞盒縮小（px）
  const nx = px + dx * speed;
  const ny = py + dy * speed;
  const corners = [
    [nx + margin, ny + margin],
    [nx + TILE_SIZE - margin, ny + margin],
    [nx + margin, ny + TILE_SIZE - margin],
    [nx + TILE_SIZE - margin, ny + TILE_SIZE - margin],
  ];
  const canMove = corners.every(([cx, cy]) =>
    isWalkable(map, Math.floor(cx / TILE_SIZE), Math.floor(cy / TILE_SIZE))
  );
  return canMove ? { x: nx, y: ny } : { x: px, y: py };
}
```

---

## NPC 資料

```javascript
// campusData.js
export const NPCS = [
  {
    id: 'registrar',
    name: '教務處承辦員',
    emoji: '👩‍💼',
    buildingId: 'admin',
    x: 52, y: 58,
    questType: 'registration',
    battleData: { level: 'Lv.3 文書達人', hp: 60, maxHp: 60, xpReward: 30, coinReward: 15 }
  },
  {
    id: 'intl_staff',
    name: '國際處承辦員',
    emoji: '🌏',
    buildingId: 'admin',
    x: 55, y: 52,
    questType: 'arc_visa',
    battleData: { level: 'Lv.4 居留達人', hp: 80, maxHp: 80, xpReward: 40, coinReward: 20 }
  },
  {
    id: 'dorm_mgr',
    name: '宿舍管理員',
    emoji: '🏠',
    buildingId: 'dorm_a',
    x: 115, y: 9,
    questType: 'dormitory',
    battleData: { level: 'Lv.2 宿舍守衛', hp: 40, maxHp: 40, xpReward: 20, coinReward: 10 }
  },
  {
    id: 'senior_cs',
    name: '資工學長',
    emoji: '🧑‍💻',
    buildingId: 'library',
    x: 53, y: 43,
    questType: 'data_structure',
    battleData: { level: 'Lv.5 演算法大師', hp: 100, maxHp: 100, xpReward: 50, coinReward: 25 }
  },
  {
    id: 'canteen_auntie',
    name: '餐廳阿姨',
    emoji: '🍜',
    buildingId: 'common',
    x: 28, y: 59,
    questType: 'daily_life',
    battleData: { level: 'Lv.1 美食守門人', hp: 30, maxHp: 30, xpReward: 15, coinReward: 8 }
  },
  {
    id: 'student_a',
    name: '迷路的學妹',
    emoji: '🙋‍♀️',
    buildingId: null,
    x: 40, y: 37,
    questType: 'campus_trivia',
    battleData: { level: 'Lv.1 新鮮人', hp: 25, maxHp: 25, xpReward: 12, coinReward: 6 }
  },
  {
    id: 'student_b',
    name: '趕時間的學長',
    emoji: '🏃‍♂️',
    buildingId: null,
    x: 64, y: 37,
    questType: 'campus_trivia',
    battleData: { level: 'Lv.2 大三老手', hp: 35, maxHp: 35, xpReward: 18, coinReward: 9 }
  },
];
```

---

## 問答題庫

```javascript
// campusData.js
export const QUESTION_SETS = {
  registration: {
    label: '教務處關卡',
    questions: [
      { q:'北科大加退選期間通常在開學後幾週內？', choices:['第1天','1~2週內','期中考後','學期末'], ans:1 },
      { q:'辦理 ARC 居留證前必須先取得？', choices:['宿舍合約','入學簽證（學生簽）','銀行存摺','體檢報告'], ans:1 },
      { q:'成績單申請需要去哪個處室？', choices:['學務處','國際處','教務處','總務處'], ans:2 },
      { q:'北科大的學生入口網站名稱為？', choices:['MyNTUT','NPortal','北科雲','學生e站'], ans:1 },
    ]
  },
  arc_visa: {
    label: '國際處關卡',
    questions: [
      { q:'馬來西亞學生來台就讀需要辦理哪種簽證？', choices:['觀光簽','居留簽證（學生）','工作簽','落地簽'], ans:1 },
      { q:'ARC（外僑居留證）入境後最晚幾天內申請？', choices:['7天','15天','30天','60天'], ans:2 },
      { q:'辦理 ARC 需要前往哪個機關？', choices:['教務處','移民署','戶政事務所','外交部'], ans:1 },
      { q:'持有 ARC 後可合法打工每週上限幾小時？', choices:['不能打工','16小時','20小時','無上限'], ans:2 },
    ]
  },
  dormitory: {
    label: '宿舍關卡',
    questions: [
      { q:'宿舍緊急報修應找誰？', choices:['班導師','宿舍管理員/舍監','學生會','教務處'], ans:1 },
      { q:'宿舍通常明令禁止的是？', choices:['使用筆電','攜帶電鍋等電熱器具','貼海報','開窗'], ans:1 },
      { q:'東校區最近的捷運站出口是？', choices:['忠孝新生站3號','忠孝新生站4號','忠孝復興站','善導寺站'], ans:1 },
    ]
  },
  data_structure: {
    label: '資料結構關卡',
    questions: [
      { q:'本系統任務依賴關係使用哪種資料結構？', choices:['Stack','Queue','DAG（有向無環圖）','Binary Tree'], ans:2 },
      { q:'Min-Heap 找出 N 個任務中最緊急一個，時間複雜度？', choices:['O(N)','O(N²)','O(log N)','O(1)'], ans:2 },
      { q:'LocalStorage 的資料格式限制？', choices:['只能存數字','只能存字串（需 JSON.stringify）','可存任意物件','可存 Binary'], ans:1 },
      { q:'DAG 中 In-degree 為 0 的節點代表？', choices:['已完成的任務','無前置條件的任務','錯誤節點','葉節點'], ans:1 },
    ]
  },
  daily_life: {
    label: '生活常識關卡',
    questions: [
      { q:'台灣「自助餐」通常怎麼計費？', choices:['固定套餐','依菜色件數','依重量','吃到飽'], ans:1 },
      { q:'台灣便利商店要加熱便當需要？', choices:['直接帶走','請店員微波','自己找微波爐','不能加熱'], ans:1 },
      { q:'台灣最通用的無現金支付？', choices:['支付寶','Line Pay / 街口支付','Apple Pay','馬幣'], ans:1 },
    ]
  },
  campus_trivia: {
    label: '校園常識關卡',
    questions: [
      { q:'北科大正門面向哪條路？', choices:['新生南路','建國南路','忠孝東路','八德路'], ans:2 },
      { q:'北科大最近的捷運站？', choices:['忠孝復興站','忠孝新生站','南京三民站','善導寺站'], ans:1 },
      { q:'北科大建校於哪一年？', choices:['1912年','1956年','1972年','1988年'], ans:0 },
      { q:'圖書館在校園哪個位置？', choices:['西側靠新生南路','正門右側中央','東校區','北側八德路旁'], ans:1 },
    ]
  },
};
```

---

## CampusBattle.jsx 規格

戰鬥介面使用 `createPortal` 渲染到 `document.body`，z-index: 9999。

```jsx
// 視覺風格對應現有 RPG 主題
// 背景：rgba(26, 18, 8, 0.95)（極深棕，與現有 Modal 一致）
// 邊框：#8b6914（品牌金棕色）
// 問題文字：#f4e8c1
// 正確答案：#2ecc71 邊框
// 錯誤答案：#e74c3c 邊框
// 按鈕：#2d1f0a 背景，#f4c842 文字
```

戰鬥結束後回調：
```javascript
function onBattleEnd(won, npc) {
  if (won) {
    addXP(npc.battleData.xpReward);
    addCoins(npc.battleData.coinReward);
  } else {
    // 扣血（確認 PlayerContext 的函數名稱）
    updateHP(-10);
  }
  setBattle(null);
}
```

---

## HUD 組件

右上角小地圖（縮略圖）：
```javascript
// 用第二個小 Canvas 渲染 160×90 的縮略地圖
// 每格縮為 3px
// 玩家位置用紅點標示
// 尺寸：480×270 px → 縮到 160×90 px（縮放 1/3）
```

左下角操作提示：
```
WASD / 方向鍵 移動   E 互動   M 顯示大地圖
```

靠近 NPC 時顯示：
```
按 E 與 [NPC名稱] 互動
```（金色，有閃爍動畫）

---

## 路由替換方式

```jsx
// App.jsx 或路由設定檔
// 舊：<Route path="/3d-campus" element={<ThreeDCampus />} />
// 新：<Route path="/3d-campus" element={<CampusMapPage />} />
```

Navbar 按鈕文字：「3D 校園 (MVP)」→「🗺 2D 校園地圖」

---

## 第一階段完成標準

- [x] Canvas 地圖正確渲染，建築顏色和大小符合比例
- [x] WASD 移動順暢，鏡頭跟隨
- [x] 建築碰撞正確（不能穿越）
- [x] 靠近 NPC 出現互動提示（金色閃爍）
- [x] 按 E 觸發問答戰鬥
- [x] 答題有視覺反饋（HP 條）
- [x] 戰鬥勝利後 XP 和金幣同步到 PlayerContext
- [x] Navbar 狀態列即時更新
- [x] 建築名稱標籤可見
- [x] 整體配色符合羊皮紙 RPG 主題
- [x] 右上角小地圖顯示玩家位置

---

## ⚠️ 重要注意事項

1. **先讀 `PlayerContext.jsx`**，確認 `addXP`、`addCoins`、扣血的函數名稱，再整合
2. **不要破壞任何現有組件**，只新增檔案 + 修改路由 + 修改 Navbar 一個字串
3. **不要引入任何新 npm 套件**，只用 React 18 + Canvas API + Tailwind
4. **地圖資料全部放在 `campusData.js`**，組件只做渲染和邏輯
5. **程序化生成地圖**（用 `generateMap()` 函數），不要手寫二維陣列
6. 第二至四階段（室內地圖）**不在本次範圍內**，只需在 BUILDINGS 預留 `floors: []` 欄位

