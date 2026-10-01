(function () {
  const STORAGE_KEY = "menu-maker:v1";
  const menuEl = document.getElementById("menu");
  const promoList = document.getElementById("promo-list");
  const sectionList = document.getElementById("section-list");

  let state = load() || clone(window.STARTERS.cafe);

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Storage unavailable (private mode); the editor still works for this session.
    }
  }

  function getPath(path) {
    return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), state);
  }

  function setPath(path, value) {
    const keys = path.split(".");
    const last = keys.pop();
    const target = keys.reduce((o, k) => (o[k] ??= {}), state);
    target[last] = value;
  }

  const { esc, parseTags } = window.MenuCore;

  function formatPrice(price) {
    return window.MenuCore.formatPrice(state, price);
  }

  // ---------- Preview ----------

  const pageStyle = document.createElement("style");
  document.head.appendChild(pageStyle);
  function setPageSize(paper) {
    pageStyle.textContent = `@page { size: ${paper === "letter" ? "letter" : "A4"}; margin: 0; }`;
  }

  function renderMenu() {
    const { business, design, promos, sections, footer } = state;
    menuEl.className = `menu tpl-${design.template} paper-${design.paper} cols-${design.columns}`;
    menuEl.style.setProperty("--accent", design.accent || "#333");
    setPageSize(design.paper);

    const activePromos = (promos || []).filter((p) => p.title.trim());

    menuEl.innerHTML = `
      <header class="menu-head">
        ${business.logo ? `<img class="logo" src="${esc(business.logo)}" alt="">` : ""}
        <h2 class="biz-name">${esc(business.name)}</h2>
        ${business.tagline ? `<p class="tagline">${esc(business.tagline)}</p>` : ""}
      </header>

      ${activePromos.length ? `
        <div class="promos">
          ${activePromos.map((p) => `
            <div class="promo">
              <strong>${esc(p.title)}</strong>
              ${p.detail ? `<span>${esc(p.detail)}</span>` : ""}
            </div>`).join("")}
        </div>` : ""}

      <div class="sections">
        ${sections.map((s) => `
          <section class="menu-section">
            <h3>${esc(s.title)}</h3>
            <ul>
              ${s.items.map((it) => {
                const tags = parseTags(it.tags);
                const highlight = tags.includes("promo") || tags.includes("popular");
                return `
                <li class="item${highlight ? " highlight" : ""}">
                  <div class="item-line">
                    <span class="item-name">${esc(it.name)}</span>
                    <span class="dots"></span>
                    <span class="item-price">${esc(formatPrice(it.price))}</span>
                  </div>
                  ${it.desc ? `<p class="item-desc">${esc(it.desc)}</p>` : ""}
                  ${tags.length ? `<p class="tags">${tags.map((t) =>
                    `<span class="tag tag-${esc(t)}">${esc(window.TAG_LABELS[t] || t)}</span>`).join("")}</p>` : ""}
                </li>`;
              }).join("")}
            </ul>
          </section>`).join("")}
      </div>

      <footer class="menu-foot">
        ${footer ? `<p>${esc(footer)}</p>` : ""}
        <p class="contact">${[business.address, business.contact].filter(Boolean).map(esc).join(" · ")}</p>
      </footer>`;
  }

  // ---------- Editor ----------

  function bindSimpleFields() {
    document.querySelectorAll("[data-bind]").forEach((el) => {
      const path = el.dataset.bind;
      el.value = getPath(path) ?? "";
      el.oninput = () => {
        setPath(path, el.value);
        update();
      };
    });
  }

  function renderPromoEditor() {
    promoList.innerHTML = "";
    state.promos.forEach((p, i) => {
      const row = document.createElement("div");
      row.className = "card";
      row.innerHTML = `
        <input placeholder="Title (e.g. Happy Hour)" value="${esc(p.title)}" data-k="title">
        <input placeholder="Details (e.g. 20% off 3–6pm)" value="${esc(p.detail)}" data-k="detail">
        <button type="button" class="link danger">Remove</button>`;
      row.querySelectorAll("input").forEach((inp) => {
        inp.oninput = () => { p[inp.dataset.k] = inp.value; update(); };
      });
      row.querySelector("button").onclick = () => {
        state.promos.splice(i, 1);
        refreshAll();
      };
      promoList.appendChild(row);
    });
  }

  function renderSectionEditor() {
    sectionList.innerHTML = "";
    state.sections.forEach((s, si) => {
      const card = document.createElement("div");
      card.className = "card section-card";
      card.innerHTML = `
        <div class="row">
          <input class="section-title" placeholder="Section title" value="${esc(s.title)}">
          <button type="button" class="icon" data-act="up" title="Move up">↑</button>
          <button type="button" class="icon" data-act="down" title="Move down">↓</button>
          <button type="button" class="link danger" data-act="del">Remove</button>
        </div>
        <div class="items"></div>
        <button type="button" class="link" data-act="add-item">+ Add item</button>`;

      card.querySelector(".section-title").oninput = (e) => { s.title = e.target.value; update(); };
      card.querySelector('[data-act="up"]').onclick = () => move(state.sections, si, -1);
      card.querySelector('[data-act="down"]').onclick = () => move(state.sections, si, 1);
      card.querySelector('[data-act="del"]').onclick = () => {
        if (confirm(`Remove section "${s.title}"?`)) {
          state.sections.splice(si, 1);
          refreshAll();
        }
      };
      card.querySelector('[data-act="add-item"]').onclick = () => {
        s.items.push({ name: "New item", desc: "", price: "", tags: "" });
        refreshAll();
      };

      const itemsEl = card.querySelector(".items");
      s.items.forEach((it, ii) => {
        const row = document.createElement("div");
        row.className = "item-edit";
        row.innerHTML = `
          <div class="row">
            <input placeholder="Item name" value="${esc(it.name)}" data-k="name">
            <input class="price" placeholder="Price" value="${esc(it.price)}" data-k="price">
          </div>
          <input placeholder="Description" value="${esc(it.desc)}" data-k="desc">
          <div class="row">
            <input placeholder="Tags: veg, gf, spicy, new, popular, promo" value="${esc(it.tags)}" data-k="tags">
            <button type="button" class="icon" data-act="up" title="Move up">↑</button>
            <button type="button" class="icon" data-act="down" title="Move down">↓</button>
            <button type="button" class="icon danger" data-act="del" title="Remove item">✕</button>
          </div>`;
        row.querySelectorAll("input").forEach((inp) => {
          inp.oninput = () => { it[inp.dataset.k] = inp.value; update(); };
        });
        row.querySelector('[data-act="up"]').onclick = () => move(s.items, ii, -1);
        row.querySelector('[data-act="down"]').onclick = () => move(s.items, ii, 1);
        row.querySelector('[data-act="del"]').onclick = () => {
          s.items.splice(ii, 1);
          refreshAll();
        };
        itemsEl.appendChild(row);
      });

      sectionList.appendChild(card);
    });
  }

  function move(arr, i, delta) {
    const j = i + delta;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    refreshAll();
  }

  function update() {
    save();
    renderMenu();
  }

  function refreshAll() {
    bindSimpleFields();
    renderPromoEditor();
    renderSectionEditor();
    update();
  }

  // ---------- Toolbar ----------

  document.getElementById("btn-add-promo").onclick = () => {
    state.promos.push({ title: "", detail: "" });
    refreshAll();
  };

  document.getElementById("btn-add-section").onclick = () => {
    state.sections.push({ title: "New section", items: [] });
    refreshAll();
  };

  document.getElementById("starter").onchange = (e) => {
    const key = e.target.value;
    e.target.value = "";
    if (!key) return;
    if (!confirm("Replace the current menu with this starter?")) return;
    state = clone(window.STARTERS[key]);
    refreshAll();
  };

  document.getElementById("btn-print").onclick = () => window.print();

  // TV links carry the whole menu in the URL hash, so they work on any static host
  // without a server. For short, editable links use tv.html?m=<file> instead (see README).
  function tvLink() {
    return new URL("tv.html#m=" + window.MenuCore.encodeMenu(state), location.href).href;
  }

  document.getElementById("btn-tv").onclick = () => window.open(tvLink(), "_blank");

  document.getElementById("btn-tv-link").onclick = async (e) => {
    const link = tvLink();
    try {
      await navigator.clipboard.writeText(link);
      flash(e.target, "Copied!");
    } catch (err) {
      prompt("Copy this TV link:", link);
    }
  };

  function flash(btn, text) {
    const original = btn.textContent;
    btn.textContent = text;
    setTimeout(() => { btn.textContent = original; }, 1500);
  }

  document.getElementById("btn-export").onclick = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    const slug = (state.business.name || "menu").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    a.href = URL.createObjectURL(blob);
    a.download = `${slug || "menu"}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const fileInput = document.getElementById("file-import");
  document.getElementById("btn-import").onclick = () => fileInput.click();
  fileInput.onchange = async () => {
    const file = fileInput.files[0];
    fileInput.value = "";
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data.business || !Array.isArray(data.sections)) throw new Error("missing fields");
      state = { promos: [], footer: "", ...data, design: { ...window.STARTERS.cafe.design, ...data.design } };
      refreshAll();
    } catch (err) {
      alert("That file doesn't look like a menu export: " + err.message);
    }
  };

  refreshAll();
})();
