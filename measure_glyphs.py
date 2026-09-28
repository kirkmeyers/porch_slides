import zlib
import struct

with open('lovers-samples/slides/20260915 - Kylen/6.png', 'rb') as f:
    data = f.read()

pos = 8
idat = []
width = height = None
while pos < len(data):
    length, chunk_type = struct.unpack('>I4s', data[pos:pos+8])
    chunk_data = data[pos+8:pos+8+length]
    pos += 12 + length
    if chunk_type == b'IHDR':
        width, height, bit_depth, color_type = struct.unpack('>IIBB', chunk_data[:10])
    elif chunk_type == b'IDAT':
        idat.append(chunk_data)
    elif chunk_type == b'IEND':
        break

raw = zlib.decompress(b''.join(idat))
bpp = 4
stride = width * bpp
img_data = bytearray(width * height * 4)
raw_pos = 0
img_pos = 0
prev_row = bytearray(stride)

for y in range(height):
    filter_type = raw[raw_pos]
    raw_pos += 1
    curr_row = bytearray(raw[raw_pos:raw_pos+stride])
    raw_pos += stride

    if filter_type == 0:
        pass
    elif filter_type == 1:
        for x in range(bpp, stride):
            curr_row[x] = (curr_row[x] + curr_row[x - bpp]) & 0xff
    elif filter_type == 2:
        for x in range(stride):
            curr_row[x] = (curr_row[x] + prev_row[x]) & 0xff
    elif filter_type == 3:
        for x in range(stride):
            a = curr_row[x - bpp] if x >= bpp else 0
            b = prev_row[x]
            curr_row[x] = (curr_row[x] + ((a + b) >> 1)) & 0xff
    elif filter_type == 4:
        for x in range(stride):
            a = curr_row[x - bpp] if x >= bpp else 0
            b = prev_row[x]
            c = prev_row[x - bpp] if x >= bpp else 0
            p = a + b - c
            pa = abs(p - a)
            pb = abs(p - b)
            pc = abs(p - c)
            if pa <= pb and pa <= pc:
                pr = a
            elif pb <= pc:
                pr = b
            else:
                pr = c
            curr_row[x] = (curr_row[x] + pr) & 0xff

    img_data[img_pos:img_pos+stride] = curr_row
    prev_row = curr_row
    img_pos += stride

# On line 1 (Y from 574 to 657):
# Verse 1 has: ¹But understand this, that in the last days there will come times of difficulty.
# Let's inspect the bounding box of 'B' in 'But' and 'u' in 'understand'
# Let's find columns where text is black (R < 50, G < 50, B < 50, A > 200)
# Highlighted text on slide 6 is verse 1!
v1_pixels = []
for y in range(570, 670):
    for x in range(1600, 3750):
        offset = (y * width + x) * 4
        r, g, b, a = img_data[offset:offset+4]
        if a > 200 and r < 30 and g < 30 and b < 30: # Pure black highlight!
            v1_pixels.append((x, y))

xs = [p[0] for p in v1_pixels]
ys = [p[1] for p in v1_pixels]
print(f"Verse 1 black text pixels: X min={min(xs)}, max={max(xs)} (width={max(xs)-min(xs)})")
print(f"Verse 1 black text pixels: Y min={min(ys)}, max={max(ys)} (height={max(ys)-min(ys)})")

# Let's scan each character in the first word "¹But"
# '¹' is superscript, 'B' is capital, 'u' and 't' are lowercase
# Let's print column projection of the first 200px after min(xs)
start_x = min(xs)
col_y_ranges = []
for x in range(start_x, start_x + 300):
    col_ys = [y for (px, y) in v1_pixels if px == x]
    if col_ys:
        col_y_ranges.append((x - start_x, min(col_ys), max(col_ys), max(col_ys) - min(col_ys) + 1))
    else:
        col_y_ranges.append((x - start_x, None, None, 0))

# Group connected glyphs
glyphs = []
in_g = False
g_start = 0
for x_rel, y_min, y_max, h in col_y_ranges:
    if h > 0:
        if not in_g:
            in_g = True
            g_start = x_rel
    else:
        if in_g:
            in_g = False
            # Get bounding box of glyph
            g_pts = [p for p in v1_pixels if start_x + g_start <= p[0] <= start_x + x_rel - 1]
            gx = [p[0] for p in g_pts]
            gy = [p[1] for p in g_pts]
            glyphs.append((g_start, min(gy), max(gy), max(gy) - min(gy) + 1, max(gx) - min(gx) + 1))

print("First few glyphs in Verse 1:")
for i, (gx, ymin, ymax, gh, gw) in enumerate(glyphs[:8]):
    print(f"Glyph {i+1}: rel_x={gx}, Y={ymin}..{ymax}, height={gh}px, width={gw}px")
