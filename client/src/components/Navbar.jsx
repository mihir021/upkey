import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Leaf,
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Coins,
  User,
  Package,
  LayoutDashboard,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import api from '../api/axios';

/**
 * ==============================================================================
 * Navbar Component — Glow More Luxury Editorial Navigation
 * ==============================================================================
 *
 * Professional UI/UX Architecture:
 *
 * 1. Zone 1 (Left Anchor - Brand):
 *    - Balanced terracotta gradient leaf badge (38x38px) paired with the
 *      "Glow More" editorial serif wordmark.
 *    - Anchored on the far left with responsive scaling.
 *
 * 2. Zone 2 (Center - Primary Navigation Segment):
 *    - Centered pill-container navigation group (h-10) housing key discovery
 *      tabs: "Shop", "Explore", "Compare", "Dashboard".
 *    - Consistent 32px inner pill height (h-8) and horizontal padding (px-4),
 *      ensuring exact baseline alignment and equal visual weight across all tabs.
 *    - Active tab floats with a crisp elevated white pill and terracotta accent.
 *    - Comparison count indicator badge with subtle badge styling.
 *
 * 3. Zone 3 (Right Anchor - Actions & Account):
 *    - All interactive controls strictly standardized to a uniform 40px height (h-10):
 *      a) Search Bar: Proportional pill input (w-44 to w-60) with subtle focus expansion.
 *      b) Subtle Vertical Divider (h-5 w-px): Visually segregates search from actions.
 *      c) Wishlist Button: Circular 40x40px button with counter badge.
 *      d) Cart Button: Circular 40x40px button with counter badge.
 *      e) Joyory Rewards Pill: Standardized 40px pill with coin icon and live balance.
 *      f) User Profile Chip: Standardized 40px pill with avatar, name, and chevron.
 *      g) Sign In Button: Standardized 40px pill with terracotta fill and soft shadow.
 *      h) Mobile Hamburger: Standardized 40x40px circular toggle.
 *
 * 4. Responsive Drawer:
 *    - Clean slide-down drawer preserving full access to Shop, Explore, Compare,
 *      Dashboard, Wishlist, Orders, Rewards, and Authentication.
 */

// Core desktop navigation tabs (focused on primary discovery & shopping workflows)
const DESKTOP_NAV_LINKS = [
  { label: 'Shop',      to: '/shop' },
  { label: 'Explore',   to: '/explore' },
  { label: 'Compare',   to: '/compare', hasBadge: true },
  { label: 'Dashboard', to: '/dashboard' },
];

