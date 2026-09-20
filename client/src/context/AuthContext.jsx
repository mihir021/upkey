import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    // If one is missing, clear both so user is cleanly logged out
    if (!t || !u) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
    return t;
  });

  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('token');
    if (!t) return null;
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  });

  const [gateModalOpen, setGateModalOpen] = useState(false);
  const [gateReason, setGateReason] = useState('enjoy Glow More services');

  // Listen for unauthorized 401 events to log out cleanly
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Synchronize state changes to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Login handler
  async function login(credentials) {
    const res = await api.post('/auth/login', credentials);
    const { token: newToken, user: newUser } = res.data;
    if (newToken) localStorage.setItem('token', newToken);
    if (newUser) localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return res.data;
  }

  // Signup handler
  async function signup(userData) {
    const res = await api.post('/auth/signup', userData);
    const { token: newToken, user: newUser } = res.data;
    if (newToken) localStorage.setItem('token', newToken);
    if (newUser) localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return res.data;
  }

  // Logout handler
  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Service gating helper: if user is not logged in, opens the gate modal and returns false
  function requireAuth(reason = 'enjoy Glow More services', onAuthorized) {
    if (!token || !user) {
      setGateReason(reason);
      setGateModalOpen(true);
      return false;
    }
    if (typeof onAuthorized === 'function') {
      onAuthorized();
    }
    return true;
  }

  function openGate(reason = 'enjoy Glow More services') {
    setGateReason(reason);
    setGateModalOpen(true);
  }

  function closeGate() {
    setGateModalOpen(false);
  }

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token && user),
    login,
    signup,
    logout,
    gateModalOpen,
    gateReason,
    openGate,
    closeGate,
    requireAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Allow exporting the custom hook alongside Provider in this context module
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      token: null,
      user: null,
      isAuthenticated: false,
      login: async (credentials) => {
        const res = await api.post('/auth/login', credentials);
        return res.data;
      },
      signup: async (userData) => {
        const res = await api.post('/auth/signup', userData);
        return res.data;
      },
      logout: () => {},
      gateModalOpen: false,
      gateReason: '',
      openGate: () => {},
      closeGate: () => {},
      requireAuth: () => true,
    };
  }
  return context;
}

export default AuthContext;
