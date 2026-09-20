import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, History, Loader2, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function RewardsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, requireAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!requireAuth('view your rewards', () => navigate('/'))) return;

    Promise.all([
      api.get('/orders/rewards/balance'),
      api.get('/orders/rewards/history')
    ])
    .then(([balRes, histRes]) => {
      setBalance(balRes.data.coinsBalance);
      setHistory(histRes.data);
    })
    .catch(err => console.error('Error fetching rewards:', err))
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

  return (
    <div style={{ minHeight:'100vh', background:'#FDFBF7', fontFamily:'"Inter",sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth:800, margin:'0 auto', padding:'40px 20px 100px' }}>
        <h1 style={{ margin:'0 0 24px', fontFamily:'"Playfair Display",serif', fontSize:28, fontWeight:800, color:'#231E1B' }}>
          Joyory Rewards
        </h1>

        {/* Balance Card */}
        <div style={{ 
          background:'linear-gradient(135deg, #231E1B, #3D3530)', 
          borderRadius:24, padding:32, color:'#fff', marginBottom:32,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          flexWrap:'wrap', gap:24
        }}>
          <div>
            <div style={{ fontSize:14, color:'#EADFD4', marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:1 }}>
              Available Balance
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Coins size={28} color="#fde8d8" />
              </div>
              <div style={{ fontSize:42, fontWeight:800, fontFamily:'"Playfair Display",serif' }}>
                {balance}
              </div>
            </div>
          </div>
          <div style={{ background:'rgba(255,255,255,0.1)', padding:'16px 20px', borderRadius:16, flex:1, minWidth:250 }}>
            <h3 style={{ margin:'0 0 8px', fontSize:15, fontWeight:700, color:'#fde8d8' }}>How it works</h3>
            <ul style={{ margin:0, paddingLeft:20, fontSize:13, color:'#EADFD4', lineHeight:1.6 }}>
              <li>Earn 10 Coins for every ₹100 spent.</li>
              <li>Redeem 10 Coins for a ₹1 discount on future orders.</li>
            </ul>
            <button onClick={() => navigate('/shop')} style={{
              marginTop:16, padding:'8px 16px', background:'#E8633A', color:'#fff',
              border:'none', borderRadius:20, fontSize:13, fontWeight:700, cursor:'pointer',
              display:'flex', alignItems:'center', gap:6
            }}>
              Start Shopping <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* History List */}
        <div>
          <h2 style={{ margin:'0 0 16px', fontSize:18, fontWeight:800, color:'#231E1B', display:'flex', alignItems:'center', gap:8 }}>
            <History size={20} color="#665D57" /> Transaction History
          </h2>
          
          {history.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 20px', background:'#fff', borderRadius:20, border:'1.5px solid #EADFD4' }}>
              <p style={{ color:'#665D57', fontSize:15, margin:0 }}>No reward transactions yet.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {history.map(txn => (
                <div key={txn._id} style={{ 
                  background:'#fff', border:'1.5px solid #EADFD4', borderRadius:16, 
                  padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center',
                  flexWrap:'wrap', gap:12
                }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:'#231E1B', marginBottom:4 }}>
                      {txn.description}
                    </div>
                    <div style={{ fontSize:12, color:'#665D57' }}>
                      {new Date(txn.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize:16, fontWeight:800, 
                    color: txn.amount > 0 ? '#27AE60' : '#c94f2a',
                    background: txn.amount > 0 ? '#e8f5ec' : '#fde8d8',
                    padding:'6px 14px', borderRadius:20
                  }}>
                    {txn.amount > 0 ? '+' : ''}{txn.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
