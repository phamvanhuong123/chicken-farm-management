import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskValidate } from '~/validators/task.validate';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';

describe('Unit Test: Task Validation - update', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { body: {} };
    mockRes = {};
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  it('TestCase 1: PASS - Cập nhật một phần (chỉ Title) -> Gọi next()', async () => {
    mockReq.body = { title: 'Tieu de moi da cap nhat dai hon 10 ky tu' };

    await taskValidate.update(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext.mock.calls[0][0]).toBeUndefined();
  });

  it('TestCase 2: PASS - Cập nhật status hợp lệ', async () => {
    mockReq.body = { status: 'done' };

    await taskValidate.update(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext.mock.calls[0][0]).toBeUndefined();
  });

  it('TestCase 3: PASS - Body rỗng vẫn hợp lệ (Do Joi không bắt buộc field nào)', async () => {
    // Lưu ý: Nếu logic nghiệp vụ của bạn bắt buộc update phải có ít nhất 1 trường,
    // bạn cần thêm rule .min(1) vào Joi.object() bên file validation.
    // Với code hiện tại thì rỗng vẫn pass.
    mockReq.body = {}; 

    await taskValidate.update(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext.mock.calls[0][0]).toBeUndefined();
  });

  it('TestCase 4: FAIL - Title quá ngắn khi update', async () => {
    mockReq.body = { title: 'Ngan' }; // < 10 chars

    await taskValidate.update(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    const errorArg = mockNext.mock.calls[0][0];
    expect(errorArg.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    expect(errorArg.message).toContain('at least 10 characters');
  });

  it('TestCase 5: FAIL - Update userId sai định dạng ObjectId', async () => {
    mockReq.body = { userId: '123-fake-id' };

    await taskValidate.update(mockReq, mockRes, mockNext);

    const errorArg = mockNext.mock.calls[0][0];
    expect(errorArg.message).toContain('fails to match the Object Id pattern');
  });

  it('TestCase 6: FAIL - Update DueDate về quá khứ', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);

    mockReq.body = { dueDate: pastDate };

    await taskValidate.update(mockReq, mockRes, mockNext);

    const errorArg = mockNext.mock.calls[0][0];
    expect(errorArg.message).toContain('must be greater than or equal to');
  });
});