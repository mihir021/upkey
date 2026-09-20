import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Leaf } from 'lucide-react';

/**
 * Diagnostic status lines cycled in exact order to simulate
 * the AI bio-telemetry formulation calculation.
 */
const STATUS_STEPS = [
  'Calibrating skin biomarkers...',
  'Cross-referencing active ingredients...',
  'Running compatibility diagnostics...',
  'Finalizing your formulation match...'
];

/**
 * LoadingScreen Component
 * 
 * "Formulation Engine Initializing" — Premium biotech AI loading screen.
 * 
 * Features:
 * 1. Background: Cream base (#F6EFE9) with subtle particle dot grid and drifting terracotta aura.
 * 2. Center Visual: Glowing brand badge with heartbeat scan ring, animated SVG circular progress ring,
 *    and orbiting active-ingredient electron particles.
 * 3. Telemetry Feedback: Fraunces headline, cycling status lines with AnimatePresence crossfades,
 *    and non-linear percentage counter (0% -> 100%).
 * 4. Exit Transition: Satisfying pulse flash at 100%, followed by a graceful scale+fade exit (1 -> 1.05).
 * 5. Accessibility: Full prefers-reduced-motion fallback with simplified motion.
 * 6. Variants: Supports 'fullscreen' (default app mount overlay) or 'inline' (route/section transitions).
 * 
 * @param {Object} props
 * @param {Function} [props.onComplete] - Callback fired when progress reaches 100% and exit finishes.
 * @param {'fullscreen'|'inline'} [props.variant='fullscreen'] - Display layout mode.
 * @param {number} [props.duration=2100] - Total calibration time in milliseconds (under 2.5s).
 */
