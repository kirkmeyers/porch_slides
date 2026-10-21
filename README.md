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

## 📋 Automated Request Files & Link Format

An upstream tool (such as a file watcher/listener on a ProPresenter production machine) can prepare slide requests and load them directly into the generator via file or link.

### 1. Request File Format (`.txt`)
Plain UTF-8 text with one slide request per line. Optional settings lines at the top begin with `#`:

```text
# theme: porch-generic        (porch-generic | lovers-series | inner-life)
# translation: ESV            (any code TRANSLATION_MAP accepts: ESV, NIV, KJV, NASB, NLT, CSB, etc.)
# communicator: Jane Smith    (fills the Communicator field)
# title: Idolatry Week 7      (shown in the UI only, not used in file names)
Slide 1: Jett Picture (attached)
Slide 2: Mark 9:9-13 (ESV)
Slide 3: Romans 8:18 (NIV)
> 18 For I consider that our present sufferings are not worth comparing with the glory that will be revealed in us.
Slide 4: Theology of Suffering
Slide 5: Charles Spurgeon – "I have learned to kiss the wave that throws me against the Rock of Ages."
```

#### Rules:
- Lines starting with `#` are settings or comments, never slides. Unknown `# key:` lines are ignored.
- Lines starting with `>` directly following a scripture line provide manuscript-supplied verse text for that slide (one verse per line with its verse number). Supplied text takes the place of API fetching for that slide and marks the slide with an amber verification badge. Orphan `>` lines that do not follow a scripture line are ignored with a warning toast.
- Theme and translation settings are applied to dropdowns **before** parsing scripture (ensuring theme-specific casing rules apply).
- Unrecognized theme or translation values preserve the current dropdown selection and display a warning toast naming the invalid value.
- Request files can be loaded by clicking **Load requests** or by dragging and dropping the `.txt` file onto the outline text box or input panel. If text is already present, a confirmation prompt prevents accidental replacement.

---

### 2. Scripture Text Needed & Verification Badges

- **Red Badge (`⚠️ Text needed: NIV` / `Text needed: fetch failed`)**:
  The Bolls Bible API no longer serves the NIV translation. When an NIV slide is requested (or if an API fetch fails), porch_slides renders the slide with its reference and translation label (e.g. `ROMANS 8:18 (NIV)`) and marks it with a red "Text needed" badge. In the Slide Editor, a **Paste verse text (NIV)** input box allows pasting the verse text (e.g. `18 For I consider...`). Once applied, the verse is laid out with standard line measurement, context window handling, and poetry/prose formatting.
- **Amber Badge (`⚠️ Pasted text: verify`)**:
  Shown whenever verse text was supplied via `>` lines in the request file / outline link or pasted in the editor. Appears in the grid view, Slide Editor banner, and proof sheet, but is never drawn on exported 4K PNGs.
- **Export Guard**:
  If any slide still needs verse text when clicking **All Slides Images (zip)** or **Export for ProPresenter**, a confirmation dialog lists the unresolved slides (e.g. `"1 slide still needs verse text: ROMANS 8:18 (NIV)"`). If exported without pasting, exported slides render only their reference and divider with no placeholder or notice text.

---

### 3. Communicator Naming in Exported Files
When the **Communicator** field is filled (manually or via `# communicator:`), the communicator's **last name** is automatically included in every exported file.

The last name is extracted from the last word of the field, automatically skipping suffixes like `Jr.`, `Sr.`, `II`, `III`, and `IV` (`"Jane Smith"` → `Smith`, `"John Doe Jr."` → `Doe`).

#### File Naming Structure:
| Export Type | With Communicator (`Smith`) | Blank / Default |
| :--- | :--- | :--- |
| **4K PNG** | `YYYYMMDD - Porch - Smith - mark_9_9-13.png` | `YYYYMMDD - Porch - mark_9_9-13.png` |
| **ZIP Archive** | `YYYYMMDD - Porch - Smith.zip` | `YYYYMMDD - Porch.zip` |
| **ProPresenter Bundle** | `YYYYMMDD - Porch - Smith.probundle` | `YYYYMMDD - Porch.probundle` |
| **Presentation inside bundle** | `YYYYMMDD - Porch - Smith.pro` | `YYYYMMDD - Porch.pro` |

