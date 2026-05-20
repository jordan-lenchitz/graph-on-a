import React, { useRef, useEffect } from 'react';

export const CowardlyButton: React.FC = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight * 3.2 });
  const vel = useRef({ x: 3, y: 2 }); 
  const mousePos = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Adjusted mousePos for scrolling
      mousePos.current = { x: e.pageX, y: e.pageY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;

    const updatePhysics = () => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      // getBoundingClientRect is relative to viewport, but we want relative to page
      const pageY = pos.current.y;
      const pageX = pos.current.x;

      const center = {
        x: pageX + rect.width / 2,
        y: pageY + rect.height / 2,
      };

      const dx = center.x - mousePos.current.x;
      const dy = center.y - mousePos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 250) {
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

      // Boundary checks for the "slop" section (300vh to 400vh)
      const minPageY = window.innerHeight * 3;
      const maxPageY = window.innerHeight * 4;

      if (pos.current.x <= 0) {
        pos.current.x = 0;
        vel.current.x *= -1;
      } else if (pos.current.x + rect.width >= window.innerWidth) {
        pos.current.x = window.innerWidth - rect.width;
        vel.current.x *= -1;
      }

      if (pos.current.y <= minPageY) {
        pos.current.y = minPageY;
        vel.current.y *= -1;
      } else if (pos.current.y + rect.height >= maxPageY) {
        pos.current.y = maxPageY - rect.height;
        vel.current.y *= -1;
      }

      buttonRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        padding: '1rem 2rem',
        fontSize: '1.5rem',
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
