import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, X, ArrowRight, Trash2, AlertCircle } from 'lucide-react';
import { useCompare } from '../context/CompareContext';

/**
 * ==============================================================================
 * CompareBar Component — Luxury Floating Comparison Dock
 * ==============================================================================
 *
 * Appears dynamically at the bottom of the screen once 1 or more products
 * are staged for comparison. Shows:
 *   - Micro-thumbnails with instant quick-remove buttons
 *   - Empty slot indicators ("Add 1 more to compare")
 *   - Real-time toast notifications when hitting the 3-product cap
 *   - High-contrast terracotta "Compare Now" primary CTA
 *   - Automatically hides when the user is already on the `/compare` page
 */

function imgSrc(p) {
  const cl = p?.cloudinary_link || '';
  return (!cl || cl.endsWith('.glb') || cl.endsWith('.gltf')) ? null : cl;
}

export default function CompareBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { compareList, compareCount, maxItems, removeFromCompare, clearCompare, toastMessage, dismissToast } = useCompare();

  // Hide the floating bar when user is already viewing the comparison page or has 0 items
  const isComparePage = location.pathname === '/compare';
  const isVisible = compareCount > 0 && !isComparePage;

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
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#231E1B]/95 backdrop-blur-xl border border-white/15 text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] max-w-[95vw]"
          >
            {/* Left Badge: Icon + Count */}
            <div className="flex items-center gap-2 pr-2 sm:pr-3 border-r border-white/10 shrink-0">
              <div className="w-8 h-8 rounded-full bg-[#E8633A] flex items-center justify-center text-white shadow-sm">
                <Scale className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-[11px] font-bold text-white tracking-wide">Compare</div>
                <div className="text-[10px] text-white/60 font-medium">
                  {compareCount} of {maxItems} selected
                </div>
              </div>
            </div>

            {/* Product Thumbnails / Slot Indicators */}
            <div className="flex items-center gap-2">
              {compareList.map((product) => {
                const src = imgSrc(product);
                const pid = product.id || product._id;
                return (
                  <div
                    key={pid}
                    className="relative group w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center shrink-0"
                    title={product.name}
                  >
                    {src ? (
                      <img
                        src={src}
                        alt={product.name}
                        className="w-full h-full object-cover"
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
                      className="absolute inset-0 bg-[#231E1B]/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 text-[#E8633A]" />
                    </button>
                  </div>
                );
              })}

              {/* Empty placeholder slot if less than maxItems */}
              {Array.from({ length: maxItems - compareCount }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  className="hidden md:flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-dashed border-white/25 text-white/40 text-[10px] font-bold"
                  title="Select another product to compare"
                >
                  +{idx + 1}
                </div>
              ))}
            </div>

            {/* Right Actions: Clear + Compare Button */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/10 shrink-0">
              <button
                onClick={clearCompare}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Clear all selected products"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>

              <button
                onClick={() => navigate('/compare')}
                className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-[#E8633A] hover:bg-[#D4552E] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#E8633A]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>Compare Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
