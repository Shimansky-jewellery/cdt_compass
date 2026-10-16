// diamond3d.js — the 3D engine for "View to scale", taken unchanged from the working demo.
// It is only imported when the popup first opens (see ViewToScale.jsx), so `three` stays out of the main bundle.
// Requires: npm install three
import * as THREE from 'three';

/* ---------- 3D data per diamond (key → shape, colour, size) ---------- */
// dims = published length × width × depth in mm. Without dims, the size is estimated from carat weight.
export const STONES = {
  'the-cullinan':        { name: 'The Cullinan', ct: 3106, kind: 'rough', colour: 'white', dims: [101, 63.5, 59] },
  'the-eureka':          { name: 'The Eureka', ct: 10.73, shape: 'oval', colour: 'yellow' },
  'cullinan-i':          { name: 'Cullinan I', ct: 530.20, shape: 'pear', colour: 'white', dims: [58.9, 45.4, 27.7] },
  'the-hope':            { name: 'The Hope Diamond', ct: 45.52, shape: 'oval', colour: 'blue', dims: [25.60, 21.78, 12.00] },
  'the-excelsior':       { name: 'The Excelsior', ct: 995.2, kind: 'rough', colour: 'white' },
  'star-of-sierra-leone':{ name: 'Star of Sierra Leone', ct: 968.90, kind: 'rough', colour: 'white' },
  'golden-jubilee':      { name: 'The Golden Jubilee', ct: 545.67, shape: 'cushion', colour: 'golden' },
  'the-incomparable':    { name: 'The Incomparable', ct: 407.48, shape: 'triolette', colour: 'brownyellow' },
  'the-centenary':       { name: 'The Centenary', ct: 273.85, shape: 'pear', colour: 'white' },
  'the-jubilee':         { name: 'The Jubilee', ct: 245.35, shape: 'cushion', colour: 'white' },
  'the-de-beers':        { name: 'The De Beers', ct: 234.65, shape: 'cushion', colour: 'lightyellow' },
  'millennium-star':     { name: 'The Millennium Star', ct: 203.04, shape: 'pear', colour: 'white' },
  'the-jonker':          { name: 'The Jonker', ct: 142.90, shape: 'step', colour: 'white' },
  'premier-rose':        { name: 'The Premier Rose', ct: 137.02, shape: 'pear', colour: 'white' },
  'tiffany-yellow':      { name: 'The Tiffany Yellow', ct: 128.54, shape: 'cushion', colour: 'yellow' },
  'the-niarchos':        { name: 'The Niarchos', ct: 128.25, shape: 'pear', colour: 'white' },
  'koh-i-noor':          { name: 'The Koh-I-Noor', ct: 108.93, shape: 'oval', colour: 'white', dims: [36.00, 31.90, 13.04] },
  'great-mogul':         { name: 'The Great Mogul', ct: 793, kind: 'rough', colour: 'white' },
  'taylor-burton':       { name: 'The Taylor-Burton', ct: 69.42, shape: 'pear', colour: 'white' },
  'the-kimberley':       { name: 'The Kimberley', ct: 55.09, shape: 'step', colour: 'champagne' },
  'heart-of-eternity':   { name: 'Heart of Eternity', ct: 27.64, shape: 'heart', colour: 'vividblue' },
};
const COLOURS = { white: 0xffffff, yellow: 0xffd75a, blue: 0x2a4fb8, vividblue: 0x2f6bff, golden: 0xd99a3a, brownyellow: 0xc28b3c, lightyellow: 0xfff0b8, champagne: 0xe8c79a };

/* ---------- Size estimates from carat weight ---------- */
const SHAPE = { // size factor vs a round of the same weight, and length-to-width ratio
  round: [1, 1], oval: [1.066, 1.33], pear: [1.05, 1.5], cushion: [0.92, 1.0], marquise: [1.09, 2], heart: [1, 1], triolette: [1, 1], step: [0.91, 1.35] };
export function sizeOf(s) {
  if (s.dims) return { L: s.dims[0], W: s.dims[1], D: s.dims[2], est: false };
  if (s.kind === 'rough') { // diamond is 3.52 g/cm³, 1 ct = 0.2 g; rough crystals fill about half their bounding box
    const cm3 = s.ct * 0.2 / 3.52, k = Math.cbrt(cm3 / (0.47 * 1.68)) * 10;
    return { L: 1.6 * k, W: 1.05 * k, D: k, est: true };
  }
  const [f, r] = SHAPE[s.shape], side = 6.5 * f * Math.cbrt(s.ct);
  const W = side / Math.sqrt(r), L = side * Math.sqrt(r);
  return { L, W, D: (s.shape === 'cushion' ? 0.68 : 0.61) * W, est: true };
}
const mm = v => (v >= 100 ? String(Math.round(v)) : v.toFixed(1));

