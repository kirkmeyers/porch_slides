import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import { exportProPresenterBundle, extractSlideNotes } from './propresenter.js';

// 1. Bible Book Abbreviations Mapping
const BOOK_MAP = {
  // Old Testament
  "gen": { id: 1, name: "Genesis" }, "ge": { id: 1, name: "Genesis" }, "gn": { id: 1, name: "Genesis" },
  "ex": { id: 2, name: "Exodus" }, "exo": { id: 2, name: "Exodus" },
  "lev": { id: 3, name: "Leviticus" }, "le": { id: 3, name: "Leviticus" }, "lv": { id: 3, name: "Leviticus" },
  "num": { id: 4, name: "Numbers" }, "nu": { id: 4, name: "Numbers" }, "nm": { id: 4, name: "Numbers" },
  "deut": { id: 5, name: "Deuteronomy" }, "de": { id: 5, name: "Deuteronomy" }, "dt": { id: 5, name: "Deuteronomy" },
  "josh": { id: 6, name: "Joshua" }, "jos": { id: 6, name: "Joshua" },
  "judg": { id: 7, name: "Judges" }, "jdg": { id: 7, name: "Judges" }, "jg": { id: 7, name: "Judges" }, "jud": { id: 7, name: "Judges" },
  "ruth": { id: 8, name: "Ruth" }, "ru": { id: 8, name: "Ruth" },
  "1sam": { id: 9, name: "1 Samuel" }, "1sa": { id: 9, name: "1 Samuel" }, "1s": { id: 9, name: "1 Samuel" },
  "2sam": { id: 10, name: "2 Samuel" }, "2sa": { id: 10, name: "2 Samuel" }, "2s": { id: 10, name: "2 Samuel" },
  "1ki": { id: 11, name: "1 Kings" }, "1k": { id: 11, name: "1 Kings" },
  "2ki": { id: 12, name: "2 Kings" }, "2k": { id: 12, name: "2 Kings" },
  "1chr": { id: 13, name: "1 Chronicles" }, "1ch": { id: 13, name: "1 Chronicles" },
  "2chr": { id: 14, name: "2 Chronicles" }, "2ch": { id: 14, name: "2 Chronicles" },
  "ezra": { id: 15, name: "Ezra" }, "ezr": { id: 15, name: "Ezra" },
  "neh": { id: 16, name: "Nehemiah" }, "ne": { id: 16, name: "Nehemiah" },
  "esth": { id: 17, name: "Esther" }, "est": { id: 17, name: "Esther" },
  "job": { id: 18, name: "Job" }, "jb": { id: 18, name: "Job" },
  "ps": { id: 19, name: "Psalms" }, "psa": { id: 19, name: "Psalms" }, "pss": { id: 19, name: "Psalms" }, "psalm": { id: 19, name: "Psalms" }, "psalms": { id: 19, name: "Psalms" },
  "prov": { id: 20, name: "Proverbs" }, "pr": { id: 20, name: "Proverbs" }, "pro": { id: 20, name: "Proverbs" },
  "eccles": { id: 21, name: "Ecclesiastes" }, "ec": { id: 21, name: "Ecclesiastes" }, "ecc": { id: 21, name: "Ecclesiastes" },
  "song": { id: 22, name: "Song of Solomon" }, "ss": { id: 22, name: "Song of Solomon" },
  "isa": { id: 23, name: "Isaiah" }, "is": { id: 23, name: "Isaiah" },
  "jer": { id: 24, name: "Jeremiah" }, "je": { id: 24, name: "Jeremiah" }, "jr": { id: 24, name: "Jeremiah" },
  "lam": { id: 25, name: "Lamentations" }, "la": { id: 25, name: "Lamentations" },
  "ezek": { id: 26, name: "Ezekiel" }, "eze": { id: 26, name: "Ezekiel" },
  "dan": { id: 27, name: "Daniel" }, "da": { id: 27, name: "Daniel" }, "dn": { id: 27, name: "Daniel" },
  "hos": { id: 28, name: "Hosea" }, "ho": { id: 28, name: "Hosea" },
  "joel": { id: 29, name: "Joel" }, "jl": { id: 29, name: "Joel" },
  "amos": { id: 30, name: "Amos" }, "am": { id: 30, name: "Amos" },
  "obad": { id: 31, name: "Obadiah" }, "ob": { id: 31, name: "Obadiah" },
  "jon": { id: 32, name: "Jonah" }, "jnh": { id: 32, name: "Jonah" },
  "mic": { id: 33, name: "Micah" }, "mi": { id: 33, name: "Micah" },
  "nah": { id: 34, name: "Nahum" }, "na": { id: 34, name: "Nahum" },
  "hab": { id: 35, name: "Habakkuk" }, "ha": { id: 35, name: "Habakkuk" },
  "zeph": { id: 36, name: "Zephaniah" }, "zep": { id: 36, name: "Zephaniah" }, "zp": { id: 36, name: "Zephaniah" },
  "hag": { id: 37, name: "Haggai" }, "hg": { id: 37, name: "Haggai" },
  "zech": { id: 38, name: "Zechariah" }, "zec": { id: 38, name: "Zechariah" }, "zc": { id: 38, name: "Zechariah" },
  "mal": { id: 39, name: "Malachi" }, "ml": { id: 39, name: "Malachi" },

  // New Testament
  "matt": { id: 40, name: "Matthew" }, "mt": { id: 40, name: "Matthew" },
  "mark": { id: 41, name: "Mark" }, "mk": { id: 41, name: "Mark" }, "mr": { id: 41, name: "Mark" },
  "luke": { id: 42, name: "Luke" }, "lk": { id: 42, name: "Luke" }, "lu": { id: 42, name: "Luke" },
  "john": { id: 43, name: "John" }, "jn": { id: 43, name: "John" }, "jo": { id: 43, name: "John" },
  "acts": { id: 44, name: "Acts" }, "ac": { id: 44, name: "Acts" },
  "rom": { id: 45, name: "Romans" }, "ro": { id: 45, name: "Romans" }, "rm": { id: 45, name: "Romans" },
  "1cor": { id: 46, name: "1 Corinthians" }, "1co": { id: 46, name: "1 Corinthians" },
  "2cor": { id: 47, name: "2 Corinthians" }, "2co": { id: 47, name: "2 Corinthians" },
  "gal": { id: 48, name: "Galatians" }, "ga": { id: 48, name: "Galatians" },
  "eph": { id: 49, name: "Ephesians" }, "ep": { id: 49, name: "Ephesians" },
  "phil": { id: 50, name: "Philippians" }, "php": { id: 50, name: "Philippians" },
  "col": { id: 51, name: "Colossians" }, "co": { id: 51, name: "Colossians" },
  "1thess": { id: 52, name: "1 Thessalonians" }, "1th": { id: 52, name: "1 Thessalonians" },
  "2thess": { id: 53, name: "2 Thessalonians" }, "2th": { id: 53, name: "2 Thessalonians" },
  "1tim": { id: 54, name: "1 Timothy" }, "1ti": { id: 54, name: "1 Timothy" },
  "2tim": { id: 55, name: "2 Timothy" }, "2ti": { id: 55, name: "2 Timothy" },
  "titus": { id: 56, name: "Titus" }, "tit": { id: 56, name: "Titus" },
  "philem": { id: 57, name: "Philemon" }, "phm": { id: 57, name: "Philemon" },
  "heb": { id: 58, name: "Hebrews" },
  "jas": { id: 59, name: "James" }, "jmes": { id: 59, name: "James" },
  "1pet": { id: 60, name: "1 Peter" }, "1pe": { id: 60, name: "1 Peter" },
  "2pet": { id: 61, name: "2 Peter" }, "2pe": { id: 61, name: "2 Peter" },
  "1jn": { id: 62, name: "1 John" }, "1john": { id: 62, name: "1 John" },
  "2jn": { id: 63, name: "2 John" }, "2john": { id: 63, name: "2 John" },
  "3jn": { id: 64, name: "3 John" }, "3john": { id: 64, name: "3 John" },
  "jude": { id: 65, name: "Jude" },
  "rev": { id: 66, name: "Revelation" }, "re": { id: 66, name: "Revelation" }
};

// Automatically populate BOOK_MAP with canonical names
Object.keys(BOOK_MAP).forEach(key => {
  const value = BOOK_MAP[key];
  const canonicalKey = value.name.toLowerCase().replace(/\s+/g, '');
  if (!BOOK_MAP[canonicalKey]) {
    BOOK_MAP[canonicalKey] = value;
  }
});

// Translation override mapping to Bolls database package names
const TRANSLATION_MAP = {
  "esv": "ESV",
  "kjv": "KJV",
  "niv": "NIV2011",
  "niv 84": "NIV",
  "niv84": "NIV",
  "nasb": "NASB",
  "nasb 1995": "NASB",
  "nasb1995": "NASB",
  "nasb_1995": "NASB",
  "nlt": "NLT",
  "asv": "ASV",
  "csb": "CSB17"
};

// 2. Global State Variables
let slidesData = [];
let activeSlideIndex = 0;
let singleLineHeight = 123; // Calibrated dynamically, default 123.25px (85 * 1.45)
let currentView = 'grid'; // 'grid' or 'editor'

// 3. API Cache to avoid duplicate fetch requests
const chapterCache = {};

// 4. DOM Elements
const rawInputEl = document.getElementById('raw-input');
const slideThemeEl = document.getElementById('slide-theme');
const translationEl = document.getElementById('bible-translation');
const contextWindowEl = document.getElementById('context-window');
const contextOpacityEl = document.getElementById('context-opacity');
const contextOpacityValEl = document.getElementById('context-opacity-value');
const btnGenerate = document.getElementById('btn-generate');
const btnExport = document.getElementById('btn-export');
const btnExportProPresenter = document.getElementById('btn-export-propresenter');
const gridExportBar = document.getElementById('grid-export-bar');
const btnGridExport = document.getElementById('btn-grid-export');
const btnGridExportProPresenter = document.getElementById('btn-grid-export-propresenter');
const btnDemo = document.getElementById('btn-demo');
const btnDemoLovers = document.getElementById('btn-demo-lovers');
const slideCountEl = document.getElementById('slide-count');

// Dark Mode Friendly SVG Icon Constants
const DOWNLOAD_ICON_SVG = `<svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
const PROPRESENTER_ICON_SVG = `<svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`;
const LIGHTNING_ICON_SVG = `<svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
const SPINNER_ICON_SVG = `<svg class="btn-icon btn-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`;

const toggleGridEl = document.getElementById('toggle-grid');
const toggleEditorEl = document.getElementById('toggle-editor');
const gridViewEl = document.getElementById('grid-view');
const editorViewEl = document.getElementById('editor-view');

const slideCanvasPreview = document.getElementById('slide-canvas-preview');
const editorBookEl = slideCanvasPreview.querySelector('.slide-ref-book');
const editorVerseEl = slideCanvasPreview.querySelector('.slide-ref-verse');
const editorBodyEl = slideCanvasPreview.querySelector('.slide-text-body');
const editorTitleEl = slideCanvasPreview.querySelector('.slide-center-title');

const activeSlideTypeSelect = document.getElementById('active-slide-type-select');
const activeSlideLinesEl = document.getElementById('active-slide-lines');
const activeSlideOverflowWarning = document.getElementById('active-slide-overflow-warning');
const activeSlideNotesPreview = document.getElementById('active-slide-notes-preview');
const activeSlideTextarea = document.getElementById('active-slide-textarea');

const btnPrevSlide = document.getElementById('btn-prev-slide');
const btnNextSlide = document.getElementById('btn-next-slide');
const editorSlideIndexEl = document.getElementById('editor-slide-index');
const btnToggleEmphasis = document.getElementById('btn-toggle-emphasis');
const btnDownloadActiveSlide = document.getElementById('btn-download-active-slide');

const activeSlideTranslationEl = document.getElementById('active-slide-translation');
const activeSlideTranslationContainer = document.getElementById('active-slide-translation-container');

const activeSlideFormatEl = document.getElementById('active-slide-format');
const activeSlideFormatContainer = document.getElementById('active-slide-format-container');

const editorQuoteContainer = slideCanvasPreview.querySelector('.slide-quote-container');
const editorQuoteTextEl = slideCanvasPreview.querySelector('.slide-quote-text');
const editorQuoteAuthorEl = slideCanvasPreview.querySelector('.slide-quote-author');

const lineCounterCalibration = document.getElementById('line-counter-calibration');
const lineCounterMeasurement = document.getElementById('line-counter-measurement');

const btnShareDraft = document.getElementById('btn-share-draft');
const btnProofSheet = document.getElementById('btn-proof-sheet');
const reviewBanner = document.getElementById('review-banner');
const btnCopyReviewLink = document.getElementById('btn-copy-review-link');
const btnDismissReviewBanner = document.getElementById('btn-dismiss-review-banner');
const proofSheetModal = document.getElementById('proof-sheet-modal');
const proofSheetContent = document.getElementById('proof-sheet-content');
const proofHeaderMeta = document.getElementById('proof-header-meta');
const btnPrintProof = document.getElementById('btn-print-proof');
const btnCloseProof = document.getElementById('btn-close-proof');
const toastContainer = document.getElementById('toast-container');

// Poetic Books: Job (18), Psalms (19), Proverbs (20), Song of Solomon (22), Lamentations (25)
const POETIC_BOOK_IDS = new Set([18, 19, 20, 22, 25]);

function isPoeticBook(bookId, bookName) {
  if (bookId && POETIC_BOOK_IDS.has(Number(bookId))) return true;
  if (bookName) {
    if (typeof parseBookAbbreviation === 'function') {
      const mapped = parseBookAbbreviation(bookName);
      if (mapped && POETIC_BOOK_IDS.has(Number(mapped.id))) return true;
    }
    const clean = bookName.toLowerCase().trim();
    if (clean.includes('psalm') || clean.includes('proverb') || clean === 'job' || clean.includes('song') || clean.includes('lamentation') || clean === 'ps' || clean === 'psa' || clean === 'pss' || clean === 'prv' || clean === 'prov' || clean === 'lam' || clean === 'sos') {
      return true;
    }
  }
  return false;
}

// Couplet-splitting for Hebrew poetic parallelisms
function formatPoeticVerse(text) {
  if (!text) return '';
  // If line breaks already exist (from pasted doc or prior edit), preserve them
  if (text.includes('<br') || text.includes('\n')) {
    return text;
  }

  let split = text.trim();

  // 1. Semicolons or Colons (primary poetic pauses in English Bibles)
  if (/[;:]\s+/.test(split)) {
    split = split.replace(/([;:])\s+/g, '$1<br />');
  } 
  // 2. Conjunction commas (, and / , but / , for / , nor / , yet / , so)
  else if (/,\s+(and|but|for|nor|yet|so)\b/i.test(split)) {
    split = split.replace(/,\s+(and|but|for|nor|yet|so)\b/gi, ',<br />$1');
  } 
  // 3. Central comma split if the single line is long (> 55 chars)
  else if (split.includes(', ') && split.length > 55) {
    const mid = split.length / 2;
    const commaIndices = [];
    let idx = split.indexOf(', ');
    while (idx !== -1) {
      commaIndices.push(idx);
      idx = split.indexOf(', ', idx + 1);
    }
    if (commaIndices.length > 0) {
      commaIndices.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
      const bestIdx = commaIndices[0];
      split = split.substring(0, bestIdx + 1) + '<br />' + split.substring(bestIdx + 2);
    }
  }

  return split;
}

// Helper to get max lines limit (locked at 9 lines max for all themes)
function getMaxLines() {
  return 9;
}

// 5. Initialize Font Face Loading & Line Calibration
document.fonts.ready.then(() => {
  updateCalibrationForTheme();
  checkLocalFontPresence();
});

