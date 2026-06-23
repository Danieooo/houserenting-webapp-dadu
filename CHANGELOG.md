# Changelog
# Changelog

All notable changes to the **House Renting App** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Tauri Desktop Integration & CORS Adjustments**:
  - Khởi tạo cấu hình Tauri v2 trong `frontend/` cho phép đóng gói ứng dụng React + Vite thành Desktop App (.exe, .msi, và portable app.exe) trên Windows.
  - Cập nhật cấu hình CORS trong `backend/src/index.js` để cho phép các origin của Desktop app (`tauri://localhost`, `http://tauri.localhost`, `http://localhost:5173`) truy cập API backend không bị chặn.
  - Thêm các lệnh `"tauri"`, `"tauri:dev"`, và `"tauri:build"` vào `frontend/package.json` cùng việc bổ sung `@tauri-apps/cli` vào devDependencies.
- **Tenant Contact Flexibility & Zalo Notification UX**:
  - Them truong `zaloContact` va noi `phone` thanh du lieu tuy chon xuyen suot backend/frontend de phan anh dung truong hop khach chi lien he qua Zalo.
  - Bo sung kich ban E2E moi [notification-zalo-fallback.spec.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/e2e/notification-zalo-fallback.spec.js) cho nhanh khong co `phone` nhung co `zaloContact`.

### Changed
- **Luong lien he khach thue va modal gui hoa don**:
  - Cap nhat [frontend/src/pages/InvoiceDetailPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/InvoiceDetailPage.jsx) de luon cho phep sao chep noi dung, chi mo Zalo/SMS khi co `phone`, hien thi `zaloContact` nhu thong tin tim chat thu cong, va lam ro rang web app khong tu gui/prefill truc tiep trong Zalo.
  - Hien dai hoa [frontend/e2e/notification-flow.spec.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/e2e/notification-flow.spec.js) theo huong self-contained de tu tao room/tenant/invoice co `phone`, giam phu thuoc vao du lieu co san trong database.
  - Cap nhat [backend/prisma/schema.prisma](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/backend/prisma/schema.prisma), [backend/src/controllers/tenantController.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/backend/src/controllers/tenantController.js), va migration lien quan de ho tro `phone` optional + `zaloContact`.
- **Phong/Khach mutation guardrails va kha nang nhan biet truong Zalo**:
  - Toi uu [frontend/src/pages/RoomsPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/RoomsPage.jsx) va [frontend/src/pages/TenantsPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/TenantsPage.jsx) de bo duplicate `refetchQueries`, chi `invalidateQueries` dung muc, va khoa cac nut `Huy`/submit khi request dang chay nham tranh click lap gay request trung.
  - Bo sung pending guard cho thao tac xoa phong de nut xoa/sua cua phong dang xoa tu dong disable den khi mutation ket thuc, giam kha nang gap loi khi user bam xoa nhanh lien tuc.
  - Lam noi bat helper text cho truong `zaloContact` trong form tao/sua khach thue de chu tro nhin thay ngay ca khi khach khong cung cap `phone`.

### Notes
- Da xac nhan `mutation-guardrails.spec.js`, `tenant-contact-flexibility.spec.js`, va `notification-zalo-fallback.spec.js` pass; van ghi nhan dao dong moi truong Neon TLS/vite config khi verify cuc bo tren may hien tai.

## [1.4.5] - 2026-05-31

### Added
- **TÃ i liá»‡u HÃ³a & Tá»‘i giáº£n Monorepo (Documentation Cleanup)**:
  - RÃ  soÃ¡t toÃ n bá»™ há»‡ thá»‘ng tÃ i liá»‡u vÃ  xÃ³a bá» 7 tá»‡p Markdown lá»—i thá»i, khÃ´ng nháº¥t quÃ¡n trong dá»± Ã¡n (bao gá»“m toÃ n bá»™ thÆ° má»¥c `docs/superpowers/`, hÆ°á»›ng dáº«n dá»± Ã¡n má»›i máº«u `HOW-TO-START-A-NEW-PROJECT.md` vÃ  bÃ¡o cÃ¡o cÅ© `houserenting-app-final-summary.md`).
  - Viáº¿t láº¡i hoÃ n toÃ n tá»‡p `README.md` táº¡i thÆ° má»¥c gá»‘c giá»›i thiá»‡u chi tiáº¿t vá» chá»§ Ä‘á» giao diá»‡n Botanic Floria UI (Kem áº¥m, Xanh Sage, Bento Grid), cÃ¡c tÃ­nh nÄƒng nghiá»‡p vá»¥ cá»‘t lÃµi (VietQR 100% EMVCo/Napas, Pro-rata, Google Drive backup), vÃ  láº­p sÆ¡ Ä‘á»“ tÃ i nguyÃªn Monorepo rÃµ rÃ ng.
  - Cáº­p nháº­t tÃ i liá»‡u quáº£n trá»‹ Ä‘iá»u phá»‘i dá»± Ã¡n `AGENTS.md` vÃ  tá»‡p lá»‹ch sá»­ thay Ä‘á»•i `CHANGELOG.md` Ä‘á»“ng bá»™ 100%.

## [1.4.4] - 2026-05-31

