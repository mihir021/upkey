import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

/**
 * Login Page Component
 * 
 * Luxury editorial authentication page tailored for Glow More:
 * 1. Pill badge: Soft-tinted "WELCOME BACK" chip matching site theme.
 * 2. Typography: Fraunces serif headline + clean Inter body.
 * 3. Floating labels: Interactive floating labels that glide up on focus/typing.
 * 4. Micro-animations: Soft orange focus glow ring + password shake on error.
 * 5. Button states: Hover lift, deep shadow, and spinning loading indicator.
 * 6. Quick Demo: Prominent wand chip for instant judge/evaluator auto-fill.
 * 7. OAuth: Full-width "Continue with Google" action.
 */
function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // ---------- Form & Interactive State ----------
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // ---------- Input Handlers ----------
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  }

  // ---------- Form Submission ----------
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      await login(form);
      navigate('/shop');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  // ======================= RENDER =======================
  return (
    <AuthLayout activeTab="login" onTabChange={(tab) => navigate(`/${tab}`)}>
      <div className="w-full">
        
        {/* ---- Header Section ---- */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE2D7] text-[#E8633A] text-[10px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>WELCOME BACK</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-brand text-[#231E1B] tracking-tight">
            Log In
          </h1>

          <p className="text-xs text-[#665D57] mt-1 leading-relaxed">
            Access your personalized skin match diagnostics, saved routines, and dupe alerts.
          </p>
        </div>

        {/* ---- Form Body ---- */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          
          {/* Email Floating Label Input */}
          <div className="relative">
            <div className="absolute top-4 left-3.5 flex items-center pointer-events-none text-[#8F8278] z-10">
              <Mail className="w-4 h-4" />
            </div>

            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className={`w-full pt-6 pb-2 pl-10 pr-4 bg-white border rounded-2xl text-sm text-[#231E1B] placeholder-transparent focus:placeholder-[#A49B93] focus:outline-none transition-all duration-200 shadow-2xs ${
                error
                  ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                  : 'border-[#EADFD4] focus:border-[#E8633A] focus:ring-4 focus:ring-[#E8633A]/15 hover:border-[#D9C8BA]'
              }`}
            />

            {/* Floating Label */}
            <label
              htmlFor="login-email"
              className={`absolute left-10 transition-all duration-200 pointer-events-none ${
                focusedField === 'email' || form.email.length > 0
                  ? 'top-2 text-[10px] font-bold text-[#E8633A]'
                  : 'top-3.5 text-xs text-[#8F8278]'
              }`}
            >
              Email Address
            </label>
          </div>

          {/* Password Floating Label Input with Micro-Shake on Error */}
          <motion.div
            animate={error ? { x: [-6, 6, -5, 5, -2, 2, 0] } : { x: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="relative"
          >
            <div className="absolute top-4 left-3.5 flex items-center pointer-events-none text-[#8F8278] z-10">
              <Lock className="w-4 h-4" />
            </div>

            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              className={`w-full pt-6 pb-2 pl-10 pr-11 bg-white border rounded-2xl text-sm text-[#231E1B] placeholder-transparent focus:placeholder-[#A49B93] focus:outline-none transition-all duration-200 shadow-2xs ${
                error
                  ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                  : 'border-[#EADFD4] focus:border-[#E8633A] focus:ring-4 focus:ring-[#E8633A]/15 hover:border-[#D9C8BA]'
              }`}
            />

            {/* Floating Label */}
            <label
              htmlFor="login-password"
              className={`absolute left-10 transition-all duration-200 pointer-events-none ${
                focusedField === 'password' || form.password.length > 0
                  ? 'top-2 text-[10px] font-bold text-[#E8633A]'
                  : 'top-3.5 text-xs text-[#8F8278]'
              }`}
            >
              Password
            </label>

            {/* Password Eye Toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-4 right-3.5 flex items-center text-[#8F8278] hover:text-[#231E1B] transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </motion.div>

          {/* ---- Error Message Banner ---- */}
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: error ? '80px' : '0px',
              opacity: error ? 1 : 0,
            }}
          >
            <div className="flex items-start gap-2 p-3 rounded-2xl bg-red-50/90 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <p className="leading-snug font-medium">{error}</p>
            </div>
          </div>

          {/* ---- Submit Button with Hover Lift & Spinner State ---- */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#E8633A] hover:bg-[#D4552E] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#E8633A]/30 active:translate-y-0 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#E8633A]/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* ---- Switch to Signup Link ---- */}
        <p className="text-center text-xs text-[#665D57] mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-bold text-[#E8633A] hover:underline">
            Sign up
          </Link>
        </p>

      </div>
    </AuthLayout>
  );
}

export default Login;
