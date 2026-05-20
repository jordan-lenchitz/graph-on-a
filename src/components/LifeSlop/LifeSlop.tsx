import React, { useState, useEffect, useCallback, useRef } from 'react';
import './LifeSlop.css';

interface LifeSlopProps {
  onClose: () => void;
  theme?: string;
}

const ROWS = 40;
const COLS = 60;

export const SLOP_THEMES: Record<string, { color: string, label: string }> = {
  'gt.m': { color: '#00ff00', label: 'FIS GT.M V7.0-002' },
  'just_intonation': { color: '#00ffff', label: 'JI_BLEND_RATIO_SYNC' },
  'arch_btw': { color: '#1793d1', label: 'ARCH_LINUX_KERNEL_SLOP' },
  'yottadb': { color: '#ff9830', label: 'YottaDB_R206' },
  'epic_hosting': { color: '#e91e63', label: 'EPIC_HOSTING_SERVER_ENGINEER' },
  'fsu_music': { color: '#ce1126', label: 'FSU_COLLEGE_OF_MUSIC_FELLOW' },
  'minimalist_music': { color: '#ffffff', label: 'SOCIETY_FOR_MINIMALIST_MUSIC' },
  'notation_viz': { color: '#9c27b0', label: 'MUSIC_NOTATION_VISUALIZATION_GROUP' },
  'neurodiversity': { color: '#ffeb3b', label: 'NEURODIVERSITY_LISTENING_MODE' },
  'sondheim': { color: '#ff5722', label: 'STEPHEN_SONDHEIM_LYRIC_PARSER' },
  'barbershop': { color: '#03a9f4', label: 'BARBERSHOP_HARMONY_ENGINE' },
  'cuncordu': { color: '#4caf50', label: 'SARDINIAN_CUNCORDU_RESONANCE' },
  'harrison': { color: '#ffc107', label: 'MICHAEL_HARRISON_REVELATION' },
  'twining': { color: '#673ab7', label: 'TOBY_TWINING_VOCAL_BUFFER' },
  'ecological': { color: '#8bc34a', label: 'ECOLOGICAL_APPROACH_HEURISTIC' },
  'desert_walk': { color: '#ff9800', label: 'DESERT_SINGING_ECHO' },
  'sanskrit': { color: '#795548', label: 'SANSKRIT_PHONEME_SIMULATOR' },
  'sogdian': { color: '#607d8b', label: 'SOGDIAN_SILK_ROAD_FLOW' },
  'pali': { color: '#3f51b5', label: 'PALI_CANON_RECURSION' },
  'quine': { color: '#009688', label: 'QUINE_SELF_REPLICATING_CELLS' },
  'godel': { color: '#f44336', label: 'GODEL_INCOMPLETENESS_AUTOMATA' },
  'etc_hosts': { color: '#00bcd4', label: '/ETC/HOSTS_LOCAL_RECURSION' },
  'recursion_15': { color: '#e91e63', label: 'RECURSION_DEPTH_15_OVERFLOW' },
  'spectral': { color: '#ff00ff', label: 'HYPER_SPECTRAL_REALITY_SYNC' },
  'jumper_cables': { color: '#00ff00', label: 'QUANTUM_JUMPER_CABLES' },
  'rfc1149': { color: '#ffeb3b', label: 'RFC_1149_AVIAN_CARRIER_SLOP' },
  'ghost_handshake': { color: '#9e9e9e', label: 'GHOST_HANDSHAKE_SESSION' },
  'sws_protocol': { color: '#00ffff', label: 'SILLY_WHOLESOME_STUPID_PROT' },
  'absurdity_filter': { color: '#ff1493', label: 'WAF_ABSURDITY_FILTER_ACTIVE' },
  'serverless_dave': { color: '#7cfc00', label: 'SERVERLESS_DAVE_PROVISIONING' },
  'spline_reticulation': { color: '#00bfff', label: 'SPLINE_RETICULATION_COMPLETE' },
  'void_ping': { color: '#1a1a1a', label: 'VOID_PING_ICMP_ECHO' },
  'entropy_sync': { color: '#ff4500', label: 'COSMIC_MICROWAVE_JITTER' },
  'toaster_root': { color: '#daa520', label: 'VIRTUAL_TOASTER_ROOT_ACCESS' },
  'music_theory': { color: '#8a2be2', label: 'MUSIC_THEORY_INSTRUCTOR_VIBE' },
  'theory_2018': { color: '#5f9ea0', label: 'INSTRUCTOR_LEGACY_2018_2023' },
  'sounding_arts': { color: '#d2691e', label: 'EXPERIMENTAL_SOUNDING_ARTS' },
  'sounding_musics': { color: '#ff7f50', label: 'EXPERIMENTAL_SOUNDING_MUSICS' },
  'pedagogy_21': { color: '#6495ed', label: '21ST_CENTURY_PEDAGOGY_INIT' },
  'dissertation': { color: '#dc143c', label: 'DISSERTATION_CASE_STUDY_SYNC' },
  'chinese': { color: '#ee82ee', label: 'CHINESE_CHARACTER_AUTOMATA' },
  'video_art': { color: '#adff2f', label: 'EXPERIMENTAL_VIDEO_ART_SLOP' },
  'slop_vol_14': { color: '#ffa07a', label: 'RECURSIVE_SLOP_VOL_14.2' },
  'cilium': { color: '#20b2aa', label: 'CILIUM_IDENTITY_MAP_LOADED' },
  'zscaler': { color: '#87cefa', label: 'ZSCALER_TUNNEL_ESTABLISHED' },
  'openstack': { color: '#f08080', label: 'OPENSTACK_CLUSTER_NODE_01' },
  'telemetry_live': { color: '#32cd32', label: 'TELEMETRY_REAL_TIME_STREAM' },
  'slo_99': { color: '#fafad2', label: 'SLO_SLOP_AVAILABILITY_99.999' },
  'error_budget_0': { color: '#ff6347', label: 'ERROR_BUDGET_EXHAUSTED' },
  'toil_reduction': { color: '#40e0d0', label: 'TOIL_REDUCTION_INFINITE_LOOP' },
  'sre_orchestrator': { color: '#ee82ee', label: 'NET_RELIABILITY_ORCHESTRATOR' },
  'docker_vms': { color: '#f5deb3', label: 'DOCKER_VMS_ORCHESTRATOR_V2.1' },
  'l7_proto_h2': { color: '#98fb98', label: 'L7_PROTOCOL_HTTP2_FORCE' },
  'quantum_hyper': { color: '#afeeee', label: 'QUANTUM_HYPER_THREADING_ON' },
  'mainframe_bypass': { color: '#db7093', label: 'MAINFRAME_BYPASS_SHEER_WILL' },
  'cowardly_breach': { color: '#ffefd5', label: 'COWARDLY_BUTTON_CONTAINMENT' },
  'ram_download': { color: '#ffdab9', label: 'DOWNLOADING_512PB_RAM_DONE' },
  'guy_named_dave': { color: '#cd853f', label: '10000_SERVERS_NAMED_DAVE' },
  'equine_engine': { color: '#ffc0cb', label: 'EQUINE_CATEGORIZATION_100' },
  'urine_free': { color: '#dda0dd', label: '100_PERCENT_URINE_FREE' },
  'bgp_flapping': { color: '#b0e0e6', label: 'BGP_ROUTE_FLAPPING_SIM' },
  'tritone_calc': { color: '#800080', label: 'TRITONE_SUB_CALCULATION' },
  'voice_leading': { color: '#663399', label: 'CHROMATIC_VOICE_LEADING_OK' },
  'kernel_leak': { color: '#bc8f8f', label: 'KERNEL_MEMORY_LEAK_BROWSER' },
  'weather_lb': { color: '#4169e1', label: 'WEATHER_BASED_LOAD_BALANCER' },
  'neural_slop': { color: '#8b4513', label: 'NEURAL_SLOP_1_PARAM_LLM' },
  'garbage_collect': { color: '#fa8072', label: 'GARBAGE_COLLECT_LOOSE_BITS' },
  'cowardly_glide': { color: '#f4a460', label: 'COWARDLY_BUTTON_PERP_GLIDE' },
  'slop_collision': { color: '#2e8b57', label: 'SLOP_COLLISION_PHYSICS_TUNE' },
  'enterprise_plus': { color: '#fff5ee', label: 'QUOTA_SMASH_ENTERPRISE_PLUS' },
  'theoretical_burn': { color: '#a0522d', label: 'THEORETICAL_MAX_BURN_SYNC' },
  'compliance_absurd': { color: '#c0c0c0', label: 'COMPLIANCE_100_ABSURD' },
  'h3_cache_hit': { color: '#87ceeb', label: 'PROTO_H3_CACHE_HIT_READY' },
  'pop_lhr_c2': { color: '#6a5acd', label: 'POP_LHR_C2_ESTABLISHED' },
  'latency_14ms': { color: '#708090', label: 'SYSTEM_LATENCY_14MS_NOMINAL' },
  'sql_theme': { color: '#fffafa', label: 'GCP_INFRA_VISUALIZER_SQL' },
  'node_01_telemetry': { color: '#00ff7f', label: 'NODE_01_TELEMETRY_DASHBOARD' },
  'js_heap_na': { color: '#4682b4', label: 'JS_HEAP_NA_STABLE' },
  'egress_89kb': { color: '#d2b48c', label: 'EGRESS_EST_89KB_STABLE' },
  'first_paint_0ms': { color: '#008080', label: 'FIRST_PAINT_0MS_STABLE' },
  'dom_interactive': { color: '#d8bfd8', label: 'DOM_INTERACTIVE_102MS_OK' },
  'zscaler_established': { color: '#ff6347', label: 'SECURITY_ZSCALER_TUNNEL' },
  'ydb_native_rpc': { color: '#40e0d0', label: 'SERVICE_YDB_NATIVE_RPC' },
  'pod_frontend': { color: '#ee82ee', label: 'POD_FRONTEND_7D45_RUNNING' },
  'allow_egress_gcs': { color: '#f5deb3', label: 'POLICY_ALLOW_EGRESS_GCS' },
  'seven_limit': { color: '#98fb98', label: 'JUST_INTONATION_7_LIMIT' },
  'eleven_limit': { color: '#afeeee', label: 'JUST_INTONATION_11_LIMIT' },
  'thirteen_limit': { color: '#db7093', label: 'JUST_INTONATION_13_LIMIT' },
  'minimal_vibe': { color: '#ffefd5', label: 'MINIMALIST_VIBE_CHECK_OK' },
  'theoretical_lead': { color: '#ffdab9', label: 'THEORETICAL_VOICE_LEADING' },
  'vocal_buffer': { color: '#cd853f', label: 'TOBY_TWINING_VOCAL_SYNC' },
  'silk_road': { color: '#ffc0cb', label: 'SOGDIAN_SILK_ROAD_AUTOMATA' },
  'sanskrit_phoneme': { color: '#dda0dd', label: 'SANSKRIT_PHONEME_GENERATOR' },
  'canon_recursion': { color: '#b0e0e6', label: 'PALI_CANON_RECURSION_DEPTH' },
  'character_automata': { color: '#800080', label: 'CHINESE_CHARACTER_FLOW' },
  'desert_echo': { color: '#663399', label: 'DESERT_SINGING_REVERB' },
  'ecological_sync': { color: '#bc8f8f', label: 'ECOLOGICAL_LISTENING_SYNC' },
  'harrison_rev': { color: '#4169e1', label: 'MICHAEL_HARRISON_TUNING' },
  'cuncordu_res': { color: '#8b4513', label: 'SARDINIAN_CUNCORDU_VIBE' },
  'barbershop_sync': { color: '#fa8072', label: 'BARBERSHOP_HARMONY_SYNC' },
  'sondheim_lyrics': { color: '#f4a460', label: 'SONDHEIM_LYRIC_SIMULATOR' },
  'notation_viz_grp': { color: '#2e8b57', label: 'SMT_NOTATION_VIZ_GROUP' },
  'neuro_listening': { color: '#fff5ee', label: 'NEURODIVERGENT_LISTENING' },
  'minimalist_music_soc': { color: '#a0522d', label: 'SOC_MINIMALIST_MUSIC_SYNC' },
  'instructor_fsu': { color: '#c0c0c0', label: 'FSU_MUSIC_THEORY_DEPT' },
  'legacy_fellow': { color: '#87ceeb', label: 'LEGACY_FELLOW_RECURSION' }
};

