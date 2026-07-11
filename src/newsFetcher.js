const Parser = require('rss-parser');
const parser = new Parser();

async function fetchLatestTechNews() {
    try {
        const feed = await parser.parseURL('https://vnexpress.net/rss/so-hoa.rss');
        
        if (feed.items && feed.items.length > 0) {
            // Lấy tin tức mới nhất (tin đầu tiên)
            const latestItem = feed.items[0];
            
            // Xóa các thẻ HTML trong mô tả nếu có
            let snippet = latestItem.contentSnippet || latestItem.content || "";
            if (snippet.length > 200) {
                snippet = snippet.substring(0, 200) + "...";
            }
            
            return `📰 **TIN TỨC CÔNG NGHỆ HOT** 📰\n\n🔹 **[${latestItem.title}](${latestItem.link})**\n\n📝 _${snippet}_\n\n👉 Nhấn vào tiêu đề để đọc chi tiết!`;
        }
    } catch (error) {
        console.error("Lỗi khi kéo tin tức RSS:", error.message);
    }
    return null;
}

module.exports = { fetchLatestTechNews };
