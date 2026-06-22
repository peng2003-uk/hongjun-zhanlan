const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// 水印特征：亮度异常高于周围邻域的像素块
// 策略：扫描每个像素，对比其与局部邻域的中值，差异过大→水印→用邻域中值替换

async function removeWatermarkOnly(inputPath, outputPath) {
    const img = sharp(inputPath);
    const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width, height } = info;
    const out = Buffer.alloc(width * height * 4);

    // 先计算每个像素的局部亮度中值（5x5窗口采样）
    const localMedian = new Float32Array(width * height);
    for (let y = 2; y < height - 2; y++) {
        for (let x = 2; x < width - 2; x++) {
            const neighbors = [];
            for (let dy = -5; dy <= 5; dy++) {
                for (let dx = -5; dx <= 5; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const ni = ((y + dy) * width + (x + dx)) * 4;
                    if (data[ni + 3] < 100) continue;
                    neighbors.push(0.2126 * data[ni] + 0.7152 * data[ni + 1] + 0.0722 * data[ni + 2]);
                }
            }
            if (neighbors.length > 10) {
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

            if (a < 100) {
                out[idx] = r; out[idx + 1] = g; out[idx + 2] = b; out[idx + 3] = a;
                continue;
            }

            const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            const median = localMedian[y * width + x] || lum;
            const diff = lum - median;

            totalCount++;

            // 水印判断：像素比邻域中值亮40以上且在中等亮度区间(水印灰度范围)
            if (diff > 40 && lum > 100 && lum < 210 && median > 30) {
                // 这是水印像素 → 用邻域中值亮度替换（保持周围色调）
                const ratio = median / Math.max(lum, 1);
                const nr = Math.round(Math.min(255, r * ratio));
                const ng = Math.round(Math.min(255, g * ratio));
                const nb = Math.round(Math.min(255, b * ratio));
                out[idx] = nr; out[idx + 1] = ng; out[idx + 2] = nb; out[idx + 3] = 255;
                wmCount++;
            } else {
                out[idx] = r; out[idx + 1] = g; out[idx + 2] = b; out[idx + 3] = 255;
            }
        }
    }

    await sharp(out, { raw: { width, height, channels: 4 } }).png().toFile(outputPath);
    console.log(`  ${path.basename(outputPath)}: 水印替换=${wmCount} (${(wmCount/totalCount*100).toFixed(2)}%)`);
}

async function main() {
    const base = 'E:/红军文化展览/images';
    console.log('去水印中（保留原图效果）...');
    await removeWatermarkOnly(path.join(base, '被压迫的少年.png'), path.join(base, '被压迫的少年.png'));
    await removeWatermarkOnly(path.join(base, '于都河集结.png'), path.join(base, '于都河集结.png'));
    console.log('完成!');
}

main().catch(err => console.error(err));
