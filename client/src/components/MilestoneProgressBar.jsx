import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, Check, Lock, MapPin, Sparkles, BookOpen, AlertCircle, X } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
const tips = [
  "💡 提示：學校附近的郵局在中午時間人潮最多，建議下午兩點後再去傳送！",
  "💡 提示：臺灣的便利商店可以影印和繳交各種規費，是全能型的新手補給站。",
  "💡 提示：記得隨身攜帶居留證，它是你在臺灣的第二張護照。",
  "💡 提示：搭乘捷運時，深藍色的博愛座通常是保留給有需要的人。"
];

export default function AdventurerLobbyPanel({ onSelectProcess, nodes = [] }) {
  const { level, xp, addReward, consumeHp } = usePlayer();
  const [hoveredNode, setHoveredNode] = useState(null);
  const [activeLockModal, setActiveLockModal] = useState(false);
  
  const [currentTip, setCurrentTip] = useState(tips[0]);
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  const [fortuneMsg, setFortuneMsg] = useState('');
  const [hasClaimed, setHasClaimed] = useState(false);
  const [fortuneShake, setFortuneShake] = useState(false);

  useEffect(() => {
    const lastClaim = localStorage.getItem('daily_fortune_date');
    const today = new Date().toLocaleDateString();
    if (lastClaim === today) {
      setHasClaimed(true);
      setFortuneMsg(localStorage.getItem('daily_fortune_msg') || '');
    }
  }, []);

  const handleDailyFortune = () => {
    if (hasClaimed) return;
    setFortuneShake(true);
    setTimeout(() => {
      setFortuneShake(false);
      const fortunes = [
        "【大吉】今天去郵局辦事排隊時間減少 15%！",
        "【中吉】路上巧遇熱心學長姐指路的機率提升！",
        "【小吉】學生餐廳今日打飯阿姨手不抖！",
        "【超吉】搶課系統連線速度獲得神聖庇護！"
      ];
      const msg = fortunes[Math.floor(Math.random() * fortunes.length)];
      setFortuneMsg(msg);
      setHasClaimed(true);
      
      const today = new Date().toLocaleDateString();
      localStorage.setItem('daily_fortune_date', today);
      localStorage.setItem('daily_fortune_msg', msg);
      
      if (addReward) addReward(0, 10, 0); // xp, coins, mp
      if (consumeHp) consumeHp(-100); // negative consume = heal HP
    }, 600);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(tips[Math.floor(Math.random() * tips.length)]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time clock update (for calendar ribbon display)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const summerNodes = [
    { title: "🧳 赴臺行李物資", status: localStorage.getItem('summer_node_pre_arrival_luggage') || "available", processId: "pre_arrival_luggage" },
    { title: "🩺 海外預檢作業", status: localStorage.getItem('summer_node_pre_arrival_health') || "available", processId: "pre_arrival_health" },
    { title: "🛡️ 入學與居留手續", status: "available", processId: "arc_process" },
    { title: "📝 網路選課預選", status: "locked", lockDate: "08/19" },
    { title: "🎓 新生入學典禮", status: "locked" }
  ];

  return (
    <>
      <div className="w-full max-w-[1200px] mx-auto glass bg-[#f4e8d1] p-6 lg:p-8 rounded-3xl border-4 border-[#8b5a2b] shadow-2xl relative flex flex-col lg:flex-row items-stretch gap-6 rpg-border">
        
        {/* Ribbon Calendar */}
        <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-4 -rotate-3 z-50 pointer-events-none">
          <div className="bg-[#e0cda5] text-[#4a3b32] font-black tracking-widest px-6 py-2 shadow-lg relative border-y-2 border-r-2 border-[#8b5a2b]">
            <div className="absolute top-0 bottom-0 -left-4 border-[18px] border-transparent border-r-[#e0cda5] border-y-[#e0cda5] -z-10"></div>
            <div className="absolute top-0 bottom-0 -left-5 border-[20px] border-transparent border-r-[#8b5a2b] border-y-[#8b5a2b] -z-20"></div>
            📅 冒險者曆法：{currentTime.getMonth() + 1}月{currentTime.getDate()}日 ➔ [ 當前所屬：暑期前瞻準備賽季 ]
          </div>
        </div>

        {/* Decorative RPG watermark */}
        <Sparkles className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#8b5a2b]/5 w-64 h-64 pointer-events-none" />

        {/* Main Section: Milestone Tree (100%) */}
        <div className="w-full relative z-10 py-4 overflow-hidden flex flex-col justify-center">
          <div className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar pb-16 pt-8 px-4 flex justify-center items-center flex-nowrap space-x-12 sm:space-x-20 relative">
            
            {/* Nodes & Winding Path */}
            {summerNodes.map((node, index) => {
              const isCompleted = node.status === 'completed';
              const isCurrent = node.status === 'available';
              const isLocked = node.status === 'locked';

              return (
                <div 
                  key={index} 
                  className={`relative flex flex-col items-center group z-10 flex-shrink-0 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  onMouseEnter={() => setHoveredNode(index)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => {
                    if (isLocked) {
                      setActiveLockModal(true);
                      return;
                    }
                    if (onSelectProcess && node.processId) {
                      onSelectProcess(node.processId);
                    }
                  }}
                >
                  {/* Winding Path Segment (before node) */}
                  {index > 0 && (
                    <div className="absolute right-full top-1/2 -translate-y-1/2 w-12 sm:w-20 border-t-[3px] border-dashed border-[#8b5a2b]/60 z-0 flex items-center justify-evenly text-[#8b5a2b]/30 text-[10px]">
                      <span>🐾</span>
                      <span>🐾</span>
                      {/* Subdued Current Indicator instead of bouncing wizard */}
                      {isCurrent && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#ffcc00] blur-sm w-8 h-8 rounded-full opacity-30 z-[-1] animate-[pulse_3s_ease-in-out_infinite]">
                        </div>
                      )}
                    </div>
                  )}

                  {/* Circle Node */}
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-4 transition-all duration-500 shadow-md relative cursor-pointer ${
                    isCompleted 
                      ? 'bg-[#2e7d32] border-[#1b5e20] text-white hover:scale-110 shadow-[0_0_15px_rgba(46,125,50,0.6)]' 
                      : isCurrent 
                        ? 'bg-[#ffcc00] border-[#8b5a2b] text-[#4a3b32] scale-[1.15] shadow-[0_0_20px_rgba(255,204,0,0.6)] transition-transform hover:scale-125' 
                        : 'bg-[#e0cda5] border-[#8b5a2b]/40 text-[#7a6350] grayscale hover:grayscale-0'
                  }`}>
                    {isCompleted && <Check size={32} className="drop-shadow-sm" />}
                    {isCurrent && (
                      <>
                        <MapPin size={32} className="drop-shadow-md" />
                        {/* Elegant Glowing Dot instead of flashing exclamation */}
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#c62828] rounded-full border-2 border-white shadow-[0_0_10px_#c62828] z-20">
                           <div className="absolute inset-0 bg-white rounded-full opacity-60 animate-ping"></div>
                        </div>
                      </>
                    )}
                    {isLocked && <Lock size={24} />}
                  </div>

                  {/* Bottom Label */}
                  <div className={`absolute top-full mt-4 flex flex-col items-center whitespace-nowrap transition-all ${isLocked ? 'text-[#7a6350]' : isCurrent ? 'text-[#c62828] drop-shadow-sm scale-110' : 'text-[#2e7d32]'}`}>
                    <span className="text-base font-black">{node.title}</span>
                    {node.lockDate && (
                      <span className="text-[10px] font-bold mt-1 bg-[#8b5a2b]/10 px-2 py-0.5 rounded-md border border-[#8b5a2b]/20">
                        ⏳ 預計於 {node.lockDate} 解鎖
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      {/* Custom Keyframes for Flow Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
        .animate-floating {
          animation: floating 4s ease-in-out infinite;
        }
      `}} />
      </div>

      {/* Encyclopedia Modal */}
      {showEncyclopedia && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1d1d1f]/70 backdrop-blur-sm p-4">
          <div className="bg-[#f4e8d1] p-8 rounded-3xl max-w-2xl w-full border-4 border-[#8b5a2b] shadow-2xl relative animate-bounce-in-stagger rpg-border">
            <button 
              onClick={() => setShowEncyclopedia(false)}
              className="absolute top-5 right-5 text-[#8b5a2b] hover:text-[#c62828] transition-colors bg-[#8b5a2b]/10 p-2 rounded-xl"
            >
              <X size={28} />
            </button>
            <h2 className="text-3xl font-black text-[#4a3b32] mb-6 flex items-center border-b-2 border-[#8b5a2b]/20 pb-4">
              <BookOpen size={36} className="mr-4 text-[#8b5a2b]" />
              遠古祕典📑 (Almanac)
            </h2>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <div key={i} className="bg-[#e0cda5]/50 p-4 rounded-xl border border-[#8b5a2b]/30">
                  <h4 className="font-black text-[#c62828] text-lg mb-2">Q: 在臺灣迷路了怎麼辦？</h4>
                  <p className="text-[#4a3b32] font-bold">A: 請大膽走進任何一間便利商店 (7-11 或全家)，臺灣的便利商店店員通常擁有極高的智力與熱心，是新手迷路時的最佳 NPC 導航員。</p>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Magic Seal Lock Modal */}
      {activeLockModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1d1d1f]/60 backdrop-blur-[2px] p-4">
          <div className="bg-[#1d1d1f] p-8 rounded-3xl max-w-md w-full border-[6px] border-[#ff5722] shadow-[0_0_30px_#ff5722] relative animate-[shake_0.4s_ease-in-out] overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ff5722]/20 to-transparent pointer-events-none"></div>
             <div className="flex justify-center mb-6 relative z-10">
               <Lock size={64} className="text-gray-400 drop-shadow-[0_0_10px_rgba(255,87,34,0.6)]" />
             </div>
             <h2 className="text-2xl font-black text-[#ff5722] mb-4 flex items-center justify-center border-b-2 border-[#ff5722]/30 pb-4 drop-shadow-[0_0_5px_#ff5722] text-center relative z-10">
              🚨 【 魔法封印中！請先完成前置任務 】
            </h2>
            <p className="text-md font-bold text-gray-300 mb-8 leading-relaxed bg-black/40 p-5 rounded-xl border border-[#ff5722]/20 shadow-inner text-center relative z-10">
              前方的傳送門正受到因果律封印！請先前往完成上方未解鎖的前置主線任務，才能開啟此後續副本。
            </p>
            <div className="flex space-x-4 relative z-10">
              <button 
                onClick={() => setActiveLockModal(false)}
                className="flex-1 py-3.5 bg-gradient-to-b from-[#ff5722] to-[#d84315] text-white border-b-4 border-[#bf360c] font-black text-md rounded-xl hover:brightness-110 transition-colors shadow-lg active:border-b-0 active:translate-y-1"
              >
                🔍 查看當前主線
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
