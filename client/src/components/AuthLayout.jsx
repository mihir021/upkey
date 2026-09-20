import { Link } from 'react-router-dom';
import { Leaf, ArrowLeft, ShieldCheck, Sparkles, Award } from 'lucide-react';

export default function AuthLayout({ children, activeTab, onTabChange }) {
  return (
    <div className="min-h-screen bg-[#F6EFE9] text-[#231E1B] flex flex-col justify-center selection:bg-[#E8633A] selection:text-white relative overflow-hidden">
      {/* Background Ambient Orbs */}
      <div className="ambient-background" />
      <div className="ambient-orb ambient-orb--terracotta" />
      <div className="ambient-orb ambient-orb--cream" />
      <div className="ambient-orb ambient-orb--emerald" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 my-auto">
        <div className="overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-[#E8DFD4] shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* ================================================================
              VISUAL COLUMN (Left on desktop)
              ================================================================ */}
          <div className="relative lg:col-span-5 bg-[#231E1B] text-white p-8 sm:p-10 flex flex-col justify-between overflow-hidden min-h-[320px] lg:min-h-[640px]">
            {/* Background Luxury Skincare Image */}
            <img
              src="/assets/auth-hero.jpg"
              alt="Joyory luxury skincare bottle with botanical serum"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-85 scale-105 transition-transform duration-1000 hover:scale-100"
            />
            {/* Deep Warm Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#231E1B] via-[#231E1B]/40 to-transparent" />
            <div className="absolute inset-0 bg-[#E8633A]/15 mix-blend-overlay" />

            {/* Top Logo & Tagline */}
            <div className="relative z-10">
              <Link to="/" className="inline-flex items-center space-x-2.5 group">
                <div className="w-10 h-10 rounded-2xl bg-[#E8633A] flex items-center justify-center text-white shadow-md shadow-[#E8633A]/30 group-hover:scale-105 transition-transform">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-bold font-brand tracking-tight text-white block">
                    Joyory Aura
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#F6EFE9]/80 block">
                    Explainable Beauty AI
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle Feature Highlights (Desktop Only) */}
            <div className="relative z-10 hidden sm:block space-y-3 my-auto py-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
                <Sparkles className="w-3.5 h-3.5 text-[#FFB69E]" />
                <span>60-Sec Skin Diagnostic Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-brand leading-tight text-white">
                Intelligent Skincare, <br />
                Tailored to Your Biology.
              </h2>
              <p className="text-xs text-[#F6EFE9]/80 max-w-sm leading-relaxed">
                Log in to unlock clinical match percentages, smart dupe cost savings up to 70%, and a zero-BS ingredient breakdown.
              </p>
            </div>

            {/* Bottom Glassmorphic Badges */}
            <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#8BB59A]" />
                <span className="text-[11px] font-medium text-white/90">
                  Dermatologist Approved
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-[#FFB69E]" />
                <span className="text-[11px] font-medium text-white/90">
                  98.4% Accuracy Score
                </span>
              </div>
            </div>
          </div>

          {/* ================================================================
              FORM COLUMN (Right on desktop)
              ================================================================ */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-[#FDFBF7]/90">
            {/* Top Bar: Back Link & Navigation */}
            <div className="flex items-center justify-between pb-4 border-b border-[#EADFD4]">
              <Link
                to="/"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#665D57] hover:text-[#E8633A] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Experience</span>
              </Link>

              {/* Segmented Mode Switcher */}
              <div className="inline-flex p-1 rounded-xl bg-[#EDE2D7]/70 border border-[#E4D7CA]">
                <Link
                  to="/login"
                  onClick={(e) => {
                    if (onTabChange) {
                      e.preventDefault();
                      onTabChange('login');
                    }
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'login'
                      ? 'bg-white text-[#231E1B] shadow-sm'
                      : 'text-[#665D57] hover:text-[#231E1B]'
                  }`}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={(e) => {
                    if (onTabChange) {
                      e.preventDefault();
                      onTabChange('signup');
                    }
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'signup'
                      ? 'bg-white text-[#231E1B] shadow-sm'
                      : 'text-[#665D57] hover:text-[#231E1B]'
                  }`}
                >
                  Sign Up
                </Link>
              </div>
            </div>

            {/* Form Slot */}
            <div className="py-6 my-auto max-w-md w-full mx-auto">
              {children}
            </div>

            {/* Footer Assurance */}
            <div className="pt-4 border-t border-[#EADFD4] flex items-center justify-between text-[11px] text-[#8F8278]">
              <span>Joyory Aura © 2026 • Encrypted & Secure</span>
              <span className="hidden sm:inline">Personalized AI Shopping Experience</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
