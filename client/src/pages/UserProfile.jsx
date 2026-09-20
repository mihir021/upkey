import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip, ResponsiveContainer, Legend,
  XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area,
} from 'recharts';
import { ShoppingBag, Heart, TrendingUp, Award, Package, Edit3 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const PALETTE = ['#E8633A','#8B5E83','#3A7BD5','#27AE60','#F39C12','#E74C3C','#16A085','#8E44AD'];

function imgSrc(p) {
  const cl = p?.cloudinary_link || '';
  return (!cl || cl.endsWith('.glb') || cl.endsWith('.gltf')) ? null : cl;
}

/**
 * StatCard - metric display block with luxury tinted icon backdrop
 */
function StatCard({ icon, label, value, sub, color = '#E8633A', bg = '#fde8d8' }) {
  return (
    <div style={{
      background:'#fff', border:'1.5px solid #EADFD4', borderRadius:20, padding:'20px 22px',
      display:'flex', alignItems:'center', gap:16,
    }}>
      <div style={{ width:52, height:52, borderRadius:16, background: bg, color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize:26, fontWeight:800, color:'#231E1B', lineHeight:1.1 }}>{value}</div>
        <div style={{ fontSize:12, fontWeight:600, color:'#665D57', marginTop:2 }}>{label}</div>
        {sub && <div style={{ fontSize:11, color: color, fontWeight:600, marginTop:2 }}>{sub}</div>}
      </div>
    </div>
  );
}

/**
 * CustomTooltip - extracted outside component to satisfy React Compiler & static component rules
 */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#fff', border:'1.5px solid #EADFD4', borderRadius:12, padding:'10px 14px', boxShadow:'0 4px 20px rgba(0,0,0,.1)' }}>
      <p style={{ margin:'0 0 4px', fontWeight:700, fontSize:12, color:'#231E1B' }}>{label}</p>
      <p style={{ margin:0, fontWeight:800, fontSize:14, color:'#E8633A' }}>₹{Number(payload[0]?.value).toLocaleString('en-IN')}</p>
    </div>
  );
}

