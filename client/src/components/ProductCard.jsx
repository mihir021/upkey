import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Star, Box, Plus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

/**
 * ==============================================================================
 * ProductCard Component — Luxury Tactile Editorial Card
 * ==============================================================================
 *
 * Implements the modern luxury e-commerce card aesthetic inspired by the reference design:
 * 1. Card Container:
 *    - Deep organic corner radius (rounded-3xl).
 *    - Soft multi-layer shadow with Framer Motion hover lift (y: -4px).
 *    - Consistent card height and uniform padding (p-4).
 * 2. Image Area (Top ~60%):
 *    - Pastel wash for 3D/non-photo items, crisp photo for real shots.
 *    - Elegant centered 3D badge mark (cube icon + label) eliminating top clutter.
 *    - Floating circular white wishlist button on top-right.
 *    - Floating "Shop" pill badge on the image (bottom-right) as a visual anchor.
 * 3. Content Area (Bottom ~40%):
 *    - Brand name: small, orange, uppercase, letter-spaced.
 *    - Category tag: styled as a clean, muted chip alongside the brand.
 *    - Title: bold, 2-line max with ellipsis in headline font.
 *    - Star rating: golden stars with tightened gap and review score.
 *    - Variant dots: directly adjacent to price representing formulation options.
 * 4. Price & Action Row (Bottom):
 *    - Price: bold, larger, left-aligned.
 *    - Add button: circular tactile button with '+' or bag icon, hover-lift, and
 *      instant green checkmark animation when added.
 *    - Exact baseline alignment between price and action button.
 */

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

// Subtle formulation variant dots adjacent to price
const VARIANT_SWATCHES = {
  Cleanser:    ['#F6D0BE', '#E8633A'],
  Serum:       ['#D0BFEE', '#8B5E83'],
  Moisturizer: ['#BCE8D0', '#4E9E74'],
  Sunscreen:   ['#FAE0B0', '#E8633A'],
  default:     ['#EADFD4', '#E8633A'],
};

