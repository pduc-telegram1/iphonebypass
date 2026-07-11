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

            await bot.sendMessage(channelId, finalMessage, { parse_mode: "Markdown" });
            console.log(`Đã đăng bài tự động thành công vào kênh ${channelId} lúc ${currentHour}h`);
        } catch (error) {
            console.error(`Lỗi khi gửi bài đăng tự động vào ${channelId}:`, error.message);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Ho_Chi_Minh"
    });
}

module.exports = setupScheduler;
