import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findUserByParentId } from '~/controllers/authController'; 
import { userService } from '~/services/user.service';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';


vi.mock('~/services/user.service');

describe('Unit Test: User Controller - findUserByParentId', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      params: { parentId: 'parent-123' }
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  it('TestCase 1: Thành công - Trả về danh sách nhân viên (Status 202)', async () => {
    const mockEmployees = [
      { _id: 'emp-1', name: 'Nhan Vien A' },
      { _id: 'emp-2', name: 'Nhan Vien B' }
    ];
    userService.findUserByParentId.mockResolvedValue(mockEmployees);


    await findUserByParentId(mockReq, mockRes, mockNext);

 
    expect(userService.findUserByParentId).toHaveBeenCalledWith('parent-123');
    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.ACCEPTED);
    expect(mockRes.json).toHaveBeenCalledWith({
      statusCode: StatusCodes.ACCEPTED,
      message: "Thành công",
      data: mockEmployees,
    });
  });

  it('TestCase 2: Lỗi (400) - Thiếu parentId trong params', async () => {
  
    mockReq.params.parentId = undefined; // Giả lập trường hợp không gửi ID

  
    await findUserByParentId(mockReq, mockRes, mockNext);

  
    expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    const error = mockNext.mock.calls[0][0];
    expect(error.statusCode).toBe(StatusCodes.BAD_REQUEST);
    expect(error.message).toBe("Thiếu parentId");
    
    // Đảm bảo Service KHÔNG được gọi nếu thiếu ID
    expect(userService.findUserByParentId).not.toHaveBeenCalled();
  });

  it('TestCase 3: Lỗi - Chuyển tiếp lỗi từ Service (VD: Lỗi DB hoặc 404)', async () => {

    
    const error = new ApiError(StatusCodes.NOT_FOUND, "Chưa có nhân viên nào");
    userService.findUserByParentId.mockRejectedValue(error);

    await findUserByParentId(mockReq, mockRes, mockNext);


    expect(mockNext).toHaveBeenCalledWith(error);
  });
});