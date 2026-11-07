import * as THREE from 'three';

function createGlowSprite() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,220,130,1)');
  gradient.addColorStop(0.3, 'rgba(255,180,60,0.6)');
  gradient.addColorStop(0.7, 'rgba(255,120,20,0.15)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createLanternMesh(glowTexture) {
  const group = new THREE.Group();
  const disposables = [];

  // === BODY (cylinder) - warm orange paper ===
  const bodyGeo = new THREE.CylinderGeometry(0.22, 0.25, 0.55, 12, 1, true);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xFF8A24,
    emissive: 0xFF6A00,
    emissiveIntensity: 0.35,
    metalness: 0.0,
    roughness: 0.8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0;
  group.add(body);
  disposables.push(bodyGeo, bodyMat);

  // === TAPERED TOP ===
  const topGeo = new THREE.ConeGeometry(0.22, 0.2, 12, 1, true);
  const topMat = new THREE.MeshStandardMaterial({
    color: 0xFFAA44,
    emissive: 0xFF7A10,
    emissiveIntensity: 0.3,
    metalness: 0.0,
    roughness: 0.8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = 0.375;
  group.add(top);
  disposables.push(topGeo, topMat);

  // === BOTTOM RING ===
  const bottomRingGeo = new THREE.TorusGeometry(0.25, 0.015, 6, 12);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xCC7722,
    metalness: 0.3,
    roughness: 0.5,
  });
  const bottomRing = new THREE.Mesh(bottomRingGeo, ringMat);
  bottomRing.rotation.x = Math.PI / 2;
  bottomRing.position.y = -0.275;
  group.add(bottomRing);
  disposables.push(bottomRingGeo, ringMat);

  // === TOP RING ===
  const topRingGeo = new THREE.TorusGeometry(0.22, 0.012, 6, 12);
  const topRing = new THREE.Mesh(topRingGeo, ringMat);
  topRing.rotation.x = Math.PI / 2;
  topRing.position.y = 0.275;
  group.add(topRing);
  disposables.push(topRingGeo);

  // === INNER GLOW SPRITE ===
  const glowMat = new THREE.SpriteMaterial({
    map: glowTexture,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });
  const glow = new THREE.Sprite(glowMat);
  glow.scale.set(0.6, 0.6, 1);
  glow.position.y = 0.05;
  group.add(glow);
  disposables.push(glowMat);

  group._disposables = disposables;
  group._glowMat = glowMat;
  return group;
}

const DEFAULT_CONFIG = {
  spreadX: 40,
  spreadY: 50,
  spreadZ: 30,
  riseSpeed: 1.2,
  driftAmplitude: 0.5,
  driftFrequency: 0.3,
  ceilingY: 45,
  floorY: -10,
  maxLights: 6,
};

export default class LanternSystem {
  constructor() {
    this.group = null;
    this.lanterns = [];
    this.lanternLights = [];
    this.glowTexture = null;
    this.config = { ...DEFAULT_CONFIG };
    this.time = 0;
    this.disposables = [];
    this._templateDisposables = [];
  }

  create(scene, count = 30) {
    this.group = new THREE.Group();
    this.glowTexture = createGlowSprite();
    this.disposables.push(this.glowTexture);

    for (let i = 0; i < count; i++) {
      const lantern = createLanternMesh(this.glowTexture);
      this._templateDisposables.push(...lantern._disposables);

      // Random starting position
      const x = (Math.random() - 0.5) * this.config.spreadX;
      const y = this.config.floorY + Math.random() * (this.config.ceilingY - this.config.floorY);
      const z = (Math.random() - 0.5) * this.config.spreadZ;
      lantern.position.set(x, y, z);

      // Random scale for depth variety
      const scale = 0.6 + Math.random() * 0.8;
      lantern.scale.set(scale, scale, scale);

      // Store per-lantern state
      const data = {
        mesh: lantern,
        riseSpeed: this.config.riseSpeed * (0.5 + Math.random() * 1.0),
        driftPhaseX: Math.random() * Math.PI * 2,
        driftPhaseZ: Math.random() * Math.PI * 2,
        driftFreqX: this.config.driftFrequency * (0.5 + Math.random()),
        driftFreqZ: this.config.driftFrequency * (0.3 + Math.random() * 0.7),
        driftAmpX: this.config.driftAmplitude * (0.5 + Math.random()),
        driftAmpZ: this.config.driftAmplitude * (0.3 + Math.random() * 0.7),
        rotSpeed: (Math.random() - 0.5) * 0.3,
        scale,
        depth: z, // for parallax sorting
        light: null,
      };

      this.lanterns.push(data);
      this.group.add(lantern);
    }

    // Add point lights to nearest N lanterns (sorted by z-depth / closeness)
    this._updateLights();

    scene.add(this.group);
    return this.group;
  }

