import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY_CART    = 'joyory_cart';
const STORAGE_KEY_WISH    = 'joyory_wishlist';
const STORAGE_KEY_ORDERS  = 'joyory_orders';
const STORAGE_KEY_HISTORY = 'joyory_history'; // recently viewed

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

const DEFAULT_DEMO_ORDERS = [
  {
    id: 'ORD-984210',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    total: 1899,
    status: 'Delivered',
    items: [
      {
        product: {
          id: 'P012',
          name: 'Vitamin C 15% Brightening Serum',
          brand: 'Luminate',
          category: 'Serum',
          price_inr: 1899,
          rating: 4.7,
          budget_tier: 'Premium',
        },
        qty: 1,
      },
    ],
  },
  {
    id: 'ORD-983104',
    date: new Date(Date.now() - 6 * 86400000).toISOString(),
    total: 2800,
    status: 'Delivered',
    items: [
      {
        product: {
          id: 'P018',
          name: 'Ceramide Barrier Repair Cream',
          brand: 'DermaRoot',
          category: 'Moisturizer',
          price_inr: 1350,
          rating: 4.7,
          budget_tier: 'Mid',
        },
        qty: 1,
      },
      {
        product: {
          id: 'P005',
          name: 'Cream Cleanser with Peptides',
          brand: 'Luminate',
          category: 'Cleanser',
          price_inr: 1450,
          rating: 4.6,
          budget_tier: 'Premium',
        },
        qty: 1,
      },
    ],
  },
  {
    id: 'ORD-981290',
    date: new Date(Date.now() - 11 * 86400000).toISOString(),
    total: 1599,
    status: 'Delivered',
    items: [
      {
        product: {
          id: 'P014',
          name: 'Hyaluronic Acid Multi-Weight Serum',
          brand: 'DermaRoot',
          category: 'Serum',
          price_inr: 1250,
          rating: 4.6,
          budget_tier: 'Mid',
        },
        qty: 1,
      },
      {
        product: {
          id: 'P001',
          name: 'Foaming Rice Water Cleanser',
          brand: 'PureBloom',
          category: 'Cleanser',
          price_inr: 349,
          rating: 4.3,
          budget_tier: 'Budget',
        },
        qty: 1,
      },
    ],
  },
];

const DEFAULT_DEMO_WISH = {
  P015: {
    id: 'P015',
    name: 'Retinol 0.3% Night Renewal Serum',
    brand: 'Luminate',
    category: 'Serum',
    price_inr: 2100,
    rating: 4.6,
    budget_tier: 'Premium',
    skin_types: ['Normal', 'Combination'],
    concerns_list: ['Aging', 'Uneven Tone'],
  },
};

const DEFAULT_DEMO_HISTORY = ['P018', 'P012', 'P014', 'P005'];

const storedOrders = loadJSON(STORAGE_KEY_ORDERS, null);
const storedWish   = loadJSON(STORAGE_KEY_WISH,   null);
const storedHist   = loadJSON(STORAGE_KEY_HISTORY, null);

const initialState = {
  cart:    loadJSON(STORAGE_KEY_CART, {}),
  wishlist: storedWish && Object.keys(storedWish).length ? storedWish : DEFAULT_DEMO_WISH,
  orders:  Array.isArray(storedOrders) && storedOrders.length ? storedOrders : DEFAULT_DEMO_ORDERS,
  history: Array.isArray(storedHist) && storedHist.length ? storedHist : DEFAULT_DEMO_HISTORY,
};

function cartReducer(state, action) {
  switch (action.type) {

    case 'ADD_TO_CART': {
      const { product } = action;
      const existing = state.cart[product.id];
      return {
        ...state,
        cart: {
          ...state.cart,
          [product.id]: { product, qty: (existing?.qty || 0) + 1 },
        },
      };
    }

    case 'REMOVE_FROM_CART': {
      const next = { ...state.cart };
      delete next[action.id];
      return { ...state, cart: next };
    }

    case 'UPDATE_QTY': {
      const item = state.cart[action.id];
      if (!item) return state;
      const newQty = item.qty + action.delta;
      if (newQty <= 0) {
        const next = { ...state.cart };
        delete next[action.id];
        return { ...state, cart: next };
      }
      return {
        ...state,
        cart: { ...state.cart, [action.id]: { ...item, qty: newQty } },
      };
    }

    case 'CLEAR_CART':
      return { ...state, cart: {} };

    case 'TOGGLE_WISHLIST': {
      const { product } = action;
      const next = { ...state.wishlist };
      if (next[product.id]) {
        delete next[product.id];
      } else {
        next[product.id] = product;
      }
      return { ...state, wishlist: next };
    }

    case 'PLACE_ORDER': {
      const items = Object.values(state.cart);
      if (!items.length) return state;
      const total = items.reduce((s, { product, qty }) => s + product.price_inr * qty, 0);
      const order = {
        id:     `ORD-${Date.now()}`,
        items,
        total,
        date:   new Date().toISOString(),
        status: 'Delivered',
      };
      return { ...state, cart: {}, orders: [order, ...state.orders] };
    }

    case 'VIEW_PRODUCT': {
      const pid = action.id;
      const filtered = state.history.filter(id => id !== pid);
      return { ...state, history: [pid, ...filtered].slice(0, 20) };
    }

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Persist every state change to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CART,    JSON.stringify(state.cart));
  }, [state.cart]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WISH,    JSON.stringify(state.wishlist));
  }, [state.wishlist]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ORDERS,  JSON.stringify(state.orders));
  }, [state.orders]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(state.history));
  }, [state.history]);

  const addToCart    = useCallback((product) => dispatch({ type: 'ADD_TO_CART', product }), []);
  const removeFromCart = useCallback((id) => dispatch({ type: 'REMOVE_FROM_CART', id }), []);
  const updateQty    = useCallback((id, delta) => dispatch({ type: 'UPDATE_QTY', id, delta }), []);
  const clearCart    = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);
  const toggleWishlist = useCallback((product) => dispatch({ type: 'TOGGLE_WISHLIST', product }), []);
  const placeOrder   = useCallback(() => dispatch({ type: 'PLACE_ORDER' }), []);
  const viewProduct  = useCallback((id) => dispatch({ type: 'VIEW_PRODUCT', id }), []);

  const cartCount   = Object.values(state.cart).reduce((s, i) => s + i.qty, 0);
  const wishCount   = Object.keys(state.wishlist).length;
  const cartTotal   = Object.values(state.cart).reduce(
    (s, { product, qty }) => s + product.price_inr * qty, 0
  );
  const inWishlist  = useCallback((id) => Boolean(state.wishlist[id]), [state.wishlist]);
  const inCart      = useCallback((id) => Boolean(state.cart[id]), [state.cart]);

  return (
    <CartContext.Provider value={{
      cart: state.cart,
      wishlist: state.wishlist,
      orders: state.orders,
      history: state.history,
      cartCount,
      wishCount,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      toggleWishlist,
      placeOrder,
      viewProduct,
      inWishlist,
      inCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}
