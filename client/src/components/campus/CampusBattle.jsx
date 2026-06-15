import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { QUESTION_SETS } from './campusData';

export default function CampusBattle({ npc, onEnd }) {
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    // Pick a random question from the NPC's questType
    const qSet = QUESTION_SETS[npc.questType];
    if (qSet && qSet.questions.length > 0) {
      const q = qSet.questions[Math.floor(Math.random() * qSet.questions.length)];
      setQuestion(q);
    } else {
      // Fallback
      setQuestion({
        q: '這是一個測試問題，北科大在哪個城市？',
        choices: ['臺北', '臺中', '高雄', '花蓮'],
        ans: 0
      });
    }
  }, [npc]);

  const handleAnswer = (index) => {
    if (selectedAnswer !== null) return; // Prevent multiple clicks
    setSelectedAnswer(index);
    const correct = index === question.ans;
    setIsCorrect(correct);
    setShowResult(true);
    
    // Auto-close after showing result
    setTimeout(() => {
      onEnd(correct);
    }, 1500);
  };

  if (!question) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-lg p-8 rounded-lg shadow-2xl animate-fade-in-up"
        style={{ 
          backgroundColor: 'rgba(26, 18, 8, 0.95)',
          border: '3px solid #8b6914',
          boxShadow: '0 0 30px rgba(139, 105, 20, 0.5)'
        }}
      >
        {/* Header */}
        <div className="flex items-center mb-6 border-b border-[#8b6914] pb-4">
          <div className="text-4xl mr-4">{npc.emoji}</div>
          <div>
            <h3 className="text-[#f4c842] text-xl font-bold tracking-wider">{npc.name}</h3>
            <span className="text-[#d8b8a8] text-sm">{npc.battleData.level}</span>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <p className="text-lg leading-relaxed font-semibold tracking-wide" style={{ color: '#f4e8c1' }}>
            「{question.q}」
          </p>
        </div>

        {/* Choices */}
        <div className="space-y-3">
          {question.choices.map((choice, idx) => {
            let btnStyle = {
              backgroundColor: '#2d1f0a',
              color: '#f4c842',
              border: '2px solid #8b6914'
            };

            if (showResult) {
              if (idx === question.ans) {
                btnStyle.border = '2px solid #2ecc71';
                btnStyle.backgroundColor = 'rgba(46, 204, 113, 0.1)';
              } else if (idx === selectedAnswer && !isCorrect) {
                btnStyle.border = '2px solid #e74c3c';
                btnStyle.backgroundColor = 'rgba(231, 76, 60, 0.1)';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={showResult}
                className="w-full text-left px-5 py-3 rounded-md transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                style={btnStyle}
              >
                <span className="font-bold mr-3">{String.fromCharCode(65 + idx)}.</span>
                {choice}
              </button>
            );
          })}
        </div>

        {/* Result Overlay Text */}
        {showResult && (
          <div className="mt-6 text-center animate-bounce">
            {isCorrect ? (
              <p className="text-[#2ecc71] font-black text-xl tracking-widest drop-shadow-[0_0_8px_#2ecc71]">
                ✅ 答對了！
              </p>
            ) : (
              <p className="text-[#e74c3c] font-black text-xl tracking-widest drop-shadow-[0_0_8px_#e74c3c]">
                ❌ 答錯了！ HP -10
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
