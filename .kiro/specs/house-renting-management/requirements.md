# Requirements Document

## Introduction

Tài liệu này định nghĩa tập hợp các yêu cầu nghiệp vụ (Business Requirements) cho dự án **House Renting App** (Ứng dụng quản lý nhà trọ). 

Dự án được xây dựng nhằm giải quyết triệt để các vấn đề quản lý thủ công của các chủ nhà trọ quy mô nhỏ (từ 5 đến 20 phòng). Thay vì phải sử dụng sổ sách giấy tờ, các file Excel phức tạp hay các phần mềm SaaS đắt đỏ, ứng dụng cung cấp một giải pháp tự động hóa toàn bộ quy trình vận hành cốt lõi: quản lý phòng, lưu trữ thông tin khách thuê, tự động tính toán tiền điện/nước/phòng (bao gồm cả thuật toán chia ngày lẻ Pro-rata), tạo hóa đơn hàng loạt bằng một click, xuất PDF hóa đơn chuyên nghiệp đính kèm mã QR chuyển khoản ngân hàng và báo cáo doanh thu trực quan.

Hệ thống được thiết kế với triết lý **Product-Grade** (Chất lượng thương mại): giao diện trực quan, hoạt động mượt mà, phản hồi tức thì thông qua cơ chế quản lý trạng thái hiện đại, xử lý lỗi kiên cố và bảo mật cô lập dữ liệu tuyệt đối giữa các chủ trọ.

---

## Requirements

### Requirement 1: Quản lý Phòng trọ (Room Management)
**User Story:** Là một chủ nhà trọ, tôi muốn quản lý thông tin chi tiết và trạng thái của từng phòng trọ một cách trực quan, để tôi luôn biết được tình trạng trống/đầy và dễ dàng thiết lập giá thuê cho từng phòng.

#### Tiêu chí nghiệm thu (Acceptance Criteria)
1. **Hiển thị trực quan**: Hệ thống PHẢI hiển thị danh sách phòng trọ dưới dạng bảng lưới hoặc thẻ (cards) hiện đại, kèm theo huy hiệu (badge) màu sắc thể hiện rõ ràng trạng thái: Trống (`AVAILABLE` - màu xanh), Đang thuê (`OCCUPIED` - màu đỏ), hoặc Đang bảo trì (`MAINTENANCE` - màu vàng).
2. **Cấu hình đơn giá riêng**: Mỗi phòng trọ PHẢI cho phép thiết lập các thông tin độc lập bao gồm: Tên phòng (ví dụ: "Phòng 101"), Số tầng, Diện tích ($m^2$), Giá thuê cơ bản (VND/tháng), Đơn giá điện (VND/kWh), Đơn giá nước (VND/$m^3$) và Phí vệ sinh/rác (VND/tháng).
3. **Thao tác CRUD đầy đủ**: Chủ trọ CÓ THỂ Thêm mới, Chỉnh sửa thông tin và Xóa phòng trọ thông qua các form hộp thoại (Dialog modal) tiện dụng mà không cần tải lại trang.
4. **Xóa an toàn**: Khi thực hiện xóa phòng trọ, hệ thống PHẢI kiểm tra các ràng buộc dữ liệu liên quan. NẾU phòng đang có người thuê hoạt động hoặc có hóa đơn liên kết, hệ thống PHẢI ngăn chặn hành vi xóa cứng và thông báo lỗi rõ ràng cho người dùng để tránh mâu thuẫn dữ liệu.
5. **Xem chi tiết phòng**: Khi nhấn chọn một phòng trọ, hệ thống PHẢI hiển thị trang chi tiết chứa đầy đủ thông tin phòng, danh sách khách thuê hiện tại và lịch sử tất cả các hóa đơn đã xuất cho phòng đó để dễ dàng đối soát.

---

### Requirement 2: Quản lý Khách thuê và Tài liệu (Tenant & Document Management)
**User Story:** Là một chủ nhà trọ, tôi muốn lưu trữ hồ sơ thông tin cá nhân và tài liệu hợp đồng, CCCD của khách thuê, để tôi dễ dàng quản lý thông tin pháp lý và thực hiện thủ tục trả phòng nhanh chóng khi hết hạn.