export default function LoadingScreen({
  onComplete,
  variant = 'fullscreen',
  duration = 2100
}) {
  const shouldReduceMotion = useReducedMotion();

  // Progress state (0 to 100)
  const [progress, setProgress] = useState(0);

  // Active status text index
  const [statusIndex, setStatusIndex] = useState(0);

  // Completed exit state trigger
  const [isFinished, setIsFinished] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  // Timing references
  const [initialTime] = useState(() => Date.now());
  const startTimeRef = useRef(initialTime);
  const reqAnimRef = useRef(null);

  // SVG Progress Ring Geometry
  const ringSize = 160;
  const strokeWidth = 3.5;
  const center = ringSize / 2;
  const radius = center - strokeWidth - 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Non-linear calibration progress loop
  useEffect(() => {
    startTimeRef.current = Date.now();

    const updateFrame = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const t = Math.min(1, elapsed / duration);

      // Organic easing: quick start, thoughtful pause in the 70s for computation, snappy finish
      const easedProgress = Math.min(
        100,
        Math.round(
          t < 0.7
            ? 85 * Math.sin((t / 0.7) * (Math.PI / 2))
            : 85 + 15 * Math.pow((t - 0.7) / 0.3, 1.6)
        )
      );

      setProgress(easedProgress);

      // Cycle status lines based on completion phase
      if (t < 0.28) {
        setStatusIndex(0);
      } else if (t < 0.58) {
        setStatusIndex(1);
      } else if (t < 0.88) {
        setStatusIndex(2);
      } else {
        setStatusIndex(3);
      }

      if (t < 1) {
        reqAnimRef.current = requestAnimationFrame(updateFrame);
      } else {
        setProgress(100);
        setIsFlashing(true);

        // Flash and trigger exit
        const exitTimer = setTimeout(() => {
          setIsFinished(true);
          if (onComplete) {
            onComplete();
          }
        }, 320);

        return () => clearTimeout(exitTimer);
      }
    };

    reqAnimRef.current = requestAnimationFrame(updateFrame);

    return () => {
      if (reqAnimRef.current) {
        cancelAnimationFrame(reqAnimRef.current);
      }
    };
  }, [duration, onComplete]);

  // If finished and in fullscreen mode, we let the wrapper handle unmounting
  const isFullscreen = variant === 'fullscreen';

  const containerClasses = isFullscreen
    ? 'fixed inset-0 z-[9999] flex items-center justify-center bg-[#F6EFE9] text-[#231E1B] overflow-hidden select-none'
    : 'relative w-full py-16 flex items-center justify-center bg-[#F6EFE9] text-[#231E1B] rounded-3xl overflow-hidden select-none';

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          key="glow-more-loading-screen"
          initial={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: shouldReduceMotion ? 1 : 1.05,
            transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
          }}
          className={containerClasses}
          aria-live="polite"
          aria-label="Loading Glow More formulation engine"
        >
          {/* ==================================================================
              1. BACKGROUND (Ambient gradient blob + subtle particle dot field)
              ================================================================== */}
          {/* Faint Dot Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#231E1B 1.2px, transparent 1.2px)',
              backgroundSize: '22px 22px'
            }}
          />

          {/* Soft Pulsing Ambient Terracotta Blob */}
          <motion.div
            animate={
              shouldReduceMotion
                ? { opacity: 0.15 }
                : {
                    scale: [1, 1.2, 1],
                    opacity: [0.12, 0.22, 0.12],
                    x: [-12, 12, -12],
                    y: [-10, 10, -10]
                  }
            }
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-[420px] h-[420px] rounded-full bg-gradient-to-br from-[#E8633A] via-[#F38763] to-amber-300 blur-[110px] pointer-events-none -z-10"
          />

          {/* Secondary Sage Bio-Glow Blob */}
          <div className="absolute w-[300px] h-[300px] rounded-full bg-[#8BB59A]/15 blur-[90px] pointer-events-none -z-10 -bottom-10 -right-10" />

          {/* ==================================================================
              2. CENTER VISUAL (Hero animation: badge, progress ring, orbiting dots)
              ================================================================== */}
          <div className="flex flex-col items-center justify-center text-center px-6 max-w-sm w-full relative z-10">
            
            {/* Circular Orbit & Ring Stage */}
            <div className="relative flex items-center justify-center mb-6" style={{ width: ringSize, height: ringSize }}>
              
              {/* Scan Pulse Glow Ring (1.5s Loop) */}
              <motion.div
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        scale: [0.95, 1.32, 0.95],
                        opacity: [0.45, 0, 0.45]
                      }
                }
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border border-[#E8633A]/60 pointer-events-none"
              />

              {/* Secondary Outer Ripple */}
              {!shouldReduceMotion && (
                <motion.div
                  animate={{
                    scale: [1, 1.45, 1],
                    opacity: [0.25, 0, 0.25]
                  }}
                  transition={{ duration: 1.5, delay: 0.25, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full border border-[#E8633A]/30 pointer-events-none"
                />
              )}

              {/* Orbiting Particle 1: Primary Active Molecule */}
              {!shouldReduceMotion && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E8633A] shadow-[0_0_10px_#E8633A] absolute -top-1 left-1/2 -translate-x-1/2" />
                </motion.div>
              )}

              {/* Orbiting Particle 2: Secondary Stabilizer Particle */}
              {!shouldReduceMotion && (
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 4.6, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#F59E0B] absolute -bottom-1 left-1/2 -translate-x-1/2" />
                </motion.div>
              )}

              {/* Orbiting Particle 3: Bio-Lipid Electron */}
              {!shouldReduceMotion && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6.2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E8633A]/80 shadow-[0_0_6px_#E8633A] absolute top-1/2 -right-0.5 -translate-y-1/2" />
                </motion.div>
              )}

              {/* SVG Circular Progress Ring */}
              <svg
                width={ringSize}
                height={ringSize}
                viewBox={`0 0 ${ringSize} ${ringSize}`}
                className="transform -rotate-90 pointer-events-none"
              >
                <defs>
                  <linearGradient id="glowRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E8633A" />
                    <stop offset="60%" stopColor="#F27A52" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>

                {/* Track Background */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="#EADFD4"
                  strokeWidth={strokeWidth}
                  className="opacity-70"
                />

                {/* Animated Calibrating Fill */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="url(#glowRingGradient)"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-[stroke-dashoffset] duration-150 ease-out"
                />
              </svg>

              {/* Animated Logo Mark Centerpiece */}
              <motion.div
                animate={
                  isFlashing
                    ? { scale: [1, 1.15, 1], filter: 'brightness(1.2)' }
                    : shouldReduceMotion
                    ? {}
                    : { scale: [1, 1.04, 1] }
                }
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E8633A] via-[#E8633A] to-[#D44E28] flex items-center justify-center text-white shadow-xl shadow-[#E8633A]/30 z-10"
              >
                <Leaf className="w-8 h-8 stroke-[2.2]" />
              </motion.div>

            </div>

            {/* ==================================================================
                3. TEXT BELOW LOGO (Brand Title, Telemetry %, Status Cycling)
                ================================================================== */}
            {/* Brand Title */}
            <div className="space-y-0.5 mb-3">
              <h2 className="text-xl sm:text-2xl font-bold font-brand tracking-tight text-[#231E1B]">
                GLOW MORE
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8633A] bg-[#E8633A]/10 border border-[#E8633A]/20 px-2.5 py-0.5 rounded-full inline-block">
                Explainable Beauty AI
              </span>
            </div>

            {/* Cycling Status Text with AnimatePresence Fade-Crossfade */}
            <div className="h-7 flex items-center justify-center my-1 w-full overflow-hidden">
              <AnimatePresence>
                <motion.p
                  key={statusIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="text-xs font-semibold text-[#665D57] tracking-tight truncate"
                >
                  {STATUS_STEPS[statusIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Percentage Counter & Telemetry Line */}
            <div className="w-full max-w-[190px] mt-1 space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold text-[#8A7D75]">
                <span className="uppercase tracking-wider">Bio-Match Score</span>
                <span className="text-[#E8633A] font-extrabold">{progress}%</span>
              </div>

              {/* Micro Progress Bar */}
              <div className="w-full bg-[#EADFD4] h-1 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#E8633A] to-amber-500 h-full rounded-full transition-all duration-100 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
