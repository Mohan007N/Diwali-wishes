/* ═══════════════════════════════════════════════
   DIWALI — The Festival of Lights 2026
   3D Canvas Scene — React Three Fiber
   Photorealistic Fireworks & Night Sky Engine
   ═══════════════════════════════════════════════ */
import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

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

    // Flame flicker
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

    // Embers
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
      {/* Bowl */}
      <mesh geometry={bowlProfile} position={[0, 0.12, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          color={0xc8681e} metalness={0.7} roughness={0.28}
          side={THREE.DoubleSide} emissive={0x3a0d00} emissiveIntensity={0.5}
        />
      </mesh>

      {/* Decorative rim */}
      <mesh geometry={rimProfile} position={[0, 0.12, 0]}>
        <meshStandardMaterial
          color={0xd4a64a} metalness={0.8} roughness={0.2}
          emissive={0x6b4f1a} emissiveIntensity={0.3}
        />
      </mesh>

      {/* Oil surface */}
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.05, 32]} />
        <meshStandardMaterial
          color={0xffe898} metalness={0.2} roughness={0.7}
          transparent opacity={0.7}
        />
      </mesh>

      {/* Wick */}
      <mesh position={[0, 0.56, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.28, 8]} />
        <meshStandardMaterial color={0x1e0e08} roughness={1} />
      </mesh>

      {/* Flame sprite */}
      <sprite ref={flameRef} position={[0, 1.16, 0]} scale={[0, 0, 1]}>
        <spriteMaterial
          map={textures.flame} blending={THREE.AdditiveBlending}
          depthWrite={false} transparent
        />
      </sprite>

      {/* Halo glow */}
      <sprite ref={haloRef} position={[0, 1.1, 0]} scale={[0, 0, 1]}>
        <spriteMaterial
          map={textures.halo} blending={THREE.AdditiveBlending}
          depthWrite={false} transparent
        />
      </sprite>

      {/* Flame point light */}
      <pointLight ref={lightRef} position={[0, 1.2, 0]} color={0xffa040} intensity={0} distance={20} decay={1.8} />

      {/* Embers */}
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

      {/* Base plate */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <cylinderGeometry args={[3.2, 3.2, 0.06, 64]} />
        <meshStandardMaterial
          color={0x3a0e28} metalness={0.45} roughness={0.5}
          emissive={0x120408} emissiveIntensity={0.4}
        />
      </mesh>

      {/* Plate ornamental rim */}
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
    // Particle orbit
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
    // Outer ring - 24 petals
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
    // Middle ring - 16 petals
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
    // Inner ring - 12 petals
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

      {/* Center lotus */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.08, 32]} />
        <meshStandardMaterial
          color={0xFFD76A} emissive={0xFFB627}
          emissiveIntensity={0.8} metalness={0.3} roughness={0.4}
        />
      </mesh>

      {/* Floating particles */}
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
   PHOTOREALISTIC FIREWORKS ENGINE (Dual-Stage)
   1. Real Rising Rocket Launch with Long Fiery Spark Tail
   2. Detonation Starburst with Core Flash, Radial Stars,
      Weeping Kamuro Willow Trails & Realistic Lighting
   ═══════════════════════════════════════════════════ */
