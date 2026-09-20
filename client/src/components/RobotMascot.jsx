import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * ============================================================================
 * RobotMascot Component — Adorable AI Floating Mascot
 * ============================================================================
 *
 * A charming, warm Baymax/Wall-E inspired robot companion that replaces the
 * flat chat icon. Features:
 *   - Fluid SVG eye-tracking: Pupils gently follow the user's cursor across
 *     the entire viewport with physics-based spring lerp (120ms lag).
 *   - Organic idle behavior: Periodic blinking every 3.5-5.5s, subtle head bob
 *     and ±3° tilt, and a warm pulsing antenna glow.
 *   - Playful micro-interactions: Excited bounce on hover and happy squint on click.
 *   - Performance-optimized: Uses Framer Motion's useMotionValue and useSpring
 *     to update eye coordinates directly without React re-renders, with
 *     throttled window mousemove tracking.
 */
export default function RobotMascot({ onClick, pulse = false, id = 'ai-chat-fab' }) {
  const buttonRef = useRef(null);

  // ---------- Eye tracking motion values (spring-smoothed) ----------
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);

  // Soft spring configuration gives a natural, organic follow delay (~120ms)
  const springConfig = { stiffness: 140, damping: 16, mass: 0.7 };
  const smoothX = useSpring(targetX, springConfig);
  const smoothY = useSpring(targetY, springConfig);

  // ---------- Mascot State (Blink & Happy Click) ----------
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHappy, setIsHappy] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Periodic organic blinking timer (every 3.5 to 5.5 seconds)
  useEffect(() => {
    let blinkTimeout;
    const scheduleBlink = () => {
      const delay = 3500 + Math.random() * 2000;
      blinkTimeout = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 150); // 150ms natural blink duration
      }, delay);
    };

    scheduleBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Global mouse position tracking across entire screen
  useEffect(() => {
    let lastTime = 0;
    const handleMouseMove = (e) => {
      const now = performance.now();
      // Throttle mousemove calculations to ~30ms for smooth 60fps performance
      if (now - lastTime < 28) return;
      lastTime = now;

      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.hypot(deltaX, deltaY);

      // Max radius pupil can travel inside the eye socket (3.2px)
      const maxRadius = 3.2;
      // Proportional response: reaches full glance within ~350px radius
      const factor = Math.min(1, distance / 350);
      const shift = factor * maxRadius;

      targetX.set(Math.cos(angle) * shift);
      targetY.set(Math.sin(angle) * shift);
    };

    // Return eyes to center on mouse leave
    const handleMouseLeave = () => {
      targetX.set(0);
      targetY.set(0);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [targetX, targetY]);

  // Cheerful click handler with quick happy wink/squint
  const handleClick = (e) => {
    setIsHappy(true);
    setTimeout(() => {
      setIsHappy(false);
      if (onClick) onClick(e);
    }, 180);
  };

  return (
    <motion.button
      ref={buttonRef}
      id={id}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      aria-label="Chat with Joyory AI Robot Advisor"
      title="Chat with AI Beauty Advisor"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
        width: 76,
        height: 76,
        borderRadius: '50%',
        background: 'linear-gradient(145deg, #FF6F43 0%, #E8633A 50%, #C84F2A 100%)',
        border: '2.5px solid rgba(255, 255, 255, 0.55)',
        cursor: 'pointer',
        boxShadow: pulse
          ? '0 10px 36px rgba(232, 99, 58, 0.58), 0 0 0 10px rgba(232, 99, 58, 0.16)'
          : '0 10px 32px rgba(232, 99, 58, 0.45), 0 4px 14px rgba(0, 0, 0, 0.14)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        overflow: 'visible',
      }}
    >
      {/* ── Soft Ambient Glow Behind Robot ── */}
      <div
        style={{
          position: 'absolute',
          inset: -4,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Mascot Container with Organic Idle Bob & Head Tilt ── */}
      <motion.div
        animate={{
          y: isHovered ? [0, -2, 0] : [0, -2, 0],
          rotate: isHovered ? [0, 3, -3, 0] : [-1.5, 1.5, -1.5],
        }}
        transition={{
          duration: isHovered ? 1.2 : 3.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          width: 64,
          height: 64,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <svg
          viewBox="0 0 64 64"
          width="64"
          height="64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Soft Cream Faceplate Gradient */}
            <linearGradient id="faceGrad" x1="12" y1="16" x2="52" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#FFF7F0" />
            </linearGradient>

            {/* Orange Head Shell Gradient */}
            <linearGradient id="headShellGrad" x1="10" y1="12" x2="54" y2="52" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF7A50" />
              <stop offset="0.6" stopColor="#E8633A" />
              <stop offset="1" stopColor="#D2532B" />
            </linearGradient>

            {/* Glowing Antenna Bulb Filter */}
            <filter id="antennaGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── 1. Antenna Stem & Pulsing Light Orb ── */}
          <g>
            <line
              x1="32"
              y1="14"
              x2="32"
              y2="8"
              stroke="#FFF"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.9"
            />
            {/* Glowing Light Dot on Antenna */}
            <motion.circle
              cx="32"
              cy="6.5"
              r="3.5"
              fill="#FFD24C"
              filter="url(#antennaGlow)"
              animate={{
                scale: [0.9, 1.25, 0.9],
                opacity: [0.75, 1, 0.75],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </g>

          {/* ── 2. Rounded Robot Head Shell (Soft Capsule) ── */}
          <rect
            x="9"
            y="13"
            width="46"
            height="39"
            rx="18"
            fill="url(#headShellGrad)"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.5"
          />

          {/* Cute Ear Buds */}
          <rect x="6" y="27" width="4" height="11" rx="2" fill="#E8633A" stroke="#FFF" strokeWidth="1" />
          <rect x="54" y="27" width="4" height="11" rx="2" fill="#E8633A" stroke="#FFF" strokeWidth="1" />

          {/* ── 3. Cream Faceplate Insert ── */}
          <rect
            x="13.5"
            y="18"
            width="37"
            height="29"
            rx="13.5"
            fill="url(#faceGrad)"
            stroke="#F0E3D8"
            strokeWidth="1"
          />

          {/* ── 4. Soft Blush Marks on Cheeks ── */}
          <ellipse cx="19" cy="35" rx="3.2" ry="1.9" fill="#FF8D6A" opacity="0.4" />
          <ellipse cx="45" cy="35" rx="3.2" ry="1.9" fill="#FF8D6A" opacity="0.4" />

          {/* ── 5. Expressive Tracking Eyes ── */}
          {/* Eye Group: Controlled for Blinking & Happy Squint */}
          <motion.g
            animate={{
              scaleY: isBlinking ? 0.08 : isHappy ? 0.25 : isHovered ? 1.15 : 1,
            }}
            transition={{ duration: 0.12, ease: 'easeInOut' }}
            style={{ transformOrigin: '32px 28.5px' }}
          >
            {/* === LEFT EYE === */}
            <g>
              {/* White Sclera / Eye Socket */}
              <ellipse
                cx="24"
                cy="28.5"
                rx="6"
                ry="7"
                fill="#231E1B"
              />

              {/* Dynamic Tracking Pupil + Highlights */}
              <motion.g style={{ x: smoothX, y: smoothY }}>
                {/* Iris Inner Glow */}
                <ellipse cx="24" cy="28.5" rx="4.8" ry="5.8" fill="#1C1816" />

                {/* Primary Specular Glint (Sparkle of life) */}
                <circle cx="25.8" cy="26.2" r="1.9" fill="#FFFFFF" />

                {/* Secondary Micro Highlight */}
                <circle cx="22.6" cy="30.2" r="0.85" fill="#FFFFFF" opacity="0.8" />
              </motion.g>
            </g>

            {/* === RIGHT EYE === */}
            <g>
              {/* White Sclera / Eye Socket */}
              <ellipse
                cx="40"
                cy="28.5"
                rx="6"
                ry="7"
                fill="#231E1B"
              />

              {/* Dynamic Tracking Pupil + Highlights */}
              <motion.g style={{ x: smoothX, y: smoothY }}>
                {/* Iris Inner Glow */}
                <ellipse cx="40" cy="28.5" rx="4.8" ry="5.8" fill="#1C1816" />

                {/* Primary Specular Glint (Sparkle of life) */}
                <circle cx="41.8" cy="26.2" r="1.9" fill="#FFFFFF" />

                {/* Secondary Micro Highlight */}
                <circle cx="38.6" cy="30.2" r="0.85" fill="#FFFFFF" opacity="0.8" />
              </motion.g>
            </g>
          </motion.g>

          {/* ── 6. Sweet Curved Smile ── */}
          {isHappy ? (
            <path
              d="M 28 37.5 Q 32 42 36 37.5"
              stroke="#E8633A"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="#E8633A"
            />
          ) : (
            <path
              d="M 28.5 38 Q 32 41 35.5 38"
              stroke="#E8633A"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </svg>
      </motion.div>
    </motion.button>
  );
}
