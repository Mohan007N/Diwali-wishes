import * as THREE from 'three';

// Explosion types
const BURST_TYPES = {
  CHRYSANTHEMUM: 'chrysanthemum',
  RING: 'ring',
  WILLOW: 'willow',
  GLITTER: 'glitter',
  PEONY: 'peony',
};

const PALETTE = [0xFFD76A, 0xD83B83, 0xFF8A24, 0x7DE8FF, 0xC0A0FF, 0xFF6B6B, 0xFFE58A, 0x80FFD4];

const GRAVITY = -9.8;
const DRAG = 0.97;
const MAX_PARTICLES_PER_BURST = 400;
const MAX_ROCKET_PARTICLES = 60;
const POOL_SIZE = 20;

function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.15, 'rgba(255,255,200,0.9)');
  gradient.addColorStop(0.4, 'rgba(255,200,100,0.4)');
  gradient.addColorStop(0.7, 'rgba(255,150,50,0.1)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function colorToVec3(hex) {
  const c = new THREE.Color(hex);
  return { r: c.r, g: c.g, b: c.b };
}

function lerpColor(c1, c2, t) {
  return {
    r: c1.r + (c2.r - c1.r) * t,
    g: c1.g + (c2.g - c1.g) * t,
    b: c1.b + (c2.b - c1.b) * t,
  };
}

class Particle {
  constructor() {
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.color = { r: 1, g: 1, b: 1 };
    this.colorEnd = { r: 0.2, g: 0.05, b: 0 };
    this.life = 0;
    this.maxLife = 1;
    this.size = 1;
    this.active = false;
    this.drag = DRAG;
    this.gravityScale = 1;
  }

  reset() {
    this.position.set(0, 0, 0);
    this.velocity.set(0, 0, 0);
    this.life = 0;
    this.maxLife = 1;
    this.size = 1;
    this.active = false;
    this.drag = DRAG;
    this.gravityScale = 1;
  }

  update(dt) {
    if (!this.active) return;
    this.life += dt;
    if (this.life >= this.maxLife) {
      this.active = false;
      return;
    }
    this.velocity.y += GRAVITY * this.gravityScale * dt;
    this.velocity.multiplyScalar(this.drag);
    this.position.addScaledVector(this.velocity, dt);
  }

  get lifeRatio() {
    return Math.min(this.life / this.maxLife, 1);
  }
}

class Burst {
  constructor(maxParticles) {
    this.particles = [];
    for (let i = 0; i < maxParticles; i++) {
      this.particles.push(new Particle());
    }
    this.active = false;
    this.type = BURST_TYPES.CHRYSANTHEMUM;
    this.origin = new THREE.Vector3();
    this.activeCount = 0;
  }

  reset() {
    this.active = false;
    this.activeCount = 0;
    for (const p of this.particles) {
      p.reset();
    }
  }

  initChrysanthemum(origin, color, count = 300) {
    this.reset();
    this.active = true;
    this.type = BURST_TYPES.CHRYSANTHEMUM;
    this.origin.copy(origin);
    const baseColor = colorToVec3(color);
    const endColor = { r: baseColor.r * 0.2, g: baseColor.g * 0.1, b: baseColor.b * 0.05 };
    const usable = Math.min(count, this.particles.length);
    this.activeCount = usable;
    for (let i = 0; i < usable; i++) {
      const p = this.particles[i];
      p.active = true;
      p.position.copy(origin);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = randomInRange(8, 18);
      p.velocity.set(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed,
        Math.cos(phi) * speed
      );
      p.color = { ...baseColor };
      p.colorEnd = { ...endColor };
      p.life = 0;
      p.maxLife = randomInRange(1.5, 3.0);
      p.size = randomInRange(1.5, 4.0);
      p.drag = randomInRange(0.96, 0.98);
      p.gravityScale = randomInRange(0.6, 1.2);
    }
  }

  initRing(origin, color, count = 200) {
    this.reset();
    this.active = true;
    this.type = BURST_TYPES.RING;
    this.origin.copy(origin);
    const baseColor = colorToVec3(color);
    const endColor = { r: baseColor.r * 0.15, g: baseColor.g * 0.1, b: 0 };
    const usable = Math.min(count, this.particles.length);
    this.activeCount = usable;
    for (let i = 0; i < usable; i++) {
      const p = this.particles[i];
      p.active = true;
      p.position.copy(origin);
      const theta = (i / usable) * Math.PI * 2 + randomInRange(-0.05, 0.05);
      const speed = randomInRange(12, 16);
      p.velocity.set(
        Math.cos(theta) * speed,
        randomInRange(-1, 1),
        Math.sin(theta) * speed
      );
      p.color = { ...baseColor };
      p.colorEnd = { ...endColor };
      p.life = 0;
      p.maxLife = randomInRange(1.2, 2.2);
      p.size = randomInRange(2.0, 3.5);
      p.drag = 0.97;
      p.gravityScale = 0.4;
    }
  }

