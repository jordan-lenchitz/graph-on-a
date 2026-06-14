import React, { useState, useEffect, useCallback, useRef } from 'react';
import './LifeSlop.css';

interface LifeSlopProps {
  onClose: () => void;
  theme?: string;
}

const ROWS = 40;
const COLS = 60;
const CELL_SIZE = 10;

export const SLOP_THEMES: Record<string, { color: string, label: string }> = {
  'gt.m': { color: '#00ff00', label: 'fis gt.m v7.0-002' },
  'just_intonation': { color: '#00ffff', label: 'ji_blend_ratio_sync' },
  'arch_btw': { color: '#1793d1', label: 'arch_linux_kernel_slop' },
  'yottadb': { color: '#ff9830', label: 'yottadb_r206' },
  'epic_hosting': { color: '#e91e63', label: 'epic_hosting_server_engineer' },
  'fsu_music': { color: '#ce1126', label: 'fsu_college_of_music_fellow' },
  'minimalist_music': { color: '#ffffff', label: 'society_for_minimalist_music' },
  'notation_viz': { color: '#9c27b0', label: 'music_notation_visualization_group' },
  'neurodiversity': { color: '#ffeb3b', label: 'neurodiversity_listening_mode' },
  'sondheim': { color: '#ff5722', label: 'stephen_sondheim_lyric_parser' },
  'barbershop': { color: '#03a9f4', label: 'barbershop_harmony_engine' },
  'cuncordu': { color: '#4caf50', label: 'sardinian_cuncordu_resonance' },
  'harrison': { color: '#ffc107', label: 'michael_harrison_revelation' },
  'twining': { color: '#673ab7', label: 'toby_twining_vocal_buffer' },
  'ecological': { color: '#8bc34a', label: 'ecological_approach_heuristic' },
  'desert_walk': { color: '#ff9800', label: 'desert_singing_echo' },
  'sanskrit': { color: '#795548', label: 'sanskrit_phoneme_simulator' },
  'sogdian': { color: '#607d8b', label: 'sogdian_silk_road_flow' },
  'pali': { color: '#3f51b5', label: 'pali_canon_recursion' },
  'quine': { color: '#009688', label: 'quine_self_replicating_cells' },
  'godel': { color: '#f44336', label: 'godel_incompleteness_automata' },
  'etc_hosts': { color: '#00bcd4', label: '/etc/hosts_local_recursion' },
  'recursion_15': { color: '#e91e63', label: 'recursion_depth_15_overflow' },
  'spectral': { color: '#ff00ff', label: 'hyper_spectral_reality_sync' },
  'jumper_cables': { color: '#00ff00', label: 'quantum_jumper_cables' },
  'rfc1149': { color: '#ffeb3b', label: 'rfc_1149_avian_carrier_slop' },
  'ghost_handshake': { color: '#9e9e9e', label: 'ghost_handshake_session' },
  'sws_protocol': { color: '#00ffff', label: 'silly_wholesome_stupid_prot' },
  'absurdity_filter': { color: '#ff1493', label: 'waf_absurdity_filter_active' },
  'serverless_dave': { color: '#7cfc00', label: 'serverless_dave_provisioning' },
  'spline_reticulation': { color: '#00bfff', label: 'spline_reticulation_complete' },
  'void_ping': { color: '#1a1a1a', label: 'void_ping_icmp_echo' },
  'entropy_sync': { color: '#ff4500', label: 'cosmic_microwave_jitter' },
  'toaster_root': { color: '#daa520', label: 'virtual_toaster_root_access' },
  'music_theory': { color: '#8a2be2', label: 'music_theory_instructor_vibe' },
  'theory_2018': { color: '#5f9ea0', label: 'instructor_legacy_2018_2023' },
  'sounding_arts': { color: '#d2691e', label: 'experimental_sounding_arts' },
  'sounding_musics': { color: '#ff7f50', label: 'experimental_sounding_musics' },
  'pedagogy_21': { color: '#6495ed', label: '21st_century_pedagogy_init' },
  'dissertation': { color: '#dc143c', label: 'dissertation_case_study_sync' },
  'chinese': { color: '#ee82ee', label: 'chinese_character_automata' },
  'video_art': { color: '#adff2f', label: 'experimental_video_art_slop' },
  'slop_vol_14': { color: '#ffa07a', label: 'recursive_slop_vol_14.2' },
  'cilium': { color: '#20b2aa', label: 'cilium_identity_map_loaded' },
  'zscaler': { color: '#87cefa', label: 'zscaler_tunnel_established' },
  'openstack': { color: '#f08080', label: 'openstack_cluster_node_01' },
  'telemetry_live': { color: '#32cd32', label: 'telemetry_real_time_stream' },
  'slo_99': { color: '#fafad2', label: 'slo_slop_availability_99.999' },
  'error_budget_0': { color: '#ff6347', label: 'error_budget_exhausted' },
  'toil_reduction': { color: '#40e0d0', label: 'toil_reduction_infinite_loop' },
  'sre_orchestrator': { color: '#ee82ee', label: 'net_reliability_orchestrator' },
  'docker_vms': { color: '#f5deb3', label: 'docker_vms_orchestrator_v2.1' },
  'l7_proto_h2': { color: '#98fb98', label: 'l7_protocol_http2_force' },
  'quantum_hyper': { color: '#afeeee', label: 'quantum_hyper_threading_on' },
  'mainframe_bypass': { color: '#db7093', label: 'mainframe_bypass_sheer_will' },
  'cowardly_breach': { color: '#ffefd5', label: 'cowardly_button_containment_breached' },
  'ram_download': { color: '#ffdab9', label: 'downloading_512pb_ram_done' },
  'guy_named_dave': { color: '#cd853f', label: '10000_servers_named_dave' },
  'equine_engine': { color: '#ffc0cb', label: 'equine_categorization_100' },
  'urine_free': { color: '#dda0dd', label: '100_percent_urine_free' },
  'bgp_flapping': { color: '#b0e0e6', label: 'bgp_route_flapping_sim' },
  'tritone_calc': { color: '#800080', label: 'tritone_sub_calculation' },
  'voice_leading': { color: '#663399', label: 'chromatic_voice_leading_ok' },
  'kernel_leak': { color: '#bc8f8f', label: 'kernel_memory_leak_browser' },
  'weather_lb': { color: '#4169e1', label: 'weather_based_load_balancer' },
  'neural_slop': { color: '#8b4513', label: 'neural_slop_1_param_llm' },
  'garbage_collect': { color: '#fa8072', label: 'garbage_collect_loose_bits' },
  'cowardly_glide': { color: '#f4a460', label: 'cowardly_button_perp_glide' },
  'slop_collision': { color: '#2e8b57', label: 'slop_collision_physics_tuner' },
  'enterprise_plus': { color: '#fff5ee', label: 'quota_smash_enterprise_plus' },
  'theoretical_burn': { color: '#a0522d', label: 'theoretical_max_burn_sync' },
  'compliance_absurd': { color: '#c0c0c0', label: 'compliance_100_absurd' },
  'h3_cache_hit': { color: '#87ceeb', label: 'proto_h3_cache_hit_ready' },
  'pop_lhr_c2': { color: '#6a5acd', label: 'pop_lhr_c2_established' },
  'latency_14ms': { color: '#708090', label: 'system_latency_14ms_nominal' },
  'sql_theme': { color: '#fffafa', label: 'gcp_infra_visualizer_sql' },
  'node_01_telemetry': { color: '#00ff7f', label: 'node_01_telemetry_dashboard' },
  'js_heap_na': { color: '#4682b4', label: 'js_heap_na_stable' },
  'egress_89kb': { color: '#d2b48c', label: 'egress_est_89kb_stable' },
  'first_paint_0ms': { color: '#008080', label: 'first_paint_0ms_stable' },
  'dom_interactive': { color: '#d8bfd8', label: 'dom_interactive_102ms_ok' },
  'zscaler_established': { color: '#ff6347', label: 'security_zscaler_tunnel' },
  'ydb_native_rpc': { color: '#40e0d0', label: 'service_ydb_native_rpc' },
  'pod_frontend': { color: '#ee82ee', label: 'pod_frontend_7d45_running' },
  'allow_egress_gcs': { color: '#f5deb3', label: 'policy_allow_egress_gcs' },
  'seven_limit': { color: '#98fb98', label: 'just_intonation_7_limit' },
  'eleven_limit': { color: '#afeeee', label: 'just_intonation_11_limit' },
  'thirteen_limit': { color: '#db7093', label: 'just_intonation_13_limit' },
  'minimal_vibe': { color: '#ffefd5', label: 'minimalist_vibe_check_ok' },
  'theoretical_lead': { color: '#ffdab9', label: 'theoretical_voice_leading' },
  'vocal_buffer': { color: '#cd853f', label: 'toby_twining_vocal_sync' },
  'silk_road': { color: '#ffc0cb', label: 'sogdian_silk_road_automata' },
  'sanskrit_phoneme': { color: '#dda0dd', label: 'sanskrit_phoneme_generator' },
  'canon_recursion': { color: '#b0e0e6', label: 'pali_canon_recursion_depth' },
  'character_automata': { color: '#800080', label: 'chinese_character_flow' },
  'desert_echo': { color: '#663399', label: 'desert_singing_reverb' },
  'ecological_sync': { color: '#bc8f8f', label: 'ecological_listening_sync' },
  'harrison_rev': { color: '#4169e1', label: 'michael_harrison_tuning' },
  'cuncordu_res': { color: '#8b4513', label: 'sardinian_cuncordu_vibe' },
  'barbershop_sync': { color: '#fa8072', label: 'barbershop_harmony_sync' },
  'sondheim_lyrics': { color: '#f4a460', label: 'sondheim_lyric_simulator' },
  'notation_viz_grp': { color: '#2e8b57', label: 'smt_notation_viz_group' },
  'neuro_listening': { color: '#fff5ee', label: 'neurodivergent_listening' },
  'minimalist_music_soc': { color: '#a0522d', label: 'soc_minimalist_music_sync' },
  'instructor_fsu': { color: '#c0c0c0', label: 'fsu_music_theory_dept' },
  'legacy_fellow': { color: '#87ceeb', label: 'legacy_fellow_recursion' }
};

