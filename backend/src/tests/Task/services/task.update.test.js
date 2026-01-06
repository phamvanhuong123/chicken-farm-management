import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskService } from '~/services/task.service';
import { taskModel } from '~/models/task.model';
import ApiError from '~/utils/ApiError';

vi.mock('~/models/task.model');

describe('Unit Test: Task Service - update', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('TestCase 1: Thành công (Đã có)', async () => {
    taskModel.update.mockResolvedValue({ id: 1 });
    const res = await taskService.update('1', {});
    expect(res).toEqual({ id: 1 });
  });

  it('TestCase 2: Lỗi Logic 404 (Đã có)', async () => {
    taskModel.update.mockResolvedValue(null);
    await expect(taskService.update('1', {})).rejects.toThrow(ApiError);
  });



  it('TestCase 3: Lỗi Hệ thống - Database bị lỗi khi đang update', async () => {

    const sysError = new Error('MongoTimeoutError');
    taskModel.update.mockRejectedValue(sysError);

    
    await expect(taskService.update('1', {}))
      .rejects.toThrow('MongoTimeoutError');
  });
});