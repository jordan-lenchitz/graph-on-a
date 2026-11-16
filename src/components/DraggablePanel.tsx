import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

interface DraggablePanelProps {
  className?: string;
  children: React.ReactNode;
  onDrag?: () => void;
  onDragStart?: () => void;
  onClose?: () => void;
  defaultMinimized?: boolean;
  id?: string;
}

export const DraggablePanel: React.FC<DraggablePanelProps> = ({
  className,
  children,
  onDrag,
  onDragStart,
  onClose,
  defaultMinimized = false,
  id,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const currentOffset = useRef({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(defaultMinimized);

  const clampToViewport = useCallback(() => {
    const el = panelRef.current;
    if (!el) return;
    if (window.getComputedStyle(el).position !== 'fixed') return;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 8;
    const minVisibleWidth = Math.min(80, rect.width);

    let adjustX = 0;
    let adjustY = 0;

    if (rect.top < margin) {
      adjustY = margin - rect.top;
    } else if (rect.top > vh - 40) {
      adjustY = (vh - 40) - rect.top;
    }

    if (rect.right < minVisibleWidth) {
      adjustX = minVisibleWidth - rect.right;
    } else if (rect.left > vw - minVisibleWidth) {
      adjustX = (vw - minVisibleWidth) - rect.left;
    }

    if (Math.abs(adjustX) > 0.5 || Math.abs(adjustY) > 0.5) {
      currentOffset.current.x += adjustX;
      currentOffset.current.y += adjustY;
      el.style.translate = `${currentOffset.current.x}px ${currentOffset.current.y}px`;
    }
  }, []);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    clampToViewport();

    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          clampToViewport();
        })
      : null;

    observer?.observe(el);
    window.addEventListener('resize', clampToViewport);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', clampToViewport);
    };
  }, [clampToViewport]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, summary, .panel-controls')) {
      return;
    }

    if (target.closest('.panel-header')) {
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
      panelRef.current.style.translate = `${currentOffset.current.x}px ${currentOffset.current.y}px`;
      clampToViewport();
    }

    startPos.current = { x: e.clientX, y: e.clientY };

    if (onDrag) onDrag();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging.current && e.isPrimary) {
      isDragging.current = false;
      if (panelRef.current) {
        try {
          panelRef.current.releasePointerCapture(e.pointerId);
        } catch {
          // Ignore if pointer capture was already released
        }
      }
    }
  };

  const panelStyle: CSSProperties = {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',
  };

  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement<{ className?: string; children?: React.ReactNode }>(child)) {
      const childClass = child.props.className || '';
      if (childClass.includes('panel-header')) {
        return React.cloneElement(child, {
          children: (
            <>
              {child.props.children}
              <span
                className="panel-controls"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="panel-ctrl-btn"
                  onClick={() => setIsMinimized((prev) => !prev)}
                  title={isMinimized ? 'expand panel' : 'minimize panel'}
                  aria-label={isMinimized ? 'expand panel' : 'minimize panel'}
                >
                  {isMinimized ? '+' : '−'}
                </button>
                {onClose && (
                  <button
                    type="button"
                    className="panel-ctrl-btn panel-ctrl-close"
                    onClick={onClose}
                    title="close panel"
                    aria-label="close panel"
                  >
                    ×
                  </button>
                )}
              </span>
            </>
          ),
        });
      }
    }
    return child;
  });

  return (
    <div
      id={id}
      ref={panelRef}
      className={`panel ${className || ''} ${isMinimized ? 'panel-minimized' : ''}`}
      style={panelStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {enhancedChildren}
    </div>
  );
};
