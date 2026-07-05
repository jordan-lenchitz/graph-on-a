import React, { useState, useEffect, useRef } from 'react';
import './ZeroTrustAuth.css';

interface ZeroTrustAuthProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const ZeroTrustAuth: React.FC<ZeroTrustAuthProps> = ({ onSuccess, onClose }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('');
  
  // Step 2 state
  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef<number | null>(null);

  // Step 3 state
  const [logs, setLogs] = useState<string[]>([]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, []);

  const handleStartHold = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // prevent text selection/magnifier on mobile
    if (holdIntervalRef.current) return;
    
    setHoldProgress(0);
    let progress = 0;
    
    holdIntervalRef.current = window.setInterval(() => {
      progress += 2; // 2% per 50ms = 100% in 2.5s
      setHoldProgress(progress);
      
      if (progress >= 100) {
        if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
        setStep(3);
      }
    }, 50);
  };

  const handleEndHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
      if (holdProgress < 100) {
        setHoldProgress(0); // reset if they let go too early
      }
    }
  };

  useEffect(() => {
    if (step === 3) {
      const fakeLogs = [
        'Initiating Zero-Trust Device Posture Assessment...',
        'Checking EDR agent status... [OK]',
        'Verifying OS kernel integrity... [OK]',
        'Scanning for unauthorized slop... [WARNING: Slop detected]',
        'Applying compensating controls... [OK]',
        'Connecting to Avian Carrier network... [OK]',
        'Verifying quantum entanglement... [OK]',
        'Issuing Enterprise Security Token...'
      ];

      let currentLog = 0;
      setLogs([]); // Reset logs when entering step 3
      
      const logInterval = setInterval(() => {
        if (currentLog < fakeLogs.length) {
          const nextLog = fakeLogs[currentLog];
          if (nextLog) {
            setLogs(prev => [...prev, nextLog]);
          }
          currentLog++;
        } else {
          clearInterval(logInterval);
          setTimeout(() => {
            setStep(4);
          }, 1000);
        }
      }, 600);

      return () => clearInterval(logInterval);
    }
  }, [step]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.length > 0) {
      setStep(2);
    }
  };

  return (
    <div className="zt-overlay">
      <div className="zt-modal">
        <button className="zt-close" onClick={onClose}>&times;</button>
        <div className="zt-header">
          <div className="zt-logo">🔒</div>
          <h2>enterprise SSO</h2>
          <p>zero-trust security perimeter</p>
        </div>

        <div className="zt-body">
          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="zt-form">
              <label>corporate identity</label>
              <input 
                type="text" 
                placeholder="user@enterprise.local" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
              <button type="submit" className="zt-btn-primary">Next</button>
            </form>
          )}

          {step === 2 && (
            <div className="zt-step-2">
              <h3>hardware attestation required</h3>
              <p>please insert your FIDO2 security key and touch the sensor, or perform a manual biometric override.</p>
              
              <div 
                className={`zt-hardware-key ${holdProgress > 0 ? 'active' : ''}`}
                onMouseDown={handleStartHold}
                onMouseUp={handleEndHold}
                onMouseLeave={handleEndHold}
                onTouchStart={handleStartHold}
                onTouchEnd={handleEndHold}
                onTouchCancel={handleEndHold}
              >
                <div className="zt-fingerprint">👆</div>
                <span>hold to verify</span>
                <div className="zt-progress-bg">
                  <div className="zt-progress-bar" style={{ width: `${holdProgress}%` }}></div>
                </div>
              </div>
              <p className="zt-hint">press and hold until verification completes.</p>
            </div>
          )}

          {step === 3 && (
            <div className="zt-step-3">
              <h3>device posture check</h3>
              <div className="zt-terminal">
                {logs.map((log, i) => (
                  <div key={i} className={`zt-log ${log?.includes('WARNING') ? 'warning' : ''}`}>
                    &gt; {log || ''}
                  </div>
                ))}
                <div className="zt-cursor">_</div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="zt-step-4">
              <div className="zt-success-icon">✅</div>
              <h3>authentication successful</h3>
              <p>your identity has been cryptographically verified.</p>
              <button type="button" className="zt-btn-primary" onClick={onSuccess}>proceed to intranet</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