export const LifeSlop: React.FC<LifeSlopProps> = ({ onClose, theme = 'gt.m' }) => {
  const [grid, setGrid] = useState<number[][]>([]);
  const [generation, setGridGeneration] = useState(0);
  const currentTheme = SLOP_THEMES[theme] || SLOP_THEMES['gt.m'];
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateEmptyGrid = () => {
    const rows = [];
    for (let i = 0; i < ROWS; i++) {
      rows.push(Array.from(Array(COLS), () => (Math.random() > 0.8 ? 1 : 0)));
    }
    return rows;
  };

  useEffect(() => {
    setGrid(generateEmptyGrid());
  }, []);

  const runSimulation = useCallback(() => {
    setGrid((g) => {
      if (g.length === 0) return g;
      const nextGrid = g.map((row, i) => {
        return row.map((_, j) => {
          let neighbors = 0;
          const directions = [
            [0, 1], [0, -1], [1, -1], [-1, 1],
            [1, 1], [-1, -1], [1, 0], [-1, 0]
          ];
          directions.forEach(([x, y]) => {
            const newI = i + x;
            const newJ = j + y;
            if (newI >= 0 && newI < ROWS && newJ >= 0 && newJ < COLS) {
              neighbors += g[newI][newJ];
            }
          });

          if (neighbors < 2 || neighbors > 3) {
            return 0;
          } else if (g[i][j] === 0 && neighbors === 3) {
            return 1;
          } else {
            return g[i][j];
          }
        });
      });
      return nextGrid;
    });
    setGridGeneration(prev => prev + 1);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(runSimulation, 150);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [runSimulation]);

  return (
    <div className="life-slop-overlay">
      <div className="life-slop-window" style={{ borderColor: currentTheme.color }}>
        <div className="life-slop-header" style={{ backgroundColor: currentTheme.color }}>
          <span>SIMULATED_SLOP_ENVIRONMENT: {currentTheme.label}</span>
          <button onClick={onClose}>×</button>
        </div>
        <div className="life-slop-stats">
          <span>GEN: {generation}</span>
          <span>POP: {grid.flat().filter(x => x === 1).length}</span>
          <span>THEME: {theme}</span>
        </div>
        <div className="life-slop-grid">
          {grid.map((row, i) =>
            row.map((_, k) => (
              <div
                key={`${i}-${k}`}
                className={`life-cell ${grid[i][k] ? 'alive' : ''}`}
                style={{
                  backgroundColor: grid[i][k] ? currentTheme.color : undefined,
                  boxShadow: grid[i][k] ? `0 0 5px ${currentTheme.color}` : undefined
                }}
              />
            ))
          )}
        </div>
        <div className="life-slop-footer">
          CAUTION: CELLULAR AUTOMATA LEAKING INTO VIRTUAL DOM
        </div>
      </div>
    </div>
  );
};
