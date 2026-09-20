import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShoppingBag, Heart, Search, User, Home, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { label:'Shop',      to:'/shop' },
  { label:'Explore',   to:'/explore' },
  { label:'Dashboard', to:'/dashboard' },
  { label:'Wishlist',  to:'/wishlist' },
  { label:'Orders',    to:'/orders' },
];

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { cartCount, wishCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth();

  const [menuOpen, setMenuOpen]     = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchVal, setSearchVal]   = useState('');
  const searchRef = useRef();
  const profileRef = useRef();

  // close dropdowns on outside click
  useEffect(() => {
    function handler(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
    }
  }

  const isActive = (to) => location.pathname === to;

  return (
    <>
      <nav style={{
        position:'sticky', top:0, zIndex:200,
        background:'rgba(253,251,247,0.95)',
        backdropFilter:'blur(12px)',
        borderBottom:'1.5px solid #EADFD4',
        padding:'0 24px',
        height:64,
        display:'flex', alignItems:'center', gap:20,
      }}>
        {/* Logo */}
        <Link to="/shop" style={{
          fontFamily:'"Playfair Display", Georgia, serif',
          fontSize:22, fontWeight:700, color:'#E8633A',
          textDecoration:'none', flexShrink:0, letterSpacing:-.3,
        }}>
          Joyory
        </Link>

        {/* Desktop nav links */}
        <div style={{ display:'flex', gap:4, marginLeft:8 }} className="desktop-nav">
          {NAV_LINKS.map(link => (
            <Link key={link.to} to={link.to} style={{
              padding:'6px 14px', borderRadius:20, fontSize:13.5, fontWeight:600,
              color: isActive(link.to) ? '#E8633A' : '#665D57',
              background: isActive(link.to) ? '#fde8d8' : 'transparent',
              textDecoration:'none', transition:'all .15s',
            }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Spacer */}
        <div style={{ flex:1 }} />

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{
          display:'flex', alignItems:'center',
          background:'#F6EFE9', border:'1.5px solid #EADFD4',
          borderRadius:24, padding:'6px 14px', gap:8, maxWidth:260, flex:1,
        }} className="search-bar">
          <Search size={15} color="#665D57" />
          <input
            ref={searchRef}
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder="Search skincare…"
            style={{
              border:'none', background:'transparent', outline:'none',
              fontSize:13, color:'#231E1B', width:'100%',
              fontFamily:'inherit',
            }}
          />
        </form>

        {/* Icons */}
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          {/* Wishlist */}
          <button onClick={() => navigate('/wishlist')} style={{
            position:'relative', width:40, height:40, borderRadius:'50%',
            background:'transparent', border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Heart size={20} color={location.pathname==='/wishlist' ? '#E8633A' : '#665D57'} />
            {wishCount > 0 && (
              <span style={{
                position:'absolute', top:4, right:4,
                background:'#E8633A', color:'#fff',
                width:16, height:16, borderRadius:'50%',
                fontSize:9, fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>{wishCount}</span>
            )}
          </button>

          {/* Cart */}
          <button onClick={() => navigate('/cart')} style={{
            position:'relative', width:40, height:40, borderRadius:'50%',
            background: location.pathname==='/cart' ? '#fde8d8' : 'transparent',
            border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <ShoppingBag size={20} color={location.pathname==='/cart' ? '#E8633A' : '#665D57'} />
            {cartCount > 0 && (
              <span style={{
                position:'absolute', top:4, right:4,
                background:'#E8633A', color:'#fff',
                width:16, height:16, borderRadius:'50%',
                fontSize:9, fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>{cartCount}</span>
            )}
          </button>

          {/* Profile Dropdown or Sign In CTA */}
          {(isAuthenticated && user) ? (
            <div ref={profileRef} style={{ position:'relative' }}>
              <button
                onClick={() => setProfileOpen(p => !p)}
                style={{
                  display:'flex', alignItems:'center', gap:8,
                  padding:'6px 12px 6px 6px', borderRadius:24,
                  background:'#F6EFE9', border:'1.5px solid #EADFD4',
                  cursor:'pointer',
                }}
                aria-label="Open user menu"
              >
                <div style={{
                  width:28, height:28, borderRadius:'50%',
                  background:'linear-gradient(135deg,#E8633A,#c94f2a)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:'#fff', fontWeight:700, fontSize:12,
                }}>
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize:13, fontWeight:600, color:'#231E1B', maxWidth:90, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {user.name?.split(' ')[0]}
                </span>
                <ChevronDown size={14} color="#665D57" />
              </button>

              {profileOpen && (
                <div style={{
                  position:'absolute', right:0, top:'calc(100% + 8px)',
                  background:'#fff', border:'1.5px solid #EADFD4',
                  borderRadius:16, overflow:'hidden',
                  boxShadow:'0 12px 40px rgba(35,30,27,.14)',
                  minWidth:190, zIndex:300,
                }}>
                  <div style={{ padding: '12px 18px', borderBottom: '1px solid #EADFD4', background: '#FDFBF7' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#231E1B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#665D57', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.email}
                    </div>
                  </div>
                  {[
                    { label:'User Profile', to:'/profile' },
                    { label:'Dashboard',    to:'/dashboard' },
                    { label:'My Orders',    to:'/orders' },
                  ].map(item => (
                    <button key={item.to} onClick={() => { navigate(item.to); setProfileOpen(false); }}
                      style={{
                        display:'block', width:'100%', padding:'11px 18px',
                        background:'transparent', border:'none', cursor:'pointer',
                        textAlign:'left', fontSize:13.5, fontWeight:600, color:'#231E1B',
                        transition:'background .15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background='#F6EFE9'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}
                    >
                      {item.label}
                    </button>
                  ))}
                  <hr style={{ margin:0, border:'none', borderTop:'1px solid #EADFD4' }} />
                  <button onClick={() => { logout(); navigate('/'); setProfileOpen(false); }}
                    style={{
                      display:'flex', alignItems:'center', gap:10, width:'100%',
                      padding:'12px 18px', background:'transparent', border:'none',
                      cursor:'pointer', fontSize:13.5, fontWeight:600, color:'#c94f2a',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background='#fde8d8'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => navigate('/login')} style={{
              padding:'7px 18px', background:'#E8633A', color:'#fff',
              border:'none', borderRadius:20, fontSize:13, fontWeight:700,
              cursor:'pointer',
            }}>
              Sign In
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen(p => !p)}
            style={{
              display:'none', width:36, height:36, borderRadius:'50%',
              background:'transparent', border:'none', cursor:'pointer',
              alignItems:'center', justifyContent:'center',
            }}
          >
            {menuOpen ? <X size={20} color="#231E1B" /> : <Menu size={20} color="#231E1B" />}
          </button>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div style={{
          position:'fixed', top:64, left:0, right:0, bottom:0,
          background:'rgba(253,251,247,0.98)', zIndex:190,
          padding:24, display:'flex', flexDirection:'column', gap:8,
        }} className="mobile-menu">
          {NAV_LINKS.map(link => (
            <button key={link.to} onClick={() => { navigate(link.to); setMenuOpen(false); }}
              style={{
                padding:'14px 18px', background: isActive(link.to) ? '#fde8d8' : 'transparent',
                border:'1.5px solid #EADFD4', borderRadius:12,
                color: isActive(link.to) ? '#E8633A' : '#231E1B',
                fontSize:16, fontWeight:600, cursor:'pointer', textAlign:'left',
              }}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}

      {/* Mobile bottom tab bar */}
      <div className="bottom-tab" style={{
        display:'none', position:'fixed', bottom:0, left:0, right:0,
        background:'rgba(253,251,247,0.97)', borderTop:'1.5px solid #EADFD4',
        padding:'8px 0 env(safe-area-inset-bottom)',
        justifyContent:'space-around', zIndex:200,
        backdropFilter:'blur(12px)',
      }}>
        {[
          { icon:<Home size={22}/>, label:'Home', to:'/shop' },
          { icon:<Search size={22}/>, label:'Search', to:'/explore' },
          { icon:<Heart size={22}/>, label:'Wishlist', to:'/wishlist', badge: wishCount },
          { icon:<ShoppingBag size={22}/>, label:'Cart', to:'/cart', badge: cartCount },
          { icon:<User size={22}/>, label:'Profile', to:'/profile' },
        ].map(tab => (
          <button key={tab.to} onClick={() => navigate(tab.to)}
            style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:2,
              background:'transparent', border:'none', cursor:'pointer',
              position:'relative', padding:'0 12px',
              color: isActive(tab.to) ? '#E8633A' : '#665D57',
            }}
          >
            {tab.icon}
            <span style={{ fontSize:9, fontWeight:600 }}>{tab.label}</span>
            {tab.badge > 0 && (
              <span style={{
                position:'absolute', top:0, right:6,
                background:'#E8633A', color:'#fff',
                width:14, height:14, borderRadius:'50%',
                fontSize:8, fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      <style>{`
        @media(max-width:768px){
          .desktop-nav { display:none !important; }
          .search-bar  { display:none !important; }
          .hamburger   { display:flex !important; }
          .bottom-tab  { display:flex !important; }
        }
      `}</style>
    </>
  );
}
