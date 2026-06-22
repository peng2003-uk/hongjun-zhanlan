const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const TARGET_BG = { r: 242, g: 224, b: 192 }; // #F2E0C0

const configs = [
    { raw: '被压迫的少年_raw.png', out: '被压迫的少年.png', thresh: 110 },
    { raw: '于都河集结_raw.png', out: '于都河集结.png', thresh: 158 },
];

async function process(inputPath, outputPath, threshold) {
    const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width, height } = info;
    const out = Buffer.alloc(width * height * 4);
    let silCount = 0, bgCount = 0;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        const o = i;
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        if (a < 100) {
            out[o] = TARGET_BG.r; out[o + 1] = TARGET_BG.g; out[o + 2] = TARGET_BG.b; out[o + 3] = 255;
            bgCount++;
        } else if (lum <= threshold) {
            out[o] = 0; out[o + 1] = 0; out[o + 2] = 0; out[o + 3] = 255;
            silCount++;
        } else {
            out[o] = TARGET_BG.r; out[o + 1] = TARGET_BG.g; out[o + 2] = TARGET_BG.b; out[o + 3] = 255;
            bgCount++;
        }
    }

    await sharp(out, { raw: { width, height, channels: 4 } }).png().toFile(outputPath);
    console.log(`${path.basename(outputPath)}: 剪影=${silCount}({(silCount/(silCount+bgCount)*100).toFixed(1)}%) 背景=${bgCount} 阈值=${threshold}`);
}

async function main() {
    const base = 'E:/红军文化展览/images';
    for (const c of configs) {
        await process(path.join(base, c.raw), path.join(base, c.out), c.thresh);
    }
    console.log('完成!');
}

main().catch(err => console.error(err));
