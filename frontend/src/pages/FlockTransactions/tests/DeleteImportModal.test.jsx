import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import DeleteImportModal from "../components/Modal/DeleteImportModal";

const mockItem = {
  _id: "123",
  importDate: "2025-12-01",
};

describe("DeleteImportModal", () => {
  test("xóa thành công gọi onDeleteSuccess", async () => {
    const onDeleteSuccess = vi.fn().mockResolvedValue(true);

    render(
      <DeleteImportModal
        importItem={mockItem}
        onDeleteSuccess={onDeleteSuccess}
      />
    );

    fireEvent.click(screen.getByTitle("Xóa đơn nhập"));
    fireEvent.click(screen.getByText("Xác nhận"));

    await waitFor(() => {
      expect(onDeleteSuccess).toHaveBeenCalledWith("123");
    });
  });
});
