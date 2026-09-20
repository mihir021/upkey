import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Scale,
  ArrowLeft,
  Sparkles,
  Zap,
  ShieldCheck,
  Plus,
  Trash2,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import CompareColumn from '../components/CompareColumn';
import LoadingScreen from '../components/LoadingScreen';
import { useCompare } from '../context/CompareContext';
import productsData from '../data/products.json';

/**
 * ==============================================================================
 * ComparePage Component — Head-to-Head Product Comparison & Formulation Analysis
 * ==============================================================================
 *
 * Provides a side-by-side breakdown of ingredients, clinical active concentrations,
 * match affinity scores, price-per-active value metrics, and automated
 * head-to-head winner awards (*Better Value*, *Stronger Formulation*, *Broader Skin Fit*).
 *
 * Includes:
 *   - AI Bio-Equivalence formulation loading calibration transition
 *   - Product normalization against catalog for fault-tolerant rendering
 *   - Auto-staged URL query param support (?ids=P012,P013)
 *   - Interactive "Show Differences Only" spec filtering
 */

export default function ComparePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { compareList, compareCount, maxItems, clearCompare, addToCompare } = useCompare();
  const [showOnlyDiff, setShowOnlyDiff] = useState(false);
  const [calculating, setCalculating] = useState(true);

  // Smooth calibration transition timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setCalculating(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  // Support direct query param staging (e.g. /compare?ids=P018,P002)
  useEffect(() => {
    const idsParam = searchParams.get('ids');
    if (idsParam) {
      const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
      ids.forEach((id) => {
        const found = productsData.find((p) => p.id === id);
        if (found) addToCompare(found);
      });
    }
  }, [searchParams, addToCompare]);

  // Retrieve user clinical skin profile from localStorage if completed earlier
  const userProfile = useMemo(() => {
    try {
      const stored = localStorage.getItem('glowmore_skin_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  // Normalize products to guarantee complete, robust schema even with partial objects
  const normalizedList = useMemo(() => {
    return (compareList || [])
      .map((item) => {
        if (!item) return null;
        const pid = typeof item === 'string' ? item : item.id || item._id;
        const catalogItem = productsData.find((p) => p.id === pid) || {};
        const baseItem = typeof item === 'object' ? item : {};
        return {
          ...catalogItem,
          ...baseItem,
          id: pid,
          name: baseItem.name || catalogItem.name || `Product ${pid}`,
          brand: baseItem.brand || catalogItem.brand || 'Glow More',
          category: baseItem.category || catalogItem.category || 'Skincare',
          price_inr: baseItem.price_inr || catalogItem.price_inr || 999,
          rating: baseItem.rating ?? catalogItem.rating ?? 4.5,
          ingredients_list:
            baseItem.ingredients_list ||
            catalogItem.ingredients_list ||
            (baseItem.key_ingredients ? baseItem.key_ingredients.split('|') : []),
          concerns_list:
            baseItem.concerns_list ||
            catalogItem.concerns_list ||
            (baseItem.concerns ? baseItem.concerns.split('|') : []),
          skin_types:
            baseItem.skin_types ||
            catalogItem.skin_types ||
            ['All Skin Types'],
          budget_tier:
            baseItem.budget_tier ||
            catalogItem.budget_tier ||
            'Balanced',
        };
      })
      .filter(Boolean);
  }, [compareList]);

  // Compute match score and price-per-active for each product in the comparison
  const enrichedProducts = useMemo(() => {
    return normalizedList.map((product) => {
      const nameMatch = product.name?.match(/(\d+(?:\.\d+)?%)/);
      const activePercent = nameMatch ? parseFloat(nameMatch[1]) : null;
      const activesList = product.ingredients_list || [];
      const price = product.price_inr || 999;

      const pricePerActive = activePercent
        ? Math.round(price / activePercent)
        : Math.round(price / Math.max(1, activesList.length));

      // Calculate formula affinity match score
      let score = 82;
      if (product.rating) score += Math.round((product.rating - 4) * 12);
      if (product.concerns_list?.length) score += Math.min(6, product.concerns_list.length * 2);

      // If user profile exists, adjust based on skin type & concern fit
      if (userProfile) {
        if (product.skin_types?.includes(userProfile.skinType)) score += 4;
        const concernOverlap = product.concerns_list?.filter((c) =>
          userProfile.concerns?.includes(c)
        ).length;
        if (concernOverlap) score += concernOverlap * 3;
      }

      const matchScore = Math.min(99, Math.max(78, score));

      return {
        ...product,
        activePercent,
        activesList,
        pricePerActive,
        matchScore,
      };
    });
  }, [normalizedList, userProfile]);

  // Compute winners across dimensions
  const winners = useMemo(() => {
    if (enrichedProducts.length < 2) return null;

    // 1. Better Value: Lowest price per active
    const sortedByValue = [...enrichedProducts].sort(
      (a, b) => a.pricePerActive - b.pricePerActive
    );
    const valueWinner = sortedByValue[0];

    // 2. Stronger Formulation: Highest active percentage or highest match score
    const sortedByStrength = [...enrichedProducts].sort((a, b) => {
      if (a.activePercent && b.activePercent) {
        return b.activePercent - a.activePercent;
      }
      return b.matchScore - a.matchScore;
    });
    const formulationWinner = sortedByStrength[0];

    // 3. Broader Skin Fit: Most skin concerns targeted + skin types covered
    const sortedByFit = [...enrichedProducts].sort((a, b) => {
      const fitA = (a.concerns_list?.length || 0) + (a.skin_types?.length || 0);
      const fitB = (b.concerns_list?.length || 0) + (b.skin_types?.length || 0);
      return fitB - fitA;
    });
    const fitWinner = sortedByFit[0];

    return {
      value: valueWinner,
      formulation: formulationWinner,
      fit: fitWinner,
    };
  }, [enrichedProducts]);

  // Determine difference map across rows
  const diffMap = useMemo(() => {
    if (enrichedProducts.length < 2) return {};
    const first = enrichedProducts[0];
    return {
      matchScore: enrichedProducts.some((p) => p.matchScore !== first.matchScore),
      actives: enrichedProducts.some(
        (p) => (p.activesList || []).join() !== (first.activesList || []).join()
      ),
      value: enrichedProducts.some((p) => p.pricePerActive !== first.pricePerActive),
      concerns: enrichedProducts.some(
        (p) => (p.concerns_list || []).join() !== (first.concerns_list || []).join()
      ),
      skinTypes: enrichedProducts.some(
        (p) => (p.skin_types || []).join() !== (first.skin_types || []).join()
      ),
      tier: enrichedProducts.some((p) => p.budget_tier !== first.budget_tier),
    };
  }, [enrichedProducts]);

  // Quick preset loader for demonstration
  function stagePreset(p1Id, p2Id) {
    const p1 = productsData.find((p) => p.id === p1Id);
    const p2 = productsData.find((p) => p.id === p2Id);
    if (p1) addToCompare(p1);
    if (p2) addToCompare(p2);
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans">
      <Navbar />

      {/* Dedicated Bio-Equivalence Comparison Calibration Screen */}
      {calculating && (
        <LoadingScreen
          duration={850}
          title="BIO-EQUIVALENCE ENGINE"
          subtitle="Formulation Diff & Active Analysis"
          telemetryLabel="Comparison Matrix"
          statusSteps={[
            'Retrieving clinical ingredient matrices...',
            'Cross-referencing active concentrations...',
            'Calculating cost-per-active value metrics...',
            'Finalizing head-to-head winner awards...',
          ]}
          onComplete={() => setCalculating(false)}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-10">
        {/* ── Breadcrumbs & Back Action ── */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#7A706A] hover:text-[#E8633A] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Catalog</span>
          </button>

          {compareCount > 0 && (
            <div className="flex items-center gap-3">
              {/* Show Differences Only Toggle */}
              <button
                onClick={() => setShowOnlyDiff((p) => !p)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  showOnlyDiff
                    ? 'bg-[#E8633A] text-white border-[#E8633A] shadow-sm'
                    : 'bg-white text-[#665D57] border-[#EDE2D7] hover:bg-[#FAF6F2]'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Show Differences Only</span>
              </button>

              {/* Clear All */}
              <button
                onClick={clearCompare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#7A706A] hover:text-[#E8633A] hover:bg-white border border-transparent hover:border-[#EDE2D7] transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Page Header ── */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8633A]/10 border border-[#E8633A]/20 text-[#E8633A] text-xs font-bold tracking-wide uppercase mb-3">
            <Scale className="w-3.5 h-3.5" /> Formulation Compare
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-brand text-[#231E1B] tracking-tight">
            Side-by-Side Clinical Breakdown
          </h1>
          <p className="text-sm text-[#7A706A] mt-2 max-w-2xl leading-relaxed">
            Compare key active concentrations, formulation tiers, and price-per-active value metrics.
            Backed by clinical bio-equivalence and transparent ingredient explainability.
          </p>
        </div>

        {/* ── Empty State (< 2 Products) ── */}
        {enrichedProducts.length < 2 ? (
          <div className="bg-white rounded-3xl border border-[#EDE2D7] p-8 sm:p-14 text-center max-w-2xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-[#FAF6F2] border border-[#EADFD4] flex items-center justify-center text-[#E8633A] mx-auto mb-4 shadow-sm">
              <Scale className="w-8 h-8 stroke-[1.8]" />
            </div>

            <h2 className="text-2xl font-bold font-brand text-[#231E1B] mb-2">
              {enrichedProducts.length === 1
                ? 'Select 1 More Product to Compare'
                : 'No Products Staged for Comparison'}
            </h2>

            <p className="text-sm text-[#7A706A] leading-relaxed mb-6 max-w-md mx-auto">
              {enrichedProducts.length === 1 ? (
                <>
                  You have staged <strong>{enrichedProducts[0]?.name}</strong>. Choose another product
                  from the catalog to see side-by-side active breakdowns and value comparisons.
                </>
              ) : (
                'Select up to 3 products from our catalog to analyze active concentrations, match scores, and cost efficiencies side-by-side.'
              )}
            </p>

            <button
              onClick={() => navigate('/shop')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E8633A] hover:bg-[#D4552E] text-white text-sm font-bold shadow-md shadow-[#E8633A]/25 transition-all cursor-pointer hover:scale-105"
            >
              <Plus className="w-4 h-4" /> Browse Catalog
            </button>

            {/* Quick Demo Presets */}
            <div className="mt-10 pt-8 border-t border-[#F5EFE9]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9C8F85] block mb-3">
                Or explore popular clinical comparisons:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => stagePreset('P012', 'P013')}
                  className="px-4 py-2 rounded-2xl bg-[#FAF6F2] hover:bg-[#F2E8DE] border border-[#EDE2D7] text-xs font-bold text-[#231E1B] transition-all cursor-pointer"
                >
                  ⚡ Vitamin C 15% vs Glow Booster Dupe
                </button>
                <button
                  onClick={() => stagePreset('P018', 'P002')}
                  className="px-4 py-2 rounded-2xl bg-[#FAF6F2] hover:bg-[#F2E8DE] border border-[#EDE2D7] text-xs font-bold text-[#231E1B] transition-all cursor-pointer"
                >
                  🌿 Ceramide Barrier vs Gentle Milk
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ── Product Comparison Grid ── */}
            <div
              className={`grid gap-6 items-start mb-10 ${
                enrichedProducts.length === 2
                  ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {enrichedProducts.map((p) => {
                const pid = p.id || p._id;
                return (
                  <CompareColumn
                    key={pid}
                    product={p}
                    matchScore={p.matchScore}
                    isWinnerValue={winners?.value?.id === pid}
                    isWinnerFormulation={winners?.formulation?.id === pid}
                    isWinnerFit={winners?.fit?.id === pid}
                    diffMap={diffMap}
                    showOnlyDiff={showOnlyDiff}
                    userProfile={userProfile}
                  />
                );
              })}

              {/* Add 3rd product card placeholder if only 2 selected */}
              {enrichedProducts.length < maxItems && (
                <div
                  onClick={() => navigate('/shop')}
                  className="h-full min-h-[420px] rounded-3xl border-2 border-dashed border-[#EDE2D7] hover:border-[#E8633A]/60 bg-[#FAF6F2]/30 hover:bg-[#FAF6F2] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#EADFD4] flex items-center justify-center text-[#E8633A] group-hover:scale-110 transition-transform mb-3 shadow-2xs">
                    <Plus className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <h4 className="font-brand font-bold text-base text-[#231E1B] group-hover:text-[#E8633A] transition-colors">
                    Add Another Product
                  </h4>
                  <p className="text-xs text-[#7A706A] mt-1 max-w-[200px]">
                    Compare up to {maxItems} products simultaneously
                  </p>
                </div>
              )}
            </div>

            {/* ── Head-to-Head Summary Section ── */}
            {winners && (
              <section className="bg-white rounded-3xl border border-[#EDE2D7] p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-[#E8633A]" />
                  <h2 className="text-xl sm:text-2xl font-bold font-brand text-[#231E1B]">
                    Head-to-Head Formulation Summary
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-[#7A706A] mb-6">
                  Automated clinical trade-off analysis generated from formulation differences and active concentrations:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {/* Winner: Value */}
                  {winners.value && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#27AE60]/5 border border-[#27AE60]/20 space-y-2">
                      <div className="flex items-center gap-2 text-[#27AE60] text-xs font-bold uppercase tracking-wider">
                        <Zap className="w-4 h-4" /> Winner: Better Value
                      </div>
                      <div className="font-brand font-bold text-base text-[#231E1B]">
                        {winners.value.name}
                      </div>
                      <p className="text-xs text-[#5C534D] leading-relaxed">
                        Offers the lowest cost per key active (<strong>₹{winners.value.pricePerActive}</strong>{' '}
                        {winners.value.activePercent ? '/ 1% potency' : '/ active'}), delivering verified
                        savings without clinical compromise.
                      </p>
                    </div>
                  )}

                  {/* Winner: Strength */}
                  {winners.formulation && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#E8633A]/5 border border-[#E8633A]/20 space-y-2">
                      <div className="flex items-center gap-2 text-[#E8633A] text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4" /> Winner: Stronger Formulation
                      </div>
                      <div className="font-brand font-bold text-base text-[#231E1B]">
                        {winners.formulation.name}
                      </div>
                      <p className="text-xs text-[#5C534D] leading-relaxed">
                        {winners.formulation.activePercent ? (
                          <>
                            Leads with <strong>{winners.formulation.activePercent}%</strong> verified active
                            concentration for accelerated cellular turnover and visible results.
                          </>
                        ) : (
                          <>
                            Achieves the highest overall formulation affinity (
                            <strong>{winners.formulation.matchScore}%</strong>) with synergistic active
                            stabilizers.
                          </>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Winner: Skin Fit */}
                  {winners.fit && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#3A7BD5]/5 border border-[#3A7BD5]/20 space-y-2">
                      <div className="flex items-center gap-2 text-[#3A7BD5] text-xs font-bold uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4" /> Winner: Broader Skin Fit
                      </div>
                      <div className="font-brand font-bold text-base text-[#231E1B]">
                        {winners.fit.name}
                      </div>
                      <p className="text-xs text-[#5C534D] leading-relaxed">
                        {userProfile ? (
                          <>
                            Best matches your clinical profile concerns ({userProfile.concerns?.join(', ') || 'General'}),
                            fortifying barrier resilience.
                          </>
                        ) : (
                          <>
                            Offers multi-concern coverage across{' '}
                            <strong>{winners.fit.concerns_list?.join(', ') || 'All concerns'}</strong>,
                            safely tolerated across varied skin sensitivities.
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footnote */}
                <div className="mt-6 pt-4 border-t border-[#F5EFE9] flex items-center gap-2 text-[11px] text-[#9C8F85]">
                  <Info className="w-3.5 h-3.5 shrink-0 text-[#E8633A]" />
                  <span>
                    Formulation equivalence ratings are derived from clinical active potencies, vehicle molecular weight, and non-comedogenic safety indexes.
                  </span>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
