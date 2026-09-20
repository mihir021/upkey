import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  ShoppingBag,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  User,
} from 'lucide-react';

/**
 * Navigation items for the single-page scroll journey.
 * Each item has a section anchor, clean display label, and muted numeric tag.
 */
const NAV_ITEMS = [
  { id: 'hero',       num: '01', label: 'Experience',   href: '#hero' },
  { id: 'diagnostic', num: '02', label: 'Diagnostic',   href: '#diagnostic' },
  { id: 'dupes',      num: '03', label: 'Smart Dupes',  href: '#dupes' },
  { id: 'catalog',    num: '04', label: 'Catalog',      href: '#catalog', hasCount: true },
];

/**
 * LandingNavbar Component
 * 
 * Luxury editorial navigation bar designed for Glow More:
 * 1. Brand Logo: Terracotta-to-crimson gradient badge + Fraunces serif headline + status pill.
 * 2. Nav Links: Glassmorphic floating-pill container with smooth Framer Motion sliding pill indicator.
 * 3. Right Actions: Cart with soft hover circle, avatar pill with integrated dropdown menu, and hover-lift CTA button.
 * 4. Scroll Adaptation: Blends seamlessly at hero top, transforms into frosted cream glass with subtle border on scroll > 50px.
 * 5. Responsive: Collapses into an animated mobile drawer while keeping logo, cart, and CTA accessible.
 */
