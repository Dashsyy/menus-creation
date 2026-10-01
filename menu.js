// Scrollable customer menu for iPads, tablets and phones (menu.html).
// Gets its menu the same way as the TV display (see MenuCore.loadMenu in shared.js).
//
// Optional: ?kiosk=1  for a shared iPad on the counter: after 2 minutes without a touch it
//                     closes any open dish and scrolls back to the top for the next customer.
(function () {
  const { esc, parseTags, formatPrice, loadMenu } = window.MenuCore;
  const params = new URLSearchParams(location.search);
  const REFRESH_MS = 5 * 60 * 1000;
  const KIOSK_IDLE_MS = 2 * 60 * 1000;
  // Tags customers can filter by, in display order.
  const FILTERS = ["veg", "vegan", "gf", "spicy", "new", "promo"];

  const app = document.getElementById("app");
  const sectionsEl = document.getElementById("sections");
  const tabRow = document.getElementById("tab-row");
  const filterRow = document.getElementById("filter-row");
  const promosEl = app.querySelector(".promos");
  const dialog = document.getElementById("detail");

  let menu = null;
  let menuJson = "";
  const activeFilters = new Set();

  function applyMenu(next) {
    const json = JSON.stringify(next);
    if (json === menuJson) return;
    menu = next;
    menuJson = json;

    const { business, design } = menu;
    app.className = `app tpl-${design.template || "classic"}`;
    document.documentElement.style.setProperty("--accent", design.accent || "#c0392b");
    document.title = business.name ? `${business.name} – Menu` : "Menu";

    const logo = app.querySelector(".hero-logo");
    logo.hidden = !business.logo;
    if (business.logo) logo.src = business.logo;
    app.querySelector(".hero-name").textContent = business.name || "";
    app.querySelector(".hero-tagline").textContent = business.tagline || "";
    app.querySelector(".foot-note").textContent = menu.footer || "";
    app.querySelector(".foot-contact").textContent =
      [business.address, business.contact].filter(Boolean).join(" · ");

    renderPromos();
    renderFilters();
    render();
  }

  // ---------- Promotions ----------

  function renderPromos() {
    const promos = (menu.promos || []).filter((p) => p.title && p.title.trim());
    promosEl.hidden = !promos.length;
    promosEl.innerHTML = promos.map((p) => `
      <article class="promo-card${p.image ? " has-photo" : ""}">
        ${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy">` : ""}
        <div>
          <strong>${esc(p.title)}</strong>
          ${p.detail ? `<p>${esc(p.detail)}</p>` : ""}
        </div>
      </article>`).join("");
  }

  // ---------- Filters ----------

  function renderFilters() {
    const present = new Set();
    menu.sections.forEach((s) => s.items.forEach((it) => parseTags(it.tags).forEach((t) => present.add(t))));
    const available = FILTERS.filter((t) => present.has(t));
    [...activeFilters].forEach((t) => { if (!present.has(t)) activeFilters.delete(t); });

    filterRow.hidden = !available.length;
    filterRow.innerHTML = available.map((t) => `
      <button type="button" class="chip filter${activeFilters.has(t) ? " on" : ""}" data-tag="${esc(t)}"
        aria-pressed="${activeFilters.has(t)}">${esc(window.TAG_LABELS[t] || t)}</button>`).join("");
    filterRow.querySelectorAll("button").forEach((btn) => {
      btn.onclick = () => {
        const tag = btn.dataset.tag;
        if (activeFilters.has(tag)) activeFilters.delete(tag); else activeFilters.add(tag);
        renderFilters();
        render();
      };
    });
  }

  function matches(item) {
    if (!activeFilters.size) return true;
    const tags = parseTags(item.tags);
    return [...activeFilters].every((t) => tags.includes(t));
  }

  // ---------- Sections & items ----------

  function render() {
    const visible = menu.sections
      .map((s, i) => ({ id: `sec-${i}`, title: s.title, items: s.items.filter(matches) }))
      .filter((s) => s.items.length);

    tabRow.innerHTML = visible.map((s) =>
      `<a class="chip tab" href="#${s.id}" data-target="${s.id}">${esc(s.title)}</a>`).join("");

    sectionsEl.innerHTML = visible.length ? visible.map((s) => `
      <section class="section" id="${s.id}">
        <h2>${esc(s.title)}</h2>
        <div class="grid">
          ${s.items.map((it, i) => cardHtml(it, s.id, i)).join("")}
        </div>
      </section>`).join("")
      : `<p class="empty">Nothing matches these filters. <button type="button" class="link" id="clear-filters">Clear filters</button></p>`;

    const clear = document.getElementById("clear-filters");
    if (clear) clear.onclick = () => { activeFilters.clear(); renderFilters(); render(); };

    // Map each card back to its item for the detail view.
    sectionsEl.querySelectorAll(".card").forEach((card) => {
      const s = visible.find((v) => v.id === card.dataset.section);
      const item = s.items[Number(card.dataset.index)];
      card.onclick = () => openDetail(item);
    });

    tabRow.querySelectorAll(".tab").forEach((tab) => {
      tab.onclick = (e) => {
        e.preventDefault();
        document.getElementById(tab.dataset.target).scrollIntoView({ behavior: "smooth", block: "start" });
      };
    });
    watchSections();
  }

  function cardHtml(it, sectionId, index) {
    const tags = parseTags(it.tags);
    const highlight = tags.includes("promo") || tags.includes("popular");
    return `
      <button type="button" class="card${it.image ? " has-photo" : ""}${highlight ? " highlight" : ""}"
        data-section="${sectionId}" data-index="${index}">
        ${it.image ? `<img class="card-photo" src="${esc(it.image)}" alt="" loading="lazy">` : ""}
        <span class="card-body">
          <span class="card-top">
            <span class="card-name">${esc(it.name)}</span>
            <span class="card-price">${esc(formatPrice(menu, it.price))}</span>
          </span>
          ${it.desc ? `<span class="card-desc">${esc(it.desc)}</span>` : ""}
          ${tags.length ? `<span class="tags">${tagsHtml(tags)}</span>` : ""}
        </span>
      </button>`;
  }

  function tagsHtml(tags) {
    return tags.map((t) => `<span class="tag tag-${esc(t)}">${esc(window.TAG_LABELS[t] || t)}</span>`).join("");
  }

  // Highlight the tab of the section currently on screen, and keep it scrolled into view.
  let observer = null;
  function watchSections() {
    if (observer) observer.disconnect();
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        tabRow.querySelectorAll(".tab").forEach((tab) => {
          const on = tab.dataset.target === entry.target.id;
          tab.classList.toggle("on", on);
          if (on) tab.scrollIntoView({ block: "nearest", inline: "center" });
        });
      });
    }, { rootMargin: "-30% 0px -65% 0px" });
    sectionsEl.querySelectorAll(".section").forEach((s) => observer.observe(s));
    const first = tabRow.querySelector(".tab");
    if (first && !tabRow.querySelector(".tab.on")) first.classList.add("on");
  }

  // ---------- Detail view ----------

  function openDetail(it) {
    const tags = parseTags(it.tags);
    dialog.querySelector(".detail-body").innerHTML = `
      ${it.image ? `<img class="detail-photo" src="${esc(it.image)}" alt="">` : ""}
      <div class="detail-text">
        <div class="card-top">
          <h3>${esc(it.name)}</h3>
          <span class="card-price">${esc(formatPrice(menu, it.price))}</span>
        </div>
        ${it.desc ? `<p>${esc(it.desc)}</p>` : ""}
        ${tags.length ? `<p class="tags">${tagsHtml(tags)}</p>` : ""}
      </div>`;
    dialog.showModal();
  }

  dialog.querySelector(".detail-close").onclick = () => dialog.close();
  // Tapping the dimmed backdrop (outside the dialog box) closes it.
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });

  // ---------- Kiosk mode ----------

  if (params.get("kiosk")) {
    let idleTimer = null;
    const resetIdle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (dialog.open) dialog.close();
        activeFilters.clear();
        if (menu) { renderFilters(); render(); }
        scrollTo({ top: 0, behavior: "smooth" });
      }, KIOSK_IDLE_MS);
    };
    ["pointerdown", "scroll", "keydown"].forEach((ev) => addEventListener(ev, resetIdle, { passive: true }));
    resetIdle();
  }

  // ---------- Load ----------

  async function refresh() {
    try {
      applyMenu(await loadMenu());
      document.getElementById("error").hidden = true;
    } catch (err) {
      if (!menu) {
        const el = document.getElementById("error");
        el.textContent = "Couldn't load the menu. " + err.message;
        el.hidden = false;
      }
    }
  }

  addEventListener("hashchange", refresh);
  refresh();
  if (params.get("m")) setInterval(refresh, REFRESH_MS);
})();
