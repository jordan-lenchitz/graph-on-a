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
        const res = await fetch('/api/region');
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
    <DraggablePanel className="chaos-panel border-red">
      <div className="panel-header bg-red">
        <span className="dot white-dot"></span>
        <span className="text-white">CHAOS_ENGINEERING_CORE_v1</span>
        <span className="header-right text-white">LIVE_METRICS</span>
      </div>
      <div className="panel-content bg-dark">
        <div className="flex-between text-red mb-2">
          <span>FAILOVER_STATUS</span>
          <span className="blink">{data.status}</span>
        </div>
        
        <div className="grid-2-col mt-4 text-red">
          <div>
            <div className="text-small opacity-50">active_geo_region</div>
            <div className="text-large">{data.region}</div>
          </div>
          <div>
            <div className="text-small opacity-50">pop_ingress</div>
            <div className="text-large">{data.pop}</div>
          </div>
        </div>

        <div className="mt-4 p-2 border-red-dashed text-small text-red">
          <div className="mb-1">!! ATTENTION !!</div>
          <div>Pressing the RED BUTTON will evacuate all traffic from the current region. 
          Expect 100% downtime for 2-5 minutes during global DNS propagation.</div>
        </div>

        <div className="text-muted text-right text-small mt-2">gcp_loadbalancer_mutator // v1.0</div>
      </div>
    </DraggablePanel>
  );
};
