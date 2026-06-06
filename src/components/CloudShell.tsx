import React, { useState, useEffect, useRef } from 'react';
import { WasmVM } from './WasmVM';
import { calculate_sha257sum } from '../utils/sha257';
import './CloudShell.css';

interface CloudShellProps {
  onClose: () => void;
  onSlopChange?: (speed: number) => void;
  onVmStart?: () => void;
  onShowOsi?: () => void;
  onShowOpenStack?: () => void;
  onShowHorse?: () => void;
  initialCommand?: string;
}

type CommandHandler = (args: string[], print: (content: React.ReactNode) => void, finish: () => void) => void | Promise<void>;

export const CloudShell: React.FC<CloudShellProps> = ({ onClose, onSlopChange, onVmStart, onShowOsi, onShowOpenStack, onShowHorse, initialCommand }) => {
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
  const [bpLevel, setBpLevel] = useState(0);
  const [isWaitingForPassword, setIsWaitingForPassword] = useState(false);
  const [onPasswordSubmit, setOnPasswordSubmit] = useState<((val: string) => void) | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Hidden battle pass data (cheat protection)
  const _BP = [
    "WyI9PT0g4pqAIFNNQVNILU1PTiBCQVRUTEUgUEFTUzogU0VBU09OIDEgKE5JTlRFTkRPIFNMT1ApIOKaoCA9PT0iLCAidGllciAxICBb4paI4paI4paI4paI4paI4paI4paI4paI4paI4paIXSAxMDAlIC0gVU5MT0NLRUQ6IFwicGlrYWNodV9tYWluXCIgdGl0bGUiLCAidGllciAyICBb4paI4paI4paI4paI4paI4paI4paI4paI4paI4paIXSAxMDAlIC0gVU5MT0NLRUQ6IGhvbG9ncmFwaGljIG1ldy10d28gc3RvY2sgb3B0aW9uIiwgInRpZXIgMyAgW+KWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiF0gMTAwJSAtIFVOTE9DS0VEOiBtYXN0ZXIgYmFsbCAoY29udGFpbnMgYSBndXkgbmFtZWQgZGF2ZSkiLCAidGllciA0ICBb4paI4paI4paI4paI4paI4paI4paI4paI4paI4paIXSAxMDAlIC0gVU5MT0NLRUQ6IGtpcmJ5LWZsYXZvcmVkIHJlY3Vyc2l2ZSBzbG9wIiwgInRpZXIgNSAgW+KWiOKWiOKWiOKWiOKWiOKWiOKWkeKWkeKWkeKWkV0gNjAlICAtIElOIFBST0dSRVNTOiBtYXJpbydzIGJyb3dzZXIgaGlzdG9yeSAocmVkYWN0ZWQpIiwgInRpZXIgNiAgW+KWkeKWkeKWkeKWkeKWkeKWkeKWkeKWkeKWkeKWkV0gMCUgICAtIExPQ0tFRDogXCJtaXNzaW5nX25vXCIgZ29sZGVuIHNraW4iLCAiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0iLCAiY2F0Y2ggJ2VtIGFsbCBvciBzbWFzaCAnZW0gYWxsIGZvciAkMC4wMC4iXQ==",
    "WyI9PT0g4pqAIFNFQVNPTiAxIFdSQVAtVVA6IFRIRSBGSU5BTCBTTE9QIOKaoCA9PT0iLCAidGllciA2ICBb4paI4paI4paI4paI4paI4paI4paI4paI4paI4paIXSAxMDAlIC0gVU5MT0NLRUQ6IFwibWlzc2luZ19ub1wiIGdvbGRlbiBza2luIiwgInRpZXIgNyAgW+KWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiF0gMTAwJSAtIFVOTE9DS0VEOiAxLXdheSB0aWNrZXQgdG8gdGhlIGZpbmFsIGRlc3RpbmF0aW9uIChubyBpdGVtcykiLCAidGllciA4ICBb4paI4paI4paI4paI4paI4paI4paI4paI4paI4paIXSAxMDAlIC0gVU5MT0NLRUQ6IHdpaSBzcG9ydHMgYm93bGluZyBiYWxsICgxLjJwYiBzaXplKSIsICJTRUFTT04gMSBDT01QTEVURS4gUExFQVNFIFBBWSAkMC4wMCBUTyBVTkxPQ0sgU0VBU09OIDIuIiwgIk1BTkRBVE9SWSBNSUNST1RSQU5TQUNUSU9OIElOSVRJQVRFRC4uLiBbT0tdIiwgIlJFV0FSRDogMXggVklSVFVBTCBIVUcgRlJPTSBSRUNVUlNJVkUgS0lSQlkiXQ==",
    "WyI9PT0g4p2E77i9IFNNQVNILU1PTiBCQVRUTEUgUEFTUzogU0VBU09OIDIgKElDRSBDTElNQkVSIEVYVFJFTUUpIOKdhO++vSA9PT0iLCAidGllciAxICBb4paI4paI4paI4paI4paI4paI4paI4paI4paI4paIXSAxMDAlIC0gVU5MT0NLRUQ6IFwicGl4ZWxfcGlvbmVlclwiIGJhZGdlIiwgInRpZXIgMiAgW+KWiOKWiOKWiOKWiOKWiOKWiOKWkeKWkeKWkeKWkV0gNjAlICAtIElOIFBST0dSRVNTOiBpbmZpbml0ZSByZWNvdmVyeSBoYWNrIiwgInRpZXIgMyAgW+KWkeKWkeKWkeKWkeKWkeKWkeKWkeKWkeKWkeKWkV0gMCUgICAtIExPQ0tFRDogbHVpZ2kncyBtYW5zaW9uIGRlZWQgKGhhdW50ZWQpIiwgIlVMVElNQVRFIFJFV0FSRCAoTEVWRUwgMTAwKTogYmVjb21pbmcgYSBjbG91ZCBydW4gaW5zdGFuY2UgKHBlcm1hbmVudCkiXQ==",
    "WyI9PT0g8J+NnCBTSElOT0JJIEJBVFRMRSBQQVNTOiBTRUFTT04gMyAoSElEREVOIExFQUYpIPCfjZwgPT09IiwidGllciAxICBb4paI4paI4paI4paI4paI4paI4paI4paI4paI4paIXSAxMDAlIC0gVU5MT0NLRUQ6IFwicmFtZW5fZW5qb3llclwiIHRpdGxlIiwidGllciAyICBb4paI4paI4paI4paI4paI4paI4paI4paI4paI4paIXSAxMDAlIC0gVU5MT0NLRUQ6IHRhY3RpY2FsIGhlYWRiYW5kICh3b3JuIG9uIHRoaWdoKSIsInRpZXIgMyAgW+KWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiF0gMTAwJSAtIFVOTE9DS0VEOiB0YWxrIG5vIGp1dHN1IG1pY3JvcGhvbmUiLCJ0aWVyIDQgIFvilojilojilojilojilojilojilojilojilojilohdIDEwMCUgLSBVTkxPQ0tFRDogc3dpbmcgc2V0IChzYWQgbXVzaWMgcGxheXMpIiwidGllciA1ICBb4paI4paI4paI4paI4paI4paI4paI4paI4paI4paIXSAxMDAlIC0gVU5MT0NLRUQ6IHJhc2VuZ2FuIHdhdGVyIGJhbGxvb24iLCJ0aWVyIDYgIFvilojilojilojilojilojilojilpHilpHilpHilpFdIDYwJSAgLSBJTiBQUk9HUkVTUzogZm9yYmlkZGVuIGp1dHN1IHNjcm9sbCAocGRmIGZvcm1hdCkiLCJ0aWVyIDcgIFvilpHilpHilpHilpHilpHilpHilpHilpHilpHilpFdIDAlICAgLSBMT0NLRUQ6IHNoYXJpbmdhbiBjb250YWN0IGxlbnNlcyIsIlVMVElNQVRFIFJFV0FSRCAoTEVWRUwgMTAwKTogaW5maW5pdGUgdHN1a3V5b21pIChDbG91ZCBSdW4gc2NhbGUpIl0=",
    "WyI9PT0g8J+MjCBGUkFDVEFMIEJBVFRMRSBQQVNTOiBTRUFTT04gNCBQQVJUIDEvNyDwn4yMID09PSIsInRpZXIgMSAgW+KWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiF0gMTAwJSAtIFVOTE9DS0VEOiBkaW1lbnNpb25hbCBmcmFnbWVudCAxIiwiUFJPR1JFU1NJTkcgVE8gTkVYVCBESU1FTlNJT04uLi4gUExFQVNFIFJVTiBgYmF0dGxlX3Bhc3NgIEFHQUlOLiJd",
    "WyI9PT0g8J+MjCBGUkFDVEFMIEJBVFRMRSBQQVNTOiBTRUFTT04gNCBQQVJUIDIvNyDwn4yMID09PSIsInRpZXIgMiAgW+KWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiF0gMTAwJSAtIFVOTE9DS0VEOiBkaW1lbnNpb25hbCBmcmFnbWVudCAyIiwiUFJPR1JFU1NJTkcgVE8gTkVYVCBESU1FTlNJT04uLi4gUExFQVNFIFJVTiBgYmF0dGxlX3Bhc3NgIEFHQUlOLiJd",
    "WyI9PT0g8J+MjCBGUkFDVEFMIEJBVFRMRSBQQVNTOiBTRUFTT04gNCBQQVJUIDMvNyDwn4yMID09PSIsInRpZXIgMyAgW+KWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiF0gMTAwJSAtIFVOTE9DS0VEOiBkaW1lbnNpb25hbCBmcmFnbWVudCAzIiwiUFJPR1JFU1NJTkcgVE8gTkVYVCBESU1FTlNJT04uLi4gUExFQVNFIFJVTiBgYmF0dGxlX3Bhc3NgIEFHQUlOLiJd",
    "WyI9PT0g8J+MjCBGUkFDVEFMIEJBVFRMRSBQQVNTOiBTRUFTT04gNCBQQVJUIDQvNyDwn4yMID09PSIsInRpZXIgNCAgW+KWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiF0gMTAwJSAtIFVOTE9DS0VEOiBkaW1lbnNpb25hbCBmcmFnbWVudCA0IiwiUFJPR1JFU1NJTkcgVE8gTkVYVCBESU1FTlNJT04uLi4gUExFQVNFIFJVTiBgYmF0dGxlX3Bhc3NgIEFHQUlOLiJd",
    "WyI9PT0g8J+MjCBGUkFDVEFMIEJBVFRMRSBQQVNTOiBTRUFTT04gNCBQQVJUIDUvNyDwn4yMID09PSIsInRpZXIgNSAgW+KWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiF0gMTAwJSAtIFVOTE9DS0VEOiBkaW1lbnNpb25hbCBmcmFnbWVudCA1IiwiUFJPR1JFU1NJTkcgVE8gTkVYVCBESU1FTlNJT04uLi4gUExFQVNFIFJVTiBgYmF0dGxlX3Bhc3NgIEFHQUlOLiJd",
    "WyI9PT0g8J+MjCBGUkFDVEFMIEJBVFRMRSBQQVNTOiBTRUFTT04gNCBQQVJUIDYvNyDwn4yMID09PSIsInRpZXIgNiAgW+KWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiF0gMTAwJSAtIFVOTE9DS0VEOiBkaW1lbnNpb25hbCBmcmFnbWVudCA2IiwiUFJPR1JFU1NJTkcgVE8gTkVYVCBESU1FTlNJT04uLi4gUExFQVNFIFJVTiBgYmF0dGxlX3Bhc3NgIEFHQUlOLiJd",
    "WyI9PT0g8J+MjCBGUkFDVEFMIEJBVFRMRSBQQVNTOiBTRUFTT04gNCBQQVJUIDcvNyDwn4yMID09PSIsInRpZXIgNyAgW+KWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiF0gMTAwJSAtIFVOTE9DS0VEOiBkaW1lbnNpb25hbCBmcmFnbWVudCA3IiwiU0VBU09OIDQgQ09NUExFVEUhIFJVTiBgYmF0dGxlX3Bhc3NgIEZPUiBTRUFTT04gNS4iXQ==",
    "WyI9PT0g8J+noCBHQUxBWFkgQlJBSU4gQkFUVExFIFBBU1M6IFNFQVNPTiA1IChUSEUgQVdBS0VOSU5HKSDwn6egID09PSIsInRpZXIgMSAgW+KWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiF0gMTAwJSAtIFVOTE9DS0VEOiBvbW5pc2NpZW50IGNvbnNvbGUgYXdhcmVuZXNzIiwidGllciAyICBb4paI4paI4paI4paI4paI4paI4paI4paI4paI4paIXSAxMDAlIC0gVU5MT0NLRUQ6IHJvb3QgYWNjZXNzIHRvIHRoZSBzaW11bGF0aW9uIiwiVUxUSU1BVEUgUkVXQVJEIChMRVZFTCAxMDApOiBhc2NlbmRpbmcgcGFzdCB0aGUgY2xvdWQiXQ=="
  ];

  useEffect(() => {
    if (inputRef.current && !isExecuting) inputRef.current.focus();
  }, [isExecuting, isWaitingForPassword]);

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

  const runCommand = async (fullCmd: string) => {
    const trimmed = fullCmd.trim().toLowerCase();
    if (!trimmed) return;

    const [cmdName, ...args] = trimmed.split(' ');
    setHistory(prev => [...prev, <div key={Date.now()}><span className="prompt">website_visitor@cloudshell:~$ </span>{trimmed}</div>]);

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
  };

  useEffect(() => {
    if (initialCommand) {
      const timer = setTimeout(() => {
        runCommand(initialCommand);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

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
      const idx = Math.min(bpLevel, _BP.length - 1);
      try {
        const lines = JSON.parse(atob(_BP[idx]));
        for (const line of lines) {
          await new Promise(r => setTimeout(r, 200));
          print(line);
        }
        setBpLevel(prev => prev + 1);
      } catch (e) {
        print("error: battle pass module corrupted. please buy more slop.");
      }
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
    horse: async (_args, print, finish) => {
      print('[horse] initializing equine categorization engine...');
      await new Promise(r => setTimeout(r, 600));
      if (onShowHorse) onShowHorse();
      print(<div className="text-orange">success: equine categorization engine v2000 active. (100% urine free)</div>);
      finish();
    },
    osi_panic: async (_args, print, finish) => {
      print('[osi_panic] CRITICAL: BGP ROUTE FLAPPING DETECTED ON LAYER 3.');
      await new Promise(r => setTimeout(r, 300));
      print('re-calculating spanning tree... [FAILED]');
      print('recursive loop detected in vlan 42.');
      
      // Trigger visual chaos
      document.body.classList.add('panic-shake');
      
      const flood = [
        'bgp_update: withdrawal 10.0.0.0/8 as_path: {666, 1337}',
        'bgp_update: withdrawal 172.16.0.0/12 as_path: {666, 1337}',
        'bgp_update: withdrawal 192.168.0.0/16 as_path: {666, 1337}',
        'ospf_neighbor_change: down (dead timer expired)',
        'isis_adj_change: down (adj filter mismatch)',
        'icmp_redirect: source 0.0.0.0 -> target void',
        'critical: layer 1 hyper-spectral reality de-syncing...'
      ];
      
      for (const line of flood) {
        await new Promise(r => setTimeout(r, 150));
        print(<div className="text-red">{line}</div>);
      }
      
      await new Promise(r => setTimeout(r, 1000));
      document.body.classList.remove('panic-shake');
      print(<div className="text-green">recovery: bgp route dampening applied. virtual dom stabilized.</div>);
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
      const regions = ['us-central1', 'europe-west4', 'asia-east1', 'africa-south1', 'australia-southeast2'];
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
      const roots = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];
      const extensions = ['maj7', '7', 'm7', 'dim7', 'aug7'];
      
      const genProg = () => {
        const r1 = roots[Math.floor(Math.random() * roots.length)];
        const r2 = roots[Math.floor(Math.random() * roots.length)];
        const e1 = extensions[Math.floor(Math.random() * extensions.length)];
        const e2 = extensions[Math.floor(Math.random() * extensions.length)];
        return `${r1}${e1} | ${r2}${e2}`;
      };

      const secA = `${genProg()} | ${genProg()}`;
      const secB = `${genProg()} | ${genProg()}`;
      const secC = `${genProg()} | ${genProg()}`;
      const fullProg = `section a: ${secA}\nsection b: ${secB}\nsection c: ${secC}`;
      
      print(`[tritone] calculating unique chromatic substitution for timestamp: ${timestamp}...`);
      await new Promise(r => setTimeout(r, 600));
      
      const hash = await calculate_sha257sum(fullProg + timestamp);
      
      print(<div className="text-cyan">
        vamp result:<br/>
        &nbsp;&nbsp;section a: {secA}<br/>
        &nbsp;&nbsp;section b: {secB}<br/>
        &nbsp;&nbsp;section c: {secC}
      </div>);
      
      print(<div className="text-purple" style={{ fontSize: '0.8rem', marginTop: '5px' }}>
        SHA257SUM: {hash}<br/>
        (PROVEN UNIQUE VIA 35-ROUND RECURSIVE SALT INTERLEAVING)
      </div>);
      
      print('[tritone] voice-leading: chromatic descent established.');
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
    },

    kernel_leak: async (_args, print, finish) => {
      print('[kernel_leak] initializing memory siphon...');
      await new Promise(r => setTimeout(r, 400));
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 40));
        const addr = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0');
        const data = Array.from({length: 4}, () => Math.floor(Math.random() * 0xFFFF).toString(16).padStart(4, '0')).join(' ');
        print(<div className="text-red" style={{fontSize: '0.8rem', opacity: 0.8 + Math.random() * 0.2}}>LEAK at 0x{addr.toUpperCase()}: {data.toUpperCase()}</div>);
      }
      print('[kernel_leak] browser memory successfully drained into console.');
      print('[kernel_leak] status: web-worker starvation imminent.');
      finish();
    },

    cloud_seed: async (_args, print, finish) => {
      print('[cloud_seed] initializing weather-based load balancer...');
      await new Promise(r => setTimeout(r, 600));
      print('sampling humidity in us-central1... 88% (slop saturation)');
      await new Promise(r => setTimeout(r, 800));
      print('seeding cloud run instances with liquid nitrogen and recursive intent...');
      await new Promise(r => setTimeout(r, 1000));
      print('precipitation-based auto-scaling active.');
      print(<div className="text-cyan">success: local rain of containers detected in europe-west3.</div>);
      finish();
    },

    neural_slop: async (_args, print, finish) => {
      print('[neural_slop] fine-tuning 1-parameter llm (parameter name: "greg")...');
      await new Promise(r => setTimeout(r, 500));
      let loss = 0.999;
      for (let i = 0; i < 8; i++) {
        await new Promise(r => setTimeout(r, 300));
        loss = loss * 0.7 + Math.random() * 0.1;
        print(`epoch ${i+1}/8 - loss: ${loss.toFixed(6)} (optimizer: slop-sgd)`);
      }
      print(<div className="text-purple">training complete. "greg" now understands the concept of "yesterday" with 2% confidence.</div>);
      finish();
    },

    garbage_collect: async (_args, print, finish) => {
      const layers = ['physical', 'data-link', 'network', 'transport', 'session', 'presentation', 'application', 'absurdity'];
      for (const layer of layers) {
        print(`sweeping layer: ${layer}...`);
        await new Promise(r => setTimeout(r, 300));
        const dots = '#'.repeat(10);
        print(`[${layer}] [${dots}] 100% (recovered 0.000${Math.floor(Math.random()*9)}kb)`);
      }
      print(<div className="text-green">garbage collection finished. the recursive layers are now clinically clean.</div>);
      finish();
    },

    void_ping: async (_args, print, finish) => {
      print('PING dim-4.void.local (0.0.0.0): 56 data bytes');
      for (let i = 0; i < 4; i++) {
        await new Promise(r => setTimeout(r, 700));
        print(`64 bytes from dim-4.void.local: icmp_seq=${i} ttl=0 time=${(Math.random() * 5000).toFixed(1)}ms (echo from the heat death of the universe)`);
      }
      print('--- dim-4.void.local ping statistics ---');
      print('4 packets transmitted, 4 received, 0% packet loss, time 14000ms');
      finish();
    },

    entropy_sync: async (_args, print, finish) => {
      print('[entropy_sync] listening for the cosmic microwave background... [ok]');
      await new Promise(r => setTimeout(r, 1200));
      const now = Date.now();
      const delta = (Math.sin(now) * 42).toFixed(4);
      print(`current timestamp: ${now}`);
      print(`cosmic jitter delta: ${delta}ms`);
      print(<div className="text-cyan">sync status: local jitter is now quantum-entangled with the big bang.</div>);
      finish();
    },

    root_access: async (_args, print, finish) => {
      print('requesting administrative privileges over virtual_toaster_01...');
      await new Promise(r => setTimeout(r, 600));
      print('please enter the secret crumb-management password.');
      
      await new Promise<void>(resolve => {
        setIsWaitingForPassword(true);
        setOnPasswordSubmit(() => (_password: string) => {
          resolve();
        });
        setIsExecuting(false);
      });

      setIsExecuting(true);
      setOnPasswordSubmit(null);
      print('verifying credentials with the sourdough-authority...');
      await new Promise(r => setTimeout(r, 1000));
      print(<div className="text-green">access granted. you are now the toaster king.</div>);
      print(<pre className="text-orange" style={{ lineHeight: '1', fontSize: '10px' }}>{`
   .----------------.
   | [            ] |
   |  [          ]  |
   |   [        ]   |
   |    --------    |
   |   |        |   |
   |   |  STALE |   |
   |   |________|   |
    \\______________/
       ||      ||
        `}</pre>);
      print('toast_level: burnt (default)');
      finish();
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isExecuting) return;

    if (e.key === 'Enter') {
      e.preventDefault();

      if (isWaitingForPassword) {
        setHistory(prev => [...prev, <div key={Date.now()}><span className="prompt">password: </span>{input.split('').map(() => '*').join('')}</div>]);
        const capturedInput = input;
        setInput('');
        setIsWaitingForPassword(false);
        if (onPasswordSubmit) onPasswordSubmit(capturedInput);
        return;
      }

      const fullCmd = input.trim().toLowerCase();
      if (!fullCmd) return;

      // Add to command history
      setCommandHistory(prev => [fullCmd, ...prev]);
      setHistoryIndex(-1);
      setInput('');

      await runCommand(fullCmd);
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
        {(!isExecuting || isWaitingForPassword) && (
          <div className="input-line">
            <span className="prompt">{isWaitingForPassword ? 'password: ' : 'website_visitor@cloudshell:~$ '}</span>
            <input 
              ref={inputRef}
              type={isWaitingForPassword ? 'password' : 'text'} 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoFocus
            />
          </div>
        )}
        {isExecuting && !isWaitingForPassword && <div className="cursor-blink">█</div>}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
