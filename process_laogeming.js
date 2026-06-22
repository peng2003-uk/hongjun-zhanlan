const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function removeWatermark(inputPath, outputPath) {
    const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width, height } = info;
    const out = Buffer.alloc(width * height * 4);

    // Calculate local median brightness (11x11 window)
    const localMedian = new Float32Array(width * height);
    for (let y = 5; y < height - 5; y++) {
        for (let x = 5; x < width - 5; x++) {
            const neighbors = [];
            for (let dy = -5; dy <= 5; dy++) {
                for (let dx = -5; dx <= 5; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const ni = ((y + dy) * width + (x + dx)) * 4;
                    if (data[ni + 3] < 100) continue;
                    neighbors.push(0.2126 * data[ni] + 0.7152 * data[ni + 1] + 0.0722 * data[ni + 2]);
                }
            }
            if (neighbors.length > 20) {
                neighbors.sort((a, b) => a - b);
                localMedian[y * width + x] = neighbors[Math.floor(neighbors.length / 2)];
            }
        }
    }

    let wmCount = 0, totalCount = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
            if (a < 100) { out[idx]=r;out[idx+1]=g;out[idx+2]=b;out[idx+3]=a; continue; }
            const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            const median = localMedian[y * width + x] || lum;
            const diff = lum - median;
            totalCount++;
            if (diff > 40 && lum > 100 && lum < 210 && median > 30) {
                const ratio = median / Math.max(lum, 1);
                out[idx]=Math.round(Math.min(255,r*ratio));out[idx+1]=Math.round(Math.min(255,g*ratio));
                out[idx+2]=Math.round(Math.min(255,b*ratio));out[idx+3]=255;
                wmCount++;
            } else {
                out[idx]=r; out[idx+1]=g; out[idx+2]=b; out[idx+3]=255;
            }
        }
    }
    await sharp(out, { raw: { width, height, channels: 4 } }).png().toFile(outputPath);
    console.log(`  ${path.basename(outputPath)}: wm=${wmCount} (${(wmCount/totalCount*100).toFixed(2)}%)`);
}

async function main() {
    const base = 'E:/红军文化展览/images';
    await removeWatermark(path.join(base, '老革命.png'), path.join(base, '老革命.png'));
    console.log('done');
}
main().catch(err => console.error(err));