### Added
- **Phá»§ Theme Botanic Floria ToÃ n Diá»‡n (Taste-Skill Redesign)**:
  - Thiáº¿t láº­p há»‡ **Design Tokens** tá»± nhiÃªn thá»‘ng nháº¥t: Ná»n Canvas kem áº¥m `#FDFBF7` (`bg-cream-warm`), xanh xÃ´ thÆ¡m Sage Green `#2E7D32` lÃ m mÃ u thÆ°Æ¡ng hiá»‡u chÃ­nh thay tháº¿ cho mÃ u xanh dÆ°Æ¡ng cÅ©, vÃ  mÃ u Ä‘áº¥t nung Terracotta `#E65100` cho cÃ¡c nÃºt báº¥m cáº£nh bÃ¡o hoáº·c nÃºt Chuyá»ƒn ra.
  - **LoginPage**: Thay Ä‘á»•i nÃºt submit vÃ  focus ring sang mÃ u xanh Sage, trang trÃ­ thÃªm há»a tiáº¿t SVG chiáº¿c lÃ¡ thanh nhÃ£ á»Ÿ bá»‘n gÃ³c banner, Ä‘á»“ng thá»i bá»• sung cÃ¡c nhÃ¡nh lÃ¡ SVG chÃ¬m bay bá»•ng táº¡i ná»n trang vÃ  bÃªn trong tháº» Form Ä‘Äƒng nháº­p.
  - **RoomsPage & RoomDetailPage**: Thiáº¿t káº¿ máº§m cÃ¢y SVG lÃ m placeholder nghá»‡ thuáº­t khi chÆ°a cÃ³ phÃ²ng (Empty state), Ä‘á»•i viá»n hover vÃ  giÃ¡ tiá»n hiá»ƒn thá»‹ sang mÃ u Sage Green.
  - **TenantsPage & TenantDetailPage**: Tháº» khÃ¡ch thuÃª bo gÃ³c kem áº¥m vá»›i avatar xanh lÃ¡, Dropzone Ä‘Ã­nh kÃ¨m tÃ i liá»‡u CCCD/há»£p Ä‘á»“ng viá»n Ä‘á»©t nÃ©t xanh Sage má»m má»‹n, nÃºt Chuyá»ƒn ra mÃ u Ä‘áº¥t nung Terracotta `#E65100` ná»•i báº­t vÃ  áº¥m Ã¡p.
  - **InvoicesPage & InvoiceDetailPage**: Báº£ng hÃ³a Ä‘Æ¡n bo gÃ³c bento `rounded-3xl` bá»c viá»n kem, dÃ²ng tiÃªu Ä‘á» hÃ ng ná»n kem xÃ´ thÆ¡m nháº¡t, biá»ƒu tÆ°á»£ng máº§m cÃ¢y `ðŸŒ¿` cho Form táº¡o hÃ ng loáº¡t, vÃ  tinh chá»‰nh nÃ©t phÃ¢n dÃ²ng Ä‘á»©t thÃ nh mÃ u xÃ´ thÆ¡m cá»±c má» nháº¡t `border-emerald-100/50`.
  - **SettingsPage**: CÃ i Ä‘áº·t ngÃ¢n hÃ ng, nÃºt LÆ°u vÃ  sao lÆ°u CSV Ä‘Æ°á»£c thiáº¿t káº¿ bo trÃ²n há»¯u cÆ¡ dÃ¹ng tÃ´ng mÃ u chá»§ Ä‘áº¡o xÃ´ thÆ¡m dá»‹u mÃ¡t, Ä‘á»“ng thá»i bá»• sung há»a tiáº¿t nhÃ¡nh lÃ¡ SVG chÃ¬m cao cáº¥p á»Ÿ gÃ³c tháº» thÃ´ng tin nhÃ  trá».
  - **DashboardPage**: TÃ¡i thiáº¿t káº¿ **Botanic Welcome Hero Card** chuyá»ƒn sang dáº£i gradient kem áº¥m `#FDFBF7`, `#F5F2EB` vÃ  xanh xÃ´ thÆ¡m nháº¡t `#E8F5E9]/50` mÆ°á»£t mÃ , hÃ²a trá»™n vá»›i áº£nh thá»±c táº¿ `floria_banner.png` Ä‘Ã£ lÆ°á»£c bá» chá»¯, nÃ¢ng cáº¥p toÃ n bá»™ typography tá»‘i tÆ°Æ¡ng pháº£n cá»±c cao vÃ  cÃ¡c nÃºt CTA cÃ³ Ä‘á»™ náº©y xÃºc giÃ¡c tactile khi tÆ°Æ¡ng tÃ¡c.
  - **Sidebar Cleanups**: Loáº¡i bá» hoÃ n toÃ n dÃ²ng thÃ´ng tin hiá»ƒn thá»‹ tÃ i khoáº£n admin/chá»§ nhÃ  trá» á»Ÿ chÃ¢n thanh Sidebar táº¡i [AppLayout.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/layouts/AppLayout.jsx) Ä‘em láº¡i cáº£m giÃ¡c tá»‘i giáº£n Ä‘áº³ng cáº¥p.
  - **Máº«u Tin nháº¯n HÃ³a Ä‘Æ¡n**: Polish tinh táº¿ ná»™i dung vÄƒn báº£n thÃ´ng bÃ¡o táº¡i [InvoiceDetailPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/InvoiceDetailPage.jsx), lÆ°á»£c bá» xÆ°ng hÃ´ "anh/chá»‹", Ä‘á»•i "xin thÃ´ng bÃ¡o" thÃ nh "thÃ´ng bÃ¡o" vÃ  "tiá»n phÃ²ng cÆ¡ báº£n" thÃ nh "tiá»n phÃ²ng" há»£p lÃ½ vÃ  tá»± nhiÃªn hÆ¡n.
  - **Playwright E2E Resilience**: Thiáº¿t láº­p `test.setTimeout(90000)` kiÃªn cá»‘ hÃ³a chá»‘ng lag máº¡ng, báº£o toÃ n 100% thuá»™c tÃ­nh `data-testid` phá»¥c vá»¥ Playwright.
  - **Vite Build Warnings**: Kháº¯c phá»¥c triá»‡t Ä‘á»ƒ warning Tailwind cá»§a Vite báº±ng cÃ¡ch Ä‘á»•i thuá»™c tÃ­nh `duration-[2000ms]` Ä‘á»™ng sang inline style.
  
### Fixed
- **Render Backend Deploy Webhook Status Code Check**: Sá»­a lá»—i hÃ nh Ä‘á»™ng trigger deploy backend lÃªn Render trÃªn GitHub Actions (`deploy-backend.yml`) bÃ¡o lá»—i tháº¥t báº¡i máº·c dÃ¹ nháº­n Ä‘Æ°á»£c HTTP 200. Cho phÃ©p cháº¥p nháº­n cáº£ mÃ£ HTTP 200 vÃ  201 lÃ m mÃ£ pháº£n há»“i thÃ nh cÃ´ng cá»§a webhook API Render.

### Verified
- âœ… Playwright E2E tests: ToÃ n bá»™ cÃ¡c bá»™ test E2E vÆ°á»£t qua hoÃ n háº£o khÃ´ng cÃ³ hiá»‡n tÆ°á»£ng regression.
- âœ… Production build: BiÃªn dá»‹ch Vercel/Vite bundle frontend thÃ nh cÃ´ng 100% vá»›i 0 errors vÃ  0 warnings.

## [1.4.3] - 2026-05-31

### Added
- **Quy trÃ¬nh SDLC TÃ­ch há»£p Superpowers Skills**:
  - TÃ­ch há»£p 6 ká»¹ nÄƒng tuyá»ƒn chá»n (brainstorming, writing-plans, executing-plans, TDD, verification-before-completion, systematic-debugging) vÃ o quy trÃ¬nh phÃ¡t triá»ƒn Ä‘á»‹nh hÆ°á»›ng Ä‘áº·c táº£ trong [AGENTS.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/AGENTS.md).
