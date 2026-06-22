import subprocess, sys, importlib, os
try:
    from PIL import Image, ImageFilter, ImageEnhance
    print("PIL available")
except:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image, ImageFilter, ImageEnhance
    print("PIL installed and imported")

TARGET_BG = (242, 224, 192)  # #F2E0C0

def process_silhouette(input_path, output_path, target_color=TARGET_BG):
    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    pixels = img.load()

    # Step 1: Detect the background color by sampling edges
    edge_samples = []
    for x in range(0, w, max(1, w//50)):
        for y in range(0, h, max(1, h//50)):
            r, g, b, a = pixels[x, y]
            if a > 200 and (x < w*0.05 or x > w*0.95 or y < h*0.05 or y > h*0.95):
                edge_samples.append((r, g, b))

    # Step 2: Replace background with target color, keep black silhouette
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            lum = 0.2126*r + 0.7152*g + 0.0722*b
            if a < 150:
                pixels[x, y] = (target_color[0], target_color[1], target_color[2], 255)
            elif lum < 50:  # Pure black silhouette
                pixels[x, y] = (0, 0, 0, 255)  # Keep as pure black
            elif lum > 100:  # Bright background / watermark
                # Replace with target color
                pixels[x, y] = (target_color[0], target_color[1], target_color[2], 255)
            else:  # Transition - blend to target
                blend = (lum - 50) / 50.0  # 0 at lum=50, 1 at lum=100
                blend = max(0, min(1, blend))
                nr = int(0 * (1-blend) + target_color[0] * blend)
                ng = int(0 * (1-blend) + target_color[1] * blend)
                nb = int(0 * (1-blend) + target_color[2] * blend)
                pixels[x, y] = (nr, ng, nb, 255)

    img.save(output_path, "PNG")
    print(f"Done: {os.path.basename(input_path)} -> {os.path.basename(output_path)}")

# Process both images
base = r"E:\红军文化展览\images"
process_silhouette(
    os.path.join(base, "被压迫的少年.png"),
    os.path.join(base, "被压迫的少年.png")
)
process_silhouette(
    os.path.join(base, "于都河集结.png"),
    os.path.join(base, "于都河集结.png")
)
print("All done!")
