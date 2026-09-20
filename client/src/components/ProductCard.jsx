import React, { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Star, Box, Plus, Check, Scale } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';

/**
 * ==============================================================================
 * ProductCard Component — Luxury Tactile Editorial Card
 * ==============================================================================
 *
 * Now includes an inline 3D canvas preview for products that have .glb models,
 * replacing the old flat placeholder icon. Uses:
 *   - IntersectionObserver for lazy-mount (only renders when visible)
 *   - frameloop="demand" for GPU efficiency
 *   - Fallback to default cosmetic jar if Cloudinary GLB fails
 *   - Smooth auto-rotation on hover
 */

// ── Constants ──────────────────────────────────────────────────────────
const DEFAULT_MODEL_URL = '/assets/cosmetic_jar.glb';

// Helper to determine if an image source is a photo (not a 3D GLB/GLTF model)
function imgSrc(product) {
  const cl = product?.cloudinary_link || '';
  if (!cl || cl.endsWith('.glb') || cl.endsWith('.gltf')) return null;
  return cl;
}

// Sophisticated pastel washes for non-photo or 3D interactive products
const CATEGORY_PASTELS = {
  Cleanser:      '#FDF2EB',
  Toner:         '#EAF3FB',
  Serum:         '#F3ECF8',
  Moisturizer:   '#EEF7F2',
  Sunscreen:     '#FDF5EA',
  Foundation:    '#F8EDE7',
  Concealer:     '#F8F0E6',
  Blush:         '#FAECF4',
  Lipstick:      '#FAECEC',
  'Lip Balm':    '#FDF2F2',
  Mascara:       '#EEEEF9',
  Eyeliner:      '#EEF2F9',
  'Face Mask':   '#EEF8F4',
  Exfoliator:    '#F9F6E9',
  'Under-eye Cream': '#F4EEF9',
  'Body Lotion': '#EEF8F6',
};

// Category-accent colour for 3D point light
const CATEGORY_COLORS = {
  Serum:         '#E8633A',
  Moisturizer:   '#3FE08B',
  Cleanser:      '#5BC4FF',
  Toner:         '#B088F9',
  Sunscreen:     '#FFCA28',
  'Face Mask':   '#1DE9B6',
};

// Subtle formulation variant dots adjacent to price
const VARIANT_SWATCHES = {
  Cleanser:    ['#F6D0BE', '#E8633A'],
  Serum:       ['#D0BFEE', '#8B5E83'],
  Moisturizer: ['#BCE8D0', '#4E9E74'],
  Sunscreen:   ['#FAE0B0', '#E8633A'],
  default:     ['#EADFD4', '#E8633A'],
};

// ── Inline 3D Model Mesh (normalised & grounded) ───────────────────────
function MiniProductMesh({ url }) {
  const { scene } = useGLTF(url);
  const ref = useRef();

  // Clone, normalise scale + ground the model so its base sits directly on the shadow plane
  const model = useMemo(() => {
    const inst = scene.clone(true);
    inst.traverse(n => {
      if (n.isMesh) {
        n.castShadow = true;
        n.receiveShadow = true;
      }
    });
    inst.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(inst);
    const size = box.getSize(new THREE.Vector3());
    const max = Math.max(size.x, size.y, size.z, 0.001);

    // Scale so the largest dimension fits comfortably (~1.85 units)
    // Leaves generous headroom so tall bottles are never clipped at the top
    inst.scale.setScalar(1.85 / max);
    inst.updateMatrixWorld(true);

    const box2 = new THREE.Box3().setFromObject(inst);
    const centre = box2.getCenter(new THREE.Vector3());

    // Center horizontally (X) and in depth (Z)
    inst.position.x -= centre.x;
    inst.position.z -= centre.z;

    // Ground the base of the model firmly at y = -0.75
    // ContactShadows will be placed at exactly y = -0.75 so there is zero gap
    inst.position.y -= box2.min.y; // base at y = 0
    inst.position.y -= 0.75;       // base at y = -0.75
    return inst;
  }, [scene]);

  // Gentle auto-rotation around Y axis only — no bobbing to prevent floating
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.005;
  });

  return (
    <group ref={ref}>
      <primitive object={model} />
    </group>
  );
}

