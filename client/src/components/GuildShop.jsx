import React, { useState } from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import { ShoppingBag, Lock, Unlock, Download, Sparkles, Zap, Flame, Eye, Leaf, BookOpen, Undo2, Map, Book, Archive } from 'lucide-react';
import confettiPkg from 'canvas-confetti';
const confetti = typeof confettiPkg === 'function' ? confettiPkg : confettiPkg.default;

const lootItems = [
  {
    id: 'loot_food',
    name: '北科大周邊美食地圖',
    price: 50,
    icon: '🍜',
    description: '匯集建國南路與八德路周邊隱藏版平價美食，拯救月底吃土的你。',
    pools: {
      Common: { text: '【普通發現】光華商場後巷的 80 元大雞排便當。', title: '平價美食' },
      Rare: { text: '【稀有情報】校門口右轉的麵攤，跟老闆說「通關密語」可加蛋！', title: '內行情報' },
      Epic: { text: '【史詩戰利品】憑此截圖至「阿水獅豬腳大王」可享 9 折優惠！', title: '實體優惠券' }
    }
  },
  {
    id: 'loot_almanac',
    name: '全能型新手大補帖',
    price: 150,
    icon: '📐',
    description: '學長姐直傳快速通關小步數，幫助新生避開行政、選課與體檢的超大雷區！',
    pools: {
      Common: { text: '【普通發現】教務處中午有休息時間，千萬別白跑一趟。', title: '行政指南' },
      Rare: { text: '【稀有情報】通識課第一階段先搶「科技與社會」，沒上再等加簽。', title: '選課避雷' },
      Epic: { text: '【史詩戰利品】體檢快速通關路線圖，幫你省下至少 2 小時排隊時間！', title: '外掛級攻略' }
    }
  },
  {
    id: 'loot_gacha',
    name: '幸運轉蛋機 (隨機物資)',
    price: 20,
    icon: '🎰',
    description: '花費少量金幣，隨機抽取校園八卦、冷笑話，或是稀有限定稱號！',
    pools: {
      Common: { text: '北科大附近哪裡的風水最好？答案是行政大樓，因為那裡讓人感到一陣涼意。', title: '🤡 吟遊詩人的笑話' },
      Rare: { text: '半夜在設計館畫圖，聽到的腳步聲不一定是警衛...', title: '🤫 校園情報解密' },
      Epic: { text: '解鎖限定稱號：【綜科館迷路魔王】\n點擊確認後，您的稱號將立刻變更！', title: '👑 獲得稀有稱號！', newTitle: '綜科館迷路魔王' }
    }
  }
];

const legacyItems = [
  {
    id: 'legacy_lightning',
    school: 'Lightning',
    schoolLabel: '⚡ 雷磁',
    name: '雷磁流派：互動網頁',
    price: 10,
    icon: <Zap size={48} />,
    description: '專注於網頁前端與 UI/UX 設計的傳奇專案，如閃電般迅速的互動體驗。',
    hiddenContent: '👉 [點擊查閱雷磁流派專案]\n\n💡 提示：公會手札中的傳奇任務已經為你解鎖！',
    colors: {
      border: 'border-[#00e5ff]',
      shadow: 'shadow-[0_0_15px_#00e5ff]',
      bgFront: 'bg-[#001a1f]',
      bgBack: 'bg-[#00333d]',
      textPrimary: 'text-[#00e5ff]',
      textSecondary: 'text-[#b2ebf2]',
      watermark: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00e5ff]/20 to-transparent',
      shimmer: 'via-[#00e5ff]/20'
    },
    pools: {
      Common: { title: '基礎個人履歷網站', description: '使用 HTML/CSS 刻板的靜態履歷網頁，是網頁開發的起點。' },
      Rare: { title: '動態記帳 Web App', description: '結合 React 與 LocalStorage 的實用記帳工具，具備完整 CRUD 功能。' },
      Epic: { title: '3D 互動校園導覽 (傳奇)', description: '使用 Three.js 打造的全景校園地圖，曾獲畢展特優的傳奇專案！' }
    }
  },
  {
    id: 'legacy_forge',
    school: 'Forge',
    schoolLabel: '🔥 剛火',
    name: '剛火流派：硬體智造',
    price: 10,
    icon: <Flame size={48} />,
    description: '適用於硬體電路、IoT 物聯網的自動化專案，如烈火般鍛造出的鋼鐵造物。',
    hiddenContent: '👉 [點擊查閱剛火流派專案]\n\n💡 提示：公會手札中的傳奇任務已經為你解鎖！',
    colors: {
      border: 'border-[#ff3d00]',
      shadow: 'shadow-[0_0_15px_#ff3d00]',
      bgFront: 'bg-[#1f0800]',
      bgBack: 'bg-[#3e1000]',
      textPrimary: 'text-[#ff3d00]',
      textSecondary: 'text-[#ffccbc]',
      watermark: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ff3d00]/20 to-transparent',
      shimmer: 'via-[#ff3d00]/20'
    },
    pools: {
      Common: { title: '溫濕度感測器雛形', description: '基礎的 Arduino 溫濕度監測系統，可用於溫室環境監控。' },
      Rare: { title: '智能避障自走車', description: '結合紅外線與超音波感測器的自動導航小車，具備基礎 ROS 架構。' },
      Epic: { title: '無人機群控系統 (傳奇)', description: '曾獲全國機器人大賽特優的傳奇專案！具備完整飛控與影像辨識。' }
    }
  },
  {
    id: 'legacy_void',
    school: 'Void',
    schoolLabel: '👁️ 虛空',
    name: '虛空流派：演算法',
    price: 10,
    icon: <Eye size={48} />,
    description: '蘊含大數據與 AI 機器學習的深奧演算法，窺探未來的全知之眼。',
    hiddenContent: '👉 [點擊查閱虛空流派專案]\n\n💡 提示：公會手札中的傳奇任務已經為你解鎖！',
    colors: {
      border: 'border-[#9c27b0]',
      shadow: 'shadow-[0_0_15px_#9c27b0]',
      bgFront: 'bg-[#15001f]',
      bgBack: 'bg-[#2a003e]',
      textPrimary: 'text-[#d500f9]',
      textSecondary: 'text-[#e1bee7]',
      watermark: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#9c27b0]/20 to-transparent',
      shimmer: 'via-[#9c27b0]/20'
    },
    pools: {
      Common: { title: '基礎排序演算法視覺化', description: '用 C++ 實作 Bubble Sort 與 Quick Sort 的終端機展示。' },
      Rare: { title: '社群情緒分析儀', description: '利用 Python 爬蟲與 NLP 套件，即時分析 PTT 留言的風向與情緒。' },
      Epic: { title: '基於 LLM 的虛擬導師 (傳奇)', description: '串接大型語言模型並微調的 AI 家教，能精準回答資工系所有必修問題！' }
    }
  },
  {
    id: 'legacy_eco',
    school: 'Eco',
    schoolLabel: '🍃 萬象',
    name: '萬象流派：開源生態',
    price: 10,
    icon: <Leaf size={48} />,
    description: '致力於開源工具與社群協作的工具專案，生生不息的生態網路。',
    hiddenContent: '👉 [點擊查閱萬象流派專案]\n\n💡 提示：公會手札中的傳奇任務已經為你解鎖！',
    colors: {
      border: 'border-[#4caf50]',
      shadow: 'shadow-[0_0_15px_#4caf50]',
      bgFront: 'bg-[#001f05]',
      bgBack: 'bg-[#003e0a]',
      textPrimary: 'text-[#69f0ae]',
      textSecondary: 'text-[#c8e6c9]',
      watermark: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#4caf50]/20 to-transparent',
      shimmer: 'via-[#4caf50]/20'
    },
    pools: {
      Common: { title: '社團活動點名腳本', description: '基於 Google Apps Script 的自動點名與寄信工具。' },
      Rare: { title: '校園共乘媒合平台', description: '幫助學生尋找返鄉共乘的開源平台，累計超過 1000 次 PR。' },
      Epic: { title: '全端框架生態系貢獻 (傳奇)', description: '成為知名開源框架的核心貢獻者，程式碼被全球數百萬專案引用！' }
    }
  }
];

const libraryTabs = [
  { id: 'loot-history', label: '冒險手札紀錄', icon: '📖' },
  { id: 'legacy-projects', label: '傳奇造物卷宗', icon: '🔮' }
];

