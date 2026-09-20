import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import AuthLayout from '../components/AuthLayout';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  }

  // Quick fill for testing
  function handleFillDemo() {
    setForm({
      email: 'testupkey@example.com',
      password: 'StrongP@ssword1',
    });
    setError('');
  }

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

  return (
    <AuthLayout activeTab="login" onTabChange={(tab) => navigate(`/${tab}`)}>
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#E8633A]/10 text-[#E8633A] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Welcome Back</span>
          </div>
          <h1 className="text-3xl font-bold font-brand text-[#231E1B] tracking-tight">
            Log In
          </h1>
          <p className="text-xs text-[#665D57] mt-1">
            Access your personalized skin match diagnostics, saved routines, and dupe alerts.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold text-[#4B443F] mb-1.5" htmlFor="email-input">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8278]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email-input"
                name="email"
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#EADFD4] rounded-2xl text-xs text-[#231E1B] placeholder-[#A49B93] focus:outline-none focus:ring-2 focus:ring-[#E8633A]/30 focus:border-[#E8633A] transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#4B443F]" htmlFor="password-input">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8278]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password-input"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-10 pr-11 py-3 bg-white border border-[#EADFD4] rounded-2xl text-xs text-[#231E1B] placeholder-[#A49B93] focus:outline-none focus:ring-2 focus:ring-[#E8633A]/30 focus:border-[#E8633A] transition-all shadow-sm"
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

          {/* Error Message Box */}
          {error && (
            <div className="flex items-start space-x-2 p-3.5 rounded-2xl bg-red-50/90 border border-red-200 text-red-700 text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <p className="leading-snug">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#E8633A] hover:bg-[#D4552E] text-white text-xs font-bold shadow-lg shadow-[#E8633A]/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
          >
            <span>{loading ? 'Logging in...' : 'Log In'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Demo Quick Fill helper */}
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

        {/* Bottom Switch Link */}
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
