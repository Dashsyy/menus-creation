// Helpers shared by the editor (app.js) and the TV display (tv.js).
window.MenuCore = (function () {
  const STORAGE_KEY = "menu-maker:v1";

  function esc(str) {
    return String(str ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function parseTags(tags) {
    return String(tags || "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  }

  function formatPrice(menu, price) {
    if (price === "" || price == null) return "";
    return (menu.design.currency || "") + price;
  }

  // Menu <-> URL-safe base64 string, so a whole menu can travel inside a link (#m=...).
  function encodeMenu(menu) {
    const bytes = new TextEncoder().encode(JSON.stringify(menu));
    let bin = "";
    bytes.forEach((b) => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function decodeMenu(str) {
    const bin = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  // Where a display page (tv.html, menu.html) gets its menu, first match wins:
  //   #m=<encoded>  the whole menu inside the link (editor "Copy link" buttons)
  //   ?m=<name>     menus/<name>.json on this site, or a built-in starter of that name
  //   (nothing)     the menu last edited in the editor on this device
  async function loadMenu() {
    const hash = new URLSearchParams(location.hash.slice(1));
    if (hash.get("m")) return decodeMenu(hash.get("m"));

    const name = new URLSearchParams(location.search).get("m");
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

    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage blocked */ }
    return saved ? JSON.parse(saved) : window.STARTERS.cafe;
  }

  function showPhotos(menu) {
    return (menu.design.photos || "on") === "on";
  }

  // Shrink an uploaded photo so menus stay small enough to save and share.
  function resizeImage(file, maxSize = 800) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("That file isn't an image this browser can read."));
      };
      img.src = url;
    });
  }

  // Uploaded photos are stored inside the menu and would make a link far too long,
  // so quick links drop them. Returns [menuWithoutUploads, numberDropped].
  function withoutUploadedImages(menu) {
    const copy = JSON.parse(JSON.stringify(menu));
    let dropped = 0;
    const strip = (obj, key) => {
      if (obj && String(obj[key] || "").startsWith("data:")) { delete obj[key]; dropped++; }
    };
    strip(copy.business, "logo");
    (copy.promos || []).forEach((p) => strip(p, "image"));
    copy.sections.forEach((s) => s.items.forEach((it) => strip(it, "image")));
    return [copy, dropped];
  }

  return {
    STORAGE_KEY, esc, parseTags, formatPrice, encodeMenu, decodeMenu,
    loadMenu, showPhotos, resizeImage, withoutUploadedImages
  };
})();
