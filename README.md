# Telegram Sale Bot (Điện Thoại & Macbook)

Hệ thống Bot Telegram tự động hỗ trợ khách hàng 24/7 và đăng báo giá hàng ngày, lấy dữ liệu trực tiếp từ **Google Sheets** thông qua **Google Apps Script** (rất dễ cài đặt, không cần thao tác phức tạp trên Google Cloud).

## Hướng dẫn thiết lập & Chạy bot

### 1. Chuẩn bị (Prerequisites)
- Đã cài đặt **Python 3.8+**.
- Cài đặt các thư viện cần thiết:
  ```bash
  pip install -r requirements.txt
  ```

### 2. Thiết lập Telegram Bot
- Truy cập vào Telegram, tìm kiếm **@BotFather**.
- Gõ `/newbot` và làm theo hướng dẫn để tạo bot mới.
- Lưu lại chuỗi **API Token** (Tôi đã điền sẵn vào file `.env` cho bạn).
- Lấy Channel ID: Nếu bạn muốn bot tự động đăng bài, hãy thêm bot vào Channel làm **Admin**. Lấy ID của channel (VD: `@my_channel_sale`) điền vào `TELEGRAM_CHANNEL_ID` trong `.env`.

### 3. Tích hợp Google Sheets (Qua Google Apps Script)
Thay vì dùng Service Account phức tạp, chúng ta sẽ biến Google Sheet thành một API nhỏ.

**Bước 1: Chuẩn bị bảng tính**
1. Mở file Google Sheets chứa bảng giá của bạn.
2. Đảm bảo dòng 1 (dòng đầu tiên) chứa đúng các tiêu đề cột sau: `STT`, `Tên sản phẩm`, `Tình trạng`, `Mức giá`.

**Bước 2: Tạo Apps Script**
1. Trên menu của Google Sheets, chọn **Tiện ích mở rộng (Extensions)** -> **Apps Script**.
2. Xóa hết code cũ trong file `Mã.gs` và dán đoạn code sau vào:

```javascript
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  
  if (rows.length === 0) {
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var headers = rows[0];
  var data = [];
  
  for (var i = 1; i < rows.length; i++) {
    var rowData = rows[i];
    var obj = {};
    // Chỉ lấy những dòng có Tên sản phẩm
    if (rowData[1] !== "") { 
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = rowData[j];
      }
      data.push(obj);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

**Bước 3: Triển khai (Deploy)**
1. Bấm nút **Triển khai (Deploy)** màu xanh góc phải trên cùng -> **Cách triển khai mới (New deployment)**.
2. Bấm vào biểu tượng bánh răng bên cạnh "Chọn loại (Select type)" và chọn **Ứng dụng web (Web app)**.
3. Phần "Mô tả": nhập tùy ý (ví dụ: `v1`).
4. Phần "Thực thi với tư cách (Execute as)": Chọn **Tôi (Me)**.
5. Phần "Ai có quyền truy cập (Who has access)": Chuyển thành **Bất kỳ ai (Anyone)**.
6. Bấm **Triển khai**. Google sẽ yêu cầu bạn cấp quyền truy cập, hãy làm theo hướng dẫn (bấm Nâng cao -> Đi tới tệp không an toàn -> Cho phép).
7. Copy **URL ứng dụng web (Web app URL)** và dán vào biến `GOOGLE_SCRIPT_URL` trong file `.env` của bạn!

### 4. Chạy Bot
- Chạy lệnh sau để khởi động:
  ```bash
  python main.py
  ```

### 5. Đưa code lên Github & Deploy
- Code này có thể deploy lên **Render, Heroku, hoặc VPS**.
- **Lưu ý RẤT QUAN TRỌNG:** KHÔNG BAO GIỜ được commit file `.env` lên Github public để tránh lộ Token. Hệ thống đã có `.gitignore` để chặn việc này.
- Khi deploy lên nền tảng như Render/Heroku, bạn có thể truyền thẳng nội dung biến môi trường `TELEGRAM_BOT_TOKEN`, `GOOGLE_SCRIPT_URL` trên giao diện web của họ.
