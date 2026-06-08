import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

import { PlayerProvider, usePlayer } from './contexts/PlayerContext';
import Layout from './pages/Layout';
import MilestoneProgressBar from './components/MilestoneProgressBar';
import GuildIntelBoard from './components/GuildIntelBoard';
import DeadlineDashboard from './components/DeadlineDashboard';
import QuestTreeViewer from './components/QuestTreeViewer';
import AchievementWall from './components/AchievementWall';
import AdventurersLog from './components/AdventurersLog';
import GuildShop from './components/GuildShop';
import CampusMapPage from './pages/CampusMapPage';

import { SearchTrie } from './utils/SearchTrie';
import { CulturalInvertedIndex } from './utils/CulturalInvertedIndex';
import { DeadlineHeap } from './utils/DeadlineHeap';
import { ProcessGraph } from './utils/ProcessGraph';
import { culturalMappings, processGraphsData, initialDeadlines } from './data/mockData';

// Wrapper component to handle routing logic inside BrowserRouter
function AppContent() {
  const navigate = useNavigate();
  const { addReward, isFirstClear, markFirstClear } = usePlayer();
  const [activeProcessId, setActiveProcessId] = useState('main_quest'); // Default to main quest
  const [rebalanceTrigger, setRebalanceTrigger] = useState(0);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const [completedNodes, setCompletedNodes] = useState([]);
  
  // Memoize data structures so they are only built once and persist
  const { trie, invertedIndex, heap, graphs, processMap } = useMemo(() => {
    const trie = new SearchTrie();
    const invertedIndex = new CulturalInvertedIndex();
    const heap = new DeadlineHeap();
    const graphs = new Map();
    const processMap = {};

    Object.values(processGraphsData).forEach(data => {
      const graph = new ProcessGraph();
      data.nodes.forEach(n => graph.addNode(n.id, n));
      (data.edges || []).forEach(e => graph.addEdge(e.from, e.to));
      graph.initializeStatuses();
      graphs.set(data.id, { title: data.title, type: data.type, graph });
      processMap[data.id] = { title: data.title, type: data.type };
      
      trie.insert(data.title, data.id);
      const words = data.title.split(/[\s()]+/);
      words.forEach(w => { if(w.length > 1) trie.insert(w, data.id) });
    });

    culturalMappings.forEach(mapping => {
      invertedIndex.addMapping(mapping.term, mapping.processId);
      trie.insert(mapping.term, mapping.processId);
    });

    initialDeadlines.forEach(dl => heap.insert(dl));

    return { trie, invertedIndex, heap, graphs, processMap };
  }, []);

  const handleSelectProcess = (processId) => {
    setActiveProcessId(processId);
    navigate('/tasks'); // Auto-navigate to tasks page
  };

  // Cross-Graph Logic: Sync sub-process completion with main_quest macro nodes
  const syncMacroNode = (subProcessId) => {
    if (subProcessId === 'main_quest') return;
    
    const mainGraph = graphs.get('main_quest')?.graph;
    const subGraph = graphs.get(subProcessId)?.graph;
    if (!mainGraph || !subGraph) return;
    
    // Find macro node pointing to this subprocess
    const macroNode = mainGraph.getNodes().find(n => n.targetProcessId === subProcessId);
    if (!macroNode) return;

    // Check if ALL nodes in the sub-process are completed
    const allCompleted = subGraph.getNodes().every(n => n.status === 'completed');
    
    if (allCompleted && macroNode.status === 'available') {
      mainGraph.completeNode(macroNode.id);
    } else if (!allCompleted && macroNode.status === 'completed') {
      mainGraph.undoNode(macroNode.id);
    }
  };

  const handleCompleteNode = (nodeId) => {
    if (!activeProcessId) return;
    const { graph } = graphs.get(activeProcessId);
    const nodeData = graph.nodes.get(nodeId);
    
    if (graph.completeNode(nodeId)) {
      setRenderTrigger(prev => prev + 1);
      
      // Check First Clear logic to prevent reward exploiting
      if (isFirstClear(nodeId)) {
        addReward(35, 500, 10); // +10 MP
        markFirstClear(nodeId);
      }


      // Add to achievements ONLY if it's a milestone
      if (nodeData.isMilestone) {
        setCompletedNodes(prev => {
          if (!prev.find(n => n.id === nodeId)) {
            return [...prev, { 
              id: nodeId, 
              title: nodeData.title, 
              processId: activeProcessId, 
              date: new Date(),
              achievementIcon: nodeData.achievementIcon,
              achievementName: nodeData.achievementName
            }];
          }
          return prev;
        });
      }
      
      syncMacroNode(activeProcessId);
    }
  };

  const handleUndoNode = (nodeId) => {
    if (!activeProcessId) return;
    const { graph } = graphs.get(activeProcessId);
    
    if (graph.undoNode(nodeId)) {
      setRenderTrigger(prev => prev + 1);
      // Remove from achievements
      setCompletedNodes(prev => prev.filter(n => n.id !== nodeId));
      
      syncMacroNode(activeProcessId);
    }
  };

  const handleDrillDown = (targetProcessId) => {
    if (targetProcessId) {
      setActiveProcessId(targetProcessId);
    }
  };

  const handleBackToMainQuest = () => {
    setActiveProcessId('main_quest');
  };

  const handleAddEmergencyDeadline = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); 
    heap.insert({
      id: `dl_emergency_${Date.now()}`,
      title: "【突發事件】補交文件",
      deadlineDate: today.toISOString(),
      priority: "high",
      processId: "arc_process"
    });
    setRebalanceTrigger(prev => prev + 1);
  };

  const graphEntry = activeProcessId ? graphs.get(activeProcessId) : null;
  const currentGraphData = graphEntry ? {
    id: activeProcessId,
    title: graphEntry.title,
    type: graphEntry.type,
    // Deep clone nodes so React re-renders properly on state change
    nodes: graphEntry.graph.getNodes().map(n => ({...n})),
    edges: graphEntry.graph.getEdges()
  } : null;

  const mainQuestEntry = graphs.get('main_quest');
  const mainQuestNodes = mainQuestEntry ? mainQuestEntry.graph.getNodes().map(n => ({...n})) : [];

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Home Page: Search + Deadlines */}
        <Route index element={
          <div className="space-y-12 animate-fade-in-up">
            <header className="text-center mt-10 mb-16">
              <h1 className="text-5xl font-black tracking-tight text-[#4a3b32] mb-4 drop-shadow-md">
                MY-NTUT <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8b5a2b] to-[#d2b48c]">Quest</span>
              </h1>
              <p className="text-xl text-[#7a6350] font-bold">大馬新生跨國生存與破關導航系統</p>
            </header>
            <div className="mt-8 px-4 w-full">
              <MilestoneProgressBar onSelectProcess={handleSelectProcess} nodes={mainQuestNodes} />
            </div>
            
            <div className="max-w-[1200px] mx-auto mt-16 px-4 flex flex-col lg:flex-row gap-8 items-stretch pb-20 lg:h-[650px]">
              <div className="w-full lg:w-[55%] flex h-[550px] lg:h-full">
                <GuildIntelBoard />
              </div>
              <div className="w-full lg:w-[45%] flex h-[550px] lg:h-full">
                <DeadlineDashboard 
                  heap={heap} 
                  onAddDeadline={handleAddEmergencyDeadline}
                  triggerRebalance={rebalanceTrigger}
                />
              </div>
            </div>
          </div>
        } />
        
        {/* Tasks Page */}
        <Route path="tasks" element={
          <div className="animate-fade-in-up h-full">
            <QuestTreeViewer 
              graphData={currentGraphData} 
              onCompleteNode={handleCompleteNode}
              onUndoNode={handleUndoNode}
              onDrillDown={handleDrillDown}
              onBack={handleBackToMainQuest}
              renderTrigger={renderTrigger}
            />
          </div>
        } />
        
        {/* Achievements Page */}
        <Route path="achievements" element={
          <div className="animate-fade-in-up">
            <AchievementWall completedNodes={completedNodes} processMap={processMap} />
          </div>
        } />
        
        {/* Adventurer's Log Page */}
        <Route path="adventurers-log" element={
          <div className="animate-fade-in-up h-full">
            <AdventurersLog />
          </div>
        } />

        {/* Guild Shop Page */}
        <Route path="shop" element={
          <div className="animate-fade-in-up h-full">
            <GuildShop />
          </div>
        } />

        {/* 2D Campus Page */}
        <Route path="campus" element={<CampusMapPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </PlayerProvider>
  );
}