function FireworksSystem({ bursts }) {
  const { scene } = useThree();
  const activeRocketsRef = useRef([]);
  const activeExplosionsRef = useRef([]);

  const sparkTex = useMemo(
    () => makeGlowTexture('rgba(255,255,255,1)', 'rgba(255,215,106,0.5)', 64),
    []
  );

  // Metal salt festive color palettes
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

  // Helper to create Points particle system
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

  // Create real expanding explosion when rocket detonates at target
  const createExplosion = useCallback((x, y, z, color, count = 320, type = 'chrysanthemum') => {
    const hex = color || PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const secHex = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const c1 = new THREE.Color(hex);
    const c2 = new THREE.Color(secHex);

    // ── Tier 1: Main Spherical Starburst Shell ──
    const n = Math.max(260, count);
    const pos = new Float32Array(n * 3);
    const vel = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);

    for (let k = 0; k < n; k++) {
      const phi = Math.acos(1 - (2 * (k + 0.5)) / n);
      const theta = Math.PI * (1 + Math.sqrt(5)) * k;
      const sp = (6.2 + Math.random() * 5.8) * (type === 'willow' ? 0.78 : 1.05);

      if (type === 'ring') {
        const ringAngle = (k / n) * Math.PI * 2;
        vel[k * 3] = Math.cos(ringAngle) * sp * 0.9;
        vel[k * 3 + 1] = (Math.random() - 0.2) * sp * 0.2;
        vel[k * 3 + 2] = Math.sin(ringAngle) * sp * 0.9;
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

    // ── Tier 2: High-Velocity White-Hot Core Flash ──
    const coreCount = 60;
    const corePos = new Float32Array(coreCount * 3);
    const coreVel = new Float32Array(coreCount * 3);
    const coreCol = new Float32Array(coreCount * 3);
    const whiteC = new THREE.Color(0xFFFFFF);

    for (let k = 0; k < coreCount; k++) {
      const phi = Math.acos(1 - (2 * (k + 0.5)) / coreCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * k;
      const csp = 7.5 + Math.random() * 6.5;

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

    // ── Tier 3: Secondary Weeping Willow Streamers ──
    const willowCount = type === 'willow' ? 120 : 50;
    const wPos = new Float32Array(willowCount * 3);
    const wVel = new Float32Array(willowCount * 3);
    const wCol = new Float32Array(willowCount * 3);
    const goldC = new THREE.Color(0xFFD76A);

    for (let k = 0; k < willowCount; k++) {
      const a = (k / willowCount) * Math.PI * 2;
      const r = 0.5 + Math.random() * 1.8;
      wPos[k * 3] = x;
      wPos[k * 3 + 1] = y;
      wPos[k * 3 + 2] = z;
      wVel[k * 3] = Math.cos(a) * r * (1.8 + Math.random() * 2.2);
      wVel[k * 3 + 1] = (Math.random() - 0.25) * r * 2.5;
      wVel[k * 3 + 2] = Math.sin(a) * r * (1.8 + Math.random() * 2.2);
      wCol[k * 3] = goldC.r;
      wCol[k * 3 + 1] = goldC.g;
      wCol[k * 3 + 2] = goldC.b;
    }

    const main = makePS(pos, vel, col, type === 'willow' ? 0.32 : 0.28);
    const core = makePS(corePos, coreVel, coreCol, 0.38);
    const willow = makePS(wPos, wVel, wCol, 0.22);
    const burstLife = type === 'willow' ? 4.2 : 3.0;

    // Instantaneous High-Intensity Flash Light
    const flashLight = new THREE.PointLight(hex, 5.5, 45, 1.8);
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

  // Handle incoming burst requests: Launch Rocket with Ascent Trail
  useEffect(() => {
    if (!bursts || bursts.length === 0) return;
    const latest = bursts[bursts.length - 1];
    if (!latest || latest._processed) return;
    latest._processed = true;

    const { x, y, z, color, count = 320, type = 'chrysanthemum' } = latest;

    // Rocket launch origin at the bottom ground horizon
    const startX = x * 0.4 + (Math.random() - 0.5) * 1.8;
    const startY = -7.5;
    const startZ = z;

    // Rocket trail: 32 trailing spark particles for long glowing plume
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
      size: 0.28,
      map: sparkTex,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    // Launch ground spark flash
    const launchFlash = new THREE.PointLight(0xFFB020, 2.5, 18, 2);
    launchFlash.position.set(startX, startY, startZ);
    scene.add(launchFlash);

    activeRocketsRef.current.push({
      pts,
      geo,
      mat,
      launchFlash,
      startX,
      startY,
      startZ,
      targetX: x,
      targetY: y,
      targetZ: z,
      positions: trailPositions,
      age: 0,
      duration: 0.35, // Fast powerful launch ascent
      color,
      count,
      type,
    });
  }, [bursts, scene, sparkTex]);

  // Frame Loop: Update Physics for Rockets and Expanding Shells
  useFrame((_, dt) => {
    // 1. Update Rockets Shooting Up into the Sky
    for (let r = activeRocketsRef.current.length - 1; r >= 0; r--) {
      const R = activeRocketsRef.current[r];
      R.age += dt;
      const progress = Math.min(1.0, R.age / R.duration);

      // Fade launch flash quickly
      if (R.launchFlash) {
        R.launchFlash.intensity = Math.max(0, 2.5 * (1 - R.age / 0.18));
        if (R.age > 0.18) {
          scene.remove(R.launchFlash);
          R.launchFlash.dispose?.();
          R.launchFlash = null;
        }
      }

      // Natural decelerating curve near zenith
      const ease = 1 - Math.pow(1 - progress, 2.2);
      const currX = THREE.MathUtils.lerp(R.startX, R.targetX, ease);
      const currY = THREE.MathUtils.lerp(R.startY, R.targetY, ease);
      const currZ = THREE.MathUtils.lerp(R.startZ, R.targetZ, ease);

      // Shift trail positions backwards with slight air dispersion
      for (let i = 31; i > 0; i--) {
        R.positions[i * 3] = R.positions[(i - 1) * 3] + (Math.random() - 0.5) * 0.02;
        R.positions[i * 3 + 1] = R.positions[(i - 1) * 3 + 1] - 0.07;
        R.positions[i * 3 + 2] = R.positions[(i - 1) * 3 + 2];
      }
      R.positions[0] = currX;
      R.positions[1] = currY;
      R.positions[2] = currZ;
      R.geo.attributes.position.needsUpdate = true;

      // When rocket reaches target zenith -> DETONATE INTO SPARKS!
      if (progress >= 1.0) {
        if (R.launchFlash) {
          scene.remove(R.launchFlash);
          R.launchFlash.dispose?.();
        }
        scene.remove(R.pts);
        R.geo.dispose();
        R.mat.dispose();
        activeRocketsRef.current.splice(r, 1);

        createExplosion(R.targetX, R.targetY, R.targetZ, R.color, R.count, R.type);
      }
    }

    // 2. Update Expanding Explosions & Spark Physics
    for (let b = activeExplosionsRef.current.length - 1; b >= 0; b--) {
      const B = activeExplosionsRef.current[b];
      B.age += dt;
      const frac = B.age / B.life;
      const gravityMult = B.type === 'willow' ? 3.9 : 2.4;
      const dragMult = B.type === 'willow' ? 0.36 : 0.50;

      // Update instantaneous flash light
      if (B.light) {
        B.light.intensity = Math.max(0, 5.5 * (1 - B.age / 0.32));
        if (B.age > 0.32) {
          scene.remove(B.light);
          B.light.dispose?.();
          B.light = null;
        }
      }

      // Update Core Spark Flash (fades fast in 0.5s)
      if (B.core) {
        const cFrac = Math.min(1, B.age / 0.55);
        for (let k = 0; k < B.core.n; k++) {
          B.core.vel[k * 3] *= 1 - 0.65 * dt;
          B.core.vel[k * 3 + 1] *= 1 - 0.65 * dt;
          B.core.vel[k * 3 + 2] *= 1 - 0.65 * dt;
          B.core.pos[k * 3] += B.core.vel[k * 3] * dt;
          B.core.pos[k * 3 + 1] += B.core.vel[k * 3 + 1] * dt;
          B.core.pos[k * 3 + 2] += B.core.vel[k * 3 + 2] * dt;
        }
        B.core.geo.attributes.position.needsUpdate = true;
        B.core.mat.opacity = Math.max(0, 1 - cFrac * cFrac);
      }

      // Update Main Starburst and Willow Particles
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

        // Twinkle/flicker modulation as stars fade
        const twinkle = 0.85 + Math.sin(B.age * 25 + k * 1.5) * 0.15;
        ps.mat.opacity = Math.max(0, (1 - frac * frac) * twinkle);
      });

      // Cleanup expired explosion
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
function CameraController({ currentScene }) {
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

  const targets = useMemo(() => [
    { x: 0, y: 2.4, z: 8.5 },
    { x: 0, y: 2.0, z: 7.0 },
    { x: 0, y: 3.5, z: 7.5 },
    { x: 0, y: 2.5, z: 8.0 },
    { x: 0, y: 2.0, z: 8.5 },
    { x: 0, y: 2.5, z: 8.5 },
  ], []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const target = targets[currentScene] || targets[0];
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    const camX = Math.sin(t * 0.1) * 0.8 + mx * 0.6;
    const camY = target.y + Math.sin(t * 0.28) * 0.15 - my * 0.3;
    const camZ = target.z;

    camera.position.x += (camX - camera.position.x) * dt * 1.8;
    camera.position.y += (camY - camera.position.y) * dt * 1.8;
    camera.position.z += (camZ - camera.position.z) * dt * 1.8;
    camera.lookAt(0, 0.2, 0);
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
  currentScene,
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

      {/* Ambient lighting */}
      <ambientLight intensity={0.8} color={0x3a2a66} />
      <directionalLight
        position={[4, 8, 6]}
        intensity={0.4}
        color={0xffc88a}
        castShadow
        shadow-mapSize={[512, 512]}
      />

      {/* Camera controller */}
      <CameraController currentScene={currentScene} />

      {/* Starry Night Sky */}
      <Stars />

      {/* 3D Sacred Brass Diya */}
      <Diya flameIntensity={flameIntensity} />

      {/* Sacred Rangoli */}
      <Rangoli isActive={currentScene === 2} />

      {/* Floating Sky Lanterns */}
      <Lanterns visible={currentScene >= 1 && flameIntensity > 0} flameIntensity={flameIntensity} />

      {/* Photorealistic Skycracker & Fireworks Engine */}
      <FireworksSystem bursts={fireworkBursts} />

      {/* Post-processing Bloom & Glow */}
      {!reducedMotion && <CinematicEffects />}
    </Canvas>
  );
}
