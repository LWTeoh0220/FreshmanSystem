import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import confettiPkg from 'canvas-confetti';
const confetti = typeof confettiPkg === 'function' ? confettiPkg : confettiPkg.default;

export default function YggdrasilModal() {
  const { isYggdrasilOpen, setIsYggdrasilOpen, addReward, consumeHp } = usePlayer();
  const [pulseActive, setPulseActive] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const lastClaim = localStorage.getItem('yggdrasil_daily_date');
    const today = new Date().toLocaleDateString();
    if (lastClaim === today) {
      setHasClaimed(true);
    }
  }, []);

  if (!isYggdrasilOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsYggdrasilOpen(false);
    }, 500);
  };

  const handleSign = () => {
    if (hasClaimed) return;
    setPulseActive(true);
    
    // Confetti burst
    setTimeout(() => {
      try {
        if (confetti) {
          confetti({
            particleCount: 200,
            spread: 160,
            origin: { y: 0.9 }, // From the bottom tablet
            colors: ['#ffcc00', '#ff8f00', '#34c759', '#f4e8d1'],
            ticks: 300,
            gravity: 0.8
          });
        }
      } catch (e) { console.error('Confetti error', e); }
      
      // Update Context
      if (addReward) addReward(0, 10, 15); // xp:0, coins:10, mp:15
      if (consumeHp) consumeHp(-100); // refill HP to max
      
      setHasClaimed(true);
      localStorage.setItem('yggdrasil_daily_date', new Date().toLocaleDateString());
    }, 600);

    setTimeout(() => {
      setPulseActive(false);
      handleClose();
    }, 2500);
  };

  return createPortal(
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-[3px] p-4 lg:p-8 transition-opacity duration-500 ${isClosing ? 'opacity-0' : 'opacity-100 animate-fade-in-up'}`}>
      {/* The 2.5D Yggdrasil Universe Panel */}
      <div className={`w-full max-w-[1400px] h-full max-h-[900px] rounded-3xl relative overflow-hidden bg-[#0a0a0f] border-4 border-[#8b5a2b]/40 shadow-[0_0_50px_rgba(0,0,0,0.8)] rpg-border flex flex-col transition-transform duration-500 origin-center ${isClosing ? 'scale-95' : 'scale-100'}`}>
        
        {/* Background Layers */}
        {/* 1. Deep Space/Forest Abyss */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_#06221c_0%,_#0a0a0f_80%)] z-0"></div>
        
        {/* 2. Top Golden Divine Light (神域之巔 - 碎金聖光) */}
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-[linear-gradient(160deg,_rgba(255,215,0,0.15)_0%,_transparent_60%)] pointer-events-none z-0"></div>
        <div className="absolute -top-[200px] left-[10%] w-[800px] h-[800px] bg-[radial-gradient(circle,_rgba(255,204,0,0.08)_0%,_transparent_70%)] rounded-full mix-blend-screen animate-pulse pointer-events-none z-0"></div>

        {/* 3. Bottom Blue Magic Light (根源之地 - 幽藍魔光) */}
        <div className="absolute bottom-0 left-0 right-0 h-[400px] bg-[linear-gradient(0deg,_rgba(0,122,255,0.15)_0%,_transparent_80%)] pointer-events-none z-0"></div>
        
        {/* Giant Tree Silhouette */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full z-0 opacity-40 pointer-events-none blur-[4px]">
          {/* Main Trunk */}
          <path d="M 45,100 C 45,60 48,40 50,20 C 52,40 55,60 55,100 Z" fill="#047857" />
          {/* Left Branch to Course Selection */}
          <path d="M 48,45 C 40,35 30,25 25,15 C 30,28 42,40 50,45 Z" fill="#047857" />
          {/* Right Branch to Ceremony */}
          <path d="M 52,35 C 60,25 70,20 75,10 C 70,23 58,30 50,35 Z" fill="#047857" />
          {/* Left Root to Luggage */}
          <path d="M 46,75 C 40,80 30,85 25,85 C 32,88 42,83 48,77 Z" fill="#047857" />
          {/* Right Root to Health */}
          <path d="M 54,80 C 60,82 70,83 75,83 C 68,86 58,85 52,82 Z" fill="#047857" />
        </svg>

        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 text-[#d2b48c] hover:text-[#ffcc00] transition-colors bg-black/40 hover:bg-black/80 border border-[#8b5a2b]/50 p-3 rounded-xl z-50 shadow-lg group"
        >
          <X size={32} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Main 2.5D Tree Structure (Abstract SVG/CSS representation) */}
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-10">
          
          {/* Energy Flow Lines (SVG) */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.6))' }}>
            {/* Trunk line */}
            <path d="M 50,90 C 50,70 50,30 50,15" fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="1" />
            <path d="M 50,90 C 50,70 50,30 50,15" fill="none" stroke="#10b981" strokeWidth="0.5" strokeDasharray="2 4" className="animate-[dash_30s_linear_infinite]" />
            
            {/* Left Branch to Course Selection */}
            <path d="M 50,45 C 40,35 30,25 25,20" fill="none" stroke="rgba(16,185,129,0.2)" strokeWidth="0.5" />
            {/* Right Branch to Ceremony */}
            <path d="M 50,35 C 60,25 70,20 75,15" fill="none" stroke="rgba(16,185,129,0.2)" strokeWidth="0.5" />
            
            {/* Left Root to Luggage */}
            <path d="M 50,75 C 40,80 30,85 25,85" fill="none" stroke="rgba(16,185,129,0.4)" strokeWidth="0.5" />
            <path d="M 25,85 C 30,85 40,80 50,75" fill="none" stroke="#34d399" strokeWidth="0.5" strokeDasharray="1 3" className="animate-[dash_20s_linear_infinite_reverse]" />
            
            {/* Right Root to Health */}
            <path d="M 50,80 C 60,82 70,83 75,83" fill="none" stroke="rgba(16,185,129,0.4)" strokeWidth="0.5" />
            <path d="M 75,83 C 70,83 60,82 50,80" fill="none" stroke="#34d399" strokeWidth="0.5" strokeDasharray="1 3" className="animate-[dash_20s_linear_infinite_reverse]" />
            
            {/* Pulse Animation Overlays triggered by interaction */}
            {pulseActive && (
              <>
                <circle cx="50" cy="85" r="0" fill="none" stroke="#ffcc00" strokeWidth="2" className="animate-[ripple_2s_ease-out_forwards]" />
                <path d="M 50,90 C 50,70 50,30 50,15" fill="none" stroke="#ffcc00" strokeWidth="2" strokeDasharray="100" strokeDashoffset="100" className="animate-[flowUp_2s_ease-out_forwards]" style={{ filter: 'drop-shadow(0 0 5px #ffcc00)' }}/>
              </>
            )}
          </svg>

          {/* Central Trunk Glow */}
          <div className="absolute top-[20%] bottom-[10%] w-[120px] bg-gradient-to-b from-transparent via-[#047857]/30 to-transparent blur-2xl rounded-full"></div>

          {/* === NODES === */}
          
          {/* Top Left: Course Selection (Locked) */}
          <div className="absolute top-[20%] left-[25%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto group flex flex-col items-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#1e293b] rotate-45 rounded-lg border-2 border-[#334155] shadow-[inset_0_0_15px_rgba(0,0,0,0.8),_0_0_20px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-110"></div>
              <div className="relative z-10 text-4xl opacity-50 grayscale drop-shadow-md">📝</div>
              <div className="absolute -bottom-2 -right-2 text-2xl z-20 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">🔒</div>
            </div>
            {/* Micro Label */}
            <div className="absolute -bottom-8 w-max text-center text-[#94a3b8] text-[11px] font-black tracking-widest opacity-50 drop-shadow-md z-10 pointer-events-none">
              【 🔒 封印：全校網路預選 】
            </div>
            {/* Hover Tooltip */}
            <div className="absolute top-[120%] mt-4 left-1/2 -translate-x-1/2 bg-black/90 text-gray-400 border border-gray-600 px-4 py-2 rounded-xl text-center min-w-max shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <div className="font-black text-sm mb-1">網路選課預選</div>
              <div className="text-[10px] text-gray-500 bg-gray-800 rounded px-2 py-1">🔒 08/19 賽季解鎖日期</div>
            </div>
          </div>

          {/* Top Right: Ceremony (Locked) */}
          <div className="absolute top-[15%] left-[75%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto group flex flex-col items-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#1e293b] rotate-45 rounded-lg border-2 border-[#334155] shadow-[inset_0_0_15px_rgba(0,0,0,0.8),_0_0_20px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-110"></div>
              <div className="relative z-10 text-4xl opacity-50 grayscale drop-shadow-md">🎓</div>
              <div className="absolute -bottom-2 -right-2 text-2xl z-20 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">🔒</div>
            </div>
            {/* Micro Label */}
            <div className="absolute -bottom-8 w-max text-center text-[#94a3b8] text-[11px] font-black tracking-widest opacity-50 drop-shadow-md z-10 pointer-events-none">
              【 🔒 封印：新學期開學典禮 】
            </div>
            {/* Hover Tooltip */}
            <div className="absolute top-[120%] mt-4 left-1/2 -translate-x-1/2 bg-black/90 text-gray-400 border border-gray-600 px-4 py-2 rounded-xl text-center min-w-max shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <div className="font-black text-sm mb-1">新生入學典禮</div>
              <div className="text-[10px] text-gray-500 bg-gray-800 rounded px-2 py-1">🔒 08/25 賽季解鎖日期</div>
            </div>
          </div>

          {/* Middle: ARC / Enrollment (Current Core - Lava Orange) */}
          <div className="absolute top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto group z-30 flex flex-col items-center">
            {/* Spinning Rune Circle */}
            <div className="absolute -inset-12 border border-[#ff5722]/30 rounded-full border-dashed animate-[spin_10s_linear_infinite] pointer-events-none"></div>
            <div className="absolute -inset-16 border-2 border-[#ff9800]/20 rounded-full border-dotted animate-[spin_15s_linear_infinite_reverse] pointer-events-none flex items-center justify-center text-[#ffcc00]/40 text-[8px] tracking-[10px] font-mono">
              YGGDRASIL ARC NODE
            </div>
            
            {/* Lava Crystal */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff5722] to-[#d84315] rotate-45 rounded-xl border-2 border-[#ffcc00] shadow-[inset_0_0_20px_rgba(255,255,255,0.4),_0_0_40px_rgba(255,87,34,0.8)] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[135deg]"></div>
              <div className="absolute inset-0 bg-[#ff9800] blur-xl opacity-50 rounded-full animate-pulse z-[-1]"></div>
              <div className="relative z-10 text-5xl drop-shadow-[0_2px_5px_rgba(0,0,0,0.6)] animate-floating">🛡️</div>
            </div>
            {/* Micro Label */}
            <div className="absolute -bottom-10 w-max text-center text-[#ffcc00] text-[11px] font-black tracking-widest drop-shadow-[0_0_8px_rgba(255,152,0,0.8)] animate-[pulse_2s_ease-in-out_infinite] z-10 pointer-events-none">
              【 🔥 主線：入學與居留手續 】
            </div>
            {/* Hover Tooltip */}
            <div className="absolute top-[120%] mt-8 left-1/2 -translate-x-1/2 bg-black/90 border-2 border-[#ff5722] text-white px-5 py-3 rounded-xl text-center min-w-max shadow-[0_10px_20px_rgba(255,87,34,0.3)] opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 z-20">
              <div className="font-black text-lg text-[#ffcc00] mb-1">挑戰/力量節點</div>
              <div className="text-sm font-bold">入學與居留手續 (進行中)</div>
            </div>
          </div>

          {/* Bottom Left: Luggage (Early Unlock - Emerald Green) */}
          <div className="absolute top-[85%] left-[25%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto group flex flex-col items-center">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#10b981] to-[#047857] rotate-45 rounded-lg border-2 border-[#34d399] shadow-[inset_0_0_15px_rgba(255,255,255,0.3),_0_0_25px_rgba(16,185,129,0.5)] transition-transform duration-500 group-hover:scale-110"></div>
              <div className="relative z-10 text-3xl drop-shadow-[0_2px_5px_rgba(0,0,0,0.6)]">🧳</div>
            </div>
            {/* Micro Label */}
            <div className="absolute -bottom-8 w-max text-center text-[#fcd34d] text-[11px] font-black tracking-widest drop-shadow-md opacity-90 z-10 pointer-events-none">
              【 ◆ 支線：赴台行李物資 】
            </div>
            {/* Hover Tooltip */}
            <div className="absolute top-[120%] mt-4 left-1/2 -translate-x-1/2 bg-black/90 border border-[#10b981] text-white px-4 py-2 rounded-xl text-center min-w-max shadow-[0_5px_15px_rgba(16,185,129,0.2)] opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <div className="font-black text-sm text-[#34d399] mb-1">提早開啟支線</div>
              <div className="text-xs font-bold">赴台行李物資 (已解鎖)</div>
            </div>
          </div>

          {/* Bottom Right: Health (Early Unlock - Emerald Green) */}
          <div className="absolute top-[83%] left-[75%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto group flex flex-col items-center">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#10b981] to-[#047857] rotate-45 rounded-lg border-2 border-[#34d399] shadow-[inset_0_0_15px_rgba(255,255,255,0.3),_0_0_25px_rgba(16,185,129,0.5)] transition-transform duration-500 group-hover:scale-110"></div>
              <div className="relative z-10 text-3xl drop-shadow-[0_2px_5px_rgba(0,0,0,0.6)]">🩺</div>
            </div>
            {/* Micro Label */}
            <div className="absolute -bottom-8 w-max text-center text-[#fcd34d] text-[11px] font-black tracking-widest drop-shadow-md opacity-90 z-10 pointer-events-none">
              【 ◆ 支線：海外預檢作業 】
            </div>
            {/* Hover Tooltip */}
            <div className="absolute top-[120%] mt-4 left-1/2 -translate-x-1/2 bg-black/90 border border-[#10b981] text-white px-4 py-2 rounded-xl text-center min-w-max shadow-[0_5px_15px_rgba(16,185,129,0.2)] opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <div className="font-black text-sm text-[#34d399] mb-1">提早開啟支線</div>
              <div className="text-xs font-bold">海外預檢作業 (已解鎖)</div>
            </div>
          </div>

        </div>

        {/* Footer: Sign in Tablet */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
          <button 
            onClick={handleSign}
            disabled={hasClaimed || pulseActive}
            className={`group relative overflow-hidden px-10 py-5 rounded-2xl bg-gradient-to-b from-[#4a3b32] to-[#2d1c15] border-t-4 border-[#8b5a2b] border-b-[6px] border-[#1a120e] shadow-[0_15px_30px_rgba(0,0,0,0.8),_inset_0_2px_10px_rgba(255,255,255,0.1)] transition-all flex flex-col items-center justify-center
              ${hasClaimed ? 'opacity-80 cursor-not-allowed grayscale-[30%]' : 'hover:brightness-110 active:border-b-0 active:translate-y-1.5 cursor-pointer hover:shadow-[0_10px_40px_rgba(255,204,0,0.4)]'}
            `}
          >
            {/* Glowing Text */}
            <div className={`text-2xl font-black tracking-widest text-[#f4e8d1] drop-shadow-[0_2px_2px_rgba(0,0,0,1)] ${hasClaimed ? '' : 'group-hover:text-[#ffcc00] group-hover:drop-shadow-[0_0_10px_#ffcc00]'} transition-colors relative z-10 flex items-center`}>
              <Sparkles className={`mr-3 ${hasClaimed ? 'text-gray-500' : 'text-[#ffcc00]'} ${pulseActive ? 'animate-ping' : ''}`} />
              {hasClaimed ? '今日已觸摸神聖根源' : '觸摸神聖根源（每日簽到）'}
              <Sparkles className={`ml-3 ${hasClaimed ? 'text-gray-500' : 'text-[#ffcc00]'} ${pulseActive ? 'animate-ping' : ''}`} />
            </div>
            {!hasClaimed && (
              <div className="text-[#8b5a2b] font-bold text-sm mt-1 bg-black/40 px-3 py-1 rounded-full relative z-10 border border-[#8b5a2b]/30">
                代價：0 G | 獲得：體力全滿、金幣與魔力加護
              </div>
            )}
            
            {/* Magical Overlay inside button */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20 pointer-events-none z-0"></div>
            {!hasClaimed && (
              <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-45deg] group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none z-0"></div>
            )}
          </button>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to { stroke-dashoffset: -300; }
        }
        @keyframes ripple {
          0% { r: 0; opacity: 1; }
          100% { r: 200px; opacity: 0; }
        }
        @keyframes flowUp {
          0% { stroke-dashoffset: 300; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes shimmer {
          100% { left: 200%; }
        }
      `}} />
    </div>,
    document.body
  );
}
