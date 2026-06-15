import React, { useState, useEffect } from 'react';
import confettiPkg from 'canvas-confetti';
const confetti = typeof confettiPkg === 'function' ? confettiPkg : confettiPkg.default;

export default function GachaInteractiveModal({ result, onComplete }) {
  const [phase, setPhase] = useState('stirring'); // 'stirring', 'dropped', 'cracking'
  
  useEffect(() => {
    if (phase === 'stirring') {
      const timer = setTimeout(() => {
        setPhase('dropped');
      }, 3500); // 3.5 seconds of mysterious stirring
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleCrack = () => {
    if (phase !== 'dropped') return;
    setPhase('cracking');
    
    setTimeout(() => {
      try {
        if (confetti) {
          confetti({
            particleCount: result.rarity === 'Epic' ? 400 : result.rarity === 'Rare' ? 200 : 100,
            spread: 160,
            origin: { y: 0.6 },
            colors: result.rarity === 'Epic' ? ['#ffcc00', '#ffd700', '#ffffff', '#ff8f00'] : 
                    result.rarity === 'Rare' ? ['#00e676', '#69f0ae', '#ffffff'] : 
                    ['#90caf9', '#e3f2fd', '#ffffff'],
            startVelocity: 55,
            gravity: 0.8
          });
        }
      } catch (e) {}

      onComplete();
    }, 1800);
  };

  const getRarityColors = () => {
    switch (result.rarity) {
      case 'Epic': return {
        top: 'bg-gradient-to-br from-[#ffd700] via-[#ffaa00] to-[#b8860b]',
        bottom: 'bg-gradient-to-tr from-[#8b6508] to-[#1a1100]',
        glow: 'drop-shadow-[0_0_50px_rgba(255,215,0,0.8)]',
        bgGlow: 'bg-[radial-gradient(circle,_rgba(255,170,0,0.3)_0%,_transparent_70%)]',
        core: 'bg-[#fff9c4] shadow-[0_0_30px_#ffd700]'
      };
      case 'Rare': return {
        top: 'bg-gradient-to-br from-[#00ffcc] via-[#00b0ff] to-[#005c99]',
        bottom: 'bg-gradient-to-tr from-[#003d66] to-[#001429]',
        glow: 'drop-shadow-[0_0_50px_rgba(0,176,255,0.7)]',
        bgGlow: 'bg-[radial-gradient(circle,_rgba(0,176,255,0.25)_0%,_transparent_70%)]',
        core: 'bg-[#e0f7fa] shadow-[0_0_30px_#00e5ff]'
      };
      case 'Common':
      default: return {
        top: 'bg-gradient-to-br from-[#e0e0e0] via-[#9e9e9e] to-[#616161]',
        bottom: 'bg-gradient-to-tr from-[#424242] to-[#121212]',
        glow: 'drop-shadow-[0_0_30px_rgba(158,158,158,0.5)]',
        bgGlow: 'bg-[radial-gradient(circle,_rgba(158,158,158,0.2)_0%,_transparent_70%)]',
        core: 'bg-[#fafafa] shadow-[0_0_30px_#bdbdbd]'
      };
    }
  };

  const colors = getRarityColors();

  return (
    <div className={`fixed inset-0 z-[300] flex items-center justify-center transition-all duration-1000 overflow-hidden ${phase === 'cracking' ? 'bg-[#000000] animate-[screenRumble_0.1s_linear_infinite]' : 'bg-[#05020a]/95 backdrop-blur-xl'}`}>
      
      {/* Background ambient light */}
      <div className={`absolute inset-0 ${colors.bgGlow} transition-all duration-1000 ${phase === 'stirring' ? 'opacity-80 animate-[pulse_4s_ease-in-out_infinite] scale-100' : phase === 'cracking' ? 'opacity-100 scale-[3.0] animate-[pulse_0.2s_ease-in-out_infinite]' : 'opacity-80 scale-[2.0]'}`}></div>

      {phase === 'stirring' && (
        <div className="relative flex flex-col items-center animate-[float_4s_ease-in-out_infinite]">
          {/* Ethereal Magic Circle Behind Sphere */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(138,43,226,0.3)_360deg)] rounded-full animate-[spin_8s_linear_infinite] mix-blend-screen pointer-events-none z-0"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border-2 border-[#8a2be2]/30 border-dashed animate-[spin_15s_linear_infinite_reverse] pointer-events-none z-0"></div>
          
          <div className="relative w-[320px] h-[320px] flex items-center justify-center z-20">
            {/* Crystal Sphere */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.1)_0%,_rgba(20,0,40,0.8)_80%,_rgba(0,0,0,1)_100%)] border-[4px] border-[#3a1c5e] rounded-full shadow-[inset_0_0_80px_rgba(138,43,226,0.6),0_0_60px_rgba(75,0,130,0.8)] backdrop-blur-md overflow-hidden z-20">
              
              {/* Majestic Swirling Core */}
              <div className="absolute inset-[-50%] animate-[spin_10s_linear_infinite] flex items-center justify-center opacity-80 mix-blend-screen">
                 <div className="absolute w-[150%] h-[150%] bg-[conic-gradient(from_0deg,transparent_0_180deg,rgba(0,255,255,0.4)_270deg,transparent_360deg)] rounded-full"></div>
                 <div className="absolute w-[120%] h-[120%] bg-[conic-gradient(from_0deg,transparent_0_90deg,rgba(255,0,255,0.3)_180deg,transparent_360deg)] rounded-full animate-[spin_6s_linear_infinite_reverse]"></div>
              </div>
              
              {/* Floating Star Particles */}
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white] animate-[orbit1_3s_linear_infinite]"></div>
                 <div className="absolute w-3 h-3 bg-[#e0b0ff] rounded-full shadow-[0_0_15px_#e0b0ff] animate-[orbit2_4s_linear_infinite]"></div>
                 <div className="absolute w-1.5 h-1.5 bg-[#00ffff] rounded-full shadow-[0_0_8px_#00ffff] animate-[orbit3_5s_linear_infinite]"></div>
                 <div className="absolute w-2.5 h-2.5 bg-[#ffd700] rounded-full shadow-[0_0_12px_#ffd700] animate-[orbit4_3.5s_linear_infinite]"></div>
              </div>
              
              {/* Crystal Highlight */}
              <div className="absolute top-6 left-10 w-24 h-12 bg-white/20 rounded-[100px] -rotate-[40deg] blur-[4px] pointer-events-none"></div>
            </div>
          </div>

          {/* Ancient Bronze Pedestal */}
          <div className="w-56 h-16 bg-gradient-to-b from-[#2a1b0a] to-[#0a0502] border-t-[6px] border-b-[4px] border-[#8b6508] rounded-[50%_50%_20%_20%] z-10 shadow-[0_30px_60px_rgba(0,0,0,1)] flex flex-col justify-start items-center relative -mt-6">
             {/* Glowing Rune Ring */}
             <div className="w-48 h-2 bg-gradient-to-r from-transparent via-[#8a2be2] to-transparent animate-[pulse_2s_ease-in-out_infinite] blur-[2px] mt-2"></div>
          </div>
          
          <h2 className="mt-16 text-2xl tracking-[0.3em] font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#d8b4e2] via-[#ffffff] to-[#d8b4e2] drop-shadow-[0_0_10px_rgba(216,180,226,0.6)] animate-[pulse_3s_ease-in-out_infinite] z-30 opacity-80">
            窺探命運的軌跡...
          </h2>
        </div>
      )}

      {(phase === 'dropped' || phase === 'cracking') && (
        <div className="relative flex flex-col items-center">
          <h2 className={`text-2xl font-serif tracking-widest text-[#e0e0e0] drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] mb-16 transition-all duration-1000 ${phase === 'cracking' ? 'opacity-0 scale-110 blur-sm' : 'opacity-100 animate-[pulse_3s_ease-in-out_infinite]'}`}>
            觸碰星核以揭示真理
          </h2>
          
          <button 
            onClick={handleCrack}
            disabled={phase === 'cracking'}
            className={`relative w-48 h-64 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] cursor-pointer focus:outline-none focus:ring-0 ${phase === 'dropped' ? 'animate-[etherealDrop_1.2s_cubic-bezier(0.34,1.56,0.64,1)_forwards,float_4s_ease-in-out_infinite_1.2s] hover:scale-105 hover:brightness-125 transition-all duration-500' : 'animate-[coreAwaken_1.8s_ease-in_forwards] scale-110'} ${colors.glow} z-30 group`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {/* Core Body (Mysterious Engram Shape) */}
            <div className={`absolute inset-0 ${colors.top} rounded-[50%_50%_50%_50%/60%_60%_40%_40%] border-[3px] border-white/20 shadow-[inset_0_0_40px_rgba(0,0,0,0.6),inset_0_20px_20px_rgba(255,255,255,0.4)] z-20 overflow-hidden backdrop-blur-md mix-blend-hard-light`}>
               {/* Inner Glowing Soul */}
               <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-32 ${colors.core} rounded-full animate-[pulse_2s_ease-in-out_infinite] blur-xl opacity-80`}></div>
               
               {/* Crystal Facets Illusion */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-1/2 bg-gradient-to-b from-white/30 to-transparent [clip-path:polygon(50%_0,100%_100%,0_100%)]"></div>
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-1/2 bg-gradient-to-t from-black/50 to-transparent [clip-path:polygon(0_0,100%_0,50%_100%)]"></div>
            </div>
            
            {/* Runes floating around the core */}
            {phase === 'dropped' && (
              <div className="absolute inset-[-40px] border border-white/10 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                <div className="absolute -top-2 left-1/2 text-white/50 text-xs">✦</div>
                <div className="absolute -bottom-2 left-1/2 text-white/50 text-xs">✦</div>
                <div className="absolute top-1/2 -left-2 text-white/50 text-xs">✦</div>
                <div className="absolute top-1/2 -right-2 text-white/50 text-xs">✦</div>
              </div>
            )}
            
            {/* Cracks & Energy Explosion Overlay */}
            {phase === 'cracking' && (
              <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
                 {/* Imploding Rings (Gravity Pull) */}
                 <div className="absolute inset-[-200px] border-[2px] border-white/60 rounded-full animate-[implodeRing_0.5s_ease-in_infinite] shadow-[0_0_10px_white]"></div>
                 <div className="absolute inset-[-300px] border-[4px] border-white/80 rounded-full animate-[implodeRing_0.4s_ease-in_infinite_0.2s] shadow-[0_0_20px_white]"></div>
                 
                 {/* Shockwaves (Expanding) */}
                 <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-[8px] border-white animate-[shockwave_1.8s_ease-out_forwards]`}></div>
                 
                 {/* Laser Beams (Lens Flare) */}
                 <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-2 ${colors.core} blur-[2px] animate-[laserBeam_1.8s_ease-in_forwards] mix-blend-screen`}></div>
                 <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-2 ${colors.core} blur-[2px] animate-[laserBeam_1.8s_ease-in_forwards] mix-blend-screen`}></div>

                 {/* Rapid Rotating Magic Arrays */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[conic-gradient(from_0deg,transparent_0_10deg,rgba(255,255,255,0.8)_20deg,transparent_30deg,transparent_60deg,rgba(255,255,255,0.9)_70deg,transparent_80deg,transparent_130deg,rgba(255,255,255,0.7)_140deg,transparent_150deg,transparent_200deg,rgba(255,255,255,0.9)_210deg,transparent_220deg)] rounded-full animate-[spin_0.5s_linear_infinite] mix-blend-overlay scale-150 blur-[2px] opacity-0" style={{ animation: 'spin 0.5s linear infinite, fadeInOut 1.8s ease-in forwards' }}></div>
                 
                 {/* Final Devastating Core Flash (1.8s delay buildup) */}
                 <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 ${colors.core} rounded-full animate-[coreBuildUp_1.8s_ease-in_forwards] blur-md`}></div>
              </div>
            )}
          </button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes orbit1 {
          0% { transform: rotate(0deg) translateX(80px) rotate(0deg) scale(1); opacity: 0.2; }
          50% { transform: rotate(180deg) translateX(80px) rotate(-180deg) scale(1.5); opacity: 1; }
          100% { transform: rotate(360deg) translateX(80px) rotate(-360deg) scale(1); opacity: 0.2; }
        }
        @keyframes orbit2 {
          0% { transform: rotate(120deg) translateX(110px) rotate(0deg) scale(1); opacity: 0.2; }
          50% { transform: rotate(300deg) translateX(110px) rotate(-180deg) scale(1.5); opacity: 1; }
          100% { transform: rotate(480deg) translateX(110px) rotate(-360deg) scale(1); opacity: 0.2; }
        }
        @keyframes orbit3 {
          0% { transform: rotate(240deg) translateX(60px) rotate(0deg) scale(1); opacity: 0.2; }
          50% { transform: rotate(420deg) translateX(60px) rotate(-180deg) scale(1.5); opacity: 1; }
          100% { transform: rotate(600deg) translateX(60px) rotate(-360deg) scale(1); opacity: 0.2; }
        }
        @keyframes orbit4 {
          0% { transform: rotate(45deg) translateX(130px) rotate(0deg) scale(1); opacity: 0.2; }
          50% { transform: rotate(225deg) translateX(130px) rotate(-180deg) scale(1.5); opacity: 1; }
          100% { transform: rotate(405deg) translateX(130px) rotate(-360deg) scale(1); opacity: 0.2; }
        }
        @keyframes etherealDrop {
          0% { transform: translateY(-600px) scale(0.8) rotate(15deg); opacity: 0; filter: blur(10px); }
          70% { transform: translateY(20px) scale(1.1) rotate(-5deg); opacity: 1; filter: blur(0px); }
          100% { transform: translateY(0) scale(1) rotate(0deg); }
        }
        @keyframes coreAwaken {
          0% { transform: translateY(0) scale(1.05); filter: contrast(1) brightness(1); }
          40% { transform: translateY(-15px) scale(1.15); filter: contrast(1.5) brightness(1.5) hue-rotate(15deg); }
          80% { transform: translateY(-20px) scale(1.2); filter: contrast(2) brightness(2.5) hue-rotate(-15deg); }
          100% { transform: translateY(-25px) scale(0.9); filter: contrast(3) brightness(4); }
        }
        @keyframes implodeRing {
          0% { transform: scale(1.5); opacity: 0; border-width: 2px; }
          20% { opacity: 1; }
          100% { transform: scale(0); opacity: 0; border-width: 15px; }
        }
        @keyframes shockwave {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; border-width: 20px; }
          100% { transform: translate(-50%, -50%) scale(50); opacity: 0; border-width: 0px; }
        }
        @keyframes laserBeam {
          0% { transform: translate(-50%, -50%) scale(0, 0.1); opacity: 0; filter: brightness(1); }
          50% { transform: translate(-50%, -50%) scale(0.5, 0.5); opacity: 0.4; filter: brightness(1.5); }
          85% { transform: translate(-50%, -50%) scale(1.5, 1); opacity: 0.8; filter: brightness(2); }
          100% { transform: translate(-50%, -50%) scale(4, 0.2); opacity: 1; filter: brightness(3); }
        }
        @keyframes coreBuildUp {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; filter: brightness(1); }
          50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.4; filter: brightness(1.5); }
          85% { transform: translate(-50%, -50%) scale(3); opacity: 0.8; filter: brightness(2.5); }
          100% { transform: translate(-50%, -50%) scale(100); opacity: 1; filter: brightness(4); }
        }
        @keyframes screenRumble {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(3px, -3px); }
          50% { transform: translate(-3px, 2px); }
          75% { transform: translate(2px, 3px); }
        }
        @keyframes fadeInOut {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}} />
    </div>
  );
}
