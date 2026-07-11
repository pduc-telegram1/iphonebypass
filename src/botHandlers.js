const { fetchProducts, formatProductsMessage } = require('./googleSheets');
const { addReputation, getTopReputation } = require('./reputation');

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

    // Lệnh /top
    bot.onText(/^\/top/, (msg) => {
        const chatId = msg.chat.id;
        const topUsers = getTopReputation(5);
        if (topUsers.length === 0) {
            bot.sendMessage(chatId, "🏆 Bảng xếp hạng hiện đang trống. Hãy tương tác để giành vị trí đầu tiên!");
            return;
        }
        
        let text = "🏆 **BẢNG XẾP HẠNG UY TÍN (TOP 5)** 🏆\n\n";
        const medals = ["🥇", "🥈", "🥉", "🏅", "🏅"];
        topUsers.forEach((u, i) => {
            text += `${medals[i]} **${u.name}**: ${u.points} điểm\n`;
        });
        
        bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
    });

    // Lệnh /start hoặc /menu
    bot.onText(/\/(start|menu)/, (msg) => {
        const chatId = msg.chat.id;
        const threadId = msg.message_thread_id; // Lấy ID của Topic
        const name = msg.from.first_name || "bạn";
        
        const welcomeText = `Xin chào ${name}! 👋\n\nChào mừng bạn đến với Shop Điện thoại & Macbook. Mình là trợ lý ảo, sẵn sàng phục vụ bạn 24/7.\n\nVui lòng chọn thông tin bạn cần tìm hiểu bên dưới:`;
        
        const options = { ...mainMenuOptions };
        if (threadId) {
            options.message_thread_id = threadId; // Chỉ định bot phải trả lời vào đúng Topic này
        }

        bot.sendMessage(chatId, welcomeText, options);
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
                
                // Phân loại báo giá theo Topic
                let filterStr = null;
                const threadId = query.message.message_thread_id;
                if (threadId === 2) {
                    filterStr = "iphone";
                } else if (threadId === 4) {
                    filterStr = "mac";
                }

                const text = formatProductsMessage(products, filterStr);

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

    // -----------------------------------------------------
    // TÍNH NĂNG CHÀO MỪNG THÀNH VIÊN MỚI
    // -----------------------------------------------------
    bot.on('new_chat_members', (msg) => {
        const chatId = msg.chat.id;
        const newMembers = msg.new_chat_members;
        
        newMembers.forEach(member => {
            if (member.is_bot) return; // Không chào bot
            
            const name = member.first_name || "bạn";
            const welcomeMsg = `🎉 Chào mừng [${name}](tg://user?id=${member.id}) đã tham gia cộng đồng CKTech!\n\n💡 Bạn có thể gõ lệnh /menu để xem bảng giá iPhone & MacBook cực sốt hôm nay nhé!`;
            
            bot.sendMessage(chatId, welcomeMsg, { parse_mode: "Markdown" }).then(sentMsg => {
                // Tự động xóa lời chào sau 60 giây để đỡ rác nhóm
                setTimeout(() => {
                    bot.deleteMessage(chatId, sentMsg.message_id).catch(() => {});
                }, 60000);
            }).catch(() => {});
        });
    });

    // -----------------------------------------------------
    // TÍNH NĂNG KIỂM DUYỆT NGÔN TỪ (AUTO-MODERATION)
    // -----------------------------------------------------
    const badWords = [
        "địt", "đm", "dcm", "lồn", "cặc", "vcl", "vl", "đĩ", "điếm", "phò", "đù má", "chó đẻ"
    ];

    bot.on('message', async (msg) => {
        if (!msg.text || msg.text.startsWith('/')) return;
        
        const chatId = msg.chat.id;
        const textLower = msg.text.toLowerCase();
        
        // Kiểm tra xem tin nhắn có chứa từ cấm không
        let isBad = false;
        for (const word of badWords) {
            // Dùng Regex để tìm từ cấm đứng độc lập (vd: "vl" vi phạm, nhưng "vly" thì không)
            const regex = new RegExp(`(?:^|\\s)${word}(?:\\s|$)`, 'i');
            if (regex.test(textLower) || textLower === word) {
                isBad = true;
                break;
            }
        }
        
        if (isBad) {
            try {
                // 1. Xóa tin nhắn rác
                await bot.deleteMessage(chatId, msg.message_id);
                
                // 2. Thông báo cảnh cáo
                const name = msg.from.first_name || "Bạn";
                const warningMsg = await bot.sendMessage(
                    chatId, 
                    `⚠️ **CẢNH BÁO VI PHẠM**\n[${name}](tg://user?id=${msg.from.id}) đã vi phạm nội quy nhóm vì sử dụng ngôn từ thô tục.\n\n🤐 Hình phạt: **Khóa chat 2 tiếng**!`,
                    { parse_mode: "Markdown" }
                );
                
                // Tự động xóa cảnh báo sau 15 giây
                setTimeout(() => {
                    bot.deleteMessage(chatId, warningMsg.message_id).catch(() => {});
                }, 15000);
                
                // 3. Khóa mõm (Restrict) 2 tiếng (7200 giây)
                const untilDate = Math.floor(Date.now() / 1000) + (2 * 60 * 60);
                await bot.restrictChatMember(chatId, msg.from.id, {
                    until_date: untilDate,
                    can_send_messages: false,
                    can_send_media_messages: false,
                    can_send_other_messages: false,
                    can_add_web_page_previews: false
                });
                
            } catch (error) {
                console.log("Lỗi khi xử lý bad words (có thể bot chưa làm Admin):", error.message);
            }
            return; // Dừng xử lý tiếp
        }

        // -----------------------------------------------------
        // HỆ THỐNG ANTI-SCAM (LỌC LINK)
        // -----------------------------------------------------
        const hasUrl = msg.entities && msg.entities.some(e => e.type === 'url' || e.type === 'text_link');
        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|\.com|\.vn|\.net|\.org)/i;
        
        if (hasUrl || urlRegex.test(textLower)) {
            // Cho phép các link phổ biến an toàn
            const isSafeLink = /(youtube\.com|youtu\.be|tiktok\.com|facebook\.com|fb\.com)/i.test(textLower);
            if (!isSafeLink) {
                try {
                    const memberInfo = await bot.getChatMember(chatId, msg.from.id);
                    const isAdmin = ['creator', 'administrator'].includes(memberInfo.status);
                    
                    if (!isAdmin) {
                        await bot.deleteMessage(chatId, msg.message_id);
                        const warning = await bot.sendMessage(chatId, `🚫 [${msg.from.first_name}](tg://user?id=${msg.from.id}) Vui lòng không gửi link lạ vào nhóm để bảo vệ an toàn cho cộng đồng!`, { parse_mode: "Markdown" });
                        setTimeout(() => bot.deleteMessage(chatId, warning.message_id).catch(()=>{}), 10000);
                        return; // Dừng xử lý tiếp
                    }
                } catch (e) { console.error("Lỗi kiểm tra admin:", e.message); }
            }
        }
        
        // -----------------------------------------------------
        // HỆ THỐNG ĐIỂM THƯỞNG (REPUTATION)
        // -----------------------------------------------------
        if (msg.reply_to_message && msg.reply_to_message.from) {
            const replyTo = msg.reply_to_message.from;
            // Không tự cộng điểm cho mình và không cộng điểm cho bot
            if (replyTo.id !== msg.from.id && !replyTo.is_bot) {
                const thanksWords = ["cảm ơn", "cám ơn", "cam on", "+1", "thanks", "tks"];
                const isThanks = thanksWords.some(w => textLower.includes(w));
                
                if (isThanks) {
                    const newPoints = addReputation(replyTo.id, replyTo.first_name);
                    bot.sendMessage(chatId, `🎉 **${replyTo.first_name}** vừa được cộng +1 Uy tín! (Tổng: ${newPoints} điểm) 🏆`, { 
                        parse_mode: "Markdown",
                        reply_to_message_id: msg.reply_to_message.message_id 
                    }).catch(()=>{});
                }
            }
        }
    });
}

module.exports = setupBotHandlers;
