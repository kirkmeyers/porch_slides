# Measure baseline of all 9 lines in 6.png
with open('lovers-samples/slides/20260915 - Kylen/6.png', 'rb') as f:
    pass # we can run the analysis

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

# For each of the 9 lines:
lines_y = [
    (574, 657),
    (672, 755),
    (777, 849),
    (864, 947),
    (962, 1045),
    (1066, 1139),
    (1154, 1237),
    (1252, 1335),
    (1357, 1429)
]

for idx, (sy, ey) in enumerate(lines_y):
    # Find baseline: row near bottom of line that has maximum horizontal black/dimmed pixels
    row_counts = []
    for y in range(sy, ey + 1):
        cnt = 0
        for x in range(1650, 3700):
            offset = (y * width + x) * 4
            a = img_data[offset+3]
            if a > 40:
                cnt += 1
        row_counts.append((cnt, y))
    # Baseline is typically near the bottom before descenders
    # Let's inspect bottom rows with high density
    print(f"Line {idx+1}: Y={sy}..{ey}")

# Pitch between line starts:
pitches = [lines_y[i+1][0] - lines_y[i][0] for i in range(len(lines_y)-1)]
print("Pitches between lines:", pitches)
print("Average pitch (line height):", sum(pitches) / len(pitches))
