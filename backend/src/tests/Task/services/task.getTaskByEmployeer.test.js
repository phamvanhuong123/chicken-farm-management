import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskService } from '~/services/task.service';
import { taskModel } from '~/models/task.model';

vi.mock('~/models/task.model');

describe('Unit Test: Task Service - getTaskByEmployeer', () => {
  beforeEach(() => { vi.clearAllMocks(); });


it('TestCase 1: Thành công - Trả về danh sách công việc', async () => {
    const employeerId = 'emp-1';
    const mockTasks = [{ _id: 't1', title: 'Task 1' }];


    taskModel.getTaskByEmployeer.mockResolvedValue(mockTasks);

    const result = await taskService.getTaskByEmployeer(employeerId);

    expect(taskModel.getTaskByEmployeer).toHaveBeenCalledWith(employeerId);
    expect(result).toEqual(mockTasks);
  });

  it('TestCase 2: Lỗi (404) - Ném ApiError khi danh sách trả về Rỗng ([])', async () => {
   
    taskModel.getTaskByEmployeer.mockResolvedValue([]);

    await expect(taskService.getTaskByEmployeer('emp-1'))
      .rejects.toThrow("Danh sách rỗng");
  });

  it('TestCase 3: Lỗi (404) - Ném ApiError khi danh sách trả về Null', async () => {
   
    taskModel.getTaskByEmployeer.mockResolvedValue(null);

    await expect(taskService.getTaskByEmployeer('emp-1'))
      .rejects.toThrow("Danh sách rỗng");
  });

  it('TestCase 4: Lỗi Hệ thống - Database lỗi khi query', async () => {
    taskModel.getTaskByEmployeer.mockRejectedValue(new Error('Query Failed'));

    await expect(taskService.getTaskByEmployeer('emp-1'))
      .rejects.toThrow('Query Failed');
  });
});