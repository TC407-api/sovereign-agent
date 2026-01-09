'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  /** Target value to count to */
  value: number;
  /** Duration of animation in seconds */
  duration?: number;
  /** Number of decimal places */
  decimals?: number;
  /** Prefix (e.g., "$") */
  prefix?: string;
  /** Suffix (e.g., "%", "k") */
  suffix?: string;
  /** Format large numbers with commas */
  formatNumber?: boolean;
  /** Additional class names */
  className?: string;
  /** Only animate when in view */
  animateOnView?: boolean;
  /** Spring stiffness */
  stiffness?: number;
  /** Spring damping */
  damping?: number;
}

export function AnimatedCounter({
  value,
  duration = 1,
  decimals = 0,
  prefix = '',
  suffix = '',
  formatNumber = true,
  className,
  animateOnView = true,
  stiffness = 100,
  damping = 30,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [hasAnimated, setHasAnimated] = useState(false);

  // Spring animation for smooth counting
  const spring = useSpring(0, {
    stiffness,
    damping,
    duration: duration * 1000,
  });

  // Transform spring value to display value
  const display = useTransform(spring, (latest) => {
    const rounded = decimals > 0
      ? latest.toFixed(decimals)
      : Math.round(latest);

    if (formatNumber && typeof rounded === 'number') {
      return rounded.toLocaleString();
    }
    if (formatNumber && typeof rounded === 'string') {
      const num = parseFloat(rounded);
      return num.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }
    return rounded.toString();
  });

  // Start animation when in view (or immediately if animateOnView is false)
  useEffect(() => {
    if (!animateOnView || (isInView && !hasAnimated)) {
      spring.set(value);
      setHasAnimated(true);
    }
  }, [isInView, value, spring, animateOnView, hasAnimated]);

  // Update when value changes after initial animation
  useEffect(() => {
    if (hasAnimated) {
      spring.set(value);
    }
  }, [value, spring, hasAnimated]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

// Compact version for stats that formats large numbers (1.2k, 1.5M)
interface CompactCounterProps extends Omit<AnimatedCounterProps, 'formatNumber' | 'suffix'> {
  /** Compact format threshold (default: 1000) */
  compactThreshold?: number;
}

export function CompactCounter({
  value,
  compactThreshold = 1000,
  ...props
}: CompactCounterProps) {
  const formatCompact = (num: number): { value: number; suffix: string } => {
    if (num >= 1_000_000) {
      return { value: num / 1_000_000, suffix: 'M' };
    }
    if (num >= compactThreshold) {
      return { value: num / 1000, suffix: 'k' };
    }
    return { value: num, suffix: '' };
  };

  const { value: displayValue, suffix } = formatCompact(value);

  return (
    <AnimatedCounter
      value={displayValue}
      decimals={suffix ? 1 : 0}
      suffix={suffix}
      formatNumber={false}
      {...props}
    />
  );
}

// Simple percentage counter
export function PercentageCounter({
  value,
  ...props
}: Omit<AnimatedCounterProps, 'suffix'>) {
  return (
    <AnimatedCounter
      value={value}
      suffix="%"
      decimals={0}
      {...props}
    />
  );
}