export default function UserProfile() {
  const navigate = useNavigate();
  const { user }   = useAuth();
  const { orders, wishlist } = useCart();

  // Stable reference timestamp stored once on mount to avoid impure Date calls during render
  const [referenceTimestamp] = useState(() => Date.now());

  // ── Analytics computations ──────────────────────────────────────────────────
  const totalSpent = useMemo(() =>
    orders.reduce((s, o) => s + (o.total || 0), 0), [orders]);

  const totalItems = useMemo(() =>
    orders.reduce((s, o) => s + o.items.reduce((is, i) => is + i.qty, 0), 0), [orders]);

  const avgOrder = orders.length ? Math.round(totalSpent / orders.length) : 0;

  // Category spending for pie chart
  const categorySpend = useMemo(() => {
    const map = {};
    orders.forEach(o =>
      o.items.forEach(({ product: p, qty }) => {
        const cat = p.category || 'Other';
        map[cat] = (map[cat] || 0) + p.price_inr * qty;
      })
    );
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [orders]);

  // Daily spending for the last 14 days (line chart)
  const dailySpend = useMemo(() => {
    const days = 14;
    const map  = {};
    for (let d = days - 1; d >= 0; d--) {
      const date = new Date(referenceTimestamp - d * 86400000).toLocaleDateString('en-IN', { day:'2-digit', month:'short' });
      map[date] = 0;
    }
    orders.forEach(o => {
      const date = new Date(o.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short' });
      if (map[date] !== undefined) map[date] += o.total || 0;
    });
    return Object.entries(map).map(([date, spend]) => ({ date, spend }));
  }, [orders, referenceTimestamp]);

  // Top categories by order count
  const topCategories = useMemo(() => {
    const map = {};
    orders.forEach(o =>
      o.items.forEach(({ product: p }) => {
        map[p.category] = (map[p.category] || 0) + 1;
      })
    );
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [orders]);

  const joinDate = useMemo(() => {
    const d = new Date(referenceTimestamp);
    d.setMonth(d.getMonth() - 2);
    return d.toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
  }, [referenceTimestamp]);

  return (
    <div style={{ minHeight:'100vh', background:'#FDFBF7', fontFamily:'"Inter",sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 20px 100px' }}>

        {/* Profile Header */}
        <div style={{
          background:'linear-gradient(135deg,#E8633A 0%,#c94f2a 100%)',
          borderRadius:24, padding:'32px 36px', marginBottom:28,
          display:'flex', alignItems:'center', gap:24, flexWrap:'wrap',
          position:'relative', overflow:'hidden',
        }}>
          <div style={{
            position:'absolute', right:-30, top:-30,
            width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,.07)',
          }} />
          <div style={{
            position:'absolute', right:60, bottom:-60,
            width:150, height:150, borderRadius:'50%', background:'rgba(255,255,255,.05)',
          }} />
          <div style={{
            width:80, height:80, borderRadius:'50%',
            background:'rgba(255,255,255,.2)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:32, fontWeight:800, color:'#fff', flexShrink:0,
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex:1 }}>
            <h1 style={{ margin:'0 0 4px', color:'#fff', fontFamily:'"Playfair Display",serif', fontSize:26, fontWeight:800 }}>
              {user?.name || 'Joyory Member'}
            </h1>
            <p style={{ margin:'0 0 8px', color:'rgba(255,255,255,.8)', fontSize:14 }}>{user?.email}</p>
            <p style={{ margin:0, color:'rgba(255,255,255,.65)', fontSize:12 }}>Member since {joinDate}</p>
          </div>
          {topCategories[0] && (
            <div style={{
              background:'rgba(255,255,255,.15)', borderRadius:16, padding:'12px 20px',
              backdropFilter:'blur(10px)', textAlign:'center',
            }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.7)', fontWeight:600, letterSpacing:.5, textTransform:'uppercase', marginBottom:4 }}>Top Category</div>
              <div style={{ fontSize:16, fontWeight:800, color:'#fff' }}>{topCategories[0][0] || '—'}</div>
            </div>
          )}
          <button style={{
            position:'absolute', top:20, right:20,
            background:'rgba(255,255,255,.2)', border:'none', borderRadius:12,
            width:36, height:36, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Edit3 size={16} color="#fff" />
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, marginBottom:28 }}>
          <StatCard icon={<TrendingUp size={22}/>} label="Total Spent" value={`₹${Math.round(totalSpent).toLocaleString('en-IN')}`} color="#E8633A" bg="#fde8d8" />
          <StatCard icon={<Package size={22}/>} label="Total Orders" value={orders.length} color="#3A7BD5" bg="#e8f0fb" />
          <StatCard icon={<ShoppingBag size={22}/>} label="Items Purchased" value={totalItems} color="#27AE60" bg="#e8f5ec" />
          <StatCard icon={<Heart size={22}/>} label="Wishlist Items" value={Object.keys(wishlist).length} color="#8B5E83" bg="#f0e8f5" />
          <StatCard icon={<Award size={22}/>} label="Avg Order Value" value={`₹${avgOrder.toLocaleString('en-IN')}`} color="#F39C12" bg="#fef5e7" />
        </div>

        {/* Charts Row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:28 }} className="charts-grid">

          {/* Spending by Category – Pie */}
          <div style={{ background:'#fff', border:'1.5px solid #EADFD4', borderRadius:24, padding:'22px 20px' }}>
            <h3 style={{ margin:'0 0 4px', fontWeight:800, fontSize:15, color:'#231E1B' }}>Spending by Category</h3>
            <p style={{ margin:'0 0 16px', fontSize:12, color:'#665D57' }}>Percentage of total spend per category</p>
            {categorySpend.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px 0', color:'#EADFD4', fontSize:13 }}>
                Place an order to see your spending breakdown
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={categorySpend} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                    paddingAngle={3} dataKey="value">
                    {categorySpend.map((entry, i) => (
                      <Cell key={entry.name} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <PieTooltip formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Spent']} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Daily Spending – Area/Line */}
          <div style={{ background:'#fff', border:'1.5px solid #EADFD4', borderRadius:24, padding:'22px 20px' }}>
            <h3 style={{ margin:'0 0 4px', fontWeight:800, fontSize:15, color:'#231E1B' }}>Spending Over Time</h3>
            <p style={{ margin:'0 0 16px', fontSize:12, color:'#665D57' }}>Your purchases in the last 14 days</p>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dailySpend}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8633A" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#E8633A" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E8E0" />
                <XAxis dataKey="date" tick={{ fontSize:9, fill:'#665D57' }} tickLine={false} axisLine={false} interval={3} />
                <YAxis tick={{ fontSize:9, fill:'#665D57' }} tickLine={false} axisLine={false}
                  tickFormatter={v => `₹${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="spend" stroke="#E8633A" strokeWidth={2.5}
                  fill="url(#spendGrad)" dot={{ fill:'#E8633A', r:3 }} activeDot={{ r:6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        {orders.length > 0 ? (
          <div style={{ background:'#fff', border:'1.5px solid #EADFD4', borderRadius:24, padding:'22px 22px', marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <h3 style={{ margin:0, fontWeight:800, fontSize:15, color:'#231E1B' }}>Recent Orders</h3>
              <button onClick={() => navigate('/orders')} style={{
                background:'none', border:'none', color:'#E8633A', fontWeight:700, fontSize:13, cursor:'pointer',
              }}>View All →</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {orders.slice(0, 3).map(order => (
                <div key={order.id} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'12px 14px', background:'#F6EFE9', borderRadius:14, flexWrap:'wrap', gap:8,
                }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:'#231E1B' }}>{order.id}</div>
                    <div style={{ fontSize:11, color:'#665D57' }}>
                      {new Date(order.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      · {order.items.length} items
                    </div>
                  </div>
                  <div style={{ fontWeight:800, fontSize:15, color:'#E8633A' }}>
                    ₹{order.total?.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ background:'#fff', border:'1.5px solid #EADFD4', borderRadius:24, padding:'32px 22px', textAlign:'center', marginBottom:20 }}>
            <Package size={42} color="#EADFD4" style={{ margin:'0 auto 12px', display:'block' }} />
            <h3 style={{ margin:'0 0 6px', fontWeight:800, fontSize:16, color:'#231E1B' }}>No orders placed yet</h3>
            <p style={{ margin:'0 0 16px', fontSize:13, color:'#665D57' }}>Your order history and spend analytics will populate here as you order products.</p>
            <button onClick={() => navigate('/shop')} style={{
              padding:'10px 24px', background:'#E8633A', color:'#fff',
              border:'none', borderRadius:24, fontSize:13, fontWeight:700, cursor:'pointer',
            }}>Browse Products →</button>
          </div>
        )}

        {/* Wishlist preview */}
        {Object.values(wishlist).length > 0 && (
          <div style={{ background:'#fff', border:'1.5px solid #EADFD4', borderRadius:24, padding:'22px 22px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <h3 style={{ margin:0, fontWeight:800, fontSize:15, color:'#231E1B' }}>Wishlist Highlights</h3>
              <button onClick={() => navigate('/wishlist')} style={{ background:'none', border:'none', color:'#E8633A', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                View All →
              </button>
            </div>
            <div style={{ display:'flex', gap:12, overflowX:'auto', scrollbarWidth:'none' }}>
              {Object.values(wishlist).slice(0, 6).map(p => {
                const src = imgSrc(p);
                const is3D = Boolean(p?.is_3d || p?.cloudinary_link?.endsWith('.glb'));
                return (
                  <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} style={{
                    flexShrink:0, width:120, cursor:'pointer',
                    background:'#F6EFE9', borderRadius:14, padding:'10px 10px 12px', textAlign:'center',
                    border:'1px solid #EADFD4', transition:'transform .2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform='translateY(-3px)'}
                    onMouseLeave={e => e.currentTarget.style.transform=''}
                  >
                    <div style={{ width:48, height:48, margin:'0 auto 6px', borderRadius:10, overflow:'hidden', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {src ? (
                        <img src={src} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => e.target.style.display='none'} />
                      ) : (
                        <span style={{ fontSize:22 }}>{is3D ? '🧊' : '✨'}</span>
                      )}
                    </div>
                    <div style={{ fontSize:10, fontWeight:600, color:'#231E1B', lineHeight:1.3,
                      display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize:11, fontWeight:800, color:'#E8633A', marginTop:4 }}>
                      ₹{p.price_inr?.toLocaleString('en-IN')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media(max-width:768px){
          .charts-grid { grid-template-columns:1fr !important; }
        }
      `}</style>
    </div>
  );
}
