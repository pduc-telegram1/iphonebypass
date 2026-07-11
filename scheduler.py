from telegram.ext import ContextTypes
from gsheets import fetch_products, format_products_message
from config import TELEGRAM_CHANNEL_ID

async def daily_post_job(context: ContextTypes.DEFAULT_TYPE):
    """
    Hàm được gọi bởi scheduler mỗi ngày để đăng bài lên channel/group.
    """
    if not TELEGRAM_CHANNEL_ID:
        print("Không có TELEGRAM_CHANNEL_ID, bỏ qua việc tự động đăng bài.")
        return

    print("Bắt đầu lấy dữ liệu đăng bài hàng ngày...")
    products = fetch_products()
    message = format_products_message(products)
    
    # Thêm câu chào buổi sáng
    final_message = "🌅 Chúc mọi người ngày mới năng lượng!\n\n" + message
    
    try:
        await context.bot.send_message(
            chat_id=TELEGRAM_CHANNEL_ID,
            text=final_message,
            parse_mode="Markdown"
        )
        print(f"Đã đăng bài tự động thành công vào channel {TELEGRAM_CHANNEL_ID}")
    except Exception as e:
        print(f"Lỗi khi gửi bài đăng tự động: {e}")
