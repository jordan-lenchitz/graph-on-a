import React, { useState } from 'react';
import './GiantRedButton.css';

export const GiantRedButton: React.FC = () => {
  const [isFailingOver, setIsFailingOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFailover = async () => {
    if (!window.confirm("WARNING: This will take the site DOWN globally for 2-5 minutes while we swap regions. Proceed?")) {
      return;
    }

    setIsFailingOver(true);
    setError(null);

    try {
      const res = await fetch('/api/failover', { method: 'POST' });
      if (!res.ok) throw new Error('Failover rejected by infrastructure.');
      
      const data = await res.json();
      alert(`FAILOVER INITIATED: Routing to ${data.target_region}. Goodbye.`);
    } catch (err: any) {
      setError(err.message);
      setIsFailingOver(false);
    }
  };

  return (
    <div className="giant-red-button-container">
      <button 
        className={`giant-red-button ${isFailingOver ? 'is-failing-over' : ''}`}
        onClick={handleFailover}
        disabled={isFailingOver}
        title="TRIGGER GLOBAL GEO-FAILOVER"
      >
        {isFailingOver ? 'EVAC' : 'FAILOVER'}
      </button>
      {error && <div className="failover-error">{error}</div>}
    </div>
  );
};
