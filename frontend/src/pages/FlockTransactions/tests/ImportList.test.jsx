import { render, screen } from "@testing-library/react";
import ImportList from "../components/ImportList";
import { vi } from "vitest";

const mockData = [
  {
    _id: "1",
    importDate: "2025-12-01",
    supplier: "Trại A",
    breed: "Gà ta",
    quantity: 100,
    avgWeight: 0.3,
    barn: "Khu A",
    status: "Đang nuôi",
  },
];

describe("ImportList", () => {
  test("hiển thị danh sách đơn nhập", () => {
    render(
      <ImportList
        list={mockData}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText("Trại A")).toBeInTheDocument();
    expect(screen.getByText("Gà ta")).toBeInTheDocument();
  });

  test("hiển thị thông báo khi không có dữ liệu", () => {
    render(<ImportList list={[]} />);
    expect(
      screen.getByText("Chưa có dữ liệu nhập chuồng")
    ).toBeInTheDocument();
  });
});
