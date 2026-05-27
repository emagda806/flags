/**
 * Eksploracja flag — frontend (polski UI, styl premium)
 */

const DATA_BASE = "data";
const FLAG_CDN = "https://flagcdn.com/w160";
const THEME = {
  chartBg: "#ebe4d8",
  chartGrid: "rgba(62, 48, 35, 0.1)",
  chartLine: "#7a6348",
  chartText: "#8a7b68",
  scatterStroke: "#fffcf7",
};
const I18N = {
  pl: {
    "doc.title": "Eksploracja flag świata",
    "intro.eyebrow": "Autoenkoder · Klasteryzacja",
    "intro.title": "Flags",
    "intro.skip": "Pomiń animację",
    "header.title": "Eksploracja flag świata",
    "header.subtitle": "Podobieństwo wizualne flag w przestrzeni latentnej sieci neuronowej",
    "tabs.mainAria": "Główne sekcje",
    "tabs.explore": "Eksploracja",
    "tabs.details": "Implementacja",
    "explore.mapAria": "Mapa flag",
    "explore.zoomOut": "Oddal",
    "explore.zoomIn": "Przybliż",
    "explore.reset": "Reset",
    "explore.modeAria": "Tryb eksploracji",
    "explore.cloud": "Chmura flag",
    "explore.globe": "Globus",
    "globe.atlas": "Atlas klastrów",
    "globe.clusterPickerAria": "Wybór klastra",
    "globe.hint": "Podświetlone kraje należą do wybranego klastra — kliknij punkt, aby zobaczyć flagę",
    "globe.containerAria": "Globus z klastrami",
    "details.pipeline.title": "Pipeline aplikacji",
    "details.pipeline.desc": "Od pikseli flagi do interaktywnej mapy — łańcuch przetwarzania danych",
    "details.autoencoder.title": "Jak działa autoenkoder",
    "details.autoencoder.desc": "Dane przepływają przez enkoder (kompresja 64×64 → ℝ¹²⁸) i dekoder (rekonstrukcja ℝ¹²⁸ → 64×64)",
    "details.trace.title": "Rekonstrukcja krok po kroku",
    "details.trace.desc": "Podgląd obrazu flagi po przejściu przez kolejne etapy enkodera i dekodera",
    "details.trace.flagLabel": "Flaga:",
    "details.scatter.title": "Mapa klastrów",
    "details.scatter.desc": "Projekcja wektorów latentnych — najedź na punkt, aby zobaczyć kraj",
    "details.loss.title": "Krzywa uczenia",
    "details.loss.desc": "Strata MSE w funkcji epoki treningu",
    "details.clouds.title": "Chmury klastrów",
    "details.clouds.desc": "Grupy wizualnie podobnych flag — bez przypisanych nazw krajów",
    "details.how.title": "Jak to działa?",
    "details.how.p1": "<strong>Autoenkoder</strong> uczy się kompresować obraz flagi do krótkiego wektora i go odtworzyć. Podobne flagi otrzymują podobne wektory.",
    "details.how.p2": "<strong>Wektor latentny</strong> to skondensowana reprezentacja cech wizualnych — bez ręcznego opisywania kolorów czy symboli.",
    "details.how.p3": "<strong>K-Means</strong> grupuje wektory tak, by flagi w jednym klastrze były blisko siebie w przestrzeni wyuczonej przez model.",
    "details.how.p4": "<strong>UMAP / t-SNE</strong> sprowadza embeddingi do dwóch lub trzech wymiarów wyłącznie na potrzeby wizualizacji.",
    "sidepanel.close": "Zamknij",
    "sidepanel.cluster": "Klaster",
    "sidepanel.similar": "Podobne flagi w klastrze",
    "error.noStaticData": 'Brak danych statycznych. Upewnij się, że katalog <code>frontend/data</code> istnieje.',
    "cluster.label": "Klaster {n}",
    "cluster.hint.more": "+ {n} kolejnych w pełnej eksploracji",
    "trace.loading": "Ładowanie etapów rekonstrukcji…",
    "trace.missing": "Dla tej flagi brak pre-generowanych etapów w wersji statycznej.",
    "trace.stage.input": "Wejście",
    "trace.stage.output": "Wyjście (rekonstrukcja)",
    "trace.stage.enc": "Po enkoderze",
    "trace.stage.latent": "Wektor latentny z",
    "trace.stage.decStart": "Start dekodera",
    "trace.stage.conv1": "Po ConvT #1",
    "trace.stage.conv2": "Po ConvT #2",
    "trace.stage.conv3": "Po ConvT #3",
    "trace.stage.rgb": "RGB przed Sigmoid",
    "pipeline.input.name": "Flagi świata",
    "pipeline.input.detail": "{n} obrazów PNG",
    "pipeline.encode.name": "Enkoder CNN",
    "pipeline.encode.detail": "5 warstw splotowych",
    "pipeline.latent.name": "Wektor latentny",
    "pipeline.latent.detail": "bottleneck FC",
    "pipeline.decode.name": "Dekoder CNN",
    "pipeline.decode.detail": "rekonstrukcja",
    "pipeline.cluster.name": "K-Means",
    "pipeline.cluster.detail": "{n} klastrów",
    "pipeline.cluster.dim": "grupowanie z",
    "pipeline.reduce.detail": "redukcja wymiarów",
    "pipeline.output.name": "Mapa klastrów",
    "pipeline.output.detail": "chmura + globus",
    "encoder.input": "Wejście",
    "encoder.output": "Wyjście",
    "encoder.enc": "ENKODER",
    "encoder.dec": "DEKODER",
    "chart.epoch": "Epoka",
    "trace.error.load3d": "Nie udało się załadować projekcji 3D.",
    "trace.error.no3d": "Brak projekcji 3D",
    "trace.error.three": "Brak biblioteki Three.js.",
    "trace.error.embedding": "Brak danych embeddingu 3D.",
    "globe.error.three": "Brak biblioteki Three.js",
    "globe.loading": "Ładowanie mapy…",
    "tour.skip": "Pomiń",
    "tour.prev": "Wstecz",
    "tour.next": "Dalej",
    "tour.finish": "Zaczynamy",
    "tour.progress": "{current}/{total}",
    "tour.step1.title": "Witaj!",
    "tour.step1.body": "To krótki spacer po aplikacji. Za chwilę zobaczysz, jak czytać mapę podobieństwa flag i gdzie zajrzeć po szczegóły techniczne.",
    "tour.step2.title": "Język interfejsu",
    "tour.step2.body": "Tu jednym kliknięciem przełączysz UI między polskim i angielskim.",
    "tour.step3.title": "Dwa tryby pracy",
    "tour.step3.body": "Zakładka Eksploracja służy do oglądania klastrów, a Implementacja pokazuje, jak model działa od środka.",
    "tour.step4.title": "Interaktywna mapa",
    "tour.step4.body": "Przeciągaj, zoomuj i klikaj flagi, żeby otwierać kartę kraju oraz podobne przykłady.",
    "tour.step5.title": "Chmura i globus",
    "tour.step5.body": "Przełączaj szybko między widokiem chmury i globusem, zależnie od tego, co chcesz analizować.",
    "tour.step6.title": "Co jest pod maską",
    "tour.step6.body": "W Implementacji znajdziesz pipeline, rekonstrukcję krok po kroku, mapy embeddingów i przebieg uczenia.",
  },
  en: {
    "doc.title": "World Flags Explorer",
    "intro.eyebrow": "Autoencoder · Clustering",
    "intro.title": "Flags",
    "intro.skip": "Skip animation",
    "header.title": "World Flags Explorer",
    "header.subtitle": "Visual similarity of flags in the neural network latent space",
    "tabs.mainAria": "Main sections",
    "tabs.explore": "Explore",
    "tabs.details": "Implementation",
    "explore.mapAria": "Flag map",
    "explore.zoomOut": "Zoom out",
    "explore.zoomIn": "Zoom in",
    "explore.reset": "Reset",
    "explore.modeAria": "Exploration mode",
    "explore.cloud": "Flag cloud",
    "explore.globe": "Globe",
    "globe.atlas": "Cluster atlas",
    "globe.clusterPickerAria": "Cluster picker",
    "globe.hint": "Highlighted countries belong to the selected cluster — click a point to view the flag",
    "globe.containerAria": "Cluster globe",
    "details.pipeline.title": "Application pipeline",
    "details.pipeline.desc": "From flag pixels to an interactive map — data processing pipeline",
    "details.autoencoder.title": "How the autoencoder works",
    "details.autoencoder.desc": "Data flows through the encoder (compression 64×64 → ℝ¹²⁸) and decoder (reconstruction ℝ¹²⁸ → 64×64)",
    "details.trace.title": "Step-by-step reconstruction",
    "details.trace.desc": "Preview of the flag image across encoder and decoder stages",
    "details.trace.flagLabel": "Flag:",
    "details.scatter.title": "Cluster map",
    "details.scatter.desc": "Latent vector projection — hover a point to see the country",
    "details.loss.title": "Learning curve",
    "details.loss.desc": "MSE loss over training epochs",
    "details.clouds.title": "Cluster clouds",
    "details.clouds.desc": "Groups of visually similar flags — without country labels",
    "details.how.title": "How does it work?",
    "details.how.p1": "<strong>Autoencoder</strong> learns to compress a flag image into a short vector and reconstruct it. Similar flags get similar vectors.",
    "details.how.p2": "<strong>Latent vector</strong> is a compressed visual representation — without manually describing colors or symbols.",
    "details.how.p3": "<strong>K-Means</strong> groups vectors so that flags in one cluster are close to each other in model-learned space.",
    "details.how.p4": "<strong>UMAP / t-SNE</strong> reduces embeddings to two or three dimensions for visualization purposes.",
    "sidepanel.close": "Close",
    "sidepanel.cluster": "Cluster",
    "sidepanel.similar": "Similar flags in cluster",
    "error.noStaticData": 'Static data is missing. Make sure the <code>frontend/data</code> directory exists.',
    "cluster.label": "Cluster {n}",
    "cluster.hint.more": "+ {n} more in full exploration view",
    "trace.loading": "Loading reconstruction stages…",
    "trace.missing": "No pre-generated static stages are available for this flag.",
    "trace.stage.input": "Input",
    "trace.stage.output": "Output (reconstruction)",
    "trace.stage.enc": "After encoder",
    "trace.stage.latent": "Latent vector z",
    "trace.stage.decStart": "Decoder start",
    "trace.stage.conv1": "After ConvT #1",
    "trace.stage.conv2": "After ConvT #2",
    "trace.stage.conv3": "After ConvT #3",
    "trace.stage.rgb": "RGB before Sigmoid",
    "pipeline.input.name": "World flags",
    "pipeline.input.detail": "{n} PNG images",
    "pipeline.encode.name": "CNN encoder",
    "pipeline.encode.detail": "5 convolutional layers",
    "pipeline.latent.name": "Latent vector",
    "pipeline.latent.detail": "bottleneck FC",
    "pipeline.decode.name": "CNN decoder",
    "pipeline.decode.detail": "reconstruction",
    "pipeline.cluster.name": "K-Means",
    "pipeline.cluster.detail": "{n} clusters",
    "pipeline.cluster.dim": "grouping in z",
    "pipeline.reduce.detail": "dimensionality reduction",
    "pipeline.output.name": "Cluster map",
    "pipeline.output.detail": "cloud + globe",
    "encoder.input": "Input",
    "encoder.output": "Output",
    "encoder.enc": "ENCODER",
    "encoder.dec": "DECODER",
    "chart.epoch": "Epoch",
    "trace.error.load3d": "Could not load 3D projection.",
    "trace.error.no3d": "3D projection is unavailable",
    "trace.error.three": "Three.js library is missing.",
    "trace.error.embedding": "3D embedding data is unavailable.",
    "globe.error.three": "Three.js library is missing",
    "globe.loading": "Loading map…",
    "tour.skip": "Skip",
    "tour.prev": "Back",
    "tour.next": "Next",
    "tour.finish": "Start",
    "tour.progress": "{current}/{total}",
    "tour.step1.title": "Welcome!",
    "tour.step1.body": "Quick tour: you will see how to read the flag-similarity map and where to find the model internals.",
    "tour.step2.title": "Language",
    "tour.step2.body": "Switch the interface between English and Polish with one click.",
    "tour.step3.title": "Two working modes",
    "tour.step3.body": "Explore is for browsing clusters, while Implementation explains how the model works under the hood.",
    "tour.step4.title": "Interactive map",
    "tour.step4.body": "Pan, zoom, and tap flags to open country details and nearest visual neighbors.",
    "tour.step5.title": "Cloud and globe",
    "tour.step5.body": "Jump between the flag cloud and the cluster globe depending on what you want to inspect.",
    "tour.step6.title": "Under the hood",
    "tour.step6.body": "In Implementation you can inspect the pipeline, step-by-step reconstruction, embeddings, and training progress.",
  },
};
let currentLang = localStorage.getItem("app-lang") || "en";
if (!I18N[currentLang]) currentLang = "en";
const REGION_NAMES = {};
const STATIC_TRACE_CODES = new Set(["PL", "DE", "AF"]);
["pl", "en"].forEach((lang) => {
  try {
    REGION_NAMES[lang] = new Intl.DisplayNames([lang], { type: "region" });
  } catch {
    REGION_NAMES[lang] = null;
  }
});

