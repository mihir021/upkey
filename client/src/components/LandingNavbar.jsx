import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  ShoppingBag,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  User,
  ClipboardList,
} from 'lucide-react';

/**
 * ==============================================================================
 * LandingNavbar — Glow More Premium Utility Navigation Bar
 * ==============================================================================
 *
 * Clean, always-solid utility navbar inspired by modern e-commerce patterns.
 * Structure (left to right):
 *   1. Logo wordmark ("Glow More" in brand orange, headline font)
 *   2. Nav links (Experience, Diagnostic, Dupes, Catalog) — left-aligned,
 *      active link gets a soft orange pill highlight
 *   3. Right actions: expandable search, wishlist heart, cart w/ badge,
 *      user account chip w/ dropdown
 *
 * Performance: GPU-composited Framer Motion transitions on search expand,
 * dropdown, and mobile drawer. No layout-triggering animations.
 *
 * Responsive: Below md breakpoint, nav links collapse into a hamburger
 * drawer. Logo + cart + account remain visible in the top bar.
 */

/* Section anchors for the single-page scroll journey */
const NAV_ITEMS = [
  { id: 'hero',       label: 'Experience',  href: '#hero' },
  { id: 'diagnostic', label: 'Diagnostic',  href: '#diagnostic' },
  { id: 'dupes',      label: 'Dupes',       href: '#dupes' },
  { id: 'catalog',    label: 'Catalog',     href: '#catalog' },
];

