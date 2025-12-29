import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImportForm from '../components/ImportForm';
import { areaApi } from '../../../apis/areaApi';
import { describe, test, expect, vi } from "vitest";

// Mock API
vi.mock('../../../apis/areaApi');

describe('U5.2 - Form Nhập chuồng mới & U5.5 - Chỉnh sửa', () => {
    const mockAreas = [
        { _id: '1', name: 'Khu A', maxCapacity: 10000, currentCapacity: 7000 },
        { _id: '2', name: 'Khu B', maxCapacity: 15000, currentCapacity: 7000 },
        { _id: '3', name: 'Khu C', maxCapacity: 5000, currentCapacity: 500 }
    ];

    const mockAreasFull = [
        { _id: '3', name: 'Khu C', maxCapacity: 5000, currentCapacity: 0 }
    ];

    const mockAreaCurrentCounts = {
        'Khu A': 3000,
        'Khu B': 8000,
        'Khu C': 4500
    };

    const mockEditData = {
        _id: 'edit123',
        flockId: 'flock123',
        importDate: '2024-03-15T00:00:00.000Z',
        supplier: 'Nhà cung cấp cũ',
        breed: 'Gà ta',
        quantity: 1000,
        avgWeight: 1.5,
        barn: 'Khu A',
        status: 'Đang nuôi'
    };

    beforeEach(() => {
        areaApi.getList.mockResolvedValue({
            data: {
                status: 'success',
                data: mockAreas
            }
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    // TEST CASE 1: Hiển thị form thêm mới đúng
    test('TC1 - Hiển thị form thêm nhập chuồng mới với tiêu đề đúng', async () => {
        render(
            <ImportForm
                onClose={vi.fn()}
                onSubmit={vi.fn()}
                areaCurrentCounts={mockAreaCurrentCounts}
                areas={mockAreas}
            />
        );

        // Chờ form load xong
        await waitFor(() => {
            expect(screen.getByText('Nhập chuồng mới')).toBeInTheDocument();
        });

        // Kiểm tra các thành phần tồn tại
        expect(screen.getByPlaceholderText('Nhập tên nhà cung cấp')).toBeInTheDocument();
        expect(screen.getByText('Chọn giống')).toBeInTheDocument();
        expect(screen.getByText('Chọn khu nuôi')).toBeInTheDocument();
    });

    // TEST CASE 2: Hiển thị form chỉnh sửa với dữ liệu cũ
    test('TC2 - Hiển thị form chỉnh sửa với dữ liệu đúng', async () => {
        render(
            <ImportForm
                onClose={vi.fn()}
                onSubmit={vi.fn()}
                areaCurrentCounts={mockAreaCurrentCounts}
                editData={mockEditData}
                areas={mockAreas}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Chỉnh sửa đơn nhập')).toBeInTheDocument();
        });

        // Kiểm tra dữ liệu hiển thị
        expect(screen.getByDisplayValue('2024-03-15')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Nhà cung cấp cũ')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1.5')).toBeInTheDocument();
    });

    // TEST CASE 3: Validation thất bại khi bỏ trống trường bắt buộc
    test('TC3 - Hiển thị lỗi khi bỏ trống trường bắt buộc', async () => {
        const user = userEvent.setup();
        const mockOnSubmit = vi.fn();

        render(
            <ImportForm
                onClose={vi.fn()}
                onSubmit={mockOnSubmit}
                areaCurrentCounts={mockAreaCurrentCounts}
                areas={mockAreas}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Chọn khu nuôi')).toBeInTheDocument();
        });

        // Chọn khu nuôi
        const selects = screen.getAllByRole('combobox');
        const barnSelect = selects[selects.length - 1];
        await user.selectOptions(barnSelect, 'Khu A');

        // Click submit
        const submitButton = screen.getByRole('button', { name: /tạo đàn/i });
        await user.click(submitButton);

        // Kiểm tra các thông báo lỗi
        await waitFor(() => {
            expect(screen.getByText('Ngày nhập không được để trống')).toBeInTheDocument();
            expect(screen.getByText('Nhà cung cấp không được để trống')).toBeInTheDocument();
        });

        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    // TEST CASE 4: Validation thất bại khi số lượng <= 0
    test('TC4 - Hiển thị lỗi khi số lượng <= 0', async () => {
        const user = userEvent.setup();
        render(
            <ImportForm
                onClose={vi.fn()}
                onSubmit={vi.fn()}
                areaCurrentCounts={mockAreaCurrentCounts}
                areas={mockAreas}
            />
        );

        await waitFor(() => {
            expect(screen.getByPlaceholderText('0')).toBeInTheDocument();
        });

        const quantityInput = screen.getByPlaceholderText('0');
        await user.clear(quantityInput);
        await user.type(quantityInput, '0');
        await user.tab();

        await waitFor(() => {
            expect(screen.getByText('Số lượng phải lớn hơn 0')).toBeInTheDocument();
        });
    });

    // TEST CASE 5: Validation thất bại khi trọng lượng <= 0
    test('TC5 - Hiển thị lỗi khi trọng lượng TB <= 0', async () => {
        const user = userEvent.setup();
        render(
            <ImportForm
                onClose={vi.fn()}
                onSubmit={vi.fn()}
                areaCurrentCounts={mockAreaCurrentCounts}
                areas={mockAreas}
            />
        );

        await waitFor(() => {
            expect(screen.getByPlaceholderText('0.0')).toBeInTheDocument();
        });

        const weightInput = screen.getByPlaceholderText('0.0');
        await user.clear(weightInput);
        await user.type(weightInput, '0');
        await user.tab();

        await waitFor(() => {
            expect(screen.getByText('Trọng lượng TB phải lớn hơn 0')).toBeInTheDocument();
        });
    });

    // TEST CASE 6: Validation thất bại khi vượt quá sức chứa khu nuôi
    test('TC6 - Hiển thị lỗi khi vượt quá sức chứa khu nuôi', async () => {
        const user = userEvent.setup();
        render(
            <ImportForm
                onClose={vi.fn()}
                onSubmit={vi.fn()}
                areaCurrentCounts={mockAreaCurrentCounts}
                areas={mockAreas}
            />
        );

        await waitFor(() => {
            expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0);
        });

        // Chọn khu nuôi
        const selects = screen.getAllByRole('combobox');
        const barnSelect = selects[selects.length - 1];
        await user.selectOptions(barnSelect, 'Khu A');

        // Nhập số lượng vượt quá 7000
        const quantityInput = screen.getByPlaceholderText('0');
        await user.clear(quantityInput);
        await user.type(quantityInput, '8000');
        await user.tab();

        await waitFor(() => {
            expect(screen.getByText(/Số lượng vượt quá dung lượng còn trống/)).toBeInTheDocument();
        });
    });

    // TEST CASE 7: Submit thành công khi nhập đúng thông tin
    test('TC7 - Gọi onSubmit với dữ liệu đúng khi submit thành công', async () => {
        const mockOnSubmit = vi.fn();
        const user = userEvent.setup();

        const { container } = render(
            <ImportForm
                onClose={vi.fn()}
                onSubmit={mockOnSubmit}
                areaCurrentCounts={mockAreaCurrentCounts}
                areas={mockAreas}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Chọn khu nuôi')).toBeInTheDocument();
        });

        // Chọn khu nuôi
        const selects = screen.getAllByRole('combobox');
        const barnSelect = selects[selects.length - 1];
        await user.selectOptions(barnSelect, 'Khu A');

        // Nhập thông tin hợp lệ
        const dateInput = container.querySelector('input[type="date"]');
        await user.clear(dateInput);
        await user.type(dateInput, '2024-03-20');

        const supplierInput = screen.getByPlaceholderText('Nhập tên nhà cung cấp');
        await user.clear(supplierInput);
        await user.type(supplierInput, 'Nhà cung cấp Test');

        // Chọn giống
        const breedSelect = selects[0];
        await user.selectOptions(breedSelect, 'Gà ta');

        // Nhập số lượng
        const quantityInput = screen.getByPlaceholderText('0');
        await user.clear(quantityInput);
        await user.type(quantityInput, '1000');

        // Nhập trọng lượng
        const weightInput = screen.getByPlaceholderText('0.0');
        await user.clear(weightInput);
        await user.type(weightInput, '1.5');

        // Submit
        const submitButton = screen.getByRole('button', { name: /tạo đàn/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
                importDate: '2024-03-20',
                supplier: 'Nhà cung cấp Test',
                breed: 'Gà ta',
                quantity: '1000',
                avgWeight: '1.5',
                barn: 'Khu A'
            }));
        });
    });

    // TEST CASE 8: Đóng form khi click Hủy
    test('TC8 - Gọi onClose khi click nút Hủy', async () => {
        const mockOnClose = vi.fn();
        const user = userEvent.setup();

        render(
            <ImportForm
                onClose={mockOnClose}
                onSubmit={vi.fn()}
                areaCurrentCounts={mockAreaCurrentCounts}
                areas={mockAreas}
            />
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Hủy' })).toBeInTheDocument();
        });

        const cancelButton = screen.getByRole('button', { name: 'Hủy' });
        await user.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    // TEST CASE 9: Disabled khu nuôi khi khu nuôi đầy
    test('TC9 - Hiển thị khu nuôi đầy với trạng thái disabled', async () => {
        const fullAreaCurrentCounts = {
            'Khu C': 5000
        };

        render(
            <ImportForm
                onClose={vi.fn()}
                onSubmit={vi.fn()}
                areaCurrentCounts={fullAreaCurrentCounts}
                areas={mockAreasFull}
            />
        );

        await waitFor(() => {
            // Tìm option có chứa text "ĐẦY"
            const options = screen.getAllByRole('option');
            const fullOption = options.find(opt => opt.textContent?.includes('ĐẦY'));
            expect(fullOption).toBeInTheDocument();
            expect(fullOption).toBeDisabled();
        });
    });

    // TEST CASE 10: Validation đặc biệt cho chỉnh sửa (trừ mã đàn)
    test('TC10 - Trong chế độ chỉnh sửa, không cho phép chỉnh sửa mã đàn', async () => {
        render(
            <ImportForm
                onClose={vi.fn()}
                onSubmit={vi.fn()}
                areaCurrentCounts={mockAreaCurrentCounts}
                editData={mockEditData}
                areas={mockAreas}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Mã đơn:')).toBeInTheDocument();
        });

        // Kiểm tra không có input cho mã đàn
        expect(screen.queryByPlaceholderText(/mã đàn/i)).not.toBeInTheDocument();
    });

    // TEST CASE 11: Tính toán lại sức chứa khi chỉnh sửa khu nuôi
    test('TC11 - Tính toán đúng sức chứa khi chỉnh sửa sang khu nuôi khác', async () => {
        const user = userEvent.setup();

        render(
            <ImportForm
                onClose={vi.fn()}
                onSubmit={vi.fn()}
                areaCurrentCounts={mockAreaCurrentCounts}
                editData={mockEditData}
                areas={mockAreas}
            />
        );

        await waitFor(() => {
            const selects = screen.getAllByRole('combobox');
            expect(selects.length).toBeGreaterThan(0);
        });

        // Tìm combobox khu nuôi
        const selects = screen.getAllByRole('combobox');
        const barnSelect = selects[selects.length - 1];
        await user.selectOptions(barnSelect, 'Khu B');

        // Nhập số lượng vượt quá 7000
        const quantityInput = screen.getByPlaceholderText('0');
        await user.clear(quantityInput);
        await user.type(quantityInput, '7500');
        await user.tab();

        await waitFor(() => {
            expect(screen.getByText(/Số lượng vượt quá dung lượng còn trống/)).toBeInTheDocument();
        });
    });

    // TEST CASE 12: Submit thành công khi chỉnh sửa
    test('TC12 - Gọi onSubmit với dữ liệu chỉnh sửa đúng', async () => {
        const mockOnSubmit = vi.fn();
        const user = userEvent.setup();

        render(
            <ImportForm
                onClose={vi.fn()}
                onSubmit={mockOnSubmit}
                areaCurrentCounts={mockAreaCurrentCounts}
                editData={mockEditData}
                areas={mockAreas}
            />
        );

        await waitFor(() => {
            const submitButton = screen.getByRole('button', { name: /cập nhật/i });
            expect(submitButton).not.toBeDisabled();
        });

        const supplierInput = screen.getByPlaceholderText('Nhập tên nhà cung cấp');
        await user.clear(supplierInput);
        await user.type(supplierInput, 'Nhà cung cấp mới');

        const quantityInput = screen.getByPlaceholderText('0');
        await user.clear(quantityInput);
        await user.type(quantityInput, '1500');

        const submitButton = screen.getByRole('button', { name: /cập nhật/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
                supplier: 'Nhà cung cấp mới',
                quantity: '1500'
            }));
        });
    });

    // TEST CASE 13: Xử lý khi không có khu nuôi
    test('TC13 - Hiển thị thông báo khi không có khu nuôi nào khả dụng', async () => {
        render(
            <ImportForm
                onClose={vi.fn()}
                onSubmit={vi.fn()}
                areaCurrentCounts={mockAreaCurrentCounts}
                areas={[]}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Không có khu nuôi nào khả dụng')).toBeInTheDocument();
        });
    });

    // TEST CASE 14: Enter key trigger submit
    test('TC14 - Nhấn Enter trên trường input trigger submit form', async () => {
        const mockOnSubmit = vi.fn();
        const user = userEvent.setup();

        const { container } = render(
            <ImportForm
                onClose={vi.fn()}
                onSubmit={mockOnSubmit}
                areaCurrentCounts={mockAreaCurrentCounts}
                areas={mockAreas}
            />
        );

        // Đợi form load
        await waitFor(() => {
            expect(screen.getByText('Chọn khu nuôi')).toBeInTheDocument();
        });

        // Chọn khu nuôi
        const selects = screen.getAllByRole('combobox');
        const barnSelect = selects[selects.length - 1];
        await user.selectOptions(barnSelect, 'Khu A');

        // Nhập đủ thông tin hợp lệ
        const dateInput = container.querySelector('input[type="date"]');
        await user.clear(dateInput);
        await user.type(dateInput, '2024-03-20');

        const supplierInput = screen.getByPlaceholderText('Nhập tên nhà cung cấp');
        await user.clear(supplierInput);
        await user.type(supplierInput, 'Test Supplier');

        // Chọn giống
        const breedSelect = selects[0];
        await user.selectOptions(breedSelect, 'Gà ta');

        // Nhập số lượng
        const quantityInput = screen.getByPlaceholderText('0');
        await user.clear(quantityInput);
        await user.type(quantityInput, '1000');

        // Nhập trọng lượng
        const weightInput = screen.getByPlaceholderText('0.0');
        await user.clear(weightInput);
        await user.type(weightInput, '1.5{enter}');

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalled();
        });
    });

    // TEST CASE 15: Hiển thị thông tin đàn khi chỉnh sửa
    test('TC15 - Hiển thị thông tin mã đơn và flock ID khi chỉnh sửa', async () => {
        render(
            <ImportForm
                onClose={vi.fn()}
                onSubmit={vi.fn()}
                areaCurrentCounts={mockAreaCurrentCounts}
                editData={mockEditData}
                areas={mockAreas}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Mã đơn:')).toBeInTheDocument();
            expect(screen.getByText('DIT123')).toBeInTheDocument();
            expect(screen.getByText('Flock ID:')).toBeInTheDocument();
            expect(screen.getByText('OCK123')).toBeInTheDocument();
        });
    });
});