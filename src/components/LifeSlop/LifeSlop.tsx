import React, { useState, useEffect, useCallback, useRef } from 'react';
import './LifeSlop.css';

interface LifeSlopProps {
  onClose: () => void;
  theme?: string;
}

const ROWS = 40;
const COLS = 60;

const themes: Record<string, { color: string, label: string }> = {
  'gt.m': { color: '#00ff00', label: 'FIS GT.M V7.0-002' },
  'just_intonation': { color: '#00ffff', label: 'JI_BLEND_RATIO_SYNC' },
  'arch_btw': { color: '#1793d1', label: 'ARCH_LINUX_KERNEL_SLOP' },
  'yottadb': { color: '#ff9830', label: 'YottaDB_R206' }
};

export const LifeSlop: React.FC<LifeSlopProps> = ({ onClose, theme = 'gt.m' }) => {
  const [grid, setGrid] = useState<number[][]>([]);
  const [generation, setGridGeneration] = useState(0);
  const currentTheme = themes[theme] || themes['gt.m'];
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateEmptyGrid = () => {
    const rows = [];
    for (let i = 0; i < ROWS; i++) {
      rows.push(Array.from(Array(COLS), () => (Math.random() > 0.8 ? 1 : 0)));
    }
    return rows;
  };

  useEffect(() => {
    setGrid(generateEmptyGrid());
  }, []);

  const runSimulation = useCallback(() => {
    setGrid((g) => {
      if (g.length === 0) return g;
      const nextGrid = g.map((row, i) => {
        return row.map((_, j) => {
          let neighbors = 0;
          const directions = [
            [0, 1], [0, -1], [1, -1], [-1, 1],
            [1, 1], [-1, -1], [1, 0], [-1, 0]
          ];
          directions.forEach(([x, y]) => {
            const newI = i + x;
            const newJ = j + y;
            if (newI >= 0 && newI < ROWS && newJ >= 0 && newJ < COLS) {
              neighbors += g[newI][newJ];
            }
          });

          if (neighbors < 2 || neighbors > 3) {
            return 0;
          } else if (g[i][j] === 0 && neighbors === 3) {
            return 1;
          } else {
            return g[i][j];
          }
        });
      });
      return nextGrid;
    });
    setGridGeneration(prev => prev + 1);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(runSimulation, 150);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [runSimulation]);

  return (
    <div className="life-slop-overlay">
      <div className="life-slop-window" style={{ borderColor: currentTheme.color }}>
        <div className="life-slop-header" style={{ backgroundColor: currentTheme.color }}>
          <span>SIMULATED_SLOP_ENVIRONMENT: {currentTheme.label}</span>
          <button onClick={onClose}>×</button>
        </div>
        <div className="life-slop-stats">
          <span>GEN: {generation}</span>
          <span>POP: {grid.flat().filter(x => x === 1).length}</span>
          <span>THEME: {theme}</span>
        </div>
        <div className="life-slop-grid">
          {grid.map((row, i) =>
            row.map((_, k) => (
              <div
                key={`${i}-${k}`}
                className={`life-cell ${grid[i][k] ? 'alive' : ''}`}
                style={{
                  backgroundColor: grid[i][k] ? currentTheme.color : undefined,
                  boxShadow: grid[i][k] ? `0 0 5px ${currentTheme.color}` : undefined
                }}
              />
            ))
          )}
        </div>
        <div className="life-slop-footer">
          CAUTION: CELLULAR AUTOMATA LEAKING INTO VIRTUAL DOM
        </div>
      </div>
    </div>
  );
};