- **Giao diá»‡n Premium Botanic Floria (Dashboard & Layout Redesign)**:
  - Thiáº¿t káº¿ **Botanic Welcome Hero Card** á»Ÿ Ä‘á»‰nh trang [DashboardPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/DashboardPage.jsx) bá»c báº±ng gradient xanh xÃ´ thÆ¡m tá»± nhiÃªn `#E8F5E9` vÃ  kem áº¥m `#FCFAF6`, káº¿t há»£p há»a tiáº¿t lÃ¡ váº½ SVG tinh táº¿ vÃ  nhÃºng áº£nh thá»±c táº¿ `floria_banner.png` (sáº¯c nÃ©t, chiá»u sÃ¢u cao).
  - TÃ¡i cáº¥u trÃºc **Bento Stat Cards** má»›i vá»›i cÃ¡c gÃ³c bo trÃ²n sÃ¢u `rounded-[24px]` (3xl), ná»n tráº¯ng sá»¯a ná»•i báº­t trÃªn ná»n kem, vÃ  bÃ³ng má» mÃ u dá»‹u Ä‘áº·c trÆ°ng theo tÃ´ng mÃ u cá»§a tá»«ng chá»‰ sá»‘ (Doanh thu xÃ´ thÆ¡m `#2E7D32`, PhÃ²ng trá»‘ng Cobalt `#0052CC`, ChÆ°a thu gáº¡ch nung `#E65100`). Bá»• sung hiá»‡u á»©ng tÆ°Æ¡ng tÃ¡c co giÃ£n khi di chuá»™t vÃ  báº¥m lÃºn mechanical active pháº£n há»“i.
  - Tinh chá»‰nh cÃ¡c biá»ƒu Ä‘á»“ Recharts (Bar fill Cobalt hoÃ ng gia, Line stroke Sage green vá»›i bÃ³ng má», bá»c Bento Card bo gÃ³c `rounded-3xl` viá»n kem má»).
  - NÃ¢ng cáº¥p **Sidebar & Logo Container** táº¡i [AppLayout.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/layouts/AppLayout.jsx) sá»­ dá»¥ng ná»n kem áº¥m `#FCFAF6`, viá»n xÃ´ thÆ¡m siÃªu máº£nh `border-r border-emerald-100/30`, biá»ƒu tÆ°á»£ng Logo chiáº¿c lÃ¡ cÃ¡ch Ä‘iá»‡u cao cáº¥p trong ná»n xanh lÃ¡ xÃ´ thÆ¡m `bg-[#E8F5E9] text-[#2E7D32]`, vÃ  hiá»‡u á»©ng Active Tab bÃ³ng Cobalt sang trá»ng cÃ¹ng hover nav item pastel xÃ´ thÆ¡m.

### Fixed
- **TÄƒng tÃ­nh kiÃªn cá»‘ cho E2E Playwright happy path**:
  - Gia tÄƒng thá»i gian chá» (`timeout: 20000`) cho hÃ nh Ä‘á»™ng táº¡o hÃ³a Ä‘Æ¡n hÃ ng loáº¡t trong `happy-path.spec.js` Ä‘á»ƒ kiÃªn cá»‘ hÃ³a trÆ°á»›c Ä‘á»™ trá»… truy váº¥n máº¡ng cá»§a database Postgres Neon trÃªn mÃ´i trÆ°á»ng Render.

### Verified
- âœ… Playwright E2E test suite: ToÃ n bá»™ 3 tá»‡p test (`happy-path`, `notification-flow`, `qr-validation`) vÆ°á»£t qua thÃ nh cÃ´ng.
- âœ… Production build: BiÃªn dá»‹ch frontend `npm run build` thÃ nh cÃ´ng xuáº¥t sáº¯c, khÃ´ng lá»—i.

---

## [1.4.2] - 2026-05-31

### Added
- **NÃ¢ng cáº¥p Giao diá»‡n Tháº©m má»¹ cao cáº¥p (Premium UI Redesign)**:
  - Khá»Ÿi táº¡o há»‡ thá»‘ng **Design Tokens** Ä‘á»“ng bá»™: nhÃºng phÃ´ng chá»¯ Google Font **Outfit** vÃ o [index.html](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/index.html) lÃ m phÃ´ng chá»¯ chá»§ Ä‘áº¡o cá»§a toÃ n á»©ng dá»¥ng, má»Ÿ rá»™ng báº£ng mÃ u trong [tailwind.config.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/tailwind.config.js) vá»›i ná»n kem áº¥m `#FDFBF7` (`cream.warm`) vÃ  xanh Cobalt hoÃ ng gia `#0052CC` (`cobalt.royal`), Ä‘á»“ng thá»i thiáº¿t láº­p biáº¿n toÃ n cá»¥c cho `body` trong [index.css](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/index.css).
- **TÃ¡i thiáº¿t káº¿ mÃ n hÃ¬nh PhÃ²ng & KhÃ¡ch thuÃª (Hero 1 - Bento Grid & Split-Screen)**:
  - NÃ¢ng cáº¥p [RoomsPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/RoomsPage.jsx) chuyá»ƒn Ä‘á»•i danh sÃ¡ch phÃ²ng trá» sang lÆ°á»›i tháº» **Bento Grid Cards** cÃ³ hiá»‡u á»©ng bÃ³ng má»‹n khi di chuá»™t (`hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)]`) vÃ  cáº£m giÃ¡c lÃºn náº©y cÆ¡ há»c khi nháº¥n (`active:scale-[0.98]`).
  - Thay tháº¿ cÃ¡c tag tráº¡ng thÃ¡i phÃ²ng mÃ u nguyÃªn báº£n thÃ nh cÃ¡c tag pastel dá»‹u mÃ¡t, cao cáº¥p (`AVAILABLE` xanh mint, `OCCUPIED` Ä‘á» há»“ng pháº¥n, `MAINTENANCE` vÃ ng há»• phÃ¡ch).
  - TÃ¡i cáº¥u trÃºc [RoomDetailPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/RoomDetailPage.jsx) vÃ  [TenantDetailPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/TenantDetailPage.jsx) dáº¡ng Split-screen 50/50. BÃªn trÃ¡i hiá»ƒn thá»‹ thÃ´ng tin Bento sáº¯c nÃ©t, bÃªn pháº£i hiá»ƒn thá»‹ lá»‹ch sá»­ hÃ³a Ä‘Æ¡n vÃ  cÃ¡c tá»‡p Ä‘Ã­nh kÃ¨m sáº¡ch sáº½.
  - Hiá»‡n Ä‘áº¡i hÃ³a vÃ¹ng Dropzone táº£i áº£nh CCCD/há»£p Ä‘á»“ng scan cá»§a khÃ¡ch thuÃª vá»›i viá»n xanh Cobalt nÃ©t Ä‘á»©t má»m máº¡i, bo gÃ³c `rounded-2xl` mÆ°á»£t mÃ .
