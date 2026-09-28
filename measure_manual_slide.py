import zlib
import struct

def read_png(filename):
    with open(filename, 'rb') as f:
        data = f.read()
    assert data[:8] == b'\x89PNG\r\n\x1a\n'
    pos = 8
    idat = []
    width = height = None
    while pos < len(data):
        length, chunk_type = struct.unpack('>I4s', data[pos:pos+8])
        chunk_data = data[pos+8:pos+8+length]
        pos += 12 + length
        if chunk_type == b'IHDR':
            width, height, bit_depth, color_type = struct.unpack('>IIBB', chunk_data[:10])
            print(f"IHDR: {width}x{height}, depth={bit_depth}, color_type={color_type}")
        elif chunk_type == b'IDAT':
            idat.append(chunk_data)
        elif chunk_type == b'IEND':
            break

    raw = zlib.decompress(b''.join(idat))
    # Decode uncompressed scanlines (RGBA 8-bit = 4 bytes per pixel)
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
        elif filter_type == 1: # Sub
            for x in range(bpp, stride):
                curr_row[x] = (curr_row[x] + curr_row[x - bpp]) & 0xff
        elif filter_type == 2: # Up
            for x in range(stride):
                curr_row[x] = (curr_row[x] + prev_row[x]) & 0xff
        elif filter_type == 3: # Average
            for x in range(stride):
                a = curr_row[x - bpp] if x >= bpp else 0
                b = prev_row[x]
                curr_row[x] = (curr_row[x] + ((a + b) >> 1)) & 0xff
        elif filter_type == 4: # Paeth
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

    return width, height, img_data

w, h, data = read_png('lovers-samples/slides/20260915 - Kylen/6.png')

# Find right column text line bounds
# Right column x > 1550
row_alphas = [0] * h
for y in range(h):
    row_offset = y * w * 4
    # Scan x from 1550 to w
    max_a = 0
    for x in range(1550, w):
        a = data[row_offset + x * 4 + 3]
        if a > max_a:
            max_a = a
    row_alphas[y] = max_a

# Find rows with text (alpha > 30)
text_rows = [y for y, a in enumerate(row_alphas) if a > 30]
print(f"Text rows: min={min(text_rows)}, max={max(text_rows)}, total height={max(text_rows) - min(text_rows)}")

# Find individual text lines
lines = []
in_line = False
start_y = 0
for y in range(min(text_rows), max(text_rows) + 1):
    if row_alphas[y] > 30:
        if not in_line:
            in_line = True
            start_y = y
    else:
        if in_line:
            in_line = False
            lines.append((start_y, y - 1))
if in_line:
    lines.append((start_y, max(text_rows)))

print(f"Detected {len(lines)} lines of text:")
for i, (sy, ey) in enumerate(lines):
    # calculate line baseline or cap height
    height = ey - sy + 1
    gap = lines[i+1][0] - ey - 1 if i+1 < len(lines) else 0
    pitch = lines[i+1][0] - sy if i+1 < len(lines) else 0
    print(f"Line {i+1}: Y={sy}..{ey} (height={height}px), gap={gap}px, pitch={pitch}px")
