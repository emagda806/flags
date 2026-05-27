/**
 * Globus z podświetlonymi krajami wybranego klastra.
 * Styl atlasowy — jasne kremowe tło, matowe lądy, subtelna siatka geograficzna.
 */
class FlagGlobe {
  constructor({ container, flagsData, metadata, coords, onFlagClick }) {
    this.container = container;
    this.flagsData = flagsData;
    this.metadata = metadata;
    this.coords = coords || {};
    this.onFlagClick = onFlagClick;
    this.activeCluster = null;
    this._orbit = { dragging: false, lastX: 0, lastY: 0, startX: 0, startY: 0, rotY: 0, rotX: 0.2, zoom: 2.8 };
    this._autoRotating = true;
    this._lastInteraction = 0;
    this._hoveredMarker = null;
    this._pendingCluster = null;
    this._countryIdMap = null;
    this.three = {};
    this._init();
  }

  static latLngToVec3(lat, lng, r = 1) {
    const phi = ((90 - lat) * Math.PI) / 180;
    const theta = ((lng + 180) * Math.PI) / 180;
    return {
      x: -r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.cos(phi),
      z: r * Math.sin(phi) * Math.sin(theta),
    };
  }

  async _init() {
    if (!window.THREE) {
      this.container.innerHTML = '<p class="error">Brak biblioteki Three.js</p>';
      return;
    }
    const THREE = window.THREE;
    this.container.innerHTML = '';
    this.container.style.position = 'relative';

    // Loading indicator
    const loadEl = document.createElement('div');
    loadEl.style.cssText = [
      'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
      'color:#5F5E5A;font-size:0.85rem;font-family:inherit;background:#F0EDE8;',
    ].join('');
    loadEl.textContent = 'Ładowanie mapy…';
    this.container.appendChild(loadEl);

    // Fetch world-atlas topology for land + coastlines
    let globeTexture = null;
    let topo = null;
    try {
      topo = await fetch(
        'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json',
      ).then((r) => r.json());
      globeTexture = this._buildTexture(THREE, topo);
    } catch (e) {
      console.warn('[FlagGlobe] Could not load world atlas:', e);
    }
    this._countryIdMap = await this._loadCountryIdMap();

    this.container.innerHTML = '';

    const w = this.container.clientWidth || 800;
    const h = this.container.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0ede8);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0, this._orbit.zoom);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Ocean / land sphere
    const sphereMat = globeTexture
      ? new THREE.MeshBasicMaterial({ map: globeTexture })
      : new THREE.MeshBasicMaterial({ color: 0xe8e4de });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), sphereMat);
    globeGroup.add(sphere);

    // Geographic grid (meridians every 30°, parallels every 30°)
    globeGroup.add(this._buildGrid(THREE));

    // Country dots removed (atlas-only mode).
    const markers = [];

    const coordCount = Object.keys(this.coords).length;
    console.log(
      `[FlagGlobe] flags=${this.flagsData.length} coords=${coordCount} markers=${markers.length}`,
      markers.length ? `sample: ${markers[0].userData.flag.code} cluster=${markers[0].userData.flag.cluster} color=${markers[0].userData.flag.cluster_color}` : 'NO MARKERS',
    );

    this.three = { scene, camera, renderer, globeGroup, sphere, markers, topo, animId: null };

    // Apply pending cluster or default to biggest
    const toActivate = this._pendingCluster ?? this._biggestClusterId();
    this._pendingCluster = null;
    if (toActivate != null) this.setCluster(toActivate);

    // ── Event handlers ───────────────────────────────────────────────────────
    const dom = renderer.domElement;
    const tooltip = document.getElementById('tooltip');

    const markInteraction = () => {
      this._lastInteraction = Date.now();
      this._autoRotating = false;
    };

    dom.addEventListener('pointerdown', (e) => {
      this._orbit.dragging = true;
      this._orbit.lastX = e.clientX;
      this._orbit.lastY = e.clientY;
      this._orbit.startX = e.clientX;
      this._orbit.startY = e.clientY;
      markInteraction();
    });
    window.addEventListener('pointerup', () => {
      this._orbit.dragging = false;
    });

    dom.addEventListener('pointermove', (e) => {
      if (this._orbit.dragging) {
        const dx = e.clientX - this._orbit.lastX;
        const dy = e.clientY - this._orbit.lastY;
        this._orbit.lastX = e.clientX;
        this._orbit.lastY = e.clientY;
        this._orbit.rotY += dx * 0.005;
        this._orbit.rotX += dy * 0.005;
        this._orbit.rotX = Math.max(-0.9, Math.min(0.9, this._orbit.rotX));
        markInteraction();
      }

      // Hover — pick nearest country to the point under cursor.
      const ray = this._rayFromPointer(e, dom, camera, THREE);
      const picked = this._pickCountryFromRay(ray, sphere, 8);
      if (picked?.flag) {
        const flag = picked.flag;
        if (tooltip) {
          const name = flag.country || flag.code.toUpperCase();
          const imgSrc = `https://flagcdn.com/w160/${flag.code.toLowerCase()}.png`;
          tooltip.innerHTML =
            `<img src="${imgSrc}" style="width:32px;height:20px;object-fit:cover;` +
            `border-radius:2px;vertical-align:middle;margin-right:6px;">${name}`;
          tooltip.style.left = `${e.clientX + 14}px`;
          tooltip.style.top = `${e.clientY - 12}px`;
          tooltip.classList.add('visible');
        }
        markInteraction();
        dom.style.cursor = 'pointer';
      } else {
        if (tooltip) tooltip.classList.remove('visible');
        dom.style.cursor = '';
      }
    });

    dom.addEventListener('mouseleave', () => {
      if (tooltip) tooltip.classList.remove('visible');
    });

    dom.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this._orbit.zoom = Math.max(1.6, Math.min(6, this._orbit.zoom + e.deltaY * 0.002));
        camera.position.z = this._orbit.zoom;
        markInteraction();
      },
      { passive: false },
    );

    dom.addEventListener('click', (e) => {
      // Ignore if the pointer moved significantly (drag gesture)
      const dx = e.clientX - this._orbit.startX;
      const dy = e.clientY - this._orbit.startY;
      if (dx * dx + dy * dy > 25) return;

      const ray = this._rayFromPointer(e, dom, camera, THREE);
      const picked = this._pickCountryFromRay(ray, sphere, 10);
      if (picked?.flag) {
        const flag = picked.flag;
        const c = picked.coord || this.coords[flag.code.toUpperCase()];
        if (c) this._animateCenterTo(-(c.lng * Math.PI) / 180, 0);
        this.onFlagClick?.(flag);
      }
    });

    // ── Render loop ──────────────────────────────────────────────────────────
    const IDLE_DELAY = 3000;
    const ROT_SPEED = 0.00087; // ≈ 0.05° per frame at 60fps

    const tick = () => {
      if (!this._autoRotating && !this._orbit.dragging) {
        if (Date.now() - this._lastInteraction > IDLE_DELAY) this._autoRotating = true;
      }
      if (this._autoRotating && !this._orbit.dragging) this._orbit.rotY += ROT_SPEED;
      globeGroup.rotation.y = this._orbit.rotY;
      globeGroup.rotation.x = this._orbit.rotX;
      renderer.render(scene, camera);
      this.three.animId = requestAnimationFrame(tick);
    };
    this.three.animId = requestAnimationFrame(tick);
  }

  // ── World-map canvas texture ──────────────────────────────────────────────
  _buildTexture(THREE, topo, opts = {}) {
    const highlightIds = opts.highlightIds || new Set();
    const highlightColor = opts.highlightColor || "#B7B2A8";
    const W = 2048;
    const H = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Ocean base
    ctx.fillStyle = '#E8E4DE';
    ctx.fillRect(0, 0, W, H);

    const project = ([lng, lat]) => [(lng + 180) / 360 * W, (90 - lat) / 180 * H];

    const drawRings = (rings) => {
      ctx.beginPath();
      rings.forEach((ring) => {
        ring.forEach((coord, i) => {
          const [x, y] = project(coord);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
      });
    };

    const eachGeom = (geojson, fn) => {
      if (!geojson) return;
      if (geojson.type === 'FeatureCollection') {
        geojson.features.forEach((f) => fn(f));
      } else if (geojson.type === 'Feature') {
        fn(geojson);
      } else if (geojson.type === 'Polygon' || geojson.type === 'MultiPolygon') {
        fn({ geometry: geojson, id: geojson.id });
      }
    };

    const polysOf = (geom) => {
      if (!geom) return null;
      if (geom.type === 'Polygon') return [geom.coordinates];
      if (geom.type === 'MultiPolygon') return geom.coordinates;
      return null;
    };

    if (window.topojson && topo?.objects) {
      const countries = window.topojson.feature(topo, topo.objects.countries);

      // Land fill
      eachGeom(countries, (feature) => {
        const polys = polysOf(feature?.geometry);
        if (!polys) return;
        const featureId = this._normalizeCountryId(feature?.id);
        ctx.fillStyle = highlightIds.has(featureId) ? highlightColor : '#D3D1C7';
        polys.forEach((rings) => {
          drawRings(rings);
          ctx.fill('evenodd');
        });
      });

      // Country borders
      ctx.strokeStyle = '#888780';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.7;
      eachGeom(countries, (geom) => {
        const polys = polysOf(geom);
        if (!polys) return;
        polys.forEach((rings) => {
          drawRings(rings);
          ctx.stroke();
        });
      });
      ctx.globalAlpha = 1;

      // Coastlines (land exterior)
      if (topo.objects.land) {
        const land = window.topojson.feature(topo, topo.objects.land);
        ctx.strokeStyle = '#888780';
        ctx.lineWidth = 1.5;
        eachGeom(land, (geom) => {
          const polys = polysOf(geom);
          if (!polys) return;
          polys.forEach((rings) => {
            drawRings(rings);
            ctx.stroke();
          });
        });
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  // ── Geographic grid ───────────────────────────────────────────────────────
  _buildGrid(THREE) {
    const pts = [];
    const step = 2; // degrees per segment arc

    // Meridians every 30°
    for (let lng = -180; lng < 180; lng += 30) {
      for (let lat = -90 + step; lat <= 90; lat += step) {
        const a = FlagGlobe.latLngToVec3(lat - step, lng, 1.002);
        const b = FlagGlobe.latLngToVec3(lat, lng, 1.002);
        pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }

    // Parallels every 30° (skip poles)
    for (let lat = -60; lat <= 60; lat += 30) {
      const steps = 180;
      for (let i = 0; i < steps; i++) {
        const lng0 = -180 + (360 / steps) * i;
        const lng1 = -180 + (360 / steps) * (i + 1);
        const a = FlagGlobe.latLngToVec3(lat, lng0, 1.002);
        const b = FlagGlobe.latLngToVec3(lat, lng1, 1.002);
        pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));

    const mat = new THREE.LineBasicMaterial({
      color: 0xc4c0b8,
      transparent: true,
      opacity: 0.4,
    });

    return new THREE.LineSegments(geo, mat);
  }

  // ── Marker state ─────────────────────────────────────────────────────────
  _refreshMarkers() {
    if (!this.three.markers) return;
    const THREE = window.THREE;
    this.three.markers.forEach((dot) => {
      const inCluster = Number(dot.userData.cluster) === Number(this.activeCluster);
      const isHovered = dot === this._hoveredMarker;
      const color = dot.userData.flag.cluster_color || "#888780";
      dot.material.color.set(new THREE.Color(color));
      // Keep dots subtle because countries are now area-highlighted.
      dot.material.opacity = isHovered ? 1 : inCluster ? 0.28 : 0.06;
      dot.scale.setScalar(isHovered ? 2.5 : inCluster ? 1.35 : 0.85);
    });
  }

  _normalizeCountryId(id) {
    if (id == null) return "";
    const raw = String(id).trim();
    if (!raw) return "";
    if (/^\d+$/.test(raw)) return raw.padStart(3, "0");
    return raw.toUpperCase();
  }

  async _loadCountryIdMap() {
    const map = {};
    try {
      const res = await fetch("https://restcountries.com/v3.1/all?fields=cca2,ccn3");
      if (!res.ok) return map;
      const rows = await res.json();
      rows.forEach((row) => {
        const a2 = (row?.cca2 || "").toUpperCase();
        const n3 = this._normalizeCountryId(row?.ccn3);
        if (a2 && n3) map[a2] = n3;
      });
    } catch {
      return map;
    }
    return map;
  }

  _updateClusterAreas(clusterId) {
    const { sphere, topo } = this.three;
    if (!sphere || !topo || !window.THREE) return;
    const clusterFlags = this.flagsData.filter((f) => Number(f.cluster) === Number(clusterId));
    if (!clusterFlags.length) return;
    const highlightIds = new Set(
      clusterFlags
        .map((f) => this._countryIdMap?.[String(f.code || "").toUpperCase()])
        .filter(Boolean)
        .map((id) => this._normalizeCountryId(id)),
    );
    if (!highlightIds.size) return;
    const color = clusterFlags[0]?.cluster_color || "#B7B2A8";
    const tex = this._buildTexture(window.THREE, topo, { highlightIds, highlightColor: color });
    if (sphere.material?.map) sphere.material.map.dispose?.();
    sphere.material.map = tex;
    sphere.material.needsUpdate = true;
  }

  _rayFromPointer(e, dom, camera, THREE) {
    const rect = dom.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    const ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, camera);
    return ray;
  }

  _latLngFromSphereHit(hitPoint, sphere) {
    const p = sphere.worldToLocal(hitPoint.clone()).normalize();
    const lat = 90 - (Math.acos(Math.max(-1, Math.min(1, p.y))) * 180) / Math.PI;
    const theta = Math.atan2(p.z, -p.x);
    let lng = (theta * 180) / Math.PI - 180;
    if (lng < -180) lng += 360;
    if (lng > 180) lng -= 360;
    return { lat, lng };
  }

  _angularDistanceDeg(aLat, aLng, bLat, bLng) {
    const toRad = (v) => (v * Math.PI) / 180;
    const lat1 = toRad(aLat);
    const lat2 = toRad(bLat);
    const dLng = toRad(aLng - bLng);
    const cosD =
      Math.sin(lat1) * Math.sin(lat2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return (Math.acos(Math.max(-1, Math.min(1, cosD))) * 180) / Math.PI;
  }

  _pickCountryFromRay(ray, sphere, maxDistanceDeg = 10) {
    const sphereHit = ray.intersectObject(sphere)[0];
    if (!sphereHit) return null;
    const clickGeo = this._latLngFromSphereHit(sphereHit.point, sphere);

    let best = null;
    let bestDist = Infinity;
    this.flagsData.forEach((flag) => {
      const coord = this.coords[String(flag.code || "").toUpperCase()];
      if (!coord || coord.lat == null || coord.lng == null) return;
      const d = this._angularDistanceDeg(clickGeo.lat, clickGeo.lng, coord.lat, coord.lng);
      if (d < bestDist) {
        bestDist = d;
        best = { flag, coord, distanceDeg: d };
      }
    });
    if (!best || bestDist > maxDistanceDeg) return null;
    return best;
  }

  // ── Smooth center-on-click animation ─────────────────────────────────────
  _animateCenterTo(targetRotY, targetRotX) {
    const startY = this._orbit.rotY;
    const startX = this._orbit.rotX;
    // Take the shortest angular path
    let diff = ((targetRotY - startY) % (Math.PI * 2));
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;
    const endY = startY + diff;
    const duration = 1200;
    const t0 = performance.now();
    const orbit = this._orbit;
    const step = () => {
      const t = Math.min(1, (performance.now() - t0) / duration);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      orbit.rotY = startY + (endY - startY) * ease;
      orbit.rotX = startX + (targetRotX - startX) * ease;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  _biggestClusterId() {
    const counts = new Map();
    this.flagsData.forEach((f) => counts.set(f.cluster, (counts.get(f.cluster) || 0) + 1));
    let best = null;
    let max = 0;
    counts.forEach((n, id) => {
      if (n > max) { max = n; best = id; }
    });
    return best;
  }

  // ── Public API ────────────────────────────────────────────────────────────
  setCluster(clusterId) {
    this.activeCluster = clusterId;
    if (!this.three.markers) {
      this._pendingCluster = clusterId;
      return;
    }
    this._refreshMarkers();
    this._updateClusterAreas(clusterId);
  }

  centerOnCluster(clusterId) {
    const flags = this.flagsData.filter((f) => f.cluster === clusterId);
    const withCoords = flags
      .map((f) => this.coords[f.code.toUpperCase()])
      .filter(Boolean);
    if (!withCoords.length) return;
    const avgLat = withCoords.reduce((s, c) => s + c.lat, 0) / withCoords.length;
    const avgLng = withCoords.reduce((s, c) => s + c.lng, 0) / withCoords.length;
    this._animateCenterTo(-(avgLng * Math.PI) / 180, -(avgLat * Math.PI) / 360);
  }

  resize() {
    const { renderer, camera } = this.three;
    if (!renderer || !camera) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight || 520;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  destroy() {
    if (this.three.animId) cancelAnimationFrame(this.three.animId);
    if (this.three.renderer) {
      this.three.renderer.dispose();
      this.container.innerHTML = '';
    }
  }
}

window.FlagGlobe = FlagGlobe;
