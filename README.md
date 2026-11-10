# Tokyo Pocket — Brand Portfolio Website

Single-page, scrollable brand portfolio for **Tokyo Pocket** (BSIT-4C final requirement).

**Stack:** HTML5 · CSS3 · vanilla JavaScript (ES6) · GSAP 3 + ScrollTrigger · Lenis · inline SVG.
No build step — it is a static site.

---

## Run it locally

```bash
# any static server works
npx serve .
# or
python -m http.server 8000
```

Then open <http://localhost:8000>.

> Open it through a server, not `file://` — the Google Fonts, GSAP CDN and
> `navigator.clipboard` all need an `http(s)` origin.

---

## Project structure

```
tokyo-pocket/
  index.html        all 8 sections, semantic markup, one <h1>
  styles.css        design tokens + sections labelled /* === HERO === */
  main.js           Lenis, GSAP data-attribute animation system, interactions
  README.md
  assets/
    fonts/          Rushk.woff2 / Rushk.otf   ← YOU SUPPLY THESE
    logo/           primary.png, primary-white-bg.png, secondary.png
    owners/         brandon.jpg, winston.jpg, ana.jpg, jose.jpg   ← placeholders in use
    products/       fruit-cream.jpg, egg.jpg, fried-cream.jpg      ← placeholders in use
    drinks/         matcha-latte.jpg, hojicha-latte.jpg, milk-tea.jpg, brown-sugar-milk.jpg
    posts/          first-brand-post.png        (copied from Tokyo Pocket _ CT#2)
    poster/         event-poster.png            (copied from Tokyo Pocket _ CT#3)
```

---

## Swapping in your real assets

Every placeholder is marked in `index.html` with an HTML comment.
Search the file for `<!-- REPLACE:` to find them all.

### 1. Owner photos (4 people)

Drop the files in `assets/owners/`, then in `index.html` replace each
initials placeholder:

```html
<!-- before -->
<span class="door__photo" aria-hidden="true"><span class="initials">BD</span></span>

<!-- after -->
<span class="door__photo">
  <img src="assets/owners/brandon.jpg" alt="Portrait of Brandon Jake Dela Cruz">
</span>
```

Do this for `brandon.jpg`, `winston.jpg`, `ana.jpg`, `jose.jpg`.
Portrait **3:4** works best — the frame is `object-fit: cover`, so any
portrait crop will fill cleanly. Roles (`Co-Founder`) are plain text in the
same block; edit them there.

### 2. Rushk display font (mandatory, not on Google Fonts)

Put your licensed files here — the `@font-face` in `styles.css` is already
wired up:

```
assets/fonts/Rushk.woff2
assets/fonts/Rushk.otf
```

Until the files exist the site falls back to Fredoka (marked
`<!-- REPLACE: assets/fonts/Rushk.woff2 -->` in `styles.css`).
**Do not change the `font-family` name** — only add the files.

### 3. Product photos

Inline SVG illustrations are used so the parallax sandwich works out of the box.
To use real photography, add e.g. `assets/products/fruit-cream.jpg` and swap
the `<svg>` inside `<figure class="card__media">` for:

```html
<img src="assets/products/fruit-cream.jpg" alt="Fruit cream sandwich" loading="lazy">
```

### 4. Sandwich layers (the scroll-scrubbed assembly)

The 5 layers are inline SVGs inside `.sandwich`, each with a `data-layer`
attribute (`bottom`, `cream`, `fruit`, `top`, `garnish`).
To use PNGs, replace each layer's `<svg>` with an `<img>` — **keep the
`.layer` wrapper and its `data-layer` attribute**, the GSAP timeline targets
those.

### 5. Logo sketch (step 01)

`<!-- REPLACE: assets/logo/sketch.jpg -->` — replace the inline SVG in
process step 01 with your real sketch scan.

---

## Publishing (one public link)

The folder is fully static — any of these work:

**Netlify (easiest)**
1. Go to <https://app.netlify.com/drop>
2. Drag the `tokyo-pocket` folder onto the page
3. Copy the live URL

**GitHub Pages**
```bash
cd tokyo-pocket
git init && git add -A && git commit -m "Tokyo Pocket site"
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```
Then in the repo → **Settings → Pages → Source: main / root → Save**.

**Vercel** — `npx vercel` from inside the folder, accept the defaults.

---

## Accessibility & performance notes

- Skip-to-content link, visible focus rings, ARIA labels, `aria-expanded` on
  the shoji doors (keyboard-operable: `Enter` / `Space`, arrow keys move
  between doors).
- `prefers-reduced-motion` disables Lenis, parallax and the pinned sandwich —
  the sandwich renders in its completed state instead.
- Images are `loading="lazy"`; only transform/opacity are animated.
- Colour contrast: cream `#FFF9F2` on burgundy `#4A050A` ≈ 13:1, charcoal
  `#222222` on cream ≈ 15:1.

## Animations

All scroll motion runs through one system in `main.js` driven by `data-`
attributes: `data-reveal`, `data-stagger`, `data-parallax`,
`data-parallax-bg`, `data-scrub-scale`, `data-split`, `data-count`.
Add an attribute to any element and it animates — no new JS required.
