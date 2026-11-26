import "dotenv/config";
import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";
import { ROWS, WISHLIST } from "./seed-data";

const EMAIL = "demo@phy10615.vn";
const PASSWORD = "Demo@123456";

async function main() {
  await prisma.user.deleteMany({
    where: { email: EMAIL },
  });

  // Dùng Better Auth API để tạo user kèm mật khẩu đã băm đúng chuẩn
  const res = await auth.api.signUpEmail({
    body: {
      email: EMAIL,
      password: PASSWORD,
      name: "Sinh viên demo",
    },
  });

  const userId = res.user.id;

  await prisma.transaction.createMany({
    data: ROWS.map((r) => ({ ...r, userId })),
  });
  await prisma.wishlistItem.createMany({
    data: WISHLIST.map((w) => ({ ...w, userId })),
  });

  console.log("Seed thành công! Tài khoản:", EMAIL, "| Mật khẩu:", PASSWORD);
}

main().finally(() => prisma.$disconnect());