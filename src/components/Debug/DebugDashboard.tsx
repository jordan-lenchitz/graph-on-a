import { useEffect, useState, useRef } from 'react';
import './DebugDashboard.css';

interface DebugData {
  service_name: string;
  revision: string;
  region: string;
  status: string;
  target: string;
  uptime: number;
  memory_usage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  timestamp: string;
  headers: Record<string, string>;
  obscure_telemetry: any;
}

export function DebugDashboard() {
  const [data, setData] = useState<DebugData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [browserData, setBrowserData] = useState<any>({});
  const [epoch, setEpoch] = useState(Math.floor(Date.now() / 1000));
  
  const lastIdentity = useRef('');

  useEffect(() => {
    const fetchDebugData = async () => {
      try {
        const url = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/infra/debug` : '/infra/debug';
        const res = await fetch(url);
        if (!res.ok) throw new Error('failed to fetch debug data');
        const json = await res.json();
        
        // only update state if the service identity or status changes
        const identity = `${json.service_name}-${json.region}-${json.status}`;
        if (lastIdentity.current !== identity) {
          lastIdentity.current = identity;
          setData(json);
        }
        setError(null);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchDebugData();
    const interval = setInterval(fetchDebugData, 1000); // Poll silently
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // gather silly amounts of browser telemetry just ONCE on mount
    const updateBrowserData = async () => {
      const nav = navigator as any;
      
      let battery = null;
      if (nav.getBattery) {
        try {
          const b = await nav.getBattery();
          battery = { level: b.level, charging: b.charging };
        } catch (e) {}
      }

      setBrowserData({
        user_agent: nav.userAgent,
        platform: nav.platform,
        language: nav.language,
        languages: nav.languages,
        cookie_enabled: nav.cookieEnabled,
        do_not_track: nav.doNotTrack,
        hardware_concurrency: nav.hardwareConcurrency,
        device_memory_gb: nav.deviceMemory,
        max_touch_points: nav.maxTouchPoints,
        pdf_viewer_enabled: nav.pdfViewerEnabled,
        webdriver: nav.webdriver,
        connection: nav.connection ? {
          effective_type: nav.connection.effectiveType,
          downlink_mbps: nav.connection.downlink,
          rtt_ms: nav.connection.rtt,
          save_data: nav.connection.saveData
        } : 'unknown',
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          color_depth: window.screen.colorDepth,
          pixel_depth: window.screen.pixelDepth,
          orientation: window.screen.orientation?.type
        },
        window: {
          inner_width: window.innerWidth,
          inner_height: window.innerHeight,
          device_pixel_ratio: window.devicePixelRatio,
          history_length: window.history.length
        },
        battery: battery || 'unknown',
        geolocation: 'permission_required_skipping',
        random_entropy: Math.random()
      });
    };

    updateBrowserData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!data && !error) {
    return <div className="debug-loading">initializing...</div>;
  }

  const isStable = data?.status === 'stable' || data?.status === 'Stable';
  const statusColor = isStable ? '#00ff41' : '#ffea00';

  return (
    <div className="debug-dashboard">
      <div className="debug-header">
        <h1>realtime telemetry</h1>
        <div className="status-indicator">
          <span className="epoch-display">unix_epoch: {epoch}</span>
          <span className="status-dot" style={{ backgroundColor: statusColor, boxShadow: `0 0 10px ${statusColor}` }}></span>
          <span className="status-text" style={{ color: statusColor }}>{data?.status?.toLowerCase() || 'unknown'}</span>
        </div>
      </div>

      <div className="debug-grid">
        <div className="debug-card primary-card">
          <h2>server identity</h2>
          <div className="metric">
            <span className="label">service_name:</span>
            <span className="value highlight">{data?.service_name?.toLowerCase() || 'n/a'}</span>
          </div>
          <div className="metric">
            <span className="label">region:</span>
            <span className="value">{data?.region?.toLowerCase() || 'n/a'}</span>
          </div>
          <div className="metric">
            <span className="label">revision:</span>
            <span className="value">{data?.revision?.toLowerCase() || 'n/a'}</span>
          </div>
        </div>

        <div className="debug-card secondary-card">
          <h2>static server vitals (frozen)</h2>
          <div className="metric">
            <span className="label">uptime:</span>
            <span className="value">{data?.uptime ? `${data.uptime.toFixed(2)}s` : '0s'}</span>
          </div>
          <div className="metric">
            <span className="label">memory (rss):</span>
            <span className="value">{data?.memory_usage?.rss ? `${(data.memory_usage.rss / 1024 / 1024).toFixed(2)} mb` : '0 mb'}</span>
          </div>
          <div className="metric">
            <span className="label">heap used:</span>
            <span className="value">{data?.memory_usage?.heapUsed ? `${(data.memory_usage.heapUsed / 1024 / 1024).toFixed(2)} mb` : '0 mb'}</span>
          </div>
          <div className="metric">
            <span className="label">timestamp:</span>
            <span className="value">{data?.timestamp?.toLowerCase()}</span>
          </div>
        </div>

        <div className="debug-card full-width">
          <h2>agent-reported data</h2>
          <pre className="headers-log">
            {JSON.stringify(browserData, null, 2).toLowerCase()}
          </pre>
        </div>

        <div className="debug-card full-width">
          <h2>incoming headers (remote)</h2>
          <pre className="headers-log">
            {JSON.stringify(
              data?.headers ? Object.keys(data.headers).sort().reduce((acc, key) => {
                acc[key] = data.headers[key];
                return acc;
              }, {} as Record<string, string>) : {}, 
              null, 2
            ).toLowerCase()}
          </pre>
        </div>

        <div className="debug-card full-width">
          <h2>esoteric google cloud run instance telemetry</h2>
          <pre className="headers-log">
            {JSON.stringify(data?.obscure_telemetry, null, 2).toLowerCase()}
          </pre>
        </div>
      </div>

      {error && (
        <div className="debug-error">
          error: {error.toLowerCase()}
        </div>
      )}
    </div>
  );
}
