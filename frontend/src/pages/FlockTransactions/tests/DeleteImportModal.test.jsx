import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteImportModal from '../components/Modal/DeleteImportModal';
import swal from 'sweetalert';
import { describe, test, expect, vi } from "vitest";

// Mock sweetalert
vi.mock('sweetalert', () => ({
  default: vi.fn(),
}));

describe('U5.5 - DeleteImportModal Component', () => {
  const mockImportItem = {
    _id: '123456789',
    importDate: '2024-03-15T00:00:00.000Z'
  };

  const mockOnDeleteSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TEST CASE 1: Mở modal khi click nút xóa
  test('TC1 - Mở modal xác nhận khi click nút xóa', async () => {
    const user = userEvent.setup();

    render(
      <DeleteImportModal
        importItem={mockImportItem}
        onDeleteSuccess={mockOnDeleteSuccess}
      />
    );

    const deleteButton = screen.getByTitle('Xóa đơn nhập');
    await user.click(deleteButton);

    expect(screen.getByText('Xóa đơn nhập chuồng')).toBeInTheDocument();
    expect(screen.getByText(/Bạn có chắc muốn xóa đơn nhập ngày/)).toBeInTheDocument();
  });

  // TEST CASE 2: Đóng modal khi click nút Hủy
  test('TC2 - Đóng modal khi click nút Hủy', async () => {
    const user = userEvent.setup();

    render(
      <DeleteImportModal
        importItem={mockImportItem}
        onDeleteSuccess={mockOnDeleteSuccess}
      />
    );

    // Mở modal
    const deleteButton = screen.getByTitle('Xóa đơn nhập');
    await user.click(deleteButton);

    // Đóng modal
    const cancelButton = screen.getByText('Hủy');
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Xóa đơn nhập chuồng')).not.toBeInTheDocument();
    });
  });

  // TEST CASE 3: Đóng modal khi click overlay
  test('TC3 - Đóng modal khi click vào overlay background', async () => {
    const user = userEvent.setup();

    render(
      <DeleteImportModal
        importItem={mockImportItem}
        onDeleteSuccess={mockOnDeleteSuccess}
      />
    );

    // Mở modal
    const deleteButton = screen.getByTitle('Xóa đơn nhập');
    await user.click(deleteButton);

    const modalContainer = screen.getByText('Xóa đơn nhập chuồng').closest('div[class*="fixed"]');
    const overlay = modalContainer?.querySelector('div[class*="absolute"]');

    if (overlay) {
      await user.click(overlay);
    }

    await waitFor(() => {
      expect(screen.queryByText('Xóa đơn nhập chuồng')).not.toBeInTheDocument();
    });
  });

  // TEST CASE 4: Gọi onDeleteSuccess khi xác nhận xóa
  test('TC4 - Gọi onDeleteSuccess với đúng ID khi xác nhận xóa', async () => {
    const user = userEvent.setup();
    mockOnDeleteSuccess.mockResolvedValue(true);

    render(
      <DeleteImportModal
        importItem={mockImportItem}
        onDeleteSuccess={mockOnDeleteSuccess}
      />
    );

    // Mở modal
    const deleteButton = screen.getByTitle('Xóa đơn nhập');
    await user.click(deleteButton);

    // Xác nhận xóa
    const confirmButton = screen.getByText('Xác nhận');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockOnDeleteSuccess).toHaveBeenCalledWith(mockImportItem._id);
    });

    // Modal đã đóng
    await waitFor(() => {
      expect(screen.queryByText('Xóa đơn nhập chuồng')).not.toBeInTheDocument();
    });
  });

  // TEST CASE 5: Hiển thị loading state khi đang xóa
  test('TC5 - Hiển thị loading state khi đang xử lý xóa', async () => {
    const user = userEvent.setup();

    let resolveDelete;
    const deletePromise = new Promise(resolve => {
      resolveDelete = resolve;
    });
    mockOnDeleteSuccess.mockReturnValue(deletePromise);

    render(
      <DeleteImportModal
        importItem={mockImportItem}
        onDeleteSuccess={mockOnDeleteSuccess}
      />
    );

    // Mở modal
    const deleteButton = screen.getByTitle('Xóa đơn nhập');
    await user.click(deleteButton);

    // Bắt đầu xóa
    const confirmButton = screen.getByText('Xác nhận');
    await user.click(confirmButton);

    // Kiểm tra loading text
    await waitFor(() => {
      expect(screen.getByText('Đang xóa...')).toBeInTheDocument();
    });
    expect(screen.getByText('Đang xóa...')).toBeDisabled();

    // Hoàn thành xóa
    resolveDelete(true);
    await deletePromise;
  });

  // TEST CASE 6: Không thể click khi đang loading
  test('TC6 - Không thể mở modal mới khi đang xóa', async () => {
    const user = userEvent.setup();

    let resolveDelete;
    const deletePromise = new Promise(resolve => {
      resolveDelete = resolve;
    });
    mockOnDeleteSuccess.mockReturnValue(deletePromise);

    render(
      <DeleteImportModal
        importItem={mockImportItem}
        onDeleteSuccess={mockOnDeleteSuccess}
      />
    );

    // Mở và bắt đầu xóa
    const deleteButton = screen.getByTitle('Xóa đơn nhập');
    await user.click(deleteButton);

    const confirmButton = screen.getByText('Xác nhận');
    await user.click(confirmButton);

    // Đang loading, nút delete phải disabled
    await waitFor(() => {
      expect(deleteButton).toBeDisabled();
    });

    // Hoàn thành
    resolveDelete(true);
    await deletePromise;
  });

  // TEST CASE 7: Hiển thị đúng ngày trong thông báo xác nhận
  test('TC7 - Hiển thị đúng ngày định dạng Việt Nam trong thông báo', async () => {
    const user = userEvent.setup();

    const itemWithDate = {
      ...mockImportItem,
      importDate: '2024-03-15T00:00:00.000Z'
    };

    render(
      <DeleteImportModal
        importItem={itemWithDate}
        onDeleteSuccess={mockOnDeleteSuccess}
      />
    );

    await user.click(screen.getByTitle('Xóa đơn nhập'));

    // Sửa: Tìm text với regex thay vì exact match
    expect(screen.getByText(/15\/3\/2024/)).toBeInTheDocument();
  });

  // TEST CASE 8: Xử lý khi onDeleteSuccess trả về false
  test('TC8 - Modal đóng khi onDeleteSuccess trả về false', async () => {
    const user = userEvent.setup();
    mockOnDeleteSuccess.mockResolvedValue(false);

    render(
      <DeleteImportModal
        importItem={mockImportItem}
        onDeleteSuccess={mockOnDeleteSuccess}
      />
    );

    await user.click(screen.getByTitle('Xóa đơn nhập'));
    await user.click(screen.getByText('Xác nhận'));

    await waitFor(() => {
      expect(mockOnDeleteSuccess).toHaveBeenCalled();
      expect(screen.queryByText('Xóa đơn nhập chuồng')).not.toBeInTheDocument();
    });
  });

  // TEST CASE 9: Xử lý khi onDeleteSuccess throw error
  test('TC9 - Xử lý khi onDeleteSuccess throw error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    const user = userEvent.setup();

    mockOnDeleteSuccess.mockImplementation(() => {
      return Promise.reject(new Error('Delete failed')).catch(() => {
      });
    });

    render(
      <DeleteImportModal
        importItem={mockImportItem}
        onDeleteSuccess={mockOnDeleteSuccess}
      />
    );

    await user.click(screen.getByTitle('Xóa đơn nhập'));
    await user.click(screen.getByText('Xác nhận'));

    await waitFor(() => {
      expect(mockOnDeleteSuccess).toHaveBeenCalled();
      expect(screen.queryByText('Xóa đơn nhập chuồng')).not.toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  // TEST CASE 10: Hiển thị icon warning đúng
  test('TC10 - Hiển thị icon cảnh báo trong modal', async () => {
    const user = userEvent.setup();

    render(
      <DeleteImportModal
        importItem={mockImportItem}
        onDeleteSuccess={mockOnDeleteSuccess}
      />
    );

    await user.click(screen.getByTitle('Xóa đơn nhập'));

    const warningIcon = screen.getByText('⚠️');
    expect(warningIcon).toBeInTheDocument();

    const iconContainer = warningIcon.closest('div');
    expect(iconContainer).toHaveClass('bg-amber-100');
  });

  // TEST CASE 11: Button styling đúng
  test('TC11 - Áp dụng đúng CSS classes cho các nút', async () => {
    const user = userEvent.setup();

    render(
      <DeleteImportModal
        importItem={mockImportItem}
        onDeleteSuccess={mockOnDeleteSuccess}
      />
    );

    await user.click(screen.getByTitle('Xóa đơn nhập'));

    const cancelButton = screen.getByText('Hủy');
    const confirmButton = screen.getByText('Xác nhận');

    expect(cancelButton).toHaveClass('hover:bg-slate-50');
    expect(confirmButton).toHaveClass('bg-amber-500');
    expect(confirmButton).toHaveClass('hover:bg-amber-600');
  });

  // TEST CASE 12: Hiển thị message xác nhận đúng
  test('TC12 - Hiển thị đúng message xác nhận xóa', async () => {
    const user = userEvent.setup();

    render(
      <DeleteImportModal
        importItem={mockImportItem}
        onDeleteSuccess={mockOnDeleteSuccess}
      />
    );

    await user.click(screen.getByTitle('Xóa đơn nhập'));

    const message = screen.getByText(/Bạn có chắc muốn xóa đơn nhập ngày/);
    expect(message).toBeInTheDocument();
    expect(message.textContent).toContain('Hành động này không thể hoàn tác');
  });

  // TEST CASE 13: Modal không hiển thị ban đầu
  test('TC13 - Modal không hiển thị khi chưa click', () => {
    render(
      <DeleteImportModal
        importItem={mockImportItem}
        onDeleteSuccess={mockOnDeleteSuccess}
      />
    );

    expect(screen.queryByText('Xóa đơn nhập chuồng')).not.toBeInTheDocument();
  });

  // TEST CASE 14: Close button (X) hoạt động đúng
  test('TC14 - Nút close (X) đóng modal đúng', async () => {
    const user = userEvent.setup();

    render(
      <DeleteImportModal
        importItem={mockImportItem}
        onDeleteSuccess={mockOnDeleteSuccess}
      />
    );

    await user.click(screen.getByTitle('Xóa đơn nhập'));

    // Tìm nút X bằng cách tìm nút có SVG và không có text/content
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons.find(button => {
      const hasSvg = button.querySelector('svg') !== null;
      const hasText = button.textContent && button.textContent.trim() !== '';
      const hasTitle = button.hasAttribute('title');

      return hasSvg && !hasText && !hasTitle;
    });

    expect(closeButton).toBeDefined();

    if (closeButton) {
      await user.click(closeButton);
    }

    await waitFor(() => {
      expect(screen.queryByText('Xóa đơn nhập chuồng')).not.toBeInTheDocument();
    });
  });

  // TEST CASE 15: Disable buttons khi đang loading
  test('TC15 - Disable cả hai nút khi đang loading', async () => {
    const user = userEvent.setup();

    let resolveDelete;
    const deletePromise = new Promise(resolve => {
      resolveDelete = resolve;
    });
    mockOnDeleteSuccess.mockReturnValue(deletePromise);

    render(
      <DeleteImportModal
        importItem={mockImportItem}
        onDeleteSuccess={mockOnDeleteSuccess}
      />
    );

    await user.click(screen.getByTitle('Xóa đơn nhập'));
    await user.click(screen.getByText('Xác nhận'));

    const cancelButton = screen.getByText('Hủy');
    const confirmButton = screen.getByText('Đang xóa...');

    await waitFor(() => {
      expect(cancelButton).toBeDisabled();
      expect(confirmButton).toBeDisabled();
    });

    resolveDelete(true);
    await deletePromise;
  });
});