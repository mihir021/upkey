import { useState, useEffect, useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * ==============================================================================
 * Glow More — Clinical Active Ingredients Vector Suite
 * ==============================================================================
 * High-definition vector illustrations of the clinical active ingredients
 * formulated in Glow More:
 * 1. 15% Ethyl Ascorbic Acid (Vitamin C Citrus Slice)
 * 2. Ferulic Acid (Aromatic Molecular Ring Lattice)
 * 3. Multi-Weight Hyaluronic Acid (Translucent Moisture Droplet)
 * 4. Damask Rose Petal Extract (Botanical Petal)
 * 5. Olive Squalane (Bio-Lipid Oil Bead)
 * 6. AHA Glycolic Acid (Prismatic Exfoliating Micro-Crystal)
 * 7. Centella Asiatica / Cica Leaf (Soothing Antioxidant Botanical)
 * 8. Botanical Turmeric Extract (Golden Rhizome Active Swatch)
 * 9. Ceramide NP (Lipid Barrier Bilayer Vesicle)
 * 
 * Each illustration features unique SVG IDs via React useId() to prevent DOM
 * gradient collisions when rendered across multiple landing page chapters.
 */

// 1. Vitamin C (Ethyl Ascorbic Acid) - Golden citrus cross-section
function VitaminCSlice({ prefix = '', className = 'w-full h-full' }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id={`${prefix}vitC-rind`} cx="40" cy="40" r="38" gradientUnits="userSpaceOnUse">
          <stop offset="70%" stopColor="#E8633A" stopOpacity="0.85" />
          <stop offset="90%" stopColor="#F59E0B" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0.95" />
        </radialGradient>
        <radialGradient id={`${prefix}vitC-pulp`} cx="40" cy="40" r="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#FDE68A" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.7" />
        </radialGradient>
        <filter id={`${prefix}vitC-glow`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#E8633A" floodOpacity="0.25" />
        </filter>
      </defs>
      <g filter={`url(#${prefix}vitC-glow)`}>
        {/* Outer Rind */}
        <circle cx="40" cy="40" r="36" fill={`url(#${prefix}vitC-rind)`} />
        {/* Inner White Pith */}
        <circle cx="40" cy="40" r="32" fill="#FFFDF7" fillOpacity="0.8" />
        {/* Translucent Pulp Center */}
        <circle cx="40" cy="40" r="29" fill={`url(#${prefix}vitC-pulp)`} />
        {/* Citrus Segments */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <g key={i} transform={`rotate(${angle} 40 40)`}>
            <path
              d="M39 15C36 18 34 26 38 34C39 36 41 36 42 34C46 26 44 18 41 15C40.5 14.5 39.5 14.5 39 15Z"
              fill="#E8633A"
              fillOpacity="0.75"
            />
            <path
              d="M39.5 17C37.5 20 36 26 39 32"
              stroke="#FEF3C7"
              strokeWidth="1"
              strokeLinecap="round"
              strokeOpacity="0.8"
            />
          </g>
        ))}
        {/* Core Center Droplet */}
        <circle cx="40" cy="40" r="3.5" fill="#FFFDF7" />
        <circle cx="40" cy="40" r="2" fill="#F59E0B" />
      </g>
    </svg>
  );
}

