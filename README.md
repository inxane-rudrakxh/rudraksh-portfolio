# Rudraksh — Self-Hosted Portfolio

A production-ready static export of a Framer-built portfolio, fully decoupled from Framer's hosting infrastructure. Every asset (JS, CSS, fonts, images) is served locally; no Framer CDN requests are required at runtime.

---

## What Was Changed

| File | Change |
|------|--------|
| `js/init.mjs` | Replaced Framer editor stub — removes `app.framerstatic.com` dependency |
| `js/rerouter.js` | Analytics blocked (returns 204); Framer badge hidden via injected CSS |
| `js/wid2_*.mjs` | Newsletter form action → Formspree (replace `YOUR_FORM_ID`) |
| `vercel.json` | Vercel routing + headers + cache config |
| `netlify.toml` | Netlify routing + cache config |
| `_headers` | Netlify / Cloudflare Pages MIME type + cache headers |
| `_redirects` | Netlify rewrite rules for extensionless HTML pages |

---

## Quick Deploy

### Vercel (recommended)

```bash
npm i -g vercel
vercel --prod
```

Or drag-and-drop this folder into [vercel.com/new](https://vercel.com/new).  
The `vercel.json` handles routing automatically.

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod --dir .
```

Or connect your Git repo at [app.netlify.com](https://app.netlify.com).  
`netlify.toml` + `_redirects` + `_headers` handle routing automatically.

### Cloudflare Pages

1. Push to a Git repo.
2. Go to **Cloudflare Dashboard → Pages → Create a project**.
3. Select the repo, leave the build command blank, set **publish directory** to `/` (root).
4. Deploy — the `_headers` file handles MIME types.

### GitHub Pages (not recommended)

GitHub Pages requires `.html` extensions. The pages in this export are extensionless. Use Vercel or Netlify instead.

---

## Set Up the Newsletter Form (Formspree)

The newsletter form currently points to a placeholder endpoint. Follow these steps to activate it:

1. Sign up at [formspree.io](https://formspree.io) (free tier = 50 submissions/month).
2. Create a new form — Formspree gives you an endpoint like `https://formspree.io/f/xabc1234`.
3. Open `js/wid2_8bilkhvuzk1z83qppkcwtjtwvr7wngfrl9-t_i.oa4sbz0k.mjs` in a text editor.
4. Find `YOUR_FORM_ID` and replace it with your actual Formspree form ID.
5. Redeploy.

> **Note:** Formspree returns `{ ok: true }` on success. The Framer form button may stay in its "loading" animation state after submission (it expected Framer's proprietary response format). The submission **is** received by Formspree. For a perfect success state, you would need to patch the form component's response handler in the minified JS — an optional enhancement.

---

## URL Structure

The site uses Framer's extensionless file naming convention. Every deployment platform is configured to serve the files correctly:

| URL | File on disk |
|-----|-------------|
| `/` | `index` |
| `/blog` | `blog/index` |
| `/blog/inside-securevault` | `blog/inside-securevault` |
| `/work` | `work/index` |
| `/work/securevault-v2` | `work/securevault-v2` |

---

## Offline / Local Testing

To test offline with a local server that sets correct MIME types, use any of:

```bash
# Python (built-in)
python -m http.server 8080

# Node — http-server
npx http-server -p 8080 --cors

# Node — serve
npx serve -p 8080
```

Then open `http://localhost:8080/index`.

> `http.server` does not serve extensionless files as HTML by default. Use `npx serve` or `npx http-server` which both do content-type sniffing.

---

## What Is Still External

| Service | Why | How to remove |
|---------|-----|----------------|
| **Formspree** | Newsletter form submissions | Implement your own backend endpoint and update the action URL in `js/wid2_*.mjs` |
| **Google Fonts** (none — all self-hosted) | — | Already self-hosted in `images/*.woff2` |

All JS, CSS, fonts, and images are bundled locally. No Framer CDN, no analytics, no editor bar.

---

## Framer Analytics

Framer analytics calls to `events.framer.com` and `api.framer.com/analytics` are intercepted by the patched `rerouter.js` and return an empty `204 No Content` response. No user data is sent to Framer.

`navigator.sendBeacon` is also stubbed to a no-op.

---

## Caching Strategy

| Asset type | Cache-Control |
|------------|--------------|
| HTML pages | `max-age=0, must-revalidate` |
| JS / MJS modules | `max-age=31536000, immutable` |
| Fonts (woff2) | `max-age=31536000, immutable` |
| Images (png, svg) | `max-age=31536000, immutable` |

All JS/asset filenames include a content hash (e.g. `framer.djxi1qch.mjs`), so immutable caching is safe.
