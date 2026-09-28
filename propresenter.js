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

  writeMessage(fieldNumber, subWriter) {
    const bytes = subWriter.finish();
    if (bytes.length === 0) return;
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
 * Write a 4-point closed unit rectangle path for ProPresenter Graphic Element
 */
export function writeRectanglePath(path) {
  path.writeBool(1, true); // closed: true

  // 4 normalized unit bezier points: (0,0), (1,0), (1,1), (0,1)
  const coords = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1]
  ];

  for (const [x, y] of coords) {
    const bp = new ProtoWriter();
    const pt = new ProtoWriter();
    pt.writeDouble(1, x);
    pt.writeDouble(2, y);
    bp.writeMessage(1, pt); // point
    path.writeMessage(2, bp); // points
  }

  const shape = new ProtoWriter();
  shape.writeInt32(1, 1); // shape.type: TYPE_RECTANGLE
  path.writeMessage(3, shape);
}

/**
 * Convert plain text to standard Rich Text Format (RTF) string for ProPresenter 7 notes
 */
export function textToRtf(text) {
  if (!text) return '';
  let rtf = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = text.charCodeAt(i);
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

  if (slide.type === 'scripture') {
    // Determine friendly reference (e.g. Genesis 1:1)
    const book = slide.bookName || slide.refBook || '';
    const verse = slide.refVerse || '';
    const ref = `${book} ${verse}`.trim();

    // Parse HTML to extract highlighted/emphasized text
    let emphasizedText = '';
    if (typeof document !== 'undefined') {
      let container = document.createElement('div');
      container.innerHTML = slide.text || '';

      const highlights = container.querySelectorAll('.highlight');
      if (highlights.length > 0) {
        const parts = [];
        highlights.forEach(h => {
          const clone = h.cloneNode(true);
          // Strip verse superscript numbers
          clone.querySelectorAll('sup').forEach(s => s.remove());
          const t = clone.textContent.replace(/\s+/g, ' ').trim();
          if (t) parts.push(t);
        });
        emphasizedText = parts.join(' ');
      } else {
        // Fallback: entire verse content without <sup> tags
        const clone = container.cloneNode(true);
        clone.querySelectorAll('sup').forEach(s => s.remove());
        emphasizedText = clone.textContent.replace(/\s+/g, ' ').trim();
      }
    } else {
      // Regex fallback for non-browser/test environments
      const html = slide.text || '';
      const hlMatches = [...html.matchAll(/<span class="highlight">([\s\S]*?)<\/span>/gi)];
      if (hlMatches.length > 0) {
        emphasizedText = hlMatches.map(m => m[1].replace(/<sup[\s\S]*?<\/sup>/gi, '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()).join(' ');
      } else {
        emphasizedText = html.replace(/<sup[\s\S]*?<\/sup>/gi, '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      }
    }

    if (ref && emphasizedText) {
      return `${ref} - ${emphasizedText}`;
    }
    return ref || emphasizedText;
  }

  if (slide.type === 'quote') {
    const rawQuote = slide.quoteText || slide.text || '';
    const rawAuthor = slide.quoteAuthor || slide.author || '';
    const cleanQuote = rawQuote.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const cleanAuthor = rawAuthor.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return cleanAuthor ? `“${cleanQuote}” — ${cleanAuthor}` : `“${cleanQuote}”`;
  }

  // Sermon Point
  const raw = slide.rawText || slide.text || '';
  return raw.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Get slide cue display label (e.g. "Genesis 1:1" or "Point 1")
 */
export function getSlideCueLabel(slide, index) {
  if (slide.type === 'scripture') {
    const book = slide.bookName || slide.refBook || '';
    const verse = slide.refVerse || '';
    return `${book} ${verse}`.trim() || `Scripture ${index + 1}`;
  }
  if (slide.type === 'quote') {
    return slide.quoteAuthor ? `Quote: ${slide.quoteAuthor}` : `Quote ${index + 1}`;
  }
  const raw = slide.rawText || slide.text || `Point ${index + 1}`;
  const clean = raw.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return clean.length > 30 ? `${clean.substring(0, 30)}...` : clean;
}

/**
 * Categorize a slide into a ProPresenter CueGroup with name, color, and grouping key
 */
export function getSlideGroupInfo(slide, index) {
  if (slide.type === 'scripture') {
    const book = slide.bookName || slide.refBook || '';
    const verse = slide.refVerse || '';
    const ref = `${book} ${verse}`.trim();
    return {
      groupKey: `scripture:${ref || index}`,
      name: ref || `Scripture ${index + 1}`,
      color: { red: 0.15, green: 0.55, blue: 0.85, alpha: 1.0 } // Cyan/Blue
    };
  }
  if (slide.type === 'quote') {
    const author = slide.quoteAuthor || slide.author || '';
    return {
      groupKey: `quote:${index}`, // Quotes each get their own group
      name: author ? `Quote: ${author}` : `Quote ${index + 1}`,
      color: { red: 0.85, green: 0.65, blue: 0.15, alpha: 1.0 } // Amber/Gold
    };
  }
  // Sermon Point
  const raw = slide.rawText || slide.text || `Point ${index + 1}`;
  const clean = raw.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
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

    const groupInfo = getSlideGroupInfo(item.slide, index);

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
    cue.writeString(2, item.filename); // Cue Name
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

    // Slide Element (tag 1 in Slide: repeated Element elements = 1)
    const slideElem = new ProtoWriter();

    // Graphics.Element (tag 1 in Slide.Element)
    const gfxElem = new ProtoWriter();
    const gfxElemUUID = generateUUID();
    writeUUID(gfxElem, 1, gfxElemUUID);
    gfxElem.writeString(2, item.filename);

    // Bounds: 0, 0, 3840, 2160 (tag 3 in Graphics.Element)
    const bounds = new ProtoWriter();
    const origin = new ProtoWriter();
    origin.writeDouble(1, 0);
    origin.writeDouble(2, 0);
    bounds.writeMessage(1, origin);
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
    url.writeString(2, `Media/${item.filename}`); // relative path
    const localRel = new ProtoWriter();
    localRel.writeInt32(1, 10); // root: ROOT_SHOW
    localRel.writeString(2, `Media/${item.filename}`);
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
    imgProps.writeMessage(1, drawing);
    media.writeMessage(5, imgProps);

    fill.writeMessage(3, media);
    gfxElem.writeMessage(9, fill);

    slideElem.writeMessage(1, gfxElem);
    baseSlide.writeMessage(1, slideElem);

    // Element Build Order: list element UUID (tag 2 in Slide)
    writeUUID(baseSlide, 2, gfxElemUUID);

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
    zip.folder('Media').file(filename, pngBlob);

    slideItems.push({
      slide,
      filename,
      notes,
      label
    });
  }

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
