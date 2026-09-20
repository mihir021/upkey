import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import LoadingScreen from './LoadingScreen.jsx';

describe('LoadingScreen Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders GLOW MORE headline, badge, and initial calibration status', () => {
    render(<LoadingScreen duration={1000} />);

    expect(screen.getByText('GLOW MORE')).toBeInTheDocument();
    expect(screen.getByText('Explainable Beauty AI')).toBeInTheDocument();
    expect(screen.getByText('Calibrating skin biomarkers...')).toBeInTheDocument();
  });

  it('cycles through calibration status lines as time progresses', () => {
    render(<LoadingScreen duration={2000} />);

    // Initial status
    expect(screen.getByText('Calibrating skin biomarkers...')).toBeInTheDocument();

    // Advance time past 30% mark
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(screen.getByText('Cross-referencing active ingredients...')).toBeInTheDocument();

    // Advance time past 60% mark
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.getByText('Running compatibility diagnostics...')).toBeInTheDocument();

    // Advance time past 90% mark
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.getByText('Finalizing your formulation match...')).toBeInTheDocument();
  });

  it('calls onComplete when progress reaches 100%', () => {
    const onComplete = vi.fn();
    render(<LoadingScreen duration={1000} onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(onComplete).toHaveBeenCalled();
  });

  it('renders correctly with inline variant', () => {
    const { container } = render(<LoadingScreen variant="inline" duration={1000} />);
    expect(container.querySelector('.relative.w-full')).toBeInTheDocument();
  });
});
