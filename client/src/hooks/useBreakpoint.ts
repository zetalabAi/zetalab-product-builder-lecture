import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '@/constants/layout';

export type Breakpoint = 'mobile' | 'tablet' | 'laptop' | 'desktop';

const getBreakpoint = (width: number): Breakpoint => {
  if (width < BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  if (width < BREAKPOINTS.laptop) return 'laptop';
  return 'desktop';
};

export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() =>
    getBreakpoint(window.innerWidth)
  );

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      // 데바운싱: 150ms 후에 실행
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newBreakpoint = getBreakpoint(window.innerWidth);
        setBreakpoint((prev) => {
          // 변경된 경우에만 업데이트
          return prev !== newBreakpoint ? newBreakpoint : prev;
        });
      }, 150);
    };

    // window resize 이벤트 사용 (ResizeObserver보다 효율적)
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []); // 의존성 배열 비워서 한 번만 등록

  return breakpoint;
};
