const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const TARGET_BG = { r: 242, g: 224, b: 192 };
const SIL_COLOR = { r: 174, g: 161, b: 138 };

async function processSilhouette(inputPath, outputPath) {
    const { data, info } = await sharp(inputPath)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const { width, height } = info;
    const outPixels = Buffer.alloc(width * height * 4);

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        const outIdx = i;

        if (a < 150) {
            outPixels[outIdx] = TARGET_BG.r;
            outPixels[outIdx + 1] = TARGET_BG.g;
            outPixels[outIdx + 2] = TARGET_BG.b;
            outPixels[outIdx + 3] = 255;
        } else {
            const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            if (lum < 50) {
                outPixels[outIdx] = SIL_COLOR.r;
                outPixels[outIdx + 1] = SIL_COLOR.g;
                outPixels[outIdx + 2] = SIL_COLOR.b;
                outPixels[outIdx + 3] = 255;
            } else if (lum > 110) {
                outPixels[outIdx] = TARGET_BG.r;
                outPixels[outIdx + 1] = TARGET_BG.g;
                outPixels[outIdx + 2] = TARGET_BG.b;
                outPixels[outIdx + 3] = 255;
            } else {
                const t = Math.max(0, Math.min(1, (lum - 50) / 60));
                outPixels[outIdx] = Math.round(SIL_COLOR.r * (1 - t) + TARGET_BG.r * t);
                outPixels[outIdx + 1] = Math.round(SIL_COLOR.g * (1 - t) + TARGET_BG.g * t);
                outPixels[outIdx + 2] = Math.round(SIL_COLOR.b * (1 - t) + TARGET_BG.b * t);
                outPixels[outIdx + 3] = 255;
            }
        }
    }

    await sharp(outPixels, { raw: { width, height, channels: 4 } })
        .png({ compressionLevel: 9 })
        .toFile(outputPath);

    const newSize = fs.statSync(outputPath).size;
    console.log(`完成: ${path.basename(outputPath)} (${(newSize / 1024).toFixed(0)} KB)`);
}

async function main() {
    const base = 'E:/红军文化展览/images';
    await processSilhouette(
        path.join(base, '被压迫的少年_原始.png'),
        path.join(base, '被压迫的少年.png')
    );
    await processSilhouette(
        path.join(base, '于都河集结_原始.png'),
        path.join(base, '于都河集结.png')
    );
    console.log('全部完成!');
    // Clean up temp files
    fs.unlinkSync(path.join(base, '被压迫的少年_原始.png'));
    fs.unlinkSync(path.join(base, '于都河集结_原始.png'));
}

main().catch(err => console.error('错误:', err.message));
