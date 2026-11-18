import React from 'react';
import './BouncingSlop.css';

interface BouncingSlopProps {
  speed?: number;
  isPanic?: boolean;
  inViewport?: boolean;
}

const SLOP_SEGMENT = Array(40).fill("slopn't ").join('');

export const BouncingSlop: React.FC<BouncingSlopProps> = ({
  speed = 15,
  isPanic = false,
  inViewport = false,
}) => {
  return (
    <div
      className={`slop-container ${inViewport ? 'slop-container-viewport' : ''} ${
        isPanic ? 'slop-container-panic' : ''
      }`}
    >
      <div className="marquee-track" style={{ animationDuration: `${speed}s` }}>
        <span className="marquee-segment">{SLOP_SEGMENT}</span>
        <span className="marquee-segment" aria-hidden="true">{SLOP_SEGMENT}</span>
      </div>
    </div>
  );
};

