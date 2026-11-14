// Shared motion layer for every page. The 3D scene (Three.js) is loaded only
// when the page has a .hero-stage (the home), via dynamic import.
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine)").matches;
document.documentElement.classList.add("js");

/* ---------------- inner pages: tag elements for the one-way reveals ---------------- */
if (!document.querySelector(".hero-stage")) {
  const tag = (sel, attr) => document.querySelectorAll(sel).forEach((el) => { if (!el.closest("[data-split],[data-reveal]")) el.setAttribute(attr, ""); });
  tag("main h1, main h2", "data-split");
  tag(".page-hero p:not(.eyebrow)", "data-reveal");
  tag("main .eyebrow, .project-intro > div, .meta-list, .g-row, .split-copy > p, .split-copy .stats, .method, .filters, .form .field, .form .btn, .contact-side, .next-project, .portrait", "data-reveal");
  document.querySelectorAll(".catalog .card").forEach((el) => el.setAttribute("data-cursor", ""));
  document.querySelectorAll(".project-cover").forEach((el) => el.classList.add("reveal-card"));
}

/* ---------------- top bar: menu + current section ---------------- */
const nav = document.querySelector(".topbar");
const toggle = nav.querySelector(".nav-toggle");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(open));
});
const links = [...nav.querySelectorAll(".nav-links a")];
const sections = links.filter((a) => a.getAttribute("href").startsWith("#")).map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
const sectionSpy = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
sections.forEach((s) => sectionSpy.observe(s));

/* ---------------- smooth scroll ---------------- */
let lenis = null;
if (!reduce && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 1 });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const el = document.querySelector(a.getAttribute("href"));
      if (el) { e.preventDefault(); nav.classList.remove("is-open"); lenis.scrollTo(el.id === "top" || el.id === "inicio" ? 0 : el, { offset: -90 }); }
    })
  );
}

/* ---------------- split text into words ---------------- */
document.querySelectorAll("[data-split]").forEach((el) => {
  let i = 0;
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(" "); return; }
          const w = document.createElement("span"); w.className = "w";
          const s = document.createElement("span"); s.textContent = part; s.style.setProperty("--i", i++);
          w.append(s); frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) {
        // wrap inline elements (e.g. the coral dot) as a single word
        const w = document.createElement("span"); w.className = "w";
        const s = document.createElement("span"); s.style.setProperty("--i", i++);
        n.replaceWith(w); s.append(n); w.append(s);
      }
    });
  };
  walk(el);
});

/* ---------------- one-way reveals: trigger once, never reverse ---------------- */
const once = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-in");
    once.unobserve(e.target); // stays revealed when scrolling back up
    if (e.target.querySelector("[data-count]")) countUp(e.target.querySelector("[data-count]"));
  });
}, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

document.querySelectorAll("[data-split], [data-reveal], .reveal-card, .card").forEach((el) => once.observe(el));
// stagger siblings that reveal together
document.querySelectorAll(".service-rows li, .stats > div").forEach((el, i, all) => el.style.setProperty("--d", `${(i % 6) * 70}ms`));
document.querySelectorAll(".work-grid .card").forEach((el, i) => el.style.transitionDelay = `${(i % 2) * 90}ms`);

function countUp(el) {
  const to = +el.dataset.count, suf = el.dataset.suffix || "";
  if (reduce) { el.textContent = to + suf; return; }
  const t0 = performance.now(), dur = 1400;
  const step = (t) => {
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
    el.textContent = Math.round(to * e) + (k === 1 ? suf : "");
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------------- cursor + magnetic button ---------------- */
if (finePointer && !reduce) {
  const c = document.querySelector(".cursor");
  let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
  addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; });
  const loop = () => { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; c.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(loop); };
  loop();
  document.querySelectorAll("[data-cursor]").forEach((el) => {
    el.addEventListener("pointerenter", () => c.classList.add("is-big"));
    el.addEventListener("pointerleave", () => c.classList.remove("is-big"));
  });
  document.querySelectorAll(".hero-stage").forEach((el) => {
    el.addEventListener("pointerenter", () => c.classList.add("is-hidden"));
    el.addEventListener("pointerleave", () => c.classList.remove("is-hidden"));
  });
  document.querySelectorAll("[data-magnetic]").forEach((b) => {
    const inner = b.querySelector("span");
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      b.style.transform = `translate(${dx * 0.3}px, ${dy * 0.3}px)`; inner.style.transform = `translate(${dx * 0.15}px, ${dy * 0.15}px)`;
    });
    b.addEventListener("pointerleave", () => { b.style.transform = ""; inner.style.transform = ""; });
  });
}

/* ---------------- 3D stage ---------------- */
const stage = document.querySelector(".hero-stage");

