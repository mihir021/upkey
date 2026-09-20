import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, X, ArrowRight, Trash2, AlertCircle, Lock, Sparkles, Plus } from 'lucide-react';
import { useCompare } from '../context/CompareContext';

/**
 * ==============================================================================
 * CompareBar Component — Luxury Floating Comparison Dock
 * ==============================================================================
 *
 * Appears dynamically at the bottom of the screen once 1 or more products
 * are staged for comparison.
 *
 * Key Capabilities & UX Logic:
 *   - Strict 2-Product Minimum: The "Compare Now" CTA is activated ONLY when
 *     compareCount >= 2.
 *   - Disabled Feedback: If clicked with only 1 product, triggers a playful
 *     micro-shake vibration and displays an animated guidance tooltip
 *     informing the user that at least 2 products are required.
 *   - Luminous Active State: Vibrant terracotta gradient, glowing beacon, and
 *     responsive Framer Motion spring physics.
 *   - Slot Visualization: Distinguishes between filled products, required Slot 2,
 *     and optional Slot 3.
 *   - Dynamic Progress: Ambient top indicator bar showing real-time completion.
 *   - Automatically hides when the user is already on the `/compare` page.
 */

function imgSrc(p) {
  const cl = p?.cloudinary_link || '';
  return (!cl || cl.endsWith('.glb') || cl.endsWith('.gltf')) ? null : cl;
}

