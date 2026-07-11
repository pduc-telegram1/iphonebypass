import requests
from config import GOOGLE_SCRIPT_URL

def fetch_products():
    """
    Đọc dữ liệu sản phẩm từ Google Sheets thông qua Web App URL của Google Apps Script.
    Trả về danh sách các dict chứa thông tin sản phẩm.
    """
    if not GOOGLE_SCRIPT_URL:
        print("Lỗi: GOOGLE_SCRIPT_URL chưa được thiết lập.")
        return []
        
    try:
        response = requests.get(GOOGLE_SCRIPT_URL)
        response.raise_for_status() # Kiểm tra lỗi HTTP
        data = response.json()
        return data
    except Exception as e:
        print(f"Lỗi đọc dữ liệu từ Apps Script API: {e}")
        return []

def format_products_message(products):
    """
    Chuyển đổi danh sách sản phẩm thành text để gửi qua Telegram.
    """
    if not products:
        return "Hiện tại hệ thống không thể lấy được báo giá hoặc danh sách đang trống. Vui lòng thử lại sau."
    
    message = "🔥 **BẢNG GIÁ ĐIỆN THOẠI & MACBOOK HÔM NAY** 🔥\n\n"
    
    for row in products:
        stt = row.get("STT", "")
        # Lấy giá trị theo tên cột. Cần đảm bảo tên cột trong Sheet đúng như dưới.
        ten = row.get("Tên sản phẩm", row.get("Ten", "Không xác định"))
        tinh_trang = row.get("Tình trạng", row.get("Tinh trang", ""))
        gia = row.get("Mức giá", row.get("Gia", ""))
        
        # Bỏ qua dòng trống
        if not ten:
            continue
            
        message += f"📱 **{ten}**\n"
        if tinh_trang:
            message += f"   ✨ Tình trạng: {tinh_trang}\n"
        if gia:
            message += f"   💰 Giá: {gia}\n"
        message += "\n"
        
    message += "📞 Liên hệ trực tiếp để được tư vấn và chốt đơn nhanh nhất!"
    return message
