import React, { useState, useEffect, useRef } from 'react';
import { WasmVM } from './WasmVM';
import './CloudShell.css';

interface CloudShellProps {
  onClose: () => void;
  onSlopChange?: (speed: number) => void;
  onVmStart?: () => void;
  onShowOsi?: () => void;
  onShowOpenStack?: () => void;
}

type CommandHandler = (args: string[], print: (content: React.ReactNode) => void, finish: () => void) => void | Promise<void>;

export const CloudShell: React.FC<CloudShellProps> = ({ onClose, onSlopChange, onVmStart, onShowOsi, onShowOpenStack }) => {
  const [history, setHistory] = useState<(React.ReactNode)[]>([
    'welcome to the jordan lenchitz cloud shell.',
    '---------------------------------------------------------------------------------',
    'initializing quantum hyper-threading (14/14 cores online)...',
    'bypassing the mainframe using html and sheer willpower...',
    'loading recursive slop modules....................... [ok]',
    'warning: cowardly button containment breached.',
    'downloading more ram... 100% complete. (you now have 512 pb)',
    'reticulating splines...',
    'provisioning 10,000 serverless servers (actually just a guy named dave)... [done]',
    'establishing connection to the osi layer 7 "silly wholesome stupid" protocol...',
    '---------------------------------------------------------------------------------',
    'type "help" to summon the void and "exit" to return to it.',
    'provisioning 10000% real production environment...',
  ]);
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [shellHeight, setShellHeight] = useState(67);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputRef.current && !isExecuting) inputRef.current.focus();
  }, [isExecuting]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = shellHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = startY - moveEvent.clientY;
      const deltaVh = (deltaY / window.innerHeight) * 100;
      setShellHeight(Math.max(10, Math.min(100, startHeight + deltaVh)));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const print = (content: React.ReactNode) => {
    setHistory(prev => [...prev, content]);
  };

  const commands: Record<string, CommandHandler> = {
    help: (_args, print, finish) => {
      print([
        'available commands:',
        '  slop_hop         - emergency jump to the deep-scroll stupid hub.',
        '  battle_pass      - check your current season progress (greg approved).',
        '  osi              - spawn the colorful 7-layer osi absurdity panel.',
        '  telemetry        - spawn the openstack cluster telemetry debug window.',
        '  ydb              - provision an ephemeral ydb container (wasm).',
        '  gt.m             - provision an ephemeral gt.m container (wasm).',
        '  horse            - initialize the equine categorization engine (100% urine free).',
        '  slopctl          - tune the recursive slop engine collision physics.',
        '  quota_smash      - maximize gcp billing via recursive serverless invocations.',
        '  osi_panic        - simulate bgp route flapping directly in the virtual dom.',
        '  tritone_sub      - calculate the optimal chromatic tritone substitution vamp.',
        '  kernel_leak      - drain browser memory directly into the console for no reason.',
        '  cloud_seed       - initialize a weather-based load balancer.',
        '  neural_slop      - fine-tune a 1-parameter llm on current page rotation.',
        '  garbage_collect  - manually sweep the recursive layers for loose bits.',
        '  void_ping        - send an icmp packet to a non-existent dimension.',
        '  entropy_sync     - synchronize jitter with the cosmic microwave background.',
        '  root_access      - gain full administrative privileges over a virtual toaster.'
      ].map((line, i) => <div key={i}>{line}</div>));
      finish();
    },
    clear: () => {
      setHistory([]);
    },
    exit: () => {
      onClose();
    },
    battle_pass: async (_args, print, finish) => {
      print('=== ⚡ SMASH-MON BATTLE PASS: SEASON 1 (NINTENDO SLOP) ⚡ ===');
      await new Promise(r => setTimeout(r, 400));
      print('tier 1  [██████████] 100% - UNLOCKED: "pikachu_main" title');
      print('tier 2  [██████████] 100% - UNLOCKED: holographic mew-two stock option');
      print('tier 3  [██████████] 100% - UNLOCKED: master ball (contains a guy named dave)');
      await new Promise(r => setTimeout(r, 400));
      print('tier 4  [██████████] 100% - UNLOCKED: kirby-flavored recursive slop');
      print('tier 5  [██████░░░░] 60%  - IN PROGRESS: mario\'s browser history (redacted)');
      print('tier 6  [░░░░░░░░░░] 0%   - LOCKED: "missing_no" golden skin');
      await new Promise(r => setTimeout(r, 600));
      print(<div className="text-yellow" style={{ fontWeight: 'bold' }}>ULTIMATE REWARD (LEVEL 100): a direct invite to smash bros (but you only play as a cloud run instance)</div>);
      print('---------------------------------------------------------');
      print('catch \'em all or smash \'em all for $0.00.');
      finish();
    },
    osi: async (_args, print, finish) => {
      print('[osi] initializing silly wholesome stupid protocol...');
      await new Promise(r => setTimeout(r, 600));
      if (onShowOsi) onShowOsi();
      print(<div className="text-purple">success: osi absurdity panel spawned at viewport coordinates (20, 100).</div>);
      finish();
    },
    telemetry: async (_args, print, finish) => {
      print('[telemetry] connecting to node-01 clusters...');
      await new Promise(r => setTimeout(r, 800));
      if (onShowOpenStack) onShowOpenStack();
      print(<div className="text-green">success: openstack telemetry window spawned at (20, 450).</div>);
      finish();
    },
    slop_hop: async (_args, print, finish) => {
      print('[slop_hop] initiating high-velocity vertical descent...');
      await new Promise(r => setTimeout(r, 400));
      const el = document.getElementById('stupid-hub-bottom');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        print(<div className="text-green">success: target acquired. descending to 320vh.</div>);
      } else {
        print(<div className="text-red">error: stupid hub not found in dom. retrying...</div>);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
      finish();
    },
    ydb: async (_args, print, finish) => {
      print('booting v86 x86-to-wasm jit engine...');
      if (onVmStart) onVmStart();
      await new Promise(r => setTimeout(r, 800));
      print('provisioning ephemeral yottadb/gt.m container...');
      await new Promise(r => setTimeout(r, 1200));
      print(<div className="text-green">success: environment attached. entering wasm vm...</div>);
      print(<WasmVM imagePath="/ydb-image.ext2" />);
      finish();
    },

    quota_smash: async (_args, print, finish) => {
      print('[quota smash] initializing architecture expansion...');
      await new Promise(r => setTimeout(r, 500));
      print('[quota smash] deployment target: global (32 regions)');
      const regions = ['us-central1', 'europe-west1', 'asia-east1', 'australia-southeast1', 'southamerica-east1'];
      for (const r of regions) {
        await new Promise(res => setTimeout(res, 200));
        print(`[quota smash] region: ${r} -> tier: enterprise plus (smashing quota...)`);
      }
      print('[quota smash] load balancer: global premium (anycast ipv6/ipv4 enabled)');
      print('[quota smash] serverless: 10,000 concurrent invocations per region.');
      print('[quota smash] db: spanner (enterprise plus, 100 nodes per region).');
      await new Promise(r => setTimeout(r, 800));
      print(<div className="text-purple" style={{ fontWeight: 'bold' }}>theoretical maximum burn: $4,294,967,296.00 / month.</div>);
      print(<div className="text-green">compliance status: 100% redundant. 100% absurd.</div>);
      finish();
    },
    tritone_sub: async (_args, print, finish) => {
      const timestamp = Date.now();
      print(`[tritone] calculating chromatic substitution for timestamp: ${timestamp}...`);
      await new Promise(r => setTimeout(r, 600));
      print('[tritone] root: c -> sub: gb (tritone proximity: 0.0000)');
      print('[tritone] recursive grid: [c, db, d, eb, e, f, gb, g, ab, a, bb, b]');
      print('[tritone] applying section grid (palindromic hierarchical)...');
      await new Promise(r => setTimeout(r, 400));
      print(<div className="text-cyan">
        vamp result:<br/>
        &nbsp;&nbsp;section a: cmaj7 | gb7 | fmaj7 | b7<br/>
        &nbsp;&nbsp;section b: bbmaj7 | e7 | ebmaj7 | a7<br/>
        &nbsp;&nbsp;section c: dmaj7 | ab7 | gmaj7 | db7
      </div>);
      print('[tritone] voice-leading: chromatic descent established.');
      print('[tritone] rationale: dominant 7th tritone substitution creates smooth leading to the next diatonic target.');
      finish();
    },
    slopctl: (args, print, finish) => {
      const speed = parseFloat(args[0]);
      if (isNaN(speed)) {
        print('usage: slopctl <speed_in_seconds>');
        print('current slop collision physics tuned to 15s/rotation.');
      } else {
        if (onSlopChange) onSlopChange(speed);
        print(`[slop] collision physics re-tuned to ${speed}s. recursion stability: nominal.`);
      }
      finish();
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isExecuting) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      const fullCmd = input.trim().toLowerCase();
      if (!fullCmd) return;

      // Add to command history
      setCommandHistory(prev => [fullCmd, ...prev]);
      setHistoryIndex(-1);

      const [cmdName, ...args] = fullCmd.split(' ');
      setHistory(prev => [...prev, <div key={Date.now()}><span className="prompt">website_visitor@cloudshell:~$ </span>{fullCmd}</div>]);
      setInput('');

      const handler = commands[cmdName];
      if (handler) {
        if (cmdName !== 'clear') {
          setIsExecuting(true);
          await handler(args, print, () => setIsExecuting(false));
        } else {
          handler(args, print, () => {});
        }
      } else {
        print(`bash: ${cmdName}: command not found`);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };



  return (
    <div className="cloud-shell-container" style={{ height: `${shellHeight}vh` }}>
      <div 
        className="cloud-shell-resizer" 
        onMouseDown={handleMouseDown}
      />
      <div className="cloud-shell-header">
        <span>jordan lenchitz cloud shell - https://jordanlenchitz.xyz</span>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      <div className="cloud-shell-body" onClick={() => !isExecuting && inputRef.current?.focus()}>
        {history.map((line, i) => (
          <div key={i}>{typeof line === 'string' ? <div>{line}</div> : line}</div>
        ))}
        {!isExecuting && (
          <div className="input-line">
            <span className="prompt">website_visitor@cloudshell:~$ </span>
            <input 
              ref={inputRef}
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoFocus
            />
          </div>
        )}
        {isExecuting && <div className="cursor-blink">█</div>}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
