/* ═══════════════════════════════════════════════
   DIWALI — The Festival of Lights 2026
   3D Canvas Scene — React Three Fiber
   Photorealistic Fireworks & Particle-To-Text Morphing Engine
   ═══════════════════════════════════════════════ */
import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { sampleTextCoordinates } from '../utils/textParticleSampler';

/* ── Procedural Glow Texture for Incandescent Sparks ── */
function makeGlowTexture(inner, outer, size = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const h = size / 2;
  const gr = g.createRadialGradient(h, h, 0, h, h, h);
  gr.addColorStop(0, inner);
  gr.addColorStop(0.28, outer);
  gr.addColorStop(0.7, 'rgba(255,180,40,0.12)');
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/* ── Starry Celestial Sky ─────────────────────── */
function Stars() {
  const ref = useRef();
  const count = 1600;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const cWhite = new THREE.Color(0xFFFFFF);
    const cGold = new THREE.Color(0xFFE5A3);
    const cCyan = new THREE.Color(0xC8F4FF);

    for (let i = 0; i < count; i++) {
      const r = 45 + Math.random() * 55;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = Math.abs(r * Math.cos(phi)) * 0.78 + 2.5;
      pos[i * 3 + 2] = -Math.abs(r * Math.sin(phi) * Math.sin(theta)) - 8;

      const rnd = Math.random();
      const c = rnd > 0.65 ? cGold : (rnd > 0.35 ? cCyan : cWhite);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, [count]);

  useFrame((state, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.0022;
      const t = state.clock.elapsedTime;
      ref.current.material.opacity = 0.85 + Math.sin(t * 2.2) * 0.12;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.32}
        vertexColors
        transparent
        opacity={0.88}
        fog={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ── 3D Sacred Brass Diya ──────────────────────── */
function Diya({ flameIntensity = 0 }) {
  const groupRef = useRef();
  const flameRef = useRef();
  const haloRef = useRef();
  const lightRef = useRef();
  const embersRef = useRef();

  const textures = useMemo(() => ({
    flame: makeGlowTexture('rgba(255,255,240,1)', 'rgba(255,160,30,0.85)', 128),
    halo: makeGlowTexture('rgba(255,190,70,0.7)', 'rgba(255,110,20,0.18)', 128),
    spark: makeGlowTexture('rgba(255,255,255,1)', 'rgba(255,215,106,0.6)', 64),
  }), []);

  const bowlProfile = useMemo(() => {
    const pts = [
      [0.01, 0], [0.35, 0.01], [0.52, 0.02], [0.72, 0.08],
      [0.92, 0.16], [1.1, 0.32], [1.22, 0.48], [1.3, 0.62],
      [1.26, 0.68], [1.18, 0.6], [0.9, 0.42], [0.48, 0.3], [0.01, 0.28],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 56);
  }, []);

  const rimProfile = useMemo(() => {
    const pts = [
      [1.18, 0.58], [1.32, 0.62], [1.34, 0.66], [1.28, 0.7], [1.18, 0.65],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 56);
  }, []);

  // Embers data
  const embersData = useMemo(() => {
    const count = 50;
    const pos = new Float32Array(count * 3);
    const vel = [];
    const life = [];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 1.2;
      pos[i * 3 + 2] = 0;
      vel.push({
        x: (Math.random() - 0.5) * 0.05,
        y: 0.04 + Math.random() * 0.07,
        z: (Math.random() - 0.5) * 0.05,
      });
      life.push(Math.random());
    }
    return { pos, vel, life, count };
  }, []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const intensity = flameIntensity;

    if (flameRef.current) {
      const f = 1 + Math.sin(t * 11) * 0.07 + Math.sin(t * 17.3) * 0.05 + Math.sin(t * 7.1) * 0.03;
      flameRef.current.scale.set(0.9 * intensity * f, 1.65 * intensity * f, 1);
      flameRef.current.material.opacity = intensity;
    }
    if (haloRef.current) {
      haloRef.current.scale.set(
        4.5 * intensity * (1 + Math.sin(t * 5) * 0.05),
        4.5 * intensity,
        1
      );
      haloRef.current.material.opacity = intensity * 0.7;
    }
    if (lightRef.current) {
      lightRef.current.intensity = intensity * (3.0 + Math.sin(t * 13) * 0.4);
    }

    if (embersRef.current && intensity > 0.02) {
      const d = embersData;
      for (let i = 0; i < d.count; i++) {
        d.life[i] += dt * 0.5;
        if (d.life[i] > 1) {
          d.life[i] = 0;
          d.pos[i * 3] = 0;
          d.pos[i * 3 + 1] = 1.2;
          d.pos[i * 3 + 2] = 0;
        }
        const l = d.life[i];
        d.pos[i * 3] += d.vel[i].x * (1 - l);
        d.pos[i * 3 + 1] += d.vel[i].y * (1 - l * 0.5);
        d.pos[i * 3 + 2] += d.vel[i].z * (1 - l);
      }
      embersRef.current.geometry.attributes.position.needsUpdate = true;
      embersRef.current.material.opacity = intensity * 0.7;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={bowlProfile} position={[0, 0.12, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          color={0xc8681e} metalness={0.7} roughness={0.28}
          side={THREE.DoubleSide} emissive={0x3a0d00} emissiveIntensity={0.5}
        />
      </mesh>

      <mesh geometry={rimProfile} position={[0, 0.12, 0]}>
        <meshStandardMaterial
          color={0xd4a64a} metalness={0.8} roughness={0.2}
          emissive={0x6b4f1a} emissiveIntensity={0.3}
        />
      </mesh>

      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.05, 32]} />
        <meshStandardMaterial
          color={0xffe898} metalness={0.2} roughness={0.7}
          transparent opacity={0.7}
        />
      </mesh>

      <mesh position={[0, 0.56, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.28, 8]} />
        <meshStandardMaterial color={0x1e0e08} roughness={1} />
      </mesh>

      <sprite ref={flameRef} position={[0, 1.16, 0]} scale={[0, 0, 1]}>
        <spriteMaterial
          map={textures.flame} blending={THREE.AdditiveBlending}
          depthWrite={false} transparent
        />
      </sprite>

      <sprite ref={haloRef} position={[0, 1.1, 0]} scale={[0, 0, 1]}>
        <spriteMaterial
          map={textures.halo} blending={THREE.AdditiveBlending}
          depthWrite={false} transparent
        />
      </sprite>

      <pointLight ref={lightRef} position={[0, 1.2, 0]} color={0xffa040} intensity={0} distance={20} decay={1.8} />

      <points ref={embersRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position" count={embersData.count}
            array={embersData.pos} itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08} map={textures.spark} color={0xFFB020}
          transparent blending={THREE.AdditiveBlending} depthWrite={false}
        />
      </points>

      <mesh position={[0, 0.01, 0]} receiveShadow>
        <cylinderGeometry args={[3.2, 3.2, 0.06, 64]} />
        <meshStandardMaterial
          color={0x3a0e28} metalness={0.45} roughness={0.5}
          emissive={0x120408} emissiveIntensity={0.4}
        />
      </mesh>

      <mesh position={[0, 0.04, 0]}>
        <torusGeometry args={[3.18, 0.04, 8, 64]} />
        <meshStandardMaterial color={0xd4a64a} metalness={0.8} roughness={0.25} />
      </mesh>
    </group>
  );
}

/* ── Rangoli ───────────────────────────────────── */
function Rangoli({ isActive }) {
  const groupRef = useRef();
  const particlesRef = useRef();

  const colors = useMemo(
    () => [0xFF4D8D, 0xFFB627, 0xFF7A1A, 0xB48CFF, 0x7DE8FF, 0xFFD76A],
    []
  );

  const particleData = useMemo(() => {
    const count = 250;
    const pos = new Float32Array(count * 3);
    const data = [];
    for (let i = 0; i < count; i++) {
      const r = 0.3 + Math.random() * 2.8;
      const a = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = 0.1 + Math.random() * 0.5;
      pos[i * 3 + 2] = Math.sin(a) * r;
      data.push({ r, a, speed: 0.1 + Math.random() * 0.25, h: pos[i * 3 + 1] });
    }
    return { pos, data, count };
  }, []);

  const sparkTex = useMemo(
    () => makeGlowTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0.4)', 64),
    []
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * (isActive ? 0.18 : 0.06);
    }
    if (particlesRef.current) {
      const d = particleData;
      for (let i = 0; i < d.count; i++) {
        d.data[i].a += d.data[i].speed * dt;
        d.pos[i * 3] = Math.cos(d.data[i].a) * d.data[i].r;
        d.pos[i * 3 + 1] = d.data[i].h + Math.sin(t * 1.5 + i) * 0.08;
        d.pos[i * 3 + 2] = Math.sin(d.data[i].a) * d.data[i].r;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const petals = useMemo(() => {
    const result = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      result.push({
        pos: [Math.cos(a) * 2.6, 0.06, Math.sin(a) * 2.6],
        rot: [0, -a, 0],
        scale: [0.7, 0.15, 2.0],
        color: colors[i % 6],
        size: 0.22,
      });
    }
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + 0.2;
      result.push({
        pos: [Math.cos(a) * 1.85, 0.07, Math.sin(a) * 1.85],
        rot: [0, -a, 0],
        scale: [0.6, 0.16, 1.7],
        color: colors[(i + 2) % 6],
        size: 0.18,
      });
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.35;
      result.push({
        pos: [Math.cos(a) * 1.15, 0.07, Math.sin(a) * 1.15],
        rot: [0, -a, 0],
        scale: [0.5, 0.18, 1.3],
        color: colors[(i + 4) % 6],
        size: 0.14,
      });
    }
    return result;
  }, [colors]);

  return (
    <group ref={groupRef}>
      {petals.map((p, i) => (
        <mesh key={i} position={p.pos} rotation={p.rot} scale={p.scale}>
          <sphereGeometry args={[p.size, 12, 10]} />
          <meshStandardMaterial
            color={p.color} emissive={p.color}
            emissiveIntensity={0.6} roughness={0.5}
          />
        </mesh>
      ))}

      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.08, 32]} />
        <meshStandardMaterial
          color={0xFFD76A} emissive={0xFFB627}
          emissiveIntensity={0.8} metalness={0.3} roughness={0.4}
        />
      </mesh>

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position" count={particleData.count}
            array={particleData.pos} itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12} map={sparkTex} color={0xFFD76A}
          transparent blending={THREE.AdditiveBlending}
          depthWrite={false} opacity={0.8}
        />
      </points>
    </group>
  );
}