  initWillow(origin, color, count = 250) {
    this.reset();
    this.active = true;
    this.type = BURST_TYPES.WILLOW;
    this.origin.copy(origin);
    const baseColor = colorToVec3(color);
    const endColor = { r: 0.3, g: 0.15, b: 0.0 };
    const usable = Math.min(count, this.particles.length);
    this.activeCount = usable;
    for (let i = 0; i < usable; i++) {
      const p = this.particles[i];
      p.active = true;
      p.position.copy(origin);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = randomInRange(5, 10);
      p.velocity.set(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed * 0.6 + 2,
        Math.cos(phi) * speed
      );
      p.color = { ...baseColor };
      p.colorEnd = { ...endColor };
      p.life = 0;
      p.maxLife = randomInRange(2.5, 4.5);
      p.size = randomInRange(1.0, 2.5);
      p.drag = 0.99;
      p.gravityScale = 1.8;
    }
  }

  initGlitter(origin, color, count = 350) {
    this.reset();
    this.active = true;
    this.type = BURST_TYPES.GLITTER;
    this.origin.copy(origin);
    const baseColor = colorToVec3(color);
    const usable = Math.min(count, this.particles.length);
    this.activeCount = usable;
    for (let i = 0; i < usable; i++) {
      const p = this.particles[i];
      p.active = true;
      p.position.copy(origin);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = randomInRange(6, 14);
      p.velocity.set(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed,
        Math.cos(phi) * speed
      );
      // Glitter particles flash between bright and dim
      p.color = { r: 1, g: 1, b: 1 };
      p.colorEnd = { ...baseColor };
      p.life = 0;
      p.maxLife = randomInRange(1.0, 2.5);
      p.size = randomInRange(1.0, 3.0);
      p.drag = 0.965;
      p.gravityScale = 0.8;
    }
  }

  initPeony(origin, color, count = 280) {
    this.reset();
    this.active = true;
    this.type = BURST_TYPES.PEONY;
    this.origin.copy(origin);
    const baseColor = colorToVec3(color);
    const endColor = { r: baseColor.r * 0.3, g: baseColor.g * 0.2, b: baseColor.b * 0.1 };
    const usable = Math.min(count, this.particles.length);
    this.activeCount = usable;
    for (let i = 0; i < usable; i++) {
      const p = this.particles[i];
      p.active = true;
      p.position.copy(origin);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = randomInRange(10, 15);
      p.velocity.set(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed + 3,
        Math.cos(phi) * speed
      );
      p.color = { ...baseColor };
      p.colorEnd = { ...endColor };
      p.life = 0;
      p.maxLife = randomInRange(1.8, 3.2);
      p.size = randomInRange(2.5, 5.0);
      p.drag = 0.975;
      p.gravityScale = 1.0;
    }
  }

  update(dt) {
    if (!this.active) return;
    let anyActive = false;
    for (let i = 0; i < this.activeCount; i++) {
      const p = this.particles[i];
      if (p.active) {
        p.update(dt);
        if (p.active) anyActive = true;
      }
    }
    if (!anyActive) {
      this.active = false;
    }
  }
}

class Rocket {
  constructor() {
    this.particles = [];
    for (let i = 0; i < MAX_ROCKET_PARTICLES; i++) {
      this.particles.push(new Particle());
    }
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.targetY = 0;
    this.active = false;
    this.trailIndex = 0;
    this.trailTimer = 0;
    this.callback = null;
  }

  reset() {
    this.active = false;
    this.trailIndex = 0;
    this.trailTimer = 0;
    this.callback = null;
    for (const p of this.particles) {
      p.reset();
    }
  }

  launch(x, y, targetY, callback) {
    this.reset();
    this.active = true;
    this.position.set(x, y, 0);
    this.velocity.set(randomInRange(-0.5, 0.5), randomInRange(25, 35), randomInRange(-0.5, 0.5));
    this.targetY = targetY;
    this.callback = callback;
  }

