import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskController } from '~/controllers/task.controller';
import { taskService } from '~/services/task.service';
import { StatusCodes } from 'http-status-codes';

vi.mock('~/services/task.service');

describe('Unit Test: Task Controller - create', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { body: { title: 'New Task' } };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  it('TestCase 1: Thành công - Tạo công việc mới (Status 201)', async () => {

    const mockResult = { _id: 'task-1', title: 'New Task' };
    taskService.create.mockResolvedValue(mockResult);


    await taskController.create(mockReq, mockRes, mockNext);


    expect(taskService.create).toHaveBeenCalledWith(mockReq.body);
    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(mockRes.json).toHaveBeenCalledWith({
      statusCode: StatusCodes.CREATED,
      message: "Thêm công việc thành công",
      data: mockResult,
    });
  });

  it('TestCase 2: Lỗi - Gọi next(error) khi Service gặp lỗi', async () => {
 
    const error = new Error('Create failed');
    taskService.create.mockRejectedValue(error);

    
    await taskController.create(mockReq, mockRes, mockNext);


    expect(mockNext).toHaveBeenCalledWith(error);
  });
});