/* ---------- Geometry: one brilliant layout, reshaped per cut ---------- */
function brilliantLayout() {
  const N = 8, D = 2, table = 0.56, crown = 0.15 * D, pav = 0.43 * D, g = 0.03 * D;
  const yT = g / 2 + crown, yGb = -g / 2, yC = yGb - pav, V = [], add = (x, y, z) => V.push([x, y, z]) - 1;
  const ring = (n, r, y) => Array.from({ length: n }, (_, i) => add(r * Math.cos(i * 2 * Math.PI / n), y, r * Math.sin(i * 2 * Math.PI / n)));
  const tc = add(0, yT, 0), T = ring(N, table, yT), Gt = ring(2 * N, 1, g / 2), Gb = ring(2 * N, 1, yGb), P = ring(N, 0.45, yGb - pav * 0.6), C = add(0, yC, 0);
  const G = 2 * N, tris = [];
  for (let k = 0; k < N; k++) {
    const k1 = (k + 1) % N, a = 2 * k, b = 2 * k + 1, c = (2 * k + 2) % G;
    tris.push([tc, T[k], T[k1]], [T[k], Gt[a], Gt[b]], [T[k], Gt[b], T[k1]], [T[k1], Gt[b], Gt[c]], [Gb[a], Gb[b], P[k]], [Gb[b], P[k1], P[k]], [Gb[b], Gb[c], P[k1]], [P[k], P[k1], C]);
  }
  for (let j = 0; j < G; j++) { const j1 = (j + 1) % G; tris.push([Gt[j], Gb[j], Gb[j1]], [Gt[j], Gb[j1], Gt[j1]]); }
  return { V, tris };
}
const LAYOUT = brilliantLayout();
function outline(shape, x, z) { // reshape the round outline in the xz plane (z = length direction)
  const a = Math.atan2(z, x);
  switch (shape) {
    case 'pear': { const f = z > 0 ? Math.max(0, 1 - z) ** 0.55 : 1; return [x * f, z]; }
    case 'marquise': { const f = Math.max(0, 1 - Math.abs(z)) ** 0.55; return [x * f, z]; }
    case 'heart': { const f = z < 0 ? Math.max(0, 1 + z) ** 0.55 : 1; let zz = z;
      if (z > 0) zz -= 0.32 * Math.exp(-(x * x) / 0.06) * z * z; return [x * f * 1.05, zz]; }
    case 'cushion': { const n = 4, m = 1 / (Math.abs(Math.cos(a)) ** n + Math.abs(Math.sin(a)) ** n) ** (1 / n); return [x * (0.7 + 0.3 * m), z * (0.7 + 0.3 * m)]; }
    case 'step': { const n = 9, m = 1 / (Math.abs(Math.cos(a)) ** n + Math.abs(Math.sin(a)) ** n) ** (1 / n); return [x * m, z * m]; }
    case 'triolette': { const seg = 2 * Math.PI / 3; const p = ((a + Math.PI / 2) % seg + seg) % seg - seg / 2;
      const tri = Math.cos(seg / 2) / Math.cos(p), m = 0.82 * tri + 0.12; return [x * m, z * m]; }
    default: return [x, z];
  }
}
function finishGeo(V, tris, L, W, D) { // fit to the stone's size in mm, centre it, emit outward-facing flat facets
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const v of V) for (let i = 0; i < 3; i++) { min[i] = Math.min(min[i], v[i]); max[i] = Math.max(max[i], v[i]); }
  const size = [W, D, L], P = V.map(v => v.map((c, i) => (c - (min[i] + max[i]) / 2) / (max[i] - min[i]) * size[i]));
  const pos = new Float32Array(tris.length * 9), A = new THREE.Vector3(), B = new THREE.Vector3(), Cc = new THREE.Vector3(), n = new THREE.Vector3();
  tris.forEach((t, i) => {
    A.fromArray(P[t[0]]); B.fromArray(P[t[1]]); Cc.fromArray(P[t[2]]);
    n.subVectors(B, A).cross(new THREE.Vector3().subVectors(Cc, A));
    const cen = new THREE.Vector3().add(A).add(B).add(Cc).divideScalar(3);
    (n.dot(cen) < 0 ? [A, Cc, B] : [A, B, Cc]).forEach((v, j) => v.toArray(pos, i * 9 + j * 3));
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return geo;
}
function cutGeo(shape, L, W, D) {
  const V = LAYOUT.V.map(([x, y, z]) => { const [nx, nz] = outline(shape, x, z); return [nx, y, nz]; });
  return finishGeo(V, LAYOUT.tris, L, W, D);
}
function roughGeo(seed, L, W, D) { // an irregular octahedral crystal
  let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const base = new THREE.IcosahedronGeometry(1, 1), p = base.attributes.position, idx = [], V = [], map = new Map();
  for (let i = 0; i < p.count; i++) {
    const k = [p.getX(i), p.getY(i), p.getZ(i)].map(c => c.toFixed(4)).join();
    if (!map.has(k)) { const oct = 1 / (Math.abs(p.getX(i)) + Math.abs(p.getY(i)) + Math.abs(p.getZ(i))) ** 0.6;
      const j = 0.82 + rnd() * 0.3; map.set(k, V.push([p.getX(i) * oct * j, p.getY(i) * oct * j, p.getZ(i) * oct * j]) - 1); }
    idx.push(map.get(k));
  }
  base.dispose();
  const tris = []; for (let i = 0; i < idx.length; i += 3) tris.push([idx[i], idx[i + 1], idx[i + 2]]);
  return finishGeo(V, tris, L, W, D);
}

/* ---------- The look: Plotly-style facets on an icy blue-to-white scale ---------- */
const ICE = [[0, 0x5b6f86], [0.4, 0xb9d4ee], [0.75, 0xeef6ff], [1, 0xffffff]].map(([t, c]) => [t, new THREE.Color(c)]);
const ROUGH = [[0, 0x6d6a62], [0.5, 0xb8b4a8], [1, 0xeceae2]].map(([t, c]) => [t, new THREE.Color(c)]);
function scaleColour(scale, t, out) {
  for (let i = 1; i < scale.length; i++) if (t <= scale[i][0]) {
    const [t0, c0] = scale[i - 1], [t1, c1] = scale[i];
    return out.copy(c0).lerp(c1, (t - t0) / (t1 - t0));
  }
  return out.copy(scale[scale.length - 1][1]);
}
function paintFacets(geo, s, seed) {
  const pos = geo.attributes.position, nor = geo.attributes.normal, cols = new Float32Array(pos.count * 3);
  const light = new THREE.Vector3(0.4, 1.0, 0.6).normalize(), n = new THREE.Vector3(), c = new THREE.Color();
  const tint = new THREE.Color(COLOURS[s.colour] ?? 0xffffff), white = !s.colour || s.colour === 'white';
  let r = seed * 9301 + 49297; const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  for (let f = 0; f < pos.count; f += 3) {
    n.fromBufferAttribute(nor, f);
    const t = Math.min(1, 0.6 * Math.abs(n.dot(light)) ** 3 + 0.4 * rnd());
    scaleColour(s.kind === 'rough' ? ROUGH : ICE, t, c);
    if (!white && s.kind !== 'rough') c.lerp(c.clone().multiply(tint), 0.85);
    for (let k = 0; k < 3; k++) c.toArray(cols, (f + k) * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
}
const gemMat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, toneMapped: false });
const roughEdgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, toneMapped: false });
function makeStone(s, seed) {
  const z = sizeOf(s), g = new THREE.Group();
  const geo = s.kind === 'rough' ? roughGeo(seed + 7, z.L, z.W, z.D) : cutGeo(s.shape, z.L, z.W, z.D);
  paintFacets(geo, s, seed + 3);
  g.add(new THREE.Mesh(geo, gemMat));
  g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 1), s.kind === 'rough' ? roughEdgeMat : edgeMat));
  g.userData.size = z;
  return g;
}
const makeOneCarat = () => makeStone({ ct: 1, shape: 'round', colour: 'white', dims: [6.5, 6.5, 3.96] }, 1);
function makeCoin() { // R5 coin: 26 mm across, silver-coloured outer ring, gold-coloured centre
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(13, 13, 2, 64), new THREE.MeshStandardMaterial({ color: 0xcfd2d6, metalness: 1, roughness: 0.32 })));
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(9.1, 9.1, 2.1, 64), new THREE.MeshStandardMaterial({ color: 0xd8b45a, metalness: 1, roughness: 0.3 })));
  g.userData.size = { L: 26, W: 26, D: 2, est: false };
  return g;
}

