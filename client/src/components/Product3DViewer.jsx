import React, { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';

const DEFAULT_MODEL_URL = '/assets/cosmetic_jar.glb';

// Preload the local model so it's always ready immediately
try {
  useGLTF.preload(DEFAULT_MODEL_URL);
} catch {
  // Ignored in non-browser environment
}

// Category → luxurious accent lighting colour
const CATEGORY_COLORS = {
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

// Error boundary to gracefully catch any corrupted 3D model or network failure
class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err) {
    console.warn('3D Model failed to load, falling back to default jar:', err);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function ProductMesh({ url }) {
  const { scene } = useGLTF(url);
  const ref = useRef();

  // Normalize model scale and center once when scene is loaded
  const model = useMemo(() => {
    const inst = scene.clone(true);
    inst.traverse(n => {
      if (n.isMesh) {
        n.castShadow = true;
        n.receiveShadow = true;
      }
    });
    inst.updateMatrixWorld(true);
    const box  = new THREE.Box3().setFromObject(inst);
    const size = box.getSize(new THREE.Vector3());
    const max  = Math.max(size.x, size.y, size.z, 0.001);
    inst.scale.setScalar(3.6 / max);
    inst.updateMatrixWorld(true);
    const box2   = new THREE.Box3().setFromObject(inst);
    const center = box2.getCenter(new THREE.Vector3());
    inst.position.x -= center.x;
    inst.position.z -= center.z;
    inst.position.y -= box2.min.y;
    return inst;
  }, [scene]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.004;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 1.1) * 0.06;
  });

  return (
    <group ref={ref}>
      <primitive object={model} />
    </group>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.6, 24, 24]} />
      <meshStandardMaterial color="#E8633A" wireframe opacity={0.3} transparent />
    </mesh>
  );
}

/**
 * Product3DViewer
 * Renders an interactive 3D model preview with orbit drag and scroll zoom.
 * Accepts `modelUrl` (supports Cloudinary .glb URLs) and falls back safely.
 */
export default function Product3DViewer({ modelUrl, category, style }) {
  const [hovered, setHovered] = useState(false);
  const accentColor = CATEGORY_COLORS[category] || '#E8633A';

  // Normalize model URL: use provided URL if it's a glb/gltf, else fallback to default
  const validUrl = (modelUrl && typeof modelUrl === 'string' && (modelUrl.includes('.glb') || modelUrl.includes('.gltf')))
    ? modelUrl
    : DEFAULT_MODEL_URL;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: 340,
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        cursor: hovered ? 'grabbing' : 'grab',
        ...style,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 3D Indicator Badge */}
      <div style={{
        position: 'absolute', top: 14, left: 14,
        background: 'rgba(35,30,27,0.7)', backdropFilter: 'blur(8px)',
        color: '#fff', fontSize: 11, fontWeight: 700, padding: '5px 12px',
        borderRadius: 20, zIndex: 10, letterSpacing: 0.4,
        display: 'flex', alignItems: 'center', gap: 6,
        pointerEvents: 'none',
      }}>
        <span style={{ fontSize: 13 }}>🧊</span> 3D Interactive Model
      </div>

      {/* Interactive Controls Hint */}
      <div style={{
        position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(35,30,27,0.65)', backdropFilter: 'blur(8px)',
        color: '#fff', fontSize: 11, fontWeight: 600, padding: '5px 16px',
        borderRadius: 20, zIndex: 10, letterSpacing: 0.4, whiteSpace: 'nowrap',
        pointerEvents: 'none', transition: 'opacity .3s',
        opacity: hovered ? 0.3 : 1,
      }}>
        🖐 Drag to rotate · Scroll to zoom
      </div>

      {/* Accent glow ring */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 70%, ${accentColor}25 0%, transparent 70%)`,
        pointerEvents: 'none', zIndex: 1,
      }} />

      <Canvas
        camera={{ position: [0, 1.4, 5.5], fov: 36 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        shadows
        style={{ width: '100%', height: '100%' }}
      >
        {/* Lighting Setup */}
        <ambientLight intensity={1.6} />
        <directionalLight position={[5, 8, 5]} intensity={2.4} castShadow />
        <pointLight position={[-4, 2, 3]} intensity={1.4} color={accentColor} />
        <pointLight position={[3, -1, -3]} intensity={0.8} color="#ffffff" />

        <Suspense fallback={<LoadingFallback />}>
          <ModelErrorBoundary fallback={
            <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.2}>
              <ProductMesh url={DEFAULT_MODEL_URL} accentColor={accentColor} />
            </Float>
          }>
            <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.2}>
              <ProductMesh url={validUrl} accentColor={accentColor} />
            </Float>
          </ModelErrorBoundary>
          <ContactShadows
            position={[0, -1.4, 0]}
            opacity={0.35}
            scale={8}
            blur={2.5}
            far={4}
            color="#231E1B"
          />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={2.5}
          maxDistance={10}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={(5 * Math.PI) / 6}
        />
      </Canvas>
    </div>
  );
}
