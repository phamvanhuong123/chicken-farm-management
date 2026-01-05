import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userValidate } from '~/validators/user.validation'; 
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';

describe('Unit Test: User Validator - updateUser', () => {
  let mockReq, mockRes, mockNext;

  // Chuẩn bị một mật khẩu mạnh để pass qua regex khó nhằn kia
  // Regex yêu cầu: Chữ thường, Chữ hoa, Số, Ký tự đặc biệt, 8-50 ký tự
  const validStrongPass = 'Manh@123456'; 
  const {updateUser} = userValidate
  beforeEach(() => {
    mockReq = {
      // Giả lập user đang đăng nhập
      user: { id: 'user-123' }, 
      // Giả lập ID trên URL params
      params: { id: 'user-123' }, 
      body: {}
    };
    mockRes = {};
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  // ==========================================
  // PHẦN 1: TEST QUYỀN (AUTHORIZATION)
  // ==========================================
  describe('Authorization Check', () => {
    it('TestCase 1: PASS - User tự sửa thông tin của chính mình (id khớp)', async () => {
      // Setup: ID trong token trùng ID trên URL
      mockReq.user.id = 'my-id';
      mockReq.params.id = 'my-id';
      mockReq.body = { username: 'New Name' };

      await updateUser(mockReq, mockRes, mockNext);

      // Thành công -> next() không tham số
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeUndefined();
    });

    it('TestCase 2: FAIL (403) - User cố tình sửa thông tin người khác (id lệch)', async () => {
     
      mockReq.user.id = 'hacker-id';
      mockReq.params.id = 'victim-id';
    
      mockReq.body = { username: 'Hacked Name' }; 

      await updateUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(StatusCodes.FORBIDDEN);
      expect(error.message).toContain('không có quyền sửa');
    });
  });

  describe('Joi Validation Logic', () => {
    
    // --- HAPPY PATHS ---
    it('TestCase 3: PASS - Dữ liệu đầy đủ và hợp lệ', async () => {
      mockReq.body = {
        username: 'Nguyen Van A',
        phone: '0987654321', // 10 số, bắt đầu bằng 0
        currentPassword: 'oldPass',
        newPassword: validStrongPass,
        email: 'email@test.com'
      };

      await updateUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeUndefined();
    });

    it('TestCase 4: PASS - Chỉ update 1 trường (username) vẫn ok', async () => {
      mockReq.body = { username: 'Just Name' };

      await updateUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    // --- ERROR PATHS ---

    it('TestCase 5: FAIL (422) - Username quá ngắn (< 2 ký tự)', async () => {
      mockReq.body = { username: 'A' };

      await updateUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
      expect(error.message).toContain('username');
    });

    it('TestCase 6: FAIL (422) - Số điện thoại sai định dạng (không bắt đầu bằng 0)', async () => {
      mockReq.body = { phone: '1987654321' }; // Bắt đầu số 1

      await updateUser(mockReq, mockRes, mockNext);

      const error = mockNext.mock.calls[0][0];
      expect(error.message).toContain('Số điện thoại không hợp lệ');
    });

    it('TestCase 7: FAIL (422) - Số điện thoại sai độ dài (9 số)', async () => {
      mockReq.body = { phone: '098765432' }; // Thiếu 1 số

      await updateUser(mockReq, mockRes, mockNext);

      const error = mockNext.mock.calls[0][0];
      expect(error.message).toContain('Số điện thoại không hợp lệ');
    });

    it('TestCase 8: FAIL (422) - Mật khẩu mới quá yếu (Thiếu ký tự đặc biệt/Số/Hoa)', async () => {
      mockReq.body = { newPassword: 'weakpassword' }; 

      await updateUser(mockReq, mockRes, mockNext);

      const error = mockNext.mock.calls[0][0];
      expect(error.message).toContain('Định dạng không hợp lệ');
    });

    it('TestCase 9: FAIL (422) - Email không đúng định dạng', async () => {
      mockReq.body = { email: 'invalid-email' }; 

      await updateUser(mockReq, mockRes, mockNext);

      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
      expect(error.message).toContain('email');
    });
  });
});