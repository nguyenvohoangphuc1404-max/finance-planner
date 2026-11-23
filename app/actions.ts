"use server";

import { prisma } from "@/lib/prisma";
import { TransactionType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getDashboardData() {
  let categories = await prisma.category.findMany();

  // Tự động tạo danh mục mẫu nếu chưa có gì trong database
  if (categories.length === 0) {
    await prisma.category.createMany({
      data: [
        { name: "Ăn uống", type: "EXPENSE", budgetLimit: 3000000 },
        { name: "Cà phê & Nước", type: "EXPENSE", budgetLimit: 600000 },
        { name: "Đi lại & Xăng xe", type: "EXPENSE", budgetLimit: 800000 },
        { name: "Linh kiện & Học tập", type: "EXPENSE", budgetLimit: 1500000 },
        { name: "Giải trí & Mua sắm", type: "EXPENSE", budgetLimit: 1000000 },
        { name: "Lương / Trợ cấp", type: "INCOME" },
      ],
    });
    categories = await prisma.category.findMany();
  }

  const transactions = await prisma.transaction.findMany({
    include: { category: true },
    orderBy: { date: "desc" },
  });

  return { categories, transactions };
}

export async function addTransaction(formData: FormData) {
  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as TransactionType;
  const categoryId = formData.get("categoryId") as string;
  const note = (formData.get("note") as string) || "";
  const dateStr = formData.get("date") as string;

  if (!amount || amount <= 0 || !categoryId) return;

  await prisma.transaction.create({
    data: {
      amount,
      type,
      categoryId,
      note,
      date: dateStr ? new Date(dateStr) : new Date(),
    },
  });

  revalidatePath("/");
}

export async function deleteTransaction(id: string) {
  await prisma.transaction.delete({
    where: { id },
  });
  revalidatePath("/");
}