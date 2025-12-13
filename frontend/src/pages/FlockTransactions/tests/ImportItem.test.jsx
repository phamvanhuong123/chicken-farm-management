import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import ImportItem from "../components/ImportItem";

const mockItem = {
  _id: "123",
  importDate: "2025-12-01",
  supplier: "Trại A",
  breed: "Gà ta",
  quantity: 100,
  avgWeight: 0.3,
  barn: "Khu A",
  status: "Đang nuôi",
};

describe("ImportItem", () => {
  test("click sửa gọi onEdit", () => {
    const onEdit = vi.fn();

    render(
      <table>
        <tbody>
          <ImportItem
            item={mockItem}
            onEdit={onEdit}
            onDelete={vi.fn()}
          />
        </tbody>
      </table>
    );

    fireEvent.click(screen.getByTitle("Chỉnh sửa"));

    expect(onEdit).toHaveBeenCalledWith(mockItem);
  });
});
