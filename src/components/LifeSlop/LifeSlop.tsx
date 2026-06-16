import React, { useState, useEffect, useCallback, useRef } from 'react';
import './LifeSlop.css';

interface LifeSlopProps {
  onClose: () => void;
  theme?: string;
}

const ROWS = 40;
const COLS = 60;
const CELL_SIZE = 10;

import { SLOP_THEMES } from './themes';

export const LifeSlop: React.FC<LifeSlopProps> = ({ onClose, theme = 'gt.m' }) => {
  const [generation, setGridGeneration] = useState(0);
  const [population, setPopulation] = useState(0);
  const currentTheme = SLOP_THEMES[theme] || SLOP_THEMES['gt.m'];
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<number[][]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateEmptyGrid = () => {
    const rows = [];
    let pop = 0;
    for (let i = 0; i < ROWS; i++) {
      const row = Array.from(Array(COLS), () => {
        const alive = Math.random() > 0.8 ? 1 : 0;
        if (alive) pop++;
        return alive;
      });
      rows.push(row);
    }
    setPopulation(pop);
    return rows;
  };

  const draw = useCallback((ctx: CanvasRenderingContext2D, grid: number[][]) => {
    ctx.clearRect(0, 0, COLS * CELL_SIZE, ROWS * CELL_SIZE);
    ctx.fillStyle = currentTheme.color;
    
    // Set glow effect for canvas
    ctx.shadowBlur = 5;
    ctx.shadowColor = currentTheme.color;

    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (grid[i][j]) {
          ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
        }
      }
    }
  }, [currentTheme.color]);

  useEffect(() => {
    gridRef.current = generateEmptyGrid();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) draw(ctx, gridRef.current);
    }
  }, [draw]);

  const runSimulation = useCallback(() => {
    const g = gridRef.current;
    if (g.length === 0) return;

    let nextPop = 0;
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

        let state = 0;
        if (neighbors < 2 || neighbors > 3) {
          state = 0;
        } else if (g[i][j] === 0 && neighbors === 3) {
          state = 1;
        } else {
          state = g[i][j];
        }
        if (state) nextPop++;
        return state;
      });
    });

    gridRef.current = nextGrid;
    setGridGeneration(prev => prev + 1);
    setPopulation(nextPop);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) draw(ctx, nextGrid);
    }
  }, [draw]);

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
          <span>simulated_slop_environment: {currentTheme.label}</span>
          <button onClick={onClose}>×</button>
        </div>
        <div className="life-slop-stats">
          <span>gen: {generation}</span>
          <span>pop: {population}</span>
          <span>theme: {theme}</span>
        </div>
        <div className="life-slop-grid-canvas-container" style={{ background: '#111', padding: '5px' }}>
          <canvas 
            ref={canvasRef}
            width={COLS * CELL_SIZE}
            height={ROWS * CELL_SIZE}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
        <div style={{ padding: '0 10px 10px 10px' }}>
          <details className="text-small p-2" style={{ border: `1px dashed ${currentTheme.color}`, color: currentTheme.color }}>
            <summary style={{ cursor: 'pointer', opacity: 0.8 }}>how_does_this_cellular_<br/>automata_work.ts</summary>
            <pre style={{ wordBreak: 'break-all', fontSize: '0.8em', marginTop: '10px', color: currentTheme.color, background: '#000', padding: '10px', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
{`export function getNextGeneration(grid: number[][]): number[][] {
  const rows = grid.length;
  const cols = grid[0].length;
  const next = grid.map(row => [...row]);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let neighbors = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          const newR = r + i;
          const newC = c + j;
          if (newR >= 0 && newR < rows && newC >= 0 && newC < cols) {
            neighbors += grid[newR][newC];
          }
        }
      }

      // Conway Rules
      if (grid[r][c] === 1 && (neighbors < 2 || neighbors > 3)) {
        next[r][c] = 0;
      } else if (grid[r][c] === 0 && neighbors === 3) {
        next[r][c] = 1;
      }
    }
  }
  return next;
}`}
            </pre>
          </details>
        </div>
        <div className="life-slop-footer">
          caution: cellular automata optimized via html5 canvas
        </div>
      </div>
    </div>
  );
};
