// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { ExpensePieChart } from "@/components/expense-pie-chart";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
}));

describe("ExpensePieChart component", () => {
  it("hiển thị thông báo khi chưa có dữ liệu chi tiêu", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<ExpensePieChart data={[]} />);
    });

    expect(container.textContent).toContain("Chưa có dữ liệu chi tiêu để vẽ biểu đồ");
    root.unmount();
  });

  it("render bảng số liệu chi tiêu cho trình đọc màn hình khi có dữ liệu", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <ExpensePieChart
          data={[
            { name: "Ăn uống", value: 500000 },
            { name: "Di chuyển", value: 200000 },
          ]}
        />
      );
    });

    expect(container.textContent).toContain("Ăn uống");
    expect(container.textContent).toContain("Di chuyển");
    root.unmount();
  });
});