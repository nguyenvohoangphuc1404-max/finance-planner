"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { budgetSchema } from "@/lib/validation";

export async function upsertBudget(formData: FormData) {
  const user = await requireUser();
  const parsed = budgetSchema.safeParse({
    category: formData.get("category"),
    limit: formData.get("limit"),
  });
  if (!parsed.success) return;

  await prisma.categoryBudget.upsert({
    where: { userId_category: { userId: user.id, category: parsed.data.category } },
    update: { limit: parsed.data.limit },
    create: { userId: user.id, category: parsed.data.category, limit: parsed.data.limit },
  });
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
}