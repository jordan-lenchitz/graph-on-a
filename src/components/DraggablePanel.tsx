import React, { useState, useRef, useEffect } from 'react';

interface DraggablePanelProps {
  className?: string;
  children: React.ReactNode;
  onDrag?: () => void;
  onDragStart?: () => void;
}

export const DraggablePanel: React.FC<DraggablePanelProps> = ({ className, children, onDrag, onDragStart }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });

  const startDrag = (clientX: number, clientY: number, target: EventTarget) => {
    // Only initiate drag if the user clicks within the header
    if ((target as HTMLElement).closest('.panel-header')) {
      setIsDragging(true);
      dragStart.current = { x: clientX, y: clientY };
      offsetStart.current = { ...offset };
      if (onDragStart) onDragStart();
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    startDrag(e.clientX, e.clientY, e.target);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Use the first touch point
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY, e.target);
  };

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;
      const dx = clientX - dragStart.current.x;
      const dy = clientY - dragStart.current.y;
      setOffset({ x: offsetStart.current.x + dx, y: offsetStart.current.y + dy });
      if (onDrag) onDrag();
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent default scrolling when dragging
      if (isDragging) {
        e.preventDefault(); 
      }
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };
    
    const handleUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleUp);
      window.addEventListener('touchcancel', handleUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleUp);
      window.removeEventListener('touchcancel', handleUp);
    };
  }, [isDragging]);

  return (
    <div 
      className={`panel ${className || ''}`}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {children}
    </div>
  );
};
