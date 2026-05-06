<div align="center">

# 🛒 E-Commerce Shop

**Ứng dụng thương mại điện tử fullstack, được xây dựng với kiến trúc monorepo hiện đại.**

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Latest-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)

</div>

---

## 📖 Giới Thiệu

**E-Commerce Shop** là ứng dụng web bán hàng trực tuyến được xây dựng với Next.js (Frontend) và NestJS (Backend). Dự án hướng đến trải nghiệm mua sắm mượt mà cho người dùng, đồng thời cung cấp bộ công cụ quản trị đầy đủ cho người bán hàng.

---

## ✨ Tính Năng Chính

### 🛍️ Người Dùng
| Tính năng | Mô tả |
|---|---|
| 🔐 Đăng ký / Đăng nhập | Xác thực bảo mật bằng JWT và NextAuth.js |
| 🔍 Tìm kiếm sản phẩm | Gợi ý tức thì (autocomplete) với ảnh và giá sản phẩm |
| 👁️ Xem nhanh | Xem chi tiết sản phẩm qua modal mà không rời trang danh sách |
| 🛒 Giỏ hàng | Thêm, xóa, cập nhật số lượng sản phẩm, đồng bộ server |
| ⚡ Mua ngay | Thanh toán tức thì bỏ qua bước giỏ hàng |
| ❤️ Danh sách yêu thích | Lưu sản phẩm yêu thích để mua sau |
| 🎟️ Mã giảm giá | Áp dụng coupon cố định hoặc phần trăm |
| ⭐ Đánh giá sản phẩm | Viết nhận xét và chấm sao cho sản phẩm đã mua |
| 🤖 AI Chat | Chatbot hỗ trợ khách hàng theo thời gian thực (Google Gemini + Socket.io) |

### ⚙️ Quản Trị (Admin)
| Tính năng | Mô tả |
|---|---|
| 📊 Dashboard | Biểu đồ thống kê doanh thu, đơn hàng theo thời gian |
| 📦 Quản lý sản phẩm | Thêm, sửa, xóa sản phẩm kèm upload ảnh |
| 🧾 Quản lý đơn hàng | Xem và cập nhật trạng thái đơn hàng |
| 👥 Quản lý khách hàng | Xem danh sách và thông tin tài khoản người dùng |
| 🏷️ Quản lý mã giảm giá | Tạo và quản lý các chương trình khuyến mãi |
| 📧 Email tự động | Gửi email xác nhận đơn hàng tự động (NestJS Mailer + EJS) |

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend (`/frontend`)
| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| [Next.js](https://nextjs.org/) | 14.0 | Framework React với App Router (SSR + CSR) |
| [Ant Design](https://ant.design/) | 5.29 | Thư viện UI component |
| [Zustand](https://github.com/pmndrs/zustand) | 5.0 | Quản lý state toàn cục (giỏ hàng, wishlist) |
| [SWR](https://swr.vercel.app/) | 2.4 | Data fetching, caching & tự động revalidate |
| [NextAuth.js](https://next-auth.js.org/) | 4.24 | Quản lý phiên đăng nhập |
| [Recharts](https://recharts.org/) | 3.x | Biểu đồ thống kê cho Dashboard |

### Backend (`/backend`)
| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| [NestJS](https://nestjs.com/) | 11.0 | Framework Node.js có kiến trúc module (TypeScript) |
| [MongoDB](https://www.mongodb.com/) | Latest | Cơ sở dữ liệu NoSQL |
| [Mongoose](https://mongoosejs.com/) | 7.x | ODM, hỗ trợ soft-delete |
| [Socket.io](https://socket.io/) | Latest | Giao tiếp real-time (chat) |
| [Passport.js](https://www.passportjs.org/) | 0.7 | Middleware xác thực (JWT strategy) |
| [Google Gemini AI](https://ai.google.dev/) | 0.24 | Tích hợp AI chatbot |
| [NestJS Mailer](https://github.com/nest-modules/mailer) | 2.x | Gửi email tự động (EJS templates) |
| [Multer](https://github.com/expressjs/multer) | 2.x | Upload file / ảnh sản phẩm |

---

## 📁 Cấu Trúc Dự Án

```
e-commerce/
├── frontend/                     # Next.js Application
│   └── src/
│       ├── app/
│       │   ├── (auth)/           # Trang đăng nhập, đăng ký
│       │   ├── (main)/           # Trang dành cho người dùng
│       │   │   ├── products/     # Danh sách & chi tiết sản phẩm
│       │   │   ├── cart/         # Giỏ hàng & thanh toán
│       │   │   ├── wishlist/     # Danh sách yêu thích
│       │   │   └── profile/      # Hồ sơ & lịch sử đơn hàng
│       │   └── admin/            # Trang quản trị
│       ├── components/           # UI Components tái sử dụng
│       ├── store/                # Zustand state (cart, wishlist)
│       └── utils/                # Hàm gọi API
│
└── backend/                      # NestJS Application
    └── src/
        ├── auth/                 # Xác thực JWT
        ├── users/                # Quản lý người dùng & phân quyền
        ├── products/             # Module sản phẩm
        ├── categories/           # Module danh mục
        ├── carts/                # Quản lý giỏ hàng
        ├── orders/               # Xử lý đơn hàng
        ├── reviews/              # Đánh giá sản phẩm
        ├── coupons/              # Mã giảm giá
        ├── dashboard/            # Thống kê & phân tích
        ├── chat/                 # Socket.io AI chat
        ├── mail/                 # Dịch vụ email
        └── files/                # Upload file
```

---

## 🚀 Hướng Dẫn Cài Đặt

### Yêu Cầu
- **Node.js** v18.0.0 trở lên
- **MongoDB** — Local hoặc [MongoDB Atlas](https://www.mongodb.com/atlas) (miễn phí)
- **Git**

---

### 1. Clone Repository
```bash
git clone https://github.com/ShimamuraHougetsu1337/e-commerce-shop.git
cd e-commerce-shop
```

---

### 2. Cài Đặt Backend

**a. Cài đặt dependencies:**
```bash
cd backend
npm install
```

**b. Cấu hình biến môi trường:**
```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:
```env
# Ứng dụng
PORT=8000
NODE_ENV=development

# Cơ sở dữ liệu
MONGODB_URI=mongodb://localhost:27017/ecommerce

# Xác thực
JWT_ACCESS_TOKEN_SECRET=your_super_secret_key
JWT_ACCESS_TOKEN_EXPIRED=1d

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_AUTH_USER=your_email@gmail.com
EMAIL_AUTH_PASS=your_app_password
```

**c. Khởi động server:**
```bash
npm run dev
```
Backend đang chạy tại `http://localhost:8000`.

---

### 3. Cài Đặt Frontend

**a. Cài đặt dependencies:**
```bash
# Mở terminal mới
cd frontend
npm install
```

**b. Cấu hình biến môi trường:**
```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:
```env
# URL Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

**c. Khởi động server:**
```bash
npm run dev
```

---

**🎉 Hoàn tất!** Truy cập [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

---
