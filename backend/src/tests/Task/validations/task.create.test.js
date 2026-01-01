import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskValidate } from '~/validators/task.validate';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';

describe('Unit Test: Task Validation - create', () => {
  let mockReq, mockRes, mockNext;

  // Chuẩn bị dữ liệu mẫu hợp lệ
  const validObjectId = '507f1f77bcf86cd799439011';
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 1); // Ngày mai

  const validBody = {
    title: 'Code chuc nang Login',
    description: 'Chi tiet cong viec la ABC XYZ',
    status: 'toDo',
    employeerId: validObjectId,
    userId: validObjectId,
    areaId: validObjectId,
    dueDate: futureDate,
  };

  beforeEach(() => {
    mockReq = { body: {} };
    mockRes = {}; 
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  it('TestCase 1: PASS - Dữ liệu đầy đủ và hợp lệ -> Gọi next()', async () => {
    mockReq.body = { ...validBody };

    await taskValidate.create(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    // Kiểm tra next được gọi KHÔNG có tham số (tức là không có lỗi)
    expect(mockNext.mock.calls[0][0]).toBeUndefined();
  });

  it('TestCase 2: FAIL - Thiếu trường bắt buộc (Title) -> Lỗi 422', async () => {
    mockReq.body = { ...validBody };
    delete mockReq.body.title; 

    await taskValidate.create(mockReq, mockRes, mockNext);

    // Kiểm tra next được gọi với ApiError
    expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    const errorArg = mockNext.mock.calls[0][0];
    expect(errorArg.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    expect(errorArg.message).toContain('title'); 
  });

  it('TestCase 3: FAIL - Title quá ngắn (< 10 ký tự)', async () => {
    mockReq.body = { ...validBody, title: 'Short' };

    await taskValidate.create(mockReq, mockRes, mockNext);

    const errorArg = mockNext.mock.calls[0][0];
    expect(errorArg.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    expect(errorArg.message).toContain('at least 10 characters');
  });

  it('TestCase 4: FAIL - ObjectId không đúng định dạng', async () => {
    mockReq.body = { ...validBody, employeerId: 'id-linh-tinh' };

    await taskValidate.create(mockReq, mockRes, mockNext);

    const errorArg = mockNext.mock.calls[0][0];
    expect(errorArg.message).toContain('fails to match the Object Id pattern');
  });

  it('TestCase 5: FAIL - DueDate trong quá khứ', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Hôm qua

    mockReq.body = { ...validBody, dueDate: pastDate };

    await taskValidate.create(mockReq, mockRes, mockNext);

    const errorArg = mockNext.mock.calls[0][0];
    expect(errorArg.message).toContain(' "dueDate" must be greater than or equal to ');
  });

  it('TestCase 6: FAIL - Status sai giá trị Enum', async () => {
    mockReq.body = { ...validBody, status: 'UNKNOWN_STATUS' };

    await taskValidate.create(mockReq, mockRes, mockNext);

    const errorArg = mockNext.mock.calls[0][0];
    expect(errorArg.message).toContain('must be one of [toDo, inProgress, done]');
  });
});