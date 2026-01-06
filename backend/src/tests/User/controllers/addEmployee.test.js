import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addEmployee } from '~/controllers/authController'; 
import { userService } from '~/services/user.service';
import { StatusCodes } from 'http-status-codes';


vi.mock('~/services/user.service');

describe('Unit Test: User Controller - addEmployee', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      params: { parentId: 'parent-123' },
      body: { 
        email: 'employee@test.com',
        role: 'staff'
      }
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  it('TestCase 1: Thành công - Thêm nhân viên (Status 201)', async () => {

    const mockResult = { 
      _id: 'emp-new', 
      parentId: 'parent-123',
      ...mockReq.body 
    };
    
    userService.addEmployee.mockResolvedValue(mockResult);


    await addEmployee(mockReq, mockRes, mockNext);

  
    expect(userService.addEmployee).toHaveBeenCalledWith(
      'parent-123', 
      mockReq.body
    );


    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(mockRes.json).toHaveBeenCalledWith({
      statusCode: StatusCodes.CREATED,
      message: "Thành công",
      data: mockResult,
    });
  });

  it('TestCase 2: Lỗi - Chuyển tiếp lỗi từ Service (VD: Parent không tồn tại)', async () => {
  
    const error = new Error("Không có người nào");
    userService.addEmployee.mockRejectedValue(error);

 
    await addEmployee(mockReq, mockRes, mockNext);

 
    expect(mockNext).toHaveBeenCalledWith(error);
  });
});