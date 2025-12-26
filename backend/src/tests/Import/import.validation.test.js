import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateImportCreate,
  validateImportUpdate,
} from '~/validators/import.validation.js';

describe('Import Validation', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe('validateImportCreate', () => {
    const validBody = {
      importDate: '2024-01-15',
      supplier: 'NCC A',
      breed: 'Gà ta',
      quantity: 100,
      avgWeight: 1.5,
      barn: 'Khu A',
    };

    it('1. Cho phép validation với dữ liệu hợp lệ', () => {
      mockReq.body = validBody;

      validateImportCreate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('2. Từ chối khi thiếu ngày nhập', () => {
      const invalidBody = { ...validBody };
      delete invalidBody.importDate;

      mockReq.body = invalidBody;

      validateImportCreate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Vui lòng điền đầy đủ và hợp lệ thông tin.',
        errors: expect.any(Array),
      });
    });

    it('3. Từ chối khi thiếu nhà cung cấp', () => {
      const invalidBody = { ...validBody };
      delete invalidBody.supplier;

      mockReq.body = invalidBody;

      validateImportCreate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('4. Từ chối khi thiếu giống', () => {
      const invalidBody = { ...validBody };
      delete invalidBody.breed;

      mockReq.body = invalidBody;

      validateImportCreate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('5. Từ chối khi số lượng nhỏ hơn 1', () => {
      const invalidBody = {
        ...validBody,
        quantity: 0,
      };

      mockReq.body = invalidBody;

      validateImportCreate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('6. Từ chối khi trọng lượng TB nhỏ hơn 0.1', () => {
      const invalidBody = {
        ...validBody,
        avgWeight: 0,
      };

      mockReq.body = invalidBody;

      validateImportCreate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('7. Từ chối khi thiếu khu nuôi', () => {
      const invalidBody = { ...validBody };
      delete invalidBody.barn;

      mockReq.body = invalidBody;

      validateImportCreate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('8. Chấp nhận flockId rỗng', () => {
      const bodyWithEmptyFlockId = {
        ...validBody,
        flockId: '',
      };

      mockReq.body = bodyWithEmptyFlockId;

      validateImportCreate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('9. Chấp nhận trạng thái "Đang nuôi" hợp lệ', () => {
      const bodyWithStatus = {
        ...validBody,
        status: 'Đang nuôi',
      };

      mockReq.body = bodyWithStatus;

      validateImportCreate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('10. Chấp nhận trạng thái "Hoàn thành" hợp lệ', () => {
      const bodyWithStatus = {
        ...validBody,
        status: 'Hoàn thành',
      };

      mockReq.body = bodyWithStatus;

      validateImportCreate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('11. Từ chối trạng thái không hợp lệ', () => {
      const bodyWithInvalidStatus = {
        ...validBody,
        status: 'Trạng thái không hợp lệ',
      };

      mockReq.body = bodyWithInvalidStatus;

      validateImportCreate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('12. Chấp nhận không có trạng thái (tùy chọn)', () => {
      const bodyWithoutStatus = { ...validBody };
      delete bodyWithoutStatus.status;

      mockReq.body = bodyWithoutStatus;

      validateImportCreate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateImportUpdate', () => {
    it('13. Cho phép validation cho cập nhật một phần hợp lệ', () => {
      mockReq.body = { quantity: 200 };

      validateImportUpdate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('14. Từ chối request body rỗng', () => {
      mockReq.body = {};

      validateImportUpdate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message:
          'Dữ liệu cập nhật không hợp lệ. Không được để trống request body.',
      });
    });

    it('15. Từ chối request body null', () => {
      mockReq.body = null;

      validateImportUpdate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('16. Chấp nhận cập nhật một phần với trạng thái hợp lệ', () => {
      mockReq.body = { status: 'Hoàn thành' };

      validateImportUpdate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('17. Từ chối trạng thái không hợp lệ trong cập nhật', () => {
      mockReq.body = { status: 'Trạng thái không hợp lệ' };

      validateImportUpdate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('18. Từ chối số lượng nhỏ hơn 1 trong cập nhật', () => {
      mockReq.body = { quantity: 0 };

      validateImportUpdate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('19. Từ chối trọng lượng TB nhỏ hơn 0.1 trong cập nhật', () => {
      mockReq.body = { avgWeight: 0 };

      validateImportUpdate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('20. Chấp nhận flockId rỗng trong cập nhật', () => {
      mockReq.body = { flockId: '' };

      validateImportUpdate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});