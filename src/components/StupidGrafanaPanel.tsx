import React from 'react';
import { DraggablePanel } from './DraggablePanel';
import { QuineCodeBlock } from './QuineCodeBlock';
import StupidGrafanaPanelRaw from './StupidGrafanaPanel.tsx?raw';

interface StupidGrafanaPanelProps {
  onClose?: () => void;
}

export const StupidGrafanaPanel: React.FC<StupidGrafanaPanelProps> = ({ onClose }) => {
  const sondheimSnippet = `export interface SondheimTelemetryConfig {
  dashboardUid: 'absurdist-stupid';
  composer: 'stephen_sondheim';
  vampSignature: '12/8_additive_ostinato';
  refreshIntervalSec: 5;
}

export function resolveSondheimStreamUrl(cfg: SondheimTelemetryConfig): string {
  const base = 'https://grafana-absurdist-336490534272.us-central1.run.app';
  return \`\${base}/d/\${cfg.dashboardUid}?orgId=1&refresh=\${cfg.refreshIntervalSec}s&v=3\`;
}`;

  return (
    <DraggablePanel
      id="stupid-hub-bottom"
      className="stupid-grafana-panel"
      onClose={onClose}
    >
      <div
        className="panel-header bg-darker"
        style={{ borderBottom: '2px solid #8a2be2', cursor: 'move' }}
      >
        <span className="text-purple">🌀</span>
        <span className="text-purple" style={{ fontWeight: 'bold' }}>
          ABSURDIST STUPID HUB V3 (SONDHEIM INSIDE)
        </span>
        <span className="header-right text-purple blink">● unstable_v3</span>
      </div>
      <div
        className="panel-content"
        style={{
          padding: 0,
          width: 'min(860px, 92vw)',
          backgroundColor: '#111217',
          maxHeight: '75vh',
        }}
      >
        <div style={{ height: 'min(480px, 55vh)', width: '100%' }}>
          <iframe
            src="https://grafana-absurdist-336490534272.us-central1.run.app/d/absurdist-stupid?orgId=1&refresh=5s&v=3"
            width="100%"
            height="100%"
            frameBorder="0"
            title="stupid grafana"
          ></iframe>
        </div>
        <div style={{ padding: '8px 10px' }}>
          <QuineCodeBlock
            summary={
              <>
                how_does_this_sondheim_
                <br />
                telemetry_hub_work.ts
              </>
            }
            snippet={sondheimSnippet}
            rawSource={StupidGrafanaPanelRaw}
            rawFilename="src/components/StupidGrafanaPanel.tsx"
            color="#8a2be2"
          />
        </div>
      </div>
    </DraggablePanel>
  );
};