#### Tiêu chí nghiệm thu (Acceptance Criteria)
1. **Quản lý danh sách tiện lợi**: Hệ thống PHẢI cung cấp danh sách khách thuê dạng thẻ (Cards) hiện đại, hỗ trợ bộ lọc nhanh theo trạng thái hoạt động: Đang thuê (`Active`) hoặc Đã chuyển đi (`Inactive`).
2. **Quy trình nhận phòng (Check-in)**: Khi thêm khách thuê mới vào một phòng trống (`AVAILABLE`), hệ thống PHẢI yêu cầu điền các thông tin: Họ tên, Số điện thoại, Số CCCD, Ngày bắt đầu ở (`moveInDate`), Số tiền đặt cọc (`deposit`), và Ngày dự kiến trả phòng (`moveOutDate` - tùy chọn). Sau khi lưu thành công, hệ thống PHẢI tự động chuyển trạng thái phòng đó sang `OCCUPIED`.
3. **Ngăn chặn trùng lặp**: NẾU chủ trọ cố tình xếp khách vào một phòng đã có người (`OCCUPIED`), hệ thống PHẢI ngăn chặn hành vi và hiển thị cảnh báo lỗi `ROOM_OCCUPIED`.
4. **Upload tài liệu đám mây**: Trong trang chi tiết khách thuê, hệ thống PHẢI cung cấp khu vực kéo thả (Dropzone) để upload các tệp đính kèm như ảnh CCCD mặt trước/sau, bản chụp hợp đồng thuê nhà. Các tệp này PHẢI được tải trực tiếp lên Cloudinary và lưu liên kết an toàn dưới dạng các bản ghi `TenantFile`.
5. **Quy trình trả phòng an toàn (Check-out)**: Khi khách thuê kết thúc hợp đồng, chủ trọ CÓ THỂ nhấn nút "Trả phòng" (hoặc xóa khách thuê). Hệ thống PHẢI thực hiện **Soft Delete** bằng cách chuyển trạng thái của khách thuê sang `active = false` (lưu trữ lịch sử) và tự động giải phóng trạng thái phòng tương ứng về trống (`AVAILABLE`).

---

### Requirement 3: Quản lý Hóa đơn & Thuật toán Tính tiền tự động (Invoices & Rent Calculation)
**User Story:** Là một chủ nhà trọ, tôi muốn hệ thống tự động tính toán tiền phòng lẻ ngày, tiền điện nước theo chỉ số thực tế và cho phép tôi tạo nhanh hóa đơn hàng loạt hoặc xuất PDF gửi khách thuê qua Zalo/SMS, để tôi tiết kiệm thời gian tính toán thủ công mỗi cuối tháng.

#### Tiêu chí nghiệm thu (Acceptance Criteria)
1. **Thuật toán Pro-rata tính tiền phòng theo ngày**: Khi tạo hóa đơn, hệ thống PHẢI tự động áp dụng công thức chia tỷ lệ theo ngày thực tế ở nếu thời gian thuê trong kỳ (`periodStart` đến `periodEnd`) ít hơn số ngày của tháng đó:
   $$\text{daysInPeriod} = \text{periodEnd} - \text{periodStart} + 1$$
   $$\text{proRataRent} = \text{round}\left(\frac{\text{baseRent} \times \text{daysInPeriod}}{\text{daysInMonth}}\right)$$
2. **Tính tiền điện nước chính xác**: Tiền điện và nước PHẢI được tính dựa trên hiệu số chỉ số mới và chỉ số cũ nhân với đơn giá cấu hình tại phòng trọ đó:
   $$\text{electricCost} = (\text{electricityNow} - \text{electricityPrev}) \times \text{electricityPrice}$$
   $$\text{waterCost} = (\text{waterNow} - \text{waterPrev}) \times \text{waterPrice}$$
3. **Tổng tiền tự động trên backend**: Toàn bộ công thức tính toán PHẢI được thực thi nghiêm ngặt tại backend service để đảm bảo tính nhất quán dữ liệu, không để frontend tự tính toán và gửi lên.
4. **Quy trình tạo hóa đơn hàng loạt (Bulk Create)**: 
   - Hệ thống PHẢI cung cấp giao diện tạo hóa đơn hàng loạt cho tháng mới.
   - Khi chủ trọ chọn Tháng/Năm, hệ thống PHẢI quét toàn bộ các phòng đang có người (`OCCUPIED`).
   - Hệ thống PHẢI tự động lấy chỉ số điện/nước mới (`electricityNow`, `waterNow`) của hóa đơn tháng liền trước làm chỉ số cũ (`electricityPrev`, `waterPrev`) của hóa đơn tháng này.
   - Hệ thống PHẢI hiển thị danh sách các phòng trọ kèm ô nhập chỉ số mới trên cùng một màn hình để chủ trọ nhập nhanh, sau đó nhấn "Tạo hàng loạt" để tạo toàn bộ hóa đơn chỉ với 1 click chuột.
