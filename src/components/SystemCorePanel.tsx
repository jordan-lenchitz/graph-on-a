import React, { useState, useEffect } from 'react';
import { DraggablePanel } from './DraggablePanel';

interface SystemCorePanelProps {
  vmStatus: 'offline' | 'online';
  systemName: string;
  maxDepth: number;
}

export const SystemCorePanel: React.FC<SystemCorePanelProps> = ({ vmStatus, systemName, maxDepth }) => {
  const [vmUptime, setVmUptime] = useState(0);
  const [vmCpu, setVmCpu] = useState('0.00');
  const [vmMem, setVmMem] = useState('67.1');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (vmStatus === 'online') {
      interval = setInterval(() => {
        setVmUptime(u => u + 1);
        setVmCpu((Math.random() * 0.4 + 0.1).toFixed(2));
        setVmMem((128 + Math.random() * 256).toFixed(1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [vmStatus]);

  return (
    <DraggablePanel className={`system-core-panel ${vmStatus === 'online' ? 'border-green' : ''}`}>
      <div className="panel-header">
        <span className={`dot ${vmStatus === 'online' ? 'green-dot' : 'red-dot'}`}></span>
        <span className={vmStatus === 'online' ? 'text-green' : 'text-red'}>{systemName}</span>
        <span className={`header-right ${vmStatus === 'online' ? 'text-green' : 'text-muted'}`}>{vmStatus}</span>
      </div>
      <div className="panel-content">
        <div className={`flex-between ${vmStatus === 'online' ? 'text-green' : 'text-red'}`}>
          <span>cpu_usage</span><span>{vmStatus === 'online' ? vmCpu : '0.00'} / {vmStatus === 'online' ? '1.0' : '0.0'} cores</span>
        </div>
        <div className={`progress-bar ${vmStatus === 'online' ? 'green-bar' : 'red-bar'}`}><div style={{width: `${(parseFloat(vmStatus === 'online' ? vmCpu : '0.05') / 1.0) * 100}%`}}></div></div>
        
        <div className={`flex-between mt-2 ${vmStatus === 'online' ? 'text-green' : 'text-red'}`}>
          <span>mem_load</span><span>{vmStatus === 'online' ? vmMem : '67.1'} / 512.0 mib</span>
        </div>
        <div className={`progress-bar ${vmStatus === 'online' ? 'green-bar' : 'red-bar'}`}><div style={{width: `${(parseFloat(vmStatus === 'online' ? vmMem : '67.1') / 512.0) * 100}%`}}></div></div>

        <div className={`grid-2-col mt-4 ${vmStatus === 'online' ? 'text-green' : 'text-red'}`}>
          <div>
            <div>uptime</div><div className={vmStatus === 'online' ? 'text-green' : 'text-muted'}>{vmStatus === 'online' ? vmUptime : '0'}s</div>
          </div>
          <div>
            <div>net_ip</div><div className={vmStatus === 'online' ? 'text-green' : 'text-muted'}>{vmStatus === 'online' ? '10.8.0.42' : '0.0.0.0'}</div>
          </div>
          <div className="mt-2">
            <div>cores (nproc)</div><div className={vmStatus === 'online' ? 'text-green' : 'text-muted'}>{vmStatus === 'online' ? '1.0' : '0.0'}</div>
          </div>
          <div className="mt-2">
            <div>ram (free -h)</div><div className={vmStatus === 'online' ? 'text-green' : 'text-muted'}>512mb</div>
          </div>
          <div className="mt-2">
            <div>recursion</div><div className={vmStatus === 'online' ? 'text-green' : 'text-muted'}>{maxDepth}/15</div>
          </div>
          <div className="mt-2">
            <div>region</div><div className={vmStatus === 'online' ? 'text-green' : 'text-muted'}>us-central1-gen2</div>
          </div>
        </div>

        <details className={`mt-2 text-small p-2 ${vmStatus === 'online' ? 'border-green-dashed text-green' : 'border-red-dashed text-red'}`} style={{ border: `1px dashed ${vmStatus === 'online' ? '#00ff00' : '#ff0000'}`, marginTop: '10px' }}>
          <summary style={{ cursor: 'pointer', opacity: 0.8 }}>how_does_this_virtual_<br/>machine_orchestrator_work.ts</summary>
          <pre style={{ wordBreak: 'break-all', fontSize: '0.8em', marginTop: '10px', color: vmStatus === 'online' ? '#00ff00' : '#ff0000', background: '#000', padding: '10px', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
{`import { ChildProcess, spawn } from 'child_process';

interface VMConfig {
  id: string;
  memoryMb: number;
  cores: number;
  image: string;
}

export class VMOrchestrator {
  private activeVMs = new Map<string, ChildProcess>();

  async bootVM(config: VMConfig): Promise<string> {
    const args = [
      '--memory', \`\${config.memoryMb}M\`,
      '--smp', \`\${config.cores}\`,
      '--drive', \`file=\${config.image},format=raw\`,
      '--nographic'
    ];

    const process = spawn('qemu-system-x86_64', args);
    this.activeVMs.set(config.id, process);

    return new Promise((resolve, reject) => {
      process.stdout?.on('data', (data) => {
        if (data.toString().includes('login:')) {
          resolve('10.8.0.42');
        }
      });
      process.on('error', reject);
    });
  }

  async shutdownVM(id: string): Promise<void> {
    const process = this.activeVMs.get(id);
    if (process) {
      process.kill('SIGTERM');
      this.activeVMs.delete(id);
    }
  }
}`}
          </pre>
        </details>

        <div className="text-muted text-right text-small mt-2">docker_vms_orchestrator_v2.1 // slopn't</div>
      </div>
    </DraggablePanel>
  );
};
