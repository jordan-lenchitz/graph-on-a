import React, { useRef, useState, useEffect } from 'react';
import { DraggablePanel } from './DraggablePanel';

export const RealGrafanaPanel: React.FC = () => {
  const lastSpikeRef = useRef<number>(0);
  const [metrics, setMetrics] = useState({
    slop: 14.2,
    entropy: 99.9,
    void_calls: 0,
    recursion_depth: 5
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        slop: +(prev.slop + (Math.random() * 2 - 0.8)).toFixed(1),
        entropy: Math.min(100, +(prev.entropy + (Math.random() * 0.5 - 0.2)).toFixed(2)),
        void_calls: prev.void_calls + Math.floor(Math.random() * 3),
        recursion_depth: prev.recursion_depth
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInteract = () => {
    const now = Date.now();
    if (now - lastSpikeRef.current > 100) {
      lastSpikeRef.current = now;
      setMetrics(prev => ({
        ...prev,
        slop: +(prev.slop + 5.5).toFixed(1),
        void_calls: prev.void_calls + 10
      }));
    }
  };

  return (
    <DraggablePanel 
      className="grafana-real-panel" 
      onDrag={handleInteract} 
      onDragStart={handleInteract}
    >
      <div 
        className="panel-header bg-darker" 
        onMouseMove={handleInteract} 
        onClick={handleInteract}
        style={{ cursor: 'move' }}
      >
        <span className="text-orange">📊</span>
        <span>REAL GRAFANA INSTANCE (SIMULATED)</span>
        <span className="header-right text-red blink">● LIVE</span>
      </div>
      <div 
        className="panel-content" 
        style={{ 
          padding: '15px', 
          height: '400px', 
          width: '600px', 
          backgroundColor: '#111217',
          color: '#c8d4e4',
          fontFamily: 'monospace',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          boxSizing: 'border-box'
        }} 
        onMouseMove={handleInteract}
        onClick={handleInteract}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {/* Slop Metric */}
          <div style={{ background: '#181b1f', border: '1px solid #2c3235', padding: '10px', borderRadius: '4px' }}>
            <div style={{ fontSize: '12px', color: '#8e969c', marginBottom: '5px' }}>Recursive Slop Volume (Tb/s)</div>
            <div style={{ fontSize: '28px', color: '#ff9830' }}>{metrics.slop}</div>
            <div style={{ height: '4px', background: '#2c3235', marginTop: '10px', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (metrics.slop / 100) * 100)}%`, height: '100%', background: '#ff9830', transition: 'width 0.2s' }}></div>
            </div>
          </div>

          {/* Entropy Metric */}
          <div style={{ background: '#181b1f', border: '1px solid #2c3235', padding: '10px', borderRadius: '4px' }}>
            <div style={{ fontSize: '12px', color: '#8e969c', marginBottom: '5px' }}>System Entropy</div>
            <div style={{ fontSize: '28px', color: '#73bf69' }}>{metrics.entropy}%</div>
            <div style={{ height: '4px', background: '#2c3235', marginTop: '10px', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${metrics.entropy}%`, height: '100%', background: '#73bf69', transition: 'width 0.2s' }}></div>
            </div>
          </div>

          {/* Void Calls */}
          <div style={{ background: '#181b1f', border: '1px solid #2c3235', padding: '10px', borderRadius: '4px' }}>
            <div style={{ fontSize: '12px', color: '#8e969c', marginBottom: '5px' }}>/dev/null API Calls</div>
            <div style={{ fontSize: '28px', color: '#8ab8ff' }}>{metrics.void_calls}</div>
            <div style={{ fontSize: '10px', color: '#57606a', marginTop: '5px' }}>↑ {Math.floor(Math.random() * 50)}/sec</div>
          </div>

          {/* YDB Status */}
          <div style={{ background: '#181b1f', border: '1px solid #2c3235', padding: '10px', borderRadius: '4px' }}>
            <div style={{ fontSize: '12px', color: '#8e969c', marginBottom: '5px' }}>YottaDB Sync Status</div>
            <div style={{ fontSize: '24px', color: '#f2495c', marginTop: '5px' }}>DESYNCHRONIZED</div>
            <div style={{ fontSize: '10px', color: '#f2495c', marginTop: '5px' }}>ERROR: Too much slop.</div>
          </div>
        </div>

        {/* Fake Graph */}
        <div style={{ background: '#181b1f', border: '1px solid #2c3235', padding: '10px', borderRadius: '4px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '12px', color: '#8e969c', marginBottom: '10px' }}>Global Absurdity Over Time</div>
          <div style={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
            {Array.from({ length: 40 }).map((_, i) => (
              <div 
                key={i}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: `${(i / 40) * 100}%`,
                  width: '2%',
                  height: `${20 + Math.random() * 80}%`,
                  background: `linear-gradient(to top, rgba(115, 191, 105, 0.2), rgba(115, 191, 105, 0.8))`,
                  borderTop: '2px solid #73bf69',
                  transition: 'height 0.5s'
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </DraggablePanel>
  );
};
