import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';

const CATEGORIES = ['All','Cleanser','Toner','Serum','Moisturizer','Sunscreen',
  'Foundation','Concealer','Blush','Lipstick','Lip Balm','Mascara','Eyeliner',
  'Face Mask','Exfoliator','Under-eye Cream','Body Lotion'];
const SKIN_TYPES  = ['Oily','Dry','Combination','Sensitive','Normal'];
const BUDGETS     = ['Budget','Mid','Premium'];
const SORTS       = [
  { label:'Top Rated',    value:'rating' },
  { label:'Price: Low–High', value:'price_asc' },
  { label:'Price: High–Low', value:'price_desc' },
  { label:'Name A–Z',    value:'name' },
];

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom:'1px solid #EADFD4', paddingBottom:16, marginBottom:16 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        width:'100%', background:'none', border:'none', cursor:'pointer',
        padding:'0 0 10px', fontWeight:700, fontSize:13, color:'#231E1B',
      }}>
        {title}
        {open ? <ChevronUp size={14} color="#665D57"/> : <ChevronDown size={14} color="#665D57"/>}
      </button>
      {open && children}
    </div>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:'5px 12px', borderRadius:20, fontSize:12, fontWeight:600,
      background: active ? '#E8633A' : '#F6EFE9',
      color: active ? '#fff' : '#665D57',
      border: active ? 'none' : '1px solid #EADFD4',
      cursor:'pointer', transition:'all .15s',
    }}>{label}</button>
  );
}

/**
 * FilterPanel - extracted outside component to comply with React Compiler & ESLint rules.
 * Renders filter controls for category, budget, skin type, and price range.
 */
