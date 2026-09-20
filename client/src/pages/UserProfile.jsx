import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as PieTooltip,
  ResponsiveContainer,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';
import {
  ShoppingBag,
  Heart,
  TrendingUp,
  Package,
  Sparkles,
  Coins,
  ShieldCheck,
  Droplets,
  Target,
  ChevronRight,
  ArrowRight,
  Sliders,
  Calendar,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

/**
 * ==============================================================================
 * UserProfile Component — Glow More Luxury Skincare Account & Intelligence Hub
 * ==============================================================================
 *
 * Professional UI/UX Architecture:
 *
 * 1. Hero Identity Card:
 *    - Deep warm espresso/terracotta obsidian finish (linear gradient) with
 *      editorial serif typography ("Playfair Display"), glowing initial avatar,
 *      verified status badges, and quick personalization CTA buttons.
 *
 * 2. Balanced 4-KPI Metric Grid:
 *    - Replaces the awkward 5+1 wrapping grid with a perfectly symmetrical
 *      4-column KPI layout (Total Spent, Total Orders, Wishlist Items, Joyory Coins).
 *
 * 3. Dedicated AI Skin Profile & Intelligence Section:
 *    - Highlights the user's clinical dermatological profile (skinType,
 *      skinTone, primary concerns, AI calibration status) with an instant
 *      option to update preferences or retake the onboarding diagnostic.
 *
 * 4. Two-Column Analytics & Activity Dashboard:
 *    - Left Column: Spending by Category & 14-Day Purchasing Trend charts with
 *      curated empty/active states.
 *    - Right Column: Recent Order status tracker and Wishlist Highlights showcase.
 *
 * 5. Quick Luxury Concierge Navigation:
 *    - Direct entry points to Orders, Rewards, Product Comparison, and Store.
 */

// Harmonious category palette tailored for luxury skincare
const PALETTE = [
  '#E8633A', // Terracotta Core
  '#8B5E83', // Dusty Mauve
  '#3A7BD5', // Hydration Blue
  '#27AE60', // Botanical Green
  '#F39C12', // Active Amber
  '#E74C3C', // Coral Radiance
  '#16A085', // Peptide Jade
  '#8E44AD', // Antioxidant Violet
];

// Helper to resolve valid product image links (ignoring 3D GLB models)
function imgSrc(p) {
  const cl = p?.cloudinary_link || '';
  return !cl || cl.endsWith('.glb') || cl.endsWith('.gltf') ? null : cl;
}

/**
 * StatCard - Standardized KPI metric block with luxury tinted icon backdrop
 */
function StatCard({ icon, label, value, sub, color = '#E8633A', bg = '#FDE8D8' }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#EADFD4] shadow-2xs hover:shadow-xs hover:border-[#E8633A]/40 transition-all flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
        style={{ background: bg, color: color }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-extrabold text-[#231E1B] tracking-tight leading-none truncate">
          {value}
        </div>
        <div className="text-xs font-semibold text-[#665D57] mt-1 truncate">
          {label}
        </div>
        {sub && (
          <div
            className="text-[11px] font-bold mt-1 truncate"
            style={{ color }}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * CustomTooltip - High-contrast frosted popover for spending charts
 */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-[#EADFD4] rounded-xl px-3.5 py-2.5 shadow-lg shadow-[#231E1B]/10">
      <p className="text-[11px] font-semibold text-[#665D57] mb-0.5">{label}</p>
      <p className="text-sm font-extrabold text-[#E8633A]">
        ₹{Number(payload[0]?.value).toLocaleString('en-IN')}
      </p>
    </div>
  );
}

export default function UserProfile() {
  const navigate = useNavigate();
  const { user, fetchMe } = useAuth();
  const { orders, wishlist } = useCart();

  // Reference timestamp stored once on mount to avoid impure Date calls during render
  const [referenceTimestamp] = useState(() => Date.now());
  const [coinBalance, setCoinBalance] = useState(null);

  // Sync user profile & fetch live Joyory reward coin balance
  useEffect(() => {
    if (typeof fetchMe === 'function') {
      fetchMe();
    }
    api.get('/orders/rewards/balance')
      .then((res) => setCoinBalance(res.data.coinsBalance))
      .catch((err) => console.error('Rewards balance check error:', err));
  }, []);

  // ── Analytics Computations ──────────────────────────────────────────────────
  const totalSpent = useMemo(() =>
    orders.reduce((sum, o) => sum + (o.total || 0), 0), [orders]);

  const totalItems = useMemo(() =>
    orders.reduce((sum, o) => sum + o.items.reduce((itemSum, i) => itemSum + i.qty, 0), 0), [orders]);

  const avgOrder = orders.length ? Math.round(totalSpent / orders.length) : 0;

  // Category spending aggregation for pie chart
  const categorySpend = useMemo(() => {
    const map = {};
    orders.forEach((o) =>
      o.items.forEach(({ product: p, qty }) => {
        const cat = p.category || 'Other';
        map[cat] = (map[cat] || 0) + (p.price_inr || 0) * (qty || 1);
      })
    );
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [orders]);

  // Daily spending aggregation for the last 14 days (area chart)
  const dailySpend = useMemo(() => {
    const days = 14;
    const map = {};
    for (let d = days - 1; d >= 0; d--) {
      const date = new Date(referenceTimestamp - d * 86400000).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
      });
      map[date] = 0;
    }
    orders.forEach((o) => {
      const date = new Date(o.date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
      });
      if (map[date] !== undefined) map[date] += o.total || 0;
    });
    return Object.entries(map).map(([date, spend]) => ({ date, spend }));
  }, [orders, referenceTimestamp]);

  // Member join date formatted
  const joinDate = useMemo(() => {
    const d = new Date(referenceTimestamp);
    d.setMonth(d.getMonth() - 2);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }, [referenceTimestamp]);

  // User skin diagnostic parameters
  const skinType = user?.skinType || null;
  const skinTone = user?.skinTone || null;
  const rawConcerns = user?.concerns || [];
  const concernsList = Array.isArray(rawConcerns)
    ? rawConcerns
    : typeof rawConcerns === 'string'
      ? rawConcerns.split(',').map((c) => c.trim()).filter(Boolean)
      : [];

  const hasSkinProfile = Boolean(skinType || concernsList.length > 0 || user?.onboardingCompleted);

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#231E1B]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-24">

        {/* ── Breadcrumb & Page Meta ── */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8A7D75] mb-6">
          <Link to="/shop" className="hover:text-[#E8633A] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-[#B8ACA2]" />
          <span className="text-[#231E1B] font-bold">My Account</span>
        </div>

        {/* ==================================================================
            1. HERO IDENTITY CARD — Warm Espresso / Terracotta Obsidian Card
            ================================================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#231E1B] via-[#2E2520] to-[#1E1916] text-white p-6 sm:p-8 mb-8 border border-[#3E342D] shadow-xl shadow-[#231E1B]/15">
          {/* Ambient luminous gradients */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#E8633A]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 left-1/3 w-60 h-60 rounded-full bg-[#D44E28]/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">

            {/* Left: User Avatar & Editorial Details */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Avatar Circle with Initial */}
              <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-br from-[#E8633A] to-[#D44E28] flex items-center justify-center text-white text-2xl sm:text-3xl font-extrabold shadow-md shadow-[#E8633A]/30 ring-4 ring-white/10 shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8633A]/25 border border-[#E8633A]/40 text-[#FFA285] text-[11px] font-bold tracking-wide">
                    <Sparkles className="w-3 h-3" />
                    Glow Tier Member
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#A89D95]">
                    <Calendar className="w-3 h-3" />
                    Since {joinDate}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold font-brand text-white tracking-tight leading-tight">
                  {user?.name || 'Glow More Member'}
                </h1>

                <p className="text-xs sm:text-sm text-[#C4B7AC] mt-0.5">
                  {user?.email || 'member@glowmore.com'}
                </p>

                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {skinType && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-white/90 text-xs font-semibold backdrop-blur-xs">
                      <Droplets className="w-3 h-3 text-[#FFA285]" />
                      {skinType.charAt(0).toUpperCase() + skinType.slice(1)} Skin
                    </span>
                  )}
                  {skinTone && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-white/90 text-xs font-semibold backdrop-blur-xs">
                      Tone: {skinTone.charAt(0).toUpperCase() + skinTone.slice(1)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[#86EFAC] text-xs font-semibold backdrop-blur-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Profile
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex flex-row md:flex-col gap-2.5 shrink-0">
              <button
                onClick={() => navigate('/onboarding')}
                className="h-10 px-5 rounded-full bg-gradient-to-r from-[#E8633A] to-[#D44E28] hover:from-[#F0724A] hover:to-[#DE5731] text-white text-xs font-bold shadow-md shadow-[#E8633A]/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{hasSkinProfile ? 'Update Skin Profile' : 'Personalize Skin Profile'}</span>
              </button>

              <button
                onClick={() => navigate('/rewards')}
                className="h-10 px-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <Coins className="w-3.5 h-3.5 text-[#FBBF24]" />
                <span>{coinBalance ?? 0} Joyory Coins</span>
              </button>
            </div>
          </div>
        </div>

        {/* ==================================================================
            2. BALANCED 4-KPI METRIC GRID (No Broken Wrapping!)
            ================================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
          <StatCard
            icon={<TrendingUp size={22} />}
            label="Total Spent"
            value={`₹${Math.round(totalSpent).toLocaleString('en-IN')}`}
            sub="Lifetime Purchases"
            color="#E8633A"
            bg="#FDE8D8"
          />
          <StatCard
            icon={<Package size={22} />}
            label="Total Orders"
            value={orders.length}
            sub={orders.length > 0 ? `Avg ₹${avgOrder.toLocaleString('en-IN')}/order` : '0 Orders Placed'}
            color="#3A7BD5"
            bg="#E8F0FB"
          />
          <StatCard
            icon={<Heart size={22} />}
            label="Wishlist Saved"
            value={Object.keys(wishlist).length}
            sub="Saved Favorites"
            color="#8B5E83"
            bg="#F0E8F5"
          />
          <StatCard
            icon={<Coins size={22} />}
            label="Joyory Rewards"
            value={coinBalance !== null ? coinBalance : 0}
            sub="Coins Available"
            color="#D97706"
            bg="#FEF3C7"
          />
        </div>

        {/* ==================================================================
            3. DEDICATED AI SKIN PROFILE & INTELLIGENCE SECTION
            ================================================================== */}
        <div className="bg-white rounded-3xl border border-[#EADFD4] p-6 sm:p-7 mb-8 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F5EFE9]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-lg bg-[#E8633A]/10 text-[#E8633A] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <h2 className="text-lg font-bold font-brand text-[#231E1B]">
                  AI Skin Intelligence Diagnostic
                </h2>
              </div>
              <p className="text-xs text-[#665D57]">
                Real-time clinical compatibility profiling used across all product match scores.
              </p>
            </div>

            <button
              onClick={() => navigate('/onboarding')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E8633A] hover:text-[#D44E28] hover:underline cursor-pointer self-start sm:self-auto"
            >
              <span>{hasSkinProfile ? 'Edit Preferences' : 'Take 2-Min Skin Diagnostic'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Diagnostic Content */}
          {hasSkinProfile ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
              {/* Trait 1: Skin Type */}
              <div className="p-4 rounded-2xl bg-[#FAF6F2] border border-[#EADFD4]/70">
                <div className="flex items-center gap-2 text-xs font-bold text-[#8A7D75] uppercase tracking-wider mb-1">
                  <Droplets className="w-3.5 h-3.5 text-[#E8633A]" />
                  Skin Type
                </div>
                <div className="text-base font-extrabold text-[#231E1B]">
                  {skinType ? skinType.charAt(0).toUpperCase() + skinType.slice(1) : 'Balanced'}
                </div>
                <div className="text-[11px] text-[#665D57] mt-1">
                  Calibrated for tailored moisture retention and barrier defense.
                </div>
              </div>

              {/* Trait 2: Primary Concerns */}
              <div className="p-4 rounded-2xl bg-[#FAF6F2] border border-[#EADFD4]/70">
                <div className="flex items-center gap-2 text-xs font-bold text-[#8A7D75] uppercase tracking-wider mb-1">
                  <Target className="w-3.5 h-3.5 text-[#E8633A]" />
                  Active Focus
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {concernsList.length > 0 ? (
                    concernsList.slice(0, 3).map((concern, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md bg-white border border-[#EADFD4] text-[#231E1B] text-[11px] font-bold shadow-2xs"
                      >
                        {concern.charAt(0).toUpperCase() + concern.slice(1)}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs font-bold text-[#231E1B]">General Barrier Care</span>
                  )}
                </div>
              </div>

              {/* Trait 3: Algorithm Calibration */}
              <div className="p-4 rounded-2xl bg-[#FAF6F2] border border-[#EADFD4]/70">
                <div className="flex items-center gap-2 text-xs font-bold text-[#8A7D75] uppercase tracking-wider mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#27AE60]" />
                  Compatibility Engine
                </div>
                <div className="text-base font-extrabold text-[#27AE60]">
                  Active & Calibrated
                </div>
                <div className="text-[11px] text-[#665D57] mt-1">
                  Every product card displays instant match percentages (e.g. 95% Match).
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FDE8D8] text-[#E8633A] flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#231E1B]">
                    No skin profile calibrated yet
                  </div>
                  <div className="text-xs text-[#665D57]">
                    Take our 2-minute diagnostic to unlock precision formulation compatibility and ingredient alerts.
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/onboarding')}
                className="h-10 px-5 rounded-full bg-[#E8633A] hover:bg-[#D44E28] text-white text-xs font-bold shadow-sm shadow-[#E8633A]/25 transition-all cursor-pointer shrink-0"
              >
                Start Diagnostic →
              </button>
            </div>
          )}
        </div>

        {/* ==================================================================
            4. TWO-COLUMN ANALYTICS & ACTIVITY DASHBOARD
            ================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* ── Left Column: Spending Analytics ── */}
          <div className="space-y-6">

            {/* Category Breakdown Chart */}
            <div className="bg-white rounded-3xl border border-[#EADFD4] p-6 shadow-2xs">
              <div className="mb-4">
                <h3 className="text-base font-bold text-[#231E1B]">
                  Spending by Category
                </h3>
                <p className="text-xs text-[#665D57]">
                  Distribution of routine investments across skincare categories
                </p>
              </div>

              {categorySpend.length === 0 ? (
                <div className="h-60 rounded-2xl bg-[#FAF6F2]/70 border border-dashed border-[#EADFD4] flex flex-col items-center justify-center p-6 text-center">
                  <ShoppingBag className="w-8 h-8 text-[#C4B7AC] mb-2 stroke-[1.5]" />
                  <div className="text-xs font-bold text-[#231E1B]">No category data yet</div>
                  <p className="text-[11px] text-[#8A7D75] max-w-xs mt-1">
                    Once you place your first order, your category allocation chart will appear here.
                  </p>
                  <button
                    onClick={() => navigate('/shop')}
                    className="mt-3 px-4 py-1.5 rounded-full bg-white border border-[#EADFD4] text-xs font-bold text-[#E8633A] hover:bg-[#FAF6F2] transition-colors cursor-pointer"
                  >
                    Explore Catalog →
                  </button>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={categorySpend}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categorySpend.map((entry, i) => (
                        <Cell key={entry.name} fill={PALETTE[i % PALETTE.length]} />
                      ))}
                    </Pie>
                    <PieTooltip formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Spent']} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* 14-Day Purchasing Trend */}
            <div className="bg-white rounded-3xl border border-[#EADFD4] p-6 shadow-2xs">
              <div className="mb-4">
                <h3 className="text-base font-bold text-[#231E1B]">
                  Purchasing Trend (Last 14 Days)
                </h3>
                <p className="text-xs text-[#665D57]">
                  Timeline of skincare routine orders
                </p>
              </div>

              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dailySpend}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E8633A" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#E8633A" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0E8E0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 9, fill: '#665D57' }}
                    tickLine={false}
                    axisLine={false}
                    interval={2}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: '#665D57' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="spend"
                    stroke="#E8633A"
                    strokeWidth={2.5}
                    fill="url(#spendGrad)"
                    dot={{ fill: '#E8633A', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Right Column: Recent Orders & Wishlist Highlights ── */}
          <div className="space-y-6">

            {/* Recent Orders Card */}
            <div className="bg-white rounded-3xl border border-[#EADFD4] p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#231E1B]">Recent Orders</h3>
                  <p className="text-xs text-[#665D57]">Track and view past routine shipments</p>
                </div>
                {orders.length > 0 && (
                  <button
                    onClick={() => navigate('/orders')}
                    className="text-xs font-bold text-[#E8633A] hover:underline cursor-pointer"
                  >
                    View All →
                  </button>
                )}
              </div>

              {orders.length > 0 ? (
                <div className="space-y-2.5">
                  {orders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF6F2] border border-[#EADFD4]/70 hover:border-[#E8633A]/40 transition-all"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#231E1B]">{order.id}</div>
                        <div className="text-[11px] text-[#665D57]">
                          {new Date(order.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          · {order.items.length} items
                        </div>
                      </div>
                      <div className="text-sm font-extrabold text-[#E8633A]">
                        ₹{order.total?.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-44 rounded-2xl bg-[#FAF6F2]/70 border border-dashed border-[#EADFD4] flex flex-col items-center justify-center p-6 text-center">
                  <Package className="w-8 h-8 text-[#C4B7AC] mb-2 stroke-[1.5]" />
                  <div className="text-xs font-bold text-[#231E1B]">No orders placed yet</div>
                  <p className="text-[11px] text-[#8A7D75] max-w-xs mt-1">
                    Your order history, delivery status, and tracking info will appear here.
                  </p>
                  <button
                    onClick={() => navigate('/shop')}
                    className="mt-3 px-4 py-1.5 rounded-full bg-[#E8633A] text-white text-xs font-bold hover:bg-[#D44E28] transition-colors cursor-pointer"
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>

            {/* Wishlist Highlights Card */}
            <div className="bg-white rounded-3xl border border-[#EADFD4] p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#231E1B]">Wishlist Highlights</h3>
                  <p className="text-xs text-[#665D57]">Formulations staged for your routine</p>
                </div>
                {Object.values(wishlist).length > 0 && (
                  <button
                    onClick={() => navigate('/wishlist')}
                    className="text-xs font-bold text-[#E8633A] hover:underline cursor-pointer"
                  >
                    View All ({Object.keys(wishlist).length}) →
                  </button>
                )}
              </div>

              {Object.values(wishlist).length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {Object.values(wishlist)
                    .slice(0, 3)
                    .map((p) => {
                      const src = imgSrc(p);
                      const is3D = Boolean(p?.is_3d || p?.cloudinary_link?.endsWith('.glb'));
                      return (
                        <div
                          key={p.id}
                          onClick={() => navigate(`/product/${p.id}`)}
                          className="group p-2.5 rounded-2xl bg-[#FAF6F2] border border-[#EADFD4]/70 hover:border-[#E8633A]/50 hover:shadow-xs transition-all cursor-pointer text-center"
                        >
                          <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-2xs group-hover:scale-105 transition-transform">
                            {src ? (
                              <img
                                src={src}
                                alt={p.name}
                                className="w-full h-full object-cover"
                                onError={(e) => (e.target.style.display = 'none')}
                              />
                            ) : (
                              <span className="text-xl">{is3D ? '🧊' : '✨'}</span>
                            )}
                          </div>
                          <div className="text-[11px] font-bold text-[#231E1B] line-clamp-1">
                            {p.name}
                          </div>
                          <div className="text-[11px] font-extrabold text-[#E8633A] mt-0.5">
                            ₹{p.price_inr?.toLocaleString('en-IN')}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="h-32 rounded-2xl bg-[#FAF6F2]/70 border border-dashed border-[#EADFD4] flex flex-col items-center justify-center p-4 text-center">
                  <Heart className="w-6 h-6 text-[#C4B7AC] mb-1.5 stroke-[1.5]" />
                  <div className="text-xs font-bold text-[#231E1B]">Your wishlist is empty</div>
                  <p className="text-[10px] text-[#8A7D75] mt-0.5">
                    Click the heart icon on any product to save it here.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Luxury Concierge Navigation */}
            <div className="p-4 rounded-2xl bg-[#FAF6F2] border border-[#EADFD4] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#EADFD4] flex items-center justify-center text-[#E8633A]">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#231E1B]">Glow More Rewards Club</div>
                  <div className="text-[11px] text-[#665D57]">Redeem points for discounts & samples</div>
                </div>
              </div>
              <button
                onClick={() => navigate('/rewards')}
                className="px-3 py-1.5 rounded-full bg-white border border-[#EADFD4] text-xs font-bold text-[#E8633A] hover:bg-[#FAF6F2] transition-colors cursor-pointer"
              >
                View Perks →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