// Comprehensive mobile navigation links
const MOBILE_NAV_LINKS = [
  { label: 'Shop',        to: '/shop' },
  { label: 'Explore',     to: '/explore' },
  { label: 'Compare',     to: '/compare', hasBadge: true },
  { label: 'Dashboard',   to: '/dashboard' },
  { label: 'My Wishlist', to: '/wishlist' },
  { label: 'My Orders',   to: '/orders' },
];

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { cartCount, wishCount, clearUserData } = useCart();
  const { compareCount } = useCompare();
  const { user, logout, isAuthenticated } = useAuth();

  const [menuOpen, setMenuOpen]       = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchVal, setSearchVal]     = useState('');
  const [coinBalance, setCoinBalance] = useState(null);
  const searchRef = useRef();
  const profileRef = useRef();

  // Fetch rewards coin balance when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      api.get('/orders/rewards/balance')
        .then((res) => setCoinBalance(res.data.coinsBalance))
        .catch(console.error);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCoinBalance(null);
    }
  }, [isAuthenticated]);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile drawer when navigating
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  function handleSearch(e) {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
    }
  }

  const isActive = (to) => location.pathname === to;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FEFCFA]/95 backdrop-blur-md border-b border-[#EADFD4] shadow-2xs transition-all duration-200">
      {/* ── Main Nav Container: Full-width balanced alignment with h-20 height ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">

        {/* ==================================================================
            ZONE 1: BRAND LOGO (Left Anchor with Leaf Icon Badge)
            ================================================================== */}
        <div className="flex items-center shrink-0">
          <Link
            to="/shop"
            className="flex items-center gap-2.5 sm:gap-3 group text-decoration-none focus:outline-none"
            aria-label="Glow More Home"
          >
            {/* Visual Anchor: Terracotta Gradient Leaf Badge */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E8633A] via-[#E8633A] to-[#D44E28] flex items-center justify-center text-white shadow-sm shadow-[#E8633A]/25 transition-transform duration-200 group-hover:scale-105 shrink-0">
              <Leaf className="w-5 h-5 stroke-[2.2]" />
            </div>

            {/* Editorial Serif Brand Headline */}
            <span className="text-2xl sm:text-[25px] font-bold font-brand tracking-tight text-[#231E1B] leading-none group-hover:text-[#E8633A] transition-colors">
              Glow More
            </span>
          </Link>
        </div>

        {/* ==================================================================
            ZONE 2: PRIMARY NAVIGATION SEGMENT (Centered Luxury Pill Group)
            ================================================================== */}
        <div className="hidden md:flex items-center justify-center flex-1 px-2">
          <nav
            className="flex items-center p-1 rounded-full bg-[#F5EFE9]/80 border border-[#EADFD4] shadow-2xs backdrop-blur-xs gap-0.5"
            aria-label="Main Navigation"
          >
            {DESKTOP_NAV_LINKS.map((link) => {
              const active = isActive(link.to);
              const showBadge = link.hasBadge && compareCount > 0;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative h-8 px-4 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 select-none ${
                    active
                      ? 'bg-white text-[#E8633A] font-bold shadow-xs border border-[#EADFD4]/60'
                      : 'text-[#655A52] hover:text-[#231E1B] hover:bg-white/50'
                  }`}
                >
                  <span>{link.label}</span>
                  {showBadge && (
                    <span className="min-w-[17px] h-[17px] rounded-full bg-[#E8633A] text-white text-[9.5px] font-bold flex items-center justify-center px-1 leading-none shadow-2xs">
                      {compareCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ==================================================================
            ZONE 3: SEARCH BAR + ACTION ICONS + USER CHIP (Right Anchor)
            All interactive elements strictly standardized to h-10 (40px)
            ================================================================== */}
        <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0">

          {/* ── Search Input: Expandable, perfectly centered with h-10 ── */}
          <form
            onSubmit={handleSearch}
            className="hidden sm:flex items-center h-10 w-44 lg:w-56 focus-within:w-64 rounded-full bg-[#F5EFE9]/80 border border-[#EADFD4] px-3.5 gap-2.5 shadow-2xs focus-within:border-[#E8633A]/60 focus-within:bg-white focus-within:shadow-xs transition-all duration-200"
          >
            <Search className="w-4 h-4 text-[#8A7D75] shrink-0" />
            <input
              ref={searchRef}
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search skincare..."
              className="w-full bg-transparent text-xs font-medium text-[#231E1B] placeholder:text-[#9C8F85] outline-none h-full"
            />
          </form>

          {/* ── Subtle Vertical Grouping Divider ── */}
          <div className="hidden sm:block h-5 w-[1px] bg-[#EADFD4] mx-0.5" aria-hidden="true" />

          {/* ── Wishlist Icon Button with Notification Counter ── */}
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            title="My Wishlist"
            className={`relative w-10 h-10 rounded-full border flex items-center justify-center shadow-2xs hover:scale-105 active:scale-95 transition-all ${
              isActive('/wishlist')
                ? 'bg-[#FAF6F2] border-[#E8633A]/60 text-[#E8633A]'
                : 'bg-white border-[#EADFD4] text-[#5C534D] hover:text-[#E8633A] hover:border-[#E8633A]/40 hover:bg-[#FAF6F2]'
            }`}
          >
            <Heart
              className="w-4 h-4 stroke-[2]"
              fill={isActive('/wishlist') ? '#E8633A' : 'none'}
              color={isActive('/wishlist') ? '#E8633A' : 'currentColor'}
            />
            {wishCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#E8633A] text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-2xs leading-none">
                {wishCount}
              </span>
            )}
          </Link>

          {/* ── Cart Icon Button with Notification Counter ── */}
          <Link
            to="/cart"
            aria-label="View Shopping Cart"
            title="Shopping Cart"
            className={`relative w-10 h-10 rounded-full border flex items-center justify-center shadow-2xs hover:scale-105 active:scale-95 transition-all ${
              isActive('/cart')
                ? 'border-[#E8633A]/60 text-[#E8633A] bg-[#FAF6F2]'
                : 'bg-white border-[#EADFD4] text-[#5C534D] hover:text-[#E8633A] hover:border-[#E8633A]/40 hover:bg-[#FAF6F2]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 stroke-[2]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#E8633A] text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-2xs leading-none">
                {cartCount}
              </span>
            )}
          </Link>

          {/* ── Rewards Coin Balance Chip (when authenticated) ── */}
          {isAuthenticated && coinBalance !== null && (
            <Link
              to="/rewards"
              aria-label="Joyory Rewards"
              title="Joyory Rewards"
              className={`flex items-center gap-1.5 h-10 px-3 rounded-full border shadow-2xs text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
                isActive('/rewards')
                  ? 'border-[#E8633A]/60 bg-[#FAF6F2] text-[#E8633A]'
                  : 'border-[#EADFD4] bg-white text-[#231E1B] hover:border-[#E8633A]/40 hover:text-[#E8633A] hover:bg-[#FAF6F2]'
              }`}
            >
              <Coins className="w-4 h-4 text-[#E8633A] shrink-0" />
              <span>{coinBalance}</span>
            </Link>
          )}

          {/* ── User Account Menu Chip with Popover Dropdown ── */}
          {isAuthenticated && user ? (
            <div ref={profileRef} className="relative flex items-center">
              <button
                onClick={() => setProfileOpen((p) => !p)}
                className="h-10 pl-1.5 pr-3 rounded-full bg-white border border-[#EADFD4] hover:border-[#E8633A]/50 hover:bg-[#FAF6F2] transition-all shadow-2xs cursor-pointer flex items-center gap-2 shrink-0"
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                {/* Avatar circle with user initial */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E8633A] to-[#D44E28] text-white text-xs flex items-center justify-center font-bold shadow-2xs shrink-0">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>

                {/* User First Name */}
                <span className="hidden sm:inline text-xs font-bold text-[#231E1B] truncate max-w-[85px] leading-none">
                  {user.name?.split(' ')[0]}
                </span>

                {/* Smooth Animated Chevron */}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#7A706A] transition-transform duration-200 shrink-0 ${
                    profileOpen ? 'rotate-180 text-[#E8633A]' : ''
                  }`}
                />
              </button>

              {/* Luxury Profile Popover Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white border border-[#EADFD4] shadow-xl shadow-[#231E1B]/10 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-[#F5EFE9]">
                  <div className="px-4 py-3 bg-[#FAF6F2]/50 rounded-t-2xl">
                    <div className="text-xs font-bold text-[#231E1B] truncate">
                      {user.name}
                    </div>
                    <div className="text-[11px] text-[#8A7D75] truncate mt-0.5">
                      {user.email}
                    </div>
                  </div>

                  <div className="py-1">
                    {[
                      { label: 'User Profile', to: '/profile',   icon: User },
                      { label: 'Dashboard',    to: '/dashboard', icon: LayoutDashboard },
                      { label: 'My Orders',    to: '/orders',    icon: Package },
                      { label: 'My Rewards',   to: '/rewards',   icon: Coins },
                    ].map((item) => {
                      const IconComp = item.icon;
                      return (
                        <button
                          key={item.to}
                          onClick={() => {
                            navigate(item.to);
                            setProfileOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-[#231E1B] hover:bg-[#FAF6F2] hover:text-[#E8633A] transition-colors cursor-pointer flex items-center gap-2.5"
                        >
                          <IconComp className="w-3.5 h-3.5 text-[#8A7D75] shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => {
                        clearUserData();
                        logout();
                        api.post('/metrics/track', { event: 'logout' }).catch(() => {});
                        navigate('/');
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#C94F2A] hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="h-10 px-5 rounded-full bg-[#E8633A] text-white text-xs font-bold hover:bg-[#D4552E] shadow-sm shadow-[#E8633A]/25 transition-all cursor-pointer flex items-center justify-center"
            >
              Sign In
            </button>
          )}

          {/* ── Mobile Hamburger Toggle Button (h-10 w-10) ── */}
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="md:hidden h-10 w-10 rounded-full bg-white border border-[#EADFD4] flex items-center justify-center text-[#231E1B] shadow-2xs hover:bg-[#FAF6F2] cursor-pointer shrink-0"
            aria-label="Toggle mobile menu"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ==================================================================
          MOBILE COLLAPSIBLE MENU DRAWER
          ================================================================== */}
      {menuOpen && (
        <div className="md:hidden bg-[#FEFCFA] border-b border-[#EADFD4] px-6 pb-5 pt-2 animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearch} className="py-3 border-b border-[#EADFD4] mb-3">
            <div className="flex items-center h-10 rounded-full bg-[#F5EFE9] border border-[#EADFD4] px-3.5 gap-2">
              <Search className="w-4 h-4 text-[#8A7D75] shrink-0" />
              <input
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search skincare..."
                className="flex-1 bg-transparent text-xs text-[#231E1B] placeholder:text-[#9C8F85] outline-none"
              />
            </div>
          </form>

          <div className="space-y-1">
            {MOBILE_NAV_LINKS.map((link) => {
              const active = isActive(link.to);
              const showBadge = link.hasBadge && compareCount > 0;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-[#E8633A]/10 text-[#E8633A]'
                      : 'text-[#231E1B] hover:bg-[#FAF6F2]'
                  }`}
                >
                  <span>{link.label}</span>
                  {showBadge && (
                    <span className="min-w-[18px] h-[18px] rounded-full bg-[#E8633A] text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-2xs leading-none">
                      {compareCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