/* ── Floating Sky Lanterns ─────────────────────── */
function Lanterns({ visible, flameIntensity }) {
  const groupRef = useRef();

  const haloTex = useMemo(
    () => makeGlowTexture('rgba(255,180,60,0.7)', 'rgba(255,100,20,0.15)', 128),
    []
  );

  const lanternsData = useMemo(() => {
    const data = [];
    for (let i = 0; i < 30; i++) {
      data.push({
        pos: [-16 + Math.random() * 32, -10 + Math.random() * 24, -16 + Math.random() * 12],
        speed: 0.2 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        drift: Math.random() * 0.5,
        scale: 0.6 + Math.random() * 0.5,
      });
    }
    return data;
  }, []);

  const lanternRefs = useRef([]);

  useFrame((state, dt) => {
    if (!visible) return;
    const t = state.clock.elapsedTime;
    const fi = Math.max(0.3, flameIntensity);

    lanternRefs.current.forEach((g, i) => {
      if (!g) return;
      const d = lanternsData[i];
      g.position.y += d.speed * dt * fi;
      g.position.x += Math.sin(t * 0.5 + d.phase) * 0.005 * d.drift;
      g.rotation.z = Math.sin(t * 0.3 + d.phase) * 0.05;
      g.scale.setScalar(fi * d.scale);
      if (g.position.y > 16) g.position.y = -10;
    });
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {lanternsData.map((d, i) => (
        <group
          key={i}
          ref={(el) => { lanternRefs.current[i] = el; }}
          position={d.pos}
        >
          <mesh>
            <cylinderGeometry args={[0.3, 0.22, 0.65, 8, 1, true]} />
            <meshBasicMaterial
              color={0xff9530} side={THREE.DoubleSide}
              transparent opacity={0.88}
            />
          </mesh>
          <sprite>
            <spriteMaterial
              map={haloTex} blending={THREE.AdditiveBlending}
              depthWrite={false} transparent
            />
          </sprite>
        </group>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════
   CINEMATIC FIRST ROCKET & PARTICLE-TO-TEXT MORPHING
   Single 3D Rocket Launch → Apex Detonation →
   Particles Rearrange & Assemble into Recipient's Name
   ═══════════════════════════════════════════════════ */
function CinematicFirstRocketAndMorph({ recipient, cinematicStage, onSequenceEvent }) {
  const rocketGroupRef = useRef();
  const trailPointsRef = useRef();
  const rocketLightRef = useRef();
  const burstLightRef = useRef();
  const morphPointsRef = useRef();

  const sparkTex = useMemo(
    () => makeGlowTexture('rgba(255,255,255,1)', 'rgba(255,215,106,0.6)', 64),
    []
  );

  // Sample target 3D text coordinates for dynamic name
  const textTargets = useMemo(() => {
    return sampleTextCoordinates(recipient || 'DIWALI', 2200);
  }, [recipient]);

  // Rocket ascent physics
  const rocketState = useRef({
    startY: -7.6,
    targetY: 3.2,
    targetZ: -6.0,
    age: 0,
    duration: 1.85,
    exploded: false,
    nameFormedEmitted: false,
    grandShowEmitted: false,
    trailPositions: new Float32Array(36 * 3),
    trailColors: new Float32Array(36 * 3),
  });

  // Initialize rocket trail colors once
  useMemo(() => {
    const c1 = new THREE.Color(0xFFFFFF);
    const c2 = new THREE.Color(0xFF7A18);
    const col = rocketState.current.trailColors;
    for (let i = 0; i < 36; i++) {
      const frac = i / 36;
      const c = new THREE.Color().lerpColors(c1, c2, frac);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
  }, []);

  // Morph particles data (2200 points)
  const morphState = useMemo(() => {
    const count = 2200;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const delays = new Float32Array(count);

    const cWhite = new THREE.Color(0xFFFFFF);
    const cGold = new THREE.Color(0xFFD700);
    const cAmber = new THREE.Color(0xFF9020);

    for (let i = 0; i < count; i++) {
      // Start at explosion center (0, 3.2, -6.0)
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 3.2;
      pos[i * 3 + 2] = -6.0;

      // Radial spherical initial burst velocity
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const speed = 5.8 + Math.random() * 7.5;

      vel[i * 3] = Math.cos(theta) * Math.sin(phi) * speed;
      vel[i * 3 + 1] = Math.cos(phi) * speed;
      vel[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * speed;

      // Golden color palette
      const rnd = Math.random();
      const c = rnd > 0.65 ? cWhite : (rnd > 0.25 ? cGold : cAmber);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      // Progressively delay convergence left-to-right across letters
      const target = textTargets[i];
      const tx = target ? target.x : 0;
      delays[i] = 0.55 + Math.max(0, Math.min(1.2, ((tx + 5.5) / 11) * 1.05));
    }

    return { pos, vel, col, delays, count, age: 0 };
  }, [textTargets]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const rs = rocketState.current;

    // ── 1. Rocket Launch Ascent ──
    if (cinematicStage === 'ROCKET_LAUNCH') {
      rs.age += dt;
      const progress = Math.min(1.0, rs.age / rs.duration);
      const ease = 1 - Math.pow(1 - progress, 2.2);
      const currY = THREE.MathUtils.lerp(rs.startY, rs.targetY, ease);

      if (rocketGroupRef.current) {
        rocketGroupRef.current.position.set(0, currY, rs.targetZ);
      }
      if (rocketLightRef.current) {
        rocketLightRef.current.position.set(0, currY, rs.targetZ);
      }

      // Shift trail points backwards
      const p = rs.trailPositions;
      for (let i = 35; i > 0; i--) {
        p[i * 3] = p[(i - 1) * 3] + (Math.random() - 0.5) * 0.03;
        p[i * 3 + 1] = p[(i - 1) * 3 + 1] - 0.08;
        p[i * 3 + 2] = p[(i - 1) * 3 + 2];
      }
      p[0] = 0;
      p[1] = currY;
      p[2] = rs.targetZ;

      if (trailPointsRef.current) {
        trailPointsRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Detonate at apex!
      if (progress >= 1.0 && !rs.exploded) {
        rs.exploded = true;
        onSequenceEvent?.('EXPLODE');
      }
    }

    // ── 2. Apex Detonation & Particle-to-Text Morphing ──
    const isExplodedStage =
      cinematicStage === 'FIREWORK_EXPLOSION' ||
      cinematicStage === 'PARTICLE_NAME_REVEAL' ||
      cinematicStage === 'NAME_AND_WISH_REVEAL' ||
      cinematicStage === 'GRAND_FIREWORKS' ||
      cinematicStage === 'INTERACTIVE_CELEBRATION';

    if (isExplodedStage) {
      morphState.age += dt;
      const age = morphState.age;

      // Detonation flash light
      if (burstLightRef.current) {
        burstLightRef.current.intensity = Math.max(0, 9.0 * (1 - age / 0.45));
      }

      const p = morphState.pos;
      const v = morphState.vel;
      const delays = morphState.delays;
      const count = morphState.count;

      for (let i = 0; i < count; i++) {
        const d = delays[i];
        if (age < d) {
          // Free radial explosion expansion with gravity & drag
          v[i * 3 + 1] -= 2.0 * dt;
          v[i * 3] *= 1 - 0.42 * dt;
          v[i * 3 + 1] *= 1 - 0.42 * dt;
          v[i * 3 + 2] *= 1 - 0.42 * dt;

          p[i * 3] += v[i * 3] * dt;
          p[i * 3 + 1] += v[i * 3 + 1] * dt;
          p[i * 3 + 2] += v[i * 3 + 2] * dt;
        } else {
          // Magnetic attraction steering towards assigned letter coordinate
          const target = textTargets[i] || { x: 0, y: 3.2, z: -6.0 };
          const dx = target.x - p[i * 3];
          const dy = target.y - p[i * 3 + 1];
          const dz = target.z - p[i * 3 + 2];

          v[i * 3] += dx * 6.8 * dt;
          v[i * 3 + 1] += dy * 6.8 * dt;
          v[i * 3 + 2] += dz * 6.8 * dt;

          // Strong damping so particles lock crisply onto the letters
          const damping = Math.pow(0.86, dt * 60);
          v[i * 3] *= damping;
          v[i * 3 + 1] *= damping;
          v[i * 3 + 2] *= damping;

          p[i * 3] += v[i * 3] * dt;
          p[i * 3 + 1] += v[i * 3 + 1] * dt;
          p[i * 3 + 2] += v[i * 3 + 2] * dt;

          // Gentle starry shimmer once formed
          if (age > d + 1.2) {
            p[i * 3 + 1] = target.y + Math.sin(t * 3.2 + i * 0.1) * 0.016;
          }
        }
      }

      if (morphPointsRef.current) {
        morphPointsRef.current.geometry.attributes.position.needsUpdate = true;
        // Keep particles glowing with golden brilliance
        const lateOpacity = age > 14.0 ? Math.max(0.45, 1.0 - (age - 14.0) * 0.08) : 0.95;
        morphPointsRef.current.material.opacity = lateOpacity;
      }

      // Milestones
      if (age >= 3.6 && !rs.nameFormedEmitted) {
        rs.nameFormedEmitted = true;
        onSequenceEvent?.('NAME_FORMED');
      }
      if (age >= 6.8 && !rs.grandShowEmitted) {
        rs.grandShowEmitted = true;
        onSequenceEvent?.('START_GRAND_SHOW');
      }
    }
  });

  return (
    <>
      {/* ── 1. The Single Ascending Rocket ── */}
      {cinematicStage === 'ROCKET_LAUNCH' && (
        <>
          <group ref={rocketGroupRef} position={[0, -7.6, -6.0]}>
            {/* White-hot rocket head sprite */}
            <sprite scale={[0.42, 0.42, 1]}>
              <spriteMaterial map={sparkTex} color="#FFFFFF" blending={THREE.AdditiveBlending} />
            </sprite>
          </group>

          {/* Rocket Ascent Glow Light */}
          <pointLight ref={rocketLightRef} position={[0, -7.6, -6.0]} color="#FFD76A" intensity={3.5} distance={16} />

          {/* Rocket Fiery Trail */}
          <points ref={trailPointsRef}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" count={36} array={rocketState.current.trailPositions} itemSize={3} />
              <bufferAttribute attach="attributes-color" count={36} array={rocketState.current.trailColors} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.38} map={sparkTex} vertexColors transparent blending={THREE.AdditiveBlending} depthWrite={false} />
          </points>
        </>
      )}

      {/* ── 2. Apex Detonation Flash Light ── */}
      <pointLight ref={burstLightRef} position={[0, 3.2, -6.0]} color="#FFF4DD" intensity={0} distance={55} decay={1.8} />

      {/* ── 3. The 2200 Morphing Text Particles ── */}
      {(cinematicStage === 'FIREWORK_EXPLOSION' ||
        cinematicStage === 'PARTICLE_NAME_REVEAL' ||
        cinematicStage === 'NAME_AND_WISH_REVEAL' ||
        cinematicStage === 'GRAND_FIREWORKS' ||
        cinematicStage === 'INTERACTIVE_CELEBRATION') && (
        <points ref={morphPointsRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={morphState.count} array={morphState.pos} itemSize={3} />
            <bufferAttribute attach="attributes-color" count={morphState.count} array={morphState.col} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial
            size={0.42}
            map={sparkTex}
            vertexColors
            transparent
            opacity={0.95}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════
   PHOTOREALISTIC FIREWORKS ENGINE (Multi-Bursts)
   Grand Fireworks Show + Interactive Sky Clicking
   ═══════════════════════════════════════════════════ */
function FireworksSystem({ bursts }) {
  const { scene } = useThree();
  const activeRocketsRef = useRef([]);
  const activeExplosionsRef = useRef([]);

  const sparkTex = useMemo(
    () => makeGlowTexture('rgba(255,255,255,1)', 'rgba(255,215,106,0.6)', 64),
    []
  );

  const PALETTE = useMemo(
    () => [
      0xFFD700, // Imperial Pure Gold
      0xFF5E13, // Saffron Ember
      0xFF1744, // Royal Crimson Ruby
      0x00F0FF, // Electric Cyan Sky
      0x00FF87, // Emerald Green
      0xC743FF, // Imperial Amethyst Violet
      0xFF2A85, // Vibrant Magenta
      0xFFEA00, // Brilliant Solar Yellow
      0x70EEFF, // Diamond Aqua
      0xFFFFFF, // Titanium Silver White
    ],
    []
  );

  const makePS = useCallback((pArr, vArr, cArr, sz) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
    if (cArr) {
      geo.setAttribute('color', new THREE.BufferAttribute(cArr, 3));
    }
    const mat = new THREE.PointsMaterial({
      size: sz,
      map: sparkTex,
      vertexColors: !!cArr,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);
    return { pts, geo, mat, pos: pArr, vel: vArr, col: cArr, n: pArr.length / 3 };
  }, [scene, sparkTex]);

  const createExplosion = useCallback((x, y, z, color, count = 320, type = 'chrysanthemum') => {
    const hex = color || PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const secHex = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const c1 = new THREE.Color(hex);
    const c2 = new THREE.Color(secHex);

    // Tier 1: Main Spherical Shell
    const n = Math.max(260, count);
    const pos = new Float32Array(n * 3);
    const vel = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);

    for (let k = 0; k < n; k++) {
      const phi = Math.acos(1 - (2 * (k + 0.5)) / n);
      const theta = Math.PI * (1 + Math.sqrt(5)) * k;
      const sp = (7.5 + Math.random() * 6.5) * (type === 'willow' ? 0.82 : 1.1);

      if (type === 'ring') {
        const ringAngle = (k / n) * Math.PI * 2;
        vel[k * 3] = Math.cos(ringAngle) * sp * 0.95;
        vel[k * 3 + 1] = (Math.random() - 0.2) * sp * 0.25;
        vel[k * 3 + 2] = Math.sin(ringAngle) * sp * 0.95;
      } else {
        vel[k * 3] = Math.cos(theta) * Math.sin(phi) * sp;
        vel[k * 3 + 1] = Math.cos(phi) * sp;
        vel[k * 3 + 2] = Math.sin(theta) * Math.sin(phi) * sp;
      }

      pos[k * 3] = x;
      pos[k * 3 + 1] = y;
      pos[k * 3 + 2] = z;

      const mix = k / n;
      const mc = new THREE.Color().lerpColors(c1, c2, mix);
      col[k * 3] = mc.r;
      col[k * 3 + 1] = mc.g;
      col[k * 3 + 2] = mc.b;
    }

    // Tier 2: High-Velocity White Core
    const coreCount = 70;
    const corePos = new Float32Array(coreCount * 3);
    const coreVel = new Float32Array(coreCount * 3);
    const coreCol = new Float32Array(coreCount * 3);
    const whiteC = new THREE.Color(0xFFFFFF);

    for (let k = 0; k < coreCount; k++) {
      const phi = Math.acos(1 - (2 * (k + 0.5)) / coreCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * k;
      const csp = 8.5 + Math.random() * 7.5;

      coreVel[k * 3] = Math.cos(theta) * Math.sin(phi) * csp;
      coreVel[k * 3 + 1] = Math.cos(phi) * csp;
      coreVel[k * 3 + 2] = Math.sin(theta) * Math.sin(phi) * csp;

      corePos[k * 3] = x;
      corePos[k * 3 + 1] = y;
      corePos[k * 3 + 2] = z;

      coreCol[k * 3] = whiteC.r;
      coreCol[k * 3 + 1] = whiteC.g;
      coreCol[k * 3 + 2] = whiteC.b;
    }

    // Tier 3: Secondary Weeping Streamers
    const willowCount = type === 'willow' ? 140 : 60;
    const wPos = new Float32Array(willowCount * 3);
    const wVel = new Float32Array(willowCount * 3);
    const wCol = new Float32Array(willowCount * 3);
    const goldC = new THREE.Color(0xFFD76A);

    for (let k = 0; k < willowCount; k++) {
      const a = (k / willowCount) * Math.PI * 2;
      const r = 0.6 + Math.random() * 2.0;
      wPos[k * 3] = x;
      wPos[k * 3 + 1] = y;
      wPos[k * 3 + 2] = z;
      wVel[k * 3] = Math.cos(a) * r * (2.2 + Math.random() * 2.5);
      wVel[k * 3 + 1] = (Math.random() - 0.2) * r * 2.8;
      wVel[k * 3 + 2] = Math.sin(a) * r * (2.2 + Math.random() * 2.5);
      wCol[k * 3] = goldC.r;
      wCol[k * 3 + 1] = goldC.g;
      wCol[k * 3 + 2] = goldC.b;
    }

    const main = makePS(pos, vel, col, type === 'willow' ? 0.48 : 0.42);
    const core = makePS(corePos, coreVel, coreCol, 0.55);
    const willow = makePS(wPos, wVel, wCol, 0.35);
    const burstLife = type === 'willow' ? 4.5 : 3.2;

    const flashLight = new THREE.PointLight(hex, 6.0, 50, 1.8);
    flashLight.position.set(x, y, z);
    scene.add(flashLight);

    activeExplosionsRef.current.push({
      main,
      core,
      willow,
      light: flashLight,
      age: 0,
      life: burstLife,
      type,
    });
  }, [PALETTE, makePS, scene]);

  const launchRocket = useCallback((burst) => {
    const { x, y, z, color, count = 320, type = 'chrysanthemum' } = burst;

    const startX = x * 0.35 + (Math.random() - 0.5) * 2.0;
    const startY = -7.5;
    const startZ = z;

    const trailCount = 32;
    const trailPositions = new Float32Array(trailCount * 3);
    const trailColors = new Float32Array(trailCount * 3);
    const rHeadColor = new THREE.Color(0xFFFFFF);
    const rTailColor = new THREE.Color(0xFF7A18);

    for (let i = 0; i < trailCount; i++) {
      trailPositions[i * 3] = startX;
      trailPositions[i * 3 + 1] = startY;
      trailPositions[i * 3 + 2] = startZ;
      const frac = i / trailCount;
      const c = new THREE.Color().lerpColors(rHeadColor, rTailColor, frac);
      trailColors[i * 3] = c.r;
      trailColors[i * 3 + 1] = c.g;
      trailColors[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.38,
      map: sparkTex,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    const rocketLight = new THREE.PointLight(0xFFB020, 2.8, 15, 2);
    rocketLight.position.set(startX, startY, startZ);
    scene.add(rocketLight);

    activeRocketsRef.current.push({
      pts,
      geo,
      mat,
      rocketLight,
      startX,
      startY,
      startZ,
      targetX: x,
      targetY: y,
      targetZ: z,
      positions: trailPositions,
      age: 0,
      duration: 0.38,
      color,
      count,
      type,
    });
  }, [scene, sparkTex]);

  useEffect(() => {
    if (!bursts || bursts.length === 0) return;
    bursts.forEach((b) => {
      if (!b || b._processed) return;
      b._processed = true;
      launchRocket(b);
    });
  }, [bursts, launchRocket]);

  useFrame((_, dt) => {
    for (let r = activeRocketsRef.current.length - 1; r >= 0; r--) {
      const R = activeRocketsRef.current[r];
      R.age += dt;
      const progress = Math.min(1.0, R.age / R.duration);

      const ease = 1 - Math.pow(1 - progress, 2.0);
      const currX = THREE.MathUtils.lerp(R.startX, R.targetX, ease);
      const currY = THREE.MathUtils.lerp(R.startY, R.targetY, ease);
      const currZ = THREE.MathUtils.lerp(R.startZ, R.targetZ, ease);

      if (R.rocketLight) {
        R.rocketLight.position.set(currX, currY, currZ);
      }

      for (let i = 31; i > 0; i--) {
        R.positions[i * 3] = R.positions[(i - 1) * 3] + (Math.random() - 0.5) * 0.03;
        R.positions[i * 3 + 1] = R.positions[(i - 1) * 3 + 1] - 0.08;
        R.positions[i * 3 + 2] = R.positions[(i - 1) * 3 + 2];
      }
      R.positions[0] = currX;
      R.positions[1] = currY;
      R.positions[2] = currZ;
      R.geo.attributes.position.needsUpdate = true;

      if (progress >= 1.0) {
        if (R.rocketLight) {
          scene.remove(R.rocketLight);
          R.rocketLight.dispose?.();
        }
        scene.remove(R.pts);
        R.geo.dispose();
        R.mat.dispose();
        activeRocketsRef.current.splice(r, 1);

        createExplosion(R.targetX, R.targetY, R.targetZ, R.color, R.count, R.type);
      }
    }

    for (let b = activeExplosionsRef.current.length - 1; b >= 0; b--) {
      const B = activeExplosionsRef.current[b];
      B.age += dt;
      const frac = B.age / B.life;
      const gravityMult = B.type === 'willow' ? 4.2 : 2.6;
      const dragMult = B.type === 'willow' ? 0.35 : 0.48;

      if (B.light) {
        B.light.intensity = Math.max(0, 6.0 * (1 - B.age / 0.35));
        if (B.age > 0.35) {
          scene.remove(B.light);
          B.light.dispose?.();
          B.light = null;
        }
      }

      if (B.core) {
        const cFrac = Math.min(1, B.age / 0.55);
        for (let k = 0; k < B.core.n; k++) {
          B.core.vel[k * 3] *= 1 - 0.7 * dt;
          B.core.vel[k * 3 + 1] *= 1 - 0.7 * dt;
          B.core.vel[k * 3 + 2] *= 1 - 0.7 * dt;
          B.core.pos[k * 3] += B.core.vel[k * 3] * dt;
          B.core.pos[k * 3 + 1] += B.core.vel[k * 3 + 1] * dt;
          B.core.pos[k * 3 + 2] += B.core.vel[k * 3 + 2] * dt;
        }
        B.core.geo.attributes.position.needsUpdate = true;
        B.core.mat.opacity = Math.max(0, 1 - cFrac * cFrac);
      }

      const twinkle = 0.88 + Math.sin(B.age * 22) * 0.12;
      [B.main, B.willow].forEach((ps) => {
        if (!ps) return;
        for (let k = 0; k < ps.n; k++) {
          ps.vel[k * 3 + 1] -= gravityMult * dt;
          ps.vel[k * 3] *= 1 - dragMult * dt;
          ps.vel[k * 3 + 1] *= 1 - dragMult * dt;
          ps.vel[k * 3 + 2] *= 1 - dragMult * dt;

          ps.pos[k * 3] += ps.vel[k * 3] * dt;
          ps.pos[k * 3 + 1] += ps.vel[k * 3 + 1] * dt;
          ps.pos[k * 3 + 2] += ps.vel[k * 3 + 2] * dt;
        }
        ps.geo.attributes.position.needsUpdate = true;
        ps.mat.opacity = Math.max(0, (1 - frac * frac) * twinkle);
      });

      if (B.age > B.life) {
        if (B.light) {
          scene.remove(B.light);
          B.light.dispose?.();
          B.light = null;
        }
        [B.main, B.core, B.willow].forEach((ps) => {
          if (ps) {
            scene.remove(ps.pts);
            ps.geo.dispose();
            ps.mat.dispose();
          }
        });
        activeExplosionsRef.current.splice(b, 1);
      }
    }
  });

  return null;
}

/* ── Cinematic Camera Controller ───────────────── */
function CameraController({ cinematicStage }) {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    let targetY = 2.4;
    let targetZ = 8.5;

    if (cinematicStage === 'ROCKET_LAUNCH') {
      targetY = 2.8;
      targetZ = 8.2;
    } else if (
      cinematicStage === 'FIREWORK_EXPLOSION' ||
      cinematicStage === 'PARTICLE_NAME_REVEAL' ||
      cinematicStage === 'NAME_AND_WISH_REVEAL'
    ) {
      targetY = 3.2;
      targetZ = 7.8;
    } else if (
      cinematicStage === 'GRAND_FIREWORKS' ||
      cinematicStage === 'INTERACTIVE_CELEBRATION'
    ) {
      targetY = 2.6;
      targetZ = 8.6;
    }

    const camX = Math.sin(t * 0.1) * 0.6 + mx * 0.5;
    const camY = targetY + Math.sin(t * 0.25) * 0.12 - my * 0.25;
    const camZ = targetZ;

    camera.position.x += (camX - camera.position.x) * dt * 1.6;
    camera.position.y += (camY - camera.position.y) * dt * 1.6;
    camera.position.z += (camZ - camera.position.z) * dt * 1.6;
    camera.lookAt(0, targetY > 3.0 ? 2.8 : 0.4, 0);
  });

  return null;
}

/* ── Cinematic Effects (Bloom & Vignette) ──────── */
function CinematicEffects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={1.8}
        luminanceThreshold={0.12}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.25} darkness={0.7} />
    </EffectComposer>
  );
}

/* ── Main 3D Canvas Scene ─────────────────────── */
export default function ThreeScene({
  recipient,
  cinematicStage,
  onSequenceEvent,
  flameIntensity,
  fireworkBursts,
}) {
  const reducedMotion = useMemo(() => {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  }, []);

  const dpr = useMemo(() => Math.min(window.devicePixelRatio || 1, 1.5), []);

  return (
    <Canvas
      dpr={dpr}
      camera={{ fov: 48, near: 0.1, far: 250, position: [0, 2.4, 8.5] }}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      shadows
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 1);
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
    >
      <fog attach="fog" args={[0x000000, 0, 70]} />

      <ambientLight intensity={0.8} color={0x3a2a66} />
      <directionalLight
        position={[4, 8, 6]}
        intensity={0.4}
        color={0xffc88a}
        castShadow
        shadow-mapSize={[512, 512]}
      />

      {/* Dynamic Camera controller */}
      <CameraController cinematicStage={cinematicStage} />

      {/* Starry Night Sky */}
      <Stars />

      {/* 3D Sacred Brass Diya */}
      <Diya flameIntensity={flameIntensity} />

      {/* Sacred Rangoli */}
      <Rangoli isActive={cinematicStage === 'ATMOSPHERE'} />

      {/* Floating Sky Lanterns */}
      <Lanterns visible={flameIntensity > 0} flameIntensity={flameIntensity} />

      {/* The Masterpiece: Rocket Launch & Particle-To-Text Morphing Engine */}
      <CinematicFirstRocketAndMorph
        recipient={recipient}
        cinematicStage={cinematicStage}
        onSequenceEvent={onSequenceEvent}
      />

      {/* Grand Fireworks Show & Interactive Sky Fireworks */}
      <FireworksSystem bursts={fireworkBursts} />

      {/* Post-processing Bloom & Glow */}
      {!reducedMotion && <CinematicEffects />}
    </Canvas>
  );
}
