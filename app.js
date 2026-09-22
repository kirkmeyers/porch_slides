import JSZip from 'jszip';
import html2canvas from 'html2canvas';

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
const btnDemo = document.getElementById('btn-demo');
const btnDemoLovers = document.getElementById('btn-demo-lovers');
const slideCountEl = document.getElementById('slide-count');

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
const activeSlideTextarea = document.getElementById('active-slide-textarea');

const btnPrevSlide = document.getElementById('btn-prev-slide');
const btnNextSlide = document.getElementById('btn-next-slide');
const editorSlideIndexEl = document.getElementById('editor-slide-index');

const activeSlideTranslationEl = document.getElementById('active-slide-translation');
const activeSlideTranslationContainer = document.getElementById('active-slide-translation-container');

const activeSlideFormatEl = document.getElementById('active-slide-format');
const activeSlideFormatContainer = document.getElementById('active-slide-format-container');

const editorQuoteContainer = slideCanvasPreview.querySelector('.slide-quote-container');
const editorQuoteTextEl = slideCanvasPreview.querySelector('.slide-quote-text');
const editorQuoteAuthorEl = slideCanvasPreview.querySelector('.slide-quote-author');

const lineCounterCalibration = document.getElementById('line-counter-calibration');
const lineCounterMeasurement = document.getElementById('line-counter-measurement');

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

// Helper to get max lines limit based on active theme
function getMaxLines() {
  return (slideThemeEl && slideThemeEl.value === 'lovers-series') ? 10 : 12;
}

// 5. Initialize Font Face Loading & Line Calibration
document.fonts.ready.then(() => {
  updateCalibrationForTheme();
  checkLocalFontPresence();
});

function calibrateLineHeight() {
  const calibrationSpan = document.getElementById('calibration-single-line');
  if (calibrationSpan) {
    const rect = calibrationSpan.getBoundingClientRect();
    if (rect.height > 0) {
      singleLineHeight = rect.height;
      console.log(`Calibrated Single Line Height: ${singleLineHeight}px`);
    }
  }
}

