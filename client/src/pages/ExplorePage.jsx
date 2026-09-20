import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';

// Available categories matching catalog taxonomy
const CATEGORIES = [
  'All', 'Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen',
  'Foundation', 'Concealer', 'Blush', 'Lipstick', 'Lip Balm', 'Mascara', 'Eyeliner',
  'Face Mask', 'Exfoliator', 'Under-eye Cream', 'Body Lotion'
];

// Skin types supported in product formulations
const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'];

// Price tier categorizations
const BUDGETS = ['Budget', 'Mid', 'Premium'];

// Sorting options for product catalog
const SORTS = [
  { label: 'Top Rated',        value: 'rating' },
  { label: 'Price: Low–High',   value: 'price_asc' },
  { label: 'Price: High–Low',  value: 'price_desc' },
  { label: 'Name A–Z',         value: 'name' },
];

// Quick price presets for rapid 1-click filtering
const PRICE_PRESETS = [
  { label: 'All',           min: 0,    max: 5000 },
  { label: 'Under ₹500',    min: 0,    max: 500 },
  { label: '₹500–₹1,000',   min: 500,  max: 1000 },
  { label: '₹1,000–₹2,000', min: 1000, max: 2000 },
  { label: 'Above ₹2,000',  min: 2000, max: 5000 },
];

/**
 * FilterSection - Collapsible accordion container with active filter counter badge
 */
function FilterSection({ title, count = 0, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ borderBottom: '1px solid #F0E8E0', paddingBottom: 14, marginBottom: 14 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px 0 8px',
          fontWeight: 700,
          fontSize: 13,
          color: '#231E1B',
          letterSpacing: '0.01em',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {title}
          {count > 0 && (
            <span style={{
              background: '#E8633A',
              color: '#fff',
              borderRadius: 10,
              fontSize: 10,
              padding: '1px 6px',
              fontWeight: 700,
              lineHeight: '14px',
            }}>
              {count}
            </span>
          )}
        </span>
        {open ? <ChevronUp size={15} color="#8A7D75" /> : <ChevronDown size={15} color="#8A7D75" />}
      </button>
      {open && <div style={{ paddingTop: 4 }}>{children}</div>}
    </div>
  );
}

/**
 * Chip - Interactive filter pill with active highlight and hover state
 */
function Chip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '5px 12px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: active ? '#E8633A' : '#F6EFE9',
        color: active ? '#fff' : '#5C524B',
        border: active ? '1px solid #E8633A' : '1px solid #EADFD4',
        cursor: 'pointer',
        transition: 'all .16s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        boxShadow: active ? '0 2px 6px rgba(232, 99, 58, 0.25)' : 'none',
      }}
    >
      {label}
    </button>
  );
}

/**
 * FilterPanel - Self-contained sidebar filter controls
 * Supports independent sticky scrolling on desktop, and drawer layout on mobile.
 */
