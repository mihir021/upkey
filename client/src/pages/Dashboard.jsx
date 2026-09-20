import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, TrendingUp, Package, ChevronRight, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function imgSrc(p) {
  const cl = p?.cloudinary_link || '';
  return (!cl || cl.endsWith('.glb') || cl.endsWith('.gltf')) ? null : cl;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orders, wishlist, cartCount, history } = useCart();

  const [recentProds, setRecentProds] = useState([]);
  const [trending,    setTrending]    = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);
  const wishCount  = Object.keys(wishlist).length;

  // Load recently viewed products asynchronously without cascading render triggers
  useEffect(() => {
    if (!history.length) return;
    let isMounted = true;

    Promise.all(
      history.slice(0, 6).map(id => api.get(`/api/products/${id}`).catch(() => null))
    ).then(results => {
      if (isMounted) {
        setRecentProds(results.filter(Boolean).map(r => r.data));
      }
    }).finally(() => {
      if (isMounted) {
        setLoadingRecent(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [history]);

  // Fetch trending
  useEffect(() => {
    api.get('/api/products?sort=rating&limit=6')
      .then(r => setTrending(r.data.products || []))
      .catch(console.error);
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={{ minHeight:'100vh', background:'#FDFBF7', fontFamily:'"Inter",sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 20px 100px' }}>

        {/* Welcome Header */}
        <div style={{
          background:'linear-gradient(135deg,#231E1B 0%,#3d342f 100%)',
          borderRadius:24, padding:'30px 36px', marginBottom:28,
          display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16,
          position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', right:-30, top:-30, width:180, height:180, borderRadius:'50%', background:'rgba(232,99,58,.12)' }} />
          <div>
            <p style={{ margin:'0 0 4px', color:'rgba(255,255,255,.55)', fontSize:13, fontWeight:600 }}>
              {greeting()}, ✨
            </p>
            <h1 style={{ margin:'0 0 6px', color:'#fff', fontSize:'clamp(20px,4vw,28px)', fontWeight:800, fontFamily:'"Playfair Display",serif' }}>
              {user?.name || 'Welcome back'}
            </h1>
            <p style={{ margin:0, color:'rgba(255,255,255,.55)', fontSize:13 }}>
              Your Joyory skincare journey
            </p>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <button onClick={() => navigate('/shop')} style={{
              padding:'10px 22px', background:'#E8633A', color:'#fff',
              border:'none', borderRadius:24, fontSize:14, fontWeight:700, cursor:'pointer',
              display:'flex', alignItems:'center', gap:6,
            }}>
              <ShoppingBag size={16} /> Shop Now
            </button>
            <button onClick={() => navigate('/profile')} style={{
              padding:'10px 22px', background:'rgba(255,255,255,.1)', color:'#fff',
              border:'1.5px solid rgba(255,255,255,.2)', borderRadius:24, fontSize:14, fontWeight:700, cursor:'pointer',
            }}>
              My Profile
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14, marginBottom:32 }}>
          {[
            { icon:<TrendingUp size={20}/>, label:'Total Spent', val:`₹${Math.round(totalSpent).toLocaleString('en-IN')}`, color:'#E8633A', bg:'#fde8d8', to:'/profile' },
            { icon:<Package size={20}/>, label:'Orders', val:orders.length, color:'#3A7BD5', bg:'#e8f0fb', to:'/orders' },
            { icon:<Heart size={20}/>, label:'Wishlist', val:wishCount, color:'#8B5E83', bg:'#f0e8f5', to:'/wishlist' },
            { icon:<ShoppingBag size={20}/>, label:'In Cart', val:cartCount, color:'#27AE60', bg:'#e8f5ec', to:'/cart' },
          ].map(stat => (
            <button key={stat.label} onClick={() => navigate(stat.to)} style={{
              background:'#fff', border:'1.5px solid #EADFD4', borderRadius:18, padding:'18px 18px',
              display:'flex', alignItems:'center', gap:14, cursor:'pointer',
              transition:'transform .2s, box-shadow .2s', textAlign:'left',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 20px rgba(0,0,0,.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
            >
              <div style={{ width:44, height:44, borderRadius:14, background:stat.bg, color:stat.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize:22, fontWeight:800, color:'#231E1B', lineHeight:1 }}>{stat.val}</div>
                <div style={{ fontSize:11, color:'#665D57', fontWeight:600, marginTop:3 }}>{stat.label}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Recently Viewed */}
        {history.length > 0 && (
          <section style={{ marginBottom:40 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <h2 style={{ margin:0, fontFamily:'"Playfair Display",serif', fontSize:20, fontWeight:700, color:'#231E1B' }}>
                Recently Viewed
              </h2>
              <button onClick={() => navigate('/explore')} style={{ background:'none', border:'none', color:'#E8633A', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                Explore More <ChevronRight size={14} />
              </button>
            </div>
            {loadingRecent ? (
              <div style={{ display:'flex', gap:16 }}>
                {[...Array(4)].map((_,i) => (
                  <div key={i} style={{ flex:'0 0 180px', height:260, borderRadius:20, background:'linear-gradient(90deg,#f0e8e0 25%,#faf5f0 50%,#f0e8e0 75%)', backgroundSize:'200%', animation:'shimmer 1.5s infinite' }} />
                ))}
              </div>
            ) : (
              <div style={{ display:'flex', gap:16, overflowX:'auto', paddingBottom:8, scrollbarWidth:'none' }}>
                {recentProds.map(p => (
                  <div key={p.id || p._id} style={{ flexShrink:0, width:180 }}>
                    <ProductCard product={p} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Order History */}
        {orders.length > 0 && (
          <section style={{ marginBottom:40 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <h2 style={{ margin:0, fontFamily:'"Playfair Display",serif', fontSize:20, fontWeight:700, color:'#231E1B' }}>
                Purchase History
              </h2>
              <button onClick={() => navigate('/orders')} style={{ background:'none', border:'none', color:'#E8633A', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                All Orders <ChevronRight size={14} />
              </button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {orders.slice(0, 4).map(order => (
                <div key={order.id} style={{
                  background:'#fff', border:'1.5px solid #EADFD4', borderRadius:16, padding:'14px 18px',
                  display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10,
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    {/* Thumbnails */}
                    <div style={{ display:'flex', gap:-8 }}>
                      {order.items.slice(0,3).map(({ product: p }, i) => {
                        const src = imgSrc(p);
                        return (
                          <div key={p.id} style={{
                            width:40, height:40, borderRadius:10, background:'#fde8d8',
                            border:'2px solid #fff', marginLeft: i ? -10 : 0, overflow:'hidden',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            zIndex: 3 - i,
                          }}>
                            {src
                              ? <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => e.target.style.display='none'} />
                              : <span style={{ fontSize:14 }}>✨</span>
                            }
                          </div>
                        );
                      })}
                    </div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13, color:'#231E1B' }}>{order.id}</div>
                      <div style={{ fontSize:11, color:'#665D57' }}>
                        {new Date(order.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        · {order.items.length} {order.items.length===1?'item':'items'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                    <span style={{ padding:'3px 12px', borderRadius:20, fontSize:11, fontWeight:700, background:'#e8f5ec', color:'#1e8a4c' }}>
                      {order.status || 'Delivered'}
                    </span>
                    <span style={{ fontWeight:800, fontSize:16, color:'#231E1B' }}>
                      ₹{order.total?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trending / Recommended */}
        {trending.length > 0 && (
          <section>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <Sparkles size={18} color="#E8633A" />
                <h2 style={{ margin:0, fontFamily:'"Playfair Display",serif', fontSize:20, fontWeight:700, color:'#231E1B' }}>
                  Trending Now
                </h2>
              </div>
              <button onClick={() => navigate('/explore?sort=rating')} style={{ background:'none', border:'none', color:'#E8633A', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                See All <ChevronRight size={14} />
              </button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:16 }}>
              {trending.map(p => <ProductCard key={p.id||p._id} product={p} />)}
            </div>
          </section>
        )}
      </div>

      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>
    </div>
  );
}
