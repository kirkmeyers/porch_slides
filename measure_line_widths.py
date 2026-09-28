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

# For line 1 (Y from 574 to 650):
# Find min X and max X of black text:
l1_xs = []
for y in range(574, 650):
    for x in range(1600, 3800):
        offset = (y * width + x) * 4
        a = img_data[offset+3]
        if a > 50:
            l1_xs.append(x)

print(f"Line 1 X: min={min(l1_xs)}, max={max(l1_xs)}, width={max(l1_xs)-min(l1_xs)}")

# For line 2 (Y from 672 to 750):
l2_xs = []
for y in range(672, 750):
    for x in range(1600, 3800):
        offset = (y * width + x) * 4
        a = img_data[offset+3]
        if a > 50:
            l2_xs.append(x)

print(f"Line 2 X: min={min(l2_xs)}, max={max(l2_xs)}, width={max(l2_xs)-min(l2_xs)}")

# For all 9 lines:
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

for i, (sy, ey) in enumerate(lines_y):
    xs = []
    for y in range(sy, ey+1):
        for x in range(1600, 3800):
            offset = (y * width + x) * 4
            if img_data[offset+3] > 50:
                xs.append(x)
    print(f"Line {i+1}: min_x={min(xs)}, max_x={max(xs)}, width={max(xs)-min(xs)}")
