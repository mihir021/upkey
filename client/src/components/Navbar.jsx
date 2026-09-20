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
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

/**
 * ==============================================================================
 * Navbar Component — Glow More Luxury Editorial Navigation
 * ==============================================================================
 *
 * Implements a balanced, high-contrast, premium three-zone layout:
 *
 * Zone 1 (Left):
 *   - Terracotta leaf icon badge + "Glow More" bold serif headline wordmark.
 *   - Generous breathing room separating it from the navigation links.
 *
 * Zone 2 (Center):
 *   - Centered navigation links ("Shop", "Explore", "Dashboard", "Wishlist", "Orders").
 *   - Uniform hit-area and padding (px-4 py-2) across both active and inactive links.
 *   - Text size text-[15px] and font-semibold for crisp presence and legibility.
 *   - Active link gets an integrated soft terracotta pill highlight (#E8633A/10).
 *
 * Zone 3 (Right):
 *   - Search Bar: Wider default width (w-60 to w-64) with subtle warm border (#EADFD4).
 *   - Wishlist & Cart buttons: Circular buttons with hover-lift and orange badges.
 *   - User Profile Chip: Avatar circle with initials, name, and clean dropdown menu.
 *   - Generous spacing (gap-4 sm:gap-5) between all right-side elements.
 *
 * Architecture & Presence:
 *   - Full-width sticky bar with h-20 (80px) height for visual authority.
 *   - Soft bottom border and subtle shadow (shadow-sm) to separate from cream page content.
 *   - Centered max-w-7xl container with px-8 to px-12 horizontal padding.
 */