let flagsData = [];
let metadata = {};
let prezi = null;
let clusterScatter = null;
let flagGlobe = null;
let countryCoords = {};
let exploreView = "cloud";
let detailsInitialized = false;


function clusterMeta(clusterId) {
  return (metadata.clusters || []).find((c) => c.id === clusterId);
}

function clusterDescription(clusterId) {
  const m = clusterMeta(clusterId);
  if (currentLang === "en") return m?.ai_description_en || m?.ai_description || m?.traits?.description || "";
  return m?.ai_description || m?.traits?.description || "";
}

function flagNoun(count) {
  if (currentLang === "en") return count === 1 ? "flag" : "flags";
  if (count === 1) return "flaga";
  if (count < 5) return "flagi";
  return "flag";
}

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function t(key, vars = {}) {
  const source = I18N[currentLang] || I18N.pl;
  const fallback = I18N.pl[key] || key;
  let text = source[key] || fallback;
  Object.entries(vars).forEach(([name, value]) => {
    text = text.replaceAll(`{${name}}`, String(value));
  });
  return text;
}

window.__t = t;

function countryName(code, fallback = "") {
  const normalized = String(code || "").toUpperCase();
  if (!normalized || normalized.length !== 2) return fallback || normalized;
  const localized = REGION_NAMES[currentLang]?.of(normalized);
  if (localized && localized !== normalized) return localized;
  return fallback || normalized;
}

