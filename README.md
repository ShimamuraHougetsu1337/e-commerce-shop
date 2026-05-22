<div align="center">

<h1>🛒 E-Commerce Shop</h1>

<p><strong>Ứng dụng thương mại điện tử fullstack hiện đại, xây dựng trên kiến trúc monorepo với NestJS & Next.js.</strong></p>

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/License-UNLICENSED-red?style=for-the-badge)](./LICENSE)

</div>

---

## 📖 Giới Thiệu

**E-Commerce Shop** là ứng dụng web bán hàng trực tuyến được xây dựng hoàn chỉnh với **Next.js 14** (Frontend) và **NestJS 11** (Backend). Dự án hướng đến trải nghiệm mua sắm mượt mà, hiện đại cho người dùng, đồng thời cung cấp bộ công cụ quản trị mạnh mẽ cho người bán hàng.

Nổi bật với:
- 🔐 **Hệ thống xác thực đa dạng** — JWT, Refresh Token, đăng nhập Google/GitHub qua OAuth
- 🤖 **AI Chatbot ngữ cảnh cao** — Tư vấn bán hàng thời gian thực sử dụng **mô hình cục bộ Qwen3 qua Ollama / Gemini**, tích hợp **RAG (Retrieval-Augmented Generation)** tìm kiếm sản phẩm và **nhận thức lịch sử hội thoại** (độ phân giải đại từ xưng hô như "nó", "cái này").
- 🔔 **Thông báo đơn hàng Real-time** — Hệ thống thông báo đẩy tức thì sử dụng **Socket.io** kết hợp lưu trữ Database, hiển thị popover thông minh ở Header cho cả Khách hàng và Admin.
- 🎡 **Gamification** — Vòng quay may mắn tặng voucher mỗi ngày
- 🌍 **Đa ngôn ngữ (i18n)** — Hỗ trợ nhiều ngôn ngữ với `next-intl`
- 📊 **Dashboard Admin** với biểu đồ thống kê doanh thu, đơn hàng theo thời gian

---

## ✨ Tính Năng Chính

### 🛍️ Dành Cho Người Dùng

| Tính năng | Mô tả |
|-----------|-------|
| 🔐 Xác thực & Phân quyền | Đăng ký / đăng nhập bằng email, Google, GitHub. Phân quyền `USER` / `ADMIN` bằng JWT |
| 🔁 Refresh Token | Tự động làm mới phiên đăng nhập, bảo mật cao |
| 🔍 Tìm kiếm sản phẩm | Gợi ý tức thì (autocomplete) với ảnh và giá sản phẩm |
| 👁️ Xem nhanh (Quick View) | Xem chi tiết sản phẩm trong modal mà không rời trang danh sách |
| 🛒 Giỏ hàng | Thêm, xóa, cập nhật số lượng, đồng bộ lên server |
| ⚡ Mua ngay | Thanh toán tức thì, bỏ qua bước giỏ hàng |
| ❤️ Danh sách yêu thích | Lưu sản phẩm yêu thích để mua sau (Zustand) |
| 🎟️ Mã giảm giá | Áp dụng coupon theo tỉ lệ phần trăm hoặc giá trị cố định |
| ⭐ Đánh giá sản phẩm | Viết nhận xét và chấm điểm sao cho sản phẩm đã mua |
| 🤖 AI Chat Support | Chatbot hỗ trợ real-time tích hợp **Ollama Qwen3 (Local) / Google Gemini** + **RAG (Tìm kiếm sản phẩm)** + **Nhận thức ngữ cảnh & lịch sử hội thoại** giải quyết đại từ |
| 🔔 Thông báo Real-time | Nhận thông báo đẩy ngay lập tức khi đặt hàng hoặc thay đổi trạng thái đơn hàng qua Socket.io, lưu trữ lịch sử thông báo, hiển thị popover thông minh ở Header |
| 🎡 Vòng Quay May Mắn | Quay 1 lần/ngày để nhận voucher (5%, 10%, 20k, 50k) |
| 👤 Hồ sơ cá nhân | Xem và cập nhật thông tin, theo dõi lịch sử đơn hàng |
| 🌍 Đa ngôn ngữ | Giao diện hỗ trợ nhiều ngôn ngữ với `next-intl` |

