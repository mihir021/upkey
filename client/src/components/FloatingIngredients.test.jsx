import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import FloatingIngredients from './FloatingIngredients';

/**
 * ==============================================================================
 * FloatingIngredients Component Unit & Integration Tests
 * ==============================================================================
 * Verifies that the ambient active ingredient vector layer correctly renders
 * across all 4 chapters of the landing page with proper accessibility tags,
 * non-blocking pointer events, and full backwards compatibility.
 */
describe('FloatingIngredients Component', () => {
  it('renders ambient floating ingredients for Hero section with pointer-events-none and aria-hidden', () => {
    const { container } = render(<FloatingIngredients section="hero" />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    expect(wrapper).toHaveClass('pointer-events-none');
    expect(wrapper).toHaveClass('overflow-hidden');

    // Should render 7 active ingredient SVGs in Hero
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(7);
  });

  it('renders Diagnostic chapter ingredients correctly with 6 active SVGs', () => {
    const { container } = render(<FloatingIngredients section="diagnostic" />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    expect(wrapper).toHaveClass('pointer-events-none');

    // Diagnostic contains: Ceramide NP, Cica, Multi-Weight HA, Vit C, AHA Crystal, Squalane (6 items)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(6);
  });

  it('renders Dupes chapter ingredients correctly with 6 active SVGs', () => {
    const { container } = render(<FloatingIngredients section="dupes" />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    expect(wrapper).toHaveClass('pointer-events-none');

    // Dupes contains: Botanical Turmeric, Squalane, Ferulic Acid, Vit C, Damask Rose, HA (6 items)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(6);
  });

  it('renders Catalog chapter ingredients correctly with 6 active SVGs', () => {
    const { container } = render(<FloatingIngredients section="catalog" />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    expect(wrapper).toHaveClass('pointer-events-none');

    // Catalog contains: Vit C, AHA Crystal, Rose Petal, Cica Leaf, HA Droplet, Ceramide NP (6 items)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(6);
  });

  it('maintains backwards compatibility with heroIsActive prop', () => {
    const { container: activeContainer } = render(<FloatingIngredients heroIsActive={true} />);
    expect(activeContainer.querySelectorAll('svg').length).toBe(7);

    const { container: inactiveContainer } = render(<FloatingIngredients heroIsActive={false} />);
    expect(inactiveContainer.firstChild).toBeInTheDocument();
  });
});
