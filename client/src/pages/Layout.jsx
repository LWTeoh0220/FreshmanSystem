import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { Map, Swords, Book, Trophy, Compass, BookOpen, Shield, Globe, X } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { processGraphsData } from '../data/mockData';
import YggdrasilModal from '../components/YggdrasilModal';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    level, xp, coins, hp, mp, title, consumeHp, isLevelingUp, firstClearQuests, 
    activeAvatar, setActiveAvatar, unlockedAvatars,
    isAlmanacOpen, setIsAlmanacOpen, activeAlmanacTab, setActiveAlmanacTab,
    lootHistory, unlockedLegacyProjects,
    isYggdrasilOpen, setIsYggdrasilOpen,
    isEyeCare, setIsEyeCare
  } = usePlayer();
  const [showOIAModal, setShowOIAModal] = useState(false);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [gender, setGender] = useState(localStorage.getItem('user_gender') || 'male');
  const [displayCoins, setDisplayCoins] = useState(coins);
  const [shakeCampus, setShakeCampus] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [playerFaction, setPlayerFaction] = useState(localStorage.getItem('player_faction') || '');
  const [isGlobalFullscreen, setIsGlobalFullscreen] = useState(false);

  const toggleGlobalFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsGlobalFullscreen(!!document.fullscreenElement);
    };
    
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleGlobalFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Extract completed milestones for badges
  const completedBadges = React.useMemo(() => {
    const badges = [];
    Object.values(processGraphsData).forEach(graph => {
      graph.nodes.forEach(node => {
        if (node.isMilestone && firstClearQuests.includes(node.id)) {
          badges.push(node);
        }
      });
    });
    return badges;
  }, [firstClearQuests]);

  // Animated rolling numbers for coins
  useEffect(() => {
    if (coins !== displayCoins) {
      const diff = Math.abs(coins - displayCoins);
      const step = Math.max(1, Math.floor(diff / 10)); // Accelerate large differences
      
      const interval = setInterval(() => {
        setDisplayCoins(prev => {
          if (prev < coins) return Math.min(prev + step, coins);
          if (prev > coins) return Math.max(prev - step, coins);
          clearInterval(interval);
          return coins;
        });
      }, 20);
      return () => clearInterval(interval);
    }
  }, [coins, displayCoins]);

  // Avatar Dictionary
  const avatars = {
    avatar_default: { icon: '🧙‍♂️', name: '男魔法師', condition: '預設解鎖' },
    avatar_girl_wizard: { icon: '🧙‍♀️', name: '女魔法師', condition: '預設解鎖' },
    avatar_warrior: { icon: '⚔️', name: '像素戰士', condition: '請在公會商店轉蛋機獲取' },
    avatar_sage: { icon: '📜', name: '智慧賢者', condition: '需完成所有新生行政主線' },
    avatar_assassin: { icon: '🗡️', name: '隱祕刺客', condition: '需綁定出生陣營' }
  };

  const almanacTabs = [
    { id: 'dorm-network', label: '🚪 住宿與網路注意事項', icon: '🚪' },
    { id: 'working-permit', label: '工作許可證線上申辦', icon: '💼' },
    { id: 'luggage', label: '赴臺行李打包不超重清單', icon: '🧳' },
    { id: 'insurance', label: '僑外生健保理賠天書', icon: '🏥' }
  ];

  const navItems = [
    { path: '/', name: '世界地圖', icon: <Map size={16} /> },
    { path: '/tasks', name: '任務看板', icon: <Swords size={16} /> },
    { path: '/achievements', name: '成就進度', icon: <Trophy size={16} /> },
    { path: '/adventurers-log', name: '冒險手札', icon: <Book size={16} /> },
    { path: '/shop', name: '公會商店', icon: <Map size={16} /> },
    { path: '/campus', name: '🗺 時空探勘地圖', icon: <Compass size={16} /> }
  ];

  const handleNavClick = (e, path) => {
    if (path === '/campus') {
      e.preventDefault();
      if (hp >= 20) {
        consumeHp(20);
        navigate('/campus');
      } else {
        setShakeCampus(true);
        setTimeout(() => setShakeCampus(false), 500);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* RPG Style Navigation Bar */}
      <nav className="glass sticky top-0 z-[100] px-4 md:px-6 py-3 flex flex-nowrap items-center justify-between shadow-md border-b-2 border-[#8b5a2b]/20 gap-x-4 overflow-x-auto no-scrollbar">
        
        {/* Left: Player Status Bar */}
        <div className="relative group/player z-50">
          <div 
            onClick={() => setShowCharacterModal(true)}
            className={`flex items-center space-x-3 bg-white/60 px-4 py-2 rounded-2xl border border-[#8b5a2b]/30 shadow-sm transition-all duration-500 cursor-pointer hover:bg-white/90 hover:border-[#8b5a2b] hover:drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] ${isLevelingUp ? 'scale-125 drop-shadow-[0_0_15px_rgba(255,204,0,0.8)]' : 'scale-[1.02]'}`}
          >
          <div className="w-12 h-12 rounded-full bg-[#d2b48c] border-2 border-[#8b5a2b] overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#f4e8d1] to-[#d2b48c] relative">
            {isLevelingUp && <span className="absolute inset-0 bg-[#ffcc00] animate-ping opacity-50"></span>}
            <span className="text-3xl drop-shadow-sm z-10">{gender === 'female' ? '🧙‍♀️' : '🧙‍♂️'}</span>
          </div>
          <div className="w-40">
            <div className={`text-sm font-black tracking-wide mb-1 transition-colors duration-500 ${isLevelingUp ? 'text-[#c62828]' : 'text-[#8b5a2b]'}`}>
              Lv.{level} {title}
            </div>
            
            {/* XP and HP Bar */}
            <div className="w-full flex items-center space-x-2 mb-1">
              <div className="flex-1 h-1.5 bg-[#e0cda5] rounded-full overflow-hidden shadow-inner relative" title={`XP: ${xp}%`}>
                <div 
                  className="h-full bg-gradient-to-r from-[#34c759] to-[#30d158] transition-all duration-500 ease-out"
                  style={{ width: `${xp}%` }}
                ></div>
              </div>
              <div className="flex-1 h-1.5 bg-[#e0cda5] rounded-full overflow-hidden shadow-inner relative" title={`HP: ${hp}/100`}>
                <div 
                  className="h-full bg-gradient-to-r from-[#c62828] to-[#ff5252] transition-all duration-500 ease-out"
                  style={{ width: `${hp}%` }}
                ></div>
              </div>
            </div>
            {/* MP Bar */}
            <div className="w-full h-1.5 bg-[#e0cda5] rounded-full overflow-hidden shadow-inner relative mb-1.5" title={`MP: ${mp}/100`}>
              <div 
                className="h-full bg-gradient-to-r from-[#007aff] to-[#34aadc] transition-all duration-500 ease-out shadow-[0_0_8px_#007aff]"
                style={{ width: `${mp}%` }}
              ></div>
            </div>

            <div className="flex space-x-2 text-[10px] font-bold text-[#4a3b32]">
              <span className="flex items-center bg-[#ff9500]/10 px-1 py-0.5 rounded-md text-[#ff9500]">
                <span className="mr-1">🪙</span> {displayCoins}
              </span>
              <span className="flex items-center bg-[#34c759]/10 px-1 py-0.5 rounded-md text-[#2e7d32]">
                <span className="mr-1">⚡</span> XP: {xp}/100
              </span>
              <span className="flex items-center bg-[#ff3b30]/10 px-1 py-0.5 rounded-md text-[#c62828]">
                <span className="mr-1">❤️</span> HP: {hp}/100
              </span>
            </div>
          </div>
        </div>
        
        {/* Eye Care Mode Button (Moved under Player Status) */}
          <div className="absolute top-full left-4 mt-2">
            <button 
              onClick={() => setIsEyeCare(!isEyeCare)}
              className={`flex items-center space-x-1.5 font-bold px-3 py-1 rounded-full transition-all group/eye relative border shadow-md hover:scale-105 active:scale-95 ${isEyeCare ? 'bg-gradient-to-br from-[#d97706] to-[#b45309] text-[#fff8e1] shadow-[0_0_15px_#d97706] border-[#f59e0b]' : 'bg-white/80 text-[#4a3b32] hover:bg-[#8b5a2b]/20 border-[#8b5a2b]/30'}`}
            >
              {isEyeCare && <div className="absolute inset-0 bg-[#ff9800] blur-md opacity-30 rounded-full animate-[pulse_3s_ease-in-out_infinite]"></div>}
              <span className={`drop-shadow-sm text-sm relative z-10 group-hover/eye:animate-wiggle`}>
                {isEyeCare ? '💡' : '🏮'}
              </span>
              <span className="tracking-wider relative z-10 text-[10px] whitespace-nowrap font-black">{isEyeCare ? '熄滅油燈 (復原)' : '點亮油燈 (護眼變暗)'}</span>
            </button>
          </div>
        </div>
        
        {/* Center: Guild Outposts (School Departments) */}
        <div className="flex items-center space-x-4 mx-4">
          
          {/* Academic Affairs Guild */}
          <div className="relative group flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-[#d2b48c]/40 border-2 border-[#8b5a2b] flex items-center justify-center text-[#8b5a2b] hover:bg-[#8b5a2b] hover:text-[#f4e8d1] transition-colors cursor-help shadow-sm">
              <BookOpen size={20} />
            </div>
            {/* Tooltip */}
            <div className="absolute top-full mt-3 w-48 bg-[#4a3b32] text-[#f4e8d1] p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl border-2 border-[#8b5a2b] z-50 text-xs font-bold">
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-6 border-transparent border-b-[#4a3b32]"></div>
              <div className="text-[#ffcc00] font-black mb-1 border-b border-[#8b5a2b]/50 pb-1">📚 教務處公會</div>
              <p>當前期中退選截止倒數：3 天。請確認您的學術進度！</p>
            </div>
          </div>

          {/* Student Affairs Guild */}
          <div className="relative group flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-[#d2b48c]/40 border-2 border-[#8b5a2b] flex items-center justify-center text-[#8b5a2b] hover:bg-[#8b5a2b] hover:text-[#f4e8d1] transition-colors cursor-help shadow-sm">
              <Shield size={20} />
            </div>
            {/* Tooltip */}
            <div className="absolute top-full mt-3 w-48 bg-[#4a3b32] text-[#f4e8d1] p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl border-2 border-[#8b5a2b] z-50 text-xs font-bold">
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-6 border-transparent border-b-[#4a3b32]"></div>
              <div className="text-[#34c759] font-black mb-1 border-b border-[#8b5a2b]/50 pb-1">🛡️ 學務處後勤</div>
              <p>宿舍熱水器維修中；新生健康檢查報告已全數派發完畢。</p>
            </div>
          </div>

          {/* OIA Guild (International Affairs) */}
          <div className="relative group flex items-center justify-center">
            <button 
              onClick={() => setShowOIAModal(true)}
              className="w-10 h-10 rounded-full bg-[#d2b48c]/40 border-2 border-[#8b5a2b] flex items-center justify-center text-[#8b5a2b] hover:bg-[#8b5a2b] hover:text-[#f4e8d1] transition-colors cursor-pointer shadow-sm relative active:scale-95"
            >
              <Globe size={20} />
              {/* Bouncing Red Dot */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c62828] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#c62828] border border-white"></span>
              </span>
            </button>
            {/* Tooltip */}
            <div className="absolute top-full mt-3 w-40 bg-[#4a3b32] text-[#f4e8d1] p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl border-2 border-[#8b5a2b] z-50 text-xs font-bold text-center">
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-6 border-transparent border-b-[#4a3b32]"></div>
              點擊查看國際處最新公告
            </div>
          </div>
        </div>
        
        {/* Right: Game Menu */}
        <div className="flex flex-nowrap gap-2 bg-[#4a3b32]/5 p-1.5 rounded-2xl items-center justify-end">
          
          {/* Global Almanac Button */}
          <button 
            onClick={() => setIsAlmanacOpen(true)}
            className="flex items-center space-x-1 text-sm font-bold px-3 py-1.5 rounded-xl transition-all mr-1 group relative bg-gradient-to-br from-[#8b5a2b] to-[#5c3a21] text-[#f4e8d1] shadow-[0_4px_15px_rgba(139,90,43,0.4)] hover:shadow-[0_0_20px_#8b5a2b] hover:scale-105 active:scale-95 border border-[#8b5a2b] shrink-0"
          >
            <span className="tracking-widest whitespace-nowrap">📑 遠古祕典</span>
          </button>
          
          {/* Vertical divider */}
          <div className="w-0.5 h-5 bg-[#8b5a2b]/20 mr-1 shrink-0"></div>

          {/* Fullscreen Toggle */}
          <button 
            onClick={toggleGlobalFullscreen}
            className="flex items-center justify-center w-8 h-8 rounded-xl transition-all hover:scale-105 active:scale-95 bg-white/50 text-[#8b5a2b] shadow-sm hover:shadow-md hover:bg-white border border-[#8b5a2b]/30 mx-0.5 shrink-0 group relative"
          >
            <span className="text-sm">{isGlobalFullscreen ? '🔲' : '🔳'}</span>
            <div className="absolute top-full mt-2 w-32 bg-[#4a3b32] text-[#f4e8d1] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border-2 border-[#8b5a2b] z-50 text-xs font-bold text-center">
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#4a3b32]"></div>
              {isGlobalFullscreen ? '退出全螢幕 [F]' : '進入全螢幕 [F]'}
            </div>
          </button>

          {navItems.map(item => {
              const isCampus = item.path === '/campus';
              const isDisabled = isCampus && hp < 20;
              const isShaking = isCampus && shakeCampus;
              
              return (
                <React.Fragment key={item.path}>
                  {/* Insert Yggdrasil Button before Campus */}
                  {isCampus && (
                    <button 
                      onClick={() => setIsYggdrasilOpen(true)}
                      className="flex items-center space-x-1 text-sm font-black px-3 py-1.5 rounded-xl transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-[#064e3b] to-[#047857] text-[#f4e8d1] shadow-[0_4px_10px_rgba(16,185,129,0.4)] hover:shadow-[0_0_15px_#10b981] hover:text-[#ffcc00] border border-[#10b981]/50 mx-0.5 group shrink-0"
                    >
                      <span className="drop-shadow-[0_0_5px_rgba(16,185,129,0.8)] group-hover:animate-pulse">🌳</span>
                      <span className="whitespace-nowrap">世界樹戰情室</span>
                    </button>
                  )}
                  <div className="relative group shrink-0">
                    <Link
                      to={item.path}
                      onClick={(e) => handleNavClick(e, item.path)}
                      className={`flex items-center space-x-1 text-sm font-bold px-3 py-1.5 rounded-xl transition-all
                        ${location.pathname === item.path 
                          ? 'bg-[#8b5a2b] text-[#f4e8d1] shadow-inner' 
                          : 'text-[#4a3b32] hover:bg-[#8b5a2b]/10'}
                        ${isDisabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                        ${isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}
                      `}
                    >
                      {item.icon}
                      <span className="whitespace-nowrap">{item.name}</span>
                    </Link>
                    {isCampus && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-max bg-[#4a3b32] text-[#f4e8d1] text-[10px] px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {isDisabled ? '❤️ 體力不足，請等待明日回復' : '❤️ 消耗 20 點體力進入副本'}
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
        </div>
      </nav>

      {/* OIA Announcement Modal */}
      {showOIAModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#1d1d1f]/60 backdrop-blur-sm p-4">
          <div className="bg-[#f4e8d1] p-8 rounded-3xl max-w-xl w-full border-4 border-[#8b5a2b] shadow-2xl relative animate-bounce-in-stagger rpg-border">
            <button 
              onClick={() => setShowOIAModal(false)}
              className="absolute top-5 right-5 text-[#8b5a2b] hover:text-[#c62828] transition-colors bg-[#8b5a2b]/10 p-2 rounded-xl"
            >
              <X size={28} />
            </button>
            <h2 className="text-3xl font-black text-[#c62828] mb-6 flex items-center border-b-2 border-[#8b5a2b]/20 pb-4">
              <Globe size={36} className="mr-4 text-[#c62828]" />
              國際處公會公告板
            </h2>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              <div className="bg-[#e0cda5]/50 p-5 rounded-xl border border-[#c62828]/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#c62828] text-white text-xs font-black px-3 py-1 rounded-bl-lg">NEW</div>
                <h4 className="font-black text-[#4a3b32] text-xl mb-2 flex items-center">
                  僑外生工作證申請開放
                </h4>
                <p className="text-[#7a6350] font-bold mb-3">發布日期：2026-05-31</p>
                <p className="text-[#4a3b32] font-medium leading-relaxed">
                  請各位同學注意，本學期僑外生工作證已經開放申請。有意在校內外打工的同學，請備妥護照、居留證影本與在學證明，至國際處櫃臺或線上系統進行申請。
                </p>
              </div>
              <div className="bg-[#e0cda5]/30 p-5 rounded-xl border border-[#8b5a2b]/20">
                <h4 className="font-black text-[#4a3b32] text-xl mb-2">中秋節文化體驗營報名</h4>
                <p className="text-[#7a6350] font-bold mb-3">發布日期：2026-05-15</p>
                <p className="text-[#4a3b32] font-medium leading-relaxed">
                  國際處將於下個月舉辦中秋節文化體驗營，帶領大家一起做月餅、喫柚子。名額有限，報名從速！
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowOIAModal(false)}
              className="w-full mt-6 py-3 bg-[#8b5a2b] text-[#f4e8d1] font-black text-xl rounded-xl hover:bg-[#7a6350] transition-colors shadow-sm border-b-4 border-[#4a3b32] active:border-b-0 active:translate-y-1"
            >
              我知道了
            </button>
          </div>
        </div>
      )}

      {/* Character Status Sheet Modal */}
      {showCharacterModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-stone-950/40 backdrop-blur-[2px] p-4">
          <div className="bg-[#f4e8d1] p-8 rounded-3xl max-w-4xl w-full border-4 border-[#8b5a2b] shadow-[0_0_40px_rgba(139,90,43,0.3)] relative animate-bounce-in-stagger flex flex-col md:flex-row gap-8 overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]">
            
            <button 
              onClick={() => setShowCharacterModal(false)}
              className="absolute top-4 right-4 text-[#8b5a2b] hover:text-[#c62828] transition-colors p-2 z-10"
            >
              <X size={28} />
            </button>

            {/* Left Column: Player Info (45%) */}
            <div className="w-full md:w-[45%] flex flex-col items-center border-r-0 md:border-r-2 border-[#8b5a2b]/30 pr-0 md:pr-8 relative">
              {/* Avatar Section */}
              <div 
                className="w-32 h-32 rounded-full bg-gradient-to-br from-[#f4e8d1] to-[#d2b48c] border-4 border-[#8b5a2b] overflow-hidden flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(139,90,43,0.3)] relative group cursor-pointer"
              >
                <span className="text-[5rem] drop-shadow-md z-10 transition-transform group-hover:scale-110">{gender === 'female' ? '🧙‍♀️' : '🧙‍♂️'}</span>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20">
                  <span className="text-white font-black text-sm tracking-widest drop-shadow-md">[ 🔄 更換 ]</span>
                </div>
              </div>

              {/* Gender Toggle */}
              <div className="flex space-x-3 mb-4">
                <button 
                  onClick={() => { setGender('male'); localStorage.setItem('user_gender', 'male'); }}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg border-[3px] shadow-sm transition-all ${gender === 'male' ? 'bg-[#007aff]/10 text-[#007aff] border-[#007aff] scale-105' : 'bg-white/50 text-[#7a6350] border-[#8b5a2b]/30 hover:bg-white hover:border-[#8b5a2b]/50'}`}
                >
                  ♂ 勇者
                </button>
                <button 
                  onClick={() => { setGender('female'); localStorage.setItem('user_gender', 'female'); }}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg border-[3px] shadow-sm transition-all ${gender === 'female' ? 'bg-[#ff5252]/10 text-[#ff5252] border-[#ff5252] scale-105' : 'bg-white/50 text-[#7a6350] border-[#8b5a2b]/30 hover:bg-white hover:border-[#8b5a2b]/50'}`}
                >
                  ♀ 巾幗
                </button>
              </div>

              <h2 className="text-2xl font-black text-[#4a3b32] mb-1 text-center">
                Lv.{level} {title}
              </h2>
              <div className="w-full h-px bg-[#8b5a2b]/30 my-4"></div>

              <div className="w-full space-y-4">
                {/* Vertical Vital Bars */}
                <div className="space-y-3 w-full border-b border-[#8b5a2b]/20 pb-5">
                  <div className="flex items-center space-x-3 w-full">
                    <div className="w-8 text-xl drop-shadow-sm text-center">❤️</div>
                    <div className="flex-1 h-3 bg-[#e0cda5] rounded-full overflow-hidden shadow-inner relative border border-[#8b5a2b]/20">
                      <div className="absolute inset-0 flex items-center justify-center z-10 text-[10px] font-black text-white drop-shadow-md leading-none">{hp} / 100</div>
                      <div className="h-full bg-gradient-to-r from-[#c62828] to-[#ff5252] transition-all duration-500 ease-out" style={{ width: `${hp}%` }}></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 w-full">
                    <div className="w-8 text-xl drop-shadow-sm text-center">🔮</div>
                    <div className="flex-1 h-3 bg-[#e0cda5] rounded-full overflow-hidden shadow-inner relative border border-[#8b5a2b]/20">
                      <div className="absolute inset-0 flex items-center justify-center z-10 text-[10px] font-black text-white drop-shadow-md leading-none">{mp} / 100</div>
                      <div className="h-full bg-gradient-to-r from-[#007aff] to-[#34aadc] transition-all duration-500 ease-out shadow-[0_0_8px_#007aff]" style={{ width: `${mp}%` }}></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 w-full">
                    <div className="w-8 text-xl drop-shadow-sm text-center">⚡</div>
                    <div className="flex-1 h-3 bg-[#e0cda5] rounded-full overflow-hidden shadow-inner relative border border-[#8b5a2b]/20">
                      <div className="absolute inset-0 flex items-center justify-center z-10 text-[10px] font-black text-white drop-shadow-md leading-none">{xp}%</div>
                      <div className="h-full bg-gradient-to-r from-[#ffcc00] to-[#ff8f00] transition-all duration-500 ease-out" style={{ width: `${xp}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Tactical Asset Matrix (2x2) */}
                <div className="grid grid-cols-2 gap-3 w-full mt-2">
                  <div className="bg-[#8b5a2b]/10 p-3 rounded-xl border border-[#8b5a2b]/30 flex flex-col justify-center items-center shadow-inner hover:bg-[#8b5a2b]/20 transition-colors">
                    <div className="text-2xl drop-shadow-sm mb-1">🪙</div>
                    <div className="text-[10px] text-[#7a6350] font-black mb-0.5">擁有金幣</div>
                    <div className="text-[#c62828] font-black text-sm tracking-wider">{coins} G</div>
                  </div>
                  <div className="bg-[#8b5a2b]/10 p-3 rounded-xl border border-[#8b5a2b]/30 flex flex-col justify-center items-center shadow-inner hover:bg-[#8b5a2b]/20 transition-colors">
                    <div className="text-2xl drop-shadow-sm mb-1">🎖️</div>
                    <div className="text-[10px] text-[#7a6350] font-black mb-0.5">冒險階級</div>
                    <div className="text-[#34c759] font-black text-sm tracking-wider">Lv.{level} 萌新</div>
                  </div>
                  <div className="bg-[#8b5a2b]/10 p-3 rounded-xl border border-[#8b5a2b]/30 flex flex-col justify-center items-center shadow-inner hover:bg-[#8b5a2b]/20 transition-colors">
                    <div className="text-2xl drop-shadow-sm mb-1">🏆</div>
                    <div className="text-[10px] text-[#7a6350] font-black mb-0.5">成就點數</div>
                    <div className="text-[#ffcc00] font-black text-sm tracking-wider drop-shadow-sm">{completedBadges.length * 10} PTS</div>
                  </div>
                  <div className="bg-[#8b5a2b]/10 p-3 rounded-xl border border-[#8b5a2b]/30 flex flex-col justify-center items-center shadow-inner hover:bg-[#8b5a2b]/20 transition-colors">
                    <div className="text-2xl drop-shadow-sm mb-1">⏳</div>
                    <div className="text-[10px] text-[#7a6350] font-black mb-0.5">抵臺冒險</div>
                    <div className="text-[#4a3b32] font-black text-sm tracking-wider">第 1 天</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#8b5a2b]/20 space-y-3 w-full">
                  <div className="flex items-center text-xs font-bold text-[#5c4033] bg-white/40 p-2 rounded-lg border border-[#8b5a2b]/10">
                    <span className="w-6 text-center mr-2 text-sm">🎓</span>
                    <span>學院班級：電子工程系大一</span>
                  </div>
                  <div className="flex items-center text-xs font-bold text-[#5c4033] bg-white/40 p-2 rounded-lg border border-[#8b5a2b]/10">
                    <span className="w-6 text-center mr-2 text-sm">🏠</span>
                    <span>目前安全屋：新生男子宿舍(南辦)</span>
                  </div>
                  
                  {/* Faction Selector */}
                  <div className="flex items-center text-xs font-bold text-[#5c4033] mt-2 bg-white/40 p-2 rounded-lg border border-[#8b5a2b]/10">
                    <span className="w-6 text-center mr-2 text-sm">🗺️</span>
                    <span>出生陣營：</span>
                    <select 
                      value={playerFaction}
                      onChange={(e) => {
                        setPlayerFaction(e.target.value);
                        localStorage.setItem('player_faction', e.target.value);
                      }}
                      className="ml-auto bg-[#f4e8d1] border border-[#8b5a2b] text-[#4a3b32] rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#8b5a2b] shadow-inner text-xs font-bold max-w-[120px]"
                    >
                      <option value="" disabled>請選擇陣營...</option>
                      <optgroup label="直轄區">
                        <option value="吉隆坡">吉隆坡 (KL)</option>
                        <option value="布城">布城 (Putrajaya)</option>
                        <option value="納閩">納閩 (Labuan)</option>
                      </optgroup>
                      <optgroup label="州屬">
                        <option value="柔佛州">柔佛州 (Johor)</option>
                        <option value="吉打州">吉打州 (Kedah)</option>
                        <option value="吉蘭丹州">吉蘭丹州 (Kelantan)</option>
                        <option value="馬六甲州">馬六甲州 (Malacca)</option>
                        <option value="森美蘭州">森美蘭州 (Negeri Sembilan)</option>
                        <option value="彭亨州">彭亨州 (Pahang)</option>
                        <option value="檳城州">檳城州 (Penang)</option>
                        <option value="霹靂州">霹靂州 (Perak)</option>
                        <option value="玻璃市州">玻璃市州 (Perlis)</option>
                        <option value="沙巴州">沙巴州 (Sabah)</option>
                        <option value="砂拉越州">砂拉越州 (Sarawak)</option>
                        <option value="雪蘭莪州">雪蘭莪州 (Selangor)</option>
                        <option value="登嘉樓州">登嘉樓州 (Terengganu)</option>
                      </optgroup>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Item Registry or Avatar Selection (55%) */}
            <div className="w-full md:w-[55%] flex flex-col justify-between pt-2 h-full max-h-[500px]">
              {showAvatarSelection ? (
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4 border-b-2 border-[#8b5a2b]/30 pb-2">
                    <h3 className="text-xl font-black text-[#4a3b32] flex items-center">
                      🔄 更換頭像外觀
                    </h3>
                    <button 
                      onClick={() => setShowAvatarSelection(false)}
                      className="bg-[#8b5a2b] text-[#f4e8d1] px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-[#7a6350] transition-colors flex items-center"
                    >
                      <Download size={16} className="mr-2" /> 取回個人手札
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(avatars).map(([id, data]) => {
                        const isUnlocked = unlockedAvatars.includes(id);
                        const isActive = activeAvatar === id;
                        
                        return (
                          <div 
                            key={id}
                            onClick={() => {
                              if (isUnlocked && !isActive) {
                                setActiveAvatar(id);
                                setShowAvatarSelection(false);
                              }
                            }}
                            className={`relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center shadow-sm transition-all group ${
                              isActive 
                                ? 'border-[#ffcc00] bg-[#fff8e1] shadow-[0_0_10px_rgba(255,204,0,0.6)] scale-105 z-10' 
                                : isUnlocked 
                                  ? 'border-[#8b5a2b]/40 bg-[#f4e8d1] hover:border-[#8b5a2b] hover:bg-[#fff] cursor-pointer hover:-translate-y-1' 
                                  : 'border-stone-400 bg-stone-300 cursor-not-allowed opacity-80'
                            }`}
                          >
                            {isActive && <div className="absolute -top-1.5 -right-1.5 text-xs bg-green-500 rounded-full w-4 h-4 flex items-center justify-center border border-white z-20">✅</div>}
                            {!isUnlocked && <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-20 rounded-xl"><span className="text-xs">🔒</span></div>}
                            
                            <span className={`text-4xl drop-shadow-md mb-2 ${!isUnlocked ? 'brightness-0 opacity-40' : ''}`}>
                              {data.icon}
                            </span>
                            <span className="text-[10px] font-black text-[#4a3b32]">{data.name}</span>

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] bg-[#4a3b32] text-[#f4e8d1] text-[10px] p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none z-50 text-center font-bold">
                              {isActive ? '裝備中' : isUnlocked ? '點擊裝備' : `🔒 條件: ${data.condition}`}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-xl font-black text-[#4a3b32] mb-4 flex items-center border-b-2 border-[#8b5a2b]/30 pb-2">
                      🎒 冒險背包道具憑證
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Phone Number */}
                      <div className="bg-white/60 p-4 rounded-xl border-2 border-[#8b5a2b]/30 flex justify-between items-center shadow-sm hover:border-[#8b5a2b] transition-colors group">
                    <div>
                      <div className="text-xs font-black text-[#7a6350] mb-1">📱 千里傳音符：臺灣 SIM 道具</div>
                      <div className="text-[#4a3b32] font-black text-lg tracking-wider">
                        {localStorage.getItem('user_phone') || '0912-345-678'}
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(localStorage.getItem('user_phone') || '0912345678');
                        setCopySuccess('phone');
                        setTimeout(() => setCopySuccess(''), 2000);
                      }}
                      className="px-3 py-1.5 bg-[#8b5a2b] text-[#f4e8d1] font-bold text-xs rounded-lg hover:bg-[#7a6350] active:translate-y-px transition-all shadow-md flex items-center space-x-1"
                    >
                      <span>{copySuccess === 'phone' ? '✔️ 已複製' : '📋 複製'}</span>
                    </button>
                  </div>

                  {/* Student ID */}
                  <div className="bg-white/60 p-4 rounded-xl border-2 border-[#8b5a2b]/30 flex justify-between items-center shadow-sm hover:border-[#8b5a2b] transition-colors group">
                    <div>
                      <div className="text-xs font-black text-[#7a6350] mb-1">🎖️ 公會入籍基資：北科通關令</div>
                      <div className="text-[#4a3b32] font-black text-lg tracking-wider">
                        {localStorage.getItem('user_student_id') || '111XXXXXX'}
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(localStorage.getItem('user_student_id') || '111XXXXXX');
                        setCopySuccess('studentid');
                        setTimeout(() => setCopySuccess(''), 2000);
                      }}
                      className="px-3 py-1.5 bg-[#8b5a2b] text-[#f4e8d1] font-bold text-xs rounded-lg hover:bg-[#7a6350] active:translate-y-px transition-all shadow-md flex items-center space-x-1"
                    >
                      <span>{copySuccess === 'studentid' ? '✔️ 已複製' : '📋 複製'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Achievement Wall Mini */}
              <div className="mt-8 bg-[#4a3b32]/5 p-4 rounded-xl border border-[#8b5a2b]/20">
                <h4 className="text-sm font-black text-[#7a6350] mb-3 flex items-center">
                  🏅 冒險者公會：終極榮譽勳表
                </h4>
                <div className="flex flex-wrap gap-2">
                  {completedBadges.length > 0 && (
                    completedBadges.map((badge, idx) => {
                      const iconName = badge.achievementIcon || 'Award';
                      const formattedIconName = iconName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
                      const IconComponent = LucideIcons[formattedIconName] || LucideIcons.Award;

                      return (
                        <div 
                          key={idx} 
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffcc00] to-[#ff8f00] border-2 border-[#8b5a2b] flex items-center justify-center text-sm shadow-md cursor-help hover:scale-110 hover:shadow-lg transition-transform" 
                          title={badge.achievementName || badge.title}
                        >
                          <IconComponent size={20} className="text-white drop-shadow-sm" />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setShowCharacterModal(false)}
                  className="px-6 py-2.5 bg-gradient-to-b from-[#8b5a2b] to-[#5c4033] text-[#f4e8d1] border-b-4 border-[#3a2318] font-black text-sm rounded-xl hover:brightness-110 transition-colors shadow-lg active:border-b-0 active:translate-y-1 flex items-center"
                >
                  <span className="mr-2">↩️</span> 收回個人手札
                </button>
              </div>
            </>
            )}
          </div>
        </div>
        </div>
      )}

      {/* ============================== */}
      {/* GRAND ALMANAC GUIDEBOOK MODAL */}
      {/* ============================== */}
      <div className={`fixed inset-0 flex justify-center items-center transition-opacity duration-500 z-[300] ${isAlmanacOpen ? 'opacity-100 delay-[100ms]' : 'opacity-0 pointer-events-none'}`}>
        <div className="bg-black/60 absolute inset-0 -z-10 backdrop-blur-md"></div>
        
        <div className={`w-[95%] max-w-5xl h-[90%] bg-[#f4e8d1] rounded-lg relative flex flex-col origin-center transition-transform duration-500 shadow-[inset_0_0_30px_rgba(139,90,43,0.2),-2px_2px_0_#f4e8d1,-4px_4px_0_#d2b48c,-6px_6px_0_#8b5a2b,2px_2px_0_#f4e8d1,4px_4px_0_#d2b48c,6px_6px_0_#8b5a2b,0_25px_50px_rgba(0,0,0,0.8)] ${isAlmanacOpen ? 'scale-100' : 'scale-50'}`}>
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
                <span className="text-3xl mr-3 drop-shadow-md">📖</span> 大典總目錄
              </h3>
              <div className="flex flex-col space-y-4 overflow-y-auto custom-scrollbar pr-2 pb-6">
                {almanacTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAlmanacTab(tab.id)}
                    className={`w-full text-left p-4 rounded-xl flex items-center transition-all duration-300 ${
                      activeAlmanacTab === tab.id
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
              
              {/* Dorm and Network Guide */}
              {activeAlmanacTab === 'dorm-network' && (
                <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
                  <h3 className="text-3xl font-black text-[#7a6350] mb-6 flex items-center border-b-2 border-[#8b5a2b]/20 pb-4 flex-shrink-0">
                    🚪 住宿與網路注意事項
                  </h3>
                  <div className="w-full flex-1 overflow-y-auto custom-scrollbar pr-4 text-[16px] leading-relaxed text-[#4a3b32] font-black space-y-6 pb-20">
                    <p className="flex items-start"><span className="text-[#8b5a2b] mr-2 shrink-0 font-mono">├─</span> <span>🚪 宿舍重要須知：南辦宿舍晚上 11 點大門管制。</span></p>
                    <p className="flex items-start"><span className="text-[#8b5a2b] mr-2 shrink-0 font-mono">├─</span> <span>🔌 網路線連線攻略：請自備 Cat6 網路線插上牆壁插座，並登入學校 Portal 系統登記電腦 MAC 位址以解鎖上網功能。</span></p>
                    <div className="mt-8 pt-4 border-t border-[#8b5a2b]/20">
                      <p className="opacity-60 text-justify tracking-wider">這是關於宿舍生活的學長姐忠告。維持早睡早起，確保網路連線順暢，纔是資工系學生的生存之道。</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Working Permit Demo (Iframe) */}
              {activeAlmanacTab === 'working-permit' && (
                <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
                  <h3 className="text-3xl font-black text-[#7a6350] mb-6 flex items-center border-b-2 border-[#8b5a2b]/20 pb-4 flex-shrink-0">
                    💼 工作許可證線上申辦
                  </h3>
                  <div className="w-full flex-1 bg-[#fff8e1]/80 rounded-xl border-4 border-[#5c3a21] shadow-inner relative overflow-hidden flex flex-col mb-16">
                    <iframe 
                      src="https://example.com" 
                      title="Working Permit Guide"
                      className="w-full h-full border-0 relative z-10 opacity-30"
                      sandbox="allow-scripts allow-same-origin"
                    ></iframe>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none font-black text-4xl text-[#8b5a2b] text-center w-full drop-shadow-md z-20">
                      [ 聖光造物嵌入視窗 ]<br/><span className="text-xl">此區域已完美預留，可隨時替換為您的 Notion 或 PDF 連結</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Luggage Text Demo */}
              {activeAlmanacTab === 'luggage' && (
                <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
                  <h3 className="text-3xl font-black text-[#7a6350] mb-6 flex items-center border-b-2 border-[#8b5a2b]/20 pb-4 flex-shrink-0">
                    🧳 赴臺行李打包不超重清單
                  </h3>
                  <div className="w-full flex-1 overflow-y-auto custom-scrollbar pr-4 text-[16px] leading-relaxed text-[#4a3b32] font-black space-y-6 pb-20">
                    <p>1. 證件類：護照、入臺證、身分證、錄取通知書、白底大頭照 (極度重要，請帶至少 20 張)。</p>
                    <p>2. 電子產品：筆記型電腦 (資工系必備，建議 16GB RAM 以上)、萬國轉接頭、行動電源。</p>
                    <p>3. 衣物：臺灣夏天極熱且潮濕，多帶短袖與排汗衫。冬天北部濕冷，建議帶一件防風防水保暖外套 (GORE-TEX 佳)。</p>
                    <p>4. 藥品：個人常用藥品、腸胃藥、感冒藥。臺灣就醫方便，但初到臺灣若水土不服可先應急。</p>
                    <p>5. 文具與雜物：慣用文具 (臺灣皆可買到，不需帶太多)、少量馬來西亞零食 (解鄉愁用)。</p>
                    <p className="text-[#c62828] p-3 bg-red-100/50 rounded-lg border border-red-300">⚠️ 絕對不可攜帶：肉類製品 (包含肉乾、泡麵內的肉塊)、生鮮蔬果。若遭查獲將面臨鉅額罰款！</p>
                    {Array(15).fill(<p className="opacity-50 text-justify tracking-wider">（以下省略極高密度攻略內容...）傳奇大典的羊皮紙能完美收納數以萬計的文字，請盡情向下滑動閱讀。</p>)}
                  </div>
                </div>
              )}

              {/* Insurance Text Demo */}
              {activeAlmanacTab === 'insurance' && (
                <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
                  <h3 className="text-3xl font-black text-[#7a6350] mb-6 flex items-center border-b-2 border-[#8b5a2b]/20 pb-4 flex-shrink-0">
                    🏥 僑外生健保理賠天書
                  </h3>
                  <div className="w-full flex-1 overflow-y-auto custom-scrollbar pr-4 text-[16px] leading-relaxed text-[#4a3b32] font-black space-y-6 pb-20">
                    <p>第一條：僑外生抵臺滿六個月後，方可加入全民健康保險。前六個月需投保僑外生醫療傷病保險。</p>
                    <p>第二條：就診時務必攜帶居留證與健保卡 (若已加保)。若於前六個月就診，請先自費墊付，並務必向醫院索取「診斷證明書」及「醫療費用收據正本」。</p>
                    <p>第三條：理賠申請流程：備妥上述文件，填寫理賠申請書，交至國際事務處承辦人。理賠款項通常於一個月內匯入學生提供之郵局帳戶。</p>
                    <p className="text-[#007aff] p-3 bg-blue-100/50 rounded-lg border border-blue-300">💡 提示：一般感冒門診掛號費約 150-200 臺幣 (有健保時)。若無健保，可能高達 500-1000 臺幣。</p>
                    {Array(15).fill(<p className="opacity-50 text-justify tracking-wider">（以下省略極高密度攻略內容...）傳奇大典的羊皮紙能完美收納數以萬計的文字，請盡情向下滑動閱讀。</p>)}
                  </div>
                </div>
              )}



            </div>
          </div>

          {/* Wooden Close Button */}
          <button 
            onClick={() => setIsAlmanacOpen(false)}
            className="absolute bottom-6 right-8 bg-[#8b5a2b] text-[#f4e8d1] px-6 py-3 rounded-xl font-black text-sm border-[3px] border-[#4a2e1b] shadow-[0_5px_0_#4a2e1b] active:translate-y-[5px] active:shadow-none hover:bg-[#7a4e25] transition-all flex items-center z-50 group"
          >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">↩️</span> 合上傳奇大典，返回小屋
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className={`flex-1 w-full flex flex-col ${location.pathname === '/campus' ? '' : 'p-8 max-w-[1400px] mx-auto'}`}>
        <Outlet />
      </main>

      <YggdrasilModal />

      {/* ============================== */}
      {/* EYE CARE AMBER OVERLAY */}
      {/* ============================== */}
      {createPortal(
        <div 
          className="fixed inset-0 pointer-events-none transition-opacity duration-1000 ease-in-out"
          style={{ 
            zIndex: 2147483647, // Maximum possible z-index to guarantee it covers everything
            opacity: isEyeCare ? 1 : 0,
            backgroundColor: 'rgba(15, 5, 0, 0.5)', // Strong dark amber/brown overlay
            backdropFilter: isEyeCare ? 'brightness(60%) sepia(40%)' : 'none',
            mixBlendMode: 'multiply'
          }}
        ></div>,
        document.body
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes wiggle {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }
        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
