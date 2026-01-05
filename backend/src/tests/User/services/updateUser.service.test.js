import { describe, it, expect, vi, beforeEach } from "vitest";
import { userService } from "~/services/user.service";
import { userModel } from "~/models/user.model"; 
import { uploadFile, deleteImage } from "~/providers/CloudinaryProvider";
import bcrypt from "bcrypt";

// --- 1. MOCK SETUP ---
vi.mock("~/models/user.model", () => ({
  userModel: { findById: vi.fn(), updateUser: vi.fn() },
}));

vi.mock("~/providers/CloudinaryProvider", () => ({
  uploadFile: vi.fn(), deleteImage: vi.fn(),
}));

vi.mock("bcrypt", () => ({
  default: { compare: vi.fn(), hash: vi.fn() },
}));

const mockUser = {
  _id: "user-123",
  password: "hashed-pass",
  imgPublicId: "old-img-id", 
  imgUrl: "old-url",
};

beforeEach(() => { vi.clearAllMocks(); });

describe("Unit Test: userService.updateUser", () => {
  
  //Nhóm testcase lỗi

  it("TestCase 1: Lỗi (404) - Người dùng không tồn tại", async () => {
    userModel.findById.mockResolvedValue(null);
    await expect(userService.updateUser("bad-id", {}, null))
      .rejects.toThrow("Người dùng không tồn tại");
  });

  it("TestCase 2: Lỗi (400) - Thiếu mật khẩu cũ hoặc mới khi đổi pass", async () => {
    userModel.findById.mockResolvedValue(mockUser);
    await expect(userService.updateUser("id", { currentPassword: "123"}, null))
      .rejects.toThrow("Phải cung cấp cả mật khẩu cũ và mật khẩu mới");
  });

  it("TestCase 3: Lỗi (400) - Mật khẩu cũ không chính xác", async () => {
    userModel.findById.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false); // Sai pass

    await expect(userService.updateUser("id", { currentPassword: "wrong", newPassword: "new" }, null))
      .rejects.toThrow("Mật khẩu cũ không hợp lệ");
  });

  it("TestCase 4: Lỗi (400) - Mật khẩu mới trùng với mật khẩu cũ", async () => {
    userModel.findById.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);

    await expect(userService.updateUser("id", { currentPassword: "same", newPassword: "same" }, null))
      .rejects.toThrow("Mật khẩu cũ và mới không được trùng nhau");
  });

  //Nhóm testcase thành công

  it("TestCase 5: Thành công - Đổi mật khẩu (Hash pass mới + Update DB)", async () => {
    userModel.findById.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue("new-hash");
    userModel.updateUser.mockResolvedValue({});

    await userService.updateUser("id", { currentPassword: "old", newPassword: "new" }, null);

    expect(bcrypt.hash).toHaveBeenCalledWith("new", 10);
    expect(userModel.updateUser).toHaveBeenCalledWith("id", expect.objectContaining({ password: "new-hash" }));
  });

  it("TestCase 6: Thành công - Upload ảnh mới VÀ xóa ảnh cũ (User đã có ảnh)", async () => {
    userModel.findById.mockResolvedValue(mockUser); 
    uploadFile.mockResolvedValue({ public_id: "new-id", secure_url: "new-url" });
    userModel.updateUser.mockResolvedValue({});

    await userService.updateUser("id", {}, "file");

    expect(deleteImage).toHaveBeenCalledWith("old-img-id"); 
    expect(userModel.updateUser).toHaveBeenCalledWith("id", expect.objectContaining({ imgPublicId: "new-id" }));
  });

  it("TestCase 7: Thành công - Upload ảnh mới (User chưa có ảnh cũ - Không xóa)", async () => {
    userModel.findById.mockResolvedValue({ ...mockUser, imgPublicId: null });
    uploadFile.mockResolvedValue({ public_id: "new-id", secure_url: "new-url" });
    userModel.updateUser.mockResolvedValue({});

    await userService.updateUser("id", {}, "file");

    expect(deleteImage).not.toHaveBeenCalled(); // Không được xóa
    expect(userModel.updateUser).toHaveBeenCalledWith("id", expect.objectContaining({ imgPublicId: "new-id" }));
  });
});