5. **Ghi nhận thanh toán linh hoạt (Mark as Paid)**: 
   - Chủ trọ CÓ THỂ cập nhật số tiền thực tế thu được từ khách (`paidAmount`).
   - Hệ thống PHẢI tự động chuyển trạng thái hóa đơn sang đã thanh toán (`paid = true`) NẾU `paidAmount >= totalAmount`.
   - NẾU khách thanh toán thiếu (`paidAmount < totalAmount`), hệ thống PHẢI giữ trạng thái `paid = false`, cập nhật `paidAmount` đã thu và hiển thị số tiền còn nợ trên giao diện.
6. **Tạo và in PDF chất lượng cao và tích hợp mã QR**:
   - Hệ thống PHẢI hỗ trợ tạo file PDF hóa đơn tự động từ backend sử dụng thư viện `pdf-lib`.
   - File PDF PHẢI hiển thị đầy đủ, đẹp mắt tiếng Việt Unicode có dấu (thông qua nhúng font Segoe UI TTF có sẵn) để tránh lỗi hiển thị ô vuông hoặc ký tự lạ.
   - **Tích hợp mã QR tĩnh/động linh hoạt**:
     - *Ưu tiên ảnh QR tĩnh có sẵn*: Hệ thống PHẢI kiểm tra sự hiện diện của tệp cấu hình mã QR tĩnh cố định tại đường dẫn `backend/assets/qr_code.png`. Nếu tệp này tồn tại, hệ thống PHẢI nhúng trực tiếp ảnh QR này vào tệp PDF hóa đơn. Ảnh phải được giữ đúng tỷ lệ khung hình đứng dọc đặc thù của thẻ Techcombank (kích thước đề xuất: rộng `110`, cao `215`), giúp hiển thị trọn vẹn, sắc nét và chuyên nghiệp không bị méo.
     - *Cơ chế dự phòng động (VietQR Fallback)*: Nếu tệp ảnh tĩnh trên không tồn tại, hệ thống PHẢI tự động chuyển sang cơ chế sinh mã QR động (VietQR) dựa trên thông tin cài đặt ngân hàng (số tài khoản, tên ngân hàng) và số tiền hóa đơn.
   - **Tiêu chuẩn VietQR (Dành cho cơ chế dự phòng động)**: Chuỗi mã QR động được sinh ra PHẢI tuân thủ nghiêm ngặt tiêu chuẩn EMVCo và Napas 24/7. Điều này bao gồm việc tích hợp các thẻ bắt buộc:
     - *Thẻ 01 (Point of Initiation Method)*: Đặt thành `"12"` (Dynamic QR) khi có số tiền thanh toán, và `"11"` (Static QR) khi không có số tiền.
     - *Thẻ 52 (Merchant Category Code)*: Thiết lập giá trị mặc định là `"0000"`.
     - *Thẻ 59 (Merchant Name)*: Sử dụng tên thương hiệu nhà trọ của chủ trọ (chuẩn hóa thành tiếng Việt không dấu viết hoa) hoặc mặc định `"HOUSE RENTING"`.
     - *Thẻ 60 (Merchant City)*: Thiết lập giá trị mặc định là `"HA NOI"`.
     - *Thẻ 54 (Transaction Amount)*: Số tiền PHẢI là số nguyên làm tròn (vì VND không có phần thập phân).
     - *Thẻ 62 Sub-tag 08 (Purpose of Transaction)*: Nội dung thanh toán PHẢI được chuẩn hóa thành tiếng Việt không dấu viết hoa không chứa ký tự đặc biệt, giới hạn tối đa 25 ký tự.
   - **Yêu cầu kiểm thử tự động**: Hệ thống PHẢI có các kịch bản kiểm thử tự động (Unit Test / Integration Test) để kiểm tra thuật toán phân tích thông tin cài đặt ngân hàng (`parsePaymentInfo`) và thuật toán sinh chuỗi VietQR (`buildVietQRString`) nhằm bảo vệ tính bền vững của tính năng thanh toán này trước các lỗi suy thoái (regressions).
7. **Xuất dữ liệu CSV**: Hệ thống PHẢI cung cấp tính năng xuất toàn bộ danh sách hóa đơn theo năm ra tệp CSV để chủ trọ lưu trữ hoặc nhập vào các phần mềm kế toán khác.

---

