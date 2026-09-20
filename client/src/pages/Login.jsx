import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import AuthLayout from '../components/AuthLayout';

// ============================================================================
// Login Page
// Provides email + password authentication with demo credential quick-fill.
// ============================================================================
function Login() {
  const navigate = useNavigate();

  // ---------- state ----------
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ---------- handlers ----------
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  }

  // Pre-fill demo credentials for quick testing
  function handleFillDemo() {
    setForm({
      email: 'testupkey@example.com',
      password: 'StrongP@ssword1',
    });
    setError('');
  }

  // ---------- submit ----------
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
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
        {/* ---- Header ---- */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8633A]/10 text-[#E8633A] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Welcome Back</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-brand text-[#231E1B] tracking-tight">
            Log In
          </h1>
          <p className="text-xs text-[#665D57] mt-1 leading-relaxed">
            Access your personalized skin match diagnostics, saved routines, and dupe alerts.
          </p>
        </div>

        {/* ---- Form ---- */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold text-[#4B443F] mb-1.5" htmlFor="login-email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8278]">
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
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#EADFD4] rounded-xl text-sm text-[#231E1B] placeholder-[#A49B93] focus:outline-none focus:ring-2 focus:ring-[#E8633A]/30 focus:border-[#E8633A] transition-all duration-200 shadow-sm hover:border-[#D4C8BA]"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#4B443F]" htmlFor="login-password">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8278]">
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
                className="w-full pl-10 pr-11 py-3 bg-white border border-[#EADFD4] rounded-xl text-sm text-[#231E1B] placeholder-[#A49B93] focus:outline-none focus:ring-2 focus:ring-[#E8633A]/30 focus:border-[#E8633A] transition-all duration-200 shadow-sm hover:border-[#D4C8BA]"
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
          </div>

          {/* ---- Error Message (animated, no layout shift) ---- */}
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: error ? '80px' : '0px',
              opacity: error ? 1 : 0,
            }}
          >
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50/90 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <p className="leading-snug">{error}</p>
            </div>
          </div>

          {/* ---- Submit Button ---- */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#E8633A] hover:bg-[#D4552E] active:scale-[0.98] text-white text-sm font-bold shadow-lg shadow-[#E8633A]/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <span>{loading ? 'Logging in...' : 'Log In'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* ---- Demo Quick Fill ---- */}
        <div className="mt-4 pt-3 border-t border-[#EADFD4]/70 flex items-center justify-between">
          <span className="text-[11px] text-[#8F8278]">Need demo credentials?</span>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-[11px] font-bold text-[#E8633A] hover:underline cursor-pointer"
          >
            Auto-fill Demo
          </button>
        </div>

        {/* ---- Switch to Signup ---- */}
        <p className="text-center text-xs text-[#665D57] mt-5">
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
