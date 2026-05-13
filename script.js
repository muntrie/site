const CONTENT = window.MUNTRIE_SITE_CONTENT || {};
const SITE_CONFIG = window.MUNTRIE_SITE_CONFIG || {};
const PAGE = document.body.dataset.page || "home";
const STORAGE_KEY = "muntrie-site-locale";

const localeButtons = Array.from(document.querySelectorAll("[data-locale-choice]"));
const yearNodes = Array.from(document.querySelectorAll("[data-current-year]"));
const heroNode = document.querySelector(".hero");
const liveTimeNode = document.querySelector("[data-live-time]");
const stageBackgroundsNode = document.querySelector("[data-stage-backgrounds]");
const stageCenterNode = document.querySelector(".stage-center");
const deviceShellNode = document.querySelector("[data-device-shell]");
const previewSoundButton = document.querySelector("[data-preview-sound-toggle]");
const previewSoundLabelNode = document.querySelector("[data-preview-sound-label]");
const previewAmbientValueNodes = Array.from(document.querySelectorAll("[data-preview-ambient-value]"));
const previewMusicValueNodes = Array.from(document.querySelectorAll("[data-preview-music-value]"));
const previewSceneValueNodes = Array.from(document.querySelectorAll("[data-preview-scene-value]"));
const previewAmbientAudioNode = document.querySelector("[data-preview-audio-ambient]");
const previewMusicAudioNode = document.querySelector("[data-preview-audio-music]");
const navToggleNode = document.querySelector(".nav-toggle");
const siteNavNode = document.querySelector(".site-nav");
const siteHeaderNode = document.querySelector(".site-header");
const navIndicatorNode = document.querySelector("[data-nav-active-indicator]");
const timeSlotNodes = ["h1", "h2", "m1", "m2", "s1", "s2"].map((slot) =>
  document.querySelector(`[data-time-slot="${slot}"]`),
);

let revealObserver = null;
let activeNavObserver = null;
let navOverlayNode = null;
let activeLocale = "en";
let stageClockLayoutObserver = null;
let activeStageBackgroundIndex = 0;
let stageBackgroundEntries = [];
let currentPreviewOrientation = "landscape";
let previewSoundEnabled = false;
let navIndicatorFrame = 0;
let activeNavScrollBound = false;
let stickyHeaderScrollBound = false;

function getPath(object, path) {
  return path.split(".").reduce((current, key) => current?.[key], object);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

function escapeCssUrl(value) {
  return String(value).replace(/["\\\n\r\f]/g, "\\$&");
}

function cssImageUrl(value) {
  return `url("${escapeCssUrl(value)}")`;
}

function buildCssImageValue(entry) {
  const image = typeof entry === "string" ? entry : entry?.image;
  if (!image) return "none";

  const imageLarge = typeof entry === "string" ? "" : entry?.imageLarge;
  if (!imageLarge || imageLarge === image) {
    return cssImageUrl(image);
  }

  return `image-set(${cssImageUrl(image)} 1x, ${cssImageUrl(imageLarge)} 2x)`;
}

function renderImageSourceAttributes(item, sizes) {
  const srcsetCandidates = [
    item.src ? `${escapeHtml(item.src)} 1200w` : "",
    item.srcLarge ? `${escapeHtml(item.srcLarge)} 1800w` : "",
  ].filter(Boolean);
  const srcset = srcsetCandidates.length ? ` srcset="${srcsetCandidates.join(", ")}"` : "";
  const sizeAttr = sizes ? ` sizes="${escapeHtml(sizes)}"` : "";
  return `src="${escapeHtml(item.src)}"${srcset}${sizeAttr}`;
}

function resolveLocale() {
  const storedLocale = window.localStorage.getItem(STORAGE_KEY);
  if (storedLocale && CONTENT[storedLocale]) {
    return storedLocale;
  }

  const systemLocale =
    (navigator.languages && navigator.languages[0]) || navigator.language || "en";
  return systemLocale.toLowerCase().startsWith("zh") ? "zh" : "en";
}

function updateMeta(locale) {
  const pageMeta = getPath(CONTENT[locale], `meta.${PAGE}`);
  if (!pageMeta) return;

  document.title = pageMeta.title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", pageMeta.description);
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", pageMeta.title);
  document
    .querySelector('meta[property="og:description"]')
    ?.setAttribute("content", pageMeta.description);

  const siteUrl = SITE_CONFIG.siteUrl || "";
  if (siteUrl) {
    const pagePath = PAGE === "home" ? "/" : `/${PAGE}.html`;
    const fullUrl = siteUrl.replace(/\/$/, "") + pagePath;
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", fullUrl);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", fullUrl);
  }
}

function applyTextContent(locale) {
  document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  document.body.dataset.locale = locale;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    if (!key) return;
    const value = getPath(CONTENT[locale], key);
    if (typeof value === "string") {
      element.textContent = value;
    }
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    const key = element.getAttribute("data-i18n-aria-label");
    if (!key) return;
    const value = getPath(CONTENT[locale], key);
    if (typeof value === "string") {
      element.setAttribute("aria-label", value);
    }
  });

  localeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.localeChoice === locale);
  });
}

