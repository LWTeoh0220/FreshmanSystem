import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Shield, Globe, Settings, MapPin, AlertCircle, X, User } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';

export default function GuildIntelBoard() {
  const { hp, consumeHp } = usePlayer();
  const [profile, setProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedDorm, setSelectedDorm] = useState('');

  // Load profile from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('player_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        setSelectedMajor(parsed.major || '');
        setSelectedDorm(parsed.dorm || '');
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    }
  }, []);

  const handleSaveProfile = () => {
    const newProfile = { major: selectedMajor, dorm: selectedDorm };
    setProfile(newProfile);
    localStorage.setItem('player_profile', JSON.stringify(newProfile));
    setShowModal(false);
  };

  const getMajorTip = (major) => {
    switch(major) {
      case '電子系': return '大一微積分，綜科館302教室';
      case '資工系': return '計算機概論，科研大樓401教室';
      case '電機系': return '普通物理，教研大樓205教室';
      default: return '請確認今日課表';
    }
  };

  const getDormTip = (dorm) => {
    switch(dorm) {
      case '南辦': return '南辦垃圾場於晚上八點開放，請注意分類。';
      case '北辦': return '北辦熱水供應時間已延長至凌晨一點。';
      case '校外': return '騎車通勤請注意校園周邊交通管制。';
      default: return '請遵守宿舍相關規範。';
    }
  };

  return (
    <div className="w-full h-full glass bg-[#f4e8d1] p-6 rounded-3xl border-4 border-[#8b5a2b] shadow-2xl relative rpg-border flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-[#8b5a2b]/30 pb-4 mb-6 gap-4">
        <h2 className="text-2xl font-black text-[#4a3b32] drop-shadow-sm flex items-center">
          <MapPin className="mr-3 text-[#8b5a2b]" size={28} flexShrink={0} />
          <div className="flex flex-col">
            <span>免登入處室狀態看板</span>
            <span className="text-sm text-[#7a6350]">(Guild Intel Board)</span>
          </div>
        </h2>
        
        {/* Error Message Toast */}
        {errorMessage && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2a221c] border-2 border-[#c62828] text-[#ffdddd] px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(198,40,40,0.5)] z-50 animate-[shake_0.5s_ease-in-out] font-black text-center min-w-[300px]">
            {errorMessage}
          </div>
        )}

        {profile ? (
          <button 
            onClick={() => {
              if (isRefreshing) return;
              if (consumeHp(10)) {
                setIsRefreshing(true);
                setTimeout(() => setIsRefreshing(false), 2000);
              } else {
                setErrorMessage('❌ 冒險者精力耗盡！請等待明日清晨 4:00 公會回復體力，或前往首頁進行每日簽到占卜補滿！');
                setTimeout(() => setErrorMessage(''), 3500);
              }
            }}
            disabled={isRefreshing}
            className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-xl font-bold shadow-md transition-all border w-full md:w-auto ${
              isRefreshing 
                ? 'bg-gray-400 border-gray-500 text-gray-700 cursor-not-allowed' 
                : 'bg-[#8b5a2b] text-[#f4e8d1] border-[#4a3b32] hover:bg-[#7a6350] active:scale-95'
            }`}
          >
            <Settings size={18} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? '數據重新整理中...' : '更新情報 [ 🔄 消耗 10 HP ]'}</span>
          </button>
        ) : (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center space-x-2 bg-[#8b5a2b] text-[#f4e8d1] px-4 py-2 rounded-xl font-bold shadow-md hover:bg-[#7a6350] transition-colors border border-[#4a3b32] active:scale-95 whitespace-nowrap w-full md:w-auto"
          >
            <Settings size={18} />
            <span>入籍儀式</span>
          </button>
        )}
      </div>

      {/* Guild Cards */}
      <div className="flex flex-col gap-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Academic Affairs Guild */}
        <div className="bg-[#e0cda5]/50 border-2 border-[#8b5a2b]/30 rounded-2xl p-5 hover:border-[#8b5a2b] hover:-translate-y-1 hover:shadow-xl transition-all cursor-pointer relative group flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          <div className="flex items-center sm:w-[30%] flex-shrink-0 text-[#8b5a2b]">
            <BookOpen size={28} className="mr-3" />
            <h3 className="text-xl font-black text-[#4a3b32]">教務處公會</h3>
          </div>
          <div className="flex-1 w-full space-y-3">
            <p className="text-sm font-bold text-[#c62828] bg-[#c62828]/10 p-3 rounded-xl border border-[#c62828]/20 flex items-center justify-between leading-relaxed w-full">
              <span><span className="mr-2">🔥</span> 距【全校加退選截止】還有 3 天</span>
              <span className="text-xs text-[#8b5a2b] bg-[#f4e8d1] px-2 py-1 rounded-md shadow-sm border border-[#8b5a2b]/30 group-hover:bg-[#8b5a2b] group-hover:text-white transition-colors opacity-80 group-hover:opacity-100 whitespace-nowrap hidden sm:block">🔍 查看詳情 ➔</span>
            </p>
            {profile?.major && (
              <p className="text-sm font-bold text-[#4a3b32] bg-[#8b5a2b]/10 p-3 rounded-xl border border-[#8b5a2b]/20">
                <span className="text-[#ff8f00] mr-2">🎯 專屬：</span>今日推薦主線【{getMajorTip(profile.major)}】
              </p>
            )}
          </div>
        </div>

        {/* Student Affairs Guild */}
        <div className="bg-[#e0cda5]/50 border-2 border-[#8b5a2b]/30 rounded-2xl p-5 hover:border-[#8b5a2b] hover:-translate-y-1 hover:shadow-xl transition-all cursor-pointer relative group flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          <div className="flex items-center sm:w-[30%] flex-shrink-0 text-[#2e7d32]">
            <Shield size={28} className="mr-3" />
            <h3 className="text-xl font-black text-[#4a3b32]">學務處後勤</h3>
          </div>
          <div className="flex-1 w-full space-y-3">
            <p className="text-sm font-bold text-[#2e7d32] bg-[#2e7d32]/10 p-3 rounded-xl border border-[#2e7d32]/20 flex items-center justify-between leading-relaxed w-full">
              <span><span className="mr-2">🛡️</span> 本週六 10:00 舉辦全校社團博覽會</span>
              <span className="text-xs text-[#8b5a2b] bg-[#f4e8d1] px-2 py-1 rounded-md shadow-sm border border-[#8b5a2b]/30 group-hover:bg-[#8b5a2b] group-hover:text-white transition-colors opacity-80 group-hover:opacity-100 whitespace-nowrap hidden sm:block">🔍 查看詳情 ➔</span>
            </p>
            {profile?.dorm && (
              <p className="text-sm font-bold text-[#4a3b32] bg-[#8b5a2b]/10 p-3 rounded-xl border border-[#8b5a2b]/20">
                <span className="text-[#ff8f00] mr-2">💡 宿舍情報：</span>{getDormTip(profile.dorm)}
              </p>
            )}
          </div>
        </div>

        {/* OIA Guild */}
        <div className="bg-[#e0cda5]/50 border-2 border-[#8b5a2b]/30 rounded-2xl p-5 hover:border-[#8b5a2b] hover:-translate-y-1 hover:shadow-xl transition-all cursor-pointer relative group flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          {/* New Notification Dot */}
          <span className="absolute -top-1 -right-1 flex h-5 w-5 z-20">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c62828] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-[#c62828] border-2 border-[#f4e8d1] shadow-sm"></span>
          </span>
          <div className="flex items-center sm:w-[30%] flex-shrink-0 text-[#ff8f00]">
            <Globe size={28} className="mr-3" />
            <h3 className="text-xl font-black text-[#4a3b32]">國際處公會</h3>
          </div>
          <div className="flex-1 w-full space-y-3">
            <p className="text-sm font-bold text-[#4a3b32] bg-[#f4e8d1] p-3 rounded-xl border border-[#8b5a2b]/30 flex items-center justify-between leading-relaxed shadow-inner w-full">
              <span><span className="mr-2">📜</span> 115學年度境外新生健保補助開始申請</span>
              <span className="text-xs text-[#8b5a2b] bg-[#e0cda5] px-2 py-1 rounded-md shadow-sm border border-[#8b5a2b]/30 group-hover:bg-[#8b5a2b] group-hover:text-white transition-colors opacity-80 group-hover:opacity-100 whitespace-nowrap hidden sm:block">🔍 查看詳情 ➔</span>
            </p>
          </div>
        </div>

      </div>

      {/* Profile Creation Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1d1d1f]/70 backdrop-blur-sm p-4">
          <div className="bg-[#f4e8d1] p-8 rounded-3xl max-w-md w-full border-4 border-[#8b5a2b] shadow-2xl relative animate-bounce-in-stagger rpg-border">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-[#8b5a2b] hover:text-[#c62828] transition-colors bg-[#8b5a2b]/10 p-2 rounded-xl"
            >
              <X size={28} />
            </button>
            
            <h2 className="text-2xl font-black text-[#4a3b32] mb-6 flex items-center border-b-2 border-[#8b5a2b]/20 pb-4">
              <User size={32} className="mr-3 text-[#8b5a2b]" />
              公會入籍登記官
            </h2>
            
            <p className="text-sm font-bold text-[#7a6350] mb-6 bg-[#e0cda5]/30 p-3 rounded-lg border border-[#8b5a2b]/20">
              「新來的冒險者，請登記你的基本資料，系統會為你發送專屬的地圖提示與物資情報！」
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-md font-black text-[#4a3b32] mb-2">你的所屬科系</label>
                <select 
                  value={selectedMajor}
                  onChange={(e) => setSelectedMajor(e.target.value)}
                  className="w-full bg-[#fcf9f2] border-2 border-[#8b5a2b]/50 p-3 rounded-xl font-bold text-[#4a3b32] focus:outline-none focus:border-[#8b5a2b] appearance-none cursor-pointer"
                >
                  <option value="" disabled>請選擇科系...</option>
                  <option value="電子系">電子工程系</option>
                  <option value="資工系">資訊工程系</option>
                  <option value="電機系">電機工程系</option>
                </select>
              </div>

              <div>
                <label className="block text-md font-black text-[#4a3b32] mb-2">你的住宿區域</label>
                <select 
                  value={selectedDorm}
                  onChange={(e) => setSelectedDorm(e.target.value)}
                  className="w-full bg-[#fcf9f2] border-2 border-[#8b5a2b]/50 p-3 rounded-xl font-bold text-[#4a3b32] focus:outline-none focus:border-[#8b5a2b] appearance-none cursor-pointer"
                >
                  <option value="" disabled>請選擇住宿區域...</option>
                  <option value="南辦">新生男子宿舍 (南辦)</option>
                  <option value="北辦">新生女子宿舍 (北辦)</option>
                  <option value="校外">校外租屋</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleSaveProfile}
              className="w-full mt-8 py-3 bg-[#8b5a2b] text-[#f4e8d1] font-black text-xl rounded-xl hover:bg-[#7a6350] transition-colors shadow-sm border-b-4 border-[#4a3b32] active:border-b-0 active:translate-y-1"
            >
              確認登記
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
