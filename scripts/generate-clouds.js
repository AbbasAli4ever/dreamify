// Renders Home's cloud layers once into transparent PNGs (assets/images/clouds-*.png).
// The app only slides these images sideways, which costs almost nothing per frame;
// drawing the clouds live with a shader every frame made Home lag.
// Both images tile seamlessly left to right, so two copies side by side loop forever.
//
//   node scripts/generate-clouds.js
//
// Uses CanvasKit (Skia for Node), which ships with @shopify/react-native-skia.

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const bin = path.join(root, 'node_modules/canvaskit-wasm/bin');
const CanvasKitInit = require(path.join(bin, 'canvaskit.js'));

// Value noise whose lattice wraps every `period` cells in x, so the image tiles horizontally.
// Octaves double exactly (×2), so every octave repeats within the same width.
const SKSL = `
uniform float2 size;
uniform float periodX;   // noise cells across the image
uniform float cellsY;    // noise cells down the image
uniform float lo;        // density: where clouds start
uniform float hi;        // density: where they're solid
uniform float opacity;
uniform float seed;
uniform float fadeIn;    // top fade ends here (0–1 of the height)
uniform float fadeOut;   // bottom fade starts here
uniform float3 shadow;   // colour of thin parts / undersides
uniform float3 lit;      // colour of the dense, moonlit parts

float hash(float2 p, float period) {
  p.x = mod(p.x, period);
  p = mod(p + seed, 289.0);
  float3 p3 = fract(float3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(float2 p, float period) {
  float2 i = floor(p);
  float2 f = fract(p);
  float2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i, period), hash(i + float2(1.0, 0.0), period), u.x),
             mix(hash(i + float2(0.0, 1.0), period), hash(i + float2(1.0, 1.0), period), u.x), u.y);
}

float fbm(float2 p, float period) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 6; i++) {
    v += a * noise(p, period);
    p = p * 2.0 + float2(0.0, 1.7);
    period *= 2.0;
    a *= 0.5;
  }
  return v;
}

half4 main(float2 fc) {
  float2 t = fc / size;
  float n = fbm(float2(t.x * periodX, t.y * cellsY), periodX);
  float c = smoothstep(lo, hi, n);
  // Fade out toward the top and bottom edges.
  float mask = smoothstep(0.0, fadeIn, t.y) * (1.0 - smoothstep(fadeOut, 1.0, t.y));
  float a = c * mask * opacity;
  float3 col = mix(shadow, lit, smoothstep(0.4, 1.0, c));
  return half4(half3(col * a), half(a));
}
`;

/** Home's sky: fades before the rocks; darker undersides, moonlit tops. */
const SKY = { fadeIn: 0.15, fadeOut: 0.62, shadow: [0.36, 0.41, 0.58], lit: [0.8, 0.84, 0.96] };

const LAYERS = [
  // Big slow banks.
  {
    file: 'clouds-back.png',
    w: 1024,
    h: 512,
    periodX: 4,
    cellsY: 4,
    lo: 0.4,
    hi: 0.82,
    opacity: 0.45,
    seed: 11,
    ...SKY,
  },
  // Smaller wisps in front (they move faster, for depth).
  {
    file: 'clouds-front.png',
    w: 1024,
    h: 512,
    periodX: 6,
    cellsY: 7,
    lo: 0.52,
    hi: 0.9,
    opacity: 0.3,
    seed: 47,
    ...SKY,
  },
  // A band of broken, moonlit clouds that crosses in front of the moon (onboarding, Welcome):
  // light grey and fairly dense, with gaps so the moon shows through.
  {
    file: 'moon-clouds.png',
    w: 1024,
    h: 384,
    periodX: 5,
    cellsY: 3,
    lo: 0.47,
    hi: 0.78,
    opacity: 0.82,
    seed: 83,
    fadeIn: 0.32,
    fadeOut: 0.62,
    // Everyday cloud colours: soft light grey with a hint of moonlight, grey undersides.
    shadow: [0.38, 0.41, 0.5],
    lit: [0.72, 0.74, 0.8],
  },
];

CanvasKitInit({ locateFile: (f) => path.join(bin, f) }).then((CK) => {
  let error = '';
  const effect = CK.RuntimeEffect.Make(SKSL, (e) => (error = e));
  if (!effect) throw new Error(error);
  for (const l of LAYERS) {
    const surface = CK.MakeSurface(l.w, l.h);
    const canvas = surface.getCanvas();
    canvas.clear(CK.TRANSPARENT);
    const paint = new CK.Paint();
    paint.setShader(
      effect.makeShader([
        l.w,
        l.h,
        l.periodX,
        l.cellsY,
        l.lo,
        l.hi,
        l.opacity,
        l.seed,
        l.fadeIn,
        l.fadeOut,
        ...l.shadow,
        ...l.lit,
      ]),
    );
    canvas.drawPaint(paint);
    const out = path.join(root, 'assets/images', l.file);
    fs.writeFileSync(out, surface.makeImageSnapshot().encodeToBytes());
    console.log(`${l.file}: ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
  }
});
