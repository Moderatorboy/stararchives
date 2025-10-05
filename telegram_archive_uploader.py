from dotenv import load_dotenv
import os
from telethon import TelegramClient
import requests
import json
from tqdm import tqdm

# Load environment variables
load_dotenv()

TG_API_ID = int(os.getenv("TG_API_ID"))
TG_API_HASH = os.getenv("TG_API_HASH")
BOT_TOKEN = os.getenv("TG_BOT_TOKEN")
TG_CHAT_ID = os.getenv("TG_CHAT_ID")

IA_ACCESS = os.getenv("IA_ACCESS")
IA_SECRET = os.getenv("IA_SECRET")
IA_COLLECTION = os.getenv("IA_COLLECTION")
IA_CREATOR = os.getenv("IA_CREATOR")
UPLOAD_TO_IA = os.getenv("UPLOAD_TO_IA") == "True"

# Initialize Telegram client
client = TelegramClient('session_name', TG_API_ID, TG_API_HASH)

# Folders
VIDEO_FOLDER = "uploads/videos"
PDF_FOLDER = "uploads/pdfs"

# Load existing playlist.json or create new
if os.path.exists("playlist.json"):
    with open("playlist.json", "r") as f:
        playlist = json.load(f)
else:
    playlist = {}

# Functions:
# - Download videos & PDFs from Telegram
# - Detect manual files in uploads/
# - Upload to Archive.org (if UPLOAD_TO_IA=True)
# - Update playlist.json automatically

# Example usage:
# client.start()
# download_from_telegram()
# upload_to_archive()
# update_playlist_json()