window.__countryName = countryName;

function applyTranslations() {
  document.documentElement.lang = currentLang;
  $$("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (!key) return;
    el.innerHTML = t(key);
  });
  $$("[data-i18n-attr]").forEach((el) => {
    const defs = (el.dataset.i18nAttr || "").split("|");
    defs.forEach((def) => {
      const [attr, key] = def.split(":");
      if (!attr || !key) return;
      el.setAttribute(attr, t(key));
    });
  });
  document.title = t("doc.title");
  $$(".lang-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.lang === currentLang));
}

function setLanguage(lang) {
  if (!I18N[lang]) return;
  currentLang = lang;
  localStorage.setItem("app-lang", lang);
  applyTranslations();
  updateEncoderBlockLabels();
  if (traceInitDone) initReconstructionTrace();
  if ($("#pipeline-anim")) renderPipeline();
  if ($("#clusters-gallery")) renderClustersGallery();
  populateGlobeClusterSelect();
  if (tourState.active) renderTourStep();
  if ($("#panel-cluster-badge")?.textContent) {
    const raw = $("#panel-cluster-badge").dataset.clusterId;
    const n = raw ? Number(raw) + 1 : null;
    if (n != null) $("#panel-cluster-badge").textContent = t("cluster.label", { n });
  }
  const panelCode = $("#panel-code")?.textContent?.trim();
  if (panelCode) {
    const flag = flagsData.find((f) => f.code.toUpperCase() === panelCode.toUpperCase());
    if (flag) $("#panel-country").textContent = countryName(flag.code, flag.country);
  }
}

function initLanguageSwitch() {
  applyTranslations();
  $(".lang-switch")?.addEventListener("click", (event) => {
    const btn = event.target.closest(".lang-btn");
    if (!btn) return;
    event.preventDefault();
    setLanguage(btn.dataset.lang);
  });
}

const tourState = {
  active: false,
  dismissed: false,
  step: 0,
  overlay: null,
  card: null,
  target: null,
  titleEl: null,
  bodyEl: null,
  progressEl: null,
  prevBtn: null,
  nextBtn: null,
  skipBtn: null,
};
let tourLaunchTimer = null;

const TOUR_STEPS = [
  { selector: ".header", title: "tour.step1.title", body: "tour.step1.body", placement: "bottom" },
  { selector: ".lang-switch", title: "tour.step2.title", body: "tour.step2.body", placement: "left", maxWidth: 250 },
  { selector: ".tabs", title: "tour.step3.title", body: "tour.step3.body", placement: "bottom" },
  { selector: "#prezi-stage", title: "tour.step4.title", body: "tour.step4.body", placement: "bottom" },
  { selector: ".explore-subnav", title: "tour.step5.title", body: "tour.step5.body", placement: "top" },
  { selector: ".tabs [data-tab='details']", title: "tour.step6.title", body: "tour.step6.body", placement: "left" },
];

