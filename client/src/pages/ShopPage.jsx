import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, TrendingUp, Zap, Star, ArrowRight } from 'lucide-react';
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

// Rich promotional banners with multi-product 3D showcase collections
const BANNERS = [
  {
    gradient: 'linear-gradient(135deg, #D45028 0%, #B83B14 50%, #912708 100%)',
    tag: 'LIMITED TIME PROMOTION',
    title: 'Up to 40% Off',
    sub: 'Clinical Serums & Targeted Formulations',
    cta: 'Explore Serums',
    cat: 'Serum',
    accent: '#FFAA8A',
    products: [
      {
        id: 'P015',
        name: 'Retinol 0.3% Night Renewal',
        brand: 'Luminate',
        price_inr: 2100,
        original_price: 3500,
        rating: 4.6,
        badge: '✨ 40% OFF',
        image: 'https://res.cloudinary.com/xyofqsjy/image/upload/v1789893298/serum3.jpg',
      },
      {
        id: 'P011',
        name: '10% Niacinamide + Zinc',
        brand: 'Skinly',
        price_inr: 549,
        original_price: 899,
        rating: 4.5,
        badge: '🔥 Bestseller',
        image: 'https://res.cloudinary.com/xyofqsjy/image/upload/v1789893297/serum1.jpg',
      },
      {
        id: 'P014',
        name: 'Hyaluronic Acid Multi-Weight',
        brand: 'DermaRoot',
        price_inr: 1250,
        original_price: 1999,
        rating: 4.6,
        badge: '💧 Deep Hydration',
        image: 'https://res.cloudinary.com/xyofqsjy/image/upload/v1789893298/serum3.jpg',
      },
    ],
  },
  {
    gradient: 'linear-gradient(135deg, #7A4972 0%, #5E3257 50%, #461F40 100%)',
    tag: 'BARRIER RESTORATION',
    title: 'Glow Season',
    sub: 'Velvety Hydration & Barrier Defense Creams',
    cta: 'Shop Moisturizers',
    cat: 'Moisturizer',
    accent: '#E6B8E0',
    products: [
      {
        id: 'P020',
        name: 'Peptide Firming Day Cream',
        brand: 'Luminate',
        price_inr: 1999,
        original_price: 2799,
        rating: 4.6,
        badge: '🌟 Peptide Infused',
        image: 'https://res.cloudinary.com/xyofqsjy/image/upload/v1789893803/WhatsApp_Image_2026-09-20_at_2.09.46_PM.jpg',
      },
      {
        id: 'P022',
        name: 'Centella Recovery Cream',
        brand: 'Skinly',
        price_inr: 650,
        original_price: 950,
        rating: 4.4,
        badge: '🌿 Soothing Cica',
        image: 'https://res.cloudinary.com/xyofqsjy/image/upload/v1789893801/WhatsApp_Image_2026-09-20_at_2.09.21_PM.jpg',
      },
      {
        id: 'P019',
        name: 'Shea & Squalane Rich Cream',
        brand: 'Terra Botanica',
        price_inr: 550,
        original_price: 850,
        rating: 4.2,
        badge: '🥑 Deep Nourish',
        image: 'https://res.cloudinary.com/xyofqsjy/image/upload/v1789893805/WhatsApp_Image_2026-09-20_at_2.10.36_PM.jpg',
      },
    ],
  },
  {
    gradient: 'linear-gradient(135deg, #2A68BF 0%, #1D4F99 50%, #123770 100%)',
    tag: 'DAILY UV DEFENSE',
    title: 'Sun Protection',
    sub: 'Invisible Broad Spectrum SPF 50 Essentials',
    cta: 'Explore SPF',
    cat: 'Sunscreen',
    accent: '#9ECCFF',
    products: [
      {
        id: 'P027',
        name: 'No White Cast SPF 50',
        brand: 'Terra Botanica',
        price_inr: 599,
        original_price: 899,
        rating: 4.5,
        badge: '☀️ Zero Cast',
        image: 'https://res.cloudinary.com/xyofqsjy/image/upload/v1789893725/sun3.jpg',
      },
      {
        id: 'P023',
        name: 'Matte Fluid SPF 50',
        brand: 'Skinly',
        price_inr: 499,
        original_price: 749,
        rating: 4.4,
        badge: '✨ Ultra Matte',
        image: 'https://res.cloudinary.com/xyofqsjy/image/upload/v1789893720/sun1.jpg',
      },
      {
        id: 'P024',
        name: 'Mineral Sunscreen Gel SPF 50',
        brand: 'Bare Essentials',
        price_inr: 625,
        original_price: 899,
        rating: 4.3,
        badge: '🛡️ 100% Mineral',
        image: 'https://res.cloudinary.com/xyofqsjy/image/upload/v1789893725/sun3.jpg',
      },
    ],
  },
];