export const LifeSlop: React.FC<LifeSlopProps> = ({ onClose, theme = 'gt.m' }) => {
  const [generation, setGridGeneration] = useState(0);
  const [population, setPopulation] = useState(0);
  const currentTheme = SLOP_THEMES[theme] || SLOP_THEMES['gt.m'];
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<number[][]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateEmptyGrid = () => {
    const rows = [];
    let pop = 0;
    for (let i = 0; i < ROWS; i++) {
      const row = Array.from(Array(COLS), () => {
        const alive = Math.random() > 0.8 ? 1 : 0;
        if (alive) pop++;
        return alive;
      });
      rows.push(row);
    }
    setPopulation(pop);
    return rows;
  };

  const draw = useCallback((ctx: CanvasRenderingContext2D, grid: number[][]) => {
    ctx.clearRect(0, 0, COLS * CELL_SIZE, ROWS * CELL_SIZE);
    ctx.fillStyle = currentTheme.color;
    
    // Set glow effect for canvas
    ctx.shadowBlur = 5;
    ctx.shadowColor = currentTheme.color;

    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (grid[i][j]) {
          ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
        }
      }
    }
  }, [currentTheme.color]);

  useEffect(() => {
    gridRef.current = generateEmptyGrid();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) draw(ctx, gridRef.current);
    }
  }, [draw]);

  const runSimulation = useCallback(() => {
    const g = gridRef.current;
    if (g.length === 0) return;

    let nextPop = 0;
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

        let state = 0;
        if (neighbors < 2 || neighbors > 3) {
          state = 0;
        } else if (g[i][j] === 0 && neighbors === 3) {
          state = 1;
        } else {
          state = g[i][j];
        }
        if (state) nextPop++;
        return state;
      });
    });

    gridRef.current = nextGrid;
    setGridGeneration(prev => prev + 1);
    setPopulation(nextPop);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) draw(ctx, nextGrid);
    }
  }, [draw]);

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
          <span>simulated_slop_environment: {currentTheme.label}</span>
          <button onClick={onClose}>×</button>
        </div>
        <div className="life-slop-stats">
          <span>gen: {generation}</span>
          <span>pop: {population}</span>
          <span>theme: {theme}</span>
        </div>
        <div className="life-slop-grid-canvas-container" style={{ background: '#111', padding: '5px' }}>
          <canvas 
            ref={canvasRef}
            width={COLS * CELL_SIZE}
            height={ROWS * CELL_SIZE}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
        <div style={{ padding: '0 10px 10px 10px' }}>
          <details className="text-small p-2" style={{ border: `1px dashed ${currentTheme.color}`, color: currentTheme.color }}>
            <summary style={{ cursor: 'pointer', opacity: 0.8 }}>how_does_this_cellular_<br/>automata_work.ts</summary>
            <pre style={{ wordBreak: 'break-all', fontSize: '0.8em', marginTop: '10px', color: currentTheme.color, background: '#000', padding: '10px', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
{`export function getNextGeneration(grid: number[][]): number[][] {
  const rows = grid.length;
  const cols = grid[0].length;
  const next = grid.map(row => [...row]);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let neighbors = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          const newR = r + i;
          const newC = c + j;
          if (newR >= 0 && newR < rows && newC >= 0 && newC < cols) {
            neighbors += grid[newR][newC];
          }
        }
      }

      // Conway Rules
      if (grid[r][c] === 1 && (neighbors < 2 || neighbors > 3)) {
        next[r][c] = 0;
      } else if (grid[r][c] === 0 && neighbors === 3) {
        next[r][c] = 1;
      }
    }
  }
  return next;
}`}
            </pre>
          </details>
        </div>
        <div className="life-slop-footer">
          caution: cellular automata optimized via html5 canvas
        </div>
      </div>
    </div>
  );
};
