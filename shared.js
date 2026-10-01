// Helpers shared by the editor (app.js) and the TV display (tv.js).
window.MenuCore = (function () {
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

  return { esc, parseTags, formatPrice, encodeMenu, decodeMenu };
})();
