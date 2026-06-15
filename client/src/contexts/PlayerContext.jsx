import React, { createContext, useContext, useState, useEffect } from 'react';
import confettiPkg from 'canvas-confetti';
const confetti = typeof confettiPkg === 'function' ? confettiPkg : confettiPkg.default;

const PlayerContext = createContext();

export function usePlayer() {
  return useContext(PlayerContext);
}

export function PlayerProvider({ children }) {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [hp, setHp] = useState(100);
  const [mp, setMp] = useState(50);
  const [activeTitle, setActiveTitle] = useState('大馬萌新');
  const [unlockedTitles, setUnlockedTitles] = useState(['大馬萌新']);
  const [activeAvatar, setActiveAvatar] = useState('avatar_default');
  const [unlockedAvatars, setUnlockedAvatars] = useState(['avatar_default', 'avatar_girl_wizard']);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [firstClearQuests, setFirstClearQuests] = useState([]);
  
  // Custom Quest Flags
  const [projectBought, setProjectBought] = useState(false);
  const [projectQuestCleared, setProjectQuestCleared] = useState(false);

  // Shop History & Limits
  const [lootHistory, setLootHistory] = useState([]);
  const [dailyPurchases, setDailyPurchases] = useState({}); // { [itemId]: { date, count } }
  const [unlockedLegacyProjects, setUnlockedLegacyProjects] = useState([]); // Array of { id, title, description, school, rarity }
  
  // Global Almanac State
  const [isAlmanacOpen, setIsAlmanacOpen] = useState(false);
  const [activeAlmanacTab, setActiveAlmanacTab] = useState('dorm-network');
  
  // Yggdrasil Modal State
  const [isYggdrasilOpen, setIsYggdrasilOpen] = useState(false);

  // Eye Protection Mode State
  const [isEyeCare, setIsEyeCare] = useState(false);

  // Inventory & Hidden Collectibles
  const [inventory, setInventory] = useState([]);
  const [collectedHiddenItems, setCollectedHiddenItems] = useState([]);

  // Multi-Scene Management
  const [currentSceneId, setCurrentSceneId] = useState('malaysia_room');

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('player_stats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLevel(parsed.level || 1);
        setXp(parsed.xp || 0);
        setCoins(parsed.coins || 0);
        setHp(parsed.hp !== undefined ? parsed.hp : 100);
        setMp(parsed.mp !== undefined ? parsed.mp : 50);
        setActiveTitle(parsed.activeTitle || parsed.title || '大馬萌新');
        setUnlockedTitles(parsed.unlockedTitles || ['大馬萌新']);
        setActiveAvatar(parsed.activeAvatar || 'avatar_default');
        setUnlockedAvatars(parsed.unlockedAvatars || ['avatar_default', 'avatar_girl_wizard']);
        setFirstClearQuests(parsed.firstClearQuests || []);
        setProjectBought(parsed.projectBought || false);
        setProjectQuestCleared(parsed.projectQuestCleared || false);
        setLootHistory(parsed.lootHistory || []);
        setDailyPurchases(parsed.dailyPurchases || {});
        setUnlockedLegacyProjects(parsed.unlockedLegacyProjects || []);
        setIsEyeCare(parsed.isEyeCare || false);
        setInventory(parsed.inventory || []);
        setCollectedHiddenItems(parsed.collectedHiddenItems || []);
        setCurrentSceneId(parsed.currentSceneId || 'malaysia_room');
      } catch (e) {
        console.error('Failed to parse player stats', e);
      }
    }

    // Daily Auto-Refresh Check (Real-time midnight tracking)
    const checkDailyReset = () => {
      const today = new Date().toLocaleDateString();
      const lastLogin = localStorage.getItem('last_login_date');
      if (lastLogin !== today) {
        setHp(100); // Refill HP automatically when crossing midnight
        localStorage.setItem('last_login_date', today);
      }
    };
    
    // Check immediately on mount
    checkDailyReset();
    
    // And check every minute while the app is open
    const resetInterval = setInterval(checkDailyReset, 60000);
    return () => clearInterval(resetInterval);
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('player_stats', JSON.stringify({ 
      level, xp, coins, hp, mp, activeTitle, unlockedTitles, activeAvatar, unlockedAvatars, firstClearQuests, 
      projectBought, projectQuestCleared, lootHistory, dailyPurchases, unlockedLegacyProjects, isEyeCare,
      inventory, collectedHiddenItems, currentSceneId
    }));
  }, [level, xp, coins, hp, mp, activeTitle, unlockedTitles, activeAvatar, unlockedAvatars, firstClearQuests, projectBought, projectQuestCleared, lootHistory, dailyPurchases, unlockedLegacyProjects, isEyeCare, inventory, collectedHiddenItems, currentSceneId]);

  // Method to add rewards
  const addReward = (addedXp, addedCoins, addedMp = 0) => {
    setCoins(prev => prev + addedCoins);
    if (addedMp > 0) {
      setMp(prev => Math.min(100, prev + addedMp));
    }
    
    setXp(prev => {
      const newXp = prev + addedXp;
      if (newXp >= 100) {
        // Handle Level Up
        setTimeout(() => {
          setLevel(l => l + 1);
          setXp(newXp - 100);
          updateTitle(level + 1);
          triggerLevelUpAnimation();
        }, 500); // Small delay to let XP bar fill up first
        return 100; // Cap at 100 temporarily for the bar animation
      }
      return newXp;
    });
  };

  const addInventoryItem = (item) => {
    setInventory(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, count: i.count + 1 } : i);
      }
      return [...prev, { ...item, count: 1 }];
    });
  };

  const markHiddenItemCollected = (itemId) => {
    setCollectedHiddenItems(prev => {
      if (!prev.includes(itemId)) return [...prev, itemId];
      return prev;
    });
  };

  const unlockTitle = (newTitle) => {
    setUnlockedTitles(prev => {
      if (!prev.includes(newTitle)) return [...prev, newTitle];
      return prev;
    });
  };

  const updateTitle = (newLevel) => {
    if (newLevel === 2) unlockTitle('通訊達人');
    else if (newLevel === 3) unlockTitle('新手村生存者');
    else if (newLevel >= 4) unlockTitle('高階冒險者');
  };

  const triggerLevelUpAnimation = () => {
    setIsLevelingUp(true);
    try {
      if (confetti) {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.1, x: 0.2 }, // Fire from the top left corner (near status bar)
          colors: ['#ffcc00', '#ff8f00', '#f4e8d1']
        });
      }
    } catch (e) { console.error('Confetti error', e); }
    setTimeout(() => setIsLevelingUp(false), 1500);
  };

  const spendCoins = (amount) => {
    if (coins >= amount) {
      setCoins(prev => prev - amount);
      return true;
    }
    return false;
  };

  const consumeHp = (amount) => {
    if (hp >= amount) {
      setHp(prev => Math.min(100, prev - amount)); // Capped at 100 if amount is negative
      return true;
    }
    return false;
  };

  const consumeMp = (amount) => {
    if (mp >= amount) {
      setMp(prev => prev - amount);
      return true;
    }
    return false;
  };

  const isFirstClear = (questId) => {
    return !firstClearQuests.includes(questId);
  };

  const markFirstClear = (questId) => {
    setFirstClearQuests(prev => {
      if (!prev.includes(questId)) {
        return [...prev, questId];
      }
      return prev;
    });
  };

  const recordLootPurchase = (itemId, lootData) => {
    const today = new Date().toLocaleDateString();
    
    setDailyPurchases(prev => {
      const current = prev[itemId] || {};
      if (current.date === today) {
        return { ...prev, [itemId]: { date: today, count: (current.count || 0) + 1 } };
      } else {
        return { ...prev, [itemId]: { date: today, count: 1 } };
      }
    });
    
    // Add to history if there is text content
    if (lootData && lootData.text) {
      setLootHistory(prev => [
        {
          id: Date.now(),
          date: today,
          title: lootData.title,
          text: lootData.text,
          sourceId: itemId
        },
        ...prev
      ].slice(0, 50)); // Keep last 50 items
    }
  };

  return (
    <PlayerContext.Provider value={{ 
      level, setLevel, xp, coins, hp, mp, setMp,
      title: activeTitle, activeTitle, setActiveTitle, 
      unlockedTitles, unlockTitle, 
      activeAvatar, setActiveAvatar, unlockedAvatars, setUnlockedAvatars,
      addReward, spendCoins, consumeHp, consumeMp, isLevelingUp, 
      isFirstClear, markFirstClear, firstClearQuests,
      projectBought, setProjectBought,
      projectQuestCleared, setProjectQuestCleared,
      dailyPurchases, recordLootPurchase, lootHistory,
      unlockedLegacyProjects, setUnlockedLegacyProjects,
      isAlmanacOpen, setIsAlmanacOpen,
      activeAlmanacTab, setActiveAlmanacTab,
      isYggdrasilOpen, setIsYggdrasilOpen,
      isEyeCare, setIsEyeCare,
      inventory, addInventoryItem,
      collectedHiddenItems, markHiddenItemCollected,
      currentSceneId, setCurrentSceneId
    }}>
      {children}
    </PlayerContext.Provider>
  );
}
