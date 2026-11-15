import React, { useState, useEffect } from 'react';
import { DraggablePanel } from './DraggablePanel';
import { QuineCodeBlock } from './QuineCodeBlock';
import SystemCorePanelRaw from './SystemCorePanel.tsx?raw';

export interface SystemCorePanelProps {
  vmStatus: 'offline' | 'online';
  systemName: string;
  maxDepth: number;
  vmIp?: string;
  vmGateway?: string | null;
  vmStage?: string;
  vmCores?: string | null;
  vmRam?: string | null;
  region?: string;
}

export const SystemCorePanel: React.FC<SystemCorePanelProps> = ({
  vmStatus,
  systemName,
  maxDepth,
  vmIp = '0.0.0.0',
  vmGateway = null,
  vmStage = 'offline',
  vmCores = null,
  vmRam = null,
  region = 'us-central1-gen2',
}) => {
  const [vmUptime, setVmUptime] = useState(0);

  useEffect(() => {
    if (vmStatus !== 'online') return;
    const interval = setInterval(() => {
      setVmUptime((u) => u + 1);
    }, 1000);
    return () => {
      clearInterval(interval);
      setVmUptime(0);
    };
  }, [vmStatus]);

  const displayedIp = vmStatus === 'online' ? vmIp : '0.0.0.0';
  const displayedCores = vmStatus === 'online' ? (vmCores ?? '...') : '0';
  const displayedRam = vmStatus === 'online' ? (vmRam ?? '...') : '0mb';
  const normalizedRegion =
    region && region !== 'loading...' && region !== 'local'
      ? region
      : 'us-central1-gen2';

  const orchestratorSnippet = `// live_state: host="${systemName}" | status="${vmStatus}" | stage="${vmStage}"
// net_ip="${displayedIp}"${vmGateway ? ` (gw: ${vmGateway})` : ''} | cores="${displayedCores}" | ram="${displayedRam}" | region="${normalizedRegion}"

export interface WasmVmTelemetry {
  type: 'wasm-vm-telemetry';
  stage?: 'kernel_boot' | 'dhcp_discover' | 'dhcp_select' | 'online' | 'apk_init';
  ip?: string;
  gateway?: string | null;
  leaseTime?: number | null;
  cores?: number;
  ram?: string;
}

export function attachV86SerialDhcpBridge(emulator: any): void {
  let lineBuf = '';
  const leaseRe = /udhcpc:\\s*lease of\\s+(\\d+\\.\\d+\\.\\d+\\.\\d+)\\s+obtained(?: from\\s+(\\d+\\.\\d+\\.\\d+\\.\\d+))?/i;

  emulator.add_listener('serial0-output-byte', (byte: number) => {
    const ch = String.fromCharCode(byte);
    if (ch === '\\n' || ch === '\\r') {
      const m = lineBuf.match(leaseRe);
      if (m) {
        window.parent.postMessage({
          type: 'wasm-vm-telemetry',
          stage: 'online',
          ip: m[1],
          gateway: m[2] ?? null,
        } satisfies WasmVmTelemetry, '*');
      }
      lineBuf = '';
    } else {
      lineBuf += ch;
    }
  });
}`;

  return (
    <DraggablePanel className={`system-core-panel ${vmStatus === 'online' ? 'border-green' : ''}`}>
      <div className="panel-header">
        <span className={`dot ${vmStatus === 'online' ? 'green-dot' : 'red-dot'}`}></span>
        <span className={vmStatus === 'online' ? 'text-green' : 'text-red'}>{systemName}</span>
        <span className={`header-right ${vmStatus === 'online' ? 'text-green' : 'text-muted'}`}>
          {vmStatus === 'online' && vmStage !== 'online' ? vmStage : vmStatus}
        </span>
      </div>
      <div className="panel-content">
        <div className={`grid-2-col ${vmStatus === 'online' ? 'text-green' : 'text-red'}`}>
          <div>
            <div>uptime</div>
            <div className={vmStatus === 'online' ? 'text-green' : 'text-muted'}>
              {vmStatus === 'online' ? vmUptime : '0'}s
            </div>
          </div>
          <div>
            <div>net_ip</div>
            <div
              className={vmStatus === 'online' ? 'text-green' : 'text-muted'}
              title={vmGateway ? `gateway: ${vmGateway}` : undefined}
            >
              {displayedIp}
            </div>
          </div>
          <div className="mt-2">
            <div>cores (nproc)</div>
            <div className={vmStatus === 'online' ? 'text-green' : 'text-muted'}>
              {displayedCores}
            </div>
          </div>
          <div className="mt-2">
            <div>ram (free -h)</div>
            <div
              className={vmStatus === 'online' ? 'text-green' : 'text-muted'}
              style={{ textTransform: 'none' }}
            >
              {displayedRam}
            </div>
          </div>
          <div className="mt-2">
            <div>recursion</div>
            <div className={vmStatus === 'online' ? 'text-green' : 'text-muted'}>{maxDepth}/15</div>
          </div>
          <div className="mt-2">
            <div>region</div>
            <div className={vmStatus === 'online' ? 'text-green' : 'text-muted'}>
              {normalizedRegion}
            </div>
          </div>
        </div>

        <QuineCodeBlock
          summary={
            <>
              how_does_this_virtual_
              <br />
              machine_orchestrator_work.ts
            </>
          }
          snippet={orchestratorSnippet}
          rawSource={SystemCorePanelRaw}
          rawFilename="src/components/SystemCorePanel.tsx"
          color={vmStatus === 'online' ? '#00ff00' : '#ff0000'}
        />

        <div className="text-muted text-right text-small mt-2">
          v86_wasm_orchestrator_v2.2 // slopn't
        </div>
      </div>
    </DraggablePanel>
  );
};
