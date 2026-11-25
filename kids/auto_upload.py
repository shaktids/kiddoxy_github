import os
import google.auth.transport.requests
import google.oauth2.credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# ================= CONFIG =================
CLIENT_SECRET_FILE = "client_secret.json"
SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]

OUTPUT_DIR = "output"              # Folder where videos are stored
UPLOADED_LOG = "uploaded.txt"      # Keeps track of uploaded videos

PRIVACY_STATUS = "public"          # public | unlisted | private
CATEGORY_ID = "27"                 # Education

# ================= AUTH =================
def get_authenticated_service():
    creds = None

    if os.path.exists("token.json"):
        creds = google.oauth2.credentials.Credentials.from_authorized_user_file(
            "token.json", SCOPES
        )

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(google.auth.transport.requests.Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                CLIENT_SECRET_FILE, SCOPES
            )
            creds = flow.run_local_server(port=0)

        with open("token.json", "w") as f:
            f.write(creds.to_json())

    return build("youtube", "v3", credentials=creds)

# ================= HELPERS =================
def get_uploaded_set():
    if not os.path.exists(UPLOADED_LOG):
        return set()
    with open(UPLOADED_LOG, "r") as f:
        return set(line.strip() for line in f.readlines())

def mark_uploaded(filename):
    with open(UPLOADED_LOG, "a") as f:
        f.write(filename + "\n")

def get_next_video():
    uploaded = get_uploaded_set()

    videos = [
        f for f in os.listdir(OUTPUT_DIR)
        if f.endswith(".mp4") and f not in uploaded
    ]

    if not videos:
        return None

    # Upload oldest video first
    videos.sort(key=lambda x: os.path.getctime(os.path.join(OUTPUT_DIR, x)))
    return videos[0]

# ================= METADATA =================
TITLE = "Find the Odd One Out 🧠👀 | Fun Brain Puzzle for Kids | Spot the Difference #Shorts"

DESCRIPTION = """
Welcome to a fun, colorful, and brain-boosting kids puzzle video 🎉🧠

In this exciting “Find the Odd One Out” game, children are challenged to carefully observe images and spot the one item that is different from the rest.

This video is specially designed for toddlers, preschool kids, and early learners to improve observation skills, logical thinking, focus, and memory — all while having fun!

🧠 WHY ODD ONE OUT GAMES ARE GREAT FOR KIDS
Odd one out puzzles help children develop visual recognition, problem-solving skills, critical thinking, attention span, and pattern recognition.

🎨 WHAT’S INSIDE THIS VIDEO?
✔ Cute cartoon images
✔ Kid-friendly animals & objects
✔ Clean white background for easy viewing
✔ Simple and engaging puzzles
✔ Perfect Shorts format

👨‍👩‍👧 PERFECT FOR PARENTS & TEACHERS
Ideal for home learning, classrooms, homeschooling, and educational screen time.

📱 SHORTS FORMAT
Short, engaging, replay-friendly content made specially for YouTube Shorts.

🧩 HOW TO PLAY
1. Look carefully at the images
2. Find the one that is different
3. Think before the answer appears
4. Celebrate your win 🎉

❤️ SAFE & KID-FRIENDLY
✔ No violence
✔ No scary content
✔ Made for kids
✔ COPPA compliant

👍 LIKE | 💬 COMMENT | 🔔 SUBSCRIBE
We upload daily kids brain games and puzzles.

Thank you for watching and learning with us 💖

#oddoneout #kidspuzzle #kidslearning #brainpuzzle #shorts #educationalvideos
"""

TAGS = [
    "odd one out",
    "kids puzzle",
    "brain game for kids",
    "kids learning",
    "educational shorts",
    "kids shorts",
    "find the odd one",
    "spot the difference",
    "kids brain training",
    "learning games for kids",
    "preschool learning",
    "toddlers learning",
    "made for kids"
]

# ================= UPLOAD =================
def upload_video(video_file):
    youtube = get_authenticated_service()

    request_body = {
        "snippet": {
            "title": TITLE,
            "description": DESCRIPTION,
            "categoryId": CATEGORY_ID,
            "tags": TAGS
        },
        "status": {
            "privacyStatus": PRIVACY_STATUS,
            "selfDeclaredMadeForKids": True
        }
    }

    media = MediaFileUpload(
        os.path.join(OUTPUT_DIR, video_file),
        mimetype="video/mp4",
        resumable=True
    )

    request = youtube.videos().insert(
        part="snippet,status",
        body=request_body,
        media_body=media
    )

    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            print(f"⬆ Uploading {video_file}: {int(status.progress() * 100)}%")

    print(f"✅ Uploaded successfully: {video_file}")
    mark_uploaded(video_file)

# ================= RUN =================
def main():
    video = get_next_video()

    if not video:
        print("⚠ No new videos to upload")
        return

    upload_video(video)

if __name__ == "__main__":
    main()
