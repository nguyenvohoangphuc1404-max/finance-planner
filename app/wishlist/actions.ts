"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { wishlistSchema } from "@/lib/validation";

export async function addWishlistItem(formData: FormData) {
  const user = await requireUser();
  const parsed = wishlistSchema.safeParse({
    name: formData.get("name"),
    cost: formData.get("cost"),
    priority: formData.get("priority") || "MEDIUM",
  });
  if (!parsed.success) return;

  await prisma.wishlistItem.create({
    data: { ...parsed.data, userId: user.id },
  });
  revalidatePath("/wishlist");
}

export async function deleteWishlistItem(id: string) {
  const user = await requireUser();
  await prisma.wishlistItem.deleteMany({
    where: { id, userId: user.id },
  });
  revalidatePath("/wishlist");
}