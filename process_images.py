import subprocess, sys, os
try:
    from PIL import Image
    print("PIL available")
except:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image
    print("PIL installed")

# 导语页背景色 #F2E0C0
TARGET_BG = (242, 224, 192)
# 导语页剪影色：纯黑 + opacity 0.28 叠在 #F2E0C0 上的等效色
# 计算：0*0.28 + 242*0.72 = 174, 224*0.72 = 161, 192*0.72 = 138
SIL_COLOR = (174, 161, 138)  # #AEA18A

def process_silhouette(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    pixels = img.load()

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a < 150:
                # 透明像素 → 填充背景色
                pixels[x, y] = (*TARGET_BG, 255)
            else:
                lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
                if lum < 55:
                    # 黑色剪影 → 替换为导语页剪影色
                    pixels[x, y] = (*SIL_COLOR, 255)
                elif lum > 120:
                    # 亮色背景/水印 → 替换为导语页背景色
                    pixels[x, y] = (*TARGET_BG, 255)
                else:
                    # 过渡像素 → 按亮度在剪影色和背景色之间渐变
                    t = (lum - 55) / 65.0  # 0=剪影色, 1=背景色
                    t = max(0, min(1, t))
                    nr = int(SIL_COLOR[0] * (1 - t) + TARGET_BG[0] * t)
                    ng = int(SIL_COLOR[1] * (1 - t) + TARGET_BG[1] * t)
                    nb = int(SIL_COLOR[2] * (1 - t) + TARGET_BG[2] * t)
                    pixels[x, y] = (nr, ng, nb, 255)

    img.save(output_path, "PNG")
    print(f"完成: {os.path.basename(input_path)} ({w}x{h})")

base = r"E:\红军文化展览\images"
process_silhouette(os.path.join(base, "被压迫的少年.png"), os.path.join(base, "被压迫的少年.png"))
process_silhouette(os.path.join(base, "于都河集结.png"), os.path.join(base, "于都河集结.png"))
print("全部完成!")
