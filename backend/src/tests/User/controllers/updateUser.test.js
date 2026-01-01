import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateUser } from '~/controllers/authController';
import { StatusCodes } from 'http-status-codes';
import { userService } from '~/services/user.service';
vi.mock('~/services/user.service', () => ({
  userService: {
    updateUser: vi.fn(),
  },
}));

describe('Unit Test: User Controller - updateUser', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      params: { id: 'user-123' },
      body: { name: 'New Name' },
      file: { filename: 'avatar.jpg' }, 
    };

    mockRes = {
   
      status: vi.fn().mockReturnThis(), 
      json: vi.fn(),
    };

    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  it('TestCase 1: Thành công - Gọi Service đúng tham số và trả về response chuẩn (202)', async () => {
    const mockResult = { _id: 'user-123', name: 'New Name', avatar: 'url' };
    userService.updateUser.mockResolvedValue(mockResult);

    await updateUser(mockReq, mockRes, mockNext);

    expect(userService.updateUser).toHaveBeenCalledWith(
      'user-123',        
      { name: 'New Name' }, 
      { filename: 'avatar.jpg' } 
    );

    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.ACCEPTED); // 202

 
    expect(mockRes.json).toHaveBeenCalledWith({
      statusCode: StatusCodes.ACCEPTED,
      message: "Cật nhật thông tin người dùng thành công",
      data: mockResult,
    });
  });

  it('TestCase 2: Thành công - Vẫn hoạt động tốt nếu không có file upload (req.file undefined)', async () => {
    mockReq.file = undefined;
    userService.updateUser.mockResolvedValue({});

    await updateUser(mockReq, mockRes, mockNext);

    expect(userService.updateUser).toHaveBeenCalledWith(
      'user-123',
      expect.any(Object),
      undefined // Tham số thứ 3 phải là undefined
    );
    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.ACCEPTED);
  });

  it('TestCase 3: Lỗi - Chuyển tiếp lỗi sang middleware (next) khi Service ném lỗi', async () => {
    // Arrange
    const error = new Error("Lỗi Database hoặc Validation");
    userService.updateUser.mockRejectedValue(error);

    // Act
    await updateUser(mockReq, mockRes, mockNext);

  
    expect(mockRes.status).not.toHaveBeenCalled(); 
    expect(mockRes.json).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(error);
  });
});