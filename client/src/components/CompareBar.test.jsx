import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CompareBar from './CompareBar.jsx';
import { useCompare } from '../context/CompareContext';
import { useNavigate, useLocation } from 'react-router-dom';

// Mock router hooks
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
}));

// Mock compare context
vi.mock('../context/CompareContext', () => ({
  useCompare: vi.fn(),
}));

describe('CompareBar Component', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue({ pathname: '/shop' });
  });

  it('does not render when compareCount is 0', () => {
    useCompare.mockReturnValue({
      compareList: [],
      compareCount: 0,
      maxItems: 3,
      removeFromCompare: vi.fn(),
      clearCompare: vi.fn(),
      toastMessage: null,
      dismissToast: vi.fn(),
    });

    render(<CompareBar />);
    expect(screen.queryByText(/Compare/i)).not.toBeInTheDocument();
  });

  it('renders disabled state with guidance when only 1 product is staged', () => {
    useCompare.mockReturnValue({
      compareList: [{ id: 'P001', name: 'Ceramide Cream', brand: 'Luminate' }],
      compareCount: 1,
      maxItems: 3,
      removeFromCompare: vi.fn(),
      clearCompare: vi.fn(),
      toastMessage: null,
      dismissToast: vi.fn(),
    });

    render(<CompareBar />);

    // Check status and badge
    expect(screen.getByText('Need 2+')).toBeInTheDocument();
    expect(screen.getByText(/1 of 3 • Add 1 more/i)).toBeInTheDocument();

    // Check CTA button state
    const compareBtn = screen.getByRole('button', { name: /Add 1 More to Compare/i });
    expect(compareBtn).toBeInTheDocument();
    expect(compareBtn).toHaveAttribute('aria-disabled', 'true');

    // Click disabled button -> must NOT navigate, and shows guidance tooltip
    fireEvent.click(compareBtn);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByText(/Select at least 2 products to compare!/i)).toBeInTheDocument();
  });

  it('activates and enables navigation when 2 or more products are staged', () => {
    useCompare.mockReturnValue({
      compareList: [
        { id: 'P001', name: 'Ceramide Cream', brand: 'Luminate' },
        { id: 'P002', name: 'Gentle Milk Cleanser', brand: 'Luminate' },
      ],
      compareCount: 2,
      maxItems: 3,
      removeFromCompare: vi.fn(),
      clearCompare: vi.fn(),
      toastMessage: null,
      dismissToast: vi.fn(),
    });

    render(<CompareBar />);

    // Check active status and badge
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByText(/2 of 3 • Ready to compare!/i)).toBeInTheDocument();

    // Check activated CTA button
    const compareBtn = screen.getByRole('button', { name: /Compare Now \(2\)/i });
    expect(compareBtn).toBeInTheDocument();
    expect(compareBtn).toHaveAttribute('aria-disabled', 'false');

    // Click active button -> navigates to /compare
    fireEvent.click(compareBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/compare');
  });
});
