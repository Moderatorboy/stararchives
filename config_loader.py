import os
from dotenv import load_dotenv

load_dotenv()

def get_env_var(key, required=True):
    value = os.getenv(key)
    if required and not value:
        raise ValueError(f"Missing required env var: {key}")
    return value

# Telegram Bot Config
TG_API_ID     = get_env_var("TG_API_ID")
TG_API_HASH   = get_env_var("TG_API_HASH")
TG_BOT_TOKEN  = get_env_var("TG_BOT_TOKEN")
TG_CHAT_ID    = get_env_var("TG_CHAT_ID")

# Archive.org Config
UPLOAD_TO_IA  = get_env_var("UPLOAD_TO_IA", required=False) == "True"
IA_ACCESS     = get_env_var("IA_ACCESS")
IA_SECRET     = get_env_var("IA_SECRET")
IA_COLLECTION = get_env_var("IA_COLLECTION")
IA_CREATOR    = get_env_var("IA_CREATOR")

# Optional
RANDOM_QUOTES = get_env_var("RANDOM_QUOTES", required=False) == "True"
