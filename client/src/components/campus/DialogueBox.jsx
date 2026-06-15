import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';

const DialogueBox = ({ dialogueState, onComplete }) => {
  const { addTask } = usePlayer();
  const [displayedText, setDisplayedText] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  const npc = dialogueState?.npc;
  const isActive = !!npc;

  const currentMessageList = npc?.messages || [];
  // If trivia and we are answering, replace message list logic
  
  useEffect(() => {
    if (!isActive) {
      setMsgIndex(0);
      setDisplayedText("");
      setAnswered(false);
      setShowOptions(false);
      setFeedbackText("");
      return;
    }

    let targetText = "";
    if (answered) {
      targetText = feedbackText;
    } else {
      targetText = currentMessageList[msgIndex] || "";
    }

    if (!targetText) return;

    setIsTyping(true);
    setDisplayedText("");
    let charIndex = 0;

    const timer = setInterval(() => {
      setDisplayedText(targetText.substring(0, charIndex + 1));
      charIndex++;
      if (charIndex >= targetText.length) {
        clearInterval(timer);
        setIsTyping(false);
        if (!answered && msgIndex === currentMessageList.length - 1 && npc.type === 2) {
          setShowOptions(true);
        }
      }
    }, 40);

    return () => clearInterval(timer);
  }, [isActive, msgIndex, npc, answered, feedbackText]);

  const handleNext = () => {
    if (isTyping) {
      // Fast forward
      const targetText = answered ? feedbackText : currentMessageList[msgIndex];
      setDisplayedText(targetText);
      setIsTyping(false);
      if (!answered && msgIndex === currentMessageList.length - 1 && npc.type === 2) {
        setShowOptions(true);
      }
      return;
    }

    if (answered) {
      // Done with feedback, close
      onComplete();
      return;
    }

    if (msgIndex < currentMessageList.length - 1) {
      setMsgIndex(prev => prev + 1);
    } else {
      // Reached end of messages
      if (npc.type === 2) {
        // Wait for option selection
      } else if (npc.type === 3 && npc.quest) {
        // Add quest
        addTask({
          id: npc.quest.id,
          title: npc.quest.title,
          category: 'Side Quest',
          deadline: new Date(Date.now() + npc.quest.dueDateOffset).toISOString(),
          xpReward: 50,
          completed: false,
          locked: false
        });
        onComplete(true); // pass true for quest added
      } else {
        onComplete();
      }
    }
  };

  const handleOptionClick = (idx) => {
    if (!npc.question) return;
    setShowOptions(false);
    setAnswered(true);
    if (idx === npc.question.correctIndex) {
      setFeedbackText(npc.question.correctResponse);
      // Could give XP here
    } else {
      setFeedbackText(npc.question.wrongResponse);
    }
  };

  if (!isActive) return null;

  return (
    <div 
      className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-50 flex"
      onClick={handleNext}
      style={{
        background: 'rgba(30, 27, 24, 0.95)',
        border: '4px solid #b89b72',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 0 10px rgba(184, 155, 114, 0.2)',
        imageRendering: 'pixelated'
      }}
    >
      {/* Portrait Box */}
      <div 
        className="w-32 h-32 md:w-40 md:h-40 border-r-4 shrink-0 flex items-center justify-center relative bg-[#111]"
        style={{ borderColor: '#b89b72' }}
      >
        <div 
          style={{
            width: '80%', height: '80%',
            backgroundImage: `url('/npcs/${npc.sheet || 's01'}_transparent.png')`,
            backgroundSize: 'contain', 
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            imageRendering: 'pixelated'
          }}
        />
        {/* Name Plate */}
        <div 
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-4 py-1 text-white whitespace-nowrap text-sm md:text-base font-bold tracking-widest"
          style={{
            background: 'rgba(30, 27, 24, 1)',
            border: '2px solid #b89b72',
            color: '#e0cda5'
          }}
        >
          {npc.name}
        </div>
      </div>

      {/* Text Box */}
      <div className="flex-1 p-6 relative">
        <p className="text-lg md:text-xl text-[#f4e8d1] leading-relaxed select-none min-h-[4rem]">
          {displayedText}
          {isTyping && <span className="animate-pulse">_</span>}
        </p>

        {!isTyping && !showOptions && (
          <div className="absolute bottom-4 right-6 text-[#b89b72] animate-bounce">
            ▼
          </div>
        )}

        {/* Options UI */}
        {showOptions && (
          <div className="mt-4 flex flex-col gap-2 relative z-50">
            {npc.question?.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOptionClick(idx);
                }}
                className="text-left px-4 py-2 text-[#e0cda5] border border-[#b89b72]/30 hover:bg-[#b89b72]/20 hover:border-[#b89b72] transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DialogueBox;
