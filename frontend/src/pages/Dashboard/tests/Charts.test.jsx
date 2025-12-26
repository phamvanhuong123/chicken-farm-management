import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from "vitest";
import WeeklyConsumptionChart from '../components/WeeklyConsumptionChart';
import CostStructureChart from '../components/CostStructureChart';

// Mock recharts components
vi.mock('recharts', () => ({
    BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
    Bar: () => <div data-testid="bar" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    ResponsiveContainer: ({ children }) => (
        <div data-testid="responsive-container" style={{ width: '100%', height: '100%' }}>
            {children}
        </div>
    ),
    PieChart: () => <div data-testid="pie-chart" />,
    Pie: () => <div data-testid="pie" />,
    Cell: () => <div data-testid="cell" />,
    Sector: () => <div data-testid="sector" />,
}));

describe('U1.2 - Biểu Đồ Dashboard Components', () => {
    describe('WeeklyConsumptionChart', () => {
        const mockChartData = {
            title: 'Tiêu thụ hàng tuần',
            description: 'Thống kê tiêu thụ thức ăn và thuốc 7 ngày gần nhất',
            data: [
                { day: 'T1', food: 120, medicine: 25, total: 145, displayDate: '15/01', dayIndex: 1 },
                { day: 'T2', food: 135, medicine: 30, total: 165, displayDate: '16/01', dayIndex: 2 },
                { day: 'T3', food: 110, medicine: 20, total: 130, displayDate: '17/01', dayIndex: 3 },
                { day: 'T4', food: 125, medicine: 35, total: 160, displayDate: '18/01', dayIndex: 4 },
                { day: 'T5', food: 140, medicine: 40, total: 180, displayDate: '19/01', dayIndex: 5 },
                { day: 'T6', food: 130, medicine: 30, total: 160, displayDate: '20/01', dayIndex: 6 },
                { day: 'T7', food: 150, medicine: 45, total: 195, displayDate: '21/01', dayIndex: 7 },
            ],
            total: { food: 910, medicine: 225, overall: 1135 },
            period: '7d'
        };

        test('TC1 - Hiển thị loading state với skeleton UI', () => {
            render(<WeeklyConsumptionChart loading={true} />);

            const skeletonElements = document.querySelectorAll('.animate-pulse');
            expect(skeletonElements.length).toBeGreaterThan(0);

            const skeletonBars = document.querySelector('.h-48.bg-gray-200.rounded');
            expect(skeletonBars).toBeInTheDocument();
        });

        test('TC2 - Hiển thị no data state khi không có dữ liệu', () => {
            render(<WeeklyConsumptionChart data={null} />);

            expect(screen.getByText('Không có dữ liệu tiêu thụ')).toBeInTheDocument();
            expect(screen.getByText('Chưa có dữ liệu logs trong 7 ngày qua')).toBeInTheDocument();
        });

        test('TC3 - Hiển thị tiêu đề và mô tả biểu đồ', () => {
            render(<WeeklyConsumptionChart data={mockChartData} />);

            expect(screen.getByText('Tiêu thụ hàng tuần')).toBeInTheDocument();
            expect(screen.getByText('Thống kê tiêu thụ thức ăn và thuốc 7 ngày gần nhất')).toBeInTheDocument();
        });

        test('TC4 - Hiển thị tổng kết thức ăn, thuốc và tổng tiêu thụ', () => {
            render(<WeeklyConsumptionChart data={mockChartData} />);

            expect(screen.getByText('910')).toBeInTheDocument();
            expect(screen.getByText('225')).toBeInTheDocument();
            expect(screen.getByText('1.135')).toBeInTheDocument();
            expect(screen.getByText('Thức ăn (kg)')).toBeInTheDocument();
            expect(screen.getByText('Thuốc & Vaccine (kg)')).toBeInTheDocument();
            expect(screen.getByText('Tổng tiêu thụ (kg)')).toBeInTheDocument();
        });

        test('TC5 - Hiển thị thông tin khoảng thời gian', () => {
            render(<WeeklyConsumptionChart data={mockChartData} />);

            // Kiểm tra period badge (7 ngày gần nhất)
            expect(screen.getByText('7 ngày gần nhất')).toBeInTheDocument();
            // Kiểm tra các phần tử chính của biểu đồ
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
            expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
        });
    });

    describe('CostStructureChart', () => {
        const mockChartData = {
            title: 'Cơ cấu chi phí',
            description: 'Phân bổ chi phí hoạt động trang trại',
            data: [
                {
                    category: 'Thức ăn',
                    value: 159000000,
                    percentage: 65,
                    color: '#4CAF50',
                    description: 'Chi phí thức ăn chăn nuôi',
                    formattedValue: '159.000.000 ₫'
                },
                {
                    category: 'Thuốc & Vaccine',
                    value: 37000000,
                    percentage: 15,
                    color: '#FF9800',
                    description: 'Chi phí thuốc thú y và vaccine',
                    formattedValue: '37.000.000 ₫'
                },
                {
                    category: 'Nhân công',
                    value: 30000000,
                    percentage: 12,
                    color: '#2196F3',
                    description: 'Chi phí lương nhân viên',
                    formattedValue: '30.000.000 ₫'
                },
                {
                    category: 'Điện nước & Khác',
                    value: 19000000,
                    percentage: 8,
                    color: '#9C27B0',
                    description: 'Chi phí điện, nước, bảo trì',
                    formattedValue: '19.000.000 ₫'
                },
            ],
            total: {
                value: 245000000,
                formatted: '245.000.000 ₫',
                period: 'month',
                currency: 'VND'
            }
        };

        test('TC6 - Hiển thị loading state với skeleton UI', () => {
            render(<CostStructureChart loading={true} />);

            const skeletonElements = document.querySelectorAll('.animate-pulse');
            expect(skeletonElements.length).toBeGreaterThan(0);

            const skeletonCircle = document.querySelector('.h-48.bg-gray-200.rounded-full');
            expect(skeletonCircle).toBeInTheDocument();
        });

        test('TC7 - Hiển thị no data state khi không có dữ liệu', () => {
            render(<CostStructureChart data={null} />);

            expect(screen.getByText('Không có dữ liệu chi phí')).toBeInTheDocument();
            expect(screen.getByText('Chưa có dữ liệu material trong kho')).toBeInTheDocument();
        });

        test('TC8 - Hiển thị tiêu đề và mô tả biểu đồ', () => {
            render(<CostStructureChart data={mockChartData} />);

            expect(screen.getByText('Cơ cấu chi phí')).toBeInTheDocument();
            expect(screen.getByText('Phân bổ chi phí hoạt động trang trại')).toBeInTheDocument();
        });

        test('TC9 - Hiển thị tất cả các danh mục chi phí', () => {
            render(<CostStructureChart data={mockChartData} />);

            expect(screen.getByText('Thức ăn')).toBeInTheDocument();
            expect(screen.getByText('Thuốc & Vaccine')).toBeInTheDocument();
            expect(screen.getByText('Nhân công')).toBeInTheDocument();
            expect(screen.getByText('Điện nước & Khác')).toBeInTheDocument();
        });

        test('TC10 - Hiển thị tổng chi phí và phần trăm từng danh mục', () => {
            render(<CostStructureChart data={mockChartData} />);

            expect(screen.getByText('245.000.000 ₫')).toBeInTheDocument();
            expect(screen.getByText('159.000.000 ₫')).toBeInTheDocument();
            expect(screen.getByText('37.000.000 ₫')).toBeInTheDocument();
            expect(screen.getByText('30.000.000 ₫')).toBeInTheDocument();
            expect(screen.getByText('19.000.000 ₫')).toBeInTheDocument();

            expect(screen.getByText('65%')).toBeInTheDocument();
            expect(screen.getByText('15%')).toBeInTheDocument();
            expect(screen.getByText('12%')).toBeInTheDocument();
            expect(screen.getByText('8%')).toBeInTheDocument();
        });

        test('TC11 - Hiển thị thông tin khoảng thời gian và tổng chi phí', () => {
            render(<CostStructureChart data={mockChartData} />);

            expect(screen.getByText('Tháng này')).toBeInTheDocument();
            expect(screen.getByText('245.000.000 ₫')).toBeInTheDocument();
            expect(screen.getByText('Trong tháng này')).toBeInTheDocument();
        });

        test('TC12 - Hiển thị chi tiết từng danh mục trong phần sidebar', () => {
            render(<CostStructureChart data={mockChartData} />);

            expect(screen.getByText('Chi tiết chi phí')).toBeInTheDocument();
            expect(screen.getByText('Chi phí thức ăn chăn nuôi')).toBeInTheDocument();
            expect(screen.getByText('Chi phí thuốc thú y và vaccine')).toBeInTheDocument();
            expect(screen.getByText('Chi phí lương nhân viên')).toBeInTheDocument();
            expect(screen.getByText('Chi phí điện, nước, bảo trì')).toBeInTheDocument();
        });
    });
});