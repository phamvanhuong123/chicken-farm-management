import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from '~/services/user.service';
import { userModel } from '~/models/user.model';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';


vi.mock('~/models/user.model');

describe('Unit Test: User Service - addEmployee', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const parentId = 'owner-1';
  const employeeData = { email: 'staff@test.com' };

  it('TestCase 1: Thành công - Chủ trại tồn tại -> Thêm nhân viên mới', async () => {

    userModel.findById.mockResolvedValue({ _id: parentId, name: 'Boss' });
    

    const mockNewEmployee = { _id: 'emp-1', parentId: parentId };
    userModel.addEmployee.mockResolvedValue(mockNewEmployee);

   
    const result = await userService.addEmployee(parentId, employeeData);


    expect(userModel.findById).toHaveBeenCalledWith(parentId);
    expect(userModel.addEmployee).toHaveBeenCalledWith(parentId, employeeData);
    expect(result).toEqual(mockNewEmployee);
  });

  it('TestCase 2: Lỗi (404) - Không tìm thấy chủ trại (ParentId sai)', async () => {
  
    userModel.findById.mockResolvedValue(null);

   
    await expect(userService.addEmployee(parentId, employeeData))
      .rejects
      .toThrow(ApiError);

    try {
      await userService.addEmployee(parentId, employeeData);
    } catch (error) {
      expect(error.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(error.message).toBe("Không có người nào");
    }

    // Đảm bảo hàm addEmployee KHÔNG được gọi nếu không tìm thấy chủ
    expect(userModel.addEmployee).not.toHaveBeenCalled();
  });

  it('TestCase 3: Lỗi Hệ thống - Database lỗi khi tìm chủ trại', async () => {

    const dbError = new Error("DB Connection Failed");
    userModel.findById.mockRejectedValue(dbError);


    await expect(userService.addEmployee(parentId, employeeData))
      .rejects
      .toThrow("DB Connection Failed");
  });

  it('TestCase 4: Lỗi Hệ thống - Database lỗi khi thêm nhân viên', async () => {
   
    userModel.findById.mockResolvedValue({ _id: parentId });
  
    const addError = new Error("Duplicate Email");
    userModel.addEmployee.mockRejectedValue(addError);


    await expect(userService.addEmployee(parentId, employeeData))
      .rejects
      .toThrow("Duplicate Email");
  });
});