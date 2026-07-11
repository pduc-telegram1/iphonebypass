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
                const text = "📜 **CHÍNH SÁCH BẢO HÀNH**\n\n🔹 **Máy Mới (New):** Bảo hành 12 tháng chính hãng (Apple, Samsung,...).\n🔹 **Máy Cũ (99%):** Bảo hành 6 tháng phần cứng, 1 đổi 1 trong 30 ngày đầu nếu có lỗi từ NSX.\n🔹 **Phụ kiện:** Bảo hành 3 tháng lỗi 1 đổi 1.\n\n*Lưu ý: Không bảo hành các trường hợp rơi vỡ, vào nước hoặc tự ý tháo lắp.*";
                await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...backMenuOptions });
            } 
            else if (data === "menu_thu_cu") {
                const text = "🔄 **CHÍNH SÁCH THU CŨ ĐỔI MỚI (TRADE-IN)**\n\nShop hỗ trợ thu lại máy cũ với giá tốt nhất thị trường để bạn lên đời máy mới.\n\n**Quy trình:**\n1. Mang máy trực tiếp đến cửa hàng hoặc gửi video tình trạng máy cho nhân viên.\n2. Shop báo giá thu mua.\n3. Bạn bù khoản chênh lệch (có hỗ trợ trả góp khoản bù).\n\nQuý khách có nhu cầu đổi trả sản phẩm vui lòng liên hệ trực tiếp nhân viên trong 30 ngày đầu.";
                await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...backMenuOptions });
            } 
            else if (data === "menu_lien_he") {
                const text = "💬 **GẶP NHÂN VIÊN TƯ VẤN**\n\nĐể được hỗ trợ nhanh nhất và gửi video thực tế sản phẩm, vui lòng liên hệ:\n\n👉 **Hotline/Zalo:** 0987.654.321 (Mr. Sale)\n👉 **Telegram:** @Sale_Manager_Username\n\nCảm ơn bạn đã quan tâm!";
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
