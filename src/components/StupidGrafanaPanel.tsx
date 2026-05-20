import React from 'react';
import { DraggablePanel } from './DraggablePanel';

export const StupidGrafanaPanel: React.FC = () => {
  return (
    <DraggablePanel className="stupid-grafana-panel">
      <div className="panel-header bg-darker" style={{ borderBottom: '2px solid #8a2be2', cursor: 'move' }}>
        <span className="text-purple">🌀</span>
        <span className="text-purple" style={{ fontWeight: 'bold' }}>ABSURDIST STUPID HUB V2 (MAXIMUM SLOP)</span>
        <span className="header-right text-purple blink">● unstable_v2</span>
      </div>
      <div 
        className="panel-content" 
        style={{ padding: 0, height: '600px', width: '900px', backgroundColor: '#111217' }} 
      >
        <iframe 
          src="https://grafana-absurdist-336490534272.us-central1.run.app/d/absurdist-stupid?orgId=1&refresh=5s&v=2" 
          width="100%" 
          height="100%" 
          frameBorder="0"
          title="stupid grafana"
        ></iframe>
      </div>
    </DraggablePanel>
  );
};
