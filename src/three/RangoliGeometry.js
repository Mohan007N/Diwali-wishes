import * as THREE from 'three';
import gsap from 'gsap';
import DiyaModel from './DiyaModel.js';

const RANGOLI_COLORS = [0xFF4D8D, 0xFFB627, 0xFF7A1A, 0xB48CFF, 0x7DE8FF, 0xFFD76A];
const GOLDEN_DOT_COUNT = 80;

function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,230,140,1)');
  gradient.addColorStop(0.5, 'rgba(255,190,60,0.4)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createPetal(radius, scaleX, scaleY, scaleZ) {
  const geo = new THREE.SphereGeometry(radius, 8, 6);
  // Squash into teardrop-like shape
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const x = pos.getX(i);
    const z = pos.getZ(i);
    // Taper toward top to make teardrop
    const taperFactor = y > 0 ? 1 - (y / radius) * 0.6 : 1;
    pos.setX(i, x * scaleX * taperFactor);
    pos.setY(i, y * scaleY);
    pos.setZ(i, z * scaleZ * taperFactor);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

function createPetalRing(count, ringRadius, petalSize, colorHex, yOffset = 0) {
  const group = new THREE.Group();
  const petalGeo = createPetal(petalSize, 0.5, 1.2, 0.3);
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 0.4,
    metalness: 0.1,
    roughness: 0.6,
    side: THREE.DoubleSide,
  });

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const mesh = new THREE.Mesh(petalGeo, mat);
    mesh.position.set(
      Math.cos(angle) * ringRadius,
      yOffset,
      Math.sin(angle) * ringRadius
    );
    // Point petal outward
    mesh.rotation.y = -angle;
    mesh.rotation.z = Math.PI / 2 + 0.15;
    group.add(mesh);
  }

  group._petalGeo = petalGeo;
  group._petalMat = mat;
  return group;
}

function createCenterLotus(radius, colorHex) {
  const group = new THREE.Group();
  const petalGeo = createPetal(radius * 0.4, 0.6, 1.5, 0.25);
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 0.5,
    metalness: 0.05,
    roughness: 0.5,
    side: THREE.DoubleSide,
  });

  // Inner layer - 8 petals standing up
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const mesh = new THREE.Mesh(petalGeo, mat);
    mesh.position.set(
      Math.cos(angle) * radius * 0.3,
      0.05,
      Math.sin(angle) * radius * 0.3
    );
    mesh.rotation.y = -angle;
    mesh.rotation.z = Math.PI / 2 - 0.3; // tilt outward slightly
    group.add(mesh);
  }

  // Center dome
  const domeGeo = new THREE.SphereGeometry(radius * 0.15, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const domeMat = new THREE.MeshStandardMaterial({
    color: 0xFFD76A,
    emissive: 0xFFD76A,
    emissiveIntensity: 0.6,
    metalness: 0.3,
    roughness: 0.4,
  });
  const dome = new THREE.Mesh(domeGeo, domeMat);
  dome.position.y = 0.03;
  group.add(dome);

  group._petalGeo = petalGeo;
  group._petalMat = mat;
  group._domeGeo = domeGeo;
  group._domeMat = domeMat;
  return group;
}

export default class RangoliGeometry {
  constructor() {
    this.group = null;
    this.particleRing = null;
    this.particleGeometry = null;
    this.particleMaterial = null;
    this.particleTexture = null;
    this.dotAngles = [];
    this.miniDiyas = [];
    this.layers = [];
    this.time = 0;
    this.disposables = [];
    this._revealTimeline = null;
  }

