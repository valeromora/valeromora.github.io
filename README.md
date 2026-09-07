# Isabella Valero Mora — Personal Webpage

A single-page static portfolio and CV site for Isabella Valero Mora, Electronic
Engineer focused on machine learning, artificial intelligence, and data science.
The site is plain HTML5 + CSS3 + vanilla JavaScript with no build step and no
dependencies, deployed to GitHub Pages.

## Sections

- **Hero / About** — portrait, name, and professional summary
- **Experience** — research and community project entries
- **Education** — academic background
- **Skills** — core competencies
- **Languages** — language proficiencies
- **Interests** — hobbies and highlights
- **Contact** — Formspree contact form (references available on request)

## Local Preview

Serve the repository root with any static file server. For example:

```bash
python -m http.server
```

Then open <http://localhost:8000> in your browser. The page is fully self-hosted
(no CDN, no external requests at runtime) and supports light/dark theming,
responsive mobile navigation, and reduced-motion preferences.

## Deploy to GitHub Pages

This repository is configured as a user/org site, so it must live in a repo named
`valeromora.github.io` and be deployed from the `main` branch root.

1. Push the `main` branch to GitHub:

   ```bash
   git remote add origin https://github.com/valeromora/valeromora.github.io.git
   git push -u origin main
   ```

2. In the repository on GitHub, go to **Settings → Pages** and set the source to
   **Deploy from a branch**, branch **`main`**, folder **`/` (root)**, then save.

3. The site is served at <https://valeromora.github.io> within about a minute.

No build step is required — GitHub Pages serves `index.html` from the repository
root directly.

## Privacy notes

- Contact is handled through a **Formspree form**. The form posts to a Formspree
  account that forwards messages privately; no personal email address appears in
  the page source.
- `cv_english.pdf` is **intentionally excluded** from this repository (see
  `.gitignore`). It contains personal contact details and is not meant for public
  distribution. It stays only as a local reference and is never committed or
  served.
- No phone number appears anywhere in the source.
