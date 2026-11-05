/* Eigenfunction · Φ mode switch · V1.1.1
   Runs in <head>, before anything draws, so a page opens straight in the remembered mode.
   The simulations read their colours once when they start, so switching plays a short power-up and reloads the page. */
(() => {
  const root = document.documentElement, KEY = 'ef-phi';
  let on = false; try { on = localStorage.getItem(KEY) === '1'; } catch (e) {}
  if (on) root.classList.add('phi');
  let boot = false; try { boot = sessionStorage.getItem('ef-phi-boot') === '1'; sessionStorage.removeItem('ef-phi-boot'); } catch (e) {}
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (boot && on && !REDUCE) { root.classList.add('phi-boot'); setTimeout(() => root.classList.remove('phi-boot'), 1000); }
  const ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle class="core" cx="12" cy="12" r="7.2"/><circle class="ring" cx="12" cy="12" r="10.2"/><circle class="ring2" cx="12" cy="12" r="7.6"/><text x="12" y="16" text-anchor="middle">Φ</text></svg>';
  function mount() {
    const bar = document.querySelector('.topbar .bar') || document.querySelector('.topbar');
    if (!bar || bar.querySelector('.phi-toggle')) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'phi-toggle'; b.setAttribute('aria-pressed', String(on));
    b.title = on ? 'Back to Specimen' : 'Switch to Φ mode';
    b.innerHTML = ICON + '<span class="lbl">Φ mode</span>';
    b.addEventListener('click', () => {
      const next = !on;
      try { localStorage.setItem(KEY, next ? '1' : '0'); sessionStorage.setItem('ef-phi-boot', next ? '1' : '0'); } catch (e) {}
      if (REDUCE) { location.reload(); return; }
      const r = b.getBoundingClientRect(), s = document.createElement('div');
      s.className = 'phi-sweep' + (next ? '' : ' off'); s.style.setProperty('--x', `${r.left + r.width / 2}px`); s.style.setProperty('--y', `${r.top + r.height / 2}px`);
      document.body.appendChild(s); setTimeout(() => location.reload(), 520);
    });
    bar.appendChild(b);
  }
  /* ---------- curved visor (Φ mode, desktop with a mouse only) ----------
     The page is moved into a viewport-sized scroller and shown through an SVG barrel-distortion filter, so the
     edges of the screen bend like a curved visor while the centre stays sharp and true. */
  const BIG = matchMedia('(min-width: 1024px) and (pointer: fine)');
  function visor() {
    if (!on || REDUCE || !BIG.matches || document.getElementById('phi-screen')) return;
    // barrel map: flat (no bend) inside an ellipse of radius R0, bending more and more towards the edges and corners.
    // Each pixel samples further out, so the whole page is squeezed inward and the screen edges curve away.
    const K = 0.03, R0 = 0.55, N = 256, cv = document.createElement('canvas'); cv.width = cv.height = N;
    const x = cv.getContext('2d'), img = x.createImageData(N, N);
    let SCALE = 1;
    function paint(w, h) {
      const D = []; let mx = 1;
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const u = (i + 0.5) / N * 2 - 1, v = (j + 0.5) / N * 2 - 1, r = Math.hypot(u, v), t = Math.max(0, r - R0) / (1 - R0), f = K * t * t;
        let dx = u * f * w / 2, dy = v * f * h / 2; const m = Math.hypot(dx, dy), cap = 0.02 * Math.max(w, h);
        if (m > cap) { dx *= cap / m; dy *= cap / m; }   // corners are hidden by the visor frame, so cap them and keep the steps fine
        D.push(dx, dy); mx = Math.max(mx, Math.abs(dx), Math.abs(dy));
      }
      SCALE = 2 * mx;
      for (let k = 0; k < N * N; k++) { const o = k * 4; img.data[o] = Math.round(255 * (0.5 + D[k * 2] / SCALE)); img.data[o + 1] = Math.round(255 * (0.5 + D[k * 2 + 1] / SCALE)); img.data[o + 2] = 128; img.data[o + 3] = 255; }
      x.putImageData(img, 0, 0); return cv.toDataURL();
    }
    const first = paint(innerWidth, innerHeight);
    const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.style.position = 'absolute';
    svg.innerHTML = `<filter id="phi-bend" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="0" y="0" color-interpolation-filters="sRGB">
      <feImage id="phi-map" href="${first}" x="0" y="0" preserveAspectRatio="none" result="map"/>
      <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G"/></filter>`;
    document.body.appendChild(svg);
    const scr = document.createElement('div'); scr.id = 'phi-screen';
    [...document.body.childNodes].forEach(n => { if (n !== svg) scr.appendChild(n); });
    document.body.appendChild(scr);
    const vis = document.createElement('div'); vis.className = 'phi-visor'; vis.setAttribute('aria-hidden', 'true'); document.body.appendChild(vis);
    const filt = svg.querySelector('filter'), fe = svg.querySelector('#phi-map'), dm = svg.querySelector('feDisplacementMap');
    let lastW = innerWidth, lastH = innerHeight;
    const size = () => { const w = innerWidth, h = innerHeight; filt.setAttribute('width', w); filt.setAttribute('height', h); fe.setAttribute('width', w); fe.setAttribute('height', h);
      if (w !== lastW || h !== lastH) { fe.setAttribute('href', paint(w, h)); lastW = w; lastH = h; } dm.setAttribute('scale', String(SCALE)); };
    size(); addEventListener('resize', size);
    root.classList.add('phi-curved');
    // keep window-based scrolling code working: scrollY, scrollTo and scroll events now follow the scroller
    try {
      Object.defineProperty(window, 'scrollY', { configurable: true, get: () => scr.scrollTop });
      Object.defineProperty(window, 'pageYOffset', { configurable: true, get: () => scr.scrollTop });
      window.scrollTo = (a, b) => typeof a === 'object' ? scr.scrollTo(a) : scr.scrollTo(a || 0, b || 0);
      window.scrollBy = (a, b) => typeof a === 'object' ? scr.scrollBy(a) : scr.scrollBy(a || 0, b || 0);
    } catch (e) {}
    scr.addEventListener('scroll', () => window.dispatchEvent(new Event('scroll')), { passive: true });
    try { const y = +sessionStorage.getItem('ef-phi-y:' + location.pathname); if (y) scr.scrollTop = y; } catch (e) {}
    addEventListener('pagehide', () => { try { sessionStorage.setItem('ef-phi-y:' + location.pathname, String(scr.scrollTop)); } catch (e) {} });
    if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  }
  function ready() { mount(); visor(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
