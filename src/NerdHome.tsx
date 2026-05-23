import React, { useState, useEffect } from 'react';
import { CowardlyButton } from './components/CowardlyButton';
import { RecursiveSite } from './components/RecursiveSite';
import { BouncingSlop } from './components/BouncingSlop';
import { DraggablePanel } from './components/DraggablePanel';
import { CloudShell } from './components/CloudShell';
import { RealGrafanaPanel } from './components/RealGrafanaPanel';
import { StupidGrafanaPanel } from './components/StupidGrafanaPanel';
import { HorseEngine } from './components/HorseEngine';
import { LifeSlop, SLOP_THEMES } from './components/LifeSlop/LifeSlop';
import { ChaosPanel } from './components/ChaosPanel';
import { GiantRedButton } from './components/GiantRedButton';
import './NerdHome.css';

const ALLITERATIVE_NAMES = [
  'anxious-aardvark', 'agile-albatross', 'angry-alligator', 'awesome-armadillo', 'active-antelope',
  'brave-badger', 'bouncy-baboon', 'bold-bison', 'blue-butterfly', 'bitter-bear', 'bright-beetle',
  'crazy-cat', 'cool-camel', 'calm-capybara', 'clever-coyote', 'cuddly-cougar', 'cosmic-crab',
  'dizzy-dog', 'dancing-dolphin', 'dark-dingo', 'dashing-deer', 'daring-duck', 'dreamy-dragon',
  'eager-eagle', 'elegant-elephant', 'electric-eel', 'energetic-emu', 'epic-echidna',
  'fast-fox', 'funny-ferret', 'fierce-falcon', 'fuzzy-flamingo', 'fancy-frog', 'fearless-fawn',
  'giant-gorilla', 'goofy-goose', 'grumpy-grizzly', 'green-gecko', 'gentle-gazelle',
  'happy-honeybee', 'hungry-hippo', 'hairy-hamster', 'hyper-hyena', 'heroic-heron',
  'icy-iguana', 'idle-impala', 'iron-inchworm', 'ill-ibex',
  'jolly-jellyfish', 'jumping-jaguar', 'jazzy-jackal', 'joyful-jay',
  'kind-koala', 'keen-kangaroo', 'kooky-kiwi', 'karmic-krill',
  'lazy-lion', 'lucky-llama', 'loud-leopard', 'little-lemur', 'lucid-lynx',
  'mad-monkey', 'magic-moose', 'mighty-mouse', 'mystic-macaque', 'mellow-moth',
  'neat-newt', 'noisy-narwhal', 'noble-nightingale', 'nervous-numbat',
  'odd-ostrich', 'old-owl', 'orange-octopus', 'ornery-orca', 'open-oyster',
  'proud-peacock', 'pink-pig', 'plump-penguin', 'puny-pug', 'peaceful-panda',
  'quick-quail', 'quiet-quokka', 'quirky-quetzal',
  'rapid-rabbit', 'red-raccoon', 'rusty-rhino', 'radiant-raven', 'rebel-rat',
  'sad-seal', 'silly-snake', 'slow-sloth', 'sneaky-spider', 'shy-shark', 'super-squid',
  'tall-tiger', 'tiny-turtle', 'tired-toad', 'tough-turkey', 'tricky-toucan',
  'upbeat-urchin', 'unruly-uakari',
  'velvet-viper', 'vocal-vole', 'valiant-vulture', 'vibrant-vicuna',
  'wild-wolf', 'wacky-walrus', 'white-whale', 'wise-wombat', 'wily-weasel',
  'yellow-yak', 'young-yellowjacket', 'yawning-yorkie',
  'zany-zebra', 'zealous-zebu', 'zesty-zorse'
];

