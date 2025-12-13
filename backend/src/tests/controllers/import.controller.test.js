import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateImport, deleteImport } from "../../controllers/import.controller.js";
import { importService } from "../../services/import.service";

// Mock toàn bộ service
vi.mock("../../services/import.service.js", () => ({
  importService: {
    updateImport: vi.fn(),
    deleteImport: vi.fn(),
  },
}));

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn();
  return res;
};

describe("IMPORT CONTROLLER - Update & Delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

    /*
     PUT /v1/imports/:id
    */

  it("✔ cập nhật đơn nhập thành công", async () => {
    const req = {
      params: { id: "123" },
      body: { quantity: 200 },
    };
    const res = mockRes();

    importService.updateImport.mockResolvedValue({
      _id: "123",
      quantity: 200,
    });

    await updateImport(req, res);

    expect(importService.updateImport).toHaveBeenCalledWith(
      "123",
      req.body
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Cập nhật đơn thành công.",
      })
    );
  });

  it("❌ không tìm thấy đơn nhập khi cập nhật", async () => {
    const req = {
      params: { id: "999" },
      body: { quantity: 50 },
    };
    const res = mockRes();

    importService.updateImport.mockResolvedValue(null);

    await updateImport(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Không tìm thấy đơn nhập.",
    });
  });

  it("❌ lỗi server khi cập nhật", async () => {
    const req = {
      params: { id: "123" },
      body: { quantity: 100 },
    };
    const res = mockRes();

    importService.updateImport.mockRejectedValue(new Error("DB error"));

    await updateImport(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Thao tác không thành công, vui lòng thử lại.",
    });
  });

    /* 
     DELETE /v1/imports/:id
    */
  it("✔ xóa đơn nhập thành công", async () => {
    const req = {
      params: { id: "123" },
    };
    const res = mockRes();

    importService.deleteImport.mockResolvedValue({
      _id: "123",
      quantity: 100,
    });

    await deleteImport(req, res);

    expect(importService.deleteImport).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Xóa đơn thành công.",
      })
    );
  });

  it("❌ không tìm thấy đơn nhập khi xóa", async () => {
    const req = {
      params: { id: "999" },
    };
    const res = mockRes();

    importService.deleteImport.mockResolvedValue(null);

    await deleteImport(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Không tìm thấy đơn nhập.",
    });
  });

  it("❌ lỗi server khi xóa", async () => {
    const req = {
      params: { id: "123" },
    };
    const res = mockRes();

    importService.deleteImport.mockRejectedValue(new Error("DB error"));

    await deleteImport(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Thao tác không thành công, vui lòng thử lại.",
    });
  });
});
