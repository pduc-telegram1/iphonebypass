const cron = require('node-cron');
const { fetchProducts, formatProductsMessage } = require('./googleSheets');

function setupScheduler(bot) {
    const channelId = process.env.TELEGRAM_CHANNEL_ID;
    if (!channelId) {
        console.warn("CẢNH BÁO: Chưa thiết lập TELEGRAM_CHANNEL_ID, bỏ qua việc tự động đăng bài.");
        return;
    }

    // Thiết lập cron expression: Chạy vào lúc 9h, 14h và 18h mỗi ngày
    const cronExpression = `0 9,14,18 * * *`;

    console.log(`Đã thiết lập lịch đăng bài tự động vào 9:00, 14:00 và 18:00 mỗi ngày (Cron: ${cronExpression}).`);

    cron.schedule(cronExpression, async () => {
        console.log("Bắt đầu lấy dữ liệu đăng bài tự động...");
        try {
            const products = await fetchProducts();
            const message = formatProductsMessage(products);
            
            // Tùy chỉnh lời chào theo thời gian thực (Múi giờ Việt Nam)
            const currentHour = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"})).getHours();
            let greeting = "";
            
            if (currentHour < 12) {
                greeting = "🌅 Chúc mọi người một ngày mới tràn đầy năng lượng!\n\n";
            } else if (currentHour < 17) {
                greeting = "☀️ Chào buổi chiều! Cập nhật ngay giá cực bốc đầu giờ chiều:\n\n";
            } else {
                greeting = "🌇 Báo giá ca tối! Chốt đơn lẹ nghỉ ngơi nào anh em:\n\n";
            }

            const finalMessage = greeting + message;

            // Nút bấm liên hệ đính kèm dưới bài đăng
            const postOptions = {
                parse_mode: "Markdown",
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [{ text: "💬 Gặp Chuyên viên Tư vấn (Mua hàng)", url: "https://t.me/ck_technologys" }]
                    ]
                })
            };

            await bot.sendMessage(channelId, finalMessage, postOptions);
            console.log(`Đã đăng bài tự động thành công vào kênh ${channelId} lúc ${currentHour}h`);
        } catch (error) {
            console.error(`Lỗi khi gửi bài đăng tự động vào ${channelId}:`, error.message);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Ho_Chi_Minh"
    });

    // -----------------------------------------------------
    // TỰ ĐỘNG ĐĂNG TIN TỨC CÔNG NGHỆ VÀO GROUP (10h SÁNG)
    // -----------------------------------------------------
    const newsCron = `0 10 * * *`;
    const GROUP_CHAT_ID = "-1003752982345";
    const NEWS_TOPIC_ID = 3;

    const { fetchLatestTechNews } = require('./newsFetcher');

    cron.schedule(newsCron, async () => {
        console.log("Bắt đầu kéo tin tức công nghệ...");
        try {
            const newsMsg = await fetchLatestTechNews();
            if (newsMsg) {
                await bot.sendMessage(GROUP_CHAT_ID, newsMsg, {
                    parse_mode: "Markdown",
                    message_thread_id: NEWS_TOPIC_ID
                });
                console.log("Đã đăng tin tức công nghệ vào Topic 3 thành công!");
            }
        } catch (error) {
            console.error("Lỗi khi đăng tin tức:", error.message);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Ho_Chi_Minh"
    });
}

module.exports = setupScheduler;
