import os
from dotenv import load_dotenv

# Tải các biến môi trường từ file .env
load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHANNEL_ID = os.getenv("TELEGRAM_CHANNEL_ID")

# URL của Google Apps Script (Web App)
GOOGLE_SCRIPT_URL = os.getenv("GOOGLE_SCRIPT_URL")

SCHEDULE_HOUR = int(os.getenv("SCHEDULE_HOUR", 9))
SCHEDULE_MINUTE = int(os.getenv("SCHEDULE_MINUTE", 0))

# Kiểm tra cảnh báo nếu thiếu biến quan trọng
if not TELEGRAM_BOT_TOKEN:
    print("WARNING: Chưa thiết lập TELEGRAM_BOT_TOKEN trong file .env")
if not GOOGLE_SCRIPT_URL:
    print("WARNING: Chưa thiết lập GOOGLE_SCRIPT_URL trong file .env. Bot sẽ không lấy được dữ liệu.")
