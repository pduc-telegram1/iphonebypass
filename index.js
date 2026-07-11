require('dotenv').config();
const http = require('http');
const TelegramBot = require('node-telegram-bot-api');
const setupBotHandlers = require('./src/botHandlers');
const setupScheduler = require('./src/scheduler');

// Kiểm tra biến môi trường
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
    console.error("LỖI: Chưa có TELEGRAM_BOT_TOKEN. Hãy kiểm tra file .env");
    process.exit(1);
}

// Khởi tạo Telegram Bot (sử dụng chế độ polling)
const bot = new TelegramBot(token, { polling: true });

// Bắt lỗi chung của polling
bot.on("polling_error", (error) => console.log("Lỗi Polling:", error.message));

// Thiết lập Handlers và Scheduler
setupBotHandlers(bot);
setupScheduler(bot);

console.log("Bot đang chạy! Bấm Ctrl+C để dừng.");

// --- DUMMY SERVER CHO RENDER ---
const port = process.env.PORT || 8080;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running on Node.js!\n');
});

server.listen(port, () => {
    console.log(`Dummy server đang lắng nghe trên port ${port}`);
});
// -------------------------------
