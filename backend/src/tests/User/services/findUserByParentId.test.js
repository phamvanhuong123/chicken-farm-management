import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from '~/services/user.service';
import { userModel } from '~/models/user.model';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';

// Mock Model
vi.mock('~/models/user.model');

describe('Unit Test: User Service - findUserByParentId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TestCase 1: Thành công - Trả về danh sách khi tìm thấy nhân viên', async () => {

    const parentId = 'owner-1';
    const mockList = [{ _id: 'emp-1', role: 'staff' }];
    
    userModel.findUserByParentId.mockResolvedValue(mockList);

    // Act
    const result = await userService.findUserByParentId(parentId);

    // Assert
    expect(userModel.findUserByParentId).toHaveBeenCalledWith(parentId);
    expect(result).toEqual(mockList);
  });

  it('TestCase 2: Lỗi (404) - Ném lỗi khi danh sách trả về Rỗng', async () => {
    
    const parentId = 'owner-new';
    userModel.findUserByParentId.mockResolvedValue([]);

    await expect(userService.findUserByParentId(parentId))
      .rejects
      .toThrow(ApiError);
      

    try {
      await userService.findUserByParentId(parentId);
    } catch (error) {
      expect(error.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(error.message).toBe("Chưa có nhân viên nào");
    }
  });

  it('TestCase 3: Lỗi Hệ thống - Ném lỗi khi Model gặp sự cố (DB Error)', async () => {
    // Arrange
    const dbError = new Error("Connection failed");
    userModel.findUserByParentId.mockRejectedValue(dbError);

    // Act & Assert
    await expect(userService.findUserByParentId('any-id'))
      .rejects
      .toThrow("Connection failed");
  });
});