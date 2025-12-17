import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImportItem from '../components/ImportItem';

// Mock DeleteImportModal đúng cách
vi.mock('../components/Modal/DeleteImportModal', () => ({
  default: function MockDeleteImportModal({ importItem, onDeleteSuccess, loading }) {
    return (
      <button
        data-testid="delete-modal-trigger"
        onClick={() => onDeleteSuccess(importItem._id)}
        disabled={loading}
      >
        Mock Delete
      </button>
    );
  },
}));

// Mock sweetalert
vi.mock('sweetalert', () => ({
  default: vi.fn(),
}));

const renderInTable = (component) => {
  return render(
    <table>
      <tbody>{component}</tbody>
    </table>
  );
};

describe('U5.5 - ImportItem Component', () => {
  const mockItem = {
    _id: '123456789abcdef',
    importDate: '2024-03-15T00:00:00.000Z',
    supplier: 'Nhà cung cấp A',
    breed: 'Gà ta',
    quantity: 1000,
    avgWeight: 1.5,
    barn: 'Khu A',
    status: 'Đang nuôi'
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TEST CASE 1: Hiển thị đầy đủ thông tin item
  test('TC1 - Hiển thị đầy đủ thông tin của đơn nhập', () => {
    renderInTable(
      <ImportItem
        item={mockItem}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Kiểm tra các thông tin hiển thị
    expect(screen.getByText('12345678')).toBeInTheDocument();
    expect(screen.getByText('15/3/2024')).toBeInTheDocument();
    expect(screen.getByText('Nhà cung cấp A')).toBeInTheDocument();
    expect(screen.getByText('Gà ta')).toBeInTheDocument();
    expect(screen.getByText('1.000')).toBeInTheDocument();
    expect(screen.getByText('1.5 kg')).toBeInTheDocument();
    expect(screen.getByText('Khu A')).toBeInTheDocument();
    expect(screen.getByText('Đang nuôi')).toBeInTheDocument();
  });

  // TEST CASE 2: Format ngày đúng với various date formats
  test('TC2 - Xử lý đúng various date formats', () => {
    const itemWithObjectDate = {
      ...mockItem,
      importDate: { $date: '2024-03-15T00:00:00.000Z' }
    };

    const { rerender } = renderInTable(
      <ImportItem
        item={itemWithObjectDate}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('15/3/2024')).toBeInTheDocument();

    // Test với string date
    const itemWithStringDate = {
      ...mockItem,
      importDate: '2024-03-20'
    };

    rerender(
      <table>
        <tbody>
          <ImportItem
            item={itemWithStringDate}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('20/3/2024')).toBeInTheDocument(); // Sửa: 20/3/2024
  });

  // TEST CASE 3: Hiển thị "N/A" khi không có ngày
  test('TC3 - Hiển thị "N/A" khi không có ngày nhập', () => {
    const itemWithoutDate = {
      ...mockItem,
      importDate: null
    };

    renderInTable(
      <ImportItem
        item={itemWithoutDate}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  // TEST CASE 4: Format số lượng đúng với Intl.NumberFormat
  test('TC4 - Format số lượng đúng định dạng Việt Nam', () => {
    const itemWithLargeNumber = {
      ...mockItem,
      quantity: 1000000
    };

    renderInTable(
      <ImportItem
        item={itemWithLargeNumber}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('1.000.000')).toBeInTheDocument();
  });

  // TEST CASE 5: Trạng thái "Đang nuôi" hiển thị với màu xanh
  test('TC5 - Hiển thị đúng styling cho trạng thái "Đang nuôi"', () => {
    renderInTable(
      <ImportItem
        item={mockItem}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const statusBadge = screen.getByText('Đang nuôi');
    expect(statusBadge).toHaveClass('bg-blue-100');
    expect(statusBadge).toHaveClass('text-blue-800');
  });

  // TEST CASE 6: Trạng thái "Hoàn thành" hiển thị với màu xanh lá
  test('TC6 - Hiển thị đúng styling cho trạng thái "Hoàn thành"', () => {
    const completedItem = {
      ...mockItem,
      status: 'Hoàn thành'
    };

    renderInTable(
      <ImportItem
        item={completedItem}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const statusBadge = screen.getByText('Hoàn thành');
    expect(statusBadge).toHaveClass('bg-green-100');
    expect(statusBadge).toHaveClass('text-green-800');
  });

  // TEST CASE 7: Gọi onEdit khi click nút chỉnh sửa
  test('TC7 - Gọi onEdit với đúng item khi click nút chỉnh sửa', async () => {
    const user = userEvent.setup();

    renderInTable(
      <ImportItem
        item={mockItem}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByTitle('Chỉnh sửa');
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockItem);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  // TEST CASE 8: Không gọi onEdit khi đang loading
  test('TC8 - Không gọi onEdit khi đang loading', async () => {
    const user = userEvent.setup();

    mockOnDelete.mockImplementation(() => new Promise(() => { }));

    renderInTable(
      <ImportItem
        item={mockItem}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Click delete button để kích hoạt loading state
    const deleteButton = screen.getByTestId('delete-modal-trigger');
    await user.click(deleteButton);

    // Thử click edit button khi đang loading
    const editButton = screen.getByTitle('Chỉnh sửa');
    await user.click(editButton);

    expect(mockOnEdit).not.toHaveBeenCalled();
  });

  // TEST CASE 9: Hiển thị DeleteImportModal component
  test('TC9 - Hiển thị DeleteImportModal với đúng props', () => {
    renderInTable(
      <ImportItem
        item={mockItem}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTestId('delete-modal-trigger')).toBeInTheDocument();
  });

  // TEST CASE 10: Xử lý xóa thành công
  test('TC10 - Xử lý xóa thành công qua DeleteImportModal', async () => {
    const user = userEvent.setup();
    mockOnDelete.mockResolvedValue(true);

    renderInTable(
      <ImportItem
        item={mockItem}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByTestId('delete-modal-trigger');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(mockItem._id);
    });
  });

  // TEST CASE 11: Xử lý xóa thất bại
  test('TC11 - Xử lý xóa thất bại và hiển thị thông báo lỗi', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    const user = userEvent.setup();

    mockOnDelete.mockRejectedValue(new Error('Delete failed'));

    renderInTable(
      <ImportItem
        item={mockItem}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByTestId('delete-modal-trigger');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(mockItem._id);
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  // TEST CASE 12: Short ID đúng với các độ dài khác nhau
  test('TC12 - Hiển thị short ID đúng với various ID lengths', () => {
    const shortIdItem = {
      ...mockItem,
      _id: '123'
    };

    const { rerender } = renderInTable(
      <ImportItem
        item={shortIdItem}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('123')).toBeInTheDocument();

    const longIdItem = {
      ...mockItem,
      _id: '1234567890abcdef1234567890abcdef'
    };

    rerender(
      <table>
        <tbody>
          <ImportItem
            item={longIdItem}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('12345678')).toBeInTheDocument();
  });

  // TEST CASE 13: Hiển thị "N/A" khi không có ID
  test('TC13 - Hiển thị "N/A" khi không có _id', () => {
    const itemWithoutId = {
      ...mockItem,
      _id: undefined
    };

    renderInTable(
      <ImportItem
        item={itemWithoutId}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  // TEST CASE 14: Định dạng đúng khi quantity là 0
  test('TC14 - Định dạng đúng khi quantity là 0', () => {
    const zeroQuantityItem = {
      ...mockItem,
      quantity: 0
    };

    renderInTable(
      <ImportItem
        item={zeroQuantityItem}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  // TEST CASE 15: CSS classes đúng cho hover effects
  test('TC15 - Áp dụng đúng CSS classes cho hover effects', () => {
    const { container } = renderInTable(
      <ImportItem
        item={mockItem}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const row = container.querySelector('tr');
    expect(row).toHaveClass('hover:bg-gray-50');
    expect(row).toHaveClass('transition-colors');

    const editButton = screen.getByTitle('Chỉnh sửa');
    expect(editButton).toHaveClass('hover:bg-blue-50');
  });
});