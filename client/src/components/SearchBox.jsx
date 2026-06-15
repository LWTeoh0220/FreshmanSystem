import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import * as OpenCC from 'opencc-js';

// Setup converter from Simplified to Traditional
const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });

export default function SearchBox({ trie, invertedIndex, processMap, onSelectProcess }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (query.trim().length > 0) {
      // Convert user input to Traditional Chinese for internal engine matching
      const normalizedQuery = converter(query);
      
      // 1. Get raw suggestions from Trie
      const trieResults = trie.startsWith(normalizedQuery);
      
      // 2. We also check Cultural Inverted Index
      const culturalMatches = invertedIndex.search(normalizedQuery);
      
      // Combine results intelligently
      let combined = [];
      trieResults.forEach(res => {
        combined.push({ 
          label: res.word, 
          processId: res.processId, 
          type: 'standard',
          processTitle: processMap[res.processId]?.title
        });
      });
      
      culturalMatches.forEach(pid => {
        if (!combined.some(c => c.processId === pid)) {
          combined.push({ 
            label: `文化翻譯匹配: "${normalizedQuery}" -> ${processMap[pid]?.title}`, 
            processId: pid, 
            type: 'cultural', 
            originalTerm: normalizedQuery,
            processTitle: processMap[pid]?.title
          });
        }
      });
      
      setSuggestions(combined);
    } else {
      setSuggestions([]);
    }
  }, [query, trie, invertedIndex, processMap]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-3xl mx-auto z-50">
      <div className={`flex items-center glass rounded-2xl p-4 transition-all duration-300 ${isFocused ? 'ring-4 ring-[#007aff]/30 shadow-2xl' : 'shadow-sm'}`}>
        <Search className="text-[#86868b] mr-3" size={28} />
        <input 
          type="text" 
          className="bg-transparent w-full text-xl text-[#1d1d1f] outline-none placeholder-[#86868b]"
          placeholder="【快速傳送門】搜尋流程 (支援簡繁體) 例如: 戶口, 選課, IC..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />
      </div>
      
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 glass rounded-2xl overflow-hidden animate-fade-in-up shadow-2xl">
          {suggestions.map((item, idx) => (
            <div 
              key={idx} 
              className="p-4 hover:bg-black/5 cursor-pointer flex items-center justify-between border-b border-black/5 last:border-0 transition-colors"
              onClick={() => {
                onSelectProcess(item.processId);
                setIsFocused(false);
                setQuery('');
              }}
            >
              <div className="flex flex-col">
                <span className="text-[#1d1d1f] text-lg font-medium">{item.label}</span>
                {item.type === 'cultural' && (
                  <span className="text-[#34c759] text-sm mt-1">✓ Hash Map O(1) 意圖映射成功</span>
                )}
                {item.type === 'standard' && (
                  <span className="text-[#007aff] text-sm mt-1">↳ Trie 自動補完 O(k)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
