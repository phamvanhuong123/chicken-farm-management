import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from '~/services/user.service';
import { userModel } from '~/models/user.model';


vi.mock('~/models/user.model');

describe('Unit Test: User Service - updateEmployee', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const empId = 'emp-123';
  const updateData = { salary: 20000 };

  it('TestCase 1: Thành công - Gọi Model update và trả về kết quả', async () => {

    const mockUpdatedUser = { _id: empId, ...updateData };
    

    userModel.updateEmployee.mockResolvedValue(mockUpdatedUser);

 
    const result = await userService.updateEmployee(empId, updateData);


    expect(userModel.updateEmployee).toHaveBeenCalledWith(empId, updateData);
    expect(result).toEqual(mockUpdatedUser);
  });

  it('TestCase 2: Lỗi Hệ thống - Ném lỗi khi Model gặp sự cố', async () => {
  
    const dbError = new Error("Database Connection Error");
    userModel.updateEmployee.mockRejectedValue(dbError);

 
    await expect(userService.updateEmployee(empId, updateData))
      .rejects
      .toThrow("Database Connection Error");
  });


  it('TestCase 3: Kiểm tra trường hợp không tìm thấy User (Model trả về null)', async () => {
   
    
    userModel.updateEmployee.mockResolvedValue(null);

    const result = await userService.updateEmployee(empId, updateData);

    expect(result).toBeNull();
 
  });
});