export const NerdHome: React.FC = () => {
  const [maxDepth, setMaxDepth] = useState(0);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showLifeSlop, setShowLifeSlop] = useState(false);
  const [showOsi, setShowOsi] = useState(false);
  const [showOpenStack, setShowOpenStack] = useState(false);
  const [showHorse, setShowHorse] = useState(false);
  const [lifeTheme, setLifeTheme] = useState('gt.m');
  const [slopSpeed, setSlopSpeed] = useState(15); // Default 15s
  const [initialCmd, setInitialCmd] = useState<string | undefined>(undefined);
  const [isStaticMode, setIsStaticMode] = useState(false);

  const [vmStatus, setVmStatus] = useState<'offline' | 'online'>('offline');
  const [systemName, setSystemName] = useState('system_core');
  const [vmUptime, setVmUptime] = useState(0);
  const [vmCpu, setVmCpu] = useState('0.00');
  const [vmMem, setVmMem] = useState('67.1');

  const [inferenceWs, setInferenceWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Recursive Spatial Expansion: Connect to Anceps Inference
    const socket = new WebSocket("ws://localhost:8000/ws");
    socket.onopen = () => console.log('Spatial Expansion: Connected to Inference');
    setInferenceWs(socket);
    return () => socket.close();
  }, []);

  useEffect(() => {
    if (inferenceWs && inferenceWs.readyState === WebSocket.OPEN) {
      inferenceWs.send(JSON.stringify({ type: 'depth', value: maxDepth }));
    }
  }, [maxDepth, inferenceWs]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('?')) {
      const query = hash.split('?')[1];
      const params = new URLSearchParams(query);
      const theme = params.get('theme');
      const cmd = params.get('cmd');
      const staticParam = params.get('static');

      if (staticParam === 'true' || staticParam === '1') {
        setIsStaticMode(true);
      }

      if (theme && SLOP_THEMES[theme]) {
        setLifeTheme(theme);
        setShowLifeSlop(true);
      }
      if (cmd) {
        setInitialCmd(cmd);
        setShowTerminal(true);
      }
    }
  }, []);

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

  const handleVmStart = () => {
    setVmStatus('online');
    setSystemName(ALLITERATIVE_NAMES[Math.floor(Math.random() * ALLITERATIVE_NAMES.length)]);
  };

  const triggerLifeSlop = () => {
    const themeKeys = Object.keys(SLOP_THEMES);
    setLifeTheme(themeKeys[Math.floor(Math.random() * themeKeys.length)]);
    setShowLifeSlop(true);
  };

  useEffect(() => {
    let keyBuffer = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }
        e.preventDefault();
        setShowTerminal(prev => !prev);
      }

      if (e.key.length === 1) {
        keyBuffer += e.key.toLowerCase();
        if (keyBuffer.length > 10) {
          keyBuffer = keyBuffer.slice(-10);
        }
        if (keyBuffer.includes('static')) {
          setIsStaticMode(true);
          keyBuffer = '';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isStaticMode) {
    return (
      <div style={{
        backgroundColor: '#000',
        color: '#0f0',
        fontFamily: 'monospace',
        padding: '40px',
        height: '100vh',
        width: '100vw',
        overflow: 'auto',
        boxSizing: 'border-box',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 999999
      }}>
        <h1 style={{ marginBottom: '20px' }}>JORDAN_LENCHITZ // STATIC_MODE</h1>
        <p>status: operational</p>
        <p>animations: disabled</p>
        <p>slop_level: 0%</p>
        <p>recursion_depth: 0</p>
        <br />
        <h2 style={{ marginBottom: '10px' }}>// LINKS</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px' }}><a href="https://linkedin.com/in/jordanlenchitz" style={{ color: '#0f0', textDecoration: 'underline' }}>[LINKEDIN]</a></li>
          <li style={{ marginBottom: '10px' }}><a href="https://scholar.google.com/" style={{ color: '#0f0', textDecoration: 'underline' }}>[GOOGLE_SCHOLAR]</a></li>
        </ul>
        <br />
        <h2 style={{ marginBottom: '10px' }}>// ACTION</h2>
        <button 
          onClick={() => setIsStaticMode(false)}
          style={{
            backgroundColor: 'transparent',
            color: '#0f0',
            border: '1px solid #0f0',
            padding: '5px 10px',
            fontFamily: 'monospace',
            cursor: 'pointer'
          }}
        >
          [RETURN_TO_ABSURDITY]
        </button>
      </div>
    );
  }

  return (
    <div className="nerd-home">
      {/* Background Recursive Layers */}
      <div className="recursive-container">
        <RecursiveSite 
          maxDepth={15} 
          onDepthReach={(d) => setMaxDepth(Math.max(maxDepth, d))} 
        />
      </div>

      {/* Floating Slop text */}
      <BouncingSlop speed={slopSpeed} />

      {/* Cowardly Button */}
      <CowardlyButton />

      {/* Cloud Shell Terminal */}
      {showTerminal && (
        <CloudShell 
          onClose={() => setShowTerminal(false)} 
          onSlopChange={(s) => setSlopSpeed(s)}
          onVmStart={handleVmStart}
          onShowOsi={() => setShowOsi(true)}
          onShowOpenStack={() => setShowOpenStack(true)}
          onShowHorse={() => setShowHorse(true)}
          initialCommand={initialCmd}
        />
      )}

      {/* Conway's Game of Life Slop */}
      {showLifeSlop && (
        <LifeSlop 
          theme={lifeTheme} 
          onClose={() => setShowLifeSlop(false)} 
        />
      )}

      {/* Equine Categorization Engine */}
      {showHorse && (
        <HorseEngine onClose={() => setShowHorse(false)} />
      )}

      {/* Floating Action Buttons */}
      <div className="floating-actions">
        {/* Chaos Button */}
        <GiantRedButton />

        {/* Slop Button */}
        <button className="action-btn slop-btn" onClick={triggerLifeSlop}>
          spawn_slop
        </button>

        {/* MacBook Tilde Key Button */}
        <button className="tilde-key" onClick={() => setShowTerminal(prev => !prev)}>
          <div className="tilde-top">~</div>
          <div className="tilde-bottom">`</div>
        </button>
      </div>

      {/* Top Left Links temporarily removed 
      <div className="top-links">
        <div>jordan lenchitz (linkedin)</div>
        <div>j. lenchitz (google scholar)</div>
      </div>
      */}

      {/* Chaos Panel */}
      <ChaosPanel />

      {/* Left Panel: OSI Absurdity */}
      {showOsi && (
        <DraggablePanel className="osi-panel">
          <div className="panel-header">
            <span className="dot purple-dot"></span>
            <span>osi_absurdity_v7</span>
            <span className="header-right">dream_job_ready</span>
          </div>
          <div className="panel-content">
            <div className="layer-row layer-7">
              <span className="layer-name">l7: application</span>
              <span className="layer-desc">silly wholesome stupid (sws)</span>
            </div>
            <div className="layer-row layer-6">
              <span className="layer-name">l6: presentation</span>
              <span className="layer-desc">recursive json-ld slop</span>
            </div>
            <div className="layer-row layer-5">
              <span className="layer-name">l5: session</span>
              <span className="layer-desc">ghost handshakes</span>
            </div>
            <div className="layer-row layer-4">
              <span className="layer-name">l4: transport</span>
              <span className="layer-desc">udp (unreliable dreams)</span>
            </div>
            <div className="layer-row layer-3">
              <span className="layer-name">l3: network</span>
              <span className="layer-desc">rfc 1149 (avian carriers)</span>
            </div>
            <div className="layer-row layer-2">
              <span className="layer-name">l2: data link</span>
              <span className="layer-desc">quantum jumper cables</span>
            </div>
            <div className="layer-row layer-1">
              <span className="layer-name">l1: physical</span>
              <span className="layer-desc">hyper-spectral reality</span>
            </div>
            
            <div className="stats-block">
              <div className="stat-row text-green">l7_proto: h2</div>
              <div className="stat-row text-green">waf_status: absurdity_filter_active</div>
              <div className="stat-row text-cyan">serverless_servers: 0 detected (true null)</div>
              <div className="stat-row text-purple mt-2">stateless_state (forgetting...):</div>
              <div className="stat-row text-purple">quine -&gt; sws -&gt; rfc1149 -&gt; null -&gt; sws</div>
              
              <div className="metrics-box mt-2 text-green">
                <div>sre_dream_job_metrics:</div>
                <div className="flex-between"><span>slo (slop_availability):</span><span>99.999%</span></div>
                <div className="flex-between"><span>error_budget:</span><span>$0.00 (exhausted)</span></div>
                <div className="flex-between"><span>toil_reduction:</span><span>infinite_loop</span></div>
              </div>
              <div className="text-muted text-right text-small mt-2">net_reliability_engineering_orchestrator // 2026</div>
            </div>
          </div>
        </DraggablePanel>
      )}

      {/* Right Top Panel: System Core */}
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
          <div className="text-muted text-right text-small mt-2">docker_vms_orchestrator_v2.1 // slopn't</div>
        </div>
      </DraggablePanel>

      {/* Real Grafana Component */}
      <RealGrafanaPanel />

      {/* Stupid Grafana Component at the bottom */}
      <StupidGrafanaPanel />

      {/* Right Middle Panel: Telemetry */}
      {showOpenStack && (
        <DraggablePanel className="telemetry-panel">
          <div className="panel-header bg-darker">
            <span className="text-orange">g</span>
            <span>openstack cluster / node-01 / telemetry</span>
            <span className="header-right text-muted">last 5 minutes ⚙</span>
          </div>
          <div className="panel-content">
            <div className="grid-4-col text-center border-bottom pb-2">
              <div className="telemetry-box border-right">
                <div className="text-small text-muted">dom interactive</div>
                <div className="text-large text-blue">102 <span className="text-small">ms</span></div>
                <div className="text-small text-muted">stable</div>
              </div>
              <div className="telemetry-box border-right">
                <div className="text-small text-muted">first paint</div>
                <div className="text-large text-green">0 <span className="text-small">ms</span></div>
                <div className="text-small text-muted">stable</div>
              </div>
              <div className="telemetry-box border-right">
                <div className="text-small text-muted">egress (est)</div>
                <div className="text-large text-yellow">89 <span className="text-small">kb</span></div>
                <div className="text-small text-muted">stable</div>
              </div>
              <div className="telemetry-box">
                <div className="text-small text-muted">js heap</div>
                <div className="text-large text-orange">n/a <span className="text-small">mb</span></div>
                <div className="text-small text-muted">stable</div>
              </div>
            </div>
            
            <div className="mt-2 text-small text-muted">network_io / protocol: h2</div>
            <div className="chart-area mt-2">
              {/* Fake chart bars */}
              <div className="bar" style={{height: '40%'}}></div>
              <div className="bar" style={{height: '30%'}}></div>
              <div className="bar" style={{height: '60%'}}></div>
              <div className="bar" style={{height: '20%'}}></div>
              <div className="bar" style={{height: '50%'}}></div>
              <div className="bar" style={{height: '30%'}}></div>
              <div className="bar" style={{height: '80%'}}></div>
              <div className="bar" style={{height: '40%'}}></div>
              <div className="bar" style={{height: '90%'}}></div>
              <div className="bar" style={{height: '60%'}}></div>
            </div>

            <div className="flex-between mt-2 pt-2 border-top">
              <div className="text-small">
                <div>cilium_identity_map</div>
                <div className="text-green">[pod] frontend-7d45 -&gt; [service] ydb-native-rpc</div>
                <div className="text-green">[policy] allow-egress-to-gcs (cidr: 10.0.0.0/8)</div>
                <div className="text-green">[security] zscaler-tunnel: established</div>
                <div className="text-green">[trace] 4nwl1f...</div>
              </div>
              <div className="health-circle">
                <div className="text-small text-muted text-center">health</div>
                <div className="circle text-green">100%</div>
              </div>
            </div>
          </div>
        </DraggablePanel>
      )}

      {/* Bottom Bar */}
      <div className="bottom-bar">
        <div className="text-red">real_gcp_infrastructure_visualizer (sql_theme)</div>
        <div className="text-muted text-right">last_poll: 3:36:10 am</div>
      </div>
      <div className="bottom-status">
        <div>system: operational<br/>latency: 14ms</div>
        <div className="text-right">pop: lhr-c2<br/>proto: h3<br/>cache: hit</div>
      </div>
    </div>
  );
};
