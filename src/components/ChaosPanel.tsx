import React, { useState, useEffect } from 'react';
import { DraggablePanel } from './DraggablePanel';
import { QuineCodeBlock } from './QuineCodeBlock';
import ChaosPanelRaw from './ChaosPanel.tsx?raw';

export interface RegionData {
  region: string;
  pop: string;
  status: string;
  target?: string;
}

interface ChaosPanelProps {
  onRegionUpdate?: (data: RegionData) => void;
}

export const ChaosPanel: React.FC<ChaosPanelProps> = ({ onRegionUpdate }) => {
  const [data, setData] = useState<RegionData>({
    region: 'loading...',
    pop: '...',
    status: 'UNKNOWN',
  });

  useEffect(() => {
    const fetchRegion = async () => {
      try {
        const res = await fetch(`/infra/region?t=${Date.now()}`);
        if (res.ok) {
          const json: RegionData = await res.json();
          setData(json);
          if (onRegionUpdate) onRegionUpdate(json);
        }
      } catch (err) {
        console.error('Failed to fetch region:', err);
      }
    };

    fetchRegion();
    const interval = setInterval(fetchRegion, 5000);
    return () => clearInterval(interval);
  }, [onRegionUpdate]);

  const workerSnippet = `// live_edge_state: region="${data.region}" | pop="${data.pop}" | status="${data.status}"
export interface Region {
  id: string;
  url: string;
}

export interface Env {
  CHAOS_STATE: KVNamespace;
  REGIONS_JSON: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const regions: Region[] = JSON.parse(env.REGIONS_JSON);

    if (url.pathname === '/infra/failover' && request.method === 'POST') {
      const currentId = (await env.CHAOS_STATE.get('ACTIVE_REGION')) || regions[0].id;
      const currentIndex = regions.findIndex((r) => r.id === currentId);
      const nextIndex = (currentIndex + 1) % regions.length;
      const nextRegion = regions[nextIndex];

      await env.CHAOS_STATE.put('ACTIVE_REGION', nextRegion.id);

      return new Response(
        JSON.stringify({
          message: \`Edge Failover Initiated (\${currentIndex + 1}/\${regions.length})\`,
          target_region: nextRegion.id,
          eta: '0 seconds (Instant Edge Swap)',
        }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    if (url.pathname === '/infra/region') {
      const activeId = (await env.CHAOS_STATE.get('ACTIVE_REGION')) || regions[0].id;
      return new Response(
        JSON.stringify({
          region: activeId,
          pop: (request as any).cf?.colo || 'unknown',
          status: 'Stable (Edge Proxied)',
        }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const activeId = (await env.CHAOS_STATE.get('ACTIVE_REGION')) || regions[0].id;
    const activeRegion = regions.find((r) => r.id === activeId) || regions[0];
    const origin = activeRegion.url;

    const proxyUrl = new URL(url.pathname + url.search, origin);
    const proxyRequest = new Request(proxyUrl, request);
    proxyRequest.headers.set('Host', new URL(origin).host);
    proxyRequest.headers.set('X-Forwarded-Host', url.host);

    return fetch(proxyRequest);
  },
};`;

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
          <div className="mb-1">!! edge routing active yes !!</div>
          <div>
            0% downtime failover via Cloudflare Worker pressing the GREEN BUTTON triggers an
            instantaneous global PoP migration via KV state swap.
          </div>
          <QuineCodeBlock
            summary={
              <>
                how_does_this_cloudflare_
                <br />
                worker_work.ts
              </>
            }
            snippet={workerSnippet}
            rawSource={ChaosPanelRaw}
            rawFilename="src/components/ChaosPanel.tsx"
            color="#00ff00"
          />
        </div>

        <div className="text-muted text-right text-small mt-2">gcp_loadbalancer_mutator // v1.0</div>
      </div>
    </DraggablePanel>
  );
};