export default function LandingNavbar({
  cartCount = 0,
  productsCount = 66,
  isAuthenticated = false,
  user = null,
  logout = () => {},
  onTakeQuiz = () => {}
}) {
  // State for scroll-triggered glassmorphism transition
  const [isScrolled, setIsScrolled] = useState(false);

  // Active section tracking (based on scroll position / intersection)
  const [activeSection, setActiveSection] = useState('hero');

  // Hovered item for interactive sliding pill preview
  const [hoveredItem, setHoveredItem] = useState(null);

  // Account dropdown state
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. Detect scroll position to trigger navbar transition (transparent -> frosted cream)
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);

      // Section scroll spy
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
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Click outside listener to close account dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine which nav pill to highlight (hovered item takes priority over active section)
  const highlightedId = hoveredItem || activeSection;

  // Extract user initial and display name
  const userInitial = user?.name ? user.name.trim()[0].toUpperCase() : 'U';
  const userFirstName = user?.name ? user.name.split(' ')[0] : 'Member';

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#F6EFE9]/90 backdrop-blur-md border-b border-[#E8DFD4]/80 shadow-xs'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      {/* Fixed-height navbar row (h-16 sm:h-20) ensures perfect vertical centering across all elements */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* ====================================================================
            1. BRAND & LOGO (Left)
            ==================================================================== */}
        <div className="flex items-center space-x-3 sm:space-x-3.5">
          {/* Subtle gradient leaf badge */}
          <a
            href="#hero"
            className="flex items-center space-x-3 group text-decoration-none focus:outline-none"
            aria-label="Glow More Home"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E8633A] via-[#E8633A] to-[#D44E28] flex items-center justify-center text-white shadow-md shadow-[#E8633A]/25 transition-transform duration-200 group-hover:scale-105">
              <Leaf className="w-5 h-5 stroke-[2.2]" />
            </div>

            <div className="flex items-center">
              {/* Confident modern serif-sans hybrid headline font */}
              <span className="text-xl sm:text-2xl font-bold font-brand tracking-tight text-[#231E1B] leading-none">
                Glow More
              </span>
            </div>
          </a>
        </div>

        {/* ====================================================================
            2. NAV LINKS (Center - Glassmorphic floating pill with sliding indicator)
            ==================================================================== */}
        <nav
          className="hidden md:flex items-center p-1 rounded-full bg-white/60 backdrop-blur-md border border-[#E8DFD4]/80 shadow-2xs relative"
          onMouseLeave={() => setHoveredItem(null)}
          aria-label="Primary Navigation"
        >
          {NAV_ITEMS.map((item) => {
            const isHighlighted = highlightedId === item.id;
            const isCurrent = activeSection === item.id;

            return (
              <a
                key={item.id}
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.id)}
                onClick={() => setActiveSection(item.id)}
                className={`relative px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-colors duration-200 z-10 flex items-center gap-1.5 ${
                  isHighlighted || isCurrent
                    ? 'text-[#E8633A]'
                    : 'text-[#665D57] hover:text-[#231E1B]'
                }`}
              >
                {/* Muted numeric tag */}
                <span
                  className={`text-[9px] font-mono transition-colors duration-200 ${
                    isHighlighted ? 'text-[#E8633A]/75' : 'text-[#A0938A]'
                  }`}
                >
                  {item.num}.
                </span>

                {/* Main section label */}
                <span>{item.label}</span>

                {/* Dynamic product count indicator */}
                {item.hasCount && (
                  <span className="text-[10px] text-[#A0938A] font-mono ml-0.5">
                    ({productsCount})
                  </span>
                )}

                {/* Animated sliding background pill */}
                {isHighlighted && (
                  <motion.div
                    layoutId="navbar-sliding-pill"
                    className="absolute inset-0 rounded-full bg-white shadow-xs border border-[#E8DFD4] -z-10"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                      duration: 0.2
                    }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* ====================================================================
            3. RIGHT ACTIONS (Cart + Login CTA / User Profile Pill)
            Unified flex container with items-center, consistent gap-3 sm:gap-4,
            and shared h-10 button height for exact horizontal baseline alignment.
            ==================================================================== */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Cart Icon Button - Unified h-10 w-10 circular button with centered icon */}
          <a
            href="#cart-section"
            aria-label="View Routine Basket"
            className="h-10 w-10 rounded-full bg-white/80 border border-[#EADFD4] flex items-center justify-center text-[#231E1B] shadow-2xs relative transition-all duration-200 hover:bg-[#E8633A]/10 hover:border-[#E8633A]/40 hover:text-[#E8633A] hover:scale-105 cursor-pointer shrink-0"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E8633A] text-white text-[9px] font-black flex items-center justify-center shadow-xs pointer-events-none leading-none">
                {cartCount}
              </span>
            )}
          </a>

          {/* User Profile Pill or Auth Link */}
          {isAuthenticated ? (
            <div className="relative flex items-center" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="h-10 pl-1.5 pr-3 rounded-full bg-white border border-[#EADFD4] text-xs font-bold text-[#231E1B] hover:border-[#E8633A]/50 hover:bg-[#FAF6F2] transition-all shadow-2xs cursor-pointer flex items-center gap-2 shrink-0 leading-none"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                {/* Avatar with initial */}
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#E8633A] to-[#D44E28] text-white text-[11px] flex items-center justify-center font-bold shadow-xs shrink-0">
                  {userInitial}
                </div>

                {/* Name */}
                <span className="hidden sm:inline truncate max-w-[85px] text-[#231E1B]">
                  Hi, {userFirstName}
                </span>

                {/* Dropdown chevron with rotation */}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#7A706A] transition-transform duration-200 shrink-0 ${
                    userMenuOpen ? 'rotate-180 text-[#E8633A]' : ''
                  }`}
                />
              </button>

              {/* Account Dropdown Menu */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E8DFD4] shadow-xl py-2 z-50 divide-y divide-[#EDE2D7]"
                  >
                    <div className="px-3 py-2 text-xs">
                      <div className="font-bold text-[#231E1B] truncate">{user?.name || 'Member'}</div>
                      <div className="text-[10px] text-[#8A7D75] truncate">{user?.email || 'Active Account'}</div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-[#231E1B] hover:bg-[#FAF6F2] hover:text-[#E8633A] transition-colors"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>User Profile</span>
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-[#231E1B] hover:bg-[#FAF6F2] hover:text-[#E8633A] transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Member Dashboard</span>
                      </Link>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="h-10 px-4 rounded-full bg-white border border-[#EADFD4] text-[#231E1B] text-xs font-bold hover:bg-[#FAF6F2] transition-all shadow-2xs flex items-center justify-center shrink-0"
              >
                Sign In
              </Link>
              <button
                type="button"
                onClick={onTakeQuiz}
                className="hidden sm:flex h-10 px-4 rounded-full bg-[#E8633A] text-white text-xs font-bold transition-all shadow-md shadow-[#E8633A]/25 hover:bg-[#D4552E] cursor-pointer items-center justify-center shrink-0"
              >
                Take Quiz
              </button>
            </div>
          )}

          {/* Mobile Hamburger Toggle Button - Matching h-10 w-10 circle */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Mobile Menu"
            className="md:hidden h-10 w-10 rounded-full bg-white border border-[#EADFD4] flex items-center justify-center text-[#231E1B] shadow-2xs hover:bg-[#FAF6F2] cursor-pointer shrink-0"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

        </div>
      </div>

      {/* ====================================================================
          5. MOBILE RESPONSIVE DRAWER (Collapsible nav menu)
          ==================================================================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-[#FAF6F2]/98 backdrop-blur-lg border-b border-[#E8DFD4] px-4 pt-3 pb-5 shadow-lg"
          >
            {/* Mobile Header Bar */}
            <div className="pb-3 mb-2 border-b border-[#EADFD4] flex items-center justify-between">
              <span className="text-xs font-bold font-brand text-[#231E1B]">Glow More</span>
              {!isAuthenticated && (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-1.5 rounded-full bg-[#E8633A] text-white text-xs font-bold shadow-xs hover:bg-[#D4552E] transition-colors"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Nav Links */}
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeSection === item.id
                      ? 'bg-[#E8633A] text-white shadow-xs'
                      : 'text-[#231E1B] hover:bg-white/80'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-mono ${activeSection === item.id ? 'text-white/75' : 'text-[#A0938A]'}`}>
                      {item.num}.
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.hasCount && (
                    <span className={`text-[10px] font-mono ${activeSection === item.id ? 'text-white/80' : 'text-[#A0938A]'}`}>
                      {productsCount} items
                    </span>
                  )}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
