import React from 'react';

interface RecursiveSiteProps {
  depth?: number;
  maxDepth?: number;
  onDepthReach?: (depth: number) => void;
}

export const RecursiveSite: React.FC<RecursiveSiteProps> = ({ 
  depth = 1, 
  maxDepth = 15,
  onDepthReach 
}) => {
  const isMobile = window.innerWidth <= 768;
  const effectiveMaxDepth = isMobile ? Math.min(maxDepth, 6) : maxDepth;

  if (depth > effectiveMaxDepth) return null;

  const handleMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDepthReach) {
      onDepthReach(depth);
    }
  };

  const scale = 0.85;
  const rotation = 3; // slight rotation per layer

  const borderColors = ['#ff0000', '#00ff00', '#ff00ff', '#00ffff'];
  const borderColor = borderColors[depth % borderColors.length];

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
        border: `2px solid ${borderColor}`,
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: isMobile ? 'none' : '0 0 10px rgba(0,0,0,0.2)',
      }}
    >
      <span style={{ position: 'absolute', top: 10, left: 10, color: 'rgba(0,0,0,0.5)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
        Layer_{depth < 10 ? `0${depth}` : depth}
      </span>
      <RecursiveSite depth={depth + 1} maxDepth={maxDepth} onDepthReach={onDepthReach} />
    </div>
  );
};
