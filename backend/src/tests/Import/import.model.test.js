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

describe('Unit Test: Import Model', () => {
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

  // ==========================================
  // CREATE FUNCTION
  // ==========================================
  describe('create', () => {
    it('TestCase 1: Thành công - Tạo đơn nhập chuồng mới', async () => {
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

    it('TestCase 2: Lỗi (Validation) - Ném lỗi khi dữ liệu không hợp lệ', async () => {
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

    it('TestCase 3: Thành công - Tự động đặt trạng thái mặc định là "Đang nuôi"', async () => {
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

    it('TestCase 4: Thành công - Chấp nhận flockId là tùy chọn (undefined)', async () => {
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

    it('TestCase 5: Thành công - Tự động khởi tạo createdAt và updatedAt', async () => {
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

  // ==========================================
  // GET LIST FUNCTION
  // ==========================================
  describe('getList', () => {
    it('TestCase 6: Thành công - Trả về danh sách phân trang với tham số mặc định', async () => {
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

    it('TestCase 7: Thành công - Lọc theo giống (breed) chính xác', async () => {
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

    it('TestCase 8: Thành công - Sắp xếp theo ngày nhập giảm dần', async () => {
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

    it('TestCase 9: Thành công - Tính toán Skip/Limit phân trang chính xác', async () => {
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

    it('TestCase 10: Thành công - Xử lý trường hợp danh sách rỗng', async () => {
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

  // ==========================================
  // FIND BY ID FUNCTION
  // ==========================================
  describe('findById', () => {
    it('TestCase 11: Thành công - Tìm thấy Import khi ID hợp lệ', async () => {
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

    it('TestCase 12: Lỗi - Trả về null khi ID không đúng định dạng', async () => {
      const result = await importModel.findById('invalid-id');

      expect(result).toBeNull();
      expect(mockCollection.findOne).not.toHaveBeenCalled();
    });

    it('TestCase 13: Lỗi (Not Found) - Trả về null khi ID hợp lệ nhưng không tìm thấy', async () => {
      const mockId = '507f1f77bcf86cd799439011';
      mockCollection.findOne.mockResolvedValue(null);

      const result = await importModel.findById(mockId);

      expect(result).toBeNull();
    });
  });

  // ==========================================
  // UPDATE FUNCTION
  // ==========================================
  describe('update', () => {
    it('TestCase 14: Thành công - Cập nhật thông tin Import', async () => {
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

    it('TestCase 15: Lỗi - Trả về null khi ID cập nhật không đúng định dạng', async () => {
      const result = await importModel.update('invalid-id', { quantity: 200 });

      expect(result).toBeNull();
      expect(mockCollection.updateOne).not.toHaveBeenCalled();
    });

    it('TestCase 16: Lỗi (Not Found) - Trả về null khi không tìm thấy bản ghi để cập nhật', async () => {
      const mockId = '507f1f77bcf86cd799439011';
      mockCollection.updateOne.mockResolvedValue({ matchedCount: 0 });

      const result = await importModel.update(mockId, { quantity: 200 });

      expect(result).toBeNull();
      expect(mockCollection.findOne).not.toHaveBeenCalled();
    });

    it('TestCase 17: Thành công - Tự động cắt khoảng trắng (Trim) ID đầu vào', async () => {
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

  // ==========================================
  // DELETE FUNCTION
  // ==========================================
  describe('delete', () => {
    it('TestCase 18: Thành công - Xóa Import', async () => {
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

    it('TestCase 19: Lỗi - Ném ngoại lệ khi ID xóa không đúng định dạng', async () => {
      await expect(importModel.delete('invalid-id')).rejects.toThrow(
        'Invalid ID'
      );
      expect(mockCollection.findOneAndDelete).not.toHaveBeenCalled();
    });

    it('TestCase 20: Lỗi (Not Found) - Trả về null khi không tìm thấy bản ghi để xóa', async () => {
      const mockId = '507f1f77bcf86cd799439011';
      mockCollection.findOneAndDelete.mockResolvedValue({ value: null });

      const result = await importModel.delete(mockId);

      expect(result).toBeNull();
    });
  });
});