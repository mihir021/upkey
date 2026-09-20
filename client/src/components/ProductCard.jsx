import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

function imgSrc(product) {
  const cl = product?.cloudinary_link || '';
  if (!cl || cl.endsWith('.glb') || cl.endsWith('.gltf')) return null;
  return cl;
}

const CATEGORY_GRADIENTS = {
  Cleanser:      'linear-gradient(135deg,#fde8d8,#f6d0be)',
  Toner:         'linear-gradient(135deg,#dce8f5,#c5d9f0)',
  Serum:         'linear-gradient(135deg,#e5d8f5,#d0bfee)',
  Moisturizer:   'linear-gradient(135deg,#d8f0e5,#bce8d0)',
  Sunscreen:     'linear-gradient(135deg,#fdf0d8,#fae0b0)',
  Foundation:    'linear-gradient(135deg,#f5e0d8,#eeccbe)',
  Concealer:     'linear-gradient(135deg,#f5ead8,#eedd bb)',
  Blush:         'linear-gradient(135deg,#f5d8e8,#eec0d5)',
  Lipstick:      'linear-gradient(135deg,#f5d8d8,#eebebe)',
  'Lip Balm':    'linear-gradient(135deg,#fde8e8,#fad0d0)',
  Mascara:       'linear-gradient(135deg,#d8d8f5,#bebee8)',
  Eyeliner:      'linear-gradient(135deg,#d8e0f5,#becee8)',
  'Face Mask':   'linear-gradient(135deg,#d8f5ec,#bee8d8)',
  Exfoliator:    'linear-gradient(135deg,#f5f0d8,#e8e0be)',
  'Under-eye Cream': 'linear-gradient(135deg,#e8d8f5,#d0bfe8)',
  'Body Lotion': 'linear-gradient(135deg,#d8f5f0,#bee8e0)',
};

export default function ProductCard({ product, size = 'md' }) {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, inWishlist, inCart } = useCart();
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const wished  = inWishlist(product.id);
  const carted  = inCart(product.id);
  const src     = imgSrc(product);
  const bg      = CATEGORY_GRADIENTS[product.category] || 'linear-gradient(135deg,#f6efe9,#eadfd4)';

  function handleCart(e) {
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleWish(e) {
    e.stopPropagation();
    toggleWishlist(product);
  }

  const isSmall = size === 'sm';

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      style={{
        background: '#fff',
        borderRadius: isSmall ? 16 : 20,
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1.5px solid #EADFD4',
        boxShadow: '0 2px 12px rgba(35,30,27,0.06)',
        transition: 'transform .2s, box-shadow .2s',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 10px 32px rgba(35,30,27,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(35,30,27,0.06)';
      }}
    >
      {/* Image */}
      <div style={{
        background: bg,
        height: isSmall ? 140 : 180,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {src ? (
          <img
            src={src}
            alt={product.name}
            style={{ width:'100%', height:'100%', objectFit:'cover' }}
            onError={e => { e.target.style.display='none'; }}
          />
        ) : (
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'center',
            height:'100%', flexDirection:'column', gap:8,
          }}>
            <span style={{ fontSize: isSmall ? 32 : 40 }}>✨</span>
            <span style={{ fontSize:11, color:'#665D57', fontWeight:600, letterSpacing:.5 }}>
              {product.category}
            </span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWish}
          style={{
            position:'absolute', top:10, right:10,
            width:32, height:32, borderRadius:'50%',
            background: wished ? '#E8633A' : 'rgba(255,255,255,0.9)',
            border: 'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 2px 8px rgba(0,0,0,.15)',
            transition:'all .2s',
          }}
        >
          <Heart size={15} fill={wished ? '#fff' : 'none'} color={wished ? '#fff' : '#E8633A'} />
        </button>

        {/* Budget tag */}
        {product.budget_tier && (
          <span style={{
            position:'absolute', top:10, left:10,
            background:'rgba(255,255,255,0.9)',
            color:'#665D57', fontSize:10, fontWeight:700,
            padding:'2px 8px', borderRadius:20, letterSpacing:.5,
          }}>
            {product.budget_tier}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: isSmall ? '10px 12px 12px' : '12px 14px 14px', flex:1, display:'flex', flexDirection:'column', gap:4 }}>
        <span style={{ fontSize:10, color:'#E8633A', fontWeight:700, letterSpacing:.8, textTransform:'uppercase' }}>
          {product.brand}
        </span>
        <span style={{
          fontSize: isSmall ? 12 : 13, fontWeight:600, color:'#231E1B',
          lineHeight: 1.35, display:'-webkit-box', WebkitLineClamp:2,
          WebkitBoxOrient:'vertical', overflow:'hidden',
        }}>
          {product.name}
        </span>

        <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:2 }}>
          {[1,2,3,4,5].map(s => (
            <Star key={s} size={11}
              fill={s <= Math.round(product.rating) ? '#E8633A' : '#EADFD4'}
              color={s <= Math.round(product.rating) ? '#E8633A' : '#EADFD4'}
            />
          ))}
          <span style={{ fontSize:10, color:'#665D57' }}>{product.rating?.toFixed(1)}</span>
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto', paddingTop:8 }}>
          <span style={{ fontWeight:800, color:'#231E1B', fontSize: isSmall ? 14 : 16 }}>
            ₹{product.price_inr?.toLocaleString('en-IN')}
          </span>
          <button
            onClick={handleCart}
            style={{
              background: added ? '#27AE60' : carted ? '#f6efe9' : '#E8633A',
              color: carted && !added ? '#E8633A' : '#fff',
              border: carted && !added ? '1.5px solid #E8633A' : 'none',
              borderRadius:12,
              padding:'6px 12px',
              fontSize:11, fontWeight:700, cursor:'pointer',
              display:'flex', alignItems:'center', gap:5,
              transition:'all .2s',
            }}
          >
            <ShoppingBag size={12} />
            {added ? 'Added!' : carted ? 'In Cart' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
