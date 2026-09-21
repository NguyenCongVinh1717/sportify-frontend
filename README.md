# 🏆 Sportify Style - Frontend E-Commerce Platform

> **Sportify Style** là hệ thống giao diện thương mại điện tử chuyên cung cấp quần áo, giày dép và dụng cụ thể thao cao cấp. Dự án được thiết kế hiện đại, tối ưu trải nghiệm người dùng (UX/UI) và tương thích hoàn toàn trên nhiều thiết bị (Responsive Design).

---

## 📌 Mục Lục

- [Tổng Quan](#-tổng-quan)
- [Tính Năng Chính](#-tính-năng-chính)
  - [Giao Diện Khách Hàng (Storefront)](#1-giao-diện-khách-hàng-storefront)
  - [Giao Diện Quản Trị (Admin Portal)](#2-giao-diện-quản-trị-admin-portal)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Cơ Chế Xử Lý API & Xác Thực (Authentication)](#-cơ-chế-xử-lý-api--xác-thực-authentication)
- [Hướng Dẫn Cài Đặt & Khởi Chạy](#-hướng-dẫn-cài-đặt--khởi-chạy)
- [Cấu Hình Biến Môi Trường / API Endpoint](#-cấu-hình-biến-môi-trường--api-endpoint)

---

## 🛍️ Tổng Quan

Hệ thống **Sportify Style Frontend** xây dựng giải pháp bán hàng toàn diện gồm:
1. **Kênh mua sắm dành cho khách hàng**: Trải nghiệm mượt mà từ tìm kiếm, lọc sản phẩm, xem chi tiết, quản lý giỏ hàng đến đặt hàng và theo dõi đơn hàng.
2. **Hệ thống Quản trị (Admin Dashboard)**: Cung cấp bộ công cụ quản lý sản phẩm, đơn hàng, người dùng và các thuộc tính danh mục chuyên nghiệp.

---

## 🔥 Tính Năng Chính

### 1. Giao Diện Khách Hàng (Storefront)

* **Xác thực & Tài khoản**:
  * Đăng ký, Đăng nhập hệ thống, Xác thực OTP qua Email, Đăng nhập qua Google OAuth.
  * Quản lý thông tin cá nhân, cập nhật mật khẩu.
* **Khám Phá & Tìm Kiếm Sản Phẩm**:
  * Trang danh sách sản phẩm với bộ lọc đa dạng (Thương hiệu, Màu sắc, Kích cỡ, Khoảng giá).
  * Sắp xếp theo giá, tên, hàng mới nhất.
  * Tìm kiếm theo từ khóa thực tế.
* **Chi Tiết Sản Phẩm**:
  * Hiển thị gallery ảnh sản phẩm, thông tin chi tiết, bảng size và màu sắc linh hoạt.
  * Đánh giá & Phản hồi từ khách hàng.
* **Giỏ Hàng & Thanh Toán**:
  * Thêm/sửa/xóa sản phẩm trong giỏ hàng.
  * Nhập mã giảm giá (Voucher/Promo code).
  * Đặt hàng và chuyển hướng xác nhận thanh toán (`payment-success.html`).
* **Quản Lý Đơn Hàng & Yêu Thích**:
  * Lịch sử đơn hàng, xem trạng thái xử lý/vận chuyển, hủy đơn hàng.
  * Danh sách sản phẩm yêu thích (Wishlist).

### 2. Giao Diện Quản Trị (Admin Portal)

* **Dashboard Overview** (`adminDashboard.html`): Thống kê tổng quan doanh thu, đơn hàng, người dùng mới và biểu đồ hoạt động.
* **Quản Lý Sản Phẩm** (`admin_product.html`): Thêm mới, chỉnh sửa, xóa sản phẩm, tải ảnh lên và quản lý số lượng tồn kho theo biến thể size/color.
* **Quản Lý Đơn Hàng** (`admin_order.html`): Xem danh sách đơn hàng, duyệt đơn, cập nhật trạng thái giao hàng (Pending, Processing, Completed, Cancelled).
* **Quản Lý Khách Hàng** (`admin_customer.html`): Quản lý danh sách người dùng, phân quyền (Role) và khóa/mở khóa tài khoản.
* **Quản Lý Thuộc Tính Danh Mục**:
  * Quản lý Thương hiệu (`admin_brand.html`).
  * Quản lý Màu sắc (`admin_color.html`).
  * Quản lý Kích thước (`admin_size.html`).

---

## 🛠️ Công Nghệ Sử Dụng

* **Core Framework**: HTML5, CSS3, JavaScript (ES6+ Vanilla JS).
* **UI Components & Typography**:
  * Font: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)
  * Icons: [Font Awesome 6.4 Free](https://fontawesome.com/)
  * Dialog & Alerts: [SweetAlert2](https://sweetalert2.github.io/)
* **Giao Tiếp API & State**:
  * Fetch API tích hợp JWT Bearer Token.
  * Tự động làm mới Token (`/auth/refresh`) hỗ trợ xử lý bất đồng bộ chống xung đột Refresh Token.
  * Cache thông minh cho các API GET danh mục (`/products`, `/brands`, `/colors`, `/sizes`).

---

## 📁 Cấu Trúc Dự Án

```text
Front_end_Sale/
├── adminDashboard.html    # Trang tổng quan quản trị (Admin Dashboard)
├── admin_brand.html       # Quản lý thương hiệu (Admin)
├── admin_color.html       # Quản lý màu sắc (Admin)
├── admin_customer.html    # Quản lý tài khoản khách hàng (Admin)
├── admin_order.html       # Quản lý đơn hàng (Admin)
├── admin_product.html     # Quản lý sản phẩm (Admin)
├── admin_size.html        # Quản lý kích thước (Admin)
├── api.js                 # Module xử lý API tập trung & JWT Authentication
├── cart.html              # Trang giỏ hàng & thanh toán
├── login.html             # Trang đăng nhập
├── orders.html            # Trang lịch sử đơn hàng của khách
├── payment-success.html   # Trang thông báo thanh toán thành công
├── product_detail.html    # Trang chi tiết sản phẩm
├── productmyself.html     # Trang sản phẩm cá nhân
├── products.html          # Trang danh sách & lọc sản phẩm
├── profile.html           # Trang thông tin cá nhân khách hàng
├── register.html          # Trang đăng ký tài khoản
├── style.css              # File định dạng CSS dùng chung
├── wishlist.html          # Trang danh sách sản phẩm yêu thích
└── README.md              # Tài liệu hướng dẫn dự án
```

---

## ⚡ Cơ Chế Xử Lý API & Xác Thực (Authentication)

Tất cả các lệnh gọi API đều thông qua module `api.js`:

1. **Auto Endpoint Detection**:
   * Nếu chạy ở môi trường Local (`localhost` / `127.0.0.1`), kết nối API: `http://localhost:8081`
   * Môi trường Production: `https://sportify-backend-6dou.onrender.com`
2. **Tự Động Gắn Token**:
   * Tự động đính kèm `Authorization: Bearer <accessToken>` vào Header đối với các request yêu cầu xác thực.
3. **Cơ Chế Refresh Token Xoay Vòng (Auto Token Refresh)**:
   * Khi gặp lỗi `401 Unauthorized` hoặc `403 Forbidden`, hệ thống sẽ tự động gọi API `/auth/refresh` thông qua `credentials: 'include'` (httpOnly cookie).
   * Sử dụng `refreshPromise` để gộp nhiều request đồng thời chờ chung kết quả refresh, tránh xung đột vô hiệu hóa refresh token cũ.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu Cầu Môi Trường
* Trình duyệt web hiện đại (Google Chrome, Microsoft Edge, Firefox, Brave, Safari...).
* Extention **Live Server** trên VS Code hoặc công cụ Web Server tĩnh bất kỳ (http-server, serve,...).

### Các Bước Thực Hiện

1. **Clone hoặc Tải Dự Án**:
   ```bash
   git clone <repository-url>
   cd Front_end_Sale
   ```

2. **Khởi Chạy Môi Trường Local**:
   * **Cách 1 (VS Code)**: Mở thư mục bằng VS Code, nhấp chuột phải vào `index.html` hoặc `products.html` và chọn **Open with Live Server**.
   * **Cách 2 (Node.js `serve`)**:
     ```bash
     npx serve .
     ```

3. **Truy Cập Môi Trường**:
   * Khách hàng: Mở `http://localhost:5500/products.html` (hoặc cổng tương ứng của Live Server).
   * Quản trị viên: Mở `http://localhost:5500/adminDashboard.html`.

---

## 🌐 Cấu Hình Biến Môi Trường / API Endpoint

Để điều chỉnh đường dẫn Backend API, bạn có thể chỉnh sửa tại dòng 1-3 trong file [`api.js`](file:///c:/Users/ADMIN/Downloads/Front_end_Sale/api.js):

```javascript
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8081'
    : 'https://sportify-backend-6dou.onrender.com';
```

---

## 📝 Giấy Phép & Bản Quyền

Project thuộc bản quyền phát triển bởi đội ngũ **Sportify Team**. Tất cả các quyền được bảo lưu.
