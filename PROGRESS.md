# MY-NTUT Quest 大馬新生跨國生存與破關導航系統
**專案開發進度與核心技術實作白皮書**

本文件詳細記錄了「MY-NTUT Quest」系統的開發歷程、所有核心系統的功能表現，以及支撐這些功能的底層前端技術細節。

---

## 1. 系統架構與技術棧 (Architecture & Tech Stack)
- **核心框架**：React 18 (使用 JSX 語法進行元件化開發)
- **建置工具**：Vite (提供極速的 HMR 熱更新與模組打包)
- **樣式引擎**：Tailwind CSS (全面採用 Utility-First 開發，大量依賴 JIT 模式的 Arbitrary Values `[]` 進行微調)
- **狀態管理**：React Context API (`PlayerContext`) 搭配 `localStorage` 進行純前端的資料持久化，達成「免登入即可記憶狀態」的無伺服器架構。
- **圖示庫**：Lucide React (提供高質感的 SVG 向量圖標)

---

## 2. 核心模組與技術實作 (Core Systems & Technical Implementation)

### 2.1 玩家狀態與成長中樞 (Player Context & Progression)
- **功能描述**：管理玩家的 HP、MP、XP、金幣、等級、稱號、陣營與已解鎖的裝備（頭像），並負責所有資產的增減邏輯。
- **技術實作**：
  - 在 `src/contexts/PlayerContext.jsx` 中建立全域 Context。
  - 使用 `useEffect` 在元件掛載時從 `localStorage` 讀取 JSON 字串並解析（`JSON.parse`）還原狀態。
  - 透過監聽所有 state 的依賴陣列（Dependency Array），只要數值發生變動，便會同步執行 `localStorage.setItem`，達成毫秒級的無縫存檔。
  - **升級演算法**：設計了 `checkLevelUp` 遞迴檢查機制，當 XP 溢出 100 時，會自動晉升 Level，扣除 100 XP 並觸發升級動畫狀態 (`isLevelingUp`)。

### 2.2 雙欄黃金首頁排版 (Dual-Column Dashboard Layout)
- **功能描述**：首頁下方切分為高效率的雙欄戰情室，左側為「免登入處室狀態看板」（佔比 55%），右側為「任務死線戰情室」（佔比 45%）。
- **技術實作**：
  - 嚴格遵守 Flexbox 佈局 (`flex`, `w-[55%]`, `w-[45%]`) 確保兩側高度 100% 一致。
  - 邊緣與卡片背景大量使用帶有透明度的吉卜力羊皮紙色系 (`bg-[#f4e8d1]`, `bg-[#e0cda5]/30`) 與內陰影 (`shadow-inner`) 來營造古典冒險公會的紙質沈浸感。

### 2.3 任務死線戰情室 (Min-Heap Deadline Manager)
- **功能描述**：將最緊急的前瞻任務（入學居留、海外預檢、行李物資）以列表排列。最緊急的卡牌外框會亮起暗紅色呼吸燈，與死線即時連動。
- **技術實作**：
  - 捨棄了繁雜的甘特圖，改為直覺的「Min-Heap 優先權佇列」概念（視覺上的緊湊垂直列表）。
  - 對於最緊急的項目（小於 3 天的死線），套用自訂的 Tailwind 動畫 `animate-[pulse_3s_ease-in-out_infinite]` 搭配紅色陰影 `shadow-[0_0_15px_rgba(220,38,38,0.6)]`，營造出壓迫感與警示效果。

### 2.4 大馬萌新・在台扎根世界樹 (Yggdrasil Universe Modal)
- **功能描述**：全站的終極視覺化戰情室。以宇宙星空為背景，中央生長著一棵古典巨樹。樹幹上生長著五顆代表任務的「魔法結晶」。
- **技術實作**：
  - **Portal 渲染**：為了避免被首頁複雜的 z-index 堆疊層級困住，使用了 React 的 `createPortal` 搭配 `z-[999999]`，將整座世界樹強行渲染到最頂層。
  - **動漫蓬鬆樹冠 (Bug Fix)**：嚴格設定 `border-0`，並採用深色內陰影 (`shadow-inner`) 取代原本的黑色實線邊框，成功消除扁平塑料感，打造出立體、柔軟的樹冠。
  - **SVG 絕對坐標系**：利用 `<svg viewBox="0 0 100 100">` 建立相對比例的坐標系，並使用 `M` 與 `C` (Bézier 曲線) 繪製巨樹的剪影輪廓與能量光流。
  - **光流動畫 (Stroke Dash)**：透過 `stroke-dasharray` 與 `stroke-dashoffset` 配合 CSS `@keyframes` 動畫，實作出能量順著樹枝向外流動的視覺特效。
  - **平滑閉環退出**：實作 `isClosing` 的 State。點擊關閉時，先將 `isClosing` 設為 true 觸發 `scale-95 opacity-0` 的 CSS 過渡，並利用 `setTimeout` 在 700ms 後才真正 Unmount 元件。

### 2.5 遠古秘典與動態書頁 (Grand Almanac Guidebook)
- **功能描述**：收錄所有繁雜行政手續的攻略百科。具備左側目錄與右側內容的翻書體驗。
- **技術實作**：
  - 透過 `mix-blend-multiply` 與線性漸層 (`linear-gradient`)，在畫面的中軸線與左右兩側繪製出極其逼真的「書本裝訂陰影」與「書頁微捲曲效果」。
  - 使用 `overflow-y-auto` 搭配自訂的 `custom-scrollbar`，確保長篇文字（如：行李打包指南、工作許可證天書）能夠平滑滾動，且不破壞書本邊界。

### 2.6 夜間護眼點燈系統 (Eye Care Amber Filter)
- **功能描述**：點擊導覽列左上角的提燈按鈕，全網頁會平滑地切換至吉卜力風格的深夜暖色調，大幅降低白色背景的刺眼感。
- **技術實作 (封神級調校)**：
  - **排版防擠壓**：導覽列按鈕採用 `shrink-0` 與 `whitespace-nowrap`，確保提燈按鈕與其他選單按鈕在各種螢幕尺寸下，都不會因為空間擠壓而變形。
  - **絕對頂層結界**：使用 `createPortal(..., document.body)` 搭配極限層級 `zIndex: 2147483647`，保證遮罩絕對覆蓋在包含 Navbar 與 Modal 在內的所有元素之上。
  - **物理級濾鏡**：捨棄了不穩定的 Tailwind 縮寫，直接注入純 CSS。採用 `backgroundColor: 'rgba(15, 5, 0, 0.5)'` 進行強勢的物理降光，並配合 `backdropFilter: 'brightness(60%) sepia(40%)'` 與 `mixBlendMode: 'multiply'`，精準實現暗棕色的沉浸式深夜感。

---

## 3. 開發里程碑與總結 (Milestones & Conclusion)
本專案已成功從傳統、死板的「學校公文系統」進化為一套具備 **JRPG 史詩感、視覺回饋豐富、且具有高度實用價值** 的新生導航 Web App。
透過大量的 CSS 特效、SVG 幾何繪圖、以及精準的前端狀態控制，我們不僅解決了新生閱讀大量文字的痛苦，更創造了沉浸式的「遊戲化 (Gamification)」體驗。目前的系統狀態已達至 **1.0 究極完全體**。
