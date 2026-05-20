import React from 'react';

export const StupidGrafanaPanel: React.FC = () => {
  return (
    <div className="stupid-grafana-panel panel" style={{ width: '95vw', maxWidth: '1600px', margin: '0 auto' }}>
      <div className="panel-header bg-darker">
        <span className="text-purple">🌀</span>
        <span>absurdist stupid hub (maximum slop telemetry)</span>
        <span className="header-right text-purple blink">● unstable</span>
      </div>
      <div 
        className="panel-content" 
        style={{ padding: 0, height: '1200px', backgroundColor: '#111217' }} 
      >
        <iframe 
          src="https://grafana-absurdist-336490534272.us-central1.run.app/d/absurdist-stupid/absurdist-stupid-hub?orgId=1&refresh=5s&kiosk" 
          width="100%" 
          height="100%" 
          frameBorder="0"
          title="stupid grafana"
        ></iframe>
      </div>
    </div>
  );
};
