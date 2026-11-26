import { describe, it, expect } from "vitest";
import {
  transactionSchema,
  wishlistSchema,
  budgetSchema,
} from "@/lib/validation";
import { Category, Priority, TransactionType } from "@/generated/prisma/enums";

describe("Validation schemas", () => {
  it("chấp nhận giao dịch hợp lệ", () => {
    const result = transactionSchema.safeParse({
      type: TransactionType.EXPENSE,
      amount: "50000",
      description: "Ăn trưa cơm tấm",
      category: Category.FOOD,
      date: "2026-11-26",
    });
    expect(result.success).toBe(true);
  });

  it("từ chối giao dịch có số tiền âm hoặc không phải số nguyên", () => {
    const negResult = transactionSchema.safeParse({
      type: TransactionType.EXPENSE,
      amount: -1000,
      description: "Test âm",
      category: Category.FOOD,
      date: "2026-11-26",
    });
    const floatResult = transactionSchema.safeParse({
      type: TransactionType.EXPENSE,
      amount: 10.5,
      description: "Test số thập phân",
      category: Category.FOOD,
      date: "2026-11-26",
    });
    expect(negResult.success).toBe(false);
    expect(floatResult.success).toBe(false);
  });

  it("kiểm tra wishlistSchema và budgetSchema", () => {
    const validWishlist = wishlistSchema.safeParse({
      name: "Bàn phím cơ",
      cost: 1500000,
      priority: Priority.MEDIUM,
    });
    const invalidBudget = budgetSchema.safeParse({
      category: Category.FOOD,
      limit: 0,
    });
    expect(validWishlist.success).toBe(true);
    expect(invalidBudget.success).toBe(false);
  });
});