### Requirement 4: Bảng điều khiển Thống kê trực quan (Dashboard & Analytics)
**User Story:** Là một chủ nhà trọ, tôi muốn xem nhanh báo cáo doanh thu, tỷ lệ lấp đầy phòng và các cảnh báo khẩn cấp ngay khi đăng nhập, để tôi có cái nhìn tổng quan về hiệu quả kinh doanh của mình.

#### Tiêu chí nghiệm thu (Acceptance Criteria)
1. **Các chỉ số tổng quan (Stat Cards)**: Ngay tại trang Dashboard, hệ thống PHẢI hiển thị 4 chỉ số cốt lõi:
   - Tổng doanh thu thực tế thu được trong tháng hiện tại (VND).
   - Số lượng phòng đang có khách thuê (`Occupied Rooms`) và tỷ lệ phần trăm lấp đầy.
   - Số lượng phòng trống (`Available Rooms`).
   - Tổng số tiền cọc hiện đang giữ của tất cả khách thuê hoạt động (VND).
2. **Widget Cảnh báo thông minh (Alert Lists)**:
   - **Phòng chưa thanh toán**: Liệt kê danh sách tất cả các phòng trọ chưa đóng đủ tiền điện nước/phòng của tháng hiện tại kèm số tiền còn nợ để chủ trọ nhanh chóng đôn đốc.
   - **Hợp đồng sắp hết hạn**: Liệt kê danh sách khách thuê có ngày dự kiến trả phòng (`moveOutDate`) trong vòng 30 ngày tới để chủ trọ chuẩn bị kế hoạch tìm khách mới hoặc gia hạn.
3. **Biểu đồ doanh thu (Revenue Chart)**: Hiển thị biểu đồ cột (Bar Chart) trực quan thể hiện doanh thu thực tế thu được qua từng tháng trong vòng 6 tháng gần nhất bằng thư viện `Recharts`.
4. **Biểu đồ tỷ lệ lấp đầy (Occupancy Chart)**: Hiển thị biểu đồ đường (Line Chart) mô tả xu hướng biến động tỷ lệ lấp đầy phòng trọ qua 6 tháng gần nhất để theo dõi hiệu suất phòng.

---

### Requirement 5: Cấu hình Nhà trọ và Thanh toán (Landlord Settings)
**User Story:** Là một chủ nhà trọ, tôi muốn cấu hình thông tin cá nhân, tên thương hiệu nhà trọ và tài khoản nhận tiền của mình, để thông tin này tự động hiển thị chuyên nghiệp trên hóa đơn PDF gửi khách hàng.

#### Tiêu chí nghiệm thu (Acceptance Criteria)
1. **Thông tin cơ bản**: Chủ trọ CÓ THỂ cập nhật các thông tin cài đặt bao gồm: Tên hiển thị (ví dụ: "Nhà trọ Hoa Hồng"), Địa chỉ nhà trọ, Số điện thoại liên hệ, và Logo nhà trọ (upload lên Cloudinary).
2. **Cấu hình ngân hàng thanh toán**: Chủ trọ CÓ THỂ cấu hình thông tin tài khoản bao gồm: Tên ngân hàng thụ hưởng (chọn từ danh sách ngân hàng phổ biến), Số tài khoản ngân hàng, và Tên chủ tài khoản. Thông tin này PHẢI được mã hóa và truyền vào API VietQR để tự động hiển thị mã QR động trên PDF hóa đơn.

---

### Requirement 6: Xác thực, Bảo mật và Kiên cố hệ thống (Auth, Security & System Resilience)
**User Story:** Là một người dùng chủ trọ, tôi muốn hệ thống của tôi phải bảo mật tuyệt đối, không bị lộ dữ liệu phòng trọ hay doanh thu cho chủ trọ khác, và hệ thống phải chạy ổn định ngay cả khi backend khởi động chậm.

#### Tiêu chí nghiệm thu (Acceptance Criteria)
1. **Cơ chế xác thực JWT bảo mật**:
   - Hệ thống PHẢI áp dụng cơ chế xác thực JWT Bearer Token.
   - **Access Token** ngắn hạn (15 phút) PHẢI được lưu hoàn toàn trong bộ nhớ RAM ở phía client (Zustand state), không lưu ở cookie hay localStorage để chống tấn công XSS.
   - **Refresh Token** dài hạn (7 ngày) PHẢI được lưu ở localStorage để duy trì trạng thái đăng nhập.
   - Hệ thống PHẢI tích hợp cơ chế **Silent Refresh** sử dụng Axios Interceptors. Khi Access Token hết hạn, client PHẢI tự động gửi Refresh Token lên API `/api/auth/refresh` để lấy Access Token mới một cách âm thầm mà không làm gián đoạn trải nghiệm của người dùng.
