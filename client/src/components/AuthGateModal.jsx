import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ShieldCheck, ArrowRight, X, Lock, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthGateModal() {
  const { gateModalOpen, gateReason, closeGate } = useAuth();
  const navigate = useNavigate();

  if (!gateModalOpen) return null;

  const handleGoAuth = (mode = 'login') => {
    closeGate();
    navigate(`/${mode}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay with blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeGate}
          className="fixed inset-0 bg-[#231E1B]/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#F6EFE9] border border-[#E8DFD4] shadow-2xl p-6 sm:p-8 z-10"
        >
          {/* Subtle Ambient Glowing Orbs */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#E8633A]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#8BB59A]/20 blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={closeGate}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/80 border border-[#EADFD4] flex items-center justify-center text-[#665D57] hover:text-[#231E1B] hover:bg-white transition-all cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Badge & Title */}
          <div className="flex items-center space-x-2.5 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#E8633A] text-white flex items-center justify-center shadow-lg shadow-[#E8633A]/25">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E8633A] bg-[#E8633A]/10 px-2.5 py-0.5 rounded-full">
                Account Required
              </span>
              <h3 className="text-xl font-bold font-brand text-[#231E1B] mt-0.5">
                Log In or Sign Up to Continue
              </h3>
            </div>
          </div>

          <p className="text-sm text-[#665D57] mb-6 leading-relaxed">
            To <span className="font-semibold text-[#231E1B]">{gateReason}</span>, please log in to your Glow More account or create a free membership.
          </p>

          {/* Value Perks List */}
          <div className="space-y-3 mb-6 bg-white/70 border border-[#EADFD4] rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-lg bg-[#E8633A]/10 text-[#E8633A] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#231E1B]">60-Sec Clinical Bio-Diagnostic</p>
                <p className="text-[11px] text-[#665D57]">Get transparent explainable match scores tailored to your exact skin type & concerns.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-lg bg-[#8BB59A]/15 text-[#3C6E4E] flex items-center justify-center shrink-0 mt-0.5">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#231E1B]">Smart Dupe Finder (Save up to 70%)</p>
                <p className="text-[11px] text-[#665D57]">Access scientific trade-off comparisons and budget-friendly alternative formulations.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-lg bg-[#E8633A]/10 text-[#E8633A] flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#231E1B]">Saved Routine Basket & Express Checkout</p>
                <p className="text-[11px] text-[#665D57]">Save your customized regimen basket across devices with member-only pricing.</p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleGoAuth('login')}
              className="flex-1 py-3 px-5 rounded-2xl bg-[#E8633A] text-white text-xs font-bold shadow-md shadow-[#E8633A]/25 hover:bg-[#D4552E] transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Log In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleGoAuth('signup')}
              className="flex-1 py-3 px-5 rounded-2xl bg-white border border-[#EADFD4] text-[#231E1B] text-xs font-bold hover:bg-[#F3EBE4] transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Sign Up / Create Account</span>
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