*Note: Theme words match their existing definitions (`Porch`, `Lovers`, or `Inner_Life` / `The Inner Life`). Individual slide filenames inside the ZIP (`001_mark_9_9-13.png`) remain unchanged.*

---

### 4. Load From Link (`#outline=<payload>`)
The app supports opening directly with pre-loaded requests via a URL hash parameter:

```text
https://kirkmeyers.github.io/porch_slides/#outline=<payload>
```

`<payload>` is the request file text compressed using **DEFLATE** inside a single-file ZIP archive named `d` and encoded as **URL-safe Base64** (no padding), identical to the helper format used by `#review=` and `#deck=`.

#### Browser Helper:
In the web app, call:
```javascript
const url = await encodeOutlineLink(requestFileText);
```

#### Node.js Script Example (Using `zlib`):
This self-contained Node script creates valid `#outline=` links without external dependencies:

```javascript
import fs from 'node:fs';
import zlib from 'node:zlib';

function crc32(buf) {
  let crc = ~0;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (-(crc & 1) & 0xEDB88320);
    }
  }
  return (~crc) >>> 0;
}

function createZipBuffer(filename, contentBuf) {
  const compressed = zlib.deflateRawSync(contentBuf, { level: 9 });
  const fnBuf = Buffer.from(filename);
  const crc = crc32(contentBuf);

  // Local File Header (30 + fnLen)
  const lfh = Buffer.alloc(30 + fnBuf.length);
  lfh.writeUInt32LE(0x04034b50, 0);
  lfh.writeUInt16LE(20, 4); // version
  lfh.writeUInt16LE(8, 8);  // compression: DEFLATE
  lfh.writeUInt32LE(crc, 14);
  lfh.writeUInt32LE(compressed.length, 18);
  lfh.writeUInt32LE(contentBuf.length, 22);
  lfh.writeUInt16LE(fnBuf.length, 26);
  fnBuf.copy(lfh, 30);

  // Central Directory Header (46 + fnLen)
  const cdh = Buffer.alloc(46 + fnBuf.length);
  cdh.writeUInt32LE(0x02014b50, 0);
  cdh.writeUInt16LE(20, 4);
  cdh.writeUInt16LE(20, 6);
  cdh.writeUInt16LE(8, 10);
  cdh.writeUInt32LE(crc, 16);
  cdh.writeUInt32LE(compressed.length, 20);
  cdh.writeUInt32LE(contentBuf.length, 24);
  cdh.writeUInt16LE(fnBuf.length, 28);
  fnBuf.copy(cdh, 46);

  // End of Central Directory (22)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(1, 8);  // entries count
  eocd.writeUInt16LE(1, 10); // total entries
  eocd.writeUInt32LE(cdh.length, 12);
  eocd.writeUInt32LE(lfh.length + compressed.length, 16);

  return Buffer.concat([lfh, compressed, cdh, eocd]);
}

export function buildOutlineUrl(requestText, baseUrl = 'https://kirkmeyers.github.io/porch_slides/') {
  const zipBuf = createZipBuffer('d', Buffer.from(requestText, 'utf8'));
  const payload = zipBuf.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${baseUrl}#outline=${payload}`;
}

// Example usage:
const text = fs.readFileSync('samples/requests-example.txt', 'utf8');
console.log(buildOutlineUrl(text));
```

*(Alternatively, if your Node environment uses `jszip`: `const zip = new JSZip(); zip.file('d', text); const b64 = await zip.generateAsync({ type: 'base64', compression: 'DEFLATE' }); return base + '#outline=' + b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');`)*

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
