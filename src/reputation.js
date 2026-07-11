const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const dataFile = path.join(dataDir, 'reputation.json');

// Tạo thư mục data nếu chưa có
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Khởi tạo file json nếu chưa có
if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify({}));
}

function getReputationData() {
    try {
        const raw = fs.readFileSync(dataFile, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        return {};
    }
}

function saveReputationData(data) {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function addReputation(userId, userName, points = 1) {
    const data = getReputationData();
    if (!data[userId]) {
        data[userId] = { name: userName, points: 0 };
    }
    // Luôn cập nhật tên mới nhất
    data[userId].name = userName;
    data[userId].points += points;
    saveReputationData(data);
    return data[userId].points;
}

function getTopReputation(limit = 5) {
    const data = getReputationData();
    const arr = Object.values(data).sort((a, b) => b.points - a.points);
    return arr.slice(0, limit);
}

module.exports = {
    addReputation,
    getTopReputation
};
