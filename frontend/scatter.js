/**
 * Mapa klastrów — projekcja 2D (canvas) i 3D (Three.js).
 */
class ClusterScatter {
  constructor({
    canvas2d,
    container3d,
    flagsData,
    metadata,
    onPointClick,
    onTooltipShow,
    onTooltipMove,
    onTooltipHide,
  }) {
    this.canvas2d = canvas2d;
    this.container3d = container3d;
    this.flagsData = flagsData;
    this.metadata = metadata;
    this.onPointClick = onPointClick;
    this.onTooltipShow = onTooltipShow;
    this.onTooltipMove = onTooltipMove;
    this.onTooltipHide = onTooltipHide;
    this.mode = "2d";
    this.points = [];
    this.scatterPoints = [];
    this.embedding3d = null;
    this.three = { renderer: null, scene: null, camera: null, meshes: [], animId: null };
    this._hover2dCode = null;
    this._hover3dMesh = null;
    this._onPointerUp3d = null;
    this._orbit = { dragging: false, lastX: 0, lastY: 0, rotY: 0.6, rotX: 0.35, zoom: 4.2 };
    this._theme = {
      bg: "#f0ede8",
      grid: "rgba(95, 94, 90, 0.16)",
      stroke: "#f8f5ef",
      text: "#5f5e5a",
    };
    this.t = (key, vars = {}) => (window.__t ? window.__t(key, vars) : key);
    this.countryName = (code, fallback = "") =>
      (window.__countryName ? window.__countryName(code, fallback) : (fallback || code));
  }

  async ensure3d() {
    if (this.embedding3d) return;
    const has3d = this.flagsData.every((f) => f.embedding_3d?.length === 3);
    if (has3d) {
      this.embedding3d = Object.fromEntries(
        this.flagsData.map((f) => [f.code.toUpperCase(), f.embedding_3d]),
      );
      return;
    }
    try {
      const res = await fetch("data/embedding_3d.json");
      if (res.ok) {
        this.embedding3d = await res.json();
        return;
      }
      const detail = await res.text().catch(() => "");
      throw new Error(`${this.t("trace.error.no3d")} (${res.status}) ${detail}`);
    } catch (err) {
      console.warn("[ClusterScatter] Falling back to pseudo-3D:", err);
      // Deterministic pseudo-3D fallback from 2D + cluster spread.
      this.embedding3d = Object.fromEntries(
        this.flagsData.map((f) => [
          f.code.toUpperCase(),
          [
            Number(f.embedding_2d?.[0] || 0),
            Number(f.embedding_2d?.[1] || 0),
            Number((f.cluster || 0) * 0.55 + (((f.code || "").charCodeAt(0) % 11) - 5) * 0.07),
          ],
        ]),
      );
    }
  }

  setMode(mode) {
    this.mode = mode;
    if (mode === "2d") {
      this.container3d.hidden = true;
      this.canvas2d.hidden = false;
      this._stopThree();
      this.onTooltipHide?.();
      this.draw2d();
    } else {
      this.canvas2d.hidden = true;
      this.container3d.hidden = false;
      this.ensure3d()
        .then(() => this._init3d())
        .catch((err) => {
          console.error("[ClusterScatter] 3D init error:", err);
          this._render3dMessage(this.t("trace.error.load3d"));
        });
    }
  }

  resize() {
    this.draw2d();
    if (this.three.renderer) this._resize3d();
  }

  async initDualView() {
    this.draw2d();
    try {
      await this.ensure3d();
      await this._init3d();
    } catch (err) {
      console.error("[ClusterScatter] 3D init error:", err);
      this._render3dMessage(this.t("trace.error.load3d"));
    }
  }