async function initStage() {
  if (!stage) return;
  const canvas = stage.querySelector("canvas");
  let THREE, RoundedBoxGeometry, RoomEnvironment;
  try {
    THREE = await import("three");
    ({ RoundedBoxGeometry } = await import("three/addons/geometries/RoundedBoxGeometry.js"));
    ({ RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js"));
  } catch (e) { return; }
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) { return; } // no WebGL: the dark card stays as a clean backdrop
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  // Neutral tone mapping keeps brand colors true (ACES washed the coral into pink)
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 26);

  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(6, 10, 8); scene.add(key);
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));

  const mats = {
    coral: new THREE.MeshPhysicalMaterial({ color: 0xff5352, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.3, envMapIntensity: 0.55 }),
    ivory: new THREE.MeshPhysicalMaterial({ color: 0xf4edd8, roughness: 0.45, clearcoat: 0.6 }),
    graphite: new THREE.MeshPhysicalMaterial({ color: 0x3b3935, roughness: 0.28, metalness: 0.15, clearcoat: 1 }),
    sand: new THREE.MeshPhysicalMaterial({ color: 0xe8dfc2, roughness: 0.55 }),
  };
  const geos = {
    cube: new RoundedBoxGeometry(1.7, 1.7, 1.7, 5, 0.36),
    sphere: new THREE.SphereGeometry(0.95, 48, 32),
    slab: new RoundedBoxGeometry(2.6, 1.0, 1.0, 5, 0.36),
  };

  const small = innerWidth < 860;
  const N = small ? 20 : 34;
  const palette = ["coral", "coral", "ivory", "ivory", "graphite", "graphite", "graphite", "sand"];
  const shapes = ["cube", "cube", "sphere", "sphere", "slab"];
  const bodies = [];
  const spread = small ? { x: 4.2, y: 6, z: 2.5 } : { x: 9.5, y: 4.6, z: 3 };

  for (let i = 0; i < N; i++) {
    const shape = shapes[i % shapes.length];
    const mesh = new THREE.Mesh(geos[shape], mats[palette[(i * 5) % palette.length]]);
    const s = 0.75 + Math.random() * 0.75;
    mesh.scale.setScalar(s);
    const home = new THREE.Vector3(
      (Math.random() * 2 - 1) * spread.x + (small ? 0 : 2.2),
      (Math.random() * 2 - 1) * spread.y,
      (Math.random() * 2 - 1) * spread.z
    );
    // entrance: rise from below the card, once
    mesh.position.set(home.x, home.y - 16 - Math.random() * 10, home.z);
    mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    scene.add(mesh);
    bodies.push({
      mesh, home, r: (shape === "slab" ? 1.25 : 1.0) * s,
      v: new THREE.Vector3(), w: new THREE.Vector3((Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01),
      phase: Math.random() * Math.PI * 2,
    });
  }

  // pointer → point on z=0 plane
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(9, 9), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const mouse = new THREE.Vector3(999, 999, 0), mousePrev = new THREE.Vector3(999, 999, 0);
  let pointerIn = false;
  stage.addEventListener("pointermove", (e) => {
    const r = stage.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    pointerIn = true;
  });
  stage.addEventListener("pointerleave", () => { pointerIn = false; });
  stage.addEventListener("click", () => { // burst outward
    bodies.forEach((b) => b.v.add(b.mesh.position.clone().sub(mouse).setZ(0).normalize().multiplyScalar(0.55)));
  });

  const resize = () => {
    const { width, height } = stage.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = width < 700 ? 30 : 26;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(stage);
  resize();

  let visible = true, running = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(stage);
  document.addEventListener("visibilitychange", () => { running = !document.hidden; });

  const tmp = new THREE.Vector3(), clock = new THREE.Clock();
  const tick = () => {
    requestAnimationFrame(tick);
    if (!visible || !running) { clock.getDelta(); return; }
    const dt = Math.min(clock.getDelta(), 1 / 30) * 60; // normalize to 60fps steps
    const t = clock.elapsedTime;

    if (pointerIn) {
      ray.setFromCamera(ndc, camera);
      mousePrev.copy(mouse);
      ray.ray.intersectPlane(plane, mouse);
    } else mouse.set(999, 999, 0);
    const mouseSpeed = Math.min(mouse.distanceTo(mousePrev), 2);

    for (const b of bodies) {
      const p = b.mesh.position;
      // spring home + gentle float
      tmp.copy(b.home); tmp.y += Math.sin(t * 0.6 + b.phase) * 0.35;
      b.v.addScaledVector(tmp.sub(p), 0.0065 * dt);
      // mouse repulsion
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy, R = 3.4 + b.r;
      if (d2 < R * R) {
        const d = Math.sqrt(d2) || 0.001, f = (1 - d / R) * (0.09 + mouseSpeed * 0.12) * dt;
        b.v.x += (dx / d) * f; b.v.y += (dy / d) * f; b.v.z += (Math.random() - 0.5) * f * 0.6;
        b.w.x += dy * f * 0.02; b.w.y -= dx * f * 0.02;
      }
    }
    // soft collisions
    for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i], c = bodies[j];
      tmp.subVectors(a.mesh.position, c.mesh.position);
      const min = a.r + c.r, d = tmp.length();
      if (d < min && d > 0.0001) {
        tmp.multiplyScalar(((min - d) / d) * 0.12 * dt);
        a.v.add(tmp); c.v.sub(tmp);
      }
    }
    for (const b of bodies) {
      b.v.multiplyScalar(Math.pow(0.9, dt));
      b.mesh.position.addScaledVector(b.v, dt);
      b.w.multiplyScalar(Math.pow(0.97, dt));
      b.mesh.rotation.x += (b.w.x + 0.0016) * dt;
      b.mesh.rotation.y += (b.w.y + 0.0022) * dt;
      b.mesh.rotation.z += b.w.z * dt;
    }
    renderer.render(scene, camera);
  };

  if (reduce) {
    bodies.forEach((b) => b.mesh.position.copy(b.home));
    const still = () => renderer.render(scene, camera);
    still(); new ResizeObserver(still).observe(stage);
  } else tick();
}
initStage();
