import os
import datetime
import pytz
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler
from config import TELEGRAM_BOT_TOKEN, SCHEDULE_HOUR, SCHEDULE_MINUTE
from bot_handlers import start_command, button_callback
from scheduler import daily_post_job

# --- DUMMY SERVER CHO RENDER ---
class DummyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write(b"Bot is running!")

def run_dummy_server():
    port = int(os.environ.get("PORT", 8080))
    server = HTTPServer(('0.0.0.0', port), DummyHandler)
    server.serve_forever()
# -------------------------------

def main():
    if not TELEGRAM_BOT_TOKEN:
        print("LỖI: Chưa có TELEGRAM_BOT_TOKEN. Hãy kiểm tra biến môi trường.")
        return

    # Chạy dummy web server ở một thread riêng để Render không báo lỗi
    threading.Thread(target=run_dummy_server, daemon=True).start()

    print("Đang khởi động bot...")
    app = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()
    
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CallbackQueryHandler(button_callback))
    
    job_queue = app.job_queue
    tz = pytz.timezone('Asia/Ho_Chi_Minh')
    time_to_run = datetime.time(hour=SCHEDULE_HOUR, minute=SCHEDULE_MINUTE, tzinfo=tz)
    
    job_queue.run_daily(daily_post_job, time=time_to_run, name="daily_post")
    
    print(f"Đã thiết lập lịch đăng bài tự động vào {SCHEDULE_HOUR:02d}:{SCHEDULE_MINUTE:02d} mỗi ngày.")
    print("Bot đang chạy! Bấm Ctrl+C để dừng.")
    
    app.run_polling()

if __name__ == '__main__':
    main()
