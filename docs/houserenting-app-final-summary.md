# Báo Cáo Tổng Hợp Dự Án Quản Lý Nhà Trọ (House Renting App)

Dự án đã được phát triển và triển khai thành công 100%. Tài liệu này tổng hợp toàn bộ kiến trúc, chức năng, và cấu hình để thuận tiện cho việc bảo trì và nâng cấp trong tương lai.

## 1. Tổng Quan Kiến Trúc (Architecture)

Ứng dụng được xây dựng theo mô hình **Client-Server (SPA - Single Page Application)**, tách biệt hoàn toàn giữa Frontend và Backend, giao tiếp qua RESTful API.

- **Mô hình triển khai (Deployment):**
  - **Frontend:** Triển khai trên Vercel (Edge Network).
  - **Backend:** Triển khai trên Render Web Service.
  - **Database:** Serverless PostgreSQL trên Neon.tech.
  - **File Storage:** Cloudinary (tối ưu hóa phân phối ảnh/tài liệu).

## 2. Công Nghệ Sử Dụng (Tech Stack)

### 🖥️ Frontend (Giao diện người dùng)
- **Framework:** React 18 với Vite.
- **Styling:** Tailwind CSS kết hợp với hệ thống Component UI (lấy cảm hứng từ shadcn/ui) và Lucide-react (Icons).
- **State Management:**
  - **Zustand:** Quản lý Global State (như thông tin Auth, Token).
  - **TanStack Query (React Query v5):** Quản lý trạng thái server state (fetching, caching, mutates, background updates).
- **Forms & Validation:** React Hook Form + Zod (Schema validation).
- **Biểu đồ:** Recharts (Hiển thị doanh thu & tỷ lệ lấp đầy).
- **Định tuyến:** React Router DOM (với Protected Routes).

### ⚙️ Backend (Xử lý logic & API)
- **Framework:** Node.js + Express.js.
- **ORM (Tương tác Database):** Prisma ORM.
- **Bảo mật:**
  - `bcryptjs` (Mã hóa mật khẩu).
  - `jsonwebtoken` (JWT - Access Token ngắn hạn & Refresh Token dài hạn).
  - `cors` (Kiểm soát tên miền truy cập).
  - `express-rate-limit` (Chống Spam / DDoS).
- **Xử lý File:** 
  - `multer` (Xử lý Multipart/form-data).
  - `cloudinary` (Upload và lưu trữ đám mây).
- **Tiện ích:**
  - `pdf-lib` (Tạo Hóa đơn PDF tự động với tính năng tự động loại bỏ dấu tiếng Việt để chống lỗi font).

## 3. Cấu Trúc Cơ Sở Dữ Liệu (Database Schema)

Dữ liệu được lưu trữ trên PostgreSQL với các bảng chính được liên kết chặt chẽ (Relational Data):

1. **User (Chủ trọ):** Quản lý tài khoản đăng nhập.
2. **Settings (Cấu hình):** Cài đặt tên hiển thị trên hóa đơn, địa chỉ, SĐT.
3. **Room (Phòng trọ):** Thông tin phòng, giá thuê cơ bản, giá điện/nước/rác. Có trạng thái `AVAILABLE` (Trống) / `OCCUPIED` (Có người).
4. **Tenant (Khách thuê):** Thông tin cá nhân, SĐT, CCCD, ngày vào ở, tiền cọc.
5. **TenantFile (Tài liệu):** Các file đính kèm của khách (ảnh CCCD, bản scan hợp đồng PDF) lưu trên Cloudinary.
6. **Invoice (Hóa đơn):** Lưu trữ kỳ tính tiền, chỉ số điện/nước (Cũ & Mới), tự động tính toán tổng tiền (Pro-rata theo số ngày thực tế), trạng thái thu tiền.
7. **RefreshToken:** Quản lý phiên đăng nhập dài hạn.

## 4. Danh Sách Các Chức Năng Cốt Lõi

- **Xác Thực (Authentication):**
  - Đăng nhập, đăng ký, đăng xuất.
  - Tự động làm mới Token (Silent Refresh) bằng Axios Interceptors ở Frontend giúp người dùng không bị văng ra ngoài khi hết hạn Access Token.
