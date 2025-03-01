
import { useEffect } from 'react';
import { useTheme } from 'next-themes';

const MatrixEffect = () => {
  const { theme } = useTheme();
  
  useEffect(() => {
    // Check if canvas already exists to prevent duplicates
    let canvas = document.getElementById('matrix-canvas') as HTMLCanvasElement;
    
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'matrix-canvas';
      canvas.className = 'fixed top-0 left-0 w-full h-full -z-20 opacity-10';
      document.body.appendChild(canvas);
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    
    // Audio-related characters instead of random ones
    const audioChars = '♪♫♬¶♬♪♩♭♮♯🎵🎶♫♬🔊🎤🎧🎼AUDIODESCSOUNDVOICE';
    const fontSize = 18;
    const columns = Math.floor(canvas.width / fontSize);
    
    // Audio waveform effect data
    const wavePoints: number[] = [];
    for (let i = 0; i < columns; i++) {
      wavePoints[i] = Math.random() * canvas.height;
    }
    
    // Different colors for dark and light themes
    const color = theme === 'dark' 
      ? 'rgba(0, 220, 130, 0.8)' // Softer green for dark theme
      : 'rgba(25, 70, 120, 0.8)'; // Dark blue for light theme
    
    const bgFade = theme === 'dark'
      ? 'rgba(0, 0, 0, 0.05)'
      : 'rgba(255, 255, 255, 0.1)';
    
    // Create audio waveform animation instead of falling characters
    const drawAudioWave = () => {
      if (!ctx) return;
      
      // Fade effect
      ctx.fillStyle = bgFade;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;
      
      // Update and draw each point of the waveform
      for (let i = 0; i < wavePoints.length; i++) {
        // Calculate new position with sine wave movement
        const time = Date.now() * 0.001;
        const frequency = (i % 5) + 1; // Different frequencies for variation
        
        // Combine multiple sine waves for more natural audio-like movement
        wavePoints[i] = 
          canvas.height * 0.5 + // Center point
          Math.sin(time * frequency + i * 0.2) * 30 + // Primary wave
          Math.sin(time * 2 * frequency + i * 0.05) * 15; // Secondary wave
        
        // Randomly choose an audio character
        const charIndex = Math.floor(Math.random() * audioChars.length);
        const char = audioChars[charIndex];
        
        // Draw the character at the waveform position
        ctx.fillText(char, i * fontSize, wavePoints[i]);
      }
    };
    
    // Use requestAnimationFrame for smoother animation
    let animationId: number;
    
    const animate = () => {
      drawAudioWave();
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      // Don't remove the canvas on component unmount as it may cause flickering
      // if the component re-mounts quickly
    };
  }, [theme]);

  return null; // This component doesn't render anything visible directly
};

export default MatrixEffect;
