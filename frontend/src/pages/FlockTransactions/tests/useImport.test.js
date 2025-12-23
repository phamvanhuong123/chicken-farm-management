import { renderHook, act, waitFor } from '@testing-library/react';
import { useImport } from '../hooks/useImport';
import { importApi } from '../../../apis/importApi';
import { areaApi } from '../../../apis/areaApi';
import { flockApi } from '../../../apis/flockApi';
import swal from 'sweetalert';
import { vi } from 'vitest';

// Mock các API
vi.mock('../../../apis/importApi');
vi.mock('../../../apis/areaApi');
vi.mock('../../../apis/flockApi');
vi.mock('sweetalert');

describe('U5.2 & U5.5 - useImport Hook', () => {
  const mockImports = [
    {
      _id: '1',
      importDate: '2024-03-15T00:00:00.000Z',
      supplier: 'Supplier A',
      breed: 'Gà ta',
      quantity: 1000,
      avgWeight: 1.5,
      barn: 'Khu A',
      flockId: 'flock1',
      status: 'Đang nuôi'
    }
  ];

  const mockAreas = [
    { _id: 'area1', name: 'Khu A', maxCapacity: 10000 },
    { _id: 'area2', name: 'Khu B', maxCapacity: 15000 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock default API responses
    importApi.getList.mockResolvedValue({
      data: {
        data: {
          items: mockImports,
          totalPages: 1
        }
      }
    });

    areaApi.getList.mockResolvedValue({
      data: {
        data: mockAreas
      }
    });

    flockApi.create.mockResolvedValue({
      data: {
        data: {
          _id: 'newFlockId'
        }
      }
    });

    importApi.create.mockResolvedValue({});
    importApi.update.mockResolvedValue({});
    importApi.delete.mockResolvedValue({});
    flockApi.update.mockResolvedValue({});
  });

  // TEST CASE 1: Load imports thành công
  test('TC1 - Load imports thành công', async () => {
    const { result } = renderHook(() => useImport());
    
    await act(async () => {
      await result.current.loadData();
    });
    
    expect(result.current.imports).toEqual(mockImports);
    expect(result.current.loading).toBe(false);
  });

  // TEST CASE 2: Load imports thất bại
  test('TC2 - Xử lý khi load imports thất bại', async () => {
    importApi.getList.mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(() => useImport());
    
    await act(async () => {
      await result.current.loadData();
    });
    
    expect(result.current.imports).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  // TEST CASE 3: Load areas thành công
  test('TC3 - Load areas thành công', async () => {
    const { result } = renderHook(() => useImport());
    

    await act(async () => {
      await result.current.loadData();
    });
    
    await act(async () => {
      await result.current.loadAreas();
    });
    
    expect(result.current.areas).toEqual(mockAreas);
    expect(result.current.areaLoading).toBe(false);
  });

  // TEST CASE 4: Tính toán areaCurrentCounts đúng
  test('TC4 - Tính toán areaCurrentCounts đúng từ imports', async () => {
    const multipleImports = [
      { ...mockImports[0], barn: 'Khu A', quantity: 1000 },
      { ...mockImports[0], _id: '2', barn: 'Khu A', quantity: 2000 },
      { ...mockImports[0], _id: '3', barn: 'Khu B', quantity: 1500 }
    ];
    
    importApi.getList.mockResolvedValue({
      data: {
        data: {
          items: multipleImports,
          totalPages: 1
        }
      }
    });
    
    const { result } = renderHook(() => useImport());
    
    await act(async () => {
      await result.current.loadData();
    });
    
    await act(async () => {
      await result.current.loadAreas();
    });
    
    expect(result.current.areaCurrentCounts).toEqual({
      'Khu A': 3000, 
      'Khu B': 1500
    });
  });

  // TEST CASE 5: Tạo import mới thành công
  test('TC5 - Tạo import mới thành công', async () => {
    const { result } = renderHook(() => useImport());
    
    const newImportData = {
      importDate: '2024-03-20',
      supplier: 'New Supplier',
      breed: 'Gà công nghiệp',
      quantity: 2000,
      avgWeight: 2.0,
      barn: 'Khu B'
    };
    
    await act(async () => {
      await result.current.createImport(newImportData);
    });
    
    // Kiểm tra flockApi.create được gọi với đúng data
    expect(flockApi.create).toHaveBeenCalledWith({
      initialCount: 2000,
      speciesId: 'Gà công nghiệp',
      areaId: 'Khu B',
      ownerId: 'currentUser',
      avgWeight: 2.0,
      status: 'Raising',
      currentCount: 2000,
      note: 'Nhập chuồng từ New Supplier'
    });
    
    // Kiểm tra importApi.create được gọi với đúng data
    expect(importApi.create).toHaveBeenCalledWith({
      importDate: expect.any(String),
      supplier: 'New Supplier',
      breed: 'Gà công nghiệp',
      quantity: 2000,
      avgWeight: 2.0,
      barn: 'Khu B',
      flockId: 'newFlockId',
      status: 'Đang nuôi'
    });
  });

  // TEST CASE 6: Tạo import thất bại - hiển thị swal error
  test('TC6 - Hiển thị swal error khi tạo import thất bại', async () => {
    flockApi.create.mockRejectedValue(new Error('Create failed'));
    
    const { result } = renderHook(() => useImport());
    
    await act(async () => {
      try {
        await result.current.createImport({
          importDate: '2024-03-20',
          supplier: 'Test',
          breed: 'Gà ta',
          quantity: 1000,
          avgWeight: 1.5,
          barn: 'Khu A'
        });
      } catch (e) {
   
      }
    });
    
    expect(swal).toHaveBeenCalledWith('Lỗi', 'Không thể tạo lứa nhập!', 'error');
  });

  // TEST CASE 7: Cập nhật import thành công
  test('TC7 - Cập nhật import thành công', async () => {
   
    importApi.getDetail.mockResolvedValue({
      data: {
        data: {
          ...mockImports[0],
          flockId: 'existingFlockId'
        }
      }
    });
    
    const { result } = renderHook(() => useImport());
    
    const updateData = {
      importDate: '2024-03-25',
      supplier: 'Updated Supplier',
      breed: 'Gà thả vườn',
      quantity: 1500,
      avgWeight: 1.8,
      barn: 'Khu B'
    };
    
    await act(async () => {
      const success = await result.current.updateImport('1', updateData);
      expect(success.success).toBe(true);
    });
    
    // Kiểm tra importApi.update
    expect(importApi.update).toHaveBeenCalledWith('1', {
      importDate: expect.any(String),
      supplier: 'Updated Supplier',
      breed: 'Gà thả vườn',
      quantity: 1500,
      avgWeight: 1.8,
      barn: 'Khu B',
      flockId: 'existingFlockId',
      status: 'Đang nuôi'
    });
    
    // Kiểm tra flockApi.update
    expect(flockApi.update).toHaveBeenCalledWith('existingFlockId', {
      speciesId: 'Gà thả vườn',
      areaId: 'Khu B',
      avgWeight: 1.8,
      currentCount: 1500,
      initialCount: 1500,
      status: 'Raising',
      note: 'Cập nhật import 1'
    });
  });

  // TEST CASE 8: Cập nhật import thất bại - không tìm thấy import
  test('TC8 - Hiển thị swal error khi cập nhật import không tìm thấy', async () => {
    importApi.getDetail.mockResolvedValue({
      data: {
        data: null 
      }
    });
    
    const { result } = renderHook(() => useImport());
    
    await act(async () => {
      const success = await result.current.updateImport('999', {
        importDate: '2024-03-20',
        supplier: 'Test',
        breed: 'Gà ta',
        quantity: 1000,
        avgWeight: 1.5,
        barn: 'Khu A'
      });
      
      expect(success).toBe(false);
    });
    
    expect(swal).toHaveBeenCalledWith('Lỗi cập nhật!', '', 'error');
  });

  // TEST CASE 9: Xóa import thành công
  test('TC9 - Xóa import thành công', async () => {
    const { result } = renderHook(() => useImport());
    
    await act(async () => {
      const success = await result.current.deleteImport('1');
      expect(success.success).toBe(true);
    });
    
    expect(importApi.delete).toHaveBeenCalledWith('1');
  });

  // TEST CASE 10: Xóa import thất bại - 404 error
  test('TC10 - Xử lý 404 error khi xóa import', async () => {
    importApi.delete.mockRejectedValue({
      response: { status: 404 }
    });
    
    const { result } = renderHook(() => useImport());
    
    await act(async () => {
      const success = await result.current.deleteImport('999');
      expect(success.success).toBe(true);
    });
  });

  // TEST CASE 11: Xóa import thất bại - other error
  test('TC11 - Trả về success false khi xóa thất bại với error khác 404', async () => {
    importApi.delete.mockRejectedValue({
      response: { status: 500 }
    });
    
    const { result } = renderHook(() => useImport());
    
    await act(async () => {
      const deleteResult = await result.current.deleteImport('1');
      expect(deleteResult.success).toBe(false);
      expect(deleteResult.message).toBe('Không thể xóa!');
    });
  });

  // TEST CASE 12: Loading state đúng khi tải nhiều pages
  test('TC12 - Loading state đúng khi tải nhiều pages', async () => {
    importApi.getList
      .mockResolvedValueOnce({
        data: {
          data: {
            items: mockImports.slice(0, 10),
            totalPages: 3
          }
        }
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            items: mockImports.slice(10, 20),
            totalPages: 3
          }
        }
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            items: mockImports.slice(20, 30),
            totalPages: 3
          }
        }
      });
    
    const { result } = renderHook(() => useImport());
    await act(async () => {
      await result.current.loadData();
    });
    
    // Sau khi load xong, loading phải là false
    expect(result.current.loading).toBe(false);
    expect(importApi.getList).toHaveBeenCalledTimes(3);
  });

  // TEST CASE 13: Prevent duplicate loading với loadingRef
  test('TC13 - Ngăn duplicate loading với loadingRef', async () => {
    const { result } = renderHook(() => useImport());
    
    const promises = [];
    await act(async () => {
      promises.push(result.current.loadData());
      promises.push(result.current.loadData()); 
    });
    
    await Promise.all(promises);
    
   
    expect(importApi.getList).toHaveBeenCalledTimes(1);
  });

  // TEST CASE 14: Tính areaCurrentCounts đúng khi không có imports
  test('TC14 - Tính areaCurrentCounts đúng khi không có imports', async () => {
    importApi.getList.mockResolvedValue({
      data: {
        data: {
          items: [],
          totalPages: 1
        }
      }
    });
    
    const { result } = renderHook(() => useImport());
    
    await act(async () => {
      await result.current.loadData();
    });
    
    await act(async () => {
      await result.current.loadAreas();
    });
    
    expect(result.current.areaCurrentCounts).toEqual({
      'Khu A': 0,
      'Khu B': 0
    });
  });

  // TEST CASE 15: Không load areas khi imports rỗng
test('TC15 - Không gọi loadAreas khi imports rỗng', async () => {
  importApi.getList.mockResolvedValue({
    data: {
      data: {
        items: [],
        totalPages: 1
      }
    }
  });
  
  const { result } = renderHook(() => useImport());

  // Đợi cho đến khi imports được cập nhật
  await waitFor(() => {
    expect(result.current.imports).toEqual([]);
  }, { timeout: 1000 });

  // Đảm bảo areaApi.getList không được gọi
  expect(areaApi.getList).not.toHaveBeenCalled();
});
});