import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from '@/components/ui/skeleton';

describe('Skeleton Component', () => {
  it('renders a div element', () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton.tagName).toBe('DIV');
  });

  it('applies default classes', () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('rounded-md');
    expect(skeleton).toHaveClass('bg-muted');
  });

  it('merges custom className with default classes', () => {
    render(<Skeleton className="w-full h-10" data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('w-full');
    expect(skeleton).toHaveClass('h-10');
  });

  it('passes through HTML attributes', () => {
    render(
      <Skeleton
        data-testid="skeleton"
        id="my-skeleton"
        aria-label="Loading content"
        role="status"
      />
    );
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('id', 'my-skeleton');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
    expect(skeleton).toHaveAttribute('role', 'status');
  });

  it('renders with style props', () => {
    render(
      <Skeleton
        data-testid="skeleton"
        style={{ width: '100px', height: '20px' }}
      />
    );
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ width: '100px', height: '20px' });
  });

  it('allows overriding default classes', () => {
    render(<Skeleton className="bg-white rounded-lg" data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    // cn utility should handle class merging
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('bg-white');
    expect(skeleton).toHaveClass('rounded-lg');
  });
});