function updateCalibrationForTheme() {
  const isLovers = slideThemeEl && slideThemeEl.value === 'lovers-series';
  const lineLimitEl = document.getElementById('line-limit');
  const lineLimitHelp = lineLimitEl ? lineLimitEl.nextElementSibling : null;
  
  if (isLovers) {
    document.body.classList.add('theme-lovers-series');
    if (lineLimitEl) lineLimitEl.value = '10';
    if (lineLimitHelp) lineLimitHelp.textContent = 'Locked at 10 lines max (Lover\'s Series)';
    if (lineCounterCalibration) {
      lineCounterCalibration.style.width = '2101.5px';
      lineCounterCalibration.style.fontSize = '82px';
      lineCounterCalibration.style.lineHeight = '1.22';
    }
    if (lineCounterMeasurement) {
      lineCounterMeasurement.style.width = '2101.5px';
      lineCounterMeasurement.style.fontSize = '82px';
      lineCounterMeasurement.style.lineHeight = '1.22';
    }
  } else {
    document.body.classList.remove('theme-lovers-series');
    if (lineLimitEl) lineLimitEl.value = '12';
    if (lineLimitHelp) lineLimitHelp.textContent = 'Locked at 12 lines max (Porch Generic)';
    if (lineCounterCalibration) {
      lineCounterCalibration.style.width = '2177px';
      lineCounterCalibration.style.fontSize = '85px';
      lineCounterCalibration.style.lineHeight = '1.45';
    }
    if (lineCounterMeasurement) {
      lineCounterMeasurement.style.width = '2177px';
      lineCounterMeasurement.style.fontSize = '85px';
      lineCounterMeasurement.style.lineHeight = '1.45';
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
  
  context.font = '72px "Neue Haas Grotesk Display Pro", "Neue Haas Grotesk", sans-serif';
  const widthHaas = context.measureText(text).width;
  
  if (widthSans !== widthHaas || navigator.userAgent.includes('Mac')) {
    detector.textContent = 'Active (Local Font Resolved)';
    detector.className = 'status-indicator success';
  } else {
    detector.textContent = 'Active (Inter Fallback Engaged)';
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
  
  // Regex to strip slide numbers, e.g., "Slide 1: ", "Slide 10: "
  const slidePrefixRegex = /^Slide\s+\d+:\s*/i;
  
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
  if (isPoetry) {
    lineCounterMeasurement.style.textAlign = 'left';
  } else {
    lineCounterMeasurement.style.textAlign = 'justify';
  }
  lineCounterMeasurement.innerHTML = htmlContent;
  const scrollHeight = lineCounterMeasurement.scrollHeight;
  // Clear container
  lineCounterMeasurement.innerHTML = '';
  
  // Calculate lines based on calibrated singleLineHeight
  return Math.round(scrollHeight / singleLineHeight);
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

function calculateBlockRange(targetVerse, totalVerses, contextSize, isSingleVerse = false) {
  const blockSize = 2 * contextSize + 1;
  // If contextSize is 2, we attempt to position the target verse at index 1 (position 2)
  // for sequence ranges, but for a single verse request we want it at position 3 (index 2)
  let start;
  if (contextSize === 2 && !isSingleVerse) {
    start = targetVerse - 1;
  } else {
    start = targetVerse - contextSize;
  }
  
  let end = start + blockSize - 1;
  
  // Clamping boundaries while preserving block size if possible
  if (start < 1) {
    start = 1;
    end = Math.min(totalVerses, start + blockSize - 1);
  } else if (end > totalVerses) {
    end = totalVerses;
    start = Math.max(1, end - blockSize + 1);
  }
  
  return { start, end };
}

// 9. Generate Slide Outline array
async function buildSlides(parsedRequests) {
  const slides = [];
  const globalTranslation = translationEl.value;
  const maxLines = getMaxLines();
  
  for (const item of parsedRequests) {
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

      // Track active block for context grouping (only when context is set to default of 2 before, 2 after)
      let activeBlockStart = null;
      let activeBlockEnd = null;
      
      // Generate slide for each verse requested in the range
      for (const targetVerse of verses) {
        const targetObj = chapterData.find(v => v.verse === targetVerse);
        if (!targetObj) continue; // Verse doesn't exist in chapter
        
        let contextSize = parseInt(contextWindowEl.value);
        let slideTextHtml = '';
        let fits = false;
        
        // 1. Try to reuse active block if contextSize === 2 and target is in positions 2 to 4 of current block (or position 1 if starting at verse 1)
        if (contextSize === 2 && activeBlockStart !== null && activeBlockEnd !== null) {
          const pos = targetVerse - activeBlockStart + 1;
          const minPos = (activeBlockStart === 1) ? 1 : 2;
          if (targetVerse >= activeBlockStart && targetVerse <= activeBlockEnd && pos >= minPos && pos <= 4) {
            const passageHtml = compilePassageHtmlForBlock(chapterData, targetVerse, activeBlockStart, activeBlockEnd, isPoetry);
            if (measureLines(passageHtml, isPoetry) <= maxLines) {
              slideTextHtml = passageHtml;
              fits = true;
            }
          }
        }
        
        // 2. If it did not fit or no active block exists, run the sliding window constraints solver
        if (!fits) {
          while (contextSize >= 0) {
            let start, end;
            if (contextSize === 2) {
              const range = calculateBlockRange(targetVerse, chapterData.length, 2, verses.length === 1);
              start = range.start;
              end = range.end;
            } else {
              start = Math.max(1, targetVerse - contextSize);
              end = Math.min(chapterData.length, targetVerse + contextSize);
            }
            
            const passageHtml = compilePassageHtmlForBlock(chapterData, targetVerse, start, end, isPoetry);
            const lineCount = measureLines(passageHtml, isPoetry);
            
            if (lineCount <= maxLines) {
              slideTextHtml = passageHtml;
              fits = true;
              if (contextSize === 2) {
                // Set as new active block
                activeBlockStart = start;
                activeBlockEnd = end;
              } else {
                // Reset active block if context is reduced
                activeBlockStart = null;
                activeBlockEnd = null;
              }
              break;
            }
            
            contextSize--; // Try smaller context
          }
        }
        
        if (fits) {
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
            blockStart: activeBlockStart,
            blockEnd: activeBlockEnd,
            format: slideFormat,
            isPoetry: isPoetry
          });
        } else {
          // Single target verse itself exceeds max lines! Split it.
          const formattedSingle = isPoetry ? formatPoeticVerse(targetObj.text) : targetObj.text;
          const parts = splitLongVerse(targetVerse, formattedSingle, maxLines, isPoetry);
          
          for (let p = 0; p < parts.length; p++) {
            const partHtml = `<span class="highlight"><sup>${targetVerse}</sup>${parts[p]}</span>`;
            slides.push({
              type: 'scripture',
              text: preventOrphans(partHtml),
              refBook: bookName.toUpperCase(),
              refVerse: `${chapter}:${targetVerse}`,
              rawText: partHtml,
              bookId: bookId,
              bookName: bookName,
              chapter: chapter,
              targetVerse: targetVerse,
              translation: targetTranslation,
              format: slideFormat,
              isPoetry: isPoetry
            });
          }
        }
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
    return;
  }
  
  slideCountEl.textContent = `${slidesData.length} slides generated`;
  btnExport.disabled = false;
  if (slidesData.length === 1) {
    btnExport.innerHTML = `<span class="icon">📥</span> Download 4K Transparent PNG`;
  } else {
    btnExport.innerHTML = `<span class="icon">📥</span> Download 4K Transparent ZIP`;
  }
  
  // Scale of visual thumbnails is ~0.08 of 4K (3840x2160) which is 307x172px.
  // The layout will draw full size, and the CSS will scale it inside card.
  slidesData.forEach((slide, idx) => {
    const card = document.createElement('div');
    card.className = `grid-slide-card checkerboard ${idx === activeSlideIndex ? 'active' : ''}`;
    
    // Core slide structure
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'grid-slide-content-wrapper';
    contentWrapper.style.transform = 'scale(0.08)';
    
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
}

// 11. Scale Editor Preview dynamically to fit parent
function scaleEditorCanvas() {
  const container = document.querySelector('.editor-main');
  if (!container || editorViewEl.style.display === 'none') return;
  
  const containerWidth = container.clientWidth - 48; // padding
  const containerHeight = container.clientHeight - 48;
  
  // Scale factor based on 3840x2160
  const scaleX = containerWidth / 3840;
  const scaleY = containerHeight / 2160;
  const scaleFactor = Math.min(scaleX, scaleY, 1.0); // max 1.0
  
  // Apply transform scale on the canvas
  slideCanvasPreview.style.transform = `scale(${scaleFactor})`;
  
  // Explicitly size the parent wrapper to the scaled dimensions so it centers correctly
  const scalerWrapper = slideCanvasPreview.parentElement;
  if (scalerWrapper) {
    scalerWrapper.style.width = `${3840 * scaleFactor}px`;
    scalerWrapper.style.height = `${2160 * scaleFactor}px`;
  }
}

// Listen to editor window resize
window.addEventListener('resize', scaleEditorCanvas);

// 12. Switch Views
function switchView(view) {
  currentView = view;
  if (view === 'grid') {
    toggleGridEl.classList.add('active');
    toggleEditorEl.classList.remove('active');
    gridViewEl.style.display = 'grid';
    editorViewEl.style.display = 'none';
    renderSlideDeck(); // refresh grid to show active status
  } else {
    toggleGridEl.classList.remove('active');
    toggleEditorEl.classList.add('active');
    gridViewEl.style.display = 'none';
    editorViewEl.style.display = 'flex';
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
      let contextSize = parseInt(contextWindowEl.value);
      let slideTextHtml = '';
      let fits = false;
      
      while (contextSize >= 0) {
        const passageHtml = compilePassageHtml(chapterData, slide.targetVerse, contextSize, isPoetry);
        const lineCount = measureLines(passageHtml, isPoetry);
        
        if (lineCount <= maxLines) {
          slideTextHtml = passageHtml;
          fits = true;
          break;
        }
        contextSize--;
      }
      
      if (fits) {
        slide.text = preventOrphans(slideTextHtml);
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

// 15. Generate Action
btnGenerate.addEventListener('click', async () => {
  const rawText = rawInputEl.value.trim();
  if (!rawText) return;
  
  btnGenerate.disabled = true;
  btnGenerate.innerHTML = `<span class="icon">⌛</span> Fetching Scripture...`;
  
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
    btnGenerate.innerHTML = `<span class="icon">⚡</span> Generate Slides`;
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

  // Set innerHTML based on slide type and active theme
  if (slide.type === 'scripture') {
    const isPoetry = slide.format === 'poetry' || (slide.type === 'scripture' && isPoeticBook(slide.bookId, slide.bookName));
    const textAlign = isPoetry ? 'left' : 'justify';
    if (isLovers) {
      slideDiv.innerHTML = `
        <div class="slide-left-column" style="position: absolute; left: 122.5px; top: 815.2px; width: 1279.5px; height: 368.6px; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 0; box-sizing: border-box;">
          <div class="slide-ref-book" style="font-family: 'IBM Plex Mono', monospace; font-weight: 500; font-size: 96px; color: #000000; text-transform: uppercase; text-align: center; line-height: 1.2; margin-bottom: 0;">${slide.refBook}</div>
          <div class="slide-ref-verse" style="font-family: 'IBM Plex Mono', monospace; font-weight: 500; font-size: 96px; color: #000000; text-align: center; line-height: 1.2;">${slide.refVerse}</div>
        </div>
        <div class="slide-divider" style="position: absolute; left: 1504px; top: 592.4px; width: 7.8px; height: 814.3px; background-color: #000000;"></div>
        <div class="slide-right-column" style="position: absolute; left: 1613.8px; top: 546.4px; width: 2101.5px; height: 906.3px; display: flex; flex-direction: column; justify-content: center; padding-right: 0; box-sizing: border-box;">
          <div class="slide-text-body" style="font-family: 'Neue Haas Grotesk Display Pro', 'Neue Haas Grotesk', 'Inter', sans-serif; font-size: 82px; line-height: 1.22; text-align: ${textAlign}; color: ${contextColor};">${cleanText}</div>
        </div>
      `;
    } else {
      slideDiv.innerHTML = `
        <div class="slide-left-column" style="width: 1363px; height: 2160px; display: flex; flex-direction: column; justify-content: center; align-items: center; position: absolute; left: 0; top: 0; padding: 200px 50px; box-sizing: border-box;">
          <div class="slide-ref-book" style="font-family: 'IBM Plex Mono', monospace; font-weight: 500; font-size: 100px; color: #ffffff; text-transform: uppercase; text-align: center; line-height: 1.2; margin-bottom: 20px;">${slide.refBook}</div>
          <div class="slide-ref-verse" style="font-family: 'IBM Plex Mono', monospace; font-weight: 500; font-size: 100px; color: #ffffff; text-align: center; line-height: 1.2;">${slide.refVerse}</div>
        </div>
        <div class="slide-divider" style="position: absolute; left: 1363px; top: 680px; width: 3px; height: 800px; background-color: #ffffff;"></div>
        <div class="slide-right-column" style="position: absolute; left: 1463px; top: 465px; width: 2177px; height: 1230px; display: flex; flex-direction: column; justify-content: center; padding-right: 200px; box-sizing: border-box;">
          <div class="slide-text-body" style="font-family: 'Neue Haas Grotesk Display Pro', 'Neue Haas Grotesk', 'Inter', sans-serif; font-size: 85px; line-height: 1.45; text-align: ${textAlign}; color: ${contextColor};">${cleanText}</div>
        </div>
      `;
    }
  } else if (slide.type === 'quote') {
    const quoteFontSize = isLovers ? '82px' : '85px';
    const authorTracking = isLovers ? '0.15em' : '2px';
    slideDiv.innerHTML = `
      <div class="slide-quote-container" style="position: absolute; left: 200px; top: 200px; width: 3440px; height: 1760px; display: flex; flex-direction: column; justify-content: center; align-items: center; box-sizing: border-box;">
        <div class="slide-quote-text" style="font-family: 'Neue Haas Grotesk Display Pro', 'Neue Haas Grotesk', 'Inter', sans-serif; font-size: ${quoteFontSize}; line-height: 1.45; color: ${textColor}; text-align: center; margin-bottom: 80px; width: 100%;">“${cleanText}”</div>
        <div class="slide-quote-author" style="font-family: 'IBM Plex Mono', monospace; font-weight: 500; font-size: 70px; color: ${textColor}; text-align: center; text-transform: uppercase; letter-spacing: ${authorTracking};">${slide.author}</div>
      </div>
    `;
  } else {
    const titleWeight = isLovers ? '500' : '300';
    slideDiv.innerHTML = `
      <div class="slide-center-title" style="position: absolute; left: 200px; top: 200px; width: 3440px; height: 1760px; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: 'IBM Plex Mono', monospace; font-weight: ${titleWeight}; font-size: 90px; line-height: 1.6; color: ${textColor}; text-align: center; text-transform: uppercase; letter-spacing: 2px; box-sizing: border-box;">
        <div style="width: 100%;">${cleanText}</div>
      </div>
    `;
  }
  
  // We need to inject inline styles or classes so highlight class renders correctly
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .slide-text-body span.highlight { color: ${textColor} !important; opacity: 1.0 !important; }
    .slide-text-body sup { font-size: 0.6em; vertical-align: super; margin-right: 8px; opacity: inherit; }
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
  if (slidesData.length === 1) {
    btnExport.innerHTML = `<span class="icon">⌛</span> Rendering PNG...`;
  } else {
    btnExport.innerHTML = `<span class="icon">⌛</span> Rendering ZIP...`;
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
        
        // Create a nice file name, e.g. 001_john_6_30.png or 003_sermon_point.png
        let filename = String(i + 1).padStart(3, '0') + '_';
        if (slide.type === 'scripture') {
          const bookClean = slide.refBook.toLowerCase().replace(/\s+/g, '_');
          const verseClean = slide.refVerse.replace(/:/g, '_');
          filename += `${bookClean}_${verseClean}.png`;
        } else {
          // Truncate title for filename
          const titleClean = slide.rawText.toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .substring(0, 20)
            .replace(/^_+|_+$/g, '');
          filename += `point_${titleClean}.png`;
        }
        
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
    if (slidesData.length === 1) {
      btnExport.innerHTML = `<span class="icon">📥</span> Download 4K Transparent PNG`;
    } else {
      btnExport.innerHTML = `<span class="icon">📥</span> Download 4K Transparent ZIP`;
    }
  }
});
