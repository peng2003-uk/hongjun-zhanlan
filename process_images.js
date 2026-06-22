const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const TARGET_BG = { r: 242, g: 224, b: 192 }; // #F2E0C0
const SIL_COLOR = { r: 174, g: 161, b: 138 }; // #AEA18A

// 被压迫的少年：剪影 lum~40-120, 背景 lum~140+ → thLow=125 thHigh=150
// 于都河集结：剪影 lum~80-165, 背景 lum~175+ → thLow=165 thHigh=185
const configs = [
    { name: '被压迫的少年_原始.png', out: '被压迫的少年.png', lo: 125, hi: 155 },
    { name: '于都河集结_原始.png', out: '于都河集结.png', lo: 165, hi: 190 },
];

async function process(inputPath, outputPath, thLow, thHigh) {
    const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width, height } = info;
    const out = Buffer.alloc(width * height * 4);

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        const o = i;
        if (a < 150) {
            out[o] = TARGET_BG.r; out[o + 1] = TARGET_BG.g; out[o + 2] = TARGET_BG.b; out[o + 3] = 255;
        } else {
            const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            if (lum <= thLow) {
                out[o] = SIL_COLOR.r; out[o + 1] = SIL_COLOR.g; out[o + 2] = SIL_COLOR.b; out[o + 3] = 255;
            } else if (lum >= thHigh) {
                out[o] = TARGET_BG.r; out[o + 1] = TARGET_BG.g; out[o + 2] = TARGET_BG.b; out[o + 3] = 255;
            } else {
                const t = (lum - thLow) / (thHigh - thLow);
                out[o] = Math.round(SIL_COLOR.r * (1 - t) + TARGET_BG.r * t);
                out[o + 1] = Math.round(SIL_COLOR.g * (1 - t) + TARGET_BG.g * t);
                out[o + 2] = Math.round(SIL_COLOR.b * (1 - t) + TARGET_BG.b * t);
                out[o + 3] = 255;
            }
        }
    }

    await sharp(out, { raw: { width, height, channels: 4 } }).png().toFile(outputPath);

    // Verify
    const chk = await sharp(outputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let si = 0, bi = 0, mi = 0;
    for (let i = 0; i < chk.data.length; i += 4) {
        if (chk.data[i + 3] < 150) continue;
        const lum2 = 0.2126 * chk.data[i] + 0.7152 * chk.data[i + 1] + 0.0722 * chk.data[i + 2];
        if (lum2 < 166) si++;
        else if (lum2 > 215) bi++;
        else mi++;
    }
    console.log(`完成: ${path.basename(outputPath)} — 剪影:${si} 过渡:${mi} 背景:${bi} (thLow=${thLow} thHigh=${thHigh})`);
}

async function main() {
    const base = 'E:/红军文化展览/images';
    for (const c of configs) {
        await process(path.join(base, c.name), path.join(base, c.out), c.lo, c.hi);
    }
    console.log('全部完成!');
    fs.unlinkSync(path.join(base, '被压迫的少年_原始.png'));
    fs.unlinkSync(path.join(base, '于都河集结_原始.png'));
    fs.unlinkSync(path.join(base, '被压迫的少年_raw.png'));
}

main().catch(err => console.error(err));
