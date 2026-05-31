# Premium UI Redesign (Modern Cobalt & Cream) — Design Spec

**Ngày:** 2026-05-31  
**Phiên bản:** 1.0  
**Tác giả:** Antigravity (Superpowers Brainstorming Session)  
**Trạng thái:** Chờ phê duyệt  

---

## 1. Mục tiêu thiết kế
Nâng cấp toàn bộ giao diện người dùng (UI) của ứng dụng **House Renting App** thành phiên bản cao cấp (Product-Grade), loại bỏ hoàn toàn cảm giác rập khuôn ("AI slop") bằng cách áp dụng bộ kỹ năng **Taste-Skill** với phong cách chủ đạo **Modern Cobalt & Cream** và phông chữ **Outfit**.

Tập trung đột phá thẩm mỹ vào hai nhóm màn hình trọng tâm:
1. **Quản lý Phòng & Khách thuê (Hero Screen 1):** Chuyển đổi danh sách phòng tẻ nhạt thành lưới thẻ tương tác sắc sảo và trang chi tiết dạng Split-screen 50/50 tiện lợi.
2. **Chi tiết Hóa đơn & Hộp thoại Thông báo (Hero Screen 2):** Thiết kế hóa đơn điện tử cao cấp và bộ truyền thông đa kênh kính mờ (glassmorphism overlay) có phản hồi xúc giác bấm nút cơ học nẩy.

---

## 2. Hệ thống Design Tokens & Typography

Hệ thống token được cấu hình đồng bộ thông qua Tailwind CSS và CSS Custom Properties để đảm bảo tính nhất quán trên toàn bộ ứng dụng:

### 2.1. Typography (Phông chữ)
*   **Google Font:** Nhúng phông chữ **Outfit** (trọng lượng: 300, 400, 500, 600, 700) thông qua Google Fonts CDN tại `index.html`.
*   **Tailwind Cấu hình:** Thiết lập phông chữ Outfit làm phông chữ chính (`font-sans`) mặc định của ứng dụng.

### 2.2. Bảng màu chủ đạo (Cobalt & Cream Palette)
*   **Nền hệ thống (Warm Cream):** `#FDFBF7` (màu kem ấm áp, dịu mắt, không lóa).
*   **Bề mặt thẻ (Milk White surface):** `#FFFFFF` (màu trắng sữa tinh khiết để nổi bật nhẹ trên nền kem).
*   **Màu chủ đạo (Royal Cobalt):** `#0052CC` (màu xanh Cobalt hoàng gia lịch lãm, chiều sâu tốt, độ tương phản chuẩn WCAG AA).
*   **Màu văn bản phụ (Muted text):** `#4A5568` (xám ấm đậm giúp giữ lại sắc độ thân thiện của giao diện).

### 2.3. Bo góc & Phản hồi tương tác (Corners & Motion)
*   **Bo góc thùng chứa (Primary Container Radius):** Sử dụng `rounded-2xl` (`16px`) cho tất cả các thẻ Card lớn, tạo cảm giác hữu cơ, mềm mại.
*   **Bo góc nút bấm/ô nhập (Interactive Radius):** Sử dụng `rounded-xl` (`12px`) cho tất cả các nút bấm, Dialog, Form Inputs.
*   **Phản hồi xúc giác (Tactile Scale):** Thao tác nhấn nút bấm, lựa chọn tab đều tích hợp hiệu ứng co giãn lún cơ học nhạy bén:
    ```css
    transition-all duration-200 active:scale-[0.98]
    ```

---

## 3. Kiến trúc giao diện & Chi tiết các màn hình Hero

### 3.1. Hero 1: Màn hình Phòng & Khách thuê (`RoomsPage.jsx` & `RoomDetailPage.jsx`)
*   **Lưới thẻ phòng (Room Grid Card Layout):**
    *   Bảng HTML cũ sẽ được thay thế bằng lưới Grid Responsive hiển thị các thẻ phòng trực quan dạng Bento bất đối xứng.
    *   Mỗi thẻ phòng hiển thị: Tên phòng lớn đậm, Giá thuê cơ bản, Tầng, Diện tích và Huy hiệu Trạng thái pastel:
        *   `AVAILABLE`: `bg-emerald-50/80 text-emerald-700 border border-emerald-200/50`
        *   `OCCUPIED`: `bg-rose-50/80 text-rose-700 border border-rose-200/50`
        *   `MAINTENANCE`: `bg-amber-50/80 text-amber-700 border border-amber-200/50`
    *   *Hiệu ứng nâng thẻ di chuột:* Nâng nhẹ lên 2px và tỏa bóng mịn: `hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] duration-300`.