function getScriptureFontSize() {
  const scriptureFontSizeEl = document.getElementById('scripture-font-size');
  if (scriptureFontSizeEl && scriptureFontSizeEl.value) {
    return parseInt(scriptureFontSizeEl.value, 10);
  }
  const isLovers = slideThemeEl && slideThemeEl.value === 'lovers-series';
  return isLovers ? 75 : 78;
}

function setScriptureFontSize(size) {
  const scriptureFontSizeEl = document.getElementById('scripture-font-size');
  const scriptureFontSizeValEl = document.getElementById('scripture-font-size-value');
  if (scriptureFontSizeEl) {
    scriptureFontSizeEl.value = size;
  }
  if (scriptureFontSizeValEl) {
    scriptureFontSizeValEl.textContent = `${size}px`;
  }
  document.documentElement.style.setProperty('--scripture-font-size', `${size}px`);
}

function calibrateLineHeight() {
  const isLovers = slideThemeEl && slideThemeEl.value === 'lovers-series';
  const fontSize = getScriptureFontSize();
  const defaultHeight = isLovers ? (fontSize * 1.22) : (fontSize * 1.35);
  const calibrationSpan = document.getElementById('calibration-single-line');
  if (calibrationSpan) {
    const rect = calibrationSpan.getBoundingClientRect();
    if (rect.height > 0) {
      singleLineHeight = rect.height;
      console.log(`Calibrated Single Line Height: ${singleLineHeight}px`);
      return;
    }
  }
  singleLineHeight = defaultHeight;
}

function updateCalibrationForTheme() {
  const isLovers = slideThemeEl && slideThemeEl.value === 'lovers-series';
  const lineLimitEl = document.getElementById('line-limit');
  const lineLimitHelp = lineLimitEl ? lineLimitEl.nextElementSibling : null;
  const targetFontSize = isLovers ? 75 : 78;
  
  setScriptureFontSize(targetFontSize);
  
  if (isLovers) {
    document.body.classList.add('theme-lovers-series');
    if (lineLimitEl) lineLimitEl.value = '9';
    if (lineLimitHelp) lineLimitHelp.textContent = 'Locked at 9 lines max (Lover\'s Series)';
    if (lineCounterCalibration) {
      lineCounterCalibration.style.width = '2101.5px';
      lineCounterCalibration.style.fontSize = `${targetFontSize}px`;
      lineCounterCalibration.style.lineHeight = '1.22';
      lineCounterCalibration.style.fontFamily = '"Neue Haas Grotesk Display Pro", "Neue Haas Grotesk Display Pro 55 Roman", "NeueHaasGroteskDisplayPro-55Roman", "Neue Haas Grotesk", sans-serif';
      lineCounterCalibration.style.fontWeight = 'normal';
      lineCounterCalibration.style.webkitFontSmoothing = 'subpixel-antialiased';
    }
    if (lineCounterMeasurement) {
      lineCounterMeasurement.style.width = '2101.5px';
      lineCounterMeasurement.style.fontSize = `${targetFontSize}px`;
      lineCounterMeasurement.style.lineHeight = '1.22';
      lineCounterMeasurement.style.fontFamily = '"Neue Haas Grotesk Display Pro", "Neue Haas Grotesk Display Pro 55 Roman", "NeueHaasGroteskDisplayPro-55Roman", "Neue Haas Grotesk", sans-serif';
      lineCounterMeasurement.style.fontWeight = 'normal';
      lineCounterMeasurement.style.webkitFontSmoothing = 'subpixel-antialiased';
    }
  } else {
    document.body.classList.remove('theme-lovers-series');
    if (lineLimitEl) lineLimitEl.value = '9';
    if (lineLimitHelp) lineLimitHelp.textContent = 'Locked at 9 lines max (Porch Generic)';
    if (lineCounterCalibration) {
      lineCounterCalibration.style.width = '2177px';
      lineCounterCalibration.style.fontSize = `${targetFontSize}px`;
      lineCounterCalibration.style.lineHeight = '1.35';
      lineCounterCalibration.style.fontFamily = '"Neue Haas Grotesk Display Pro", "Neue Haas Grotesk", "Inter", sans-serif';
      lineCounterCalibration.style.fontWeight = 'normal';
    }
    if (lineCounterMeasurement) {
      lineCounterMeasurement.style.width = '2177px';
      lineCounterMeasurement.style.fontSize = `${targetFontSize}px`;
      lineCounterMeasurement.style.lineHeight = '1.35';
      lineCounterMeasurement.style.fontFamily = '"Neue Haas Grotesk Display Pro", "Neue Haas Grotesk", "Inter", sans-serif';
      lineCounterMeasurement.style.fontWeight = 'normal';
    }
  }
  calibrateLineHeight();
  applyContextOpacity(contextOpacityEl.value);
}

if (slideThemeEl) {
  slideThemeEl.addEventListener('change', () => {
    updateCalibrationForTheme();
    if (slidesData.length > 0) {
      renderSlideDeck();
      if (currentView === 'editor') {
        renderActiveSlide();
      }
    }
  });
}

function checkLocalFontPresence() {
  const detector = document.getElementById('font-haas-status');
  // Simple check: Neue Haas Grotesk vs generic sans-serif width comparison
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const text = 'abcdefghijklmnopqrstuvwxyz0123456789';
  
  context.font = '72px sans-serif';
  const widthSans = context.measureText(text).width;
  
  context.font = '72px "Neue Haas Grotesk Display Pro", "Neue Haas Grotesk Display Pro 55 Roman", "NeueHaasGroteskDisplayPro-55Roman", "Neue Haas Grotesk", sans-serif';
  const widthHaas = context.measureText(text).width;
  
  if (widthSans !== widthHaas || navigator.userAgent.includes('Mac')) {
    detector.textContent = 'Active (Neue Haas Grotesk Display Pro Resolved)';
    detector.className = 'status-indicator success';
  } else {
    detector.textContent = 'Active (System Fallback Engaged)';
    detector.className = 'status-indicator info';
  }
}

// Recalibrate on resize to be safe
window.addEventListener('resize', calibrateLineHeight);

// Update opacity label dynamically
contextOpacityEl.addEventListener('input', (e) => {
  const pct = Math.round(e.target.value * 100);
  contextOpacityValEl.textContent = `${pct}%`;
  applyContextOpacity(e.target.value);
});

const scriptureFontSizeEl = document.getElementById('scripture-font-size');
const scriptureFontSizeValEl = document.getElementById('scripture-font-size-value');

if (scriptureFontSizeEl) {
  scriptureFontSizeEl.addEventListener('input', (e) => {
    const newSize = parseInt(e.target.value, 10);
    setScriptureFontSize(newSize);
    if (lineCounterCalibration) {
      lineCounterCalibration.style.fontSize = `${newSize}px`;
    }
    if (lineCounterMeasurement) {
      lineCounterMeasurement.style.fontSize = `${newSize}px`;
    }
    calibrateLineHeight();
    if (slidesData.length > 0 && activeSlideIndex >= 0) {
      const slide = slidesData[activeSlideIndex];
      const isPoetry = slide.format === 'poetry' || (slide.type === 'scripture' && isPoeticBook(slide.bookId, slide.bookName));
      const maxLines = getMaxLines();
      const lines = measureLines(slide.text, isPoetry);
      activeSlideLinesEl.textContent = `${lines} / ${maxLines}`;
      if (lines > maxLines) {
        activeSlideLinesEl.className = 'badge danger';
        activeSlideOverflowWarning.textContent = `⚠️ Warning: Text exceeds ${maxLines} lines! It will be cut off or scaled improperly. Reduce the text or split the slide.`;
        activeSlideOverflowWarning.style.display = 'block';
      } else {
        activeSlideLinesEl.className = 'badge success';
        activeSlideOverflowWarning.style.display = 'none';
      }
      renderSlideDeck();
    }
  });
}

function applyContextOpacity(opacityVal) {
  const isLovers = slideThemeEl && slideThemeEl.value === 'lovers-series';
  const colorRgb = isLovers ? '0, 0, 0' : '255, 255, 255';
  const highlightColor = isLovers ? '#000000' : '#ffffff';

  // Update stylesheet variables dynamically or directly update style on canvas
  document.documentElement.style.setProperty('--muted-opacity', opacityVal);
  
  // Create or update style element for dynamic classes
  let dynamicStyle = document.getElementById('dynamic-opacity-style');
  if (!dynamicStyle) {
    dynamicStyle = document.createElement('style');
    dynamicStyle.id = 'dynamic-opacity-style';
    document.head.appendChild(dynamicStyle);
  }
  dynamicStyle.textContent = `
    .slide-text-body { color: rgba(${colorRgb}, ${opacityVal}) !important; }
    .slide-text-body span.highlight { color: ${highlightColor} !important; opacity: 1.0 !important; }
  `;
}
// Set initial opacity style
applyContextOpacity(contextOpacityEl.value);

// Helper to prevent typographic orphans (single word on a line) by replacing the last space in the last text node with a non-breaking space (\u00a0)
function preventOrphans(htmlOrText) {
  if (!htmlOrText) return '';
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlOrText;
  
  function processLastTextNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const val = node.nodeValue;
      const trimmed = val.replace(/\s+$/, '');
      const trailingWhitespace = val.substring(trimmed.length);
      
      const lastSpaceIdx = trimmed.lastIndexOf(' ');
      if (lastSpaceIdx !== -1) {
        node.nodeValue = trimmed.substring(0, lastSpaceIdx) + '\u00a0' + trimmed.substring(lastSpaceIdx + 1) + trailingWhitespace;
        return true;
      }
    }
    
    for (let i = node.childNodes.length - 1; i >= 0; i--) {
      if (processLastTextNode(node.childNodes[i])) {
        return true;
      }
    }
    return false;
  }
  
  processLastTextNode(tempDiv);
  return tempDiv.innerHTML.replace(/&nbsp;/g, '&#160;');
}

function normalizeLineBreaks(html) {
  if (!html) return '';
  let cleaned = html;
  cleaned = cleaned.replace(/<p\s*[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/p>/gi, '<br />');
  cleaned = cleaned.replace(/<div\s*[^>]*>/gi, '<br />');
  cleaned = cleaned.replace(/<\/div>/gi, '');
  cleaned = cleaned.replace(/^(<br\s*\/?>)+/gi, '');
  cleaned = cleaned.replace(/(<br\s*\/?>)+$/gi, '');
  cleaned = cleaned.replace(/<br\s*\/?>/gi, '<br />');
  return cleaned;
}

// 6. Abbreviation Parser
function parseBookAbbreviation(rawBookStr) {
  // Normalize: lower case, strip dots and spaces
  let cleanStr = rawBookStr.toLowerCase().trim()
    .replace(/\s+/g, '') // remove all whitespace, e.g. "2 corinthians" -> "2corinthians"
    .replace(/\./g, ''); // remove periods
  
  const match = BOOK_MAP[cleanStr];
  if (match) {
    return match;
  }
  return null;
}

function stripOuterQuotes(text) {
  let cleaned = text.trim();
  // Strip leading quotes
  if (cleaned.startsWith('“') || cleaned.startsWith('"') || cleaned.startsWith('\'') || cleaned.startsWith('‘')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('&ldquo;') || cleaned.startsWith('&lsquo;')) {
    cleaned = cleaned.substring(7);
  }
  // Strip trailing quotes
  if (cleaned.endsWith('”') || cleaned.endsWith('"') || cleaned.endsWith('\'') || cleaned.endsWith('’')) {
    cleaned = cleaned.substring(0, cleaned.length - 1);
  } else if (cleaned.endsWith('&rdquo;') || cleaned.endsWith('&rsquo;')) {
    cleaned = cleaned.substring(0, cleaned.length - 7);
  }
  return cleaned.trim();
}

// Parse Raw Input into Outlines
function parseRawInput(text) {
  const lines = text.split('\n');
  const parsed = [];
  
  // Regex to strip slide prefixes: "Slide 1:", "Slide 1 :", "Slide:", "Slide :"
  const slidePrefixRegex = /^Slide\s*(?:\d+\s*)?:\s*/i;
  
  // Scripture Regex: relaxed/tolerant and space-tolerant
  const scriptureRegex = /^([1-3]?\s*[^:\n]+?)\s+(\d+)\s*:\s*([\d\s\-,;]+)(?:\s*(?:\(([A-Za-z0-9\s]+)\)|([A-Za-z0-9\s]+)))?$/i;
  
  // Quote Regex: Author – "Quote" or Author - Quote (with optional quotes and tolerance for inner quotes)
  const quoteRegex = /^([^-–—\n]+?)\s*[-–—]\s*["“'‘]?([\s\S]+?)["”'’]?\s*$/;
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue; // Skip empty lines
    
    // Strip slide prefix
    let cleanLine = line.replace(slidePrefixRegex, '').trim();
    if (!cleanLine) continue;
    
    // Check if there's a #:# pattern (colon surrounded by digits with optional spaces)
    const hasChapterVersePattern = /\d+\s*:\s*\d+/.test(cleanLine);
    
    // 1. Try matching scripture first
    let scripMatch = cleanLine.match(scriptureRegex);
    let matchedScripture = false;
    
    if (scripMatch) {
      const bookRaw = scripMatch[1].trim();
      const chapter = parseInt(scripMatch[2]);
      const verseStr = scripMatch[3].trim();
      const translationOverride = (scripMatch[4] || scripMatch[5]) ? (scripMatch[4] || scripMatch[5]).trim() : null;
      
      const bookMapped = parseBookAbbreviation(bookRaw);
      const isSermonPointKeyword = /^(point|slide|verse|session|chapter|part)\b/i.test(bookRaw);
      
      if (bookMapped || (hasChapterVersePattern && !isSermonPointKeyword)) {
        const verses = parseVersesString(verseStr);
        parsed.push({
          type: 'scripture',
          bookAbbr: bookRaw,
          bookId: bookMapped ? bookMapped.id : null,
          bookName: bookMapped ? bookMapped.name : bookRaw,
          chapter: chapter,
          verses: verses,
          translation: translationOverride,
          rawLine: line
        });
        matchedScripture = true;
      }
    }
    
    // Fallback for scripture lines that failed the anchored regex but have #:# pattern
    if (!matchedScripture && hasChapterVersePattern) {
      const unanchoredRegex = /([1-3]?\s*[^:\n]+?)\s+(\d+)\s*:\s*([\d\s\-,;]+)(?:\s*(?:\(([A-Za-z0-9\s]+)\)|([A-Za-z0-9\s]+)))?/i;
      const fallbackMatch = cleanLine.match(unanchoredRegex);
      if (fallbackMatch) {
        const bookRaw = fallbackMatch[1].trim();
        const chapter = parseInt(fallbackMatch[2]);
        const verseStr = fallbackMatch[3].trim();
        const translationOverride = (fallbackMatch[4] || fallbackMatch[5]) ? (fallbackMatch[4] || fallbackMatch[5]).trim() : null;
        
        const bookMapped = parseBookAbbreviation(bookRaw);
        const isSermonPointKeyword = /^(point|slide|verse|session|chapter|part)\b/i.test(bookRaw);
        
        if (bookMapped || (hasChapterVersePattern && !isSermonPointKeyword)) {
          const verses = parseVersesString(verseStr);
          parsed.push({
            type: 'scripture',
            bookAbbr: bookRaw,
            bookId: bookMapped ? bookMapped.id : null,
            bookName: bookMapped ? bookMapped.name : bookRaw,
            chapter: chapter,
            verses: verses,
            translation: translationOverride,
            rawLine: line
          });
          matchedScripture = true;
        }
      }
    }
    
    if (matchedScripture) continue;
    
    // 2. Try matching quote format next (only if it doesn't have a chapter:verse pattern)
    if (!hasChapterVersePattern) {
      const quoteMatch = cleanLine.match(quoteRegex);
      if (quoteMatch) {
        parsed.push({
          type: 'quote',
          author: quoteMatch[1].trim(),
          text: stripOuterQuotes(quoteMatch[2]),
          rawLine: line
        });
        continue;
      }
    }
    
    // 3. Fallback to sermon point
    parsed.push({
      type: 'sermon-point',
      text: cleanLine
    });
  }
  
  return parsed;
}

function parseVersesString(verseStr) {
  // Parses strings like "30-35", "60; 66", "23", "7-8"
  const parts = verseStr.split(/[;,]/);
  const verses = [];
  
  for (let part of parts) {
    part = part.trim();
    if (!part) continue;
    
    if (part.includes('-')) {
      const range = part.split('-');
      const start = parseInt(range[0].trim());
      const end = parseInt(range[1].trim());
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          verses.push(i);
        }
      }
    } else {
      const v = parseInt(part);
      if (!isNaN(v)) {
        verses.push(v);
      }
    }
  }
  
  // Return unique, sorted numbers
  return [...new Set(verses)].sort((a, b) => a - b);
}