- **Dashboard (Bảng Điều Khiển):**
  - Thống kê tự động: Tổng doanh thu tháng, số phòng trống/đang thuê, tổng tiền cọc.
  - Cảnh báo: Danh sách hóa đơn chưa thanh toán.
  - Biểu đồ: Cột (Doanh thu 6 tháng gần nhất) và Tròn (Tỷ lệ lấp đầy).
- **Quản lý Phòng trọ:**
  - Tạo nhanh phòng trọ, thiết lập đơn giá riêng cho từng phòng.
  - Xem chi tiết phòng, lịch sử hóa đơn và người thuê hiện tại.
- **Quản lý Khách thuê:**
  - Hiển thị danh sách Khách thuê dạng thẻ (Cards) hiện đại.
  - Phân bổ phòng trống cho khách.
  - Quản lý tài liệu hợp đồng, ảnh CCCD (Upload trực tiếp lên Cloudinary).
  - Di chuyển/Trả phòng (Lưu trữ lịch sử, không xóa cứng dữ liệu).
- **Quản lý Hóa đơn:**
  - Tính năng **Tạo Hóa Đơn Hàng Loạt:** Liệt kê các phòng đang có người, tự động điền chỉ số cũ từ tháng trước, cho phép nhập nhanh chỉ số mới trên cùng một màn hình và tạo hàng loạt hóa đơn chỉ với 1 click.
  - Thuật toán Pro-rata: Tự động tính tiền phòng chia theo số ngày thực tế (nếu khách vào ở giữa tháng).
  - Đánh dấu trạng thái Thu/Chưa Thu tiền.
  - **Xuất PDF:** Tạo hóa đơn PDF rõ ràng, chuyên nghiệp.
  - **Xuất CSV:** Xuất toàn bộ danh sách hóa đơn ra file Excel để kế toán.

## 5. Danh Sách Biến Môi Trường (.env)

Hệ thống yêu cầu các biến môi trường sau để hoạt động:

### Backend (.env)
```env
# Chuỗi kết nối đến Neon PostgreSQL
DATABASE_URL="postgresql://<user>:<password>@<host>/<dbname>?sslmode=require"

# Khóa bí mật cho JWT
JWT_SECRET="<chuỗi_ngẫu_nhiên_64_ký_tự>"
JWT_REFRESH_SECRET="<chuỗi_ngẫu_nhiên_64_ký_tự_khác>"

# Cấu hình lưu trữ ảnh Cloudinary
CLOUDINARY_CLOUD_NAME="<tên_cloud>"
CLOUDINARY_API_KEY="<api_key>"
CLOUDINARY_API_SECRET="<api_secret>"

# URL của Frontend để cấu hình chặn CORS bảo mật
CLIENT_URL="https://houserenting-webapp-dadu.vercel.app"

PORT=5000
NODE_ENV="production"
```

### Frontend (.env)
```env
# Đường dẫn gọi API đến Render Server
VITE_API_URL="https://houserenting-webapp-dadu.onrender.com/api"
```

## 6. Hướng Dẫn Bảo Trì & Cập Nhật Code

Trong tương lai, nếu bạn muốn nâng cấp tính năng mới, quy trình sẽ như sau:
1. Sửa code trên máy tính của bạn (Local).
2. Chạy thử trên local để đảm bảo không có lỗi:
   - Terminal 1 (Backend): `npm run dev`
   - Terminal 2 (Frontend): `npm run dev`
3. Nếu có thay đổi cấu trúc database (trong file `schema.prisma`), hãy chạy lệnh: `npx prisma migrate dev --name <ten_thay_doi>`.
4. Khi mọi thứ ổn, commit và đẩy code lên GitHub:
   ```bash
   git add .
   git commit -m "Cập nhật tính năng X"
   git push origin main
   ```
5. Hệ thống Vercel sẽ tự động nhận diện và cập nhật Frontend mới nhất. Render có thể được cấu hình để tự động nhận bản cập nhật Backend (hoặc bạn có thể bấm Manual Deploy trên Render).

---
*Tài liệu được khởi tạo và ghi nhận lúc dự án triển khai thành công 100%.*