// 2. Ferulic Acid - Bio-Active Molecular Ring Lattice
function FerulicAcidMolecule({ prefix = '', className = 'w-full h-full' }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <filter id={`${prefix}mol-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#E8633A" floodOpacity="0.2" />
        </filter>
        <linearGradient id={`${prefix}bond-grad`} x1="15" y1="15" x2="65" y2="65" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E8633A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <g filter={`url(#${prefix}mol-glow)`}>
        {/* Outer Aromatic Hexagon */}
        <polygon
          points="40,16 60,28 60,52 40,64 20,52 20,28"
          stroke={`url(#${prefix}bond-grad)`}
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill="#FFFDF7"
          fillOpacity="0.6"
        />
        {/* Inner Delocalized Bond Circle */}
        <circle cx="40" cy="40" r="14" stroke="#E8633A" strokeWidth="1.8" strokeDasharray="3 3" fill="none" opacity="0.7" />
        {/* Conjugated Functional Branches */}
        <line x1="60" y1="28" x2="72" y2="21" stroke="#E8633A" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="60" y1="52" x2="73" y2="60" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="20" y1="52" x2="8" y2="59" stroke="#E8633A" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="40" y1="16" x2="40" y2="6" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
        {/* Active Node Vertices */}
        {[
          [40, 16], [60, 28], [60, 52], [40, 64], [20, 52], [20, 28],
          [72, 21], [73, 60], [8, 59], [40, 6]
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="3.2" fill="#E8633A" stroke="#FFFFFF" strokeWidth="1.5" />
        ))}
      </g>
    </svg>
  );
}

// 3. Multi-Weight Hyaluronic Acid - Translucent Moisture Droplet
function HyaluronicDroplet({ prefix = '', className = 'w-full h-full' }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id={`${prefix}ha-droplet`} cx="34" cy="30" r="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#38BDF8" stopOpacity="0.7" />
          <stop offset="85%" stopColor="#0284C7" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#E8633A" stopOpacity="0.2" />
        </radialGradient>
        <filter id={`${prefix}ha-glow`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#0284C7" floodOpacity="0.22" />
        </filter>
      </defs>
      <g filter={`url(#${prefix}ha-glow)`}>
        {/* Main Moisture Bead */}
        <path
          d="M40 10C40 10 20 36 20 50C20 61.0457 28.9543 70 40 70C51.0457 70 60 61.0457 60 50C60 36 40 10 40 10Z"
          fill={`url(#${prefix}ha-droplet)`}
          stroke="#E0F2FE"
          strokeWidth="1.5"
        />
        {/* Specular Light Reflection */}
        <path
          d="M32 32C28 38 27 46 29 52"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />
        <circle cx="36" cy="24" r="2.5" fill="#FFFFFF" fillOpacity="0.95" />
        {/* Subtle internal lipid contour */}
        <path
          d="M46 44C47 48 46 54 42 58"
          stroke="#E0F2FE"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.7"
        />
      </g>
    </svg>
  );
}

// 4. Botanical Petal - Soft Damask Camellia Rose Petal
function BotanicalPetal({ prefix = '', className = 'w-full h-full' }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id={`${prefix}petal-grad`} x1="16" y1="18" x2="62" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FECDD3" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#FDA4AF" stopOpacity="0.75" />
          <stop offset="85%" stopColor="#E8633A" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#BE123C" stopOpacity="0.8" />
        </linearGradient>
        <filter id={`${prefix}petal-glow`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#E8633A" floodOpacity="0.2" />
        </filter>
      </defs>
      <g filter={`url(#${prefix}petal-glow)`}>
        <path
          d="M40 12C28 12 18 24 18 40C18 56 30 68 40 68C50 68 62 56 62 40C62 24 52 12 40 12Z"
          fill={`url(#${prefix}petal-grad)`}
        />
        {/* Delicate Center Vein */}
        <path
          d="M40 16C39 30 39 50 40 64"
          stroke="#FFF1F2"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.65"
        />
        {/* Lateral Micro-Veins */}
        <path d="M40 30C34 26 26 27 24 29" stroke="#FFF1F2" strokeWidth="0.8" strokeLinecap="round" strokeOpacity="0.5" />
        <path d="M40 38C46 34 54 35 56 37" stroke="#FFF1F2" strokeWidth="0.8" strokeLinecap="round" strokeOpacity="0.5" />
        <path d="M40 48C34 46 26 49 24 51" stroke="#FFF1F2" strokeWidth="0.8" strokeLinecap="round" strokeOpacity="0.5" />
      </g>
    </svg>
  );
}

