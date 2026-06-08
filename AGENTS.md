# AGENTS.md

## Project Overview
本專案是「MY-NTUT Quest：大馬新生跨國生存與破關導航系統」的前端全端應用 Demo。
目標是做出一個可以在瀏覽器中打開的動態網站，展示：
- 階層式任務拓撲圖 (Macro & Micro DAG)
- 任務死線戰情室 (Min-Heap Priority Queue)
- 3D 校園室內外導航 (Three.js Low-poly)
- 遊戲化成就進度樹 (Minecraft-style Advancements)
- 大馬萌新在台扎根世界樹 (Yggdrasil Universe)
- 遠古秘典與夜間護眼油燈系統
- 玩家狀態與 50 人連線排行榜系統 (擴充規劃中)
本專案為資料結構期末專題，核心目標是將大馬新生赴台情境轉化為前端演算法展示，並不會實際串接北科大真實的校務行政後端 API。

## Tech Stack
請只使用：
- React 18
- Vite
- Tailwind CSS (大量使用 Arbitrary Values `[]` 進行微調)
- Three.js (用於 3D 校園)
- Lucide React (提供向量圖標)
- 預設初期不使用真實資料庫 (依賴 LocalStorage 進行純前端持久化存檔)
- 後續將串接輕量級 BaaS (如 Firebase 或 Supabase) 以支援最多 50 人的連線帳號與排行榜系統
最終作品必須可以直接透過 `npm run dev` 啟動，或編譯成靜態檔案運行。

## File Structure
請維持以下檔案結構：
├── index.html
├── src/
│   ├── components/       # UI 元件 (如 YggdrasilModal, MilestoneProgressBar)
│   ├── contexts/         # React Context (PlayerContext)
│   ├── data/             # Mock 資料與資料結構模型 (mockData.js)
│   ├── pages/            # 頁面容器 (Layout, Hero, Tasks)
│   ├── index.css         # Tailwind 進入點
│   └── main.jsx          # React 進入點
├── AGENTS.md             # 本檔案 (AI 長期記憶)
├── PRD.md                # 產品需求文件
├── TECH_STACK.md         # 核心資料結構與技術實作細節
├── UI_UX.md              # 遊戲化視覺設計規範
├── PROGRESS.md           # 開發進度與技術白皮書
└── package.json

## 資料來源與主邏輯 (Data & Core Logic)
- **資料從哪裡來？**
  所有資料（節點、任務、死線）均來自 `src/data/mockData.js`。使用者狀態則即時讀寫於瀏覽器的 `localStorage` 中。未來規劃透過 GitHub Actions 爬蟲產生靜態 JSON。
- **畫面風格如何設計？**
  經典 RPG 沉浸式羊皮紙風格。大量使用牛皮紙色系 (`#f4e8d1`, `#e0cda5`, `#8b5a2b`)、發光法陣、魔法流光、以及 JRPG 遊戲化元件（HP/MP條、金幣、像素圖示）。詳見 `UI_UX.md`。
- **主邏輯要怎麼計算？**
  1. DAG 拓撲圖：利用鄰接表記錄任務相依性，完成父節點才能解鎖子節點。
  2. Min-Heap：將最接近死線的任務排在最頂部，觸發紅色警報。
  3. 經驗值與升級：每滿 100 XP 自動晉升 Level，扣除 100 XP，並存檔。
  4. 排行榜 (規劃中)：根據完成任務與累積經驗值進行 50 人天梯排序。

## 常見的錯誤怎麼處理？ (Common Errors)
1. **JSON 替換語法錯誤 (PARSE_ERROR)**：
   - 處理方式：修改 `mockData.js` 前務必確認區塊範圍；修改後確保括號對稱。
2. **Vite 依賴快取問題 (Failed to resolve import)**：
   - 處理方式：安裝新套件後，強制重啟伺服器並清除快取 (`npm run dev -- --force`)。
3. **Tailwind Arbitrary Values 失效**：
   - 處理方式：某些深層屬性（如 `backdrop-sepia-[15%]`）可能被 JIT 遺漏，此時請改用 React 內聯 `style={{}}` 傳入純 CSS 以確保絕對生效。

## Must Have
- 階層式任務解鎖流程 (DAG)
- 羊皮紙風格與 JRPG 遊戲化 UI
- 狀態即時存檔與還原 (LocalStorage)
- 3D 校園展示 (MVP)
- 世界樹與遠古秘典等沉浸式組件
- 資料結構 (DAG, Min-Heap, Hash Map 等) 在實務上的完美應用

