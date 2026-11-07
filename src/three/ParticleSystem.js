import * as THREE from 'three';

function createGlowTexture(size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const half = size / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.2, 'rgba(255,240,200,0.8)');
  gradient.addColorStop(0.5, 'rgba(255,180,80,0.3)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

const DEFAULT_OPTIONS = {
  color: new THREE.Color(0xFFD76A),
  size: 2.0,
  spread: 10,
  speed: 3,
  gravity: -2.0,
  fadeRate: 0.5,
  blending: 'additive',
};

class ParticleData {
  constructor() {
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.life = 0;
    this.maxLife = 1;
    this.active = false;
    this.color = new THREE.Color(1, 1, 1);
    this.size = 1;
  }

  reset() {
    this.position.set(0, 0, 0);
    this.velocity.set(0, 0, 0);
    this.life = 0;
    this.maxLife = 1;
    this.active = false;
    this.size = 1;
  }
}

export default class ParticleSystem {
  constructor(scene, count = 500, options = {}) {
    this.scene = scene;
    this.count = count;
    this.options = { ...DEFAULT_OPTIONS, ...options };

    // Particle data
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push(new ParticleData());
    }
    this.nextEmitIndex = 0;

    // Texture
    this.glowTexture = createGlowTexture();

    // Geometry
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(count * 3);
    this.colors = new Float32Array(count * 3);
    this.sizes = new Float32Array(count);
    this.alphas = new Float32Array(count);

    // Initialize positions off-screen
    for (let i = 0; i < count; i++) {
      this.positions[i * 3] = 0;
      this.positions[i * 3 + 1] = -9999;
      this.positions[i * 3 + 2] = 0;
      this.colors[i * 3] = 1;
      this.colors[i * 3 + 1] = 1;
      this.colors[i * 3 + 2] = 1;
      this.sizes[i] = 0;
      this.alphas[i] = 0;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
    this.geometry.setAttribute('alpha', new THREE.BufferAttribute(this.alphas, 1));

    const blendingMode = this.options.blending === 'additive'
      ? THREE.AdditiveBlending
      : THREE.NormalBlending;

    this.material = new THREE.ShaderMaterial({
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
          gl_PointSize = size * uPixelRatio * (150.0 / -mvPosition.z);
          gl_PointSize = clamp(gl_PointSize, 0.0, 80.0);
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
      blending: blendingMode,
      depthWrite: false,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.scene.add(this.points);

    this._handleResize = () => {
      this.material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    };
    window.addEventListener('resize', this._handleResize);
  }

  /**
   * Emit particles from an origin point
   * @param {THREE.Vector3} origin - emission origin
   * @param {number} emitCount - number of particles to emit
   * @param {Function} velocityFunc - optional function(index) => THREE.Vector3 for custom velocity
   */
  emit(origin, emitCount = 10, velocityFunc = null) {
    for (let i = 0; i < emitCount; i++) {
      const p = this.particles[this.nextEmitIndex];
      p.reset();
      p.active = true;

      p.position.copy(origin);
      // Add random spread to position
      p.position.x += (Math.random() - 0.5) * this.options.spread * 0.1;
      p.position.y += (Math.random() - 0.5) * this.options.spread * 0.1;
      p.position.z += (Math.random() - 0.5) * this.options.spread * 0.1;

      if (velocityFunc) {
        const vel = velocityFunc(i);
        p.velocity.copy(vel);
      } else {
        const speed = this.options.speed;
        p.velocity.set(
          (Math.random() - 0.5) * speed * 2,
          Math.random() * speed + speed * 0.5,
          (Math.random() - 0.5) * speed * 2
        );
      }

      p.color.copy(this.options.color);
      p.maxLife = 1 / this.options.fadeRate + (Math.random() - 0.5) * 0.5;
      p.size = this.options.size * (0.5 + Math.random());

      this.nextEmitIndex = (this.nextEmitIndex + 1) % this.count;
    }
  }

  update(dt) {
    const clampedDt = Math.min(dt, 0.05);
    const gravity = this.options.gravity;

    for (let i = 0; i < this.count; i++) {
      const p = this.particles[i];
      const i3 = i * 3;

      if (!p.active) {
        this.positions[i3] = 0;
        this.positions[i3 + 1] = -9999;
        this.positions[i3 + 2] = 0;
        this.sizes[i] = 0;
        this.alphas[i] = 0;
        continue;
      }

      p.life += clampedDt;
      if (p.life >= p.maxLife) {
        p.active = false;
        this.positions[i3 + 1] = -9999;
        this.sizes[i] = 0;
        this.alphas[i] = 0;
        continue;
      }

      // Physics
      p.velocity.y += gravity * clampedDt;
      p.velocity.multiplyScalar(0.98); // slight drag
      p.position.addScaledVector(p.velocity, clampedDt);

      const lifeRatio = p.life / p.maxLife;

      // Write to buffers
      this.positions[i3] = p.position.x;
      this.positions[i3 + 1] = p.position.y;
      this.positions[i3 + 2] = p.position.z;

      // Color fades darker over life
      const fade = 1 - lifeRatio * 0.6;
      this.colors[i3] = p.color.r * fade;
      this.colors[i3 + 1] = p.color.g * fade;
      this.colors[i3 + 2] = p.color.b * fade;

      this.sizes[i] = p.size * (1 - lifeRatio * 0.4);

      // Alpha fades out in last 40% of life
      const alphaFadeStart = 0.6;
      this.alphas[i] = lifeRatio > alphaFadeStart
        ? 1 - (lifeRatio - alphaFadeStart) / (1 - alphaFadeStart)
        : 1;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
    this.geometry.attributes.alpha.needsUpdate = true;
  }

  setVisible(visible) {
    this.points.visible = visible;
  }

  dispose() {
    window.removeEventListener('resize', this._handleResize);
    this.scene.remove(this.points);
    this.geometry.dispose();
    this.material.dispose();
    this.glowTexture.dispose();
    this.particles = [];
  }
}