// 5. Olive Squalane - Bio-Lipid Oil Bead
function SqualaneLipidBead({ prefix = '', className = 'w-full h-full' }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id={`${prefix}oil-grad`} cx="36" cy="34" r="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#EAB308" stopOpacity="0.7" />
          <stop offset="85%" stopColor="#E8633A" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#854D0E" stopOpacity="0.75" />
        </radialGradient>
        <filter id={`${prefix}oil-glow`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#CA8A04" floodOpacity="0.25" />
        </filter>
      </defs>
      <g filter={`url(#${prefix}oil-glow)`}>
        <circle cx="40" cy="40" r="30" fill={`url(#${prefix}oil-grad)`} stroke="#FEF9C3" strokeWidth="1.5" />
        {/* Internal Concentric Refraction Ring */}
        <circle cx="40" cy="40" r="22" stroke="#FFFBEB" strokeWidth="1" strokeOpacity="0.5" fill="none" />
        {/* Gloss Arc Highlight */}
        <path
          d="M26 34C28 26 34 22 42 22"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
        <circle cx="48" cy="27" r="2" fill="#FFFFFF" fillOpacity="0.9" />
      </g>
    </svg>
  );
}

// 6. AHA Glycolic Acid - Prismatic Exfoliating Micro-Crystal
function AhaGlycolicCrystal({ prefix = '', className = 'w-full h-full' }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id={`${prefix}crystal-grad`} x1="20" y1="15" x2="60" y2="65" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FED7AA" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#FDBA74" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#E8633A" stopOpacity="0.8" />
        </linearGradient>
        <filter id={`${prefix}cryst-glow`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#E8633A" floodOpacity="0.2" />
        </filter>
      </defs>
      <g filter={`url(#${prefix}cryst-glow)`}>
        {/* Crystal Base Polygon */}
        <polygon
          points="40,12 66,28 66,54 40,68 14,54 14,28"
          fill={`url(#${prefix}crystal-grad)`}
          stroke="#FFF7ED"
          strokeWidth="1.5"
        />
        {/* Facet Lines radiating from center apex */}
        <line x1="40" y1="12" x2="40" y2="40" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.7" />
        <line x1="66" y1="28" x2="40" y2="40" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.7" />
        <line x1="66" y1="54" x2="40" y2="40" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.7" />
        <line x1="40" y1="68" x2="40" y2="40" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.7" />
        <line x1="14" y1="54" x2="40" y2="40" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.7" />
        <line x1="14" y1="28" x2="40" y2="40" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.7" />
        <circle cx="40" cy="40" r="2.5" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

// 7. Centella Asiatica / Cica Leaf - Soothing Antioxidant Botanical
function CentellaLeaf({ prefix = '', className = 'w-full h-full' }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id={`${prefix}cica-grad`} x1="15" y1="15" x2="65" y2="65" gradientUnits="userSpaceOnUse">
          <stop stopColor="#86EFAC" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#4ADE80" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#15803D" stopOpacity="0.85" />
        </linearGradient>
        <filter id={`${prefix}cica-glow`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#16A34A" floodOpacity="0.2" />
        </filter>
      </defs>
      <g filter={`url(#${prefix}cica-glow)`}>
        <path
          d="M40 10C24 20 18 36 24 54C28 62 38 66 40 68C42 66 52 62 56 54C62 36 56 20 40 10Z"
          fill={`url(#${prefix}cica-grad)`}
          stroke="#F0FDF4"
          strokeWidth="1.5"
        />
        {/* Main Central Stem */}
        <path d="M40 12C39.5 30 40 50 40 67" stroke="#DCFCE7" strokeWidth="1.4" strokeLinecap="round" />
        {/* Symmetrical Veins */}
        <path d="M40 24C32 26 26 31 25 35" stroke="#DCFCE7" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.75" />
        <path d="M40 28C48 30 54 35 55 39" stroke="#DCFCE7" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.75" />
        <path d="M40 38C33 41 28 46 27 50" stroke="#DCFCE7" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.75" />
        <path d="M40 44C47 47 52 51 53 55" stroke="#DCFCE7" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.75" />
      </g>
    </svg>
  );
}

// 8. Botanical Turmeric Extract - Golden Rhizome Active Swatch
function TurmericExtractSwatch({ prefix = '', className = 'w-full h-full' }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id={`${prefix}turmeric-core`} cx="38" cy="38" r="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.85" />
          <stop offset="80%" stopColor="#E8633A" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#B45309" stopOpacity="0.85" />
        </radialGradient>
        <filter id={`${prefix}turmeric-glow`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#F59E0B" floodOpacity="0.25" />
        </filter>
      </defs>
      <g filter={`url(#${prefix}turmeric-glow)`}>
        {/* Organic curved rhizome cross-section */}
        <path
          d="M40 14C24 14 16 28 16 42C16 58 26 68 42 68C58 68 66 54 66 38C66 22 54 14 40 14Z"
          fill={`url(#${prefix}turmeric-core)`}
          stroke="#FEF3C7"
          strokeWidth="1.5"
        />
        {/* Concentric growth contours */}
        <path
          d="M32 26C26 32 26 44 32 52C38 58 48 58 54 50"
          stroke="#FFFBEB"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
        <path
          d="M36 34C32 38 32 46 38 48C44 50 48 46 48 40"
          stroke="#FEF3C7"
          strokeWidth="1"
          strokeLinecap="round"
          strokeOpacity="0.5"
        />
        {/* Curcumin active luster droplets */}
        <circle cx="48" cy="28" r="2.8" fill="#FFFFFF" fillOpacity="0.9" />
        <circle cx="52" cy="34" r="1.8" fill="#FFFFFF" fillOpacity="0.7" />
      </g>
    </svg>
  );
}

// 9. Ceramide NP - Lipid Barrier Bilayer Vesicle
function CeramideBarrierBead({ prefix = '', className = 'w-full h-full' }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id={`${prefix}ceramide-core`} cx="36" cy="34" r="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF7ED" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#FFEDD5" stopOpacity="0.8" />
          <stop offset="85%" stopColor="#FDBA74" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#E8633A" stopOpacity="0.7" />
        </radialGradient>
        <filter id={`${prefix}ceramide-glow`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#E8633A" floodOpacity="0.2" />
        </filter>
      </defs>
      <g filter={`url(#${prefix}ceramide-glow)`}>
        {/* Outer Phospholipid Bilayer Shell */}
        <circle cx="40" cy="40" r="29" fill={`url(#${prefix}ceramide-core)`} stroke="#FFEDD5" strokeWidth="1.5" />
        {/* Intercellular Lipid Ring */}
        <circle cx="40" cy="40" r="21" stroke="#E8633A" strokeWidth="1.2" strokeDasharray="4 3" strokeOpacity="0.7" fill="none" />
        {/* Protective Core Shield */}
        <circle cx="40" cy="40" r="13" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1" />
        {/* Hydrophilic Head Vertices */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <circle
            key={i}
            cx={40 + 21 * Math.cos((deg * Math.PI) / 180)}
            cy={40 + 21 * Math.sin((deg * Math.PI) / 180)}
            r="2.2"
            fill="#E8633A"
            opacity="0.8"
          />
        ))}
        {/* Specular Highlight Arc */}
        <path
          d="M26 32C28 25 35 22 42 22"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
      </g>
    </svg>
  );
}

