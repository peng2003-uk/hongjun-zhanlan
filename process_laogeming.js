const sharp = require('sharp');
const path = require('path');

async function removeWatermark(inputPath, outputPath) {
    const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width, height } = info;
    const out = Buffer.alloc(width * height * 4);
    const localMedian = new Float32Array(width * height);
    for (let y = 5; y < height - 5; y++) {
        for (let x = 5; x < width - 5; x++) {
            const n = [];
            for (let dy = -5; dy <= 5; dy++) {
                for (let dx = -5; dx <= 5; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const ni = ((y + dy) * width + (x + dx)) * 4;
                    if (data[ni + 3] < 100) continue;
                    n.push(0.2126 * data[ni] + 0.7152 * data[ni + 1] + 0.0722 * data[ni + 2]);
                }
            }
            if (n.length > 20) { n.sort((a, b) => a - b); localMedian[y * width + x] = n[Math.floor(n.length / 2)]; }
        }
    }
    let wm = 0, tot = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
            if (a < 100) { out[i]=r;out[i+1]=g;out[i+2]=b;out[i+3]=a; continue; }
            const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            const m = localMedian[y * width + x] || lum;
            tot++;
            if ((lum - m) > 40 && lum > 100 && lum < 210 && m > 30) {
                const ratio = m / Math.max(lum, 1);
                out[i]=Math.round(Math.min(255,r*ratio)); out[i+1]=Math.round(Math.min(255,g*ratio));
                out[i+2]=Math.round(Math.min(255,b*ratio)); out[i+3]=255;
                wm++;
            } else { out[i]=r;out[i+1]=g;out[i+2]=b;out[i+3]=255; }
        }
    }
    await sharp(out, { raw: { width, height, channels: 4 } }).png().toFile(outputPath);
    console.log(`${path.basename(outputPath)}: wm=${wm} (${(wm/tot*100).toFixed(2)}%)`);
}

removeWatermark('E:/红军文化展览/images/老革命剪影.png', 'E:/红军文化展览/images/老革命剪影.png')
    .then(() => console.log('done')).catch(e => console.error(e));
