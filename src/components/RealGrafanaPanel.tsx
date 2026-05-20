import React, { useRef } from 'react';
import { DraggablePanel } from './DraggablePanel';

export const RealGrafanaPanel: React.FC = () => {
  const lastSpikeRef = useRef<number>(0);

  const handleInteract = () => {
    const now = Date.now();
    if (now - lastSpikeRef.current > 100) {
      lastSpikeRef.current = now;
    }
  };

  return (
    <DraggablePanel 
      className="grafana-real-panel" 
      onDrag={handleInteract} 
      onDragStart={handleInteract}
    >
      <div 
        className="panel-header bg-darker" 
        onMouseMove={handleInteract} 
        onClick={handleInteract}
        style={{ cursor: 'move' }}
      >
        <span className="text-orange">📊</span>
        <span>REAL GRAFANA INSTANCE (CLOUD RUN)</span>
        <span className="header-right text-red blink">● LIVE</span>
      </div>
      <div 
        className="panel-content" 
        style={{ padding: 0, height: '400px', width: '600px', backgroundColor: '#111217' }} 
        onMouseMove={handleInteract}
        onClick={handleInteract}
      >
        <iframe 
          src="https://grafana-absurdist-336490534272.us-central1.run.app?orgId=1&kiosk=tv" 
          width="100%" 
          height="100%" 
          frameBorder="0"
          title="Real Grafana"
        ></iframe>
      </div>
    </DraggablePanel>
  );
};
