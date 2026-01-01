import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskController } from '~/controllers/task.controller';
import { taskService } from '~/services/task.service';
import { StatusCodes } from 'http-status-codes';

vi.mock('~/services/task.service');

describe('Unit Test: Task Controller - deleteTask', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { params: { id: 'task-del-1' } };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  it('TestCase 1: Thành công - Xóa công việc (Status 200)', async () => {

    const mockResult = { success: true };
    taskService.deleteTask.mockResolvedValue(mockResult);


    await taskController.deleteTask(mockReq, mockRes, mockNext);

    
    expect(taskService.deleteTask).toHaveBeenCalledWith('task-del-1');
    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockRes.json).toHaveBeenCalledWith({
      statusCode: StatusCodes.OK,
      message: "Xoá thành công",
      data: mockResult,
    });
  });

  it('TestCase 2: Lỗi - Gọi next(error) khi xóa thất bại', async () => {
    const error = new Error('Delete failed');
    taskService.deleteTask.mockRejectedValue(error);

    await taskController.deleteTask(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});