import React from 'react';
import './BouncingSlop.css';

interface BouncingSlopProps {
  speed?: number;
  isPanic?: boolean;
}

export const BouncingSlop: React.FC<BouncingSlopProps> = ({ speed = 15, isPanic = false }) => {
  return (
    <div className={`slop-container ${isPanic ? 'slop-container-panic' : ''}`}>
      <div className="marquee" style={{ animationDuration: `${speed}s` }}>
        {Array(20).fill("slopn't ").join('')}
      </div>
    </div>
  );
};

