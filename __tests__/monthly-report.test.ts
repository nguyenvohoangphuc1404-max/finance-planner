import { describe, expect, it } from "vitest";
import {
  buildMonthlyComparison,
  calculateSpendingTrend,
} from "@/lib/monthly-report";

describe("monthly-report", () => {
  it("gom nhóm chính xác thu và chi theo 6 tháng gần nhất", () => {
    const refDate = new Date("2026-11-15T00:00:00Z");
    const txs = [
      { amount: 10000000, type: "INCOME", date: "2026-10-05T00:00:00Z" },
      { amount: 4000000, type: "EXPENSE", date: "2026-10-12T00:00:00Z" },
      { amount: 12000000, type: "INCOME", date: "2026-11-02T00:00:00Z" },
      { amount: 5000000, type: "EXPENSE", date: "2026-11-10T00:00:00Z" },
    ];

    const result = buildMonthlyComparison(txs, 6, refDate);
    expect(result).toHaveLength(6);
    expect(result[4]).toMatchObject({
      monthKey: "2026-10",
      income: 10000000,
      expense: 4000000,
    });
    expect(result[5]).toMatchObject({
      monthKey: "2026-11",
      income: 12000000,
      expense: 5000000,
    });
  });

  it("tính đúng phần trăm xu hướng tăng/giảm chi tiêu giữa 2 tháng cuối", () => {
    const trendUp = calculateSpendingTrend([
      { monthKey: "2026-10", label: "T10/2026", income: 0, expense: 4000000 },
      { monthKey: "2026-11", label: "T11/2026", income: 0, expense: 5000000 },
    ]);
    expect(trendUp.direction).toBe("up");
    expect(trendUp.diffAmount).toBe(1000000);
    expect(trendUp.diffPercent).toBe(25);

    const trendDown = calculateSpendingTrend([
      { monthKey: "2026-10", label: "T10/2026", income: 0, expense: 4000000 },
      { monthKey: "2026-11", label: "T11/2026", income: 0, expense: 3000000 },
    ]);
    expect(trendDown.direction).toBe("down");
    expect(trendDown.diffAmount).toBe(-1000000);
    expect(trendDown.diffPercent).toBe(-25);
  });
});