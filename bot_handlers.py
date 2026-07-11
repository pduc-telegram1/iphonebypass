from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes
from gsheets import fetch_products, format_products_message

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Xử lý lệnh /start, gửi lời chào và menu."""
    user = update.effective_user
    welcome_text = (
        f"Xin chào {user.first_name}! 👋\n\n"
        "Chào mừng bạn đến với Shop Điện thoại & Macbook. "
        "Mình là trợ lý ảo, sẵn sàng phục vụ bạn 24/7.\n\n"
        "Vui lòng chọn thông tin bạn cần tìm hiểu bên dưới:"
    )
    
    keyboard = [
        [InlineKeyboardButton("📱 Bảng giá hôm nay", callback_data="menu_bang_gia")],
        [InlineKeyboardButton("📜 Chính sách bảo hành", callback_data="menu_bao_hanh")],
        [InlineKeyboardButton("🔄 Thu cũ đổi mới & Đổi trả", callback_data="menu_thu_cu")],
        [InlineKeyboardButton("💬 Gặp nhân viên tư vấn", callback_data="menu_lien_he")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(welcome_text, reply_markup=reply_markup)

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Xử lý khi người dùng bấm vào các nút trên menu."""
    query = update.callback_query
    await query.answer() # Phản hồi lại Telegram để tắt icon loading trên nút
    
    data = query.data
    
    if data == "menu_bang_gia":
        await query.edit_message_text(text="Đang lấy báo giá mới nhất từ hệ thống, vui lòng đợi giây lát... ⏳")
        products = fetch_products()
        message = format_products_message(products)
        
        # Thêm nút Quay lại menu
        keyboard = [[InlineKeyboardButton("🔙 Quay lại Menu", callback_data="menu_back")]]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(text=message, reply_markup=reply_markup, parse_mode="Markdown")
        
    elif data == "menu_bao_hanh":
        text = (
            "📜 **CHÍNH SÁCH BẢO HÀNH**\n\n"
            "🔹 **Máy Mới (New):** Bảo hành 12 tháng chính hãng (Apple, Samsung,...).\n"
            "🔹 **Máy Cũ (99%):** Bảo hành 6 tháng phần cứng, 1 đổi 1 trong 30 ngày đầu nếu có lỗi từ NSX.\n"
            "🔹 **Phụ kiện:** Bảo hành 3 tháng lỗi 1 đổi 1.\n\n"
            "*Lưu ý: Không bảo hành các trường hợp rơi vỡ, vào nước hoặc tự ý tháo lắp.*"
        )
        keyboard = [[InlineKeyboardButton("🔙 Quay lại Menu", callback_data="menu_back")]]
        await query.edit_message_text(text=text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")
        
    elif data == "menu_thu_cu":
        text = (
            "🔄 **CHÍNH SÁCH THU CŨ ĐỔI MỚI (TRADE-IN)**\n\n"
            "Shop hỗ trợ thu lại máy cũ với giá tốt nhất thị trường để bạn lên đời máy mới.\n\n"
            "**Quy trình:**\n"
            "1. Mang máy trực tiếp đến cửa hàng hoặc gửi video tình trạng máy cho nhân viên.\n"
            "2. Shop báo giá thu mua.\n"
            "3. Bạn bù khoản chênh lệch (có hỗ trợ trả góp khoản bù).\n\n"
            "Quý khách có nhu cầu đổi trả sản phẩm vui lòng liên hệ trực tiếp nhân viên trong 30 ngày đầu."
        )
        keyboard = [[InlineKeyboardButton("🔙 Quay lại Menu", callback_data="menu_back")]]
        await query.edit_message_text(text=text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")
        
    elif data == "menu_lien_he":
        text = (
            "💬 **GẶP NHÂN VIÊN TƯ VẤN**\n\n"
            "Để được hỗ trợ nhanh nhất và gửi video thực tế sản phẩm, vui lòng liên hệ:\n\n"
            "👉 **Hotline/Zalo:** 0987.654.321 (Mr. Sale)\n"
            "👉 **Telegram:** @Sale_Manager_Username\n\n"
            "Cảm ơn bạn đã quan tâm!"
        )
        keyboard = [[InlineKeyboardButton("🔙 Quay lại Menu", callback_data="menu_back")]]
        await query.edit_message_text(text=text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")
        
    elif data == "menu_back":
        # Quay lại menu chính
        welcome_text = "Vui lòng chọn thông tin bạn cần tìm hiểu bên dưới:"
        keyboard = [
            [InlineKeyboardButton("📱 Bảng giá hôm nay", callback_data="menu_bang_gia")],
            [InlineKeyboardButton("📜 Chính sách bảo hành", callback_data="menu_bao_hanh")],
            [InlineKeyboardButton("🔄 Thu cũ đổi mới & Đổi trả", callback_data="menu_thu_cu")],
            [InlineKeyboardButton("💬 Gặp nhân viên tư vấn", callback_data="menu_lien_he")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await query.edit_message_text(text=welcome_text, reply_markup=reply_markup)
