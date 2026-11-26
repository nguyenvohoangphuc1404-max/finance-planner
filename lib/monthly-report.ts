export interface RawTransactionItem {
  amount: number;
  type: string;
  date: Date | string;
}

export interface MonthlySummaryItem {
  monthKey: string;
  label: string;
  income: number;
  expense: number;
}

export interface SpendingTrendResult {
  currentExpense: number;
  previousExpense: number;
  diffAmount: number;
  diffPercent: number;
  direction: "up" | "down" | "flat";
}

export function buildMonthlyComparison(
  transactions: RawTransactionItem[],
  monthsCount = 6,
  referenceDate = new Date()
): MonthlySummaryItem[] {
  const buckets = new Map<string, MonthlySummaryItem>();

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() - i,
      1
    );
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const monthKey = `${year}-${month}`;
    buckets.set(monthKey, {
      monthKey,
      label: `T${d.getMonth() + 1}/${year}`,
      income: 0,
      expense: 0,
    });
  }

  for (const tx of transactions) {
    const d = new Date(tx.date);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = buckets.get(key);
    if (!bucket) continue;

    if (tx.type === "INCOME") {
      bucket.income += tx.amount;
    } else if (tx.type === "EXPENSE") {
      bucket.expense += tx.amount;
    }
  }

  return Array.from(buckets.values());
}

export function calculateSpendingTrend(
  monthlyData: MonthlySummaryItem[]
): SpendingTrendResult {
  if (monthlyData.length < 2) {
    const current = monthlyData[monthlyData.length - 1]?.expense ?? 0;
    return {
      currentExpense: current,
      previousExpense: 0,
      diffAmount: current,
      diffPercent: current > 0 ? 100 : 0,
      direction: current > 0 ? "up" : "flat",
    };
  }

  const currentExpense = monthlyData[monthlyData.length - 1].expense;
  const previousExpense = monthlyData[monthlyData.length - 2].expense;
  const diffAmount = currentExpense - previousExpense;

  const diffPercent =
    previousExpense === 0
      ? currentExpense > 0
        ? 100
        : 0
      : Math.round((diffAmount / previousExpense) * 100);

  const direction =
    diffAmount > 0 ? "up" : diffAmount < 0 ? "down" : "flat";

  return {
    currentExpense,
    previousExpense,
    diffAmount,
    diffPercent,
    direction,
  };
}