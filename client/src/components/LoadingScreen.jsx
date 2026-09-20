import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Leaf, Sparkles } from 'lucide-react';

/**
 * ==============================================================================
 * LoadingScreen Component — Luxury Biotech AI Calibration Stage
 * ==============================================================================
 *
 * Provides a commanding, cinematic loading ritual for Glow More.
 * Features:
 *   - Expanded, high-presence geometric staging (220px ring, 80px center badge)
 *   - Multi-orbital particle physics with glowing active molecule nodes
 *   - Live telemetry status cycling with explainable formulation diagnostic lines
 *   - High-contrast animated progress bar with glowing leading-edge beam
 *   - Dual-mode support (fullscreen app calibration vs inline route transition)
 */

const DEFAULT_STATUS_STEPS = [
  'Calibrating skin biomarkers...',
  'Cross-referencing active ingredients...',
  'Running compatibility diagnostics...',
  'Finalizing your formulation match...',
];

export default function LoadingScreen({
  onComplete,
  variant = 'fullscreen',
  duration = 1800,
  title = 'GLOW MORE',
  subtitle = 'Explainable Beauty AI',
  statusSteps = DEFAULT_STATUS_STEPS,
  telemetryLabel = 'Bio-Match Score',
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
  const timerRef = useRef(null);

  // SVG Progress Ring Geometry (Expanded to 220px for imposing presence)
  const ringSize = 220;
  const strokeWidth = 4.5;
  const center = ringSize / 2;
  const radius = center - strokeWidth - 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Reliable progress animation loop
  useEffect(() => {
    startTimeRef.current = Date.now();

    const interval = 25; // 40fps update rate
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const t = Math.min(1, elapsed / duration);

      // Organic easing curve
      const eased = Math.min(
        100,
        Math.round(
          t < 0.7
            ? 85 * Math.sin((t / 0.7) * (Math.PI / 2))
            : 85 + 15 * Math.pow((t - 0.7) / 0.3, 1.6)
        )
      );

      setProgress(eased);

      // Cycle status lines matching calibration thresholds
      if (t < 0.28) {
        setStatusIndex(0);
      } else if (t < 0.58) {
        setStatusIndex(1);
      } else if (t < 0.88) {
        setStatusIndex(2);
      } else {
        setStatusIndex(3);
      }

      if (t >= 1) {
        clearInterval(timerRef.current);
        setProgress(100);
        setIsFlashing(true);

        setTimeout(() => {
          setIsFinished(true);
          if (onComplete) {
            onComplete();
          }
        }, 280);
      }
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [duration, onComplete]);

  const isFullscreen = variant === 'fullscreen';

  const containerClasses = isFullscreen
    ? 'fixed inset-0 z-[9999] flex items-center justify-center bg-[#F6EFE9] text-[#231E1B] overflow-hidden select-none p-4'
    : 'relative w-full py-16 flex items-center justify-center bg-[#F6EFE9] text-[#231E1B] rounded-3xl overflow-hidden select-none p-4';

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          key="glow-more-loading-screen"
          initial={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: shouldReduceMotion ? 1 : 1.04,
            transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
          }}
          className={containerClasses}
          aria-live="polite"
          aria-label="Loading Glow More formulation engine"
        >
          {/* Subtle Precision Grid Background */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#231E1B 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Deep Ambient Terracotta Glow Aura */}
          <motion.div
            animate={
              shouldReduceMotion
                ? { opacity: 0.2 }
                : {
                    scale: [1, 1.25, 1],
                    opacity: [0.18, 0.32, 0.18],
                    x: [-15, 15, -15],
                    y: [-12, 12, -12],
                  }
            }
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-[540px] h-[540px] rounded-full bg-gradient-to-br from-[#E8633A] via-[#F38763] to-amber-300 blur-[130px] pointer-events-none -z-10"
          />

          {/* Secondary Botanical Bio-Glow Aura */}
          <div className="absolute w-[400px] h-[400px] rounded-full bg-[#8BB59A]/20 blur-[110px] pointer-events-none -z-10 -bottom-12 -right-12" />

          {/* ==================================================================
              LUXURY FROSTED GLASS CENTERPIECE CARD (Expanded & Imposing)
              ================================================================== */}
          <div className="relative flex flex-col items-center justify-center text-center px-8 sm:px-12 py-10 sm:py-12 max-w-xl w-full rounded-[36px] sm:rounded-[44px] bg-white/75 backdrop-blur-2xl border border-white/70 shadow-[0_24px_70px_rgba(35,30,27,0.12)] z-10">

            {/* Circular Orbit & Ring Stage */}
            <div
              className="relative flex items-center justify-center mb-7"
              style={{ width: ringSize, height: ringSize }}
            >
              {/* Scan Pulse Glow Wave */}
              <motion.div
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        scale: [0.92, 1.36, 0.92],
                        opacity: [0.5, 0, 0.5],
                      }
                }
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border border-[#E8633A]/60 pointer-events-none"
              />

              {/* Outer Secondary Orbit Track */}
              <div className="absolute inset-[-14px] rounded-full border border-[#EDE2D7]/70 pointer-events-none" />

              {/* Orbiting Molecule Node 1: Vitamin C / Niacinamide Active */}
              {!shouldReduceMotion && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3.4, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-[-14px] pointer-events-none"
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-[#E8633A] shadow-[0_0_12px_#E8633A] absolute -top-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center text-white text-[8px] font-bold">
                    ★
                  </div>
                </motion.div>
              )}

              {/* Orbiting Molecule Node 2: Bio-Lipid Stabilizer */}
              {!shouldReduceMotion && (
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_#F59E0B] absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
                </motion.div>
              )}

              {/* Orbiting Molecule Node 3: Peptide Matrix */}
              {!shouldReduceMotion && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3A7BD5] shadow-[0_0_8px_#3A7BD5] absolute top-1/2 -right-1.5 -translate-y-1/2" />
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
                    <stop offset="50%" stopColor="#F27A52" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                  <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#E8633A" floodOpacity="0.4" />
                  </filter>
                </defs>

                {/* Track Background */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="#EDE2D7"
                  strokeWidth={strokeWidth}
                  className="opacity-60"
                />

                {/* Calibrating Progress Arc */}
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
                  filter="url(#ringGlow)"
                  className="transition-[stroke-dashoffset] duration-150 ease-out"
                />
              </svg>

              {/* Imposing Centerpiece Brand Badge (w-20 h-20) */}
              <motion.div
                animate={
                  isFlashing
                    ? { scale: [1, 1.15, 1], filter: 'brightness(1.2)' }
                    : shouldReduceMotion
                    ? {}
                    : { scale: [1, 1.04, 1] }
                }
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute w-20 h-20 rounded-3xl bg-gradient-to-br from-[#E8633A] via-[#E8633A] to-[#D44E28] flex items-center justify-center text-white shadow-2xl shadow-[#E8633A]/40 z-10 border border-white/30"
              >
                <Leaf className="w-10 h-10 stroke-[2.2]" />
              </motion.div>
            </div>

            {/* Brand Title & Clinical Subtitle */}
            <div className="space-y-1 mb-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-brand tracking-tight text-[#231E1B]">
                {title}
              </h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8633A]/10 border border-[#E8633A]/25 text-[#E8633A] text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{subtitle}</span>
              </div>
            </div>

            {/* Dynamic Status Display with Fade Transition */}
            <div className="h-8 flex items-center justify-center my-1 w-full overflow-hidden">
              <AnimatePresence>
                <motion.p
                  key={statusIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="text-sm font-semibold text-[#5C534D] tracking-tight flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-[#E8633A] animate-pulse" />
                  <span>{statusSteps[statusIndex]}</span>
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Expanded Telemetry Progress Bar & Live Counter */}
            <div className="w-full max-w-sm mt-3 space-y-2">
              <div className="flex justify-between items-baseline text-xs font-mono font-bold text-[#7A706A]">
                <span className="uppercase tracking-wider text-[11px]">{telemetryLabel}</span>
                <span className="text-xl font-black text-[#E8633A]">{progress}%</span>
              </div>

              {/* Progress Track Bar */}
              <div className="w-full bg-[#EADFD4] h-2 rounded-full overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-[#E8633A] via-[#F27A52] to-amber-500 h-full rounded-full transition-all duration-100 ease-out shadow-sm"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* 4-Stage Calibration Nodes */}
              <div className="flex justify-between text-[10px] text-[#A0938A] font-semibold pt-1">
                <span className={progress >= 25 ? 'text-[#E8633A] font-bold' : ''}>Biomarkers</span>
                <span className={progress >= 50 ? 'text-[#E8633A] font-bold' : ''}>Actives Matrix</span>
                <span className={progress >= 75 ? 'text-[#E8633A] font-bold' : ''}>Equivalence</span>
                <span className={progress >= 100 ? 'text-[#E8633A] font-bold' : ''}>Match Ready</span>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