export default function CompareBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { compareList, compareCount, maxItems, removeFromCompare, clearCompare, toastMessage, dismissToast } = useCompare();

  // Micro-shake & guidance tooltip state when user attempts to compare with < 2 items
  const [shake, setShake] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Hide the floating bar when user is already viewing the comparison page or has 0 items
  const isComparePage = location.pathname === '/compare';
  const isVisible = compareCount > 0 && !isComparePage;

  // Comparison is strictly activated only when 2 or more products are staged
  const canCompare = compareCount >= 2;

  /**
   * Handle primary CTA click:
   * If at least 2 products are staged, navigate to the comparison matrix.
   * If only 1 product is staged, provide tactile feedback (shake + tooltip).
   */
  const handleCompareClick = () => {
    if (!canCompare) {
      setShake(true);
      setShowTooltip(true);
      setTimeout(() => setShake(false), 550);
      setTimeout(() => setShowTooltip(false), 3000);
      return;
    }
    navigate('/compare');
  };

  return (
    <>
      {/* ── Toast Notification for Cap Warning ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full bg-[#231E1B] text-white text-xs font-semibold shadow-2xl border border-[#E8633A]/40"
          >
            <AlertCircle className="w-4 h-4 text-[#E8633A] shrink-0" />
            <span>{toastMessage}</span>
            <button
              onClick={dismissToast}
              className="ml-2 text-white/60 hover:text-white cursor-pointer"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Persistent Floating Comparison Bar ── */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            exit={{ y: 100, opacity: 0, x: '-50%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#231E1B]/95 backdrop-blur-xl border border-white/15 text-white shadow-[0_16px_48px_rgba(0,0,0,0.4)] max-w-[95vw]"
          >
            {/* Ambient Top Progress Line */}
            <div className="absolute top-0 left-6 right-6 h-[2.5px] bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 via-[#E8633A] to-emerald-400"
                initial={{ width: '33%' }}
                animate={{ width: `${(compareCount / maxItems) * 100}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            </div>

            {/* Left Badge: Icon + Dynamic Real-Time Status */}
            <div className="flex items-center gap-2.5 pr-2 sm:pr-3 border-r border-white/10 shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm transition-colors duration-300 ${
                  canCompare ? 'bg-[#E8633A]' : 'bg-white/15 text-white/70'
                }`}
              >
                <Scale className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-[11px] font-bold text-white tracking-wide flex items-center gap-1.5">
                  <span>Compare</span>
                  {canCompare ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                      Ready
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/30">
                      Need 2+
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-white/60 font-medium flex items-center gap-1 mt-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full inline-block ${
                      compareCount === 1
                        ? 'bg-amber-400 animate-pulse'
                        : compareCount === 2
                        ? 'bg-emerald-400'
                        : 'bg-[#E8633A]'
                    }`}
                  />
                  <span>
                    {compareCount === 1
                      ? '1 of 3 • Add 1 more'
                      : compareCount === 2
                      ? '2 of 3 • Ready to compare!'
                      : '3 of 3 • Maximum reached'}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Thumbnails / Animated Slots */}
            <div className="flex items-center gap-2">
              <AnimatePresence mode="popLayout">
                {compareList.map((product) => {
                  const src = imgSrc(product);
                  const pid = product.id || product._id;
                  return (
                    <motion.div
                      key={pid}
                      layout
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ type: 'spring', damping: 22, stiffness: 350 }}
                      className="relative group w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center shrink-0 shadow-inner"
                      title={product.name}
                    >
                      {src ? (
                        <img
                          src={src}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <span className="text-xs font-bold text-[#E8633A]">
                          {product.brand?.[0] || 'G'}
                        </span>
                      )}
                      {/* Remove micro-button on hover */}
                      <button
                        onClick={() => removeFromCompare(pid)}
                        aria-label={`Remove ${product.name} from compare`}
                        className="absolute inset-0 bg-[#231E1B]/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5 text-[#E8633A] stroke-[2.5]" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Empty placeholder slot indicators */}
              {Array.from({ length: maxItems - compareCount }).map((_, idx) => {
                const slotNumber = compareCount + idx + 1;
                const isRequired = slotNumber === 2;
                return (
                  <div
                    key={`empty-slot-${slotNumber}`}
                    className={`hidden md:flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-dashed text-[10px] font-bold transition-all duration-300 ${
                      isRequired
                        ? 'border-amber-400/50 bg-amber-400/10 text-amber-300 animate-pulse'
                        : 'border-white/25 text-white/40 bg-white/5'
                    }`}
                    title={
                      isRequired
                        ? 'Slot 2 (Required: Add 1 more to compare)'
                        : `Slot ${slotNumber} (Optional)`
                    }
                  >
                    +{slotNumber}
                  </div>
                );
              })}
            </div>

            {/* Right Actions: Clear + Compare CTA */}
            <div className="relative flex items-center gap-2 pl-2 border-l border-white/10 shrink-0">
              {/* Guidance Tooltip when user clicks disabled button */}
              <AnimatePresence>
                {showTooltip && !canCompare && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.9 }}
                    animate={{ opacity: 1, y: -46, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 350 }}
                    className="absolute -top-3 right-0 sm:right-2 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-[#231E1B] text-[11px] font-black shadow-2xl whitespace-nowrap pointer-events-none"
                  >
                    <AlertCircle className="w-3.5 h-3.5 stroke-[2.6] shrink-0" />
                    <span>Select at least 2 products to compare!</span>
                    <div className="absolute -bottom-1 right-6 w-2 h-2 bg-amber-400 rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Clear Selection */}
              <button
                onClick={clearCompare}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Clear all selected products"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>

              {/* Activated / Deactivated Compare Button */}
              <motion.button
                onClick={handleCompareClick}
                animate={shake ? { x: [-7, 7, -5, 5, -2, 2, 0] } : {}}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                whileHover={canCompare ? { scale: 1.05 } : { scale: 1 }}
                whileTap={canCompare ? { scale: 0.95 } : { scale: 0.98 }}
                aria-disabled={!canCompare}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
                  canCompare
                    ? 'bg-gradient-to-r from-[#E8633A] via-[#F2734C] to-[#D44E28] hover:from-[#f07149] hover:to-[#e05630] text-white shadow-lg shadow-[#E8633A]/35 hover:shadow-[#E8633A]/60 cursor-pointer'
                    : 'bg-white/10 text-white/50 border border-white/15 cursor-not-allowed hover:bg-white/15 hover:text-white/70'
                }`}
                title={canCompare ? 'View Side-by-Side Comparison' : 'Add at least 2 products to unlock comparison'}
              >
                {canCompare ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    <span>Compare Now ({compareCount})</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.4]" />
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="hidden xs:inline">Add 1 More to Compare</span>
                    <span className="xs:hidden">Add 1 More</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

