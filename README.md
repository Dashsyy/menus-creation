# Menu Maker

A browser-based menu builder for shops of any size, from a corner café to a chain with many locations. It needs no build step and no server.

## Use it

Open `index.html` in a browser, or serve the folder (`python3 -m http.server`) and go to http://localhost:8000.

- **Starters:** ready-made menus for a small café, a family restaurant and a multi-location chain.
- **Templates:** Classic (restaurant), Modern (brand / chain), Chalkboard (café / bar) and Minimal (fine dining). Each one takes your brand color.
- **Promotions:** banners such as Happy Hour, combo deals or app-only offers. Tag an item `promo` or `popular` to highlight it on the menu.
- **Item tags:** `veg`, `vegan`, `gf`, `spicy`, `new`, `popular`, `promo`.
- **Print / Save PDF:** A4 or US Letter, one or two columns.
- **Export / Import JSON:** keep one master menu and re-import it per location, or keep a separate file for each location's prices.

Your work saves automatically in the browser (localStorage).

## Files

- `index.html`: page layout and the editor form
- `app.js`: editor logic, live preview, import and export
- `templates.js`: starter menus and tag labels (add your own starters here)
- `styles.css`: editor styles, the four menu templates and print rules
