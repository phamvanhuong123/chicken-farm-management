// src/pages/Dashboard/tests/KPICard.test.jsx
import { render, screen } from '@testing-library/react';
import KPICard from '../components/KPICard';
import { describe, test, expect, vi } from "vitest";

// Mock react-icons
vi.mock('react-icons/fa', () => ({
    FaArrowUp: () => <span data-testid="fa-arrow-up">↑</span>,
    FaArrowDown: () => <span data-testid="fa-arrow-down">↓</span>,
    FaMinus: () => <span data-testid="fa-minus">−</span>,
}));

describe('U1.1 - KPICard Component', () => {
    const mockIcon = <div data-testid="test-icon">TestIcon</div>;

    test('TC1 - Hiển thị KPICard với dữ liệu đầy đủ', () => {
        render(
            <KPICard
                title="Tổng số gà"
                value={12450}
                change={4.2}
                unit="con"
                icon={mockIcon}
                color="green"
                status="up"
                description="Tổng số gà đang nuôi"
            />
        );

        expect(screen.getByText('Tổng số gà')).toBeInTheDocument();
        // Sửa: Component format 12450 thành "12.450" (có dấu phân cách hàng nghìn)
        expect(screen.getByText('12.450')).toBeInTheDocument();
        expect(screen.getByText('+4.2%')).toBeInTheDocument();
        expect(screen.getByTestId('test-icon')).toBeInTheDocument();
        expect(screen.getByTestId('fa-arrow-up')).toBeInTheDocument();
    });

    test('TC2 - Hiển thị trạng thái down với icon arrow down', () => {
        render(
            <KPICard
                title="Tỷ lệ chết"
                value={2.1}
                change={-0.5}
                icon={mockIcon}
                status="down"
            />
        );

        expect(screen.getByText('-0.5%')).toBeInTheDocument();
        expect(screen.getByTestId('fa-arrow-down')).toBeInTheDocument();
    });

    test('TC3 - Hiển thị trạng thái neutral với icon minus', () => {
        render(
            <KPICard
                title="Số đàn"
                value={8}
                change={0}
                icon={mockIcon}
                status="neutral"
            />
        );

        expect(screen.getByText('0%')).toBeInTheDocument();
        expect(screen.getByTestId('fa-minus')).toBeInTheDocument();
    });

    test('TC4 - Format tiền tệ VND đúng định dạng', () => {
        render(
            <KPICard
                title="Doanh thu"
                value={245000000}
                change={112.5}
                unit="VND"
                icon={mockIcon}
                isCurrency={true}
            />
        );

        expect(screen.getByText('245.000.000 ₫')).toBeInTheDocument();
    });

    test('TC5 - Hiển thị loading state', () => {
        render(
            <KPICard
                title="Đang tải"
                value={0}
                change={0}
                loading={true}
                icon={mockIcon}
            />
        );

        const loadingElements = document.querySelectorAll('.animate-pulse');
        expect(loadingElements.length).toBe(1);
        expect(screen.queryByText('Đang tải')).not.toBeInTheDocument();
    });

    test('TC6 - Hiển thị note nếu được cung cấp', () => {
        render(
            <KPICard
                title="Tỷ lệ chết"
                value={2.1}
                change={43.5}
                unit="%"
                icon={mockIcon}
                note="Tăng 43.5% so với kỳ trước"
            />
        );

        expect(screen.getByText('Tăng 43.5% so với kỳ trước')).toBeInTheDocument();
    });

    test('TC7 - Xử lý hiển thị giá trị 0', () => {
        render(
            <KPICard
                title="Test Zero"
                value={0}
                change={0}
                unit="con"
                icon={mockIcon}
            />
        );

        expect(screen.getByText('0')).toBeInTheDocument();
    });

    test('TC8 - Format số lớn hơn 1000', () => {
        render(
            <KPICard
                title="Số lượng lớn"
                value={1234567}
                change={10}
                unit="con"
                icon={mockIcon}
            />
        );

        // Sửa: Component format 1234567 thành "1,2 Tr"
        expect(screen.getByText('1,2 Tr')).toBeInTheDocument();
    });

    test('TC9 - Không hiển thị đơn vị text khi là currency', () => {
        const { container } = render(
            <KPICard
                title="Doanh thu"
                value={1000000}
                change={50}
                unit="VND"
                icon={mockIcon}
                isCurrency={true}
            />
        );

        // Sửa: Kiểm tra đơn vị không được hiển thị
        const unitElements = container.querySelectorAll('.text-xs.text-gray-500');
        const hasVNDText = Array.from(unitElements).some(el =>
            el.textContent === 'VND' || el.textContent === '₫'
        );
        expect(hasVNDText).toBe(false);
    });

    test('TC10 - Hiển thị đúng với icon background color', () => {
        const { container } = render(
            <KPICard
                title="Test"
                value={100}
                change={10}
                unit="con"
                icon={mockIcon}
                iconBgColor="bg-blue-50"
            />
        );

        const iconContainer = container.querySelector('.bg-blue-50');
        expect(iconContainer).toBeInTheDocument();
    });
});