// 7. Bible API fetching with Cache
async function fetchChapter(bookId, chapter, translation) {
  let activeTranslation = translation || translationEl.value;
  if (activeTranslation === 'NASB_1995') {
    activeTranslation = 'NASB';
  }
  const cacheKey = `${activeTranslation}_${bookId}_${chapter}`;
  
  if (chapterCache[cacheKey]) {
    return chapterCache[cacheKey];
  }
  
  try {
    const url = `https://bolls.life/get-text/${activeTranslation}/${bookId}/${chapter}/`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch chapter from Bolls: ${response.status}`);
    }
    const data = await response.json();
    // Cache the data
    chapterCache[cacheKey] = data;
    return data;
  } catch (error) {
    console.error("API Fetch Error:", error);
    return null;
  }
}

// 8. Line measurement and Overflow Detection
function measureLines(htmlContent, isPoetry = false) {
  if (!htmlContent || !htmlContent.trim()) return 0;

  if (isPoetry) {
    lineCounterMeasurement.style.textAlign = 'left';
  } else {
    lineCounterMeasurement.style.textAlign = 'justify';
  }

  // Strip trailing break tags to prevent empty ghost lines
  const cleanHtml = htmlContent.trim().replace(/(<br\s*\/?>)+$/gi, '');
  lineCounterMeasurement.innerHTML = cleanHtml;

  // 1. Precise line-box detection using DOM Range
  try {
    const range = document.createRange();
    range.selectNodeContents(lineCounterMeasurement);
    const rects = range.getClientRects();

    if (rects && rects.length > 0) {
      const lineTops = [];
      const threshold = singleLineHeight * 0.45;
      for (let i = 0; i < rects.length; i++) {
        const r = rects[i];
        if (r.width === 0 && r.height === 0) continue;
        const exists = lineTops.some(top => Math.abs(top - r.top) < threshold);
        if (!exists) {
          lineTops.push(r.top);
        }
      }
      if (lineTops.length > 0) {
        lineCounterMeasurement.innerHTML = '';
        return lineTops.length;
      }
    }
  } catch (err) {
    console.warn("DOM Range measurement fallback:", err);
  }

  // 2. Robust scrollHeight fallback with descender tolerance
  const scrollHeight = lineCounterMeasurement.scrollHeight;
  lineCounterMeasurement.innerHTML = '';

  // Subtract a small descender tolerance (15% of line height) so 8.1 lines isn't rounded up to 9
  const effectiveHeight = Math.max(0, scrollHeight - (singleLineHeight * 0.15));
  return Math.max(1, Math.round(effectiveHeight / singleLineHeight));
}

// Compilation helper for Bible Passage HTML with a specific block range
function compilePassageHtmlForBlock(chapterData, targetVerse, start, end, isPoetry = false) {
  let html = '';
  for (let v = start; v <= end; v++) {
    const vObj = chapterData.find(x => x.verse === v);
    if (!vObj) continue;
    
    let cleanText = vObj.text.trim();
    if (isPoetry) {
      cleanText = formatPoeticVerse(cleanText);
    }
    const isTarget = v === targetVerse;
    const verseContent = isTarget
      ? `<span class="highlight"><sup>${v}</sup>${cleanText}</span>`
      : `<span><sup>${v}</sup>${cleanText}</span>`;

    if (isPoetry) {
      html += `${verseContent}<br />`;
    } else {
      html += `${verseContent} `;
    }
  }
  return html.trim().replace(/(<br\s*\/?>)+$/gi, '');
}

// Compilation helper for Bible Passage HTML
function compilePassageHtml(chapterData, targetVerse, contextSize, isPoetry = false) {
  const start = Math.max(1, targetVerse - contextSize);
  const end = Math.min(chapterData.length, targetVerse + contextSize);
  return compilePassageHtmlForBlock(chapterData, targetVerse, start, end, isPoetry);
}

// Split verse if single verse exceeds line limit
function splitLongVerse(verseNumber, verseText, maxLines, isPoetry = false) {
  const words = verseText.trim().split(/\s+/);
  const slides = [];
  let currentWords = [];
  
  for (let i = 0; i < words.length; i++) {
    currentWords.push(words[i]);
    // Test if this chunk exceeds the line limit
    const testHtml = `<span class="highlight"><sup>${verseNumber}</sup>${currentWords.join(' ')}</span>`;
    const lineCount = measureLines(testHtml, isPoetry);
    
    if (lineCount > maxLines) {
      // The current word caused an overflow. 
      // Remove it, create a slide with the words that fit, and start a new chunk.
      currentWords.pop();
      if (currentWords.length > 0) {
        slides.push(currentWords.join(' '));
      }
      currentWords = [words[i]]; // Start new chunk with the overflow word
    }
  }
  
  if (currentWords.length > 0) {
    slides.push(currentWords.join(' '));
  }
  
  return slides;
}

function getCandidateContextPairs(maxBefore, maxAfter, isSequence, isLastInSequence) {
  const candidates = [];
  for (let b = 0; b <= maxBefore; b++) {
    for (let a = 0; a <= maxAfter; a++) {
      candidates.push({ before: b, after: a, totalContext: b + a });
    }
  }

  candidates.sort((c1, c2) => {
    // 1. Maximize total context
    if (c2.totalContext !== c1.totalContext) {
      return c2.totalContext - c1.totalContext;
    }

    // 2. Tie-breakers
    if (isSequence) {
      if (!isLastInSequence) {
        // More verses follow: prefer having context after (a >= 1)
        const c1HasAfter = c1.after >= 1 ? 1 : 0;
        const c2HasAfter = c2.after >= 1 ? 1 : 0;
        if (c2HasAfter !== c1HasAfter) return c2HasAfter - c1HasAfter;

        const bal1 = Math.abs(c1.before - c1.after);
        const bal2 = Math.abs(c2.before - c2.after);
        if (bal1 !== bal2) return bal1 - bal2;

        return c2.after - c1.after;
      } else {
        // Last verse in sequence: prefer having context before (b >= 1)
        const c1HasBefore = c1.before >= 1 ? 1 : 0;
        const c2HasBefore = c2.before >= 1 ? 1 : 0;
        if (c2HasBefore !== c1HasBefore) return c2HasBefore - c1HasBefore;

        const bal1 = Math.abs(c1.before - c1.after);
        const bal2 = Math.abs(c2.before - c2.after);
        if (bal1 !== bal2) return bal1 - bal2;

        return c2.before - c1.before;
      }
    } else {
      // Single verse: prefer balanced (1, 1) over (0, 2) or (2, 0)
      const bal1 = Math.abs(c1.before - c1.after);
      const bal2 = Math.abs(c2.before - c2.after);
      if (bal1 !== bal2) return bal1 - bal2;
      return c2.after - c1.after;
    }
  });

  return candidates;
}

function findBestBlockForVerse(chapterData, targetVerse, requestedContext, maxLines, isPoetry = false, isSequence = false, isLastInSequence = false) {
  if (requestedContext <= 0) {
    const singleHtml = compilePassageHtmlForBlock(chapterData, targetVerse, targetVerse, targetVerse, isPoetry);
    if (measureLines(singleHtml, isPoetry) <= maxLines) {
      return { start: targetVerse, end: targetVerse, html: singleHtml };
    }
    return null;
  }

  const totalVerses = chapterData.length;
  const maxBefore = Math.min(requestedContext, targetVerse - 1);
  const maxAfter = Math.min(requestedContext, totalVerses - targetVerse);

  const candidates = getCandidateContextPairs(maxBefore, maxAfter, isSequence, isLastInSequence);

  for (const cand of candidates) {
    const start = targetVerse - cand.before;
    const end = targetVerse + cand.after;
    const passageHtml = compilePassageHtmlForBlock(chapterData, targetVerse, start, end, isPoetry);
    const lines = measureLines(passageHtml, isPoetry);
    if (lines <= maxLines) {
      return { start, end, html: passageHtml, lines };
    }
  }

  return null; // Even single target verse exceeds maxLines
}

// Helper to coalesce contiguous scripture requests targeting same book & chapter
function coalesceScriptureRequests(parsedRequests) {
  const coalesced = [];
  for (let i = 0; i < parsedRequests.length; i++) {
    const item = parsedRequests[i];
    if (item.type !== 'scripture') {
      coalesced.push(item);
      continue;
    }
    
    const prev = coalesced.length > 0 ? coalesced[coalesced.length - 1] : null;
    if (
      prev &&
      prev.type === 'scripture' &&
      prev.bookId === item.bookId &&
      prev.chapter === item.chapter &&
      prev.translation === item.translation
    ) {
      const lastPrevVerse = prev.verses[prev.verses.length - 1];
      const firstCurrVerse = item.verses[0];
      if (firstCurrVerse === lastPrevVerse + 1 || prev.verses.includes(firstCurrVerse)) {
        for (const v of item.verses) {
          if (!prev.verses.includes(v)) {
            prev.verses.push(v);
          }
        }
        prev.verses.sort((a, b) => a - b);
        continue;
      }
    }
    coalesced.push({ ...item, verses: [...item.verses] });
  }
  return coalesced;
}

// 9. Generate Slide Outline array
async function buildSlides(parsedRequests) {
  const slides = [];
  const globalTranslation = translationEl.value;
  const maxLines = getMaxLines();
  const coalescedRequests = coalesceScriptureRequests(parsedRequests);
  
  for (const item of coalescedRequests) {
    if (item.type === 'sermon-point') {
      slides.push({
        type: 'sermon-point',
        text: preventOrphans(item.text.toUpperCase()),
        refBook: '',
        refVerse: '',
        rawText: item.text
      });
    } else if (item.type === 'quote') {
      slides.push({
        type: 'quote',
        text: preventOrphans(item.text),
        author: item.author.toUpperCase(),
        refBook: '',
        refVerse: '',
        rawText: item.text
      });
    } else if (item.type === 'scripture') {
      const { bookId, bookName, chapter, verses, translation } = item;
      
      let targetTranslation = globalTranslation;
      if (translation) {
        const mapped = TRANSLATION_MAP[translation.toLowerCase()];
        if (mapped) {
          targetTranslation = mapped;
        }
      }
      
      const chapterData = await fetchChapter(bookId, chapter, targetTranslation);
      if (!chapterData) {
        slides.push({
          type: 'scripture',
          text: `<span class="highlight">[Error: Could not fetch ${bookName} ${chapter}]</span>`,
          refBook: bookName.toUpperCase(),
          refVerse: `${chapter}:${verses.join(', ')}`,
          rawText: `[Error: Could not fetch ${bookName} ${chapter}]`,
          bookId: bookId,
          bookName: bookName,
          chapter: chapter,
          targetVerse: verses[0] || 1,
          translation: targetTranslation
        });
        continue;
      }
      
      const isPoetry = isPoeticBook(bookId, bookName);
      const slideFormat = isPoetry ? 'poetry' : 'prose';
      const requestedContext = parseInt(contextWindowEl.value) || 0;

      // Stationary Sequence Chunker:
      // Partition contiguous target verses into stationary blocks so that all slides
      // in the same block share identical text and line wraps (only the highlight moves).
      let vIdx = 0;
      while (vIdx < verses.length) {
        const firstTarget = verses[vIdx];
        const firstTargetObj = chapterData.find(v => v.verse === firstTarget);
        if (!firstTargetObj) {
          vIdx++;
          continue;
        }

        // Test if single target verse itself exceeds max lines
        const formattedSingle = isPoetry ? formatPoeticVerse(firstTargetObj.text.trim()) : firstTargetObj.text.trim();
        const singleHtml = compilePassageHtmlForBlock(chapterData, firstTarget, firstTarget, firstTarget, isPoetry);
        if (measureLines(singleHtml, isPoetry) > maxLines) {
          // Split oversized single verse across slides
          const parts = splitLongVerse(firstTarget, formattedSingle, maxLines, isPoetry);
          for (let p = 0; p < parts.length; p++) {
            const partHtml = `<span class="highlight"><sup>${firstTarget}</sup>${parts[p]}</span>`;
            slides.push({
              type: 'scripture',
              text: preventOrphans(partHtml),
              refBook: bookName.toUpperCase(),
              refVerse: `${chapter}:${firstTarget}`,
              rawText: partHtml,
              bookId: bookId,
              bookName: bookName,
              chapter: chapter,
              targetVerse: firstTarget,
              translation: targetTranslation,
              format: slideFormat,
              isPoetry: isPoetry
            });
          }
          vIdx++;
          continue;
        }

        // 1. Greedily find how many consecutive target verses fit together in this stationary block
        let maxTargetEndIdx = vIdx;
        while (maxTargetEndIdx + 1 < verses.length) {
          const testStart = firstTarget;
          const testEnd = verses[maxTargetEndIdx + 1];
          const testHtml = compilePassageHtmlForBlock(chapterData, firstTarget, testStart, testEnd, isPoetry);
          if (measureLines(testHtml, isPoetry) <= maxLines) {
            maxTargetEndIdx++;
          } else {
            break;
          }
        }

        const chunkTargetVerses = verses.slice(vIdx, maxTargetEndIdx + 1);
        const coreStart = firstTarget;
        const coreEnd = verses[maxTargetEndIdx];

        // 2. Expand context before / after up to requestedContext (if room allows up to maxLines)
        let finalBlockStart = coreStart;
        let finalBlockEnd = coreEnd;

        if (requestedContext > 0) {
          const totalVerses = chapterData.length;
          const maxBefore = Math.min(requestedContext, coreStart - 1);
          const maxAfter = Math.min(requestedContext, totalVerses - coreEnd);

          const candidates = [];
          for (let b = maxBefore; b >= 0; b--) {
            for (let a = maxAfter; a >= 0; a--) {
              candidates.push({ before: b, after: a, total: b + a });
            }
          }
          // Sort candidates: highest total context first, then prefer context after if following verses exist
          candidates.sort((c1, c2) => {
            if (c2.total !== c1.total) return c2.total - c1.total;
            return c2.after - c1.after;
          });

          for (const cand of candidates) {
            const candStart = coreStart - cand.before;
            const candEnd = coreEnd + cand.after;
            const testHtml = compilePassageHtmlForBlock(chapterData, firstTarget, candStart, candEnd, isPoetry);
            if (measureLines(testHtml, isPoetry) <= maxLines) {
              finalBlockStart = candStart;
              finalBlockEnd = candEnd;
              break;
            }
          }
        }

        // 3. Generate a slide for each target verse in the chunk using the exact same stationary passage block
        for (let t = 0; t < chunkTargetVerses.length; t++) {
          const targetVerse = chunkTargetVerses[t];
          const slideTextHtml = compilePassageHtmlForBlock(chapterData, targetVerse, finalBlockStart, finalBlockEnd, isPoetry);
          slides.push({
            type: 'scripture',
            text: preventOrphans(slideTextHtml),
            refBook: bookName.toUpperCase(),
            refVerse: `${chapter}:${targetVerse}`,
            rawText: slideTextHtml,
            bookId: bookId,
            bookName: bookName,
            chapter: chapter,
            targetVerse: targetVerse,
            translation: targetTranslation,
            blockStart: finalBlockStart,
            blockEnd: finalBlockEnd,
            format: slideFormat,
            isPoetry: isPoetry
          });
        }

        // Advance to next target verse beyond this chunk
        vIdx = maxTargetEndIdx + 1;
      }
    }
  }
  
  return slides;
}

// 10. Render Slide Deck to Sorter Grid & Editor
function renderSlideDeck() {
  // Clear Sorter Grid
  gridViewEl.innerHTML = '';
  
  if (slidesData.length === 0) {
    gridViewEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📖</div>
        <h3>No Slides Generated Yet</h3>
        <p>Paste your weekly request and click <strong>Generate Slides</strong> to see the preview here.</p>
      </div>
    `;
    slideCountEl.textContent = '0 slides generated';
    btnExport.disabled = true;
    if (btnExportProPresenter) btnExportProPresenter.disabled = true;
    if (btnGridExport) btnGridExport.disabled = true;
    if (btnGridExportProPresenter) btnGridExportProPresenter.disabled = true;
    if (gridExportBar) gridExportBar.style.display = 'none';
    if (btnShareDraft) btnShareDraft.disabled = true;
    if (btnProofSheet) btnProofSheet.disabled = true;
    return;
  }
  
  slideCountEl.textContent = `${slidesData.length} slides generated`;
  btnExport.disabled = false;
  btnExport.innerHTML = `${DOWNLOAD_ICON_SVG}<span>All Slides Images (zip)</span>`;
  if (btnGridExport) {
    btnGridExport.disabled = false;
    btnGridExport.innerHTML = `${DOWNLOAD_ICON_SVG}<span>All Slides Images (zip)</span>`;
  }

  if (btnExportProPresenter) {
    btnExportProPresenter.disabled = false;
    btnExportProPresenter.innerHTML = `${PROPRESENTER_ICON_SVG}<span>Export for ProPresenter</span>`;
  }
  if (btnGridExportProPresenter) {
    btnGridExportProPresenter.disabled = false;
    btnGridExportProPresenter.innerHTML = `${PROPRESENTER_ICON_SVG}<span>Export for ProPresenter</span>`;
  }

  if (gridExportBar && currentView === 'grid') {
    gridExportBar.style.display = 'flex';
  }

  if (btnShareDraft) btnShareDraft.disabled = false;
  if (btnProofSheet) btnProofSheet.disabled = false;
  
  // Responsive scale of visual thumbnails to match 16:9 card aspect ratio.
  // The layout draws at 4K (3840x2160), and CSS scales it dynamically via --grid-scale.
  slidesData.forEach((slide, idx) => {
    const card = document.createElement('div');
    card.className = `grid-slide-card checkerboard ${idx === activeSlideIndex ? 'active' : ''}`;
    
    // Core slide structure
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'grid-slide-content-wrapper';
    
    const slideCanvas = document.createElement('div');
    slideCanvas.className = 'slide-canvas';
    
    if (slide.type === 'scripture') {
      const poetryClass = (slide.format === 'poetry') ? 'format-poetry' : '';
      slideCanvas.innerHTML = `
        <div class="slide-left-column">
          <div class="slide-ref-book">${slide.refBook}</div>
          <div class="slide-ref-verse">${slide.refVerse}</div>
        </div>
        <div class="slide-divider"></div>
        <div class="slide-right-column">
          <div class="slide-text-body ${poetryClass}">${slide.text}</div>
        </div>
      `;
    } else if (slide.type === 'quote') {
      slideCanvas.innerHTML = `
        <div class="slide-quote-container">
          <div class="slide-quote-text">“${slide.text}”</div>
          <div class="slide-quote-author">${slide.author}</div>
        </div>
      `;
    } else {
      slideCanvas.innerHTML = `
        <div class="slide-center-title">${slide.text}</div>
      `;
    }
    
    contentWrapper.appendChild(slideCanvas);
    card.appendChild(contentWrapper);
    
    // Bottom Overlay Info bar
    const infoBar = document.createElement('div');
    infoBar.className = 'grid-slide-info';
    infoBar.innerHTML = `
      <span class="grid-slide-num">Slide ${idx + 1}</span>
      <span class="grid-slide-label">${slide.type === 'scripture' ? `${slide.refBook} ${slide.refVerse}` : (slide.type === 'quote' ? `Quote: ${slide.author}` : 'Title')}</span>
    `;
    card.appendChild(infoBar);
    
    // Grid click -> switch to editor on this slide
    card.addEventListener('click', () => {
      activeSlideIndex = idx;
      switchView('editor');
      renderActiveSlide();
    });
    
    gridViewEl.appendChild(card);
  });
  
  updateGridScale();
}

