import React, { useState } from 'react';
import { PackageOpen, Lock, Sparkles, Network, ArrowLeft, Calendar, RotateCcw, Compass, User, X } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import confettiPkg from 'canvas-confetti';
const confetti = typeof confettiPkg === 'function' ? confettiPkg : confettiPkg.default;

export default function QuestTreeViewer({ graphData, onCompleteNode, onUndoNode, onDrillDown, onBack }) {
  const [activeQuestModal, setActiveQuestModal] = useState(null);
  const [activeUndoModal, setActiveUndoModal] = useState(null);
  const [activeLockModal, setActiveLockModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const { mp, consumeMp } = usePlayer();
  if (!graphData) return (
    <div className="glass rounded-3xl p-8 h-[500px] flex flex-col items-center justify-center text-[#8b5a2b] shadow-sm rpg-border">
      <Network size={64} className="mb-4 opacity-50" />
      <p className="text-2xl font-black text-[#4a3b32] mb-6">任務卷軸似乎迷失在時空亂流中了...</p>
      <p className="text-sm mt-2 opacity-80 text-[#7a6350] mb-8">（請點擊下方按鈕返回主線，或從上方導覽列重新進入）</p>
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center px-6 py-3 bg-[#8b5a2b] text-[#f4e8d1] rounded-xl font-bold hover:bg-[#7a6350] transition-colors shadow-md active:scale-95"
        >
          <ArrowLeft size={20} className="mr-2" /> 返回主線任務
        </button>
      )}
    </div>
  );

  const { id: graphId, title, nodes } = graphData;
  const isMainQuest = graphId === 'main_quest';

  const getStatusConfig = (status, isDrillDown) => {
    switch(status) {
      case 'completed': 
        return { 
          icon: <PackageOpen className="text-[#c62828]" size={28}/>, 
          bg: 'bg-pattern-stripes bg-[#e0cda5] border-[#8b5a2b]/50', 
          text: 'text-[#4a3b32]',
          line: 'border-l-4 border-dotted border-[#c62828] shadow-[0_0_10px_rgba(198,40,40,0.5)]'
        };
      case 'available': 
        return { 
          icon: <Sparkles className="text-[#ff8f00]" size={28}/>, 
          bg: 'bg-[#f4e8d1] border-[#ff8f00] active-glow scale-[1.02] z-10 shadow-xl', 
          text: 'text-[#8b5a2b]', 
          cursor: 'cursor-pointer hover:scale-[1.03] transform transition-all',
          line: 'border-l-4 border-dotted border-[#8b5a2b]/30'
        };
      case 'locked': 
        return { 
          icon: <Lock className="text-[#7a6350]" size={28}/>, 
          bg: 'bg-[#d2b48c]/50 border-[#8b5a2b]/20 opacity-80 grayscale', 
          text: 'text-[#7a6350]', 
          cursor: isDrillDown ? 'cursor-pointer hover:bg-[#8b5a2b]/10 transition-all' : 'cursor-not-allowed',
          line: 'border-l-4 border-dotted border-[#8b5a2b]/30'
        };
      default: return {};
    }
  };

  return (
    <div className="glass rounded-3xl p-8 h-[600px] flex flex-col shadow-2xl rpg-border relative overflow-hidden">
      {/* Decorative RPG watermark */}
      <Compass className="absolute -right-20 -bottom-20 text-[#8b5a2b]/5 w-[300px] h-[300px] pointer-events-none" />

      <div className="mb-8 border-b-2 border-[#8b5a2b]/20 pb-4 relative z-10">
        {!isMainQuest && (
          <button 
            onClick={onBack}
            className="absolute left-0 top-0 -mt-2 -ml-2 p-2 text-[#7a6350] hover:text-[#4a3b32] hover:bg-[#8b5a2b]/10 rounded-xl transition-colors flex items-center font-bold"
          >
            <ArrowLeft size={20} className="mr-1" /> 返回世界地圖
          </button>
        )}
        <h2 className={`text-4xl font-black text-[#4a3b32] mb-3 tracking-wide drop-shadow-sm ${!isMainQuest ? 'mt-8' : ''}`}>{title}</h2>
        <div className="flex items-center text-sm space-x-3 font-bold">
          <span className="px-3 py-1 bg-[#8b5a2b]/10 text-[#8b5a2b] rounded-full border border-[#8b5a2b]/20">📜 {graphData.type === 'checklist' ? '行前檢核表' : 'DAG 任務卷軸'}</span>
          <span className="px-3 py-1 bg-[#ff8f00]/10 text-[#ff8f00] rounded-full border border-[#ff8f00]/20">✨ 拓撲解鎖序列</span>
          {title.includes("Main Quest") && (
            <span className="px-3 py-1 bg-[#c62828]/10 text-[#c62828] rounded-full border border-[#c62828]/20">⚔️ DFS 時光倒流</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative p-2 custom-scrollbar z-10">
        {graphData.type === 'checklist' ? (
          <div className="flex flex-col h-full animate-fade-in-up">
            <div className="grid grid-cols-1 gap-4 mb-6">
              {nodes.map((node) => {
                const isChecked = checkedItems[node.id] || localStorage.getItem(`chk_${node.id}`);
                return (
                  <div 
                    key={node.id} 
                    onClick={() => {
                      const newState = !isChecked;
                      setCheckedItems(prev => ({...prev, [node.id]: newState}));
                      if (newState) localStorage.setItem(`chk_${node.id}`, 'true');
                      else localStorage.removeItem(`chk_${node.id}`);
                    }}
                    className={`p-5 rounded-2xl border-[3px] flex items-center cursor-pointer transition-all duration-300 hover:-translate-y-1 ${isChecked ? 'bg-[#2e7d32]/10 border-[#2e7d32] shadow-[0_4px_15px_rgba(46,125,50,0.2)]' : 'bg-[#e0cda5]/30 border-[#8b5a2b]/30 hover:border-[#8b5a2b]/60'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center mr-4 transition-colors ${isChecked ? 'bg-[#2e7d32] border-[#2e7d32] text-white' : 'bg-white border-[#8b5a2b]'}`}>
                      {isChecked && <PackageOpen size={20} />}
                    </div>
                    <div>
                      <h4 className={`text-lg font-black transition-colors ${isChecked ? 'text-[#2e7d32] line-through opacity-70' : 'text-[#4a3b32]'}`}>{node.title}</h4>
                      <p className={`text-sm font-bold mt-1 ${isChecked ? 'text-[#2e7d32]/70 line-through opacity-70' : 'text-[#7a6350]'}`}>{node.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-auto pt-4 border-t-2 border-[#8b5a2b]/20">
              <button 
                onClick={() => {
                  const allChecked = nodes.every(n => checkedItems[n.id] || localStorage.getItem(`chk_${n.id}`));
                  if (allChecked) {
                    setIsSubmitting(true);
                    setTimeout(() => {
                      try {
                        if (confetti) confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                      } catch(e) {}
                      localStorage.setItem(`summer_node_${graphId}`, 'completed');
                      setIsSubmitting(false);
                      if (onBack) onBack();
                    }, 1000);
                  }
                }}
                disabled={!nodes.every(n => checkedItems[n.id] || localStorage.getItem(`chk_${n.id}`))}
                className={`w-full py-4 rounded-xl font-black text-xl transition-all shadow-lg border-b-4 ${nodes.every(n => checkedItems[n.id] || localStorage.getItem(`chk_${n.id}`)) ? 'bg-gradient-to-b from-[#ffcc00] to-[#ff8f00] text-[#4a3b32] border-[#8b5a2b] hover:brightness-110 active:border-b-0 active:translate-y-1 animate-pulse' : 'bg-[#d2b48c] text-[#7a6350] border-[#8b5a2b]/30 cursor-not-allowed'}`}
              >
                {isSubmitting ? '✨ 獎勵結算中...' : '🎁 領取通關報酬'}
              </button>
            </div>
          </div>
        ) : (
        <div className="space-y-8 relative ml-4">
          {nodes.map((node, index) => {
            const hasDrillDown = !!node.targetProcessId;
            const config = getStatusConfig(node.status, hasDrillDown);
            const isLast = index === nodes.length - 1;
            
            return (
              <div key={node.id} className="relative flex items-center group/node animate-bounce-in-stagger" style={{ animationDelay: `${index * 0.15}s` }}>
                
                {/* Connecting Line (Timeline) */}
                {!isLast && (
                  <div className={`absolute left-7 top-14 bottom-[-32px] transition-all duration-700 ${config.line}`}>
                    {node.status === 'completed' && <div className="absolute inset-0 bg-[#ff8f00] w-1 blur-[2px] animate-flow opacity-50"></div>}
                  </div>
                )}
                
                {/* Node Icon */}
                <div 
                  className={`relative z-10 flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center bg-[#f4e8d1] border-4 transition-all duration-500 shadow-md ${node.status === 'available' ? 'border-[#ff8f00] shadow-[0_0_15px_#ff8f00]' : 'border-[#8b5a2b]'}`}
                >
                  {config.icon}
                </div>
                
                {/* Node Content Card */}
                <div 
                  className={`ml-8 flex-1 p-6 rounded-xl transition-all duration-300 ${config.bg} ${config.cursor || ''} relative rpg-border`}
                  onClick={() => {
                    if (hasDrillDown) {
                      if (node.status !== 'locked') {
                        onDrillDown(node.targetProcessId);
                      } else {
                        setActiveLockModal(true);
                      }
                    } else if (node.status === 'available') {
                      setActiveQuestModal(node);
                    }
                  }}
                >
                  {/* DAG Ribbon */}
                  <div className="absolute -top-3 left-4 bg-[#8b5a2b] text-[#f4e8d1] px-3 py-0.5 text-xs font-black rounded-sm shadow-md border border-[#4a3b32]">
                    QUEST ID: {node.id}
                  </div>

                  <h3 className={`text-2xl font-black ${config.text} mb-2 mt-1 flex justify-between items-center pr-32`}>
                    {node.title}
                    
                    {/* RPG Drill Down Button */}
                    {hasDrillDown && (
                      <span className="text-sm font-black bg-[#8b5a2b] text-[#f4e8d1] px-4 py-2 rounded-lg shadow-md border border-[#4a3b32] rpg-button absolute right-5 top-5">
                        開啟副本 ➔
                      </span>
                    )}

                    {/* Completion Action */}
                    {!hasDrillDown && node.status === 'available' && (
                      <span className="text-sm font-black bg-[#ff8f00] text-[#4a3b32] px-4 py-2 rounded-lg shadow-md border border-[#8b5a2b] animate-pulse rpg-button absolute right-5 top-5">
                        執行任務 ➔
                      </span>
                    )}
                  </h3>
                  <p className={`${node.status === 'locked' ? 'text-[#7a6350]' : 'text-[#4a3b32]'} text-base font-medium leading-relaxed pr-24`}>
                    {node.description}
                  </p>

                  {/* Red CLEAR Stamp Overlay */}
                  {node.status === 'completed' && (
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 text-5xl font-black text-[#c62828] opacity-30 transform -rotate-12 select-none pointer-events-none border-4 border-[#c62828] px-3 py-1 rounded-xl">
                      QUEST CLEAR
                    </div>
                  )}

                  {/* Subtle Undo Button (Time Reversal) */}
                  {!hasDrillDown && node.status === 'completed' && onUndoNode && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveUndoModal(node);
                      }}
                      className="absolute right-5 bottom-4 flex items-center justify-center bg-[#f4e8d1] border border-[#8b5a2b] text-[#8b5a2b] hover:bg-[#8b5a2b] hover:text-[#f4e8d1] rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm transition-all active:scale-95 z-20"
                      title="時光倒流 (撤銷)"
                    >
                      <RotateCcw size={14} className="mr-1" />
                      時光倒流
                    </button>
                  )}
                  
                  {/* Suggested Time */}
                  {node.suggestedTime && (
                    <div className="mt-4 flex items-center text-sm font-bold text-[#8b5a2b] bg-[#8b5a2b]/10 w-max px-3 py-1.5 rounded-lg border border-[#8b5a2b]/30">
                      <Calendar size={16} className="mr-2" />
                      建議時間: {node.suggestedTime}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* JRPG Quest Execution Modal */}
      {activeQuestModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#1d1d1f]/60 backdrop-blur-sm p-4">
          <div className="bg-[#f4e8d1] p-8 rounded-3xl max-w-lg w-full border-4 border-[#8b5a2b] shadow-2xl relative animate-bounce-in-stagger rpg-border">
            <button 
              onClick={() => { setActiveQuestModal(null); setPhoneInput(''); setPhoneError(false); }}
              className="absolute top-5 right-5 text-[#8b5a2b] hover:text-[#c62828] transition-colors bg-[#8b5a2b]/10 p-2 rounded-xl"
            >
              <X size={28} />
            </button>
            
            <h2 className="text-2xl font-black text-[#4a3b32] mb-6 flex items-center border-b-2 border-[#8b5a2b]/20 pb-4">
              <User size={32} className="mr-3 text-[#8b5a2b]" />
              公會任務檢核官
            </h2>
            
            {activeQuestModal.id === 'mq_phone' ? (
              <>
                <p className="text-md font-bold text-[#7a6350] mb-4 bg-[#e0cda5]/30 p-4 rounded-lg border border-[#8b5a2b]/20 leading-relaxed">
                  「哦？你已經辦好台灣的手機門號了嗎？請在下方登記，以便未來發放公會警報！」
                </p>
                <div className="mb-6">
                  <label className="block text-sm font-black text-[#c62828] mb-2">
                    ⚠️ 隱私提醒：此資料僅用於遊戲進度保存演示，不會上傳至伺服器或做其他用途。
                  </label>
                  <input 
                    type="text" 
                    placeholder="請輸入您的台灣手機號碼 (例如: 0912345678)" 
                    value={phoneInput}
                    onChange={(e) => { setPhoneInput(e.target.value); setPhoneError(false); }}
                    className="w-full bg-[#fcf9f2] border-2 border-[#8b5a2b]/50 p-3 rounded-xl font-bold text-[#4a3b32] focus:outline-none focus:border-[#8b5a2b]"
                  />
                  {phoneError && (
                    <div className="mt-3 bg-[#c62828]/10 text-[#c62828] p-3 rounded-lg border border-[#c62828]/30 font-bold text-sm animate-bounce-in-stagger flex items-center">
                      <X size={16} className="mr-2" />
                      ❌ 請輸入正確的台灣手機號碼格式 (09開頭，共10碼)
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-md font-bold text-[#7a6350] mb-6 bg-[#e0cda5]/30 p-4 rounded-lg border border-[#8b5a2b]/20 leading-relaxed">
                「確認已經完成【{activeQuestModal.title}】的各項要求了嗎？點擊下方按鈕交付憑證，我將為您蓋上通關印章！」
              </p>
            )}

            <button 
              onClick={() => {
                if (activeQuestModal.id === 'mq_phone' && (!phoneInput.startsWith('09') || phoneInput.length < 10)) {
                  setPhoneError(true);
                  return;
                }
                
                setIsSubmitting(true);
                // Simulate magic casting delay
                setTimeout(() => {
                  onCompleteNode(activeQuestModal.id);
                  // Safely call confetti
                  try {
                    if (confetti) {
                      confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#007aff', '#ffcc00']
                      });
                    }
                  } catch (e) { console.error('Confetti error', e); }
                  
                  setIsSubmitting(false);
                  setActiveQuestModal(null);
                  setPhoneInput('');
                }, 1000);
              }}
              disabled={isSubmitting}
              className={`w-full py-3 text-[#f4e8d1] font-black text-xl rounded-xl transition-colors shadow-sm border-b-4 border-[#4a3b32] active:border-b-0 active:translate-y-1 ${isSubmitting ? 'bg-[#7a6350] cursor-not-allowed' : 'bg-[#8b5a2b] hover:bg-[#7a6350]'}`}
            >
              {isSubmitting ? '✨ 魔法審查中...' : '🤝 交付憑證回報任務'}
            </button>
          </div>
        </div>
      )}

      {/* Time Travel Undo Modal */}
      {activeUndoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d1d1f]/60 backdrop-blur-[2px] p-4">
          <div className="bg-[#f4e8d1] p-8 rounded-3xl max-w-md w-full border-[6px] border-[#8b5a2b] shadow-[0_0_40px_rgba(0,0,0,0.5)] relative animate-[modalScaleIn_0.3s_ease-out_forwards] rpg-border">
             <h2 className="text-2xl font-black text-[#4a3b32] mb-4 flex items-center border-b-2 border-[#8b5a2b]/20 pb-4 justify-center">
              ⏳ 【 時光卷軸：記憶重溫 】
            </h2>
            <p className="text-md font-bold text-[#5c4033]/90 mb-8 leading-relaxed bg-[#e0cda5]/30 p-5 rounded-xl border border-[#8b5a2b]/20 shadow-inner text-center">
              {mp < 10 ? (
                <span className="text-[#c62828] animate-pulse">❌ 警告：您的魔力值（MP）不足 10 點，無法啟動時光回溯魔法！請先去世界地圖完成其他任務或每日簽到來吸取魔力！</span>
              ) : (
                "冒險者，您正在啟動時光回溯魔法！您可以重新查看此階段任務。但由於您已領取過首通獎勵，本次記憶重溫將不再重複發放金幣與經驗值（XP）！"
              )}
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => {
                  if (mp >= 10 && consumeMp(10)) {
                    onUndoNode(activeUndoModal.id);
                    setActiveUndoModal(null);
                  }
                }}
                disabled={mp < 10}
                className={`flex-1 py-3.5 font-black text-md rounded-xl transition-colors shadow-lg border-b-4 active:translate-y-1 ${mp < 10 ? 'bg-[#7a6350] text-[#d2b48c] border-[#4a3b32] cursor-not-allowed' : 'bg-gradient-to-b from-[#8b5a2b] to-[#5c3a21] text-[#f4e8d1] border-[#3e2723] hover:brightness-110 active:border-b-0'}`}
              >
                [ 🔮 消耗 10 MP，重啟副本 ]
              </button>
              <button 
                onClick={() => setActiveUndoModal(null)}
                className="flex-1 py-3.5 bg-[#e0cda5] text-[#4a3b32] border-2 border-[#8b5a2b] font-black text-md rounded-xl hover:bg-[#d2b48c] transition-colors shadow-sm"
              >
                🚫 保持現狀（關閉）
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Magic Seal Lock Modal */}
      {activeLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d1d1f]/60 backdrop-blur-[2px] p-4">
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
              <button 
                onClick={() => {
                  setActiveLockModal(false);
                  if (onBack) onBack();
                }}
                className="flex-1 py-3.5 bg-[#424242] text-gray-200 border-2 border-gray-600 font-black text-md rounded-xl hover:bg-[#616161] transition-colors shadow-sm"
              >
                ↩️ 返回大廳
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