// ── Error boundary for corrupted / unreachable GLB models ─────────────
class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn('Card 3D model load failed, falling back:', err);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// ── Inline 3D Preview Canvas ──────────────────────────────────────────
function Inline3DPreview({ modelUrl, category, pastelBg }) {
  const accentColor = CATEGORY_COLORS[category] || '#E8633A';

  // Resolve GLB URL: use product's cloudinary glb if valid, else fallback
  const validUrl =
    modelUrl && typeof modelUrl === 'string' && (modelUrl.includes('.glb') || modelUrl.includes('.gltf'))
      ? modelUrl
      : DEFAULT_MODEL_URL;

  // Fallback component rendered when the real model fails
  const fallbackJSX = <MiniProductMesh url={DEFAULT_MODEL_URL} />;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Accent glow ring behind model */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 50% 65%, ${accentColor}18 0%, transparent 65%)`,
          pointerEvents: 'none', zIndex: 1,
        }}
      />

      <Canvas
        camera={{ position: [0, 0.4, 4.0], fov: 32 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        frameloop="demand"
        style={{ width: '100%', height: '100%', background: pastelBg }}
      >
        {/* Lighting — lightweight for card thumbnails */}
        <ambientLight intensity={1.8} />
        <directionalLight position={[4, 6, 4]} intensity={2} />
        <pointLight position={[-3, 2, 2]} intensity={1} color={accentColor} />

        <Suspense fallback={null}>
          <ModelErrorBoundary fallback={fallbackJSX}>
            <MiniProductMesh url={validUrl} />
          </ModelErrorBoundary>
          {/* Ground contact shadow placed precisely at the model base (y = -0.75) */}
          <ContactShadows
            position={[0, -0.75, 0]}
            opacity={0.35}
            scale={4.5}
            blur={1.8}
            far={3}
            color="#231E1B"
          />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          target={[0, 0.1, 0]}
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={(3 * Math.PI) / 4}
          autoRotate
          autoRotateSpeed={1.8}
        />
      </Canvas>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// Main ProductCard Component
// ══════════════════════════════════════════════════════════════════════
export default function ProductCard({ product, size = 'md' }) {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, inWishlist, inCart } = useCart();
  const { isInCompare, toggleCompare } = useCompare();
  const [added, setAdded] = useState(false);

  // IntersectionObserver — only mount the heavy 3D canvas when card is in view
  const cardRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // Once visible, keep it mounted
        }
      },
      { rootMargin: '200px' } // Pre-load a bit before user scrolls to it
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!product) return null;

  const pid     = product.id || product._id;
  const wished  = inWishlist(pid);
  const carted  = inCart(pid);
  const staged  = isInCompare(pid);
  const src     = imgSrc(product);
  const isSmall = size === 'sm';
  const is3D    = Boolean(
    product.is_3d ||
    product.cloudinary_link?.endsWith('.glb') ||
    product.cloudinary_link?.endsWith('.gltf')
  );
  const pastelBg = CATEGORY_PASTELS[product.category] || '#F6EFE9';
  const swatches = VARIANT_SWATCHES[product.category] || VARIANT_SWATCHES.default;

  // Handle Cart Quick-Add
  function handleCart(e) {
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  // Handle Wishlist Toggle
  function handleWish(e) {
    e.stopPropagation();
    toggleWishlist(product);
  }

  // Handle Compare Staging Toggle
  function handleCompare(e) {
    e.stopPropagation();
    toggleCompare(product);
  }

  // Navigate to Product Detail
  function handleCardClick() {
    navigate(`/product/${pid}`);
  }

  return (
    <motion.div
      ref={cardRef}
      onClick={handleCardClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`group relative flex flex-col bg-white border ${
        staged
          ? 'border-[#E8633A] ring-2 ring-[#E8633A]/25 shadow-[0_8px_28px_rgba(232,99,58,0.18)]'
          : 'border-[#EDE2D7]/80 shadow-[0_4px_20px_rgba(35,30,27,0.05)] hover:shadow-[0_12px_32px_rgba(35,30,27,0.12)] hover:border-[#E8633A]/30'
      } ${
        isSmall ? 'rounded-2xl p-3' : 'rounded-3xl p-3.5'
      } cursor-pointer overflow-hidden transition-all`}
      style={{ minHeight: isSmall ? '310px' : '370px' }}
    >
      {/* ====================================================================
          1. IMAGE / 3D AREA (Top ~60% of Card)
          Uncluttered showcase for product photography or interactive 3D model
          ==================================================================== */}
      <div
        className={`relative w-full ${
          isSmall ? 'h-36' : 'h-52'
        } rounded-2xl overflow-hidden flex items-center justify-center shrink-0`}
        style={{ backgroundColor: pastelBg }}
      >
        {/* ── Real Product Photography ── */}
        {src ? (
          <img
            src={src}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : is3D && isInView ? (
          /* ── Inline 3D Canvas Preview (lazy-mounted via IntersectionObserver) ── */
          <Inline3DPreview
            modelUrl={product.cloudinary_link}
            category={product.category}
            pastelBg={pastelBg}
          />
        ) : (
          /* ── Static 3D Placeholder (before in-view or non-3D without image) ── */
          <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-md shadow-sm border border-white/80 flex items-center justify-center text-[#E8633A] transition-transform duration-300 group-hover:scale-110">
              <Box className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/80 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider text-[#E8633A] border border-[#EDE2D7]/50 shadow-2xs">
              {is3D ? '3D Interactive' : product.category}
            </span>
          </div>
        )}

        {/* ── Top-Left: Minimal non-intrusive badge for 3D models or Premium tier ── */}
        {is3D ? (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#231E1B]/80 backdrop-blur-md text-white text-[10px] font-bold tracking-wide border border-white/20 shadow-xs flex items-center gap-1.5 z-10 pointer-events-none">
            <Box className="w-3 h-3 text-[#E8633A]" /> 3D
          </span>
        ) : product.budget_tier === 'Premium' ? (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#231E1B]/75 backdrop-blur-md text-[#FFF7F0] text-[9.5px] font-bold tracking-wider uppercase border border-white/20 shadow-xs z-10 pointer-events-none">
            ★ Premium
          </span>
        ) : null}

        {/* ── Top-Right: Quick Action Icons (Compare & Favorite) ── */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {/* Compare Toggle Button */}
          <button
            onClick={handleCompare}
            aria-label={staged ? 'Remove from comparison' : 'Add to comparison'}
            title={staged ? 'Remove from comparison' : 'Compare product'}
            className={`${
              isSmall ? 'w-7 h-7' : 'w-8 h-8'
            } rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm ${
              staged
                ? 'bg-[#E8633A] text-white scale-105 shadow-md shadow-[#E8633A]/35'
                : 'bg-white/95 backdrop-blur-md text-[#665D57] hover:text-[#E8633A] hover:bg-white hover:scale-105 border border-[#EDE2D7]/50'
            }`}
          >
            <Scale className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} stroke-[2.2]`} />
          </button>

          {/* Favorite (Wishlist) Toggle Button */}
          <button
            onClick={handleWish}
            aria-label={wished ? 'Remove from favorites' : 'Add to favorites'}
            title={wished ? 'Remove from favorites' : 'Add to favorites'}
            className={`${
              isSmall ? 'w-7 h-7' : 'w-8 h-8'
            } rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm ${
              wished
                ? 'bg-[#E8633A] text-white scale-105 shadow-md shadow-[#E8633A]/35'
                : 'bg-white/95 backdrop-blur-md text-[#665D57] hover:text-[#E8633A] hover:bg-white hover:scale-105 border border-[#EDE2D7]/50'
            }`}
          >
            <Heart
              className={isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'}
              fill={wished ? '#fff' : 'none'}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      {/* ====================================================================
          2. CONTENT AREA (Bottom Section)
          Brand, Category, Product Title, and Rating
          ==================================================================== */}
      <div className="flex flex-col flex-1 p-3.5 pt-3 justify-between">
        <div>
          {/* Brand + Category Chip Row */}
          <div className="flex items-center justify-between gap-2 mb-1.5 h-5">
            <span className="text-[10.5px] font-bold tracking-widest uppercase text-[#E8633A] truncate max-w-[65%]">
              {product.brand || 'GLOW MORE'}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#FAF6F2] border border-[#EDE2D7]/60 text-[10px] font-semibold text-[#7A706A] shrink-0">
              {product.category}
            </span>
          </div>

          {/* Product Title — clean 2-line clamp */}
          <h3
            className="font-brand font-bold text-[#231E1B] text-sm sm:text-[15px] leading-snug line-clamp-2 h-10 mb-1.5 group-hover:text-[#E8633A] transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Star Rating Row */}
          <div className="flex items-center gap-1.5 mb-2 h-4">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-3.5 h-3.5"
                  fill={star <= Math.round(product.rating || 5) ? '#F59E0B' : '#EADFD4'}
                  color={star <= Math.round(product.rating || 5) ? '#F59E0B' : '#EADFD4'}
                />
              ))}
            </div>
            <span className="text-[11.5px] font-bold text-[#665D57] leading-none">
              {product.rating?.toFixed(1) || '4.8'}
            </span>
          </div>
        </div>

        {/* ====================================================================
            3. PRICE + TACTILE SHOP ACTION ROW
            Price & Swatches on Left, Dedicated "Shop" Action Button on Right
            ==================================================================== */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-[#F5EFE9] mt-auto">
          {/* Price + Formulation Variant Swatches */}
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#231E1B] text-base sm:text-lg leading-none">
              ₹{product.price_inr?.toLocaleString('en-IN') || '999'}
            </span>
            <div className="flex items-center gap-1" title="Available formulation options">
              {swatches.map((color, idx) => (
                <span
                  key={idx}
                  className="w-2.5 h-2.5 rounded-full border border-white shadow-2xs"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Dedicated "Shop" Button with ShoppingBag Icon */}
          <button
            onClick={handleCart}
            aria-label="Shop now"
            className={`flex items-center gap-1.5 ${
              isSmall ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-xs'
            } rounded-full font-bold transition-all duration-200 cursor-pointer shadow-sm shrink-0 ${
              added
                ? 'bg-[#27AE60] text-white shadow-[#27AE60]/25 scale-105'
                : carted
                ? 'bg-[#FAF6F2] text-[#E8633A] border border-[#E8633A]/40 hover:bg-[#E8633A] hover:text-white'
                : 'bg-[#E8633A] text-white hover:bg-[#D4552E] shadow-[#E8633A]/25 hover:shadow-md hover:scale-105 active:scale-95'
            }`}
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.div
                  key="check"
                  className="flex items-center gap-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Added</span>
                </motion.div>
              ) : (
                <motion.div
                  key="shop"
                  className="flex items-center gap-1.5"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                >
                  <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Shop</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
