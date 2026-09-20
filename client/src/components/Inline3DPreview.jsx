import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

/**
 * ==============================================================================
 * Inline3DPreview Component — Reusable Tactile 3D Canvas Preview
 * ==============================================================================
 *
 * Renders an inline, lightweight WebGL preview for products that contain .glb
 * or .gltf 3D models. Used across:
 *   - ProductCard.jsx
 *   - CompareColumn.jsx (Side-by-Side Clinical Breakdown)
 *   - ComparePage.jsx (Staged formulation slots & pairings)
 *
 * Capabilities:
 *   - Auto-normalization of bounding box so bottles/jars are never clipped
 *   - Grounding on contact shadow plane (y = -0.75) for natural surface resting
 *   - Lightweight "demand" frameloop for low GPU overhead
 *   - Graceful fallback to default cosmetic jar if Cloudinary GLB URL fails
 *   - Smooth continuous auto-rotation with interactive orbit drag
 */

export const DEFAULT_MODEL_URL = '/assets/cosmetic_jar.glb';

// Sophisticated pastel background washes matching product categories
export const CATEGORY_PASTELS = {
  Cleanser:          '#FDF2EB',
  Toner:             '#EAF3FB',
  Serum:             '#F3ECF8',
  Moisturizer:       '#EEF7F2',
  Sunscreen:         '#FDF5EA',
  Foundation:        '#F8EDE7',
  Concealer:         '#F8F0E6',
  Blush:             '#FAECF4',
  Lipstick:          '#FAECEC',
  'Lip Balm':        '#FDF2F2',
  Mascara:           '#EEEEF9',
  Eyeliner:          '#EEF2F9',
  'Face Mask':       '#EEF8F4',
  Exfoliator:        '#F9F6E9',
  'Under-eye Cream': '#F4EEF9',
  'Body Lotion':     '#EEF8F6',
};

// Category accent colours for atmospheric 3D point lighting
export const CATEGORY_COLORS = {
  Serum:             '#E8633A',
  Moisturizer:       '#3FE08B',
  Cleanser:          '#5BC4FF',
  Toner:             '#B088F9',
  Sunscreen:         '#FFCA28',
  Foundation:        '#F48FB1',
  Concealer:         '#FFAB91',
  Blush:             '#FF8A80',
  Mascara:           '#7C4DFF',
  Eyeliner:          '#448AFF',
  'Face Mask':       '#1DE9B6',
  'Lip Balm':        '#FF5252',
  Lipstick:          '#FF1744',
  Exfoliator:        '#F39C12',
  'Under-eye Cream': '#9B59B6',
  'Body Lotion':     '#26A69A',
};

// ── Mini Product 3D Mesh (scaled, centered, and grounded) ─────────────────────
function MiniProductMesh({ url }) {
  const { scene } = useGLTF(url);
  const ref = useRef();

  // Clone and normalize geometry so all product models fit comfortably within frame
  const model = useMemo(() => {
    const inst = scene.clone(true);
    inst.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    inst.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(inst);
    const size = box.getSize(new THREE.Vector3());
    const max = Math.max(size.x, size.y, size.z, 0.001);

    // Scale so the largest dimension fits comfortably (~1.85 units)
    inst.scale.setScalar(1.85 / max);
    inst.updateMatrixWorld(true);

    const box2 = new THREE.Box3().setFromObject(inst);
    const centre = box2.getCenter(new THREE.Vector3());

    // Center horizontally (X) and in depth (Z)
    inst.position.x -= centre.x;
    inst.position.z -= centre.z;

    // Ground the base of the model firmly at y = -0.75 where ContactShadows sits
    inst.position.y -= box2.min.y;
    inst.position.y -= 0.75;
    return inst;
  }, [scene]);

  // Gentle auto-rotation around Y axis only
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.005;
  });

  return (
    <group ref={ref}>
      <primitive object={model} />
    </group>
  );
}

// ── Error Boundary for 3D Model Loading ──────────────────────────────────────
class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err) {
    console.warn('3D model load failed, falling back to default jar:', err);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// ── Inline 3D Preview Canvas ──────────────────────────────────────────────────
export default function Inline3DPreview({ modelUrl, category, pastelBg = '#FAF6F2' }) {
  const accentColor = CATEGORY_COLORS[category] || '#E8633A';

  // Resolve GLB URL: use provided cloudinary link if it is a valid glb/gltf, else fallback
  const validUrl =
    modelUrl &&
    typeof modelUrl === 'string' &&
    (modelUrl.includes('.glb') || modelUrl.includes('.gltf'))
      ? modelUrl
      : DEFAULT_MODEL_URL;

  const fallbackJSX = <MiniProductMesh url={DEFAULT_MODEL_URL} />;

  return (
    <div className="w-full h-full relative">
      {/* Accent glow ring behind the model */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 65%, ${accentColor}18 0%, transparent 65%)`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <Canvas
        camera={{ position: [0, 0.4, 4.0], fov: 32 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        frameloop="demand"
        style={{ width: '100%', height: '100%', background: pastelBg }}
      >
        {/* Ambient & Studio Lighting */}
        <ambientLight intensity={1.8} />
        <directionalLight position={[4, 6, 4]} intensity={2} />
        <pointLight position={[-3, 2, 2]} intensity={1} color={accentColor} />

        <Suspense fallback={null}>
          <ModelErrorBoundary fallback={fallbackJSX}>
            <MiniProductMesh url={validUrl} />
          </ModelErrorBoundary>

          {/* Ground Contact Shadow */}
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
