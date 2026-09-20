import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, ArrowRight, Check, X } from 'lucide-react';
import api from '../api/axios';
import AuthLayout from '../components/AuthLayout';

// ============================================================================
// Password validation pattern — mirrors the backend rule in
// server/src/middleware/validate.middleware.js so the client catches
// invalid passwords before hitting the network.
// ============================================================================
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * RequirementChip - static helper component declared outside render to comply with
 * React Compiler & ESLint rules (react-hooks/static-components).
 * Renders individual password requirement status with subtle luxury styling.
 */
function RequirementChip({ met, label, touched }) {
  return (
    <span
      className="flex items-center gap-1.5 text-[11px] transition-colors duration-200"
      style={{
        color: touched ? (met ? '#047857' : '#9A3412') : '#8F8278',
        fontWeight: touched && met ? 600 : 400,
      }}
    >
      {touched ? (
        met ? (
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        ) : (
          <X className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        )
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-[#CBBFB3] shrink-0 inline-block ml-1 mr-1" />
      )}
      <span>{label}</span>
    </span>
  );
}

function Signup() {
  const navigate = useNavigate();

  // ---------- state ----------
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ---------- handlers ----------
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  }

  // Live password strength indicator checks
  const hasLength  = form.password.length >= 8;
  const hasUpper   = /[A-Z]/.test(form.password);
  const hasLower   = /[a-z]/.test(form.password);
  const hasNumber  = /\d/.test(form.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(form.password);

  // Track whether the user has started typing a password for requirement cues
  const passwordTouched = form.password.length > 0;

  // ---------- validation ----------
  function validate() {
    if (!form.name.trim()) return 'Name is required.';
    if (!EMAIL_PATTERN.test(form.email)) return 'A valid email is required.';
    if (!PASSWORD_PATTERN.test(form.password)) {
      return 'Password must be 8+ characters with uppercase, lowercase, number, and special character.';
    }
    return '';
  }

  // ---------- submit ----------
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/signup', form);
      localStorage.setItem('token', res.data.token);
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      navigate('/shop');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  }

  // ======================= RENDER =======================
  return (
    <AuthLayout activeTab="signup" onTabChange={(tab) => navigate(`/${tab}`)}>
      <div className="w-full">
        {/* ---- Header ---- */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8633A]/10 text-[#E8633A] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Join Joyory Aura</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-brand text-[#231E1B] tracking-tight">
            Sign Up
          </h1>
          <p className="text-xs text-[#665D57] mt-1 leading-relaxed">
            Create your account to unlock personalized routine formulas, dupe matches, and member pricing.
          </p>
        </div>

        {/* ---- Form ---- */}
        <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-[#4B443F] mb-1" htmlFor="signup-name">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8278]">
                <User className="w-4 h-4" />
              </div>
              <input
                id="signup-name"
                name="name"
                placeholder="Name"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EADFD4] rounded-xl text-sm text-[#231E1B] placeholder-[#A49B93] focus:outline-none focus:ring-2 focus:ring-[#E8633A]/30 focus:border-[#E8633A] transition-all duration-200 shadow-sm hover:border-[#D4C8BA]"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-[#4B443F] mb-1" htmlFor="signup-email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8278]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="signup-email"
                name="email"
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EADFD4] rounded-xl text-sm text-[#231E1B] placeholder-[#A49B93] focus:outline-none focus:ring-2 focus:ring-[#E8633A]/30 focus:border-[#E8633A] transition-all duration-200 shadow-sm hover:border-[#D4C8BA]"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-[#4B443F] mb-1" htmlFor="signup-password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8278]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="signup-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-10 pr-11 py-2.5 bg-white border border-[#EADFD4] rounded-xl text-sm text-[#231E1B] placeholder-[#A49B93] focus:outline-none focus:ring-2 focus:ring-[#E8633A]/30 focus:border-[#E8633A] transition-all duration-200 shadow-sm hover:border-[#D4C8BA]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8F8278] hover:text-[#231E1B] transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* ---- Password Strength Chips: Always rendered with fixed height to prevent layout shifts ---- */}
            <div
              className="mt-2 p-2 rounded-lg border grid grid-cols-2 gap-1 text-[11px] min-h-[48px] items-center transition-all duration-300"
              style={{
                background: passwordTouched ? 'rgba(246,239,233,0.7)' : 'rgba(246,239,233,0.3)',
                borderColor: passwordTouched ? 'rgba(234,223,212,0.85)' : 'rgba(234,223,212,0.4)',
              }}
            >
              <RequirementChip met={hasLength} label="8+ characters" touched={passwordTouched} />
              <RequirementChip met={hasUpper} label="Uppercase letter" touched={passwordTouched} />
              <RequirementChip met={hasLower} label="Lowercase letter" touched={passwordTouched} />
              <RequirementChip met={hasNumber && hasSpecial} label="Number & special char" touched={passwordTouched} />
            </div>
          </div>

          {/* ---- Error Message: Stable slot to prevent template jumping ---- */}
          {error && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50/95 border border-red-200 text-red-700 text-xs animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <p className="leading-snug">{error}</p>
            </div>
          )}

          {/* ---- Submit Button ---- */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#E8633A] hover:bg-[#D4552E] active:scale-[0.98] text-white text-sm font-bold shadow-md shadow-[#E8633A]/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <span>{loading ? 'Creating account...' : 'Sign Up'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* ---- Switch to Login ---- */}
        <p className="text-center text-xs text-[#665D57] mt-4">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#E8633A] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Signup;
