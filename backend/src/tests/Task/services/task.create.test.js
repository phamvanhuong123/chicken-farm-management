import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskService } from '~/services/task.service';
import { taskModel } from '~/models/task.model';
import { userModel } from '~/models/user.model';

vi.mock('~/models/task.model');
vi.mock('~/models/user.model');

describe('Unit Test: Task Service - create', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });


  it('TestCase 1: Thành công - Tạo task và lấy đủ thông tin', async () => {
    const input = { title: 'A', userId: 'u1' };
    taskModel.create.mockResolvedValue({ insertedId: 't1' });
    taskModel.findById.mockResolvedValue({ _id: 't1', userId: 'u1' });
    userModel.findById.mockResolvedValue({ _id: 'u1', username: 'Name' });

    const result = await taskService.create(input);
    expect(result.userName).toBe('Name');
  });



  it('TestCase 2: Lỗi (Crash) - Task tạo thành công nhưng User không tồn tại', async () => {
   
    taskModel.create.mockResolvedValue({ insertedId: 't1' });
    taskModel.findById.mockResolvedValue({ _id: 't1', userId: 'u_fake' });
    userModel.findById.mockResolvedValue(null); // Không tìm thấy user

  
    await expect(taskService.create({}))
      .rejects.toThrow(TypeError); 
  });

  it('TestCase 3: Lỗi Database - Model.create bị lỗi', async () => {
    const dbError = new Error('DB Connection Failed');
    taskModel.create.mockRejectedValue(dbError);

    await expect(taskService.create({})).rejects.toThrow('DB Connection Failed');
  });
});