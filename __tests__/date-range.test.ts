import { describe, expect, test } from "vitest";
import { getDateRange } from "@/lib/finance";

describe("getDateRange", () => {
  const now = new Date(2026, 10, 15); // 15/11/2026

  test("tháng này: từ ngày 1 đến trước ngày 1 tháng sau", () => {
    expect(getDateRange("this-month", now)).toEqual({
      gte: new Date(2026, 10, 1),
      lt: new Date(2026, 11, 1),
    });
  });

  test("tháng trước của tháng 1 là tháng 12 năm trước", () => {
    expect(getDateRange("last-month", new Date(2027, 0, 10))).toEqual({
      gte: new Date(2026, 11, 1),
      lt: new Date(2027, 0, 1),
    });
  });

  test("tất cả: không giới hạn ngày", () => {
    expect(getDateRange("all", now)).toBeUndefined();
  });
});
