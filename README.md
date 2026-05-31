# 🌿 House Renting App (Botanic Floria Premium)

> Ứng dụng quản lý nhà trọ tối ưu và tự động hóa vận hành toàn diện dành cho chủ nhà trọ quy mô vừa và nhỏ (5 - 20 phòng), chạy hoàn toàn miễn phí trên nền tảng đám mây (Cloud Serverless).

Ứng dụng được thiết kế theo triết lý **Product-Grade** chất lượng thương mại, khoác lên mình giao diện nghệ thuật tự nhiên **Botanic Floria UI** sang trọng, mượt mà và trực quan, giúp giải phóng hoàn toàn sức lao động thủ công của chủ trọ trong việc đối soát dữ liệu và tính tiền hàng tháng.

---

## 🎨 Trải nghiệm giao diện Botanic Floria UI

Hệ thống được thiết kế với ngôn ngữ thị giác tự nhiên cao cấp, mang lại cảm giác dễ chịu và chuyên nghiệp:
*   **Canvas nền kem ấm** (`#FDFBF7`) dịu mắt, tránh mỏi mắt khi làm việc lâu.
*   **Tông màu chủ đạo Xô thơm (Sage Green - `#2E7D32`)** mang sắc xanh tự nhiên tươi mới phủ khắp các giao diện tab, biểu đồ, viền thẻ và mầm cây trang trí.
*   **Tông màu cảnh báo Đất nung (Terracotta - `#E65100`)** cho các cảnh báo nợ, quá hạn hợp đồng và nút thao tác quan trọng.
*   **Thiết kế Bento Grid & Thẻ co giãn cơ học** bo tròn sâu 24px (`rounded-3xl`), đi kèm hiệu ứng co giãn xúc giác phản hồi lực click chuột vật lý (`active:scale-[0.98]`) mang lại trải nghiệm tương tác nẩy chân thực.
*   **Biểu đồ Recharts cao cấp** được bọc trong các thẻ kính mờ, phối hợp dải màu Cobalt hoàng gia và Xanh Sage bóng mờ tuyệt đẹp.

---

## 🚀 Các tính năng vượt trội (Core Features)

1.  **📊 Dashboard Bento thông minh**: Thống kê tự động 4 chỉ số cốt lõi (Doanh thu tháng, Phòng trống, Phòng đã thuê, Tổng tiền cọc đang giữ) đi kèm Widget cảnh báo nợ đóng tiền và hợp đồng sắp hết hạn trong 30 ngày.
2.  **⚡ Tạo Hóa đơn hàng loạt một click (Bulk Create)**: Quét toàn bộ phòng đang hoạt động, tự động sao chép chỉ số điện nước mới tháng trước làm chỉ số cũ tháng này, hỗ trợ lưới nhập nhanh chỉ số mới trên cùng một màn hình và tạo toàn bộ hóa đơn tháng mới chỉ với 1 click.
3.  **📐 Thuật toán phân bổ ngày lẻ Pro-rata**: Tự động tính toán tiền phòng lẻ ngày chuẩn xác trên Backend nếu khách vào ở hoặc chuyển đi giữa tháng dựa trên số ngày thực tế của tháng đó.
4.  **🧾 Hóa đơn điện tử E-Invoice PDF chuyên nghiệp**: Tự động xuất hóa đơn dạng PDF đẹp mắt, hiển thị trọn vẹn tiếng Việt Unicode có dấu (Segoe UI) không lỗi font.
5.  **🏦 Cổng thanh toán VietQR & Fallback QR hai tầng**:
    *   *Tầng ưu tiên*: Tự động nhúng ảnh QR tĩnh ngân hàng Techcombank (`assets/qr_code.png`) chuẩn dọc tỷ lệ 110x215 cực kỳ sắc nét.
    *   *Tầng dự phòng*: Tự động sinh mã VietQR động đạt 100% tiêu chuẩn EMVCo & Napas 24/7 (làm tròn số tiền Tag 54, chuẩn hóa nội dung Tag 62 không dấu, mã hóa ngân hàng thụ hưởng) khi không có ảnh tĩnh.