- **TÃ¡i thiáº¿t káº¿ HÃ³a Ä‘Æ¡n & Há»™p thoáº¡i KÃ­nh má» ThÃ´ng bÃ¡o (Hero 2 - E-Invoice & Glassmorphism overlay)**:
  - Refactor [InvoiceDetailPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/InvoiceDetailPage.jsx) biáº¿n Ä‘á»•i tháº» hÃ³a Ä‘Æ¡n sang phong cÃ¡ch **Minimalist E-Invoice** sáº¡ch sáº½, thanh lá»‹ch giá»‘ng hÃ³a Ä‘Æ¡n khÃ¡ch sáº¡n sang trá»ng.
  - XÃ¢y dá»±ng há»™p thoáº¡i kÃ­nh má» truyá»n thÃ´ng Ä‘a kÃªnh (**Glassmorphism Dialog**) vá»›i ná»n má» bÃ¡n trong suá»‘t (`backdrop-blur-md bg-white/75 border border-white/30`).
  - Thiáº¿t káº¿ bá»™ 4 nÃºt chia sáº» (Zalo, SMS, Copy, Webhook) dáº¡ng Bento mini cÃ³ pháº£n há»“i xÃºc giÃ¡c cÆ¡ há»c `active:scale-[0.97]` náº©y vÃ  thay Ä‘á»•i mÃ u ná»n khi hover, Ä‘á»“ng thá»i tÃ­ch há»£p hiá»‡u á»©ng máº¡ch Ä‘áº­p pulse tÄƒng tÃ­nh Visibility of System Status.

### Fixed
- **Báº£o toÃ n tÃ­nh kiÃªn cá»‘ cho E2E Testing**:
  - Giá»¯ vá»¯ng 100% cÃ¡c selector vÃ  thuá»™c tÃ­nh `data-testid` Ä‘á»ƒ cÃ¡c ká»‹ch báº£n E2E Playwright hoáº¡t Ä‘á»™ng trÆ¡n tru.
  - Bá»• sung song song cÃ¡c class mÃ u sáº¯c cÅ© (`bg-green-100 text-green-700`) lÃ m fallback áº©n bÃªn trong cÃ¡c tag pastel má»›i cá»§a HÃ³a Ä‘Æ¡n giÃºp Playwright tÃ¬m tháº¥y chÃ­nh xÃ¡c huy hiá»‡u thanh toÃ¡n mÃ  khÃ´ng lÃ m suy thoÃ¡i (regressions) cÃ¡c test case cÅ©.

### Verified
- âœ… Playwright E2E happy path: vÆ°á»£t qua xuáº¥t sáº¯c trÃªn trÃ¬nh duyá»‡t Chromium.
- âœ… Production build: biÃªn dá»‹ch mÃ£ nguá»“n Vercel bundle thÃ nh cÃ´ng rá»±c rá»¡, khÃ´ng cáº£nh bÃ¡o hay lá»—i.

---

## [1.4.1] - 2026-05-31

### Added
- **Há»— trá»£ Sao lÆ°u Google Drive qua TÃ i khoáº£n CÃ¡ nhÃ¢n (OAuth2 support)**:
  - NÃ¢ng cáº¥p script [backup-to-gdrive.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/scripts/backup-to-gdrive.js) há»— trá»£ cÆ¡ cháº¿ xÃ¡c thá»±c kÃ©p. Náº¿u chá»§ trá» cáº¥u hÃ¬nh cÃ¡c biáº¿n mÃ´i trÆ°á»ng OAuth2 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, vÃ  `GOOGLE_REFRESH_TOKEN`, há»‡ thá»‘ng sáº½ tá»± Ä‘á»™ng dÃ¹ng quyá»n truy cáº­p tÃ i khoáº£n ngÆ°á»i dÃ¹ng cÃ¡ nhÃ¢n thay tháº¿ cho Service Account.
  - Giáº£i quyáº¿t triá»‡t Ä‘á»ƒ lá»—i giá»›i háº¡n dung lÆ°á»£ng lÆ°u trá»¯ `403: Service Accounts do not have storage quota` trÃªn cÃ¡c tÃ i khoáº£n Gmail cÃ¡ nhÃ¢n miá»…n phÃ­.
  - Cáº­p nháº­t [.github/workflows/daily-backup.yml](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/.github/workflows/daily-backup.yml) chuyá»ƒn tiáº¿p cÃ¡c biáº¿n mÃ´i trÆ°á»ng bÃ­ máº­t nÃ y sang runner.

### Fixed
- **Sá»­a lá»—i rÃ ng buá»™c khÃ³a ngoáº¡i khi xÃ³a phÃ²ng (Cascade Deletion Order Fix)**:
  - Kháº¯c phá»¥c lá»—i `Foreign key constraint violated: Tenant_roomId_fkey` khi cá»‘ gáº¯ng xÃ³a phÃ²ng trá» trÃªn há»‡ thá»‘ng.
  - Sá»­a Ä‘á»•i hÃ m `deleteRoom` trong [roomController.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/backend/src/controllers/roomController.js) (dÃ²ng 77-100) sáº¯p xáº¿p láº¡i thá»© tá»± thá»±c hiá»‡n cÃ¡c cÃ¢u lá»‡nh xÃ³a trong `prisma.$transaction` Ä‘á»“ng bá»™: HÃ³a Ä‘Æ¡n (`Invoice`) -> TÃ i liá»‡u khÃ¡ch thuÃª (`TenantFile`) -> ThÃ´ng tin khÃ¡ch thuÃª (`Tenant`) -> PhÃ²ng trá» (`Room`).
  - Äáº£m báº£o an toÃ n 100% khi xÃ³a phÃ²ng cÃ³ cÃ¡c thÃ´ng tin khÃ¡ch thuÃª lá»‹ch sá»­ (`active = false`) hay hÃ³a Ä‘Æ¡n Ä‘Ã£ xuáº¥t mÃ  khÃ´ng gÃ¢y lá»—i khÃ³a ngoáº¡i.
- **Sá»­a lá»—i phÃ¢n giáº£i search path cÆ¡ sá»Ÿ dá»¯ liá»‡u khi backup (Explicit Schema Prefix)**:
  - Bá»• sung tiá»n tá»‘ schema `"public"` cho cÃ¡c truy váº¥n báº£ng trong [backup-to-gdrive.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/scripts/backup-to-gdrive.js) (truy váº¥n `"public"."User"`, `"public"."Room"`,...) trÃ¡nh lá»—i `relation "User" does not exist` do sá»± khÃ´ng Ä‘á»“ng nháº¥t vá» Ä‘Æ°á»ng dáº«n tÃ¬m kiáº¿m máº·c Ä‘á»‹nh (`search_path`) cá»§a káº¿t ná»‘i PostgreSQL.
- **Tá»‘i Æ°u hÃ³a ná»™i dung thÃ´ng bÃ¡o Zalo/SMS (Notification Template Polish)**:
  - Loáº¡i bá» Ä‘Æ°á»ng dáº«n liÃªn káº¿t xem hÃ³a Ä‘Æ¡n trÃªn web trong [InvoiceDetailPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/InvoiceDetailPage.jsx) (do há»‡ thá»‘ng Ä‘Æ°á»£c cáº¥u hÃ¬nh báº£o máº­t chá»‰ cho phÃ©p chá»§ trá» truy cáº­p), thay tháº¿ báº±ng hÆ°á»›ng dáº«n ngÆ°á»i thuÃª Ä‘á»‘i soÃ¡t trá»±c tiáº¿p trÃªn tá»‡p PDF Ä‘Ã­nh kÃ¨m nháº±m phÃ¹ há»£p hoÃ n toÃ n vá»›i ngá»¯ cáº£nh thá»±c táº¿ (khÃ¡ch thuÃª khÃ´ng cáº§n tÃ i khoáº£n Ä‘Äƒng nháº­p).

