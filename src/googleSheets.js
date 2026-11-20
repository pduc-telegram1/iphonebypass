const axios = require('axios');

async function fetchProducts() {
    const url = process.env.GOOGLE_SCRIPT_URL;
    if (!url) {
        console.error("Lỗi: Chưa thiết lập GOOGLE_SCRIPT_URL trong file .env");
        return [];
    }

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi đọc dữ liệu từ Apps Script API:", error.message);
        return [];
    }
}

function formatProductsMessage(products, filterKeyword = null) {
    if (!products || products.length === 0) {
        return "Hiện tại hệ thống không thể lấy được báo giá hoặc danh sách đang trống. Vui lòng thử lại sau.";
    }

    let title = "🔥 **BẢNG GIÁ ĐIỆN THOẠI & MACBOOK HÔM NAY** 🔥";
    if (filterKeyword && filterKeyword.toLowerCase() === "iphone") title = "📱 **BẢNG GIÁ IPHONE HÔM NAY** 📱";
    if (filterKeyword && filterKeyword.toLowerCase().includes("mac")) title = "💻 **BẢNG GIÁ MACBOOK HÔM NAY** 💻";
    
    // Lấy ngày hiện tại theo múi giờ Việt Nam (định dạng DD/MM/YYYY)
    const today = new Date().toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
    
    let message = `${title}\n📅 **Ngày cập nhật:** ${today}\n\n`;
    let hasProducts = false;

    products.forEach(row => {
        const stt = row["STT"] || row["STT "] || "";
        const ten = row["Tên sản phẩm"] || row["Tên sản phẩm "] || row["Ten"] || "";
        const tinh_trang = row["Tình trạng"] || row["Tình trạng "] || row["Tinh trang"] || "";
        let gia = row["Mức giá"] !== undefined ? row["Mức giá"] : (row["Mức giá "] !== undefined ? row["Mức giá "] : row["Gia"]);
        if (gia === undefined || gia === null) gia = "";

        if (!ten) return;

        // Lọc theo từ khóa (nếu có)
        if (filterKeyword) {
            const tenLower = ten.toLowerCase();
            if (!tenLower.includes(filterKeyword.toLowerCase())) {
                return;
            }
        }

        hasProducts = true;

        // Xử lý giá tiền
        let displayGia = gia;
        let numericGia = String(gia).replace(/[,.]/g, '').trim();
        
        if (numericGia === "0" || gia === 0) {
            displayGia = "Hết hàng 🔴";
        } else if (/^\d+$/.test(numericGia)) {
            let num = parseInt(numericGia, 10);
            displayGia = num.toLocaleString('vi-VN') + " VNĐ";
        } else if (gia !== "") {
            displayGia = gia;
        }

        message += `📱 **${ten}**\n`;
        if (tinh_trang) message += `   ✨ Tình trạng: ${tinh_trang}\n`;
        if (displayGia !== "") message += `   💰 Giá: ${displayGia}\n`;
        message += "\n";
    });

    if (!hasProducts) {
        return "Hiện tại không có sản phẩm nào thuộc danh mục này trong bảng giá.";
    }

    message += "➖➖➖➖➖➖➖➖➖➖\n";
    message += "🏪 **CKTech - Uy Tín Tạo Niềm Tin**\n";
    message += "📞 Liên hệ: 0868 073 024\n";
    message += "💬 Telegram: @ck\\_technologys\n";
    return message;
}

module.exports = {
    fetchProducts,
    formatProductsMessage
};
