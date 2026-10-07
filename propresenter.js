/**
 * ProPresenter 7 (.probundle) Exporter for Sermon Slide Generator
 * 
 * Generates native ProPresenter 7 presentations (.pro) and bundles (.probundle)
 * with 4K transparent PNG graphics loaded onto presentation slides and
 * key information (prepended reference + emphasized scripture text)
 * populated into the Slide Notes field.
 */

import JSZip from 'jszip';

// Lightweight, zero-dependency binary Protobuf writer
export class ProtoWriter {
  constructor() {
    this.chunks = [];
    this.totalLength = 0;
  }

  writeVarint(value) {
    let v = typeof value === 'bigint' ? value : BigInt(value >>> 0);
    const bytes = [];
    while (v >= 0x80n) {
      bytes.push(Number((v & 0x7Fn) | 0x80n));
      v >>= 7n;
    }
    bytes.push(Number(v & 0x7Fn));
    const u8 = new Uint8Array(bytes);
    this.chunks.push(u8);
    this.totalLength += u8.length;
  }

  writeTag(fieldNumber, wireType) {
    this.writeVarint((fieldNumber << 3) | wireType);
  }

  writeInt32(fieldNumber, value) {
    if (value === 0 || value === undefined) return;
    this.writeTag(fieldNumber, 0);
    this.writeVarint(value);
  }

  writeInt64(fieldNumber, value) {
    if (value === 0 || value === undefined) return;
    this.writeTag(fieldNumber, 0);
    this.writeVarint(value);
  }

  writeBool(fieldNumber, value) {
    if (!value) return;
    this.writeTag(fieldNumber, 0);
    this.writeVarint(value ? 1 : 0);
  }

  writeDouble(fieldNumber, value) {
    if (value === 0 || value === undefined) return;
    this.writeTag(fieldNumber, 1);
    const buf = new ArrayBuffer(8);
    const view = new DataView(buf);
    view.setFloat64(0, value, true); // Little endian
    const u8 = new Uint8Array(buf);
    this.chunks.push(u8);
    this.totalLength += 8;
  }

  writeFloat(fieldNumber, value) {
    if (value === 0 || value === undefined) return;
    this.writeTag(fieldNumber, 5);
    const buf = new ArrayBuffer(4);
    const view = new DataView(buf);
    view.setFloat32(0, value, true); // Little endian
    const u8 = new Uint8Array(buf);
    this.chunks.push(u8);
    this.totalLength += 4;
  }

  writeString(fieldNumber, value) {
    if (!value) return;
    const encoded = new TextEncoder().encode(value);
    this.writeTag(fieldNumber, 2);
    this.writeVarint(encoded.length);
    this.chunks.push(encoded);
    this.totalLength += encoded.length;
  }

  writeBytes(fieldNumber, uint8Array) {
    if (!uint8Array || uint8Array.length === 0) return;
    this.writeTag(fieldNumber, 2);
    this.writeVarint(uint8Array.length);
    this.chunks.push(uint8Array);
    this.totalLength += uint8Array.length;
  }

  writeMessage(fieldNumber, subWriter, allowEmpty = false) {
    const bytes = subWriter.finish();
    if (bytes.length === 0 && !allowEmpty) return;
    this.writeTag(fieldNumber, 2);
    this.writeVarint(bytes.length);
    this.chunks.push(bytes);
    this.totalLength += bytes.length;
  }

  finish() {
    const result = new Uint8Array(this.totalLength);
    let offset = 0;
    for (const chunk of this.chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  }
}

/**
 * Generate RFC 4122 v4 UUID
 */
export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().toUpperCase();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16).toUpperCase();
  });
}

/**
 * Write a ProPresenter UUID message (tag 1: string)
 */
export function writeUUID(writer, fieldNumber, uuidString) {
  const u = new ProtoWriter();
  u.writeString(1, uuidString);
  writer.writeMessage(fieldNumber, u);
}

