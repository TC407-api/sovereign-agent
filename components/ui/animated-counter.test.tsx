import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Need to mock before import
vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children }: React.PropsWithChildren) => (
      <span data-testid="motion-span">{children}</span>
    ),
  },
  useInView: vi.fn(() => true),
  useSpring: vi.fn(() => ({
    get: () => 100,
    set: vi.fn(),
  })),
  useTransform: vi.fn(() => '100'),
}));

// Import after mock
import { AnimatedCounter, CompactCounter, PercentageCounter } from './animated-counter';

describe('AnimatedCounter', () => {
  it('renders the component', () => {
    render(<AnimatedCounter value={100} />);
    expect(screen.getByTestId('motion-span')).toBeInTheDocument();
  });

  it('applies custom className to container', () => {
    const { container } = render(<AnimatedCounter value={50} className="custom-counter" />);
    const outerSpan = container.querySelector('span.custom-counter');
    expect(outerSpan).toBeInTheDocument();
  });

  it('renders with prefix', () => {
    render(<AnimatedCounter value={100} prefix="$" />);
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('renders with suffix', () => {
    render(<AnimatedCounter value={100} suffix="%" />);
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('applies tabular-nums class by default', () => {
    const { container } = render(<AnimatedCounter value={100} />);
    const span = container.querySelector('span.tabular-nums');
    expect(span).toBeInTheDocument();
  });
});

describe('CompactCounter', () => {
  it('renders suffix k for thousands', () => {
    render(<CompactCounter value={1500} />);
    expect(screen.getByText('k')).toBeInTheDocument();
  });

  it('renders suffix M for millions', () => {
    render(<CompactCounter value={1500000} />);
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('renders without suffix for small numbers', () => {
    const { container } = render(<CompactCounter value={500} />);
    // Should not have k or M suffix
    expect(container.textContent).not.toContain('k');
    expect(container.textContent).not.toContain('M');
  });
});

describe('PercentageCounter', () => {
  it('renders with % suffix', () => {
    render(<PercentageCounter value={75} />);
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('renders the motion span', () => {
    render(<PercentageCounter value={50} />);
    expect(screen.getByTestId('motion-span')).toBeInTheDocument();
  });
});