  draw2d() {
    const canvas = this.canvas2d;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 900;
    const h = 420;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const pts = this.flagsData.map((f) => ({
      x: f.embedding_2d[0],
      y: f.embedding_2d[1],
      country: f.country,
      code: f.code,
      cluster: f.cluster,
      color: f.cluster_color,
      flag: f,
    }));

    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const pad = 48;
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const scaleX = (x) => pad + ((x - minX) / (maxX - minX || 1)) * (w - 2 * pad);
    const scaleY = (y) => pad + ((y - minY) / (maxY - minY || 1)) * (h - 2 * pad);

    ctx.fillStyle = this._theme.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = this._theme.grid;
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const gx = pad + (i / 4) * (w - 2 * pad);
      const gy = pad + (i / 4) * (h - 2 * pad);
      ctx.beginPath();
      ctx.moveTo(gx, pad);
      ctx.lineTo(gx, h - pad);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pad, gy);
      ctx.lineTo(w - pad, gy);
      ctx.stroke();
    }

    this.scatterPoints = pts.map((p) => ({
      ...p,
      sx: scaleX(p.x),
      sy: scaleY(p.y),
    }));

    this.scatterPoints.forEach((p) => {
      const hovered = p.code === this._hover2dCode;
      const r = hovered ? 8.5 : 6;
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.strokeStyle = this._theme.stroke;
      ctx.lineWidth = hovered ? 2.4 : 1.8;
      ctx.stroke();
    });

    ctx.fillStyle = this._theme.text;
    ctx.font = "500 11px DM Sans, sans-serif";
    ctx.fillText(this.metadata.reduction_method || "UMAP", pad, h - 16);
  }

  hitTest2d(clientX, clientY) {
    const canvas = this.canvas2d;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    let best = null;
    let bestD = 22;
    for (const p of this.scatterPoints) {
      const d = Math.hypot(p.sx - x, p.sy - y);
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    return best;
  }

  updateHover2d(clientX, clientY) {
    const hit = this.hitTest2d(clientX, clientY);
    const nextCode = hit?.code || null;
    if (nextCode !== this._hover2dCode) {
      this._hover2dCode = nextCode;
      this.draw2d();
    }
    return hit;
  }

  _stopThree() {
    if (this.three.animId) {
      cancelAnimationFrame(this.three.animId);
      this.three.animId = null;
    }
    if (this._onPointerUp3d) {
      window.removeEventListener("pointerup", this._onPointerUp3d);
      this._onPointerUp3d = null;
    }
    this._hover3dMesh = null;
  }

  _render3dMessage(text) {
    this.container3d.innerHTML = `<div class="scatter-3d-empty">${text}</div>`;
  }

  _resize3d() {
    const { renderer, camera } = this.three;
    if (!renderer || !camera) return;
    const w = this.container3d.clientWidth;
    const h = this.container3d.clientHeight || 420;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  async _init3d() {
    if (!window.THREE) {
      this._render3dMessage(this.t("trace.error.three"));
      return;
    }
    await this.ensure3d();
    this._stopThree();
    this.container3d.innerHTML = "";

    const THREE = window.THREE;
    const w = this.container3d.clientWidth || 900;
    const h = 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xebe4d8);

    const camera = new THREE.PerspectiveCamera(48, w / h, 0.1, 200);
    camera.position.set(0, 0, this._orbit.zoom);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.container3d.appendChild(renderer.domElement);

    const pts = this.flagsData
      .map((f) => {
        const direct = Array.isArray(f.embedding_3d) && f.embedding_3d.length === 3 ? f.embedding_3d : null;
        const fetched = this.embedding3d?.[f.code.toUpperCase()];
        const e = direct || fetched;
        if (!Array.isArray(e) || e.length !== 3) return null;
        if (![e[0], e[1], e[2]].every(Number.isFinite)) return null;
        return {
          x: e[0],
          y: e[1],
          z: e[2],
          color: f.cluster_color || "#888780",
          flag: f,
          country: f.country,
        };
      })
      .filter(Boolean);

    if (!pts.length) {
      this._render3dMessage(this.t("trace.error.embedding"));
      return;
    }

    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const zs = pts.map((p) => p.z);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const cz = (Math.min(...zs) + Math.max(...zs)) / 2;
    const span = Math.max(
      Math.max(...xs) - Math.min(...xs),
      Math.max(...ys) - Math.min(...ys),
      Math.max(...zs) - Math.min(...zs),
      1,
    );

    const meshes = [];
    const geo = new THREE.SphereGeometry(0.06, 10, 10);
    pts.forEach((p) => {
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(p.color),
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        ((p.x - cx) / span) * 3.2,
        ((p.y - cy) / span) * 3.2,
        ((p.z - cz) / span) * 3.2,
      );
      mesh.userData = p;
      scene.add(mesh);
      meshes.push(mesh);
    });

    const grid = new THREE.GridHelper(7, 8, 0xc8c3ba, 0xd8d3cb);
    grid.rotation.x = Math.PI / 2;
    grid.position.z = -2.7;
    scene.add(grid);

    const group = new THREE.Group();
    meshes.forEach((m) => group.add(m));
    scene.add(group);

    const dom = renderer.domElement;
    dom.addEventListener("pointerdown", (e) => {
      this._orbit.dragging = true;
      this._orbit.lastX = e.clientX;
      this._orbit.lastY = e.clientY;
    });
    this._onPointerUp3d = () => {
      this._orbit.dragging = false;
    };
    window.addEventListener("pointerup", this._onPointerUp3d);
    dom.addEventListener("pointermove", (e) => {
      if (this._orbit.dragging) {
        const dx = e.clientX - this._orbit.lastX;
        const dy = e.clientY - this._orbit.lastY;
        this._orbit.lastX = e.clientX;
        this._orbit.lastY = e.clientY;
        this._orbit.rotY += dx * 0.008;
        this._orbit.rotX += dy * 0.008;
        this._orbit.rotX = Math.max(-1.2, Math.min(1.2, this._orbit.rotX));
        this.onTooltipHide?.();
        return;
      }

      const rect = dom.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      const ray = new THREE.Raycaster();
      ray.setFromCamera(mouse, camera);
      const hit = ray.intersectObjects(meshes)[0]?.object || null;
      if (this._hover3dMesh && this._hover3dMesh !== hit) {
        this._hover3dMesh.scale.setScalar(1);
      }
      this._hover3dMesh = hit;
      if (hit) {
        hit.scale.setScalar(1.35);
        this.onTooltipShow?.(
          e,
          `${this.countryName(hit.userData.flag.code, hit.userData.country)} · ${this.t("cluster.label", { n: hit.userData.flag.cluster + 1 }).toLowerCase()}`,
        );
        this.onTooltipMove?.(e);
        dom.style.cursor = "pointer";
      } else {
        this.onTooltipHide?.();
        dom.style.cursor = "grab";
      }
    });
    dom.addEventListener("wheel", (e) => {
      e.preventDefault();
      this._orbit.zoom = Math.max(2, Math.min(12, this._orbit.zoom + e.deltaY * 0.004));
      camera.position.z = this._orbit.zoom;
    }, { passive: false });
    dom.addEventListener("click", (e) => {
      const rect = dom.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      const ray = new THREE.Raycaster();
      ray.setFromCamera(mouse, camera);
      const hits = ray.intersectObjects(meshes);
      if (hits[0]?.object?.userData?.flag) {
        this.onPointClick?.(hits[0].object.userData.flag);
      }
    });
    dom.addEventListener("mouseleave", () => {
      if (this._hover3dMesh) this._hover3dMesh.scale.setScalar(1);
      this._hover3dMesh = null;
      this.onTooltipHide?.();
      dom.style.cursor = "grab";
    });

    this.three = { renderer, scene, camera, meshes, group, animId: null };

    const tick = () => {
      if (!this._orbit.dragging) this._orbit.rotY += 0.0012;
      group.rotation.y = this._orbit.rotY;
      group.rotation.x = this._orbit.rotX;
      renderer.render(scene, camera);
      this.three.animId = requestAnimationFrame(tick);
    };
    this.three.animId = requestAnimationFrame(tick);
  }

  destroy() {
    this._stopThree();
    if (this.three.renderer) {
      this.three.renderer.dispose();
      this.container3d.innerHTML = "";
    }
  }
}

window.ClusterScatter = ClusterScatter;
