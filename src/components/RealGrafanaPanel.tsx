import React from 'react';
import { DraggablePanel } from './DraggablePanel';

export const RealGrafanaPanel: React.FC = () => {
  return (
    <DraggablePanel className="grafana-real-panel">
      <div 
        className="panel-header bg-darker" 
        style={{ cursor: 'move' }}
      >
        <span className="text-orange">📊</span>
        <span>real-time telemetry hub (cloud run grafana)</span>
        <span className="header-right text-red blink">● live_stream</span>
      </div>
      <div 
        className="panel-content" 
        style={{ padding: 0, height: '400px', width: '600px', backgroundColor: '#111217', overflow: 'hidden' }} 
      >
        <iframe 
          src="https://grafana-absurdist-336490534272.us-central1.run.app/d/absurdist-home?orgId=1&refresh=5s&v=3" 
          width="100%" 
          height="100%" 
          frameBorder="0"
          title="real grafana"
        ></iframe>
      </div>
    </DraggablePanel>
  );
};

