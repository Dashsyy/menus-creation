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

## Show the menu on a TV

`tv.html` is a full-screen version of the menu for a smart TV, TV stick or any screen with a browser. It sizes the text to fit the screen, works in landscape and portrait, and rotates through the promotions. If the menu is too long for one screen, it shows it in pages that change every 15 seconds (change this with `&page=20`). Click or press Enter to go full screen.

There are two kinds of link.

**1. A short link that always shows the current menu (best for TVs)**

1. In the editor, click **Export JSON**.
2. Save the file in this repo as `menus/<shop-name>.json`, for example `menus/rosas-kitchen.json`. You can upload it on GitHub with *Add file → Upload files*.
3. On the TV, open `https://dashsyy.github.io/menus-creation/tv.html?m=rosas-kitchen`.

To change prices or promotions later, edit or replace that JSON file. TVs check for changes every 5 minutes and update themselves, so nobody needs to touch the TV.

Demo links: `tv.html?m=cafe`, `tv.html?m=restaurant`, `tv.html?m=chain` and `tv.html?m=example-shop`.

**2. An instant link with no file needed**

In the editor, click **Copy TV link**. The whole menu travels inside the link, so it works right away. The link is long, though, and making it again is the only way to change the menu it shows. That makes it better for sending to someone or for a quick test than for typing into a TV.

## Publish it (public link)

The site is plain static files, so GitHub Pages can host it for free:

1. On GitHub, open the repo's **Settings → Pages**.
2. Under **Build and deployment**, set *Source* to **Deploy from a branch**.
3. Choose the branch `claude/inspiring-feynman-4dapez` and the folder `/ (root)`, then click **Save**.

After about a minute, the editor is at https://dashsyy.github.io/menus-creation/ and the TV links work as shown above.

## Files

- `index.html`: page layout and the editor form
- `app.js`: editor logic, live preview, import and export
- `templates.js`: starter menus and tag labels (add your own starters here)
- `styles.css`: editor styles, the four menu templates and print rules
- `tv.html`, `tv.js`, `tv.css`: full-screen TV display
- `shared.js`: helpers used by both the editor and the TV display
- `menus/`: one JSON file per shop or location, for short TV links
