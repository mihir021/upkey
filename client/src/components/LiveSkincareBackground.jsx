import { useEffect } from 'react';

/**
 * ==============================================================================
 * LiveSkincareBackground — Premium Animated Gradient Aurora Background
 * ==============================================================================
 *
 * Architecture: Pure CSS + GPU-accelerated transforms for buttery 60fps.
 * NO canvas, NO JavaScript animation loops — uses hardware-accelerated
 * CSS @keyframes with will-change for maximum performance and stability.
 *
 * Visual Layers (back to front):
 * 1. Base Gradient Wash — Slowly shifting warm cream/terracotta linear gradient
 * 2. Giant Morphing Blobs — 5 large, colorful, blurred gradient orbs that
 *    drift, scale, and rotate on long 15-25s cycles creating a living aurora
 * 3. Aurora Light Streaks — Elongated gradient bands sweeping diagonally
 * 4. Interactive Cursor Glow — CSS variable-driven soft spotlight follows mouse
 * 5. Floating Contour Rings — Pulsating organic border rings evoking skin diagnostics
 * 6. Luminous Micro-Particles — Small glowing dots that fade in/out and drift
 *
 * Scroll Behavior:
 * - The entire background is `position: fixed` so it stays perfectly stable
 *   while content scrolls over it. Zero jitter, zero repaints on scroll.
 * - The pointer-events: none rule ensures it never blocks user interactions.
 */
export default function LiveSkincareBackground() {
  // Interactive cursor glow — updates CSS custom properties directly on the DOM
  // to avoid React re-renders. The CSS transition handles the smooth easing.
  useEffect(() => {
    // Only enable cursor tracking on pointer devices (not touch)
    if (!window.matchMedia || !window.matchMedia('(pointer: fine)').matches) {
      return undefined;
    }

    let frameId;
    const handlePointerMove = (event) => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          '--cursor-x',
          `${event.clientX}px`
        );
        document.documentElement.style.setProperty(
          '--cursor-y',
          `${event.clientY}px`
        );
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.style.removeProperty('--cursor-x');
      document.documentElement.style.removeProperty('--cursor-y');
    };
  }, []);

  return (
    <div
      className="live-bg"
      aria-hidden="true"
    >
      {/* ── Layer 1: Base gradient wash ── */}
      <div className="live-bg__wash" />

      {/* ── Layer 2: Giant morphing aurora blobs ── */}
      <div className="live-bg__blob live-bg__blob--terracotta" />
      <div className="live-bg__blob live-bg__blob--sage" />
      <div className="live-bg__blob live-bg__blob--amber" />
      <div className="live-bg__blob live-bg__blob--rose" />
      <div className="live-bg__blob live-bg__blob--cream" />

      {/* ── Layer 3: Aurora light streaks ── */}
      <div className="live-bg__aurora live-bg__aurora--warm" />
      <div className="live-bg__aurora live-bg__aurora--cool" />

      {/* ── Layer 4: Interactive cursor glow ── */}
      <div className="live-bg__cursor" />

      {/* ── Layer 5: Topographic contour rings ── */}
      <div className="live-bg__ring live-bg__ring--outer" />
      <div className="live-bg__ring live-bg__ring--inner" />

      {/* ── Layer 6: Luminous micro-particles ── */}
      <div className="live-bg__particle live-bg__particle--1" />
      <div className="live-bg__particle live-bg__particle--2" />
      <div className="live-bg__particle live-bg__particle--3" />
      <div className="live-bg__particle live-bg__particle--4" />
      <div className="live-bg__particle live-bg__particle--5" />
      <div className="live-bg__particle live-bg__particle--6" />
      <div className="live-bg__particle live-bg__particle--7" />
      <div className="live-bg__particle live-bg__particle--8" />
    </div>
  );
}