/* ---------- One shared viewer (renderer, scene, camera), moved into whichever popup is open ---------- */
let V = null;
function initViewer() {
  if (V) return V;
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const canvas = renderer.domElement;
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;cursor:grab';
  canvas.setAttribute('aria-label', '3D diamond next to a size reference. Drag to rotate.');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1c2028);
  scene.environment = (() => { // only the coin's metal uses this; the diamonds have their own colours
    const s = new THREE.Scene(), sky = new THREE.SphereGeometry(200, 48, 24), col = [], p = sky.attributes.position;
    for (let i = 0; i < p.count; i++) { const t = p.getY(i) / 200, k = t > 0 ? 0.3 + 1.5 * t * t : 0.05 + 0.2 * (1 + t); col.push(k, k, k * 1.02); }
    sky.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    s.add(new THREE.Mesh(sky, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    const panel = (w, h, pos, k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k), side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(0, 0, 0); s.add(m); };
    panel(120, 40, [0, 150, 40], 7); panel(20, 140, [140, 20, 40], 5); panel(20, 140, [-140, 20, -30], 4); panel(90, 15, [30, 60, -140], 6); panel(15, 90, [-60, 40, 140], 4);
    const pm = new THREE.PMREMGenerator(renderer), tex = pm.fromScene(s, 0.02).texture; pm.dispose(); return tex;
  })();
  const keyLight = new THREE.DirectionalLight(0xffffff, 2); keyLight.position.set(1, 2, 3); scene.add(keyLight);
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -2000, 2000);
  camera.position.set(0, 0, 500);

  V = { renderer, canvas, scene, camera, shown: [], spin: new THREE.Quaternion(), life: false, idle: true, running: false, drag: null, ro: null, host: null };

  const AX = new THREE.Vector3(1, 0, 0), AY = new THREE.Vector3(0, 1, 0), q = new THREE.Quaternion();
  canvas.addEventListener('pointerdown', e => { V.drag = { x: e.clientX, y: e.clientY }; V.idle = false; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    if (!V.drag) return;
    V.spin.premultiply(q.setFromAxisAngle(AY, (e.clientX - V.drag.x) * 0.01));
    V.spin.premultiply(q.setFromAxisAngle(AX, (e.clientY - V.drag.y) * 0.01));
    V.drag = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener('pointerup', () => { V.drag = null; });
  canvas.addEventListener('pointercancel', () => { V.drag = null; });

  const FACE_UP = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2 - 0.45, 0, 0)); // table towards you, slightly tilted
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  V.loop = () => {
    if (!V.running) return;
    if (V.idle && !reduce) V.spin.premultiply(q.setFromAxisAngle(AY, 0.005));
    V.shown.forEach(o => o.quaternion.copy(V.spin).multiply(FACE_UP)); // each turns in place, so the sizes stay comparable
    renderer.render(scene, camera);
    requestAnimationFrame(V.loop);
  };
  return V;
}
const gapOf = objs => (objs.length > 1 ? Math.max(8, objs[0].userData.size.W * 0.18) : 0);
function frame() {
  const { shown, camera, host, life, renderer } = V;
  const w = host?.clientWidth, h = host?.clientHeight;
  if (!w || !h || !shown.length) return;
  renderer.setSize(w, h, false);
  let k;
  if (life) k = 25.4 / 96; // approx. mm per CSS pixel
  else {
    const totalW = shown.reduce((a, o) => a + o.userData.size.W, 0) + gapOf(shown), maxL = Math.max(...shown.map(o => o.userData.size.L));
    k = Math.max(totalW * 1.3 / w, maxL * 1.5 / h);
  }
  camera.left = -w / 2 * k; camera.right = w / 2 * k; camera.top = h / 2 * k; camera.bottom = -h / 2 * k;
  camera.updateProjectionMatrix();
}

