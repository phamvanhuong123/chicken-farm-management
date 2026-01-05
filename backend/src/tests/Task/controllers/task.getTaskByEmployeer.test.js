import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskController } from '~/controllers/task.controller';
import { taskService } from '~/services/task.service';
import { StatusCodes } from 'http-status-codes';

vi.mock('~/services/task.service');

describe('Unit Test: Task Controller - getTaskByEmployeer', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { params: { employeerId: 'emp-001' } };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  it('TestCase 1: Thành công - Lấy danh sách công việc', async () => {

    const mockList = [{ title: 'Task A' }, { title: 'Task B' }];
    taskService.getTaskByEmployeer.mockResolvedValue(mockList);


    await taskController.getTaskByEmployeer(mockReq, mockRes, mockNext);


    expect(taskService.getTaskByEmployeer).toHaveBeenCalledWith('emp-001');
    

    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(mockRes.json).toHaveBeenCalledWith({
      statusCode: StatusCodes.OK, 
      message: "Lấy danh sách công việc thành công",
      data: mockList,
    });
  });

  it('TestCase 2: Lỗi - Gọi next(error) khi lấy danh sách thất bại', async () => {
    const error = new Error('Get list failed');
    taskService.getTaskByEmployeer.mockRejectedValue(error);

    await taskController.getTaskByEmployeer(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});