6.  **📲 Trung tâm chia sẻ thông báo đa kênh**: Xem trước nội dung tin nhắn báo tiền nhà được định dạng tối ưu và chia sẻ nhanh qua:
    *   *Zalo*: Tự động sao chép tin nhắn và mở nhanh khung chat Zalo theo SĐT khách thuê.
    *   *SMS*: Mở trình soạn tin SMS native trên điện thoại không dấu để tương thích tối đa.
    *   *Web Share API*: Chia sẻ nhanh qua Messenger, Telegram, Viber, Gmail trên di động.
    *   *Webhook*: Đẩy gói tin JSON chuẩn tương thích Discord embed sang Make/n8n/Discord.
7.  **💾 Sao lưu tự động hàng ngày lên Google Drive**: Kịch bản GitHub Actions tự động chạy vào 2:00 AM ICT hàng ngày, dump cơ sở dữ liệu Neon PostgreSQL và upload lên Google Drive cá nhân 15GB miễn phí thông qua cơ chế xác thực kép Google OAuth2 (Client ID, Client Secret, Refresh Token) kiên cố.
8.  **🔒 Cô lập dữ liệu & Bảo mật tuyệt đối**: Ràng buộc dữ liệu nghiêm ngặt `userId` qua Prisma ORM ngăn chặn truy xuất chéo tài khoản. Sử dụng cơ chế JWT với Access Token trong RAM chống XSS và Refresh Token trong LocalStorage đi kèm Silent Refresh Axios Interceptors âm thầm.

---

## 🛠️ Kiến trúc công nghệ (Tech Stack)

### Frontend (SPA)
*   **Core**: React 18 + Vite (Cực nhanh và nhẹ)
*   **Styling**: Tailwind CSS + Lucide Icons + Outfit Google Font
*   **State Management**: Zustand (Global Auth State) & TanStack Query v5 (Server state caching)
*   **Forms**: React Hook Form + Zod validation
*   **Charts**: Recharts (Responsive đa thiết bị)

### Backend & Database
*   **Runtime**: Node.js + Express.js
*   **ORM**: Prisma ORM (Kiểm soát Schema và Migrations an toàn)
*   **Database**: PostgreSQL (Neon Serverless Cloud)
*   **File Storage**: Cloudinary (Lưu trữ ảnh CCCD, hợp đồng của khách thuê)
*   **PDF Engine**: pdf-lib

### Testing & Infrastructure
*   **E2E Testing**: Playwright (Kiểm thử tự động hóa toàn bộ luồng nghiệp vụ)
*   **CI/CD**: GitHub Actions (Tự động chạy test, backup DB và deploy backend/frontend)

---

## 📂 Sơ đồ thư mục (Project Directory Map)

```
houserenting-app/
├── .github/workflows/      ← Cấu hình GitHub Actions (Deploy backend/frontend & Daily Backup)
├── .kiro/specs/            ← Quy hoạch Đặc tả định hướng phát triển (Specs - Source of truth)
│   └── house-renting-management/
│       ├── requirements.md ← Yêu cầu nghiệp vụ & Acceptance Criteria
│       ├── design.md       ← Thiết kế hệ thống, DB Schema & Heuristic rules
│       └── tasks.md        ← Checklist tiến độ thực thi các task hiện tại/tương lai
├── backend/                ← Dự án Node.js + Express.js API
│   ├── assets/             ← Fonts và ảnh QR tĩnh
│   ├── prisma/             ← Cấu hình DB Schema và các tệp Migrations
│   └── src/                ← Mã nguồn xử lý API, Controllers, Middlewares
├── frontend/               ← Dự án React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/     ← Component dùng chung (Skeleton, WakeUpBanner, Modals,...)
│   │   ├── layouts/        ← Bố cục ứng dụng (Sidebar AppLayout)
│   │   ├── pages/          ← 8 màn hình chức năng chính
│   │   └── store/          ← Zustand state stores
│   └── playwright/         ← Kịch bản kiểm thử tự động E2E
├── docs/                   ← Thư mục tài liệu hỗ trợ
│   └── deployment-steps.md ← Hướng dẫn từng bước triển khai lên Render/Vercel
├── AGENTS.md               ← Tài liệu điều phối trung tâm của dự án & Quy tắc hệ thống
├── CHANGELOG.md            ← Nhật ký ghi nhận lịch sử thay đổi phiên bản
├── start-local.cmd         ← Script khởi chạy nhanh toàn bộ dự án local bằng 1 click
└── render.yaml             ← Cấu hình khai báo dịch vụ hạ tầng Render
```

