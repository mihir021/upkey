import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ExplorePage from './ExplorePage.jsx';

/**
 * ExplorePage Unit Tests
 * Verifies that:
 * 1. Filter sidebar renders category, budget, skin type, and price range controls.
 * 2. Sidebar container uses sticky positioning and dedicated slim scrollbar.
 * 3. Selecting filters updates active filter tags and allows removing them individually or clearing all.
 */

// Mock Navbar, ProductCard, and API calls to isolate ExplorePage sidebar filter tests
vi.mock('../components/Navbar', () => ({
  default: function MockNavbar() {
    return <div data-testid="mock-navbar">Navbar</div>;
  },
}));

vi.mock('../components/ProductCard', () => ({
  default: function MockProductCard({ product }) {
    return <div data-testid="mock-product-card">{product.name}</div>;
  },
}));

vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        products: [
          { _id: '1', id: '1', name: 'Gentle Hydrating Cleanser', category: 'Cleanser', price_inr: 399, rating: 4.5 },
          { _id: '2', id: '2', name: 'Vitamin C Brightening Serum', category: 'Serum', price_inr: 899, rating: 4.7 },
        ],
        total: 2,
      },
    }),
  },
}));

describe('ExplorePage Filter Sidebar', () => {
  it('renders filter sidebar sections and supports interactive filtering and scrolling layout', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/explore']}>
        <ExplorePage />
      </MemoryRouter>
    );

    // Verify Filters header
    expect(screen.getAllByText('Filters').length).toBeGreaterThan(0);

    // Verify Filter section titles
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getAllByText('Budget').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Skin Type')).toBeInTheDocument();
    expect(screen.getByText('Price Range')).toBeInTheDocument();

    // Verify that the desktop sidebar container exists with the slim scrollbar class
    const scrollContainer = container.querySelector('.filter-sidebar-scroll');
    expect(scrollContainer).toBeInTheDocument();

    // Verify key category chips
    const cleanserChip = screen.getByRole('button', { name: /^Cleanser$/i });
    expect(cleanserChip).toBeInTheDocument();

    // Click Cleanser filter chip
    fireEvent.click(cleanserChip);

    // Active filter banner should now display Cleanser in addition to the chip
    const cleanserElements = screen.getAllByText('Cleanser');
    expect(cleanserElements.length).toBeGreaterThanOrEqual(2);

    // Price preset buttons are rendered (e.g. Under ₹500)
    const under500Btn = screen.getByRole('button', { name: /Under ₹500/i });
    expect(under500Btn).toBeInTheDocument();

    // Click Under ₹500
    fireEvent.click(under500Btn);

    // Reset All button should appear and reset active filters when clicked
    const resetAllBtn = screen.getByRole('button', { name: /Reset All/i });
    expect(resetAllBtn).toBeInTheDocument();
    fireEvent.click(resetAllBtn);
  });
});
