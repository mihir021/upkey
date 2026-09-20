import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, ShoppingBag, Star, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

const REVIEW_NAMES = ['Priya S.','Anjali M.','Deepika R.','Nisha T.','Kavya K.',
  'Sonal P.','Ritu V.','Meera J.','Neha B.','Aisha K.','Sunita L.','Pooja D.'];
const REVIEW_COMMENTS = {
  Cleanser: [
    'Leaves my face feeling squeaky clean without stripping moisture. Love it!',
    'Gentle yet effective – perfect for my sensitive skin.',
    'Finally a cleanser that doesn\'t make my skin feel tight after washing.',
    'The foam is amazing! Removes all traces of makeup.',
  ],
  Serum: [
    'Noticed a visible difference in my skin texture within 2 weeks!',
    'Lightweight and absorbs quickly. No sticky feeling at all.',
    'My skin looks so much brighter since I started using this.',
    'Worth every rupee. My hyperpigmentation has reduced significantly.',
  ],
  Moisturizer: [
    'Perfect moisture balance for my combination skin. Not greasy at all.',
    'Been using it for 3 months and my skin has never looked better.',
    'The texture is so smooth and luxurious. Skin feels plump all day.',
    'Even my dermatologist was impressed with my skin after using this.',
  ],
  Sunscreen: [
    'No white cast at all! Perfect under makeup.',
    'Lightweight formula that doesn\'t feel heavy on the skin.',
    'Finally found a sunscreen I actually enjoy wearing daily.',
    'Protects well and doesn\'t break me out. 10/10!',
  ],
};
const DEFAULT_COMMENTS = [
  'Great product! Noticed results within 2 weeks.',
  'Highly recommend to anyone with similar skin concerns.',
  'Value for money. Will definitely repurchase.',
  'Gentle formula, no irritation at all.',
];

function generateReviews(product) {
  const seed = product.id?.charCodeAt(1) || 3;
  const count = 3 + (seed % 3);
  const comments = REVIEW_COMMENTS[product.category] || DEFAULT_COMMENTS;
  return Array.from({ length: count }, (_, i) => {
    const nameIdx = (seed + i * 7) % REVIEW_NAMES.length;
    const commentIdx = (seed + i * 3) % comments.length;
    const ratingDelta = ((seed + i) % 3) - 1;
    const rating = Math.min(5, Math.max(3, Math.round(product.rating) + ratingDelta));
    const daysAgo = 5 + ((seed * (i + 1)) % 60);
    const date = new Date(Date.now() - daysAgo * 86400000).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
    return { name: REVIEW_NAMES[nameIdx], rating, comment: comments[commentIdx], date, verified: i < 2 };
  });
}

function imgSrc(p) {
  const cl = p?.cloudinary_link || '';
  return (!cl || cl.endsWith('.glb') || cl.endsWith('.gltf')) ? null : cl;
}

