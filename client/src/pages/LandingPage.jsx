import { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  ArrowRight,
  Leaf,
  FlaskConical,
  ShieldCheck,
  Trash2,
  X
} from 'lucide-react';
import HeroBottle3D from '../components/HeroBottle3D';
import LiveSkincareBackground from '../components/LiveSkincareBackground';
import LandingNavbar from '../components/LandingNavbar';
import FloatingIngredients from '../components/FloatingIngredients';
import productsData from '../data/products.json';
import AuthContext from '../context/AuthContext';
import { useCart } from '../context/CartContext';

/**
 * Glow More — Scroll-Linked 3D Product Journey
 * 
 * Direct implementation of the user's hand-drawn sketch:
 * 1. Fixed/Sticky 3D Canvas in the center.
 * 2. As the user scrolls, the 3D model glides and rotates along a smooth S-curve trajectory.
 * 3. Left and Right columns present synchronized information at each scroll stop:
 *    - Stop 1 (Hero): Headline, Brand badges (Left) | Live Bio-Compatibility Widget (Right)
 *    - Stop 2 (Diagnostic): 60-Sec Skin Quiz (Left) | Transparent Reason Scoring Tags (Right)
 *    - Stop 3 (Dupe Finder): Premium vs Smart Dupe (Left) | Clinical Formulation Trade-offs (Right)
 *    - Stop 4 (Catalog & Bag): Search & Category filters (Left) | Interactive Cart & Checkout (Right)
/**
 * Scroll-triggered text animation configurations:
 * - Headline: Slides up 24px + fades in with 450ms ease-out
 * - Subheadline: Follows 100ms later (delay: 0.1s)
 * - Staggered items: Badges, cards, and buttons stagger with 80ms delay each
 */
const headlineAnimation = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.2 },
  transition: { duration: 0.45, ease: 'easeOut' }
};

const subheadlineAnimation = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.2 },
  transition: { duration: 0.45, delay: 0.1, ease: 'easeOut' }
};

const getStaggerAnimation = (index, baseDelay = 0.18) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.2 },
  transition: { duration: 0.45, delay: baseDelay + index * 0.08, ease: 'easeOut' }
});