/**
 * ==============================================================================
 * Section-Specific Active Ingredient Layout Configs
 * ==============================================================================
 * Each chapter has a tailored constellation of ingredients matching that section's
 * topic (Bio-Match, Barrier Diagnostic, Smart Dupes, Catalog) and arranged in the
 * outer gutters to completely avoid overlapping text columns or the 3D bottle path.
 */
const SECTION_INGREDIENTS = {
  // Section 01: Hero / Bio-Match Debut (7 items framing the headline & live score)
  hero: [
    {
      id: 'vit-c-top-left',
      title: '15% Ethyl Ascorbic (Vitamin C)',
      Component: VitaminCSlice,
      size: 72,
      position: { top: '6%', left: '4%' },
      initialRotate: -8,
      floatY: [-13, 14, -13],
      floatX: [-8, 7, -8],
      floatRotate: [-7, 6, -7],
      duration: 9.4,
      delay: 0,
      parallaxFactor: 7,
      opacity: 0.28
    },
    {
      id: 'ferulic-top-center',
      title: 'Ferulic Acid Aromatic Ring',
      Component: FerulicAcidMolecule,
      size: 56,
      position: { top: '10%', left: '32%' },
      initialRotate: 14,
      floatY: [11, -15, 11],
      floatX: [6, -8, 6],
      floatRotate: [5, -7, 5],
      duration: 8.6,
      delay: 0.8,
      parallaxFactor: 5,
      opacity: 0.24
    },
    {
      id: 'squalane-bottom-left',
      title: 'Squalane Bio-Lipid Bead',
      Component: SqualaneLipidBead,
      size: 54,
      position: { top: '82%', left: '6%' },
      initialRotate: 12,
      floatY: [-15, 11, -15],
      floatX: [-6, 8, -6],
      floatRotate: [-5, 6, -5],
      duration: 11.2,
      delay: 1.5,
      parallaxFactor: 8,
      opacity: 0.26
    },
    {
      id: 'rose-bottom-center',
      title: 'Damask Rose Petal Extract',
      Component: BotanicalPetal,
      size: 60,
      position: { top: '84%', left: '42%' },
      initialRotate: -10,
      floatY: [13, -12, 13],
      floatX: [8, -7, 8],
      floatRotate: [6, -6, 6],
      duration: 7.9,
      delay: 0.4,
      parallaxFactor: 6,
      opacity: 0.28
    },
    {
      id: 'ha-top-right',
      title: 'Multi-Weight Hyaluronic Acid',
      Component: HyaluronicDroplet,
      size: 62,
      position: { top: '5%', right: '7%' },
      initialRotate: 8,
      floatY: [-14, 15, -14],
      floatX: [-7, 9, -7],
      floatRotate: [-6, 5, -6],
      duration: 10.3,
      delay: 1.8,
      parallaxFactor: 9,
      opacity: 0.26
    },
    {
      id: 'glycolic-right-edge',
      title: 'Glycolic Acid (AHA) Crystal',
      Component: AhaGlycolicCrystal,
      size: 52,
      position: { top: '48%', right: '3%' },
      initialRotate: -14,
      floatY: [9, -13, 9],
      floatX: [6, -7, 6],
      floatRotate: [6, -7, 6],
      duration: 8.8,
      delay: 0.6,
      parallaxFactor: 5,
      opacity: 0.22
    },
    {
      id: 'cica-bottom-right',
      title: 'Centella Asiatica (Cica) Leaf',
      Component: CentellaLeaf,
      size: 58,
      position: { top: '78%', right: '8%' },
      initialRotate: 7,
      floatY: [-11, 14, -11],
      floatX: [-8, 6, -8],
      floatRotate: [-8, 6, -8],
      duration: 10.6,
      delay: 1.2,
      parallaxFactor: 7,
      opacity: 0.25
    }
  ],

  // Section 02: Diagnostic (Ceramide, Cica, HA, Vit C, AHA, Squalane framing quiz & scoring)
  diagnostic: [
    {
      id: 'ceramide-diag-top-left',
      title: 'Ceramide NP Barrier Bilayer',
      Component: CeramideBarrierBead,
      size: 60,
      position: { top: '6%', left: '4%' },
      initialRotate: -10,
      floatY: [-12, 13, -12],
      floatX: [-7, 8, -7],
      floatRotate: [-6, 7, -6],
      duration: 8.7,
      delay: 0.2,
      parallaxFactor: 6,
      opacity: 0.27
    },
    {
      id: 'cica-diag-mid-left',
      title: 'Centella Asiatica (Cica) Leaf',
      Component: CentellaLeaf,
      size: 62,
      position: { top: '46%', left: '3%' },
      initialRotate: 12,
      floatY: [12, -14, 12],
      floatX: [7, -6, 7],
      floatRotate: [6, -5, 6],
      duration: 10.4,
      delay: 0.9,
      parallaxFactor: 7,
      opacity: 0.25
    },
    {
      id: 'ha-diag-bottom-left',
      title: 'Multi-Weight Hyaluronic Acid',
      Component: HyaluronicDroplet,
      size: 56,
      position: { top: '84%', left: '5%' },
      initialRotate: 6,
      floatY: [-14, 12, -14],
      floatX: [-6, 7, -6],
      floatRotate: [-5, 6, -5],
      duration: 9.8,
      delay: 1.4,
      parallaxFactor: 8,
      opacity: 0.28
    },
    {
      id: 'vitc-diag-top-right',
      title: '15% Ethyl Ascorbic (Vitamin C)',
      Component: VitaminCSlice,
      size: 66,
      position: { top: '5%', right: '5%' },
      initialRotate: 9,
      floatY: [10, -13, 10],
      floatX: [6, -8, 6],
      floatRotate: [5, -6, 5],
      duration: 8.4,
      delay: 0.4,
      parallaxFactor: 6,
      opacity: 0.26
    },
    {
      id: 'aha-diag-mid-right',
      title: 'Glycolic Acid (AHA) Crystal',
      Component: AhaGlycolicCrystal,
      size: 52,
      position: { top: '48%', right: '2%' },
      initialRotate: -12,
      floatY: [-10, 11, -10],
      floatX: [-5, 6, -5],
      floatRotate: [-6, 7, -6],
      duration: 9.1,
      delay: 1.1,
      parallaxFactor: 5,
      opacity: 0.23
    },
    {
      id: 'squalane-diag-bottom-right',
      title: 'Squalane Bio-Lipid Bead',
      Component: SqualaneLipidBead,
      size: 54,
      position: { top: '86%', right: '6%' },
      initialRotate: -8,
      floatY: [13, -12, 13],
      floatX: [8, -7, 8],
      floatRotate: [6, -6, 6],
      duration: 11.0,
      delay: 1.6,
      parallaxFactor: 7,
      opacity: 0.25
    }
  ],

  // Section 03: Smart Dupes (Turmeric, Ferulic, Vit C, Rose, Squalane, HA framing savings comparison)
  dupes: [
    {
      id: 'turmeric-dupes-top-left',
      title: 'Botanical Turmeric Extract Active',
      Component: TurmericExtractSwatch,
      size: 62,
      position: { top: '5%', left: '4%' },
      initialRotate: 14,
      floatY: [-11, 13, -11],
      floatX: [-7, 8, -7],
      floatRotate: [-7, 6, -7],
      duration: 8.5,
      delay: 0.3,
      parallaxFactor: 7,
      opacity: 0.28
    },
    {
      id: 'squalane-dupes-mid-left',
      title: 'Squalane Bio-Lipid Bead',
      Component: SqualaneLipidBead,
      size: 54,
      position: { top: '48%', left: '2%' },
      initialRotate: -10,
      floatY: [12, -14, 12],
      floatX: [6, -8, 6],
      floatRotate: [5, -6, 5],
      duration: 10.2,
      delay: 1.2,
      parallaxFactor: 6,
      opacity: 0.24
    },
    {
      id: 'ferulic-dupes-bottom-left',
      title: 'Ferulic Acid Aromatic Ring',
      Component: FerulicAcidMolecule,
      size: 56,
      position: { top: '85%', left: '5%' },
      initialRotate: 8,
      floatY: [-13, 11, -13],
      floatX: [-6, 7, -6],
      floatRotate: [-5, 6, -5],
      duration: 9.3,
      delay: 0.7,
      parallaxFactor: 7,
      opacity: 0.26
    },
    {
      id: 'vitc-dupes-center-top',
      title: '15% Ethyl Ascorbic (Vitamin C)',
      Component: VitaminCSlice,
      size: 64,
      position: { top: '6%', left: '46%' },
      initialRotate: -8,
      floatY: [10, -12, 10],
      floatX: [7, -6, 7],
      floatRotate: [6, -5, 6],
      duration: 8.9,
      delay: 0.5,
      parallaxFactor: 5,
      opacity: 0.25
    },
    {
      id: 'rose-dupes-top-right',
      title: 'Damask Rose Petal Extract',
      Component: BotanicalPetal,
      size: 60,
      position: { top: '5%', right: '5%' },
      initialRotate: 12,
      floatY: [-12, 14, -12],
      floatX: [-8, 7, -8],
      floatRotate: [-6, 6, -6],
      duration: 9.6,
      delay: 0.9,
      parallaxFactor: 7,
      opacity: 0.26
    },
    {
      id: 'ha-dupes-bottom-right',
      title: 'Multi-Weight Hyaluronic Acid',
      Component: HyaluronicDroplet,
      size: 58,
      position: { top: '84%', right: '6%' },
      initialRotate: -6,
      floatY: [14, -13, 14],
      floatX: [8, -7, 8],
      floatRotate: [6, -7, 6],
      duration: 10.8,
      delay: 1.5,
      parallaxFactor: 8,
      opacity: 0.27
    }
  ],

  // Section 04: Catalog Database (Actives framing filters and routine basket)
  catalog: [
    {
      id: 'vitc-cat-top-left',
      title: '15% Ethyl Ascorbic (Vitamin C)',
      Component: VitaminCSlice,
      size: 64,
      position: { top: '2%', left: '2%' },
      initialRotate: 6,
      floatY: [-10, 12, -10],
      floatX: [-6, 7, -6],
      floatRotate: [-5, 6, -5],
      duration: 9.2,
      delay: 0.2,
      parallaxFactor: 6,
      opacity: 0.25
    },
    {
      id: 'aha-cat-mid-left',
      title: 'Glycolic Acid (AHA) Crystal',
      Component: AhaGlycolicCrystal,
      size: 52,
      position: { top: '44%', left: '1%' },
      initialRotate: -12,
      floatY: [11, -12, 11],
      floatX: [6, -6, 6],
      floatRotate: [6, -6, 6],
      duration: 8.6,
      delay: 0.8,
      parallaxFactor: 5,
      opacity: 0.22
    },
    {
      id: 'rose-cat-bottom-left',
      title: 'Damask Rose Petal Extract',
      Component: BotanicalPetal,
      size: 60,
      position: { top: '88%', left: '3%' },
      initialRotate: 10,
      floatY: [-13, 13, -13],
      floatX: [-7, 8, -7],
      floatRotate: [-6, 6, -6],
      duration: 10.5,
      delay: 1.3,
      parallaxFactor: 7,
      opacity: 0.26
    },
    {
      id: 'cica-cat-top-right',
      title: 'Centella Asiatica (Cica) Leaf',
      Component: CentellaLeaf,
      size: 58,
      position: { top: '3%', right: '3%' },
      initialRotate: -8,
      floatY: [10, -11, 10],
      floatX: [6, -7, 6],
      floatRotate: [5, -5, 5],
      duration: 9.8,
      delay: 0.6,
      parallaxFactor: 6,
      opacity: 0.25
    },
    {
      id: 'ha-cat-mid-right',
      title: 'Multi-Weight Hyaluronic Acid',
      Component: HyaluronicDroplet,
      size: 56,
      position: { top: '46%', right: '2%' },
      initialRotate: 9,
      floatY: [-12, 12, -12],
      floatX: [-6, 6, -6],
      floatRotate: [-5, 6, -5],
      duration: 8.9,
      delay: 1.1,
      parallaxFactor: 7,
      opacity: 0.26
    },
    {
      id: 'ceramide-cat-bottom-right',
      title: 'Ceramide NP Barrier Bilayer',
      Component: CeramideBarrierBead,
      size: 54,
      position: { top: '90%', right: '4%' },
      initialRotate: -10,
      floatY: [13, -14, 13],
      floatX: [8, -8, 8],
      floatRotate: [6, -7, 6],
      duration: 11.4,
      delay: 1.7,
      parallaxFactor: 8,
      opacity: 0.25
    }
  ]
};