function FilterPanel({
  activeFilters,
  clearAll,
  category,
  setCategory,
  budgetTier,
  setBudgetTier,
  skinType,
  setSkinType,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  isMobile = false,
  onCloseMobile = null,
  total = 0,
}) {
  // Check which price preset is currently active
  const activePreset = PRICE_PRESETS.find(p => p.min === minPrice && p.max === maxPrice);

  return (
    <div
      className={isMobile ? '' : 'filter-sidebar-scroll'}
      style={
        isMobile
          ? { display: 'flex', flexDirection: 'column', height: '100%' }
          : {
              background: '#fff',
              border: '1.5px solid #EADFD4',
              borderRadius: 20,
              padding: '18px 16px 20px 18px',
              position: 'sticky',
              top: 84,
              maxHeight: 'calc(100vh - 104px)',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              boxShadow: '0 4px 20px rgba(35, 30, 27, 0.03)',
            }
      }
    >
      {/* Sidebar Header with Active Count & Clear Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 14,
        marginBottom: 14,
        borderBottom: '1px solid #F0E8E0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#231E1B', letterSpacing: '-0.01em' }}>
            Filters
          </span>
          {activeFilters.length > 0 && (
            <span style={{
              background: '#E8633A',
              color: '#fff',
              borderRadius: 12,
              padding: '2px 7px',
              fontSize: 11,
              fontWeight: 700,
            }}>
              {activeFilters.length}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {activeFilters.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              style={{
                background: 'none',
                border: 'none',
                color: '#E8633A',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 4px',
              }}
            >
              <RotateCcw size={11} /> Clear All
            </button>
          )}

          {/* Close button on mobile drawer */}
          {isMobile && onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              style={{
                background: '#F6EFE9',
                border: 'none',
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#231E1B',
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Filter Categories */}
      <div style={{ flex: isMobile ? 1 : undefined, overflowY: isMobile ? 'auto' : undefined, paddingRight: 4 }}>
        {/* Category Filter Section */}
        <FilterSection title="Category" count={category && category !== 'All' ? 1 : 0}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORIES.map(c => {
              const isActive = (c === 'All' && !category) || category === c;
              return (
                <Chip
                  key={c}
                  label={c}
                  active={isActive}
                  onClick={() => {
                    // Toggle off if clicking the already active category
                    if (category === c) {
                      setCategory('');
                    } else {
                      setCategory(c === 'All' ? '' : c);
                    }
                  }}
                />
              );
            })}
          </div>
        </FilterSection>

        {/* Budget Tier Filter Section */}
        <FilterSection title="Budget" count={budgetTier ? 1 : 0}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {BUDGETS.map(b => (
              <Chip
                key={b}
                label={b}
                active={budgetTier === b}
                onClick={() => setBudgetTier(budgetTier === b ? '' : b)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Skin Type Filter Section */}
        <FilterSection title="Skin Type" count={skinType ? 1 : 0}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SKIN_TYPES.map(s => (
              <Chip
                key={s}
                label={s}
                active={skinType === s}
                onClick={() => setSkinType(skinType === s ? '' : s)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Price Range Filter Section */}
        <FilterSection title="Price Range" count={minPrice > 0 || maxPrice < 5000 ? 1 : 0}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Quick Price Preset Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {PRICE_PRESETS.map(p => {
                const isSelected = activePreset?.label === p.label;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setMinPrice(p.min);
                      setMaxPrice(p.max);
                    }}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600,
                      background: isSelected ? '#E8633A' : '#F6EFE9',
                      color: isSelected ? '#fff' : '#665D57',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all .15s ease',
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Live price range value readout */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 12,
              color: '#231E1B',
              fontWeight: 700,
              background: '#FAF6F1',
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid #EADFD4',
            }}>
              <span>Min: ₹{minPrice.toLocaleString()}</span>
              <span>Max: ₹{maxPrice.toLocaleString()}</span>
            </div>

            {/* Min Price Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8A7D75', marginBottom: 3 }}>
                <span>Min Price</span>
                <span>₹{minPrice}</span>
              </div>
              <input
                type="range"
                min={0}
                max={5000}
                step={50}
                value={minPrice}
                onChange={e => {
                  const val = Number(e.target.value);
                  // Ensure min price does not cross above max price
                  setMinPrice(Math.min(val, maxPrice));
                }}
                style={{ width: '100%', accentColor: '#E8633A', cursor: 'pointer' }}
              />
            </div>

            {/* Max Price Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8A7D75', marginBottom: 3 }}>
                <span>Max Price</span>
                <span>₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min={0}
                max={5000}
                step={50}
                value={maxPrice}
                onChange={e => {
                  const val = Number(e.target.value);
                  // Ensure max price does not drop below min price
                  setMaxPrice(Math.max(val, minPrice));
                }}
                style={{ width: '100%', accentColor: '#E8633A', cursor: 'pointer' }}
              />
            </div>
          </div>
        </FilterSection>
      </div>

      {/* Mobile drawer bottom CTA button */}
      {isMobile && (
        <div style={{ paddingTop: 14, borderTop: '1px solid #F0E8E0', marginTop: 'auto' }}>
          <button
            type="button"
            onClick={onCloseMobile}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 24,
              background: '#E8633A',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(232, 99, 58, 0.25)',
            }}
          >
            Show {total > 0 ? `${total} Products` : 'Products'}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * ExplorePage - Primary product discovery experience with reactive sidebar filters,
 * live catalog search, sorting, URL synchronization, and infinite paging.
 */
export default function ExplorePage() {
  const [params, setSearchParams] = useSearchParams();

  // Read initial states directly from URL search parameters
  const [search,      setSearch]     = useState(params.get('search') || '');
  const [category,    setCategory]   = useState(params.get('category') || '');
  const [budgetTier,  setBudgetTier] = useState(params.get('budget_tier') || '');
  const [skinType,    setSkinType]   = useState(params.get('skin_type') || '');
  const [minPrice,    setMinPrice]   = useState(params.get('min_price') ? Number(params.get('min_price')) : 0);
  const [maxPrice,    setMaxPrice]   = useState(params.get('max_price') ? Number(params.get('max_price')) : 5000);
  const [sort,        setSort]       = useState(params.get('sort') || 'rating');

  const [products,    setProducts]   = useState([]);
  const [total,       setTotal]      = useState(0);
  const [loading,     setLoading]    = useState(false);
  const [page,        setPage]       = useState(1);
  const [sidebarOpen, setSidebarOpen]= useState(false);
  const limit = 24;
  const searchInput = useRef();

  // Sync state when URL parameters change externally (e.g., from Navbar or back/forward navigation)
  useEffect(() => {
    const urlCategory = params.get('category') || '';
    const urlSearch = params.get('search') || '';
    const urlBudget = params.get('budget_tier') || '';
    const urlSkin = params.get('skin_type') || '';
    const urlMin = params.get('min_price') ? Number(params.get('min_price')) : 0;
    const urlMax = params.get('max_price') ? Number(params.get('max_price')) : 5000;
    const urlSort = params.get('sort') || 'rating';

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCategory(prev => (prev !== urlCategory ? urlCategory : prev));
    setSearch(prev => (prev !== urlSearch ? urlSearch : prev));
    setBudgetTier(prev => (prev !== urlBudget ? urlBudget : prev));
    setSkinType(prev => (prev !== urlSkin ? urlSkin : prev));
    setMinPrice(prev => (prev !== urlMin ? urlMin : prev));
    setMaxPrice(prev => (prev !== urlMax ? urlMax : prev));
    setSort(prev => (prev !== urlSort ? urlSort : prev));
  }, [params]);

  // Synchronize filter selections back to URL search params for bookmarking & refresh persistence
  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (search) nextParams.set('search', search);
    if (category && category !== 'All') nextParams.set('category', category);
    if (budgetTier) nextParams.set('budget_tier', budgetTier);
    if (skinType) nextParams.set('skin_type', skinType);
    if (minPrice > 0) nextParams.set('min_price', String(minPrice));
    if (maxPrice < 5000) nextParams.set('max_price', String(maxPrice));
    if (sort && sort !== 'rating') nextParams.set('sort', sort);

    setSearchParams(nextParams, { replace: true });
  }, [search, category, budgetTier, skinType, minPrice, maxPrice, sort, setSearchParams]);

  // Fetch products with optional pagination
  const fetchProducts = useCallback(async (pg = 1, reset = true) => {
    setLoading(true);
    if (reset) {
      setPage(1);
    }
    try {
      const q = new URLSearchParams({
        ...(search ? { search } : {}),
        ...(category && category !== 'All' ? { category } : {}),
        ...(budgetTier ? { budget_tier: budgetTier } : {}),
        ...(skinType ? { skin_type: skinType } : {}),
        min_price: minPrice,
        max_price: maxPrice,
        sort,
        limit,
        page: pg,
      });
      const { data } = await api.get(`/products?${q}`);
      setProducts(prev => (reset ? (data.products || []) : [...prev, ...(data.products || [])]));
      setTotal(data.total || 0);
    } catch (e) {
      console.error('Explore fetchProducts error:', e);
    } finally {
      setLoading(false);
    }
  }, [search, category, budgetTier, skinType, minPrice, maxPrice, sort]);

  // Debounced query fetching whenever filters change (prevents query thrashing during slider dragging)
  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const q = new URLSearchParams({
          ...(search ? { search } : {}),
          ...(category && category !== 'All' ? { category } : {}),
          ...(budgetTier ? { budget_tier: budgetTier } : {}),
          ...(skinType ? { skin_type: skinType } : {}),
          min_price: minPrice,
          max_price: maxPrice,
          sort,
          limit,
          page: 1,
        });
        const { data } = await api.get(`/products?${q}`);
        if (!ignore) {
          setProducts(data.products || []);
          setTotal(data.total || 0);
          setPage(1);
        }
      } catch (e) {
        console.error('Explore products fetch error:', e);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }, 220);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [search, category, budgetTier, skinType, minPrice, maxPrice, sort]);

  // Load next page of products
  function loadMore() {
    const next = page + 1;
    setPage(next);
    fetchProducts(next, false);
  }

  // Clear all filters back to catalog defaults
  function clearAll() {
    setSearch('');
    setCategory('');
    setBudgetTier('');
    setSkinType('');
    setMinPrice(0);
    setMaxPrice(5000);
    setSort('rating');
  }

  // Structured active filters with individual clear handlers
  const activeFilters = [
    search && {
      type: 'search',
      label: `"${search}"`,
      onRemove: () => setSearch(''),
    },
    category && category !== 'All' && {
      type: 'category',
      label: category,
      onRemove: () => setCategory(''),
    },
    budgetTier && {
      type: 'budget',
      label: `${budgetTier} Tier`,
      onRemove: () => setBudgetTier(''),
    },
    skinType && {
      type: 'skin',
      label: `${skinType} Skin`,
      onRemove: () => setSkinType(''),
    },
    (minPrice > 0 || maxPrice < 5000) && {
      type: 'price',
      label: `₹${minPrice.toLocaleString()}–₹${maxPrice.toLocaleString()}`,
      onRemove: () => {
        setMinPrice(0);
        setMaxPrice(5000);
      },
    },
  ].filter(Boolean);

  return (
    <div style={{ minHeight: '100vh', background: '#FDFBF7', fontFamily: '"Inter",sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 20px 100px' }}>
        {/* Top toolbar: search bar + sort dropdown + mobile filter drawer trigger */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
          <form
            onSubmit={e => {
              e.preventDefault();
              fetchProducts(1, true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#fff',
              border: '1.5px solid #EADFD4',
              borderRadius: 24,
              padding: '10px 18px',
              flex: 1,
              minWidth: 220,
              boxShadow: '0 2px 8px rgba(35, 30, 27, 0.03)',
            }}
          >
            <Search size={16} color="#665D57" />
            <input
              ref={searchInput}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products, brands, ingredients…"
              style={{
                border: 'none',
                outline: 'none',
                flex: 1,
                fontSize: 14,
                color: '#231E1B',
                background: 'transparent',
                fontFamily: 'inherit',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                <X size={15} color="#8A7D75" />
              </button>
            )}
          </form>

          {/* Sort selection dropdown */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: 20,
              border: '1.5px solid #EADFD4',
              background: '#fff',
              fontSize: 13,
              fontWeight: 600,
              color: '#231E1B',
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 2px 8px rgba(35, 30, 27, 0.03)',
            }}
          >
            {SORTS.map(s => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Mobile filter toggle button */}
          <button
            type="button"
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              padding: '10px 16px',
              borderRadius: 20,
              border: '1.5px solid #EADFD4',
              background: sidebarOpen ? '#E8633A' : '#fff',
              color: sidebarOpen ? '#fff' : '#231E1B',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 8px rgba(35, 30, 27, 0.03)',
            }}
            className="filter-toggle"
          >
            <SlidersHorizontal size={14} /> Filters
            {activeFilters.length > 0 && (
              <span
                style={{
                  background: sidebarOpen ? 'rgba(255,255,255,.3)' : '#E8633A',
                  color: '#fff',
                  borderRadius: 20,
                  padding: '1px 6px',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>

        {/* Active dismissible filter chips bar */}
        {activeFilters.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18, alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#8A7D75', marginRight: 4 }}>
              Active filters:
            </span>
            {activeFilters.map(f => (
              <span
                key={f.type}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#FDE8DE',
                  color: '#E8633A',
                  border: '1px solid #FAD1C0',
                  borderRadius: 20,
                  padding: '4px 10px 4px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  boxShadow: '0 1px 3px rgba(232, 99, 58, 0.08)',
                }}
              >
                <span>{f.label}</span>
                <button
                  type="button"
                  onClick={f.onRemove}
                  title="Remove filter"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#E8633A',
                    borderRadius: '50%',
                  }}
                >
                  <X size={13} />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearAll}
              style={{
                background: 'none',
                border: 'none',
                color: '#8A7D75',
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'underline',
                cursor: 'pointer',
                marginLeft: 4,
              }}
            >
              Reset All
            </button>
          </div>
        )}

        {/* Main Content: Sticky Sidebar + Product Cards Grid */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* Desktop Filter Sidebar with Dedicated Slim Scrolling */}
          <div className="filter-sidebar" style={{ width: 250, flexShrink: 0 }}>
            <FilterPanel
              activeFilters={activeFilters}
              clearAll={clearAll}
              category={category}
              setCategory={setCategory}
              budgetTier={budgetTier}
              setBudgetTier={setBudgetTier}
              skinType={skinType}
              setSkinType={setSkinType}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              total={total}
            />
          </div>

          {/* Mobile Slide-in Drawer Overlay */}
          {sidebarOpen && (
            <div
              className="mobile-filter"
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 400,
                background: 'rgba(0,0,0,.45)',
                backdropFilter: 'blur(3px)',
              }}
              onClick={() => setSidebarOpen(false)}
            >
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 320,
                  maxWidth: '85vw',
                  background: '#fff',
                  padding: '20px 18px',
                  boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
                }}
              >
                <FilterPanel
                  activeFilters={activeFilters}
                  clearAll={clearAll}
                  category={category}
                  setCategory={setCategory}
                  budgetTier={budgetTier}
                  setBudgetTier={setBudgetTier}
                  skinType={skinType}
                  setSkinType={setSkinType}
                  minPrice={minPrice}
                  setMinPrice={setMinPrice}
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                  isMobile={true}
                  onCloseMobile={() => setSidebarOpen(false)}
                  total={total}
                />
              </div>
            </div>
          )}

          {/* Product Grid Catalog Area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: '#665D57', fontWeight: 600 }}>
                {loading ? 'Finding matching products…' : `${total} products found`}
              </span>
            </div>

            {loading && products.length === 0 ? (
              /* Skeleton Loading Grid */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 380,
                      borderRadius: 24,
                      background: 'linear-gradient(90deg,#f0e8e0 25%,#faf5f0 50%,#f0e8e0 75%)',
                      backgroundSize: '200%',
                      animation: 'shimmer 1.5s infinite',
                    }}
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              /* Empty Search / Filter State */
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                background: '#fff',
                borderRadius: 24,
                border: '1.5px solid #EADFD4',
              }}>
                <span style={{ fontSize: 42 }}>🔍</span>
                <p style={{ fontWeight: 700, fontSize: 18, color: '#231E1B', marginTop: 12, marginBottom: 4 }}>
                  No products match your filters
                </p>
                <p style={{ color: '#8A7D75', fontSize: 14, maxWidth: 360, margin: '0 auto' }}>
                  Try relaxing price constraints, picking a different skin category, or clearing filters.
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  style={{
                    marginTop: 20,
                    padding: '11px 26px',
                    background: '#E8633A',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 24,
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 14,
                    boxShadow: '0 3px 10px rgba(232, 99, 58, 0.25)',
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                {/* 3-4 Column Grid of Editorial Product Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
                  {products.map(p => (
                    <ProductCard key={p.id || p._id} product={p} />
                  ))}
                </div>

                {/* Pagination load more button */}
                {products.length < total && (
                  <div style={{ textAlign: 'center', marginTop: 36 }}>
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={loading}
                      style={{
                        padding: '12px 36px',
                        background: '#E8633A',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 24,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                        opacity: loading ? 0.6 : 1,
                        boxShadow: '0 4px 12px rgba(232, 99, 58, 0.25)',
                        transition: 'transform .15s ease',
                      }}
                    >
                      {loading ? 'Loading…' : `Load More (${total - products.length} remaining)`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Component Styles for Scrollbars & Responsive Breakpoints */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* Slim luxury custom scrollbar for filter sidebar */
        .filter-sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: #EADFD4 transparent;
        }
        .filter-sidebar-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .filter-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .filter-sidebar-scroll::-webkit-scrollbar-thumb {
          background: #E0D3C7;
          border-radius: 10px;
          transition: background 0.2s ease;
        }
        .filter-sidebar-scroll:hover::-webkit-scrollbar-thumb {
          background: #CDB9A8;
        }

        @media(max-width: 768px) {
          .filter-sidebar { display: none !important; }
        }
        @media(min-width: 769px) {
          .filter-toggle { display: none !important; }
          .mobile-filter  { display: none !important; }
        }
      `}</style>
    </div>
  );
}

