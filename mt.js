/* Eigenfunction · microtubule background · V1.1.2
   Hollow tubes of 13 protofilaments with a 3-start helix and 8 nm tubulin dimers, drawn as an engraved wireframe.
   The lattice bends a little towards the reader's pointer or finger, sends a signal along its strands, and turns as the page scrolls.
   It redraws only when something changes, ignores pointers over the simulations, and stays still for reduced motion. */
(() => {
  const cv = document.getElementById('mtbg'); if (!cv) return;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = getComputedStyle(document.documentElement);
  const C1 = (css.getPropertyValue('--lattice') || '#4b3b8f').trim(), C2 = (css.getPropertyValue('--lattice-hi') || '#c2416f').trim();
  const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
  const PF = 13;
  const TUBES = [
    { fx: 0.8, fy: 0.2, ang: -0.55, R: 86, a: 9, L: 2.3, par: 0.10, spin: 0.25 },
    { fx: 0.06, fy: 0.82, ang: 0.42, R: 52, a: 6.5, L: 1.9, par: 0.18, spin: 1.35 }
  ];
  let W = 0, H = 0, DPR = 1, dirty = true, last = performance.now(), lastPulse = 0;
  const ptr = { x: -1e4, y: -1e4, on: false }, pulses = [];
  function resize() { DPR = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); if (W < 560) { TUBES[0].R = 58; TUBES[0].a = 7; TUBES[1].R = 38; TUBES[1].a = 5; } dirty = true; }
  addEventListener('resize', resize); resize();
  const overPlate = e => e.target && e.target.closest && e.target.closest('.viewport, .chart, input, button');
  const geom = T => ({ cx: T.fx * W, cy: T.fy * H, slide: (scrollY * T.par * 3) % (2 * T.a),   // tubes stay in view; scrolling slides the lattice along its own axis
    c: Math.cos(T.ang), s: Math.sin(T.ang), half: Math.hypot(W, H) * T.L / 2 });
  function pulse(force) {
    if (REDUCE) return; const now = performance.now(); if (!force && now - lastPulse < 450) return;
    let best = null;
    TUBES.forEach((T, i) => { const g = geom(T), dx = ptr.x - g.cx, dy = ptr.y - g.cy, u = dx * g.c + dy * g.s, v = -dx * g.s + dy * g.c; if (Math.abs(v) < T.R * 1.6 && Math.abs(u) < g.half && (!best || Math.abs(v) < best.d)) best = { i, u, d: Math.abs(v) }; });
    if (best) { lastPulse = now; pulses.push({ i: best.i, u: best.u, t: 0, dir: Math.random() < 0.5 ? -1 : 1 }); if (pulses.length > 6) pulses.shift(); }
  }
  addEventListener('pointermove', e => { if (overPlate(e)) { if (ptr.on) { ptr.on = false; dirty = true; } return; } ptr.x = e.clientX; ptr.y = e.clientY; ptr.on = true; dirty = true; pulse(false); }, { passive: true });
  addEventListener('pointerdown', e => { if (overPlate(e)) return; ptr.x = e.clientX; ptr.y = e.clientY; ptr.on = true; dirty = true; pulse(true); }, { passive: true });
  document.addEventListener('pointerleave', () => { ptr.on = false; dirty = true; });
  addEventListener('scroll', () => { dirty = true; }, { passive: true });
  function draw() {
    const ctx = cv.getContext('2d'); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
    const spinScroll = scrollY * 0.0022;
    TUBES.forEach((T, ti) => {
      const g = geom(T), n = Math.ceil(g.half * 2 / T.a), spin = T.spin + spinScroll, rise = 3 * T.a / PF, pts = [];
      for (let p = 0; p < PF; p++) {
        const th = spin + p / PF * Math.PI * 2, ry = Math.cos(th) * T.R, front = Math.sin(th), row = [];
        for (let j = 0; j <= n; j++) {
          const u = -g.half + j * T.a + p * rise + g.slide;
          let x = g.cx + u * g.c - ry * g.s, y = g.cy + u * g.s + ry * g.c, ex = 0;
          if (y < -T.R * 3 || y > H + T.R * 3) { row.push([x, y, front, 0]); continue; }
          if (ptr.on && !REDUCE) { const dx = x - ptr.x, dy = y - ptr.y, d2 = dx * dx + dy * dy; if (d2 < 16900) { const k = 1 - d2 / 16900, d = Math.sqrt(d2) || 1; x += dx / d * k * k * 12; y += dy / d * k * k * 12; ex = k; } }
          for (const P of pulses) if (P.i === ti) { const du = Math.abs(u - (P.u + P.dir * P.t * 260)); if (du < 26) ex = Math.max(ex, (1 - du / 26) * Math.max(0, 1 - P.t / 2.2)); }
          row.push([x, y, front, ex]);
        }
        pts.push(row);
      }
      ctx.strokeStyle = rgba(C1, 0.4); ctx.lineWidth = 1.1;
      [-1, 1].forEach(sg => { ctx.beginPath(); for (let j = 0; j <= n; j += 4) { const u = -g.half + j * T.a, x = g.cx + u * g.c - sg * T.R * g.s, y = g.cy + u * g.s + sg * T.R * g.c; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); });
      for (let p = 0; p < PF; p++) { const row = pts[p], fr = row[0][2]; ctx.strokeStyle = rgba(C1, fr > 0 ? 0.08 + 0.15 * fr : 0.035 + 0.03 * (1 + fr)); ctx.lineWidth = fr > 0 ? 0.8 : 0.5; ctx.beginPath(); row.forEach(([x, y], j) => j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
      for (let p = 0; p < PF; p++) { const q = (p + 1) % PF, fr = (pts[p][0][2] + pts[q][0][2]) / 2; if (fr < -0.2) continue; ctx.strokeStyle = rgba(C1, 0.04 + 0.11 * Math.max(0, fr)); ctx.lineWidth = 0.55; ctx.beginPath(); for (let j = 0; j < pts[p].length; j += 2) { const A = pts[p][j], B = pts[q][j + (q === 0 ? 3 : 0)]; if (B) { ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); } } ctx.stroke(); }
      for (const row of pts) { const fr = row[0][2]; if (fr < 0.15) continue; for (let j = 0; j < row.length; j++) { const [x, y] = row[j]; if (y < -4 || y > H + 4) continue; ctx.fillStyle = rgba(C1, (j % 2 ? 0.09 : 0.2) * fr); ctx.fillRect(x - 0.9, y - 0.9, 1.8, 1.8); } }
      for (const row of pts) { if (row[0][2] < -0.1) continue; for (const [x, y, , ex] of row) if (ex > 0.08) { ctx.fillStyle = rgba(C2, Math.min(0.5, ex * 0.55)); ctx.beginPath(); ctx.arc(x, y, 0.8 + ex * 1, 0, 7); ctx.fill(); } }
    });
  }
  function loop(now) {
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
    if (pulses.length) { pulses.forEach(P => { P.t += dt; }); while (pulses.length && pulses[0].t > 2.2) pulses.shift(); dirty = true; }
    if (dirty) { draw(); dirty = pulses.length > 0; }
    requestAnimationFrame(loop);
  }
  draw(); requestAnimationFrame(loop);
})();
