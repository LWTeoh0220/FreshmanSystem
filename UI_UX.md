# UI/UX 設計系統 (RPG Gamification Design System)

本專案已全面捨棄傳統的「現代極簡商務風 (Modern Glassmorphism)」，轉而採用**「經典 RPG 沉浸式羊皮紙風格 (Classic RPG Parchment Style)」**。這不僅是視覺層面的翻新，更是將繁雜的行政手續包裝為「新手村冒險」的核心遊戲化策略。

## 🎨 核心色彩與視覺基調 (Color Palette & Visual Tone)
- **背景底紋 (Background)**：復古羊皮紙色系為主。
  - 主要底色：`#F4E8D1` (淡淡的羊皮紙黃)
  - 陰影與深色卡片：`#D2B48C` (棕褐色)
- **文字與強調色 (Typography & Accent)**：
  - 主文案：深褐色 `#4A3B32` (取代純黑，增加復古感)
  - 通關印章 (QUEST CLEAR)：復古朱紅色 `#D32F2F`
  - 任務進行中發光 (Active Glow)：魔法金 `#FFD700` 或 科技藍 `#007AFF` 混合魔法陣感。

## 🎮 遊戲化元件定義 (Gamified Components)

### 1. 玩家狀態列 (Player Status Bar)
- **位置**：全域導覽列 (Top Navbar)
- **內容**：顯示玩家等級 (`Lv.1 大馬萌新`)、資源 (`金幣: 0`)、行動力 (`體力: 100/100`) 以及 Q 版頭像。讓使用者登入即刻進入角色扮演狀態。

### 2. 任務卡片狀態 (Quest Cards)
- **已通關 (Cleared)**：卡片覆蓋淡淡的斜線網格 (Pattern)，並壓上巨大且半透明的傾斜紅色「QUEST CLEAR!」戳章。
- **進行中 (Active)**：卡片外框呈現動態發光 (Glow Effect) 或流光特效，強烈暗示「點擊我」。
- **鎖定中 (Locked)**：灰階顯示，圖示為「鎖頭 🔒」。解鎖後會變成「寶箱 🔓」或點亮的魔法水晶。
- **任務拓撲標籤**：做成掛在卡片上方的小緞帶 (Ribbon) 或封蠟章。

### 3. 動畫特效庫 (Animation Library)
本專案大量依賴以下 CSS 關鍵影格 (Keyframes) 來注入靈魂：
- `bounce-in-stagger`：頁面載入時，任務卡片依序由上往下微微彈跳淡入。
- `flow-light`：任務進度連線不再是死板的實線，而是帶有光點流動的虛線或能量線。
- `button-press`：3D 微立體按鈕 (如 `[ 開啟副本 ➔ ]`) 在被點擊 (:active) 時，會有真實的向下壓移物理回饋。

## 📖 冒險者手札 (Adventurer's Log)
專為「非必須支線任務」設計的模組。介面採用厚重的羊皮紙卷軸風格，左側為任務列表，右側為卷軸詳情。明確標示「🎒 必備道具」與「💎 任務獎勵」，完美還原經典 RPG 任務日誌的閱讀體驗。
