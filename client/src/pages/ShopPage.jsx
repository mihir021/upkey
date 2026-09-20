import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Sparkles, TrendingUp, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import LiveSkincareBackground from '../components/LiveSkincareBackground';
import FloatingIngredients from '../components/FloatingIngredients';
import api from '../api/axios';

const CATEGORIES = ['All','Cleanser','Toner','Serum','Moisturizer','Sunscreen',
  'Foundation','Concealer','Blush','Lipstick','Lip Balm','Mascara','Eyeliner',
  'Face Mask','Exfoliator','Under-eye Cream','Body Lotion'];

const CATEGORY_ICONS = {
  All:'✨', Cleanser:'🫧', Toner:'💧', Serum:'🧬', Moisturizer:'🌿',
  Sunscreen:'☀️', Foundation:'🎭', Concealer:'💄', Blush:'🌸', Lipstick:'💋',
  'Lip Balm':'🍯', Mascara:'👁️', Eyeliner:'✏️', 'Face Mask':'😌',
  Exfoliator:'🫙', 'Under-eye Cream':'👁', 'Body Lotion':'🧴',
};

const BANNERS = [
  { gradient:'linear-gradient(135deg,#E8633A 0%,#c94f2a 100%)',
    title:'Up to 40% Off', sub:'Premium Skincare, Today Only', cta:'Shop Now', cat:'Serum' },
  { gradient:'linear-gradient(135deg,#8B5E83 0%,#6b4665 100%)',
    title:'Glow Season', sub:'Discover Bestselling Moisturizers', cta:'Explore', cat:'Moisturizer' },
  { gradient:'linear-gradient(135deg,#3A7BD5 0%,#2c5fa5 100%)',
    title:'Sun Protection', sub:'SPF Essentials for Every Skin', cta:'Browse', cat:'Sunscreen' },
];

