# AI_LOG - Nhật ký sử dụng AI

> Mức AI của bài này: **Mức 3 (AI cộng tác)**.
> Khai báo trung thực không bị trừ điểm. Không khai báo vi phạm liêm chính học thuật.

| Ngày | Công cụ | Việc nhờ AI | Prompt (tóm tắt) | Kết quả dùng thế nào | Mình đã kiểm chứng / sửa gì | Commit/PR |
|---|---|---|---|---|---|---|
| 2026-11-23 | Gemini | Thiết kế schema Prisma ORM 7 và cấu trúc Next.js 16 App Router | Tạo schema cho Transaction, WishlistItem, CategoryBudget dùng Prisma 7 + adapter-pg | Dùng làm khung schema và điều chỉnh enum tiếng Việt hiển thị trên UI | Chạy `npx prisma generate`, `npx prisma migrate dev` và seed dữ liệu mẫu kiểm tra trên Neon | `init` |
| 2026-11-24 | Gemini | Xây dựng Server Actions CRUD giao dịch, wishlist, ngân sách và Better Auth | Viết Server Actions có `requireUser()`, validate Zod 4 và lọc theo `userId` | Áp dụng pattern kiểm tra session và `updateMany`/`deleteMany` theo `userId` | Tự kiểm thử đăng nhập 2 tài khoản khác nhau để xác nhận không truy cập chéo dữ liệu | `crud-auth` |
| 2026-11-26 | Gemini | Viết unit test logic & component test cho `ExpensePieChart` bằng Vitest | Liệt kê test case cho `date-range`, `finance`, `milestones`, `validation` và test render `ExpensePieChart` | Dùng 12 test cases; mock Recharts để chạy trong môi trường `jsdom` | Sửa xung đột phiên bản `react` và `react-dom` về cùng `19.1.0`, chạy `npx vitest run` xanh 5/5 file | `test` |
| 2026-11-26 | Gemini | Cấu hình GitHub Actions CI (`ci.yml`) | Tạo workflow chạy `npm ci`, `prisma generate`, `tsc --noEmit`, `vitest run`, `npm run build` | Dùng cấu hình workflow trên nhánh `main` | Đổi `node-version` từ `"20"` lên `"22"` để sửa lỗi `undici` trên CI, xác nhận workflow chạy xanh | `9866b3c` |

## Tự đánh giá cuối bài

- **Phần mình tự làm hoàn toàn:** Thiết kế luồng nghiệp vụ thu chi cá nhân, cấu hình database Neon PostgreSQL, tích hợp Better Auth, xây dựng giao diện Dashboard/Transactions/Budgets/Wishlist, lọc dữ liệu qua URL `searchParams` và triển khai production lên Vercel.
- **Phần AI giúp nhiều nhất và mình đã hiểu nó thế nào:** Gợi ý cấu trúc kiểm thử Vitest (tách hàm thuần tính toán mốc tiết kiệm/lọc ngày để dễ unit test) và viết file cấu hình GitHub Actions CI tự động kiểm tra typecheck, test và build trước khi deploy.
- **Một lần AI sai và cách mình phát hiện:** Khi cấu hình GitHub Actions CI, AI dùng `node-version: "20"` khiến thư viện `undici` của `jsdom` báo lỗi `TypeError: Cannot read properties of undefined (reading 'bind')` lúc chạy `vitest`. Mình xem log lỗi trên tab Actions và nâng lên `node-version: "22"` thì pipeline chạy xanh hoàn toàn.