async function getChapterDataForSlide(slide) {
  let bookId = slide.bookId;
  let chapter = slide.chapter;
  let translation = slide.translation || translationEl.value;

  if (!bookId && slide.refBook) {
    const cleanBook = slide.refBook.toLowerCase().replace(/[^a-z0-9]/g, '');
    bookId = BOOK_MAP[cleanBook];
  }
  if (!chapter && slide.refVerse) {
    const match = slide.refVerse.match(/(\d+):/);
    if (match) chapter = parseInt(match[1]);
  }

  if (bookId && chapter) {
    return await fetchChapter(bookId, chapter, translation);
  }
  return null;
}

function updateContextButtonStates(slide) {
  const btnAddUpper = document.getElementById('btn-add-upper-context');
  const btnAddLower = document.getElementById('btn-add-lower-context');
  const btnRemoveUpper = document.getElementById('btn-remove-upper-context');
  const btnRemoveLower = document.getElementById('btn-remove-lower-context');
  if (!btnAddUpper || !btnAddLower) return;

  if (!slide || slide.type !== 'scripture') {
    btnAddUpper.disabled = true;
    btnAddLower.disabled = true;
    if (btnRemoveUpper) btnRemoveUpper.disabled = true;
    if (btnRemoveLower) btnRemoveLower.disabled = true;
    return;
  }

  const matches = [...slide.text.matchAll(/<sup>(\d+)<\/sup>/g)];
  const currentVerses = matches.map(m => parseInt(m[1])).filter(n => !isNaN(n));
  const currentMinVerse = currentVerses.length > 0 ? Math.min(...currentVerses) : (slide.blockStart || slide.targetVerse || 1);
  const currentMaxVerse = currentVerses.length > 0 ? Math.max(...currentVerses) : (slide.blockEnd || slide.targetVerse || 1);

  if (currentMinVerse <= 1) {
    btnAddUpper.disabled = true;
    btnAddUpper.title = 'Already at verse 1 of chapter';
    btnAddUpper.innerHTML = '<span class="icon">▲</span> Add Upper Context';
  } else {
    btnAddUpper.disabled = false;
    btnAddUpper.title = `Add verse ${currentMinVerse - 1} as upper context`;
    btnAddUpper.innerHTML = `<span class="icon">▲</span> Add Upper Context (v${currentMinVerse - 1})`;
  }

  btnAddLower.disabled = false;
  btnAddLower.title = `Add verse ${currentMaxVerse + 1} as lower context`;
  btnAddLower.innerHTML = `<span class="icon">▼</span> Add Lower Context (v${currentMaxVerse + 1})`;

  // Remove Upper & Lower Context states
  if (btnRemoveUpper || btnRemoveLower) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = slide.text || '';
    const highlightedSups = Array.from(tempDiv.querySelectorAll('.highlight sup'));
    const highlightedVerseNums = highlightedSups.map(s => parseInt(s.textContent.trim())).filter(n => !isNaN(n));

    let minHighlighted = null;
    let maxHighlighted = null;
    if (highlightedVerseNums.length > 0) {
      minHighlighted = Math.min(...highlightedVerseNums);
      maxHighlighted = Math.max(...highlightedVerseNums);
    } else if (slide.targetVerse) {
      minHighlighted = slide.targetVerse;
      maxHighlighted = slide.targetVerse;
    }

    if (btnRemoveUpper) {
      const canRemoveUpper = currentVerses.length > 1 && (minHighlighted !== null ? currentMinVerse < minHighlighted : true);
      if (canRemoveUpper) {
        btnRemoveUpper.disabled = false;
        btnRemoveUpper.title = `Remove verse ${currentMinVerse} from upper context`;
        btnRemoveUpper.innerHTML = `<span class="icon">✕</span> Remove Upper Context (v${currentMinVerse})`;
      } else {
        btnRemoveUpper.disabled = true;
        btnRemoveUpper.title = 'No upper context to remove';
        btnRemoveUpper.innerHTML = '<span class="icon">✕</span> Remove Upper Context';
      }
    }

    if (btnRemoveLower) {
      const canRemoveLower = currentVerses.length > 1 && (maxHighlighted !== null ? currentMaxVerse > maxHighlighted : true);
      if (canRemoveLower) {
        btnRemoveLower.disabled = false;
        btnRemoveLower.title = `Remove verse ${currentMaxVerse} from lower context`;
        btnRemoveLower.innerHTML = `<span class="icon">✕</span> Remove Lower Context (v${currentMaxVerse})`;
      } else {
        btnRemoveLower.disabled = true;
        btnRemoveLower.title = 'No lower context to remove';
        btnRemoveLower.innerHTML = '<span class="icon">✕</span> Remove Lower Context';
      }
    }
  }
}

function removeUpperContext() {
  const slide = slidesData[activeSlideIndex];
  if (!slide || slide.type !== 'scripture') return;

  const btnRemoveUpper = document.getElementById('btn-remove-upper-context');
  if (btnRemoveUpper) btnRemoveUpper.disabled = true;

  try {
    const temp = document.createElement('div');
    temp.innerHTML = slide.text;

    const supList = Array.from(temp.querySelectorAll('sup'));
    if (supList.length <= 1) return;

    const firstSup = supList[0];
    const secondSup = supList[1];

    // Find topmost ancestor of firstSup that is a direct child of temp
    let firstTop = firstSup;
    while (firstTop.parentElement && firstTop.parentElement !== temp) {
      firstTop = firstTop.parentElement;
    }

    // Find topmost ancestor of secondSup that is a direct child of temp
    let secondTop = secondSup;
    while (secondTop.parentElement && secondTop.parentElement !== temp) {
      secondTop = secondTop.parentElement;
    }

    if (firstTop !== secondTop) {
      let curr = firstTop.nextSibling;
      while (curr && curr !== secondTop) {
        const next = curr.nextSibling;
        curr.remove();
        curr = next;
      }
      firstTop.remove();
    } else {
      let curr = firstSup;
      while (curr && curr !== secondSup) {
        let next = curr.nextSibling;
        if (curr.contains && curr.contains(secondSup)) {
          break;
        }
        curr.remove();
        curr = next;
      }
    }

    const cleanedHtml = temp.innerHTML.trim().replace(/^(<br\s*\/?>|\s)+|(<br\s*\/?>|\s)+$/gi, '');
    slide.text = preventOrphans(cleanedHtml);
    slide.rawText = slide.text;

    const remainingSups = [...slide.text.matchAll(/<sup>(\d+)<\/sup>/g)].map(m => parseInt(m[1])).filter(n => !isNaN(n));
    if (remainingSups.length > 0) {
      slide.blockStart = Math.min(...remainingSups);
    }

    // Update UI
    editorBodyEl.innerHTML = slide.text;
    activeSlideTextarea.value = slide.text.replace(/<br\s*\/?>/gi, '\n').replace(/&nbsp;|\u00a0/g, ' ');

    const isPoetry = slide.format === 'poetry' || (slide.type === 'scripture' && isPoeticBook(slide.bookId, slide.bookName));
    const maxLines = getMaxLines();
    const lines = measureLines(slide.text, isPoetry);
    activeSlideLinesEl.textContent = `${lines} / ${maxLines}`;
    if (lines > maxLines) {
      activeSlideLinesEl.className = 'badge danger';
      activeSlideOverflowWarning.textContent = `⚠️ Warning: Text exceeds ${maxLines} lines! It will be cut off or scaled improperly. Reduce the text or split the slide.`;
      activeSlideOverflowWarning.style.display = 'block';
    } else {
      activeSlideLinesEl.className = 'badge success';
      activeSlideOverflowWarning.style.display = 'none';
    }

    updateContextButtonStates(slide);
    updateActiveSlideNotesPreview();
    renderSlideDeck();
    scaleEditorCanvas();
  } catch (err) {
    console.error("Error removing upper context:", err);
  } finally {
    if (btnRemoveUpper) btnRemoveUpper.disabled = false;
  }
}

function removeLowerContext() {
  const slide = slidesData[activeSlideIndex];
  if (!slide || slide.type !== 'scripture') return;

  const btnRemoveLower = document.getElementById('btn-remove-lower-context');
  if (btnRemoveLower) btnRemoveLower.disabled = true;

  try {
    const temp = document.createElement('div');
    temp.innerHTML = slide.text;

    const supList = Array.from(temp.querySelectorAll('sup'));
    if (supList.length <= 1) return;

    const lastSup = supList[supList.length - 1];
    const prevSup = supList[supList.length - 2];

    // Find topmost ancestor of lastSup that is a direct child of temp
    let lastTop = lastSup;
    while (lastTop.parentElement && lastTop.parentElement !== temp) {
      lastTop = lastTop.parentElement;
    }

    // Find topmost ancestor of prevSup that is a direct child of temp
    let prevTop = prevSup;
    while (prevTop.parentElement && prevTop.parentElement !== temp) {
      prevTop = prevTop.parentElement;
    }

    if (lastTop !== prevTop) {
      let curr = prevTop.nextSibling;
      while (curr && curr !== lastTop) {
        const next = curr.nextSibling;
        curr.remove();
        curr = next;
      }
      let after = lastTop.nextSibling;
      while (after) {
        const next = after.nextSibling;
        after.remove();
        after = next;
      }
      lastTop.remove();
    } else {
      let curr = lastSup;
      while (curr) {
        const next = curr.nextSibling;
        curr.remove();
        curr = next;
      }
    }

    const cleanedHtml = temp.innerHTML.trim().replace(/^(<br\s*\/?>|\s)+|(<br\s*\/?>|\s)+$/gi, '');
    slide.text = preventOrphans(cleanedHtml);
    slide.rawText = slide.text;

    const remainingSups = [...slide.text.matchAll(/<sup>(\d+)<\/sup>/g)].map(m => parseInt(m[1])).filter(n => !isNaN(n));
    if (remainingSups.length > 0) {
      slide.blockEnd = Math.max(...remainingSups);
    }

    // Update UI
    editorBodyEl.innerHTML = slide.text;
    activeSlideTextarea.value = slide.text.replace(/<br\s*\/?>/gi, '\n').replace(/&nbsp;|\u00a0/g, ' ');

    const isPoetry = slide.format === 'poetry' || (slide.type === 'scripture' && isPoeticBook(slide.bookId, slide.bookName));
    const maxLines = getMaxLines();
    const lines = measureLines(slide.text, isPoetry);
    activeSlideLinesEl.textContent = `${lines} / ${maxLines}`;
    if (lines > maxLines) {
      activeSlideLinesEl.className = 'badge danger';
      activeSlideOverflowWarning.textContent = `⚠️ Warning: Text exceeds ${maxLines} lines! It will be cut off or scaled improperly. Reduce the text or split the slide.`;
      activeSlideOverflowWarning.style.display = 'block';
    } else {
      activeSlideLinesEl.className = 'badge success';
      activeSlideOverflowWarning.style.display = 'none';
    }

    updateContextButtonStates(slide);
    updateActiveSlideNotesPreview();
    renderSlideDeck();
    scaleEditorCanvas();
  } catch (err) {
    console.error("Error removing lower context:", err);
  } finally {
    if (btnRemoveLower) btnRemoveLower.disabled = false;
  }
}