/**
 * FloatingIngredients Component
 * 
 * Renders an ambient flat-lay background of active ingredients across the entire
 * landing page, tailored per chapter (hero, diagnostic, dupes, catalog).
 * 
 * Performance & Polish:
 * 1. Low z-index (z-0) and pointer-events-none so no clicks, quizzes, or 3D rotations are blocked.
 * 2. Nested motion elements:
 *    - Outer motion.div manages smooth cursor parallax.
 *    - Inner motion.div runs pure 60fps GPU compositor transform loops (translate/rotate).
 * 3. Backward compatible: respects heroIsActive prop if provided, or defaults to active.
 * 4. Full accessibility support: respects `prefers-reduced-motion` with static positions.
 * 
 * @param {Object} props
 * @param {'hero'|'diagnostic'|'dupes'|'catalog'} [props.section='hero'] - Section layout identifier.
 * @param {boolean} [props.heroIsActive] - Legacy active trigger (for backwards compatibility).
 * @param {boolean} [props.isActive=true] - Active flag controlling overall visibility.
 * @param {string} [props.className=''] - Optional additional container classes.
 */
export default function FloatingIngredients({
  section = 'hero',
  heroIsActive,
  isActive = true,
  className = ''
}) {
  const shouldReduceMotion = useReducedMotion();
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const rawId = useId();
  const idPrefix = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  // If heroIsActive is explicitly supplied, honor it; otherwise default to isActive
  const isVisible = heroIsActive !== undefined ? heroIsActive : isActive;

  // Selected ingredient set for this section (falls back to hero if unknown)
  const items = SECTION_INGREDIENTS[section] || SECTION_INGREDIENTS.hero;

  // Subtle mouse parallax tracking across the page area
  useEffect(() => {
    if (shouldReduceMotion) return;

    let rafId = null;
    const handleMouseMove = (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const width = window.innerWidth || 1024;
        const height = window.innerHeight || 768;
        const normX = (e.clientX - width / 2) / (width / 2);
        const normY = (e.clientY - height / 2) / (height / 2);
        setMouseOffset({ x: normX, y: normY });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [shouldReduceMotion]);

  return (
    <motion.div
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 select-none ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      aria-hidden="true"
    >
      {items.map((item) => {
        const { Component } = item;
        const elementPrefix = `${idPrefix}-${item.id}-`;

        return (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              ...item.position,
              width: `${item.size}px`,
              height: `${item.size}px`,
            }}
          >
            {/* Outer Parallax Container: Shifts subtly opposite to user cursor */}
            <motion.div
              className="w-full h-full"
              animate={
                shouldReduceMotion
                  ? { x: 0, y: 0 }
                  : {
                      x: mouseOffset.x * -item.parallaxFactor,
                      y: mouseOffset.y * -item.parallaxFactor,
                    }
              }
              transition={{ type: 'spring', damping: 28, stiffness: 90 }}
            >
              {/* Inner Float Loop: Slow vertical bob + gentle drift + micro-rotation */}
              <motion.div
                className="w-full h-full"
                style={{ opacity: item.opacity }}
                animate={
                  shouldReduceMotion
                    ? { rotate: item.initialRotate }
                    : {
                        y: item.floatY,
                        x: item.floatX,
                        rotate: item.floatRotate,
                      }
                }
                transition={
                  shouldReduceMotion
                    ? undefined
                    : {
                        duration: item.duration,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                        delay: item.delay,
                      }
                }
              >
                <Component prefix={elementPrefix} />
              </motion.div>
            </motion.div>
          </div>
        );
      })}
    </motion.div>
  );
}
