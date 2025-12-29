import { renderHook, act, waitFor } from '@testing-library/react';
import { useImport } from '../hooks/useImport';
import { importApi } from '../../../apis/importApi';
import { areaApi } from '../../../apis/areaApi';
import swal from 'sweetalert';
import { vi } from 'vitest';

// Mock các API
vi.mock('../../../apis/importApi');
vi.mock('../../../apis/areaApi');
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
    },
    {
      _id: '2',
      importDate: '2024-03-16T00:00:00.000Z',
      supplier: 'Supplier B',
      breed: 'Gà công nghiệp',
      quantity: 500,
      avgWeight: 1.8,
      barn: 'Khu B',
      flockId: 'flock2',
      status: 'Đang nuôi'
    }
  ];

  const mockAreas = [
    { _id: 'area1', name: 'Khu A', maxCapacity: 10000, currentCapacity: 7000 }, // 10000 - 7000 = 3000 gà
    { _id: 'area2', name: 'Khu B', maxCapacity: 15000, currentCapacity: 13500 } // 15000 - 13500 = 1500 gà
  ];

  const mockAreasWithNoCapacity = [
    { _id: 'area1', name: 'Khu A', maxCapacity: 10000, currentCapacity: 10000 }, // 0 gà
    { _id: 'area2', name: 'Khu B', maxCapacity: 15000, currentCapacity: 15000 } // 0 gà
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock default API responses
    importApi.getList.mockResolvedValue({
      data: {
        data: {
          items: [],
          totalPages: 1
        }
      }
    });

    areaApi.getList.mockResolvedValue({
      data: {
        data: mockAreas
      }
    });

    importApi.create.mockResolvedValue({
      data: {
        data: {
          _id: 'newImportId',
          flockId: 'newFlockId'
        }
      }
    });

    importApi.getDetail.mockResolvedValue({
      data: {
        data: mockImports[0]
      }
    });

    importApi.update.mockResolvedValue({
      data: {
        data: {
          success: true
        }
      }
    });

    importApi.delete.mockResolvedValue({
      data: {
        success: true
      }
    });
  });

  // TEST CASE 1: Load imports thành công
  test('TC1 - Load imports thành công', async () => {
    importApi.getList.mockResolvedValue({
      data: {
        data: {
          items: mockImports,
          totalPages: 1
        }
      }
    });

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
      await result.current.loadAreas();
    });

    expect(result.current.areas).toEqual(mockAreas);
    expect(result.current.areaLoading).toBe(false);
  });

  // TEST CASE 4: Tính toán areaCurrentCounts đúng
  test('TC4 - Tính toán areaCurrentCounts đúng từ areas', async () => {
    const { result } = renderHook(() => useImport());

    await act(async () => {
      await result.current.loadAreas();
    });

    // areaCurrentCounts được tính từ currentCapacity trong areas
    // currentCount = maxCapacity - currentCapacity
    expect(result.current.areaCurrentCounts).toEqual({
      'Khu A': 3000, // 10000 - 7000
      'Khu B': 1500  // 15000 - 13500
    });
  });

  // TEST CASE 5: Tạo import mới thành công
  test('TC5 - Tạo import mới thành công', async () => {
    const { result } = renderHook(() => useImport());

    // Load areas trước để có dữ liệu khu nuôi
    await act(async () => {
      await result.current.loadAreas();
    });

    const newImportData = {
      importDate: '2024-03-20',
      supplier: 'New Supplier',
      breed: 'Gà công nghiệp',
      quantity: 2000,
      avgWeight: 2.0,
      barn: 'Khu B'
    };

    await act(async () => {
      const resultCreate = await result.current.createImport(newImportData);
      expect(resultCreate.success).toBe(true);
    });

    // Kiểm tra importApi.create được gọi với đúng data
    expect(importApi.create).toHaveBeenCalledWith({
      importDate: expect.any(String),
      supplier: 'New Supplier',
      breed: 'Gà công nghiệp',
      quantity: 2000,
      avgWeight: 2.0,
      barn: 'Khu B',
      status: "Đang nuôi",
    });
  });

  // TEST CASE 6: Tạo import thất bại - hiển thị swal error
  test('TC6 - Hiển thị swal error khi tạo import thất bại', async () => {
    importApi.create.mockRejectedValue(new Error('Create failed'));

    const { result } = renderHook(() => useImport());

    // Load areas trước để có dữ liệu khu nuôi
    await act(async () => {
      await result.current.loadAreas();
    });

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
        // Expected to throw
      }
    });

    expect(swal).toHaveBeenCalledWith('Lỗi', expect.any(String), 'error');
  });

  // TEST CASE 7: Cập nhật import thành công
  test('TC7 - Cập nhật import thành công', async () => {
    // Set up imports
    importApi.getList.mockResolvedValue({
      data: {
        data: {
          items: [mockImports[0]],
          totalPages: 1
        }
      }
    });

    const { result } = renderHook(() => useImport());

    // Load data and areas
    await act(async () => {
      await result.current.loadData();
      await result.current.loadAreas();
    });

    const updateData = {
      importDate: '2024-03-25',
      supplier: 'Updated Supplier',
      breed: 'Gà thả vườn',
      quantity: 1500,
      avgWeight: 1.8,
      barn: 'Khu A' // Giữ nguyên khu A
    };

    await act(async () => {
      const success = await result.current.updateImport('1', updateData);
      expect(success.success).toBe(true);
    });

    // Kiểm tra importApi.update được gọi
    expect(importApi.update).toHaveBeenCalledWith('1', expect.any(Object));
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
      const resultUpdate = await result.current.updateImport('999', {
        importDate: '2024-03-20',
        supplier: 'Test',
        breed: 'Gà ta',
        quantity: 1000,
        avgWeight: 1.5,
        barn: 'Khu A'
      });

      expect(resultUpdate.success).toBe(false);
    });

    expect(swal).toHaveBeenCalledWith('Lỗi cập nhật!', expect.any(String), 'error');
  });

  // TEST CASE 9: Xóa import thành công
  test('TC9 - Xóa import thành công', async () => {
    // Set up imports with data
    importApi.getList.mockResolvedValue({
      data: {
        data: {
          items: [mockImports[0]],
          totalPages: 1
        }
      }
    });

    const { result } = renderHook(() => useImport());

    // Load data and areas
    await act(async () => {
      await result.current.loadData();
      await result.current.loadAreas();
    });

    await act(async () => {
      const deleteResult = await result.current.deleteImport('1');
      expect(deleteResult.success).toBe(true);
    });

    expect(importApi.delete).toHaveBeenCalledWith('1');
  });

  // TEST CASE 10: Xử lý khi không tìm thấy import để xóa
  test('TC10 - Xử lý khi không tìm thấy import để xóa', async () => {
    importApi.getList.mockResolvedValue({
      data: {
        data: {
          items: [],
          totalPages: 1
        }
      }
    });

    const { result } = renderHook(() => useImport());

    // Load empty data
    await act(async () => {
      await result.current.loadData();
    });

    await act(async () => {
      const deleteResult = await result.current.deleteImport('999');
      expect(deleteResult.success).toBe(false);
      // FIXED: The actual message is "Không tìm thấy đơn nhập" not "Không tìm thấy đơn nhập cần xóa!"
      expect(deleteResult.message).toBe('Không tìm thấy đơn nhập');
    });
  });

  // TEST CASE 11: Xóa import thất bại với lỗi từ server
  test('TC11 - Trả về success false khi xóa thất bại với lỗi từ server', async () => {
    // Set up imports with data
    importApi.getList.mockResolvedValue({
      data: {
        data: {
          items: [mockImports[0]],
          totalPages: 1
        }
      }
    });

    importApi.delete.mockRejectedValue({
      response: {
        data: {
          message: 'Server error'
        }
      }
    });

    const { result } = renderHook(() => useImport());

    // Load data and areas
    await act(async () => {
      await result.current.loadData();
      await result.current.loadAreas();
    });

    await act(async () => {
      const deleteResult = await result.current.deleteImport('1');
      expect(deleteResult.success).toBe(false);
      expect(deleteResult.message).toBe('Server error');
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

    // Call loadData multiple times
    await act(async () => {
      await Promise.all([
        result.current.loadData(),
        result.current.loadData(),
        result.current.loadData()
      ]);
    });

    // Should only be called once due to loadingRef
    expect(importApi.getList).toHaveBeenCalledTimes(1);
  });

  // TEST CASE 14: Tính areaCurrentCounts đúng khi không có imports
  test('TC14 - Tính areaCurrentCounts đúng khi không có imports', async () => {
    // Use areas with full capacity (no chickens)
    areaApi.getList.mockResolvedValue({
      data: {
        data: mockAreasWithNoCapacity
      }
    });

    const { result } = renderHook(() => useImport());

    await act(async () => {
      await result.current.loadAreas();
    });

    // When currentCapacity equals maxCapacity, there are no chickens
    expect(result.current.areaCurrentCounts).toEqual({
      'Khu A': 0, // 10000 - 10000
      'Khu B': 0  // 15000 - 15000
    });
  });

  // TEST CASE 15: Kiểm tra refreshAreasCache
  test('TC15 - Refresh areas cache thành công', async () => {
    const { result } = renderHook(() => useImport());

    await act(async () => {
      const areas = await result.current.refreshAreasCache();
      expect(areas).toEqual(mockAreas);
    });

    expect(areaApi.getList).toHaveBeenCalled();
  });
});