function ensureTourUi() {
  if (tourState.overlay) return;
  const overlay = document.createElement("div");
  overlay.className = "tour-overlay";
  overlay.innerHTML = `
    <div class="tour-backdrop"></div>
    <div class="tour-card" role="dialog" aria-live="polite">
      <p class="tour-progress"></p>
      <h3 class="tour-title"></h3>
      <p class="tour-body"></p>
      <div class="tour-actions">
        <button type="button" class="tour-btn tour-skip"></button>
        <button type="button" class="tour-btn tour-prev"></button>
        <button type="button" class="tour-btn tour-next"></button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  tourState.overlay = overlay;
  tourState.card = overlay.querySelector(".tour-card");
  tourState.titleEl = overlay.querySelector(".tour-title");
  tourState.bodyEl = overlay.querySelector(".tour-body");
  tourState.progressEl = overlay.querySelector(".tour-progress");
  tourState.prevBtn = overlay.querySelector(".tour-prev");
  tourState.nextBtn = overlay.querySelector(".tour-next");
  tourState.skipBtn = overlay.querySelector(".tour-skip");
  overlay.querySelector(".tour-backdrop")?.addEventListener("click", () => stopTour());
  tourState.prevBtn.addEventListener("click", () => goTourStep(-1));
  tourState.nextBtn.addEventListener("click", () => goTourStep(1));
  tourState.skipBtn.addEventListener("click", () => stopTour());
}

function startTour() {
  if (tourState.dismissed) return;
  ensureTourUi();
  tourState.active = true;
  tourState.step = 0;
  tourState.overlay.classList.add("active");
  renderTourStep();
}

function scheduleTourStart(delayMs = 120) {
  if (tourState.dismissed) return;
  if (tourLaunchTimer) clearTimeout(tourLaunchTimer);
  tourLaunchTimer = setTimeout(() => {
    tourLaunchTimer = null;
    if (tourState.active) return;
    if (tourState.dismissed) return;
    if (!document.querySelector(".header")) return;
    startTour();
  }, delayMs);
}

function stopTour() {
  if (tourLaunchTimer) {
    clearTimeout(tourLaunchTimer);
    tourLaunchTimer = null;
  }
  tourState.active = false;
  tourState.target?.classList.remove("tour-highlight");
  tourState.target = null;
  if (tourState.overlay) {
    tourState.overlay.remove();
    tourState.overlay = null;
    tourState.card = null;
    tourState.titleEl = null;
    tourState.bodyEl = null;
    tourState.progressEl = null;
    tourState.prevBtn = null;
    tourState.nextBtn = null;
    tourState.skipBtn = null;
  }
  tourState.dismissed = true;
}

function goTourStep(delta) {
  if (!tourState.active) return;
  const next = tourState.step + delta;
  if (next < 0) return;
  if (next >= TOUR_STEPS.length) {
    stopTour();
    return;
  }
  tourState.step = next;
  renderTourStep();
}

function isTourTargetRenderable(el) {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 6 && rect.height > 6;
}

function renderTourStep() {
  const stepCfg = TOUR_STEPS[tourState.step];
  if (!stepCfg) {
    stopTour();
    return;
  }
  tourState.target?.classList.remove("tour-highlight");
  const target = document.querySelector(stepCfg.selector);
  const hasTarget = isTourTargetRenderable(target);
  tourState.target = hasTarget ? target : null;
  if (hasTarget) target.classList.add("tour-highlight");

  tourState.titleEl.textContent = t(stepCfg.title);
  tourState.bodyEl.textContent = t(stepCfg.body);
  tourState.progressEl.textContent = t("tour.progress", {
    current: tourState.step + 1,
    total: TOUR_STEPS.length,
  });
  tourState.skipBtn.textContent = t("tour.skip");
  tourState.prevBtn.textContent = t("tour.prev");
  tourState.nextBtn.textContent = tourState.step === TOUR_STEPS.length - 1 ? t("tour.finish") : t("tour.next");
  tourState.prevBtn.disabled = tourState.step === 0;

  const rect = target.getBoundingClientRect();
  const card = tourState.card;
  const width = Math.min(stepCfg.maxWidth || 360, window.innerWidth - 32);
  const pad = 12;
  const gap = 14;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  card.classList.remove("tour-arrow-top", "tour-arrow-bottom", "tour-arrow-left", "tour-arrow-right", "tour-no-arrow");
  card.style.removeProperty("--arrow-x");
  card.style.removeProperty("--arrow-y");
  card.style.width = `${width}px`;
  card.style.left = `${pad}px`;
  card.style.top = `${pad}px`;
  const cardRect = card.getBoundingClientRect();
  let placement = stepCfg.placement || "bottom";
  let left = pad;
  let top = pad;
  if (hasTarget) {
    const rect = target.getBoundingClientRect();
    if (placement === "left") {
      left = rect.left - cardRect.width - gap;
      top = rect.top + rect.height / 2 - cardRect.height / 2;
      const arrowY = clamp(rect.top + rect.height / 2 - top - 7, 14, cardRect.height - 20);
      card.classList.add("tour-arrow-right");
      card.style.setProperty("--arrow-y", `${arrowY}px`);
    } else if (placement === "right") {
      left = rect.right + gap;
      top = rect.top + rect.height / 2 - cardRect.height / 2;
      const arrowY = clamp(rect.top + rect.height / 2 - top - 7, 14, cardRect.height - 20);
      card.classList.add("tour-arrow-left");
      card.style.setProperty("--arrow-y", `${arrowY}px`);
    } else if (placement === "top") {
      left = rect.left + rect.width / 2 - cardRect.width / 2;
      top = rect.top - cardRect.height - gap;
      const arrowX = clamp(rect.left + rect.width / 2 - left - 7, 14, cardRect.width - 20);
      card.classList.add("tour-arrow-bottom");
      card.style.setProperty("--arrow-x", `${arrowX}px`);
    } else {
      left = rect.left + rect.width / 2 - cardRect.width / 2;
      top = rect.bottom + gap;
      const arrowX = clamp(rect.left + rect.width / 2 - left - 7, 14, cardRect.width - 20);
      card.classList.add("tour-arrow-top");
      card.style.setProperty("--arrow-x", `${arrowX}px`);
    }
  } else {
    left = window.innerWidth / 2 - cardRect.width / 2;
    top = window.innerHeight / 2 - cardRect.height / 2;
    card.classList.add("tour-no-arrow");
  }

  left = clamp(left, pad, window.innerWidth - cardRect.width - pad);
  top = clamp(top, pad, window.innerHeight - cardRect.height - pad);
  card.style.left = `${left}px`;
  card.style.top = `${top}px`;
}

window.addEventListener("resize", () => {
  if (tourState.active) renderTourStep();
});
window.addEventListener("scroll", () => {
  if (tourState.active) renderTourStep();
});

function flagUrl(code) {
  return `${FLAG_CDN}/${code.toLowerCase()}.png`;
}

function assetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  if (path.startsWith("/api/flag/")) {
    const code = path.split("/").pop();
    return code ? flagUrl(code) : "";
  }
  if (path.startsWith("/api/recon/")) {
    const filename = path.split("/").pop();
    return filename ? `${DATA_BASE}/${filename}` : "";
  }
  if (path.startsWith("/")) return path.slice(1);
  return path;
}

let introDone = false;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function finishIntro() {
  if (introDone) return;
  introDone = true;
  $("#intro")?.classList.add("intro-done");
  document.body.classList.remove("intro-active");
  setTimeout(() => {
    $("#intro")?.remove();
    scheduleTourStart(160);
  }, 900);
}

async function runIntro() {
  const container = $("#intro-flags");
  if (!container || !flagsData.length) {
    finishIntro();
    return;
  }

  const mobile = window.matchMedia("(max-width: 900px)").matches;
  const maxIntroFlags = mobile ? 45 : 100;
  const sample = shuffle(flagsData).slice(0, Math.min(maxIntroFlags, flagsData.length));

  sample.forEach((flag) => {
    const img = document.createElement("img");
    img.src = flagUrl(flag.code);
    img.alt = "";
    img.className = "intro-flag";
    img.style.left = `${rand(-15, 95)}%`;
    img.style.top = `${rand(-15, 95)}%`;
    img.style.width = `${rand(56, 120)}px`;
    img.style.setProperty("--tx", `${rand(-130, 130)}vw`);
    img.style.setProperty("--ty", `${rand(-130, 130)}vh`);
    img.style.setProperty("--rot", `${rand(-50, 50)}deg`);
    img.style.setProperty("--delay", `${rand(0, 3)}s`);
    img.style.setProperty("--dur", `${rand(5, 10)}s`);
    container.appendChild(img);
  });

  $("#intro-skip")?.addEventListener("click", finishIntro);
  await new Promise((r) => setTimeout(r, 6500));
  finishIntro();
}

async function loadData() {
  const metaRes = await fetch(`${DATA_BASE}/metadata.json`);
  if (!metaRes.ok) {
    finishIntro();
    $("#prezi-world").innerHTML =
      `<p class="error">${t("error.noStaticData")}</p>`;
    return;
  }
  const metadataPayload = await metaRes.json();
  flagsData = metadataPayload.flags || [];
  metadata = metadataPayload;
  console.log("Załadowane flagi:", flagsData.length, flagsData[0]);
  console.log("Klastry:", [...new Set(flagsData.map((f) => f.cluster))]);
  fixReconstructionUrls();
  await runIntro();
  document.body.classList.add("explore-mode");
  initExplore();
  detailsInitialized = false;
  scheduleTourStart(220);
}

function fixReconstructionUrls() {
  (metadata.reconstructions || []).forEach((r) => {
    if (r.orig_url && !r.orig_url.includes("recon_")) {
      r.orig_url = r.orig_url.replace("/api/recon/", "/api/recon/recon_");
    }
    if (r.rec_url && !r.rec_url.includes("recon_")) {
      r.rec_url = r.rec_url.replace("/api/recon/", "/api/recon/recon_");
    }
  });
}

function initTabs() {
  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".tab").forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      const id = tab.dataset.tab;
      $$(".panel").forEach((p) => {
        p.classList.remove("active");
        p.hidden = true;
      });
      const panel = document.getElementById(`tab-${id}`);
      panel.classList.add("active");
      panel.hidden = false;
      if (id === "details") {
        if (!detailsInitialized) {
          initDetails();
          detailsInitialized = true;
        }
        drawLossChart();
        startEncoderAnim();
        document.body.classList.remove("explore-mode");
        clusterScatter?.setActive?.(true);
        clusterScatter?.resize();
      } else if (id === "explore") {
        stopEncoderAnim();
        document.body.classList.add("explore-mode");
        clusterScatter?.setActive?.(false);
        if (exploreView === "cloud") prezi?.fitAll(0);
        else flagGlobe?.resize();
      } else {
        stopEncoderAnim();
      }
    });
  });
}

function initExplore() {
  initPrezi();
  initSidepanel();
  initExploreViews();
}

function initExploreViews() {
  $$(".explore-subtab").forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.exploreView;
      setExploreView(view);
    });
  });
}

function setExploreView(view) {
  exploreView = view;
  $$(".explore-subtab").forEach((b) => {
    const on = b.dataset.exploreView === view;
    b.classList.toggle("active", on);
    b.setAttribute("aria-selected", on ? "true" : "false");
  });
  const cloud = $("#explore-cloud");
  const globe = $("#explore-globe");
  if (view === "cloud") {
    cloud?.classList.add("active");
    cloud.hidden = false;
    globe?.classList.remove("active");
    if (globe) globe.hidden = true;
    prezi?.fitAll(0);
  } else {
    cloud?.classList.remove("active");
    if (cloud) cloud.hidden = true;
    globe?.classList.add("active");
    globe.hidden = false;
    initGlobeOnce();
  }
}

async function initGlobeOnce() {
  if (flagGlobe || !window.FlagGlobe) return;
  if (!Object.keys(countryCoords).length) {
    try {
      const res = await fetch(`${DATA_BASE}/country_coords.json`);
      if (res.ok) countryCoords = await res.json();
    } catch {
      countryCoords = {};
    }
    flagsData.forEach((f) => {
      const code = f.code.toUpperCase();
      if (f.lat != null && f.lng != null) {
        countryCoords[code] = { lat: f.lat, lng: f.lng };
      }
    });
  }
  if (Object.keys(countryCoords).length < Math.floor(flagsData.length * 0.5)) {
    try {
      const rcRes = await fetch("https://restcountries.com/v3.1/all?fields=cca2,latlng");
      if (rcRes.ok) {
        const rows = await rcRes.json();
        rows.forEach((c) => {
          const code = (c?.cca2 || "").toUpperCase();
          const ll = c?.latlng || [];
          if (code && ll.length >= 2) {
            countryCoords[code] = { lat: Number(ll[0]), lng: Number(ll[1]) };
          }
        });
      }
    } catch {
      // Keep existing coords; globe will still render whatever is available.
    }
  }
  if (flagsData[0]?.code) {
    console.log(
      "Przykład współrzędnych:",
      flagsData[0].code,
      countryCoords[flagsData[0].code.toUpperCase()],
    );
  }
  console.log(
    "[Globe] dostępne współrzędne:",
    Object.keys(countryCoords).length,
    "z",
    flagsData.length,
  );
  const container = $("#globe-container");
  if (!container) return;
  flagGlobe = new FlagGlobe({
    container,
    flagsData,
    metadata,
    coords: countryCoords,
    onFlagClick: openSidepanel,
  });
  populateGlobeClusterSelect();
}

let globeActiveCluster = null;

function populateGlobeClusterSelect() {
  const chipsWrap = $("#globe-cluster-chips");
  if (!chipsWrap || !flagsData.length) return;
  chipsWrap.innerHTML = "";
  const clusters = [...new Set(flagsData.map((f) => f.cluster))].sort((a, b) => a - b);
  const biggest = clusters.reduce((best, cid) => {
    const n = flagsData.filter((f) => f.cluster === cid).length;
    const bn = flagsData.filter((f) => f.cluster === best).length;
    return n > bn ? cid : best;
  }, clusters[0]);
  globeActiveCluster = globeActiveCluster == null ? biggest : globeActiveCluster;

  clusters.forEach((cid) => {
    const clusterFlags = flagsData.filter((f) => f.cluster === cid);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "globe-cluster-chip";
    if (cid === globeActiveCluster) btn.classList.add("active");
    btn.setAttribute("aria-pressed", cid === globeActiveCluster ? "true" : "false");

    const stack = document.createElement("span");
    stack.className = "globe-cluster-chip-stack";
    clusterFlags.slice(0, 5).forEach((flag) => {
      const img = document.createElement("img");
      img.src = flagUrl(flag.code);
      img.alt = "";
      stack.appendChild(img);
    });

    btn.appendChild(stack);
    btn.title = t("cluster.label", { n: cid + 1 });
    btn.setAttribute("aria-label", t("cluster.label", { n: cid + 1 }));
    btn.addEventListener("click", () => {
      globeActiveCluster = cid;
      chipsWrap.querySelectorAll(".globe-cluster-chip").forEach((el) => {
        const isActive = el === btn;
        el.classList.toggle("active", isActive);
        el.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
      flagGlobe?.setCluster(cid);
      flagGlobe?.centerOnCluster(cid);
    });
    chipsWrap.appendChild(btn);
  });

  flagGlobe?.setCluster(globeActiveCluster);
  flagGlobe?.centerOnCluster(globeActiveCluster);
}


function initPrezi() {
  const viewport = $("#prezi-viewport");
  const world = $("#prezi-world");
  if (!viewport || !world || !window.PreziExplorer) return;

  prezi?.destroy();
  prezi = new PreziExplorer({
    viewport,
    world,
    flagsData,
    metadata,
    onFlagClick: openSidepanel,
    onTooltipShow: showTooltip,
    onTooltipHide: hideTooltip,
    onTooltipMove: moveTooltip,
  });
  prezi.build();
}

/** Galeria mini-chmur (zakładka Implementacja) */
function cloudLayout(count, seed = 0) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const positions = [];
  for (let i = 0; i < count; i++) {
    const t = count > 1 ? i / (count - 1) : 0;
    const r = 8 + Math.sqrt(t) * 36;
    const angle = i * golden + seed;
    positions.push({
      x: `${50 + r * Math.cos(angle)}%`,
      y: `${50 + r * Math.sin(angle) * 0.72}%`,
      size: `${Math.round(40 + (1 - t) * 36 + (i % 3) * 4)}px`,
      rot: `${(Math.sin(i * 1.7 + seed) * 14).toFixed(1)}deg`,
      floatDur: `${4 + (i % 5) * 0.6}s`,
      floatDelay: `${(i % 7) * 0.35}s`,
      z: count - i,
    });
  }
  return positions;
}

function cloudSizeClass(n) {
  if (n > 28) return "is-xl";
  if (n > 16) return "is-large";
  return "";
}

function buildClusterCloud(clusterId, flags, { interactive = true, maxFlags = null, compact = false } = {}) {
  const color = flags[0]?.cluster_color || metadata.cluster_colors?.[clusterId] || "#8a7b68";
  const desc = clusterDescription(clusterId);
  const limit = compact ? 24 : maxFlags;
  const show = limit ? flags.slice(0, limit) : flags;
  const positions = cloudLayout(show.length, clusterId * 2.17);

  const cloud = document.createElement("article");
  cloud.className = "cluster-cloud";
  cloud.style.setProperty("--cluster-accent", color);
  cloud.dataset.cluster = clusterId;

  const header = document.createElement("div");
  header.className = "cluster-cloud-header";
  header.innerHTML = `
    <h3 class="cluster-cloud-name">
      <span class="cluster-swatch" style="background:${color}" title="${t("cluster.label", { n: clusterId + 1 })}"></span>
    </h3>
    <p class="cluster-cloud-meta">${flags.length} ${flagNoun(flags.length)}</p>
    ${desc ? `<p class="cluster-cloud-traits">${desc}</p>` : ""}
  `;
  cloud.appendChild(header);

  const body = document.createElement("div");
  body.className = `cluster-cloud-body ${cloudSizeClass(flags.length)}`;

  show.forEach((flag, i) => {
    const pos = positions[i];
    const cell = document.createElement("div");
    cell.className = "cloud-flag";
    cell.style.setProperty("--x", pos.x);
    cell.style.setProperty("--y", pos.y);
    cell.style.setProperty("--size", pos.size);
    cell.style.setProperty("--rot", pos.rot);
    cell.style.setProperty("--float-dur", pos.floatDur);
    cell.style.setProperty("--float-delay", pos.floatDelay);
    cell.style.zIndex = pos.z;

    const img = document.createElement("img");
    img.src = flagUrl(flag.code);
    img.alt = "";
    img.loading = "lazy";
    img.draggable = false;
    cell.appendChild(img);

    if (interactive) {
      cell.addEventListener("mouseenter", (e) => showTooltip(e, countryName(flag.code, flag.country)));
      cell.addEventListener("mousemove", moveTooltip);
      cell.addEventListener("mouseleave", hideTooltip);
      cell.addEventListener("click", () => {
        cell.classList.remove("bounce");
        void cell.offsetWidth;
        cell.classList.add("bounce");
        openSidepanel(flag);
      });
    }

    body.appendChild(cell);
  });

  cloud.appendChild(body);

  if (!interactive && flags.length > show.length) {
    const hint = document.createElement("p");
    hint.className = "cluster-cloud-hint";
    hint.textContent = t("cluster.hint.more", { n: flags.length - show.length });
    cloud.appendChild(hint);
  }

  return cloud;
}

const tooltip = $("#tooltip");

function showTooltip(e, text) {
  tooltip.textContent = text;
  tooltip.classList.add("visible");
  moveTooltip(e);
}

function moveTooltip(e) {
  tooltip.style.left = `${e.clientX + 14}px`;
  tooltip.style.top = `${e.clientY + 14}px`;
}

function hideTooltip() {
  tooltip.classList.remove("visible");
}

function initSidepanel() {
  $(".sidepanel-close").addEventListener("click", closeSidepanel);
  $("#overlay").addEventListener("click", closeSidepanel);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidepanel();
  });
}

function openSidepanel(flag) {
  $("#panel-flag").src = flagUrl(flag.code);
  $("#panel-country").textContent = countryName(flag.code, flag.country);
  $("#panel-code").textContent = flag.code;
  const badge = $("#panel-cluster-badge");
  badge.dataset.clusterId = String(flag.cluster);
  badge.textContent = t("cluster.label", { n: flag.cluster + 1 });
  badge.style.background = flag.cluster_color;

  const nb = $("#panel-neighbors");
  nb.innerHTML = "";
  const full = flagsData.find((f) => f.code === flag.code) || flag;
  (full.neighbors || []).forEach((code) => {
    const img = document.createElement("img");
    img.src = flagUrl(code);
    const neighbor = flagsData.find((f) => f.code === code);
    img.alt = countryName(code, neighbor?.country || code);
    img.title = countryName(code, neighbor?.country || code);
    img.addEventListener("click", () => {
      if (neighbor) openSidepanel(neighbor);
    });
    nb.appendChild(img);
  });

  $("#sidepanel").classList.add("open");
  $("#sidepanel").setAttribute("aria-hidden", "false");
  $("#overlay").classList.remove("hidden");
}

function closeSidepanel() {
  $("#sidepanel").classList.remove("open");
  $("#sidepanel").setAttribute("aria-hidden", "true");
  $("#overlay").classList.add("hidden");
}

function initClusterScatter() {
  if (!window.ClusterScatter) return;
  const canvas = $("#scatter-canvas");
  const container3d = $("#scatter-3d");
  if (!canvas || !container3d) return;

  clusterScatter = new ClusterScatter({
    canvas2d: canvas,
    container3d,
    flagsData,
    metadata,
    onPointClick: openSidepanel,
    onTooltipShow: showTooltip,
    onTooltipMove: moveTooltip,
    onTooltipHide: hideTooltip,
  });

  canvas.addEventListener("mousemove", (e) => {
    const hit = clusterScatter.updateHover2d(e.clientX, e.clientY);
    if (hit) {
      showTooltip(
        e,
        `${countryName(hit.code, hit.country)} · ${t("cluster.label", { n: hit.cluster + 1 }).toLowerCase()}`,
      );
      canvas.style.cursor = "pointer";
    } else {
      hideTooltip();
      canvas.style.cursor = "crosshair";
    }
  });
  canvas.addEventListener("mouseleave", () => {
    hideTooltip();
    canvas.style.cursor = "crosshair";
  });
  canvas.addEventListener("click", (e) => {
    const hit = clusterScatter.hitTest2d(e.clientX, e.clientY);
    if (hit?.flag) openSidepanel(hit.flag);
  });
  clusterScatter.initDualView();
  window.addEventListener("resize", () => clusterScatter?.resize());
}

function initDetails() {
  renderPipeline();
  renderClustersGallery();
  initClusterScatter();
  initReconstructionTrace();
}

let traceInitDone = false;
let reconstructionOptions = [];

function initReconstructionTrace() {
  const select = $("#trace-code-select");
  const wrap = $("#reconstruction-trace");
  if (!select || !wrap || !flagsData.length) return;

  const selected = select.value;
  select.innerHTML = "";
  const samples = (metadata.reconstructions || []).map((r) => ({
    code: (r.code || "").toUpperCase(),
    country: countryName(r.code, r.country || r.code || ""),
    origUrl: assetUrl(r.orig_url),
    recUrl: assetUrl(r.rec_url),
  })).filter((r) => r.code && r.origUrl && r.recUrl);
  const preferred = samples.filter((r) => STATIC_TRACE_CODES.has(r.code));
  const sortedAll = [...flagsData]
    .map((f) => ({ code: f.code.toUpperCase(), country: countryName(f.code, f.country || f.code) }))
    .sort((a, b) => a.country.localeCompare(b.country, currentLang));
  reconstructionOptions = preferred.length ? preferred : (samples.length ? samples : sortedAll);

  reconstructionOptions.forEach((f) => {
    const opt = document.createElement("option");
    opt.value = f.code.toUpperCase();
    opt.textContent = `${f.country} (${f.code.toUpperCase()})`;
    select.appendChild(opt);
  });
  if (!traceInitDone) {
    select.addEventListener("change", () => loadReconstructionTrace(select.value));
    traceInitDone = true;
  }

  if (selected && reconstructionOptions.some((o) => o.code === selected)) {
    select.value = selected;
  } else if (!select.value) {
    select.value = reconstructionOptions[0]?.code || flagsData[0].code.toUpperCase();
  }
  loadReconstructionTrace(select.value);
}

async function loadReconstructionTrace(code) {
  const wrap = $("#reconstruction-trace");
  if (!wrap) return;
  wrap.innerHTML = `<p class="card-desc">${t("trace.loading")}</p>`;

  try {
    const res = await fetch(`${DATA_BASE}/reconstruction-traces/${code.toLowerCase()}.json`);
    if (res.ok) {
      const data = await res.json();
      renderReconstructionStages(data.stages || []);
      return;
    }
  } catch {
    // Fallback below.
  }

  const sample = reconstructionOptions.find((r) => r.code === code.toUpperCase());
  if (!sample?.origUrl || !sample?.recUrl) {
    wrap.innerHTML =
      `<p class="card-desc">${t("trace.missing")}</p>`;
    return;
  }

  renderReconstructionStages([
    { name: t("trace.stage.input"), shape: "3×64×64", image_url: sample.origUrl },
    { name: t("trace.stage.output"), shape: "3×64×64", image_url: sample.recUrl },
  ]);
}

function renderReconstructionStages(stages) {
  const wrap = $("#reconstruction-trace");
  if (!wrap) return;
  wrap.innerHTML = "";

  stages.forEach((stage) => {
    const stageName = stage.i18n_key ? t(stage.i18n_key) : (stage.name || "Stage");
    const card = document.createElement("article");
    card.className = "trace-stage";
    const img = document.createElement("img");
    img.alt = stageName;
    img.src = stage.image_b64 ? `data:image/png;base64,${stage.image_b64}` : assetUrl(stage.image_url);
    const meta = document.createElement("div");
    meta.className = "trace-stage-meta";
    const title = document.createElement("p");
    title.className = "trace-stage-name";
    title.textContent = stageName;
    const shape = document.createElement("p");
    shape.className = "trace-stage-shape";
    shape.textContent = stage.shape || "";
    meta.appendChild(title);
    meta.appendChild(shape);
    card.appendChild(img);
    card.appendChild(meta);
    wrap.appendChild(card);
  });
}

// ===== PIPELINE ANIMATION =====

function renderPipeline() {
  const container = $("#pipeline-anim");
  if (!container) return;

  const arch = metadata.architecture || {};
  const nClusters = arch.n_clusters || (metadata.clusters || []).length || "?";
  const nCountries = arch.n_countries || flagsData.length;
  const reduction = metadata.reduction_method || "UMAP";

  const steps = [
    { icon: "🏳️", name: t("pipeline.input.name"), detail: t("pipeline.input.detail", { n: nCountries }), dim: "64 × 64 × 3", phase: "input" },
    { icon: "⬇", name: t("pipeline.encode.name"), detail: t("pipeline.encode.detail"), dim: "64² → 32² → 16²", phase: "encode" },
    { icon: "◆", name: t("pipeline.latent.name"), detail: t("pipeline.latent.detail"), dim: "z ∈ ℝ¹²⁸", phase: "latent" },
    { icon: "⬆", name: t("pipeline.decode.name"), detail: t("pipeline.decode.detail"), dim: "16² → 32² → 64²", phase: "decode" },
    { icon: "⊞", name: t("pipeline.cluster.name"), detail: t("pipeline.cluster.detail", { n: nClusters }), dim: t("pipeline.cluster.dim"), phase: "cluster" },
    { icon: "⊛", name: reduction, detail: t("pipeline.reduce.detail"), dim: "128D → 2D", phase: "reduce" },
    { icon: "🗺️", name: t("pipeline.output.name"), detail: t("pipeline.output.detail"), dim: "2D / 3D UMAP", phase: "output" },
  ];

  let html = '<div class="pipeline-steps">';
  steps.forEach((step, i) => {
    html += `<div class="pipeline-step pipeline-step--${step.phase}">
      <div class="pipeline-step-icon">${step.icon}</div>
      <div class="pipeline-step-body">
        <div class="pipeline-step-name">${step.name}</div>
        <div class="pipeline-step-detail">${step.detail}</div>
        <div class="pipeline-step-dim">${step.dim}</div>
      </div>
    </div>`;
    if (i < steps.length - 1) {
      html += `<div class="pipeline-arrow" style="--pipe-delay:${i * 0.35}s"><div class="pipeline-dot"></div></div>`;
    }
  });
  html += "</div>";
  container.innerHTML = html;
}

// ===== ENCODER CANVAS ANIMATION =====

let ENC_BLOCKS = [
  { name: "Wejście",   dim: "3 × 64²",   h: 100, w: 14, sheets: 1, color: "#d4c5b0" },
  { name: "64 × 64²",  dim: "Conv·BN·ReLU", h: 100, w: 20, sheets: 2, color: "#c0a880" },
  { name: "128 × 32²", dim: "stride 2 ↓",   h: 50,  w: 24, sheets: 2, color: "#a88860" },
  { name: "256 × 16²", dim: "stride 2 ↓",   h: 25,  w: 28, sheets: 3, color: "#906848" },
  { name: "z ∈ ℝ¹²⁸", dim: "FC bottleneck", h: 8,   w: 44, sheets: 1, color: "#b8956a", isLatent: true },
  { name: "256 × 16²", dim: "FC reshape",    h: 25,  w: 28, sheets: 3, color: "#906848" },
  { name: "128 × 32²", dim: "stride 2 ↑",   h: 50,  w: 24, sheets: 2, color: "#a88860" },
  { name: "64 × 64²",  dim: "ConvT·BN·ReLU",h: 100, w: 20, sheets: 2, color: "#c0a880" },
  { name: "Wyjście",   dim: "3 × 64²",   h: 100, w: 14, sheets: 1, color: "#d4c5b0" },
];

function updateEncoderBlockLabels() {
  if (!ENC_BLOCKS.length) return;
  ENC_BLOCKS[0].name = t("encoder.input");
  ENC_BLOCKS[8].name = t("encoder.output");
}

let encParticles = [];
let encAnimId = null;
let encDpr = 1;
let encCssW = 760;
const ENC_CSS_H = 210;
const ENC_BOTTOM_Y = 150;

function initEncParticles() {
  encParticles = Array.from({ length: 20 }, (_, i) => ({
    t: i / 20,
    speed: 0.0008 + (i % 6) * 0.00025,
    size: 1.8 + (i % 4) * 0.55,
    opacity: 0.45 + (i % 5) * 0.1,
  }));
}

function shadeHex(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return `rgb(${r},${g},${b})`;
}

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

function drawEncBlock(ctx, cx, bottomY, block) {
  const { w, h, sheets, color, isLatent } = block;
  const top = bottomY - h;
  const sheetOff = 3;

  // Shadow sheets (stacked behind)
  for (let s = sheets; s >= 1; s--) {
    ctx.globalAlpha = 0.35 + (s / sheets) * 0.25;
    ctx.fillStyle = shadeHex(color, -28);
    rrect(ctx, cx - w / 2 + s * sheetOff, top - s * sheetOff, w, h, 3);
    ctx.fill();
  }

  // Front face
  ctx.globalAlpha = 1;
  if (isLatent) {
    const grad = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
    grad.addColorStop(0, "#c9a878");
    grad.addColorStop(0.5, "#d4b888");
    grad.addColorStop(1, "#c9a878");
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = color;
  }
  rrect(ctx, cx - w / 2, top, w, h, 3);
  ctx.fill();
  ctx.strokeStyle = "rgba(44,36,22,0.18)";
  ctx.lineWidth = 0.75;
  ctx.stroke();

  if (isLatent) {
    ctx.save();
    const glow = ctx.createRadialGradient(cx, bottomY - h / 2, 0, cx, bottomY - h / 2, 55);
    glow.addColorStop(0, "rgba(184,149,106,0.22)");
    glow.addColorStop(1, "rgba(184,149,106,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, bottomY - h / 2, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function encBlockCenters(W) {
  const n = ENC_BLOCKS.length;
  const padX = 36;
  const usable = W - 2 * padX;
  return ENC_BLOCKS.map((b, i) => ({
    cx: padX + (i / (n - 1)) * usable,
    cy: ENC_BOTTOM_Y - b.h / 2,
  }));
}

function encTrackPoint(t, centers) {
  const n = centers.length - 1;
  const seg = Math.min(Math.floor(t * n), n - 1);
  const st = t * n - seg;
  const p0 = centers[seg];
  const p1 = centers[seg + 1];
  return {
    x: p0.cx + (p1.cx - p0.cx) * st,
    y: p0.cy + (p1.cy - p0.cy) * st,
  };
}

function drawEncoderFrame(canvas, ts) {
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.scale(encDpr, encDpr);
  const W = encCssW;
  const H = ENC_CSS_H;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#ebe4d8";
  ctx.fillRect(0, 0, W, H);

  const centers = encBlockCenters(W);

  // Connecting lines
  ctx.strokeStyle = "rgba(160,128,80,0.3)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 4]);
  for (let i = 0; i < centers.length - 1; i++) {
    ctx.beginPath();
    ctx.moveTo(centers[i].cx + ENC_BLOCKS[i].w / 2 + ENC_BLOCKS[i].sheets * 3, centers[i].cy);
    ctx.lineTo(centers[i + 1].cx - ENC_BLOCKS[i + 1].w / 2, centers[i + 1].cy);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Blocks
  for (let i = 0; i < ENC_BLOCKS.length; i++) {
    drawEncBlock(ctx, centers[i].cx, ENC_BOTTOM_Y, ENC_BLOCKS[i]);
  }

  // Section divider line
  const latentX = centers[4].cx;
  ctx.strokeStyle = "rgba(184,149,106,0.25)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 5]);
  ctx.beginPath();
  ctx.moveTo(latentX, 6);
  ctx.lineTo(latentX, ENC_BOTTOM_Y + 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Section labels
  ctx.textAlign = "center";
  ctx.font = "600 9px DM Sans, sans-serif";
  ctx.fillStyle = "rgba(122,99,72,0.7)";
  ctx.fillText(t("encoder.enc"), (centers[0].cx + centers[3].cx) / 2, 13);
  ctx.fillText(t("encoder.dec"), (centers[5].cx + centers[8].cx) / 2, 13);
  ctx.fillStyle = "#b8956a";
  ctx.font = "700 9px DM Sans, sans-serif";
  ctx.fillText("z", latentX, 13);

  // Block labels
  for (let i = 0; i < ENC_BLOCKS.length; i++) {
    const { cx } = centers[i];
    const b = ENC_BLOCKS[i];
    const labelY = ENC_BOTTOM_Y + 16;
    ctx.textAlign = "center";
    ctx.font = `${b.isLatent ? "700" : "500"} 8.5px DM Sans, sans-serif`;
    ctx.fillStyle = b.isLatent ? "#7a6348" : "#5c4f3d";
    ctx.fillText(b.name, cx, labelY);
    ctx.font = "400 7.5px DM Sans, sans-serif";
    ctx.fillStyle = "#8a7b68";
    ctx.fillText(b.dim, cx, labelY + 11);
  }

  // Particles
  const t = ts / 1000;
  for (const p of encParticles) {
    p.t = (p.t + p.speed) % 1;
    const pt = encTrackPoint(p.t, centers);
    const pulse = 0.7 + 0.3 * Math.sin(t * 4 + p.t * Math.PI * 6);

    ctx.save();
    ctx.globalAlpha = p.opacity * pulse;
    const gr = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, p.size * 2.8);
    gr.addColorStop(0, "rgba(200,165,110,0.9)");
    gr.addColorStop(1, "rgba(184,149,106,0)");
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, p.size * 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = "#e8d4b0";
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

function startEncoderAnim() {
  if (encAnimId) return;
  const canvas = $("#encoder-canvas");
  if (!canvas) return;

  encDpr = window.devicePixelRatio || 1;
  encCssW = (canvas.parentElement?.clientWidth || 760);
  canvas.width = encCssW * encDpr;
  canvas.height = ENC_CSS_H * encDpr;

  initEncParticles();

  const tick = (ts) => {
    drawEncoderFrame(canvas, ts);
    encAnimId = requestAnimationFrame(tick);
  };
  encAnimId = requestAnimationFrame(tick);
}

function stopEncoderAnim() {
  if (encAnimId) {
    cancelAnimationFrame(encAnimId);
    encAnimId = null;
  }
}

async function drawLossChart() {
  const canvas = $("#loss-chart");
  if (!canvas) return;
  const res = await fetch(`${DATA_BASE}/training_history.json`);
  if (!res.ok) return;
  const { loss } = await res.json();
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || 800;
  const h = 280;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  const pad = { t: 24, r: 24, b: 44, l: 56 };
  const maxLoss = Math.max(...loss) * 1.05;
  const minLoss = Math.min(...loss) * 0.92;

  ctx.fillStyle = THEME.chartBg;
  ctx.fillRect(0, 0, w, h);

  const sx = (i) => pad.l + (i / (loss.length - 1 || 1)) * (w - pad.l - pad.r);
  const sy = (v) => pad.t + (1 - (v - minLoss) / (maxLoss - minLoss || 1)) * (h - pad.t - pad.b);

  ctx.strokeStyle = THEME.chartGrid;
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + (i / 4) * (h - pad.t - pad.b);
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(w - pad.r, y);
    ctx.stroke();
  }

  const gradient = ctx.createLinearGradient(pad.l, pad.t, pad.l, h - pad.b);
  gradient.addColorStop(0, "rgba(122, 99, 72, 0.25)");
  gradient.addColorStop(1, "rgba(122, 99, 72, 0)");

  ctx.beginPath();
  loss.forEach((v, i) => {
    const x = sx(i);
    const y = sy(v);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(sx(loss.length - 1), h - pad.b);
  ctx.lineTo(sx(0), h - pad.b);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.strokeStyle = THEME.chartLine;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.beginPath();
  loss.forEach((v, i) => {
    const x = sx(i);
    const y = sy(v);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = THEME.chartText;
  ctx.font = "500 11px DM Sans, sans-serif";
  ctx.fillText(t("chart.epoch"), w / 2 - 18, h - 12);
  ctx.save();
  ctx.translate(16, h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("MSE", 0, 0);
  ctx.restore();
}

function renderClustersGallery() {
  const gallery = $("#clusters-gallery");
  if (!gallery) return;
  gallery.innerHTML = "";

  const byCluster = new Map();
  flagsData.forEach((f) => {
    if (!byCluster.has(f.cluster)) byCluster.set(f.cluster, []);
    byCluster.get(f.cluster).push(f);
  });

  [...byCluster.keys()].sort((a, b) => a - b).forEach((cid) => {
    const flags = byCluster.get(cid);
    gallery.appendChild(buildClusterCloud(cid, flags, { interactive: false, maxFlags: 18 }));
  });
}

initLanguageSwitch();
updateEncoderBlockLabels();
initTabs();
loadData();
