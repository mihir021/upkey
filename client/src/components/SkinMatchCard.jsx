import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ShieldCheck, ChevronRight, Droplets, Palette, Target, CircleDollarSign } from 'lucide-react';

/**
 * ==============================================================================
 * SkinMatchCard Component — AI Skin Compatibility Match Card
 * ==============================================================================
 *
 * Compares the active product's formulation against the logged-in user's
 * onboarding profile (skinType, skinTone, concerns, budget, shopping goals).
 * Computes a weighted dermatological match score (0-100%) and presents an
 * editorial clinical-grade compatibility card with a circular progress gauge.
 */

/**
 * Safely extracts and flattens any array, pipe-separated string, comma-separated string,
 * or scalar value into an array of clean, lowercase trimmed strings.
 * Prevents any TypeError from unflattened nested arrays or undefined string methods.
 */
function toCleanStringArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.flatMap(item => toCleanStringArray(item));
  }
  if (typeof val === 'string') {
    return val.split(/[|,/]/).map(s => s.trim().toLowerCase()).filter(Boolean);
  }
  return [String(val).trim().toLowerCase()].filter(Boolean);
}

// ── Compatibility Scoring Algorithm ──────────────────────────────────────────
function computeMatch(product, user) {
  if (!product) return null;

  try {
    const hasProfile = Boolean(
      user && (user.skinType || user.skinTone || (user.concerns && user.concerns.length > 0) || user.onboardingCompleted)
    );

    // Fallback for guests or users who have not yet completed the skin onboarding quiz
    if (!hasProfile) {
      const prodSkins = toCleanStringArray(product.skin_types || product.skin_type || product.skin_type_raw);
      const isUniversal =
        prodSkins.includes('all') ||
        prodSkins.includes('universal') ||
        prodSkins.length >= 3;
      const baseScore = Math.min(94, Math.max(82, Math.round((product.rating || 4.0) * 18 + (isUniversal ? 8 : 4))));
      const concernsArray = toCleanStringArray(product.concerns_list || product.concerns || product.concerns_raw);
      const concernsDisplay = concernsArray.slice(0, 2).map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ') || 'Daily Skin Nourishment';
      const skinTypeDisplay = isUniversal
        ? 'Formulated for All Skin Types'
        : (prodSkins.length > 0
            ? `Suitable for ${prodSkins.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}`
            : 'Suitable for Various Skin Types');

      return {
        score: baseScore,
        hasProfile: false,
        skinTypeFit: skinTypeDisplay,
        skinToneFit: 'Universal Tone Adaptive',
        concernsFit: concernsDisplay,
        budgetFit: product.price_inr ? `₹${product.price_inr.toLocaleString('en-IN')}` : 'Great Value',
        matchTier: baseScore >= 90 ? 'Universal High Compatibility' : 'Balanced Formulation Match',
        badgeColor: '#27AE60',
        badgeBg: '#e8f5ec',
        insight: `${product.brand || 'This product'} is formulated with clean active botanicals for universal daily tolerance and radiance.`,
      };
    }

    // 1. Skin Type Evaluation (Weight: 35 pts)
    let skinTypePts = 20;
    let skinTypeLabel = 'General Skin Compatibility';
    const uSkin = String(user.skinType || '').trim().toLowerCase();
    const prodSkins = toCleanStringArray(product.skin_types || product.skin_type || product.skin_type_raw);

    if (prodSkins.includes('all') || prodSkins.includes('universal')) {
      skinTypePts = 33;
      skinTypeLabel = `Universal Fit for ${user.skinType || 'your'} Skin`;
    } else if (uSkin && prodSkins.some(s => s.includes(uSkin) || uSkin.includes(s))) {
      skinTypePts = 35;
      skinTypeLabel = `100% Match for ${user.skinType} Skin`;
    } else if (uSkin === 'combination' && (prodSkins.includes('oily') || prodSkins.includes('dry'))) {
      skinTypePts = 27;
      skinTypeLabel = `Balanced for ${user.skinType} Skin`;
    } else if (uSkin) {
      skinTypePts = 18;
      skinTypeLabel = `Gentle on ${user.skinType} Skin`;
    }

    // 2. Skin Tone Evaluation (Weight: 20 pts)
    let skinTonePts = 20;
    let skinToneLabel = 'Universal Shade Match';
    const uTone = String(user.skinTone || '').trim().toLowerCase();
    const prodTones = toCleanStringArray(product.skin_tones || product.skin_tone || product.skin_tone_raw);

    const nonTinted = ['cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 'face mask', 'exfoliator'];
    const isNonTinted = nonTinted.includes(String(product.category || '').toLowerCase());

    if (prodTones.includes('all') || isNonTinted || !uTone) {
      skinTonePts = 20;
      skinToneLabel = uTone ? `Seamless on ${user.skinTone} Tone` : 'Universal Tone Fit';
    } else if (prodTones.some(t => t.includes(uTone))) {
      skinTonePts = 20;
      skinToneLabel = `Perfect for ${user.skinTone} Tone`;
    } else {
      skinTonePts = 14;
      skinToneLabel = `Compatible with ${user.skinTone} Tone`;
    }

    // 3. Concerns & Goals Evaluation (Weight: 25 pts)
    let concernsPts = 16;
    const userConcernsList = toCleanStringArray([...(user.concerns || []), ...(user.shoppingGoals || [])]);
    const prodConcernsList = toCleanStringArray(product.concerns_list || product.concerns || product.concerns_raw);

    const matchedConcerns = [];
    userConcernsList.forEach(uc => {
      if (prodConcernsList.some(pc => pc.includes(uc) || uc.includes(pc))) {
        matchedConcerns.push(uc);
      }
    });

    let concernsLabel = '';
    if (matchedConcerns.length > 0) {
      concernsPts = Math.min(25, 18 + matchedConcerns.length * 4);
      const capList = matchedConcerns.slice(0, 2).map(c => c.charAt(0).toUpperCase() + c.slice(1));
      concernsLabel = `Targets ${capList.join(' & ')}`;
    } else if (userConcernsList.length > 0) {
      concernsPts = 16;
      concernsLabel = 'Daily Nourishing Defense';
    } else {
      concernsPts = 20;
      const firstProdConcern = prodConcernsList[0];
      concernsLabel = firstProdConcern ? `Targets ${firstProdConcern.charAt(0).toUpperCase() + firstProdConcern.slice(1)}` : 'Multi-Action Care';
    }

    // 4. Budget Harmony Evaluation (Weight: 12 pts)
    let budgetPts = 10;
    let budgetLabel = 'Great Value';
    if (user.budget && product.price_inr) {
      if (product.price_inr <= user.budget) {
        budgetPts = 12;
        budgetLabel = `Under your ₹${user.budget.toLocaleString('en-IN')} budget`;
      } else if (product.price_inr <= user.budget * 1.25) {
        budgetPts = 8;
        budgetLabel = `Near your ₹${user.budget.toLocaleString('en-IN')} budget`;
      } else {
        budgetPts = 6;
        budgetLabel = `Premium match (₹${product.price_inr.toLocaleString('en-IN')})`;
      }
    } else if (product.budget_tier === 'Budget') {
      budgetPts = 12;
      budgetLabel = 'Budget-Friendly Formula';
    }

    // 5. Category & Ingredient Synergy (Weight: 8 pts)
    let synergyPts = 6;
    const prodIngs = toCleanStringArray(product.ingredients_list || product.key_ingredients || product.key_ingredients_raw);
    const userIngs = toCleanStringArray(user.preferredIngredients);
    const matchedIngs = userIngs.filter(ui => prodIngs.some(pi => pi.includes(ui)));
    if (matchedIngs.length > 0) {
      synergyPts = 8;
    }

    const rawScore = skinTypePts + skinTonePts + concernsPts + budgetPts + synergyPts;
    const finalScore = Math.min(98, Math.max(74, rawScore));

    let matchTier = 'Perfect Formulation Match';
    let badgeColor = '#1e8a4c';
    let badgeBg = '#e8f5ec';
    if (finalScore < 84) {
      matchTier = 'Compatible Gentle Match';
      badgeColor = '#C65A15';
      badgeBg = '#fde8d8';
    } else if (finalScore < 93) {
      matchTier = 'High Skin Compatibility';
      badgeColor = '#E8633A';
      badgeBg = '#fde8d8';
    }

    const rawActiveIng = Array.isArray(product.key_ingredients) && product.key_ingredients.length > 0
      ? product.key_ingredients[0]
      : (Array.isArray(product.ingredients_list) && product.ingredients_list.length > 0
          ? product.ingredients_list[0]
          : (product.key_ingredients || product.category || 'targeted active botanicals'));
    const activeIng = typeof rawActiveIng === 'string' ? rawActiveIng : 'clean active botanicals';

    const insight = matchedConcerns.length > 0
      ? `Formulated with ${activeIng} to visibly address your ${matchedConcerns[0]} goals while maintaining your ${user.skinType || 'skin'} barrier balance.`
      : `Powered by ${activeIng} for gentle, barrier-friendly efficacy suited for your ${user.skinType || 'skin'} profile.`;

    return {
      score: finalScore,
      hasProfile: true,
      skinTypeFit: skinTypeLabel,
      skinToneFit: skinToneLabel,
      concernsFit: concernsLabel,
      budgetFit: budgetLabel,
      matchTier,
      badgeColor,
      badgeBg,
      insight,
    };
  } catch (err) {
    console.error('SkinMatchCard computeMatch error:', err);
    return null;
  }
}

export default function SkinMatchCard({ product, user }) {
  const navigate = useNavigate();
  const match = useMemo(() => computeMatch(product, user), [product, user]);

  if (!match) return null;

  // SVG circular gauge geometry
  const radius = 28;
  const circumference = 2 * Math.PI * radius; // ~175.93
  const strokeDashoffset = circumference - (circumference * match.score) / 100;

  return (
    <div style={{
      background: 'linear-gradient(145deg, #FFFDFB 0%, #FAF4EE 100%)',
      border: '1.5px solid #F0DCCE',
      borderRadius: 20,
      padding: '18px 20px',
      boxShadow: '0 8px 26px rgba(232, 99, 58, 0.08), 0 2px 6px rgba(0,0,0,0.02)',
      marginTop: 4,
      marginBottom: 8,
      fontFamily: '"Inter", sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative ambient glow in corner */}
      <div style={{
        position: 'absolute',
        top: -30,
        right: -30,
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,99,58,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header with Gauge + Status Pill */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        {/* Left: Circular Animated Percentage Gauge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative', width: 68, height: 68, flexShrink: 0 }}>
            <svg width="68" height="68" viewBox="0 0 68 68" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background track circle */}
              <circle
                cx="34"
                cy="34"
                r={radius}
                fill="none"
                stroke="#EADFD4"
                strokeWidth="5"
              />
              {/* Animated Progress ring */}
              <circle
                cx="34"
                cy="34"
                r={radius}
                fill="none"
                stroke="url(#matchGrad)"
                strokeWidth="5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
              <defs>
                <linearGradient id="matchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E8633A" />
                  <stop offset="100%" stopColor="#27AE60" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner score label */}
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#231E1B', lineHeight: 1 }}>
                {match.score}%
              </span>
              <span style={{ fontSize: 8, fontWeight: 700, color: '#E8633A', letterSpacing: 0.6, marginTop: 2 }}>
                MATCH
              </span>
            </div>
          </div>

          {/* Heading Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 10px',
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 700,
                background: match.badgeBg,
                color: match.badgeColor,
              }}>
                <Sparkles size={12} /> {match.matchTier}
              </span>
            </div>
            <h3 style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 800,
              color: '#231E1B',
              fontFamily: '"Playfair Display", serif',
            }}>
              Skin Compatibility
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#665D57', fontWeight: 500 }}>
              {match.hasProfile
                ? `Personalized for ${user?.name ? user.name.split(' ')[0] + "'s" : 'your'} profile`
                : 'Based on clinical formulation analysis'}
            </p>
          </div>
        </div>

        {/* Personalized Indicator or Quiz CTA */}
        {!match.hasProfile && (
          <button
            onClick={() => navigate('/onboarding')}
            style={{
              padding: '6px 12px',
              background: '#FFF',
              border: '1.5px solid #EADFD4',
              borderRadius: 14,
              fontSize: 11,
              fontWeight: 700,
              color: '#E8633A',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
          >
            Take Quiz <ChevronRight size={12} />
          </button>
        )}
      </div>

      {/* 4-Factor Breakdown Chips Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: 8,
        marginTop: 14,
      }}>
        {/* Factor 1: Skin Type */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255,255,255,0.7)',
          padding: '8px 12px',
          borderRadius: 12,
          border: '1px solid #EADFD4',
        }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#FDE8D8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Droplets size={13} color="#E8633A" />
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#231E1B', lineHeight: 1.3 }}>
            {match.skinTypeFit}
          </div>
        </div>

        {/* Factor 2: Skin Tone */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255,255,255,0.7)',
          padding: '8px 12px',
          borderRadius: 12,
          border: '1px solid #EADFD4',
        }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#F0E8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Palette size={13} color="#8B5E83" />
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#231E1B', lineHeight: 1.3 }}>
            {match.skinToneFit}
          </div>
        </div>

        {/* Factor 3: Target Concerns */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255,255,255,0.7)',
          padding: '8px 12px',
          borderRadius: 12,
          border: '1px solid #EADFD4',
        }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#E8F5EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Target size={13} color="#27AE60" />
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#231E1B', lineHeight: 1.3 }}>
            {match.concernsFit}
          </div>
        </div>

        {/* Factor 4: Budget Harmony */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255,255,255,0.7)',
          padding: '8px 12px',
          borderRadius: 12,
          border: '1px solid #EADFD4',
        }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#E8F0FB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CircleDollarSign size={13} color="#3A7BD5" />
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#231E1B', lineHeight: 1.3 }}>
            {match.budgetFit}
          </div>
        </div>
      </div>

      {/* Editorial Scientific Note */}
      <div style={{
        marginTop: 12,
        padding: '10px 14px',
        borderRadius: 12,
        background: 'rgba(232, 99, 58, 0.04)',
        border: '1px dashed #F0DCCE',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
      }}>
        <ShieldCheck size={16} color="#E8633A" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{
          margin: 0,
          fontSize: 12,
          color: '#665D57',
          lineHeight: 1.5,
          fontStyle: 'italic',
        }}>
          {match.insight}
        </p>
      </div>
    </div>
  );
}