export default function ShopPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [featured, setFeatured]   = useState([]);
  const [topRated, setTopRated]   = useState([]);
  const [catProds, setCatProds]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [prodIdx, setProdIdx] = useState(0);
  const catScrollRef = useRef();
  const premiumScrollRef = useRef();

  // Scroll helper for Premium Picks carousel
  const scrollPremium = (dir) => {
    premiumScrollRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  // Banner slide auto-rotate (every 8 seconds)
  useEffect(() => {
    const t = setInterval(() => {
      setBannerIdx(i => (i + 1) % BANNERS.length);
      setProdIdx(0);
    }, 8000);
    return () => clearInterval(t);
  }, []);

  // Product 3D turning showcase auto-advance (every 3.5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setProdIdx(curr => (curr + 1) % (BANNERS[bannerIdx]?.products?.length || 1));
    }, 3500);
    return () => clearInterval(timer);
  }, [bannerIdx]);

  const nextProduct = (e) => {
    e.stopPropagation();
    const count = BANNERS[bannerIdx]?.products?.length || 1;
    setProdIdx(i => (i + 1) % count);
  };

  const prevProduct = (e) => {
    e.stopPropagation();
    const count = BANNERS[bannerIdx]?.products?.length || 1;
    setProdIdx(i => (i - 1 + count) % count);
  };

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
  const currentProduct = banner?.products?.[prodIdx] || banner?.products?.[0];

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

        {/* Hero Banner with 3D Product Turning Showcase */}
        <div style={{
          borderRadius:26, overflow:'hidden', margin:'24px 0 24px',
          background: banner.gradient,
          padding:'36px 40px', position:'relative',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          minHeight:240, transition:'background .7s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow:'0 14px 40px rgba(0,0,0,.12)',
          gap:32, flexWrap:'wrap',
        }}>
          {/* Left Hero Content */}
          <div style={{ flex:'1 1 360px', zIndex:2 }}>
            <p style={{
              color: banner.accent,
              fontWeight: 700,
              fontSize: 12,
              margin: '0 0 8px',
              letterSpacing: 1.4,
              textTransform: 'uppercase',
            }}>
              {banner.tag}
            </p>
            <h1 style={{
              color:'#fff',
              fontSize:'clamp(28px,4vw,42px)',
              fontWeight:800,
              margin:'0 0 8px',
              fontFamily:'"Playfair Display",serif',
              lineHeight:1.15,
            }}>
              {banner.title}
            </h1>
            <p style={{ color:'rgba(255,255,255,.88)', fontSize:15, margin:'0 0 24px', maxWidth:460, lineHeight:1.5 }}>
              {banner.sub}
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
              <button onClick={() => navigate(`/explore?category=${banner.cat}`)} style={{
                background:'#fff',
                color: banner.gradient.includes('#D45028') ? '#D45028' : '#231E1B',
                border:'none', borderRadius:24, padding:'11px 26px',
                fontSize:14, fontWeight:700, cursor:'pointer',
                boxShadow:'0 4px 16px rgba(0,0,0,.15)',
                display:'flex', alignItems:'center', gap:8,
                transition:'all .2s',
              }}>
                {banner.cta} <ChevronRight size={16} />
              </button>

              {/* Banner slide dots */}
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                {BANNERS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setBannerIdx(i); setProdIdx(0); }}
                    title={`Banner slide ${i + 1}`}
                    style={{
                      width: i === bannerIdx ? 22 : 7,
                      height: 7,
                      borderRadius: 6,
                      background: i === bannerIdx ? '#fff' : 'rgba(255,255,255,.4)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all .3s ease',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Hero: 3D Product Turning Card Showcase */}
          <div style={{
            flex: '0 0 auto',
            width: '100%',
            maxWidth: 390,
            zIndex: 2,
            position: 'relative',
            perspective: 1200,
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {/* Prev Product Button */}
              <button
                onClick={prevProduct}
                title="Previous Product"
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.22)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0, transition: 'all .2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <ChevronLeft size={18} />
              </button>

              {/* 3D Animated Product Card */}
              <div style={{ flex: 1, position: 'relative', minHeight: 155 }}>
                <AnimatePresence mode="wait">
                  {currentProduct && (
                    <motion.div
                      key={`${bannerIdx}-${prodIdx}`}
                      initial={{ opacity: 0, rotateY: 70, scale: 0.88, x: 35 }}
                      animate={{ opacity: 1, rotateY: 0, scale: 1, x: 0 }}
                      exit={{ opacity: 0, rotateY: -70, scale: 0.88, x: -35 }}
                      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => navigate(`/product/${currentProduct.id}`)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.18)',
                        backdropFilter: 'blur(16px)',
                        border: '1.5px solid rgba(255, 255, 255, 0.35)',
                        borderRadius: 20,
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                        cursor: 'pointer',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      {/* Product Thumbnail with 3D Float */}
                      <div style={{
                        width: 88,
                        height: 104,
                        borderRadius: 14,
                        overflow: 'hidden',
                        background: '#FFF',
                        flexShrink: 0,
                        position: 'relative',
                        boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <img
                          src={currentProduct.image}
                          alt={currentProduct.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                          }}
                        />
                        <span style={{
                          position: 'absolute',
                          top: 4,
                          left: 4,
                          background: 'rgba(35,30,27,0.85)',
                          color: '#fff',
                          fontSize: 9,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 6,
                          backdropFilter: 'blur(4px)',
                        }}>
                          {currentProduct.badge}
                        </span>
                      </div>

                      {/* Product Meta & Price */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{
                          fontSize: 10,
                          color: 'rgba(255,255,255,0.8)',
                          fontWeight: 700,
                          letterSpacing: 0.8,
                          textTransform: 'uppercase',
                        }}>
                          {currentProduct.brand}
                        </span>
                        <h4 style={{
                          color: '#fff',
                          fontSize: 14.5,
                          fontWeight: 700,
                          margin: '2px 0 4px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.25,
                        }}>
                          {currentProduct.name}
                        </h4>

                        {/* Rating */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                          <Star size={13} fill="#FFD700" color="#FFD700" />
                          <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>
                            {currentProduct.rating}
                          </span>
                          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
                            · Top Pick
                          </span>
                        </div>

                        {/* Price & Action */}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <span style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>
                            ₹{currentProduct.price_inr.toLocaleString('en-IN')}
                          </span>
                          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, textDecoration: 'line-through' }}>
                            ₹{currentProduct.original_price.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div style={{
                          marginTop: 6,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#fff',
                          background: 'rgba(255,255,255,0.22)',
                          padding: '3px 10px',
                          borderRadius: 12,
                        }}>
                          View Item <ArrowRight size={11} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Next Product Button */}
              <button
                onClick={nextProduct}
                title="Next Product"
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.22)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0, transition: 'all .2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Product Switcher Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
              {banner.products?.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={(e) => { e.stopPropagation(); setProdIdx(idx); }}
                  title={p.name}
                  style={{
                    width: idx === prodIdx ? 18 : 6,
                    height: 6,
                    borderRadius: 6,
                    background: idx === prodIdx ? '#fff' : 'rgba(255,255,255,0.4)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all .25s ease',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Decorative ambient elements */}
          <div style={{
            position:'absolute', right:-50, top:-50,
            width:240, height:240, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(255,255,255,.14) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position:'absolute', right:120, bottom:-70,
            width:180, height:180, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)',
            pointerEvents: 'none',
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
            /* Responsive Skeleton Loading Grid with Balanced Proportions */
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))', gap:22 }}>
              {[...Array(8)].map((_,i) => (
                <div key={i} style={{
                  height:380, borderRadius:24, background:'linear-gradient(90deg,#f0e8e0 25%,#faf5f0 50%,#f0e8e0 75%)',
                  backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite',
                }} />
              ))}
            </div>
          ) : (
            /* Spacious 3-4 Column Product Grid with Proper Card Dimensions */
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))', gap:22 }}>
              {(activeCategory === 'All' ? featured : catProds).map(p => (
                <ProductCard key={p.id || p._id} product={p} />
              ))}
            </div>
          )}
        </section>

        {/* Top Rated / Premium section with smooth carousel navigation */}
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
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                {/* Carousel navigation buttons */}
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <button
                    onClick={() => scrollPremium(-1)}
                    aria-label="Scroll left"
                    title="Scroll left"
                    style={{
                      width:32, height:32, borderRadius:'50%', background:'#fff',
                      border:'1.5px solid #EADFD4', display:'flex', alignItems:'center',
                      justifyContent: 'center', cursor:'pointer', color:'#665D57',
                      boxShadow:'0 2px 8px rgba(0,0,0,.04)', transition:'all .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#E8633A'; e.currentTarget.style.color = '#E8633A'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#EADFD4'; e.currentTarget.style.color = '#665D57'; }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => scrollPremium(1)}
                    aria-label="Scroll right"
                    title="Scroll right"
                    style={{
                      width:32, height:32, borderRadius:'50%', background:'#fff',
                      border:'1.5px solid #EADFD4', display:'flex', alignItems:'center',
                      justifyContent: 'center', cursor:'pointer', color:'#665D57',
                      boxShadow:'0 2px 8px rgba(0,0,0,.04)', transition:'all .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#E8633A'; e.currentTarget.style.color = '#E8633A'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#EADFD4'; e.currentTarget.style.color = '#665D57'; }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <button onClick={() => navigate('/explore?budget_tier=Premium')}
                  style={{ background:'none', border:'none', color:'#E8633A', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                  View All <ChevronRight size={15} />
                </button>
              </div>
            </div>
            {/* Horizontal scroll container with balanced 260px cards and scroll snap */}
            <div
              ref={premiumScrollRef}
              style={{
                display:'flex', gap:22, overflowX:'auto', padding:'4px 4px 18px',
                scrollbarWidth:'none', scrollBehavior:'smooth', scrollSnapType:'x mandatory',
              }}
            >
              {topRated.map(p => (
                <div key={p.id||p._id} style={{ flexShrink:0, width:260, scrollSnapAlign:'start' }}>
                  <ProductCard product={p} />
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
