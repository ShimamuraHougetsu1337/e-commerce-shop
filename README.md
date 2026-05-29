<div align="center">

<h1>🛒 E-Commerce Shop</h1>

<p><strong>Ứng dụng thương mại điện tử fullstack hiện đại, xây dựng trên kiến trúc Monorepo với NestJS & Next.js.</strong></p>

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-Latest-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/)
[![Deploy Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://e-commerce-shop-one-mauve.vercel.app/)

</div>

---

## 🔗 Live Demo & Tài Khoản Thử Nghiệm
🚀 Trải nghiệm website bán hàng tại: **[https://e-commerce-shop-one-mauve.vercel.app/](https://e-commerce-shop-one-mauve.vercel.app/)**

### 🔑 Tài khoản Demo (Áp dụng cho cả bản Deploy và Local):
* **Tài khoản Admin (Quản trị):**
  * Email: `admin@gmail.com`
  * Mật khẩu: `123456`
* **Tài khoản Khách hàng (User):**
  * Email: `user@gmail.com`
  * Mật khẩu: `123456`

---

## 📖 Giới Thiệu & Tính Năng Nổi Bật

**E-Commerce Shop** là ứng dụng web bán hàng trực tuyến fullstack hoàn chỉnh. Dự án được phát triển theo mô hình monorepo, hướng đến trải nghiệm người dùng tối ưu cùng hệ thống quản trị tiện ích.

### Các tính năng cốt lõi:
- 🔐 **Xác thực an toàn**: Đăng nhập bằng Email/Password (JWT Access & Refresh Token) hoặc qua OAuth (Google, GitHub, Facebook).
- 🛒 **Trải nghiệm mua sắm mượt mà**: Đầy đủ các luồng nghiệp vụ như Tìm kiếm gợi ý (Autocomplete), xem chi tiết nhanh (Quick View), Giỏ hàng & Danh sách yêu thích (Wishlist) đồng bộ, áp dụng mã giảm giá.
- 💬 **Hỗ trợ & Chat trực tuyến**: Tích hợp AI Chatbot (Gemini / Ollama Qwen) hỗ trợ tư vấn tự động (RAG), kết hợp kênh chat thời gian thực (Socket.io) cho phép Admin giám sát hội thoại và trực tiếp nhắn tin hỗ trợ khách hàng.
- 🔔 **Thông báo Real-time**: Cập nhật trạng thái đơn hàng và nhắn tin trực tiếp qua Socket.io.
- 💳 **Thanh toán trực tuyến**: Tích hợp cổng thanh toán Sandbox của VNPAY.
- 📧 **Tự động gửi Email**: Gửi hóa đơn và thông tin xác nhận đơn hàng tự động qua **NestJS Mailer + template EJS** ngay khi thanh toán thành công.
- 🗂️ **Xử lý tác vụ nặng bất đồng bộ**: Sử dụng hàng đợi tin nhắn **RabbitMQ** để kiểm duyệt (moderation) các đánh giá sản phẩm của người dùng một cách hiệu quả.
- 🎡 **Vòng quay may mắn**: Tính năng Gamification giúp người dùng quay thưởng mã giảm giá mỗi ngày.
- 🌍 **Đa ngôn ngữ (i18n)**: Hỗ trợ chuyển đổi ngôn ngữ linh hoạt (Tiếng Việt / Tiếng Anh).
- 📊 **Dashboard Admin**: Quản trị viên dễ dàng thống kê doanh thu, quản lý danh mục, sản phẩm, đơn hàng, mã giảm giá và kiểm duyệt review.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: Next.js 14 (App Router), TypeScript, Ant Design, Zustand (State Management), SWR (Data Fetching), Socket.io Client, NextAuth.js, next-intl.
- **Backend**: NestJS 11, MongoDB & Mongoose (ODM hỗ trợ Soft Delete), Socket.io Server, RabbitMQ (AMQP), Passport.js (JWT Strategy), NestJS Mailer (EJS Templates), VNPAY SDK.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1️⃣ Cài đặt ban đầu
Clone mã nguồn từ repository và truy cập vào thư mục dự án:
```bash
git clone https://github.com/ShimamuraHougetsu1337/e-commerce-shop.git
cd e-commerce-shop
```

---

### 2️⃣ Chạy Backend (`/backend`)
1. Di chuyển vào thư mục backend và cài đặt dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Tạo file cấu hình môi trường `.env` từ file mẫu:
   ```bash
   cp .env.example .env
   ```
3. Cập nhật các biến môi trường chính trong file `.env`:
   ```env
   PORT=8080
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_TOKEN_SECRET=your_refresh_secret

   # SMTP Mailer
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password

   # VNPAY
   VNP_TMN_CODE=your_vnp_tmn_code
   VNP_HASH_SECRET=your_vnp_hash_secret
   VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
   VNP_RETURN_URL=http://localhost:3000/order/vnpay-return

   # RabbitMQ & Ollama
   RABBITMQ_URL=amqp://guest:guest@localhost:5672
   OLLAMA_BASE_URL=http://localhost:11434/v1
   ```
4. Khởi động các dịch vụ bổ trợ (Database & Queue & AI):
   * **Chạy MongoDB & RabbitMQ (qua Docker Desktop - Khuyên dùng):**
     ```bash
     # Tại thư mục backend
     docker compose up -d
     ```
     *(Lệnh này tự động khởi chạy cả Database MongoDB trên cổng 27017 và RabbitMQ trên cổng 5672/15672)*
   * **Cách khác (Nếu không dùng Docker):** 
     Đảm bảo dịch vụ MongoDB local trên máy của bạn (hoặc MongoDB Atlas Cloud) đang hoạt động và cập nhật đường dẫn `MONGODB_URI` tương ứng trong file `.env`.
   * **Chạy Ollama Local (để sử dụng AI Chatbot):**
     ```bash
     ollama run qwen2.5:7b
     ```
5. Khởi động server backend ở chế độ phát triển:
   ```bash
   npm run dev
   ```
   *Backend hoạt động tại:* `http://localhost:8080`

---

### 3️⃣ Chạy Frontend (`/frontend`)
*(Thực hiện trên một tab Terminal mới)*
1. Di chuyển vào thư mục frontend và cài đặt dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Tạo file cấu hình môi trường `.env` từ file mẫu:
   ```bash
   cp .env.example .env
   ```
3. Cập nhật các thông số cần thiết trong `.env`:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret

   # OAuth Credentials
   GOOGLE_ID=your_google_id
   GOOGLE_SECRET=your_google_secret
   GITHUB_ID=your_github_id
   GITHUB_SECRET=your_github_secret
   ```
4. Khởi động ứng dụng frontend:
   ```bash
   npm run dev
   ```
   *Frontend hoạt động tại:* `http://localhost:3000`

---

### 🎉 Hoàn Tất!

| Dịch vụ | URL phát triển local |
|---------|-----------------------|
| 🌐 **Ứng dụng (Frontend)** | [http://localhost:3000](http://localhost:3000) |
| ⚙️ **API (Backend)** | [http://localhost:8080/api/v1](http://localhost:8080/api/v1) |

> 💡 **Lưu ý:** Tài khoản demo (`admin@gmail.com` và `user@gmail.com` với mật khẩu `123456`) đã được cấu hình tự động seed sẵn vào cơ sở dữ liệu local khi khởi động dự án lần đầu.