const NAV_LINKS = [
  { label: 'Shop',      to: '/shop' },
  { label: 'Explore',   to: '/explore' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Wishlist',  to: '/wishlist' },
  { label: 'Orders',    to: '/orders' },
];

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { cartCount, wishCount, clearUserData } = useCart();
  const { user, logout, isAuthenticated } = useAuth();

  const [menuOpen, setMenuOpen]       = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchVal, setSearchVal]     = useState('');
  const searchRef = useRef();
  const profileRef = useRef();

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

  function handleSearch(e) {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
    }
  }

  const isActive = (to) => location.pathname === to;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#FEFCFA]/95 backdrop-blur-md border-b border-[#EADFD4] shadow-sm transition-all duration-200">
        {/* ── Centered max-w-7xl container with px-8 to px-12 padding & h-20 height ── */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between">

          {/* ==================================================================
              ZONE 1: BRAND LOGO (Left Anchor with Leaf Icon Badge)
              ================================================================== */}
          <div className="flex items-center shrink-0">
            <Link
              to="/shop"
              className="flex items-center gap-3 group text-decoration-none focus:outline-none"
              aria-label="Glow More Home"
            >
              {/* Visual Anchor: Terracotta Gradient Leaf Badge */}
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E8633A] via-[#E8633A] to-[#D44E28] flex items-center justify-center text-white shadow-md shadow-[#E8633A]/25 transition-transform duration-200 group-hover:scale-105">
                <Leaf className="w-5 h-5 stroke-[2.2]" />
              </div>

              {/* Bold Serif Headline Wordmark */}
              <span className="text-2xl sm:text-[26px] font-bold font-brand tracking-tight text-[#231E1B] leading-none group-hover:text-[#E8633A] transition-colors">
                Glow More
              </span>
            </Link>
          </div>

          {/* ==================================================================
              ZONE 2: PRIMARY NAVIGATION LINKS (Balanced Center Zone)
              ================================================================== */}
          <nav
            className="hidden md:flex items-center gap-1.5 lg:gap-2.5"
            aria-label="Main Navigation"
          >
            {NAV_LINKS.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-full text-[15px] font-semibold tracking-tight transition-all duration-200 ${
                    active
                      ? 'bg-[#E8633A]/10 text-[#E8633A] font-bold shadow-2xs'
                      : 'text-[#5C534D] hover:text-[#E8633A] hover:bg-[#FAF6F2]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ==================================================================
              ZONE 3: SEARCH BAR + ACTION ICONS + USER CHIP (Right Side)
              ================================================================== */}
          <div className="flex items-center gap-4 lg:gap-5 shrink-0">

            {/* ── Search Input: Wider (w-60 to w-64) with crisp border ── */}
            <form
              onSubmit={handleSearch}
              className="hidden sm:flex items-center w-56 lg:w-64 h-10 rounded-full bg-[#F5EFE9] border border-[#EADFD4] px-4 gap-2.5 shadow-2xs focus-within:border-[#E8633A]/60 focus-within:bg-white focus-within:shadow-xs transition-all"
            >
              <Search className="w-4 h-4 text-[#8A7D75] shrink-0" />
              <input
                ref={searchRef}
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search skincare..."
                className="w-full bg-transparent text-xs font-medium text-[#231E1B] placeholder:text-[#9C8F85] outline-none"
              />
            </form>

            {/* ── Wishlist Icon Button with Counter Badge ── */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative w-10 h-10 rounded-full bg-white border border-[#EADFD4] flex items-center justify-center text-[#5C534D] hover:text-[#E8633A] hover:border-[#E8633A]/40 shadow-2xs hover:scale-105 transition-all"
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

            {/* ── Cart Icon Button with Counter Badge ── */}
            <Link
              to="/cart"
              aria-label="View Shopping Cart"
              className={`relative w-10 h-10 rounded-full bg-white border border-[#EADFD4] flex items-center justify-center shadow-2xs hover:scale-105 transition-all ${
                isActive('/cart')
                  ? 'border-[#E8633A]/60 text-[#E8633A] bg-[#FAF6F2]'
                  : 'text-[#5C534D] hover:text-[#E8633A] hover:border-[#E8633A]/40'
              }`}
            >
              <ShoppingBag className="w-4 h-4 stroke-[2]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#E8633A] text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-2xs leading-none">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* ── User Account Chip with Dropdown ── */}
            {isAuthenticated && user ? (
              <div ref={profileRef} className="relative flex items-center">
                <button
                  onClick={() => setProfileOpen((p) => !p)}
                  className="h-10 pl-1.5 pr-3 rounded-full bg-white border border-[#EADFD4] hover:border-[#E8633A]/50 hover:bg-[#FAF6F2] transition-all shadow-2xs cursor-pointer flex items-center gap-2 shrink-0"
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                >
                  {/* Avatar circle with initial */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E8633A] to-[#D44E28] text-white text-xs flex items-center justify-center font-bold shadow-2xs shrink-0">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>

                  {/* User Name */}
                  <span className="hidden sm:inline text-xs font-bold text-[#231E1B] truncate max-w-[85px]">
                    {user.name?.split(' ')[0]}
                  </span>

                  {/* Rotating Chevron */}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#7A706A] transition-transform duration-200 shrink-0 ${
                      profileOpen ? 'rotate-180 text-[#E8633A]' : ''
                    }`}
                  />
                </button>

                {/* Account Dropdown Popover */}
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white border border-[#EADFD4] shadow-xl shadow-[#231E1B]/10 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-[#F5EFE9]">
                    <div className="px-4 py-2.5">
                      <div className="text-xs font-bold text-[#231E1B] truncate">
                        {user.name}
                      </div>
                      <div className="text-[11px] text-[#8A7D75] truncate mt-0.5">
                        {user.email}
                      </div>
                    </div>

                    <div className="py-1">
                      {[
                        { label: 'User Profile', to: '/profile' },
                        { label: 'Dashboard',    to: '/dashboard' },
                        { label: 'My Orders',    to: '/orders' },
                      ].map((item) => (
                        <button
                          key={item.to}
                          onClick={() => {
                            navigate(item.to);
                            setProfileOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-[#231E1B] hover:bg-[#FAF6F2] hover:text-[#E8633A] transition-colors cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => {
                          clearUserData();
                          logout();
                          navigate('/');
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#C94F2A] hover:bg-red-50 transition-colors cursor-pointer"
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
                className="h-10 px-5 rounded-full bg-[#E8633A] text-white text-xs font-bold hover:bg-[#D4552E] shadow-sm shadow-[#E8633A]/25 transition-all cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="md:hidden h-10 w-10 rounded-full bg-white border border-[#EADFD4] flex items-center justify-center text-[#231E1B] shadow-2xs hover:bg-[#FAF6F2] cursor-pointer shrink-0"
              aria-label="Toggle mobile menu"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Collapsible Menu ── */}
        {menuOpen && (
          <div className="md:hidden bg-[#FEFCFA] border-b border-[#EADFD4] px-6 pb-4 animate-in slide-in-from-top-2 duration-200">
            <form onSubmit={handleSearch} className="py-3 border-b border-[#EADFD4] mb-2">
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
              {NAV_LINKS.map((link) => {
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-[#E8633A]/10 text-[#E8633A]'
                        : 'text-[#231E1B] hover:bg-[#FAF6F2]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
