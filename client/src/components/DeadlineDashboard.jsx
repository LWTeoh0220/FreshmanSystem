import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Zap, ChevronDown } from 'lucide-react';

export default function DeadlineDashboard({ heap, onAddDeadline, triggerRebalance }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [deadlines, setDeadlines] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  
  // Real-time ticking engine
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setDeadlines(heap.getAllSorted());
  }, [heap, triggerRebalance]);

  // Process and sort deadlines based on the 3 states
  const processedDeadlines = React.useMemo(() => {
    const now = currentTime.getTime();
    
    return deadlines.map(dl => {
      const start = new Date(dl.startDate).getTime();
      const end = new Date(dl.endDate).getTime();
      
      let status = '';
      if (now > end) status = 'cleared';
      else if (now >= start && now <= end) status = 'active';
      else status = 'locked';
      
      return { ...dl, status, start, end };
    }).sort((a, b) => {
      const statusOrder = { 'active': 1, 'locked': 2, 'cleared': 3 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      
      // Secondary sorting
      if (a.status === 'active') return a.end - b.end; // closest to end first
      if (a.status === 'locked') return a.start - b.start; // closest to start first
      if (a.status === 'cleared') return b.end - a.end; // most recently cleared first
      return 0;
    });
  }, [deadlines, currentTime]);

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const getQuestDetails = (title) => {
    if (title.includes('住宿開放')) {
      return (
        <div className="space-y-2 mt-1">
          <p className="flex items-start"><span className="text-[#8b5a2b] mr-2 shrink-0 font-mono">├─</span> <span>🚪 宿舍重要須知：南辦宿舍晚上 11 點大門管制。</span></p>
          <p className="flex items-start"><span className="text-[#8b5a2b] mr-2 shrink-0 font-mono">├─</span> <span>🔌 網路線連線攻略：請自備 Cat6 網路線插上牆壁插座，並登入學校 Portal 系統登記電腦 MAC 位址以解鎖上網功能。</span></p>
        </div>
      );
    }
    if (title.includes('預選課')) {
      return (
        <div className="space-y-2 mt-1">
          <p className="flex items-start"><span className="text-[#8b5a2b] mr-2 shrink-0 font-mono">➔</span> <span>📝 選課注意事項：大一必修（如微積分）系統會自動帶入，新生只需搶通識課與體育課。推薦首選【科技與社會】，通關機率極高！</span></p>
        </div>
      );
    }
    if (title.includes('入學檢查') || title.includes('體檢')) {
      return (
        <div className="space-y-2 mt-1">
          <p className="flex items-start"><span className="text-[#8b5a2b] mr-2 shrink-0 font-mono">➔</span> <span>🩺 體檢須知：請攜帶大馬出發前的 X 光報告正本，至學校中正紀念堂公會據點前提交回，即可領取【體檢完成憑證】。</span></p>
        </div>
      );
    }
    return (
      <div className="space-y-2 mt-1">
        <p className="opacity-70 text-center flex items-center justify-center italic"><span className="mr-2">🪶</span> 此任務暫無學長姐留下的生存細節...</p>
      </div>
    );
  };

  return (
    <div className="w-full h-full glass bg-[#f4e8d1] p-6 rounded-3xl border-4 border-[#8b5a2b] shadow-2xl relative rpg-border flex flex-col">
      <div className="flex justify-between items-center mb-6 border-b-2 border-[#8b5a2b]/30 pb-4">
        <h2 className="text-2xl font-black flex items-center text-[#4a3b32] drop-shadow-sm">
          <Clock className="mr-3 text-[#8b5a2b]" size={28} />
          任務死線戰情室 <span className="ml-3 px-2 py-1 bg-[#8b5a2b]/10 border border-[#8b5a2b]/20 rounded-md text-sm text-[#7a6350] font-mono font-bold">Min-Heap</span>
        </h2>
        <button 
          onClick={onAddDeadline}
          className="flex items-center text-sm bg-[#c62828] hover:bg-[#b71c1c] border-b-4 border-[#7f0000] active:border-b-0 active:translate-y-1 text-[#f4e8d1] px-4 py-2 rounded-xl transition-all shadow-sm font-black"
        >
          <Zap size={16} className="mr-2" />
          觸發突發事件
        </button>
      </div>
      
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-4 pl-4 pt-4 pb-4 -mx-4 custom-scrollbar">
        {processedDeadlines.length === 0 && (
          <div className="text-[#7a6350] text-center mt-10 font-bold">目前無任務</div>
        )}
        
        {processedDeadlines.map((dl, idx) => {
          const isExpanded = expandedId === dl.id;
          
          if (dl.status === 'locked') {
            const startD = new Date(dl.startDate);
            const formattedDate = `${startD.getMonth() + 1}/${startD.getDate()}`;
            return (
              <div key={dl.id} className="p-5 rounded-2xl border-2 border-dashed border-[#8b5a2b]/40 bg-[#e0cda5]/20 opacity-70 flex flex-col flex-shrink-0 relative overflow-hidden group">
                <div className="flex justify-between items-center w-full relative z-10 grayscale">
                  <div>
                    <h3 className="font-black text-lg text-[#7a6350] flex items-center">
                      <span className="mr-2 opacity-50">🔒</span> {dl.title}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-[#7a6350] mt-2">
                      ⏳ 預計於 {formattedDate} 開啟此主線副本
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          if (dl.status === 'cleared') {
            return (
              <div key={dl.id} className="p-5 rounded-2xl border-2 border-[#4a3b32]/20 bg-gray-300/30 grayscale flex flex-col flex-shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none opacity-80">
                  <div className="border-4 border-red-600/80 text-red-600/80 font-black text-3xl px-4 py-2 rotate-[-15deg] uppercase tracking-widest shadow-sm mix-blend-multiply">
                    QUEST CLEARED
                  </div>
                </div>
                <div className="flex justify-between items-center w-full relative z-10 opacity-40">
                  <div>
                    <h3 className="font-black text-lg text-[#4a3b32] line-through">{dl.title}</h3>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-[#4a3b32]">✅ 已完成 / 已結束</span>
                  </div>
                </div>
              </div>
            );
          }

          // status === 'active'
          const msLeft = dl.end - currentTime.getTime();
          const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24));
          const hoursLeft = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutesLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
          
          const isEmergency = daysLeft <= 0;
          const isTop = idx === 0; // Assuming first active is top priority due to sorting
          
          // CSS variables based on priority
          let colorClass = 'text-[#4a3b32] bg-[#e0cda5]/50 border-[#ffd700] shadow-[0_0_15px_rgba(255,215,0,0.4)]';
          if (isEmergency) colorClass = 'text-[#c62828] bg-[#c62828]/10 border-[#8b0000] shadow-[0_0_15px_rgba(139,0,0,0.4)] animate-[pulse_3s_ease-in-out_infinite]';
          else if (daysLeft < 7) colorClass = 'text-[#ff8f00] bg-[#ff8f00]/10 border-[#ffd700] shadow-[0_4px_15px_rgba(255,215,0,0.5)]';

          return (
            <div 
              key={dl.id} 
              onClick={() => toggleExpand(dl.id)}
              className={`p-5 rounded-2xl border-2 ${colorClass} transition-all duration-300 flex flex-col animate-fade-in-up flex-shrink-0 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] cursor-pointer group relative`}
            >
              {isEmergency && (
                <div className="absolute -top-3 -left-3 bg-[#ef4444] text-white text-xs font-black px-3 py-1 rounded-lg border-2 border-white shadow-lg animate-bounce z-20">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping inline-block mr-1"></span> 🚨 緊急主線
                </div>
              )}
              
              {/* Main Row */}
              <div className="flex justify-between items-center w-full relative z-10">
                <div>
                  <h3 className={`font-black text-lg ${isEmergency ? 'text-[#c62828]' : 'text-[#4a3b32]'}`}>
                    {dl.title}
                  </h3>
                  <p className="text-sm font-bold text-[#7a6350] mt-1 flex items-center">
                    流程綁定: <span className="font-mono bg-[#8b5a2b]/10 border border-[#8b5a2b]/20 px-2 py-0.5 rounded-md text-[#4a3b32] ml-2">{dl.processId}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-xl font-black font-mono drop-shadow-sm flex items-center ${isEmergency ? 'text-[#c62828]' : 'text-[#4a3b32]'}`}>
                    {isEmergency 
                      ? <>🚨 副本即將關閉：<span className="text-3xl mx-1">{hoursLeft}</span> 小時 <span className="text-2xl mx-1">{minutesLeft}</span> 分</>
                      : <>⌛ 距離截止僅剩：<span className="text-3xl mx-1">{daysLeft}</span> 天</>
                    }
                  </span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs font-black uppercase tracking-widest flex items-center bg-white/40 px-2 py-1 rounded-md border border-white/20 ${isTop ? 'text-[#c62828]' : 'text-[#7a6350]'}`}>
                      {isTop && <AlertTriangle size={14} className="mr-1 animate-pulse" />}
                      {isTop ? 'Top Priority (根節點)' : `Rank ${idx+1}`}
                    </span>
                    <ChevronDown size={20} className={`text-[#8b5a2b] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>

              {/* Accordion Details */}
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[300px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="bg-[#fffcf5]/80 p-4 rounded-xl border-[2px] border-[#8b5a2b]/20 shadow-inner text-[#5c3a21] text-[11px] font-black leading-relaxed">
                   {getQuestDetails(dl.title)}
                </div>
              </div>
              
            </div>
          );
        })}
      </div>
    </div>
  );
}
