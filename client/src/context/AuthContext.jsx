import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [gateModalOpen, setGateModalOpen] = useState(false);
  const [gateReason, setGateReason] = useState('enjoy Joyory services');

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
    setToken(newToken);
    setUser(newUser);
    return res.data;
  }

  // Signup handler
  async function signup(userData) {
    const res = await api.post('/auth/signup', userData);
    const { token: newToken, user: newUser } = res.data;
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
  function requireAuth(reason = 'enjoy Joyory services', onAuthorized) {
    if (!token) {
      setGateReason(reason);
      setGateModalOpen(true);
      return false;
    }
    if (typeof onAuthorized === 'function') {
      onAuthorized();
    }
    return true;
  }

  function openGate(reason = 'enjoy Joyory services') {
    setGateReason(reason);
    setGateModalOpen(true);
  }

  function closeGate() {
    setGateModalOpen(false);
  }

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token),
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
