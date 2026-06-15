import React, { useState } from 'react';
import { Trophy, Award, Lock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { processGraphsData } from '../data/mockData';
import * as LucideIcons from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';

export default function AchievementWall({ completedNodes }) {
  const { activeTitle, setActiveTitle, unlockedTitles, projectQuestCleared } = usePlayer();
  const [activeTab, setActiveTab] = useState('all');
  const [tooltip, setTooltip] = useState(null);


  const tabs = [
    { id: 'all', label: '🌟 全部成就' },
    { id: 'main', label: '🔱 傳奇主線' },
    { id: 'adventure', label: '🎒 冒險手札' },
    { id: 'gacha', label: '🎲 幸運歐皇' },
    { id: 'titles', label: '👑 冒險頭銜' }
  ];

  // Title Definitions
  const allAvailableTitles = [
    { id: 't1', name: '大馬萌新', description: '初來乍到，對一切充滿好奇。', icon: 'User' },
    { id: 't2', name: '剛抵臺的冒險者', description: '終於離開了房間，正式踏上臺灣的土地！', icon: 'Smile' },
    { id: 't3', name: '通訊達人', description: '成功辦理臺灣門號。', icon: 'Phone' },
    { id: 't4', name: '新手村生存者', description: '順利度過開學第一週。', icon: 'Shield' },
    { id: 't5', name: '高階冒險者', description: '已完全適應臺灣生活步調。', icon: 'Sword' },
    { id: 't6', name: '綜科館迷路魔王', description: '在綜科館找不到教室。', icon: 'Compass' },
    { id: 't7', name: '光華商場地縛靈', description: '買電腦配備買到忘記回家。', icon: 'Cpu' },
    { id: 't8', name: '北科首富', description: '公會金幣滿出來了。', icon: 'Crown' },
    { id: 't9', name: '北科大天選之子', description: '傳說中萬中選一的轉蛋大獎。', icon: 'Star' },
    { id: 't10', name: '圖書館睡神', description: '神聖的圖書館是最好的安眠地。', icon: 'BookOpen' }
  ];

  // Extract all milestone nodes from all graphs
  const allMilestones = React.useMemo(() => {
    const milestones = [];
    Object.values(processGraphsData).forEach(graph => {
      graph.nodes.forEach(node => {
        if (node.isMilestone) {
          milestones.push({ ...node, category: 'main' });
        }
      });
    });

    // Mock extra achievements for other categories
    milestones.push({
      id: 'adv_campus', title: '完成 3D 沉浸式校園導覽', achievementName: '校園探索者', achievementIcon: 'Map', category: 'adventure', isHidden: false
    });
    milestones.push({
      id: 'adv_lost', title: '在綜科館迷路超過 30 分鐘', achievementName: '迷路魔王', achievementIcon: 'Compass', category: 'adventure', isHidden: true
    });
    
    milestones.push({
      id: 'gacha_rich', title: '在公會商店消費超過 1000 金幣', achievementName: '財富自由', achievementIcon: 'Coins', category: 'gacha', isHidden: false
    });
    milestones.push({
      id: 'gacha_lucky', title: '抽中轉蛋機限定的稀有稱號', achievementName: '天選之人', achievementIcon: 'Sparkles', category: 'gacha', isHidden: true
    });
    
    // Cross-component Hidden Quest Achievement
    milestones.push({
      id: 'adv_project', title: '觀摩大馬學長姐黑科技專案', achievementName: '黑科技觀測者', achievementIcon: 'Flame', category: 'adventure', isHidden: true, customUnlock: projectQuestCleared
    });

    return milestones;
  }, [projectQuestCleared]);

  const filteredMilestones = allMilestones.filter(m => activeTab === 'all' || m.category === activeTab);

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ffcc00', '#ff8f00', '#d2b48c']
    });
  };

  return (
    <div className="glass rounded-3xl p-8 shadow-2xl min-h-[500px] relative bg-[#f4e8d1] rpg-border">
      {/* Decorative RPG watermark */}
      <LucideIcons.Shield className="absolute right-10 bottom-10 text-[#8b5a2b] opacity-10 w-[250px] h-[250px] pointer-events-none z-0" />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b-2 border-[#8b5a2b]/20 pb-4 relative z-10 gap-4">
        <div className="flex items-center">
          <div className="bg-[#8b5a2b]/10 p-3 rounded-full mr-4 border border-[#8b5a2b]/30">
            <Trophy className="text-[#8b5a2b]" size={36} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-[#4a3b32] tracking-wide drop-shadow-sm">成就徽章牆 (Advancements)</h2>
            <p className="text-base font-bold text-[#7a6350] mt-1">完成關鍵史詩任務，解鎖專屬冒險徽章 (成就總積分：{completedNodes.length * 10})</p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border-2 ${
                activeTab === tab.id 
                  ? 'bg-[#8b5a2b] text-[#f4e8d1] border-[#4a3b32] shadow-md scale-105' 
                  : 'bg-[#e0cda5]/50 text-[#7a6350] border-[#8b5a2b]/30 hover:bg-[#8b5a2b]/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* RPG Badge Grid Container */}
      <div className="relative z-10 pt-2 pb-6">
        {activeTab === 'titles' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-2 mt-2">
            {(() => {
              const items = [...allAvailableTitles];
              while (items.length < 8) {
                items.push({ isEmptySlot: true, id: `empty-t-${items.length}` });
              }
              return items.map((item, idx) => {
                if (item.isEmptySlot) {
                  return (
                    <div key={item.id} className="relative p-5 rounded-2xl flex flex-col items-center justify-center h-52 bg-[#f4e8d1]/10 border-2 border-dashed border-[#8b5a2b]/20">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 bg-[#e0cda5]/20">
                        <Lock size={28} className="text-[#8b5a2b]/10" />
                      </div>
                    </div>
                  );
                }
                const titleObj = item;
                const isUnlocked = unlockedTitles.includes(titleObj.name);
                const isActive = activeTitle === titleObj.name;
                const IconComponent = LucideIcons[titleObj.icon] || LucideIcons.User;

                return (
                <div 
                  key={titleObj.id} 
                  className={`relative group p-5 rounded-2xl flex flex-col items-center justify-between transition-all duration-300 h-52 ${
                    isActive 
                      ? 'bg-[#fff9e6] border-4 border-[#ffcc00] shadow-[0_0_20px_rgba(255,204,0,0.3)] animate-bounce-in-stagger' 
                      : isUnlocked
                        ? 'bg-[#f4e8d1] border-2 border-[#8b5a2b]/40 hover:-translate-y-1 hover:shadow-lg animate-bounce-in-stagger'
                        : 'bg-[#f4e8d1]/30 border-2 border-dashed border-[#8b5a2b]/40 cursor-not-allowed animate-bounce-in-stagger grayscale'
                  }`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {isActive && (
                    <div className="absolute -top-3 -right-3 bg-[#ffcc00] text-[#c62828] p-1.5 rounded-full shadow-lg z-20 border-2 border-[#c62828]">
                      <LucideIcons.Check size={18} />
                    </div>
                  )}

                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                    isActive ? 'bg-gradient-to-br from-[#ffcc00] to-[#ff8f00] shadow-lg' : isUnlocked ? 'bg-[#e0cda5]/50 text-[#8b5a2b]' : 'bg-[#e0cda5]/30'
                  }`}>
                    {isUnlocked ? (
                      <IconComponent size={28} className={isActive ? 'text-white' : 'text-[#8b5a2b]'} />
                    ) : (
                      <Lock size={28} className="text-[#8b5a2b]/30" />
                    )}
                  </div>

                  <h3 className={`text-center font-black text-lg leading-tight px-2 mb-2 ${
                    isActive ? 'text-[#c62828]' : isUnlocked ? 'text-[#4a3b32]' : 'text-[#8b5a2b]/50'
                  }`}>
                    {titleObj.name}
                  </h3>
                  
                  {isUnlocked && !isActive && (
                    <button 
                      onClick={() => setActiveTitle(titleObj.name)}
                      className="mt-auto bg-[#8b5a2b] text-[#f4e8d1] px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#7a6350] transition-colors w-full flex items-center justify-center shadow-sm"
                    >
                      <LucideIcons.Sword size={16} className="mr-2" />
                      裝備此頭銜
                    </button>
                  )}
                  {isActive && (
                    <div className="mt-auto bg-[#ffcc00]/20 text-[#c62828] px-4 py-2 rounded-xl text-sm font-black w-full flex items-center justify-center border border-[#ffcc00]/50">
                      <LucideIcons.CheckCircle size={16} className="mr-2" />
                      當前裝備中
                    </div>
                  )}
                  {!isUnlocked && (
                    <div className="mt-auto bg-transparent text-[#8b5a2b]/50 px-4 py-2 rounded-xl text-sm font-bold w-full flex items-center justify-center border border-dashed border-[#8b5a2b]/30">
                      <Lock size={16} className="mr-2" />
                      尚未獲得此名號
                    </div>
                  )}
                </div>
              );
            });
            })()}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-2 mt-2">
            {(() => {
              const items = [...filteredMilestones];
              while (items.length < 8) {
                items.push({ isEmptySlot: true, id: `empty-m-${items.length}` });
              }
              return items.map((item, idx) => {
                if (item.isEmptySlot) {
                  return (
                    <div key={item.id} className="relative p-6 rounded-2xl flex flex-col items-center justify-center h-52 bg-[#f4e8d1]/10 border-2 border-dashed border-[#8b5a2b]/20">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-[#e0cda5]/20">
                        <Lock size={32} className="text-[#8b5a2b]/10" />
                      </div>
                    </div>
                  );
                }
                const milestone = item;
                const isUnlocked = milestone.customUnlock !== undefined ? milestone.customUnlock : completedNodes.some(n => n.id === milestone.id);
                const isHiddenLocked = milestone.isHidden && !isUnlocked;
                
                // Dynamically get the icon component
                const iconName = milestone.achievementIcon || 'Award';
                const formattedIconName = iconName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
                const IconComponent = LucideIcons[formattedIconName] || LucideIcons.Award;

                return (
                <div 
                  key={milestone.id} 
                  className={`relative group p-6 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 h-52 ${
                    isUnlocked 
                      ? 'bg-[#fff9e6] border-4 border-[#ffcc00] shadow-[0_0_20px_rgba(255,204,0,0.3)] cursor-pointer hover:-translate-y-2 animate-bounce-in-stagger' 
                      : 'bg-[#f4e8d1]/30 border-2 border-dashed border-[#8b5a2b]/40 cursor-not-allowed animate-bounce-in-stagger hover:bg-[#f4e8d1]/60'
                  } ${tooltip === milestone.id ? 'z-30' : 'z-10'}`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  onClick={() => isUnlocked && triggerConfetti()}
                  onMouseEnter={() => setTooltip(milestone.id)}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {/* Icon Container */}
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                    isUnlocked ? 'bg-gradient-to-br from-[#ffcc00] to-[#ff8f00] shadow-lg group-hover:shadow-[0_0_25px_rgba(255,204,0,0.8)]' : 'bg-[#e0cda5]/40'
                  }`}>
                    {isUnlocked ? (
                      <IconComponent size={36} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                    ) : isHiddenLocked ? (
                      <span className="text-4xl font-black text-[#8b5a2b]/40">?</span>
                    ) : (
                      <Lock size={32} className="text-[#8b5a2b]/30" />
                    )}
                  </div>

                  {/* Title */}
                  <h3 className={`text-center font-black text-lg leading-tight px-2 ${
                    isUnlocked ? 'text-[#4a3b32]' : 'text-[#8b5a2b]/50'
                  }`}>
                    {isHiddenLocked ? '【神祕隱藏成就】' : (milestone.achievementName || '神祕成就')}
                  </h3>

                  {/* Absolute Tooltip centered above the card */}
                  {tooltip === milestone.id && (
                    <div className="absolute bottom-[112%] left-1/2 transform -translate-x-1/2 w-[260px] bg-[#4a3b32] text-[#f4e8d1] p-4 rounded-xl shadow-2xl border-2 border-[#8b5a2b] pointer-events-none animate-fade-in-up">
                      <div className="font-bold text-[#ff8f00] mb-2 flex items-center text-sm border-b border-[#8b5a2b]/40 pb-2">
                        {isUnlocked ? '✅ 徽章已解鎖' : '🔒 條件未達成'}
                      </div>
                      <h4 className="text-lg font-black mb-2 leading-tight text-[#f4e8d1]">
                        {isHiddenLocked ? '【神祕隱藏成就】' : milestone.achievementName}
                      </h4>
                      <p className="text-sm text-[#d2b48c] leading-relaxed mb-3 font-medium">
                        {isUnlocked 
                          ? milestone.id === 'adv_project' 
                            ? '🎉 已達成隱藏成就！成功獲得大馬學長姐的黑科技傳承，解鎖稱號：【黑科技觀測者】！'
                            : `已完成：${milestone.title}` 
                          : isHiddenLocked 
                            ? '🔒 這是個祕密成就... 在新手村進行特定瘋狂行為或在公會商店轉蛋即可解鎖！' 
                            : `需完成「${milestone.title}」纔可解鎖`}
                      </p>
                      <div className="text-xs text-[#ffcc00] font-bold bg-[#8b5a2b]/30 p-2 rounded-md flex items-center">
                        💎 通關獎勵：成就積分 +10, 金幣 +50
                      </div>
                      {/* Tooltip triangle arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-[#4a3b32]"></div>
                    </div>
                  )}
                </div>
              );
            });
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
