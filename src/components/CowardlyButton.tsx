import React, { useRef, useEffect } from 'react';

interface CowardlyButtonProps {
  inViewport?: boolean;
}

export const CowardlyButton: React.FC<CowardlyButtonProps> = ({ inViewport = false }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 3, y: 2 });
  const mousePos = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    if (inViewport) {
      const maxInitialX = Math.max(40, window.innerWidth - 360);
      const maxInitialY = Math.max(80, window.innerHeight * 0.35);
      pos.current = {
        x: 20 + Math.random() * maxInitialX,
        y: 20 + Math.random() * maxInitialY,
      };
      const dirX = Math.random() < 0.5 ? -1 : 1;
      const dirY = Math.random() < 0.5 ? -1 : 1;
      vel.current = {
        x: dirX * (2.5 + Math.random() * 2),
        y: dirY * (2 + Math.random() * 2),
      };
    } else {
      pos.current = { x: window.innerWidth / 2, y: window.innerHeight * 3.2 };
      vel.current = { x: 3, y: 2 };
    }
  }, [inViewport]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = inViewport
        ? { x: e.clientX, y: e.clientY }
        : { x: e.pageX, y: e.pageY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;

    const updatePhysics = () => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const pageY = pos.current.y;
      const pageX = pos.current.x;

      const center = {
        x: pageX + rect.width / 2,
        y: pageY + rect.height / 2,
      };

      const dx = center.x - mousePos.current.x;
      const dy = center.y - mousePos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0 && dist < 250) {
        const force = Math.max(0, 250 - dist) / 10;
        vel.current.x += (dx / dist) * force;
        vel.current.y += (dy / dist) * force;
      }

      const currentSpeed = Math.sqrt(vel.current.x ** 2 + vel.current.y ** 2);
      const targetSpeed = 4;
      if (currentSpeed > targetSpeed) {
        vel.current.x *= 0.95;
        vel.current.y *= 0.95;
      } else if (currentSpeed < targetSpeed && currentSpeed > 0.1) {
        vel.current.x *= 1.05;
        vel.current.y *= 1.05;
      }

      pos.current.x += vel.current.x;
      pos.current.y += vel.current.y;

      const minPageY = inViewport ? 0 : window.innerHeight * 3;
      const maxPageY = inViewport ? window.innerHeight : window.innerHeight * 4;
      const maxAllowedX = Math.max(0, window.innerWidth - rect.width);
      const maxAllowedY = Math.max(minPageY, maxPageY - rect.height);

      if (pos.current.x <= 0) {
        pos.current.x = 0;
        vel.current.x = Math.abs(vel.current.x);
      } else if (pos.current.x >= maxAllowedX) {
        pos.current.x = maxAllowedX;
        vel.current.x = -Math.abs(vel.current.x);
      }

      if (pos.current.y <= minPageY) {
        pos.current.y = minPageY;
        vel.current.y = Math.abs(vel.current.y);
      } else if (pos.current.y >= maxAllowedY) {
        pos.current.y = maxAllowedY;
        vel.current.y = -Math.abs(vel.current.y);
      }

      buttonRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [inViewport]);

  return (
    <button
      ref={buttonRef}
      style={{
        position: inViewport ? 'fixed' : 'absolute',
        top: 0,
        left: 0,
        padding: '1rem 2rem',
        fontSize: 'clamp(0.85rem, 2.5vw, 1.5rem)',
        maxWidth: 'calc(100vw - 16px)',
        fontWeight: 'bold',
        color: 'black',
        backgroundColor: 'red',
        border: '4px solid white',
        boxShadow: '0 0 20px 5px red',
        cursor: 'not-allowed',
        zIndex: 9999,
        willChange: 'transform',
      }}
      onClick={() => window.open('https://www.google.com/search?q=how+to+become+faster', '_blank')}
    >
      CATCH ME IFF YOU CATCH ME AND
    </button>
  );
};
