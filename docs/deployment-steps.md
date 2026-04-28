# Deployment Steps

## 1. Chuẩn bị trước khi deploy

- Mã nguồn đã được cập nhật và pushed lên `origin/main`.
- Kiểm tra các file deploy:
  - `render.yaml` — cấu hình backend Render.
  - `frontend/package.json` — cấu hình build frontend Vite.
  - `backend/prisma/schema.prisma` và `backend/prisma/migrations/20260428000000_add_payment_info/migration.sql`.
- Chuẩn bị các biến môi trường production:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `JWT_REFRESH_SECRET`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `CLIENT_URL`
  - `VITE_API_URL`

## 2. Thiết lập backend trên Render

1. Đăng nhập vào Render.
2. Tạo dịch vụ mới kiểu `Web Service`.
3. Kết nối với GitHub repository `houserenting-webapp-dadu`.
4. Chọn nhánh `main`.
5. Cấu hình root directory:
   - `backend`
6. Build command:
   - `npm install && npx prisma generate && npx prisma migrate deploy`
7. Start command:
   - `node src/index.js`
8. Thêm biến môi trường Render:
   - `NODE_ENV=production`
   - `DATABASE_URL=<postgresql connection string>`
   - `JWT_SECRET=<random-secret>`
   - `JWT_REFRESH_SECRET=<random-secret>`
   - `CLOUDINARY_CLOUD_NAME=<cloud-name>`
   - `CLOUDINARY_API_KEY=<api-key>`
   - `CLOUDINARY_API_SECRET=<api-secret>`
   - `CLIENT_URL=https://<frontend>.vercel.app`
9. Lưu và deploy.

## 3. Thiết lập frontend trên Vercel

1. Đăng nhập vào Vercel.
2. Tạo project mới từ cùng GitHub repository.
3. Chọn nhánh `main`.
4. Cấu hình root directory:
   - `frontend`
5. Build command:
   - `npm install && npm run build`
6. Output directory:
   - `dist`
7. Thêm biến môi trường Vercel:
   - `VITE_API_URL=https://<backend>.onrender.com/api`
8. Lưu và deploy.

## 4. Kiểm tra sau deploy

- Backend: truy cập `https://<backend>.onrender.com/api/health`
  - Nên trả về trạng thái thành công.
- Frontend: mở `https://<frontend>.vercel.app`
  - Kiểm tra xem app load và giao diện đăng nhập hoạt động.
- Kiểm tra API từ frontend:
  - Đăng nhập
  - Tạo / xem phòng, khách thuê, hóa đơn
  - Xuất hóa đơn PDF
- Nếu cài đặt `Thông tin thanh toán / QR code` vẫn chưa lưu:
  - kiểm tra `Render` đã deploy phiên bản mới nhất
  - khởi động lại backend để áp dụng khai báo schema startup
  - hoặc chạy migration thủ công nếu cần
- Nếu PDF vẫn chưa hiển thị tiếng Việt có dấu:
  - đảm bảo backend có font Unicode được tìm thấy
  - đặt font `segoeui.ttf` hoặc `NotoSans-Regular.ttf` vào `backend/assets/fonts/`
  - Render có thể dùng font hệ thống nếu có sẵn `/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf` hoặc `/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`

## 5. Cập nhật sau deploy

- Nếu có thay đổi schema Prisma mới, Render sẽ chạy `npx prisma migrate deploy` trong bước build.
- Nếu cần rollback:
  - Sử dụng tính năng render rollback hoặc deploy lại commit trước.
  - Đảm bảo database migration tương thích.

## 6. Ghi chú quan trọng

- `render.yaml` đã cấu hình backend Render với build command và env vars.
- Nếu Vercel hoặc Render được nối với GitHub, mỗi lần push vào `main` sẽ tự động kích hoạt deploy.
- Mã QR và tiếng Việt trên hóa đơn PDF đã được thêm vào mã nguồn mới nhất.
- Nếu gặp lỗi `paymentInfo` trong database, hãy chắc rằng migration `20260428000000_add_payment_info` đã được apply.