async function addUpperContext() {
  const slide = slidesData[activeSlideIndex];
  if (!slide || slide.type !== 'scripture') return;

  const btnAddUpper = document.getElementById('btn-add-upper-context');
  if (btnAddUpper) btnAddUpper.disabled = true;

  try {
    const chapterData = await getChapterDataForSlide(slide);
    if (!chapterData) {
      alert("Could not load chapter data to add context.");
      return;
    }

    const matches = [...slide.text.matchAll(/<sup>(\d+)<\/sup>/g)];
    const currentVerses = matches.map(m => parseInt(m[1])).filter(n => !isNaN(n));
    const currentMinVerse = currentVerses.length > 0 ? Math.min(...currentVerses) : (slide.blockStart || slide.targetVerse || 1);
    const targetUpperVerse = currentMinVerse - 1;

    if (targetUpperVerse < 1) {
      alert("Already at the first verse of the chapter (Verse 1).");
      return;
    }

    const verseObj = chapterData.find(v => v.verse === targetUpperVerse);
    if (!verseObj) {
      alert(`Verse ${targetUpperVerse} was not found in chapter.`);
      return;
    }

    const isPoetry = slide.format === 'poetry' || (slide.type === 'scripture' && isPoeticBook(slide.bookId, slide.bookName));
    let cleanText = verseObj.text.trim();
    if (isPoetry) {
      cleanText = formatPoeticVerse(cleanText);
    }

    const upperHtml = `<span><sup>${targetUpperVerse}</sup>${cleanText}</span>`;
    if (isPoetry) {
      slide.text = preventOrphans(`${upperHtml}<br />${slide.text}`);
    } else {
      slide.text = preventOrphans(`${upperHtml} ${slide.text}`);
    }
    slide.blockStart = targetUpperVerse;

    // Update UI
    editorBodyEl.innerHTML = slide.text;
    activeSlideTextarea.value = slide.text.replace(/<br\s*\/?>/gi, '\n').replace(/&nbsp;|\u00a0/g, ' ');

    const maxLines = getMaxLines();
    const lines = measureLines(slide.text, isPoetry);
    activeSlideLinesEl.textContent = `${lines} / ${maxLines}`;
    if (lines > maxLines) {
      activeSlideLinesEl.className = 'badge danger';
      activeSlideOverflowWarning.textContent = `⚠️ Warning: Text exceeds ${maxLines} lines! It will be cut off or scaled improperly. Reduce the text or split the slide.`;
      activeSlideOverflowWarning.style.display = 'block';
    } else {
      activeSlideLinesEl.className = 'badge success';
      activeSlideOverflowWarning.style.display = 'none';
    }

    updateContextButtonStates(slide);
    updateActiveSlideNotesPreview();
    renderSlideDeck();
    scaleEditorCanvas();
  } catch (err) {
    console.error("Error adding upper context:", err);
    alert("Failed to add upper context: " + err.message);
  } finally {
    if (btnAddUpper) btnAddUpper.disabled = false;
  }
}

async function addLowerContext() {
  const slide = slidesData[activeSlideIndex];
  if (!slide || slide.type !== 'scripture') return;

  const btnAddLower = document.getElementById('btn-add-lower-context');
  if (btnAddLower) btnAddLower.disabled = true;

  try {
    const chapterData = await getChapterDataForSlide(slide);
    if (!chapterData) {
      alert("Could not load chapter data to add context.");
      return;
    }

    const matches = [...slide.text.matchAll(/<sup>(\d+)<\/sup>/g)];
    const currentVerses = matches.map(m => parseInt(m[1])).filter(n => !isNaN(n));
    const currentMaxVerse = currentVerses.length > 0 ? Math.max(...currentVerses) : (slide.blockEnd || slide.targetVerse || 1);
    const targetLowerVerse = currentMaxVerse + 1;

    if (targetLowerVerse > chapterData.length) {
      alert(`Already at the last verse of the chapter (Verse ${chapterData.length}).`);
      return;
    }

    const verseObj = chapterData.find(v => v.verse === targetLowerVerse);
    if (!verseObj) {
      alert(`Verse ${targetLowerVerse} was not found in chapter.`);
      return;
    }

    const isPoetry = slide.format === 'poetry' || (slide.type === 'scripture' && isPoeticBook(slide.bookId, slide.bookName));
    let cleanText = verseObj.text.trim();
    if (isPoetry) {
      cleanText = formatPoeticVerse(cleanText);
    }

    const lowerHtml = `<span><sup>${targetLowerVerse}</sup>${cleanText}</span>`;
    if (isPoetry) {
      slide.text = preventOrphans(`${slide.text}<br />${lowerHtml}`);
    } else {
      slide.text = preventOrphans(`${slide.text} ${lowerHtml}`);
    }
    slide.blockEnd = targetLowerVerse;

    // Update UI
    editorBodyEl.innerHTML = slide.text;
    activeSlideTextarea.value = slide.text.replace(/<br\s*\/?>/gi, '\n').replace(/&nbsp;|\u00a0/g, ' ');

    const maxLines = getMaxLines();
    const lines = measureLines(slide.text, isPoetry);
    activeSlideLinesEl.textContent = `${lines} / ${maxLines}`;
    if (lines > maxLines) {
      activeSlideLinesEl.className = 'badge danger';
      activeSlideOverflowWarning.textContent = `⚠️ Warning: Text exceeds ${maxLines} lines! It will be cut off or scaled improperly. Reduce the text or split the slide.`;
      activeSlideOverflowWarning.style.display = 'block';
    } else {
      activeSlideLinesEl.className = 'badge success';
      activeSlideOverflowWarning.style.display = 'none';
    }

    updateContextButtonStates(slide);
    updateActiveSlideNotesPreview();
    renderSlideDeck();
    scaleEditorCanvas();
  } catch (err) {
    console.error("Error adding lower context:", err);
    alert("Failed to add lower context: " + err.message);
  } finally {
    if (btnAddLower) btnAddLower.disabled = false;
  }
}

function renderActiveSlide() {
  if (slidesData.length === 0) return;
  
  const slide = slidesData[activeSlideIndex];
  
  // Show editor, update form fields
  editorSlideIndexEl.textContent = `Slide ${activeSlideIndex + 1} of ${slidesData.length}`;
  
  activeSlideTypeSelect.value = slide.type;
  
  // Setup elements in visual preview
  if (slide.type === 'scripture') {
    editorBookEl.style.display = 'block';
    editorVerseEl.style.display = 'block';
    slideCanvasPreview.querySelector('.slide-divider').style.display = 'block';
    editorBodyEl.style.display = 'block';
    editorTitleEl.style.display = 'none';
    editorQuoteContainer.style.display = 'none';
    
    editorBookEl.textContent = slide.refBook;
    editorVerseEl.textContent = slide.refVerse;
    editorBodyEl.innerHTML = slide.text;

    const isPoetic = slide.format ? (slide.format === 'poetry') : isPoeticBook(slide.bookId, slide.bookName);
    slide.format = isPoetic ? 'poetry' : 'prose';
    if (slide.format === 'poetry') {
      editorBodyEl.classList.add('format-poetry');
    } else {
      editorBodyEl.classList.remove('format-poetry');
    }
    
    activeSlideTextarea.value = slide.text.replace(/<br\s*\/?>/gi, '\n').replace(/&nbsp;|\u00a0/g, ' ');
    activeSlideTranslationContainer.style.display = 'flex';
    activeSlideTranslationEl.value = slide.translation || translationEl.value;
    if (activeSlideFormatContainer) {
      activeSlideFormatContainer.style.display = 'flex';
      activeSlideFormatEl.value = slide.format;
    }
    const upperContextBar = document.getElementById('editor-upper-context-bar');
    const lowerContextBar = document.getElementById('editor-lower-context-bar');
    if (upperContextBar) {
      upperContextBar.style.visibility = 'visible';
      upperContextBar.style.pointerEvents = 'auto';
    }
    if (lowerContextBar) {
      lowerContextBar.style.visibility = 'visible';
      lowerContextBar.style.pointerEvents = 'auto';
    }
    updateContextButtonStates(slide);
  } else if (slide.type === 'quote') {
    editorBookEl.style.display = 'none';
    editorVerseEl.style.display = 'none';
    slideCanvasPreview.querySelector('.slide-divider').style.display = 'none';
    editorBodyEl.style.display = 'none';
    editorTitleEl.style.display = 'none';
    editorQuoteContainer.style.display = 'flex';
    editorBodyEl.classList.remove('format-poetry');
    
    editorQuoteTextEl.innerHTML = `“${slide.text}”`;
    editorQuoteAuthorEl.textContent = slide.author;
    
    activeSlideTextarea.value = slide.text.replace(/<br\s*\/?>/gi, '\n').replace(/&nbsp;|\u00a0/g, ' ');
    activeSlideTranslationContainer.style.display = 'none';
    if (activeSlideFormatContainer) activeSlideFormatContainer.style.display = 'none';
    const upperContextBar = document.getElementById('editor-upper-context-bar');
    const lowerContextBar = document.getElementById('editor-lower-context-bar');
    if (upperContextBar) {
      upperContextBar.style.visibility = 'hidden';
      upperContextBar.style.pointerEvents = 'none';
    }
    if (lowerContextBar) {
      lowerContextBar.style.visibility = 'hidden';
      lowerContextBar.style.pointerEvents = 'none';
    }
  } else {
    editorBookEl.style.display = 'none';
    editorVerseEl.style.display = 'none';
    slideCanvasPreview.querySelector('.slide-divider').style.display = 'none';
    editorBodyEl.style.display = 'none';
    editorTitleEl.style.display = 'flex';
    editorQuoteContainer.style.display = 'none';
    editorBodyEl.classList.remove('format-poetry');
    
    editorTitleEl.innerHTML = slide.text;
    activeSlideTextarea.value = slide.text.replace(/<br\s*\/?>/gi, '\n').replace(/&nbsp;|\u00a0/g, ' ');
    activeSlideTranslationContainer.style.display = 'none';
    if (activeSlideFormatContainer) activeSlideFormatContainer.style.display = 'none';
    const upperContextBar = document.getElementById('editor-upper-context-bar');
    const lowerContextBar = document.getElementById('editor-lower-context-bar');
    if (upperContextBar) {
      upperContextBar.style.visibility = 'hidden';
      upperContextBar.style.pointerEvents = 'none';
    }
    if (lowerContextBar) {
      lowerContextBar.style.visibility = 'hidden';
      lowerContextBar.style.pointerEvents = 'none';
    }
  }
  
  // Calculate and display line count
  const maxLines = getMaxLines();
  const isPoetry = slide.format === 'poetry' || (slide.type === 'scripture' && isPoeticBook(slide.bookId, slide.bookName));
  const lines = measureLines(slide.text, isPoetry);
  activeSlideLinesEl.textContent = `${lines} / ${maxLines}`;
  
  if (lines > maxLines) {
    activeSlideLinesEl.className = 'badge danger';
    activeSlideOverflowWarning.textContent = `⚠️ Warning: Text exceeds ${maxLines} lines! It will be cut off or scaled improperly. Reduce the text or split the slide.`;
    activeSlideOverflowWarning.style.display = 'block';
  } else {
    activeSlideLinesEl.className = 'badge success';
    activeSlideOverflowWarning.style.display = 'none';
  }
  
  updateActiveSlideNotesPreview();
  scaleEditorCanvas();
}

// Update the ProPresenter Notes preview box in the editor sidebar
function updateActiveSlideNotesPreview() {
  if (!activeSlideNotesPreview) return;
  const slide = slidesData[activeSlideIndex];
  if (!slide) {
    activeSlideNotesPreview.textContent = '-';
    return;
  }
  const notes = extractSlideNotes(slide);
  activeSlideNotesPreview.textContent = notes || '(No notes for this slide)';
}

// 11. Scale Editor Preview dynamically to fit parent
function scaleEditorCanvas() {
  const container = document.querySelector('.editor-main');
  if (!container || editorViewEl.style.display === 'none') return;
  
  const upperBar = document.getElementById('editor-upper-context-bar');
  const lowerBar = document.getElementById('editor-lower-context-bar');
  const upperHeight = (upperBar && upperBar.offsetHeight) ? upperBar.offsetHeight + 10 : 54;
  const lowerHeight = (lowerBar && lowerBar.offsetHeight) ? lowerBar.offsetHeight + 10 : 54;

  const containerWidth = container.clientWidth - 48; // padding
  const containerHeight = container.clientHeight - 28 - upperHeight - lowerHeight;
  
  // Scale factor based on 3840x2160
  const scaleX = containerWidth / 3840;
  const scaleY = containerHeight / 2160;
  const scaleFactor = Math.max(0.1, Math.min(scaleX, scaleY, 1.0)); // max 1.0
  
  // Apply transform scale on the canvas
  slideCanvasPreview.style.transform = `scale(${scaleFactor})`;
  
  // Explicitly size the parent wrapper to the scaled dimensions so it centers correctly
  const scalerWrapper = slideCanvasPreview.parentElement;
  if (scalerWrapper) {
    scalerWrapper.style.width = `${3840 * scaleFactor}px`;
    scalerWrapper.style.height = `${2160 * scaleFactor}px`;
  }
}

// Dynamically scale grid thumbnails to match card's 16:9 bounding box
function updateGridScale() {
  if (!gridViewEl || gridViewEl.style.display === 'none') return;
  const firstCard = gridViewEl.querySelector('.grid-slide-card');
  let cardWidth = 0;
  if (firstCard && firstCard.clientWidth > 0) {
    cardWidth = firstCard.clientWidth;
  } else if (gridViewEl.clientWidth > 0) {
    const containerWidth = gridViewEl.clientWidth;
    const gap = 24;
    const minColWidth = 320;
    const cols = Math.max(1, Math.floor((containerWidth + gap) / (minColWidth + gap)));
    cardWidth = (containerWidth - (cols - 1) * gap) / cols;
  }
  if (cardWidth > 0) {
    const scale = cardWidth / 3840;
    gridViewEl.style.setProperty('--grid-scale', scale);
  }
}

// Listen to window resize for both editor and grid view
window.addEventListener('resize', () => {
  scaleEditorCanvas();
  updateGridScale();
});

if (typeof ResizeObserver !== 'undefined' && gridViewEl) {
  const gridResizeObserver = new ResizeObserver(() => {
    updateGridScale();
  });
  gridResizeObserver.observe(gridViewEl);
}

// 12. Switch Views
function switchView(view) {
  currentView = view;
  if (view === 'grid') {
    toggleGridEl.classList.add('active');
    toggleEditorEl.classList.remove('active');
    gridViewEl.style.display = 'grid';
    editorViewEl.style.display = 'none';
    if (gridExportBar) {
      gridExportBar.style.display = slidesData.length > 0 ? 'flex' : 'none';
    }
    renderSlideDeck(); // refresh grid to show active status
    requestAnimationFrame(updateGridScale);
  } else {
    toggleGridEl.classList.remove('active');
    toggleEditorEl.classList.add('active');
    gridViewEl.style.display = 'none';
    editorViewEl.style.display = 'flex';
    if (gridExportBar) {
      gridExportBar.style.display = 'none';
    }
    scaleEditorCanvas();
    renderActiveSlide();
  }
}