export default function LandingPage() {
  const auth = useContext(AuthContext);
  const user = auth?.user || null;
  const isAuthenticated = auth?.isAuthenticated || false;
  const requireAuth = auth?.requireAuth || ((reason, cb) => { if (cb) cb(); return true; });
  const authLogout = auth?.logout || (() => {});
  const { clearUserData } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearUserData();
    authLogout();
  };

  // Chapter-aware scroll progress (0.0 to 1.0) drives the 3D bottle S-curve.
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRefs = useRef({});
  const heroIsActive = scrollProgress <= 0.17;
  const diagnosticIsActive = scrollProgress > 0.17 && scrollProgress <= 0.5;
  const dupesIsActive = scrollProgress > 0.5 && scrollProgress <= 0.84;

  // Diagnostic Quiz State
  const [skinType, setSkinType] = useState('Combination');
  const [skinTone, setSkinTone] = useState('Medium');
  const [primaryConcern, setPrimaryConcern] = useState('Oiliness|Dullness');

  // Search & Filters for Catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');

  // Cart state - initialized empty per user request (no pre-loaded items)
  const [cartItems, setCartItems] = useState([]);
  const [promoApplied, setPromoApplied] = useState(true);

  // Synchronize routine basket with persistent cart storage so items carry into checkout
  useEffect(() => {
    try {
      const cartObj = {};
      cartItems.forEach((item) => {
        cartObj[item.id] = { product: item, qty: item.quantity };
      });
      localStorage.setItem('glowmore_cart', JSON.stringify(cartObj));
    } catch {
      // Ignore localStorage availability issues
    }
  }, [cartItems]);

  // Align every bottle stop to the center of its matching content chapter.
  // The old whole-document calculation made the model arrive before or after
  // its related information card, especially on tall screens.
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'diagnostic', 'dupes', 'catalog']
        .map((name) => sectionRefs.current[name])
        .filter(Boolean);

      if (sections.length < 2) return;

      const viewportCenter = window.scrollY + window.innerHeight / 2;
      const firstCenter = sections[0].offsetTop + sections[0].offsetHeight / 2;
      const lastSection = sections[sections.length - 1];
      const lastCenter = lastSection.offsetTop + lastSection.offsetHeight / 2;
      const travel = lastCenter - firstCenter;
      if (travel <= 0) return;
      const progress = (viewportCenter - firstCenter) / travel;
      setScrollProgress(Math.min(1, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return productsData.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.key_ingredients.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategory === 'All' || p.category === selectedCategory;
      const matchTier =
        selectedTier === 'All' || p.budget_tier === selectedTier;
      return matchSearch && matchCategory && matchTier;
    });
  }, [searchQuery, selectedCategory, selectedTier]);

  // Unique categories
  const categories = useMemo(() => {
    const list = Array.from(new Set(productsData.map((p) => p.category)));
    return ['All', ...list];
  }, []);

  // Cart total calculations
  const subTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price_inr * item.quantity, 0);
  }, [cartItems]);

  const discountAmount = useMemo(() => {
    return promoApplied ? Math.round(subTotal * 0.4) : 0;
  }, [subTotal, promoApplied]);

  const totalAmount = useMemo(() => {
    return Math.max(0, subTotal - discountAmount);
  }, [subTotal, discountAmount]);

  // Cart modifiers
  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const next = item.quantity + delta;
            return next > 0 ? { ...item, quantity: next } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, variant: '30ml' }];
    });
  };

  return (
    <div className="relative min-h-screen bg-[#F6EFE9] text-[#231E1B] font-sans selection:bg-[#E8633A] selection:text-white">
      {/* Live Animated Aurora Background (CSS GPU-Accelerated — Stable on Scroll) */}
      <LiveSkincareBackground />
      
      {/* ====================================================================
          STICKY 3D BACKGROUND CANVAS (Moves along S-curve on scroll)
          Gracefully fades out when entering Section 04 (Catalog) to prevent
          awkward visual collision with the product grid and routine basket.
          ==================================================================== */}
      <div
        className="fixed inset-0 pointer-events-none z-0 hidden items-center justify-center overflow-hidden lg:flex transition-opacity duration-500 ease-out"
        style={{ opacity: scrollProgress > 0.82 ? 0 : 1 }}
      >
        {/* 3D Bottle Canvas */}
        <div className="w-full h-full max-w-7xl mx-auto">
          <HeroBottle3D scrollProgress={scrollProgress} />
        </div>
      </div>

      {/* ====================================================================
          TOP FIXED NAVIGATION BAR (Redesigned with glassmorphic sliding indicator)
          ==================================================================== */}
      <LandingNavbar
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        productsCount={productsData.length}
        isAuthenticated={isAuthenticated}
        user={user}
        logout={handleLogout}
        onTakeQuiz={() => {
          requireAuth('take the clinical skin diagnostic quiz and save your personalized formulation score', () => {
            const el = document.getElementById('diagnostic');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          });
        }}
      />

      {/* ====================================================================
          SCROLL TRAJECTORY VISUAL INDICATOR (Shows S-Curve Progress)
          ==================================================================== */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center space-y-3 bg-white/70 backdrop-blur-md py-4 px-2 rounded-full border border-[#E8DFD4] shadow-sm">
        {[
          { label: 'Debut', step: 0 },
          { label: 'Diagnostic', step: 0.33 },
          { label: 'Dupe Engine', step: 0.66 },
          { label: 'Catalog', step: 1.0 }
        ].map((item, idx) => {
          const isActive =
            Math.abs(scrollProgress - item.step) < 0.22 ||
            (item.step === 1 && scrollProgress > 0.85);

          return (
            <div
              key={idx}
              title={item.label}
              className={`w-2.5 rounded-full transition-all duration-300 ${
                isActive ? 'h-7 bg-[#E8633A]' : 'h-2.5 bg-[#D9C8BA]'
              }`}
            />
          );
        })}
      </div>

      {/* ====================================================================
          FOREGROUND CONTENT LAYOUT (Left and Right columns flanking 3D model)
          ==================================================================== */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-40 sm:space-y-56 pt-12 pb-32">
        
        {/* ------------------------------------------------------------------
            CHAPTER 1: THE BIO-MATCH DEBUT (Top section in user sketch)
            Left: Headline, badging, description
            Center: 3D Bottle in Initial Beauty Angle
            Right: Live Bio-Compatibility Widget & Actives
            ------------------------------------------------------------------ */}
        <section
          ref={(node) => { sectionRefs.current.hero = node; }}
          id="hero"
          className="min-h-[80vh] flex items-center relative overflow-visible"
        >
          {/* Animated floating-ingredients background layer (Chapter 01 — Bio-Match Debut) */}
          <FloatingIngredients section="hero" />

          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Column (Information Block) - Animated with scroll-triggered entrance */}
            <motion.div
              initial={{ opacity: 0, x: -36, y: 18 }}
              animate={heroIsActive ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: -36, y: 18 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="lg:col-span-4 min-w-0 max-w-md space-y-6 border-l-2 border-[#E8633A] py-4 pl-6"
            >
              {/* Eyebrow Tag */}
              <motion.div {...getStaggerAnimation(0, 0)}>
                <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EADFD4] text-[#E8633A] text-[11px] font-bold tracking-wider uppercase">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>EXPLAINABLE BEAUTY ENGINE</span>
                </span>
              </motion.div>

              {/* Headline - 24px translateY slide-up + fade-in (450ms ease-out) */}
              <motion.h2
                {...headlineAnimation}
                className="text-3xl sm:text-5xl font-extrabold font-brand text-[#231E1B] leading-tight"
              >
                Beauty That <br />
                <span className="text-[#E8633A]">Fits Your Skin</span>
              </motion.h2>

              {/* Subheadline - Follows 100ms later */}
              <motion.p
                {...subheadlineAnimation}
                className="text-xs sm:text-sm text-[#7A706A] leading-relaxed"
              >
                Stop guessing. Glow More matches every product to your exact skin barrier, concerns, and budget — and shows you the science behind every recommendation.
              </motion.p>

              {/* 3 Circular Feature Rows - Staggered entrance (80ms delay each) */}
              <div className="space-y-2.5 pt-2">
                <motion.div
                  {...getStaggerAnimation(0)}
                  className="flex items-center space-x-3 border-b border-[#EADFD4] px-1 py-3"
                >
                  <div className="w-8 h-8 rounded-full bg-[#FAF6F2] flex items-center justify-center text-[#E8633A] shrink-0">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#231E1B]">AI-Matched Bio-Compatibility</div>
                    <div className="text-[10px] text-[#8A7D75]">
                      Every match is tuned to your skin's actual lipid barrier, not generic skin 'types'.
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  {...getStaggerAnimation(1)}
                  className="flex items-center space-x-3 border-b border-[#EADFD4] px-1 py-3"
                >
                  <div className="w-8 h-8 rounded-full bg-[#FAF6F2] flex items-center justify-center text-[#E8633A] shrink-0">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#231E1B]">Explainable Reason Tags</div>
                    <div className="text-[10px] text-[#8A7D75]">
                      No black-box AI. See the exact ingredients and criteria behind your match score.
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  {...getStaggerAnimation(2)}
                  className="flex items-center space-x-3 border-b border-[#EADFD4] px-1 py-3"
                >
                  <div className="w-8 h-8 rounded-full bg-[#FAF6F2] flex items-center justify-center text-[#E8633A] shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#231E1B]">Verified Clinical Dupes</div>
                    <div className="text-[10px] text-[#8A7D75]">
                      Same actives, lower price — save up to 70% without compromising results.
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Action CTAs - Staggered follow-up */}
              <motion.div {...getStaggerAnimation(3)} className="pt-2 flex items-center space-x-3">
                <a
                  href="#diagnostic"
                  className="px-7 py-3 rounded-full bg-[#E8633A] text-white text-xs font-bold hover:bg-[#D4552E] transition-all shadow-md hover:scale-102 flex items-center space-x-2"
                >
                  <span>Explore Your Match</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#catalog"
                  className="px-5 py-3 rounded-full bg-white border border-[#EDE2D7] text-xs font-bold text-[#231E1B] hover:bg-[#FAF6F2]"
                >
                  Browse Catalog ({productsData.length})
                </a>
              </motion.div>
            </motion.div>

            {/* Middle Empty Spacer for the 3D Model */}
            <div className="hidden lg:block lg:col-span-4 pointer-events-none" />

            {/* Right Column (Information Block) - Telemetry and Actives */}
            <motion.div
              initial={{ opacity: 0, x: 36, y: 18 }}
              animate={heroIsActive ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: 36, y: 18 }}
              transition={{ duration: 0.7, delay: 0.12, ease: 'easeOut' }}
              className="lg:col-span-4 min-w-0 space-y-4 border-l border-[#D9C8BA] py-4 pl-6"
            >
              <div className="flex justify-between items-center pb-2 border-b border-[#EDE2D7]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8633A]">
                  LIVE FORMULATION ANALYSIS
                </span>
                <span className="flex items-center space-x-1 text-[11px] font-bold text-[#231E1B]">
                  <span className="w-2 h-2 rounded-full bg-[#2CE080] animate-pulse" />
                  <span>Bio-Active Active</span>
                </span>
              </div>

              {/* Big Score Card */}
              <motion.div {...headlineAnimation} className="space-y-2 border-b border-[#EADFD4] pb-4">
                <div className="text-xs font-bold text-[#7A706A]">Formulation Match Rating</div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-extrabold text-[#E8633A] font-brand">98.4%</span>
                  <span className="text-xs text-[#231E1B] font-semibold">Affinity Score</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F5EFE9] overflow-hidden">
                  <div className="w-[98.4%] h-full bg-[#E8633A] rounded-full" />
                </div>
              </motion.div>

              {/* Ingredients Pill Tags */}
              <motion.div {...subheadlineAnimation} className="space-y-1.5 text-xs">
                <span className="font-bold text-[#231E1B]">Clinical Actives Core:</span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-bold text-[#231E1B]">
                    15% Ethyl Ascorbic •
                  </span>
                  <span className="text-[10px] font-bold text-[#231E1B]">
                    Ferulic Acid •
                  </span>
                  <span className="text-[10px] font-bold text-[#231E1B]">
                    Multi-Weight HA
                  </span>
                </div>
              </motion.div>

              {/* Formulation helper line */}
              <motion.div
                {...getStaggerAnimation(0)}
                className="border-l-2 border-[#E8633A] py-1 pl-3 text-[11px] text-[#554942] leading-relaxed"
              >
                💡 <em>Scroll to see how your score is calculated, ingredient by ingredient.</em>
              </motion.div>
            </motion.div>

          </div>
        </section>

        {/* ------------------------------------------------------------------
            CHAPTER 2: THE DIAGNOSTIC (Middle section in user sketch)
            3D Model Curves over to the LEFT side!
            Left: Interactive 60-Sec Skin Quiz
            Center: 3D Bottle Angle showing side & internal liquid
            Right: Explainable Reason Tags Breakdown
            ------------------------------------------------------------------ */}
        <section
          ref={(node) => { sectionRefs.current.diagnostic = node; }}
          id="diagnostic"
          className="min-h-[80vh] flex items-center relative overflow-visible"
        >
          {/* Animated floating-ingredients background layer (Chapter 02 — Diagnostic Engine & Barrier Repair) */}
          <FloatingIngredients section="diagnostic" />
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* The bottle travels left in this chapter, so the explanation lives on its right. */}
            <motion.div
              initial={{ opacity: 0, x: 40, y: 20 }}
              animate={diagnosticIsActive ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: 40, y: 20 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className="lg:col-span-4 lg:col-start-9 min-w-0 space-y-5 border-l-2 border-[#E8633A] py-5 pl-6"
            >
              <div>
                {/* Eyebrow tag */}
                <motion.div {...getStaggerAnimation(0, 0)}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8633A] bg-[#EDE2D7] px-3 py-1 rounded-full">
                    STEP 01 · DIAGNOSTIC
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.h3
                  {...headlineAnimation}
                  className="text-2xl font-bold font-brand text-[#231E1B] mt-2 tracking-tight"
                >
                  Your Skin, Decoded
                </motion.h3>

                {/* Subheadline (follows 100ms later) */}
                <motion.p
                  {...subheadlineAnimation}
                  className="text-xs text-[#7A706A] mt-1 leading-relaxed"
                >
                  Three inputs. One real-time match. Adjust any field and watch your compatibility score recalculate instantly — this is the same engine that powers every recommendation on Glow More.
                </motion.p>
              </div>

              {/* Skin Type Pills (staggered) */}
              <motion.div {...getStaggerAnimation(0)} className="space-y-1.5">
                <label className="text-xs font-bold text-[#231E1B]">Skin Barrier Type:</label>
                <div className="flex flex-wrap gap-2">
                  {['Oily', 'Dry', 'Combination', 'Sensitive'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSkinType(type)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                        skinType === type
                          ? 'bg-[#E8633A] text-white shadow-sm'
                          : 'bg-white text-[#665D57] border border-[#EDE2D7] hover:bg-[#F2E8DE]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Skin Tone Selector (staggered) */}
              <motion.div {...getStaggerAnimation(1)} className="space-y-1.5">
                <label className="text-xs font-bold text-[#231E1B]">Fitzpatrick Skin Tone:</label>
                <div className="flex flex-wrap gap-2">
                  {['Fair', 'Medium', 'Tan', 'Deep'].map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setSkinTone(tone)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                        skinTone === tone
                          ? 'bg-[#231E1B] text-white shadow-sm'
                          : 'bg-white text-[#665D57] border border-[#EDE2D7] hover:bg-[#F2E8DE]'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Primary Concern (staggered) */}
              <motion.div {...getStaggerAnimation(2)} className="space-y-1.5">
                <label className="text-xs font-bold text-[#231E1B]">Primary Focus Concern:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Oiliness & Acne', val: 'Oiliness|Acne' },
                    { label: 'Dullness & Glow', val: 'Oiliness|Dullness' },
                    { label: 'Fine Lines & Aging', val: 'Aging|Uneven Tone' },
                    { label: 'Sensitivity & Redness', val: 'Sensitivity|Dryness' }
                  ].map((c) => (
                    <button
                      key={c.val}
                      onClick={() => setPrimaryConcern(c.val)}
                      className={`p-2 rounded-2xl text-left text-xs font-bold transition-all border ${
                        primaryConcern === c.val
                          ? 'bg-[#E8633A]/15 border-[#E8633A] text-[#E8633A]'
                          : 'bg-white border-[#EDE2D7] text-[#665D57] hover:bg-[#FAF6F2]'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Result Line (retaining dynamic % and active concern reasoning) */}
              <motion.p
                {...getStaggerAnimation(3)}
                className="border-t border-[#EADFD4] pt-4 text-[11px] leading-relaxed text-[#7A706A]"
              >
                <span className="font-bold text-[#E8633A]">98.4% affinity.</span> Ceramide repair, non-comedogenic safety, and your selected concern shape every recommendation you see next.
              </motion.p>
            </motion.div>

            {/* Middle Empty Spacer for the 3D Model S-curve */}
            <div className="hidden lg:block lg:col-span-4 pointer-events-none" />

            {/* Right Column (Explainable Reason Scoring - Mobile view) */}
            <div className="lg:hidden min-w-0 bg-[#FAF6F2]/95 backdrop-blur-md p-6 sm:p-8 rounded-[36px] border border-[#EADFD4] shadow-lg space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8633A] bg-[#EDE2D7] px-3 py-1 rounded-full">
                  STEP 01 · DIAGNOSTIC
                </span>
                <h3 className="text-2xl font-bold font-brand text-[#231E1B] mt-2">
                  Your Skin, Decoded
                </h3>
                <p className="text-xs text-[#7A706A]">
                  Every point awarded is backed by clinical ingredient synergy.
                </p>
              </div>

              {/* Reason Breakdown Chips */}
              <div className="space-y-2.5 pt-2">
                <div className="p-3 bg-white rounded-2xl border border-[#EDE2D7] space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-[#231E1B]">
                    <span>1. Lipid Barrier Repair (Ceramides)</span>
                    <span className="text-[#E8633A]">+35%</span>
                  </div>
                  <p className="text-[11px] text-[#7A706A]">
                    Replaces lost intercellular lipids tailored to <strong>{skinType}</strong> barrier porosity.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-[#EDE2D7] space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-[#231E1B]">
                    <span>2. Non-Comedogenic Safety Index</span>
                    <span className="text-[#E8633A]">+25%</span>
                  </div>
                  <p className="text-[11px] text-[#7A706A]">
                    Zero pore-clogging waxes; certified 0/5 on comedogenic scale.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-[#EDE2D7] space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-[#231E1B]">
                    <span>3. Target Concern Match ({primaryConcern.split('|')[0]})</span>
                    <span className="text-[#E8633A]">+20%</span>
                  </div>
                  <p className="text-[11px] text-[#7A706A]">
                    Active concentration directly inhibits melanin transfer and excess sebum.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-[#EDE2D7] space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-[#231E1B]">
                    <span>4. Acid Mantle pH Balance</span>
                    <span className="text-[#E8633A]">+18%</span>
                  </div>
                  <p className="text-[11px] text-[#7A706A]">
                    Stabilized at pH 5.2 to preserve healthy skin microflora.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ------------------------------------------------------------------
            CHAPTER 3: SMART DUPE & SAVINGS (Lower section in user sketch)
            3D Model Curves over to the RIGHT side!
            Left: Luxury Original vs Smart Dupe Comparison
            Center: 3D Bottle showing back formulation label & dropper
            Right: Clinical Trade-off & Bio-Equivalence Analysis
            ------------------------------------------------------------------ */}
        <section
          ref={(node) => { sectionRefs.current.dupes = node; }}
          id="dupes"
          className="min-h-[80vh] flex items-center relative overflow-visible"
        >
          {/* Animated floating-ingredients background layer (Chapter 03 — Smart Dupe & Savings Finder) */}
          <FloatingIngredients section="dupes" />
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* The bottle crosses to the right here, leaving the copy cleanly on the left. */}
            <motion.div
              initial={{ opacity: 0, x: -40, y: 20 }}
              animate={dupesIsActive ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: -40, y: 20 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className="lg:col-span-4 min-w-0 space-y-5 border-l-2 border-[#E8633A] py-5 pl-6"
            >
              <div>
                {/* Eyebrow tag */}
                <motion.div {...getStaggerAnimation(0, 0)}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8633A] bg-[#EDE2D7] px-3 py-1 rounded-full">
                    STEP 03 · SMART DUPE FINDER
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.h3
                  {...headlineAnimation}
                  className="text-2xl font-bold font-brand text-[#231E1B] mt-2 tracking-tight"
                >
                  Same Actives. Real Savings.
                </motion.h3>

                {/* Subheadline (follows 100ms later) */}
                <motion.p
                  {...subheadlineAnimation}
                  className="text-xs text-[#7A706A] mt-1 leading-relaxed"
                >
                  We compare luxury formulas ingredient-by-ingredient against verified budget alternatives — so you only pay more when the formula actually earns it.
                </motion.p>
              </div>

              {/* Side-by-side comparison (staggered) */}
              <motion.div {...getStaggerAnimation(0)} className="grid grid-cols-2 gap-3 pt-2">
                {/* Original Item */}
                <div className="space-y-2 border-t border-[#EADFD4] px-1 py-3.5">
                  <span className="text-[9px] font-bold uppercase text-[#A0938A]">Luxury Formula</span>
                  <h4 className="font-bold text-xs text-[#231E1B]">Luminate Vitamin C 15%</h4>
                  <div className="text-sm font-extrabold text-[#231E1B]">₹1,899</div>
                  <div className="text-[10px] text-[#7A706A]">Vitamin C | Ferulic Acid</div>
                </div>

                {/* Dupe Item */}
                <div className="space-y-2 border-t-2 border-[#E8633A] px-1 py-3.5">
                  <span className="text-[9px] font-bold uppercase text-[#E8633A]">Verified Dupe</span>
                  <h4 className="font-bold text-xs text-[#231E1B]">PureBloom Glow Booster</h4>
                  <div className="text-sm font-extrabold text-[#E8633A]">₹599</div>
                  <div className="text-[10px] text-[#7A706A]">Vitamin C | Turmeric</div>
                </div>
              </motion.div>

              {/* Savings Ribbon (staggered - dynamic value preserved) */}
              <motion.div
                {...getStaggerAnimation(1)}
                className="p-3 rounded-2xl bg-[#E8633A] text-white flex items-center justify-between text-xs font-bold"
              >
                <span>🎉 Instant Customer Savings:</span>
                <span className="bg-white text-[#E8633A] px-3 py-1 rounded-full text-xs font-black">
                  Save ₹1,300
                </span>
              </motion.div>

              {/* Action Button (staggered) - Allows direct add to basket without blocking */}
              <motion.button
                {...getStaggerAnimation(2)}
                onClick={() => {
                  const dupe = productsData.find((p) => p.id === 'P013');
                  if (dupe) {
                    addToCart(dupe);
                  }
                }}
                className="w-full py-3 rounded-full bg-[#231E1B] text-white text-xs font-bold hover:bg-[#382F2A] transition-all cursor-pointer"
              >
                Add PureBloom Dupe to Bag (₹599)
              </motion.button>

              {/* Match footnote (staggered - dynamic value preserved) */}
              <motion.p
                {...getStaggerAnimation(3)}
                className="border-t border-[#EADFD4] pt-4 text-[11px] leading-relaxed text-[#7A706A]"
              >
                <span className="font-bold text-[#E8633A]">94% active match.</span> The only trade-off is the stabilizer: Ferulic Acid in the luxury formula and botanical Turmeric in the dupe.
              </motion.p>
            </motion.div>

            {/* Middle Empty Spacer for 3D model */}
            <div className="hidden lg:block lg:col-span-4 pointer-events-none" />

            {/* Right Column (Clinical Trade-off Analysis - Mobile view) */}
            <div className="lg:hidden min-w-0 bg-[#FAF6F2]/95 backdrop-blur-md p-6 sm:p-8 rounded-[36px] border border-[#EADFD4] shadow-lg space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8633A] bg-[#EDE2D7] px-3 py-1 rounded-full">
                  STEP 03 · SMART DUPE FINDER
                </span>
                <h3 className="text-2xl font-bold font-brand text-[#231E1B] mt-2">
                  Same Actives. Real Savings.
                </h3>
                <p className="text-xs text-[#7A706A]">
                  We explain exactly what changes between the luxury bottle and the affordable dupe.
                </p>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div className="p-3 bg-white rounded-2xl border border-[#EDE2D7]">
                  <div className="font-bold text-[#231E1B] mb-1">Active Ingredient Match: 94%</div>
                  <p className="text-[11px] text-[#7A706A]">
                    Both products deliver 15% bio-available Ethyl Ascorbic Acid for antioxidant defense.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-[#EDE2D7]">
                  <div className="font-bold text-[#231E1B] mb-1">Stabilizer Trade-off:</div>
                  <p className="text-[11px] text-[#7A706A]">
                    <strong>Luminate</strong> utilizes synthetic Ferulic Acid. <strong>PureBloom</strong> utilizes botanical Turmeric extract to stabilize the active, slightly lighter in consistency.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-[#EDE2D7]">
                  <div className="font-bold text-[#231E1B] mb-1">Texture & Absorption:</div>
                  <p className="text-[11px] text-[#7A706A]">
                    Both absorb in under 20 seconds with non-sticky, dewy finishes.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ------------------------------------------------------------------
            CHAPTER 4: 66-PRODUCT CATALOG & ROUTINE BASKET (Section 04 Redesign)
            Clean Two-Column Layout:
            - Left (66.7% / 8 cols): Wrapped category filters, responsive wide search bar,
              and 2-column product grid with baseline-aligned price/+Add actions.
            - Right (33.3% / 4 cols): Sticky elevated routine basket card with solid background,
              deep shadow, and integrated Routine Synergy Engine preview.
            - Responsive: Stacks vertically into 1 column on mobile screens (< lg).
            ------------------------------------------------------------------ */}
        <section
          ref={(node) => { sectionRefs.current.catalog = node; }}
          id="catalog"
          className="min-h-[85vh] flex items-center relative z-10 overflow-visible"
        >
          {/* Animated floating-ingredients background layer (Chapter 04 — Catalog Database & Routine Basket) */}
          <FloatingIngredients section="catalog" />
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ================================================================
                LEFT COLUMN: CATALOG FILTERS, SEARCH & PRODUCT GRID (66.7% Width)
                ================================================================ */}
            <div className="lg:col-span-8 min-w-0 bg-[#FAF6F2] p-6 sm:p-8 rounded-[36px] border border-[#EADFD4] shadow-sm space-y-6">
              
              {/* Header: Eyebrow, Headline, Subheadline */}
              <div className="space-y-3">
                <motion.div {...getStaggerAnimation(0, 0)}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8633A] bg-[#EDE2D7] px-3 py-1 rounded-full">
                    CATALOG DATABASE ({filteredProducts.length} FORMULATIONS)
                  </span>
                </motion.div>

                <motion.h3
                  {...headlineAnimation}
                  className="text-2xl sm:text-3xl font-bold font-brand text-[#231E1B] tracking-tight"
                >
                  Every Formula, Fully Transparent
                </motion.h3>

                <motion.p
                  {...subheadlineAnimation}
                  className="text-xs sm:text-sm text-[#7A706A] leading-relaxed max-w-2xl"
                >
                  Filter by category and budget tier — every product ships with its full active ingredient breakdown, no marketing fluff.
                </motion.p>
              </div>

              {/* Responsive Wide Search Bar (Fixes narrow placeholder clipping) */}
              <div className="relative w-full">
                <Search className="w-4 h-4 text-[#A0938A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by active ingredients, formulas, or brands (e.g. Niacinamide, CeraVe)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-[#EDE2D7] text-xs sm:text-sm text-[#231E1B] placeholder:text-[#A0938A] focus:outline-none focus:ring-2 focus:ring-[#E8633A] shadow-2xs transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0938A] hover:text-[#231E1B] p-1 rounded-full hover:bg-[#F2E8DE] transition-colors cursor-pointer"
                    aria-label="Clear search input"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Chips & Budget Tier Controls (Flex-wrap prevents horizontal cutoff) */}
              <motion.div {...getStaggerAnimation(0)} className="space-y-3 pt-1">
                {/* Wrapped Category Chips (All, Cleanser, Toner, Serum, Moisturizer, Sunscreen, etc.) */}
                <div className="flex flex-wrap items-center gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[#E8633A] text-white shadow-xs font-bold scale-102'
                          : 'bg-white text-[#665D57] border border-[#EDE2D7] hover:bg-[#F2E8DE] hover:text-[#231E1B]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Budget Tier Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
                  <span className="font-bold text-[#8A7D75] uppercase tracking-wider mr-1 text-[10px]">Tier:</span>
                  {['All', 'budget', 'mid', 'luxury'].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setSelectedTier(tier)}
                      className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] transition-all cursor-pointer ${
                        selectedTier === tier
                          ? 'bg-[#231E1B] text-white shadow-2xs'
                          : 'bg-white/90 text-[#7A706A] border border-[#EDE2D7] hover:bg-[#E4D8CE]'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                  <span className="text-[10px] text-[#A0938A] ml-auto">
                    Showing {Math.min(filteredProducts.length, 8)} of {filteredProducts.length} products
                  </span>
                </div>
              </motion.div>

              {/* Clean 2-Column Product Grid (Responsive: 1 col on mobile, 2 cols on desktop/tablet) */}
              <motion.div {...getStaggerAnimation(1)}>
                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-[#EDE2D7] text-center space-y-3">
                    <p className="text-sm font-semibold text-[#231E1B]">No formulations match your search criteria.</p>
                    <p className="text-xs text-[#7A706A]">Try searching for other active ingredients or clearing your filters.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                        setSelectedTier('All');
                      }}
                      className="px-4 py-2 rounded-full bg-[#E8633A] text-white text-xs font-bold hover:bg-[#D4552E] transition-all cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[540px] overflow-y-auto pr-1.5">
                    {filteredProducts.slice(0, 8).map((p) => (
                      <div
                        key={p.id}
                        className="bg-white rounded-2xl p-4 border border-[#EDE2D7] shadow-xs flex flex-col justify-between hover:shadow-md hover:border-[#E8633A]/40 transition-all duration-200 group"
                      >
                        {/* Top Information: Brand Tag, Rating Stars, Name, Actives */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-[#E8633A] uppercase tracking-wider bg-[#FAF6F2] px-2 py-0.5 rounded-md border border-[#EDE2D7]/60">
                              {p.brand}
                            </span>
                            <span className="text-amber-600 font-bold flex items-center gap-0.5 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                              ★ {p.rating}
                            </span>
                          </div>
                          <h5 className="font-bold text-xs sm:text-sm text-[#231E1B] truncate group-hover:text-[#E8633A] transition-colors">
                            {p.name}
                          </h5>
                          <p className="text-[11px] text-[#7A706A] line-clamp-2 min-h-[32px] leading-relaxed">
                            {p.key_ingredients}
                          </p>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <span className="text-[9px] font-semibold text-[#8A7D75] bg-[#F5EFE9] px-2 py-0.5 rounded-md uppercase">
                              {p.category}
                            </span>
                            <span className="text-[9px] font-semibold text-[#8A7D75] bg-[#F5EFE9] px-2 py-0.5 rounded-md uppercase">
                              {p.budget_tier}
                            </span>
                          </div>
                        </div>

                        {/* Baseline Row: Consistent baseline alignment between Price and + Add Button across all cards */}
                        <div className="pt-3 mt-3 border-t border-[#F5EFE9] flex items-center justify-between">
                          <div>
                            <span className="text-[9px] font-semibold uppercase text-[#A0938A] block">Formula Price</span>
                            <span className="text-sm font-black text-[#231E1B]">₹{p.price_inr}</span>
                          </div>
                          <button
                            onClick={() => addToCart(p)}
                            className="px-3.5 py-1.5 rounded-full bg-[#E8633A] text-white text-[11px] font-bold hover:bg-[#D4552E] hover:scale-104 active:scale-96 transition-all shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <span>+ Add</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* ================================================================
                RIGHT COLUMN: STICKY ROUTINE BASKET CARD (33.3% Width)
                Elevated card with solid white background, shadow, and synergy preview.
                ================================================================ */}
            <aside
              id="cart-section"
              className="lg:col-span-4 min-w-0 bg-white rounded-3xl border border-[#E8DFD4] shadow-xl p-6 sm:p-7 space-y-5 sticky top-24 self-start"
            >
              {/* Basket Card Header */}
              <div className="flex justify-between items-center pb-3 border-b border-[#EDE2D7]">
                <div>
                  <motion.h4
                    {...headlineAnimation}
                    className="font-bold text-lg font-brand text-[#231E1B] tracking-tight"
                  >
                    Your Routine Basket
                  </motion.h4>
                  <motion.span
                    {...subheadlineAnimation}
                    className="text-[11px] text-[#7A706A] block mt-0.5"
                  >
                    {cartItems.length} active formulations selected
                  </motion.span>
                </div>
                <span className="w-8 h-8 rounded-full bg-[#E8633A] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
              </div>

              {/* Routine Synergy Engine Mini Preview Visual (Repurposed routine visual inside card) */}
              <div className="bg-[#FAF6F2] rounded-2xl p-3.5 border border-[#EDE2D7] space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#231E1B] flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5 text-[#E8633A]" />
                    Routine Synergy Engine
                  </span>
                  <span className="text-[10px] font-extrabold text-[#E8633A] bg-[#EDE2D7] px-2 py-0.5 rounded-full">
                    {cartItems.length > 0 ? '98% Compatible' : 'Ready'}
                  </span>
                </div>
                <div className="w-full bg-[#EADFD4] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#E8633A] to-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(15, cartItems.length * 25))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-semibold text-[#8A7D75]">
                  <span>AM Protection</span>
                  <span>Active Layering</span>
                  <span>PM Recovery</span>
                </div>
              </div>

              {/* Scrollable Cart Items List */}
              <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
                {cartItems.length === 0 ? (
                  <div className="text-center py-7 space-y-2">
                    <div className="w-10 h-10 mx-auto rounded-full bg-[#FAF6F2] flex items-center justify-center text-[#A0938A]">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-[#231E1B]">Your basket is empty.</p>
                    <p className="text-[10px] text-[#7A706A]">Add formulas from the catalog to test synergy & claim discounts.</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-[#FAF6F2]/70 hover:bg-[#FAF6F2] rounded-2xl border border-[#EDE2D7] flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="font-bold text-[#231E1B] truncate">{item.name}</div>
                        <div className="text-[10px] text-[#7A706A]">₹{item.price_inr} each</div>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-5 h-5 rounded-full bg-white border border-[#EDE2D7] text-[#231E1B] flex items-center justify-center font-bold hover:bg-[#F2E8DE] transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-5 h-5 rounded-full bg-[#E8633A] text-white flex items-center justify-center font-bold hover:bg-[#D4552E] transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#A0938A] hover:text-red-500 p-1 rounded-md transition-colors ml-1 cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Price Breakdown Summary */}
              <div className="pt-3 border-t border-[#EDE2D7] space-y-2 text-xs">
                <div className="flex justify-between text-[#7A706A]">
                  <span>Sub Total</span>
                  <span className="font-bold text-[#231E1B]">₹{subTotal}</span>
                </div>
                <div className="flex justify-between items-center text-[#E8633A] font-bold">
                  <button
                    onClick={() => setPromoApplied(!promoApplied)}
                    className="flex items-center gap-1.5 hover:underline text-left cursor-pointer"
                  >
                    <span>Glow More Dupe Savings (40%)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8633A]/10 border border-[#E8633A]/20">
                      {promoApplied ? 'Active' : 'Apply'}
                    </span>
                  </button>
                  <span>{promoApplied ? `-₹${discountAmount}` : '₹0'}</span>
                </div>
                <div className="flex justify-between text-base font-black text-[#231E1B] pt-2 border-t border-[#EDE2D7]">
                  <span>Final Total</span>
                  <span className="text-[#E8633A]">₹{totalAmount}</span>
                </div>
              </div>

              {/* Checkout CTA Button - Prompts Login or Sign Up if guest */}
              <button
                onClick={() => {
                  if (cartItems.length === 0) {
                    alert('Your routine basket is empty. Please add formulations from the catalog first!');
                    return;
                  }
                  // Require user authentication when checking out
                  requireAuth('checkout your personalized routine basket and place your order', () => {
                    navigate('/cart');
                  });
                }}
                className="w-full py-3.5 rounded-full bg-[#E8633A] text-white text-xs font-bold tracking-wider uppercase hover:bg-[#D4552E] shadow-md shadow-[#E8633A]/25 transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Checkout Routine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Security & Authenticity Reassurance */}
              <div className="text-center pt-1">
                <p className="text-[10px] text-[#A0938A] flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E8633A]" />
                  <span>100% Formulation Authenticity Guaranteed</span>
                </p>
              </div>
            </aside>

          </div>
        </section>

      </main>

      {/* ====================================================================
          FOOTER
          ==================================================================== */}
      <footer className="relative z-10 border-t border-[#E8DFD4] bg-[#FAF6F2] py-8 text-center text-xs text-[#7A706A]">
        <p>© {new Date().getFullYear()} Glow More — Smart Beauty AI Shopping Experience. All rights reserved.</p>
      </footer>

    </div>
  );
}