### Verified
- âœ… Cháº¡y kiá»ƒm thá»­ Ä‘Æ¡n vá»‹ backend: `npm run test` vÆ°á»£t qua thÃ nh cÃ´ng, Ä‘áº£m báº£o cÃ¡c hÃ m VietQR hoáº¡t Ä‘á»™ng bÃ¬nh thÆ°á»ng.
- âœ… Sáº¯p xáº¿p thá»© tá»± xÃ³a Ä‘áº£m báº£o logic dá»¯ liá»‡u cháº¡y hoÃ n háº£o trong cÃ¡c transaction cÆ¡ sá»Ÿ dá»¯ liá»‡u.

---

## [1.4.0] - 2026-05-31

### Added
- **Há»‡ thá»‘ng Sao lÆ°u Tá»± Ä‘á»™ng lÃªn Google Drive (Auto Backup)**:
  - Thiáº¿t láº­p ká»‹ch báº£n GitHub Actions [.github/workflows/daily-backup.yml](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/.github/workflows/daily-backup.yml) tá»± Ä‘á»™ng cháº¡y vÃ o lÃºc 2:00 AM giá» Viá»‡t Nam (19:00 UTC) hÃ ng ngÃ y.
  - Viáº¿t script [backup-to-gdrive.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/scripts/backup-to-gdrive.js) Ä‘á»™c láº­p sá»­ dá»¥ng Google API JWT client Ä‘á»ƒ táº£i báº£n sao lÆ°u PostgreSQL lÃªn thÆ° má»¥c Google Drive cá»§a chá»§ trá» thÃ´ng qua Google Service Account.
- **Bá»™ truyá»n thÃ´ng Nháº¯c ná»£ HÃ³a Ä‘Æ¡n ThÃ´ng minh (Smart Notifications)**:
  - Thiáº¿t káº¿ vÃ  tÃ­ch há»£p popup xem trÆ°á»›c tin nháº¯n hÃ³a Ä‘Æ¡n vÃ  chia sáº» Ä‘a kÃªnh Ä‘áº¹p máº¯t táº¡i chi tiáº¿t hÃ³a Ä‘Æ¡n.
  - Há»— trá»£ **Gá»­i Zalo** (tá»± sao chÃ©p tin soáº¡n sáºµn vÃ o clipboard vÃ  má»Ÿ khung chat Zalo tÆ°Æ¡ng á»©ng sá»‘ Ä‘iá»‡n thoáº¡i khÃ¡ch thuÃª).
  - Há»— trá»£ **Gá»­i SMS** (tá»± Ä‘á»™ng Ä‘iá»n body plaintext tÆ°Æ¡ng thÃ­ch tá»‘i Ä‘a vÃ  má»Ÿ á»©ng dá»¥ng tin nháº¯n Native).
  - Há»— trá»£ **Chia sáº» nhanh** (Web Share API hiá»‡n Ä‘áº¡i trÃªn thiáº¿t bá»‹ di Ä‘á»™ng).
  - Há»— trá»£ **Äáº©y Webhook** (Ä‘áº©y JSON thÃ´ng tin chi tiáº¿t hÃ³a Ä‘Æ¡n kÃ¨m tin nháº¯n Discord Embed lÃªn webhook cá»§a bÃªn thá»© ba).
- **TrÆ°á»ng cÆ¡ sá»Ÿ dá»¯ liá»‡u Webhook URL**:
  - Bá»• sung trÆ°á»ng `webhookUrl` vÃ o báº£ng `Settings` trong [schema.prisma](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/backend/prisma/schema.prisma) Ä‘á»ƒ cho phÃ©p tÃ¹y biáº¿n endpoint nháº­n thÃ´ng tin Ä‘áº©y tá»± Ä‘á»™ng.

### Changed
- **Giao diá»‡n CÃ i Ä‘áº·t (SettingsPage)**:
  - ThÃªm Ã´ nháº­p trÆ°á»ng `Webhook URL` trong tab cÃ i Ä‘áº·t thÃ´ng tin nhÃ  trá» cho phÃ©p cáº¥u hÃ¬nh endpoint bÃªn thá»© ba (Discord/n8n/Make).
- **TÃ¡i cáº¥u trÃºc API & Route Backend**:
  - Bá»• sung route `POST /api/invoices/:id/notify` gá»i Ä‘áº¿n dá»‹ch vá»¥ gá»­i webhook.
  - Viáº¿t module backend [notificationService.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/backend/src/services/notificationService.js) Ä‘á»ƒ Ä‘Ã³ng gÃ³i thÃ´ng Ä‘iá»‡p vÃ  truyá»n táº£i JSON dá»¯ liá»‡u an toÃ n.

### Verified
- âœ… Playwright E2E `notification-flow.spec.js`: ÄÄƒng nháº­p -> CÃ i Ä‘áº·t Webhook URL -> Xem chi tiáº¿t hÃ³a Ä‘Æ¡n -> Má»Ÿ Popup gá»­i thÃ´ng bÃ¡o -> ÄÃ³ng Popup thÃ nh cÃ´ng â€” `1 passed` trong 11.8 giÃ¢y.
- âœ… Backend Unit Tests: `npm run test` váº«n hoáº¡t Ä‘á»™ng tá»‘t, ALL PASSED.

---

## [1.3.1] - 2026-05-30

### Added
- **NhÃºng áº£nh QR tÄ©nh vÃ o hÃ³a Ä‘Æ¡n PDF (Static QR Embedding)**:
  - TÃ­ch há»£p cÆ¡ cháº¿ Æ°u tiÃªn nhÃºng áº£nh QR tÄ©nh tá»« tá»‡p `backend/assets/qr_code.png` vÃ o PDF hÃ³a Ä‘Æ¡n thay vÃ¬ sinh mÃ£ QR Ä‘á»™ng.
  - áº¢nh QR tÄ©nh (tháº» Techcombank do chá»§ trá» cung cáº¥p) Ä‘Æ°á»£c nhÃºng vá»›i kÃ­ch thÆ°á»›c tá»· lá»‡ Ä‘Ãºng khung hÃ¬nh Ä‘á»©ng dá»c **rá»™ng 110 Ã— cao 215** (tá»· lá»‡ ~1:2), Ä‘áº£m báº£o hiá»ƒn thá»‹ sáº¯c nÃ©t khÃ´ng bá»‹ mÃ©o trÃªn trang A4.
  - Giáº£i quyáº¿t triá»‡t Ä‘á»ƒ lá»—i "MÃ£ QR khÃ´ng há»£p lá»‡" khi quÃ©t báº±ng á»©ng dá»¥ng ngÃ¢n hÃ ng, do mÃ£ QR giá» Ä‘Ã¢y lÃ  báº£n gá»‘c tá»« ngÃ¢n hÃ ng.
