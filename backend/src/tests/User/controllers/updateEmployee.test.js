import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateEmployee } from '~/controllers/authController'; 
import { userService } from '~/services/user.service';
import { StatusCodes } from 'http-status-codes';

// Mock Service
vi.mock('~/services/user.service');

describe('Unit Test: User Controller - updateEmployee', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      params: { idEmployee: 'emp-123' },
      body: { 
        salary: 10000000,
        roleId: 'manager' 
      }
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  it('TestCase 1: Thành công - Cập nhật thông tin nhân viên (Status 202)', async () => {
    // Arrange
    const mockResult = { 
      _id: 'emp-123', 
      ...mockReq.body 
    };
    
    // Giả lập Service trả về kết quả thành công
    userService.updateEmployee.mockResolvedValue(mockResult);

    // Act
    await updateEmployee(mockReq, mockRes, mockNext);

    // Assert
    // 1. Kiểm tra Service được gọi đúng ID và Body
    expect(userService.updateEmployee).toHaveBeenCalledWith(
      'emp-123', 
      mockReq.body
    );

    // 2. Kiểm tra Response trả về đúng Status Code 202 (ACCEPTED)
    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.ACCEPTED);
    expect(mockRes.json).toHaveBeenCalledWith({
      statusCode: StatusCodes.ACCEPTED,
      message: "Cật nhật nhân viên thành công",
      data: mockResult,
    });
  });

  it('TestCase 2: Lỗi - Chuyển tiếp lỗi sang middleware (VD: Lỗi DB hoặc Validation)', async () => {
    // Arrange
    const error = new Error("Update Failed");
    userService.updateEmployee.mockRejectedValue(error);

    // Act
    await updateEmployee(mockReq, mockRes, mockNext);

    // Assert
    expect(mockNext).toHaveBeenCalledWith(error);
  });
});