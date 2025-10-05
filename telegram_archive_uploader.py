import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

# ----------------------------
# Environment Variables
# ----------------------------
TG_API_ID = int(os.getenv("TG_API_ID", 0))
TG_API_HASH = os.getenv("TG_API_HASH")
BOT_TOKEN = os.getenv("TG_BOT_TOKEN")
TG_CHAT_ID = os.getenv("TG_CHAT_ID")
UPLOAD_TO_IA = os.getenv("UPLOAD_TO_IA", "False").lower() == "true"
IA_ACCESS = os.getenv("IA_ACCESS")
IA_SECRET = os.getenv("IA_SECRET")
IA_COLLECTION = os.getenv("IA_COLLECTION")
IA_CREATOR = os.getenv("IA_CREATOR", "B2GPT")

# ----------------------------
# Folders
# ----------------------------
VIDEO_FOLDER = "uploads/videos"
PDF_FOLDER = "uploads/pdfs"
PLAYLIST_FILE = "playlist.json"
LOG_FOLDER = "logs"
os.makedirs(LOG_FOLDER, exist_ok=True)

# ----------------------------
# Helper Functions
# ----------------------------
def send_telegram_message(message):
    if not BOT_TOKEN or not TG_CHAT_ID:
        print("Telegram bot not configured.")
        return
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    params = {"chat_id": TG_CHAT_ID, "text": message}
    try:
        requests.get(url, params=params)
        print(f"[Telegram] Message sent: {message}")
    except Exception as e:
        print(f"[Telegram] Failed to send message: {e}")

def upload_to_archive(file_path, title):
    if not UPLOAD_TO_IA:
        return f"{VIDEO_FOLDER}/{os.path.basename(file_path)}" if file_path.endswith(('.mp4','.mkv','.webm')) else f"{PDF_FOLDER}/{os.path.basename(file_path)}"
    if not IA_ACCESS or not IA_SECRET or not IA_COLLECTION:
        print("[IA] Archive.org keys missing")
        return None

    print(f"[IA] Uploading {title}...")
    filename = os.path.basename(file_path)
    identifier = IA_COLLECTION
    url = f"https://s3.us.archive.org/{identifier}/{filename}"

    headers = {
        "x-archive-auto-make-bucket": "1",
        "x-archive-meta-title": title,
        "x-archive-meta-creator": IA_CREATOR,
        "x-archive-meta-collection": IA_COLLECTION,
        "x-archive-meta-mediatype": "movies" if file_path.endswith(('.mp4','.mkv','.webm')) else "texts"
    }

    try:
        with open(file_path, "rb") as f:
            r = requests.put(url, data=f, auth=(IA_ACCESS, IA_SECRET), headers=headers)
        if r.status_code in (200, 201):
            print(f"[IA] Uploaded successfully: {title}")
            return f"https://archive.org/download/{identifier}/{filename}"
        else:
            print(f"[IA] Upload failed ({r.status_code}): {r.text}")
            with open(f"{LOG_FOLDER}/error_log.txt", "a") as log:
                log.write(f"{title} failed: {r.status_code} → {r.text}\n")
            return None
    except Exception as e:
        print(f"[IA] Exception during upload: {e}")
        with open(f"{LOG_FOLDER}/error_log.txt", "a") as log:
            log.write(f"{title} exception: {e}\n")
        return None

def detect_files(folder, extensions):
    print(f"[Detect] Checking folder: {folder}")
    files = []
    for f in os.listdir(folder):
        if any(f.lower().endswith(ext) for ext in extensions):
            files.append(f)
            print(f"[Detect] Found: {f}")
    return files

# ----------------------------
# Main
# ----------------------------
def main():
    playlist = {}

    # Detect Videos
    video_files = detect_files(VIDEO_FOLDER, ['.mp4', '.mkv', '.webm'])
    playlist['videos'] = []

    for vf in video_files:
        file_path = os.path.join(VIDEO_FOLDER, vf)
        title = os.path.splitext(vf)[0]
        link = upload_to_archive(file_path, title)
        playlist['videos'].append({'title': title, 'link': link})

    # Detect PDFs
    pdf_files = detect_files(PDF_FOLDER, ['.pdf'])
    playlist['pdfs'] = []

    for pf in pdf_files:
        file_path = os.path.join(PDF_FOLDER, pf)
        title = os.path.splitext(pf)[0]
        link = upload_to_archive(file_path, title)
        playlist['pdfs'].append({'title': title, 'link': link})

    # Save playlist.json
    with open(PLAYLIST_FILE, 'w', encoding='utf-8') as f:
        json.dump(playlist, f, ensure_ascii=False, indent=4)
    print(f"[Main] playlist.json updated with {len(video_files)} videos and {len(pdf_files)} PDFs.")

    # Telegram Notification
    send_telegram_message(f"Playlist updated: {len(video_files)} videos, {len(pdf_files)} PDFs")

if __name__ == "__main__":
    main()
