import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userValidate } from '~/validators/user.validation'; 
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';

describe('Unit Test: User Validation - updateEmployee', () => {
  let mockReq, mockRes, mockNext;
  const {updateEmployee} = userValidate
  
  const validBody = {
    roleId: 'employee',
    salary: 10000000,
    status: 'working'
  };

  beforeEach(() => {
    mockReq = { body: {} };
    mockRes = {};
    mockNext = vi.fn();
    vi.clearAllMocks();
  });


  it('TestCase 1: PASS - Dữ liệu đầy đủ và hợp lệ', async () => {
    mockReq.body = { ...validBody };

    await updateEmployee(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext.mock.calls[0][0]).toBeUndefined();
  });

  it('TestCase 2: PASS - Status là "onLeave" vẫn hợp lệ', async () => {
    mockReq.body = { ...validBody, status: 'onLeave' };

    await updateEmployee(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext.mock.calls[0][0]).toBeUndefined();
  });

  it('TestCase 3: PASS - Salary ở biên (0 và 2 tỷ)', async () => {
    // Test min = 0
    mockReq.body = { ...validBody, salary: 0 };
    await updateEmployee(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
    mockNext.mockClear();

    // Test max = 2 tỷ
    mockReq.body = { ...validBody, salary: 2000000000 };
    await updateEmployee(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('TestCase 4: FAIL (422) - roleId khác "employee"', async () => {
    mockReq.body = { ...validBody, roleId: 'manager' };

    await updateEmployee(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    const error = mockNext.mock.calls[0][0];
    expect(error.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    expect(error.message).toContain('must be [employee]');
  });

  it('TestCase 5: FAIL (422) - Thiếu roleId', async () => {
    const body = { ...validBody };
    delete body.roleId;
    mockReq.body = body;

    await updateEmployee(mockReq, mockRes, mockNext);

    const error = mockNext.mock.calls[0][0];
    expect(error.message).toContain('roleId');
  });


  it('TestCase 6: FAIL (422) - Salary nhỏ hơn 0', async () => {
    mockReq.body = { ...validBody, salary: -5000 };

    await updateEmployee(mockReq, mockRes, mockNext);

    const error = mockNext.mock.calls[0][0];
    expect(error.message).toContain('salary');
    expect(error.message).toContain('must be greater than or equal to 0');
  });

  it('TestCase 7: FAIL (422) - Salary lớn hơn 2 tỷ', async () => {
    mockReq.body = { ...validBody, salary: 2000000001 };

    await updateEmployee(mockReq, mockRes, mockNext);

    const error = mockNext.mock.calls[0][0];
    expect(error.message).toContain('salary');
    expect(error.message).toContain('must be less than or equal to 2000000000');
  });

  it('TestCase 8: FAIL (422) - Salary gửi dạng chuỗi (do có .strict())', async () => {
    // Vì bạn dùng .strict(), nên chuỗi "1000" sẽ không được tự ép kiểu sang số
    mockReq.body = { ...validBody, salary: "10000000" };

    await updateEmployee(mockReq, mockRes, mockNext);

    const error = mockNext.mock.calls[0][0];
    expect(error.message).toContain('salary');
    expect(error.message).toContain('must be a number');
  });

  // --- status ---
  it('TestCase 9: FAIL (422) - Status không nằm trong danh sách cho phép', async () => {
    mockReq.body = { ...validBody, status: 'quit_job' };

    await updateEmployee(mockReq, mockRes, mockNext);

    const error = mockNext.mock.calls[0][0];
    expect(error.message).toContain('must be one of [working, onLeave]');
  });

  it('TestCase 10: FAIL (422) - Thiếu status', async () => {
    const body = { ...validBody };
    delete body.status;
    mockReq.body = body;

    await updateEmployee(mockReq, mockRes, mockNext);

    const error = mockNext.mock.calls[0][0];
    expect(error.message).toContain('status');
  });
});