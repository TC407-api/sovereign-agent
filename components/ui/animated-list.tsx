'use client';

import { motion, AnimatePresence, HTMLMotionProps, Variants } from 'framer-motion';
import { forwardRef, Children, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/design-tokens';

interface AnimatedListProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  /** List items to animate */
  children: ReactNode;
  /** Custom stagger delay between items */
  staggerDelay?: number;
  /** Disable animations (for reduced motion) */
  disableAnimation?: boolean;
  /** Animation mode for AnimatePresence */
  presenceMode?: 'sync' | 'wait' | 'popLayout';
}

export const AnimatedList = forwardRef<HTMLDivElement, AnimatedListProps>(
  ({
    className,
    children,
    staggerDelay = 0.05,
    disableAnimation = false,
    presenceMode = 'sync',
    ...props
  }, ref) => {
    const customStagger: Variants = {
      initial: {},
      animate: {
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: 0.1,
        },
      },
      exit: {
        transition: {
          staggerChildren: staggerDelay / 2,
          staggerDirection: -1,
        },
      },
    };

    if (disableAnimation) {
      return (
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        variants={customStagger}
        initial="initial"
        animate="animate"
        exit="exit"
        {...props}
      >
        <AnimatePresence mode={presenceMode}>
          {children}
        </AnimatePresence>
      </motion.div>
    );
  }
);

AnimatedList.displayName = 'AnimatedList';

// Individual list item with animation
interface AnimatedListItemProps extends HTMLMotionProps<'div'> {
  /** Unique key for AnimatePresence */
  itemKey: string | number;
  /** Disable animation */
  disableAnimation?: boolean;
}

export const AnimatedListItem = forwardRef<HTMLDivElement, AnimatedListItemProps>(
  ({ className, children, itemKey, disableAnimation = false, ...props }, ref) => {
    if (disableAnimation) {
      return (
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        key={itemKey}
        className={cn(className)}
        variants={staggerItem}
        layout
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedListItem.displayName = 'AnimatedListItem';

// Exit animation for deleted items
export const ListItemExit = motion.div;
