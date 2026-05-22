import React, { useRef } from 'react';
import type { CSSProperties } from 'react';

interface DraggablePanelProps {
  className?: string;
  children: React.ReactNode;
  onDrag?: () => void;
  onDragStart?: () => void;
}

export const DraggablePanel: React.FC<DraggablePanelProps> = ({ className, children, onDrag, onDragStart }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const currentOffset = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Disable dragging on mobile screens
    if (window.innerWidth <= 768) return;

    // Only initiate drag if the user clicks/touches within the header
    if ((e.target as HTMLElement).closest('.panel-header')) {
      if (!e.isPrimary) return;
      
      isDragging.current = true;
      startPos.current = { x: e.clientX, y: e.clientY };
      
      if (panelRef.current) {
        panelRef.current.setPointerCapture(e.pointerId);
      }
      if (onDragStart) onDragStart();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !e.isPrimary) return;
    
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    
    currentOffset.current.x += dx;
    currentOffset.current.y += dy;
    
    if (panelRef.current) {
      panelRef.current.style.transform = `translate(${currentOffset.current.x}px, ${currentOffset.current.y}px)`;
    }
    
    startPos.current = { x: e.clientX, y: e.clientY };
    
    if (onDrag) onDrag();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging.current && e.isPrimary) {
      isDragging.current = false;
      if (panelRef.current) {
        panelRef.current.releasePointerCapture(e.pointerId);
      }
    }
  };

  // Inline styles for nuclear touch control
  const panelStyle: CSSProperties = window.innerWidth > 768 ? {
    transform: `translate(${currentOffset.current.x}px, ${currentOffset.current.y}px)`,
    touchAction: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none'
  } : {};

  return (
    <div 
      ref={panelRef}
      className={`panel ${className || ''}`}
      style={panelStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {children}
    </div>
  );
};
