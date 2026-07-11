const { fetchProducts, formatProductsMessage } = require('./googleSheets');

function setupBotHandlers(bot) {
    const mainMenuOptions = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: "📱 Bảng giá hôm nay", callback_data: "menu_bang_gia" }],
                [{ text: "📜 Chính sách bảo hành", callback_data: "menu_bao_hanh" }],
                [{ text: "🔄 Thu cũ đổi mới & Đổi trả", callback_data: "menu_thu_cu" }],
                [{ text: "💬 Gặp nhân viên tư vấn", callback_data: "menu_lien_he" }]
            ]
        }),
        parse_mode: "Markdown"
    };

    const backMenuOptions = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: "🔙 Quay lại Menu", callback_data: "menu_back" }]
            ]
        }),
        parse_mode: "Markdown"
    };

    // Lệnh /start hoặc /menu
    bot.onText(/\/(start|menu)/, (msg) => {
        const chatId = msg.chat.id;
        const name = msg.from.first_name || "bạn";
        
        const welcomeText = `Xin chào ${name}! 👋\n\nChào mừng bạn đến với Shop Điện thoại & Macbook. Mình là trợ lý ảo, sẵn sàng phục vụ bạn 24/7.\n\nVui lòng chọn thông tin bạn cần tìm hiểu bên dưới:`;
        bot.sendMessage(chatId, welcomeText, mainMenuOptions);
    });

    // Xử lý các nút bấm Inline Keyboard
    bot.on('callback_query', async (query) => {
        const chatId = query.message.chat.id;
        const messageId = query.message.message_id;
        const data = query.data;

        // Trả lời callback_query để tắt icon loading trên Telegram
        bot.answerCallbackQuery(query.id);

        try {
            if (data === "menu_bang_gia") {
                await bot.editMessageText("Đang lấy báo giá mới nhất từ hệ thống, vui lòng đợi giây lát... ⏳", {
                    chat_id: chatId,
                    message_id: messageId
                });

                const products = await fetchProducts();
                const text = formatProductsMessage(products);

                await bot.editMessageText(text, {
                    chat_id: chatId,
                    message_id: messageId,
                    ...backMenuOptions
                });
            } 
            else if (data === "menu_bao_hanh") {
                const text = "📜 **CHÍNH SÁCH BẢO HÀNH**\n\n🔹 **Máy Mới (New):** Bảo hành 12 tháng chính hãng.\n🔹 **Máy Cũ (99%):**\n  - Bảo hành 6 tháng phần cứng.\n  - 1 đổi 1 trong 30 ngày đầu nếu có bất kỳ lỗi nào từ NSX.\n  - Nguồn và màn hình: Bao test 7 ngày đầu.\n🔹 **Phụ kiện:** Bảo hành 3 tháng lỗi 1 đổi 1.\n\n*Lưu ý: Không bảo hành các trường hợp máy rơi vỡ, cấn móp, vào nước hoặc tự ý tháo mở, mất tem.*";
                await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...backMenuOptions });
            } 
            else if (data === "menu_thu_cu") {
                const text = "🔄 **THU CŨ ĐỔI MỚI & ĐỔI TRẢ**\n\n**1. Chính sách Đổi trả máy cũ:**\n- Hỗ trợ đổi trả miễn phí trong 30 ngày đầu tiên nếu máy phát sinh lỗi từ NSX.\n- Sau 30 ngày: Hỗ trợ thu mua lại máy với mức chiết khấu hợp lý theo giá thị trường hiện tại.\n\n**2. Thu cũ lên đời:**\n- Thu mua máy cũ giá cao để quý khách lên đời máy mới.\n- Chỉ cần gửi ảnh/video thực trạng máy cho chuyên viên để nhận báo giá ngay!\n- Hỗ trợ quẹt thẻ/trả góp phần tiền bù chênh lệch.";
                await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...backMenuOptions });
            } 
            else if (data === "menu_lien_he") {
                const text = "💬 **GẶP CHUYÊN VIÊN TƯ VẤN**\n\nĐể được tư vấn chi tiết, nhận báo giá chuẩn xác và xem hình ảnh thực tế của sản phẩm, quý khách vui lòng liên hệ trực tiếp:\n\n👉 **Chuyên viên Telegram:** @ck_technologys\n\nRất hân hạnh được phục vụ quý khách!";
                await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...backMenuOptions });
            } 
            else if (data === "menu_back") {
                const welcomeText = "Vui lòng chọn thông tin bạn cần tìm hiểu bên dưới:";
                await bot.editMessageText(welcomeText, { chat_id: chatId, message_id: messageId, ...mainMenuOptions });
            }
        } catch (error) {
            console.error("Lỗi khi edit message:", error);
        }
    });
}

module.exports = setupBotHandlers;
