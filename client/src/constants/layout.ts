export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  laptop: 1280,
  desktop: 1280,
} as const;

export const PANEL_WIDTHS = {
  leftOpen: 240,
  leftClosed: 64,
  rightDesktop: 400,
  rightLaptop: 320,
} as const;

export const ANIMATION_DURATION = {
  panel: 200, // ms
  mobile: 150, // ms
} as const;
