diff --git a/README.md b/README.md
index a7548dfb73b9e4b7848aeccc88a815d657a7c7d9..9744f7eb53c92e3565df116daafdb9c59a4576e0 100644
--- a/README.md
+++ b/README.md
@@ -1,2 +1,58 @@
-# Mahabubnagar-Hidden-Gems
-A website project for showing the hidden gems of mahabubnagar district
+# Mahabubnagar Hidden Gems (Static Pro)
+
+A production-ready static tourism site for GitHub Pages, built with only HTML, CSS, vanilla JavaScript, and JSON data.
+
+## Features
+
+- Full-text search (name + tags + summary)
+- Sorting (A–Z, rating high→low, type)
+- Accessible modal with focus trap, ESC close, click-outside close, and focus return
+- Google Maps open button using coordinates when available
+- Image Library with license + attribution + source links
+- PWA basics: service worker + web manifest + favicon
+- SEO tags: meta description, OpenGraph, Twitter card
+
+## Project structure
+
+```txt
+/
+  index.html
+  404.html
+  robots.txt
+  sitemap.xml
+  manifest.webmanifest
+  favicon.ico
+  service-worker.js
+  /css/styles.css
+  /js/app.js
+  /data/data.json
+  /assets/images/og-cover.svg
+```
+
+## Local development
+
+Use any static server from repo root:
+
+```bash
+python3 -m http.server 4173
+```
+
+Then open:
+
+- `http://localhost:4173/index.html`
+
+## GitHub Pages deployment
+
+1. Push this repository to GitHub.
+2. Go to **Settings → Pages**.
+3. Under **Build and deployment**, choose **Deploy from a branch**.
+4. Select your default branch and `/ (root)` folder.
+5. Save and wait for the site URL.
+
+## Data format
+
+Update `/data/data.json` and keep each place aligned with required fields:
+
+- `id`, `name`, `summary`, `tags`, `type`, `rating`
+- Optional: `coordinates`, `images[]`
+- Image metadata should include `title`, `license`, `attribution`, and `source`.
