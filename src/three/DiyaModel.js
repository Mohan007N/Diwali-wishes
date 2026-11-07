import * as THREE from 'three';

function createFlameTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Flame shape gradient
  const gradient = ctx.createRadialGradient(32, 80, 2, 32, 50, 50);
  gradient.addColorStop(0, 'rgba(255,255,230,1)');
  gradient.addColorStop(0.15, 'rgba(255,230,150,0.95)');
  gradient.addColorStop(0.35, 'rgba(255,180,50,0.7)');
  gradient.addColorStop(0.6, 'rgba(255,100,20,0.3)');
  gradient.addColorStop(0.85, 'rgba(200,50,10,0.1)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createEmberTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,220,100,1)');
  gradient.addColorStop(0.4, 'rgba(255,150,30,0.5)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// Simple noise function for flame flicker
function noise1D(t) {
  return Math.sin(t * 1.7) * 0.3 + Math.sin(t * 3.1) * 0.2 + Math.sin(t * 7.3) * 0.1 + Math.sin(t * 13.7) * 0.05;
}

const EMBER_COUNT = 30;

export default class DiyaModel {
  constructor() {
    this.group = null;
    this.flame = null;
    this.flameLight = null;
    this.flameMaterial = null;
    this.flameTexture = null;
    this.emberTexture = null;
    this.emberGeometry = null;
    this.emberMaterial = null;
    this.emberPoints = null;
    this.embers = [];
    this.intensity = 1;
    this.time = 0;
    this.disposables = [];
  }

  create(scene) {
    this.group = new THREE.Group();

    // === DIYA BOWL (LatheGeometry) ===
    // Profile points for a traditional diya bowl shape
    const profilePoints = [
      new THREE.Vector2(0.0, 0.0),     // center bottom
      new THREE.Vector2(0.15, 0.02),    // slight rise
      new THREE.Vector2(0.35, 0.05),    // bowl floor
      new THREE.Vector2(0.55, 0.12),    // inner curve
      new THREE.Vector2(0.72, 0.25),    // mid curve
      new THREE.Vector2(0.82, 0.42),    // steep side
      new THREE.Vector2(0.85, 0.55),    // near rim
      new THREE.Vector2(0.88, 0.62),    // rim flare out
      new THREE.Vector2(0.90, 0.65),    // rim peak
      new THREE.Vector2(0.87, 0.68),    // rim fold back
      new THREE.Vector2(0.83, 0.70),    // rim underside
    ];

    const bowlGeo = new THREE.LatheGeometry(profilePoints, 48);
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xD4A64A,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0x3D2000,
      emissiveIntensity: 0.2,
    });
    const bowl = new THREE.Mesh(bowlGeo, brassMat);
    this.group.add(bowl);
    this.disposables.push(bowlGeo, brassMat);

    // === DECORATIVE RIM (additional ring for emboss effect) ===
    const rimGeo = new THREE.TorusGeometry(0.86, 0.025, 8, 48);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xE8C05A,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x4A3000,
      emissiveIntensity: 0.15,
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.y = 0.66;
    rim.rotation.x = Math.PI / 2;
    this.group.add(rim);
    this.disposables.push(rimGeo, rimMat);

    // Second decorative ring for embossing detail
    const rim2Geo = new THREE.TorusGeometry(0.70, 0.015, 6, 48);
    const rim2 = new THREE.Mesh(rim2Geo, rimMat);
    rim2.position.y = 0.50;
    rim2.rotation.x = Math.PI / 2;
    this.group.add(rim2);
    this.disposables.push(rim2Geo);

    // === OIL SURFACE ===
    const oilGeo = new THREE.CircleGeometry(0.78, 48);
    const oilMat = new THREE.MeshStandardMaterial({
      color: 0x8B6914,
      metalness: 0.1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const oil = new THREE.Mesh(oilGeo, oilMat);
    oil.rotation.x = -Math.PI / 2;
    oil.position.y = 0.55;
    this.group.add(oil);
    this.disposables.push(oilGeo, oilMat);

    // === WICK ===
    const wickGeo = new THREE.CylinderGeometry(0.012, 0.015, 0.18, 8);
    const wickMat = new THREE.MeshStandardMaterial({
      color: 0x3D2B1F,
      roughness: 0.9,
      metalness: 0.0,
    });
    const wick = new THREE.Mesh(wickGeo, wickMat);
    wick.position.y = 0.64;
    this.group.add(wick);
    this.disposables.push(wickGeo, wickMat);

    // === FLAME (Sprite) ===
    this.flameTexture = createFlameTexture();
    this.flameMaterial = new THREE.SpriteMaterial({
      map: this.flameTexture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      opacity: 0.9,
    });
    this.flame = new THREE.Sprite(this.flameMaterial);
    this.flame.scale.set(0.3, 0.55, 1);
    this.flame.position.y = 0.92;
    this.group.add(this.flame);
    this.disposables.push(this.flameTexture, this.flameMaterial);

    // === FLAME LIGHT ===
    this.flameLight = new THREE.PointLight(0xFFA030, 2.0, 8, 2);
    this.flameLight.position.y = 0.85;
    this.group.add(this.flameLight);

    // Secondary softer fill light
    const fillLight = new THREE.PointLight(0xFFD76A, 0.5, 4, 2);
    fillLight.position.y = 1.2;
    this.group.add(fillLight);
    this._fillLight = fillLight;

    // === BASE PLATE / TRAY ===
    const basePlateProfile = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(1.1, 0.0),
      new THREE.Vector2(1.15, 0.02),
      new THREE.Vector2(1.18, 0.05),
      new THREE.Vector2(1.15, 0.08),
      new THREE.Vector2(1.1, 0.10),
      new THREE.Vector2(1.05, 0.10),
      new THREE.Vector2(1.0, 0.08),
    ];
    const basePlateGeo = new THREE.LatheGeometry(basePlateProfile, 48);
    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xB87333,
      metalness: 0.7,
      roughness: 0.35,
      emissive: 0x2A1500,
      emissiveIntensity: 0.15,
    });
    const basePlate = new THREE.Mesh(basePlateGeo, copperMat);
    basePlate.position.y = -0.02;
    this.group.add(basePlate);
    this.disposables.push(basePlateGeo, copperMat);

    // Ornamental edge on base plate
    const edgeGeo = new THREE.TorusGeometry(1.1, 0.02, 6, 64);
    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0xD4A64A,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x3D2000,
      emissiveIntensity: 0.1,
    });
    const edge = new THREE.Mesh(edgeGeo, edgeMat);
    edge.position.y = 0.05;
    edge.rotation.x = Math.PI / 2;
    this.group.add(edge);
    this.disposables.push(edgeGeo, edgeMat);

    // === FLOATING EMBERS ===
    this.emberTexture = createEmberTexture();
    this.emberGeometry = new THREE.BufferGeometry();
    const emberPositions = new Float32Array(EMBER_COUNT * 3);
    const emberSizes = new Float32Array(EMBER_COUNT);
    const emberAlphas = new Float32Array(EMBER_COUNT);

    this.embers = [];
    for (let i = 0; i < EMBER_COUNT; i++) {
      const ember = {
        angle: Math.random() * Math.PI * 2,
        radius: 0.1 + Math.random() * 0.4,
        height: 0.7 + Math.random() * 0.8,
        speed: 0.5 + Math.random() * 1.5,
        vertSpeed: 0.3 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        life: Math.random(),
        maxLife: 1.5 + Math.random() * 2,
        size: 0.5 + Math.random() * 1.5,
      };
      this.embers.push(ember);
      emberPositions[i * 3] = 0;
      emberPositions[i * 3 + 1] = -999;
      emberPositions[i * 3 + 2] = 0;
      emberSizes[i] = ember.size;
      emberAlphas[i] = 0;
    }

    this.emberGeometry.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
    this.emberGeometry.setAttribute('size', new THREE.BufferAttribute(emberSizes, 1));
    this.emberGeometry.setAttribute('alpha', new THREE.BufferAttribute(emberAlphas, 1));

    this.emberMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: this.emberTexture },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uColor: { value: new THREE.Color(0xFFB040) },
      },
      vertexShader: `
        attribute float size;
        attribute float alpha;
        varying float vAlpha;
        uniform float uPixelRatio;
        void main() {
          vAlpha = alpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPixelRatio * (80.0 / -mvPosition.z);
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

    this.emberPoints = new THREE.Points(this.emberGeometry, this.emberMaterial);
    this.emberPoints.frustumCulled = false;
    this.group.add(this.emberPoints);
    this.disposables.push(this.emberGeometry, this.emberMaterial, this.emberTexture);

    scene.add(this.group);
    return this.group;
  }

  updateFlame(dt, intensity = null) {
    if (intensity !== null) {
      this.intensity = Math.max(0, Math.min(1, intensity));
    }

    this.time += dt;
    const t = this.time;

    if (!this.flame) return;

    // Procedural noise-based flame flicker
    const flicker = noise1D(t * 8);
    const baseScaleX = 0.25 + this.intensity * 0.1;
    const baseScaleY = 0.45 + this.intensity * 0.15;

    this.flame.scale.set(
      baseScaleX + flicker * 0.06,
      baseScaleY + flicker * 0.1 + Math.sin(t * 12) * 0.02,
      1
    );

    // Slight position wobble
    this.flame.position.x = Math.sin(t * 5.3) * 0.01;
    this.flame.position.y = 0.92 + flicker * 0.02;

    // Flame opacity
    this.flameMaterial.opacity = 0.7 + this.intensity * 0.3 + flicker * 0.05;

    // Light intensity variation
    if (this.flameLight) {
      this.flameLight.intensity = (1.5 + flicker * 0.5) * this.intensity;
      this.flameLight.color.setHex(
        flicker > 0 ? 0xFFB040 : 0xFFA030
      );
    }
    if (this._fillLight) {
      this._fillLight.intensity = (0.3 + flicker * 0.15) * this.intensity;
    }

    // Update embers
    if (this.emberPoints) {
      const positions = this.emberGeometry.attributes.position.array;
      const alphas = this.emberGeometry.attributes.alpha.array;
      const sizes = this.emberGeometry.attributes.size.array;

      for (let i = 0; i < EMBER_COUNT; i++) {
        const e = this.embers[i];
        e.life += dt;
        if (e.life >= e.maxLife) {
          e.life = 0;
          e.angle = Math.random() * Math.PI * 2;
          e.radius = 0.1 + Math.random() * 0.4;
          e.height = 0.7;
          e.phase = Math.random() * Math.PI * 2;
        }

        const lifeRatio = e.life / e.maxLife;
        e.angle += e.speed * dt;
        e.height += e.vertSpeed * dt;
        const r = e.radius + Math.sin(t * 2 + e.phase) * 0.05;

        positions[i * 3] = Math.cos(e.angle) * r;
        positions[i * 3 + 1] = e.height;
        positions[i * 3 + 2] = Math.sin(e.angle) * r;

        // Fade in/out
        let alpha = this.intensity;
        if (lifeRatio < 0.1) alpha *= lifeRatio / 0.1;
        else if (lifeRatio > 0.7) alpha *= 1 - (lifeRatio - 0.7) / 0.3;
        alphas[i] = alpha * (0.5 + Math.sin(t * 10 + i) * 0.3);
        sizes[i] = e.size * (0.6 + Math.sin(t * 8 + i * 3) * 0.3) * this.intensity;
      }

      this.emberGeometry.attributes.position.needsUpdate = true;
      this.emberGeometry.attributes.alpha.needsUpdate = true;
      this.emberGeometry.attributes.size.needsUpdate = true;
    }
  }

  setIntensity(value) {
    this.intensity = Math.max(0, Math.min(1, value));
    if (this.flame) {
      this.flame.visible = this.intensity > 0.01;
    }
    if (this.flameLight) {
      this.flameLight.intensity = 2.0 * this.intensity;
    }
    if (this._fillLight) {
      this._fillLight.intensity = 0.5 * this.intensity;
    }
  }

  dispose() {
    if (this.group && this.group.parent) {
      this.group.parent.remove(this.group);
    }
    for (const d of this.disposables) {
      if (d && typeof d.dispose === 'function') {
        d.dispose();
      }
    }
    this.disposables = [];
    this.group = null;
    this.flame = null;
    this.flameLight = null;
    this.flameMaterial = null;
    this.flameTexture = null;
    this.emberTexture = null;
    this.emberGeometry = null;
    this.emberMaterial = null;
    this.emberPoints = null;
    this.embers = [];
  }
}
