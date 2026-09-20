import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, ArrowLeft, ShieldCheck, Sparkles, Award, Quote, CheckCircle2 } from 'lucide-react';

/**
 * AuthLayout Component
 * 
 * Shared luxury editorial wrapper for Login and Signup views:
 * 1. Background Atmosphere: Ambient terracotta and sage glowing orbs + delicate dot grid.
 * 2. Card Container: Elevated card with multi-layer shadow and entrance scale animation.
 * 3. Left Visual Panel: Slow ambient breathing zoom on luxury skincare bottle, rich warm
 *    gradient overlay, staggered fade-up text typography, doctor quote, and trust pills.
 * 4. Right Form Panel: Framer Motion sliding pill tab switcher between Log In and Sign Up.
 * 5. Responsive: Desktop 2-column split-screen, mobile stacked with sleek compact header.
 */
export default function AuthLayout({ children, activeTab, onTabChange }) {
  return (
    <div className="min-h-screen bg-[#F6EFE9] text-[#231E1B] flex flex-col justify-center selection:bg-[#E8633A] selection:text-white relative overflow-hidden px-4 py-8 sm:py-12">
      
      {/* ====================================================================
          1. AMBIENT BACKGROUND (Gradient Blobs + Subtle Pattern)
          ==================================================================== */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[#E8633A]/10 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-[#8BB59A]/15 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#FDFBF7]/60 blur-[140px] pointer-events-none -z-20" />
      
      {/* Subtle Dot Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none -z-10"
        style={{
          backgroundImage: 'radial-gradient(#231E1B 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* ====================================================================
          2. MAIN CARD CONTAINER (Elevated Card with Entrance Animation)
          ==================================================================== */}
      <div className="relative z-10 w-full max-w-5xl mx-auto my-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-[32px] sm:rounded-[36px] bg-white/85 backdrop-blur-xl border border-[#E8DFD4] shadow-[0_24px_60px_rgba(35,30,27,0.08),0_2px_8px_rgba(35,30,27,0.04)] grid grid-cols-1 lg:grid-cols-12 min-h-[640px] lg:h-[700px]"
        >
          
          {/* ==================================================================
              LEFT PANEL: BRAND & LUXURY VISUAL SIDE (Desktop: 5 cols, Mobile: Top Banner)
              ================================================================== */}
          <div className="relative lg:col-span-5 bg-[#23120A] text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between overflow-hidden min-h-[220px] sm:min-h-[280px] lg:min-h-0">
            
            {/* Background Luxury Skincare Image with Slow Ambient Zoom (5-8s ease) */}
            <motion.img
              src="/assets/auth-hero.jpg"
              alt="Glow More luxury skincare formulation container"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
            />

            {/* Rich Gradient: Deep warm terracotta/brown at bottom fading smoothly to transparent at top */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#201007] via-[#2D160C]/75 to-transparent" />
            <div className="absolute inset-0 bg-[#E8633A]/10 mix-blend-color pointer-events-none" />

            {/* Top Logo */}
            <div className="relative z-10">
              <Link to="/" className="inline-flex items-center gap-3 group" aria-label="Glow More Home">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E8633A] via-[#E8633A] to-[#D44E28] flex items-center justify-center text-white shadow-md shadow-[#E8633A]/30 group-hover:scale-105 transition-transform duration-200">
                  <Leaf className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-xl font-bold font-brand tracking-tight text-white block leading-none">
                    Glow More
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-[#F6EFE9]/75 block mt-0.5">
                    Explainable Beauty AI
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle Feature Highlights: Staggered Fade-Up Entrance (Desktop/Tablet) */}
            <div className="relative z-10 hidden sm:block space-y-4 my-auto py-6">
              
              {/* Badge: Stagger 1 (150ms delay) */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.45, ease: 'easeOut' }}
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFB69E]" />
                  <span>60-Sec Skin Diagnostic Engine</span>
                </span>
              </motion.div>

              {/* Headline: Stagger 2 (300ms delay) */}
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.30, duration: 0.45, ease: 'easeOut' }}
                className="text-2xl sm:text-3xl font-bold font-brand leading-tight text-white tracking-tight"
              >
                Intelligent Skincare, <br />
                Tailored to Your Biology.
              </motion.h2>

              {/* Subtext: Stagger 3 (450ms delay) */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.45, ease: 'easeOut' }}
                className="text-xs text-[#F6EFE9]/85 max-w-sm leading-relaxed"
              >
                Access personalized bio-compatibility percentages, smart dupe savings up to 70%, and complete formulation transparency.
              </motion.p>

              {/* Verified Quote Snippet: Stagger 4 (600ms delay) */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.60, duration: 0.45, ease: 'easeOut' }}
                className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-[11px] text-[#F6EFE9] space-y-1 max-w-sm"
              >
                <div className="flex items-center gap-1 text-[#FFB69E] mb-1">
                  <Quote className="w-3 h-3" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Clinical Insight</span>
                </div>
                <p className="italic leading-relaxed text-[#F6EFE9]/90">
                  “A transparent AI engine that explains the exact ingredients suited for your lipid barrier.”
                </p>
                <p className="text-[10px] font-bold text-[#FFB69E] uppercase tracking-wider pt-0.5">
                  — Dr. Elena R., Dermatological Chemist
                </p>
              </motion.div>

            </div>

            {/* Bottom Trust Row: Icon + Text Pill Treatments with Clean Dividers */}
            <div className="relative z-10 pt-4 border-t border-white/15 hidden sm:flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/12 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8BB59A]" />
                <span>Dermatologist Approved</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/12 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white shadow-2xs">
                <Award className="w-3.5 h-3.5 text-[#FFB69E]" />
                <span>98.4% Accuracy</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/12 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#8BB59A]" />
                <span>100% Transparent</span>
              </div>
            </div>

          </div>

          {/* ==================================================================
              RIGHT PANEL: FORM CONTENT WITH SLIDING PILL SWITCHER (7 cols)
              ================================================================== */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-[#FDFBF7]/90 min-w-0">
            
            {/* Top Bar: Back Link & Animated Sliding Segmented Control */}
            <div className="flex items-center justify-between pb-4 border-b border-[#EADFD4]">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#665D57] hover:text-[#E8633A] transition-colors group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to Experience</span>
              </Link>

              {/* Sliding Pill / Segmented Control (Smooth 200ms Highlighted Slider) */}
              <div className="relative inline-flex p-1 rounded-full bg-[#EFE6DC] border border-[#E4D7CA]">
                <Link
                  to="/login"
                  onClick={(e) => {
                    if (onTabChange) {
                      e.preventDefault();
                      onTabChange('login');
                    }
                  }}
                  className={`relative z-10 px-4 py-1.5 text-xs font-bold rounded-full transition-colors duration-200 cursor-pointer ${
                    activeTab === 'login' ? 'text-[#231E1B]' : 'text-[#7A706A] hover:text-[#231E1B]'
                  }`}
                >
                  Log In
                  {activeTab === 'login' && (
                    <motion.div
                      layoutId="auth-sliding-tab"
                      className="absolute inset-0 rounded-full bg-white shadow-xs border border-[#E8DFD4] -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 35, duration: 0.2 }}
                    />
                  )}
                </Link>

                <Link
                  to="/signup"
                  onClick={(e) => {
                    if (onTabChange) {
                      e.preventDefault();
                      onTabChange('signup');
                    }
                  }}
                  className={`relative z-10 px-4 py-1.5 text-xs font-bold rounded-full transition-colors duration-200 cursor-pointer ${
                    activeTab === 'signup' ? 'text-[#231E1B]' : 'text-[#7A706A] hover:text-[#231E1B]'
                  }`}
                >
                  Sign Up
                  {activeTab === 'signup' && (
                    <motion.div
                      layoutId="auth-sliding-tab"
                      className="absolute inset-0 rounded-full bg-white shadow-xs border border-[#E8DFD4] -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 35, duration: 0.2 }}
                    />
                  )}
                </Link>
              </div>
            </div>

            {/* Form Slot — vertically centered */}
            <div className="py-4 my-auto max-w-md w-full mx-auto">
              {children}
            </div>

            {/* Footer Assurance */}
            <div className="pt-4 border-t border-[#EADFD4] flex items-center justify-between text-[11px] text-[#8F8278]">
              <span>Glow More © 2026 • Encrypted & Secure</span>
              <span className="hidden sm:inline">Explainable AI Shopping Engine</span>
            </div>

          </div>

        </motion.div>
      </div>
    </div>
  );
}
