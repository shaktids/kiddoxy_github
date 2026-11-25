import os, random
from PIL import Image, ImageDraw, ImageFont
from moviepy import ImageClip, concatenate_videoclips, AudioFileClip, CompositeVideoClip
import numpy as np

# ================= SETTINGS =================
WIDTH, HEIGHT = 720, 1280

ROWS, COLS = 5, 5
BOX_SIZE = 110
ICON_SIZE = 105

DROP_FRAMES = 12
ANSWER_TIME = 3
ANSWER_DELAY = 16

VIDEO_COUNT = 1

OUTPUT_DIR = "output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ================= COLORS =================
COLORS = [
    (255, 0, 0),
    (0, 150, 255),
    (255, 180, 0),
    (0, 200, 100),
    (160, 32, 240)
]

# ================= IMAGES =================
IMAGE_SETS = [
    ("bheem.png", "doraemon.png"),
    ("car.png", "car1.png"),
    ("Truck.png", "Truck1.png"),

    (None, None)
]

# ================= VOICE =================
voice_path = "voice_kids.mp3"

# ================= SHAPE =================
def draw_shape(draw, shape, box, color):
    if shape == "circle":
        draw.ellipse(box, fill=color)
    elif shape == "rectangle":
        draw.rectangle(box, fill=color)
    else:
        draw.rounded_rectangle(box, radius=22, fill=color)

# ================= VIDEO =================
def create_video(idx):
    main_color = random.choice(COLORS)
    odd_color = random.choice([c for c in COLORS if c != main_color])
    shape_type = random.choice(["square", "circle", "rectangle"])
    img_main, img_odd = random.choice(IMAGE_SETS)

    MAIN_IMG = ODD_IMG = None
    if img_main:
        MAIN_IMG = Image.open(img_main).convert("RGBA").resize((ICON_SIZE, ICON_SIZE))
        ODD_IMG = Image.open(img_odd).convert("RGBA").resize((ICON_SIZE, ICON_SIZE))

    # ---------- BACKGROUND ----------
    bg = Image.open("bg1.png").convert("RGB").resize((WIDTH, HEIGHT))
    base = bg.copy()
    draw = ImageDraw.Draw(base)

    # ---------- GRID ----------
    positions = []
    GAP = 12
    cell = BOX_SIZE + GAP

    grid_width = COLS * BOX_SIZE + (COLS - 1) * GAP
    start_x = (WIDTH - grid_width) // 2 + BOX_SIZE // 2
    start_y = 290 + BOX_SIZE // 2

    for r in range(ROWS):
        for c in range(COLS):
            x = start_x + c * cell
            y = start_y + r * cell
            positions.append((x, y))

    odd_index = random.randint(0, len(positions) - 1)

    # ---------- DROP FRAMES ----------
    drop_frames = []

    for f in range(DROP_FRAMES):
        frame = base.copy()
        d = ImageDraw.Draw(frame)

        for i, (x, y) in enumerate(positions):
            if MAIN_IMG is None:
                color = odd_color if i == odd_index else main_color
                box = (
                    x - BOX_SIZE // 2,
                    y - BOX_SIZE // 2,
                    x + BOX_SIZE // 2,
                    y + BOX_SIZE // 2
                )
                draw_shape(d, shape_type, box, color)
            else:
                icon = ODD_IMG if i == odd_index else MAIN_IMG
                progress = (f + 1) / DROP_FRAMES
                iy = int(-120 + (y + 120) * progress)
                frame.paste(
                    icon,
                    (x - ICON_SIZE // 2, iy - ICON_SIZE // 2),
                    icon
                )

        path = f"{OUTPUT_DIR}/drop_{idx}_{f}.png"
        frame.save(path)
        drop_frames.append(ImageClip(path).with_duration(0.08))

    # ---------- QUESTION FRAME (NO TEXT) ----------
    q_img = frame.copy()
    q_path = f"{OUTPUT_DIR}/q_{idx}.png"
    q_img.save(q_path)

    # ---------- ANSWER FRAME (ONLY HIGHLIGHT) ----------
    ans = q_img.copy()
    da = ImageDraw.Draw(ans)

    ox, oy = positions[odd_index]
    da.rectangle(
        (ox - BOX_SIZE // 2 - 8, oy - BOX_SIZE // 2 - 8,
         ox + BOX_SIZE // 2 + 8, oy + BOX_SIZE // 2 + 8),
        outline=(0, 200, 0),
        width=6
    )

    ans_path = f"{OUTPUT_DIR}/ans_{idx}.png"
    ans.save(ans_path)

    # ---------- FINAL VIDEO ----------
    audio = AudioFileClip(voice_path)

    TOTAL_BASE_TIME = ANSWER_DELAY + DROP_FRAMES * 0.08

    base_video = concatenate_videoclips(
        drop_frames + [ImageClip(q_path).with_duration(TOTAL_BASE_TIME)]
    )

    answer_overlay = (
        ImageClip(ans_path)
        .with_start(DROP_FRAMES * 0.08 + ANSWER_DELAY)
        .with_duration(ANSWER_TIME)
    )

    final = CompositeVideoClip(
        [base_video, answer_overlay],
        size=(WIDTH, HEIGHT)
    ).with_audio(audio)

    final.write_videofile(
        f"{OUTPUT_DIR}/odd_one_{idx}.mp4",
        fps=30,
        audio_codec="aac"
    )

    final.close()
    audio.close()

# ================= RUN =================
for i in range(1, VIDEO_COUNT + 1):
    create_video(i)

print("✅ Videos generated successfully")
