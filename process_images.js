const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const TARGET_BG = { r: 242, g: 224, b: 192 }; // #F2E0C0

const jobs = [
    { raw: '被压迫的少年_raw.png', out: '被压迫的少年.png', lo: 125, hi: 150 },
    { raw: '于都河集结_raw.png', out: '于都河集结.png', lo: 165, hi: 185 },
];

async function process(inputPath, outputPath, lo, hi) {
    const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width, height } = info;
    const out = Buffer.alloc(width * height * 4);
    let black = 0, bg = 0, mid = 0;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        const o = i;
        const lum = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);

        if (a < 100) {
            out[o] = TARGET_BG.r; out[o + 1] = TARGET_BG.g; out[o + 2] = TARGET_BG.b; out[o + 3] = 255;
            bg++;
        } else if (lum <= lo) {
            out[o] = 0; out[o + 1] = 0; out[o + 2] = 0; out[o + 3] = 255;
            black++;
        } else if (lum >= hi) {
            out[o] = TARGET_BG.r; out[o + 1] = TARGET_BG.g; out[o + 2] = TARGET_BG.b; out[o + 3] = 255;
            bg++;
        } else {
            const t = (lum - lo) / (hi - lo);
            out[o] = Math.round(t * TARGET_BG.r);
            out[o + 1] = Math.round(t * TARGET_BG.g);
            out[o + 2] = Math.round(t * TARGET_BG.b);
            out[o + 3] = 255;
            mid++;
        }
    }

    await sharp(out, { raw: { width, height, channels: 4 } }).png().toFile(outputPath);
    const total = black + bg + mid;
    console.log(`${path.basename(outputPath)}: 纯黑=${black}(${(black/total*100).toFixed(1)}%) 过渡=${mid} 背景=${bg} lo=${lo} hi=${hi}`);
    return black;
}

async function main() {
    const base = 'E:/红军文化展览/images';
    for (const j of jobs) {
        const bk = await process(path.join(base, j.raw), path.join(base, j.out), j.lo, j.hi);
        if (bk < 100) console.log('  ⚠ 剪影像素极少，请检查原图或降低lo阈值');
    }
    console.log('完成!');
}

main().catch(err => console.error(err));
