import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const items = Object.values(wishlist);

  return (
    <div style={{ minHeight:'100vh', background:'#FDFBF7', fontFamily:'"Inter",sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'32px 20px 100px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
          <div>
            <h1 style={{ margin:'0 0 4px', fontFamily:'"Playfair Display",serif', fontSize:28, fontWeight:800, color:'#231E1B' }}>
              My Wishlist
            </h1>
            <p style={{ margin:0, color:'#665D57', fontSize:14 }}>
              {items.length === 0 ? 'Save products you love' : `${items.length} saved ${items.length === 1 ? 'product' : 'products'}`}
            </p>
          </div>
          {items.length > 0 && (
            <button onClick={() => { items.forEach(p => addToCart(p)); }} style={{
              padding:'10px 24px', background:'#E8633A', color:'#fff',
              border:'none', borderRadius:24, fontSize:13, fontWeight:700, cursor:'pointer',
              display:'flex', alignItems:'center', gap:8,
            }}>
              <ShoppingBag size={15} /> Add All to Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 20px' }}>
            <div style={{
              width:100, height:100, borderRadius:'50%',
              background:'linear-gradient(135deg,#fde8d8,#f6d0be)',
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 24px',
            }}>
              <Heart size={44} color="#E8633A" />
            </div>
            <h2 style={{ fontFamily:'"Playfair Display",serif', fontSize:24, fontWeight:800, color:'#231E1B', margin:'0 0 10px' }}>
              Your wishlist is empty
            </h2>
            <p style={{ color:'#665D57', fontSize:14, margin:'0 0 28px' }}>
              Browse the shop and tap the heart icon to save your favourites.
            </p>
            <button onClick={() => navigate('/shop')} style={{
              padding:'12px 36px', background:'#E8633A', color:'#fff',
              border:'none', borderRadius:28, fontSize:15, fontWeight:700, cursor:'pointer',
            }}>
              Explore Products
            </button>
          </div>
        ) : (
          /* Spacious Wishlist Grid with Balanced Proportions */
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))', gap:22 }}>
            {items.map(product => (
              <div key={product.id} style={{ position:'relative' }}>
                <ProductCard product={product} />
                {/* Quick remove */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                  title="Remove from wishlist"
                  style={{
                    position:'absolute', bottom:56, right:10,
                    width:28, height:28, borderRadius:'50%',
                    background:'#fff', border:'1px solid #EADFD4',
                    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow:'0 2px 8px rgba(0,0,0,.1)',
                    zIndex:10,
                  }}
                >
                  <Trash2 size={12} color="#c94f2a" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
