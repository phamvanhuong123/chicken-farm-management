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

describe('Unit Test: Import Controller', () => {
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
    it('TestCase 1: Thành công - Trả về danh sách đơn nhập chuồng', async () => {
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

    it('TestCase 2: Lỗi (System) - Chuyển tiếp lỗi sang middleware xử lý lỗi (next) khi DB gặp sự cố', async () => {
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

    it('TestCase 3: Thành công - Tạo mới đơn nhập chuồng', async () => {
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

    it('TestCase 4: Lỗi (400) - Thiếu trường bắt buộc trong dữ liệu gửi lên', async () => {
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

    it('TestCase 5: Lỗi (400) - Số lượng (quantity) không hợp lệ (nhỏ hơn 1)', async () => {
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

    it('TestCase 6: Lỗi (400) - Trọng lượng TB (avgWeight) không hợp lệ (nhỏ hơn 0.1)', async () => {
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

    it('TestCase 7: Lỗi (400) - Trạng thái (status) không nằm trong danh sách cho phép', async () => {
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

    it('TestCase 8: Thành công - Chấp nhận flockId tùy chọn (không bắt buộc)', async () => {
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

    it('TestCase 9: Thành công - Tự động đặt trạng thái mặc định khi thiếu trường status', async () => {
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

    it('TestCase 10: Lỗi (500) - Xử lý lỗi hệ thống khi Service thất bại', async () => {
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
    it('TestCase 11: Thành công - Trả về chi tiết đơn nhập theo ID', async () => {
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

    it('TestCase 12: Lỗi (404) - Không tìm thấy đơn nhập (ID hợp lệ nhưng không tồn tại)', async () => {
      mockReq.params.id = '507f1f77bcf86cd799439011';
      importService.getImport.mockResolvedValue(null);

      await getImportDetail(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Không tìm thấy đơn nhập.',
      });
    });

    it('TestCase 13: Lỗi (500) - Xử lý lỗi hệ thống khi lấy chi tiết', async () => {
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
    it('TestCase 14: Thành công - Cập nhật thông tin đơn nhập', async () => {
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

    it('TestCase 15: Lỗi (404) - Không tìm thấy đơn nhập cần cập nhật', async () => {
      mockReq.params.id = '507f1f77bcf86cd799439011';
      mockReq.body = { quantity: 200 };
      importService.updateImport.mockResolvedValue(null);

      await updateImport(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Không tìm thấy đơn nhập.',
      });
    });

    it('TestCase 16: Lỗi (500) - Xử lý lỗi hệ thống khi cập nhật', async () => {
      mockReq.params.id = '1';
      mockReq.body = { quantity: 200 };
      importService.updateImport.mockRejectedValue(new Error('DB Error'));

      await updateImport(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Thao tác không thành công, vui lòng thử lại.',
      });
    });

    it('TestCase 17: Thành công - Cập nhật một phần dữ liệu (Partial Update)', async () => {
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
    it('TestCase 18: Thành công - Xóa đơn nhập', async () => {
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

    it('TestCase 19: Lỗi (404) - Không tìm thấy đơn nhập cần xóa', async () => {
      mockReq.params.id = '507f1f77bcf86cd799439011';
      importService.deleteImport.mockResolvedValue(null);

      await deleteImport(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Không tìm thấy đơn nhập.',
      });
    });

    it('TestCase 20: Lỗi (500) - Xử lý lỗi hệ thống khi xóa', async () => {
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