export default function ProductCard({ product, size = 'md' }) {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, inWishlist, inCart } = useCart();
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const wished  = inWishlist(product.id);
  const carted  = inCart(product.id);
  const src     = imgSrc(product);
  const isSmall = size === 'sm';
  const is3D    = Boolean(product.is_3d || product.cloudinary_link?.endsWith('.glb') || product.cloudinary_link?.endsWith('.gltf'));
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

  // Navigate to Product Detail
  function handleCardClick() {
    navigate(`/product/${product.id}`);
  }

  return (
    <motion.div
      onClick={handleCardClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`group relative flex flex-col bg-white border border-[#EDE2D7]/80 ${
        isSmall ? 'rounded-2xl p-3' : 'rounded-3xl p-3.5'
      } shadow-[0_4px_20px_rgba(35,30,27,0.05)] hover:shadow-[0_12px_32px_rgba(35,30,27,0.12)] hover:border-[#E8633A]/30 cursor-pointer overflow-hidden transition-colors`}
      style={{ minHeight: isSmall ? '310px' : '370px' }}
    >
      {/* ====================================================================
          1. IMAGE AREA (Top ~60% of Card)
          ==================================================================== */}
      <div
        className={`relative w-full ${
          isSmall ? 'h-36' : 'h-48'
        } rounded-2xl overflow-hidden flex items-center justify-center shrink-0 transition-transform duration-300`}
        style={{ backgroundColor: pastelBg }}
      >
        {/* Real Product Photography or Elegant 3D Visual */}
        {src ? (
          <img
            src={src}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          /* Elegant Centered 3D Mark — single cohesive icon + label, no clutter */
          <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-md shadow-sm border border-white/80 flex items-center justify-center text-[#E8633A] transition-transform duration-300 group-hover:scale-110">
              <Box className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/80 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider text-[#E8633A] border border-[#EDE2D7]/50 shadow-2xs">
              {is3D ? '3D Interactive' : product.category}
            </span>
          </div>
        )}

        {/* Top-Left: Subtle Tier Badge (if Premium/Budget & has real photo) */}
        {src && product.budget_tier && (
          <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[#231E1B] text-[10px] font-bold tracking-wide border border-[#EDE2D7]/80 shadow-2xs">
            {product.budget_tier}
          </span>
        )}

        {/* Top-Right: Clean White Circular Wishlist Button */}
        <button
          onClick={handleWish}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm cursor-pointer z-10 ${
            wished
              ? 'bg-[#E8633A] text-white scale-105'
              : 'bg-white/95 backdrop-blur-md text-[#7A706A] hover:text-[#E8633A] hover:bg-white hover:scale-105'
          }`}
        >
          <Heart
            className="w-4 h-4"
            fill={wished ? '#fff' : 'none'}
            strokeWidth={2}
          />
        </button>

        {/* Floating "Shop" Pill Quick-Action Button on Image (Reference Style Signature) */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#EDE2D7]/80 text-[#231E1B] text-[11px] font-bold shadow-sm hover:bg-[#E8633A] hover:text-white hover:border-[#E8633A] transition-all duration-200 cursor-pointer"
          >
            <ShoppingBag className="w-3 h-3 text-[#E8633A] group-hover:text-white transition-colors" />
            <span>Shop</span>
          </button>
        </div>
      </div>

      {/* ====================================================================
          2. CONTENT AREA (Bottom ~40% of Card)
          ==================================================================== */}
      <div className="flex flex-col flex-1 p-3.5 pt-3 justify-between">
        <div>
          {/* Brand + Category Chip Row (no awkward empty gap) */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#E8633A]">
              {product.brand || 'GLOW MORE'}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#FAF6F2] border border-[#EDE2D7]/60 text-[10px] font-semibold text-[#7A706A]">
              {product.category}
            </span>
          </div>

          {/* Product Title — bold, 2-line max with ellipsis, headline font */}
          <h3
            className="font-brand font-bold text-[#231E1B] text-sm leading-snug line-clamp-2 min-h-[2.5rem] mb-1.5 group-hover:text-[#E8633A] transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Star Rating Row — tightened spacing between stars and score */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-3 h-3"
                  fill={star <= Math.round(product.rating || 5) ? '#F59E0B' : '#EADFD4'}
                  color={star <= Math.round(product.rating || 5) ? '#F59E0B' : '#EADFD4'}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-[#665D57] ml-0.5 leading-none">
              {product.rating?.toFixed(1) || '4.8'}
            </span>
          </div>
        </div>

        {/* ====================================================================
            3. PRICE + ADD ROW (Exact Baseline Alignment)
            ==================================================================== */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F5EFE9] mt-auto">
          {/* Price + Variant Swatches directly adjacent */}
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#231E1B] text-base sm:text-lg leading-none">
              ₹{product.price_inr?.toLocaleString('en-IN') || '999'}
            </span>

            {/* Small Variant Swatches directly next to price */}
            <div
              className="flex items-center gap-1"
              title="Available formulation options"
            >
              {swatches.map((color, idx) => (
                <span
                  key={idx}
                  className="w-2 h-2 rounded-full border border-white shadow-2xs"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Circular Tactile Action Button (Matching Reference Style) */}
          <button
            onClick={handleCart}
            aria-label="Add to cart"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-105 active:scale-95 shrink-0 ${
              added
                ? 'bg-[#27AE60] text-white shadow-[#27AE60]/25'
                : carted
                ? 'bg-[#FAF6F2] text-[#E8633A] border border-[#E8633A]/40'
                : 'bg-[#E8633A] text-white hover:bg-[#D4552E] shadow-[#E8633A]/25'
            }`}
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </motion.div>
              ) : carted ? (
                <motion.div
                  key="carted"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <ShoppingBag className="w-4 h-4 stroke-[2]" />
                </motion.div>
              ) : (
                <motion.div
                  key="plus"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