  create(scene) {
    this.group = new THREE.Group();

    // === LAYER 1: Outer ring (24 petals) ===
    const outerRing = createPetalRing(24, 4.5, 0.35, RANGOLI_COLORS[0], 0);
    this.group.add(outerRing);
    this.layers.push(outerRing);
    this.disposables.push(outerRing._petalGeo, outerRing._petalMat);

    // === LAYER 2: Middle ring (16 petals) ===
    const middleRing = createPetalRing(16, 3.2, 0.3, RANGOLI_COLORS[1], 0.02);
    this.group.add(middleRing);
    this.layers.push(middleRing);
    this.disposables.push(middleRing._petalGeo, middleRing._petalMat);

    // === LAYER 3: Inner ring (12 petals) ===
    const innerRing = createPetalRing(12, 2.0, 0.25, RANGOLI_COLORS[3], 0.04);
    this.group.add(innerRing);
    this.layers.push(innerRing);
    this.disposables.push(innerRing._petalGeo, innerRing._petalMat);

    // === LAYER 4: Innermost ring (8 petals + center lotus) ===
    const innermostRing = createPetalRing(8, 1.0, 0.2, RANGOLI_COLORS[4], 0.06);
    this.group.add(innermostRing);
    this.layers.push(innermostRing);
    this.disposables.push(innermostRing._petalGeo, innermostRing._petalMat);

    // Center lotus
    const lotus = createCenterLotus(0.6, RANGOLI_COLORS[5]);
    lotus.position.y = 0.08;
    this.group.add(lotus);
    this.layers.push(lotus);
    this.disposables.push(lotus._petalGeo, lotus._petalMat, lotus._domeGeo, lotus._domeMat);

    // === DECORATIVE CONNECTING LINES (thin torus rings between layers) ===
    const ringRadii = [3.85, 2.6, 1.5];
    ringRadii.forEach(r => {
      const torusGeo = new THREE.TorusGeometry(r, 0.015, 6, 64);
      const torusMat = new THREE.MeshStandardMaterial({
        color: 0xFFD76A,
        emissive: 0xFFD76A,
        emissiveIntensity: 0.3,
        metalness: 0.3,
        roughness: 0.5,
      });
      const torus = new THREE.Mesh(torusGeo, torusMat);
      torus.rotation.x = Math.PI / 2;
      torus.position.y = 0.01;
      this.group.add(torus);
      this.disposables.push(torusGeo, torusMat);
    });

    // === FLOATING PARTICLE RING (golden dots) ===
    this.particleTexture = createGlowTexture();
    this.particleGeometry = new THREE.BufferGeometry();
    const dotPositions = new Float32Array(GOLDEN_DOT_COUNT * 3);
    const dotSizes = new Float32Array(GOLDEN_DOT_COUNT);
    const dotAlphas = new Float32Array(GOLDEN_DOT_COUNT);

    this.dotAngles = [];
    for (let i = 0; i < GOLDEN_DOT_COUNT; i++) {
      const angle = (i / GOLDEN_DOT_COUNT) * Math.PI * 2;
      this.dotAngles.push({
        angle,
        radius: 5.0 + Math.sin(i * 3.7) * 0.3,
        height: 0.15 + Math.random() * 0.2,
        speed: 0.2 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
        size: 1.0 + Math.random() * 1.5,
      });
      dotPositions[i * 3] = Math.cos(angle) * 5;
      dotPositions[i * 3 + 1] = 0.15;
      dotPositions[i * 3 + 2] = Math.sin(angle) * 5;
      dotSizes[i] = 1 + Math.random() * 1.5;
      dotAlphas[i] = 0.6 + Math.random() * 0.4;
    }

    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
    this.particleGeometry.setAttribute('size', new THREE.BufferAttribute(dotSizes, 1));
    this.particleGeometry.setAttribute('alpha', new THREE.BufferAttribute(dotAlphas, 1));

    this.particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: this.particleTexture },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uColor: { value: new THREE.Color(0xFFD76A) },
      },
      vertexShader: `
        attribute float size;
        attribute float alpha;
        varying float vAlpha;
        uniform float uPixelRatio;
        void main() {
          vAlpha = alpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPixelRatio * (100.0 / -mvPosition.z);
          gl_PointSize = clamp(gl_PointSize, 0.0, 40.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          vec4 texel = texture2D(uTexture, gl_PointCoord);
          gl_FragColor = vec4(uColor * texel.rgb, texel.a * vAlpha);
          if (gl_FragColor.a < 0.01) discard;
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particleRing = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.particleRing.frustumCulled = false;
    this.group.add(this.particleRing);
    this.disposables.push(this.particleGeometry, this.particleMaterial, this.particleTexture);

    // === MINI DIYAS at cardinal positions ===
    const cardinalAngles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
    const diyaRadius = 4.8;

    cardinalAngles.forEach(angle => {
      const diya = new DiyaModel();
      const diyaGroup = diya.create(this.group);
      diyaGroup.scale.set(0.3, 0.3, 0.3);
      diyaGroup.position.set(
        Math.cos(angle) * diyaRadius,
        0,
        Math.sin(angle) * diyaRadius
      );
      // Remove from parent scene (create adds to scene, but we want it in our group)
      // Actually DiyaModel.create adds to the passed scene, which IS our group here
      this.miniDiyas.push(diya);
    });

    // Lay the rangoli flat
    this.group.rotation.x = 0;

    scene.add(this.group);
    return this.group;
  }

  update(dt) {
    this.time += dt;
    const t = this.time;

    // Slow overall rotation
    if (this.group) {
      // Don't rotate the whole group, just the particle ring
    }

    // Animate floating particle ring
    if (this.particleRing) {
      const positions = this.particleGeometry.attributes.position.array;
      const alphas = this.particleGeometry.attributes.alpha.array;

      for (let i = 0; i < GOLDEN_DOT_COUNT; i++) {
        const dot = this.dotAngles[i];
        dot.angle += dot.speed * dt;
        const r = dot.radius + Math.sin(t * 1.5 + dot.phase) * 0.15;
        const h = dot.height + Math.sin(t * 2 + dot.phase) * 0.08;

        positions[i * 3] = Math.cos(dot.angle) * r;
        positions[i * 3 + 1] = h;
        positions[i * 3 + 2] = Math.sin(dot.angle) * r;

        alphas[i] = 0.4 + Math.sin(t * 3 + i * 0.5) * 0.3;
      }

      this.particleGeometry.attributes.position.needsUpdate = true;
      this.particleGeometry.attributes.alpha.needsUpdate = true;
    }

    // Update mini diyas
    for (const diya of this.miniDiyas) {
      diya.updateFlame(dt);
    }
  }

  animateReveal(duration = 2.0) {
    if (!this.group) return;

    // Kill existing timeline
    if (this._revealTimeline) {
      this._revealTimeline.kill();
    }

    this._revealTimeline = gsap.timeline();

    // Start with everything at scale 0
    this.layers.forEach(layer => {
      layer.scale.set(0, 0, 0);
    });
    if (this.particleRing) {
      this.particleRing.material.uniforms.uColor.value.setHex(0x000000);
    }

    const layerDelay = duration / (this.layers.length + 1);

    // Animate each layer revealing from center outward
    // Reverse: center first, then outward
    const reversed = [...this.layers].reverse();
    reversed.forEach((layer, idx) => {
      this._revealTimeline.to(
        layer.scale,
        {
          x: 1,
          y: 1,
          z: 1,
          duration: layerDelay * 1.5,
          ease: 'back.out(1.7)',
        },
        idx * layerDelay * 0.7
      );
    });

    // Fade in particle ring
    if (this.particleRing) {
      this._revealTimeline.to(
        this.particleRing.material.uniforms.uColor.value,
        {
          r: 1,
          g: 0.843,
          b: 0.416,
          duration: duration * 0.5,
          ease: 'power2.inOut',
        },
        duration * 0.5
      );
    }

    return this._revealTimeline;
  }

  dispose() {
    if (this._revealTimeline) {
      this._revealTimeline.kill();
      this._revealTimeline = null;
    }

    // Dispose mini diyas
    for (const diya of this.miniDiyas) {
      diya.dispose();
    }
    this.miniDiyas = [];

    // Dispose all tracked resources
    for (const d of this.disposables) {
      if (d && typeof d.dispose === 'function') {
        d.dispose();
      }
    }
    this.disposables = [];

    if (this.group && this.group.parent) {
      this.group.parent.remove(this.group);
    }

    this.group = null;
    this.particleRing = null;
    this.particleGeometry = null;
    this.particleMaterial = null;
    this.particleTexture = null;
    this.dotAngles = [];
    this.layers = [];
  }
}
