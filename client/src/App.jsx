import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AuthGateModal from './components/AuthGateModal';
import AiChatWidget  from './components/AiChatWidget';
import LoadingScreen from './components/LoadingScreen';
import LandingPage    from './pages/LandingPage.jsx';
import Signup         from './pages/Signup.jsx';
import Login          from './pages/Login.jsx';
import Dashboard      from './pages/Dashboard.jsx';
import ShopPage       from './pages/ShopPage.jsx';
import ExplorePage    from './pages/ExplorePage.jsx';
import ProductDetail  from './pages/ProductDetail.jsx';
import CartPage       from './pages/CartPage.jsx';
import WishlistPage   from './pages/WishlistPage.jsx';
import UserProfile    from './pages/UserProfile.jsx';
import OrdersPage     from './pages/OrdersPage.jsx';
import RewardsPage    from './pages/RewardsPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';

/** Requires a valid JWT in localStorage. */
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  // Global initial app mount loading screen state
  const [initialLoading, setInitialLoading] = useState(true);

  return (
    <BrowserRouter>
      {/* Global Formulation Engine Calibration Loading Screen */}
      {initialLoading && (
        <LoadingScreen onComplete={() => setInitialLoading(false)} />
      )}
      <AuthProvider>
        <CartProvider>
          <AuthGateModal />
          <Routes>
            {/* ── Public ── */}
            <Route path="/"        element={<LandingPage />} />
            <Route path="/signup"  element={<Signup />} />
            <Route path="/login"   element={<Login />} />

            {/* ── Protected ── */}
            <Route path="/shop"       element={<ProtectedRoute><ShopPage /></ProtectedRoute>} />
            <Route path="/explore"    element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
            <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
            <Route path="/cart"       element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/wishlist"   element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
            <Route path="/profile"    element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/orders"     element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/rewards"    element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
            <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <AiChatWidget />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
