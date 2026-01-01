import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateImportCreate,
  validateImportUpdate,
} from '~/validators/import.validation.js';

describe('Unit Test: Import Validation Middleware', () => {
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

    it('TestCase 1: Thành công - Dữ liệu nhập đầy đủ và hợp lệ', () => {
      mockReq.body = validBody;

      validateImportCreate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('TestCase 2: Lỗi (400) - Thiếu trường bắt buộc "importDate"', () => {
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

    it('TestCase 3: Lỗi (400) - Thiếu trường bắt buộc "supplier" (Nhà cung cấp)', () => {
      const invalidBody = { ...validBody };
      delete invalidBody.supplier;

      mockReq.body = invalidBody;

      validateImportCreate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('TestCase 4: Lỗi (400) - Thiếu trường bắt buộc "breed" (Giống)', () => {
      const invalidBody = { ...validBody };
      delete invalidBody.breed;

      mockReq.body = invalidBody;

      validateImportCreate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('TestCase 5: Lỗi (400) - Số lượng (quantity) không hợp lệ (nhỏ hơn 1)', () => {
      const invalidBody = {
        ...validBody,
        quantity: 0,
      };

      mockReq.body = invalidBody;

      validateImportCreate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('TestCase 6: Lỗi (400) - Trọng lượng TB (avgWeight) không hợp lệ (nhỏ hơn 0.1)', () => {
      const invalidBody = {
        ...validBody,
        avgWeight: 0,
      };

      mockReq.body = invalidBody;

      validateImportCreate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('TestCase 7: Lỗi (400) - Thiếu trường bắt buộc "barn" (Khu nuôi)', () => {
      const invalidBody = { ...validBody };
      delete invalidBody.barn;

      mockReq.body = invalidBody;

      validateImportCreate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('TestCase 8: Thành công - Chấp nhận "flockId" rỗng (Tạo chuồng mới)', () => {
      const bodyWithEmptyFlockId = {
        ...validBody,
        flockId: '',
      };

      mockReq.body = bodyWithEmptyFlockId;

      validateImportCreate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('TestCase 9: Thành công - Chấp nhận trạng thái "Đang nuôi"', () => {
      const bodyWithStatus = {
        ...validBody,
        status: 'Đang nuôi',
      };

      mockReq.body = bodyWithStatus;

      validateImportCreate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('TestCase 10: Thành công - Chấp nhận trạng thái "Hoàn thành"', () => {
      const bodyWithStatus = {
        ...validBody,
        status: 'Hoàn thành',
      };

      mockReq.body = bodyWithStatus;

      validateImportCreate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('TestCase 11: Lỗi (400) - Trạng thái (status) không nằm trong danh sách cho phép', () => {
      const bodyWithInvalidStatus = {
        ...validBody,
        status: 'Trạng thái không hợp lệ',
      };

      mockReq.body = bodyWithInvalidStatus;

      validateImportCreate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('TestCase 12: Thành công - Không gửi trường "status" (Dùng mặc định)', () => {
      const bodyWithoutStatus = { ...validBody };
      delete bodyWithoutStatus.status;

      mockReq.body = bodyWithoutStatus;

      validateImportCreate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });


  describe('validateImportUpdate', () => {
    it('TestCase 13: Thành công - Cập nhật một phần (Partial Update) hợp lệ', () => {
      mockReq.body = { quantity: 200 };

      validateImportUpdate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('TestCase 14: Lỗi (400) - Request Body rỗng (Empty Object)', () => {
      mockReq.body = {};

      validateImportUpdate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message:
          'Dữ liệu cập nhật không hợp lệ. Không được để trống request body.',
      });
    });

    it('TestCase 15: Lỗi (400) - Request Body là null', () => {
      mockReq.body = null;

      validateImportUpdate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('TestCase 16: Thành công - Cập nhật trạng thái hợp lệ', () => {
      mockReq.body = { status: 'Hoàn thành' };

      validateImportUpdate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('TestCase 17: Lỗi (400) - Cập nhật trạng thái không hợp lệ', () => {
      mockReq.body = { status: 'Trạng thái không hợp lệ' };

      validateImportUpdate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('TestCase 18: Lỗi (400) - Cập nhật số lượng nhỏ hơn 1', () => {
      mockReq.body = { quantity: 0 };

      validateImportUpdate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('TestCase 19: Lỗi (400) - Cập nhật trọng lượng TB nhỏ hơn 0.1', () => {
      mockReq.body = { avgWeight: 0 };

      validateImportUpdate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('TestCase 20: Thành công - Cập nhật "flockId" rỗng', () => {
      mockReq.body = { flockId: '' };

      validateImportUpdate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});