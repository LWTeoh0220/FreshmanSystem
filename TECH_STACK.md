# TECH_STACK (Technical Architecture & Data Structures)

本專案的核心亮點在於**「將抽象的資料結構視覺化並應用於真實業務邏輯」**。前端框架選用 React + Vite 確保現代化的開發體驗與效能。

## 🏗️ 核心技術棧 (Core Technologies)
- **Frontend Framework**: React 18
- **Build Tool**: Vite (提供極速的 HMR 與打包)
- **Styling**: Tailwind CSS (利用 Utility-first 快速刻畫 iOS Glassmorphism 風格)
- **3D Engine**: Three.js + `@react-three/fiber` + `@react-three/drei` (構建校園探索模組)
- **Routing**: `react-router-dom` (處理多頁面 SPA 導航)
- **Language Toolkit**: `opencc-js` (處理簡繁體無縫搜尋轉換)

## 🧠 核心資料結構實作 (Core Data Structures Implementation)

### 1. 有向無環圖 (DAG - Directed Acyclic Graph)
- **檔案位置**: `src/utils/ProcessGraph.js`
- **業務應用**：**任務拓撲圖與撤銷系統**。
- **實作細節**：
  - 使用 Adjacency List (鄰接串列) 儲存節點間的先後關係。
  - 使用 In-degree (入分枝度) 陣列來判斷任務是否解鎖 (In-degree === 0)。
  - **DFS 連鎖撤銷 (Cascading Rollback)**：當撤銷一個已完成的節點時，系統會透過深度優先搜尋 (DFS) 遞迴檢查所有相鄰子節點，強制增加其 In-degree 並將狀態重設為 Locked。這是極具技術含量的防呆機制。

### 2. 字典樹 (Trie)
- **檔案位置**: `src/utils/SearchEngine.js`
- **業務應用**：**快速傳送門 (Fast Travel) 的字首自動補完 (Auto-complete)**。
- **實作細節**：
  - 每個節點包含一個 Map 儲存子字元，與一個布林值 `isEndOfWord`。
  - 支援極速的字首比對，時間複雜度僅為 O(L)，L 為搜尋字串長度，即使任務名稱成千上萬也能瞬間給出補完建議。

### 3. 雜湊表 (Hash Map)
- **檔案位置**: `src/utils/SearchEngine.js` (內建 `intentMap`)
- **業務應用**：**自然語言意圖映射 (Intent Mapping)**。
- **實作細節**：
  - 使用原生的 JavaScript `Map` 或 Object。
  - 儲存「同義詞」到「標準節點 ID」的映射（例如：`{'户口': 'bank_process', '签证': 'arc_process'}`）。
  - 當 Trie 找不到完全吻合的字時，會退而求其次在 Hash Map 中尋找同義詞，實現類似 NLP 的寬容搜尋。

### 4. 最小堆積 (Min-Heap)
- **檔案位置**: `src/utils/DeadlineHeap.js`
- **業務應用**：**死線儀表板 (Emergency Deadlines)**。
- **實作細節**：
  - 手刻以 Array 為底層結構的 Binary Heap。
  - 實作 `bubbleUp` 與 `bubbleDown` 維持 Heap 性質。
  - 用於即時從大量任務中，以 O(log N) 的時間複雜度抓出「最接近過期 (最小時間戳)」的緊急任務，並呈現在右側邊欄提醒新生。

### 5. 全自動數據管道與本地端緩存 (Data Pipeline & LocalStorage) [待後續實裝]
- **檔案位置**: 預計新增 Python 爬蟲腳本與 `.github/workflows/cron.yml`。
- **業務應用**：**免登入狀態綁定與即時情報系統**。
- **實作細節**：
  - 利用 GitHub Actions 定時執行 Python 爬蟲，抓取學校官網公告與行事曆，過濾關鍵字後標準化輸出為 `data.json`。
  - 前端讀取 JSON 呈現處室動態，並透過 `localStorage` 儲存使用者的「入籍設定（科系、宿舍）」。
  - 利用前端邏輯達成「免登入偽連動」，根據 LocalStorage 標籤推播專屬提醒，完美避開校方系統認證與資安門檻。

## ⚠️ 架構設計避坑指南 (Architecture Gotchas)

### React 與深層資料結構的狀態連動 (State Mutation Bug)
- **踩坑紀錄 (Undo Bug)**：初期在實作 DAG 的 DFS 連鎖撤銷時，雖然底層 `ProcessGraph.js` 的邏輯正確改變了 Node 的狀態，但 React 畫面並未更新。
- **根本原因**：React 的 `setState` 使用淺層比較 (Shallow Compare)。直接修改 Class Instance 內部的屬性並不會改變 Instance 本身的記憶體參考 (Reference)，導致 React 略過 Re-render。
- **解決方案**：
  1. 在 `App.jsx` 中傳遞 `nodes` 給 UI 元件時，必須進行**深拷貝 (Deep Clone)** 或解構建立新陣列：`nodes: graph.getNodes().map(n => ({...n}))`。
  2. 搭配獨立的 `renderTrigger` 狀態來強制觸發畫面刷新，確保演算法層與視圖層保持完美同步。
