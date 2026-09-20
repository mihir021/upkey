import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Heart, ShoppingBag, Tag, CheckCircle, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

const PROMO_CODES = { JOYORY10:'10', GLOW20:'20', FIRST15:'15' };

function imgSrc(p) {
  const cl = p?.cloudinary_link || '';
  return (!cl || cl.endsWith('.glb') || cl.endsWith('.gltf')) ? null : cl;
}

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQty, toggleWishlist, inWishlist, placeOrder, cartTotal } = useCart();
  const [promo, setPromo]     = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoError, setPromoError]     = useState('');
  const [ordered, setOrdered] = useState(false);

  const items = Object.values(cart);
  const discount = promoApplied ? (cartTotal * Number(promoApplied.pct)) / 100 : 0;
  const delivery = cartTotal > 999 ? 0 : 49;
  const total = cartTotal - discount + delivery;

  function applyPromo() {
    const code = promo.trim().toUpperCase();
    const pct  = PROMO_CODES[code];
    if (pct) {
      setPromoApplied({ code, pct });
      setPromoError('');
    } else {
      setPromoApplied(null);
      setPromoError('Invalid promo code.');
    }
  }

  function handleCheckout() {
    placeOrder();
    setOrdered(true);
  }

  if (ordered) return (
    <div style={{ minHeight:'100vh', background:'#FDFBF7', fontFamily:'"Inter",sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth:500, margin:'80px auto', textAlign:'center', padding:'0 20px' }}>
        <div style={{
          width:100, height:100, borderRadius:'50%',
          background:'linear-gradient(135deg,#27AE60,#1e8a4c)',
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 24px',
        }}>
          <CheckCircle size={48} color="#fff" />
        </div>
        <h1 style={{ fontFamily:'"Playfair Display",serif', fontSize:28, fontWeight:800, color:'#231E1B', margin:'0 0 12px' }}>
          Order Placed! 🎉
        </h1>
        <p style={{ color:'#665D57', fontSize:15, lineHeight:1.7, margin:'0 0 32px' }}>
          Your order has been successfully placed. Thank you for shopping at Joyory!
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <button onClick={() => navigate('/orders')} style={{
            padding:'14px 0', background:'#E8633A', color:'#fff',
            border:'none', borderRadius:28, fontSize:15, fontWeight:700, cursor:'pointer',
          }}>
            View My Orders
          </button>
          <button onClick={() => { setOrdered(false); navigate('/shop'); }} style={{
            padding:'14px 0', background:'transparent', border:'1.5px solid #EADFD4',
            color:'#231E1B', borderRadius:28, fontSize:15, fontWeight:600, cursor:'pointer',
          }}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );

  if (!items.length) return (
    <div style={{ minHeight:'100vh', background:'#FDFBF7', fontFamily:'"Inter",sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth:500, margin:'80px auto', textAlign:'center', padding:'0 20px' }}>
        <span style={{ fontSize:64 }}>🛍️</span>
        <h2 style={{ fontFamily:'"Playfair Display",serif', fontSize:26, fontWeight:800, color:'#231E1B', margin:'16px 0 10px' }}>
          Your cart is empty
        </h2>
        <p style={{ color:'#665D57', fontSize:14, margin:'0 0 28px' }}>
          Add some Joyory favourites to get started!
        </p>
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

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 20px 100px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
          <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6, color:'#665D57', fontSize:14 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 style={{ margin:0, fontFamily:'"Playfair Display",serif', fontSize:26, fontWeight:800, color:'#231E1B' }}>
            My Cart <span style={{ fontSize:16, color:'#665D57', fontWeight:500 }}>({items.length} {items.length === 1 ? 'item' : 'items'})</span>
          </h1>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:24, alignItems:'start' }} className="cart-grid">
          {/* Items */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {items.map(({ product: p, qty }) => {
              const src = imgSrc(p);
              return (
                <div key={p.id} style={{
                  background:'#fff', border:'1.5px solid #EADFD4', borderRadius:20,
                  padding:'16px 18px', display:'flex', gap:16, alignItems:'center',
                }}>
                  {/* Image */}
                  <div onClick={() => navigate(`/product/${p.id}`)} style={{
                    width:80, height:80, borderRadius:14, overflow:'hidden', flexShrink:0,
                    background:'linear-gradient(135deg,#fde8d8,#f6d0be)', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    {src
                      ? <img src={src} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => e.target.style.display='none'} />
                      : <span style={{ fontSize:28 }}>✨</span>
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:10, color:'#E8633A', fontWeight:700, letterSpacing:.8, textTransform:'uppercase' }}>{p.brand}</div>
                    <div style={{ fontWeight:700, fontSize:14, color:'#231E1B', margin:'3px 0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</div>
                    <div style={{ display:'flex', gap:3 }}>
                      {[1,2,3,4,5].map(s => (
                        <svg key={s} width={11} height={11} viewBox="0 0 24 24" fill={s <= Math.round(p.rating) ? '#E8633A' : '#EADFD4'}>
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                        </svg>
                      ))}
                    </div>
                    <div style={{ fontWeight:800, fontSize:16, color:'#231E1B', marginTop:4 }}>
                      ₹{(p.price_inr * qty).toLocaleString('en-IN')}
                      <span style={{ fontSize:12, fontWeight:500, color:'#665D57' }}> (₹{p.price_inr?.toLocaleString('en-IN')} each)</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10, flexShrink:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:0, background:'#F6EFE9', borderRadius:24, border:'1px solid #EADFD4' }}>
                      <button onClick={() => updateQty(p.id, -1)} style={{ width:32, height:32, background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#E8633A', fontWeight:700 }}>−</button>
                      <span style={{ width:28, textAlign:'center', fontSize:14, fontWeight:700, color:'#231E1B' }}>{qty}</span>
                      <button onClick={() => updateQty(p.id,  1)} style={{ width:32, height:32, background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#E8633A', fontWeight:700 }}>+</button>
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => toggleWishlist(p)} title="Save for later" style={{
                        width:30, height:30, borderRadius:'50%', border:'1px solid #EADFD4',
                        background: inWishlist(p.id) ? '#fde8d8' : '#fff', cursor:'pointer',
                        display:'flex', alignItems:'center', justifyContent:'center',
                      }}>
                        <Heart size={13} fill={inWishlist(p.id) ? '#E8633A' : 'none'} color="#E8633A" />
                      </button>
                      <button onClick={() => removeFromCart(p.id)} title="Remove" style={{
                        width:30, height:30, borderRadius:'50%', border:'1px solid #EADFD4',
                        background:'#fff', cursor:'pointer',
                        display:'flex', alignItems:'center', justifyContent:'center',
                      }}>
                        <Trash2 size={13} color="#c94f2a" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div style={{ background:'#fff', border:'1.5px solid #EADFD4', borderRadius:24, padding:24, position:'sticky', top:84 }}>
            <h3 style={{ margin:'0 0 20px', fontSize:17, fontWeight:700, color:'#231E1B' }}>Order Summary</h3>

            {/* Promo Code */}
            <div style={{ marginBottom:20 }}>
              <div style={{ display:'flex', gap:8 }}>
                <div style={{ flex:1, display:'flex', alignItems:'center', gap:8, background:'#F6EFE9', borderRadius:20, padding:'8px 14px', border:'1px solid #EADFD4' }}>
                  <Tag size={14} color="#665D57" />
                  <input value={promo} onChange={e => { setPromo(e.target.value); setPromoError(''); }}
                    placeholder="Promo code"
                    style={{ border:'none', background:'transparent', outline:'none', fontSize:13, fontFamily:'inherit', flex:1 }}
                  />
                </div>
                <button onClick={applyPromo} style={{
                  padding:'8px 16px', background:'#E8633A', color:'#fff',
                  border:'none', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer',
                }}>Apply</button>
              </div>
              {promoApplied && (
                <p style={{ margin:'6px 0 0', fontSize:12, color:'#27AE60', fontWeight:600 }}>
                  ✓ {promoApplied.code} applied — {promoApplied.pct}% off!
                </p>
              )}
              {promoError && (
                <p style={{ margin:'6px 0 0', fontSize:12, color:'#c94f2a', fontWeight:600 }}>{promoError}</p>
              )}
              <p style={{ margin:'8px 0 0', fontSize:11, color:'#665D57' }}>Try: JOYORY10 · GLOW20 · FIRST15</p>
            </div>

            {/* Line items */}
            {[
              { label:'Subtotal', val: `₹${cartTotal.toLocaleString('en-IN')}` },
              ...(discount ? [{ label:`Discount (${promoApplied.pct}%)`, val:`-₹${discount.toLocaleString('en-IN')}`, green:true }] : []),
              { label:`Delivery${delivery === 0 ? ' (Free)' : ''}`, val: delivery === 0 ? 'FREE' : `₹${delivery}`, green: delivery === 0 },
            ].map(row => (
              <div key={row.label} style={{ display:'flex', justifyContent:'space-between', marginBottom:10, fontSize:13.5 }}>
                <span style={{ color:'#665D57' }}>{row.label}</span>
                <span style={{ fontWeight:700, color: row.green ? '#27AE60' : '#231E1B' }}>{row.val}</span>
              </div>
            ))}

            <hr style={{ border:'none', borderTop:'1.5px solid #EADFD4', margin:'12px 0' }} />
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:17, fontWeight:800, color:'#231E1B', marginBottom:20 }}>
              <span>Total</span>
              <span>₹{Math.round(total).toLocaleString('en-IN')}</span>
            </div>

            <button onClick={handleCheckout} style={{
              width:'100%', padding:'14px 0',
              background:'linear-gradient(135deg,#E8633A,#c94f2a)',
              color:'#fff', border:'none', borderRadius:28,
              fontSize:15, fontWeight:700, cursor:'pointer',
              boxShadow:'0 6px 20px rgba(232,99,58,.35)',
            }}>
              Buy Now
            </button>
            {cartTotal < 999 && (
              <p style={{ textAlign:'center', margin:'10px 0 0', fontSize:12, color:'#665D57' }}>
                Add ₹{(999 - cartTotal).toLocaleString('en-IN')} more for free delivery
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          .cart-grid { grid-template-columns:1fr !important; }
        }
      `}</style>
    </div>
  );
}