2. **Cô lập dữ liệu tuyệt đối (Data Isolation)**: Mọi truy vấn đọc/ghi dữ liệu vào PostgreSQL qua Prisma ORM ở phía backend PHẢI được ràng buộc nghiêm ngặt bằng điều kiện `userId = req.user.id` (lấy từ JWT token đã được xác thực). Tuyệt đối không cho phép bất kỳ API nào truy xuất chéo dữ liệu giữa các tài khoản khác nhau.
3. **Chống spam API**: Backend PHẢI tích hợp middleware `express-rate-limit` giới hạn tối đa 100 requests trong vòng 15 phút từ cùng một địa chỉ IP để bảo vệ server khỏi các cuộc tấn công DDoS cơ bản.
4. **Xử lý Backend Free-tier ngủ đông (Cold Start)**: Vì backend triển khai trên Render Free Tier sẽ tự động ngủ sau 15 phút không hoạt động, hệ thống PHẢI có:
   - Hệ thống keep-alive ping tự động từ dịch vụ bên thứ ba (như cron-job.org) gọi `/api/health` mỗi 14 phút để giữ server luôn thức.
   - Giao diện Frontend PHẢI có **WakeUpBanner** hiển thị thông báo thân thiện và hiển thị thanh trạng thái chờ đợi NẾU request đầu tiên bị trễ quá 10 giây (timeout được cấu hình lên đến 60 giây cho request đầu tiên), tránh để màn hình bị đơ hoặc báo lỗi trắng.

---

### Requirement 7: Sao lưu Tự động & Nhắc nhở Đóng tiền (Auto Backup & Smart Notifications)
**User Story:** Là một chủ nhà trọ, tôi muốn dữ liệu của tôi được sao lưu an toàn mỗi ngày và tôi muốn có cách nhanh chóng để gửi tin nhắn thông báo tiền phòng cho khách thuê qua Zalo hoặc SMS mà không phải tự nhập liệu thủ công.

#### Tiêu chí nghiệm thu (Acceptance Criteria)
1. **Hệ thống Sao lưu tự động lên Google Drive**:
   - Hệ thống PHẢI thiết lập kịch bản **GitHub Actions** tự động chạy vào lúc 2:00 AM giờ Việt Nam (`19:00 UTC`) hàng ngày.
   - Kịch bản PHẢI sử dụng `pg_dump` để xuất bản sao lưu đầy đủ cơ sở dữ liệu Neon PostgreSQL và tự động tải lên thư mục Google Drive của chủ trọ thông qua Google API Service Account.
2. **Giao diện Gửi thông báo nhắc nợ hóa đơn**:
   - Trong trang chi tiết hóa đơn, hệ thống PHẢI cung cấp nút **"Gửi thông báo"**.
   - Khi nhấn nút, hệ thống PHẢI hiển thị hộp thoại xem trước (Modal Preview) nội dung tin nhắn được biên soạn tự động rất trực quan chứa đầy đủ thông tin: tên nhà trọ, số phòng, khách thuê, chỉ số điện/nước cũ và mới, tổng số tiền, hướng dẫn thanh toán và đường dẫn link xem hóa đơn trực tuyến.
3. **Tính năng chia sẻ đa kênh tiện lợi**:
   - Hộp thoại PHẢI cung cấp 4 tùy chọn chia sẻ:
     - **Copy tin nhắn**: Sao chép nội dung đã được định dạng.
     - **Gửi qua Zalo**: Tự động sao chép tin nhắn vào clipboard và mở khung chat Zalo tương ứng với số điện thoại của khách thuê.
     - **Gửi SMS**: Mở ứng dụng gửi tin nhắn SMS mặc định trên điện thoại với tin soạn sẵn đầy đủ (loại bỏ các dấu sao markdown để tương thích tối đa).
     - **Chia sẻ nhanh**: Sử dụng Web Share API của hệ điều hành để chia sẻ trực tiếp sang Messenger, Viber, Gmail,... trên thiết bị di động.
4. **Tích hợp Webhook đẩy dữ liệu tự động**:
   - Chủ trọ CÓ THỂ cấu hình một đường dẫn `Webhook URL` trong Cài đặt.
   - Khi bấm nút **"Đẩy Webhook"**, backend PHẢI đẩy gói tin dữ liệu JSON hóa đơn đầy đủ cùng thông tin định dạng Discord-compatible sang webhook để chủ trọ tích hợp vào các kênh chat Discord/Telegram hoặc các hệ thống tự động hóa Make/n8n.