function renderConfigLinks(locale) {
  document.querySelectorAll("[data-config-email]").forEach((element) => {
    const type = element.getAttribute("data-config-email");
    const email = getContactEmail(type);
    element.setAttribute("href", `mailto:${email}`);
    if (element.hasAttribute("data-config-email-value")) {
      element.textContent = email;
    }
    // Otherwise do NOT overwrite textContent — the i18n label is the visible text.
  });
}

function getContactEmail(type = "support") {
  const contact = SITE_CONFIG.contact || {};
  const contactEmailKeys = {
    support: "supportEmail",
    billing: "billingEmail",
    privacy: "privacyEmail",
    security: "securityEmail",
    operations: "operationsEmail",
    operator: "operationsEmail",
    developer: "developerEmail",
    admin: "adminEmail",
    legal: "legalEmail",
  };
  const key = contactEmailKeys[type] || `${type}Email`;
  return contact[key] || contact.supportEmail || "support@muntrie.com";
}

function renderHome(locale) {
  if (PAGE !== "home") return;

  const home = CONTENT[locale]?.home;
  if (!home) return;

  renderStageBackgrounds(home.stage?.backgrounds || []);
  renderStagePreview(locale, home.stage || {});

  const heroStats = document.querySelector("[data-home-hero-stats]");
  if (heroStats) {
    heroStats.innerHTML = home.hero.stats
      .map(
        (item) => `
          <div class="hero-stat" data-reveal>
            <dt>${escapeHtml(item.title)}</dt>
            ${item.body ? `<dd>${escapeHtml(item.body)}</dd>` : ""}
          </div>
        `,
      )
      .join("");
  }

  renderSimpleCards(
    "[data-home-experience-cards]",
    home.experience.cards,
    (item) => `
      <article class="experience-card glass" data-reveal>
        <span class="card-index">${escapeHtml(item.index)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.body)}</p>
      </article>
    `,
  );

  renderSimpleCards(
    "[data-home-feature-cards]",
    home.features.cards,
    (item) => `
      <article class="feature-card glass" data-reveal>
        <p class="feature-kicker">${escapeHtml(item.kicker)}</p>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.body)}</p>
      </article>
    `,
  );

  renderSimpleCards(
    "[data-home-scene-cards]",
    home.scenes.cards,
    (item) => `
      <article class="scene-card glass" data-reveal>
        <img ${renderImageSourceAttributes(item, "(min-width: 900px) 46vw, 100vw")} alt="${escapeHtml(item.alt)}" width="600" height="750" loading="lazy" decoding="async" />
        <div class="scene-card-copy">
          <p class="scene-kicker">${escapeHtml(item.kicker)}</p>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.body)}</p>
        </div>
      </article>
    `,
  );

  renderSimpleCards(
    "[data-home-principle-cards]",
    home.principles.cards,
    (item) => `
      <article class="principle-card glass" data-reveal>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.body)}</p>
      </article>
    `,
  );

  renderSimpleCards("[data-closing-download-cards]", home.download.cards, (item, index) =>
    renderClosingDownloadCard(item, index),
  );
}

function getDownloadCardState(index) {
  const configEntry = index === 0 ? SITE_CONFIG.downloads?.ios : SITE_CONFIG.downloads?.android;
  const href = configEntry?.href || "#";
  const isPlaceholder = Boolean(configEntry?.placeholder || href === "#");
  const ctaAttrs = isPlaceholder ? "" : 'target="_blank" rel="noreferrer"';

  return { href, isPlaceholder, ctaAttrs };
}