  _updateLights() {
    // Remove existing lights
    for (const light of this.lanternLights) {
      if (light.parent) light.parent.remove(light);
      light.dispose();
    }
    this.lanternLights = [];

    // Sort lanterns by depth (closest to camera first, assuming camera is at +z)
    const sorted = [...this.lanterns].sort((a, b) => b.mesh.position.z - a.mesh.position.z);

    const lightCount = Math.min(this.config.maxLights, sorted.length);
    for (let i = 0; i < lightCount; i++) {
      const lantern = sorted[i];
      const light = new THREE.PointLight(0xFFA040, 0.4, 6, 2);
      light.position.set(0, 0, 0);
      lantern.mesh.add(light);
      lantern.light = light;
      this.lanternLights.push(light);
    }
  }

  update(dt, time) {
    this.time = time || (this.time + dt);
    const t = this.time;

    for (const data of this.lanterns) {
      const lantern = data.mesh;

      // Rise
      lantern.position.y += data.riseSpeed * dt;

      // Drift with sine wave
      lantern.position.x += Math.sin(t * data.driftFreqX + data.driftPhaseX) * data.driftAmpX * dt;
      lantern.position.z += Math.cos(t * data.driftFreqZ + data.driftPhaseZ) * data.driftAmpZ * dt * 0.5;

      // Slight rotation
      lantern.rotation.y += data.rotSpeed * dt;
      lantern.rotation.x = Math.sin(t * 0.5 + data.driftPhaseX) * 0.05;
      lantern.rotation.z = Math.cos(t * 0.3 + data.driftPhaseZ) * 0.03;

      // Respawn at bottom if above ceiling
      if (lantern.position.y > this.config.ceilingY) {
        lantern.position.y = this.config.floorY;
        lantern.position.x = (Math.random() - 0.5) * this.config.spreadX;
        lantern.position.z = (Math.random() - 0.5) * this.config.spreadZ;
        data.driftPhaseX = Math.random() * Math.PI * 2;
        data.driftPhaseZ = Math.random() * Math.PI * 2;
      }

      // Animate glow opacity
      if (lantern._glowMat) {
        lantern._glowMat.opacity = 0.5 + Math.sin(t * 2 + data.driftPhaseX) * 0.2;
      }

      // Animate light flicker
      if (data.light) {
        data.light.intensity = 0.3 + Math.sin(t * 3 + data.driftPhaseX) * 0.15;
      }
    }
  }

  setVisible(visible) {
    if (this.group) {
      this.group.visible = visible;
    }
  }

  dispose() {
    // Remove lights
    for (const light of this.lanternLights) {
      if (light.parent) light.parent.remove(light);
      light.dispose();
    }
    this.lanternLights = [];

    // Dispose template geometries/materials
    const disposed = new Set();
    for (const d of this._templateDisposables) {
      if (d && !disposed.has(d) && typeof d.dispose === 'function') {
        d.dispose();
        disposed.add(d);
      }
    }
    this._templateDisposables = [];

    // Dispose tracked resources
    for (const d of this.disposables) {
      if (d && !disposed.has(d) && typeof d.dispose === 'function') {
        d.dispose();
        disposed.add(d);
      }
    }
    this.disposables = [];

    // Remove from scene
    if (this.group && this.group.parent) {
      this.group.parent.remove(this.group);
    }

    this.group = null;
    this.lanterns = [];
    this.glowTexture = null;
  }
}
