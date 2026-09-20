import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  Delivered:  { bg:'#e8f5ec', color:'#1e8a4c' },
  Processing: { bg:'#fde8d8', color:'#E8633A' },
  Shipped:    { bg:'#e8f0fb', color:'#3A7BD5' },
};

function imgSrc(p) {
  const cl = p?.cloudinary_link || '';
  return (!cl || cl.endsWith('.glb') || cl.endsWith('.gltf')) ? null : cl;
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const { isAuthenticated, requireAuth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requireAuth('view your orders')) return;

    api.get('/orders')
      .then(res => setOrders(res.data))
      .catch(err => console.error('Error fetching orders:', err))
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate, requireAuth]);

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#FDFBF7', fontFamily:'"Inter",sans-serif' }}>
      <Navbar />
      <div style={{ display:'flex', justifyContent:'center', padding:'100px' }}>
        <Loader2 size={32} color="#E8633A" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    </div>
  );

  if (!orders.length) return (
    <div style={{ minHeight:'100vh', background:'#FDFBF7', fontFamily:'"Inter",sans-serif' }}>
      <Navbar />
      <div style={{ textAlign:'center', padding:'80px 20px', maxWidth:400, margin:'0 auto' }}>
        <Package size={64} color="#EADFD4" style={{ margin:'0 auto 24px', display:'block' }} />
        <h2 style={{ fontFamily:'"Playfair Display",serif', fontSize:24, fontWeight:800, color:'#231E1B', margin:'0 0 10px' }}>No orders yet</h2>
        <p style={{ color:'#665D57', margin:'0 0 28px' }}>Place your first order and it'll appear here.</p>
        <button onClick={() => navigate('/shop')} style={{
          padding:'12px 36px', background:'#E8633A', color:'#fff',
          border:'none', borderRadius:28, fontSize:15, fontWeight:700, cursor:'pointer',
          display:'inline-flex', alignItems:'center', gap:8,
        }}>
          <ShoppingBag size={18} /> Start Shopping
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#FDFBF7', fontFamily:'"Inter",sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth:800, margin:'0 auto', padding:'32px 20px 100px' }}>
        <h1 style={{ margin:'0 0 24px', fontFamily:'"Playfair Display",serif', fontSize:28, fontWeight:800, color:'#231E1B' }}>My Orders</h1>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {orders.map(order => {
            const sc = STATUS_COLORS[order.status] || STATUS_COLORS.Delivered;
            return (
              <div key={order.id} style={{ background:'#fff', border:'1.5px solid #EADFD4', borderRadius:20, padding:'20px 22px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:8 }}>
                  <div>
                    <span style={{ fontWeight:700, fontSize:15, color:'#231E1B' }}>{order.id}</span>
                    <span style={{ marginLeft:12, fontSize:12, color:'#665D57' }}>
                      {new Date(order.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </span>
                  </div>
                  <span style={{ padding:'4px 14px', borderRadius:20, fontSize:12, fontWeight:700, background: sc.bg, color: sc.color }}>
                    {order.status}
                  </span>
                </div>

                {/* Items */}
                <div style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:12, scrollbarWidth:'none', flexWrap:'wrap' }}>
                  {order.items.map(({ product: p, qty }) => {
                    const src = imgSrc(p);
                    return (
                      <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, background:'#F6EFE9', borderRadius:12, padding:'8px 12px', flexShrink:0 }}>
                        <div style={{ width:40, height:40, borderRadius:8, overflow:'hidden', background:'#fde8d8', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          {src
                            ? <img src={src} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => e.target.style.display='none'} />
                            : <span style={{ fontSize:16 }}>✨</span>
                          }
                        </div>
                        <div>
                          <div style={{ fontSize:12, fontWeight:700, color:'#231E1B', maxWidth:130, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
                          <div style={{ fontSize:11, color:'#665D57' }}>Qty: {qty} · ₹{(p.price_inr * qty).toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ borderTop:'1px solid #EADFD4', marginTop:4, paddingTop:12, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:13, color:'#665D57' }}>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                  <span style={{ fontWeight:800, fontSize:16, color:'#231E1B' }}>
                    Total: ₹{order.total?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
