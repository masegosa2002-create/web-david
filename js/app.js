/* ═══════════════════════════════════════════════════════════
   NAZBOT — app.js  |  Nebula Dark Edition
   3D Nebula Background · Warp Transitions · Cursor · Router
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ── Shared warp state (used by 3D loop + router) ─────────── */
let cameraTargetZ = 70;

/* ── INIT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initBanner();
  initCursor();
  init3DBackground();
  initRouter();
  initStickyCTA();
  initFooterYear();
  initROICalculator();
  initScrollReveal();
  initChatbot();

  const scrollBtn = document.getElementById('scroll-to-services');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      const el = document.getElementById('servicios');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }
});

/* ══════════════════════════════════════════════════════════
   THEME TOGGLE
   ══════════════════════════════════════════════════════════ */
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  const root = document.documentElement;
  if (!toggle) return;

  const saved = localStorage.getItem('nazbot-theme') || 'dark';
  root.setAttribute('data-theme', saved);
  toggle.textContent = saved === 'dark' ? '☀' : '☾';

  toggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('nazbot-theme', next);
    toggle.textContent = next === 'dark' ? '☀' : '☾';

    // Refresh 3D colors if needed (optional)
    window.location.reload(); // Simplest way to re-init 3D with new theme context
  });
}


/* ══════════════════════════════════════════════════════════
   BANNER
   ══════════════════════════════════════════════════════════ */
function initBanner() {
  const banner = document.getElementById('availability-banner');
  const close = document.getElementById('banner-close');
  if (!banner) return;
  if (localStorage.getItem('nazbot-banner-dismissed')) {
    banner.style.display = 'none';
    return;
  }
  banner.style.display = 'flex';
  document.body.classList.add('banner-visible');
  close.addEventListener('click', () => {
    banner.style.transform = 'translateY(-100%)';
    setTimeout(() => { banner.style.display = 'none'; }, 300);
    document.body.classList.remove('banner-visible');
    localStorage.setItem('nazbot-banner-dismissed', 'true');
  });
}

/* ══════════════════════════════════════════════════════════
   CUSTOM CURSOR
   ══════════════════════════════════════════════════════════ */
function initCursor() {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor || window.matchMedia('(hover: none)').matches) {
    if (cursor) cursor.style.display = 'none';
    return;
  }
  let cx = -100, cy = -100;
  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
    cursor.style.opacity = '1';
  });
  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });

  function attachHover() {
    document.querySelectorAll('a, button, [role="button"], .service-card, .faq-item summary, input[type="range"], .tech-item, .testimonial, .pricing-card')
      .forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
      });
  }
  attachHover();
  document.addEventListener('nazbot:pagechange', () => setTimeout(attachHover, 50));
}

/* ══════════════════════════════════════════════════════════
   3D NEBULA BACKGROUND — Three.js
   ══════════════════════════════════════════════════════════ */
