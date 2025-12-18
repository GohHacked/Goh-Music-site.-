import React, { useEffect, useRef } from 'react';

const BackgroundVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    // Snowflakes configuration
    // Increased count for better visibility
    const isMobile = width < 768;
    const snowflakeCount = isMobile ? 100 : 250;
    
    const snowflakes: {
        x: number;
        y: number;
        radius: number;
        density: number; // Fallspeed factor
        opacity: number;
        swayOffset: number;
        swaySpeed: number;
    }[] = [];

    // Initialize snowflakes
    for (let i = 0; i < snowflakeCount; i++) {
      snowflakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1, // Size 1px to 3px
        density: Math.random() * 1.5 + 0.5, // Speed
        opacity: Math.random() * 0.6 + 0.2, // Opacity
        swayOffset: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.02 + 0.005
      });
    }

    let angle = 0;

    const draw = () => {
      // 1. Draw Background (Winter Night Gradient)
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#020617'); // Slate 950 (Top - Deep Space)
      gradient.addColorStop(0.4, '#0f172a'); // Slate 900 (Middle)
      gradient.addColorStop(1, '#172554'); // Blue 950 (Bottom - Deep Winter Blue)
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Global sway angle increment
      angle += 0.01;

      // 3. Draw Snowflakes
      ctx.fillStyle = 'white'; // Set fill style once for performance
      
      for (let i = 0; i < snowflakeCount; i++) {
        const flake = snowflakes[i];

        // Update positions
        // Y movement: gravity + density
        flake.y += Math.pow(flake.density, 2) + 0.3;
        
        // X movement: sway using sine wave
        flake.x += Math.sin(angle * flake.swaySpeed + flake.swayOffset) * 0.5;

        // Reset if out of view (Loop)
        if (flake.y > height) {
          flake.y = -5;
          flake.x = Math.random() * width;
        }

        // Horizontal wrap
        if (flake.x > width + 5) {
            flake.x = -5;
        } else if (flake.x < -5) {
            flake.x = width + 5;
        }

        // Draw individual flake
        ctx.globalAlpha = flake.opacity;
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Reset alpha
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Removed -z-10 and replaced with simple styling. 
  // We rely on order in DOM or explicit z-index context in CSS if needed, 
  // but fixed inset-0 with z-[-1] is standard for backgrounds.
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full"
      style={{ zIndex: -1 }}
    />
  );
};

export default BackgroundVisualizer;