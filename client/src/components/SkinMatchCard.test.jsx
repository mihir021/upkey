import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SkinMatchCard from './SkinMatchCard.jsx';

/**
 * ==============================================================================
 * SkinMatchCard Unit Tests
 * ==============================================================================
 * Verifies that the AI Skin Compatibility Match Card component reliably computes
 * compatibility match scores without throwing TypeErrors across real MongoDB
 * data models (such as P018 with array concerns & key_ingredients).
 */

describe('SkinMatchCard Component', () => {
  // Mock product matching real MongoDB P018 document structure
  const mockP018Product = {
    id: 'P018',
    productId: 'P018',
    name: 'Ceramide Barrier Repair Cream',
    brand: 'DermaRoot',
    category: 'Moisturizer',
    price_inr: 1350,
    skin_type: ['Dry', 'Sensitive'],
    skin_types: ['Dry', 'Sensitive'],
    concerns: ['Dryness', 'Sensitivity'],
    key_ingredients: ['Ceramides', 'Cholesterol'],
    budget_tier: 'Mid',
    rating: 4.7,
    is_3d: true,
  };

  // Mock authenticated user profile
  const mockUser = {
    name: 'Mihir Patel',
    skinType: 'Dry',
    skinTone: 'Warm Medium',
    concerns: ['Dryness', 'Fine Lines'],
    shoppingGoals: ['Deep Hydration', 'Barrier Repair'],
    preferredIngredients: ['Ceramides', 'Hyaluronic Acid'],
    budget: 1500,
    onboardingCompleted: true,
  };

  it('renders successfully for authenticated user with MongoDB product P018 without crashing', () => {
    render(
      <BrowserRouter>
        <SkinMatchCard product={mockP018Product} user={mockUser} />
      </BrowserRouter>
    );

    // Verify compatibility badge and header elements render
    expect(screen.getByText('Skin Compatibility')).toBeInTheDocument();
    expect(screen.getByText(/Personalized for/i)).toBeInTheDocument();
    // Verify specific diagnostic criteria are populated
    expect(screen.getByText(/Under your ₹1,500 budget/i)).toBeInTheDocument();
    expect(screen.getByText(/Targets Dryness/i)).toBeInTheDocument();
  });

  it('renders successfully in guest mode without user profile', () => {
    render(
      <BrowserRouter>
        <SkinMatchCard product={mockP018Product} user={null} />
      </BrowserRouter>
    );

    expect(screen.getByText('Skin Compatibility')).toBeInTheDocument();
    expect(screen.getByText(/Based on clinical formulation analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/Take Quiz/i)).toBeInTheDocument();
  });

  it('handles completely empty or missing optional fields without throwing errors', () => {
    const sparseProduct = {
      id: 'P999',
      name: 'Minimal Test Product',
      category: 'Cleanser',
    };

    render(
      <BrowserRouter>
        <SkinMatchCard product={sparseProduct} user={{ skinType: 'Oily' }} />
      </BrowserRouter>
    );

    expect(screen.getByText('Skin Compatibility')).toBeInTheDocument();
  });
});