toggleGridEl.addEventListener('click', () => switchView('grid'));
toggleEditorEl.addEventListener('click', () => switchView('editor'));

// 13. Inline Editing Handlers
// Active slide textarea editor input
activeSlideTextarea.addEventListener('input', (e) => {
  const slide = slidesData[activeSlideIndex];
  const newVal = e.target.value;
  
  // Convert newlines to HTML line breaks
  const htmlWithLineBreaks = newVal.replace(/\n/g, '<br>');
  const normalizedHtml = normalizeLineBreaks(htmlWithLineBreaks);
  
  // Apply orphan prevention in memory
  slide.text = preventOrphans(normalizedHtml);
  
  // Update UI preview (innerHTML is required for &nbsp; / \u00a0 to render correctly)
  if (slide.type === 'scripture') {
    editorBodyEl.innerHTML = slide.text;
  } else if (slide.type === 'quote') {
    editorQuoteTextEl.innerHTML = slide.text;
  } else {
    editorTitleEl.innerHTML = slide.text;
  }
  
  // Re-verify line limits
  const maxLines = getMaxLines();
  const isPoetry = slide.format === 'poetry' || (slide.type === 'scripture' && isPoeticBook(slide.bookId, slide.bookName));
  const lines = measureLines(slide.text, isPoetry);
  activeSlideLinesEl.textContent = `${lines} / ${maxLines}`;
  if (lines > maxLines) {
    activeSlideLinesEl.className = 'badge danger';
    activeSlideOverflowWarning.textContent = `⚠️ Warning: Text exceeds ${maxLines} lines! It will be cut off or scaled improperly. Reduce the text or split the slide.`;
    activeSlideOverflowWarning.style.display = 'block';
  } else {
    activeSlideLinesEl.className = 'badge success';
    activeSlideOverflowWarning.style.display = 'none';
  }
  if (slide.type === 'scripture') {
    updateContextButtonStates(slide);
  }
  updateActiveSlideNotesPreview();
});

// Inline contenteditable changes in editor canvas
slideCanvasPreview.addEventListener('input', (e) => {
  const target = e.target;
  const slide = slidesData[activeSlideIndex];
  const maxLines = getMaxLines();
  const isPoetry = slide.format === 'poetry' || (slide.type === 'scripture' && isPoeticBook(slide.bookId, slide.bookName));
  
  if (target.classList.contains('slide-ref-book')) {
    slide.refBook = target.textContent.toUpperCase();
  } else if (target.classList.contains('slide-ref-verse')) {
    slide.refVerse = target.textContent;
  } else if (target.classList.contains('slide-text-body')) {
    const normalizedHtml = normalizeLineBreaks(target.innerHTML);
    // Run preventOrphans on innerHTML to clean up orphans dynamically in memory
    const cleanedHtml = preventOrphans(normalizedHtml);
    slide.text = cleanedHtml;
    // Show raw text with newlines in editor text area
    activeSlideTextarea.value = cleanedHtml.replace(/<br\s*\/?>/gi, '\n').replace(/&nbsp;|\u00a0/g, ' ');
    const lines = measureLines(cleanedHtml, isPoetry);
    activeSlideLinesEl.textContent = `${lines} / ${maxLines}`;
    if (lines > maxLines) {
      activeSlideLinesEl.className = 'badge danger';
      activeSlideOverflowWarning.textContent = `⚠️ Warning: Text exceeds ${maxLines} lines! It will be cut off or scaled improperly. Reduce the text or split the slide.`;
      activeSlideOverflowWarning.style.display = 'block';
    } else {
      activeSlideLinesEl.className = 'badge success';
      activeSlideOverflowWarning.style.display = 'none';
    }
    updateContextButtonStates(slide);
  } else if (target.classList.contains('slide-center-title')) {
    const normalizedHtml = normalizeLineBreaks(target.innerHTML);
    // Run preventOrphans on innerHTML to support manual line breaks (<br>)
    const cleanedHtml = preventOrphans(normalizedHtml);
    slide.text = cleanedHtml;
    // Show raw text with newlines in editor text area
    activeSlideTextarea.value = cleanedHtml.replace(/<br\s*\/?>/gi, '\n').replace(/&nbsp;|\u00a0/g, ' ');
    const lines = measureLines(cleanedHtml, false);
    activeSlideLinesEl.textContent = `${lines} / ${maxLines}`;
    if (lines > maxLines) {
      activeSlideLinesEl.className = 'badge danger';
      activeSlideOverflowWarning.textContent = `⚠️ Warning: Text exceeds ${maxLines} lines! It will be cut off or scaled improperly. Reduce the text or split the slide.`;
      activeSlideOverflowWarning.style.display = 'block';
    } else {
      activeSlideLinesEl.className = 'badge success';
      activeSlideOverflowWarning.style.display = 'none';
    }
  } else if (target.classList.contains('slide-quote-text')) {
    const rawText = stripOuterQuotes(target.innerHTML);
    const normalizedHtml = normalizeLineBreaks(rawText);
    const cleanedHtml = preventOrphans(normalizedHtml);
    slide.text = cleanedHtml;
    activeSlideTextarea.value = cleanedHtml.replace(/<br\s*\/?>/gi, '\n').replace(/&nbsp;|\u00a0/g, ' ');
    const lines = measureLines(cleanedHtml, false);
    activeSlideLinesEl.textContent = `${lines} / ${maxLines}`;
    if (lines > maxLines) {
      activeSlideLinesEl.className = 'badge danger';
      activeSlideOverflowWarning.textContent = `⚠️ Warning: Text exceeds ${maxLines} lines! It will be cut off or scaled improperly. Reduce the text or split the slide.`;
      activeSlideOverflowWarning.style.display = 'block';
    } else {
      activeSlideLinesEl.className = 'badge success';
      activeSlideOverflowWarning.style.display = 'none';
    }
  } else if (target.classList.contains('slide-quote-author')) {
    slide.author = target.textContent.toUpperCase();
  }
  updateActiveSlideNotesPreview();
});

activeSlideTypeSelect.addEventListener('change', (e) => {
  const slide = slidesData[activeSlideIndex];
  if (!slide) return;
  
  const newType = e.target.value;
  slide.type = newType;
  
  // Set default properties if switching to a type that needs them
  if (newType === 'scripture') {
    if (!slide.refBook) slide.refBook = 'BOOK';
    if (!slide.refVerse) slide.refVerse = '1:1';
    if (!slide.translation) slide.translation = translationEl.value;
  } else if (newType === 'quote') {
    if (!slide.author) slide.author = 'AUTHOR';
  }
  
  // Re-render the active slide view to apply layout updates
  renderActiveSlide();
});

activeSlideTranslationEl.addEventListener('change', async (e) => {
  const slide = slidesData[activeSlideIndex];
  if (!slide || slide.type !== 'scripture') return;
  
  const newTranslation = e.target.value;
  slide.translation = newTranslation;
  
  // Re-fetch and re-compile the slide text!
  const progressModal = document.getElementById('progress-modal');
  const progressStatus = document.getElementById('progress-status');
  progressModal.style.display = 'flex';
  progressStatus.textContent = `Fetching verse in ${newTranslation}...`;
  
  try {
    const chapterData = await fetchChapter(slide.bookId, slide.chapter, newTranslation);
    if (chapterData) {
      const maxLines = getMaxLines();
      const isPoetry = slide.format === 'poetry' || (slide.type === 'scripture' && isPoeticBook(slide.bookId, slide.bookName));
      const requestedContext = parseInt(contextWindowEl.value) || 0;
      const best = findBestBlockForVerse(
        chapterData,
        slide.targetVerse,
        requestedContext,
        maxLines,
        isPoetry,
        false,
        false
      );

      if (best) {
        slide.text = preventOrphans(best.html);
      } else {
        // Fallback to target verse only
        const targetObj = chapterData.find(v => v.verse === slide.targetVerse);
        const singleText = targetObj ? (isPoetry ? formatPoeticVerse(targetObj.text.trim()) : targetObj.text.trim()) : '';
        const fallbackHtml = `<span class="highlight"><sup>${slide.targetVerse}</sup>${singleText}</span>`;
        slide.text = preventOrphans(fallbackHtml);
      }
      
      // Update UI
      editorBodyEl.innerHTML = slide.text;
      activeSlideTextarea.value = slide.text.replace(/<br\s*\/?>/gi, '\n').replace(/&nbsp;|\u00a0/g, ' ');
      
      // Re-verify line limits
      const lines = measureLines(slide.text, isPoetry);
      activeSlideLinesEl.textContent = `${lines} / ${maxLines}`;
      if (lines > maxLines) {
        activeSlideLinesEl.className = 'badge danger';
        activeSlideOverflowWarning.textContent = `⚠️ Warning: Text exceeds ${maxLines} lines! It will be cut off or scaled improperly. Reduce the text or split the slide.`;
        activeSlideOverflowWarning.style.display = 'block';
      } else {
        activeSlideLinesEl.className = 'badge success';
        activeSlideOverflowWarning.style.display = 'none';
      }
    }
  } catch (error) {
    console.error("Failed to update translation:", error);
    alert("Failed to load selected translation from API.");
  } finally {
    progressModal.style.display = 'none';
  }
});

if (activeSlideFormatEl) {
  activeSlideFormatEl.addEventListener('change', (e) => {
    const slide = slidesData[activeSlideIndex];
    if (!slide || slide.type !== 'scripture') return;
    
    const newFormat = e.target.value;
    slide.format = newFormat;
    
    if (newFormat === 'poetry') {
      editorBodyEl.classList.add('format-poetry');
      // If the text does not contain any <br>, auto-format it with couplet breaks
      if (!slide.text.includes('<br')) {
        slide.text = formatPoeticVerse(slide.text);
        editorBodyEl.innerHTML = slide.text;
        activeSlideTextarea.value = slide.text.replace(/<br\s*\/?>/gi, '\n').replace(/&nbsp;|\u00a0/g, ' ');
      }
    } else {
      editorBodyEl.classList.remove('format-poetry');
    }
    
    const isPoetry = slide.format === 'poetry';
    const lines = measureLines(slide.text, isPoetry);
    const maxLines = getMaxLines();
    activeSlideLinesEl.textContent = `${lines} / ${maxLines}`;
    if (lines > maxLines) {
      activeSlideLinesEl.className = 'badge danger';
      activeSlideOverflowWarning.textContent = `⚠️ Warning: Text exceeds ${maxLines} lines! It will be cut off or scaled improperly. Reduce the text or split the slide.`;
      activeSlideOverflowWarning.style.display = 'block';
    } else {
      activeSlideLinesEl.className = 'badge success';
      activeSlideOverflowWarning.style.display = 'none';
    }
  });
}

// 14. Editor Navigation
btnPrevSlide.addEventListener('click', () => {
  if (activeSlideIndex > 0) {
    activeSlideIndex--;
    renderActiveSlide();
  }
});

btnNextSlide.addEventListener('click', () => {
  if (activeSlideIndex < slidesData.length - 1) {
    activeSlideIndex++;
    renderActiveSlide();
  }
});

// Helper to format consistent filenames for both single slide download and bulk zip
function getSlideFilename(slide, index) {
  let filename = String(index + 1).padStart(3, '0') + '_';
  if (slide.type === 'scripture') {
    const bookClean = (slide.refBook || 'scripture').toLowerCase().replace(/\s+/g, '_');
    const verseClean = (slide.refVerse || '').replace(/:/g, '_');
    filename += `${bookClean}_${verseClean}.png`;
  } else {
    // Truncate title for filename
    const raw = slide.rawText || slide.text || 'point';
    const titleClean = raw.toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .substring(0, 20)
      .replace(/^_+|_+$/g, '');
    filename += `point_${titleClean || 'slide'}.png`;
  }
  return filename;
}

// Helper to cleanup and merge adjacent highlight spans
function cleanHighlightSpans(container) {
  if (!container) return;
  const highlights = container.querySelectorAll('.highlight');
  highlights.forEach(h => {
    // Remove if empty
    if (!h.textContent.trim() && !h.children.length) {
      if (h.parentNode) h.parentNode.removeChild(h);
      return;
    }
    // Merge if next sibling is also a highlight
    let next = h.nextSibling;
    while (next && next.nodeType === Node.ELEMENT_NODE && next.classList.contains('highlight')) {
      while (next.firstChild) {
        h.appendChild(next.firstChild);
      }
      const toRemove = next;
      next = next.nextSibling;
      if (toRemove.parentNode) toRemove.parentNode.removeChild(toRemove);
    }
  });
}

// Toggle text selection emphasis between 100% opacity and 25% opacity
function toggleSelectionEmphasis() {
  const slide = slidesData[activeSlideIndex];
  if (!slide) return;

  let visualContainer = null;
  if (slide.type === 'scripture') {
    visualContainer = editorBodyEl;
  } else if (slide.type === 'quote') {
    visualContainer = editorQuoteTextEl;
  } else {
    visualContainer = editorTitleEl;
  }

  // Option 1: Selection inside the textarea
  if (document.activeElement === activeSlideTextarea && activeSlideTextarea.selectionStart !== activeSlideTextarea.selectionEnd) {
    const val = activeSlideTextarea.value;
    const sStart = activeSlideTextarea.selectionStart;
    const sEnd = activeSlideTextarea.selectionEnd;
    const selText = val.substring(sStart, sEnd);

    let newSelText = '';
    if (selText.includes('class="highlight"') || (selText.startsWith('<span class="highlight">') && selText.endsWith('</span>'))) {
      newSelText = selText.replace(/<span class="highlight">/g, '').replace(/<\/span>/g, '');
    } else {
      newSelText = `<span class="highlight">${selText}</span>`;
    }

    activeSlideTextarea.value = val.substring(0, sStart) + newSelText + val.substring(sEnd);
    activeSlideTextarea.selectionStart = sStart;
    activeSlideTextarea.selectionEnd = sStart + newSelText.length;
    activeSlideTextarea.dispatchEvent(new Event('input'));
    return;
  }

  // Option 2: Visual selection in canvas preview
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && !sel.isCollapsed && visualContainer) {
    const range = sel.getRangeAt(0);

    if (visualContainer.contains(range.commonAncestorContainer) || 
        (range.commonAncestorContainer === visualContainer) ||
        (visualContainer.contains(range.startContainer) && visualContainer.contains(range.endContainer))) {
      
      let node = range.commonAncestorContainer;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
      const highlightEl = node.closest ? node.closest('.highlight') : null;
      const insideHighlight = highlightEl && visualContainer.contains(highlightEl);

      if (insideHighlight) {
        // De-emphasize selected text
        if (range.toString().trim() === highlightEl.textContent.trim()) {
          const parent = highlightEl.parentNode;
          while (highlightEl.firstChild) {
            parent.insertBefore(highlightEl.firstChild, highlightEl);
          }
          parent.removeChild(highlightEl);
        } else {
          const textBefore = document.createRange();
          textBefore.setStartBefore(highlightEl);
          textBefore.setEnd(range.startContainer, range.startOffset);

          const textAfter = document.createRange();
          textAfter.setStart(range.endContainer, range.endOffset);
          textAfter.setEndAfter(highlightEl);

          const beforeFrag = textBefore.cloneContents();
          const afterFrag = textAfter.cloneContents();
          const selectedFrag = range.extractContents();

          const fragment = document.createDocumentFragment();
          if (beforeFrag.textContent.length > 0) {
            const spanBefore = document.createElement('span');
            spanBefore.className = 'highlight';
            spanBefore.appendChild(beforeFrag);
            fragment.appendChild(spanBefore);
          }
          fragment.appendChild(selectedFrag);
          if (afterFrag.textContent.length > 0) {
            const spanAfter = document.createElement('span');
            spanAfter.className = 'highlight';
            spanAfter.appendChild(afterFrag);
            fragment.appendChild(spanAfter);
          }
          highlightEl.parentNode.replaceChild(fragment, highlightEl);
        }
      } else {
        // Emphasize selected text
        const extracted = range.extractContents();
        const innerHighlights = extracted.querySelectorAll ? extracted.querySelectorAll('.highlight') : [];
        innerHighlights.forEach(h => {
          const p = h.parentNode;
          while (h.firstChild) p.insertBefore(h.firstChild, h);
          p.removeChild(h);
        });

        const span = document.createElement('span');
        span.className = 'highlight';
        span.appendChild(extracted);
        range.insertNode(span);
      }

      cleanHighlightSpans(visualContainer);

      let updatedHtml = '';
      if (slide.type === 'quote') {
        updatedHtml = stripOuterQuotes(visualContainer.innerHTML);
      } else {
        updatedHtml = visualContainer.innerHTML;
      }
      const normalizedHtml = normalizeLineBreaks(updatedHtml);
      slide.text = preventOrphans(normalizedHtml);

      activeSlideTextarea.value = slide.text.replace(/<br\s*\/?>/gi, '\n').replace(/&nbsp;|\u00a0/g, ' ');
      const maxLines = getMaxLines();
      const isPoetry = slide.format === 'poetry' || (slide.type === 'scripture' && isPoeticBook(slide.bookId, slide.bookName));
      const lines = measureLines(slide.text, isPoetry);
      activeSlideLinesEl.textContent = `${lines} / ${maxLines}`;
      if (lines > maxLines) {
        activeSlideLinesEl.className = 'badge danger';
        activeSlideOverflowWarning.textContent = `⚠️ Warning: Text exceeds ${maxLines} lines! It will be cut off or scaled improperly. Reduce the text or split the slide.`;
        activeSlideOverflowWarning.style.display = 'block';
      } else {
        activeSlideLinesEl.className = 'badge success';
        activeSlideOverflowWarning.style.display = 'none';
      }

      // Re-render thumbnail in grid to keep it in sync
      renderSlideDeck();
      updateActiveSlideNotesPreview();
      return;
    }
  }

  alert("Please select the text in the slide preview or text box that you want to emphasize or de-emphasize.");
}