---

## 💻 Bắt đầu nhanh dưới môi trường Local

### 1. Khởi chạy nhanh 1 click (Dành cho Windows)
Tại thư mục gốc của dự án, bạn chỉ cần chạy tệp lệnh sau:
```cmd
start-local.cmd
```
Hệ thống sẽ tự động:
1. Mở một terminal chạy Backend (`npm run dev` trên cổng `5000`).
2. Mở một terminal chạy Frontend (`npm run dev` trên cổng `5173`).
3. Tự động mở trình duyệt web và truy cập `http://localhost:5173`.

### 2. Khởi chạy thủ công từng phần

#### Thiết lập Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db seed      # Tạo tài khoản mặc định admin@test.com / password123 nếu chạy lần đầu
npm run dev
```

#### Thiết lập Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## ⚙️ Cấu hình biến môi trường (.env)

Để chạy ứng dụng ở môi trường local, bạn cần chuẩn bị các file cấu hình `.env` sau:

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV="development"

# Chuỗi kết nối Database PostgreSQL (Khuyên dùng Neon.tech)
DATABASE_URL="postgresql://<user>:<password>@<host>/<dbname>?sslmode=require"

# Khóa bảo mật JWT
JWT_SECRET="YOUR_RANDOM_LONG_SECRET_KEY_HERE"
JWT_REFRESH_SECRET="YOUR_ANOTHER_RANDOM_LONG_SECRET_KEY_HERE"

# Cấu hình lưu trữ ảnh Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Tên miền Frontend để vượt cấu hình CORS bảo mật
CLIENT_URL="http://localhost:5173"
```

### Frontend (`frontend/.env`)
```env
# Địa chỉ API của Backend
VITE_API_URL="http://localhost:5000/api"
```

---

## 🗺️ Bản đồ tài nguyên & Liên kết tài liệu

Mọi tài liệu phát triển dự án đều được quản lý nghiêm ngặt nhằm tránh việc lập trình tự phát. Dưới đây là các tài liệu hướng dẫn và đặc tả đang hoạt động:

*   📘 **Đặc tả Nghiệp vụ**: [requirements.md](file:///.kiro/specs/house-renting-management/requirements.md) — Quy định chi tiết các tiêu chí nghiệm thu của từng tính năng.
*   📐 **Thiết kế Hệ thống**: [design.md](file:///.kiro/specs/house-renting-management/design.md) — Chi tiết Database Schema, cấu trúc API, và quy tắc Heuristic UI/UX.
*   📋 **Tiến độ nâng cấp**: [tasks.md](file:///.kiro/specs/house-renting-management/tasks.md) — Nhật ký các task cải tiến và kế hoạch phát triển tương lai.
*   🚀 **Hướng dẫn Deploy**: [deployment-steps.md](file:///docs/deployment-steps.md) — Hướng dẫn chi tiết từng bước triển khai Vercel, Render và Neon.
*   🧠 **Quy tắc Quản trị**: [AGENTS.md](file:///AGENTS.md) — Nguyên tắc tối cao điều phối dự án dành cho AI Agent và nhà phát triển.
*   📜 **Lịch sử thay đổi**: [CHANGELOG.md](file:///CHANGELOG.md) — Nhật ký chi tiết các phiên bản từ 1.0.0 đến 1.4.5 hiện tại.
