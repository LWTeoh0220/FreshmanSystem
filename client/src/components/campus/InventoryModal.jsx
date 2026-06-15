import React, { useState } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';

const InventoryModal = ({ isOpen, onClose }) => {
  const { inventory } = usePlayer();
  const [selectedItem, setSelectedItem] = useState(null);

  if (!isOpen) return null;

  // Render 9 slots minimum
  const slots = Array(9).fill(null);
  inventory.forEach((item, idx) => {
    if (idx < 9) slots[idx] = item;
  });
  // If inventory is larger than 9, expand slots to multiple of 3
  if (inventory.length > 9) {
    const extraRows = Math.ceil((inventory.length - 9) / 3);
    for (let i = 0; i < extraRows * 3; i++) {
      slots.push(inventory[9 + i] || null);
    }
  }

  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'legendary': return '#ffd700'; // Gold
      case 'rare': return '#00bfff'; // Blue
      default: return '#a9a9a9'; // Gray
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
      <div className="relative w-full max-w-xl bg-[#2c1810] border-4 border-[#8b5a2b] rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] bg-blend-overlay flex flex-col md:flex-row gap-6">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 w-10 h-10 bg-[#8b0000] border-2 border-[#ff4500] rounded-full text-white font-bold shadow-lg hover:scale-110 active:scale-95 transition-transform flex items-center justify-center z-10"
        >
          X
        </button>

        {/* Inventory Grid */}
        <div className="flex-1">
          <h2 className="text-[#d4af37] text-2xl font-black mb-4 tracking-widest border-b-2 border-[#8b5a2b] pb-2 text-center" style={{ fontFamily: 'serif' }}>
            🎒 冒險者背包
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {slots.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => item && setSelectedItem(item)}
                className={`relative w-full aspect-square bg-[#1a0f0a] border-2 ${item ? 'cursor-pointer hover:scale-105 transition-transform shadow-inner' : 'border-[#3e2723] opacity-60'} flex items-center justify-center rounded-sm group`}
                style={{
                  borderColor: item && selectedItem?.id === item.id ? '#fff' : (item ? getRarityColor(item.rarity) : '#3e2723'),
                  boxShadow: item && selectedItem?.id === item.id ? `0 0 15px ${getRarityColor(item.rarity)}` : 'none'
                }}
              >
                {item ? (
                  <>
                    <span className="text-4xl drop-shadow-md">{item.icon}</span>
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded-sm font-bold border border-[#8b5a2b]">
                      x{item.count}
                    </div>
                  </>
                ) : (
                  <span className="text-[#3e2723] text-2xl">?</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Item Details Panel */}
        <div className="w-full md:w-64 bg-[#1a0f0a] border-2 border-[#8b5a2b] p-4 rounded-sm shadow-inner flex flex-col">
          <h3 className="text-[#e0cda5] text-lg font-bold border-b border-[#3e2723] pb-2 mb-3 text-center">
            📜 物品詳情
          </h3>
          {selectedItem ? (
            <div className="flex flex-col items-center animate-in fade-in">
              <div className="w-20 h-20 mb-3 flex items-center justify-center text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                {selectedItem.icon}
              </div>
              <h4 className="text-xl font-black text-center mb-1" style={{ color: getRarityColor(selectedItem.rarity) }}>
                {selectedItem.name}
              </h4>
              <div className="text-xs text-center mb-4 font-bold opacity-80" style={{ color: getRarityColor(selectedItem.rarity) }}>
                {selectedItem.rarity === 'legendary' ? '✨ 傳說物品' : selectedItem.rarity === 'rare' ? '🌟 稀有物品' : '📦 普通物品'}
              </div>
              <div className="text-[#f4e8d1] text-sm leading-relaxed text-justify bg-[#2c1a11] p-3 border border-[#4a2e1b] rounded shadow-inner w-full">
                {selectedItem.desc}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#8b5a2b] text-sm font-bold opacity-70 text-center">
              點擊左側欄位<br/>檢視物品詳細資訊
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default InventoryModal;