### ⚙️ Dành Cho Quản Trị Viên (Admin)

| Tính năng | Mô tả |
|-----------|-------|
| 📊 Dashboard | Biểu đồ thống kê doanh thu, số lượng đơn hàng theo ngày/tháng |
| 📦 Quản lý sản phẩm | Thêm, sửa, xóa sản phẩm; upload ảnh qua **Multer** |
| 🗂️ Quản lý danh mục | Tạo và quản lý cây danh mục sản phẩm |
| 🧾 Quản lý đơn hàng | Xem chi tiết và cập nhật trạng thái đơn hàng |
| 👥 Quản lý khách hàng | Xem danh sách tài khoản, thông tin người dùng |
| 🏷️ Quản lý mã giảm giá | Tạo và quản lý các chương trình coupon khuyến mãi |
| ⭐ Quản lý đánh giá | Duyệt và kiểm duyệt nhận xét sản phẩm |
| 💬 Giám sát Chat | Xem nhật ký hội thoại AI với khách hàng |
| 🔔 Thông báo Đơn hàng | Nhận thông báo đẩy real-time ngay khi khách đặt hàng mới để xử lý kịp thời |
| 📧 Email tự động | Gửi email xác nhận đơn hàng bằng **NestJS Mailer** + template **EJS** |
| 🗑️ Soft Delete | Xóa mềm dữ liệu, hỗ trợ khôi phục |

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend (`/frontend`)

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|---------|
| [Next.js](https://nextjs.org/) | 14.0 | Framework React — App Router, SSR & CSR |
| [TypeScript](https://www.typescriptlang.org/) | 5.2 | Type-safe JavaScript |
| [Ant Design](https://ant.design/) | 5.29 | Thư viện UI component |
| [Zustand](https://github.com/pmndrs/zustand) | 5.0 | Global state management (cart, wishlist) |
| [SWR](https://swr.vercel.app/) | 2.4 | Data fetching, caching & revalidation |
| [NextAuth.js](https://next-auth.js.org/) | 4.24 | Xác thực OAuth (Google, GitHub) |
| [next-intl](https://next-intl-docs.vercel.app/) | 4.x | Internationalization (i18n) |
| [Socket.io Client](https://socket.io/) | 4.8 | Giao tiếp real-time với server |
| [Recharts](https://recharts.org/) | 3.x | Biểu đồ thống kê Dashboard |
| [react-custom-roulette](https://github.com/effectussoftware/react-custom-roulette) | 1.4 | Vòng quay may mắn Gamification |
| [Lucide React](https://lucide.dev/) | 1.x | Icon library |

### Backend (`/backend`)

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|---------|
| [NestJS](https://nestjs.com/) | 11.0 | Framework Node.js — kiến trúc module hóa (TypeScript) |
| [TypeScript](https://www.typescriptlang.org/) | 5.7 | Type-safe JavaScript |
| [MongoDB](https://www.mongodb.com/) | Latest | Cơ sở dữ liệu NoSQL |
| [Mongoose](https://mongoosejs.com/) | 7.x | ODM với hỗ trợ soft-delete |
| [Passport.js](https://www.passportjs.org/) | 0.7 | Middleware xác thực (JWT strategy) |
| [Socket.io](https://socket.io/) | 4.8 | Giao tiếp real-time (AI chat) |
| [Google Gemini AI](https://ai.google.dev/) | 0.24 | Tích hợp AI chatbot |
| [OpenAI](https://openai.com/) | 6.x | Tích hợp API AI mở rộng |
| [NestJS Mailer](https://github.com/nest-modules/mailer) | 2.x | Gửi email tự động |
| [EJS](https://ejs.co/) | 5.x | Template engine cho email |
| [Multer](https://github.com/expressjs/multer) | 2.x | Upload file / ảnh sản phẩm |
| [class-validator](https://github.com/typestack/class-validator) | 0.15 | Validation DTO |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 2.4 | Mã hóa mật khẩu |

---

## 📁 Cấu Trúc Dự Án

```
e-commerce/
│
├── frontend/                         # Next.js 14 Application
│   └── src/
│       ├── app/
│       │   ├── (auth)/               # Nhóm trang xác thực
│       │   │   ├── login/            # Trang đăng nhập
│       │   │   └── signup/           # Trang đăng ký
│       │   ├── (main)/               # Nhóm trang người dùng
│       │   │   ├── page.tsx          # Trang chủ
│       │   │   ├── products/         # Danh sách & chi tiết sản phẩm
│       │   │   ├── cart/             # Giỏ hàng & thanh toán
│       │   │   ├── wishlist/         # Danh sách yêu thích
│       │   │   ├── profile/          # Hồ sơ & lịch sử đơn hàng
│       │   │   ├── lucky-wheel/      # Vòng quay may mắn
│       │   │   └── support/          # Trang hỗ trợ / AI chat
│       │   ├── admin/                # Nhóm trang quản trị
│       │   │   ├── dashboard/        # Thống kê & biểu đồ
│       │   │   ├── products/         # Quản lý sản phẩm
│       │   │   ├── categories/       # Quản lý danh mục
│       │   │   ├── orders/           # Quản lý đơn hàng
│       │   │   ├── customers/        # Quản lý khách hàng
│       │   │   ├── coupons/          # Quản lý mã giảm giá
│       │   │   ├── reviews/          # Quản lý đánh giá
│       │   │   └── chats/            # Giám sát AI chat
│       │   └── api/                  # Next.js Route Handlers
│       ├── components/               # UI components tái sử dụng
│       ├── store/                    # Zustand stores (cart, wishlist)
│       ├── i18n/                     # Cấu hình đa ngôn ngữ
│       ├── lib/                      # Thư viện tiện ích
│       ├── types/                    # TypeScript type definitions
│       └── utils/                    # Helper functions & API calls
│
└── backend/                          # NestJS 11 Application
    └── src/
        ├── main.ts                   # Entry point (port 8080)
        ├── app.module.ts             # Root module
        ├── auth/                     # Xác thực JWT & Social Login
        ├── users/                    # Quản lý người dùng & phân quyền
        ├── products/                 # Module sản phẩm (CRUD)
        ├── categories/               # Module danh mục
        ├── carts/                    # Quản lý giỏ hàng
        ├── orders/                   # Xử lý & quản lý đơn hàng
        ├── reviews/                  # Đánh giá & nhận xét
        ├── coupons/                  # Mã giảm giá
        ├── dashboard/                # Thống kê & analytics
        ├── chat/                     # Socket.io + AI chatbot
        ├── gamification/             # Vòng quay may mắn
        ├── mail/                     # Dịch vụ gửi email
        ├── files/                    # Upload & quản lý file
        ├── databases/                # Seed data & DB config
        ├── core/                     # Interceptors, transforms
        └── decorator/                # Custom decorators
```

---

## 🔌 API Endpoints

Backend chạy tại `http://localhost:8080` với prefix `/api/v1/`.

| Nhóm | Endpoint | Phương thức | Mô tả |
|------|----------|------------|-------|
| **Auth** | `/api/v1/auth/register` | `POST` | Đăng ký tài khoản mới |
| | `/api/v1/auth/login` | `POST` | Đăng nhập, nhận Access & Refresh Token |
| | `/api/v1/auth/refresh` | `POST` | Làm mới Access Token |
| | `/api/v1/auth/social-login` | `POST` | Đăng nhập bằng OAuth (Google/GitHub) |
| | `/api/v1/auth/logout` | `POST` | Đăng xuất, thu hồi Refresh Token |
| **Users** | `/api/v1/users` | `GET/POST` | Lấy danh sách / tạo người dùng |
| | `/api/v1/users/:id` | `GET/PATCH/DELETE` | Chi tiết / sửa / xóa người dùng |
| **Products** | `/api/v1/products` | `GET/POST` | Danh sách / tạo sản phẩm |
| | `/api/v1/products/:id` | `GET/PATCH/DELETE` | Chi tiết / sửa / xóa sản phẩm |
| **Categories** | `/api/v1/categories` | `GET/POST/PATCH/DELETE` | Quản lý danh mục |
| **Carts** | `/api/v1/carts` | `GET/POST/DELETE` | Xem / thêm / xóa giỏ hàng |
| **Orders** | `/api/v1/orders` | `GET/POST` | Lịch sử / tạo đơn hàng |
| | `/api/v1/orders/:id` | `PATCH` | Cập nhật trạng thái đơn hàng |
| **Reviews** | `/api/v1/reviews` | `GET/POST` | Xem / gửi đánh giá |
| **Coupons** | `/api/v1/coupons` | `GET/POST/PATCH/DELETE` | Quản lý mã giảm giá |
| **Gamification** | `/api/v1/gamification/spin` | `POST` | Thực hiện vòng quay may mắn |
| | `/api/v1/gamification/can-spin` | `GET` | Kiểm tra còn lượt quay hôm nay |
| | `/api/v1/gamification/history` | `GET` | Lịch sử quay thưởng |
| **Dashboard** | `/api/v1/dashboard` | `GET` | Dữ liệu thống kê tổng quan |
| **Files** | `/api/v1/files/upload` | `POST` | Upload ảnh sản phẩm |

> **Lưu ý:** Hầu hết các endpoint yêu cầu header `Authorization: Bearer <access_token>`. Một số endpoint admin yêu cầu role `ADMIN`.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### ✅ Yêu Cầu Hệ Thống

| Công cụ | Phiên bản tối thiểu | Ghi chú |
|---------|-------------------|---------|
| [Node.js](https://nodejs.org/) | v18.0.0+ | Khuyến nghị dùng LTS |
| [npm](https://www.npmjs.com/) | v9.0.0+ | Đi kèm với Node.js |
| [MongoDB](https://www.mongodb.com/) | v6.0+ | Local hoặc [MongoDB Atlas](https://www.mongodb.com/atlas) (miễn phí) |
| [Git](https://git-scm.com/) | Latest | |

---

### 1️⃣ Clone Repository

```bash
git clone https://github.com/ShimamuraHougetsu1337/e-commerce-shop.git
cd e-commerce-shop
```

---

### 2️⃣ Cài Đặt & Chạy Backend

**Bước 1 — Cài đặt dependencies:**
```bash
cd backend
npm install
```

**Bước 2 — Tạo file cấu hình môi trường:**
```bash
cp .env.example .env
```

**Bước 3 — Chỉnh sửa file `.env`:**
```env
# ── Ứng dụng ──────────────────────────────────────
PORT=8080

# ── Cơ sở dữ liệu ─────────────────────────────────
# Ví dụ local:  mongodb://localhost:27017/ecommerce
# Ví dụ Atlas:  mongodb+srv://<user>:<pass>@cluster.mongodb.net/ecommerce
MONGODB_URI=mongodb://localhost:27017/ecommerce

# ── Xác thực JWT ──────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=1d
JWT_REFRESH_TOKEN_SECRET=your_super_secret_refresh_key_here
JWT_REFRESH_EXPIRES_IN=7d

# ── Google Gemini AI ───────────────────────────────
# Lấy key tại: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# ── Email (SMTP Gmail) ─────────────────────────────
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
# Dùng App Password, không phải mật khẩu Gmail thông thường
EMAIL_PASS=your_gmail_app_password

# ── URL Website (dùng trong email template) ────────
WEBSITE_URL=http://localhost:3000
```

> 💡 **Lấy Gmail App Password:** Truy cập [myaccount.google.com](https://myaccount.google.com) → Bảo mật → Xác minh 2 bước → Mật khẩu ứng dụng.

**Bước 4 — Khởi động server ở chế độ phát triển:**
```bash
npm run dev
```

✅ Backend đang chạy tại: `http://localhost:8080`

---

### 3️⃣ Cài Đặt & Chạy Frontend

> Mở **terminal mới** (giữ nguyên terminal backend đang chạy).

**Bước 1 — Cài đặt dependencies:**
```bash
cd frontend
npm install
```

**Bước 2 — Tạo file cấu hình môi trường:**
```bash
cp .env.example .env
```

**Bước 3 — Chỉnh sửa file `.env`:**
```env
# ── URL Backend API ────────────────────────────────
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080

# ── OAuth: GitHub ──────────────────────────────────
# Tạo OAuth App tại: https://github.com/settings/developers
GITHUB_ID=your_github_oauth_app_id
GITHUB_SECRET=your_github_oauth_app_secret

# ── OAuth: Google ──────────────────────────────────
# Tạo tại: https://console.cloud.google.com/apis/credentials
GOOGLE_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret

# ── NextAuth ───────────────────────────────────────
NEXTAUTH_URL=http://localhost:3000
# Tạo secret ngẫu nhiên: openssl rand -base64 32
NEXTAUTH_SECRET=your_random_nextauth_secret
```

**Bước 4 — Khởi động server ở chế độ phát triển:**
```bash
npm run dev
```

✅ Frontend đang chạy tại: `http://localhost:3000`

---

### 🎉 Hoàn Tất!

| Dịch vụ | URL |
|---------|-----|
| 🌐 Ứng dụng (Frontend) | [http://localhost:3000](http://localhost:3000) |
| ⚙️ API (Backend) | [http://localhost:8080/api/v1](http://localhost:8080/api/v1) |

---

## 🔧 Scripts Có Sẵn

### Backend (`/backend`)

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy server ở chế độ watch (hot-reload) |
| `npm run start` | Chạy server (production mode) |
| `npm run build` | Build TypeScript sang JavaScript |
| `npm run start:prod` | Chạy bản build đã compile |
| `npm run test` | Chạy unit tests với Jest |
| `npm run test:cov` | Chạy tests & xuất báo cáo coverage |
| `npm run lint` | Kiểm tra & tự động sửa lỗi ESLint |
| `npm run format` | Format code với Prettier |

### Frontend (`/frontend`)

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy Next.js ở chế độ phát triển |
| `npm run build` | Build ứng dụng cho production |
| `npm run start` | Chạy bản build production |
| `npm run lint` | Kiểm tra lỗi ESLint |

---

## 🏗️ Kiến Trúc & Thiết Kế

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT BROWSER                   │
│              Next.js 14 (App Router)                │
│    Zustand │ SWR │ Ant Design │ Socket.io-client    │
└──────────────┬──────────────────────┬───────────────┘
               │ HTTP REST API        │ WebSocket
               ▼                      ▼
┌─────────────────────────────────────────────────────┐
│                   NestJS Backend                    │
│  ┌──────────┐ ┌──────────┐ ┌───────────────────┐   │
│  │  Guards  │ │  Pipes   │ │  Interceptors      │   │
│  │  (JWT)   │ │(Validate)│ │  (Transform resp.) │   │
│  └──────────┘ └──────────┘ └───────────────────┘   │
│  ┌───────────────────────────────────────────────┐  │
│  │  Modules: Auth│Users│Products│Orders│Coupons  │  │
│  │          Reviews│Chat│Dashboard│Gamification  │  │
│  └───────────────────────────────────────────────┘  │
│  ┌──────────────┐  ┌──────────┐  ┌─────────────┐   │
│  │  Mongoose    │  │ Mail Svc │  │  Gemini AI  │   │
│  │  (soft-del.) │  │   (EJS)  │  │  (chatbot)  │   │
│  └──────────────┘  └──────────┘  └─────────────┘   │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
              ┌───────────────────┐
              │     MongoDB       │
              │  (NoSQL Database) │
              └───────────────────┘
```

### Luồng Xác Thực (Authentication Flow)

```
Người dùng đăng nhập
        │
        ├─── Email/Password ──► Passport Local Strategy ──► Validate ──► JWT Pair
        │
        └─── Google/GitHub ───► NextAuth OAuth ──► /auth/social-login ──► JWT Pair
                                                            │
                                          ┌─────────────────┴──────────────────┐
                                          │  Access Token (1d) + Refresh (7d)  │
                                          └────────────────────────────────────┘
```

---

## 🎡 Tính Năng Gamification — Vòng Quay May Mắn

Người dùng có **1 lượt quay mỗi ngày**. Phần thưởng được chọn ngẫu nhiên có trọng số:

| Phần thưởng | Loại | Tỉ lệ trúng | Hạn sử dụng |
|-------------|------|-------------|-------------|
| Voucher 5% | Phần trăm | 30% | 3 ngày |
| Voucher 20,000đ | Cố định | 20% | 3 ngày |
| Voucher 10% | Phần trăm | 15% | 3 ngày |
| Voucher 50,000đ | Cố định | 5% | 3 ngày |
| Chúc may mắn lần sau | — | 30% | — |

> Coupon được cấp riêng cho từng người dùng (`assignedTo`), đơn hàng tối thiểu **100,000đ**.

---
