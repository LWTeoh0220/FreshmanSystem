import React, { useState, useEffect } from 'react';
import { TIME_MACHINE_EVENTS } from '../../data/timeMachineData';

const JournalModal = ({ isOpen, onClose, tmQuests, onTrackQuest, onAcceptQuest, currentSceneId }) => {
  const [activeTab, setActiveTab] = useState('current'); // 'current', 'completed'
  const [selectedQuestId, setSelectedQuestId] = useState(null);

  // Filter quests based on tab
  const getVisibleQuests = () => {
    return TIME_MACHINE_EVENTS.filter((evt, idx) => {
      if (!evt.detective_clue) return false;
      const questState = tmQuests.find(q => q.id === evt.id);
      const isCompleted = questState?.status === 'completed';
      const isMissed = questState?.status === 'missed';
      const isActive = questState?.status === 'active';
      
      const previousEvt = TIME_MACHINE_EVENTS.filter(e => e.detective_clue)[idx - 1];
      const isPreviousCompleted = !previousEvt || tmQuests.find(q => q.id === previousEvt.id)?.status === 'completed';
      
      if (!isPreviousCompleted && idx !== 0) return false; // Locked

      if (activeTab === 'current') {
        return isActive || isMissed || !questState; // Include available quests
      } else {
        return isCompleted;
      }
    });
  };

  const visibleQuests = getVisibleQuests();

  // Auto-select first quest when tab changes
  useEffect(() => {
    if (visibleQuests.length > 0) {
      if (!selectedQuestId || !visibleQuests.find(q => q.id === selectedQuestId)) {
        setSelectedQuestId(visibleQuests[0].id);
      }
    } else {
      setSelectedQuestId(null);
    }
  }, [activeTab, visibleQuests.length]);

  if (!isOpen) return null;

  const selectedEvent = TIME_MACHINE_EVENTS.find(e => e.id === selectedQuestId);
  const selectedState = tmQuests.find(q => q.id === selectedQuestId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
      <div 
        className="relative w-full max-w-5xl h-[80vh] bg-transparent flex"
        style={{ fontFamily: 'serif' }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 w-12 h-12 bg-[#8b0000] border-2 border-[#ff4500] rounded-full text-white font-bold shadow-[0_0_15px_rgba(255,0,0,0.8)] hover:scale-110 active:scale-95 transition-transform flex items-center justify-center z-20 text-xl"
        >
          ✖
        </button>

        {/* Left Pane: Leather Cover (List) */}
        <div className="w-[350px] h-full bg-[#1e100a] border-y-8 border-l-8 border-[#3e2315] rounded-l-2xl shadow-[inset_-10px_0_20px_rgba(0,0,0,0.8)] relative flex flex-col z-10 before:content-[''] before:absolute before:inset-0 before:bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] before:opacity-30 before:pointer-events-none">
          
          {/* Header & Tabs */}
          <div className="p-4 border-b-2 border-[#4a2e1b] relative z-10">
            <h2 className="text-[#d4af37] text-2xl font-black mb-4 tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,1)] text-center">
              📖 冒險手帳
            </h2>
            <div className="flex bg-[#0f0805] rounded-lg p-1 border border-[#3e2315] shadow-inner">
              <button 
                onClick={() => setActiveTab('current')}
                className={`flex-1 py-2 text-sm font-bold rounded transition-colors ${activeTab === 'current' ? 'bg-[#4a2e1b] text-[#f4e8d1] shadow-[0_0_10px_#8b5a2b]' : 'text-gray-500 hover:text-gray-300'}`}
              >
                待辦與進行中
              </button>
              <button 
                onClick={() => setActiveTab('completed')}
                className={`flex-1 py-2 text-sm font-bold rounded transition-colors ${activeTab === 'completed' ? 'bg-[#2e4a1b] text-[#e8f4d1] shadow-[0_0_10px_#5a8b2b]' : 'text-gray-500 hover:text-gray-300'}`}
              >
                已完成
              </button>
            </div>
          </div>

          {/* Quest List */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-3 relative z-10">
            {visibleQuests.length === 0 ? (
              <div className="text-center text-gray-600 mt-10 font-bold">沒有任何紀錄</div>
            ) : (
              <div className="flex flex-col gap-2">
                {visibleQuests.map((evt, idx) => {
                  const qState = tmQuests.find(q => q.id === evt.id);
                  const isSelected = selectedQuestId === evt.id;
                  const isMissed = qState?.status === 'missed';
                  const isAvailable = !qState;
                  
                  return (
                    <div 
                      key={evt.id}
                      onClick={() => setSelectedQuestId(evt.id)}
                      className={`relative p-3 pl-4 rounded cursor-pointer transition-all border-l-4 ${
                        isSelected 
                          ? 'bg-[#3e2315] border-[#d4af37] text-[#f4e8d1] shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                          : 'bg-[#150a06] border-transparent text-gray-400 hover:bg-[#25130b] hover:text-gray-200'
                      }`}
                    >
                      <h4 className={`font-bold text-lg ${isMissed ? 'line-through opacity-70' : ''}`}>
                        {evt.quest.title}
                      </h4>
                      <div className="text-xs mt-1 flex justify-between items-center opacity-80">
                        <span>Level {idx * 5 + 1}</span>
                        {isAvailable && <span className="text-yellow-500 font-black">AVAILABLE</span>}
                        {isMissed && <span className="text-red-400 font-black">FAILED</span>}
                        {qState?.status === 'completed' && <span className="text-green-400 font-black">CLEAR</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Decorative Binder Spine effect */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-black/60 z-20 pointer-events-none"></div>
        </div>

        {/* Right Pane: Parchment Pages (Details) */}
        <div className="flex-1 h-full bg-[#f4e8d1] border-y-8 border-r-8 border-[#8b5a2b] rounded-r-2xl shadow-[inset_0_0_50px_rgba(139,90,43,0.3)] relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] flex flex-col">
          
          {selectedEvent ? (
            <div className="flex-1 overflow-y-auto no-scrollbar p-10">
              
              {/* Header Title */}
              <div className="border-b-4 border-double border-[#8b5a2b] pb-6 mb-6 flex items-start gap-4">
                <div className="w-16 h-16 bg-[#e0cda5] border-2 border-[#8b5a2b] rounded-full flex items-center justify-center text-4xl shadow-inner shrink-0 text-[#8b5a2b]">
                  {selectedState?.status === 'completed' ? '✨' : selectedState?.status === 'missed' ? '❌' : !selectedState ? '📜' : '❕'}
                </div>
                <div>
                  <h2 className="text-4xl font-black text-[#5c3a18] drop-shadow-[1px_1px_0_#fff]">
                    {selectedEvent.quest.title}
                  </h2>
                  <div className="text-[#8b5a2b] font-bold mt-2 flex items-center gap-4">
                    <span>📍 {selectedEvent.sceneId === 'malaysia_room' ? '大馬家鄉' : '北科大校園'}</span>
                    <span className="bg-[#5c3a18] text-[#f4e8d1] px-2 py-0.5 rounded text-sm shadow">主線任務</span>
                  </div>
                </div>
              </div>

              {/* Placeholder Image Banner */}
              <div className="w-full h-48 bg-[#e0cda5] border-4 border-[#8b5a2b] rounded-lg shadow-inner mb-6 relative overflow-hidden group">
                {/* Fallback pattern for missing image */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/old-mathematics.png')] opacity-30"></div>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                   <span className="text-6xl grayscale opacity-50">🏛️</span>
                   <span className="text-[#8b5a2b] font-bold mt-2 tracking-widest">地點回憶剪影</span>
                </div>
              </div>

              {/* Rewards Section */}
              <div className="bg-[#e0cda5] border-2 border-[#a67c52] rounded p-4 mb-6 shadow-inner relative">
                <h3 className="absolute -top-3 left-4 bg-[#f4e8d1] px-2 text-[#5c3a18] font-black text-sm border-2 border-[#a67c52] rounded-full">
                  💰 任務報酬
                </h3>
                <div className="flex items-center gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-yellow-400 rounded-full border-2 border-yellow-600 shadow flex items-center justify-center text-xl">🪙</div>
                    <span className="font-black text-xl text-[#5c3a18]">1,000 G</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-400 rounded-full border-2 border-blue-600 shadow flex items-center justify-center text-xl">✨</div>
                    <span className="font-black text-xl text-[#5c3a18]">500 EXP</span>
                  </div>
                </div>
              </div>

              {/* Description & Story */}
              <div className="mb-8">
                <h3 className="text-2xl font-black text-[#8b5a2b] mb-4 flex items-center gap-2">
                  <span>📜</span> 委託內容
                </h3>
                <div className="text-lg leading-loose text-[#3e2315] font-medium text-justify">
                  {selectedEvent.quest.description}
                  <br/><br/>
                  <span className="text-[#8b5a2b] italic">
                    「{selectedEvent.detective_clue}」
                  </span>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#8b5a2b] text-xl font-bold opacity-50">
              請選擇左側的任務條目以閱讀手帳內容...
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="p-6 border-t-2 border-[#e0cda5] bg-gradient-to-t from-[#e0cda5] to-transparent flex justify-end gap-4 relative z-10">
            {(!selectedState || selectedState.status === 'available') && (
              <button 
                onClick={() => onAcceptQuest(selectedEvent.id)}
                className="px-8 py-3 bg-gradient-to-b from-[#1a4a1b] to-[#0a2c10] border-2 border-[#5a8b2b] text-[#e8f4d1] font-black text-xl rounded shadow-[0_4px_10px_rgba(0,0,0,0.5)] hover:from-[#2e5c18] hover:to-[#1e3e15] active:translate-y-1 transition-all flex items-center gap-2"
              >
                📝 接受委託
              </button>
            )}
            {selectedState && selectedState.status === 'active' && (
              currentSceneId === (selectedEvent.sceneId || 'ntut_campus') ? (
                <button 
                  onClick={() => onTrackQuest(selectedEvent)}
                  className="px-8 py-3 bg-gradient-to-b from-[#4a2e1b] to-[#2c1810] border-2 border-[#d4af37] text-[#d4af37] font-black text-xl rounded shadow-[0_4px_10px_rgba(0,0,0,0.5)] hover:from-[#5c3a18] hover:to-[#3e2315] active:translate-y-1 transition-all flex items-center gap-2"
                >
                  👣 追蹤金色足跡
                </button>
              ) : (
                <button disabled className="px-8 py-3 bg-[#1e100a] border-2 border-[#8b0000] text-[#ff4500] font-black text-xl rounded shadow cursor-not-allowed">
                  ⛔ 需前往該地圖才能追蹤
                </button>
              )
            )}
            {selectedState?.status === 'completed' && (
              <button disabled className="px-8 py-3 bg-gray-400 border-2 border-gray-500 text-gray-200 font-black text-xl rounded shadow cursor-not-allowed">
                已結案
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default JournalModal;
