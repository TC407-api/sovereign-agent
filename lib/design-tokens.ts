// Design System Tokens for Sovereign Agent
// Consistent colors, animations, and spacing across the app

import { Variants, Transition } from 'framer-motion';

// =============================================================================
// COLOR PALETTE
// =============================================================================

export const colors = {
  background: {
    dark: 'slate-900',
    card: 'slate-800',
    cardHover: 'slate-700',
    elevated: 'slate-800/50',
  },
  accent: {
    primary: 'blue-500',
    primaryHover: 'blue-400',
    secondary: 'purple-500',
    success: 'green-500',
    warning: 'amber-500',
    danger: 'red-500',
    info: 'cyan-500',
  },
  text: {
    primary: 'white',
    secondary: 'slate-300',
    muted: 'slate-400',
    disabled: 'slate-500',
  },
  border: {
    default: 'slate-700',
    hover: 'slate-600',
    focus: 'blue-500',
  },
  gradient: {
    primary: 'from-blue-500 to-purple-600',
    secondary: 'from-cyan-500 to-blue-500',
    success: 'from-green-500 to-emerald-600',
    danger: 'from-red-500 to-rose-600',
  },
} as const;

// =============================================================================
// ANIMATION PRESETS
// =============================================================================

// Spring configurations
export const springs = {
  default: { type: 'spring', stiffness: 300, damping: 30 } as Transition,
  gentle: { type: 'spring', stiffness: 200, damping: 25 } as Transition,
  bouncy: { type: 'spring', stiffness: 400, damping: 20 } as Transition,
  stiff: { type: 'spring', stiffness: 500, damping: 35 } as Transition,
} as const;

// Fade animation
export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Slide up animation
export const slideUpVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// Slide in from right
export const slideRightVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// Scale animation
export const scaleVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// Stagger container (for lists)
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

// Stagger item (for list children)
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 15 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  },
  exit: { opacity: 0, y: -10 },
};

// Card hover animation
export const cardHoverVariants: Variants = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: { type: 'spring', stiffness: 400, damping: 25 }
  },
  tap: { scale: 0.98 },
};

// Modal animation
export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 }
  },
};

// Backdrop animation
export const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Pulse animation for real-time indicators
export const pulseVariants: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// =============================================================================
// TRANSITION PRESETS
// =============================================================================

export const transitions = {
  fast: { duration: 0.15 },
  normal: { duration: 0.25 },
  slow: { duration: 0.4 },
  page: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
} as const;

// =============================================================================
// SPACING & SIZING
// =============================================================================

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
} as const;

export const borderRadius = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  full: '9999px',
} as const;

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// =============================================================================
// Z-INDEX SCALE
// =============================================================================

export const zIndex = {
  dropdown: 50,
  sticky: 100,
  modal: 200,
  popover: 300,
  tooltip: 400,
  toast: 500,
} as const;
