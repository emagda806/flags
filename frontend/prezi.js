/**
 * Mapa Prezi: klastry rozproszone po przestrzeni, flagi wypełniające dyski.
 */

const FLAG_W = 36;
const FLAG_H = 24;
/** Mnożnik zoomu przy starcie / „Cały widok” (flagi 64×64 — mniejsze kafelki = ostrzej przy zbliżeniu) */
const START_ZOOM_BOOST = 1.45;
const START_ZOOM_BOOST_MOBILE = 1.95;

class PreziExplorer {
  constructor({
    viewport,
    world,
    flagsData,
    metadata,
    onFlagClick,
    onTooltipShow,
    onTooltipHide,
    onTooltipMove,
  }) {
    this.viewport = viewport;
    this.world = world;
    this.flagsData = flagsData;
    this.metadata = metadata;
    this.onFlagClick = onFlagClick;
    this.onTooltipShow = onTooltipShow;
    this.onTooltipHide = onTooltipHide;
    this.onTooltipMove = onTooltipMove;
    this.countryName = (code, fallback = "") =>
      (window.__countryName ? window.__countryName(code, fallback) : (fallback || code));

    this.SCENE = { w: 4800, h: 4800 };
    this.CLUSTER_COMPRESS = 0.55;
    this.CLUSTER_GAP = 56;

    this.cam = { x: 0, y: 0, scale: 0.18 };
    this.camTarget = { x: 0, y: 0, scale: 0.18 };
    this.drag = null;
    this.clusters = [];
    this.flags = [];
    this.tooltipTimer = null;
    this.raf = null;
    this.bounds = { minX: 0, minY: 0, maxX: 4800, maxY: 4800 };

    this._bindEvents();
    this._startLoop();
  }

  flagUrl(code) {
    return `https://flagcdn.com/w160/${code.toLowerCase()}.png`;
  }

  /** Promień dysku zależny od liczby flag — wypełnienie, nie obwód */
  diskRadius(flagCount) {
    const perFlag = (FLAG_W + 4) * (FLAG_H + 4);
    const area = (flagCount * perFlag) / 0.5;
    return Math.max(110, Math.min(420, Math.sqrt(area / Math.PI)));
  }

  /** Pozycje klastrów z UMAP + rozdzielenie dysków bez nakładania */
  layoutClusterCenters(byCluster) {
    const entries = [...byCluster.entries()].sort((a, b) => a[0] - b[0]);
    const raw = entries.map(([cid, flags]) => {
      const xs = flags.map((f) => f.embedding_2d[0]);
      const ys = flags.map((f) => f.embedding_2d[1]);
      return {
        id: cid,
        flags,
        radius: this.diskRadius(flags.length),
        ux: xs.reduce((a, b) => a + b, 0) / xs.length,
        uy: ys.reduce((a, b) => a + b, 0) / ys.length,
      };
    });

    const uxs = raw.map((r) => r.ux);
    const uys = raw.map((r) => r.uy);
    const minUx = Math.min(...uxs);
    const maxUx = Math.max(...uxs);
    const minUy = Math.min(...uys);
    const maxUy = Math.max(...uys);
    const spanUx = maxUx - minUx || 1;
    const spanUy = maxUy - minUy || 1;

    const cx = this.SCENE.w / 2;
    const cy = this.SCENE.h / 2;
    const spread = this.SCENE.w * this.CLUSTER_COMPRESS;

    const nodes = raw.map((r) => {
      const nx = (r.ux - minUx) / spanUx;
      const ny = (r.uy - minUy) / spanUy;
      return {
        id: r.id,
        flags: r.flags,
        radius: r.radius,
        x: cx + (nx - 0.5) * spread,
        y: cy + (ny - 0.5) * spread,
      };
    });

    this._separateClusters(nodes);

    const positions = new Map();
    nodes.forEach((n) => positions.set(n.id, { x: n.x, y: n.y, radius: n.radius, flags: n.flags }));
    return positions;
  }

