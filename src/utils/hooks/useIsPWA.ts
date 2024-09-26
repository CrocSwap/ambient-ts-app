import { useState, useEffect } from 'react';

// Custom Hook for detecting if app is running as a PWA on a mobile device
const useIsPWA = (): boolean => {
  const [isPWA, setIsPWA] = useState<boolean>(false);

  useEffect(() => {
    const checkIsPWA = () => {
      // Regular expression to detect mobile devices
      const isMobile: boolean = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // Detect if app is running in standalone mode (PWA) on modern browsers or iOS Safari
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isStandalone: boolean = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      
      // Set the PWA state based on mobile device check and standalone mode
      if (isMobile && isStandalone) {
        setIsPWA(true);
      } else {
        setIsPWA(false);
      }
    };

    // Call check function on component mount
    checkIsPWA();

    // Optional: Add a listener for the resize event in case the display mode changes
    window.addEventListener('resize', checkIsPWA);

    // Cleanup listener on component unmount
    return () => window.removeEventListener('resize', checkIsPWA);
  }, []);

  return isPWA;
};

export default useIsPWA;