  update(dt) {
    if (!this.active) return;

    this.position.addScaledVector(this.velocity, dt);
    this.velocity.y -= 2 * dt; // slight deceleration

    // Emit trail particles
    this.trailTimer += dt;
    if (this.trailTimer > 0.015 && this.trailIndex < this.particles.length) {
      this.trailTimer = 0;
      const p = this.particles[this.trailIndex];
      p.active = true;
      p.position.copy(this.position);
      p.velocity.set(randomInRange(-0.5, 0.5), randomInRange(-2, -0.5), randomInRange(-0.5, 0.5));
      p.color = { r: 1, g: 0.85, b: 0.5 };
      p.colorEnd = { r: 0.4, g: 0.15, b: 0 };
      p.life = 0;
      p.maxLife = randomInRange(0.3, 0.6);
      p.size = randomInRange(1.5, 2.5);
      p.drag = 0.95;
      p.gravityScale = 0.3;
      this.trailIndex++;
    }

    // Update trail particles
    for (const p of this.particles) {
      if (p.active) p.update(dt);
    }

    // Check if reached target
    if (this.position.y >= this.targetY) {
      this.active = false;
      if (this.callback) {
        this.callback(this.position.clone());
      }
    }
  }
}

export default class FireworksEngine {
  constructor(scene) {
    this.scene = scene;
    this.glowTexture = createGlowTexture();

    // Object pool for bursts
    this.burstPool = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      this.burstPool.push(new Burst(MAX_PARTICLES_PER_BURST));
    }

    // Rocket pool
    this.rocketPool = [];
    for (let i = 0; i < 10; i++) {
      this.rocketPool.push(new Rocket());
    }

    // Create burst points system
    this.burstGeometry = new THREE.BufferGeometry();
    const totalBurstParticles = POOL_SIZE * MAX_PARTICLES_PER_BURST;
    this.burstPositions = new Float32Array(totalBurstParticles * 3);
    this.burstColors = new Float32Array(totalBurstParticles * 3);
    this.burstSizes = new Float32Array(totalBurstParticles);
    this.burstAlphas = new Float32Array(totalBurstParticles);

    this.burstGeometry.setAttribute('position', new THREE.BufferAttribute(this.burstPositions, 3));
    this.burstGeometry.setAttribute('color', new THREE.BufferAttribute(this.burstColors, 3));
    this.burstGeometry.setAttribute('size', new THREE.BufferAttribute(this.burstSizes, 1));
    this.burstGeometry.setAttribute('alpha', new THREE.BufferAttribute(this.burstAlphas, 1));

