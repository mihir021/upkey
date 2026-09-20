import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY_CART    = 'joyory_cart';
const STORAGE_KEY_WISH    = 'joyory_wishlist';
const STORAGE_KEY_ORDERS  = 'joyory_orders';
const STORAGE_KEY_HISTORY = 'joyory_history';

// Known hardcoded demo orders from previous template
const DEMO_ORDER_IDS = new Set(['ORD-984210', 'ORD-983104', 'ORD-981290']);
const DEMO_HIST_ARRAY = ['P018', 'P012', 'P014', 'P005'];

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// Sanitize legacy demo orders, wishlist, and history from localStorage
function sanitizeStorage() {
  try {
    const orders = loadJSON(STORAGE_KEY_ORDERS, []);
    if (Array.isArray(orders) && orders.some(o => DEMO_ORDER_IDS.has(o?.id))) {
      const cleaned = orders.filter(o => o && !DEMO_ORDER_IDS.has(o.id));
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(cleaned));
    }

    const wish = loadJSON(STORAGE_KEY_WISH, {});
    if (wish && Object.keys(wish).length === 1 && wish.P015?.id === 'P015') {
      localStorage.removeItem(STORAGE_KEY_WISH);
    }

    const hist = loadJSON(STORAGE_KEY_HISTORY, []);
    if (Array.isArray(hist) && hist.length === 4 && hist.every((id, i) => id === DEMO_HIST_ARRAY[i])) {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    }
  } catch {
    // Storage access restricted or disabled
  }
}

sanitizeStorage();

function loadCleanOrders() {
  const orders = loadJSON(STORAGE_KEY_ORDERS, []);
  return Array.isArray(orders) ? orders.filter(o => o && !DEMO_ORDER_IDS.has(o.id)) : [];
}

function loadCleanWishlist() {
  const wish = loadJSON(STORAGE_KEY_WISH, {});
  if (!wish || typeof wish !== 'object') return {};
  if (Object.keys(wish).length === 1 && wish.P015?.id === 'P015') return {};
  return wish;
}

function loadCleanHistory() {
  const hist = loadJSON(STORAGE_KEY_HISTORY, []);
  if (!Array.isArray(hist)) return [];
  if (hist.length === 4 && hist.every((id, i) => id === DEMO_HIST_ARRAY[i])) return [];
  return hist;
}

// Initial state containing strictly real user data
const initialState = {
  cart:     loadJSON(STORAGE_KEY_CART, {}),
  wishlist: loadCleanWishlist(),
  orders:   loadCleanOrders(),
  history:  loadCleanHistory(),
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
        status: 'Processing',
      };
      return { ...state, cart: {}, orders: [order, ...state.orders] };
    }

    case 'VIEW_PRODUCT': {
      const pid = action.id;
      const filtered = state.history.filter(id => id !== pid);
      return { ...state, history: [pid, ...filtered].slice(0, 20) };
    }

    // Wipe all user state on logout
    case 'RESET_STATE':
      return action.newState;

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Persist state changes to localStorage
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

  const addToCart      = useCallback((product) => dispatch({ type: 'ADD_TO_CART', product }), []);
  const removeFromCart = useCallback((id) => dispatch({ type: 'REMOVE_FROM_CART', id }), []);
  const updateQty      = useCallback((id, delta) => dispatch({ type: 'UPDATE_QTY', id, delta }), []);
  const clearCart      = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);
  const toggleWishlist = useCallback((product) => dispatch({ type: 'TOGGLE_WISHLIST', product }), []);
  const placeOrder     = useCallback(() => dispatch({ type: 'PLACE_ORDER' }), []);
  const viewProduct    = useCallback((id) => dispatch({ type: 'VIEW_PRODUCT', id }), []);

  /**
   * Wipe all cart/wishlist/orders/history from memory AND localStorage.
   * Called on logout so the next session starts completely clean.
   */
  const clearUserData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_CART);
    localStorage.removeItem(STORAGE_KEY_WISH);
    localStorage.removeItem(STORAGE_KEY_ORDERS);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
    dispatch({
      type: 'RESET_STATE',
      newState: { cart: {}, wishlist: {}, orders: [], history: [] },
    });
  }, []);

  const cartCount = Object.values(state.cart).reduce((s, i) => s + i.qty, 0);
  const wishCount = Object.keys(state.wishlist).length;
  const cartTotal = Object.values(state.cart).reduce(
    (s, { product, qty }) => s + product.price_inr * qty, 0
  );
  const inWishlist = useCallback((id) => Boolean(state.wishlist[id]), [state.wishlist]);
  const inCart     = useCallback((id) => Boolean(state.cart[id]), [state.cart]);

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
      clearUserData,
      inWishlist,
      inCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

// Allow exporting the custom hook alongside Provider in this context module
// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    return {
      cart: {},
      wishlist: {},
      orders: [],
      history: [],
      cartCount: 0,
      wishCount: 0,
      cartTotal: 0,
      addToCart: () => {},
      removeFromCart: () => {},
      updateQty: () => {},
      clearCart: () => {},
      toggleWishlist: () => {},
      placeOrder: () => {},
      viewProduct: () => {},
      clearUserData: () => {},
      inWishlist: () => false,
      inCart: () => false,
    };
  }
  return ctx;
}
