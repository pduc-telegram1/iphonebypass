const cron = require('node-cron');
const { fetchProducts, formatProductsMessage } = require('./googleSheets');

function setupScheduler(bot) {
    const channelId = process.env.TELEGRAM_CHANNEL_ID;
    const hour = parseInt(process.env.SCHEDULE_HOUR) || 9;
    const minute = parseInt(process.env.SCHEDULE_MINUTE) || 0;

    if (!channelId) {
        console.warn("CẢNH BÁO: Chưa thiết lập TELEGRAM_CHANNEL_ID, bỏ qua việc tự động đăng bài.");
        return;
    }

    // Thiết lập cron expression dựa trên cấu hình (Múi giờ local hoặc Asia/Ho_Chi_Minh)
    // node-cron định dạng: 'phút giờ ngày tháng thứ'
    const cronExpression = `${minute} ${hour} * * *`;

    console.log(`Đã thiết lập lịch đăng bài tự động vào ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} mỗi ngày (Cron: ${cronExpression}).`);

    cron.schedule(cronExpression, async () => {
        console.log("Bắt đầu lấy dữ liệu đăng bài hàng ngày...");
        try {
            const products = await fetchProducts();
            const message = formatProductsMessage(products);
            const finalMessage = "🌅 Chúc mọi người ngày mới năng lượng!\n\n" + message;

            await bot.sendMessage(channelId, finalMessage, { parse_mode: "Markdown" });
            console.log(`Đã đăng bài tự động thành công vào kênh ${channelId}`);
        } catch (error) {
            console.error(`Lỗi khi gửi bài đăng tự động vào ${channelId}:`, error.message);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Ho_Chi_Minh"
    });
}

module.exports = setupScheduler;
