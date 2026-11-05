/* Eigenfunction · arrival scan · V3.0.0 · "Syzygy"
   A LiDAR point-cloud scene. It opens looking straight down a line of seven planets, so they stack into one shrinking column
   in front of what looks like a single star. Time then slows to a near stop and the camera swings round in a bullet-time
   move, rising as it goes: the line of planets is revealed side-on, and behind the near star a second star appears.
   It is a binary, two stars locked in orbit, sending gravitational waves out through the system as expanding rings,
   with seven planets circling the pair. Time resumes, then a scan line wipes the cloud away to reveal the page.
   About 8 seconds, no text. Click, tap, scroll or press a key to skip. Skipped for reduced motion.
   Add ?introT=<seconds> (or set window.__introT) to hold one moment, for stills. */
(() => {
  const host = document.getElementById('ef-intro'); if (!host) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { host.remove(); return; }
  const PHI = document.documentElement.classList.contains('phi');
  const cv = host.querySelector('canvas'), ctx = cv.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  const size = () => { DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); };
  size(); addEventListener('resize', size);
  const SMALL = Math.min(innerWidth, innerHeight) < 600, Q = SMALL ? 0.55 : 1;
  let seed = 5; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;

  /* ---------- the system ---------- */
  // bodies: two stars, then seven planets (orbit radius, size, colour index, ringed?)
  const STARS = [{ m: 0.58, r: 0.28 }, { m: 0.42, r: 0.21 }], SEP = 0.95;
  const PLAN = [[1.55, 0.09, 0], [2.1, 0.13, 1], [2.75, 0.11, 0], [3.45, 0.19, 1, 1], [4.2, 0.15, 2], [5.0, 0.25, 0], [5.85, 0.2, 1]];
  const KIND = { STAR: 0, PLANET: 1, PRING: 2, ORBIT: 3, WAVE: 4, DUST: 5 };
  const X = [], Y = [], Z = [], K = [], B = [], S = [];   // local coords, kind, body index, seed
  const add = (x, y, z, k, b, s) => { X.push(x); Y.push(y); Z.push(z); K.push(k); B.push(b); S.push(s); };
  const sphere = (r, n, k, b) => { for (let i = 0; i < n; i++) { const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u); add(s * Math.cos(th) * r, u * r, s * Math.sin(th) * r, k, b, rnd()); } };
  STARS.forEach((s, i) => sphere(s.r, 2200 * Q, KIND.STAR, i));
  PLAN.forEach((p, i) => {
    sphere(p[1], Math.round((500 + 9000 * p[1]) * Q), KIND.PLANET, i);
    if (p[3]) for (let j = 0; j < 1800 * Q; j++) { const a = rnd() * Math.PI * 2, rr = p[1] * (1.45 + rnd() * 0.75); add(rr * Math.cos(a), (rnd() - 0.5) * 0.006, rr * Math.sin(a), KIND.PRING, i, rnd()); }
    for (let j = 0; j < Math.round(260 * p[0] * Q); j++) { const a = rnd() * Math.PI * 2; add(p[0] * Math.cos(a), 0, p[0] * Math.sin(a), KIND.ORBIT, i, rnd()); }
  });
  // gravitational-wave field: points over the orbital plane; brightness follows outgoing two-armed ripples
  for (let i = 0; i < 24000 * Q; i++) { const r = 0.5 + Math.pow(rnd(), 0.85) * 8.5, a = rnd() * Math.PI * 2; add(r * Math.cos(a), gauss() * 0.05, r * Math.sin(a), KIND.WAVE, 0, rnd()); }
  for (let i = 0; i < 2200 * Q; i++) { const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u), r = 11 + rnd() * 9; add(r * s * Math.cos(th), u * r, r * s * Math.sin(th), KIND.DUST, 0, rnd()); }
  const N = X.length, PX = new Float32Array(N), PY = new Float32Array(N), PZ = new Float32Array(N), PA = new Float32Array(N), PC = new Uint8Array(N);

  /* ---------- time ---------- */
  const T_SCAN = 2.0, T_SW0 = 2.2, T_SW1 = 5.6, T_WIPE = 6.9, T_END = 8.0, T_ALIGN = 2.0;
  const ease = u => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);
  const rate = t => t < T_SW0 - 0.3 ? 1 : t < T_SW0 ? 1 - 0.85 * ease((t - T_SW0 + 0.3) / 0.3) : t < T_SW1 ? 0.15 : t < T_SW1 + 0.35 ? 0.15 + 1.45 * ease((t - T_SW1) / 0.35) : 1.6;
  const tauAt = t => { let s = 0, x = 0; const h = 0.01; while (x < t) { s += rate(x) * Math.min(h, t - x); x += h; } return s; };
  const OB = 2.6, O1 = 1.4;   // binary angular speed, planet speed at r = 1 (Kepler: falls as r^-1.5)
  const pal = PHI ? { bg: [10, 17, 24], a: [53, 227, 255], b: [157, 139, 255], c: [255, 79, 174], hot: [236, 252, 255], dim: [70, 150, 175] }
                  : { bg: [233, 236, 230], a: [43, 68, 230], b: [112, 38, 242], c: [222, 31, 110], hot: [46, 44, 54], dim: [120, 125, 160] };
  const COLS = [pal.hot, pal.a, pal.b, pal.c, pal.dim], STARC = [0, 3];   // colour indices per kind
  let t0 = performance.now(), done = false, tau = 0, lastT = 0, skipped = false;
  const FIX = /[?&]introT=([\d.]+)/.exec(location.search);
  const finish = () => { if (!skipped) { skipped = true; t0 = performance.now() - T_WIPE * 1000; tau = tauAt(T_WIPE); lastT = T_WIPE; } };
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(e => addEventListener(e, finish, { passive: true, once: true }));
  const LEV = 10, buckets = Array.from({ length: COLS.length * LEV }, () => []);

  function frame(now) {
    if (done) return;
    const HOLD = window.__introT != null ? window.__introT : FIX ? +FIX[1] : null, t = HOLD != null ? HOLD : (now - t0) / 1000;
    if (HOLD != null) tau = tauAt(t); else { tau += rate(lastT) * Math.max(0, t - lastT); lastT = t; }
    // camera: starts on the line of planets, then a 90° bullet-time swing that rises to a three-quarter view
    const sw = ease((t - T_SW0) / (T_SW1 - T_SW0)), drift = t > T_SW1 ? (t - T_SW1) * 0.05 : 0;
    const az = -Math.PI / 2 + sw * Math.PI / 2 + drift, el = 0.035 + sw * 0.74, dist = 9.2 + sw * 1.4;
    const cs = Math.cos(az), sn = Math.sin(az), ce = Math.cos(el), se = Math.sin(el);
    const F = Math.min(W < H ? W * 1.3 : W, H * 1.6) * (0.62 + 0.08 * sw), cx = W / 2, cy = H / 2 + sw * H * 0.04;
    // body positions now
    const ab = OB * (tau - T_ALIGN), bx = Math.cos(ab), bz = Math.sin(ab);
    const SP = [[SEP * STARS[1].m * bx, 0, SEP * STARS[1].m * bz], [-SEP * STARS[0].m * bx, 0, -SEP * STARS[0].m * bz]];
    const PP = PLAN.map(p => { const a = O1 * Math.pow(p[0], -1.5) * (tau - T_ALIGN); return [p[0] * Math.cos(a), 0, p[0] * Math.sin(a), a]; });
    // waves: outgoing rings at twice the orbital frequency, with a two-armed twist; they lift the plane a little
    const kW = 2.4, wW = 2 * OB, wave = (r, a) => Math.cos(kW * r - wW * (tau - T_ALIGN) + 2 * (a - ab) * 0.5);
    for (let i = 0; i < N; i++) {
      let x = X[i], y = Y[i], z = Z[i], al = 0.8, ci = 1; const k = K[i], b = B[i];
      if (k === KIND.STAR) { const p = SP[b]; x += p[0]; y += p[1]; z += p[2]; al = 1; ci = b ? 3 : 0; }
      else if (k === KIND.PLANET || k === KIND.PRING) {
        const p = PP[b], r = PLAN[b][0], lift = 0.06 * wave(r, p[3]) * Math.exp(-r * 0.12);
        if (k === KIND.PRING) { const tl = 0.45, yy = y * Math.cos(tl) - z * Math.sin(tl), zz = y * Math.sin(tl) + z * Math.cos(tl); y = yy; z = zz; }
        x += p[0]; y += p[1] + lift; z += p[2]; al = k === KIND.PRING ? 0.55 : 0.9; ci = k === KIND.PRING ? 3 : PLAN[b][2] === 2 ? 2 : 1;
      }
      else if (k === KIND.ORBIT) { al = 0.16; ci = 4; }
      else if (k === KIND.WAVE) { const r = Math.hypot(x, z), a = Math.atan2(z, x), w = wave(r, a), crest = Math.pow(Math.max(0, w), 2.2);
        y += 0.09 * w * Math.exp(-r * 0.13); al = Math.min(1, (0.04 + 1.25 * crest) * Math.min(1, (r - 0.45) * 1.6) * Math.exp(-r * 0.045)); ci = crest > 0.35 ? 3 : 4; }
      else { al = 0.25; ci = 4; }
      // world -> camera
      const Xc = x * cs - z * sn, Z0 = x * sn + z * cs, Yc = y * ce - Z0 * se, Zc = y * se + Z0 * ce + dist;
      if (Zc < 0.4) { PA[i] = 0; continue; }
      const kk = F / Zc; PX[i] = cx + Xc * kk; PY[i] = cy - Yc * kk; PZ[i] = Zc; PA[i] = al; PC[i] = ci;
    }
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
    const wipe = t < T_WIPE ? -1 : Math.min(1, (t - T_WIPE) / (T_END - T_WIPE)), wy = wipe < 0 ? -1 : Math.pow(wipe, 0.85) * (H + 40) - 20;
    ctx.fillStyle = `rgb(${pal.bg.join(',')})`; ctx.fillRect(0, Math.max(0, wy), W, H);
    const scanY = Math.min(H + 40, (t / T_SCAN) * (H + 80) - 40);
    buckets.forEach(bk => bk.length = 0);
    for (let i = 0; i < N; i++) {
      const a0 = PA[i]; if (a0 <= 0.01) continue; const x = PX[i], y = PY[i]; if (x < -4 || x > W + 4 || y < -4 || y > H + 4 || y > scanY || (wy >= 0 && y < wy)) continue;
      const row = 0.72 + 0.28 * Math.cos(y * 1.25), fog = K[i] === KIND.WAVE ? 1 : Math.max(0.35, Math.min(1, 1.25 - PZ[i] / (dist * 2.2)));
      let a = a0 * row * fog, ci = PC[i];
      const fresh = t < T_SCAN + 0.1 ? Math.max(0, 1 - (scanY - y) / 24) : 0; if (fresh > 0) { ci = 0; a = Math.min(1, a + fresh); }
      if (wy >= 0 && y - wy < 28) { ci = 0; a = Math.min(1, a + (1 - (y - wy) / 28)); }
      const s = Math.max(0.9, Math.min(3.2, F / PZ[i] * 0.012));
      buckets[ci * LEV + Math.min(LEV - 1, Math.floor(a * LEV))].push(x - s / 2, y - s / 2, s);
    }
    ctx.globalCompositeOperation = PHI ? 'lighter' : 'source-over';
    buckets.forEach((bk, j) => { if (!bk.length) return; const c = COLS[Math.floor(j / LEV)], a = ((j % LEV) + 0.5) / LEV;
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(2)})`; ctx.beginPath(); for (let q = 0; q < bk.length; q += 3) ctx.rect(bk[q], bk[q + 1], bk[q + 2], bk[q + 2]); ctx.fill(); });
    // star glow
    SP.forEach((p, i) => { const Xc = p[0] * cs - p[2] * sn, Z0 = p[0] * sn + p[2] * cs, Yc = p[1] * ce - Z0 * se, Zc = p[1] * se + Z0 * ce + dist, kk = F / Zc, hx = cx + Xc * kk, hy = cy - Yc * kk;
      if (hy > scanY || (wy >= 0 && hy < wy)) return; const r = STARS[i].r * kk * 3.2, c = i ? pal.c : pal.a, g = ctx.createRadialGradient(hx, hy, 0, hx, hy, r);
      g.addColorStop(0, `rgba(${pal.hot.join(',')},${PHI ? 0.55 : 0.25})`); g.addColorStop(0.35, `rgba(${c.join(',')},${PHI ? 0.25 : 0.12})`); g.addColorStop(1, `rgba(${c.join(',')},0)`); ctx.fillStyle = g; ctx.fillRect(hx - r, hy - r, 2 * r, 2 * r); });
    ctx.globalCompositeOperation = 'source-over';
    const line = (yy, c, w) => { const g = ctx.createLinearGradient(0, yy - 18, 0, yy + 2); g.addColorStop(0, `rgba(${c.join(',')},0)`); g.addColorStop(1, `rgba(${c.join(',')},${w})`); ctx.fillStyle = g; ctx.fillRect(0, yy - 18, W, 20); ctx.fillStyle = `rgba(${c.join(',')},${Math.min(1, w + 0.3)})`; ctx.fillRect(0, yy, W, 1.5); };
    if (t < T_SCAN + 0.1 && scanY > 0 && scanY < H) line(scanY, PHI ? pal.a : pal.b, 0.35);
    if (wy > 0 && wy < H) line(wy, PHI ? pal.a : pal.b, 0.5);
    if (t >= T_END && HOLD == null) { done = true; host.classList.add('gone'); setTimeout(() => host.remove(), 400); return; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