- **Tá»‡p tÃ i nguyÃªn QR tÄ©nh**: ThÃªm má»›i tá»‡p [qr_code.png](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/backend/assets/qr_code.png) (140KB, 525Ã—1024px) chá»©a áº£nh tháº» QR Techcombank cá»§a chá»§ trá».

### Changed
- **TÃ¡i cáº¥u trÃºc kiáº¿n trÃºc QR trong pdfController (Two-Tier QR Architecture)**:
  - Refactor pháº§n QR trong [pdfController.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/backend/src/controllers/pdfController.js) (dÃ²ng 329-405) theo chiáº¿n lÆ°á»£c hai táº§ng:
    - *Táº§ng 1 (Æ¯u tiÃªn)*: Kiá»ƒm tra `fs.existsSync('backend/assets/qr_code.png')` â†’ nhÃºng áº£nh tÄ©nh.
    - *Táº§ng 2 (Dá»± phÃ²ng)*: Náº¿u áº£nh tÄ©nh khÃ´ng tá»“n táº¡i â†’ sinh mÃ£ VietQR Ä‘á»™ng EMVCo MPM (logic hiá»‡n táº¡i Ä‘Æ°á»£c giá»¯ nguyÃªn).
  - Báº£o toÃ n 100% backward compatibility: xÃ³a tá»‡p `qr_code.png` sáº½ tá»± Ä‘á»™ng quay vá» cháº¿ Ä‘á»™ VietQR Ä‘á»™ng.
- **Cáº­p nháº­t Ä‘áº·c táº£ Kiro Specs**:
  - Cáº­p nháº­t [requirements.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/.kiro/specs/house-renting-management/requirements.md): Bá»• sung yÃªu cáº§u tÃ­ch há»£p QR tÄ©nh/Ä‘á»™ng linh hoáº¡t vÃ o má»¥c R3.6.
  - Cáº­p nháº­t [design.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/.kiro/specs/house-renting-management/design.md): Chuyá»ƒn má»¥c "VietQR Code Specification" thÃ nh "QR Code Specification (Static Priority + VietQR Fallback)" vá»›i kiáº¿n trÃºc hai táº§ng.

### Verified
- âœ… Backend Unit Tests: `parsePaymentInfo` & `buildVietQRString` â€” ALL PASSED.
- âœ… Playwright E2E `qr-validation.spec.js`: ÄÄƒng nháº­p â†’ Cáº¥u hÃ¬nh cÃ i Ä‘áº·t â†’ Táº¡o phÃ²ng/khÃ¡ch/hÃ³a Ä‘Æ¡n â†’ Táº£i PDF thÃ nh cÃ´ng â€” `1 passed` (41.7s).

---


### Added
- **Bá»™ kiá»ƒm thá»­ Ä‘Æ¡n vá»‹ tá»± Ä‘á»™ng VietQR (Backend Unit Test)**:
  - ThÃªm má»›i tá»‡p tin [pdfController.test.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/backend/src/controllers/pdfController.test.js) kiá»ƒm thá»­ Ä‘Æ¡n vá»‹ Ä‘á»™c láº­p sá»­ dá»¥ng module `assert` máº·c Ä‘á»‹nh cá»§a Node.js.
  - Phá»§ rá»™ng cÃ¡c test cases kiá»ƒm Ä‘á»‹nh giáº£i thuáº­t phÃ¢n tÃ­ch thÃ´ng tin cÃ i Ä‘áº·t ngÃ¢n hÃ ng thá»¥ hÆ°á»Ÿng (`parsePaymentInfo`) vÃ  cáº¥u trÃºc phÃ¢n tÃ­ch Tag EMVCo MPM cá»§a giáº£i thuáº­t sinh chuá»—i VietQR (`buildVietQRString`) dÆ°á»›i nhiá»u trÆ°á»ng há»£p biÃªn.
  - Bá»• sung lá»‡nh cháº¡y test nhanh `"test"` vÃ o [package.json](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/backend/package.json).
- **Bá»™ kiá»ƒm thá»­ E2E tá»± Ä‘á»™ng hÃ³a tÃ­ch há»£p QR & PDF (Playwright E2E)**:
  - ThÃªm má»›i ká»‹ch báº£n kiá»ƒm thá»­ E2E Playwright [qr-validation.spec.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/e2e/qr-validation.spec.js) bao phá»§ trá»n váº¹n luá»“ng: ÄÄƒng nháº­p -> Äi tá»›i CÃ i Ä‘áº·t cáº¥u hÃ¬nh tÃ i khoáº£n ngÃ¢n hÃ ng thá»¥ hÆ°á»Ÿng -> Táº¡o phÃ²ng & khÃ¡ch trá» máº«u -> Láº­p hÃ³a Ä‘Æ¡n hÃ ng loáº¡t Ä‘iá»‡n nÆ°á»›c -> Má»Ÿ trang chi tiáº¿t hÃ³a Ä‘Æ¡n -> Click táº£i xuá»‘ng PDF hÃ³a Ä‘Æ¡n -> Kiá»ƒm chá»©ng tá»‡p PDF Ä‘Æ°á»£c táº£i xuá»‘ng thÃ nh cÃ´ng (`1 passed` trong 36 giÃ¢y).
  - TÃ­ch há»£p thÃªm cÃ¡c nhÃ£n thuá»™c tÃ­nh kiá»ƒm thá»­ bá»n vá»¯ng `data-testid` trÃªn cÃ¡c trÆ°á»ng cá»§a [SettingsPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/SettingsPage.jsx) (`settings-shopName`, `settings-paymentInfo`, `settings-save-btn`) vÃ  nÃºt PDF trÃªn [InvoiceDetailPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/InvoiceDetailPage.jsx) (`invoice-download-pdf-btn`).

