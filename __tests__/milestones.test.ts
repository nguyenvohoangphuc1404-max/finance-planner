import { describe, expect, test } from "vitest";
import { crossedMilestones } from "@/lib/finance";

describe("crossedMilestones", () => {
  test("vượt nhiều mốc trong một lần", () => {
    expect(crossedMilestones(40, 80)).toEqual([50, 75]);
  });

  test("không vượt mốc nào thì trả mảng rỗng", () => {
    expect(crossedMilestones(51, 74)).toEqual([]);
  });
});