function getStoreBadgeMeta(index) {
  if (index === 0) {
    return {
      modifier: "store-badge--apple",
      label: "Download on the App Store",
      title: "App Store",
      icon: `
        <svg class="store-badge-svg" viewBox="0 0 24 28" aria-hidden="true">
          <path fill="currentColor" d="M16.7 1.4c.1 1.4-.4 2.8-1.3 3.8-.9 1-2.4 1.8-3.7 1.7-.1-1.4.5-2.8 1.3-3.7.9-1 2.5-1.8 3.7-1.8Z"/>
          <path fill="currentColor" d="M20.8 19.9c-.6 1.4-.9 2-1.7 3.2-1.1 1.7-2.6 3.7-4.5 3.7-1.7 0-2.1-1.1-4.4-1.1s-2.8 1.1-4.5 1.1c-1.9 0-3.3-1.9-4.4-3.6-3-4.6-3.3-10.1-1.5-13 1.3-2.1 3.4-3.3 5.4-3.3s3.3 1.1 5 1.1c1.6 0 2.6-1.1 4.9-1.1 1.8 0 3.6 1 5 2.6-4.4 2.5-3.7 8.7.7 10.4Z"/>
        </svg>
      `,
    };
  }

  return {
    modifier: "store-badge--google",
    label: "Get it on Google Play",
    title: "Google Play",
    icon: `
      <svg class="store-badge-svg" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M9 7.6 39.9 38.5 9 56.4c-1.7-1.1-2.8-3.1-2.8-5.4V13c0-2.3 1.1-4.3 2.8-5.4Z" fill="#4ec4ff"/>
        <path d="M9 7.6 47.7 30l-7.8 8.5L9 7.6Z" fill="#52e08d"/>
        <path d="M47.7 30 58 36 47.7 42l-7.8-3.5 7.8-8.5Z" fill="#ffc93c"/>
        <path d="M9 56.4 39.9 38.5l7.8 3.5L9 56.4Z" fill="#ff7a63"/>
      </svg>
    `,
  };
}

function renderStoreBadge(index, href, isPlaceholder, ctaAttrs) {
  const meta = getStoreBadgeMeta(index);
  const tag = isPlaceholder ? "div" : "a";
  const attrs = isPlaceholder
    ? `class="store-badge ${meta.modifier} store-badge-static" aria-label="${meta.label}"`
    : `class="store-badge ${meta.modifier}" href="${escapeHtml(href)}" ${ctaAttrs} aria-label="${meta.label}"`;

  return `
    <${tag} ${attrs}>
      <span class="store-badge-icon" aria-hidden="true">
        ${meta.icon}
      </span>
      <span class="store-badge-title">${meta.title}</span>
    </${tag}>
  `;
}

function renderClosingDownloadCard(item, index) {
  const { href, isPlaceholder, ctaAttrs } = getDownloadCardState(index);

  return `
    <article class="closing-download-card">
      ${renderStoreBadge(index, href, isPlaceholder, ctaAttrs)}
      <div class="closing-download-qr">
        <img class="closing-download-qr-image" src="${escapeHtml(item.asset)}" alt="${escapeHtml(item.platform)} QR" loading="lazy" />
      </div>
    </article>
  `;
}

function renderStageBackgrounds(backgrounds) {
  if (!stageBackgroundsNode) return;

  stageBackgroundEntries = Array.isArray(backgrounds)
    ? backgrounds
        .map((entry) => (typeof entry === "string" ? { image: entry } : entry))
        .filter((entry) => entry?.image)
    : [];

  stageBackgroundsNode.innerHTML = stageBackgroundEntries
    .slice(0, 1)
    .map((entry) => renderStageBackground(entry))
    .join("");

  activeStageBackgroundIndex = 0;
  setupStageBackgroundMotion();
  renderStageIndicators();
}

function renderStageBackground(entry) {
  return `
    <div
      class="stage-background is-active"
      style="--stage-background-image: ${escapeHtml(buildCssImageValue(entry))};"
    ></div>
  `;
}

function renderActiveStageBackground() {
  if (!stageBackgroundsNode) return;

  const activeEntry = getActiveStageEntry();
  stageBackgroundsNode.innerHTML = activeEntry ? renderStageBackground(activeEntry) : "";
}

function renderStageIndicators() {
  const container = document.querySelector("[data-stage-indicators]");
  if (!container) return;

  if (stageBackgroundEntries.length <= 1) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = stageBackgroundEntries
    .map(
      (entry, index) =>
        `<button class="stage-indicator${index === 0 ? " is-active" : ""}" type="button" data-scene-index="${index}" aria-label="${escapeHtml(entry.title || `Scene ${index + 1}`)}" aria-pressed="${index === 0 ? "true" : "false"}" title="${escapeHtml(entry.title || `Scene ${index + 1}`)}"></button>`,
    )
    .join("");

  container.querySelectorAll(".stage-indicator").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetIndex = parseInt(btn.dataset.sceneIndex, 10);
      if (isNaN(targetIndex) || targetIndex === activeStageBackgroundIndex) return;
      switchToStageBackground(targetIndex);
    });
  });
}

