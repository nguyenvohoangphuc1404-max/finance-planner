# Tuần 9 – Hết chặng 3: hàm thuần trong lib/finance.ts, Vitest + 7 unit test

Chép đè các file trong thư mục này vào dự án `finance-planner` **hết tuần 8** (đã có Prisma 7,
seed 30 giao dịch và trang `/dashboard`), rồi chạy:

```bash
npm install zod
npm i -D vitest jsdom vite-tsconfig-paths @types/node@22
npm pkg set scripts.test="vitest run"
npm test        # 7 test xanh
npm run dev   # mở localhost:3000/transactions
```

- Tuần 9 chưa có đăng nhập: giao dịch mới tạm gắn cho user mẫu `demo@phy10615.vn` của seed –
  chạy `npx prisma db seed` trước nếu CSDL trống. Tuần 10 thay bằng `requireUser()`.
- `app/globals.css` = bản của create-next-app + 3 dòng `@layer base` ở cuối (viền cho ô nhập).
- Không cài `@vitejs/plugin-react` (xung đột ERESOLVE); `@types/node@22` để Vitest 5 cài được.

Sinh tự động từ `weeks/w09_code.js` (cùng nguồn với slide); mốc này đã chạy `next build`, ESLint, Vitest
rồi `next start` và kiểm tra bằng Chromium trên PostgreSQL (Next.js 16.4.5, Prisma 7.10.1, Zod 4).
