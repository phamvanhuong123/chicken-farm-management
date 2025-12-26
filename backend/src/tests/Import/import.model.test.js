import { describe, it, expect, vi, beforeEach } from 'vitest';
import { importModel } from '~/models/import.model.js';
import { GET_DB } from '~/config/mongodb.js';

// Mock toàn bộ module mongodb với tất cả export cần thiết
vi.mock('mongodb', async () => {
  // Import original để giữ các export khác
  const actual = await vi.importActual('mongodb');
  
  // Tạo MockObjectId
  class MockObjectId {
    constructor(id) {
      this.id = String(id).trim(); // Trim khi tạo ObjectId
      this._id = this.id;
      this.toString = () => this.id;
      this.toHexString = () => this.id;
    }
    
    static isValid(id) {
      const strId = String(id).trim();
      return /^[0-9a-fA-F]{24}$/.test(strId);
    }
    
    equals(other) {
      return other && this.id === other.id;
    }
    
    getTimestamp() {
      return new Date();
    }
  }
  
  // Tạo mock cho MongoClient
  class MockMongoClient {
    constructor() {}
    connect() {}
    db() {}
  }
  
  return {
    ...actual,
    ObjectId: MockObjectId,
    MongoClient: MockMongoClient,
    // Thêm các export khác nếu cần
  };
});

// Mock config/mongodb.js
vi.mock('~/config/mongodb.js', () => ({
  GET_DB: vi.fn(),
}));

