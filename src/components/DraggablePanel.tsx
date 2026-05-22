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

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only initiate drag if the user clicks/touches within the header
    if ((e.target as HTMLElement).closest('.panel-header')) {
      // Prevent text selection while dragging
      e.preventDefault();
      // Only capture primary pointer (prevents multi-touch weirdness)
      if (!e.isPrimary) return;
      
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      offsetStart.current = { ...offset };
      
      // Capture the pointer to ensure we don't lose the event if it leaves the window briefly
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      
      if (onDragStart) onDragStart();
    }
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || !e.isPrimary) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setOffset({ x: offsetStart.current.x + dx, y: offsetStart.current.y + dy });
      if (onDrag) onDrag();
    };
    
    const handlePointerUp = (e: PointerEvent) => {
      if (isDragging && e.isPrimary) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    }
    
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging]);

  return (
    <div 
      className={`panel ${className || ''}`}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      onPointerDown={handlePointerDown}
    >
      {children}
    </div>
  );
};