// Single Slide Direct 4K Download matching bulk export filename
async function downloadActiveSlide() {
  const slide = slidesData[activeSlideIndex];
  if (!slide) return;

  const progressModal = document.getElementById('progress-modal');
  const progressStatus = document.getElementById('progress-status');
  const progressBarFill = document.querySelector('.progress-bar-fill');
  const progressPercentage = document.getElementById('progress-percentage');
  const exportCanvas = document.getElementById('export-canvas');

  if (btnDownloadActiveSlide) {
    btnDownloadActiveSlide.disabled = true;
    btnDownloadActiveSlide.innerHTML = `${SPINNER_ICON_SVG}<span>Rendering PNG...</span>`;
  }

  progressModal.style.display = 'flex';
  progressStatus.textContent = `Rendering slide ${activeSlideIndex + 1}...`;
  progressBarFill.style.width = '50%';
  progressPercentage.textContent = '50%';

  try {
    const blob = await renderSlideToCanvas(slide, exportCanvas);

    progressBarFill.style.width = '100%';
    progressPercentage.textContent = '100%';
    progressStatus.textContent = 'Downloading 4K transparent PNG...';

    const filename = getSlideFilename(slide, activeSlideIndex);
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("Single Slide Export Failed:", error);
    alert(`Failed to export slide: ${error.message || error}`);
  } finally {
    progressModal.style.display = 'none';
    if (btnDownloadActiveSlide) {
      btnDownloadActiveSlide.disabled = false;
      btnDownloadActiveSlide.innerHTML = `${DOWNLOAD_ICON_SVG}<span>Single Slide (png)</span>`;
    }
  }
}

// Event listeners for emphasis toggle and single slide download
if (btnToggleEmphasis) {
  btnToggleEmphasis.addEventListener('mousedown', (e) => {
    e.preventDefault(); // Prevent clearing selection on click
  });
  btnToggleEmphasis.addEventListener('click', () => {
    toggleSelectionEmphasis();
  });
}

if (btnDownloadActiveSlide) {
  btnDownloadActiveSlide.addEventListener('click', () => {
    downloadActiveSlide();
  });
}

// Grid View direct triggers to keep export functionality aligned
if (btnGridExport) {
  btnGridExport.addEventListener('click', () => {
    btnExport.click();
  });
}

if (btnGridExportProPresenter) {
  btnGridExportProPresenter.addEventListener('click', () => {
    btnExportProPresenter.click();
  });
}

const btnAddUpperContext = document.getElementById('btn-add-upper-context');
const btnAddLowerContext = document.getElementById('btn-add-lower-context');
const btnRemoveUpperContext = document.getElementById('btn-remove-upper-context');
const btnRemoveLowerContext = document.getElementById('btn-remove-lower-context');

if (btnAddUpperContext) {
  btnAddUpperContext.addEventListener('click', () => {
    addUpperContext();
  });
}

if (btnAddLowerContext) {
  btnAddLowerContext.addEventListener('click', () => {
    addLowerContext();
  });
}

if (btnRemoveUpperContext) {
  btnRemoveUpperContext.addEventListener('click', () => {
    removeUpperContext();
  });
}

if (btnRemoveLowerContext) {
  btnRemoveLowerContext.addEventListener('click', () => {
    removeLowerContext();
  });
}

// Keyboard shortcuts for emphasis toggle: Cmd+E / Ctrl+E and Cmd+H / Ctrl+H
window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'e' || e.key.toLowerCase() === 'h')) {
    if (currentView === 'editor') {
      e.preventDefault();
      toggleSelectionEmphasis();
    }
  }
});

// 15. Generate Action
btnGenerate.addEventListener('click', async () => {
  const rawText = rawInputEl.value.trim();
  if (!rawText) return;
  
  btnGenerate.disabled = true;
  btnGenerate.innerHTML = `${SPINNER_ICON_SVG}<span>Fetching Scripture...</span>`;
  
  try {
    const parsed = parseRawInput(rawText);
    slidesData = await buildSlides(parsed);
    activeSlideIndex = 0;
    
    // Switch to grid view by default
    switchView('grid');
    renderSlideDeck();
  } catch (error) {
    console.error("Slide Generation Failed:", error);
    alert("Error occurred while generating slides. See developer console.");
  } finally {
    btnGenerate.disabled = false;
    btnGenerate.innerHTML = `${LIGHTNING_ICON_SVG}<span>Generate Slides</span>`;
  }
});

// 16. Demo Outline Loader
btnDemo.addEventListener('click', () => {
  if (slideThemeEl) {
    slideThemeEl.value = 'porch-generic';
    updateCalibrationForTheme();
  }
  rawInputEl.value = `Slide 1: Jett Picture May 2026 (attached) 
Slide 2: Jett Ultrasound Picture (attached) 
Slide 3: Mark 9:9-13 (ESV) 
Slide 4: Theology of Suffering 
Slide 5: Romans 8:18 (ESV) 
Slide 6: 2 Corinthians 4:16-17 (ESV) 
Slide 7: Charles Spurgeon – "I have learned to kiss the waves that throw me up against the Rock of Ages."
Slide 8: Mark 9:14-29 (ESV) 
Slide 9: Theology of Belief 
Slide 10: Mark 9:19 (ESV) 
Slide 11: Mark 9:23 (ESV) 
Slide 12: Mark 9:24 (ESV) 
Slide 13: Mark 9:29 (ESV) 
Slide 14: Isaiah 53:4-5 (ESV) 
Slide 15: Luke 18:1 (ESV) 
Slide 16: Mark 9:28-29 (ESV) 
Slide 17: James 5:13-16 (ESV)
Slide 18: Judges 6:1-6 NLT`;
});

if (btnDemoLovers) {
  btnDemoLovers.addEventListener('click', () => {
    if (slideThemeEl) {
      slideThemeEl.value = 'lovers-series';
      updateCalibrationForTheme();
    }
    rawInputEl.value = `2 Tim 3:1-5
Ex. 32:1-4
Idolatry Begins with Getting Used to God
Idolatry Grows When We’re Discontent with God
Tim Keller – “When anything in life is an absolute requirement for your happiness and self-worth, it is essentially an ‘idol,’ something you are worshiping.” 
Ex 32:5-6
Idolatry Redefines the Worship of God
Ex 32:7-10
Ex 19:4-6
God’s Wrath is Terribly Appropriate for Idolatry
Ps 96:4
Ps 145:3
Isa 42:8
Ps 115:4-8
Ex 32:30-34
God’s Grace is Wonderfully Inappropriate for Idolaters.`;
  });
}

// 17. 4K SVG-to-Canvas Exporter & ZIP Bundler
function sanitizeHtmlForXml(html) {
  if (!html) return '';
  const htmlEntityMap = {
    '&nbsp;': '&#160;',
    '&ldquo;': '&#8220;',
    '&rdquo;': '&#8221;',
    '&lsquo;': '&#8216;',
    '&rsquo;': '&#8217;',
    '&mdash;': '&#8212;',
    '&ndash;': '&#8211;',
    '&hellip;': '&#8230;',
    '&middot;': '&#183;'
  };
  let cleaned = html;
  for (const [entity, replacement] of Object.entries(htmlEntityMap)) {
    cleaned = cleaned.replaceAll(entity, replacement);
  }
  // Normalize HTML <br> tags to XML-compliant self-closing <br />
  cleaned = cleaned.replace(/<br\s*\/?>/gi, '<br />');
  
  return cleaned.replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');
}

