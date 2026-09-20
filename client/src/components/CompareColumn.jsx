import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Star, CheckCircle, X, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';

/**
 * ==============================================================================
 * CompareColumn Component — Side-by-Side Product Comparison Column
 * ==============================================================================
 *
 * Displays a single product's clinical specifications, actives breakdown,
 * key differentiators, price-per-active value analysis, and action CTA.
 */

function imgSrc(product) {
  const cl = product?.cloudinary_link || '';
  if (!cl || cl.endsWith('.glb') || cl.endsWith('.gltf')) return null;
  return cl;
}

export default function CompareColumn({
  product,
  isWinnerValue,
  isWinnerFormulation,
  isWinnerFit,
  matchScore,
  diffMap = {},
  showOnlyDiff = false,
  userProfile = null,
}) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { removeFromCompare } = useCompare();
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const pid = product.id || product._id;
  const src = imgSrc(product);
  const is3D = Boolean(
    product.is_3d ||
    product.cloudinary_link?.endsWith('.glb') ||
    product.cloudinary_link?.endsWith('.gltf')
  );

  // Extract explicit active percentage or estimate clinical potency
  const nameMatch = product.name?.match(/(\d+(?:\.\d+)?%)/);
  const activePercent = nameMatch ? parseFloat(nameMatch[1]) : null;
  const activesList = product.ingredients_list || (product.key_ingredients ? product.key_ingredients.split('|') : []);
  const price = product.price_inr || 999;
  
  // Price per active concentration metric
  const pricePerActive = activePercent
    ? Math.round(price / activePercent)
    : Math.round(price / Math.max(1, activesList.length));

  function handleAddToCart() {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  // Concern fit tags
  const concerns = product.concerns_list || (product.concerns ? product.concerns.split('|') : []);
  const skinTypes = product.skin_types || (product.skin_type ? product.skin_type.split('|') : ['All Skin Types']);

  return (
    <div className="flex flex-col bg-white rounded-3xl border border-[#EDE2D7] shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* ── Top Header Bar with Badges & Remove Button ── */}
      <div className="p-4 sm:p-5 pb-3 border-b border-[#F5EFE9] relative bg-[#FAF6F2]/40">
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Winner Accolades */}
          <div className="flex flex-wrap gap-1.5">
            {isWinnerValue && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#27AE60]/10 border border-[#27AE60]/30 text-[#27AE60] text-[10px] font-bold tracking-wide">
                <Zap className="w-3 h-3" /> Best Value
              </span>
            )}
            {isWinnerFormulation && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8633A]/10 border border-[#E8633A]/30 text-[#E8633A] text-[10px] font-bold tracking-wide">
                <Sparkles className="w-3 h-3" /> Top Formulation
              </span>
            )}
            {isWinnerFit && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#3A7BD5]/10 border border-[#3A7BD5]/30 text-[#3A7BD5] text-[10px] font-bold tracking-wide">
                <ShieldCheck className="w-3 h-3" /> Best Skin Fit
              </span>
            )}
          </div>

          {/* Remove from comparison */}
          <button
            onClick={() => removeFromCompare(pid)}
            aria-label={`Remove ${product.name} from comparison`}
            className="w-7 h-7 rounded-full bg-white border border-[#EADFD4] flex items-center justify-center text-[#7A706A] hover:text-[#E8633A] hover:border-[#E8633A]/40 shadow-2xs transition-colors cursor-pointer ml-auto shrink-0"
            title="Remove product"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product Visual */}
        <div
          onClick={() => navigate(`/product/${pid}`)}
          className="w-full h-44 rounded-2xl bg-[#F6EFE9] overflow-hidden flex items-center justify-center cursor-pointer relative group mb-3"
        >
          {src ? (
            <img
              src={src}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <span className="text-3xl mb-1">🧊</span>
              <span className="text-[10px] font-bold text-[#E8633A] uppercase tracking-wider">
                {is3D ? '3D Interactive Model' : product.category}
              </span>
            </div>
          )}
          {is3D && (
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-[#231E1B]/70 backdrop-blur-md text-white text-[9px] font-bold border border-white/20">
              3D
            </span>
          )}
        </div>

        {/* Brand & Title */}
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#E8633A]">
          {product.brand || 'GLOW MORE'}
        </div>
        <h3
          onClick={() => navigate(`/product/${pid}`)}
          className="font-brand font-bold text-[#231E1B] text-base leading-snug hover:text-[#E8633A] transition-colors cursor-pointer line-clamp-2 h-11 mt-0.5"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Price & Rating Row */}
        <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-[#EDE2D7]/50">
          <span className="text-xl font-black text-[#231E1B]">
            ₹{price.toLocaleString('en-IN')}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
            <span className="text-xs font-bold text-[#231E1B]">
              {product.rating?.toFixed(1) || '4.6'}
            </span>
          </div>
        </div>

        {/* Add to Routine Button */}
        <button
          onClick={handleAddToCart}
          className={`w-full mt-3 py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
            added
              ? 'bg-[#27AE60] text-white shadow-[#27AE60]/25'
              : 'bg-[#E8633A] hover:bg-[#D4552E] text-white shadow-[#E8633A]/25 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {added ? (
            <>
              <CheckCircle className="w-4 h-4" /> Added to Routine!
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" /> Add to Routine
            </>
          )}
        </button>
      </div>

      {/* ── Comparison Specifications ── */}
      <div className="divide-y divide-[#F5EFE9] text-xs">
        {/* 1. Overall Match Score */}
        {(!showOnlyDiff || diffMap.matchScore) && (
          <div className="p-4 flex items-center justify-between bg-white">
            <span className="font-semibold text-[#7A706A]">Match Score</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 rounded-full bg-[#EADFD4] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#E8633A] to-[#27AE60] rounded-full"
                  style={{ width: `${matchScore}%` }}
                />
              </div>
              <span className="font-extrabold text-sm text-[#231E1B]">
                {matchScore}%
              </span>
            </div>
          </div>
        )}

        {/* 2. Key Actives & Concentration */}
        {(!showOnlyDiff || diffMap.actives) && (
          <div className="p-4 bg-[#FAF6F2]/30">
            <span className="block font-semibold text-[#7A706A] mb-1.5">
              Key Actives & Concentration
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activesList.map((act, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#EADFD4] text-[#231E1B] font-semibold text-[11px]"
                >
                  {act}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 3. Cost-Per-Active Value Analysis */}
        {(!showOnlyDiff || diffMap.value) && (
          <div className="p-4 flex items-center justify-between bg-white">
            <div>
              <span className="block font-semibold text-[#7A706A]">Value Efficiency</span>
              <span className="text-[10px] text-[#A0938A]">
                {activePercent ? 'Per 1% active concentration' : 'Cost per key active'}
              </span>
            </div>
            <div className="text-right">
              <span
                className={`font-black text-sm ${
                  isWinnerValue ? 'text-[#27AE60]' : 'text-[#231E1B]'
                }`}
              >
                ₹{pricePerActive}
              </span>
              <span className="text-[10px] text-[#7A706A] block">
                {activePercent ? '/ 1% potency' : '/ active'}
              </span>
            </div>
          </div>
        )}

        {/* 4. Skin Concern Fit */}
        {(!showOnlyDiff || diffMap.concerns) && (
          <div className="p-4 bg-[#FAF6F2]/30">
            <span className="block font-semibold text-[#7A706A] mb-1.5">
              Target Skin Concerns
            </span>
            <div className="flex flex-wrap gap-1.5">
              {concerns.map((con, i) => {
                const isUserFocus = userProfile?.concerns?.includes(con);
                return (
                  <span
                    key={i}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      isUserFocus
                        ? 'bg-[#E8633A]/10 border-[#E8633A]/40 text-[#E8633A]'
                        : 'bg-white border-[#EDE2D7] text-[#665D57]'
                    }`}
                  >
                    {con} {isUserFocus && '★'}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. Skin Type Compatibility */}
        {(!showOnlyDiff || diffMap.skinTypes) && (
          <div className="p-4 flex items-center justify-between bg-white">
            <span className="font-semibold text-[#7A706A]">Skin Compatibility</span>
            <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
              {skinTypes.map((st, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-[#FAF6F2] text-[#665D57] font-semibold text-[10px]"
                >
                  {st}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 6. Formula Tier & Differentiators */}
        {(!showOnlyDiff || diffMap.tier) && (
          <div className="p-4 flex items-center justify-between bg-[#FAF6F2]/30">
            <span className="font-semibold text-[#7A706A]">Formulation Tier</span>
            <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#EDE2D7] font-bold text-[11px] text-[#231E1B]">
              {product.budget_tier || 'Balanced'}
            </span>
          </div>
        )}

        {/* 7. Category & Dupe Status */}
        <div className="p-4 flex items-center justify-between bg-white">
          <span className="font-semibold text-[#7A706A]">Category</span>
          <span className="font-semibold text-[#231E1B]">{product.category}</span>
        </div>
      </div>
    </div>
  );
}