*   **Màn hình chi tiết Split-Screen 50/50:**
    *   *Cột bên trái:* Hiển thị Thẻ chi tiết phòng trọ bọc trong Bento Grid, liên kết thông tin khách thuê hiện tại.
    *   *Cột bên phải:* Tabs điều hướng mượt mà để chuyển đổi nhanh giữa: "Lịch sử hóa đơn" và "Tài liệu CCCD/Hợp đồng scan".
    *   *Khu vực Dropzone đính kèm tài liệu:* Bo góc `rounded-2xl`, viền nét đứt màu xanh Cobalt mảnh dẻ `border-dashed border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50/10 transition-all`.

### 3.2. Hero 2: Chi tiết Hóa đơn & Hộp thoại Kính mờ Thông báo (`InvoiceDetailPage.jsx`)
*   **Hóa đơn cao cấp dạng Minimalist E-Invoice:**
    *   Hóa đơn hiển thị như một hóa đơn điện tử thực thụ: Tiêu đề Serif tinh xảo, số hóa đơn nhỏ tinh gọn, các mục chi phí (tiền nhà, điện, nước, rác, phí dịch vụ khác) trình bày dạng lưới hai cột đối xứng hoàn hảo, sử dụng các nét đứt mờ nhạt làm đường phân cách thanh mảnh.
*   **Hộp thoại xem trước kính mờ (Glassmorphism Notification Dialog):**
    *   Bối cảnh hộp thoại sử dụng thuộc tính lọc mờ hậu cảnh ấn tượng: `backdrop-blur-md bg-white/75 border border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.05)]`.
    *   Bộ 4 nút chia sẻ thiết kế dạng Bento mini, rê chuột đổi màu Cobalt nhạt `hover:bg-blue-50/50 hover:border-blue-200/50`, bấm nút phản hồi xúc giác cơ học `active:scale-[0.97] duration-200`.
    *   Tích hợp trạng thái quay tròn nhẹ nhàng (loading pulse) tại nút "Đẩy Webhook" để tăng tính Visibility of System Status (Heuristics H1).

---

## 4. Bảo toàn Chiến lược Kiểm thử tự động (E2E Test Stability)
*   **Tuyệt đối không phá vỡ `data-testid`:** Toàn bộ các định danh kiểm thử tự động phục vụ Playwright (như `data-testid="room-card"`, `data-testid="send-zalo"`, `data-testid="invoice-total"`,...) PHẢI được bảo toàn nguyên vẹn trong mã nguồn khi chỉnh sửa giao diện.
*   **Kiểm thử đa thiết bị:** Chạy kiểm thử tự động Playwright trên 3 cấu hình màn hình chính (Desktop 1280px, Tablet 768px, Mobile 375px) để xác nhận không vỡ khung hay tràn viền chiều ngang.

---

## 5. Tiêu chí nghiệm thu thẩm mỹ (Design Acceptance Criteria)
*   [ ] 100% Phông chữ của ứng dụng được hiển thị bằng phông chữ **Outfit**.
*   [ ] Toàn bộ các nút bấm tương tác có chuyển động phản hồi cơ học `active:scale-[0.98]`.
*   [ ] Không sử dụng màu xanh/đỏ nguyên bản rập khuôn; sử dụng sắc màu Cobalt hoàng gia phối Kem nhạt và pastel dịu mắt.
*   [ ] Màn hình danh sách phòng trọ chuyển đổi sang dạng thẻ Room Card Grid hoàn chỉnh.
*   [ ] Màn hình chi tiết hóa đơn nhúng hộp thoại Kính mờ (Glassmorphism overlay) đẹp mắt khi gửi thông báo.
*   [ ] Toàn bộ các bộ test Playwright E2E vượt qua thành công, không gặp lỗi regression.
