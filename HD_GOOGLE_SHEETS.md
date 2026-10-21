# HƯỚNG DẪN KẾT NỐI FORM ĐẶT HÀNG VỚI GOOGLE SHEETS

Để mỗi khi khách bấm **"Xác Nhận Đặt Hàng"** thì thông tin đơn tự động nhảy vào Google Sheets (bảng tính của team), bạn chỉ cần làm theo 4 bước sau (mất khoảng 1-2 phút):

---

### Bước 1: Tạo bảng tính Google Sheets
1. Truy cập [Google Sheets](https://sheets.new) tạo một bảng tính mới.
2. Đặt tên trang tính là: **Đơn Hàng Mộc Sắc**.
3. Tại hàng đầu tiên (Row 1), tạo các tiêu đề cột như sau:
   - **A1**: Mã Đơn
   - **B1**: Thời Gian
   - **C1**: Họ Tên Khách Hàng
   - **D1**: Số Điện Thoại
   - **E1**: Địa Chỉ Nhận Hàng
   - **F1**: Mẫu Sản Phẩm
   - **G1**: Số Lượng
   - **H1**: Tổng Tiền (VNĐ)
   - **I1**: Phương Thức Thanh Toán
   - **J1**: Ghi Chú / Lời Chúc

---

### Bước 2: Dán mã Google Apps Script
1. Trên thanh menu của Google Sheets, chọn **Tiện ích mở rộng (Extensions)** -> **Apps Script**.
2. Xóa hết code mặc định trong ô soạn thảo và dán đoạn code sau vào:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.orderId || "",
      data.timestamp || new Date().toLocaleString("vi-VN"),
      data.customerName || "",
      "'" + (data.customerPhone || ""), // Dấu ' để giữ số 0 ở đầu SĐT
      data.customerAddress || "",
      data.productModel || "",
      data.quantity || 1,
      data.totalAmount || 0,
      data.paymentMethod || "",
      data.customerNote || ""
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

### Bước 3: Triển khai (Deploy Web App)
1. Ở góc trên bên phải màn hình Apps Script, bấm nút **Triển khai (Deploy)** -> **Tùy chọn triển khai mới (New deployment)**.
2. Bấm vào biểu tượng bánh răng ⚙️ (chọn loại), chọn **Ứng dụng web (Web app)**.
3. Cài đặt các mục:
   - **Mô tả (Description)**: Nhận đơn hàng Mộc Sắc.
   - **Thực thi dưới dạng (Execute as)**: Tôi (Email của bạn).
   - **Ai có quyền truy cập (Who has access)**: **Bất kỳ ai (Anyone)** *(Rất quan trọng để website gửi dữ liệu được)*.
4. Bấm **Triển khai (Deploy)**. Nếu Google yêu cầu cấp quyền, chọn *Cấp quyền (Authorize access)* -> *Nâng cao (Advanced)* -> *Đi tới (Go to Untitled project (unsafe))*.
5. Sao chép đường dẫn **URL ứng dụng web (Web App URL)** (có đuôi `/exec`).

---

### Bước 4: Dán URL vào mã nguồn website
Mở file [js/order.js](file:///d:/FA26_NguyenTrongNghia/EXE101/Mộc%20Sắc/js/order.js), tìm dòng:
```javascript
const GOOGLE_SHEET_WEBHOOK_URL = '';
```
Dán link URL bạn vừa sao chép vào giữa 2 dấu nháy đơn:
```javascript
const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbx.../exec';
```

*(Lưu ý: Ngay cả khi chưa gắn URL Google Sheets, hệ thống vẫn tự động lưu toàn bộ đơn hàng vào `localStorage` của trình duyệt để bạn không bao giờ bị mất đơn!)*