export default function GuildShop() {
  const { coins, spendCoins, mp, consumeMp, unlockTitle, projectBought, setProjectBought, dailyPurchases, recordLootPurchase, lootHistory, unlockedLegacyProjects, setUnlockedLegacyProjects } = usePlayer();
  
  const getDailyDiscountId = () => {
    const today = new Date().toLocaleDateString();
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = today.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % lootItems.length;
    return lootItems[index].id;
  };
  
  const [dailyDiscountItemId, setDailyDiscountItemId] = useState(() => {
    const saved = localStorage.getItem('daily_discount_item');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === new Date().toLocaleDateString()) return parsed.id;
    }
    return getDailyDiscountId();
  });
  
  const [haggledItems, setHaggledItems] = useState(() => {
    const saved = localStorage.getItem('guild_haggled_items');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === new Date().toLocaleDateString()) return parsed.ids || [];
    }
    return [];
  });
  
  const [shakingItemId, setShakingItemId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeGachaModal, setActiveGachaModal] = useState(null);
  const [isLooting, setIsLooting] = useState(false);
  const [lootingItemId, setLootingItemId] = useState(null);
  const [viewStatus, setViewStatus] = useState('lobby'); // 'lobby', 'gacha', 'market', 'legacy', 'library'
  const [activeLibraryTab, setActiveLibraryTab] = useState('loot-history');

  const npcDialogues = [
    '歡迎光臨！今天想抽個八卦轉蛋，還是看看學長姐留下的黑科技魔法書呢？',
    '冒險者，聽說搭乘台灣捷運時千萬不能飲食，否則會被新手村守衛處以巨額罰款喔！',
    '火燒屁股啦！我看下方的任務死線戰情室只剩 2 天了，還不快去交付任務報酬！',
    '(揉眼睛) 呼... 幫學長姐整理那些黑科技魔法書，我的 HP 體力值快要歸零了...'
  ];
  const [npcDialogueIndex, setNpcDialogueIndex] = useState(() => Math.floor(Math.random() * npcDialogues.length));

  const handleNpcClick = () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * npcDialogues.length);
    } while (nextIndex === npcDialogueIndex);
    setNpcDialogueIndex(nextIndex);
  };

  const handleRefreshMarket = () => {
    if (consumeMp(20)) {
      const available = lootItems.filter(i => i.id !== dailyDiscountItemId);
      const newId = available[Math.floor(Math.random() * available.length)].id;
      setDailyDiscountItemId(newId);
      localStorage.setItem('daily_discount_item', JSON.stringify({
        date: new Date().toLocaleDateString(),
        id: newId
      }));
      try {
        if (confetti) {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 }, colors: ['#007aff', '#ffcc00'] });
        }
      } catch (e) {}
    } else {
      setErrorMessage('❌ 冒險者，您的魔力值（MP）不足 20 點！');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleHaggle = (item) => {
    if (consumeHp(15)) {
      const newHaggled = [...(haggledItems || []), item.id];
      setHaggledItems(newHaggled);
      localStorage.setItem('guild_haggled_items', JSON.stringify({
        date: new Date().toLocaleDateString(),
        ids: newHaggled
      }));
      try {
        if (confetti) {
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 }, colors: ['#ffcc00', '#c62828'] });
        }
      } catch (e) {}
    } else {
      setErrorMessage('❌ 冒險者精力耗盡！請等待明日清晨 4:00 公會回復體力，或前往首頁進行每日簽到占卜補滿！');
      setTimeout(() => setErrorMessage(''), 3500);
    }
  };

  const handleBuyLoot = (item, usingMpExtraDraw = false) => {
    const today = new Date().toLocaleDateString();
    const purchaseData = dailyPurchases[item.id] || {};
    
    if (purchaseData.date === today && purchaseData.count >= 3 && !usingMpExtraDraw) {
      setErrorMessage('❌ 今日已達抽取上限 (3/3)！請明天再來，或使用魔力突破限制。');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (usingMpExtraDraw && !consumeMp(20)) {
      setErrorMessage('❌ 冒險者，您的魔力值（MP）不足 20 點，無法額外抽獎！');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    let actualPrice = item.price;
    if (item.id === dailyDiscountItemId) actualPrice = Math.floor(actualPrice * 0.7);
    if (haggledItems.includes(item.id)) actualPrice = Math.floor(actualPrice * 0.8);

    if (spendCoins(actualPrice)) {
      setIsLooting(true);
      setLootingItemId(item.id);
      setTimeout(() => {
        setIsLooting(false);
        setLootingItemId(null);
        const rand = Math.random();
        let rarity = 'Common';
        if (rand > 0.9) rarity = 'Epic'; // 10%
        else if (rand > 0.6) rarity = 'Rare'; // 30%
        else rarity = 'Common'; // 60%
        
        const result = item.pools[rarity];
        recordLootPurchase(item.id, result);
        
        if (rarity === 'Epic' || rarity === 'Rare') {
          try {
            if (confetti) {
              confetti({
                particleCount: rarity === 'Epic' ? 200 : 100,
                spread: 90,
                origin: { y: 0.5 },
                colors: rarity === 'Epic' ? ['#ffcc00', '#ffd700', '#fff8e1'] : ['#00e676', '#69f0ae']
              });
            }
          } catch (e) {}
        }
        
        setActiveGachaModal({
          ...result,
          rarity,
          sourceName: item.name
        });
      }, 1200);
    } else {
      setShakingItemId(item.id);
      setErrorMessage('❌ 冒險者，您的金幣不足！多去解任務吧！');
      setTimeout(() => setShakingItemId(null), 500);
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleBuyLegacy = (item) => {
    if (spendCoins(item.price)) {
      setProjectBought(true);
      setErrorMessage('');
      setIsLooting(true);
      setLootingItemId(item.id);
      
      setTimeout(() => {
        setIsLooting(false);
        setLootingItemId(null);
        const rand = Math.random();
        let rarity = 'Common';
        if (rand > 0.9) rarity = 'Epic'; // 10%
        else if (rand > 0.6) rarity = 'Rare'; // 30%
        else rarity = 'Common'; // 60%
        
        const result = item.pools[rarity];
        
        const newProject = {
          id: Date.now() + Math.random(),
          schoolName: item.name,
          title: result.title,
          description: result.description,
          rarity,
          icon: item.schoolLabel,
          colors: item.colors
        };
        setUnlockedLegacyProjects(prev => [newProject, ...prev]);

        if (rarity === 'Epic' || rarity === 'Rare') {
          try {
            if (confetti) {
              confetti({
                particleCount: rarity === 'Epic' ? 200 : 100,
                spread: 90,
                origin: { y: 0.5 },
                colors: rarity === 'Epic' ? ['#ffcc00', '#ffd700', '#fff8e1'] : ['#e040fb', '#b388ff']
              });
            }
          } catch (e) {}
        }
        
        setActiveGachaModal({
          title: result.title,
          text: result.description,
          rarity,
          sourceName: item.name
        });
      }, 1500);
    } else {
      setShakingItemId(item.id);
      setErrorMessage('❌ 冒險者，您的金幣不足，請多完成主線任務賺取金幣！');
      setTimeout(() => setShakingItemId(null), 500);
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const getRarityStyles = (rarity) => {
    switch(rarity) {
      case 'Epic':
        return {
          glow: 'from-amber-500/60',
          border: 'border-[#ffd700]',
          shadow: 'shadow-[0_0_50px_rgba(255,215,0,0.6)] animate-[pulse_2s_infinite]',
          ribbonBg: 'bg-gradient-to-r from-[#b71c1c] via-[#f44336] to-[#b71c1c]',
          ribbonText: 'text-[#ffd700]',
          icon: '✨',
          btnGlow: 'hover:shadow-[0_0_20px_rgba(255,215,0,0.8)]'
        };
      case 'Rare':
        return {
          glow: 'from-emerald-500/50',
          border: 'border-[#00e676]',
          shadow: 'shadow-[0_0_30px_rgba(0,230,118,0.5)]',
          ribbonBg: 'bg-gradient-to-r from-[#1b5e20] via-[#4caf50] to-[#1b5e20]',
          ribbonText: 'text-[#e8f5e9]',
          icon: '🌟',
          btnGlow: 'hover:shadow-[0_0_20px_rgba(0,230,118,0.6)]'
        };
      case 'Common':
      default:
        return {
          glow: 'from-transparent',
          border: 'border-[#546e7a]',
          shadow: 'shadow-2xl',
          ribbonBg: 'bg-gradient-to-r from-[#37474f] via-[#607d8b] to-[#37474f]',
          ribbonText: 'text-white',
          icon: '📦',
          btnGlow: 'hover:shadow-lg'
        };
    }
  };

  const renderLootCard = (item) => {
    const isShaking = shakingItemId === item.id;
    const isThisLooting = lootingItemId === item.id;
    const today = new Date().toLocaleDateString();
    const purchaseData = dailyPurchases[item.id] || {};
    const isSoldOut = purchaseData.date === today && purchaseData.count >= 3;
    const isHaggled = haggledItems.includes(item.id);
    let currentPrice = item.price;
    if (item.id === dailyDiscountItemId) currentPrice = Math.floor(currentPrice * 0.7);
    if (isHaggled) currentPrice = Math.floor(currentPrice * 0.8);
    
    return (
      <div 
        key={item.id}
        className={`bg-[#f4e8d1] border-4 border-[#8b5a2b] rounded-2xl shadow-xl p-6 flex flex-col items-center relative jrpg-border transition-transform hover:-translate-y-2 w-full max-w-[320px] ${isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''} overflow-hidden`}
      >
        {/* SOLD OUT STAMP */}
        {isSoldOut && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[1px] pointer-events-none">
            <div className="border-8 border-[#c62828] text-[#c62828] font-black text-4xl p-4 -rotate-[15deg] bg-[#c62828]/10 backdrop-blur-sm rounded-lg shadow-[0_0_20px_rgba(198,40,40,0.5)] transform scale-110">
              <div className="border-4 border-[#c62828] px-4 py-2 opacity-90 drop-shadow-md">
                SOLD OUT
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-0 right-0 bg-[#c62828] text-white text-xs font-black px-3 py-1 rounded-bl-xl rounded-tr-xl shadow-sm z-20">
          🎁 內含史詩獎勵！
        </div>

        {/* Unique Loot Animations */}
        {item.id === 'loot_gacha' && (
          <div className="relative mb-4 mt-2">
            {isThisLooting && (
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-60 blur-md"></div>
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-yellow-300 rounded-full animate-[flyOutTop_0.5s_ease-out_infinite]"></div>
                <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-yellow-300 rounded-full animate-[flyOutBottom_0.5s_ease-out_infinite]"></div>
                <div className="absolute left-0 top-1/2 w-2 h-2 bg-yellow-300 rounded-full animate-[flyOutLeft_0.5s_ease-out_infinite]"></div>
                <div className="absolute right-0 top-1/2 w-2 h-2 bg-yellow-300 rounded-full animate-[flyOutRight_0.5s_ease-out_infinite]"></div>
              </div>
            )}
            <div className={`text-6xl drop-shadow-md relative z-10 ${isThisLooting ? 'animate-[shake_0.2s_ease-in-out_infinite]' : ''}`}>
              {item.icon}
            </div>
          </div>
        )}

        {item.id === 'loot_food' && (
          <div className="relative mb-4 mt-2">
            {isThisLooting && (
              <div className="absolute inset-0 z-0 flex items-center justify-center">
                <div className="absolute -top-6 right-0 text-5xl animate-[chopsticksTap_0.3s_ease-in-out_infinite] z-20">🥢</div>
                <div className="absolute -top-4 left-2 text-2xl animate-[steamRise_0.8s_ease-out_infinite]">♨️</div>
                <div className="absolute top-0 left-8 text-lg animate-[steamRise_1s_ease-out_infinite_0.2s]">♨️</div>
              </div>
            )}
            <div className={`text-6xl drop-shadow-md relative z-10 ${isThisLooting ? 'animate-[bowlShrink_1.2s_ease-in-out_forwards]' : ''}`}>
              {item.icon}
            </div>
          </div>
        )}

        {item.id === 'loot_almanac' && (
          <div className="relative mb-4 mt-2 w-full flex justify-center">
            {isThisLooting && (
              <div className="absolute inset-0 z-0 flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30 blur-xl scale-150"></div>
                <div className="absolute -top-4 -left-2 animate-[flyUpFade_0.8s_ease-out_infinite_0s] text-2xl font-black text-blue-600 drop-shadow-sm">A+</div>
                <div className="absolute -top-8 right-0 animate-[flyUpFade_1s_ease-out_infinite_0.2s] text-xl font-black text-green-600 drop-shadow-sm">100</div>
                <div className="absolute top-0 -left-6 animate-[flyUpFade_0.9s_ease-out_infinite_0.4s] text-3xl drop-shadow-sm">💡</div>
                <div className="absolute -bottom-2 -right-4 animate-[flyUpFade_1.1s_ease-out_infinite_0.1s] text-2xl font-black text-purple-600 drop-shadow-sm">📝</div>
              </div>
            )}
            <div className={`text-6xl drop-shadow-md relative z-10 ${isThisLooting ? 'animate-[floatFast_0.6s_ease-in-out_infinite]' : ''}`}>
              {item.icon}
            </div>
          </div>
        )}

        <h2 className="text-xl font-black text-[#4a3b32] text-center mb-2 relative z-10">{item.name}</h2>
        <p className="text-sm text-[#7a6350] font-bold text-center mb-8 flex-1 leading-relaxed relative z-10">
          {item.description}
        </p>
        
        {isSoldOut ? (
          <div className="flex flex-col space-y-2 w-full mt-2 relative z-10">
            <button disabled className="w-full py-2 bg-gray-400 border-2 border-gray-500 text-gray-700 font-black rounded-xl shadow-none cursor-not-allowed">
              已達今日上限 (3/3)
            </button>
            <button 
              onClick={() => handleBuyLoot(item, true)}
              disabled={isLooting}
              className="w-full py-2 bg-gradient-to-r from-[#007aff] to-[#34aadc] border-2 border-[#005bb5] text-white font-black text-sm rounded-xl hover:brightness-110 active:scale-95 shadow-[0_4px_0_#005bb5] active:translate-y-[2px] active:shadow-none flex justify-center items-center disabled:opacity-70"
            >
              [ 🔮 消耗 20 MP 額外抽取 ]
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleBuyLoot(item)}
            disabled={isLooting}
            className={`w-full ${
              isThisLooting ? 'bg-gray-500 border-gray-600 text-gray-200 shadow-inner' :
              'bg-gradient-to-b from-[#ffcc00] to-[#ff8f00] border-[#8b5a2b] text-[#4a3b32] shadow-[0_4px_0_#8b5a2b] hover:shadow-[0_2px_0_#8b5a2b] hover:translate-y-[2px]'
            } border-2 font-black py-3 rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-70 relative z-10`}
          >
            {isThisLooting ? (
              <span className="animate-pulse flex items-center">
                {item.id === 'loot_gacha' ? '🎰 命運齒輪運轉中...' : item.id === 'loot_food' ? '🥢 大快朵頤中...' : '📚 瘋狂吸收知識中...'}
              </span>
            ) : item.price !== currentPrice ? (
              <span className="flex items-center space-x-2">
                <span>抽取 (</span>
                <span className="line-through text-[#8b5a2b] opacity-80 decoration-red-600 decoration-[3px]">🪙 {item.price}</span>
                <span className="text-red-700 font-black text-xl">➔ 🪙 {currentPrice}</span>
                <span>)</span>
              </span>
            ) : (
              <span>抽取 (🪙 {item.price})</span>
            )}
          </button>
        )}

        {/* Haggle Button */}
        <button 
          onClick={() => handleHaggle(item)}
          disabled={isHaggled || isLooting || isSoldOut}
          className={`w-full mt-2 py-1.5 text-xs font-black rounded-lg border flex justify-center items-center transition-all relative z-10 shadow-sm ${
            isHaggled 
              ? 'bg-[#8b5a2b]/20 text-[#8b5a2b] border-[#8b5a2b]/30 cursor-not-allowed shadow-none' 
              : 'bg-[#f4e8d1] text-[#c62828] border-[#c62828]/50 hover:bg-[#c62828]/10 hover:border-[#c62828] active:scale-95'
          }`}
        >
          {isHaggled ? '✔️ 今日已砍價 (享 8 折)' : '📢 消耗 15 HP 砍價'}
        </button>
      </div>
    );
  };

  const renderLegacyCard = (item) => {
    const isShaking = shakingItemId === item.id;
    const isThisLooting = lootingItemId === item.id;
    const colors = item.colors;

    return (
      <div 
        key={item.id}
        className="perspective-1000 w-full h-full flex"
      >
        <div className={`w-full h-full transition-transform duration-700 preserve-3d relative flex-1 flex`}>
          <div className={`w-full h-full backface-hidden ${colors.bgFront} border-4 ${colors.border} rounded-2xl ${colors.shadow} p-6 flex flex-col items-center justify-between overflow-hidden ${isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''} relative`}>
            <div className={`absolute inset-0 ${colors.watermark} opacity-30 pointer-events-none`}></div>
            <div className={`absolute top-0 right-0 ${colors.border} border-b-2 border-l-2 bg-[#000]/50 ${colors.textPrimary} text-xs font-black px-2 py-1 rounded-bl-xl rounded-tr-xl shadow-sm z-10 backdrop-blur-sm`}>
              前輩造物 ➔ {item.schoolLabel}
            </div>
            <div className={`text-6xl drop-shadow-md mb-2 mt-2 flex-shrink-0 ${colors.textPrimary} z-10 relative`}>
              {/* Magic animations */}
              {isThisLooting && (
                <div className="absolute inset-0 z-0 flex items-center justify-center">
                  {item.id === 'legacy_lightning' && (
                     <>
                       <div className="absolute inset-0 bg-[#00e5ff] rounded-full animate-ping opacity-60 blur-lg scale-150 z-0"></div>
                       {/* Flying sparks */}
                       <div className="absolute top-0 left-1/2 -translate-x-1/2 text-2xl animate-[flyOutTop_0.3s_ease-out_infinite] z-20 text-[#00e5ff] drop-shadow-[0_0_10px_#00e5ff]">⚡</div>
                       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-3xl animate-[flyOutBottom_0.4s_ease-out_infinite_0.1s] z-20 text-[#00e5ff] drop-shadow-[0_0_10px_#00e5ff]">⚡</div>
                       <div className="absolute left-0 top-1/2 -translate-y-1/2 text-xl animate-[flyOutLeft_0.3s_ease-out_infinite_0.2s] z-20 text-[#00e5ff] drop-shadow-[0_0_10px_#00e5ff]">⚡</div>
                       <div className="absolute right-0 top-1/2 -translate-y-1/2 text-2xl animate-[flyOutRight_0.4s_ease-out_infinite_0.1s] z-20 text-[#00e5ff] drop-shadow-[0_0_10px_#00e5ff]">⚡</div>
                     </>
                  )}
                  {item.id === 'legacy_forge' && (
                     <>
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,_rgba(255,61,0,0.6)_0%,_transparent_70%)] animate-pulse mix-blend-screen pointer-events-none z-0"></div>
                       {/* Flying embers */}
                       <div className="absolute -bottom-4 left-0 text-3xl animate-[steamRise_0.8s_ease-out_infinite] z-20">🔥</div>
                       <div className="absolute bottom-2 right-4 text-2xl animate-[steamRise_0.6s_ease-out_infinite_0.2s] z-20">✨</div>
                       <div className="absolute -bottom-2 -left-4 text-xl animate-[steamRise_1s_ease-out_infinite_0.4s] z-20">🔥</div>
                       <div className="absolute bottom-4 right-0 text-3xl animate-[steamRise_0.7s_ease-out_infinite_0.1s] z-20">✨</div>
                     </>
                  )}
                  {item.id === 'legacy_void' && (
                     <>
                       <div className="absolute inset-0 border-8 border-[#9c27b0] rounded-full animate-[spin_1s_linear_infinite] opacity-60 scale-[1.5] blur-sm z-0"></div>
                       {/* Sucking into void */}
                       <div className="absolute top-0 left-1/2 -translate-x-1/2 text-2xl animate-[flyInTop_0.6s_ease-in_infinite] z-20 text-[#d500f9] drop-shadow-[0_0_5px_#9c27b0]">✦</div>
                       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-3xl animate-[flyInBottom_0.8s_ease-in_infinite_0.1s] z-20 text-[#d500f9] drop-shadow-[0_0_5px_#9c27b0]">✦</div>
                       <div className="absolute left-0 top-1/2 -translate-y-1/2 text-xl animate-[flyInLeft_0.7s_ease-in_infinite_0.2s] z-20 text-[#d500f9] drop-shadow-[0_0_5px_#9c27b0]">✧</div>
                       <div className="absolute right-0 top-1/2 -translate-y-1/2 text-2xl animate-[flyInRight_0.5s_ease-in_infinite_0.1s] z-20 text-[#d500f9] drop-shadow-[0_0_5px_#9c27b0]">✧</div>
                     </>
                  )}
                  {item.id === 'legacy_eco' && (
                     <div className="absolute inset-0 flex items-center justify-center">
                       <div className="absolute text-4xl animate-[leafSpin_1s_linear_infinite] z-20">🍃</div>
                       <div className="absolute text-2xl animate-[leafSpin_1.2s_linear_infinite_0.3s] z-20">🍃</div>
                       <div className="absolute text-xl animate-[leafSpin_0.9s_linear_infinite_0.6s] z-20">🍃</div>
                     </div>
                  )}
                </div>
              )}
              <div className={`relative z-10 transition-all duration-300 ${isThisLooting ? (
                item.id === 'legacy_lightning' ? 'animate-[shake_0.1s_ease-in-out_infinite] scale-125 drop-shadow-[0_0_20px_#00e5ff]' :
                item.id === 'legacy_forge' ? 'animate-[pulse_0.4s_ease-in-out_infinite] scale-[1.35] drop-shadow-[0_0_20px_#ff3d00]' :
                item.id === 'legacy_void' ? 'animate-[spin_1.5s_linear_infinite] scale-[1.3] drop-shadow-[0_0_20px_#d500f9]' :
                'animate-pulse scale-125 drop-shadow-[0_0_20px_#4caf50]'
              ) : ''}`}>
                {item.icon}
              </div>
            </div>
            <h2 className={`text-xl font-black ${colors.textPrimary} text-center mb-2 z-10 drop-shadow-md flex-shrink-0 relative`}>{item.name}</h2>
            <div className="min-h-[120px] flex items-center justify-center w-full mb-4 z-10">
              <p className={`text-sm ${colors.textSecondary} font-bold text-center leading-relaxed line-clamp-5`}>
                {item.description}
              </p>
            </div>
            <button
              onClick={() => handleBuyLegacy(item)}
              disabled={isLooting}
              className={`mt-auto w-full ${isThisLooting ? 'bg-white/20' : 'bg-[#111] hover:bg-white/10'} border-2 ${colors.border} ${colors.textPrimary} font-black py-3 rounded-xl transition-all flex items-center justify-center space-x-2 z-10 relative overflow-hidden group disabled:opacity-80 active:translate-y-[2px]`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${colors.shimmer} to-transparent -translate-x-full ${isThisLooting ? 'animate-[shimmer_0.5s_infinite]' : 'group-hover:animate-[shimmer_1s_infinite]'}`}></div>
              
              {isThisLooting ? (
                <span className="animate-pulse flex items-center text-lg shadow-black drop-shadow-lg">
                  {item.id === 'legacy_lightning' ? '⚡ 雷電充能中...' :
                   item.id === 'legacy_forge' ? '🔥 剛火鍛造中...' :
                   item.id === 'legacy_void' ? '👁️ 窺探虛空中...' :
                   '🍃 萬象生長中...'}
                </span>
              ) : (
                <>
                  <Unlock size={18} />
                  <span>參悟抽卡 (🪙 {item.price})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getTransformClasses = () => {
    switch(viewStatus) {
      case 'gacha': return 'scale-[1.05] translate-x-[15%] translate-y-[5%]';
      case 'market': return 'scale-[1.05] translate-x-[0%] translate-y-[5%]';
      case 'legacy': return 'scale-[1.05] translate-x-[-15%] translate-y-[5%]';
      case 'library': return 'scale-[1.05] translate-x-[-15%] translate-y-[5%]';
      case 'lobby':
      default: return 'scale-100 translate-x-0 translate-y-0';
    }
  };

  return (
    <div className="w-full min-h-[750px] relative overflow-hidden bg-[#d0b48c] shadow-inner font-sans rounded-3xl border-4 border-[#8b5a2b]">
      
      {/* 2.5D Room Background */}
      <div className="absolute inset-0 bg-[#3a2318] pointer-events-none z-0 overflow-hidden" style={{ perspective: '1200px' }}>
        {/* Seamless Floor (Clean Dark Wood) */}
        <div className="absolute inset-[-50%] top-[-20%] bg-[#4a2e1b] bg-opacity-100" style={{ 
          transform: 'rotateX(45deg)',
          transformOrigin: 'center 40%'
        }}></div>
        
        {/* Wall/Floor Transition Shadow & Baseboard Illusion */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a1a10] via-transparent to-transparent opacity-80 h-[40%]"></div>
        <div className="absolute top-[25%] left-0 w-full h-10 bg-gradient-to-b from-[#2a1a10]/60 to-transparent pointer-events-none border-t border-[#1a0f0a]/30"></div>
        
        {/* Ambient Warm Spotlight & Global Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,_rgba(255,210,120,0.15)_0%,_transparent_45%,_rgba(0,0,0,0.75)_100%)] pointer-events-none z-50"></div>
      </div>

      {/* Header with NPC (Fixed) */}
      <header className="absolute top-2 left-1/2 -translate-x-1/2 z-40 w-full pointer-events-none transition-opacity duration-500 flex flex-col items-center" style={{ opacity: viewStatus === 'lobby' ? 1 : 0 }}>
        
        {/* Title Group (Hanging Sign) */}
        <div className="flex flex-col items-center relative mt-4 group">
          {/* Ropes */}
          <div className="absolute -top-12 left-12 w-1 h-12 bg-[#3e2723] [background-image:repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(0,0,0,0.5)_2px,rgba(0,0,0,0.5)_4px)]"></div>
          <div className="absolute -top-12 right-12 w-1 h-12 bg-[#3e2723] [background-image:repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(0,0,0,0.5)_2px,rgba(0,0,0,0.5)_4px)]"></div>
          
          <h1 className="text-xl font-black text-[#3e2723] flex items-center justify-center bg-[#d2b48c] px-8 py-3 rounded-sm border-y-[6px] border-x-[4px] border-[#4a2e1b] shadow-[0_10px_25px_rgba(0,0,0,0.6)] pointer-events-auto relative transition-transform origin-top [background-image:repeating-linear-gradient(0deg,transparent,transparent_4px,rgba(139,90,43,0.1)_4px,rgba(139,90,43,0.1)_8px)] cursor-pointer">
            {/* Cracks / Wood Grain illusion */}
            <div className="absolute top-2 left-4 w-12 h-px bg-[#8b5a2b]/30 -rotate-6"></div>
            <div className="absolute bottom-3 right-6 w-16 h-px bg-[#8b5a2b]/30 rotate-3"></div>
            
            {/* Nails */}
            <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-stone-500 border border-[#1a0f0a] shadow-inner"></div>
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-stone-500 border border-[#1a0f0a] shadow-inner"></div>
            <div className="absolute bottom-1 left-1 w-2 h-2 rounded-full bg-stone-500 border border-[#1a0f0a] shadow-inner"></div>
            <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-stone-500 border border-[#1a0f0a] shadow-inner"></div>
            
            <ShoppingBag size={22} className="mr-3 text-[#3e2723] group-hover:drop-shadow-[0_0_5px_rgba(147,51,234,0.6)] transition-all" />
            <span className="group-hover:drop-shadow-[0_0_8px_rgba(147,51,234,0.8)] transition-all duration-300">冒險者公會物資小屋</span>
          </h1>
        </div>

      </header>

      {/* Return Button */}
      <button 
        onClick={() => setViewStatus('lobby')}
        className={`absolute top-6 left-6 z-50 bg-[#4a3b32] text-[#f4e8d1] px-5 py-2.5 rounded-xl font-black border-2 border-[#8b5a2b] shadow-[0_5px_0_#2a221c] active:translate-y-[5px] active:shadow-none hover:bg-[#5c4a3d] transition-all flex items-center ${viewStatus === 'lobby' || viewStatus === 'library' || viewStatus === 'legacy' ? 'opacity-0 pointer-events-none -translate-y-4' : 'opacity-100 translate-y-0'}`}
      >
        <Undo2 className="mr-2" size={20} /> ↩️ 返回商店大廳
      </button>

      {/* Global Error Message */}
      {errorMessage && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-[#c62828] text-[#f4e8d1] px-6 py-3 rounded-xl font-bold shadow-2xl animate-bounce border-2 border-[#ffcdd2]">
          {errorMessage}
        </div>
      )}

      {/* Transform Wrapper (Zoom Lens) */}
      <div className={`w-full h-[750px] relative transition-transform duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-center ${getTransformClasses()}`}>
        
        {/* ============================== */}
        {/* LOBBY VIEW HOTSPOTS            */}
        {/* ============================== */}
        <div className={`absolute inset-0 w-full h-full transition-opacity duration-500 group/lobby ${viewStatus === 'lobby' ? 'opacity-100 z-10 delay-300' : 'opacity-0 pointer-events-none -z-10'}`}>
          
          {/* Midnight Moonbeam & Glowing Particles */}
          <div className="absolute top-0 left-[-10%] w-[120%] h-[120%] pointer-events-none z-20 [background:linear-gradient(135deg,rgba(30,58,138,0.25)_0%,rgba(30,58,138,0.05)_40%,transparent_60%)] [clip-path:polygon(0_0,50%_0,75%_100%,10%_100%)] mix-blend-screen">
            {/* Dust Particles */}
            <div className="absolute top-[30%] left-[30%] w-1.5 h-1.5 bg-blue-100 rounded-full opacity-60 animate-[pulse_3s_ease-in-out_infinite_alternate] shadow-[0_0_8px_rgba(191,219,254,0.8)]"></div>
            <div className="absolute top-[40%] left-[45%] w-1 h-1 bg-yellow-100 rounded-full opacity-50 animate-[pulse_4s_ease-in-out_infinite_alternate_0.5s] shadow-[0_0_5px_rgba(254,240,138,0.8)]"></div>
            <div className="absolute top-[55%] left-[35%] w-2 h-2 bg-blue-200 rounded-full opacity-40 animate-[pulse_2.5s_ease-in-out_infinite_alternate_1s] shadow-[0_0_10px_rgba(191,219,254,0.8)]"></div>
            <div className="absolute top-[65%] left-[50%] w-1.5 h-1.5 bg-white rounded-full opacity-60 animate-[pulse_5s_ease-in-out_infinite_alternate_0.2s] shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
            <div className="absolute top-[20%] left-[40%] w-1 h-1 bg-blue-100 rounded-full opacity-50 animate-[pulse_3.5s_ease-in-out_infinite_alternate_1.5s] shadow-[0_0_5px_rgba(191,219,254,0.8)]"></div>
            <div className="absolute top-[75%] left-[35%] w-2 h-2 bg-yellow-100 rounded-full opacity-50 animate-[pulse_4.5s_ease-in-out_infinite_alternate_0.8s] shadow-[0_0_10px_rgba(254,240,138,0.8)]"></div>
          </div>

          {/* Foreground Left: Blurred Old Books & Candle (z-50) */}
          <div className="absolute bottom-[-2%] left-[-2%] z-50 pointer-events-none blur-[2px] opacity-80 flex flex-col items-start -rotate-6">
            <div className="w-48 h-8 bg-[#5c3a21] border-2 border-[#2a1a10] rounded-sm flex items-center px-2 shadow-lg"><div className="w-full h-1 bg-white/20"></div></div>
            <div className="w-56 h-10 bg-[#4a2e1b] border-2 border-[#2a1a10] rounded-sm -ml-2 mt-1 flex items-center px-2 shadow-lg relative">
              <div className="w-full h-2 bg-white/10"></div>
              {/* Small Candle */}
              <div className="absolute -top-4 right-8 w-3 h-4 bg-[#f4e8d1] border border-[#8b5a2b] rounded-t-sm">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-2.5 bg-gradient-to-t from-yellow-200 to-orange-500 rounded-full animate-[pulse_1s_ease-in-out_infinite_alternate] shadow-[0_0_15px_rgba(255,150,0,0.8)] opacity-90"></div>
              </div>
            </div>
            <div className="w-40 h-6 bg-[#3e2723] border-2 border-[#2a1a10] rounded-sm ml-4 mt-1 shadow-lg"></div>
          </div>

          {/* Foreground Right: Blurred Oil Lamp & Floor Candle (z-50) */}
          <div className="absolute bottom-[-1%] right-[2%] z-50 pointer-events-none blur-[2px] opacity-85 flex flex-col items-center">
            <div className="w-6 h-10 bg-[radial-gradient(ellipse_at_center,_rgba(255,200,100,0.9)_0%,_rgba(200,100,0,0.4)_100%)] rounded-t-full border-2 border-[#5c3a21] shadow-[0_0_30px_rgba(255,150,0,0.8)] animate-[pulse_1.5s_ease-in-out_infinite_alternate]"></div>
            <div className="w-14 h-8 bg-[#2a1a10] border-2 border-black rounded-b-md shadow-2xl relative">
              {/* Floor Candle beside it */}
              <div className="absolute -left-10 bottom-0 w-4 h-6 bg-[#e0cda5] border border-[#8b5a2b] rounded-t-sm">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-3 bg-gradient-to-t from-yellow-100 to-amber-500 rounded-full animate-[pulse_1.2s_ease-in-out_infinite_alternate] shadow-[0_0_20px_rgba(255,180,0,0.9)] opacity-90"></div>
              </div>
            </div>
          </div>


          
          {/* 4-Column Grid Layout */}
          <div className="absolute inset-0 z-30 flex items-center justify-center pt-32 px-6 pointer-events-none">
            <div className="w-full max-w-[1400px] grid grid-cols-4 gap-6 pointer-events-auto items-end">
              
              {/* 1. Gacha Column */}
              <div onClick={() => setViewStatus('gacha')} className="relative flex flex-col items-center cursor-pointer transition-all duration-500 group-hover/lobby:[&:not(:hover)]:opacity-40 group-hover/lobby:[&:not(:hover)]:blur-[2px] hover:scale-105 group-hover/lobby:[&:not(:hover)]:scale-95 animate-bounce-slow hover:drop-shadow-[0_0_20px_rgba(255,215,0,0.6)] w-full">
                <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,215,0,0.4)_0%,_transparent_70%)] opacity-0 hover:opacity-100 transition-opacity duration-500 scale-150 blur-xl pointer-events-none"></div>
                <div className="w-48 h-96 bg-[#2a221c] bg-opacity-100 rounded-t-[100px] rounded-b-xl border-[6px] border-[#8b5a2b] flex flex-col items-center justify-center shadow-2xl relative z-10 overflow-hidden mx-auto mb-6">
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                  <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                  <span className="text-[120px] drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:drop-shadow-[0_0_30px_rgba(255,215,0,0.9)] transition-all duration-300 translate-y-4">🎰</span>
                  <span className="mt-8 text-lg font-black text-[#f4e8d1] drop-shadow-md bg-black/50 px-4 py-1.5 rounded-lg border border-white/20 z-10 translate-y-6">命運轉蛋機</span>
                </div>
                {/* Floor Shadow */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-56 h-10 bg-stone-950/30 blur-[6px] scale-y-[0.3] rounded-[100%] pointer-events-none"></div>
              </div>

              {/* 2. Market Column */}
              <div onClick={() => setViewStatus('market')} className="relative flex flex-col items-center cursor-pointer transition-all duration-500 group-hover/lobby:[&:not(:hover)]:opacity-40 group-hover/lobby:[&:not(:hover)]:blur-[2px] hover:scale-105 group-hover/lobby:[&:not(:hover)]:scale-95 animate-bounce-slow hover:drop-shadow-[0_0_20px_rgba(255,215,0,0.6)] w-full" style={{ animationDelay: '0.2s' }}>
                <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,215,0,0.4)_0%,_transparent_70%)] opacity-0 hover:opacity-100 transition-opacity duration-500 scale-150 blur-xl pointer-events-none"></div>
                <div className="w-56 h-48 bg-[#d0b48c] bg-opacity-100 rounded-xl border-y-[12px] border-x-[6px] border-[#5c3a21] flex flex-col items-center justify-center shadow-2xl relative z-10 overflow-visible mx-auto mb-10">
                  <div className="absolute top-1/2 left-0 w-full h-3 bg-[#4a2e1b] shadow-inner opacity-60 pointer-events-none"></div>
                  {/* Parchment Discount Note */}
                  <div className="absolute -top-4 -right-6 z-30 animate-[pulse_2s_ease-in-out_infinite] pointer-events-none rotate-12">
                    <div className="bg-[#f4e8d1] text-[#4a3b32] font-black text-xs px-3 py-1 shadow-md border border-[#8b5a2b] rounded-sm transform origin-bottom-left [box-shadow:3px_3px_0px_rgba(0,0,0,0.2)]">今日特惠 -30%</div>
                  </div>
                  <div className="flex space-x-2 -translate-y-6 relative z-10">
                    <span className="text-[60px] drop-shadow-xl hover:scale-110 transition-transform duration-300">🍜</span>
                    <span className="text-[60px] drop-shadow-xl hover:scale-110 transition-transform duration-300 delay-75">📐</span>
                  </div>
                  <span className="absolute bottom-[-15px] text-lg font-black text-[#4a3b32] bg-[#f4e8d1]/95 px-5 py-1.5 rounded-lg border-[3px] border-[#8b5a2b]/40 shadow-sm z-20">日常補給</span>
                </div>
                {/* Floor Shadow */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 h-12 bg-stone-950/30 blur-[6px] scale-y-[0.3] rounded-[100%] pointer-events-none"></div>
              </div>

              {/* 3. Legacy Column */}
              <div onClick={() => setViewStatus('legacy')} className="relative flex flex-col items-center cursor-pointer transition-all duration-500 group-hover/lobby:[&:not(:hover)]:opacity-40 group-hover/lobby:[&:not(:hover)]:blur-[2px] hover:scale-105 group-hover/lobby:[&:not(:hover)]:scale-95 animate-bounce-slow hover:drop-shadow-[0_0_20px_rgba(156,39,176,0.6)] w-full" style={{ animationDelay: '0.4s' }}>
                <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(156,39,176,0.8)_0%,_transparent_60%)] opacity-0 hover:opacity-100 transition-opacity duration-500 scale-[2.5] blur-3xl pointer-events-none z-0"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(156,39,176,0.4)_0%,_transparent_50%)] animate-pulse scale-[2.0] blur-2xl pointer-events-none z-0"></div>
                <div className="w-56 h-56 bg-gradient-to-br from-[#2a003e] to-[#15001f] bg-opacity-100 rounded-full border-[6px] border-[#9c27b0] flex flex-col items-center justify-center shadow-[0_0_50px_rgba(156,39,176,0.4)] hover:shadow-[0_0_80px_rgba(156,39,176,0.9)] relative z-10 mx-auto mb-10">
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-[spin_10s_linear_infinite] scale-90"></div>
                  <span className="text-[90px] drop-shadow-[0_0_25px_rgba(255,215,0,0.9)] hover:scale-110 transition-transform duration-300">🔮</span>
                  <span className="absolute -bottom-6 text-lg font-black text-[#f4e8d1] bg-[#2a003e] px-4 py-1.5 rounded-lg border-2 border-[#9c27b0] shadow-[0_4px_0_#15001f] z-20">前輩魔法書</span>
                </div>
                {/* Floor Shadow */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-60 h-12 bg-stone-950/30 blur-[6px] scale-y-[0.3] rounded-[100%] pointer-events-none"></div>
              </div>

              {/* 4. Library Column */}
              <div onClick={() => setViewStatus('library')} className="relative flex flex-col items-center cursor-pointer transition-all duration-500 group-hover/lobby:[&:not(:hover)]:opacity-40 group-hover/lobby:[&:not(:hover)]:blur-[2px] hover:scale-105 group-hover/lobby:[&:not(:hover)]:scale-95 animate-bounce-slow hover:drop-shadow-[0_0_20px_rgba(255,215,0,0.6)] w-full" style={{ animationDelay: '0.6s' }}>
                <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(139,90,43,0.8)_0%,_transparent_60%)] opacity-0 hover:opacity-100 transition-opacity duration-500 scale-[2.0] blur-2xl pointer-events-none z-0"></div>
                <div className="w-48 h-[22rem] bg-[#4a2e1b] rounded-sm border-[6px] border-[#3e2723] flex flex-col shadow-2xl relative z-10 mx-auto mb-6">
                  {/* Flat 2D shelves */}
                  <div className="h-1/4 border-b-[6px] border-[#3e2723] flex items-end px-2 space-x-1">
                    <div className="w-4 h-12 bg-red-900 rounded-t-sm"></div>
                    <div className="w-5 h-14 bg-blue-900 rounded-t-sm"></div>
                    <div className="w-4 h-10 bg-green-900 -rotate-12 transform origin-bottom rounded-t-sm ml-2"></div>
                  </div>
                  <div className="h-1/4 border-b-[6px] border-[#3e2723] flex items-end px-2 space-x-2 justify-end">
                    <div className="w-6 h-10 bg-purple-900 rounded-t-sm"></div>
                    <div className="w-3 h-14 bg-yellow-700 rounded-t-sm"></div>
                  </div>
                  <div className="h-1/4 border-b-[6px] border-[#3e2723] flex items-end px-2 space-x-1">
                    <div className="w-12 h-5 bg-[#d7ccc8] rounded-sm border-2 border-stone-400"></div>
                    <div className="w-10 h-4 bg-[#bcaaa4] rounded-sm border-2 border-stone-500"></div>
                  </div>
                  <div className="h-1/4 flex items-end justify-center pb-2 relative z-10">
                    <span className="text-[14px] font-black text-[#f4e8d1] bg-[#2a221c] px-3 py-1 rounded-sm shadow-md border-2 border-[#5c3a21]">公會圖書館</span>
                  </div>
                  <div className="absolute inset-0 bg-black/10 pointer-events-none z-0"></div>
                </div>
                {/* Floor Shadow */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-56 h-10 bg-stone-950/30 blur-[6px] scale-y-[0.3] rounded-[100%] pointer-events-none"></div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ============================== */}
      {/* SUB PANELS                     */}
      {/* ============================== */}
        
      {/* Gacha Panel */}
        <div className={`absolute inset-0 flex justify-center items-center transition-opacity duration-500 ${viewStatus === 'gacha' ? 'opacity-100 z-20 delay-[400ms]' : 'opacity-0 pointer-events-none'}`}>
          <div className="bg-black/20 absolute inset-0 -z-10 backdrop-blur-sm"></div>
          {renderLootCard(lootItems[2])}
        </div>

        {/* Market Panel */}
        <div className={`absolute inset-0 flex flex-col justify-center items-center gap-6 transition-opacity duration-500 ${viewStatus === 'market' ? 'opacity-100 z-20 delay-[400ms]' : 'opacity-0 pointer-events-none'}`}>
          <div className="bg-black/20 absolute inset-0 -z-10 backdrop-blur-sm"></div>
          
          <div className="flex justify-between items-center bg-[#4a3b32]/95 p-4 rounded-xl border-2 border-[#8b5a2b]/40 mb-2 w-[680px] shadow-lg relative z-10">
            <span className="font-bold text-[#e0cda5]">💡 每日都會有一項黑市商品隨機打 7 折！</span>
            <button 
              onClick={handleRefreshMarket}
              className="bg-gradient-to-b from-[#6a1b9a] to-[#ab47bc] text-[#f4e8d1] hover:brightness-110 px-4 py-2 rounded-xl font-black text-sm transition-all border-2 border-[#4a148c] shadow-[0_4px_0_#4a148c] active:translate-y-[4px] active:shadow-none shadow-md"
            >
              [ 🔮 消耗 20 MP 強制刷新黑市特價 ]
            </button>
          </div>

          <div className="flex gap-12 w-[680px] justify-center items-stretch">
            {renderLootCard(lootItems[0])}
            {renderLootCard(lootItems[1])}
          </div>
        </div>

        {/* Legacy Panel */}
        <div className={`absolute inset-0 flex justify-center items-center transition-opacity duration-500 ${viewStatus === 'legacy' ? 'opacity-100 z-30 delay-[400ms]' : 'opacity-0 pointer-events-none'}`}>
          <div className="bg-black/60 absolute inset-0 -z-10 backdrop-blur-md"></div>
          <div className="w-[95%] max-w-7xl bg-[#1a0f0a]/95 border-[6px] border-[#5c3a21] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] px-12 py-8 flex flex-col relative">
            
            {/* Header */}
            <div className="w-full flex items-center justify-center mb-8 relative border-b-2 border-[#5c3a21]/50 pb-6">
              <button 
                onClick={() => setViewStatus('lobby')}
                className="absolute left-0 bg-[#4a3b32] text-[#f4e8d1] px-5 py-2.5 rounded-xl font-black border-2 border-[#8b5a2b] shadow-[0_5px_0_#2a221c] active:translate-y-[5px] active:shadow-none hover:bg-[#5c4a3d] transition-all flex items-center"
              >
                <Undo2 className="mr-2" size={20} /> ↩️ 返回商店大廳
              </button>
              <h2 className="text-4xl font-black text-[#f4e8d1] flex items-center drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] tracking-widest">
                <span className="text-3xl mr-4">🔮</span>
                前輩魔法書專櫃
              </h2>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-4 gap-6 w-full items-stretch flex-1">
              {legacyItems.map(item => renderLegacyCard(item))}
            </div>
          </div>
        </div>

        {/* Guild Library Panel (Opened Grimoire) */}
        <div className={`absolute inset-0 flex justify-center items-center transition-opacity duration-500 ${viewStatus === 'library' ? 'opacity-100 z-30 delay-[400ms]' : 'opacity-0 pointer-events-none'}`}>
          <div className="bg-black/60 absolute inset-0 -z-10 backdrop-blur-md"></div>
          
          <div className={`w-[95%] max-w-5xl h-[90%] bg-[#f4e8d1] rounded-lg relative flex flex-col origin-center transition-transform duration-500 shadow-[inset_0_0_30px_rgba(139,90,43,0.2),-2px_2px_0_#f4e8d1,-4px_4px_0_#d2b48c,-6px_6px_0_#8b5a2b,2px_2px_0_#f4e8d1,4px_4px_0_#d2b48c,6px_6px_0_#8b5a2b,0_25px_50px_rgba(0,0,0,0.8)] ${viewStatus === 'library' ? 'scale-100' : 'scale-50'}`}>
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-50 pointer-events-none rounded-lg" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139, 90, 43, 0.08) 2px, rgba(139, 90, 43, 0.08) 4px)' }}></div>
            
            <div className="flex-1 flex relative z-10 p-2 overflow-hidden">
              {/* Book Spine Crease Shading (16px wide = w-4) */}
              <div className="absolute top-0 bottom-0 left-[35%] -translate-x-1/2 w-4 bg-gradient-to-r from-transparent via-stone-950/20 to-transparent pointer-events-none z-30 mix-blend-multiply"></div>
              
              {/* Left Page Page Curl (Micro Curl) */}
              <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-stone-900/10 to-transparent pointer-events-none z-20 mix-blend-multiply"></div>
              
              {/* Right Page Page Curl (Micro Curl) */}
              <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-stone-900/10 to-transparent pointer-events-none z-20 mix-blend-multiply"></div>

              {/* Left Page: Index (35%) */}
              <div className="w-[35%] flex flex-col p-8 pr-10 overflow-hidden relative z-10">
                <h3 className="text-3xl font-black font-serif text-[#4a3b32] mb-8 flex items-center border-b-2 border-[#8b5a2b]/30 pb-4 drop-shadow-[1px_1px_0_rgba(255,255,255,0.8)] tracking-widest">
                  <span className="text-3xl mr-3 drop-shadow-md">📖</span> 公會圖書館
                </h3>
                <div className="flex flex-col space-y-4 overflow-y-auto custom-scrollbar pr-2 pb-6">
                  {libraryTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveLibraryTab(tab.id)}
                      className={`w-full text-left p-4 rounded-xl flex items-center transition-all duration-300 ${
                        activeLibraryTab === tab.id
                          ? 'bg-gradient-to-b from-[#8b5a2b] to-[#6a421b] text-[#f4e8d1] shadow-[inset_0_3px_8px_rgba(0,0,0,0.5),0_1px_1px_rgba(255,255,255,0.4)] font-black border border-[#4a2e1b] translate-y-px'
                          : 'bg-[#e0cda5]/30 text-[#4a3b32] shadow-[inset_0_2px_4px_rgba(139,90,43,0.15),0_1px_0_rgba(255,255,255,0.6)] border border-[#8b5a2b]/20 hover:bg-[#8b5a2b]/10 hover:shadow-[inset_0_2px_8px_rgba(139,90,43,0.25)] font-bold'
                      }`}
                    >
                      <span className="text-3xl mr-4 drop-shadow-sm">{tab.icon}</span>
                      <span className="text-[17px] tracking-wide leading-tight">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Page: Details Content Page (65%) */}
              <div className="w-[65%] flex flex-col p-8 pl-14 overflow-hidden relative z-10">
                
                {/* Loot History */}
                {activeLibraryTab === 'loot-history' && (
                  <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
                    <h3 className="text-3xl font-black text-[#7a6350] mb-6 flex items-center border-b-2 border-[#8b5a2b]/20 pb-4 flex-shrink-0">
                      📖 冒險手札紀錄
                    </h3>
                    <div className="w-full flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-4 pb-20">
                      {lootHistory.length === 0 ? (
                        <div className="text-center text-[#8b5a2b] font-bold mt-8 opacity-60">尚無手札紀錄。快去命運轉蛋機碰碰運氣！</div>
                      ) : (
                        lootHistory.map((loot, idx) => (
                          <div key={idx} className="bg-[#e0cda5]/40 border-2 border-[#8b5a2b]/20 p-5 rounded-xl relative overflow-hidden shadow-sm">
                            <div className="absolute top-0 right-0 bg-[#8b5a2b]/10 px-4 py-1.5 rounded-bl-xl text-sm font-black text-[#5c3a21]">{loot.date}</div>
                            <h4 className="font-black text-[#4a3b32] mb-3 text-xl pr-20">{loot.title}</h4>
                            <p className="text-[14px] text-[#5c4a3d] font-bold leading-relaxed whitespace-pre-wrap">{loot.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Legacy Projects */}
                {activeLibraryTab === 'legacy-projects' && (
                  <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
                    <h3 className="text-3xl font-black text-[#7a6350] mb-6 flex items-center border-b-2 border-[#8b5a2b]/20 pb-4 flex-shrink-0">
                      🔮 傳奇造物卷宗
                    </h3>
                    <div className="w-full flex-1 overflow-y-auto custom-scrollbar pr-4 flex flex-col space-y-6 pb-20">
                      {unlockedLegacyProjects.length === 0 ? (
                        <div className="text-center text-[#8b5a2b] font-bold mt-8 opacity-60">尚無前輩造物。前往前輩魔法書專櫃購買！</div>
                      ) : (
                        unlockedLegacyProjects.map(proj => (
                          <div key={proj.id} className={`flex-shrink-0 bg-[#2a221c]/95 border-[4px] ${proj.colors.border} p-6 rounded-2xl flex flex-col shadow-xl relative overflow-hidden group w-full`}>
                            {proj.rarity === 'Epic' && <div className="absolute top-0 right-0 bg-yellow-600 text-white text-xs font-black px-4 py-1 rounded-bl-xl shadow-sm">傳奇專案</div>}
                            {proj.rarity === 'Rare' && <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-black px-4 py-1 rounded-bl-xl shadow-sm">得獎專案</div>}
                            
                            <div className="flex items-center space-x-4 mb-2 mt-1">
                              <span className={`text-4xl ${proj.colors.textPrimary} drop-shadow-md`}>{proj.icon}</span>
                              <h4 className={`font-black text-2xl tracking-wide ${proj.colors.textPrimary}`}>{proj.title}</h4>
                            </div>
                            
                            <p className="text-sm text-stone-400 font-black mb-4 border-b border-white/10 pb-3">{proj.schoolName}</p>
                            <p className={`text-sm ${proj.colors.textSecondary} mb-5 font-bold leading-relaxed`}>{proj.description}</p>
                            
                            <div className="w-full h-80 bg-black/80 rounded-xl border-4 border-[#5c3a21] shadow-inner relative overflow-hidden flex flex-col items-center justify-center mt-2 group-hover:border-[#8b5a2b] transition-colors">
                              <span className="text-[#8b5a2b] font-black text-2xl mb-2 opacity-60 flex items-center animate-pulse">
                                <span className="mr-3 text-3xl">🎮</span> 專案活體預覽載入中...
                              </span>
                              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.03)_25%,rgba(255,255,255,0.03)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.03)_75%,rgba(255,255,255,0.03)_100%)] bg-[length:20px_20px] pointer-events-none"></div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Wooden Close Button */}
            <button 
              onClick={() => setViewStatus('lobby')}
              className="absolute bottom-6 right-8 bg-[#8b5a2b] text-[#f4e8d1] px-6 py-3 rounded-xl font-black text-sm border-[3px] border-[#4a2e1b] shadow-[0_5px_0_#4a2e1b] active:translate-y-[5px] active:shadow-none hover:bg-[#7a4e25] transition-all flex items-center z-50 group"
            >
              <span className="mr-2 group-hover:-translate-x-1 transition-transform">↩️</span> 返回商店大廳
            </button>
          </div>
        </div>


      {/* ============================== */}
      {/* RARITY LOOT MODAL              */}
      {/* ============================== */}
      {activeGachaModal && (() => {
        const styles = getRarityStyles(activeGachaModal.rarity);
        return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-950/40 backdrop-blur-[2px] p-4">
          
          <div className={`absolute pointer-events-none inset-0 flex items-center justify-center`}>
            <div 
              className={`w-[150%] h-[150%] max-w-4xl bg-[radial-gradient(circle,_var(--tw-gradient-stops))] ${styles.glow} to-transparent blur-2xl opacity-90 mix-blend-screen`}
              style={{ transform: 'scale(0)', animation: 'modalScaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
            ></div>
          </div>

          <div 
            className={`relative max-w-md w-full transition-all duration-300 ${styles.shadow} rounded-2xl`}
            style={{ transform: 'scale(0)', animation: 'modalScaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s forwards' }}
          >
            <div className={`bg-[#f4e8d1] border-[6px] border-[#4a3b32] rounded-2xl relative p-8 text-center overflow-visible`}>
              <div className={`absolute inset-0 border-[3px] ${styles.border} rounded-xl pointer-events-none opacity-80 m-[2px]`}></div>
              
              <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-stone-400 border border-stone-800 shadow-sm shadow-black/50 z-10"></div>
              <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-stone-400 border border-stone-800 shadow-sm shadow-black/50 z-10"></div>
              <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-stone-400 border border-stone-800 shadow-sm shadow-black/50 z-10"></div>
              <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-stone-400 border border-stone-800 shadow-sm shadow-black/50 z-10"></div>

              <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 drop-shadow-md">
                <div className={`${styles.ribbonBg} ${styles.ribbonText} px-6 py-1.5 rounded-sm font-black text-sm tracking-widest border-2 border-[#4a3b32] shadow-[0_4px_0_#4a3b32] flex items-center`}>
                  <span className="mr-2 text-lg">{styles.icon}</span> 
                  {activeGachaModal.rarity === 'Epic' ? '💎 EPIC 史詩稱號' : activeGachaModal.rarity === 'Rare' ? '🌟 RARE 高級八卦' : '📦 基礎物資'}
                </div>
                <div className="absolute top-full left-0 w-2 h-2 bg-black/50 [clip-path:polygon(0_0,100%_0,100%_100%)]"></div>
                <div className="absolute top-full right-0 w-2 h-2 bg-black/50 [clip-path:polygon(0_0,100%_0,0_100%)]"></div>
              </div>

              <h2 className="text-3xl font-black text-[#4a3b32] mb-6 flex items-center justify-center border-b-2 border-[#8b5a2b]/30 pb-4 mt-4 drop-shadow-sm">
                <span className="mr-3 text-2xl drop-shadow-md opacity-90">📜</span>
                {activeGachaModal.title}
              </h2>
              
              <p className="text-lg font-bold text-[#4a3b32] mb-8 bg-[#e0cda5]/50 p-6 rounded-xl border border-[#8b5a2b]/30 leading-relaxed whitespace-pre-wrap w-full shadow-inner relative z-10">
                {activeGachaModal.text}
              </p>
              
              <button 
                onClick={() => {
                  if (activeGachaModal.newTitle) {
                    unlockTitle(activeGachaModal.newTitle);
                  }
                  setActiveGachaModal(null);
                }}
                className={`w-4/5 mx-auto py-3.5 bg-gradient-to-b from-[#34c759] to-[#2e7d32] border-b-4 border-[#1b5e20] text-white font-black text-xl rounded-xl hover:brightness-110 transition-all shadow-[0_5px_0_rgba(27,94,32,0.8)] active:shadow-none active:translate-y-[5px] active:border-b-0 flex justify-center items-center relative z-20`}
              >
                🤝 收入冒險手札，點亮圖鑑
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      <style dangerouslySetInnerHTML={{__html: `
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-bounce-slow {
          animation: bounceSlow 3s infinite ease-in-out;
        }
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes flyOutTop {
          0% { transform: translate(-50%, 0) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -100px) scale(0); opacity: 0; }
        }
        @keyframes flyOutBottom {
          0% { transform: translate(-50%, 0) scale(1); opacity: 1; }
          100% { transform: translate(-50%, 100px) scale(0); opacity: 0; }
        }
        @keyframes flyOutLeft {
          0% { transform: translate(0, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-100px, -50%) scale(0); opacity: 0; }
        }
        @keyframes flyOutRight {
          0% { transform: translate(0, -50%) scale(1); opacity: 1; }
          100% { transform: translate(100px, -50%) scale(0); opacity: 0; }
        }
        @keyframes modalScaleIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes chopsticksTap {
          0%, 100% { transform: translate(0, -10px) rotate(-15deg); }
          50% { transform: translate(-15px, 15px) rotate(-35deg); }
        }
        @keyframes steamRise {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-40px) scale(1.5); opacity: 0; }
        }
        @keyframes bowlShrink {
          0% { transform: scale(1); }
          50% { transform: scale(0.8) rotate(-5deg); }
          80% { transform: scale(0.6) rotate(5deg); }
          100% { transform: scale(0.4) translateY(20px); opacity: 0.5; }
        }
        @keyframes flyUpFade {
          0% { transform: translateY(10px) scale(0.5); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-60px) scale(1.2); opacity: 0; }
        }
        @keyframes floatFast {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes leafSpin {
          0% { transform: rotate(0deg) translateX(40px) rotate(0deg) scale(0.5); opacity: 0; }
          10% { opacity: 1; scale(1); }
          90% { opacity: 1; scale(1); }
          100% { transform: rotate(360deg) translateX(40px) rotate(-360deg) scale(0.5); opacity: 0; }
        }
        @keyframes flyInTop {
          0% { transform: translate(-50%, -80px) scale(0); opacity: 0; }
          20% { opacity: 1; }
          80% { transform: translate(-50%, 0) scale(1.5); opacity: 1; }
          100% { transform: translate(-50%, 0) scale(0); opacity: 0; }
        }
        @keyframes flyInBottom {
          0% { transform: translate(-50%, 80px) scale(0); opacity: 0; }
          20% { opacity: 1; }
          80% { transform: translate(-50%, 0) scale(1.5); opacity: 1; }
          100% { transform: translate(-50%, 0) scale(0); opacity: 0; }
        }
        @keyframes flyInLeft {
          0% { transform: translate(-80px, -50%) scale(0); opacity: 0; }
          20% { opacity: 1; }
          80% { transform: translate(0, -50%) scale(1.5); opacity: 1; }
          100% { transform: translate(0, -50%) scale(0); opacity: 0; }
        }
        @keyframes flyInRight {
          0% { transform: translate(80px, -50%) scale(0); opacity: 0; }
          20% { opacity: 1; }
          80% { transform: translate(0, -50%) scale(1.5); opacity: 1; }
          100% { transform: translate(0, -50%) scale(0); opacity: 0; }
        }
      `}} />
    </div>
  );
}
