import datetime
import pytz
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler
from config import TELEGRAM_BOT_TOKEN, SCHEDULE_HOUR, SCHEDULE_MINUTE
from bot_handlers import start_command, button_callback
from scheduler import daily_post_job

def main():
    if not TELEGRAM_BOT_TOKEN:
        print("LỖI: Chưa có TELEGRAM_BOT_TOKEN. Hãy kiểm tra file .env")
        return

    print("Đang khởi động bot...")
    
    # Tạo ứng dụng bot
    app = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()
    
    # Thêm các handler xử lý lệnh và nút bấm
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CallbackQueryHandler(button_callback))
    
    # Thiết lập Job Queue (đăng bài tự động)
    job_queue = app.job_queue
    
    # Múi giờ Việt Nam
    tz = pytz.timezone('Asia/Ho_Chi_Minh')
    
    # Thời gian chạy mỗi ngày (ví dụ 09:00 sáng)
    time_to_run = datetime.time(hour=SCHEDULE_HOUR, minute=SCHEDULE_MINUTE, tzinfo=tz)
    
    job_queue.run_daily(
        daily_post_job,
        time=time_to_run,
        name="daily_post"
    )
    
    print(f"Đã thiết lập lịch đăng bài tự động vào {SCHEDULE_HOUR:02d}:{SCHEDULE_MINUTE:02d} mỗi ngày.")
    print("Bot đang chạy! Bấm Ctrl+C để dừng.")
    
    # Bắt đầu chạy bot bằng polling
    app.run_polling()

if __name__ == '__main__':
    main()