export default function ShopPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [featured, setFeatured]   = useState([]);
  const [topRated, setTopRated]   = useState([]);
  const [catProds, setCatProds]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);
  const catScrollRef = useRef();

  // Banner auto-rotate
  useEffect(() => {
    const t = setInterval(() => setBannerIdx(i => (i + 1) % BANNERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  // Fetch featured (top 8 by rating) and top-rated
  useEffect(() => {
    let isMounted = true;

    Promise.all([
      api.get('/products?sort=rating&limit=8'),
      api.get('/products?sort=rating&limit=20&budget_tier=Premium'),
    ])
      .then(([featRes, topRes]) => {
        if (!isMounted) return;
        setFeatured(featRes.data.products || []);
        setTopRated(topRes.data.products || []);
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch by selected category
  useEffect(() => {
    const catParam = activeCategory === 'All' ? '' : activeCategory;
    api.get(`/products?sort=rating&limit=8${catParam ? `&category=${encodeURIComponent(catParam)}` : ''}`)
      .then(r => setCatProds(r.data.products || []))
      .catch(console.error);
  }, [activeCategory]);

  const banner = BANNERS[bannerIdx];

  return (
    <div className="relative min-h-screen text-[#231E1B] font-sans selection:bg-[#E8633A] selection:text-white overflow-x-hidden">
      {/* ── Live Skincare Animated Aurora Background (GPU-accelerated) ── */}
      <LiveSkincareBackground />

      {/* ── Animated Floating Active Ingredients Layer ── */}
      <FloatingIngredients section="catalog" />

      {/* ── Page Content Layer (z-10 ensures full interactivity) ── */}
      <div className="relative z-10">
        <Navbar />

        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 20px 100px' }}>

        {/* Hero Banner */}
        <div style={{
          borderRadius:24, overflow:'hidden', margin:'24px 0 20px',
          background: banner.gradient,
          padding:'40px 44px', position:'relative',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          minHeight:180, transition:'background .6s',
          boxShadow:'0 8px 32px rgba(0,0,0,.1)',
        }}>
          <div>
            <p style={{ color:'rgba(255,255,255,.75)', fontWeight:600, fontSize:13, margin:'0 0 6px', letterSpacing:1 }}>
              LIMITED TIME OFFER
            </p>
            <h1 style={{ color:'#fff', fontSize:'clamp(28px,5vw,44px)', fontWeight:800, margin:'0 0 8px',
              fontFamily:'"Playfair Display",serif', lineHeight:1.15 }}>
              {banner.title}
            </h1>
            <p style={{ color:'rgba(255,255,255,.85)', fontSize:15, margin:'0 0 24px' }}>
              {banner.sub}
            </p>
            <button onClick={() => navigate(`/explore?category=${banner.cat}`)} style={{
              background:'#fff', color: banner.gradient.includes('#E8633A') ? '#E8633A' : '#231E1B',
              border:'none', borderRadius:24, padding:'10px 26px',
              fontSize:14, fontWeight:700, cursor:'pointer',
              boxShadow:'0 4px 16px rgba(0,0,0,.15)',
              display:'flex', alignItems:'center', gap:8,
            }}>
              {banner.cta} <ChevronRight size={16} />
            </button>
          </div>

          {/* Banner dots */}
          <div style={{ position:'absolute', bottom:16, right:20, display:'flex', gap:6 }}>
            {BANNERS.map((_, i) => (
              <button key={i} onClick={() => setBannerIdx(i)} style={{
                width: i === bannerIdx ? 20 : 8, height:8, borderRadius:8,
                background: i === bannerIdx ? '#fff' : 'rgba(255,255,255,.45)',
                border:'none', cursor:'pointer', transition:'all .3s', padding:0,
              }} />
            ))}
          </div>

          {/* Decorative circle */}
          <div style={{
            position:'absolute', right:-40, top:-40,
            width:220, height:220, borderRadius:'50%',
            background:'rgba(255,255,255,.08)',
          }} />
          <div style={{
            position:'absolute', right:40, bottom:-60,
            width:160, height:160, borderRadius:'50%',
            background:'rgba(255,255,255,.06)',
          }} />
        </div>

        {/* Category Pills */}
        <div ref={catScrollRef} style={{
          display:'flex', gap:10, overflowX:'auto', padding:'4px 0 12px',
          scrollbarWidth:'none', msOverflowStyle:'none',
        }}>
          {CATEGORIES.map(cat => (
            <button key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                flexShrink:0, padding:'8px 18px', borderRadius:24,
                background: activeCategory === cat ? '#E8633A' : '#fff',
                color: activeCategory === cat ? '#fff' : '#665D57',
                border: activeCategory === cat ? 'none' : '1.5px solid #EADFD4',
                fontSize:13, fontWeight:600, cursor:'pointer',
                display:'flex', alignItems:'center', gap:6,
                transition:'all .2s', whiteSpace:'nowrap',
                boxShadow: activeCategory === cat ? '0 4px 14px rgba(232,99,58,.35)' : 'none',
              }}
            >
              <span>{CATEGORY_ICONS[cat] || '🌿'}</span> {cat}
            </button>
          ))}
        </div>

        {/* Category-filtered grid */}
        <section style={{ marginBottom:48 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <h2 style={{ margin:0, fontFamily:'"Playfair Display",serif', fontSize:22, fontWeight:700, color:'#231E1B' }}>
              {activeCategory === 'All' ? 'Featured Products' : activeCategory}
            </h2>
            <button onClick={() => navigate(`/explore?category=${activeCategory === 'All' ? '' : activeCategory}`)}
              style={{
                display:'flex', alignItems:'center', gap:4,
                background:'none', border:'none', color:'#E8633A',
                fontWeight:700, fontSize:13, cursor:'pointer',
              }}>
              View All <ChevronRight size={15} />
            </button>
          </div>

          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16 }}>
              {[...Array(8)].map((_,i) => (
                <div key={i} style={{
                  height:280, borderRadius:20, background:'linear-gradient(90deg,#f0e8e0 25%,#faf5f0 50%,#f0e8e0 75%)',
                  backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite',
                }} />
              ))}
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:16 }}>
              {(activeCategory === 'All' ? featured : catProds).map(p => (
                <ProductCard key={p.id || p._id} product={p} />
              ))}
            </div>
          )}
        </section>

        {/* Top Rated / Premium section */}
        {topRated.length > 0 && (
          <section style={{ marginBottom:48 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{
                  width:36, height:36, borderRadius:10,
                  background:'linear-gradient(135deg,#E8633A,#c94f2a)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <TrendingUp size={18} color="#fff" />
                </div>
                <h2 style={{ margin:0, fontFamily:'"Playfair Display",serif', fontSize:22, fontWeight:700, color:'#231E1B' }}>
                  Premium Picks
                </h2>
              </div>
              <button onClick={() => navigate('/explore?budget_tier=Premium')}
                style={{ background:'none', border:'none', color:'#E8633A', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                View All <ChevronRight size={15} />
              </button>
            </div>
            <div style={{
              display:'flex', gap:16, overflowX:'auto', paddingBottom:8,
              scrollbarWidth:'none',
            }}>
              {topRated.map(p => (
                <div key={p.id||p._id} style={{ flexShrink:0, width:200 }}>
                  <ProductCard product={p} size="sm" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quick Links Banner Row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:48 }}>
          {[
            { icon:<Sparkles size={20}/>, title:'New Arrivals', sub:'Latest drops this week', color:'#8B5E83', bg:'#f5e8f5', to:'/explore?sort=name' },
            { icon:<Zap size={20}/>, title:'Budget Picks', sub:'Under ₹500 bestsellers', color:'#3A7BD5', bg:'#e8f0fb', to:'/explore?budget_tier=Budget' },
            { icon:<TrendingUp size={20}/>, title:'Top Rated', sub:'Community favourites', color:'#27AE60', bg:'#e8f5ec', to:'/explore?sort=rating' },
          ].map(card => (
            <button key={card.title} onClick={() => navigate(card.to)}
              style={{
                background: card.bg, borderRadius:20, padding:'20px 22px',
                border:'1.5px solid transparent', cursor:'pointer',
                display:'flex', alignItems:'center', gap:14, textAlign:'left',
                transition:'transform .2s, box-shadow .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
            >
              <div style={{
                width:44, height:44, borderRadius:14,
                background: card.color, color:'#fff',
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink:0,
              }}>
                {card.icon}
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:'#231E1B' }}>{card.title}</div>
                <div style={{ fontSize:12, color:'#665D57', marginTop:2 }}>{card.sub}</div>
              </div>
              <ChevronRight size={16} color={card.color} style={{ marginLeft:'auto' }} />
            </button>
          ))}
        </div>
      </div>
    </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
