import React, { useEffect } from 'react';
import CampusMap from '../components/campus/CampusMap';
import ErrorBoundary from '../components/ErrorBoundary';

export default function CampusMapPage() {
  useEffect(() => {
    // Focus the canvas when page loads for immediate keyboard control
    setTimeout(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) canvas.focus();
    }, 100);
  }, []);

  return (
    <div className="animate-fade-in-up flex flex-col h-full w-full max-w-[1200px] mx-auto pb-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-black text-[#4a3b32] drop-shadow-sm flex items-center">
            <span className="mr-3 text-4xl">🗺️</span> 2D 像素校園
          </h2>
          <p className="text-[#7a6350] font-bold mt-2 ml-1">
            探索北科大校園，尋找隱藏的 NPC 與挑戰！
          </p>
        </div>
      </div>
      
      <div className="flex-1 w-full flex items-center justify-center">
        <ErrorBoundary>
          <CampusMap />
        </ErrorBoundary>
      </div>
    </div>
  );
}
