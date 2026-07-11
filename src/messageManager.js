const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const dataFile = path.join(dataDir, 'postedMessages.json');

// Đảm bảo thư mục data tồn tại
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Khởi tạo file nếu chưa có
if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([]));
}

function getPostedMessages() {
    try {
        const raw = fs.readFileSync(dataFile, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        return [];
    }
}

function savePostedMessages(msgIds) {
    fs.writeFileSync(dataFile, JSON.stringify(msgIds, null, 2));
}

module.exports = {
    getPostedMessages,
    savePostedMessages
};