  /** Odsuwa nakładające się dyski klastrów */
  _separateClusters(nodes) {
    const gap = this.CLUSTER_GAP;
    for (let iter = 0; iter < 160; iter++) {
      let moved = false;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let dist = Math.hypot(dx, dy);
          if (dist < 1e-4) {
            const angle = (i + j) * 0.9;
            dx = Math.cos(angle);
            dy = Math.sin(angle);
            dist = 1;
          }
          const minDist = a.radius + b.radius + gap;
          if (dist < minDist) {
            const push = (minDist - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;
            a.x -= nx * push;
            a.y -= ny * push;
            b.x += nx * push;
            b.y += ny * push;
            moved = true;
          }
        }
      }
      if (!moved) break;
    }
  }

  /** Flagi wypełniające dysk — spiralny rozkład od środka */
  layoutFlagsInDisk(cx, cy, flags, clusterId, radius) {
    const golden = Math.PI * (3 - Math.sqrt(5));
    const n = flags.length;
    return flags.map((flag, i) => {
      const t = (i + 0.5) / n;
      const r = radius * Math.sqrt(t) * 0.9;
      const angle = i * golden + clusterId * 0.61;
      const rot = (Math.sin(i * 2.3 + clusterId) * 12).toFixed(1);
      return {
        flag,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        rot,
        delay: i * 0.018,
      };
    });
  }

  build() {
    const byCluster = new Map();
    this.flagsData.forEach((f) => {
      if (!byCluster.has(f.cluster)) byCluster.set(f.cluster, []);
      byCluster.get(f.cluster).push(f);
    });

    const clusterIds = [...byCluster.keys()].sort((a, b) => a - b);
    const centers = this.layoutClusterCenters(byCluster);

    this.world.innerHTML = "";
    this.world.style.width = `${this.SCENE.w}px`;
    this.world.style.height = `${this.SCENE.h}px`;

    this.clusters = [];
    this.flags = [];

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    clusterIds.forEach((cid) => {
      const slot = centers.get(cid);
      const flags = slot.flags;
      const color = flags[0]?.cluster_color || this.metadata.cluster_colors?.[cid] || "#8a7b68";
      const cx = slot.x;
      const cy = slot.y;
      const radius = slot.radius;
      const pad = radius + 40;

      minX = Math.min(minX, cx - pad);
      minY = Math.min(minY, cy - pad);
      maxX = Math.max(maxX, cx + pad);
      maxY = Math.max(maxY, cy + pad);

      const system = document.createElement("div");
      system.className = "cluster-blob";
      system.style.left = `${cx}px`;
      system.style.top = `${cy}px`;
      system.style.setProperty("--blob-r", `${radius}px`);
      system.style.setProperty("--blob-color", color);
      system.dataset.cluster = cid;

      const bg = document.createElement("div");
      bg.className = "cluster-blob-bg";
      bg.addEventListener("click", (e) => {
        e.stopPropagation();
        this.flyTo(cx, cy, 0.7, 600);
      });
      system.appendChild(bg);

      const layouts = this.layoutFlagsInDisk(cx, cy, flags, cid, radius);
      layouts.forEach(({ flag, x, y, rot, delay }) => {
        minX = Math.min(minX, x - 28);
        minY = Math.min(minY, y - 20);
        maxX = Math.max(maxX, x + 28);
        maxY = Math.max(maxY, y + 20);

        const el = document.createElement("div");
        el.className = "cluster-flag";
        el.style.setProperty("--fx", `${x - cx}px`);
        el.style.setProperty("--fy", `${y - cy}px`);
        el.style.setProperty("--rot", `${rot}deg`);
        el.style.setProperty("--delay", `${delay}s`);

        const img = document.createElement("img");
        img.src = this.flagUrl(flag.code);
        img.alt = "";
        img.width = FLAG_W;
        img.height = FLAG_H;
        img.draggable = false;
        img.loading = "lazy";
        el.appendChild(img);

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          this.flyTo(x, y, 1.6, 600);
          this.onFlagClick?.(flag);
        });
        el.addEventListener("mouseenter", (e) => this._showFlagTooltip(e, this.countryName(flag.code, flag.country)));
        el.addEventListener("mousemove", (e) => this.onTooltipMove?.(e));
        el.addEventListener("mouseleave", () => this._hideFlagTooltip());

        system.appendChild(el);
        this.flags.push({ flag, x, y, el });
      });

      this.clusters.push({ id: cid, x: cx, y: cy, radius, color });
      this.world.appendChild(system);

      requestAnimationFrame(() => {
        system.querySelectorAll(".cluster-flag").forEach((f) => f.classList.add("settled"));
      });
    });

    this.bounds = { minX, minY, maxX, maxY };
    // Pokaż cały widok natychmiast, potem przylatuj do największego klastra
    this._fitToFlags(0);
    setTimeout(() => this._flyToBiggestCluster(), 420);
  }

  /** Płynnie leci do klastra z największą liczbą flag */
  _flyToBiggestCluster() {
    if (!this.clusters.length) return;
    const top = this.clusters.reduce((a, b) => a.radius > b.radius ? a : b);
    const rect = this.viewport.getBoundingClientRect();
    if (rect.width < 10) return;
    // Klaster ma zajmować ~70% mniejszego wymiaru viewportu
    const viewMin = Math.min(rect.width, rect.height);
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const targetFill = mobile ? 0.9 : 0.7;
    const scale = Math.min(2, Math.max(0.45, (viewMin * targetFill) / (top.radius * 2)));
    this.flyTo(top.x, top.y, scale, 950);
  }

  /** Ustawia kamerę tak, by wszystkie flagi były widoczne */
  _fitToFlags(duration = 0) {
    const run = () => {
      const rect = this.viewport.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) return;

      const pad = 40;
      const bw = this.bounds.maxX - this.bounds.minX || 1;
      const bh = this.bounds.maxY - this.bounds.minY || 1;
      const fit = Math.min((rect.width - pad * 2) / bw, (rect.height - pad * 2) / bh);
      const mobile = window.matchMedia("(max-width: 768px)").matches;
      const boost = mobile ? START_ZOOM_BOOST_MOBILE : START_ZOOM_BOOST;
      const scale = Math.min(2, Math.max(0.08, fit * boost));
      const cx = (this.bounds.minX + this.bounds.maxX) / 2;
      const cy = (this.bounds.minY + this.bounds.maxY) / 2;

      if (duration > 0) {
        this.flyTo(cx, cy, scale, duration);
      } else {
        this.cam.scale = scale;
        this.cam.x = rect.width / 2 - cx * scale;
        this.cam.y = rect.height / 2 - cy * scale;
        this.camTarget = { ...this.cam };
        this._applyTransform();
      }
    };

    run();
    requestAnimationFrame(run);
    setTimeout(run, 80);
  }

  _showFlagTooltip(e, text) {
    clearTimeout(this.tooltipTimer);
    this.onTooltipShow?.(e, text);
    this.tooltipTimer = setTimeout(() => this._hideFlagTooltip(), 2000);
  }

  _hideFlagTooltip() {
    clearTimeout(this.tooltipTimer);
    this.onTooltipHide?.();
  }

  screenToWorld(sx, sy) {
    return {
      x: (sx - this.cam.x) / this.cam.scale,
      y: (sy - this.cam.y) / this.cam.scale,
    };
  }

  flyTo(wx, wy, scale, duration = 600) {
    const start = { ...this.cam };
    const rect = this.viewport.getBoundingClientRect();
    const end = {
      x: rect.width / 2 - wx * scale,
      y: rect.height / 2 - wy * scale,
      scale: Math.min(2, Math.max(0.1, scale)),
    };

    const t0 = performance.now();
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const animate = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const e = ease(p);
      this.cam.x = start.x + (end.x - start.x) * e;
      this.cam.y = start.y + (end.y - start.y) * e;
      this.cam.scale = start.scale + (end.scale - start.scale) * e;
      this.camTarget = { ...this.cam };
      this._applyTransform();
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  fitAll(duration = 0) {
    this._fitToFlags(duration);
  }

  _applyTransform() {
    this.world.style.transform = `translate(${this.cam.x}px, ${this.cam.y}px) scale(${this.cam.scale})`;
    const el = document.getElementById("prezi-zoom-level");
    if (el) el.textContent = `${Math.round(this.cam.scale * 100)}%`;
  }

  _startLoop() {
    const tick = () => {
      const lerp = 0.14;
      let moved = false;
      ["x", "y", "scale"].forEach((k) => {
        const d = this.camTarget[k] - this.cam[k];
        if (Math.abs(d) > 0.0005) {
          this.cam[k] += d * lerp;
          moved = true;
        } else {
          this.cam[k] = this.camTarget[k];
        }
      });
      if (moved) this._applyTransform();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  _bindEvents() {
    this.viewport.addEventListener("wheel", (e) => {
      e.preventDefault();
      const rect = this.viewport.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const before = this.screenToWorld(mx, my);
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      const newScale = Math.min(2, Math.max(0.1, this.camTarget.scale * factor));
      this.camTarget.scale = newScale;
      this.camTarget.x = mx - before.x * newScale;
      this.camTarget.y = my - before.y * newScale;
    }, { passive: false });

    this.viewport.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.target.closest(".cluster-flag, .cluster-blob-bg")) return;
      this.drag = {
        x: e.clientX,
        y: e.clientY,
        camX: this.camTarget.x,
        camY: this.camTarget.y,
      };
      this.viewport.classList.add("is-dragging");
      this.viewport.setPointerCapture(e.pointerId);
      this._hideFlagTooltip();
    });

    this.viewport.addEventListener("pointermove", (e) => {
      if (!this.drag) return;
      this.camTarget.x = this.drag.camX + (e.clientX - this.drag.x);
      this.camTarget.y = this.drag.camY + (e.clientY - this.drag.y);
    });

    const endDrag = (e) => {
      if (!this.drag) return;
      this.drag = null;
      this.viewport.classList.remove("is-dragging");
      try { this.viewport.releasePointerCapture(e.pointerId); } catch (_) { /* */ }
    };
    this.viewport.addEventListener("pointerup", endDrag);
    this.viewport.addEventListener("pointercancel", endDrag);

    document.getElementById("prezi-zoom-in")?.addEventListener("click", () => {
      const rect = this.viewport.getBoundingClientRect();
      const mx = rect.width / 2;
      const my = rect.height / 2;
      const before = this.screenToWorld(mx, my);
      this.camTarget.scale = Math.min(2, this.camTarget.scale * 1.15);
      this.camTarget.x = mx - before.x * this.camTarget.scale;
      this.camTarget.y = my - before.y * this.camTarget.scale;
    });

    document.getElementById("prezi-zoom-out")?.addEventListener("click", () => {
      const rect = this.viewport.getBoundingClientRect();
      const mx = rect.width / 2;
      const my = rect.height / 2;
      const before = this.screenToWorld(mx, my);
      this.camTarget.scale = Math.max(0.1, this.camTarget.scale / 1.15);
      this.camTarget.x = mx - before.x * this.camTarget.scale;
      this.camTarget.y = my - before.y * this.camTarget.scale;
    });

    document.getElementById("prezi-fit-all")?.addEventListener("click", () => {
      this.fitAll(600);
    });

    window.addEventListener("resize", () => this._fitToFlags(0));
  }

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}

window.PreziExplorer = PreziExplorer;
