# Porch Slides (4K ProPresenter Overlay Generator)

A specialized web application for generating high-resolution (3840×2160, 4K) transparent PNG overlays for church sermon presentations in **ProPresenter**.

Built for **The Porch** teaching team and production crew to automate scripture passage formatting, contextual highlight shifting, quote attribution, and sermon point titles with pixel-accurate ProPresenter dimensions.

---

## ✨ Features

- **Automated Sliding Context Window**:
  - Automatically fetches scripture chapters from the Bolls Bible API (ESV, NIV, KJV, NASB, NLT, CSB, ASV, etc.).
  - Generates stationary 5-verse blocks where context remains anchored on consecutive slides while the highlight cleanly advances down the column.
  - Dynamically centers single-verse references with symmetric 2-verse lookahead and lookbehind context.
  - Dynamic line limit solver: scales context from 2 down to 1 or 0 verses if text exceeds vertical limits (10 lines for Lover's Series, 12 lines for Porch Generic).

- **Bible-Mirrored Poetic Typography**:
  - **Poetry Books (Job, Psalms, Proverbs, Song of Solomon, Lamentations)**: Left-aligned (`text-align: left`) with automatic couplet splitting on Hebrew parallelism pauses (semicolons, colons, conjunction commas), mirroring the printed Bible.
  - **Prose Books (Romans, Exodus, 2 Timothy, etc.)**: Justified paragraph blocks (`text-align: justify`) filling the text column width.
  - **Manual Format Override**: Toggle between *Prose (Justified)* and *Poetry (Left-Aligned)* anytime in the Slide Editor.

- **Dual Presentation Themes**:
  - **Porch Generic (White Text)**: Crisp white typography on transparent overlay designed for dark and textured LED walls.
  - **Lover's Series (Black Text)**: Solid black (`#000000`) typography on 100% transparent overlay matching ProPresenter 96pt mono book/verse reference, 8px solid black divider line, and 82pt Roman text column (`X: 1613.8px, Y: 546.4px, W: 2101.5px, H: 906.3px`).
  - Light preview checkerboard in the editor for comfortable black-text styling without affecting the 100% transparent export.

- **Interactive Slide Editor**:
  - Real-time responsive visual preview scaling down 4K canvas to browser viewport.
  - In-place `contenteditable` canvas typing and multi-line textarea editing.
  - Per-slide translation override dropdown with instantaneous Bolls API re-fetching and line measurement.
  - Dynamic line overflow warning badges (`x / 10` or `x / 12`).

- **4K Transparent PNG & ZIP Exporter**:
  - Direct 4K transparent `.png` download for single slides.
  - Bundled `.zip` package download for complete multi-slide sermon decks.
  - Theme-aware naming: `YYYYMMDD - Lovers - [info].png` or `YYYYMMDD - Porch - [info].png`.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/kirkmeyers/porch_slides.git
cd porch_slides

# Install dependencies
npm install

# Start local development server
npm run dev
```
Open `http://localhost:5173/` in your browser.

### Production Build
```bash
npm run build
npm run preview
```
The compiled static assets are located in the `dist/` directory.

---

## 🌐 GitHub Pages Deployment

This repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys the application to **GitHub Pages** whenever changes are pushed to the `main` branch.

### Enabling GitHub Pages:
1. In the GitHub repository, navigate to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. Push to `main` — GitHub Actions will automatically compile the project and deploy the site.

---

## 📺 ProPresenter Workflow

1. Generate your sermon deck using the web app and click **Download 4K Slides (ZIP)**.
2. Unzip the downloaded archive to retrieve the transparent 3840×2160 PNG files.
3. In ProPresenter:
   - Drag the transparent PNGs directly into your sermon presentation playlist.
   - Set the slide media layer or foreground fill to **Scale to Fit** or **Stretch to Fill** on a 4K output canvas.
   - The solid typography and divider lines overlay seamlessly on top of your background motion graphics or camera feeds with 100% transparency.

---

## 📄 License

Internal tool for The Porch & Watermark Community Church.