function init3DBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const isMobile = window.innerWidth < 768;

  /* ── Scene + Camera + Renderer ─────────────────────────── */
  const scene = new THREE.Scene();
  const W = window.innerWidth, H = window.innerHeight;
  const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 1400);
  camera.position.set(0, 0, 70);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !isMobile,
    powerPreference: 'high-performance'
  });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));
  renderer.setClearColor(0x000005, 0); /* transparent — body bg handles it */

  /* ── Nebula Color Palette ──────────────────────────────── */
  const C_OUTER = 0x2244ff;  /* electric blue  (sparse outer ring) */
  const C_MID = 0x7733ee;  /* violet         (mid nebula)        */
  const C_INNER = 0xff55ee;  /* pink/magenta   (hot core)          */
  const C_LINES = 0x5533bb;  /* violet-blue    (connecting lines)  */
  const C_WIRE = 0x9944ff;  /* bright violet  (wireframes)        */
  const C_WIRE2 = 0xff44cc;  /* hot pink       (accent wire)       */

  /* ── Wireframe helper ───────────────────────────────────── */
  function wireframe(geo, color, opacity) {
    return new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity })
    );
  }

  /* ══════════════════════════════════════════════════════
     PARTICLE LAYER 1 — Outer blue cloud (sparse, large r)
     ══════════════════════════════════════════════════════ */
  const PC1 = isMobile ? 280 : 700;
  const pos1 = new Float32Array(PC1 * 3);
  const vel1 = new Float32Array(PC1 * 3);
  for (let i = 0; i < PC1; i++) {
    const u = Math.random(), v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = 90 + Math.random() * 80;   /* r: 90–170 */
    pos1[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos1[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos1[i * 3 + 2] = r * Math.cos(phi) - 10;
    vel1[i * 3] = (Math.random() - 0.5) * 0.005;
    vel1[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
    vel1[i * 3 + 2] = (Math.random() - 0.5) * 0.004;
  }
  const geo1 = new THREE.BufferGeometry();
  const attr1 = new THREE.BufferAttribute(pos1, 3);
  attr1.setUsage(THREE.DynamicDrawUsage);
  geo1.setAttribute('position', attr1);
  const mat1 = new THREE.PointsMaterial({ color: C_OUTER, size: isMobile ? 0.7 : 0.5, sizeAttenuation: true, transparent: true, opacity: 0.55 });
  const cloud1 = new THREE.Points(geo1, mat1);
  scene.add(cloud1);

  /* ══════════════════════════════════════════════════════
     PARTICLE LAYER 2 — Mid violet nebula (medium density)
     ══════════════════════════════════════════════════════ */
  const PC2 = isMobile ? 450 : 1100;
  const pos2 = new Float32Array(PC2 * 3);
  const vel2 = new Float32Array(PC2 * 3);
  for (let i = 0; i < PC2; i++) {
    /* Gaussian-like: power law for denser core */
    const r = Math.pow(Math.random(), 1.8) * 80 + 10;  /* r: 10–90 skewed toward 10 */
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    pos2[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos2[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos2[i * 3 + 2] = r * Math.cos(phi) - 5;
    vel2[i * 3] = (Math.random() - 0.5) * 0.007;
    vel2[i * 3 + 1] = (Math.random() - 0.5) * 0.007;
    vel2[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
  }
  const geo2 = new THREE.BufferGeometry();
  const attr2 = new THREE.BufferAttribute(pos2, 3);
  attr2.setUsage(THREE.DynamicDrawUsage);
  geo2.setAttribute('position', attr2);
  const mat2 = new THREE.PointsMaterial({ color: C_MID, size: isMobile ? 0.6 : 0.45, sizeAttenuation: true, transparent: true, opacity: 0.72 });
  const cloud2 = new THREE.Points(geo2, mat2);
  scene.add(cloud2);

  /* ══════════════════════════════════════════════════════
     PARTICLE LAYER 3 — Inner pink/magenta hot core
     ══════════════════════════════════════════════════════ */
  const PC3 = isMobile ? 180 : 450;
  const pos3 = new Float32Array(PC3 * 3);
  const vel3 = new Float32Array(PC3 * 3);
  for (let i = 0; i < PC3; i++) {
    const r = Math.pow(Math.random(), 3) * 35;  /* very clustered near center */
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    pos3[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos3[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos3[i * 3 + 2] = r * Math.cos(phi);
    vel3[i * 3] = (Math.random() - 0.5) * 0.009;
    vel3[i * 3 + 1] = (Math.random() - 0.5) * 0.009;
    vel3[i * 3 + 2] = (Math.random() - 0.5) * 0.006;
  }
  const geo3 = new THREE.BufferGeometry();
  const attr3 = new THREE.BufferAttribute(pos3, 3);
  attr3.setUsage(THREE.DynamicDrawUsage);
  geo3.setAttribute('position', attr3);
  const mat3 = new THREE.PointsMaterial({ color: C_INNER, size: isMobile ? 0.55 : 0.38, sizeAttenuation: true, transparent: true, opacity: 0.85 });
  const cloud3 = new THREE.Points(geo3, mat3);
  scene.add(cloud3);

  /* ── Connecting lines (tendrils) — from mid-layer particles */
  const LINK_DIST = 16;
  const LINK_MAX = isMobile ? 200 : 500;
  const linePairs = [];
  for (let i = 0; i < Math.min(PC2, LINK_MAX); i++) {
    for (let j = i + 1; j < Math.min(PC2, LINK_MAX); j++) {
      const dx = pos2[i * 3] - pos2[j * 3];
      const dy = pos2[i * 3 + 1] - pos2[j * 3 + 1];
      const dz = pos2[i * 3 + 2] - pos2[j * 3 + 2];
      if (dx * dx + dy * dy + dz * dz < LINK_DIST * LINK_DIST) {
        linePairs.push(i, j);
      }
    }
  }
  if (linePairs.length > 0) {
    const lineArr = new Float32Array(linePairs.length * 3);
    for (let k = 0; k < linePairs.length; k += 2) {
      const a = linePairs[k], b = linePairs[k + 1];
      lineArr[(k / 2) * 6 + 0] = pos2[a * 3]; lineArr[(k / 2) * 6 + 1] = pos2[a * 3 + 1]; lineArr[(k / 2) * 6 + 2] = pos2[a * 3 + 2];
      lineArr[(k / 2) * 6 + 3] = pos2[b * 3]; lineArr[(k / 2) * 6 + 4] = pos2[b * 3 + 1]; lineArr[(k / 2) * 6 + 5] = pos2[b * 3 + 2];
    }
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.BufferAttribute(lineArr, 3));
    scene.add(new THREE.LineSegments(lGeo, new THREE.LineBasicMaterial({ color: C_LINES, transparent: true, opacity: 0.18 })));
  }

  /* ══════════════════════════════════════════════════════
     CENTRAL ICOSAHEDRON  (violet, pulsing focal)
     ══════════════════════════════════════════════════════ */
  const ico = wireframe(new THREE.IcosahedronGeometry(24, 1), C_WIRE, 0.35);
  ico.rotation.x = 0.4;
  scene.add(ico);

  const icoInner = wireframe(new THREE.IcosahedronGeometry(15, 1), C_WIRE2, 0.22);
  icoInner.rotation.x = -0.3;
  icoInner.rotation.z = 0.5;
  scene.add(icoInner);

  /* ── Torus Knot (pink accent) ───────────────────────────── */
  const torusKnot = wireframe(new THREE.TorusKnotGeometry(12, 3.2, 90, 14), C_WIRE2, 0.2);
  torusKnot.position.set(52, 12, -28);
  scene.add(torusKnot);

  /* ── Octahedron (violet, left) ──────────────────────────── */
  const octa = wireframe(new THREE.OctahedronGeometry(15, 0), C_WIRE, 0.22);
  octa.position.set(-50, -20, -16);
  scene.add(octa);

  /* ── Floating small shapes ──────────────────────────────── */
  const floaters = [
    { geo: new THREE.IcosahedronGeometry(7, 0), pos: [32, -34, -48], col: C_WIRE, op: 0.28, spd: [0.009, 0.013, 0.006] },
    { geo: new THREE.OctahedronGeometry(6, 0), pos: [-34, 28, -35], col: C_WIRE2, op: 0.3, spd: [0.011, 0.007, 0.010] },
    { geo: new THREE.TetrahedronGeometry(8), pos: [22, 36, -55], col: C_WIRE, op: 0.25, spd: [0.007, 0.012, 0.009] },
    { geo: new THREE.IcosahedronGeometry(5, 0), pos: [-22, -36, -65], col: C_WIRE2, op: 0.28, spd: [0.013, 0.009, 0.008] },
    { geo: new THREE.OctahedronGeometry(9, 0), pos: [-60, 10, -40], col: C_WIRE, op: 0.2, spd: [0.006, 0.010, 0.011] },
    { geo: new THREE.TetrahedronGeometry(5), pos: [60, -15, -50], col: C_WIRE2, op: 0.25, spd: [0.010, 0.006, 0.012] },
  ];
  const floaterMeshes = floaters.map(f => {
    const m = wireframe(f.geo, f.col, f.op);
    m.position.set(...f.pos);
    m.userData.spd = f.spd;
    scene.add(m);
    return m;
  });

  /* ── Orbit ring ─────────────────────────────────────────── */
  const orbitGroup = new THREE.Group();
  const ORBIT_N = 16, ORBIT_R = 42;
  for (let i = 0; i < ORBIT_N; i++) {
    const a = (i / ORBIT_N) * Math.PI * 2;
    const sp = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 6, 6),
      new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? C_WIRE : C_WIRE2, transparent: true, opacity: 0.55 })
    );
    sp.position.set(
      Math.cos(a) * ORBIT_R,
      Math.sin(a) * ORBIT_R * 0.26,
      Math.sin(a) * ORBIT_R * 0.72
    );
    orbitGroup.add(sp);
  }
  scene.add(orbitGroup);

  /* ── Background grid (deep violet tint) ─────────────────── */
  const grid = new THREE.GridHelper(280, 24, 0x220055, 0x110033);
  grid.position.set(0, -58, -40);
  grid.rotation.x = 0.22;
  grid.material.transparent = true;
  grid.material.opacity = 0.4;
  scene.add(grid);

  /* ── Mouse parallax ─────────────────────────────────────── */
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* ── Scroll depth ───────────────────────────────────────── */
  let scrollDepth = 0;
  window.addEventListener('scroll', () => { scrollDepth = window.scrollY * 0.02; }, { passive: true });

  /* ── Resize ─────────────────────────────────────────────── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ── Animation loop ─────────────────────────────────────── */
  let frame = 0;
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    frame++;
    const t = clock.getElapsedTime();

    /* Camera — smooth lerp to warp target */
    const camTX = mx * 9;
    const camTY = -my * 6;
    camera.position.x += (camTX - camera.position.x) * 0.035;
    camera.position.y += (camTY - camera.position.y) * 0.035;
    camera.position.z += (cameraTargetZ + scrollDepth - camera.position.z) * 0.06;
    camera.lookAt(0, 0, 0);

    /* Scene auto-drift */
    scene.rotation.y = Math.sin(t * 0.045) * 0.08;
    scene.rotation.x = Math.sin(t * 0.035) * 0.04;

    /* Central geometries */
    ico.rotation.x += 0.0016;
    ico.rotation.y += 0.0012;
    ico.rotation.z = Math.sin(t * 0.28) * 0.14;
    icoInner.rotation.x -= 0.002;
    icoInner.rotation.y += 0.0016;
    icoInner.rotation.z -= 0.001;

    /* Pulsing scale — nebula breathe */
    const pulse = 1 + Math.sin(t * 1.0) * 0.03;
    ico.scale.setScalar(pulse);

    /* Core pink inner glow pulse via scale */
    const corePulse = 1 + Math.sin(t * 1.8 + 1.2) * 0.06;
    icoInner.scale.setScalar(corePulse);

    /* Torus knot + octahedron */
    torusKnot.rotation.x += 0.004;
    torusKnot.rotation.y += 0.003;
    octa.rotation.x += 0.002;
    octa.rotation.z += 0.003;

    /* Floaters */
    floaterMeshes.forEach(m => {
      m.rotation.x += m.userData.spd[0];
      m.rotation.y += m.userData.spd[1];
      m.rotation.z += m.userData.spd[2];
    });

    /* Orbit ring */
    orbitGroup.rotation.y += 0.0035;
    orbitGroup.rotation.x += 0.001;

    /* Grid gentle float */
    grid.position.y = -58 + Math.sin(t * 0.35) * 1.5;

    /* Particle drift — staggered frames for perf */
    if (frame % 2 === 0) {
      const updateLayer = (pos, vel, PC, bound) => {
        for (let i = 0; i < PC; i++) {
          pos[i * 3] += vel[i * 3];
          pos[i * 3 + 1] += vel[i * 3 + 1];
          pos[i * 3 + 2] += vel[i * 3 + 2];
          const dx = pos[i * 3], dy = pos[i * 3 + 1], dz = pos[i * 3 + 2];
          if (dx * dx + dy * dy + dz * dz > bound * bound) {
            vel[i * 3] *= -0.6; vel[i * 3 + 1] *= -0.6; vel[i * 3 + 2] *= -0.6;
          }
        }
      };
      if (frame % 4 === 0) {
        updateLayer(pos1, vel1, PC1, 200);
        geo1.attributes.position.needsUpdate = true;
      }
      updateLayer(pos2, vel2, PC2, 120);
      geo2.attributes.position.needsUpdate = true;
      updateLayer(pos3, vel3, PC3, 50);
      geo3.attributes.position.needsUpdate = true;
    }

    /* Mouse repulsion on inner hot-core particles */
    if (frame % 3 === 0 && (mx !== 0 || my !== 0)) {
      const wpx = mx * 60, wpy = -my * 45;
      const REPEL = 18, FORCE = 0.01;
      for (let i = 0; i < Math.min(PC3, 300); i++) {
        const dx = pos3[i * 3] - wpx;
        const dy = pos3[i * 3 + 1] - wpy;
        const d2 = dx * dx + dy * dy;
        if (d2 < REPEL * REPEL && d2 > 0) {
          const inv = FORCE / Math.sqrt(d2);
          vel3[i * 3] += dx * inv;
          vel3[i * 3 + 1] += dy * inv;
        }
      }
    }

    renderer.render(scene, camera);
  }

  animate();
}

/* ══════════════════════════════════════════════════════════
   WARP TRANSITION
   ══════════════════════════════════════════════════════════ */
function warpTo(callback) {
  if (typeof gsap === 'undefined') { callback(); return; }

  const overlay = document.getElementById('warp-overlay');
  const content = document.getElementById('main-content');

  const tl = gsap.timeline();

  /* Phase 1 — dive INTO nebula */
  tl.to(overlay, {
    opacity: 1, duration: 0.32, ease: 'power2.in',
    onStart: () => { cameraTargetZ = 4; }
  })
    .to(content, { scale: 0.96, opacity: 0.4, duration: 0.28, ease: 'power2.in' }, '<')

    /* Phase 2 — at peak warp: switch page */
    .call(() => {
      callback();
      cameraTargetZ = 70;
    })

    /* Phase 3 — emerge from nebula */
    .to(overlay, { opacity: 0, duration: 0.45, ease: 'power2.out' })
    .to(content, { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' }, '<0.05');

  return tl;
}

/* ══════════════════════════════════════════════════════════
   SPA ROUTER
   ══════════════════════════════════════════════════════════ */
function initRouter() {
  const pages = {
    'home': document.getElementById('page-home'),
    'automatizacion': document.getElementById('page-automatizacion'),
    'web3d': document.getElementById('page-web3d'),
    'ia-media': document.getElementById('page-ia-media'),
  };
  const navLinks = document.querySelectorAll('[data-page]');

  function getPageFromHash() {
    const hash = location.hash.replace('#', '') || 'home';
    return pages[hash] ? hash : 'home';
  }

  function showPage(pageName, animate = true) {
    const target = pages[pageName];
    if (!target) return;

    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('data-page') === pageName);
    });

    const doSwitch = () => {
      Object.values(pages).forEach(p => p && p.classList.remove('active'));
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Give the browser a moment to update display:block before triggerReveal
      setTimeout(() => {
        triggerReveal();
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh(true);
      }, 50);

      document.dispatchEvent(new CustomEvent('nazbot:pagechange'));
      if (pageName === 'automatizacion') initROICalculator();
    };

    if (animate) {
      warpTo(doSwitch);
    } else {
      doSwitch();
    }
  }

  /* Click delegation — all [data-page] elements */
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-page]');
    if (!el) return;
    const pg = el.getAttribute('data-page');
    if (!pages[pg]) return;
    e.preventDefault();
    history.pushState({ page: pg }, '', '#' + (pg === 'home' ? '' : pg));
    showPage(pg);
  });

  /* Back/forward browser navigation */
  window.addEventListener('popstate', () => showPage(getPageFromHash(), true));

  /* Smooth scroll to footer */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href="#contacto"]');
    if (!a) return;
    e.preventDefault();
    const footer = document.getElementById('contacto');
    if (footer) footer.scrollIntoView({ behavior: 'smooth' });
  });

  showPage(getPageFromHash(), false);
}