/**
 * Write a ProPresenter Color message (tag 1: red, 2: green, 3: blue, 4: alpha as 32-bit floats)
 */
export function writeColor(writer, fieldNumber, color) {
  const c = new ProtoWriter();
  c.writeFloat(1, color.red);
  c.writeFloat(2, color.green);
  c.writeFloat(3, color.blue);
  c.writeFloat(4, color.alpha ?? 1.0);
  writer.writeMessage(fieldNumber, c);
}

/**
 * Write a ProPresenter Graphics.Point message (x: 1, y: 2)
 */
export function writePoint(writer, fieldNumber, x, y) {
  const pt = new ProtoWriter();
  if (x !== 0) pt.writeDouble(1, x);
  if (y !== 0) pt.writeDouble(2, y);
  writer.writeMessage(fieldNumber, pt, true);
}

/**
 * Write a 4-point closed unit rectangle path for ProPresenter Graphic Element
 * Matches native ProPresenter 7 bezier path structure:
 * Point 0: (0,0) with q0=(0,0), q1=(0,0)
 * Point 1: (1,0) with q0=(1,0), q1=(1,0)
 * Point 2: (1,1) with q0=(1,1), q1=(1,1)
 * Point 3: (0,1) with q0=(0,1), q1=(0,1)
 */
export function writeRectanglePath(path) {
  path.writeBool(1, true); // closed: true

  const coords = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1]
  ];

  for (const [x, y] of coords) {
    const bp = new ProtoWriter();
    writePoint(bp, 1, x, y); // point
    writePoint(bp, 2, x, y); // q0
    writePoint(bp, 3, x, y); // q1
    path.writeMessage(2, bp); // points
  }

  const shape = new ProtoWriter();
  shape.writeInt32(1, 1); // shape.type: TYPE_RECTANGLE
  path.writeMessage(3, shape);
}

/**
 * Clean notes, labels, and text of HTML tags, entities (including &#160;, &nbsp;, \u00a0),
 * and excessive whitespace.
 * Ensures ProPresenter notes and UI preview text are completely free of HTML/XML entities.
 */
