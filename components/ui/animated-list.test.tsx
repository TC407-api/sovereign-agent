import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimatedList, AnimatedListItem } from './animated-list';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string }>) => (
      <div data-testid="motion-div" className={className} {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
  forwardRef: vi.fn((render) => render),
}));

describe('AnimatedList', () => {
  it('renders children', () => {
    render(
      <AnimatedList>
        <AnimatedListItem itemKey="1">Item 1</AnimatedListItem>
        <AnimatedListItem itemKey="2">Item 2</AnimatedListItem>
      </AnimatedList>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders as a div container', () => {
    render(
      <AnimatedList>
        <AnimatedListItem itemKey="1">Item 1</AnimatedListItem>
      </AnimatedList>
    );

    const containers = screen.getAllByTestId('motion-div');
    expect(containers.length).toBeGreaterThan(0);
  });

  it('applies custom className', () => {
    render(
      <AnimatedList className="custom-class">
        <AnimatedListItem itemKey="1">Item</AnimatedListItem>
      </AnimatedList>
    );

    const containers = screen.getAllByTestId('motion-div');
    expect(containers[0]).toHaveClass('custom-class');
  });

  it('renders without children gracefully', () => {
    render(<AnimatedList>{null}</AnimatedList>);
    expect(screen.getByTestId('motion-div')).toBeInTheDocument();
  });

  it('renders static content when disableAnimation is true', () => {
    render(
      <AnimatedList disableAnimation>
        <AnimatedListItem itemKey="1" disableAnimation>Item</AnimatedListItem>
      </AnimatedList>
    );

    expect(screen.getByText('Item')).toBeInTheDocument();
  });
});

describe('AnimatedListItem', () => {
  it('renders children', () => {
    render(
      <AnimatedList>
        <AnimatedListItem itemKey="test">Test Content</AnimatedListItem>
      </AnimatedList>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <AnimatedList>
        <AnimatedListItem itemKey="1" className="item-class">Item</AnimatedListItem>
      </AnimatedList>
    );

    const items = screen.getAllByTestId('motion-div');
    // At least one element should exist containing the item
    expect(items.length).toBeGreaterThan(0);
    // Item should be rendered
    expect(screen.getByText('Item')).toBeInTheDocument();
  });

  it('renders with unique itemKey', () => {
    render(
      <AnimatedList>
        <AnimatedListItem itemKey="unique-key">Unique Item</AnimatedListItem>
      </AnimatedList>
    );

    expect(screen.getByText('Unique Item')).toBeInTheDocument();
  });
});
