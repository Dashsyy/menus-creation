# Menu Maker

A browser-based menu builder for shops of any size, from a corner café to a chain with many locations. It needs no build step and no server.

## Use it

Open `index.html` in a browser, or serve the folder (`python3 -m http.server`) and go to http://localhost:8000.

- **Starters:** ready-made menus for a small café, a family restaurant and a multi-location chain.
- **Templates:** Classic (restaurant), Modern (brand / chain), Chalkboard (café / bar) and Minimal (fine dining). Each one takes your brand color.
- **Promotions:** banners such as Happy Hour, combo deals or app-only offers. Tag an item `promo` or `popular` to highlight it on the menu.
- **Photos** for dishes, promotions and the logo (see below).
- **Item tags:** `veg`, `vegan`, `gf`, `spicy`, `new`, `popular`, `promo`.
- **Print / Save PDF:** A4 or US Letter, one or two columns.
- **Export / Import JSON:** keep one master menu and re-import it per location, or keep a separate file for each location's prices.

Your work saves automatically in the browser (localStorage).

## Photos

Every dish, promotion and the logo can have a photo, and items without one still look fine. In the editor, each one has a photo field. You can:

- **Upload a photo** from the computer or phone. It's shrunk automatically to keep the menu fast.
- **Paste a link** to a photo that's already online (for example from the shop's website or Instagram CDN).
- **Use a file in this repo**: put photos in `images/` and type `images/latte.jpg`. This is the best option for large menus, because uploaded photos are stored inside the menu file and make it bigger.

*Photos on print & TV* (under Design) turns photos off for a text-only printed menu or TV screen. The iPad/phone menu always shows them.

The pictures in `images/samples/` are simple sample illustrations for the demo menus. Replace them with real photos of your dishes.

## Show the menu on screens

Open the **Share & display** panel in the editor.

| Screen | Page | What customers see |
| --- | --- | --- |
| TV / signage | `tv.html` | Full screen, text sized to fit, photos beside dishes, rotating promotions. Long menus change page every 15 s (`&page=20` to change). Click or press Enter for full screen. |
| iPad / tablet / phone | `menu.html` | A menu they can scroll, with photo cards, section tabs that stay at the top, dietary filters (Vegetarian, Gluten-free, Spicy…), and tap a dish for a big photo. On phones it switches to a list with photos on the right. |

Add `&kiosk=1` to the iPad link for a shared iPad on the counter. After 2 minutes without a touch, it closes any open dish, clears the filters and scrolls back to the top for the next customer. On the iPad, use *Share → Add to Home Screen* to open it full screen like an app.

There are two kinds of link.

**1. Permanent links: short, and always show the latest menu (use these in the shop)**

1. Type a *menu file name*, for example `rosas-kitchen`, and click **Download menu file**.
2. Upload that file to this repo's `menus/` folder. On GitHub: *Add file → Upload files*.
3. Use the links shown in the panel:
   - TV: `https://dashsyy.github.io/menus-creation/tv.html?m=rosas-kitchen`
   - iPad / phone: `https://dashsyy.github.io/menus-creation/menu.html?m=rosas-kitchen`

To change prices, photos or promotions later, upload the new file over the old one. TVs and iPads check for changes every 5 minutes and update themselves.

Demo links: `?m=cafe`, `?m=restaurant`, `?m=chain` and `?m=example-shop` on either page.

**2. Quick links: work right away with no upload**

*Preview TV*, *Preview iPad* and the *Copy … quick link* buttons put the whole menu inside the link. They're handy for sending a preview to a shop owner, but they are long, don't update, and leave out uploaded photos (photo links and `images/` files still show).

## Publish it (public link)

The site is plain static files, so GitHub Pages can host it for free:

1. On GitHub, open the repo's **Settings → Pages**.
2. Under **Build and deployment**, set *Source* to **Deploy from a branch**.
3. Choose the branch `claude/inspiring-feynman-4dapez` and the folder `/ (root)`, then click **Save**.

After about a minute, the editor is at https://dashsyy.github.io/menus-creation/ and the TV and iPad links work as shown above.

## Files

- `index.html`: page layout and the editor form
- `app.js`: editor logic, live preview, import and export
- `templates.js`: starter menus and tag labels (add your own starters here)
- `styles.css`: editor styles, the four menu templates and print rules
- `tv.html`, `tv.js`, `tv.css`: full-screen TV display
- `menu.html`, `menu.js`, `menu.css`: scrollable iPad / phone menu
- `shared.js`: helpers shared by the editor and both displays (loading menus, photos, links)
- `images/`: dish photos (`images/samples/` holds the demo illustrations)
- `menus/`: one JSON file per shop or location, for short TV links