export default function ProductDetail() {
  const { id }  = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, inWishlist, inCart, viewProduct } = useCart();

  const [product, setProduct]   = useState(null);
  const [recs, setRecs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('description');
  const [qty, setQty]           = useState(1);
  const [added, setAdded]       = useState(false);
  const [copied, setCopied]     = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Fetch product details and recommendations asynchronously
    Promise.all([
      api.get(`/products/${id}`),
      api.get(`/products/${id}/recommendations`),
    ])
      .then(([pRes, rRes]) => {
        if (!isMounted) return;
        setProduct(pRes.data);
        setRecs(rRes.data || []);
        viewProduct(id);
      })
      .catch((err) => {
        console.error('Product fetch error:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, viewProduct]);

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#FDFBF7' }}>
      <Navbar />
      <div style={{ maxWidth:1100, margin:'40px auto', padding:'0 20px', display:'flex', gap:40 }}>
        {[1,2].map(i => (
          <div key={i} style={{ flex:1, height:400, borderRadius:20, background:'linear-gradient(90deg,#f0e8e0 25%,#faf5f0 50%,#f0e8e0 75%)', backgroundSize:'200%', animation:'shimmer 1.5s infinite' }} />
        ))}
      </div>
    </div>
  );

  if (!product) return (
    <div style={{ minHeight:'100vh', background:'#FDFBF7' }}>
      <Navbar />
      <div style={{ textAlign:'center', padding:80 }}>
        <span style={{ fontSize:40 }}>😕</span>
        <p style={{ fontWeight:700, fontSize:18 }}>Product not found</p>
        <button onClick={() => navigate('/shop')} style={{ padding:'10px 24px', background:'#E8633A', color:'#fff', border:'none', borderRadius:24, cursor:'pointer', fontWeight:700, marginTop:12 }}>
          Back to Shop
        </button>
      </div>
    </div>
  );

  const wished  = inWishlist(product.id);
  const carted  = inCart(product.id);
  const src     = imgSrc(product);
  const reviews = generateReviews(product);
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  function handleAddToCart() {
    for (let i = 0; i < qty; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const CATEGORY_BG = {
    Cleanser:'linear-gradient(135deg,#fde8d8,#f6d0be)',
    Serum:'linear-gradient(135deg,#e5d8f5,#d0bfee)',
    Moisturizer:'linear-gradient(135deg,#d8f0e5,#bce8d0)',
    Sunscreen:'linear-gradient(135deg,#fdf0d8,#fae0b0)',
  };
  const imgBg = CATEGORY_BG[product.category] || 'linear-gradient(135deg,#f6efe9,#eadfd4)';

  return (
    <div style={{ minHeight:'100vh', background:'#FDFBF7', fontFamily:'"Inter",sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 20px 100px' }}>
        {/* Breadcrumb */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20, flexWrap:'wrap' }}>
          <button onClick={() => navigate('/shop')} style={{ background:'none', border:'none', color:'#665D57', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:4 }}>
            <ArrowLeft size={14} /> Shop
          </button>
          <span style={{ color:'#EADFD4' }}>/</span>
          <button onClick={() => navigate(`/explore?category=${product.category}`)} style={{ background:'none', border:'none', color:'#665D57', cursor:'pointer', fontSize:13 }}>
            {product.category}
          </button>
          <span style={{ color:'#EADFD4' }}>/</span>
          <span style={{ fontSize:13, color:'#231E1B', fontWeight:600 }}>{product.name}</span>
        </div>

        {/* Main content */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:40, alignItems:'start' }} className="product-grid">
          {/* Image panel */}
          <div style={{ borderRadius:24, overflow:'hidden', background: imgBg, height:420, position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {src ? (
              <img src={src} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                onError={e => { e.target.style.display='none'; }} />
            ) : (
              <div style={{ textAlign:'center' }}>
                <span style={{ fontSize:80 }}>✨</span>
                <p style={{ color:'#665D57', fontWeight:600, margin:8 }}>{product.category}</p>
              </div>
            )}
            {/* Overlay buttons */}
            <button onClick={() => toggleWishlist(product)} style={{
              position:'absolute', top:16, right:16,
              width:44, height:44, borderRadius:'50%',
              background: wished ? '#E8633A' : 'rgba(255,255,255,.9)',
              border:'none', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 2px 12px rgba(0,0,0,.15)',
              transition:'all .2s',
            }}>
              <Heart size={18} fill={wished ? '#fff' : 'none'} color={wished ? '#fff' : '#E8633A'} />
            </button>
            <button onClick={handleShare} style={{
              position:'absolute', top:68, right:16,
              width:44, height:44, borderRadius:'50%',
              background:'rgba(255,255,255,.9)',
              border:'none', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 2px 12px rgba(0,0,0,.15)',
            }}>
              {copied ? <CheckCircle size={18} color="#27AE60" /> : <Share2 size={18} color="#665D57" />}
            </button>
            {/* Budget badge */}
            {product.budget_tier && (
              <span style={{
                position:'absolute', bottom:16, left:16,
                background:'rgba(255,255,255,.9)', color:'#665D57',
                padding:'4px 14px', borderRadius:20, fontSize:11, fontWeight:700,
              }}>
                {product.budget_tier}
              </span>
            )}
          </div>

          {/* Info panel */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <span style={{ fontSize:11, color:'#E8633A', fontWeight:700, letterSpacing:1, textTransform:'uppercase' }}>
                {product.brand}
              </span>
              <h1 style={{ margin:'6px 0 0', fontSize:'clamp(20px,3vw,28px)', fontWeight:800, color:'#231E1B', lineHeight:1.2, fontFamily:'"Playfair Display",serif' }}>
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ display:'flex', gap:3 }}>
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={18}
                    fill={s <= Math.round(parseFloat(avgRating)) ? '#E8633A' : '#EADFD4'}
                    color={s <= Math.round(parseFloat(avgRating)) ? '#E8633A' : '#EADFD4'}
                  />
                ))}
              </div>
              <span style={{ fontWeight:700, color:'#231E1B' }}>{avgRating}</span>
              <span style={{ color:'#665D57', fontSize:13 }}>({reviews.length} reviews)</span>
            </div>

            {/* Price */}
            <div style={{ display:'flex', alignItems:'baseline', gap:12 }}>
              <span style={{ fontSize:32, fontWeight:800, color:'#231E1B' }}>
                ₹{product.price_inr?.toLocaleString('en-IN')}
              </span>
              {product.budget_tier === 'Budget' && (
                <span style={{ fontSize:13, color:'#27AE60', fontWeight:600, background:'#e8f5ec', padding:'3px 10px', borderRadius:20 }}>
                  Great Value
                </span>
              )}
            </div>

            {/* Tags */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {product.skin_types?.map(st => (
                <span key={st} style={{ padding:'4px 12px', background:'#F6EFE9', color:'#665D57', borderRadius:20, fontSize:12, fontWeight:600, border:'1px solid #EADFD4' }}>
                  {st}
                </span>
              ))}
              {product.concerns_list?.slice(0,3).map(c => (
                <span key={c} style={{ padding:'4px 12px', background:'#fde8d8', color:'#E8633A', borderRadius:20, fontSize:12, fontWeight:600 }}>
                  {c}
                </span>
              ))}
            </div>

            {/* Quantity + Actions */}
            <div style={{ display:'flex', alignItems:'center', gap:16, marginTop:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:0, background:'#F6EFE9', borderRadius:28, overflow:'hidden', border:'1.5px solid #EADFD4' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{
                  width:40, height:44, background:'none', border:'none', cursor:'pointer',
                  fontSize:20, color:'#E8633A', fontWeight:700,
                }}>−</button>
                <span style={{ width:36, textAlign:'center', fontWeight:700, fontSize:15, color:'#231E1B' }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{
                  width:40, height:44, background:'none', border:'none', cursor:'pointer',
                  fontSize:20, color:'#E8633A', fontWeight:700,
                }}>+</button>
              </div>

              <button onClick={handleAddToCart} style={{
                flex:1, padding:'12px 24px',
                background: added ? '#27AE60' : '#E8633A',
                color:'#fff', border:'none', borderRadius:28,
                fontSize:15, fontWeight:700, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                transition:'all .2s',
                boxShadow: added ? '0 4px 16px rgba(39,174,96,.35)' : '0 4px 16px rgba(232,99,58,.35)',
              }}>
                {added ? <><CheckCircle size={18} /> Added to Cart!</> : <><ShoppingBag size={18} /> Add to Cart</>}
              </button>
            </div>

            {carted && (
              <button onClick={() => navigate('/cart')} style={{
                padding:'10px 0', background:'transparent', border:'1.5px solid #E8633A',
                color:'#E8633A', borderRadius:28, fontSize:14, fontWeight:700, cursor:'pointer',
              }}>
                View Cart →
              </button>
            )}

            {/* Quick stats */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:4 }}>
              {[
                { label:'Skin Tone', value: product.skin_tone || 'All' },
                { label:'Category', value: product.category },
              ].map(item => (
                <div key={item.label} style={{ background:'#F6EFE9', borderRadius:12, padding:'10px 14px', border:'1px solid #EADFD4' }}>
                  <div style={{ fontSize:10, color:'#665D57', fontWeight:700, letterSpacing:.5, textTransform:'uppercase' }}>{item.label}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#231E1B', marginTop:2 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginTop:40, borderBottom:'2px solid #EADFD4', display:'flex', gap:0 }}>
          {['description','ingredients','reviews'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:'12px 24px', background:'none', border:'none',
              fontSize:14, fontWeight:600, cursor:'pointer', textTransform:'capitalize',
              color: tab === t ? '#E8633A' : '#665D57',
              borderBottom: tab === t ? '3px solid #E8633A' : '3px solid transparent',
              marginBottom:-2, transition:'all .15s',
            }}>{t === 'ingredients' ? 'Ingredients' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>

        <div style={{ padding:'28px 0 0' }}>
          {tab === 'description' && (
            <div style={{ maxWidth:680 }}>
              <h3 style={{ margin:'0 0 12px', color:'#231E1B', fontSize:16, fontWeight:700 }}>About this Product</h3>
              <p style={{ color:'#665D57', lineHeight:1.75, fontSize:14.5, margin:'0 0 20px' }}>
                Introducing the <strong>{product.name}</strong> by <strong>{product.brand}</strong> — a {product.budget_tier?.toLowerCase()} {product.category?.toLowerCase()} crafted for {product.skin_types?.join(' and ')} skin types. 
                Formulated to address {product.concerns_list?.join(', ')}, this product delivers visible results with regular use.
                Suitable for all skin tones, it fits seamlessly into any skincare routine.
              </p>
              <h4 style={{ margin:'0 0 10px', color:'#231E1B', fontSize:14, fontWeight:700 }}>Key Benefits</h4>
              <ul style={{ color:'#665D57', lineHeight:2, fontSize:14, paddingLeft:20 }}>
                {product.concerns_list?.map(c => <li key={c}>Addresses {c}</li>)}
                <li>Suitable for {product.skin_types?.join(' & ')} skin</li>
                <li>Powered by {product.ingredients_list?.slice(0,2).join(' & ')}</li>
              </ul>
            </div>
          )}

          {tab === 'ingredients' && (
            <div style={{ maxWidth:680 }}>
              <h3 style={{ margin:'0 0 16px', color:'#231E1B', fontSize:16, fontWeight:700 }}>Key Ingredients</h3>
              <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:24 }}>
                {product.ingredients_list?.map(ing => (
                  <div key={ing} style={{
                    padding:'10px 16px', background:'#fff', border:'1.5px solid #EADFD4',
                    borderRadius:14, fontSize:13, fontWeight:600, color:'#231E1B',
                  }}>
                    🌿 {ing}
                  </div>
                ))}
              </div>
              <p style={{ color:'#665D57', fontSize:13, lineHeight:1.7 }}>
                All ingredients are carefully sourced and tested for efficacy. This product is dermatologically tested and suitable for daily use.
              </p>
            </div>
          )}

          {tab === 'reviews' && (
            <div style={{ maxWidth:720 }}>
              <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:24, background:'#F6EFE9', borderRadius:16, padding:'16px 20px' }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:40, fontWeight:800, color:'#E8633A' }}>{avgRating}</div>
                  <div style={{ display:'flex', gap:3, justifyContent:'center', marginTop:4 }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={14} fill={s <= Math.round(parseFloat(avgRating)) ? '#E8633A' : '#EADFD4'} color={s <= Math.round(parseFloat(avgRating)) ? '#E8633A' : '#EADFD4'} />
                    ))}
                  </div>
                  <div style={{ fontSize:12, color:'#665D57', marginTop:4 }}>{reviews.length} reviews</div>
                </div>
                <div style={{ flex:1 }}>
                  {[5,4,3,2,1].map(s => {
                    const cnt = reviews.filter(r => r.rating === s).length;
                    return (
                      <div key={s} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                        <span style={{ fontSize:11, color:'#665D57', width:8 }}>{s}</span>
                        <Star size={10} fill="#E8633A" color="#E8633A" />
                        <div style={{ flex:1, height:6, background:'#EADFD4', borderRadius:3, overflow:'hidden' }}>
                          <div style={{ width:`${(cnt/reviews.length)*100}%`, height:'100%', background:'#E8633A', borderRadius:3 }} />
                        </div>
                        <span style={{ fontSize:11, color:'#665D57', width:16 }}>{cnt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {reviews.map((rev, i) => (
                <div key={i} style={{
                  background:'#fff', border:'1.5px solid #EADFD4', borderRadius:16,
                  padding:'16px 18px', marginBottom:12,
                }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{
                        width:36, height:36, borderRadius:'50%',
                        background:'linear-gradient(135deg,#E8633A,#c94f2a)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        color:'#fff', fontWeight:700, fontSize:14,
                      }}>
                        {rev.name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:13, color:'#231E1B' }}>{rev.name}</div>
                        {rev.verified && (
                          <div style={{ fontSize:10, color:'#27AE60', fontWeight:600, display:'flex', alignItems:'center', gap:3 }}>
                            <CheckCircle size={10} /> Verified Purchase
                          </div>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize:12, color:'#665D57' }}>{rev.date}</span>
                  </div>
                  <div style={{ display:'flex', gap:3, marginBottom:8 }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={13} fill={s <= rev.rating ? '#E8633A' : '#EADFD4'} color={s <= rev.rating ? '#E8633A' : '#EADFD4'} />
                    ))}
                  </div>
                  <p style={{ fontSize:13.5, color:'#665D57', margin:0, lineHeight:1.65 }}>{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations */}
        {recs.length > 0 && (
          <div style={{ marginTop:56 }}>
            <h2 style={{ margin:'0 0 20px', fontFamily:'"Playfair Display",serif', fontSize:22, fontWeight:700, color:'#231E1B' }}>
              You May Also Like
            </h2>
            <div style={{ display:'flex', gap:16, overflowX:'auto', paddingBottom:8, scrollbarWidth:'none' }}>
              {recs.map(p => (
                <div key={p.id||p._id} style={{ flexShrink:0, width:190 }}>
                  <ProductCard product={p} size="sm" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @media(max-width:768px){
          .product-grid { grid-template-columns:1fr !important; }
        }
      `}</style>
    </div>
  );
}
