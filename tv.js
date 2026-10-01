// Full-screen menu display for TVs / signage screens.
//
// Where the menu comes from (first match wins):
//   tv.html#m=<encoded>   whole menu inside the link ("Copy TV link" in the editor)
//   tv.html?m=<name>      menus/<name>.json from this site, re-checked every few minutes
//   tv.html?m=cafe        a built-in starter (cafe, restaurant, chain) when no file exists
//   tv.html               whatever was last edited in the editor on this same device
//
// Optional: &page=<seconds> how long each page shows when the menu needs more than one (default 15).
(function () {
  const { esc, parseTags, formatPrice, decodeMenu } = window.MenuCore;
  const params = new URLSearchParams(location.search);
  const PAGE_SECONDS = Math.max(5, Number(params.get("page")) || 15);
  const PROMO_SECONDS = 7;
  const REFRESH_MS = 5 * 60 * 1000;

  const tv = document.getElementById("tv");
  const body = tv.querySelector(".tv-body");
  const promoEl = tv.querySelector(".tv-promo");
  const pagerEl = tv.querySelector(".tv-pager");

  let menu = null;
  let menuJson = "";
  let pages = [];
  let pageIndex = 0;
  let promoIndex = 0;
  let pageTimer = null;
  let promoTimer = null;

  async function loadMenu() {
    const hash = new URLSearchParams(location.hash.slice(1));
    if (hash.get("m")) return decodeMenu(hash.get("m"));

    const name = params.get("m");
    if (name) {
      const safe = name.replace(/[^a-zA-Z0-9_-]/g, "");
      try {
        const res = await fetch(`menus/${safe}.json`, { cache: "no-store" });
        if (res.ok) return await res.json();
      } catch (e) {
        // Fall through to the built-in starters (e.g. when opened from file://).
      }
      if (window.STARTERS[safe]) return window.STARTERS[safe];
      throw new Error(`No menu called "${safe}" was found.`);
    }

    const saved = localStorage.getItem("menu-maker:v1");
    if (saved) return JSON.parse(saved);
    return window.STARTERS.cafe;
  }

  function applyMenu(next) {
    const json = JSON.stringify(next);
    if (json === menuJson) return;
    menu = next;
    menuJson = json;

    const { business, design } = menu;
    tv.className = `tv tpl-${design.template || "classic"}`;
    tv.style.setProperty("--accent", design.accent || "#c0392b");
    document.title = business.name || "Menu";

    const logo = tv.querySelector(".tv-logo");
    logo.hidden = !business.logo;
    if (business.logo) logo.src = business.logo;
    tv.querySelector(".tv-name").textContent = business.name || "";
    tv.querySelector(".tv-tagline").textContent = business.tagline || "";
    tv.querySelector(".tv-contact").textContent =
      [menu.footer, business.address, business.contact].filter(Boolean).join("  ·  ");

    startPromos();
    layout();
  }

  // ---------- Menu pages ----------

  function sectionHtml(s) {
    return `
      <section class="tv-section">
        <h2>${esc(s.title)}</h2>
        ${s.items.map((it) => {
          const tags = parseTags(it.tags);
          const highlight = tags.includes("promo") || tags.includes("popular");
          return `
          <div class="tv-item${highlight ? " highlight" : ""}">
            <div class="tv-line">
              <span class="tv-item-name">${esc(it.name)}</span>
              <span class="tv-dots"></span>
              <span class="tv-price">${esc(formatPrice(menu, it.price))}</span>
            </div>
            ${it.desc || tags.length ? `<p class="tv-desc">${esc(it.desc)}${tags.map((t) =>
              ` <span class="tv-tag tag-${esc(t)}">${esc(window.TAG_LABELS[t] || t)}</span>`).join("")}</p>` : ""}
          </div>`;
        }).join("")}
      </section>`;
  }

  function fits() {
    return body.scrollHeight <= body.clientHeight + 1 && body.scrollWidth <= body.clientWidth + 1;
  }

  // Largest font size (px) at which these sections fit on screen, or 0 if none does.
  function renderSections(sections) {
    const maxCols = tv.classList.contains("portrait") ? 2 : 3;
    body.style.columnCount = Math.max(1, Math.min(maxCols, sections.length));
    body.innerHTML = sections.map(sectionHtml).join("");
  }

  function bestFontSize(sections, min, max) {
    renderSections(sections);
    body.style.fontSize = min + "px";
    if (!fits()) return 0;
    let lo = min, hi = max;
    while (hi - lo > 0.5) {
      const mid = (lo + hi) / 2;
      body.style.fontSize = mid + "px";
      if (fits()) lo = mid; else hi = mid;
    }
    return lo;
  }

  // Split sections into `count` groups with roughly equal item counts, keeping order.
  function split(sections, count) {
    const weight = (s) => s.items.length + 1.5;
    const total = sections.reduce((n, s) => n + weight(s), 0);
    const groups = [];
    let current = [];
    let acc = 0;
    sections.forEach((s) => {
      const target = (total / count) * (groups.length + 1);
      if (current.length && acc + weight(s) / 2 > target && groups.length < count - 1) {
        groups.push(current);
        current = [];
      }
      current.push(s);
      acc += weight(s);
    });
    if (current.length) groups.push(current);
    return groups;
  }

  function layout() {
    if (!menu) return;
    const portrait = innerHeight > innerWidth;
    tv.classList.toggle("portrait", portrait);
    const unit = Math.min(innerWidth, innerHeight);
    const min = Math.max(12, unit * 0.022); // smallest text still readable from across a room
    const max = unit * 0.04;
    const sections = menu.sections.filter((s) => s.items.length || s.title);

    pages = [];
    for (let count = 1; count <= Math.max(1, sections.length); count++) {
      const groups = split(sections, count);
      const sizes = groups.map((g) => bestFontSize(g, min, max));
      if (sizes.every(Boolean) || count === sections.length) {
        pages = groups.map((g, i) => ({ sections: g, size: sizes[i] || min }));
        break;
      }
    }
    if (!pages.length) pages = [{ sections: [], size: min }];

    pageIndex = Math.min(pageIndex, pages.length - 1);
    showPage();
    clearInterval(pageTimer);
    if (pages.length > 1) {
      pageTimer = setInterval(() => {
        pageIndex = (pageIndex + 1) % pages.length;
        showPage();
      }, PAGE_SECONDS * 1000);
    }
  }

  function showPage() {
    const page = pages[pageIndex];
    body.style.fontSize = page.size + "px";
    renderSections(page.sections);
    body.classList.remove("fade-in");
    void body.offsetWidth; // restart the animation
    body.classList.add("fade-in");
    pagerEl.innerHTML = pages.length > 1
      ? pages.map((_, i) => `<i class="${i === pageIndex ? "on" : ""}"></i>`).join("")
      : "";
  }

  // ---------- Promotions ----------

  function startPromos() {
    clearInterval(promoTimer);
    const promos = (menu.promos || []).filter((p) => p.title && p.title.trim());
    promoEl.hidden = !promos.length;
    if (!promos.length) return;
    promoIndex = 0;
    const show = () => {
      const p = promos[promoIndex % promos.length];
      promoEl.innerHTML = `<strong>${esc(p.title)}</strong>${p.detail ? `<span>${esc(p.detail)}</span>` : ""}`;
      promoEl.classList.remove("fade-in");
      void promoEl.offsetWidth;
      promoEl.classList.add("fade-in");
      promoIndex++;
    };
    show();
    if (promos.length > 1) promoTimer = setInterval(show, PROMO_SECONDS * 1000);
  }

  // ---------- Clock, cursor, refresh ----------

  function tickClock() {
    tv.querySelector(".tv-clock").textContent =
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  let cursorTimer = null;
  addEventListener("mousemove", () => {
    document.body.classList.remove("hide-cursor");
    clearTimeout(cursorTimer);
    cursorTimer = setTimeout(() => document.body.classList.add("hide-cursor"), 3000);
  });

  // Click / tap / Enter toggles full screen (browsers only allow it after a user action).
  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }
  addEventListener("click", toggleFullscreen);
  addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === "f") toggleFullscreen(); });

  let resizeTimer = null;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 200);
  });
  addEventListener("hashchange", () => refresh());

  async function refresh() {
    try {
      applyMenu(await loadMenu());
      document.getElementById("tv-error").hidden = true;
    } catch (err) {
      if (!menu) {
        const el = document.getElementById("tv-error");
        el.textContent = "Couldn't load the menu. " + err.message;
        el.hidden = false;
      }
      // If a menu is already showing, keep showing it and try again on the next refresh.
    }
  }

  tickClock();
  setInterval(tickClock, 10 * 1000);
  refresh();
  if (params.get("m")) setInterval(refresh, REFRESH_MS);
})();
