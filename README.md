[README.md](https://github.com/user-attachments/files/34432263/README.md)
# Eigenfunction

Big ideas, explained visually. A browser notebook of **phenomena**: live simulations you can play with, each with a short explanation and the maths behind it on a toggle. It also has a map of the lineage of discoveries and a fringe-science series that sets out the strongest case for each claim, with the sceptics' reply, and leaves the decision to you.

**Free and open source (MIT). Nothing is for sale.** There is no shop, no ads, no accounts and no payments. This is not a financial, trading, investment or betting product, and nothing here is advice of any kind.

## Run it

It is a static website: plain HTML, CSS and JavaScript, with no build step needed to use it.

- Open `index.html` in a browser, or serve the folder with any static file host (for example `python3 -m http.server`).
- Fonts load from Google Fonts and the 3D views load three.js from a CDN, so the first visit needs an internet connection.

## What is inside

- `index.html`: the home page with its Galaxy, Brain and Graph views (each has a full-screen mode).
- `NNN.html`: one page per phenomenon (Φ 001 onwards).
- `lineage.html`: the lineage of discoveries, as a 3D scan and a river timeline.
- `ef.css`, `phi.css`, `phi.js`, `mt.js`, `intro.js`: the two themes (Specimen and Φ mode) and shared scripts.

## Deploy

Upload the folder as is to any static host (Cloudflare Pages, GitHub Pages, Netlify). No server code is involved.

## Licence

MIT. See [LICENSE.txt](LICENSE.txt). You may use, copy, modify and share it, including commercially, as long as the licence notice stays with it.

## Contributing

Bug reports and corrections are welcome through Issues. If you spot an error in a page, say which phenomenon and what is wrong.
