import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import cosmeticJarUrl from '../../../cosmetic_jar.glb';

const SCENE_STOPS = [
  { at: 0, position: [0, 0.04, 0], rotation: [0.03, -0.18, -0.025], scale: 0.44 },
  { at: 0.333, position: [-1.1, -0.15, 0.16], rotation: [-0.08, 1.05, 0.1], scale: 0.42 },
  { at: 0.666, position: [1.1, 0.1, 0.1], rotation: [0.1, 4.05, -0.1], scale: 0.42 },
  { at: 1, position: [0, -0.18, 0.2], rotation: [0, Math.PI * 2, 0], scale: 0.32 }
];

function smoothstep(value) {
  const clamped = THREE.MathUtils.clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

function getSceneTarget(progress) {
  const p = THREE.MathUtils.clamp(progress, 0, 1);
  const endIndex = SCENE_STOPS.findIndex((stop) => p <= stop.at);
  const end = SCENE_STOPS[endIndex === -1 ? SCENE_STOPS.length - 1 : endIndex];
  const start = SCENE_STOPS[Math.max(0, SCENE_STOPS.indexOf(end) - 1)];
  const amount = smoothstep((p - start.at) / (end.at - start.at || 1));

  return {
    position: start.position.map((value, index) => THREE.MathUtils.lerp(value, end.position[index], amount)),
    rotation: start.rotation.map((value, index) => THREE.MathUtils.lerp(value, end.rotation[index], amount)),
    scale: THREE.MathUtils.lerp(start.scale, end.scale, amount)
  };
}

/** Loads the supplied GLB once, then centers/scales it for the existing landing-page route. */
function CosmeticJarAsset() {
  const { scene } = useGLTF(cosmeticJarUrl);

  const jar = useMemo(() => {
    const instance = scene.clone(true);
    instance.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    instance.updateMatrixWorld(true);
    const originalBounds = new THREE.Box3().setFromObject(instance);
    const originalSize = originalBounds.getSize(new THREE.Vector3());
    const dominantDimension = Math.max(originalSize.x, originalSize.y, originalSize.z, 0.001);

    // The source GLB is authored at a very small real-world scale. Normalize it
    // against the presentation pedestal, without changing its proportions.
    instance.scale.setScalar(3.35 / dominantDimension);
    instance.updateMatrixWorld(true);

    const scaledBounds = new THREE.Box3().setFromObject(instance);
    const scaledCenter = scaledBounds.getCenter(new THREE.Vector3());
    instance.position.x -= scaledCenter.x;
    instance.position.z -= scaledCenter.z;
    instance.position.y -= scaledBounds.min.y;

    return instance;
  }, [scene]);

  return <primitive object={jar} />;
}

function ScrollLinkedJar({ scrollProgress }) {
  const stageRef = useRef();
  const jarMotionRef = useRef();

  useFrame((state, delta) => {
    if (!stageRef.current || !jarMotionRef.current) return;

    const next = getSceneTarget(scrollProgress);
    stageRef.current.position.x = THREE.MathUtils.damp(stageRef.current.position.x, next.position[0], 7, delta);
    stageRef.current.position.y = THREE.MathUtils.damp(stageRef.current.position.y, next.position[1], 7, delta);
    stageRef.current.position.z = THREE.MathUtils.damp(stageRef.current.position.z, next.position[2], 7, delta);
    stageRef.current.rotation.x = THREE.MathUtils.damp(stageRef.current.rotation.x, next.rotation[0], 7, delta);
    stageRef.current.rotation.y = THREE.MathUtils.damp(stageRef.current.rotation.y, next.rotation[1], 7, delta);
    stageRef.current.rotation.z = THREE.MathUtils.damp(stageRef.current.rotation.z, next.rotation[2], 7, delta);
    stageRef.current.scale.x = THREE.MathUtils.damp(stageRef.current.scale.x, next.scale, 7, delta);
    stageRef.current.scale.y = THREE.MathUtils.damp(stageRef.current.scale.y, next.scale, 7, delta);
    stageRef.current.scale.z = THREE.MathUtils.damp(stageRef.current.scale.z, next.scale, 7, delta);

    // A tiny independent movement keeps the loaded model connected to its path.
    jarMotionRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.35) * 0.025;
    jarMotionRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.1) * 0.006;
  });

  return (
    <group ref={stageRef} position={SCENE_STOPS[0].position} scale={SCENE_STOPS[0].scale}>
      <group ref={jarMotionRef}>
        <mesh position={[0, -1.3, 0]} receiveShadow>
          <cylinderGeometry args={[1.86, 2.1, 0.26, 64]} />
          <meshStandardMaterial color="#DED4C8" roughness={0.82} metalness={0.04} />
        </mesh>
        <mesh position={[0, -1.145, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
          <torusGeometry args={[1.68, 0.042, 14, 64]} />
          <meshStandardMaterial color="#F7F1EB" roughness={0.65} />
        </mesh>

        <group position={[0, -1.15, 0]}>
          <CosmeticJarAsset />
        </group>
      </group>
    </group>
  );
}

export default function HeroBottle3D({ scrollProgress = 0 }) {
  return (
    <div className="h-full w-full select-none" aria-hidden="true">
      <Canvas camera={{ position: [0, 0.15, 6.2], fov: 38 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} shadows>
        <ambientLight intensity={1.45} />
        <directionalLight position={[4.5, 6, 5]} intensity={2.6} castShadow />
        <pointLight position={[-3.5, 1.5, 3]} intensity={1.2} color="#FFD7C0" />
        <pointLight position={[1, -1, -3]} intensity={1.5} color="#3FE08B" />

        <Sparkles count={28} scale={[8, 6, 6]} size={2.2} speed={0.25} color="#E8633A" opacity={0.45} />
        <Sparkles count={20} scale={[7, 5, 5]} size={1.8} speed={0.2} color="#467254" opacity={0.4} />
        <Sparkles count={16} scale={[8, 6, 7]} size={1.5} speed={0.3} color="#E5C158" opacity={0.45} />

        <Suspense fallback={null}>
          <ScrollLinkedJar scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(cosmeticJarUrl);