describe('Import Model', () => {
  const mockCollection = {
    insertOne: vi.fn(),
    find: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    toArray: vi.fn(),
    countDocuments: vi.fn(),
    findOne: vi.fn(),
    updateOne: vi.fn(),
    findOneAndDelete: vi.fn(),
  };

  const mockDb = {
    collection: vi.fn(() => mockCollection),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    GET_DB.mockReturnValue(mockDb);
    
    // Reset mock chain cho find()
    const mockChain = {
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      toArray: vi.fn(),
    };
    
    mockCollection.find.mockReturnValue(mockChain);
  });

  describe('create', () => {
    it('1. Tạo nhập chuồng mới thành công', async () => {
      const mockData = {
        importDate: new Date('2024-01-15'),
        supplier: 'NCC A',
        breed: 'Gà ta',
        quantity: 100,
        avgWeight: 1.5,
        barn: 'Khu A',
        flockId: 'FL001',
        status: 'Đang nuôi',
      };

      const mockInsertResult = {
        insertedId: '507f1f77bcf86cd799439011',
      };

      mockCollection.insertOne.mockResolvedValue(mockInsertResult);

      const result = await importModel.create(mockData);

      expect(result).toEqual({
        ...mockData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        _id: mockInsertResult.insertedId,
      });
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining(mockData)
      );
    });

    it('2. Ném lỗi validation khi dữ liệu không hợp lệ', async () => {
      const invalidData = {
        importDate: 'invalid-date',
        supplier: '',
        breed: '',
        quantity: 0,
        avgWeight: 0,
        barn: '',
      };

      await expect(importModel.create(invalidData)).rejects.toThrow();
    });

    it('3. Đặt trạng thái mặc định là "Đang nuôi" khi không được cung cấp', async () => {
      const dataWithoutStatus = {
        importDate: new Date(),
        supplier: 'NCC B',
        breed: 'Gà công nghiệp',
        quantity: 200,
        avgWeight: 2.0,
        barn: 'Khu B',
      };

      mockCollection.insertOne.mockResolvedValue({
        insertedId: '507f1f77bcf86cd799439012',
      });

      const result = await importModel.create(dataWithoutStatus);

      expect(result.status).toBe('Đang nuôi');
    });

    it('4. Chấp nhận flockId là tùy chọn', async () => {
      const dataWithoutFlockId = {
        importDate: new Date(),
        supplier: 'NCC C',
        breed: 'Vịt',
        quantity: 150,
        avgWeight: 1.8,
        barn: 'Khu C',
      };

      mockCollection.insertOne.mockResolvedValue({
        insertedId: '507f1f77bcf86cd799439013',
      });

      const result = await importModel.create(dataWithoutFlockId);

      expect(result.flockId).toBeUndefined();
    });

    it('5. Tự động đặt createdAt và updatedAt', async () => {
      const mockData = {
        importDate: new Date(),
        supplier: 'NCC D',
        breed: 'Gà',
        quantity: 100,
        avgWeight: 1.5,
        barn: 'Khu D',
      };

      mockCollection.insertOne.mockResolvedValue({
        insertedId: '507f1f77bcf86cd799439014',
      });

      const result = await importModel.create(mockData);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('getList', () => {
    it('6. Trả về danh sách phân trang với giá trị mặc định', async () => {
      const mockItems = [
        { _id: '507f1f77bcf86cd799439011', breed: 'Gà ta', quantity: 100 },
        { _id: '507f1f77bcf86cd799439012', breed: 'Vịt', quantity: 150 },
      ];

      // Setup chain mock đúng cách
      const mockChain = {
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue(mockItems),
      };
      
      mockCollection.find.mockReturnValue(mockChain);
      mockCollection.countDocuments.mockResolvedValue(2);

      const result = await importModel.getList({});

      expect(result).toEqual({
        items: mockItems,
        totalItems: 2,
        totalPages: 1,
        currentPage: 1,
      });
      expect(mockCollection.find().sort).toHaveBeenCalledWith({ importDate: -1 });
      expect(mockCollection.find().skip).toHaveBeenCalledWith(0);
      expect(mockCollection.find().limit).toHaveBeenCalledWith(10);
    });

    it('7. Lọc theo giống khi query có chứa breed', async () => {
      const query = { breed: 'Gà', page: 1, limit: 10 };
      const mockItems = [{ _id: '507f1f77bcf86cd799439011', breed: 'Gà ta' }];

      const mockChain = {
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue(mockItems),
      };
      
      mockCollection.find.mockReturnValue(mockChain);
      mockCollection.countDocuments.mockResolvedValue(1);

      await importModel.getList(query);

      expect(mockCollection.find).toHaveBeenCalledWith({
        breed: new RegExp('Gà', 'i'),
      });
    });

    it('8. Sắp xếp theo ngày nhập giảm dần', async () => {
      const mockChain = {
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue([]),
      };
      
      mockCollection.find.mockReturnValue(mockChain);
      mockCollection.countDocuments.mockResolvedValue(0);

      await importModel.getList({});

      expect(mockChain.sort).toHaveBeenCalledWith({ importDate: -1 });
    });

    it('9. Tính toán phân trang chính xác', async () => {
      const query = { page: 2, limit: 5 };
      
      const mockChain = {
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue([]),
      };
      
      mockCollection.find.mockReturnValue(mockChain);
      mockCollection.countDocuments.mockResolvedValue(20);

      const result = await importModel.getList(query);

      expect(result.totalPages).toBe(4);
      expect(result.currentPage).toBe(2);
      expect(mockChain.skip).toHaveBeenCalledWith(5); // (2-1)*5 = 5
      expect(mockChain.limit).toHaveBeenCalledWith(5);
    });

    it('10. Xử lý kết quả rỗng', async () => {
      const mockChain = {
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue([]),
      };
      
      mockCollection.find.mockReturnValue(mockChain);
      mockCollection.countDocuments.mockResolvedValue(0);

      const result = await importModel.getList({});

      expect(result.items).toEqual([]);
      expect(result.totalItems).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });

  describe('findById', () => {
    it('11. Trả về import khi ID hợp lệ', async () => {
      const mockId = '507f1f77bcf86cd799439011';
      const mockImport = {
        _id: mockId,
        breed: 'Gà ta',
      };

      mockCollection.findOne.mockResolvedValue(mockImport);

      const result = await importModel.findById(mockId);

      expect(result).toEqual(mockImport);
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.objectContaining({ id: mockId }),
      });
    });

    it('12. Trả về null khi ID không hợp lệ', async () => {
      const result = await importModel.findById('invalid-id');

      expect(result).toBeNull();
      expect(mockCollection.findOne).not.toHaveBeenCalled();
    });

    it('13. Trả về null khi không tìm thấy import', async () => {
      const mockId = '507f1f77bcf86cd799439011';
      mockCollection.findOne.mockResolvedValue(null);

      const result = await importModel.findById(mockId);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('14. Cập nhật import thành công', async () => {
      const mockId = '507f1f77bcf86cd799439011';
      const updateData = { quantity: 200, status: 'Hoàn thành' };
      const updatedImport = {
        _id: mockId,
        ...updateData,
        updatedAt: new Date('2024-01-16T10:00:00.000Z'),
      };

      mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 });
      mockCollection.findOne.mockResolvedValue(updatedImport);

      const result = await importModel.update(mockId, updateData);

      expect(result).toEqual(updatedImport);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        expect.objectContaining({ _id: expect.objectContaining({ id: mockId }) }),
        { $set: { ...updateData, updatedAt: expect.any(Date) } }
      );
    });

    it('15. Trả về null khi ID không hợp lệ', async () => {
      const result = await importModel.update('invalid-id', { quantity: 200 });

      expect(result).toBeNull();
      expect(mockCollection.updateOne).not.toHaveBeenCalled();
    });

    it('16. Trả về null khi không có tài liệu nào khớp', async () => {
      const mockId = '507f1f77bcf86cd799439011';
      mockCollection.updateOne.mockResolvedValue({ matchedCount: 0 });

      const result = await importModel.update(mockId, { quantity: 200 });

      expect(result).toBeNull();
      expect(mockCollection.findOne).not.toHaveBeenCalled();
    });

    it('17. Cắt khoảng trắng ID trước khi chuyển đổi thành ObjectId', async () => {
      const mockId = '  507f1f77bcf86cd799439011  ';
      
      // Mock trả về kết quả thành công
      mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 });
      mockCollection.findOne.mockResolvedValue({ 
        _id: '507f1f77bcf86cd799439011',
        quantity: 200 
      });

      const result = await importModel.update(mockId, { quantity: 200 });

      // Kiểm tra rằng updateOne đã được gọi với ID đã trim
      expect(mockCollection.updateOne).toHaveBeenCalled();
      
      // Lấy các tham số mà updateOne đã được gọi
      const callArgs = mockCollection.updateOne.mock.calls[0];
      const filterArg = callArgs[0];
      
      // Kiểm tra rằng ID trong filter đã được trim
      expect(filterArg._id.id).toBe('507f1f77bcf86cd799439011');
    });
  });

  describe('delete', () => {
    it('18. Xóa import thành công', async () => {
      const mockId = '507f1f77bcf86cd799439011';
      const deletedImport = {
        _id: mockId,
        quantity: 100,
      };

      mockCollection.findOneAndDelete.mockResolvedValue({
        value: deletedImport,
      });

      const result = await importModel.delete(mockId);

      expect(result).toEqual(deletedImport);
      expect(mockCollection.findOneAndDelete).toHaveBeenCalledWith({
        _id: expect.objectContaining({ id: mockId }),
      });
    });

    it('19. Ném lỗi khi ID không hợp lệ', async () => {
      await expect(importModel.delete('invalid-id')).rejects.toThrow(
        'Invalid ID'
      );
      expect(mockCollection.findOneAndDelete).not.toHaveBeenCalled();
    });

    it('20. Trả về null khi không tìm thấy import để xóa', async () => {
      const mockId = '507f1f77bcf86cd799439011';
      mockCollection.findOneAndDelete.mockResolvedValue({ value: null });

      const result = await importModel.delete(mockId);

      expect(result).toBeNull();
    });
  });
});