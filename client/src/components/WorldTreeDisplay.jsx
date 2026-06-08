import React, { useState, useEffect } from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import { Sparkles, HelpCircle, Lock, Shield, Stethoscope, Briefcase, Calendar, GraduationCap } from 'lucide-react';
import confettiPkg from 'canvas-confetti';
const confetti = typeof confettiPkg === 'function' ? confettiPkg : confettiPkg.default;

export default function WorldTreeDisplay() {
  const { addReward, consumeHp } = usePlayer();
  const [hasPhone, setHasPhone] = useState(false);
  const [hasBank, setHasBank] = useState(false);
  const [hasArc, setHasArc] = useState(false);

  const [isShaking, setIsShaking] = useState(false);
  const [showDewdrop, setShowDewdrop] = useState(false);
  const [showFortune, setShowFortune] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [activeWhisper, setActiveWhisper] = useState(null);

  const whispers = [
    { id: 1, text: "電子系前輩留：南辦宿舍晚上11點大門管制，出門記得帶鑰匙！", style: { top: '25%', left: '15%' } },
    { id: 2, text: "企管系學姊留：建國啤酒廠旁邊的熱炒店是系隊聚餐聖地！", style: { top: '40%', right: '10%' } },
    { id: 3, text: "機電系學長留：光華商場買零件記得貨比三家，帶學生證有時有打折！", style: { bottom: '30%', left: '12%' } }
  ];

  const fortunes = [
    "【大吉】神聖巨樹降下賜福：今日圖書館自習有如神助，Debug 一次過！",
    "【中吉】世界樹的微風：中午去吃學餐會遇到打菜阿姨多給一塊肉！",
    "【小吉】精靈的惡作劇：校園裡散步可能會撿到 10 元硬幣！",
    "【吉】古老智慧的庇護：教授今天心情不錯，點名可能放水哦！"
  ];

  useEffect(() => {
    const checkStorage = () => {
      setHasPhone(!!localStorage.getItem('user_phone'));
      setHasBank(!!localStorage.getItem('user_bank'));
      setHasArc(!!localStorage.getItem('user_arc'));
    };
    checkStorage();

    window.addEventListener('storage', checkStorage);
    const interval = setInterval(checkStorage, 2000);
    return () => {
      window.removeEventListener('storage', checkStorage);
      clearInterval(interval);
    };
  }, []);

  const handleTreeClick = () => {
    if (hasClaimed) return;
    setIsShaking(true);
    
    // Shake for 1 second
    setTimeout(() => {
      setIsShaking(false);
      setShowDewdrop(true);
      
      // Dewdrop falls
      setTimeout(() => {
        setShowDewdrop(false);
        try {
          if (confetti) {
            confetti({
              particleCount: 200,
              spread: 120,
              origin: { y: 0.8 },
              colors: ['#ffcc00', '#f4e8d1', '#007aff', '#10b981'],
              zIndex: 9999
            });
          }
        } catch (e) {}
        
        setShowFortune(true);
        addReward(0, 10, 15); // +10 coins, +15 mp
        consumeHp(-100); // Heal HP to max
        setHasClaimed(true);
      }, 800);
    }, 1000);
  };

  return (
    <div className="w-full h-full min-h-[500px] bg-gradient-to-b from-[#2a1f1a]/80 to-[#1a120e]/90 rounded-3xl border-2 border-[#8b5a2b]/40 relative flex flex-col items-center justify-center overflow-hidden shadow-inner">
      
      {/* Title */}
      <h3 className="absolute top-5 left-6 text-xl font-black text-[#f4e8d1] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-30 flex items-center border-b border-[#f4e8d1]/30 pb-1">
        🌲 終極戰情室：神聖世界樹
      </h3>

      {/* BACKGROUND: Tyndall Light Beams (丁達爾聖光) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-20 -right-20 w-[150%] h-[150%] bg-gradient-to-br from-[#f4e8d1]/20 via-[#ffcc00]/5 to-transparent rotate-[35deg] blur-3xl mix-blend-overlay"></div>
        <div className="absolute top-0 right-10 w-48 h-[200%] bg-gradient-to-b from-white/10 to-transparent rotate-[30deg] blur-xl mix-blend-overlay"></div>
        <div className="absolute top-0 left-20 w-32 h-[200%] bg-gradient-to-b from-[#ffcc00]/10 to-transparent rotate-[45deg] blur-xl mix-blend-overlay"></div>
      </div>

      {/* BACKGROUND: Magical Emerald/Gold Radial Glow (魔法陣光暈) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.3)_0%,_rgba(234,179,8,0.15)_40%,_transparent_70%)] mix-blend-screen pointer-events-none z-0 animate-[pulse_4s_ease-in-out_infinite]"></div>

      {/* Legacy Whispers (Floating Bubbles acting as fruits) */}
      {whispers.map(whisper => (
        <div key={whisper.id} className="absolute z-40" style={whisper.style}>
          <div 
            className="w-10 h-10 rounded-full bg-[#1a120e]/80 border border-[#ffcc00]/40 backdrop-blur-md flex items-center justify-center cursor-help hover:bg-[#ffcc00]/20 hover:scale-110 transition-all shadow-[0_6px_8px_rgba(0,0,0,0.5)] relative group"
            onMouseEnter={() => setActiveWhisper(whisper.id)}
            onMouseLeave={() => setActiveWhisper(null)}
          >
            <HelpCircle size={20} className="text-[#ffcc00]/90" />
          </div>
          {activeWhisper === whisper.id && (
            <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-56 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] bg-[#f4e8d1] text-[#4a3b32] p-4 rounded-xl border-[3px] border-[#8b5a2b] shadow-2xl text-xs font-black leading-relaxed z-50 animate-bounce-in-stagger">
              {whisper.text}
            </div>
          )}
        </div>
      ))}

      {/* MAJESTIC EPIC WORLD TREE CONTAINER */}
      <div className={`relative w-full h-[400px] mt-12 flex flex-col items-center justify-end z-10 ${isShaking ? 'animate-[shake_0.4s_ease-in-out_infinite]' : ''}`}>
        
        {/* === THE CROWN (FOLIAGE) === */}
        <div className="absolute top-0 w-full h-[280px] flex justify-center items-center pointer-events-none z-20">
          {/* Main Huge Leaves */}
          <div className="absolute top-4 w-[280px] h-[220px] bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857] rounded-[40%_60%_60%_40%/50%_50%_50%_50%] border-0 shadow-[inset_0_-8px_20px_rgba(0,0,0,0.3)]"></div>
          {/* Left Large Cluster */}
          <div className="absolute top-16 -left-8 w-[200px] h-[160px] bg-gradient-to-br from-[#047857] via-[#065f46] to-[#047857] rounded-[50%_50%_40%_60%] border-0 shadow-[inset_0_-6px_15px_rgba(0,0,0,0.3)]"></div>
          {/* Right Large Cluster */}
          <div className="absolute top-12 -right-10 w-[220px] h-[180px] bg-gradient-to-br from-[#059669] via-[#047857] to-[#047857] rounded-[60%_40%_50%_50%] border-0 shadow-[inset_0_-6px_15px_rgba(0,0,0,0.3)]"></div>
          {/* Top Peak */}
          <div className="absolute -top-10 w-[180px] h-[140px] bg-gradient-to-b from-[#10b981] via-[#059669] to-[#047857] rounded-full border-0 shadow-[inset_0_-6px_15px_rgba(0,0,0,0.3)]"></div>

          {/* Phone Milestone: Blue Electromagnetic Overlay on Leaves */}
          {hasPhone && (
            <div className="absolute inset-0 flex items-center justify-center animate-fade-in-up mix-blend-screen opacity-60">
              <div className="absolute w-[300px] h-[250px] bg-[radial-gradient(ellipse_at_center,_#3b82f6_0%,_transparent_60%)] animate-pulse"></div>
              <div className="absolute top-20 left-10 w-32 h-32 border border-dashed border-[#60a5fa] rounded-full animate-[spin_12s_linear_infinite]"></div>
              <div className="absolute top-10 right-20 w-40 h-40 border border-dashed border-[#3b82f6] rounded-full animate-[spin_8s_linear_infinite_reverse]"></div>
            </div>
          )}
        </div>

        {/* === BRANCHES & QUEST BADGES (FRUITS) === */}
        <div className="absolute top-[150px] w-full h-[200px] z-30 pointer-events-none">
          
          {/* Lower Left Branch: Luggage */}
          <div className="absolute top-6 left-[15%] w-[120px] h-6 bg-[#3e2723] rounded-full rotate-[-15deg] shadow-[inset_0_-2px_5px_rgba(0,0,0,0.8)] border-t border-[#795548]/50">
            <div className="absolute -top-5 left-10 pointer-events-auto cursor-help group/badge z-10">
              <div className="w-12 h-12 rounded-full bg-[#e0cda5] border-2 border-[#8b5a2b] shadow-[0_8px_6px_-2px_rgba(0,0,0,0.5)] flex items-center justify-center group-hover/badge:scale-110 transition-transform relative">
                <Briefcase size={20} className="text-[#8b5a2b]" />
              </div>
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/badge:opacity-100 transition-opacity whitespace-nowrap font-bold">
                🧳 赴台行李物資 (已解鎖)
              </div>
            </div>
          </div>

          {/* Lower Right Branch: Health */}
          <div className="absolute top-10 right-[15%] w-[140px] h-7 bg-[#3e2723] rounded-full rotate-[15deg] shadow-[inset_0_-2px_5px_rgba(0,0,0,0.8)] border-t border-[#795548]/50">
            <div className="absolute -top-6 right-10 pointer-events-auto cursor-help group/badge z-10">
              <div className="w-12 h-12 rounded-full bg-[#e0cda5] border-2 border-[#8b5a2b] shadow-[0_8px_6px_-2px_rgba(0,0,0,0.5)] flex items-center justify-center group-hover/badge:scale-110 transition-transform relative">
                <Stethoscope size={20} className="text-[#8b5a2b]" />
              </div>
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/badge:opacity-100 transition-opacity whitespace-nowrap font-bold">
                🩺 海外預檢作業 (已解鎖)
              </div>
            </div>
          </div>

          {/* Middle Epic Branch: ARC (Glowing & Red Dot) */}
          <div className="absolute top-0 right-[35%] w-[100px] h-8 bg-[#3e2723] rounded-full rotate-[30deg] shadow-[inset_0_-3px_8px_rgba(0,0,0,0.8)] border-t border-[#795548]/50">
            {/* Radial Gold Glow centered on the badge on the branch */}
            <div className="absolute -top-12 right-0 w-32 h-32 bg-[radial-gradient(circle,_rgba(255,204,0,0.6)_0%,_transparent_70%)] mix-blend-screen pointer-events-none animate-[pulse_2s_ease-in-out_infinite] z-0"></div>
            
            <div className="absolute -top-8 right-2 pointer-events-auto cursor-help group/badge z-10">
              {/* Epic Aura & Red Dot */}
              <div className="absolute inset-0 bg-[#ffcc00] blur-md opacity-60 rounded-full animate-pulse z-[-1]"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-[0_0_10px_red] animate-ping z-20"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-[0_0_10px_red] z-20"></div>
              
              <div className="w-14 h-14 relative rounded-full bg-gradient-to-br from-[#ffcc00] to-[#ff8f00] border-2 border-white shadow-[0_8px_8px_-2px_rgba(0,0,0,0.6)] flex items-center justify-center group-hover/badge:scale-110 transition-transform z-10">
                <Shield size={24} className="text-white drop-shadow-md" />
              </div>
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max bg-black/90 text-[#ffcc00] border border-[#ffcc00]/50 text-[10px] px-2 py-1 rounded opacity-0 group-hover/badge:opacity-100 transition-opacity whitespace-nowrap font-black z-30">
                🛡️ 入學與居留手續 (急迫/進行中)
              </div>
            </div>
          </div>

          {/* Upper Left Branch: Course Selection (Locked) */}
          <div className="absolute -top-20 left-[25%] w-[100px] h-5 bg-[#2d1c15] rounded-full rotate-[-25deg] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.8)] z-[-1]">
            <div className="absolute -top-5 left-6 pointer-events-auto cursor-not-allowed group/badge opacity-60 grayscale z-10">
              <div className="w-10 h-10 rounded-full bg-gray-400 border-2 border-gray-600 shadow-[0_6px_6px_-2px_rgba(0,0,0,0.5)] flex items-center justify-center relative">
                <Calendar size={16} className="text-gray-700" />
                <div className="absolute -bottom-2 -right-2 bg-gray-800 rounded-full p-1 border border-gray-500">
                  <Lock size={10} className="text-gray-300" />
                </div>
              </div>
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max bg-black/80 text-gray-300 text-[10px] px-2 py-1 rounded opacity-0 group-hover/badge:opacity-100 transition-opacity whitespace-nowrap font-bold">
                📝 網路選課預選 (🔒 尚未開啟)
              </div>
            </div>
          </div>

          {/* Upper Right Branch: Ceremony (Locked) */}
          <div className="absolute -top-32 right-[25%] w-[90px] h-4 bg-[#2d1c15] rounded-full rotate-[35deg] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.8)] z-[-1]">
            <div className="absolute -top-5 right-6 pointer-events-auto cursor-not-allowed group/badge opacity-60 grayscale z-10">
              <div className="w-10 h-10 rounded-full bg-gray-400 border-2 border-gray-600 shadow-[0_6px_6px_-2px_rgba(0,0,0,0.5)] flex items-center justify-center relative">
                <GraduationCap size={16} className="text-gray-700" />
                <div className="absolute -bottom-2 -right-2 bg-gray-800 rounded-full p-1 border border-gray-500">
                  <Lock size={10} className="text-gray-300" />
                </div>
              </div>
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max bg-black/80 text-gray-300 text-[10px] px-2 py-1 rounded opacity-0 group-hover/badge:opacity-100 transition-opacity whitespace-nowrap font-bold">
                🎓 新生入學典禮 (🔒 尚未開啟)
              </div>
            </div>
          </div>
        </div>

        {/* === THE TRUNK === */}
        <div className="relative w-24 h-[250px] bg-gradient-to-r from-[#2d1c15] via-[#4e342e] to-[#2d1c15] rounded-t-3xl z-10 shadow-[inset_10px_0_20px_rgba(0,0,0,0.6),_inset_-10px_0_20px_rgba(0,0,0,0.6)] flex flex-col justify-end">
          {/* Wood Texture Overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-40 mix-blend-overlay"></div>
          {/* Epic Roots Base */}
          <div className="absolute -bottom-4 -left-12 w-48 h-12 bg-gradient-to-t from-[#1a120e] to-transparent rounded-[50%] blur-sm -z-10"></div>
        </div>

        {/* === BANK MILESTONE: GOLDEN ROOTS === */}
        {hasBank && (
          <div className="absolute bottom-2 w-full flex justify-center z-10 pointer-events-none opacity-90">
            <div className="relative w-[200px] h-[40px]">
              {/* Central glow */}
              <div className="absolute inset-0 bg-[#ffcc00] blur-xl opacity-30 animate-pulse"></div>
              {/* Root lines via SVG */}
              <svg viewBox="0 0 200 40" className="w-full h-full drop-shadow-[0_0_8px_#ffcc00]">
                <path d="M100 0 Q80 20 40 30 Q20 35 0 35" fill="none" stroke="#ffcc00" strokeWidth="4" strokeLinecap="round" className="opacity-80" />
                <path d="M100 0 Q120 20 160 30 Q180 35 200 35" fill="none" stroke="#ffcc00" strokeWidth="4" strokeLinecap="round" className="opacity-80" />
                <path d="M90 10 Q70 30 50 40" fill="none" stroke="#eab308" strokeWidth="3" strokeLinecap="round" className="opacity-70" />
                <path d="M110 10 Q130 30 150 40" fill="none" stroke="#eab308" strokeWidth="3" strokeLinecap="round" className="opacity-70" />
              </svg>
            </div>
          </div>
        )}

        {/* === ARC MILESTONE: GOLDEN LEGENDARY FLOWER === */}
        {hasArc && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-10 z-30 flex items-center justify-center animate-fade-in-up">
            <div className="absolute w-40 h-40 bg-[radial-gradient(ellipse_at_center,_#ffcc00_0%,_transparent_60%)] opacity-60 animate-pulse blur-md"></div>
            <div className="absolute text-6xl drop-shadow-[0_0_20px_#ffcc00] animate-[spin_20s_linear_infinite]">❂</div>
            <div className="absolute text-4xl drop-shadow-[0_0_15px_#fff]">✨</div>
          </div>
        )}

        {/* Dewdrop Animation */}
        {showDewdrop && (
          <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-5 h-5 bg-gradient-to-b from-[#60a5fa] to-[#2563eb] rounded-full shadow-[0_0_20px_#60a5fa] animate-[dewdropDrop_0.8s_ease-in_forwards] z-50 overflow-hidden">
            <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full opacity-60 blur-[1px]"></div>
          </div>
        )}
      </div>

      {/* NEW INTERACTION BUTTON: Parchment Tag near roots */}
      <div className="absolute bottom-6 z-40 w-full flex justify-center">
        <button 
          onClick={handleTreeClick}
          disabled={hasClaimed || isShaking || showDewdrop}
          className={`px-6 py-2.5 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] bg-[#f4e8d1] text-[#4a3b32] font-black text-xs rounded-full border border-[#8b5a2b]/40 shadow-[0_8px_20px_rgba(0,0,0,0.4)] transition-all flex items-center justify-center ${hasClaimed ? 'opacity-80 cursor-not-allowed grayscale-[20%]' : 'hover:scale-105 active:scale-95 hover:shadow-[0_0_15px_rgba(255,204,0,0.4)] hover:border-[#8b5a2b]'}`}
        >
          {!hasClaimed && <span className="absolute -left-2 -top-2 text-lg animate-bounce">✨</span>}
          <span className="mr-2 text-base">🔮</span>
          {hasClaimed ? '今日已採集神聖露水' : '觸摸世界樹，採集神聖露水 (簽到)'}
        </button>
      </div>

      {/* Fortune Paper Popup (Unchanged, just better styling) */}
      {showFortune && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#1d1d1f]/60 backdrop-blur-md p-4 animate-fade-in-up">
          <div className="bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] bg-[#f4e8d1] p-8 rounded-3xl max-w-sm w-full border-[6px] border-[#8b5a2b] shadow-[0_0_50px_rgba(255,204,0,0.3)] relative text-center">
            <h4 className="text-2xl font-black text-[#8b5a2b] mb-6 border-b-2 border-[#8b5a2b]/20 pb-3 flex items-center justify-center">
              <Sparkles size={24} className="mr-2 text-[#ffcc00]" />
              神聖露水占卜
            </h4>
            <p className="text-[#4a3b32] font-bold text-lg mb-8 leading-relaxed px-4">
              {fortunes[Math.floor(Math.random() * fortunes.length)]}
            </p>
            <div className="flex justify-center space-x-3 mb-8">
              <span className="bg-[#ffcc00]/20 text-[#8b5a2b] px-3 py-1.5 rounded-full font-black text-sm border border-[#ffcc00]/50 shadow-sm">💰 +10 金幣</span>
              <span className="bg-[#c62828]/10 text-[#c62828] px-3 py-1.5 rounded-full font-black text-sm border border-[#c62828]/30 shadow-sm">❤️ HP 補滿</span>
              <span className="bg-[#007aff]/10 text-[#007aff] px-3 py-1.5 rounded-full font-black text-sm border border-[#007aff]/30 shadow-sm">🔮 +15 MP</span>
            </div>
            <button 
              onClick={() => setShowFortune(false)}
              className="w-full py-3 bg-gradient-to-b from-[#8b5a2b] to-[#5c4033] text-[#f4e8d1] font-black text-lg rounded-xl border-b-4 border-[#3a2318] hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all shadow-lg"
            >
              收下世界樹的祝福
            </button>
          </div>
        </div>
      )}

      {/* Keyframes for Dewdrop */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dewdropDrop {
          0% { transform: translate(-50%, 0) scale(1); opacity: 1; }
          70% { transform: translate(-50%, 250px) scale(0.8); opacity: 1; }
          100% { transform: translate(-50%, 260px) scale(3); opacity: 0; }
        }
      `}} />
    </div>
  );
}