## Do Not Do
- 不要串接真實的學校 API
- 不要引入複雜的後端框架 (Node.js/Express/DB)
- 不要破壞現有的 RPG 羊皮紙視覺風格 (禁止使用現代極簡的扁平化白底黑字設計)
- 不要覆寫不相關的程式碼或註解

## 驗收標準 (Acceptance Criteria)

### 1. 基本執行
- 使用者可以直接透過 `npm run dev` 或編譯後的靜態 `dist` 啟動，看到完整畫面。
- 預設不需要安裝額外的系統級軟體。
- MVP 階段不需要真實登入，後續排行榜版本再實裝。
- MVP 階段不需要後端伺服器與真實資料庫 (排行榜擴充除外)。
- 不需要任何外部 API key。
- 頁面載入後不能出現明顯錯誤畫面，Browser Console 中不應該有會影響核心功能的 JavaScript error。

### 2. Demo 流程
使用者必須能完成以下保證可成功展示的 Demo Path (3分鐘內展示完畢)：
1. **進入首頁**：觀看精美的雙欄排版與 3D 校園。
2. **操作 Yggdrasil 世界樹**：點擊右側戰情室按鈕，展開宇宙星空與生命之樹的彈出視窗。
3. **體驗護眼模式**：點擊左上角「點亮油燈」，展示完美的暗色物理濾鏡。
4. **操作遠古秘典**：打開秘典，展示自定義捲軸與翻書陰影。
5. **系統回饋**：每個按鈕的操作皆有對應的粒子特效、音效或視覺動畫反饋。可輕易截圖或口頭說明成果。

### 3. 核心功能
- 至少完成 MVP 中定義的核心功能（DAG 任務樹、Min-Heap 死線看板、3D Campus）。
- 核心功能不能只是靜態文字描述，必須有「可操作」或「可觀察」的結果（例如倒數計時呼吸燈）。
- 每個按鈕都有明確作用，不應該存在點了沒反應的「假按鈕」。
- **必須能回答的問題**：
  - 使用了哪一種資料結構？ (DAG, Min-Heap, Hash Map 等)
  - 資料是怎麼存的？ (LocalStorage 與 JSON)
  - 為什麼這裡適合用這種資料結構？ (例如：任務依賴性最適合 DAG)
  - 這個資料結構如何影響功能運作？

### 4. 檔案與程式碼
- 主要檔案命名清楚（例如：`Layout.jsx`, `mockData.js`, `PlayerContext.jsx`）。
- 沒有把大量的邏輯全部塞在 HTML 或單一 Component 裡（已拆分 Context 與 Components）。
- 不留下大量沒用到的廢棄程式碼或 console.log。
- 不留下測試用的假按鈕或無意義文字。
- 資料檔結構清楚，以結構化的 JSON 陣列或物件儲存。

### 5. 穩定性
- 重新整理頁面後，由於 LocalStorage 持久化，狀態仍可正常保持。
- 操作順序稍微不同時，系統不應崩潰。
- Demo 前至少完整跑過 3 次主要流程，確保無中斷 Bug。

### 6. 範圍控制
以下內容「不是」MVP 階段的必要項目，絕不可影響期末展示 (但保留後續擴充空間)：
- 複雜的登入系統 (除 50 人輕量級排行榜外)
- 大型關聯式後端資料庫
- 真實金流與串接
- 真實通知系統 (Push Notifications)
- 真實 GPS 校園定位
- 複雜 AI 模型 (如整合 LLM 到前端)
- 過度精緻但無法操作的無意義動畫

### 10. 最終完成定義
當以下條件都達成時，才算正式完工：
- 可以正常啟動 Vite 開發伺服器或打包靜態檔。
- 可以順暢完成 Demo 流程。
- 有清楚的輸入 (點擊/搜尋)、處理 (計算/過濾)、輸出 (UI 變化)。
- 至少一個資料結構被實際應用於功能中（我們已實作四個）。
- 畫面極度適合期末展示（視覺衝擊力極強）。
- 團隊能明確說明作品中資料結構的邏輯。
- 沒有明顯會讓 Demo 中斷的錯誤。
*(補充：驗收過程建議使用 Browser Use 進行自動化測試)*
