import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getImportList,
  createImport,
  getImportDetail,
  updateImport,
  deleteImport,
} from '~/controllers/import.controller.js';
import { importService } from '~/services/import.service.js';

vi.mock('~/services/import.service.js');

describe('Import Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      query: {},
      params: {},
      body: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe('getImportList', () => {
    it('1. Trả về danh sách import thành công', async () => {
      const mockResult = {
        items: [
          {
            _id: '1',
            importDate: '2024-01-15',
            supplier: 'NCC A',
            breed: 'Gà ta',
            quantity: 100,
            avgWeight: 1.5,
            barn: 'Khu A',
            status: 'Đang nuôi',
          },
        ],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      };

      importService.getImports.mockResolvedValue(mockResult);

      await getImportList(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Tải danh sách nhập chuồng thành công',
        data: mockResult,
      });
    });

    it('2. Xử lý lỗi và gọi next', async () => {
      const mockError = new Error('Database error');
      importService.getImports.mockRejectedValue(mockError);

      await getImportList(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('createImport', () => {
    const validBody = {
      importDate: '2024-01-15',
      supplier: 'NCC A',
      breed: 'Gà ta',
      quantity: 100,
      avgWeight: 1.5,
      barn: 'Khu A',
      flockId: 'FL001',
    };

    it('3. Tạo import thành công', async () => {
      const mockNewImport = {
        _id: '507f1f77bcf86cd799439011',
        ...validBody,
        status: 'Đang nuôi',
      };

      mockReq.body = validBody;
      importService.createImport.mockResolvedValue(mockNewImport);

      await createImport(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Thêm lứa nhập chuồng thành công.',
        data: mockNewImport,
      });
    });

    it('4. Trả về 400 khi thiếu trường bắt buộc', async () => {
      const invalidBody = {
        importDate: '2024-01-15',
        // Thiếu supplier, breed, etc.
      };

      mockReq.body = invalidBody;

      await createImport(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Vui lòng điền đầy đủ và hợp lệ thông tin.',
      });
    });

    it('5. Trả về 400 khi số lượng nhỏ hơn 1', async () => {
      const invalidBody = {
        importDate: '2024-01-15',
        supplier: 'NCC A',
        breed: 'Gà ta',
        quantity: 0,
        avgWeight: 1.5,
        barn: 'Khu A',
      };

      mockReq.body = invalidBody;

      await createImport(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('6. Trả về 400 khi trọng lượng TB nhỏ hơn 0.1', async () => {
      const invalidBody = {
        importDate: '2024-01-15',
        supplier: 'NCC A',
        breed: 'Gà ta',
        quantity: 100,
        avgWeight: 0,
        barn: 'Khu A',
      };

      mockReq.body = invalidBody;

      await createImport(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('7. Trả về 400 khi trạng thái không hợp lệ', async () => {
      const invalidBody = {
        importDate: '2024-01-15',
        supplier: 'NCC A',
        breed: 'Gà ta',
        quantity: 100,
        avgWeight: 1.5,
        barn: 'Khu A',
        status: 'Trạng thái không hợp lệ',
      };

      mockReq.body = invalidBody;

      await createImport(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('8. Chấp nhận flockId tùy chọn', async () => {
      const bodyWithoutFlockId = { ...validBody };
      delete bodyWithoutFlockId.flockId;

      mockReq.body = bodyWithoutFlockId;
      importService.createImport.mockResolvedValue({
        _id: '1',
        ...bodyWithoutFlockId,
      });

      await createImport(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('9. Đặt trạng thái mặc định khi không được cung cấp', async () => {
      const bodyWithoutStatus = { ...validBody };
      delete bodyWithoutStatus.status;

      mockReq.body = bodyWithoutStatus;
      const mockResponse = {
        _id: '1',
        ...bodyWithoutStatus,
        status: 'Đang nuôi',
      };
      importService.createImport.mockResolvedValue(mockResponse);

      await createImport(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'Đang nuôi' }),
        })
      );
    });

    it('10. Trả về 500 khi service thất bại', async () => {
      mockReq.body = validBody;
      importService.createImport.mockRejectedValue(new Error('DB Error'));

      await createImport(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Không thể lưu, vui lòng thử lại sau.',
      });
    });
  });

  describe('getImportDetail', () => {
    it('11. Trả về chi tiết import thành công', async () => {
      const mockImport = {
        _id: '507f1f77bcf86cd799439011',
        breed: 'Gà ta',
        quantity: 100,
      };

      mockReq.params.id = '507f1f77bcf86cd799439011';
      importService.getImport.mockResolvedValue(mockImport);

      await getImportDetail(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Tải dữ liệu thành công.',
        data: mockImport,
      });
    });

    it('12. Trả về 404 khi không tìm thấy import', async () => {
      mockReq.params.id = '507f1f77bcf86cd799439011';
      importService.getImport.mockResolvedValue(null);

      await getImportDetail(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Không tìm thấy đơn nhập.',
      });
    });

    it('13. Trả về 500 khi service thất bại', async () => {
      mockReq.params.id = '1';
      importService.getImport.mockRejectedValue(new Error('Service error'));

      await getImportDetail(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Thao tác không thành công, vui lòng thử lại.',
      });
    });
  });

  describe('updateImport', () => {
    it('14. Cập nhật import thành công', async () => {
      const updateData = { quantity: 200, status: 'Hoàn thành' };
      const updatedImport = {
        _id: '507f1f77bcf86cd799439011',
        ...updateData,
      };

      mockReq.params.id = '507f1f77bcf86cd799439011';
      mockReq.body = updateData;
      importService.updateImport.mockResolvedValue(updatedImport);

      await updateImport(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Cập nhật đơn thành công.',
        data: updatedImport,
      });
    });

    it('15. Trả về 404 khi không tìm thấy import để cập nhật', async () => {
      mockReq.params.id = '507f1f77bcf86cd799439011';
      mockReq.body = { quantity: 200 };
      importService.updateImport.mockResolvedValue(null);

      await updateImport(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Không tìm thấy đơn nhập.',
      });
    });

    it('16. Trả về 500 khi service thất bại', async () => {
      mockReq.params.id = '1';
      mockReq.body = { quantity: 200 };
      importService.updateImport.mockRejectedValue(new Error('DB Error'));

      await updateImport(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Thao tác không thành công, vui lòng thử lại.',
      });
    });

    it('17. Cho phép cập nhật một phần', async () => {
      const partialUpdate = { quantity: 150 };
      const updatedImport = {
        _id: '1',
        breed: 'Gà ta',
        quantity: 150,
      };

      mockReq.params.id = '1';
      mockReq.body = partialUpdate;
      importService.updateImport.mockResolvedValue(updatedImport);

      await updateImport(mockReq, mockRes);

      expect(importService.updateImport).toHaveBeenCalledWith('1', partialUpdate);
    });
  });

  describe('deleteImport', () => {
    it('18. Xóa import thành công', async () => {
      const deletedImport = {
        _id: '507f1f77bcf86cd799439011',
        quantity: 100,
      };

      mockReq.params.id = '507f1f77bcf86cd799439011';
      importService.deleteImport.mockResolvedValue(deletedImport);

      await deleteImport(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Xóa đơn thành công.',
        data: deletedImport,
      });
    });

    it('19. Trả về 404 khi không tìm thấy import để xóa', async () => {
      mockReq.params.id = '507f1f77bcf86cd799439011';
      importService.deleteImport.mockResolvedValue(null);

      await deleteImport(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Không tìm thấy đơn nhập.',
      });
    });

    it('20. Trả về 500 khi service thất bại', async () => {
      mockReq.params.id = '1';
      importService.deleteImport.mockRejectedValue(new Error('DB Error'));

      await deleteImport(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Thao tác không thành công, vui lòng thử lại.',
      });
    });
  });
});