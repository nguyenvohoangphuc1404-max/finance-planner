"use server";
import * as z from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { wishlistProgress, crossedMilestones } from "@/lib/finance";
import {
  readValues,
  transactionSchema,
  type FormState,
} from "@/lib/validation";

async function getUserBalance(userId: string) {
  const [thu, chi] = await Promise.all([
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { userId, type: "INCOME" } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { userId, type: "EXPENSE" } }),
  ]);
  return (thu._sum.amount ?? 0) - (chi._sum.amount ?? 0);
}

export async function createTransaction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState & { alerts?: string[] }> {
  const user = await requireUser();
  const values = readValues(formData);
  const parsed = transactionSchema.safeParse(values);
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error);
    return { errors: flat.fieldErrors, values };
  }

  const prevBalance = await getUserBalance(user.id);

  await prisma.transaction.create({
    data: {
      ...parsed.data,
      date: new Date(parsed.data.date),
      userId: user.id,
    },
  });

  const nextBalance = await getUserBalance(user.id);
  const wishlist = await prisma.wishlistItem.findMany({ where: { userId: user.id } });

  const alerts: string[] = [];
  for (const item of wishlist) {
    const prevPct = wishlistProgress(prevBalance, item.cost);
    const nextPct = wishlistProgress(nextBalance, item.cost);
    const crossed = crossedMilestones(prevPct, nextPct);
    for (const m of crossed) {
      alerts.push(`Chúc mừng! "${item.name}" đã đạt mốc tiết kiệm ${m}%!`);
    }
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/wishlist");
  return { ok: true, message: "Đã thêm giao dịch", alerts };
}

export async function updateTransaction(id: string, formData: FormData) {
  const user = await requireUser();
  const values = readValues(formData);
  const parsed = transactionSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "Dữ liệu sửa không hợp lệ" };

  await prisma.transaction.updateMany({
    where: { id, userId: user.id },
    data: {
      ...parsed.data,
      date: new Date(parsed.data.date),
    },
  });
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return { ok: true, message: "Đã cập nhật giao dịch" };
}

export async function deleteTransaction(id: string) {
  const user = await requireUser();
  await prisma.transaction.deleteMany({
    where: { id, userId: user.id },
  });
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}