async function renderSlideToCanvas(slide, canvas) {
  // Create an offscreen container
  const offscreenContainer = document.createElement('div');
  offscreenContainer.style.position = 'absolute';
  offscreenContainer.style.left = '-9999px';
  offscreenContainer.style.top = '-9999px';
  offscreenContainer.style.width = '3840px';
  offscreenContainer.style.height = '2160px';
  offscreenContainer.style.backgroundColor = 'transparent';
  offscreenContainer.style.overflow = 'hidden';
  
  // Create slide element styled exactly like the 4K slides
  const slideDiv = document.createElement('div');
  slideDiv.style.width = '3840px';
  slideDiv.style.height = '2160px';
  slideDiv.style.backgroundColor = 'transparent'; // Transparent PNG output
  slideDiv.style.position = 'relative';
  
  // Normalize layout text line-breaks for HTML2Canvas compatibility
  const cleanText = normalizeLineBreaks(slide.text);

  const isLovers = slideThemeEl && slideThemeEl.value === 'lovers-series';
  const textColor = isLovers ? '#000000' : '#ffffff';
  const contextColor = isLovers ? `rgba(0, 0, 0, ${contextOpacityEl.value})` : `rgba(255, 255, 255, ${contextOpacityEl.value})`;
  const hasHighlight = cleanText.includes('class="highlight"');

  // Set innerHTML based on slide type and active theme
  if (slide.type === 'scripture') {
    const isPoetry = slide.format === 'poetry' || (slide.type === 'scripture' && isPoeticBook(slide.bookId, slide.bookName));
    const textAlign = isPoetry ? 'left' : 'justify';
    const fontSize = getScriptureFontSize();
    if (isLovers) {
      slideDiv.innerHTML = `
        <div class="slide-left-column" style="position: absolute; left: 122.5px; top: 815.2px; width: 1279.5px; height: 368.6px; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 0; box-sizing: border-box;">
          <div class="slide-ref-book" style="font-family: 'IBM Plex Mono', monospace; font-weight: 500; font-size: 96px; color: #000000; text-transform: uppercase; text-align: center; line-height: 1.2; margin-bottom: 0; font-variant-numeric: slashed-zero; font-feature-settings: 'zero' 1, 'ss03' 1;">${slide.refBook}</div>
          <div class="slide-ref-verse" style="font-family: 'IBM Plex Mono', monospace; font-weight: 500; font-size: 96px; color: #000000; text-align: center; line-height: 1.2; font-variant-numeric: slashed-zero; font-feature-settings: 'zero' 1, 'ss03' 1;">${slide.refVerse}</div>
        </div>
        <div class="slide-divider" style="position: absolute; left: 1504px; top: 592.4px; width: 7.8px; height: 814.3px; background-color: #000000;"></div>
        <div class="slide-right-column" style="position: absolute; left: 1613.8px; top: 546.4px; width: 2101.5px; height: 906.3px; display: flex; flex-direction: column; justify-content: center; padding-right: 0; box-sizing: border-box;">
          <div class="slide-text-body" style="font-family: 'Neue Haas Grotesk Display Pro', 'Neue Haas Grotesk Display Pro 55 Roman', 'NeueHaasGroteskDisplayPro-55Roman', 'Neue Haas Grotesk', sans-serif; font-weight: normal; font-size: ${fontSize}px; line-height: 1.22; text-align: ${textAlign}; color: ${contextColor}; -webkit-font-smoothing: subpixel-antialiased;">${cleanText}</div>
        </div>
      `;
    } else {
      slideDiv.innerHTML = `
        <div class="slide-left-column" style="position: absolute; left: 0; top: 480px; width: 1363px; height: 1200px; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 0 50px; box-sizing: border-box;">
          <div class="slide-ref-book" style="font-family: 'IBM Plex Mono', monospace; font-weight: 500; font-size: 100px; color: #ffffff; text-transform: uppercase; text-align: center; line-height: 1.2; margin-bottom: 20px; font-variant-numeric: slashed-zero; font-feature-settings: 'zero' 1, 'ss03' 1;">${slide.refBook}</div>
          <div class="slide-ref-verse" style="font-family: 'IBM Plex Mono', monospace; font-weight: 500; font-size: 100px; color: #ffffff; text-align: center; line-height: 1.2; font-variant-numeric: slashed-zero; font-feature-settings: 'zero' 1, 'ss03' 1;">${slide.refVerse}</div>
        </div>
        <div class="slide-divider" style="position: absolute; left: 1363px; top: 680px; width: 3px; height: 800px; background-color: #ffffff;"></div>
        <div class="slide-right-column" style="position: absolute; left: 1463px; top: 480px; width: 2177px; height: 1200px; display: flex; flex-direction: column; justify-content: center; padding-right: 200px; box-sizing: border-box;">
          <div class="slide-text-body" style="font-family: 'Neue Haas Grotesk Display Pro', 'Neue Haas Grotesk', 'Inter', sans-serif; font-weight: normal; font-size: ${fontSize}px; line-height: 1.35; text-align: ${textAlign}; color: ${contextColor};">${cleanText}</div>
        </div>
      `;
    }
  } else if (slide.type === 'quote') {
    const quoteFontSize = isLovers ? '82px' : '85px';
    const authorTracking = isLovers ? '0.15em' : '2px';
    const quoteTextColor = hasHighlight ? contextColor : textColor;
    const quoteTop = isLovers ? '546.4px' : '480px';
    const quoteHeight = isLovers ? '906.3px' : '1200px';
    slideDiv.innerHTML = `
      <div class="slide-quote-container" style="position: absolute; left: 200px; top: ${quoteTop}; width: 3440px; height: ${quoteHeight}; display: flex; flex-direction: column; justify-content: center; align-items: center; box-sizing: border-box;">
        <div class="slide-quote-text" style="font-family: 'Neue Haas Grotesk Display Pro', 'Neue Haas Grotesk', 'Inter', sans-serif; font-size: ${quoteFontSize}; line-height: 1.45; color: ${quoteTextColor}; text-align: center; margin-bottom: 80px; width: 100%;">“${cleanText}”</div>
        <div class="slide-quote-author" style="font-family: 'IBM Plex Mono', monospace; font-weight: 500; font-size: 70px; color: ${textColor}; text-align: center; text-transform: uppercase; letter-spacing: ${authorTracking}; font-variant-numeric: slashed-zero; font-feature-settings: 'zero' 1, 'ss03' 1;">${slide.author}</div>
      </div>
    `;
  } else {
    const titleWeight = isLovers ? '500' : '300';
    const titleTextColor = hasHighlight ? contextColor : textColor;
    const titleTop = isLovers ? '546.4px' : '480px';
    const titleHeight = isLovers ? '906.3px' : '1200px';
    slideDiv.innerHTML = `
      <div class="slide-center-title" style="position: absolute; left: 200px; top: ${titleTop}; width: 3440px; height: ${titleHeight}; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: 'IBM Plex Mono', monospace; font-weight: ${titleWeight}; font-size: 90px; line-height: 1.6; color: ${titleTextColor}; text-align: center; text-transform: uppercase; letter-spacing: 2px; box-sizing: border-box; font-variant-numeric: slashed-zero; font-feature-settings: 'zero' 1, 'ss03' 1;">
        <div style="width: 100%;">${cleanText}</div>
      </div>
    `;
  }
  
  // Inject inline styles so highlight class and slashed zero render correctly in html2canvas
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    * {
      font-variant-numeric: slashed-zero !important;
      font-feature-settings: "zero" 1, "ss03" 1 !important;
    }
    .slide-text-body span.highlight {
      color: ${textColor} !important;
      opacity: 1.0 !important;
      font-weight: normal !important;
    }
    .slide-center-title span.highlight,
    .slide-quote-text span.highlight {
      color: ${textColor} !important;
      opacity: 1.0 !important;
      font-weight: 500 !important;
    }
    .slide-text-body sup {
      font-size: 0.55em;
      line-height: 0;
      vertical-align: baseline;
      position: relative;
      top: -0.4em;
      margin-right: 0;
      opacity: inherit;
    }
  `;
  
  offscreenContainer.appendChild(styleEl);
  offscreenContainer.appendChild(slideDiv);
  document.body.appendChild(offscreenContainer);
  
  try {
    // Wait for two frames to ensure full render
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    
    const renderedCanvas = await html2canvas(slideDiv, {
      width: 3840,
      height: 2160,
      scale: 1,
      backgroundColor: null, // Transparent background!
      logging: false,
      useCORS: true
    });
    
    // Clean up
    document.body.removeChild(offscreenContainer);
    
    // Convert canvas to blob and return it
    return new Promise((resolve, reject) => {
      renderedCanvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("html2canvas returned null blob"));
        }
      }, 'image/png');
    });
  } catch (err) {
    if (offscreenContainer.parentNode) {
      document.body.removeChild(offscreenContainer);
    }
    throw err;
  }
}

btnExport.addEventListener('click', async () => {
  if (slidesData.length === 0) return;
  
  const progressModal = document.getElementById('progress-modal');
  const progressStatus = document.getElementById('progress-status');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressPercentage = document.getElementById('progress-percentage');
  
  btnExport.disabled = true;
  btnExport.innerHTML = `${SPINNER_ICON_SVG}<span>Rendering ZIP...</span>`;
  if (btnGridExport) {
    btnGridExport.disabled = true;
    btnGridExport.innerHTML = `${SPINNER_ICON_SVG}<span>Rendering ZIP...</span>`;
  }
  
  // Open progress modal
  progressModal.style.display = 'flex';
  progressStatus.textContent = 'Initializing slide renderer...';
  progressBarFill.style.width = '0%';
  progressPercentage.textContent = '0%';
  
  const canvas = document.getElementById('export-canvas');
  
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    const isLovers = slideThemeEl && slideThemeEl.value === 'lovers-series';
    const themeTitle = isLovers ? 'Lovers' : 'Porch';

    if (slidesData.length === 1) {
      const slide = slidesData[0];
      const blob = await renderSlideToCanvas(slide, canvas);
      
      // Update progress bar
      progressStatus.textContent = 'Downloading PNG...';
      progressBarFill.style.width = '100%';
      progressPercentage.textContent = '100%';
      
      let filenameSuffix = '';
      if (slide.type === 'scripture') {
        const bookClean = slide.refBook.toLowerCase().replace(/\s+/g, '_');
        const verseClean = slide.refVerse.replace(/:/g, '_');
        filenameSuffix = `${bookClean}_${verseClean}`;
      } else {
        const titleClean = slide.rawText.toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .substring(0, 20)
          .replace(/^_+|_+$/g, '');
        filenameSuffix = `point_${titleClean}`;
      }
      
      const filename = `${dateStr} - ${themeTitle} - ${filenameSuffix}.png`;
      const downloadUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } else {
      const zip = new JSZip();
      for (let i = 0; i < slidesData.length; i++) {
        const slide = slidesData[i];
        const blob = await renderSlideToCanvas(slide, canvas);
        
        // Update progress bar
        const pct = Math.round(((i + 1) / slidesData.length) * 100);
        progressStatus.textContent = `Rendering slide ${i + 1} of ${slidesData.length}...`;
        progressBarFill.style.width = `${pct}%`;
        progressPercentage.textContent = `${pct}%`;
        
        // Consistent filename matching single slide download
        const filename = getSlideFilename(slide, i);
        zip.file(filename, blob);
      }
      
      // Bundle zip file
      progressStatus.textContent = 'Bundling 4K transparent slides into ZIP...';
      progressBarFill.style.width = '100%';
      progressPercentage.textContent = '100%';
      
      // Generate and download zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${dateStr} - ${themeTitle}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    }
  } catch (error) {
    console.error("Export Failed:", error);
    alert(`Slide export failed: ${error.message || error}\n\nStack:\n${error.stack || ''}`);
  } finally {
    progressModal.style.display = 'none';
    btnExport.disabled = false;
    btnExport.innerHTML = `${DOWNLOAD_ICON_SVG}<span>All Slides Images (zip)</span>`;
    if (btnGridExport) {
      btnGridExport.disabled = false;
      btnGridExport.innerHTML = `${DOWNLOAD_ICON_SVG}<span>All Slides Images (zip)</span>`;
    }
  }
});

// ProPresenter .probundle Export Handler
if (btnExportProPresenter) {
  btnExportProPresenter.addEventListener('click', async () => {
    if (slidesData.length === 0) return;

    btnExportProPresenter.disabled = true;
    btnExport.disabled = true;
    btnExportProPresenter.innerHTML = `${SPINNER_ICON_SVG}<span>Exporting ProPresenter...</span>`;
    if (btnGridExportProPresenter) {
      btnGridExportProPresenter.disabled = true;
      btnGridExportProPresenter.innerHTML = `${SPINNER_ICON_SVG}<span>Exporting ProPresenter...</span>`;
    }

    const canvas = document.getElementById('export-canvas');
    const progressModal = document.getElementById('progress-modal');
    const progressStatus = document.getElementById('progress-status');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    progressModal.style.display = 'flex';

    try {
      const rawDate = document.getElementById('sermon-date').value || new Date().toISOString().split('T')[0];
      const dateStr = rawDate.replace(/-/g, '');
      const activeTheme = THEMES[selectedThemeKey];
      const themeTitle = activeTheme.title;
      const presentationName = `${dateStr} - ${themeTitle}`;

      const bundleBlob = await exportProPresenterBundle({
        slidesData,
        presentationName,
        renderSlideToCanvas,
        canvas,
        getSlideFilename,
        onProgress: (current, total, statusText, pct) => {
          progressStatus.textContent = statusText;
          progressBarFill.style.width = `${pct}%`;
          progressPercentage.textContent = `${pct}%`;
        }
      });

      const downloadUrl = URL.createObjectURL(bundleBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${presentationName}.probundle`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      showToast('📦 ProPresenter bundle exported! Double-click to import into Pro7.');
    } catch (error) {
      console.error('ProPresenter Export Failed:', error);
      alert(`ProPresenter export failed: ${error.message || error}\n\nStack:\n${error.stack || ''}`);
    } finally {
      progressModal.style.display = 'none';
      btnExportProPresenter.disabled = false;
      btnExport.disabled = false;
      btnExportProPresenter.innerHTML = `${PROPRESENTER_ICON_SVG}<span>Export for ProPresenter</span>`;
      if (btnGridExportProPresenter) {
        btnGridExportProPresenter.disabled = false;
        btnGridExportProPresenter.innerHTML = `${PROPRESENTER_ICON_SVG}<span>Export for ProPresenter</span>`;
      }
    }
  });
}

// ==========================================================================
// 15. Collaborative Review Links & Proof Sheet (Phase 1)
// ==========================================================================

// Toast Notification Helper
function showToast(message, duration = 3200) {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, duration);
}

// Safe Clipboard Copy Helper (with fallback)
async function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.warn("navigator.clipboard failed, falling back to execCommand", e);
    }
  }
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  const successful = document.execCommand('copy');
  document.body.removeChild(textArea);
  return successful;
}

// Compress deck state into a URL-safe Base64 DEFLATE string via JSZip
async function compressDeckPayload(payload) {
  const jsonStr = JSON.stringify(payload);
  const zip = new JSZip();
  zip.file('d', jsonStr);
  const b64 = await zip.generateAsync({
    type: 'base64',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Decompress URL-safe Base64 DEFLATE string back to JSON payload
async function decompressDeckPayload(hashStr) {
  let b64 = hashStr.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) {
    b64 += '=';
  }
  const zip = await JSZip.loadAsync(b64, { base64: true });
  const file = zip.file('d');
  if (!file) throw new Error('Invalid deck payload file');
  const jsonStr = await file.async('string');
  return JSON.parse(jsonStr);
}

// Generate and share review link
async function handleShareDraft() {
  if (!slidesData || slidesData.length === 0) {
    alert("Please generate slides first before sharing a draft.");
    return;
  }
  
  try {
    const payload = {
      v: 1,
      theme: slideThemeEl ? slideThemeEl.value : 'generic',
      translation: translationEl ? translationEl.value : 'esv',
      outline: rawInputEl ? rawInputEl.value : '',
      slides: slidesData
    };
    
    const hash = await compressDeckPayload(payload);
    const fullUrl = `${window.location.origin}${window.location.pathname}#review=${hash}`;
    
    history.replaceState(null, '', `#review=${hash}`);
    
    const success = await copyToClipboard(fullUrl);
    if (success) {
      showToast('🔗 Review link copied to clipboard! Anyone with this link can view and edit this deck.');
    } else {
      prompt('Copy this review link to share:', fullUrl);
    }
  } catch (err) {
    console.error('Failed to generate review link:', err);
    alert('Failed to generate review link: ' + (err.message || err));
  }
}

// Open Proof Sheet modal with formatted slide list
function openProofSheet() {
  if (!slidesData || slidesData.length === 0) {
    alert("Please generate slides first before opening the proof sheet.");
    return;
  }
  
  const themeName = slideThemeEl && slideThemeEl.options[slideThemeEl.selectedIndex]
    ? slideThemeEl.options[slideThemeEl.selectedIndex].text 
    : 'Porch Generic';
  const transName = translationEl ? translationEl.value.toUpperCase() : 'ESV';
  
  if (proofHeaderMeta) {
    proofHeaderMeta.textContent = `Theme: ${themeName} | Translation: ${transName} | ${slidesData.length} Slides`;
  }
  
  let html = '';
  slidesData.forEach((slide, idx) => {
    if (slide.type === 'scripture') {
      const poetryClass = (slide.format === 'poetry') ? 'format-poetry' : '';
      html += `
        <div class="proof-slide-item">
          <div class="proof-slide-header">
            <div class="proof-slide-header-left">
              <span class="proof-slide-num">Slide ${idx + 1}</span>
              <span class="proof-slide-badge">Scripture</span>
              <span class="proof-slide-ref">${slide.refBook} ${slide.refVerse}</span>
            </div>
            <span class="proof-slide-badge">${slide.translation || transName}</span>
          </div>
          <div class="proof-slide-text ${poetryClass}">
            ${slide.text}
          </div>
        </div>
      `;
    } else if (slide.type === 'quote') {
      html += `
        <div class="proof-slide-item">
          <div class="proof-slide-header">
            <div class="proof-slide-header-left">
              <span class="proof-slide-num">Slide ${idx + 1}</span>
              <span class="proof-slide-badge">Quote</span>
            </div>
          </div>
          <div class="proof-slide-quote-text">
            “${slide.text}”
          </div>
          <div class="proof-slide-quote-author">
            — ${slide.author}
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="proof-slide-item">
          <div class="proof-slide-header">
            <div class="proof-slide-header-left">
              <span class="proof-slide-num">Slide ${idx + 1}</span>
              <span class="proof-slide-badge">Sermon Point</span>
            </div>
          </div>
          <div class="proof-slide-point">
            ${slide.text}
          </div>
        </div>
      `;
    }
  });
  
  if (proofSheetContent) {
    proofSheetContent.innerHTML = html;
  }
  
  if (proofSheetModal) {
    proofSheetModal.style.display = 'flex';
  }
}

// Check and load review deck from URL hash (#review=... or #deck=...)
async function checkUrlHashForReview() {
  const hash = window.location.hash;
  if (!hash) return;
  
  if (hash.startsWith('#review=') || hash.startsWith('#deck=')) {
    const encoded = hash.replace(/^#(review|deck)=/, '');
    if (!encoded) return;
    
    try {
      const payload = await decompressDeckPayload(encoded);
      if (payload && payload.slides && payload.slides.length > 0) {
        if (payload.theme && slideThemeEl) {
          slideThemeEl.value = payload.theme;
          updateCalibrationForTheme();
        }
        if (payload.translation && translationEl) {
          translationEl.value = payload.translation;
        }
        if (payload.outline && rawInputEl && !rawInputEl.value) {
          rawInputEl.value = payload.outline;
        }
        slidesData = payload.slides;
        activeSlideIndex = 0;
        
        switchView('grid');
        renderSlideDeck();
        
        if (reviewBanner) {
          reviewBanner.style.display = 'flex';
        }
        showToast(`📋 Loaded shared draft: ${slidesData.length} slides ready for review`);
      }
    } catch (err) {
      console.error('Failed to parse review link hash:', err);
      showToast('⚠️ Could not load shared review link. Data may be incomplete or invalid.');
    }
  }
}

// Event Listeners for Sharing & Proofing
if (btnShareDraft) {
  btnShareDraft.addEventListener('click', handleShareDraft);
}

if (btnCopyReviewLink) {
  btnCopyReviewLink.addEventListener('click', handleShareDraft);
}

if (btnDismissReviewBanner) {
  btnDismissReviewBanner.addEventListener('click', () => {
    if (reviewBanner) reviewBanner.style.display = 'none';
  });
}

if (btnProofSheet) {
  btnProofSheet.addEventListener('click', openProofSheet);
}

if (btnCloseProof) {
  btnCloseProof.addEventListener('click', () => {
    if (proofSheetModal) proofSheetModal.style.display = 'none';
  });
}

if (proofSheetModal) {
  proofSheetModal.addEventListener('click', (e) => {
    if (e.target === proofSheetModal) {
      proofSheetModal.style.display = 'none';
    }
  });
}

if (btnPrintProof) {
  btnPrintProof.addEventListener('click', () => {
    window.print();
  });
}

// Initial check on page startup
checkUrlHashForReview();

// Listen for hashchange events
window.addEventListener('hashchange', checkUrlHashForReview);
