import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, Sparkles, Star, ShoppingBag, ChevronRight, Bot, User } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import RobotMascot from './RobotMascot';

// ─── Suggested quick-prompts shown when chat is empty ────────────────────────
const QUICK_PROMPTS = [
  { icon: '✨', label: 'Recommend for oily skin', msg: 'I have oily, acne-prone skin. Recommend something under ₹1000.' },
  { icon: '🔍', label: 'Compare products', msg: 'Compare P011 and P003. Which is better for oily skin?' },
  { icon: '🧴', label: 'Build a routine', msg: 'Build me a skincare routine for acne under ₹2000.' },
  { icon: '💰', label: 'Find a dupe', msg: 'I like P013 but want a cheaper alternative.' },
];

// ─── Mini product card rendered inside chat bubbles ─────────────────────────
function ChatProductCard({ product, onNavigate, onAddToCart }) {
  if (!product) return null;
  const name = product.name || product.product_name || '—';
  const brand = product.brand || '';
  const price = product.price_inr ?? product.price ?? null;
  const rating = product.rating ?? null;
  const category = product.category || '';
  const pid = product.product_id || product.id || '';

  return (
    <div
      onClick={() => pid && onNavigate(`/product/${pid}`)}
      style={{
        background: '#fff', border: '1.5px solid #EADFD4', borderRadius: 14,
        padding: '10px 13px', cursor: pid ? 'pointer' : 'default',
        display: 'flex', flexDirection: 'column', gap: 4,
        transition: 'box-shadow .2s, transform .2s', minWidth: 180, maxWidth: 220,
        flexShrink: 0,
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(35,30,27,.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
    >
      {brand && <span style={{ fontSize: 9, fontWeight: 700, color: '#E8633A', letterSpacing: .8, textTransform: 'uppercase' }}>{brand}</span>}
      <span style={{ fontSize: 12, fontWeight: 600, color: '#231E1B', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{name}</span>
      {category && <span style={{ fontSize: 10, color: '#665D57' }}>{category}</span>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {price != null && <span style={{ fontWeight: 800, fontSize: 14, color: '#231E1B' }}>₹{Number(price).toLocaleString('en-IN')}</span>}
          {rating != null && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 10, color: '#665D57' }}>
              <Star size={10} fill="#E8633A" color="#E8633A" />{Number(rating).toFixed(1)}
            </span>
          )}
        </div>
        {onAddToCart && (
          <button onClick={e => { e.stopPropagation(); onAddToCart(product); }}
            style={{ background: '#E8633A', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
            <ShoppingBag size={10} /> Add
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Extract products from various result shapes ─────────────────────────────
function extractProducts(result) {
  if (!result) return [];
  // Recommendations: { recommendations: [{ product: {...}, match_score: N }, ...] }
  if (Array.isArray(result.recommendations)) {
    return result.recommendations.map(r => ({ ...r.product, _matchScore: r.match_score }));
  }
  // Search: { results: [...] }
  if (Array.isArray(result.results)) return result.results;
  // Compare: { products: [...] }
  if (Array.isArray(result.products)) return result.products;
  // Dupes: { dupes: [...] }
  if (Array.isArray(result.dupes)) return result.dupes.map(d => d.product || d);
  // Routine: { routine: [...] }
  if (Array.isArray(result.routine)) return result.routine.map(s => s.product || s).filter(Boolean);
  // Single product: { product: {...} }
  if (result.product && typeof result.product === 'object') return [result.product];
  // Array of tool results (multi-tool)
  if (Array.isArray(result)) {
    return result.flatMap(r => extractProducts(r.result || r));
  }
  return [];
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function AiChatWidget() {
  const navigate = useNavigate();
  const { isAuthenticated, openGate } = useAuth();
  const { addToCart } = useCart();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);       // { role: 'user'|'assistant', content, products?, intent? }
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    let timeout;
    if (open) {
      timeout = setTimeout(() => {
        inputRef.current?.focus();
        setPulse(false);
      }, 200);
    }
    return () => clearTimeout(timeout);
  }, [open]);

  const sendMessage = useCallback(async (text) => {
    if (!text?.trim()) return;

    // Gate: require auth
    if (!isAuthenticated) {
      openGate('chat with the AI Shopping Assistant');
      return;
    }

    const userMsg = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build conversation_history from previous messages (for multi-turn)
      const history = messages.map(m => ({ role: m.role, content: m.content }));

      const { data } = await api.post('/ai/chat', {
        message: text.trim(),
        conversation_history: history,
      });

      if (data.success && data.data) {
        const d = data.data;
        const products = extractProducts(d.result);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: d.message || 'Here are your results.',
          products,
          intent: d.intent,
          llmPowered: d.llm_powered,
          toolsUsed: d.tools_used,
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message || 'Sorry, something went wrong.',
        }]);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'AI service is currently unavailable. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: msg, isError: true }]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, openGate, messages]);

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating Action Button (Animated Mascot with Eye Tracking) ── */}
      {!open && (
        <RobotMascot
          onClick={() => setOpen(true)}
          pulse={pulse}
        />
      )}

      {/* ── Chat Panel ── */}
      {open && (
        <div
          id="ai-chat-panel"
          style={{
            position: 'fixed', bottom: 20, right: 20, zIndex: 1000,
            width: 425, maxWidth: 'calc(100vw - 32px)',
            height: 600, maxHeight: 'calc(100vh - 40px)',
            borderRadius: 24,
            background: '#FDFBF7',
            border: '1.5px solid #EADFD4',
            boxShadow: '0 20px 60px rgba(35,30,27,.18), 0 0 0 1px rgba(232,99,58,.08)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            animation: 'ai-panel-enter .3s cubic-bezier(.22,1,.36,1)',
          }}
        >
          {/* ── Header ── */}
          <div style={{
            background: 'linear-gradient(135deg, #E8633A, #c94f2a)',
            padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12,
            flexShrink: 0,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: -.2 }}>Joyory AI Assistant</div>
              <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 11, fontWeight: 500 }}>Skincare • Shopping • Routines</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,.15)', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.15)'}
              aria-label="Close chat"
            >
              <X size={16} color="#fff" />
            </button>
          </div>

          {/* ── Messages Area ── */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px 14px',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {/* Welcome + quick prompts when empty */}
            {messages.length === 0 && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 0' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fde8d8, #f0c4b0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Sparkles size={26} color="#E8633A" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: '#231E1B', margin: '0 0 4px' }}>Hi! I&apos;m your AI beauty advisor</p>
                  <p style={{ fontSize: 12, color: '#665D57', margin: 0, lineHeight: 1.5 }}>
                    Ask me to recommend products, compare items,<br />build routines, or find budget-friendly dupes.
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 4 }}>
                  {QUICK_PROMPTS.map((qp, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(qp.msg)}
                      style={{
                        background: '#fff', border: '1.5px solid #EADFD4', borderRadius: 14,
                        padding: '10px 14px', cursor: 'pointer', textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: 10,
                        transition: 'border-color .15s, box-shadow .15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#E8633A'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(232,99,58,.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#EADFD4'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{qp.icon}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: '#231E1B' }}>{qp.label}</span>
                      <ChevronRight size={14} color="#ccc" style={{ marginLeft: 'auto' }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                display: 'flex', flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: 6,
              }}>
                {/* Avatar + bubble */}
                <div style={{
                  display: 'flex', gap: 8,
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start', maxWidth: '92%',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #E8633A, #c94f2a)'
                      : 'linear-gradient(135deg, #fde8d8, #f0c4b0)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {msg.role === 'user'
                      ? <User size={13} color="#fff" />
                      : <Bot size={14} color="#E8633A" />
                    }
                  </div>

                  {/* Bubble */}
                  <div style={{
                    background: msg.role === 'user' ? '#E8633A' : '#fff',
                    color: msg.role === 'user' ? '#fff' : '#231E1B',
                    border: msg.role === 'user' ? 'none' : '1.5px solid #EADFD4',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    padding: '10px 14px',
                    fontSize: 13, lineHeight: 1.55, fontWeight: 450,
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    ...(msg.isError && { borderColor: '#e74c3c', background: '#fef2f2', color: '#c0392b' }),
                  }}>
                    {msg.content}
                  </div>
                </div>

                {/* Product cards strip */}
                {msg.products && msg.products.length > 0 && (
                  <div style={{
                    display: 'flex', gap: 10, overflowX: 'auto',
                    paddingLeft: 36, paddingBottom: 4, paddingRight: 4,
                    maxWidth: '100%',
                  }}>
                    {msg.products.slice(0, 6).map((p, pi) => (
                      <ChatProductCard
                        key={p.product_id || p.id || pi}
                        product={p}
                        onNavigate={path => { navigate(path); setOpen(false); }}
                        onAddToCart={prod => addToCart({ ...prod, id: prod.product_id || prod.id })}
                      />
                    ))}
                  </div>
                )}

                {/* Intent / tools badge */}
                {msg.role === 'assistant' && msg.toolsUsed && msg.toolsUsed.length > 0 && (
                  <div style={{ paddingLeft: 36, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {msg.toolsUsed.map((t, ti) => (
                      <span key={ti} style={{
                        fontSize: 9, fontWeight: 700, color: '#E8633A',
                        background: '#fde8d8', padding: '2px 8px', borderRadius: 20,
                        letterSpacing: .5, textTransform: 'uppercase',
                      }}>
                        {t.replace(/_/g, ' ')}
                      </span>
                    ))}
                    {msg.llmPowered && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, color: '#467254',
                        background: '#d8f0e5', padding: '2px 8px', borderRadius: 20,
                        letterSpacing: .5,
                      }}>
                        AI Powered
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #fde8d8, #f0c4b0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bot size={14} color="#E8633A" />
                </div>
                <div style={{
                  background: '#fff', border: '1.5px solid #EADFD4',
                  borderRadius: '18px 18px 18px 4px', padding: '12px 18px',
                  display: 'flex', gap: 5, alignItems: 'center',
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E8633A', animation: 'ai-dot-bounce .6s ease-in-out infinite', opacity: .6 }} />
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E8633A', animation: 'ai-dot-bounce .6s ease-in-out .15s infinite', opacity: .6 }} />
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E8633A', animation: 'ai-dot-bounce .6s ease-in-out .3s infinite', opacity: .6 }} />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── Input Area ── */}
          <form onSubmit={handleSubmit} style={{
            padding: '12px 14px', borderTop: '1.5px solid #EADFD4',
            background: '#fff', display: 'flex', gap: 8, alignItems: 'flex-end',
            flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about skincare, products, routines…"
              disabled={loading}
              style={{
                flex: 1, border: '1.5px solid #EADFD4', borderRadius: 16,
                padding: '10px 14px', fontSize: 13, color: '#231E1B',
                background: '#FDFBF7', outline: 'none', fontFamily: 'inherit',
                transition: 'border-color .15s',
              }}
              onFocus={e => e.target.style.borderColor = '#E8633A'}
              onBlur={e => e.target.style.borderColor = '#EADFD4'}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                width: 40, height: 40, borderRadius: '50%',
                background: loading || !input.trim() ? '#EADFD4' : 'linear-gradient(135deg, #E8633A, #c94f2a)',
                border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background .2s, transform .15s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { if (!loading && input.trim()) e.currentTarget.style.transform = 'scale(1.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              aria-label="Send message"
            >
              <Send size={16} color="#fff" style={{ marginLeft: 2 }} />
            </button>
          </form>
        </div>
      )}

      {/* ── Animations ── */}
      <style>{`
        @keyframes ai-fab-pulse {
          0%, 100% { box-shadow: 0 6px 28px rgba(232,99,58,.45); }
          50% { box-shadow: 0 6px 28px rgba(232,99,58,.45), 0 0 0 12px rgba(232,99,58,.12); }
        }
        @keyframes ai-panel-enter {
          from { opacity: 0; transform: translateY(24px) scale(.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ai-dot-bounce {
          0%, 100% { transform: translateY(0); opacity: .4; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
        @media (max-width: 480px) {
          #ai-chat-panel {
            bottom: 0 !important;
            right: 0 !important;
            width: 100vw !important;
            max-width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
          }
          #ai-chat-fab {
            bottom: 80px !important;
          }
        }
      `}</style>
    </>
  );
}
