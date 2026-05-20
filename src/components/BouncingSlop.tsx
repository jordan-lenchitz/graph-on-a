import React from 'react';
import './BouncingSlop.css';

interface BouncingSlopProps {
  speed?: number;
}

export const BouncingSlop: React.FC<BouncingSlopProps> = ({ speed = 15 }) => {
  return (
    <div className="slop-container">
      <div className="marquee" style={{ animationDuration: `${speed}s` }}>
        {Array(20).fill("slopn't ").join('')}
      </div>
    </div>
  );
};

