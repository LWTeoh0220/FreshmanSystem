import React, { useState } from 'react';
import { ScrollText, Map, Shield, Gift, ChevronRight, CheckCircle2 } from 'lucide-react';
import { sideQuests } from '../data/mockData';
import * as LucideIcons from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePlayer } from '../contexts/PlayerContext';

const loadingTips = [
  "[系統提示] 據說把發票存在載具裡，中獎機率會大幅提升喔！",
  "[系統提示] 在台灣新手村，手搖飲的「去冰半糖」是必備的點餐咒語。",
  "[系統提示] 冒險者公會提醒您，悠遊卡不僅能搭公車，還能在便利商店買藥水。",
  "[系統提示] 宿舍區長擁有神秘的權限，是新手不可或缺的人脈資源。",
  "[系統提示] 台灣的冬天濕冷，記得裝備「防禦力+5 的厚外套」。"
];

export default function AdventurersLog() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTip, setCurrentTip] = useState("");
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const { addReward, projectBought, projectQuestCleared, setProjectQuestCleared } = usePlayer();

  const displayQuests = React.useMemo(() => {
    const customQuest = {
      id: 'sq_project',
      title: '📜 傳奇支線：前輩的古老試煉',
      description: '聽說大馬學長姐曾經留下了一本記載著黑科技的魔法書，裡面封印著能夠大幅降低在台灣生存難度的古老魔法。前往商店獲取並參悟它吧！',
      icon: 'Book',
      status: projectBought ? 'available' : 'locked',
      requirements: [
        { text: '◆ 在公會商店購買【傳奇魔法書】並觀摩專案' }
      ],
      rewards: ['金幣 x 300', 'XP x 100', '隱藏成就：傳承火炬']
    };
    return [...sideQuests, customQuest];
  }, [projectBought]);

  const [selectedQuest, setSelectedQuest] = useState(displayQuests[0]);
  const [completedQuests, setCompletedQuests] = useState(() => {
    const saved = new Set();
    if (projectQuestCleared) saved.add('sq_project');
    return saved;
  });

  React.useEffect(() => {
    if (projectQuestCleared) {
      setCompletedQuests(prev => {
        if (!prev.has('sq_project')) return new Set([...prev, 'sq_project']);
        return prev;
      });
    }
  }, [projectQuestCleared]);

  const handleComplete = () => {
    if (selectedQuest.status === 'locked') {
      setErrorMessage("❌ 偵測到冒險者背包中缺少關鍵道具，請點擊上方帶虛線的條件查看取得攻略！");
      setTimeout(() => setErrorMessage(""), 4000);
      return;
    }

    if (!completedQuests.has(selectedQuest.id)) {
      setErrorMessage("");
      setIsSubmitting(true);
      setCurrentTip(loadingTips[Math.floor(Math.random() * loadingTips.length)]);
      
      // Simulate NPC Review / Magic Casting Delay
      setTimeout(() => {
        setIsSubmitting(false);
        setCompletedQuests(prev => new Set([...prev, selectedQuest.id]));
        
        if (selectedQuest.id === 'sq_project') {
          setProjectQuestCleared(true);
          addReward(100, 300);
        } else {
          // Give 50 XP and 200 Coins for side quests
          addReward(50, 200);
        }
        
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#007aff', '#ffcc00', '#34c759']
        });
      }, 1800);
    }
  };

  return (
    <div className="glass rounded-3xl p-6 h-[700px] flex overflow-hidden bg-[#f4e8d1] border-2 border-[#8b5a2b]/30 shadow-2xl relative">
      {/* RPG Item Tooltip Modal */}
      {activeTooltip && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[#1d1d1f]/60 backdrop-blur-sm p-4">
          <div className="bg-[#f4e8d1] p-8 rounded-2xl max-w-md w-full border-4 border-[#8b5a2b] shadow-2xl relative animate-bounce-in-stagger">
            <button 
              onClick={() => setActiveTooltip(null)}
              className="absolute top-4 right-4 text-[#8b5a2b] hover:text-[#c62828] transition-colors bg-[#8b5a2b]/10 p-1 rounded-lg"
            >
              <LucideIcons.X size={24} />
            </button>
            <div className="flex items-center justify-center w-16 h-16 bg-[#8b5a2b]/10 rounded-full border-2 border-[#8b5a2b] mx-auto mb-4 shadow-inner">
              <LucideIcons.PackageOpen size={32} className="text-[#8b5a2b]" />
            </div>
            <h3 className="text-2xl font-black text-[#c62828] text-center mb-6 drop-shadow-sm">{activeTooltip.title}</h3>
            
            <div className="space-y-4 text-[#4a3b32]">
              <div>
                <strong className="block text-lg mb-1 flex items-center text-[#8b5a2b]"><LucideIcons.Info size={18} className="mr-2"/> 用途</strong>
                <p className="font-bold bg-[#e0cda5]/50 p-4 rounded-xl border border-[#8b5a2b]/20 shadow-inner">{activeTooltip.purpose}</p>
              </div>
              <div>
                <strong className="block text-lg mb-1 flex items-center text-[#8b5a2b]"><LucideIcons.MapPin size={18} className="mr-2"/> 入手攻略</strong>
                <p className="font-bold bg-[#e0cda5]/50 p-4 rounded-xl border border-[#8b5a2b]/20 leading-relaxed shadow-inner">{activeTooltip.guide}</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTooltip(null)}
              className="w-full mt-8 py-3 bg-[#8b5a2b] text-[#f4e8d1] font-black text-xl rounded-xl hover:bg-[#7a6350] transition-colors shadow-md border-b-4 border-[#4a3b32] active:border-b-0 active:translate-y-1"
            >
              收下攻略卷軸
            </button>
          </div>
        </div>
      )}

      {/* RPG Watermark */}
      <Map className="absolute right-0 bottom-0 w-[400px] h-[400px] text-[#8b5a2b]/5 pointer-events-none -mr-20 -mb-20" />
      
      {/* Left Sidebar: Quest List */}
      <div className="w-1/3 border-r-2 border-[#8b5a2b]/20 pr-6 overflow-y-auto relative z-10 custom-scrollbar">
        <div className="flex items-center mb-6 pl-2 border-b border-[#8b5a2b]/20 pb-4">
          <ScrollText className="text-[#8b5a2b] mr-3" size={32} />
          <h2 className="text-3xl font-black text-[#4a3b32] drop-shadow-sm">冒險者手札</h2>
        </div>
        <p className="text-sm font-bold text-[#7a6350] mb-6 pl-2">非必須，但能大幅提升生存品質的支線任務。</p>
        
        <div className="space-y-4">
          {displayQuests.map((quest) => {
            const isCompleted = completedQuests.has(quest.id);
            const isSelected = selectedQuest.id === quest.id;
            const IconComp = LucideIcons[quest.icon.charAt(0).toUpperCase() + quest.icon.slice(1)] || LucideIcons.Map;

            return (
              <button
                key={quest.id}
                onClick={() => setSelectedQuest(quest)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center group rpg-border ${
                  isSelected 
                    ? 'bg-[#e0cda5] shadow-md border-l-8 border-[#8b5a2b] scale-105' 
                    : 'bg-[#f4e8d1] hover:bg-[#d2b48c]/50 border-transparent hover:border-[#8b5a2b]/30'
                }`}
              >
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mr-4 shrink-0 shadow-inner ${
                  isCompleted ? 'bg-[#2e7d32]/20 text-[#2e7d32] border-[#2e7d32]' : 'bg-[#8b5a2b]/10 text-[#8b5a2b] border-[#8b5a2b]'
                }`}>
                  {isCompleted ? <CheckCircle2 size={24} /> : <IconComp size={24} />}
                </div>
                <div className="flex-1 truncate">
                  <h4 className={`font-black text-lg truncate ${isCompleted ? 'text-[#7a6350] line-through decoration-[#c62828] decoration-2' : 'text-[#4a3b32]'}`}>
                    {quest.title}
                  </h4>
                  <span className="text-sm font-bold text-[#8b5a2b]">
                    {quest.status === 'locked' ? '🔒 條件未滿' : (quest.id === 'sq_project' ? '🔥 傳奇支線' : '✨ 支線任務')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Content: Quest Details */}
      <div className="w-2/3 pl-10 overflow-y-auto flex flex-col relative z-10 custom-scrollbar">
        {selectedQuest ? (
          <div className="flex-1 flex flex-col animate-fade-in-up relative">
            
            {/* Quest Header */}
            <div className="mb-10 pt-4 relative">
              {/* CLEAR Stamp */}
              {completedQuests.has(selectedQuest.id) && (
                <div className="absolute right-0 top-0 text-5xl font-black text-[#c62828] opacity-30 transform rotate-12 border-4 border-[#c62828] px-4 py-2 rounded-2xl select-none pointer-events-none">
                  QUEST CLEAR
                </div>
              )}
              
              <span className="inline-block px-4 py-1.5 bg-[#8b5a2b] rounded-md text-sm font-black text-[#f4e8d1] mb-4 shadow-sm border border-[#4a3b32]">
                📜 Quest Scroll
              </span>
              <h1 className="text-2xl font-black text-[#4a3b32] mb-4 tracking-wide drop-shadow-sm">
                {selectedQuest.title}
              </h1>
              <p className="text-sm text-[#5c4033]/80 leading-relaxed font-bold bg-[#e0cda5]/50 p-5 rounded-xl border border-[#8b5a2b]/20">
                {selectedQuest.description}
              </p>
            </div>

            {/* Requirements Box (RPG Parchment) */}
            <div className="bg-[#d2b48c]/30 rounded-2xl p-6 mb-6 border-2 border-[#8b5a2b]/30 shadow-inner relative">
              <h3 className="text-xl font-black text-[#4a3b32] mb-4 flex items-center">
                🛡️ 必備道具與條件
              </h3>
              <ul className="space-y-3 pl-2">
                {selectedQuest.requirements.map((req, i) => {
                  // Mock condition for demonstration:
                  const isAchieved = selectedQuest.status === 'available' || req.text.includes('銀行') || req.text.includes('宿舍');
                  return (
                  <li key={i} className="flex items-center text-[#4a3b32] font-bold text-lg">
                    {isAchieved ? (
                      <LucideIcons.CheckCircle2 className="text-[#34c759] mr-4 shrink-0 drop-shadow-sm" size={24} />
                    ) : (
                      <LucideIcons.Lock className="text-[#8b5a2b]/50 mr-4 shrink-0 shadow-sm" size={20} />
                    )}
                    {req.itemTooltip ? (
                      <span 
                        className="cursor-pointer transition-all flex items-center group flex-wrap"
                        onClick={() => setActiveTooltip(req.itemTooltip)}
                        title="點擊查看攻略"
                      >
                        <span className={isAchieved ? "" : "opacity-80"}>{req.text}</span>
                        <span className="ml-3 flex items-center bg-[#f4e8d1] border border-[#8b5a2b]/30 px-2 py-1 rounded-md text-sm text-[#8b5a2b] shadow-sm group-hover:scale-105 group-hover:shadow-[0_0_10px_rgba(139,90,43,0.2)] group-hover:bg-[#fff9e6] group-hover:text-[#c62828] transition-all font-bold">
                          <LucideIcons.Search size={14} className="mr-1" />
                          查攻略
                        </span>
                      </span>
                    ) : (
                      <span className={isAchieved ? "opacity-100" : "opacity-80"}>{req.text}</span>
                    )}
                  </li>
                )})}
              </ul>
            </div>

            {/* Rewards Box */}
            <div className="bg-gradient-to-br from-[#8b5a2b]/10 to-[#d2b48c]/20 rounded-2xl p-6 mb-8 border-2 border-[#8b5a2b] shadow-sm">
              <h3 className="text-xl font-black text-[#4a3b32] mb-4 flex items-center">
                🎁 任務獎勵
              </h3>
              <div className="flex flex-wrap gap-4">
                {selectedQuest.rewards.map((reward, i) => (
                  <span key={i} className="bg-[#f4e8d1] px-4 py-2 rounded-xl text-sm font-black text-[#8b5a2b] shadow-sm border border-[#8b5a2b]/30 flex items-center">
                    ⭐ {reward}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Area */}
            <div className="mt-auto pt-8 border-t-2 border-[#8b5a2b]/20 pb-4 relative">
              
              {/* Magic Casting Overlay (NPC Review) */}
              {isSubmitting && (
                <div className="absolute bottom-full mb-4 left-0 right-0 bg-[#4a3b32] p-5 rounded-2xl border-2 border-[#8b5a2b] shadow-2xl animate-fade-in-up z-50">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[#ff8f00] font-black text-lg animate-pulse flex items-center">
                      <LucideIcons.Search className="mr-2 animate-spin-slow" size={20} />
                      冒險者公會審查中...
                    </span>
                  </div>
                  {/* Charging Bar */}
                  <div className="w-full h-3 bg-[#1d1d1f] rounded-full overflow-hidden border border-[#8b5a2b]/50">
                    <div className="h-full bg-gradient-to-r from-[#ff8f00] to-[#ffcc00] animate-[fillBar_1.8s_ease-out_forwards]"></div>
                  </div>
                  <p className="text-sm font-bold text-[#d2b48c] mt-3 tracking-wide">
                    {currentTip}
                  </p>
                </div>
              )}

              {/* Error Message for Locked Quests */}
              {errorMessage && (
                <div className="absolute bottom-full mb-4 left-0 right-0 bg-[#c62828] text-white p-4 rounded-xl font-bold text-center shadow-2xl border-2 border-[#4a3b32] animate-bounce-in-stagger flex items-center justify-center z-40">
                  {errorMessage}
                </div>
              )}

              <style dangerouslySetInnerHTML={{__html: `
                @keyframes fillBar {
                  0% { width: 0%; }
                  80% { width: 90%; }
                  100% { width: 100%; }
                }
                .animate-spin-slow {
                  animation: spin 3s linear infinite;
                }
              `}} />

              <button 
                onClick={handleComplete}
                disabled={completedQuests.has(selectedQuest.id) || isSubmitting}
                className={`w-full py-5 rounded-2xl font-black text-xl transition-all flex items-center justify-center shadow-lg ${
                  completedQuests.has(selectedQuest.id)
                    ? 'bg-[#2e7d32] text-white cursor-not-allowed border-b-4 border-[#1b5e20] opacity-80'
                    : selectedQuest.status === 'locked'
                      ? 'bg-[#6b7280] text-gray-300 border-b-4 border-gray-900 cursor-not-allowed shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]'
                      : isSubmitting
                        ? 'bg-[#8b5a2b] text-[#f4e8d1] cursor-wait border-b-4 border-[#4a3b32]'
                        : 'bg-gradient-to-r from-[#ff8f00] to-[#ffb300] text-[#4a3b32] border-b-4 border-[#cc7a00] hover:brightness-110 hover:scale-[1.02] shadow-[0_0_15px_rgba(255,143,0,0.4)] active:translate-y-1 active:border-b-0'
                }`}
              >
                {isSubmitting ? (
                  <>🔍 冒險者公會審查中...</>
                ) : completedQuests.has(selectedQuest.id) ? (
                  <>任務已結算 <LucideIcons.CheckCircle2 className="ml-3" size={24}/></>
                ) : selectedQuest.status === 'locked' ? (
                  <>🔒 冒險者條件未滿足</>
                ) : (
                  <>🏆 領取通關報酬（消耗 20 體力）</>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#8b5a2b] font-bold text-xl">
            請在左側選擇一項冒險任務
          </div>
        )}
      </div>
    </div>
  );
}
