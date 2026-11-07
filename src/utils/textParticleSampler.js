/**
 * textParticleSampler.js
 * Rasterizes entered dynamic recipient name to offscreen canvas
 * and extracts 3D target coordinates for real-time particle-to-text morphing.
 */
export function sampleTextCoordinates(text, count = 2000) {
  if (typeof document === 'undefined') return [];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  canvas.width = 1200;
  canvas.height = 360;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const clean = (text || 'DIWALI').trim().toUpperCase();
  // Dynamic font sizing based on string length
  const fontSize = Math.min(130, Math.floor(960 / Math.max(clean.length * 0.72, 4)));
  ctx.font = `800 ${fontSize}px "Cinzel", "Times New Roman", serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(clean, canvas.width / 2, canvas.height / 2);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const rawPoints = [];

  const step = 4;
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const idx = (y * canvas.width + x) * 4;
      if (data[idx] > 140) {
        // Map 2D pixel coords to 3D world space (centered in upper sky)
        const wx = ((x - canvas.width / 2) / (canvas.width / 2)) * 5.6;
        const wy = -((y - canvas.height / 2) / (canvas.height / 2)) * 1.6 + 3.2;
        const wz = -6.0 + (Math.random() - 0.5) * 0.35;
        rawPoints.push({ x: wx, y: wy, z: wz });
      }
    }
  }

  if (rawPoints.length === 0) return [];

  // Evenly distribute to reach requested particle count
  const result = [];
  for (let i = 0; i < count; i++) {
    const pt = rawPoints[i % rawPoints.length];
    result.push({
      x: pt.x + (Math.random() - 0.5) * 0.05,
      y: pt.y + (Math.random() - 0.5) * 0.05,
      z: pt.z + (Math.random() - 0.5) * 0.05,
    });
  }
  return result;
}