export default function LandingNavbar({
  cartCount = 0,
  productsCount = 66,
  isAuthenticated = false,
  user = null,
  logout = () => {},
  onTakeQuiz = () => {}
}) {
  // ── State ──────────────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState('hero');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Refs ───────────────────────────────────────────────────────────────
  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  // ── Scroll spy — detect which section is in view ───────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'diagnostic', 'dupes', 'catalog'];
      const scrollPos = window.scrollY + window.innerHeight * 0.35;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Close account dropdown on outside click ────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Auto-focus search input when expanded ──────────────────────────────
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // ── Close search on Escape key ─────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  // ── User display helpers ───────────────────────────────────────────────
  const userInitial = user?.name ? user.name.trim()[0].toUpperCase() : 'U';
  const userLastName = user?.name
    ? user.name.split(' ').slice(-1)[0]
    : 'Member';

  // Suppress unused-var lint — productsCount reserved for Catalog badge
  void productsCount;
  void onTakeQuiz;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FEFCFA] border-b border-[#EDE2D7] shadow-[0_1px_3px_rgba(35,30,27,0.04)]">
      {/* ── Main navbar row — fixed height, all elements vertically centered ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between">

        {/* ================================================================
            1. LOGO + NAV LINKS (left-aligned group)
            ================================================================ */}
        <div className="flex items-center gap-8 lg:gap-10">
          {/* Logo Wordmark */}
          <a
            href="#hero"
            className="shrink-0 text-[#E8633A] text-xl sm:text-[22px] font-bold font-brand tracking-tight leading-none hover:opacity-90 transition-opacity focus:outline-none"
            aria-label="Glow More Home"
          >
            Glow More
          </a>

          {/* Desktop Nav Links — left-aligned, not centered */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Primary Navigation"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setActiveSection(item.id)}
                  className={`relative px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-[#E8633A] bg-[#E8633A]/8'
                      : 'text-[#665D57] hover:text-[#E8633A] hover:bg-[#E8633A]/5'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>

        {/* ================================================================
            2. RIGHT ACTIONS (search, wishlist, cart, user chip)
            ================================================================ */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* ── Expandable Search ──────────────────────────────────────── */}
          <div className="hidden sm:flex items-center relative">
            <AnimatePresence mode="wait">
              {searchOpen ? (
                <motion.div
                  key="search-expanded"
                  initial={{ width: 40, opacity: 0.5 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 40, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="flex items-center h-10 rounded-full bg-[#F5EFE9] border border-[#E8DFD4] overflow-hidden"
                >
                  <div className="w-10 h-10 flex items-center justify-center shrink-0 text-[#E8633A]">
                    <Search className="w-[16px] h-[16px] stroke-[2.2]" />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => {
                      if (!searchQuery.trim()) {
                        setSearchOpen(false);
                      }
                    }}
                    placeholder="Search skincare..."
                    className="flex-1 h-full bg-transparent text-xs text-[#231E1B] placeholder:text-[#A0938A] outline-none pr-3"
                  />
                </motion.div>
              ) : (
                <motion.button
                  key="search-icon"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSearchOpen(true)}
                  aria-label="Open search"
                  className="h-10 w-10 rounded-full flex items-center justify-center text-[#665D57] hover:bg-[#E8633A]/8 hover:text-[#E8633A] transition-all duration-200 cursor-pointer"
                >
                  <Search className="w-[18px] h-[18px] stroke-[2]" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* ── Wishlist Heart Icon ────────────────────────────────────── */}
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="hidden sm:flex h-10 w-10 rounded-full items-center justify-center text-[#665D57] hover:bg-[#E8633A]/8 hover:text-[#E8633A] transition-all duration-200"
          >
            <Heart className="w-[18px] h-[18px] stroke-[2]" />
          </Link>

          {/* ── Cart Icon with Badge ───────────────────────────────────── */}
          <a
            href="#catalog"
            aria-label="View Routine Basket"
            className="h-10 w-10 rounded-full flex items-center justify-center text-[#665D57] hover:bg-[#E8633A]/8 hover:text-[#E8633A] transition-all duration-200 relative cursor-pointer"
          >
            <ShoppingBag className="w-[18px] h-[18px] stroke-[2]" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-[#E8633A] text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-sm pointer-events-none leading-none">
                {cartCount}
              </span>
            )}
          </a>

          {/* ── User Account Chip / Auth Link ──────────────────────────── */}
          {isAuthenticated ? (
            <div className="relative flex items-center" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="h-10 pl-1 pr-2.5 sm:pr-3 rounded-full bg-white border border-[#EDE2D7] hover:border-[#E8633A]/40 transition-all duration-200 shadow-[0_1px_2px_rgba(35,30,27,0.05)] cursor-pointer flex items-center gap-2 shrink-0"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                {/* Orange avatar circle with initial letter */}
                <div className="w-7 h-7 rounded-full bg-[#E8633A] text-white text-[12px] flex items-center justify-center font-bold shrink-0">
                  {userInitial}
                </div>

                {/* Name (hidden on small screens) */}
                <span className="hidden sm:inline text-[13px] font-semibold text-[#231E1B] truncate max-w-[80px]">
                  {userLastName}
                </span>

                {/* Dropdown chevron */}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#7A706A] transition-transform duration-200 shrink-0 ${
                    userMenuOpen ? 'rotate-180 text-[#E8633A]' : ''
                  }`}
                />
              </button>

              {/* ── Account Dropdown Menu ────────────────────────────────── */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white border border-[#EDE2D7] shadow-lg shadow-[#231E1B]/8 py-1.5 z-50"
                  >
                    {/* User info header */}
                    <div className="px-3.5 py-2.5 border-b border-[#EDE2D7]">
                      <div className="text-[13px] font-bold text-[#231E1B] truncate">
                        {user?.name || 'Member'}
                      </div>
                      <div className="text-[11px] text-[#8A7D75] truncate mt-0.5">
                        {user?.email || 'Active Account'}
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-[#231E1B] hover:bg-[#FAF6F2] hover:text-[#E8633A] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-[#231E1B] hover:bg-[#FAF6F2] hover:text-[#E8633A] transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        <span>Wishlist</span>
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-[#231E1B] hover:bg-[#FAF6F2] hover:text-[#E8633A] transition-colors"
                      >
                        <ClipboardList className="w-4 h-4" />
                        <span>Orders</span>
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-[#231E1B] hover:bg-[#FAF6F2] hover:text-[#E8633A] transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                    </div>

                    {/* Sign out */}
                    <div className="border-t border-[#EDE2D7] pt-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="h-10 px-5 rounded-full bg-[#E8633A] text-white text-[13px] font-bold hover:bg-[#D4552E] transition-all shadow-sm shadow-[#E8633A]/20 flex items-center justify-center shrink-0"
            >
              Login
            </Link>
          )}

          {/* ── Mobile Hamburger ───────────────────────────────────────── */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Mobile Menu"
            className="md:hidden h-10 w-10 rounded-full flex items-center justify-center text-[#231E1B] hover:bg-[#E8633A]/8 transition-colors cursor-pointer shrink-0"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ====================================================================
          MOBILE RESPONSIVE DRAWER
          ==================================================================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-[#FEFCFA] border-b border-[#EDE2D7] px-4 pb-4"
          >
            {/* Mobile Search Bar (full-width) */}
            <div className="pt-3 pb-3 border-b border-[#EDE2D7] mb-2">
              <div className="flex items-center h-10 rounded-full bg-[#F5EFE9] border border-[#E8DFD4] px-3 gap-2">
                <Search className="w-4 h-4 text-[#A0938A] shrink-0" />
                <input
                  type="text"
                  placeholder="Search skincare..."
                  className="flex-1 bg-transparent text-xs text-[#231E1B] placeholder:text-[#A0938A] outline-none"
                />
              </div>
            </div>

            {/* Mobile Nav Links */}
            <div className="space-y-0.5">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                    activeSection === item.id
                      ? 'bg-[#E8633A]/8 text-[#E8633A]'
                      : 'text-[#231E1B] hover:bg-[#F5EFE9]'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Mobile Wishlist Link */}
            <div className="mt-3 pt-3 border-t border-[#EDE2D7]">
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-[#231E1B] hover:bg-[#F5EFE9] transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span>Wishlist</span>
              </Link>
            </div>

            {/* Mobile Auth CTA */}
            {!isAuthenticated && (
              <div className="mt-3 pt-3 border-t border-[#EDE2D7]">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full h-10 rounded-full bg-[#E8633A] text-white text-[13px] font-bold shadow-sm"
                >
                  Login
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
