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

function formatProductsMessage(products) {
    if (!products || products.length === 0) {
        return "Hiện tại hệ thống không thể lấy được báo giá hoặc danh sách đang trống. Vui lòng thử lại sau.";
    }

    let message = "🔥 **BẢNG GIÁ ĐIỆN THOẠI & MACBOOK HÔM NAY** 🔥\n\n";

    products.forEach(row => {
        const stt = row["STT"] || row["STT "] || "";
        const ten = row["Tên sản phẩm"] || row["Tên sản phẩm "] || row["Ten"] || "";
        const tinh_trang = row["Tình trạng"] || row["Tình trạng "] || row["Tinh trang"] || "";
        let gia = row["Mức giá"] !== undefined ? row["Mức giá"] : (row["Mức giá "] !== undefined ? row["Mức giá "] : row["Gia"]);
        if (gia === undefined || gia === null) gia = "";

        if (!ten) return;

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

    message += "📞 Liên hệ trực tiếp để được tư vấn và chốt đơn nhanh nhất!";
    return message;
}

module.exports = {
    fetchProducts,
    formatProductsMessage
};