/** Put the viewer inside `host` (a div) and start drawing. Returns a stop function. */
export function mountViewer(host) {
  initViewer();
  V.host = host;
  host.prepend(V.canvas);
  V.spin.identity(); V.idle = true;
  V.ro = new ResizeObserver(frame); V.ro.observe(host);
  V.running = true; V.loop();
  return () => { V.running = false; V.ro?.disconnect(); V.ro = null; };
}

/** Show a stone next to a reference ('ct' or 'coin'), fitted or life size. Returns the size labels. */
export function showStone(key, ref = 'ct', life = false) {
  initViewer();
  const s = STONES[key];
  if (!s) throw new Error(`Unknown diamond key "${key}". Use one of: ${Object.keys(STONES).join(', ')}`);
  V.shown.forEach(o => { V.scene.remove(o); o.traverse(c => c.geometry?.dispose()); });
  const seed = Object.keys(STONES).indexOf(key);
  const st = makeStone(s, seed), other = ref === 'coin' ? makeCoin() : makeOneCarat();
  V.shown = [st, other];
  const gap = gapOf(V.shown), total = V.shown.reduce((a, o) => a + o.userData.size.W, 0) + gap;
  let x = -total / 2;
  for (const o of V.shown) { V.scene.add(o); o.position.set(x + o.userData.size.W / 2, 0, 0); x += o.userData.size.W + gap; }
  V.life = life;
  frame();
  const z = st.userData.size;
  return {
    stone: `${s.name}: ${z.est ? 'about ' : ''}${mm(z.L)} × ${mm(z.W)} mm${z.est ? ' (est.)' : ''}`,
    reference: ref === 'coin' ? 'R5 coin: 26 mm' : '1 ct diamond: 6.5 mm',
  };
}