function FilterPanel({
  activeFilters, clearAll,
  category, setCategory,
  budgetTier, setBudgetTier,
  skinType, setSkinType,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
}) {
  return (
    <div style={{ background:'#fff', border:'1.5px solid #EADFD4', borderRadius:20, padding:20, position:'sticky', top:84 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <span style={{ fontWeight:700, fontSize:15, color:'#231E1B' }}>Filters</span>
        {activeFilters.length > 0 && (
          <button onClick={clearAll} style={{
            background:'none', border:'none', color:'#E8633A', fontSize:12, fontWeight:700, cursor:'pointer',
          }}>Clear All</button>
        )}
      </div>

      <FilterSection title="Category">
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {CATEGORIES.map(c => (
            <Chip key={c} label={c} active={category === c || (c==='All' && !category)}
              onClick={() => setCategory(c === 'All' ? '' : c)} />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Budget">
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {BUDGETS.map(b => (
            <Chip key={b} label={b} active={budgetTier === b}
              onClick={() => setBudgetTier(budgetTier === b ? '' : b)} />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Skin Type">
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {SKIN_TYPES.map(s => (
            <Chip key={s} label={s} active={skinType === s}
              onClick={() => setSkinType(skinType === s ? '' : s)} />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#665D57', fontWeight:600 }}>
            <span>₹{minPrice}</span><span>₹{maxPrice}</span>
          </div>
          <input type="range" min={0} max={5000} step={50}
            value={minPrice} onChange={e => setMinPrice(Number(e.target.value))}
            style={{ width:'100%', accentColor:'#E8633A' }} />
          <input type="range" min={0} max={5000} step={50}
            value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
            style={{ width:'100%', accentColor:'#E8633A' }} />
        </div>
      </FilterSection>
    </div>
  );
}

export default function ExplorePage() {
  const [params] = useSearchParams();

  const [search,      setSearch]     = useState(params.get('search') || '');
  const [category,    setCategory]   = useState(params.get('category') || '');
  const [budgetTier,  setBudgetTier] = useState(params.get('budget_tier') || '');
  const [skinType,    setSkinType]   = useState('');
  const [minPrice,    setMinPrice]   = useState(0);
  const [maxPrice,    setMaxPrice]   = useState(5000);
  const [sort,        setSort]       = useState(params.get('sort') || 'rating');
  const [products,    setProducts]   = useState([]);
  const [total,       setTotal]      = useState(0);
  const [loading,     setLoading]    = useState(false);
  const [page,        setPage]       = useState(1);
  const [sidebarOpen, setSidebarOpen]= useState(false);
  const limit = 24;
  const searchInput = useRef();

  const fetchProducts = useCallback(async (pg = 1, reset = true) => {
    setLoading(true);
    if (reset) {
      setPage(1);
    }
    try {
      const q = new URLSearchParams({
        ...(search     ? { search }     : {}),
        ...(category && category !== 'All' ? { category } : {}),
        ...(budgetTier ? { budget_tier: budgetTier } : {}),
        ...(skinType   ? { skin_type: skinType }   : {}),
        min_price: minPrice, max_price: maxPrice,
        sort, limit, page: pg,
      });
      const { data } = await api.get(`/products?${q}`);
      setProducts(prev => reset ? (data.products || []) : [...prev, ...(data.products || [])]);
      setTotal(data.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, category, budgetTier, skinType, minPrice, maxPrice, sort]);

  // Re-fetch whenever filters change (reset to page 1)
  useEffect(() => {
    let ignore = false;

    async function load() {
      // Defer state update to next tick so it doesn't trigger synchronous render cascades
      await Promise.resolve();
      if (ignore) return;
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
    }

    load();
    return () => {
      ignore = true;
    };
  }, [search, category, budgetTier, skinType, minPrice, maxPrice, sort]);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    fetchProducts(next, false);
  }

  function clearAll() {
    setSearch(''); setCategory(''); setBudgetTier('');
    setSkinType(''); setMinPrice(0); setMaxPrice(5000);
    setSort('rating');
  }

  const activeFilters = [
    search && `"${search}"`,
    category && category !== 'All' && category,
    budgetTier,
    skinType,
    (minPrice > 0 || maxPrice < 5000) && `₹${minPrice}–₹${maxPrice}`,
  ].filter(Boolean);

  return (
    <div style={{ minHeight:'100vh', background:'#FDFBF7', fontFamily:'"Inter",sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'24px 20px 100px' }}>
        {/* Top bar: search + sort + filter toggle */}
        <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:20, flexWrap:'wrap' }}>
          <form onSubmit={e => { e.preventDefault(); fetchProducts(1, true); }} style={{
            display:'flex', alignItems:'center', gap:8,
            background:'#fff', border:'1.5px solid #EADFD4', borderRadius:24,
            padding:'10px 18px', flex:1, minWidth:200,
          }}>
            <Search size={16} color="#665D57" />
            <input ref={searchInput} value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products, brands, ingredients…"
              style={{ border:'none', outline:'none', flex:1, fontSize:14, color:'#231E1B', background:'transparent', fontFamily:'inherit' }}
            />
            {search && <button type="button" onClick={() => setSearch('')}
              style={{ background:'none', border:'none', cursor:'pointer', padding:0, display:'flex' }}>
              <X size={14} color="#665D57" />
            </button>}
          </form>

          {/* Sort */}
          <select value={sort} onChange={e => setSort(e.target.value)} style={{
            padding:'10px 14px', borderRadius:20, border:'1.5px solid #EADFD4',
            background:'#fff', fontSize:13, fontWeight:600, color:'#231E1B',
            cursor:'pointer', fontFamily:'inherit',
          }}>
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {/* Mobile filter toggle */}
          <button onClick={() => setSidebarOpen(o => !o)} style={{
            padding:'10px 16px', borderRadius:20, border:'1.5px solid #EADFD4',
            background: sidebarOpen ? '#E8633A' : '#fff', color: sidebarOpen ? '#fff' : '#231E1B',
            fontSize:13, fontWeight:600, cursor:'pointer',
            display:'flex', alignItems:'center', gap:6,
          }} className="filter-toggle">
            <SlidersHorizontal size={14} /> Filters
            {activeFilters.length > 0 && (
              <span style={{
                background: sidebarOpen ? 'rgba(255,255,255,.3)' : '#E8633A',
                color:'#fff', borderRadius:20, padding:'1px 6px', fontSize:11, fontWeight:700,
              }}>{activeFilters.length}</span>
            )}
          </button>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
            {activeFilters.map(f => (
              <span key={f} style={{
                background:'#fde8d8', color:'#E8633A', borderRadius:20,
                padding:'4px 12px', fontSize:12, fontWeight:600,
              }}>{f}</span>
            ))}
          </div>
        )}

        <div style={{ display:'flex', gap:24 }}>
          {/* Sidebar */}
          <div className="filter-sidebar" style={{ width:240, flexShrink:0 }}>
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
            />
          </div>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="mobile-filter" style={{
              position:'fixed', inset:0, zIndex:400, background:'rgba(0,0,0,.4)',
            }} onClick={() => setSidebarOpen(false)}>
              <div onClick={e => e.stopPropagation()} style={{
                position:'absolute', left:0, top:0, bottom:0, width:300,
                background:'#fff', overflowY:'auto', padding:20,
              }}>
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
                />
              </div>
            </div>
          )}

          {/* Product grid */}
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <span style={{ fontSize:13, color:'#665D57' }}>
                {loading ? 'Loading…' : `${total} products found`}
              </span>
            </div>

            {loading && products.length === 0 ? (
              /* Spacious Skeleton Loading Grid */
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:20 }}>
                {[...Array(9)].map((_,i) => (
                  <div key={i} style={{ height:380, borderRadius:24, background:'linear-gradient(90deg,#f0e8e0 25%,#faf5f0 50%,#f0e8e0 75%)', backgroundSize:'200%', animation:'shimmer 1.5s infinite' }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign:'center', padding:'80px 20px' }}>
                <span style={{ fontSize:40 }}>🔍</span>
                <p style={{ fontWeight:600, color:'#231E1B', marginTop:12 }}>No products found</p>
                <p style={{ color:'#665D57', fontSize:14 }}>Try adjusting your filters or search terms</p>
                <button onClick={clearAll} style={{
                  marginTop:16, padding:'10px 24px', background:'#E8633A', color:'#fff',
                  border:'none', borderRadius:24, cursor:'pointer', fontWeight:700,
                }}>Clear Filters</button>
              </div>
            ) : (
              <>
                {/* Spacious 3-4 Column Grid with Balanced Card Dimensions */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:20 }}>
                  {products.map(p => <ProductCard key={p.id||p._id} product={p} />)}
                </div>
                {products.length < total && (
                  <div style={{ textAlign:'center', marginTop:32 }}>
                    <button onClick={loadMore} disabled={loading} style={{
                      padding:'12px 36px', background:'#E8633A', color:'#fff',
                      border:'none', borderRadius:24, fontSize:14, fontWeight:700, cursor:'pointer',
                      opacity: loading ? .6 : 1,
                    }}>
                      {loading ? 'Loading…' : `Load More (${total - products.length} remaining)`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @media(max-width:768px){
          .filter-sidebar { display:none !important; }
        }
        @media(min-width:769px){
          .filter-toggle { display:none !important; }
          .mobile-filter  { display:none !important; }
        }
      `}</style>
    </div>
  );
}