/* ══════════════════════════════════════════════════════════
   SCROLL REVEAL — GSAP
   ══════════════════════════════════════════════════════════ */
function initScrollReveal() {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }
}

function triggerReveal() {
  const activePage = document.querySelector('.page.active');
  if (!activePage) return;

  if (typeof gsap === 'undefined') {
    document.querySelectorAll('.gsap-reveal').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
    return;
  }

  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.getAll().forEach(t => t.kill());
  }

  /* Group siblings for stagger — ONLY IN ACTIVE PAGE */
  const groups = new Map();
  activePage.querySelectorAll('.gsap-reveal').forEach(el => {
    const key = el.parentElement;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(el);
  });

  groups.forEach(group => {
    gsap.fromTo(group,
      { opacity: 0, y: 32 },
      {
        opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.1,
        scrollTrigger: {
          trigger: group[0],
          start: 'top 88%',
          toggleActions: 'play none none none',
        }
      }
    );
  });

  /* Reveal anything already in view immediately */
  activePage.querySelectorAll('.gsap-reveal').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9 && rect.top > -rect.height) {
      gsap.to(el, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    }
  });
}

/* ══════════════════════════════════════════════════════════
   STICKY CTA
   ══════════════════════════════════════════════════════════ */
function initStickyCTA() {
  const cta = document.getElementById('sticky-cta');
  if (!cta) return;
  let lastY = 0, ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        cta.classList.toggle('visible', y > lastY && y > 500);
        lastY = y;
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ══════════════════════════════════════════════════════════
   FOOTER YEAR
   ══════════════════════════════════════════════════════════ */
function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ══════════════════════════════════════════════════════════
   ROI CALCULATOR
   ══════════════════════════════════════════════════════════ */
function initROICalculator() {
  const hoursEl = document.getElementById('roi-hours');
  const rateEl = document.getElementById('roi-rate');
  const hcEl = document.getElementById('roi-headcount');
  if (!hoursEl || !rateEl || !hcEl) return;

  function calc() {
    const h = +hoursEl.value, r = +rateEl.value, p = +hcEl.value;
    const monthly = Math.round(h * 4.3 * r * p);
    const ratio = Math.round(monthly * 12 / 497);
    const hv = document.getElementById('hours-val');
    const rv = document.getElementById('rate-val');
    const cv = document.getElementById('hc-val');
    if (hv) hv.textContent = h;
    if (rv) rv.textContent = r;
    if (cv) cv.textContent = p;
    const mEl = document.getElementById('roi-monthly');
    const rEl = document.getElementById('roi-ratio');
    if (mEl) mEl.textContent = monthly.toLocaleString('es-ES') + '€';
    if (rEl) rEl.textContent = ratio + '×';
  }

  [hoursEl, rateEl, hcEl].forEach(el => el.addEventListener('input', calc));
  calc();
}


/* ══════════════════════════════════════════════════════════
   CHATBOT (NAZBOT)
   ══════════════════════════════════════════════════════════ */
function initChatbot() {
  const container = document.getElementById('chatbot-container');
  const toggle = document.getElementById('chatbot-toggle');
  const windowEl = document.getElementById('chatbot-window');
  const closeBtn = document.getElementById('chat-close');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const messagesArea = document.getElementById('chat-messages');
  const suggestionBtns = document.querySelectorAll('.suggestion');

  if (!container) return;

  let chatHistory = [];

  // Toggle window
  toggle.addEventListener('click', () => windowEl.classList.toggle('active'));
  closeBtn.addEventListener('click', () => windowEl.classList.remove('active'));

  // Handle Suggestions
  suggestionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.textContent;
      sendMessage(text);
    });
  });

  // Handle Input
  sendBtn.addEventListener('click', () => {
    if (input.value.trim()) sendMessage(input.value.trim());
  });

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && input.value.trim()) sendMessage(input.value.trim());
  });

  async function sendMessage(text) {
    // Add user message to UI
    appendMessage('user', text);
    input.value = '';

    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing';
    typingIndicator.textContent = 'NAZBOT está pensando...';
    messagesArea.appendChild(typingIndicator);
    scrollToBottom();

    // Prepare history for API
    chatHistory.push({ role: 'user', content: text });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory })
      });

      const data = await response.json();
      messagesArea.removeChild(typingIndicator);

      if (data.choices && data.choices[0]) {
        const botText = data.choices[0].message.content;
        appendMessage('bot', botText);
        chatHistory.push({ role: 'assistant', content: botText });
      } else {
        appendMessage('bot', 'Lo siento, ha habido un error galáctico. Inténtalo de nuevo en unos segundos.');
      }
    } catch (err) {
      if (typingIndicator.parentNode) messagesArea.removeChild(typingIndicator);
      appendMessage('bot', 'No puedo conectar con el servidor central ahora mismo. Revisa tu conexión.');
    }
  }

  function appendMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = `message ${role}`;
    msg.innerHTML = text.replace(/\n/g, '<br>');
    messagesArea.appendChild(msg);
    scrollToBottom();

    // If bot message and contains specific triggers, suggest leaving contact
    if (role === 'bot' && (text.toLowerCase().includes('email') || text.toLowerCase().includes('teléfono') || text.toLowerCase().includes('contacto'))) {
      // Proactive contact tip
      const tip = document.createElement('div');
      tip.className = 'typing';
      tip.style.color = 'var(--nebula-hot)';
      tip.textContent = 'Tip: Puedes escribir tu email directamente aquí.';
      messagesArea.appendChild(tip);
      scrollToBottom();
    }
  }

  function scrollToBottom() {
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }
}