export function cleanNotesText(str) {
  if (!str) return '';
  let res = String(str);

  // 1. Decode double-escaped entities like &amp;#160; or &amp;nbsp;
  res = res.replace(/&amp;(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m, g1) => '&' + g1 + ';');

  // 2. Strip HTML tags like <span>, <br>, <sup>, etc.
  res = res.replace(/<[^>]*>/g, ' ');

  // 3. Replace non-breaking spaces (literal numeric entity, named entity, or unicode char)
  res = res.replace(/&#160;|&nbsp;|\u00a0/gi, ' ');

  // 4. Common HTML entities
  res = res
    .replace(/&ldquo;|&#8220;/gi, '“')
    .replace(/&rdquo;|&#8221;/gi, '”')
    .replace(/&lsquo;|&#8216;/gi, '‘')
    .replace(/&rsquo;|&#8217;/gi, '’')
    .replace(/&mdash;|&#8212;/gi, '—')
    .replace(/&ndash;|&#8211;/gi, '–')
    .replace(/&hellip;|&#8230;/gi, '…')
    .replace(/&middot;|&#183;/gi, '·')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&');

  // 5. Any remaining numeric entities
  res = res.replace(/&#(\d+);/g, (match, dec) => {
    const code = parseInt(dec, 10);
    if (code === 160) return ' ';
    try {
      return String.fromCodePoint(code);
    } catch {
      return match;
    }
  }).replace(/&#x([0-9a-f]+);/gi, (match, hex) => {
    const code = parseInt(hex, 16);
    if (code === 160) return ' ';
    try {
      return String.fromCodePoint(code);
    } catch {
      return match;
    }
  });

  // 6. In browser environments, use DOMParser to decode any remaining obscure entities
  if (typeof document !== 'undefined' && res.includes('&')) {
    try {
      const doc = new DOMParser().parseFromString(res, 'text/html');
      if (doc && doc.body) {
        res = doc.body.textContent || res;
      }
    } catch (e) {
      // ignore
    }
  }

  // 7. Ensure any leftover non-breaking spaces are turned into regular spaces
  res = res.replace(/&#160;|&nbsp;|\u00a0/gi, ' ');

  // 8. Collapse whitespace and trim
  return res.replace(/\s+/g, ' ').trim();
}

/**
 * Convert plain text to standard Rich Text Format (RTF) string for ProPresenter 7 notes
 */
export function textToRtf(text) {
  if (!text) return '';
  const cleaned = cleanNotesText(text);
  let rtf = '';
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const code = cleaned.charCodeAt(i);
    if (char === '\\') rtf += '\\\\';
    else if (char === '{') rtf += '\\{';
    else if (char === '}') rtf += '\\}';
    else if (char === '\n') rtf += '\\par\n';
    else if (code > 127) {
      rtf += `\\u${code}?`;
    } else {
      rtf += char;
    }
  }
  return `{\\rtf1\\ansi\\ansicpg1252\\cocoartf2709\\cocoascreenfonts1{\\fonttbl\\f0\\fswiss\\fcharset0 Helvetica;}\\f0\\fs28 ${rtf}}`;
}

/**
 * Extract slide notes according to user specifications:
 * - Scripture: Prepend scripture reference + emphasized text (ignoring context verses)
 * - Quote: “Quote” — Author
 * - Sermon Point: Point text
 */
export function extractSlideNotes(slide) {
  if (!slide) return '';

  // Return custom notes if user explicitly provided/edited them
  if (slide.customNotes !== undefined && slide.customNotes !== null && slide.customNotes.trim() !== '') {
    return cleanNotesText(slide.customNotes);
  }

  if (slide.type === 'scripture') {
    // Prioritize refBook / refVerse since user edits in the editor update them
    const book = cleanNotesText(slide.refBook || slide.bookName || '');
    const verse = cleanNotesText(slide.refVerse || '');
    const ref = `${book} ${verse}`.trim();

    // Parse HTML to extract highlighted/emphasized text
    let emphasizedText = '';
    const slideContent = slide.text || slide.rawText || '';

    if (typeof document !== 'undefined') {
      let container = document.createElement('div');
      container.innerHTML = slideContent;

      const highlights = container.querySelectorAll('.highlight');
      if (highlights.length > 0) {
        const parts = [];
        highlights.forEach(h => {
          const clone = h.cloneNode(true);
          // Strip verse superscript numbers
          clone.querySelectorAll('sup').forEach(s => s.remove());
          const t = cleanNotesText(clone.textContent || clone.innerText || '');
          if (t) parts.push(t);
        });
        emphasizedText = parts.join(' ');
      } else {
        // Fallback: entire verse content without <sup> tags
        const clone = container.cloneNode(true);
        clone.querySelectorAll('sup').forEach(s => s.remove());
        emphasizedText = cleanNotesText(clone.textContent || clone.innerText || '');
      }
    } else {
      // Tag-balancing fallback for non-browser/test environments (handles nested <span> tags)
      const hlRegex = /<span\s+class="highlight">/gi;
      let match;
      const parts = [];
      while ((match = hlRegex.exec(slideContent)) !== null) {
        let depth = 1;
        let cursor = match.index + match[0].length;
        const tagRegex = /<\/?span[^>]*>/gi;
        tagRegex.lastIndex = cursor;
        let tagMatch;
        let endIdx = slideContent.length;
        while ((tagMatch = tagRegex.exec(slideContent)) !== null) {
          if (tagMatch[0].startsWith('</')) {
            depth--;
            if (depth === 0) {
              endIdx = tagMatch.index;
              break;
            }
          } else {
            depth++;
          }
        }
        const innerContent = slideContent.substring(cursor, endIdx);
        const stripped = cleanNotesText(innerContent.replace(/<sup[\s\S]*?<\/sup>/gi, '').replace(/<[^>]+>/g, ' '));
        if (stripped) parts.push(stripped);
        hlRegex.lastIndex = endIdx;
      }

      if (parts.length > 0) {
        emphasizedText = parts.join(' ');
      } else {
        emphasizedText = cleanNotesText(slideContent.replace(/<sup[\s\S]*?<\/sup>/gi, '').replace(/<[^>]+>/g, ' '));
      }
    }

    if (ref && emphasizedText) {
      return cleanNotesText(`${ref} - ${emphasizedText}`);
    }
    return cleanNotesText(ref || emphasizedText);
  }

  if (slide.type === 'quote') {
    const rawQuote = slide.text || slide.quoteText || slide.rawText || '';
    const rawAuthor = slide.author || slide.quoteAuthor || '';
    const strippedQuote = rawQuote.replace(/^[“”"']+|[“”"']+$/g, '').trim();
    const cleanQuote = cleanNotesText(strippedQuote);
    const cleanAuthor = cleanNotesText(rawAuthor);
    return cleanAuthor ? `“${cleanQuote}” — ${cleanAuthor}` : `“${cleanQuote}”`;
  }

  // Sermon Point
  const raw = slide.text || slide.rawText || '';
  return cleanNotesText(raw);
}

/**
 * Get slide cue display label (e.g. "Genesis 1:1" or "Point 1")
 */
export function getSlideCueLabel(slide, index) {
  if (slide.type === 'scripture') {
    const book = cleanNotesText(slide.refBook || slide.bookName || '');
    const verse = cleanNotesText(slide.refVerse || '');
    return `${book} ${verse}`.trim() || `Scripture ${index + 1}`;
  }
  if (slide.type === 'quote') {
    const author = cleanNotesText(slide.author || slide.quoteAuthor || '');
    return author ? `Quote: ${author}` : `Quote ${index + 1}`;
  }
  const raw = slide.text || slide.rawText || `Point ${index + 1}`;
  const clean = cleanNotesText(raw);
  return clean.length > 30 ? `${clean.substring(0, 30)}...` : clean;
}

/**
 * Categorize a slide into a ProPresenter CueGroup with name, color, and grouping key
 */
export function getSlideGroupInfo(slide, index) {
  if (!slide) {
    return {
      groupKey: 'blank',
      name: 'Blank',
      color: { red: 0.25, green: 0.25, blue: 0.25, alpha: 1.0 }
    };
  }
  if (slide.type === 'scripture') {
    const book = cleanNotesText(slide.refBook || slide.bookName || '');
    const verse = cleanNotesText(slide.refVerse || '');
    const ref = `${book} ${verse}`.trim();
    return {
      groupKey: `scripture:${ref || index}`,
      name: ref || `Scripture ${index + 1}`,
      color: { red: 0.15, green: 0.55, blue: 0.85, alpha: 1.0 } // Cyan/Blue
    };
  }
  if (slide.type === 'quote') {
    const author = cleanNotesText(slide.author || slide.quoteAuthor || '');
    return {
      groupKey: `quote:${index}`, // Quotes each get their own group
      name: author ? `Quote: ${author}` : `Quote ${index + 1}`,
      color: { red: 0.85, green: 0.65, blue: 0.15, alpha: 1.0 } // Amber/Gold
    };
  }
  // Sermon Point
  const raw = slide.text || slide.rawText || `Point ${index + 1}`;
  const clean = cleanNotesText(raw);
  const shortName = clean.length > 25 ? `${clean.substring(0, 25)}...` : clean;
  return {
    groupKey: `point:${index}`, // Each point gets its own group
    name: shortName || `Point ${index + 1}`,
    color: { red: 0.55, green: 0.35, blue: 0.85, alpha: 1.0 } // Purple/Indigo
  };
}

/**
 * Build the rv.data.Presentation binary Protocol Buffer message
 * 
 * @param {string} presentationName 
 * @param {Array<{ slide: object, filename: string, notes: string, label: string }>} slideItems 
 * @returns {Uint8Array}
 */
export function buildProPresenterPresentation(presentationName, slideItems) {
  const p = new ProtoWriter();

  // Application Info (tag 1)
  const appInfo = new ProtoWriter();
  appInfo.writeInt32(1, 1); // platform: PLATFORM_MACOS
  appInfo.writeInt32(3, 1); // application: APPLICATION_PROPRESENTER
  p.writeMessage(1, appInfo);

  // Presentation UUID (tag 2)
  writeUUID(p, 2, generateUUID());

  // Presentation Name (tag 3)
  p.writeString(3, presentationName);

  // Pre-process items: assign cue UUIDs and group slides
  const groups = [];
  let currentGroup = null;

  slideItems.forEach((item, index) => {
    const cueUUID = generateUUID();
    item.cueUUID = cueUUID;

    const groupInfo = item.groupInfo || getSlideGroupInfo(item.slide, index);

    if (currentGroup && currentGroup.groupKey === groupInfo.groupKey) {
      currentGroup.cueUUIDs.push(cueUUID);
    } else {
      currentGroup = {
        groupUUID: generateUUID(),
        groupKey: groupInfo.groupKey,
        name: groupInfo.name,
        color: groupInfo.color,
        cueUUIDs: [cueUUID]
      };
      groups.push(currentGroup);
    }
  });

  // Selected Arrangement (tag 10)
  const arrangementUUID = generateUUID();
  writeUUID(p, 10, arrangementUUID);

  // Arrangements (tag 11)
  const arrangement = new ProtoWriter();
  writeUUID(arrangement, 1, arrangementUUID);
  arrangement.writeString(2, 'Default');
  groups.forEach(g => {
    writeUUID(arrangement, 3, g.groupUUID);
  });
  p.writeMessage(11, arrangement);

  // Cue Groups (tag 12)
  groups.forEach(g => {
    const cueGroup = new ProtoWriter();
    const group = new ProtoWriter();
    writeUUID(group, 1, g.groupUUID);
    group.writeString(2, g.name);
    writeColor(group, 3, g.color);
    cueGroup.writeMessage(1, group);

    g.cueUUIDs.forEach(cueUUID => {
      writeUUID(cueGroup, 2, cueUUID);
    });
    p.writeMessage(12, cueGroup);
  });

  // Cues (tag 13)
  slideItems.forEach((item) => {
    const cue = new ProtoWriter();
    writeUUID(cue, 1, item.cueUUID);
    const cueName = item.cueName !== undefined ? item.cueName : (item.label || item.filename || '');
    if (cueName) {
      cue.writeString(2, cueName);
    }
    cue.writeInt32(5, 1); // completion_action_type: COMPLETION_ACTION_TYPE_LAST
    cue.writeBool(12, true); // isEnabled

    // Action (tag 10 in Cue)
    const action = new ProtoWriter();
    writeUUID(action, 1, generateUUID());
    action.writeBool(6, true); // isEnabled
    action.writeInt32(9, 11); // type: ACTION_TYPE_PRESENTATION_SLIDE

    // Action Label (tag 3)
    if (item.label) {
      const label = new ProtoWriter();
      label.writeString(2, item.label);
      action.writeMessage(3, label);
    }

    // SlideType (tag 23 in Action)
    const slideType = new ProtoWriter();
    const presSlide = new ProtoWriter(); // PresentationSlide (tag 2 in SlideType)

    // Base Slide (tag 1 in PresentationSlide)
    const baseSlide = new ProtoWriter();
    writeUUID(baseSlide, 7, generateUUID());

    // Slide Size: 4K 3840 x 2160 (tag 6 in Slide)
    const size = new ProtoWriter();
    size.writeDouble(1, 3840);
    size.writeDouble(2, 2160);
    baseSlide.writeMessage(6, size);

    // Only add graphic element if slide is not blank and has a filename
    if (!item.isBlank && item.filename) {
      const slideElem = new ProtoWriter();
      const gfxElem = new ProtoWriter();
      const gfxElemUUID = generateUUID();
      writeUUID(gfxElem, 1, gfxElemUUID);
      gfxElem.writeString(2, item.filename);

      // Bounds: 0, 0, 3840, 2160 (tag 3 in Graphics.Element)
      const bounds = new ProtoWriter();
      const origin = new ProtoWriter();
      bounds.writeMessage(1, origin, true); // origin: {}
      const elemSize = new ProtoWriter();
      elemSize.writeDouble(1, 3840);
      elemSize.writeDouble(2, 2160);
      bounds.writeMessage(2, elemSize);
      gfxElem.writeMessage(3, bounds);
      gfxElem.writeDouble(5, 1.0); // opacity

      // Path: closed rectangle with 4 BezierPoints (tag 8 in Graphics.Element)
      const path = new ProtoWriter();
      writeRectanglePath(path);
      gfxElem.writeMessage(8, path);

      // Fill: Media Fill (tag 9 in Graphics.Element)
      const fill = new ProtoWriter();
      fill.writeBool(4, true); // enable

      // Media (tag 3 in Fill)
      const media = new ProtoWriter();
      writeUUID(media, 1, generateUUID());

      // Media URL (tag 2 in Media)
      const url = new ProtoWriter();
      url.writeInt32(3, 1); // platform: PLATFORM_MACOS
      url.writeString(2, `Media/Assets/${item.filename}`); // relative path
      const localRel = new ProtoWriter();
      localRel.writeInt32(1, 10); // root: ROOT_SHOW
      localRel.writeString(2, `Media/Assets/${item.filename}`);
      url.writeMessage(4, localRel);
      media.writeMessage(2, url);

      // Metadata (tag 3 in Media)
      const meta = new ProtoWriter();
      meta.writeString(5, 'png');
      media.writeMessage(3, meta);

      // Image Properties (tag 5 in Media)
      const imgProps = new ProtoWriter();
      const drawing = new ProtoWriter();
      drawing.writeInt32(1, 1); // scale_behavior: SCALE_BEHAVIOR_FILL
      const natSize = new ProtoWriter();
      natSize.writeDouble(1, 3840);
      natSize.writeDouble(2, 2160);
      drawing.writeMessage(5, natSize);
      const customBounds = new ProtoWriter();
      drawing.writeMessage(7, customBounds, true); // custom_image_bounds: {}
      const cropInsets = new ProtoWriter();
      drawing.writeMessage(14, cropInsets, true); // crop_insets: {}
      imgProps.writeMessage(1, drawing);

      // File Properties (tag 2 in ImageTypeProperties)
      const fileProps = new ProtoWriter();
      const localUrl = new ProtoWriter();
      localUrl.writeInt32(3, 1); // platform: PLATFORM_MACOS
      localUrl.writeString(2, `Media/Assets/${item.filename}`);
      const localFileRel = new ProtoWriter();
      localFileRel.writeInt32(1, 10); // root: ROOT_SHOW
      localFileRel.writeString(2, `Media/Assets/${item.filename}`);
      localUrl.writeMessage(4, localFileRel);
      fileProps.writeMessage(1, localUrl);
      imgProps.writeMessage(2, fileProps);

      media.writeMessage(5, imgProps);

      fill.writeMessage(3, media);
      gfxElem.writeMessage(9, fill);

      slideElem.writeMessage(1, gfxElem);
      baseSlide.writeMessage(1, slideElem);

      // Element Build Order: list element UUID (tag 2 in Slide)
      writeUUID(baseSlide, 2, gfxElemUUID);
    }

    presSlide.writeMessage(1, baseSlide);

    // Notes: Rich Text Format (RTF) string (tag 2 in PresentationSlide)
    if (item.notes) {
      const notes = new ProtoWriter();
      const rtfBytes = new TextEncoder().encode(textToRtf(item.notes));
      notes.writeBytes(1, rtfBytes);
      presSlide.writeMessage(2, notes);
    }

    slideType.writeMessage(2, presSlide);
    action.writeMessage(23, slideType);

    cue.writeMessage(10, action);
    p.writeMessage(13, cue);
  });

  return p.finish();
}

/**
 * Export full sermon deck to a ProPresenter 7 bundle (.probundle)
 * 
 * @param {object} options
 * @param {Array<object>} options.slidesData
 * @param {string} options.presentationName
 * @param {Function} options.renderSlideToCanvas - async (slide, canvas) => Blob
 * @param {HTMLCanvasElement} options.canvas
 * @param {Function} options.getSlideFilename - (slide, index) => string
 * @param {Function} options.onProgress - (current, total, statusText) => void
 * @returns {Promise<Blob>}
 */
export async function exportProPresenterBundle({
  slidesData,
  presentationName,
  renderSlideToCanvas,
  canvas,
  getSlideFilename,
  onProgress
}) {
  const zip = new JSZip();
  const slideItems = [];

  // 1. Add 5 blank slides at the beginning of the presentation
  // Labels on 1, 2, 4, & 5 are blank; label on 3rd slide is "Porch Live Locations - Confidence ONLY"
  const introBlanks = [
    { label: '', cueName: '' },
    { label: '', cueName: '' },
    { label: 'Porch Live Locations - Confidence ONLY', cueName: 'Porch Live Locations - Confidence ONLY' },
    { label: '', cueName: '' },
    { label: '', cueName: '' }
  ];

  introBlanks.forEach((blank) => {
    slideItems.push({
      isBlank: true,
      slide: null,
      filename: '',
      notes: blank.label || '',
      label: blank.label || '',
      cueName: blank.cueName || '',
      groupInfo: {
        groupKey: 'blank_intro',
        name: 'Blank',
        color: { red: 0.25, green: 0.25, blue: 0.25, alpha: 1.0 }
      }
    });
  });

  // 2. Render and add sermon slides
  for (let i = 0; i < slidesData.length; i++) {
    const slide = slidesData[i];
    const filename = getSlideFilename(slide, i);
    const notes = extractSlideNotes(slide);
    const label = getSlideCueLabel(slide, i);

    if (onProgress) {
      const pct = Math.round(((i + 0.5) / slidesData.length) * 85);
      onProgress(i + 1, slidesData.length, `Rendering 4K slide ${i + 1} of ${slidesData.length}...`, pct);
    }

    const pngBlob = await renderSlideToCanvas(slide, canvas);
    zip.folder('Media/Assets').file(filename, pngBlob);
    zip.folder('Media').file(filename, pngBlob);

    slideItems.push({
      slide,
      filename,
      notes,
      label
    });
  }

  // 3. Add 1 blank slide at the end of the whole presentation
  slideItems.push({
    isBlank: true,
    slide: null,
    filename: '',
    notes: '',
    label: '',
    cueName: '',
    groupInfo: {
      groupKey: 'blank_outro',
      name: 'Blank',
      color: { red: 0.25, green: 0.25, blue: 0.25, alpha: 1.0 }
    }
  });

  if (onProgress) {
    onProgress(slidesData.length, slidesData.length, 'Generating ProPresenter presentation & notes...', 90);
  }

  // Generate .pro binary protobuf data
  const proBytes = buildProPresenterPresentation(presentationName, slideItems);
  zip.file(`${presentationName}.pro`, proBytes);

  if (onProgress) {
    onProgress(slidesData.length, slidesData.length, 'Packaging .probundle archive...', 95);
  }

  const bundleBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  if (onProgress) {
    onProgress(slidesData.length, slidesData.length, 'Ready!', 100);
  }

  return bundleBlob;
}
