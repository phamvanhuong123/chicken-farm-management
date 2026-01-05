import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskService } from '~/services/task.service';
import { taskModel } from '~/models/task.model';

vi.mock('~/models/task.model');

describe('Unit Test: Task Service - deleteTask', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TestCase 1: Thành công - Xóa task khi deletedCount > 0', async () => {
    const id = 'task-1';
    
    const mockDbResult = { acknowledged: true, deletedCount: 1 };

    taskModel.deleteTask.mockResolvedValue(mockDbResult);

    const result = await taskService.deleteTask(id);

    expect(taskModel.deleteTask).toHaveBeenCalledWith(id);
    expect(result).toEqual(mockDbResult);
  });

  it('TestCase 2: Lỗi (404) - Ném ApiError khi deletedCount === 0 (Không tìm thấy ID)', async () => {
    const id = 'task-fake';
   
    const mockDbResult = { acknowledged: true, deletedCount: 0 };

    taskModel.deleteTask.mockResolvedValue(mockDbResult);

    await expect(taskService.deleteTask(id))
      .rejects.toThrow("Thất bại không tìm thấy");
  });
  it('TestCase 3: Lỗi Hệ thống - Database lỗi khi xóa', async () => {
    taskModel.deleteTask.mockRejectedValue(new Error('Delete Operation Failed'));

    await expect(taskService.deleteTask('id'))
      .rejects.toThrow('Delete Operation Failed');
  });
});