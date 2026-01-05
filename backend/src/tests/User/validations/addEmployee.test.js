import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userValidate } from '~/validators/user.validation'; // Sửa path tới file của bạn
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';

describe('Unit Test: User Validation - addEmployee', () => {
  let mockReq, mockRes, mockNext;
  const {addEmployee} = userValidate

  const validObjectId = '507f1f77bcf86cd799439011';
  
  beforeEach(() => {
    mockReq = { body: {} };
    mockRes = {};
    mockNext = vi.fn();
    vi.clearAllMocks();
  });


  it('TestCase 1: PASS - Dữ liệu đầy đủ và hợp lệ', async () => {
    mockReq.body = {
      idEmployee: validObjectId,
      roleId: 'employee',
      salary: 5000000
    };

    await addEmployee(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext.mock.calls[0][0]).toBeUndefined();
  });

  it('TestCase 2: PASS - Thiếu salary vẫn hợp lệ (Joi có default value)', async () => {
   
    mockReq.body = {
      idEmployee: validObjectId,
      roleId: 'employee'
      // Không gửi salary
    };

    await addEmployee(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext.mock.calls[0][0]).toBeUndefined();
  });


  it('TestCase 3: FAIL (422) - Thiếu idEmployee', async () => {
    mockReq.body = { roleId: 'employee' };

    await addEmployee(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    const error = mockNext.mock.calls[0][0];
    expect(error.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    expect(error.message).toContain('idEmployee');
  });

  it('TestCase 4: FAIL (422) - idEmployee sai định dạng ObjectId', async () => {
    mockReq.body = {
      idEmployee: 'id-sai-ne',
      roleId: 'employee'
    };

    await addEmployee(mockReq, mockRes, mockNext);

    const error = mockNext.mock.calls[0][0];
    expect(error.message).toContain('fails to match the Object Id pattern');
  });


  it('TestCase 5: FAIL (422) - roleId khác "employee"', async () => {
    mockReq.body = {
      idEmployee: validObjectId,
      roleId: 'admin' 
    };

    await addEmployee(mockReq, mockRes, mockNext);

    const error = mockNext.mock.calls[0][0];
    expect(error.message).toContain('must be [employee]');
  });


  it('TestCase 6: FAIL (422) - Salary là số âm', async () => {
    mockReq.body = {
      idEmployee: validObjectId,
      roleId: 'employee',
      salary: -1000
    };

    await addEmployee(mockReq, mockRes, mockNext);

    const error = mockNext.mock.calls[0][0];
    expect(error.message).toContain('salary');
  });

  it('TestCase 7: FAIL (422) - Salary không phải số', async () => {
    mockReq.body = {
      idEmployee: validObjectId,
      roleId: 'employee',
      salary: "năm triệu" 
    };

    await addEmployee(mockReq, mockRes, mockNext);

    const error = mockNext.mock.calls[0][0];
    expect(error.message).toContain('salary');
  });
});