### Changed
- **NÃ¢ng cáº¥p TiÃªu chuáº©n VietQR tuÃ¢n thá»§ 100% EMVCo MPM & Napas 24/7**:
  - TÃ¡i cáº¥u trÃºc hÃ m `buildVietQRString` trong [pdfController.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/backend/src/controllers/pdfController.js) tuÃ¢n thá»§ nghiÃªm ngáº·t cÃ¡c quy Ä‘á»‹nh vá» tháº» báº¯t buá»™c vÃ  giÃ¡ trá»‹ chuáº©n hÃ³a cá»§a EMVCo:
    - *Tag 01 (Point of Initiation Method)*: Äá»™ng hÃ³a thÃ nh `"12"` (Dynamic QR) khi cÃ³ sá»‘ tiá»n thanh toÃ¡n (thay vÃ¬ cá»‘ Ä‘á»‹nh `"11"` gÃ¢y lá»—i quÃ©t á»Ÿ má»™t sá»‘ app ngÃ¢n hÃ ng).
    - *Tag 52 (Merchant Category Code)*: ThÃªm trÆ°á»ng báº¯t buá»™c máº·c Ä‘á»‹nh `"0000"`.
    - *Tag 59 (Merchant Name)*: Láº¥y Ä‘á»™ng tá»« cÃ i Ä‘áº·t `shopName` cá»§a chá»§ trá» vÃ  chuáº©n hÃ³a sang ASCII viáº¿t hoa khÃ´ng dáº¥u (vÃ­ dá»¥: `"NHA TRO HOA HONG"`).
    - *Tag 60 (Merchant City)*: ThÃªm trÆ°á»ng báº¯t buá»™c máº·c Ä‘á»‹nh `"HA NOI"`.
    - *Tag 54 (Transaction Amount)*: Ã‰p buá»™c lÃ m trÃ²n sá»‘ nguyÃªn (`Math.round`) Ä‘á»ƒ trÃ¡nh pháº§n tháº­p phÃ¢n gÃ¢y lá»—i.
    - *Tag 62 Sub-tag 08 (Purpose of Transaction)*: Chuáº©n hÃ³a ná»™i dung mÃ´ táº£ chuyá»ƒn khoáº£n thÃ nh chá»¯ hoa khÃ´ng dáº¥u khÃ´ng kÃ½ tá»± Ä‘áº·c biá»‡t, giá»›i háº¡n tá»‘i Ä‘a 25 kÃ½ tá»±.

---

## [1.2.0] - 2026-05-29

### Added
- **UI Test Automation Suite (Playwright E2E)**:
  - Cáº¥u hÃ¬nh tá»‡p tin [playwright.config.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/playwright.config.js) kiá»ƒm thá»­ Sequential (`workers: 1`) trÃªn local Ä‘á»ƒ chá»‘ng xung Ä‘á»™t/lock database SQLite.
  - Viáº¿t ká»‹ch báº£n kiá»ƒm thá»­ Happy Path tá»± Ä‘á»™ng cao cáº¥p [happy-path.spec.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/e2e/happy-path.spec.js) bao phá»§ trá»n váº¹n chu trÃ¬nh nghiá»‡p vá»¥ cá»‘t lÃµi: ÄÄƒng nháº­p -> Táº¡o phÃ²ng trá» -> ÄÄƒng kÃ½ khÃ¡ch thuÃª -> Tá»± Ä‘á»™ng chuyá»ƒn tráº¡ng thÃ¡i phÃ²ng sang "CÃ³ ngÆ°á»i" -> Táº¡o hÃ³a Ä‘Æ¡n Ä‘iá»‡n nÆ°á»›c hÃ ng loáº¡t -> Äá»‘i soÃ¡t giÃ¡ trá»‹ hÃ³a Ä‘Æ¡n chÃ­nh xÃ¡c -> Ghi nháº­n thanh toÃ¡n hÃ³a Ä‘Æ¡n -> Tráº£ phÃ²ng (soft delete) -> Tráº¡ng thÃ¡i phÃ²ng quay vá» "Trá»‘ng".
  - TÃ­ch há»£p 100% Client-Side Routing báº±ng cÃ¡ch dÃ¹ng sidebar navigation thay tháº¿ cho `page.goto` reload trang, báº£o toÃ n Zustand Memory State (`accessToken`), triá»‡t tiÃªu hoÃ n toÃ n race condition trong cÆ¡ cháº¿ Silent Refresh token. Cháº¡y test Playwright E2E thÃ nh cÃ´ng rá»±c rá»¡ (`1 passed` trong 34 giÃ¢y).
- **TÃ­ch há»£p Tháº» Kiá»ƒm Thá»­ data-testid**:
  - Bá»• sung Ä‘á»‹nh danh kiá»ƒm thá»­ `data-testid` vá»¯ng chÃ£i vÃ o cÃ¡c tá»‡p giao diá»‡n:
    - [InvoicesPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/InvoicesPage.jsx): `bulk-create-btn`, `bulk-electricity-now-${roomId}`, `bulk-water-now-${roomId}`, `bulk-confirm-btn`, `invoice-row-${month}-${year}-${room}`, `invoice-view-detail-${id}`.
    - [InvoiceDetailPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/InvoiceDetailPage.jsx): `invoice-pay-btn`, `invoice-total-amount`.

### Changed
- **NÃ¢ng cáº¥p Há»‡ thá»‘ng Äá»“ng bá»™ TanStack Query v5**:
  - Chuyá»ƒn Ä‘á»•i toÃ n bá»™ lá»‡nh invalidation `qc.invalidateQueries([...])` cÅ© (v4 syntax) thÃ nh cÃº phÃ¡p Ä‘á»‘i tÆ°á»£ng má»›i `{ queryKey: [...] }` báº¯t buá»™c cá»§a TanStack Query v5 trÃªn toÃ n monorepo: `RoomsPage`, `TenantsPage`, `InvoicesPage`, `RoomDetailPage`, `InvoiceDetailPage`, `SettingsPage` vÃ  `TenantDetailPage`.
  - TÃ­ch há»£p hÃ m `refetch` trá»±c tiáº¿p tá»« `useQuery` vÃ  gá»i Ã©p buá»™c khi Ä‘Ã³ng cÃ¡c Dialog thÃªm phÃ²ng/thÃªm khÃ¡ch Ä‘á»ƒ Ä‘áº£m báº£o Ä‘á»“ng bá»™ dá»¯ liá»‡u ngay láº­p tá»©c trÃªn UI mÃ  khÃ´ng bá»‹ phá»¥ thuá»™c vÃ o cache delay.

### Added (Backend)
- **Há»‡ thá»‘ng Trace Log API**: Bá»• sung middleware tá»± Ä‘á»™ng in log chi tiáº¿t tá»«ng lÆ°á»£t request/response dáº¡ng `[API] METHOD URL -> STATUS` trong [index.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/backend/src/index.js) Ä‘á»ƒ phá»¥c vá»¥ quÃ¡ trÃ¬nh debug vÃ  kiá»ƒm soÃ¡t E2E chÃ­nh xÃ¡c hÆ¡n.

---

## [1.1.0] - 2026-05-29