function updateStageIndicators() {
  const indicators = document.querySelectorAll(".stage-indicator");
  indicators.forEach((btn, index) => {
    const isActive = index === activeStageBackgroundIndex;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function switchToStageBackground(targetIndex) {
  if (!stageBackgroundsNode || targetIndex === activeStageBackgroundIndex) return;
  if (!stageBackgroundEntries[targetIndex]) return;

  activeStageBackgroundIndex = targetIndex;
  renderActiveStageBackground();

  setupStageBackgroundMotion();
  updateStageIndicators();
  const stageContent = CONTENT[activeLocale]?.home?.stage || {};
  updateActiveStagePreview(activeLocale, stageContent);
}

function renderStagePreview(locale, stageContent) {
  applyPreviewOrientation(currentPreviewOrientation, stageContent);
  updateActiveStagePreview(locale, stageContent);
}

function getActiveStageEntry() {
  return stageBackgroundEntries[activeStageBackgroundIndex] || stageBackgroundEntries[0] || null;
}

function applyPreviewOrientation(orientation, stageContent) {
  currentPreviewOrientation = orientation === "landscape" ? "landscape" : "portrait";

  heroNode?.setAttribute("data-preview-orientation", currentPreviewOrientation);
  deviceShellNode?.setAttribute("data-preview-orientation", currentPreviewOrientation);
}

function updateActiveStagePreview(locale, stageContent) {
  const activeEntry = getActiveStageEntry();

  previewAmbientValueNodes.forEach((node) => {
    node.textContent = activeEntry?.ambientTitle || activeEntry?.title || "Ambient Mix";
  });

  previewMusicValueNodes.forEach((node) => {
    node.textContent = stageContent.musicTitle || "Calm Piano";
  });

  previewSceneValueNodes.forEach((node) => {
    node.textContent = activeEntry?.title || stageContent.label || "Home stage";
  });

  if (previewSoundEnabled) {
    syncPreviewAudioSources(stageContent, activeEntry);
  }
  syncPreviewAudio(stageContent, activeEntry);
  updatePreviewSoundUi(stageContent);
  syncStageClockLayout();
}

function syncPreviewAudioSources(stageContent, activeEntry) {
  if (!previewAmbientAudioNode || !previewMusicAudioNode) return false;

  const ambientSrc = activeEntry?.ambientSrc || "";
  const musicSrc = stageContent.musicSrc || "";
  let didChangeSource = false;

  if (ambientSrc && previewAmbientAudioNode.getAttribute("src") !== ambientSrc) {
    previewAmbientAudioNode.setAttribute("src", ambientSrc);
    previewAmbientAudioNode.load();
    didChangeSource = true;
  }

  if (musicSrc && previewMusicAudioNode.getAttribute("src") !== musicSrc) {
    previewMusicAudioNode.setAttribute("src", musicSrc);
    previewMusicAudioNode.load();
    didChangeSource = true;
  }

  return didChangeSource;
}

function syncPreviewAudio(stageContent, activeEntry) {
  if (!previewAmbientAudioNode || !previewMusicAudioNode) return;

  previewAmbientAudioNode.loop = true;
  previewMusicAudioNode.loop = true;
  previewAmbientAudioNode.volume = 0.34;
  previewMusicAudioNode.volume = 0.18;

  if (previewSoundEnabled && (previewAmbientAudioNode.paused || previewMusicAudioNode.paused)) {
    void playPreviewAudio();
  }
}

function updatePreviewSoundUi(stageContent) {
  if (!previewSoundButton || !previewSoundLabelNode) return;

  const label = previewSoundEnabled
    ? stageContent.soundOn || "Sound on"
    : stageContent.soundOff || "Sound off";

  previewSoundButton.setAttribute("aria-pressed", previewSoundEnabled ? "true" : "false");
  previewSoundButton.setAttribute("aria-label", label);
  previewSoundButton.setAttribute("title", label);
  previewSoundLabelNode.textContent = label;
  heroNode?.setAttribute("data-preview-sound", previewSoundEnabled ? "on" : "off");
}

async function playPreviewAudio() {
  const playableNodes = [previewAmbientAudioNode, previewMusicAudioNode].filter(Boolean);
  if (playableNodes.length === 0) return;

  const results = await Promise.allSettled(playableNodes.map((audioNode) => audioNode.play()));
  const anyPlayed = results.some((result) => result.status === "fulfilled");

  if (!anyPlayed) {
    previewSoundEnabled = false;
    updatePreviewSoundUi(CONTENT[activeLocale]?.home?.stage || {});
  }
}

function pausePreviewAudio() {
  previewAmbientAudioNode?.pause();
  previewMusicAudioNode?.pause();
}

async function togglePreviewSound() {
  const stageContent = CONTENT[activeLocale]?.home?.stage || {};

  if (previewSoundEnabled) {
    previewSoundEnabled = false;
    pausePreviewAudio();
    updatePreviewSoundUi(stageContent);
    return;
  }

  previewSoundEnabled = true;
  syncPreviewAudioSources(stageContent, getActiveStageEntry());
  syncPreviewAudio(stageContent, getActiveStageEntry());
  updatePreviewSoundUi(stageContent);
  await playPreviewAudio();
}

function stopStageBackgroundMotion() {
  // Scenes stay static on the website to match the app's restrained stage language.
}

function setupStageBackgroundMotion() {
  stopStageBackgroundMotion();

  const allBackgrounds = stageBackgroundsNode?.querySelectorAll(".stage-background") || [];
  allBackgrounds.forEach((backgroundNode) => {
    backgroundNode.style.setProperty("--stage-background-x", "0px");
    backgroundNode.style.setProperty("--stage-background-y", "0px");
  });
}

function syncStageClockLayout() {
  if (!stageCenterNode || !liveTimeNode) return;

  const stageCenterStyle = window.getComputedStyle(stageCenterNode);
  const paddingX =
    parseFloat(stageCenterStyle.paddingLeft || "0") +
    parseFloat(stageCenterStyle.paddingRight || "0");
  const paddingY =
    parseFloat(stageCenterStyle.paddingTop || "0") +
    parseFloat(stageCenterStyle.paddingBottom || "0");
  const availableWidth = Math.max(stageCenterNode.clientWidth - paddingX, 1);
  const availableHeight = Math.max(stageCenterNode.clientHeight - paddingY, 1);
  if (!availableWidth || !availableHeight) return;

  const horizontalPadding = clamp(availableWidth * 0.002, 0, 12);
  const verticalPadding = clamp(availableHeight * 0.01, 0, 24);
  const usableWidth = Math.max(availableWidth - horizontalPadding * 2, 1);
  const usableHeight = Math.max(availableHeight - verticalPadding * 2, 1);
  const totalWeight = 7.2;
  const baseSlot = usableWidth / totalWeight;
  const isCompactViewport = window.matchMedia("(max-width: 520px)").matches;
  const minFontSize = isCompactViewport ? 30 : 48;
  const maxFontSize = isCompactViewport ? 112 : 1800;
  const fontSize = clamp(Math.min(baseSlot, usableHeight) * 1.85, minFontSize, maxFontSize);
  const digitWidthEm = baseSlot / fontSize;
  const separatorWidthEm = (baseSlot * 0.6) / fontSize;

  liveTimeNode.style.setProperty("--time-slot-width", `${digitWidthEm}em`);
  liveTimeNode.style.setProperty("--time-separator-width", `${separatorWidthEm}em`);
  liveTimeNode.style.setProperty("--time-font-size", `${fontSize}px`);
  liveTimeNode.style.setProperty("--time-inline-size", `${usableWidth}px`);
}

function setupStageClockLayoutObserver() {
  syncStageClockLayout();

  if (!stageCenterNode || !("ResizeObserver" in window)) return;

  stageClockLayoutObserver?.disconnect();
  stageClockLayoutObserver = new ResizeObserver(() => {
    syncStageClockLayout();
  });
  stageClockLayoutObserver.observe(stageCenterNode);
}

function getLegalSectionOutlineMeta(title, index) {
  const fallbackTitle = String(title || "").trim() || String(index + 1);
  const match = fallbackTitle.match(/^(\d+)[.\u3002、\-\s]*(.+)$/u);

  if (match) {
    return {
      number: match[1],
      label: match[2].trim() || fallbackTitle,
      fullTitle: fallbackTitle,
    };
  }

  return {
    number: String(index + 1).padStart(2, "0"),
    label: fallbackTitle,
    fullTitle: fallbackTitle,
  };
}

function renderLegalPage(locale) {
  if (PAGE !== "privacy" && PAGE !== "terms") return;

  const legalPage = CONTENT[locale]?.[PAGE];
  if (!legalPage) return;
  const sections = Array.isArray(legalPage.sections) ? legalPage.sections : [];

  renderSimpleCards(
    "[data-legal-summary]",
    legalPage.summary,
    (item) => `
      <article class="legal-summary-card glass" data-reveal>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.body)}</p>
      </article>
    `,
  );

  const sectionContainer = document.querySelector("[data-legal-sections]");
  const outlineContainer = document.querySelector("[data-legal-section-nav]");

  if (outlineContainer) {
    outlineContainer.innerHTML = sections
      .map((section, index) => {
        const sectionId = `${PAGE}-section-${index + 1}`;
        const meta = getLegalSectionOutlineMeta(section.title, index);

        return `
          <a class="legal-outline-link" href="#${sectionId}" aria-label="${escapeHtml(meta.fullTitle)}">
            <span class="legal-outline-index" aria-hidden="true">${escapeHtml(meta.number)}</span>
            <span class="legal-outline-text">${escapeHtml(meta.label)}</span>
          </a>
        `;
      })
      .join("");
  }

  if (sectionContainer) {
    sectionContainer.innerHTML = sections
      .map((section, index) => {
        const sectionId = `${PAGE}-section-${index + 1}`;
        const paragraphs = (section.paragraphs || [])
          .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
          .join("");
        const bullets = (section.bullets || []).length
          ? `
            <ul class="legal-list">
              ${section.bullets
                .map((bullet) => `<li>${escapeHtml(bullet)}</li>`)
                .join("")}
            </ul>
          `
          : "";

        return `
          <article id="${sectionId}" class="legal-section-card glass" data-reveal>
            <h2>${escapeHtml(section.title)}</h2>
            ${paragraphs}
            ${bullets}
          </article>
        `;
      })
      .join("");
  }

  const legalContact = document.querySelector("[data-legal-contact]");
  if (legalContact) {
    const common = CONTENT[locale]?.common || {};
    const contactCards = [
      {
        title: common.contactSupportTitle || "Support contact",
        body: common.contactSupportBody || "",
        email: getContactEmail("support"),
      },
      {
        title: common.contactBillingTitle || "Billing contact",
        body: common.contactBillingBody || "",
        email: getContactEmail("billing"),
      },
      {
        title: common.contactPrivacyTitle || "Privacy contact",
        body: common.contactPrivacyBody || "",
        email: getContactEmail("privacy"),
      },
      {
        title: common.contactSecurityTitle || "Security contact",
        body: common.contactSecurityBody || "",
        email: getContactEmail("security"),
      },
    ];

    legalContact.innerHTML = `
      <div class="legal-contact-panel glass" data-reveal>
        <div class="legal-contact-panel-copy">
          <p class="legal-outline-label">${escapeHtml(common.legalContactTitle || "Contact")}</p>
          <h3>${escapeHtml(common.contactPanelTitle || "Contact channels")}</h3>
          <p>${escapeHtml(common.contactPanelBody || "")}</p>
        </div>
        <div class="legal-contact-list">
          ${contactCards
            .map(
              (card) => `
                <article class="legal-contact-row">
                  <div class="legal-contact-row-copy">
                    <h4>${escapeHtml(card.title)}</h4>
                    <p>${escapeHtml(card.body)}</p>
                  </div>
                  <a class="legal-contact-link" href="mailto:${escapeHtml(card.email)}">${escapeHtml(card.email)}</a>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
    `;
  }
}

function renderSimpleCards(selector, items, renderItem) {
  const container = document.querySelector(selector);
  if (!container || !Array.isArray(items)) return;
  container.innerHTML = items.map(renderItem).join("");
}

function updateLiveStageClock() {
  const now = new Date();

  if (liveTimeNode) {
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const fullTime = `${hours}:${minutes}:${seconds}`;

    if (timeSlotNodes.every(Boolean)) {
      const digits = [hours[0], hours[1], minutes[0], minutes[1], seconds[0], seconds[1]];
      timeSlotNodes.forEach((node, index) => {
        node.textContent = digits[index];
      });
      liveTimeNode.setAttribute("aria-label", fullTime);
    } else {
      liveTimeNode.textContent = fullTime;
    }
  }

  yearNodes.forEach((node) => {
    node.textContent = String(now.getFullYear());
  });
}

function setupRevealObserver() {
  const revealElements = Array.from(document.querySelectorAll("[data-reveal]"));

  if (revealObserver) {
    revealObserver.disconnect();
  }

  if (!("IntersectionObserver" in window) || revealElements.length === 0) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.15,
    },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

function updateStickyHeaderState() {
  if (PAGE !== "home" || !siteHeaderNode) return;
  siteHeaderNode.classList.toggle("is-stuck", window.scrollY > 12);
}

function syncActiveNavIndicator() {
  if (!siteNavNode || !navIndicatorNode) return;

  const activeLink = siteNavNode.querySelector('a.is-active[href^="#"]');
  const isCompactViewport = window.matchMedia("(max-width: 1120px)").matches;

  if (!activeLink || isCompactViewport) {
    navIndicatorNode.classList.remove("is-visible");
    return;
  }

  const navRect = siteNavNode.getBoundingClientRect();
  const linkRect = activeLink.getBoundingClientRect();
  const indicatorWidth = Math.max(linkRect.width, 0);
  const indicatorOffset = Math.max(linkRect.left - navRect.left, 0);

  navIndicatorNode.style.setProperty("--nav-indicator-width", `${indicatorWidth}px`);
  navIndicatorNode.style.setProperty("--nav-indicator-x", `${indicatorOffset}px`);
  navIndicatorNode.classList.add("is-visible");
}

function scheduleActiveNavIndicatorSync() {
  if (!navIndicatorNode) return;

  if (navIndicatorFrame) {
    window.cancelAnimationFrame(navIndicatorFrame);
  }

  navIndicatorFrame = window.requestAnimationFrame(() => {
    navIndicatorFrame = 0;
    syncActiveNavIndicator();
  });
}

function setActiveNavLink(targetLink) {
  const navLinks = Array.from(
    document.querySelectorAll('.site-nav a[href^="#"]:not(.nav-drawer-cta)'),
  );
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link === targetLink);
  });
  scheduleActiveNavIndicatorSync();
}

function getSectionAnchorTarget(hash) {
  if (!hash || hash === "#") return null;

  const targetSection = document.querySelector(hash);
  if (!targetSection) return null;

  if (hash === "#top") {
    return document.body;
  }

  return (
    targetSection.querySelector(".section-heading") ||
    targetSection.querySelector(".closing-copy") ||
    targetSection
  );
}

function scrollToHashTarget(hash, { behavior = "smooth", updateHistory = true } = {}) {
  if (!hash || hash === "#") return;

  if (hash === "#top") {
    window.scrollTo({ top: 0, behavior });
    if (updateHistory) {
      window.history.pushState(null, "", "#top");
    }
    return;
  }

  const anchorTarget = getSectionAnchorTarget(hash);
  if (!anchorTarget) return;

  const headerTop = siteHeaderNode ? parseFloat(window.getComputedStyle(siteHeaderNode).top || "0") : 0;
  const headerHeight = siteHeaderNode?.offsetHeight || 0;
  const targetTop =
    window.scrollY +
    anchorTarget.getBoundingClientRect().top -
    headerHeight -
    headerTop -
    18;

  window.scrollTo({
    top: Math.max(targetTop, 0),
    behavior,
  });

  if (updateHistory) {
    window.history.pushState(null, "", hash);
  }
}

function alignCurrentHashTarget() {
  if (PAGE !== "home" || !window.location.hash) return;

  const hash = window.location.hash;
  const align = () => {
    scrollToHashTarget(hash, { behavior: "auto", updateHistory: false });
    syncActiveNavSection();
  };

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(align);
  });
  window.setTimeout(align, 0);
  window.setTimeout(align, 180);

  if (document.fonts?.ready) {
    document.fonts.ready.then(align);
  }
}

function syncActiveNavSection() {
  if (PAGE !== "home") return;

  const navLinks = Array.from(
    document.querySelectorAll('.site-nav a[href^="#"]:not(.nav-drawer-cta)'),
  );
  const sections = navLinks
    .map((link) => {
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#")) return null;
      const section = document.getElementById(href.slice(1));
      if (!section) return null;
      const measureTarget =
        href === "#top"
          ? section
          : section.querySelector(".section-heading") ||
            section.querySelector(".closing-copy") ||
            section;
      return { link, section, measureTarget };
    })
    .filter(Boolean);

  if (sections.length === 0) {
    navIndicatorNode?.classList.remove("is-visible");
    return;
  }

  const headerBottom = siteHeaderNode?.getBoundingClientRect().bottom ?? 0;
  const marker = headerBottom + 24;
  let activeEntry = sections[0];

  sections.forEach((entry) => {
    if (entry.measureTarget.getBoundingClientRect().top - marker <= 0) {
      activeEntry = entry;
    }
  });

  setActiveNavLink(activeEntry.link);
}

function applyLocale(locale) {
  if (!CONTENT[locale]) {
    return;
  }

  activeLocale = locale;
  updateMeta(locale);
  renderConfigLinks(locale);
  applyTextContent(locale);
  renderHome(locale);
  renderLegalPage(locale);
  updateLiveStageClock();
  setupRevealObserver();
  setupActiveNavObserver();
  scheduleActiveNavIndicatorSync();
  alignCurrentHashTarget();
}

function bindPreviewControls() {
  previewSoundButton?.addEventListener("click", () => {
    void togglePreviewSound();
  });
}

function bindLocaleButtons() {
  localeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextLocale = button.dataset.localeChoice;
      if (!nextLocale || !CONTENT[nextLocale]) return;

      window.localStorage.setItem(STORAGE_KEY, nextLocale);
      applyLocale(nextLocale);
    });
  });
}

function createNavOverlay() {
  if (navOverlayNode) return;
  navOverlayNode = document.createElement("div");
  navOverlayNode.className = "nav-overlay";
  navOverlayNode.setAttribute("aria-hidden", "true");
  document.body.appendChild(navOverlayNode);
  navOverlayNode.addEventListener("click", closeNavDrawer);
}

function openNavDrawer() {
  if (!siteNavNode || !navToggleNode) return;
  createNavOverlay();
  siteNavNode.classList.add("is-open");
  navToggleNode.setAttribute("aria-expanded", "true");
  navOverlayNode?.classList.add("is-visible");
  document.body.style.overflow = "hidden";
}

function closeNavDrawer() {
  if (!siteNavNode || !navToggleNode) return;
  siteNavNode.classList.remove("is-open");
  navToggleNode.setAttribute("aria-expanded", "false");
  navOverlayNode?.classList.remove("is-visible");
  document.body.style.overflow = "";
}

function bindNavToggle() {
  if (!navToggleNode || !siteNavNode) return;

  navToggleNode.addEventListener("click", () => {
    const isOpen = navToggleNode.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeNavDrawer();
    } else {
      openNavDrawer();
    }
  });

  // Close drawer when clicking a nav link
  siteNavNode.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeNavDrawer();
    });
  });

  // Close on Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNavDrawer();
    }
  });
}

function bindInPageAnchors() {
  if (PAGE !== "home") return;

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    if (link.dataset.anchorBound === "true") return;
    if (link.classList.contains("skip-link")) return;

    link.dataset.anchorBound = "true";
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href") || "";
      if (!hash || hash === "#") return;

      const anchorTarget = getSectionAnchorTarget(hash);
      if (!anchorTarget && hash !== "#top") return;

      event.preventDefault();
      scrollToHashTarget(hash);
    });
  });
}

function setupActiveNavObserver() {
  if (PAGE !== "home") return;

  if (activeNavObserver) {
    activeNavObserver.disconnect();
  }

  syncActiveNavSection();

  if (!activeNavScrollBound) {
    window.addEventListener(
      "scroll",
      () => {
        syncActiveNavSection();
      },
      { passive: true },
    );
    window.addEventListener("resize", scheduleActiveNavIndicatorSync);
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        scheduleActiveNavIndicatorSync();
      });
    }
    activeNavScrollBound = true;
  }

  siteNavNode?.querySelectorAll('a[href^="#"]:not(.nav-drawer-cta)').forEach((link) => {
    if (link.dataset.navSyncBound === "true") return;
    link.dataset.navSyncBound = "true";
    link.addEventListener("click", () => {
      setActiveNavLink(link);
    });
  });
}

function setupStickyHeader() {
  if (PAGE !== "home") return;

  updateStickyHeaderState();

  if (stickyHeaderScrollBound) return;

  window.addEventListener(
    "scroll",
    () => {
      updateStickyHeaderState();
    },
    { passive: true },
  );
  stickyHeaderScrollBound = true;
}

bindPreviewControls();
bindLocaleButtons();
bindNavToggle();
bindInPageAnchors();
applyLocale(resolveLocale());
setupStickyHeader();
setupStageClockLayoutObserver();
window.setInterval(() => updateLiveStageClock(), 1000);
window.addEventListener("resize", () => {
  syncStageClockLayout();
  scheduleActiveNavIndicatorSync();
});
