import React, { useState, useEffect } from 'react';
import { DraggablePanel } from './DraggablePanel';

interface RegionData {
  region: string;
  pop: string;
  status: string;
}

export const ChaosPanel: React.FC = () => {
  const [data, setData] = useState<RegionData>({
    region: 'loading...',
    pop: '...',
    status: 'UNKNOWN'
  });

  useEffect(() => {
    const fetchRegion = async () => {
      try {
        const res = await fetch(`/infra/region?t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch region:', err);
      }
    };

    fetchRegion();
    const interval = setInterval(fetchRegion, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DraggablePanel className="chaos-panel border-green">
      <div className="panel-header bg-green">
        <span className="dot white-dot"></span>
        <span className="text-white">CHAOS_ENGINEERING_CORE_v1</span>
        <span className="header-right text-white">LIVE_METRICS</span>
      </div>
      <div className="panel-content bg-dark">
        <div className="flex-between text-green mb-2">
          <span>FAILOVER_STATUS</span>
          <span className="blink">{data.status}</span>
        </div>
        
        <div className="grid-2-col mt-4 text-green">
          <div>
            <div className="text-small opacity-50">active_geo_region</div>
            <div className="text-large">{data.region}</div>
          </div>
          <div>
            <div className="text-small opacity-50">pop_ingress</div>
            <div className="text-large">{data.pop}</div>
          </div>
        </div>

        <div className="mt-4 p-2 border-green-dashed text-small text-green">
          <div className="mb-1">!! EDGE ROUTING ACTIVE !!</div>
          <div>0% downtime failover via Cloudflare Worker. Pressing the GREEN BUTTON triggers an instantaneous global PoP migration via KV state swap.</div>
          <details className="mt-2 text-small p-2" style={{ borderTop: '1px dashed #00ff00' }}>
            <summary style={{ cursor: 'pointer', opacity: 0.8 }}>how_does_this_cloudflare_worker_work.ts</summary>
            <pre style={{ overflowX: 'auto', fontSize: '0.8em', marginTop: '10px', color: '#00ff00', background: '#000', padding: '10px', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
{`export interface Region {
  id: string;
  url: string;
}

export interface Env {
  CHAOS_STATE: KVNamespace;
  REGIONS_JSON: string; // Dynamic list from wrangler.toml
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const regions: Region[] = JSON.parse(env.REGIONS_JSON);

    // 1. Handle Chaos Toggle Endpoint (Dynamic 3+ way rotation)
    if (url.pathname === '/infra/failover' && request.method === 'POST') {
      const currentId = await env.CHAOS_STATE.get('ACTIVE_REGION') || regions[0].id;
      
      const currentIndex = regions.findIndex(r => r.id === currentId);
      const nextIndex = (currentIndex + 1) % regions.length;
      const nextRegion = regions[nextIndex];
      
      await env.CHAOS_STATE.put('ACTIVE_REGION', nextRegion.id);
      
      return new Response(JSON.stringify({
        message: \\\`Edge Failover Initiated (\${currentIndex + 1}/\${regions.length})\\\`,
        target_region: nextRegion.id,
        eta: '0 seconds (Instant Edge Swap)'
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 2. Handle Region Metadata Endpoint
    if (url.pathname === '/infra/region') {
      const activeId = await env.CHAOS_STATE.get('ACTIVE_REGION') || regions[0].id;
      return new Response(JSON.stringify({
        region: activeId,
        pop: request.cf?.colo || 'unknown',
        status: 'Stable (Edge Proxied)'
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 3. Proxy all other traffic to the active origin
    const activeId = await env.CHAOS_STATE.get('ACTIVE_REGION') || regions[0].id;
    const activeRegion = regions.find(r => r.id === activeId) || regions[0];
    const origin = activeRegion.url;
    
    const proxyUrl = new URL(url.pathname + url.search, origin);
    const proxyRequest = new Request(proxyUrl, request);
    
    // Set headers for the origin
    proxyRequest.headers.set('Host', new URL(origin).host);
    proxyRequest.headers.set('X-Forwarded-Host', url.host);

    return fetch(proxyRequest);
  },
};`}
            </pre>
          </details>
        </div>

        <div className="text-muted text-right text-small mt-2">gcp_loadbalancer_mutator // v1.0</div>
      </div>
    </DraggablePanel>
  );
};
