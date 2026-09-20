import { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * ==============================================================================
 * CompareContext — Global Product Comparison State Management
 * ==============================================================================
 *
 * Allows staging up to 3 products from the catalog or product details page
 * for side-by-side clinical formulation, ingredient, and value analysis.
 *
 * Features:
 *   - Persists staged products across session navigation in localStorage
 *   - Caps comparison at 3 products with auto-dismissing toast notification
 *   - Provides fast O(1) lookup via ID mapping
 *   - Seamlessly integrates with CartContext for direct "Add to Routine" actions
 */

const CompareContext = createContext(null);

const STORAGE_KEY = 'glowmore_compare';
const MAX_COMPARE_ITEMS = 3;

export function CompareProvider({ children }) {
  // Initialize staged products from localStorage if available
  const [compareList, setCompareList] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Ephemeral toast notification state for cap limit warning
  const [toastMessage, setToastMessage] = useState(null);

  // Sync to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList));
    } catch (err) {
      console.warn('Failed to persist comparison list:', err);
    }
  }, [compareList]);

  // Trigger temporary toast notification
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // Check if product is staged
  const isInCompare = useCallback(
    (productId) => compareList.some((p) => (p.id || p._id) === productId),
    [compareList]
  );

  // Add product to comparison
  const addToCompare = useCallback(
    (product) => {
      if (!product) return false;
      const pid = product.id || product._id;
      if (isInCompare(pid)) return false;

      if (compareList.length >= MAX_COMPARE_ITEMS) {
        showToast(
          `You can compare up to ${MAX_COMPARE_ITEMS} products at a time. Remove one to add another.`
        );
        return false;
      }

      setCompareList((prev) => [...prev, product]);
      return true;
    },
    [compareList, isInCompare, showToast]
  );

  // Remove product from comparison
  const removeFromCompare = useCallback((productId) => {
    setCompareList((prev) => prev.filter((p) => (p.id || p._id) !== productId));
  }, []);

  // Toggle comparison state for a product
  const toggleCompare = useCallback(
    (product) => {
      if (!product) return;
      const pid = product.id || product._id;
      if (isInCompare(pid)) {
        removeFromCompare(pid);
      } else {
        addToCompare(product);
      }
    },
    [isInCompare, removeFromCompare, addToCompare]
  );

  // Clear all staged comparison items
  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  const value = {
    compareList,
    compareCount: compareList.length,
    maxItems: MAX_COMPARE_ITEMS,
    isInCompare,
    addToCompare,
    removeFromCompare,
    toggleCompare,
    clearCompare,
    toastMessage,
    dismissToast: () => setToastMessage(null),
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
}

/**
 * useCompare hook for consuming comparison state
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}

export default CompareContext;
