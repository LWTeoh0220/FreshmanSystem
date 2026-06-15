import React, { useEffect, useRef } from 'react';
import CampusMap from '../components/campus/CampusMap';
import ErrorBoundary from '../components/ErrorBoundary';

export default function CampusMapPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Focus the canvas when the page is loaded so keyboard works immediately
    setTimeout(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) canvas.focus();
    }, 100);
  }, []);

  return (
    <div ref={containerRef} className="animate-fade-in-up flex flex-col w-full flex-1 h-full overflow-hidden relative group/page">
      <div className="flex-1 w-full h-full flex items-center justify-center transition-all duration-500">
        <ErrorBoundary>
          <CampusMap />
        </ErrorBoundary>
      </div>
    </div>
  );
}
