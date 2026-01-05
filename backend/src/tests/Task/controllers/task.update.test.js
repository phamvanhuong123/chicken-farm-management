import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskController } from '~/controllers/task.controller';
import { taskService } from '~/services/task.service';
import { StatusCodes } from 'http-status-codes';

vi.mock('~/services/task.service');

describe('Unit Test: Task Controller - update', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      params: { id: 'task-123' },
      body: { status: 'Done' }
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  it('TestCase 1: Thành công - Cập nhật công việc (Status 201)', async () => {

    const mockResult = { _id: 'task-123', status: 'Done' };
    taskService.update.mockResolvedValue(mockResult);


    await taskController.update(mockReq, mockRes, mockNext);


    expect(taskService.update).toHaveBeenCalledWith('task-123', { status: 'Done' });

    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(mockRes.json).toHaveBeenCalledWith({
      statusCode: StatusCodes.CREATED,
      message: "Chỉnh sửa thành thành công",
      data: mockResult,
    });
  });

  it('TestCase 2: Lỗi - Gọi next(error) khi cập nhật thất bại', async () => {
    const error = new Error('Update failed');
    taskService.update.mockRejectedValue(error);

    await taskController.update(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});