    this.burstMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: this.glowTexture },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float size;
        attribute float alpha;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vAlpha = alpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPixelRatio * (200.0 / -mvPosition.z);
          gl_PointSize = clamp(gl_PointSize, 0.0, 100.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec4 texel = texture2D(uTexture, gl_PointCoord);
          gl_FragColor = vec4(vColor * texel.rgb, texel.a * vAlpha);
          if (gl_FragColor.a < 0.01) discard;
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.burstPoints = new THREE.Points(this.burstGeometry, this.burstMaterial);
    this.burstPoints.frustumCulled = false;
    this.scene.add(this.burstPoints);

    // Create rocket points system
    this.rocketGeometry = new THREE.BufferGeometry();
    const totalRocketParticles = 10 * MAX_ROCKET_PARTICLES;
    this.rocketPositions = new Float32Array(totalRocketParticles * 3);
    this.rocketColors = new Float32Array(totalRocketParticles * 3);
    this.rocketSizes = new Float32Array(totalRocketParticles);
    this.rocketAlphas = new Float32Array(totalRocketParticles);

    this.rocketGeometry.setAttribute('position', new THREE.BufferAttribute(this.rocketPositions, 3));
    this.rocketGeometry.setAttribute('color', new THREE.BufferAttribute(this.rocketColors, 3));
    this.rocketGeometry.setAttribute('size', new THREE.BufferAttribute(this.rocketSizes, 1));
    this.rocketGeometry.setAttribute('alpha', new THREE.BufferAttribute(this.rocketAlphas, 1));

    this.rocketMaterial = this.burstMaterial.clone();
    this.rocketPoints = new THREE.Points(this.rocketGeometry, this.rocketMaterial);
    this.rocketPoints.frustumCulled = false;
    this.scene.add(this.rocketPoints);

    // Grand finale state
    this._finaleTimeout = null;
    this._finaleTimeouts = [];

    this._handleResize = () => {
      const pr = Math.min(window.devicePixelRatio, 2);
      this.burstMaterial.uniforms.uPixelRatio.value = pr;
      this.rocketMaterial.uniforms.uPixelRatio.value = pr;
    };
    window.addEventListener('resize', this._handleResize);
  }

  _getAvailableBurst() {
    for (const burst of this.burstPool) {
      if (!burst.active) return burst;
    }
    return null;
  }

  _getAvailableRocket() {
    for (const rocket of this.rocketPool) {
      if (!rocket.active) return rocket;
    }
    return null;
  }

  launch(x, y, z, type = BURST_TYPES.CHRYSANTHEMUM, color = null) {
    const burst = this._getAvailableBurst();
    if (!burst) return;

    const origin = new THREE.Vector3(x, y, z);
    const burstColor = color || PALETTE[Math.floor(Math.random() * PALETTE.length)];

    switch (type) {
      case BURST_TYPES.CHRYSANTHEMUM:
        burst.initChrysanthemum(origin, burstColor);
        break;
      case BURST_TYPES.RING:
        burst.initRing(origin, burstColor);
        break;
      case BURST_TYPES.WILLOW:
        burst.initWillow(origin, burstColor);
        break;
      case BURST_TYPES.GLITTER:
        burst.initGlitter(origin, burstColor);
        break;
      case BURST_TYPES.PEONY:
        burst.initPeony(origin, burstColor);
        break;
      default:
        burst.initChrysanthemum(origin, burstColor);
    }
  }

  launchRocket(x, y, targetY, callback) {
    const rocket = this._getAvailableRocket();
    if (!rocket) return;
    rocket.launch(x, y, targetY, (pos) => {
      // Auto-launch a random burst at the rocket's final position
      const types = Object.values(BURST_TYPES);
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomColor = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      this.launch(pos.x, pos.y, pos.z, randomType, randomColor);
      if (callback) callback(pos);
    });
  }

  grandFinale() {
    // Clear any existing finale
    this._finaleTimeouts.forEach(t => clearTimeout(t));
    this._finaleTimeouts = [];

    const sequences = [
      { delay: 0, x: -8, targetY: 30, type: BURST_TYPES.CHRYSANTHEMUM },
      { delay: 200, x: 8, targetY: 32, type: BURST_TYPES.PEONY },
      { delay: 500, x: 0, targetY: 35, type: BURST_TYPES.RING },
      { delay: 800, x: -12, targetY: 28, type: BURST_TYPES.WILLOW },
      { delay: 1000, x: 12, targetY: 30, type: BURST_TYPES.GLITTER },
      { delay: 1300, x: -5, targetY: 33, type: BURST_TYPES.CHRYSANTHEMUM },
      { delay: 1500, x: 5, targetY: 31, type: BURST_TYPES.PEONY },
      { delay: 1800, x: -10, targetY: 29, type: BURST_TYPES.RING },
      { delay: 2000, x: 10, targetY: 34, type: BURST_TYPES.WILLOW },
      { delay: 2200, x: 0, targetY: 36, type: BURST_TYPES.CHRYSANTHEMUM },
      { delay: 2400, x: -7, targetY: 32, type: BURST_TYPES.GLITTER },
      { delay: 2500, x: 7, targetY: 30, type: BURST_TYPES.PEONY },
      { delay: 2700, x: -3, targetY: 35, type: BURST_TYPES.CHRYSANTHEMUM },
      { delay: 2800, x: 3, targetY: 33, type: BURST_TYPES.RING },
      { delay: 3000, x: 0, targetY: 37, type: BURST_TYPES.PEONY },
      // Grand finale cluster
      { delay: 3300, x: -6, targetY: 28, type: BURST_TYPES.CHRYSANTHEMUM },
      { delay: 3350, x: 0, targetY: 32, type: BURST_TYPES.GLITTER },
      { delay: 3400, x: 6, targetY: 30, type: BURST_TYPES.RING },
      { delay: 3500, x: -2, targetY: 35, type: BURST_TYPES.PEONY },
      { delay: 3550, x: 2, targetY: 34, type: BURST_TYPES.CHRYSANTHEMUM },
    ];

    sequences.forEach(seq => {
      const t = setTimeout(() => {
        this.launchRocket(
          seq.x,
          -5,
          seq.targetY,
          null
        );
      }, seq.delay);
      this._finaleTimeouts.push(t);
    });
  }

  update(dt) {
    // Clamp dt to avoid large jumps
    const clampedDt = Math.min(dt, 0.05);

    // Update bursts
    for (const burst of this.burstPool) {
      if (burst.active) burst.update(clampedDt);
    }

    // Update rockets
    for (const rocket of this.rocketPool) {
      if (rocket.active) rocket.update(clampedDt);
    }

    // Sync burst particles to buffer
    let bIdx = 0;
    for (const burst of this.burstPool) {
      for (let i = 0; i < burst.particles.length; i++) {
        const p = burst.particles[i];
        const offset3 = bIdx * 3;

        if (p.active && burst.active) {
          this.burstPositions[offset3] = p.position.x;
          this.burstPositions[offset3 + 1] = p.position.y;
          this.burstPositions[offset3 + 2] = p.position.z;

          const t = p.lifeRatio;
          const c = lerpColor(p.color, p.colorEnd, t);
          this.burstColors[offset3] = c.r;
          this.burstColors[offset3 + 1] = c.g;
          this.burstColors[offset3 + 2] = c.b;

          this.burstSizes[bIdx] = p.size * (1 - t * 0.5);

          // Fade out in last 30% of life
          const fadeStart = 0.7;
          const alpha = t > fadeStart ? 1 - (t - fadeStart) / (1 - fadeStart) : 1;
          // Glitter type: sparkle effect
          const glitterFlash = burst.type === BURST_TYPES.GLITTER
            ? (Math.sin(p.life * 30 + i * 7) * 0.5 + 0.5) : 1;
          this.burstAlphas[bIdx] = alpha * glitterFlash;
        } else {
          this.burstPositions[offset3] = 0;
          this.burstPositions[offset3 + 1] = -1000;
          this.burstPositions[offset3 + 2] = 0;
          this.burstColors[offset3] = 0;
          this.burstColors[offset3 + 1] = 0;
          this.burstColors[offset3 + 2] = 0;
          this.burstSizes[bIdx] = 0;
          this.burstAlphas[bIdx] = 0;
        }
        bIdx++;
      }
    }

    this.burstGeometry.attributes.position.needsUpdate = true;
    this.burstGeometry.attributes.color.needsUpdate = true;
    this.burstGeometry.attributes.size.needsUpdate = true;
    this.burstGeometry.attributes.alpha.needsUpdate = true;

    // Sync rocket particles to buffer
    let rIdx = 0;
    for (const rocket of this.rocketPool) {
      for (let i = 0; i < rocket.particles.length; i++) {
        const p = rocket.particles[i];
        const offset3 = rIdx * 3;

        if (p.active) {
          this.rocketPositions[offset3] = p.position.x;
          this.rocketPositions[offset3 + 1] = p.position.y;
          this.rocketPositions[offset3 + 2] = p.position.z;

          const t = p.lifeRatio;
          const c = lerpColor(p.color, p.colorEnd, t);
          this.rocketColors[offset3] = c.r;
          this.rocketColors[offset3 + 1] = c.g;
          this.rocketColors[offset3 + 2] = c.b;

          this.rocketSizes[rIdx] = p.size * (1 - t * 0.6);
          this.rocketAlphas[rIdx] = 1 - t;
        } else {
          this.rocketPositions[offset3] = 0;
          this.rocketPositions[offset3 + 1] = -1000;
          this.rocketPositions[offset3 + 2] = 0;
          this.rocketColors[offset3] = 0;
          this.rocketColors[offset3 + 1] = 0;
          this.rocketColors[offset3 + 2] = 0;
          this.rocketSizes[rIdx] = 0;
          this.rocketAlphas[rIdx] = 0;
        }
        rIdx++;
      }
    }

    this.rocketGeometry.attributes.position.needsUpdate = true;
    this.rocketGeometry.attributes.color.needsUpdate = true;
    this.rocketGeometry.attributes.size.needsUpdate = true;
    this.rocketGeometry.attributes.alpha.needsUpdate = true;
  }

  dispose() {
    // Clear finale timeouts
    this._finaleTimeouts.forEach(t => clearTimeout(t));
    this._finaleTimeouts = [];

    window.removeEventListener('resize', this._handleResize);

    this.scene.remove(this.burstPoints);
    this.scene.remove(this.rocketPoints);

    this.burstGeometry.dispose();
    this.burstMaterial.dispose();
    this.rocketGeometry.dispose();
    this.rocketMaterial.dispose();
    this.glowTexture.dispose();

    this.burstPool = [];
    this.rocketPool = [];
  }
}

export { BURST_TYPES, PALETTE };