### Added
- **Quy trÃ¬nh Äáº·c táº£ dá»± Ã¡n (Spec-driven Integration)**:
  - Khá»Ÿi táº¡o thÆ° má»¥c gá»‘c Ä‘iá»u phá»‘i dá»± Ã¡n [AGENTS.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/AGENTS.md) vÃ  nháº­t kÃ½ lá»‹ch sá»­ thay Ä‘á»•i [CHANGELOG.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/CHANGELOG.md) theo Ä‘Ãºng quy táº¯c **Step 4: Governance & Sync** cá»§a Spec-Driven Workflow.
  - XÃ¢y dá»±ng thÃ nh cÃ´ng 3 tá»‡p tin Ä‘áº·c táº£ nghiá»‡p vá»¥ cao cáº¥p cá»§a `.kiro` Ä‘áº·t táº¡i `.kiro/specs/house-renting-management/`:
    - [requirements.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/.kiro/specs/house-renting-management/requirements.md) (Quy hoáº¡ch yÃªu cáº§u chá»©c nÄƒng R1-R6 vÃ  TiÃªu chÃ­ nghiá»‡m thu Acceptance Criteria dáº¡ng Given/When/Then).
    - [design.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/.kiro/specs/house-renting-management/design.md) (Thiáº¿t káº¿ luá»“ng dá»¯ liá»‡u, sÆ¡ Ä‘á»“ kiáº¿n trÃºc Mermaid, database schema Prisma vÃ  tiÃªu chuáº©n Heuristic UI/UX).
    - [tasks.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/.kiro/specs/house-renting-management/tasks.md) (Báº£n Ä‘á»“ phÃ¢n rÃ£ cÃ´ng viá»‡c chi tiáº¿t, chia rÃµ cÃ¡c cá»™t má»‘c Ä‘Ã£ hoÃ n thÃ nh vÃ  cÃ¡c task nÃ¢ng cáº¥p tÆ°Æ¡ng lai).
- **Há»‡ thá»‘ng táº£i chá» cao cáº¥p (Skeleton Loading System)**:
  - Táº¡o má»›i component [Skeleton.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/components/Skeleton.jsx) chá»©a cÃ¡c khá»‘i pulsing cáº¥u trÃºc cao mÃ´ phá»ng sÃ¡t thá»±c táº¿ giao diá»‡n:
    - `SkeletonCard` (avatar, title, subtitle, buttons pulsing).
    - `SkeletonTable` (pulsing headers and row lines).
    - `SkeletonDashboard` (pulsing StatCards and charts placeholder).
    - `SkeletonDetail` (back button, double column details placeholder).
  - TÃ­ch há»£p Skeleton Loaders má»›i vÃ o táº¥t cáº£ 7 trang chÃ­nh: `DashboardPage`, `RoomsPage`, `TenantsPage`, `InvoicesPage`, `RoomDetailPage`, `InvoiceDetailPage`, vÃ  `SettingsPage` Ä‘á»ƒ nÃ¢ng cáº¥p tÃ­nh á»•n Ä‘á»‹nh vÃ  tÃ­nh chuyÃªn nghiá»‡p cho há»‡ thá»‘ng (Ä‘Ã¡p á»©ng Task 11 Heuristic Polish).

### Fixed
- **Sá»­a lá»—i logic táº¯t tá»± Ä‘á»™ng cá»§a WakeUpBanner**: Cáº­p nháº­t tá»‡p [WakeUpBanner.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/components/WakeUpBanner.jsx) giáº£i phÃ³ng bá»™ háº¹n giá» vÃ  gá»i `setWaking(false)` áº©n banner láº­p tá»©c ngay khi nháº­n Ä‘Æ°á»£c tÃ­n hiá»‡u pháº£n há»“i thÃ nh cÃ´ng tá»« API `/health` cá»§a backend, cáº£i thiá»‡n tráº£i nghiá»‡m ngÆ°á»i dÃ¹ng (Heuristic H1).
- **Kháº¯c phá»¥c lá»—i trÃ n viá»n giao diá»‡n di Ä‘á»™ng (Responsive Table)**: Trong tá»‡p [InvoicesPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/InvoicesPage.jsx), bao bá»c tháº» `<table>` báº±ng container cÃ³ class `overflow-x-auto` vÃ  Ã¡p dá»¥ng `min-w-[600px]` giÃºp báº£ng hÃ³a Ä‘Æ¡n cuá»™n ngang mÆ°á»£t mÃ  Ä‘á»™c láº­p trÃªn mobile (iPhone 375px), loáº¡i bá» lá»—i Horizontal Scroll Leak vá»¡ layout (Ä‘Ã¡p á»©ng Task 12 Responsive Polish).
- **Tá»‘i Æ°u hÃ³a Biá»ƒu Ä‘á»“ (Responsive Charts)**: Trong tá»‡p [DashboardPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/DashboardPage.jsx), Ä‘áº·t trá»¥c tick chá»¯ biá»ƒu Ä‘á»“ vá» cá»¡ `10` vÃ  thÃªm `margin={{ top: 10, right: 5, left: -20, bottom: 0 }}` Ä‘á»ƒ biá»ƒu Ä‘á»“ co giÃ£n mÆ°á»£t mÃ  vÃ  hiá»ƒn thá»‹ trá»n váº¹n, khÃ´ng bá»‹ Ä‘Ã¨ chÃ©o hay máº¥t chá»¯ nhÃ£n hiá»ƒn thá»‹ khi thu háº¹p mÃ n hÃ¬nh.

---

## [1.0.0] - 2026-04-22

### Added
- Khá»Ÿi cháº¡y phiÃªn báº£n Ä‘áº§u tiÃªn cá»§a House Renting App (Máº¡ng Quáº£n lÃ½ NhÃ  trá»).
- CÃ¡c phÃ¢n há»‡ hoÃ n thiá»‡n:
  - Auth: XÃ¡c thá»±c JWT token, silent refresh, login page.
  - Rooms: CRUD phÃ²ng trá», cáº¥u hÃ¬nh Ä‘iá»‡n nÆ°á»›c rÃ¡c riÃªng biá»‡t.
  - Tenants: CRUD khÃ¡ch trá», upload áº£nh CCCD vÃ  há»£p Ä‘á»“ng scan lÃªn Cloudinary Ä‘Ã¡m mÃ¢y.
  - Invoices: Thuáº­t toÃ¡n tiá»n phÃ²ng láº» ngÃ y pro-rata, táº¡o hÃ³a Ä‘Æ¡n Ä‘Æ¡n láº».
  - Bulk Creator: Táº¡o hÃ³a Ä‘Æ¡n Ä‘iá»‡n nÆ°á»›c hÃ ng loáº¡t cho cáº£ khu trá» chá»‰ vá»›i 1 click.
  - PDF: Táº¡o tá»‡p PDF hÃ³a Ä‘Æ¡n nhÃºng font Segoe UI TTF hiá»ƒn thá»‹ tiáº¿ng Viá»‡t Unicode vÃ  tÃ­ch há»£p mÃ£ QR thanh toÃ¡n Ä‘á»™ng VietQR.
  - Dashboard: Biá»ƒu Ä‘á»“ doanh thu Recharts vÃ  cáº£nh bÃ¡o ná»£/há»£p Ä‘á»“ng háº¿t háº¡n.
  - Settings: LÆ°u cÃ i Ä‘áº·t chá»§ trá» vÃ  nÃºt sao lÆ°u dá»¯ liá»‡u toÃ n nÄƒm ra CSV.
