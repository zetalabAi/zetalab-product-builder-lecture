import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '@/constants/layout';

export type Breakpoint = 'mobile' | 'tablet' | 'laptop' | 'desktop';

export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    const width = window.innerWidth;
    if (width < BREAKPOINTS.mobile) return 'mobile';
    if (width < BREAKPOINTS.tablet) return 'tablet';
    if (width < BREAKPOINTS.laptop) return 'laptop';
    return 'desktop';
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let newBreakpoint: Breakpoint;

      if (width < BREAKPOINTS.mobile) {
        newBreakpoint = 'mobile';
      } else if (width < BREAKPOINTS.tablet) {
        newBreakpoint = 'tablet';
      } else if (width < BREAKPOINTS.laptop) {
        newBreakpoint = 'laptop';
      } else {
        newBreakpoint = 'desktop';
      }

      if (newBreakpoint !== breakpoint) {
        setBreakpoint(newBreakpoint);
      }
    };

    // Use ResizeObserver for better performance if available
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(document.body);
      return () => resizeObserver.disconnect();
    } else {
      // Fallback to resize event
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [breakpoint]);

  return breakpoint;
};
