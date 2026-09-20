import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, ArrowRight, Check } from 'lucide-react';
import api from '../api/axios';
import AuthLayout from '../components/AuthLayout';

// Mirrors backend rule in server/src/middleware/validate.middleware.js.
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  }

  // Password requirement checks for live visual indicators
  const hasLength = form.password.length >= 8;
  const hasUpper = /[A-Z]/.test(form.password);
  const hasLower = /[a-z]/.test(form.password);
  const hasNumber = /\d/.test(form.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(form.password);

  function validate() {
    if (!form.name.trim()) return 'Name is required.';
    if (!EMAIL_PATTERN.test(form.email)) return 'A valid email is required.';
    if (!PASSWORD_PATTERN.test(form.password)) {
      return 'Password must be 8+ characters and include an uppercase letter, a lowercase letter, a number, and a special character.';
    }
    return '';
  }

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

  return (
    <AuthLayout activeTab="signup" onTabChange={(tab) => navigate(`/${tab}`)}>
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#E8633A]/10 text-[#E8633A] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Join Joyory Aura</span>
          </div>
          <h1 className="text-3xl font-bold font-brand text-[#231E1B] tracking-tight">
            Sign Up
          </h1>
          <p className="text-xs text-[#665D57] mt-1">
            Create your account to unlock personalized routine formulas, dupe matches, and member pricing.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-[#4B443F] mb-1.5" htmlFor="name-input">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8278]">
                <User className="w-4 h-4" />
              </div>
              <input
                id="name-input"
                name="name"
                placeholder="Name"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EADFD4] rounded-2xl text-xs text-[#231E1B] placeholder-[#A49B93] focus:outline-none focus:ring-2 focus:ring-[#E8633A]/30 focus:border-[#E8633A] transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Email Address */}
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
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EADFD4] rounded-2xl text-xs text-[#231E1B] placeholder-[#A49B93] focus:outline-none focus:ring-2 focus:ring-[#E8633A]/30 focus:border-[#E8633A] transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-[#4B443F] mb-1.5" htmlFor="password-input">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8278]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password-input"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-10 pr-11 py-2.5 bg-white border border-[#EADFD4] rounded-2xl text-xs text-[#231E1B] placeholder-[#A49B93] focus:outline-none focus:ring-2 focus:ring-[#E8633A]/30 focus:border-[#E8633A] transition-all shadow-sm"
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

            {/* Live Password Strength Chips */}
            {form.password.length > 0 && (
              <div className="mt-2.5 p-2.5 bg-[#F6EFE9]/60 rounded-xl border border-[#EADFD4]/60 grid grid-cols-2 gap-1.5 text-[10px]">
                <span className={`flex items-center space-x-1 ${hasLength ? 'text-emerald-700 font-bold' : 'text-[#8F8278]'}`}>
                  <Check className={`w-3 h-3 ${hasLength ? 'text-emerald-600' : 'text-transparent'}`} />
                  <span>8+ characters</span>
                </span>
                <span className={`flex items-center space-x-1 ${hasUpper ? 'text-emerald-700 font-bold' : 'text-[#8F8278]'}`}>
                  <Check className={`w-3 h-3 ${hasUpper ? 'text-emerald-600' : 'text-transparent'}`} />
                  <span>Uppercase letter</span>
                </span>
                <span className={`flex items-center space-x-1 ${hasLower ? 'text-emerald-700 font-bold' : 'text-[#8F8278]'}`}>
                  <Check className={`w-3 h-3 ${hasLower ? 'text-emerald-600' : 'text-transparent'}`} />
                  <span>Lowercase letter</span>
                </span>
                <span className={`flex items-center space-x-1 ${hasNumber && hasSpecial ? 'text-emerald-700 font-bold' : 'text-[#8F8278]'}`}>
                  <Check className={`w-3 h-3 ${hasNumber && hasSpecial ? 'text-emerald-600' : 'text-transparent'}`} />
                  <span>Number & special char</span>
                </span>
              </div>
            )}
          </div>

          {/* Error Message */}
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
            className="w-full py-3.5 px-4 rounded-2xl bg-[#E8633A] hover:bg-[#D4552E] text-white text-xs font-bold shadow-lg shadow-[#E8633A]/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer mt-2"
          >
            <span>{loading ? 'Signing up...' : 'Sign Up'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Switch to Login */}
        <p className="text-center text-xs text-[#665D57] mt-5">
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
