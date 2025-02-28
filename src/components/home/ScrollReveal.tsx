
import { useEffect } from 'react';

const ScrollReveal = () => {
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add the animation class
          entry.target.classList.add('animate-fade-in-up');
          // Make sure opacity is set to 1 immediately after animation
          setTimeout(() => {
            if (entry.target instanceof HTMLElement) {
              entry.target.style.opacity = '1';
            }
          }, 700); // Match the animation duration
          
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
      // Initial state
      el.classList.add('opacity-0');
      observer.observe(el);
    });

    return () => {
      document.querySelectorAll('.reveal').forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  return null; // This component doesn't render anything visible directly
};

export default ScrollReveal;
