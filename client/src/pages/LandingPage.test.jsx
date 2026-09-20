import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './LandingPage.jsx';

/**
 * Mock 3D Canvas component in JSDOM environment
 * Since WebGL is not available in headless Node.js/JSDOM, we mock HeroBottle3D
 * while verifying the rest of the layout, scroll chapters, and side content.
 */
vi.mock('../components/HeroBottle3D', () => ({
  default: function MockHeroBottle3D({ scrollProgress }) {
    return <div data-testid="mock-3d-bottle" data-scroll={scrollProgress} />;
  }
}));

describe('LandingPage Component', () => {
  it('renders Glow More brand title and all 4 scroll chapters', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Verify Brand Logo & Navigation
    expect(screen.getByText('Glow More')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();

    // Verify 3D Bottle Canvas container is present
    expect(screen.getByTestId('mock-3d-bottle')).toBeInTheDocument();

    // Verify Chapter 1: Hero (Left) & Live telemetry score (Right)
    expect(screen.getByText(/Beauty That/i)).toBeInTheDocument();
    expect(screen.getByText(/Fits Your Skin/i)).toBeInTheDocument();
    expect(screen.getByText(/Formulation Match Rating/i)).toBeInTheDocument();

    // Verify Chapter 1: Ambient floating ingredients background layer
    const heroSection = document.getElementById('hero');
    expect(heroSection).toBeInTheDocument();
    expect(heroSection.querySelector('[aria-hidden="true"]')).toBeInTheDocument();

    // Verify Chapter 2: Diagnostic (Left) & Visible reason tags (Right)
    expect(screen.getAllByText(/Your Skin, Decoded/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/STEP 01 · DIAGNOSTIC/i).length).toBeGreaterThanOrEqual(1);

    // Verify Chapter 3: Dupe Engine (Left) & Transparent trade-offs (Right)
    expect(screen.getAllByText(/Same Actives\. Real Savings\./i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/STEP 03 · SMART DUPE FINDER/i).length).toBeGreaterThanOrEqual(1);

    // Verify Chapter 4: Catalog Search (Left) & Routine Basket (Right)
    expect(screen.getByText(/Every Formula, Fully Transparent/i)).toBeInTheDocument();
    expect(screen.getByText(/Your Routine Basket/i)).toBeInTheDocument();

    // Verify the floating "Browsing as Guest" notification banner is completely absent
    expect(screen.queryByText(/Browsing as Guest/i)).not.toBeInTheDocument();
  });
});
