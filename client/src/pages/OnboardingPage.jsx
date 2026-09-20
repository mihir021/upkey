import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const BUDGET_OPTIONS = [
  { label: 'Under ₹500', value: 500 },
  { label: '₹500 – ₹1,000', value: 1000 },
  { label: '₹1,000 – ₹2,000', value: 2000 },
  { label: '₹2,000+', value: 5000 },
];

const GOAL_OPTIONS = [
  'Acne Care', 'Hydration', 'Oil Control', 'Brightening',
  'Anti-Aging', 'Sensitive Skin Care', 'Daily Skincare Routine',
  'Even Skin Tone', 'Pore Care', 'Sun Protection',
];

const SKIN_TYPE_OPTIONS = ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'];
const SKIN_TONE_OPTIONS = ['Fair', 'Light', 'Medium', 'Tan', 'Deep'];

const SKIN_TYPE_EMOJIS = { Oily: '💧', Dry: '🏜️', Combination: '⚖️', Normal: '✨', Sensitive: '🌸' };
const SKIN_TONE_COLORS = {
  Fair: '#FDEBD0', Light: '#F5CBA7', Medium: '#E0A96D',
  Tan: '#C68642', Deep: '#8D5524',
};

const TOTAL_STEPS = 8;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { fetchMe } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [error, setError] = useState('');

  // Catalog values from DB
  const [catalogConcerns, setCatalogConcerns] = useState([]);
  const [catalogCategories, setCatalogCategories] = useState([]);
  const [catalogIngredients, setCatalogIngredients] = useState([]);

  // User selections
  const [skinType, setSkinType] = useState('');
  const [skinTone, setSkinTone] = useState('');
  const [concerns, setConcerns] = useState([]);
  const [budget, setBudget] = useState(null);
  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    api.get('/products/catalog-values')
      .then(res => {
        setCatalogConcerns(res.data.concerns || []);
        setCatalogCategories(res.data.categories || []);
        setCatalogIngredients(res.data.ingredients || []);
      })
      .catch(err => console.error('Failed to load catalog:', err))
      .finally(() => setCatalogLoading(false));
  }, []);

  function toggleArray(arr, setArr, val) {
    setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  }

  // Handle onboarding submission and personalized dashboard generation
  async function handleSubmit() {
    // Prevent duplicate submissions while in-flight
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      // If goals is empty, fallback to default goals so user has a populated dashboard
      const payloadGoals = goals.length > 0 ? goals : ['Daily Skincare Routine'];

      await api.put('/profile/preferences', {
        skinType,
        skinTone,
        concerns,
        budget,
        preferredCategories: categories,
        preferredIngredients: ingredients,
        shoppingGoals: payloadGoals,
      });

      // Refresh AuthContext user state so app recognizes onboarding is complete
      await fetchMe();

      // Navigate to personalized dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save onboarding preferences:', err);
      setError(err.response?.data?.message || 'Failed to save preferences. Please check your connection and try again.');
      setLoading(false);
    }
  }

  // Determines whether the user can proceed to the next step
  function canProceed() {
    switch (step) {
      case 1: return !!skinType;
      case 2: return !!skinTone;
      case 3: return concerns.length > 0;
      case 4: return budget !== null;
      case 5: return categories.length > 0;
      case 6: return true; // ingredients optional
      case 7: return true; // shopping goals optional - allows immediate dashboard generation
      default: return true;
    }
  }

  const progress = Math.round((step / (TOTAL_STEPS - 1)) * 100);

  if (catalogLoading) {
    return (
      <div style={pageStyle}>
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}>
          <Loader2 size={32} color="#E8633A" style={{ animation:'spin 1s linear infinite' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth:640, margin:'0 auto', padding:'40px 20px 80px' }}>

        {/* Progress Bar */}
        {step > 0 && (
          <div style={{ marginBottom:32 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <span style={{ fontSize:12, fontWeight:700, color:'#665D57' }}>Step {step} of {TOTAL_STEPS - 1}</span>
              <span style={{ fontSize:12, fontWeight:700, color:'#E8633A' }}>{progress}%</span>
            </div>
            <div style={{ height:6, background:'#EADFD4', borderRadius:10, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${progress}%`, background:'linear-gradient(90deg,#E8633A,#c94f2a)', borderRadius:10, transition:'width .4s ease' }} />
            </div>
          </div>
        )}

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div style={{ textAlign:'center', paddingTop:60 }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#E8633A,#c94f2a)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
              <Sparkles size={36} color="#fff" />
            </div>
            <h1 style={headingStyle}>Let's Personalize Your Joyory Experience</h1>
            <p style={{ color:'#665D57', fontSize:15, lineHeight:1.7, maxWidth:420, margin:'0 auto 40px' }}>
              Answer a few quick questions so we can recommend the perfect products for your skin type, concerns, and budget.
            </p>
            <button onClick={() => setStep(1)} style={primaryBtnStyle}>
              Get Started <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 1: Skin Type */}
        {step === 1 && (
          <StepContainer title="What is your skin type?" subtitle="This helps us match products formulated for your skin.">
            <div style={cardGridStyle}>
              {SKIN_TYPE_OPTIONS.map(t => (
                <SelectCard key={t} selected={skinType === t} onClick={() => setSkinType(t)} emoji={SKIN_TYPE_EMOJIS[t]} label={t} />
              ))}
            </div>
          </StepContainer>
        )}

        {/* Step 2: Skin Tone */}
        {step === 2 && (
          <StepContainer title="What is your skin tone?" subtitle="Helps us recommend shade-matched products.">
            <div style={cardGridStyle}>
              {SKIN_TONE_OPTIONS.map(t => (
                <button key={t} onClick={() => setSkinTone(t)} style={{
                  ...cardStyle,
                  borderColor: skinTone === t ? '#E8633A' : '#EADFD4',
                  background: skinTone === t ? '#fde8d8' : '#fff',
                }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:SKIN_TONE_COLORS[t], border:'2px solid rgba(0,0,0,.1)', margin:'0 auto 10px' }} />
                  <span style={{ fontWeight:700, fontSize:14, color:'#231E1B' }}>{t}</span>
                </button>
              ))}
            </div>
          </StepContainer>
        )}

        {/* Step 3: Concerns */}
        {step === 3 && (
          <StepContainer title="What are your main skin concerns?" subtitle="Select all that apply.">
            <div style={chipGridStyle}>
              {catalogConcerns.map(c => (
                <ChipButton key={c} selected={concerns.includes(c)} onClick={() => toggleArray(concerns, setConcerns, c)} label={c} />
              ))}
            </div>
          </StepContainer>
        )}

        {/* Step 4: Budget */}
        {step === 4 && (
          <StepContainer title="What's your skincare budget?" subtitle="Per product price range you're comfortable with.">
            <div style={cardGridStyle}>
              {BUDGET_OPTIONS.map(b => (
                <SelectCard key={b.value} selected={budget === b.value} onClick={() => setBudget(b.value)} emoji="💰" label={b.label} />
              ))}
            </div>
          </StepContainer>
        )}

        {/* Step 5: Categories */}
        {step === 5 && (
          <StepContainer title="What products are you interested in?" subtitle="Select categories you'd like to explore.">
            <div style={chipGridStyle}>
              {catalogCategories.map(c => (
                <ChipButton key={c} selected={categories.includes(c)} onClick={() => toggleArray(categories, setCategories, c)} label={c} />
              ))}
            </div>
          </StepContainer>
        )}

        {/* Step 6: Ingredients (Optional) */}
        {step === 6 && (
          <StepContainer title="Any ingredients you prefer?" subtitle="Optional — skip if you're not sure.">
            <div style={chipGridStyle}>
              {catalogIngredients.map(i => (
                <ChipButton key={i} selected={ingredients.includes(i)} onClick={() => toggleArray(ingredients, setIngredients, i)} label={i} />
              ))}
            </div>
          </StepContainer>
        )}

        {/* Step 7: Shopping Goals */}
        {step === 7 && (
          <StepContainer
            title="What are you trying to achieve?"
            subtitle="Select your skincare goals (optional — or click Build My Dashboard to use your skin profile)."
          >
            <div style={chipGridStyle}>
              {GOAL_OPTIONS.map(g => (
                <ChipButton key={g} selected={goals.includes(g)} onClick={() => toggleArray(goals, setGoals, g)} label={g} />
              ))}
            </div>
          </StepContainer>
        )}

        {/* Navigation Buttons */}
        {step > 0 && (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:32, gap:16 }}>
            <button onClick={() => setStep(s => s - 1)} style={backBtnStyle}>
              <ArrowLeft size={16} /> Back
            </button>

            {step < TOTAL_STEPS - 1 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} style={{ ...primaryBtnStyle, opacity: canProceed() ? 1 : 0.5, cursor: canProceed() ? 'pointer' : 'not-allowed' }}>
                {step === 6 ? (ingredients.length === 0 ? 'Skip' : 'Next') : 'Next'} <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  ...primaryBtnStyle,
                  opacity: loading ? 0.75 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg,#E8633A,#c94f2a)',
                  boxShadow: '0 6px 20px rgba(232,99,58,.35)',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} style={{ animation:'spin 1s linear infinite' }} />
                    Building Your Dashboard...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Build My Dashboard
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Error notification with retry */}
        {error && (
          <div style={{
            marginTop: 18,
            padding: '12px 18px',
            background: '#fde8d8',
            color: '#c94f2a',
            borderRadius: 14,
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            border: '1px solid #f9cdb8',
          }}>
            <span>{error}</span>
            <button
              onClick={handleSubmit}
              style={{
                background: '#c94f2a',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Sub-components ──

function StepContainer({ title, subtitle, children }) {
  return (
    <div>
      <h2 style={headingStyle}>{title}</h2>
      {subtitle && <p style={{ color:'#665D57', fontSize:14, margin:'0 0 24px', lineHeight:1.6 }}>{subtitle}</p>}
      {children}
    </div>
  );
}

function SelectCard({ selected, onClick, emoji, label }) {
  return (
    <button onClick={onClick} style={{
      ...cardStyle,
      borderColor: selected ? '#E8633A' : '#EADFD4',
      background: selected ? '#fde8d8' : '#fff',
      boxShadow: selected ? '0 0 0 3px rgba(232,99,58,.15)' : 'none',
    }}>
      <span style={{ fontSize:28, marginBottom:8, display:'block' }}>{emoji}</span>
      <span style={{ fontWeight:700, fontSize:14, color:'#231E1B' }}>{label}</span>
      {selected && <CheckCircle size={16} color="#E8633A" style={{ position:'absolute', top:10, right:10 }} />}
    </button>
  );
}

function ChipButton({ selected, onClick, label }) {
  return (
    <button onClick={onClick} style={{
      padding:'10px 18px',
      borderRadius:24,
      border: `1.5px solid ${selected ? '#E8633A' : '#EADFD4'}`,
      background: selected ? '#fde8d8' : '#fff',
      color: selected ? '#c94f2a' : '#231E1B',
      fontSize:13,
      fontWeight: selected ? 700 : 500,
      cursor:'pointer',
      transition:'all .2s',
      fontFamily:'inherit',
    }}>
      {selected && '✓ '}{label}
    </button>
  );
}

// ── Styles ──

const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #FDFBF7 0%, #F6EFE9 100%)',
  fontFamily: '"Inter", sans-serif',
};

const headingStyle = {
  fontFamily: '"Playfair Display", serif',
  fontSize: 'clamp(22px, 4vw, 28px)',
  fontWeight: 800,
  color: '#231E1B',
  margin: '0 0 12px',
  lineHeight: 1.3,
};

const primaryBtnStyle = {
  padding: '14px 28px',
  background: 'linear-gradient(135deg, #E8633A, #c94f2a)',
  color: '#fff',
  border: 'none',
  borderRadius: 28,
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontFamily: 'inherit',
  boxShadow: '0 6px 20px rgba(232,99,58,.3)',
};

const backBtnStyle = {
  padding: '12px 20px',
  background: 'transparent',
  border: '1.5px solid #EADFD4',
  borderRadius: 28,
  color: '#665D57',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontFamily: 'inherit',
};

const cardGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
  gap: 12,
};

const cardStyle = {
  padding: '20px 16px',
  borderRadius: 18,
  border: '1.5px solid #EADFD4',
  cursor: 'pointer',
  textAlign: 'center',
  transition: 'all .2s',
  fontFamily: 'inherit',
  position: 'relative',
};

const chipGridStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
};
