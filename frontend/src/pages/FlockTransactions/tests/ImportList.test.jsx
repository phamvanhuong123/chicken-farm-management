import { render, screen, waitFor } from '@testing-library/react';
import ImportList from '../components/ImportList';
import ImportItem from '../components/ImportItem';
import { useImport } from '../hooks/useImport';
import { describe, test, expect, vi } from "vitest";

// Mock hooks và components
vi.mock('../hooks/useImport');
vi.mock('../components/ImportItem', () => {
  return {
    default: vi.fn()
  };
});

describe('U5.2 - Tab "Nhập chuồng" - Danh sách', () => {
  const mockImports = [
    {
      _id: '123456789',
      importDate: '2024-03-15T00:00:00.000Z',
      supplier: 'Nhà cung cấp A',
      breed: 'Gà ta',
      quantity: 1000,
      avgWeight: 1.5,
      barn: 'Khu A',
      status: 'Đang nuôi'
    },
    {
      _id: '987654321',
      importDate: '2024-03-16T00:00:00.000Z',
      supplier: 'Nhà cung cấp B',
      breed: 'Gà công nghiệp',
      quantity: 2000,
      avgWeight: 2.0,
      barn: 'Khu B',
      status: 'Đang nuôi'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    useImport.mockReturnValue({
      imports: mockImports,
      areas: [],
      areaCurrentCounts: {},
      loading: false,
      areaLoading: false,
      loadData: vi.fn(),
      loadAreas: vi.fn(),
      createImport: vi.fn(),
      updateImport: vi.fn(),
      deleteImport: vi.fn()
    });

    // Mock ImportItem với cấu trúc HTML hợp lệ
    ImportItem.mockImplementation(({ item }) => (
      <tr data-testid={`import-item-${item._id}`}>
        <td>{item._id}</td>
      </tr>
    ));
  });

  // TEST CASE 1: Hiển thị danh sách khi có dữ liệu
  test('TC1 - Hiển thị danh sách nhập chuồng khi có dữ liệu', () => {
    render(<ImportList list={mockImports} onEdit={vi.fn()} onDelete={vi.fn()} />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    mockImports.forEach(item => {
      expect(screen.getByTestId(`import-item-${item._id}`)).toBeInTheDocument();
    });
  });

  // TEST CASE 2: Hiển thị thông báo khi không có dữ liệu
  test('TC2 - Hiển thị thông báo "Chưa có dữ liệu nhập chuồng" khi danh sách rỗng', () => {
    render(<ImportList list={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Chưa có dữ liệu nhập chuồng')).toBeInTheDocument();
  });

  // TEST CASE 3: Hiển thị thông báo khi list là null
  test('TC3 - Hiển thị thông báo khi list là null', () => {
    render(<ImportList list={null} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Chưa có dữ liệu nhập chuồng')).toBeInTheDocument();
  });

  // TEST CASE 4: Hiển thị thông báo khi list là undefined
  test('TC4 - Hiển thị thông báo khi list là undefined', () => {
    render(<ImportList list={undefined} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Chưa có dữ liệu nhập chuồng')).toBeInTheDocument();
  });

  // TEST CASE 5: Loại bỏ các item trùng lặp
  test('TC5 - Loại bỏ các item trùng lặp dựa trên _id', () => {
    const duplicateImports = [
      ...mockImports,
      { ...mockImports[0] },
      { ...mockImports[1] }
    ];

    render(<ImportList list={duplicateImports} onEdit={vi.fn()} onDelete={vi.fn()} />);

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3);
  });

  // TEST CASE 6: Hiển thị đúng cấu trúc bảng
  test('TC6 - Hiển thị đúng các cột theo yêu cầu', () => {
    render(<ImportList list={mockImports} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Mã đàn')).toBeInTheDocument();
    expect(screen.getByText('Ngày nhập')).toBeInTheDocument();
    expect(screen.getByText('Nhà cung cấp')).toBeInTheDocument();
    expect(screen.getByText('Giống')).toBeInTheDocument();
    expect(screen.getByText('Số lượng')).toBeInTheDocument();
    expect(screen.getByText('Trọng lượng TB')).toBeInTheDocument();
    expect(screen.getByText('Khu nuôi')).toBeInTheDocument();
    expect(screen.getByText('Trạng thái')).toBeInTheDocument();
    expect(screen.getByText('Hành động')).toBeInTheDocument();
  });

  // TEST CASE 7: Không hiển thị bảng khi không có dữ liệu
  test('TC7 - Không hiển thị bảng khi không có dữ liệu', () => {
    render(<ImportList list={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  // TEST CASE 8: Hiển thị border và styling đúng
  test('TC8 - Hiển thị đúng border và styling của bảng', () => {
    const { container } = render(
      <ImportList list={mockImports} onEdit={vi.fn()} onDelete={vi.fn()} />
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('border');
    expect(wrapper).toHaveClass('border-gray-200');
    expect(wrapper).toHaveClass('rounded-lg');
    expect(wrapper).toHaveClass('overflow-hidden');
  });

  // TEST CASE 9: Truyền đúng props cho ImportItem
  test('TC9 - Truyền đúng props cho mỗi ImportItem', () => {
    vi.clearAllMocks();

    ImportItem.mockImplementation(({ item }) => (
      <tr data-testid={`import-item-${item._id}`}>
        <td>{item._id}</td>
      </tr>
    ));

    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();

    render(<ImportList list={mockImports} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    // Kiểm tra ImportItem được gọi với đúng số lần
    expect(ImportItem).toHaveBeenCalledTimes(2);

    // Kiểm tra props được truyền cho ImportItem
    const calls = ImportItem.mock.calls;

    // Kiểm tra lần gọi thứ nhất
    expect(calls[0][0]).toEqual({
      item: mockImports[0],
      onEdit: mockOnEdit,
      onDelete: mockOnDelete
    });

    // Kiểm tra lần gọi thứ hai
    expect(calls[1][0]).toEqual({
      item: mockImports[1],
      onEdit: mockOnEdit,
      onDelete: mockOnDelete
    });
  });

  // TEST CASE 10: Xử lý dữ liệu lớn không bị crash
  test('TC10 - Xử lý danh sách lớn không bị crash', () => {
    vi.clearAllMocks();

    const largeList = Array.from({ length: 100 }, (_, i) => ({
      _id: `id-${i}`,
      importDate: '2024-03-15T00:00:00.000Z',
      supplier: `Supplier ${i}`,
      breed: 'Gà ta',
      quantity: 1000 + i,
      avgWeight: 1.5,
      barn: `Khu ${i % 5}`,
      status: 'Đang nuôi'
    }));

    expect(() => {
      render(<ImportList list={largeList} onEdit={vi.fn()} onDelete={vi.fn()} />);
    }).not.toThrow();
  });
});