# Finance Planner — Ứng dụng Quản lý Tài chính Cá nhân

Ứng dụng web full-stack giúp người dùng theo dõi thu chi cá nhân, trực quan hóa tỷ trọng chi tiêu theo danh mục qua biểu đồ và theo dõi tiến độ tiết kiệm cho các món đồ mong muốn (Wishlist) kèm thông báo chúc mừng khi đạt mốc.

- **Link Production (Vercel):** https://finance-planner-djsh.vercel.app
- **Tài khoản Demo:**
  - Email: `demo@phy10615.vn`
  - Mật khẩu: `Password123!`
- **Nhật ký sử dụng AI:** Xem chi tiết tại [AI_LOG.md](./AI_LOG.md)

## Công nghệ & Phiên bản chính

- **Framework:** Next.js 16.4 (App Router), React 19, TypeScript
- **Giao diện & Biểu đồ:** Tailwind CSS v4, shadcn/ui (Radix), Recharts, Sonner, `next-themes`
- **Cơ sở dữ liệu & ORM:** PostgreSQL (Neon), Prisma ORM 7 (`@prisma/adapter-pg`)
- **Xác thực & Kiểm duyệt:** Better Auth 1.7 (Email/Mật khẩu & GitHub OAuth), Zod 4
- **Kiểm thử & CI/CD:** Vitest, React Testing Library, GitHub Actions, Vercel

## Hướng dẫn chạy Local

1. Cài đặt thư viện (Node.js 22+): `npm ci --legacy-peer-deps`
2. Tạo file `.env` từ `.env.example` và điền thông tin kết nối Neon PostgreSQL, Better Auth.
3. Khởi tạo database & seed dữ liệu: `npx prisma generate && npx prisma migrate dev && npx prisma db seed`
4. Chạy dev server: `npm run dev` (mở `http://localhost:3000`).

## Chạy kiểm thử tự động

- Chạy toàn bộ 5 file test (12 test cases): `npx vitest run`

## Checklist tính năng theo đề bài

- [x] **Xác thực & phân quyền:** Đăng ký/đăng nhập Email + Mật khẩu và GitHub (Better Auth); kiểm tra `requireUser()` và lọc theo `userId` trong mọi Server Action và Route Handler (`/api/transactions`).
- [x] **Quản lý giao dịch (CRUD):** Thêm, xem, sửa, xóa giao dịch (VND số nguyên dương), validate bằng Zod 4 phía server, thông báo toast bằng Sonner.
- [x] **Quản lý Wishlist (CRUD):** Thêm, xem, sửa, xóa món đồ mong muốn kèm mức ưu tiên và thanh tiến độ tiết kiệm giới hạn `0% – 100%`.
- [x] **Dashboard & Biểu đồ:** Hiển thị số dư hiện tại nổi bật, biểu đồ tròn chi tiêu theo danh mục trong tháng hiện tại kèm bảng số liệu Accessibility (`sr-only`).
- [x] **Lọc & Tìm kiếm qua URL:** Lọc theo thời gian (Tháng này / Tháng trước / Tất cả), danh mục và loại giao dịch lưu trực tiếp trên URL `searchParams`.
- [x] **Thông báo mốc tiết kiệm:** Tự động thông báo khi số dư đạt các mốc 50%, 75%, 100% giá trị món đồ trong Wishlist, không lặp lại mốc đã báo.
- [x] **Tính năng mở rộng:** Quản lý ngân sách chi tiêu theo danh mục hàng tháng (`budgets`) kèm cảnh báo vượt hạn mức.
- [x] **Kiểm thử & CI/CD:** 12/12 test cases đạt chuẩn với Vitest, GitHub Actions CI chạy xanh trên nhánh `main`, triển khai production trên Vercel.

## Quyết định kỹ thuật & Giới hạn đã biết

- **Quyết định kỹ thuật:** Lưu tiền VND bằng số nguyên (`Int`) để tránh sai số thập phân; lưu trạng thái lọc trên URL `searchParams` để hỗ trợ SSR và chia sẻ link; tách logic thuần túy vào `lib/` để unit test độc lập.
- **Giới hạn đã biết:** Giao dịch định kỳ chưa có cronjob chạy nền tự động mà cập nhật khi người dùng thao tác trên hệ thống.