'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { cardHoverVariants, springs } from '@/lib/design-tokens';

interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  /** Disable hover animation */
  disableHover?: boolean;
  /** Custom delay for stagger animations */
  delay?: number;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, children, disableHover = false, delay = 0, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'bg-slate-800/50 rounded-xl border border-slate-700 transition-colors',
          !disableHover && 'hover:border-slate-600',
          className
        )}
        variants={cardHoverVariants}
        initial="initial"
        whileHover={disableHover ? undefined : 'hover'}
        whileTap={disableHover ? undefined : 'tap'}
        transition={{ ...springs.default, delay }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

// Variant with gradient border on hover
export const GradientCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, children, disableHover = false, delay = 0, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative rounded-xl p-[1px] bg-gradient-to-br from-slate-700 via-slate-700 to-slate-700',
          !disableHover && 'hover:from-blue-500/50 hover:via-purple-500/50 hover:to-cyan-500/50',
          'transition-all duration-300',
          className
        )}
        variants={cardHoverVariants}
        initial="initial"
        whileHover={disableHover ? undefined : 'hover'}
        whileTap={disableHover ? undefined : 'tap'}
        transition={{ ...springs.default, delay }}
        {...props}
      >
        <div className="bg-slate-800 rounded-xl h-full">
          {children}
        </div>
      </motion.div>
    );
  }
);

GradientCard.displayName = 'GradientCard';
