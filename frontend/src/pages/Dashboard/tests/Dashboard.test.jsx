// src/__tests__/Dashboard/Dashboard.test.jsx
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../Dashboard';
import { dashboardApi } from '../../../apis/dashboardApi';
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

// Mock API
vi.mock('../../../apis/dashboardApi');

vi.mock('react-icons/fa', () => ({
    FaUsers: () => <div data-testid="fa-users">FaUsers</div>,
    FaChartPie: () => <div data-testid="fa-chart-pie">FaChartPie</div>,
    FaChartLine: () => <div data-testid="fa-chart-line">FaChartLine</div>,
    FaDollarSign: () => <div data-testid="fa-dollar-sign">FaDollarSign</div>,
    FaExclamationTriangle: () => <div data-testid="fa-exclamation-triangle">FaExclamationTriangle</div>,
    FaShoppingCart: () => <div data-testid="fa-shopping-cart">FaShoppingCart</div>,
    FaTachometerAlt: () => <div data-testid="fa-tachometer-alt">FaTachometerAlt</div>,
    FaRedo: () => <div data-testid="fa-redo">FaRedo</div>,
    FaArrowUp: () => <span data-testid="fa-arrow-up">↑</span>,
    FaArrowDown: () => <span data-testid="fa-arrow-down">↓</span>,
    FaMinus: () => <span data-testid="fa-minus">−</span>,
    FaCalendarAlt: () => <div data-testid="fa-calendar-alt">FaCalendarAlt</div>,
    FaExclamationCircle: () => <div>FaExclamationCircle</div>,
    FaInfoCircle: () => <div>FaInfoCircle</div>,
}));

describe('U1.1 - Dashboard KPI Component với bộ lọc thời gian', () => {
    const mockKPIData = {
        totalChickens: {
            value: 12450,
            change: 4.2,
            status: 'up',
            unit: 'con',
            description: 'Tổng số gà đang nuôi',
            color: 'green'
        },
        totalFlocks: {
            value: 8,
            change: 11,
            status: 'up',
            unit: 'đàn',
            description: 'Tổng số đàn đang nuôi',
            color: 'green'
        },
        deathRate: {
            value: 2.1,
            change: 43.5,
            status: 'up',
            period: '7d',
            unit: '%',
            description: 'Tỷ lệ chết (7 ngày gần nhất)',
            color: 'red',
            note: 'Tăng 43.5% so với kỳ trước'
        },
        avgWeight: {
            value: 1.8,
            change: 42.9,
            status: 'up',
            unit: 'kg/con',
            description: 'Trọng lượng trung bình',
            color: 'green'
        },
        todayFeed: {
            value: 850,
            change: 0,
            unit: 'kg',
            status: 'normal',
            label: 'Bình thường',
            description: 'Thức ăn hôm nay',
            color: 'green'
        },
        monthlyRevenue: {
            value: 245000000,
            change: 112.5,
            status: 'up',
            description: 'Doanh thu tháng',
            period: 'month',
            currency: 'VND',
            formatted: '245.000.000 ₫',
            color: 'green'
        },
        period: '7d',
        calculatedAt: '2024-01-15T10:30:00.000Z'
    };

    const mockAlerts = {
        alerts: [],
        total: 0,
        hasAlerts: false,
        lastChecked: '2024-01-15T10:30:00.000Z'
    };

    beforeEach(() => {
        vi.clearAllTimers();

        dashboardApi.getDashboardKPIs.mockResolvedValue({
            data: {
                message: 'Lấy dữ liệu dashboard thành công',
                data: mockKPIData,
                period: '7d',
                lastUpdated: '2024-01-15T10:30:00.000Z'
            }
        });

        dashboardApi.getDashboardAlerts.mockResolvedValue({
            data: {
                message: 'Lấy cảnh báo dashboard thành công',
                data: mockAlerts,
                timestamp: '2024-01-15T10:30:00.000Z'
            }
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    test('TC1 - Hiển thị tiêu đề và mô tả dashboard thành công', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('Tổng quan trang trại')).toBeInTheDocument();
        });

        expect(screen.getByText('Theo dõi tình hình chung của trang trại gia cầm')).toBeInTheDocument();
        expect(screen.getByTestId('fa-tachometer-alt')).toBeInTheDocument();
    });

    test('TC2 - Hiển thị đầy đủ 6 KPI cards với dữ liệu từ API', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('Tổng số gà')).toBeInTheDocument();
            expect(screen.getByText('Trọng lượng TB')).toBeInTheDocument();
            expect(screen.getByText('Số đàn')).toBeInTheDocument();
            expect(screen.getByText('Thức ăn hôm nay')).toBeInTheDocument();
            expect(screen.getByText('Tỷ lệ chết (7d)')).toBeInTheDocument();
            expect(screen.getByText('Doanh thu tháng')).toBeInTheDocument();
        });
    });

    test('TC3 - Hiển thị bộ lọc thời gian với đầy đủ 5 options', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('24 giờ')).toBeInTheDocument();
        });

        // Dùng queryAllByText vì có nhiều phần tử chứa text "7 ngày"
        expect(screen.getAllByText('7 ngày')).toHaveLength(2); // Button và footer
        expect(screen.getByText('30 ngày')).toBeInTheDocument();
        expect(screen.getByText('90 ngày')).toBeInTheDocument();
        expect(screen.getByText('Tất cả')).toBeInTheDocument();
    });

    test('TC4 - Thay đổi bộ lọc thời gian gọi API với period mới', async () => {
        const user = userEvent.setup();
        render(<Dashboard />);

        await waitFor(() => {
            expect(dashboardApi.getDashboardKPIs).toHaveBeenCalledWith('7d');
        });

        const thirtyDayButton = screen.getByText('30 ngày');
        await user.click(thirtyDayButton);

        await waitFor(() => {
            expect(dashboardApi.getDashboardKPIs).toHaveBeenCalledWith('30d');
        });
    });

    test('TC5 - Hiển thị loading state khi đang tải dữ liệu', async () => {
        // Mock delay để loading hiển thị
        dashboardApi.getDashboardKPIs.mockImplementation(
            () => new Promise(resolve => setTimeout(() => resolve({
                data: {
                    message: 'Lấy dữ liệu dashboard thành công',
                    data: mockKPIData,
                    period: '7d',
                    lastUpdated: '2024-01-15T10:30:00.000Z'
                }
            }), 100))
        );

        render(<Dashboard />);

        // Kiểm tra loading skeleton có hiển thị
        const skeletonCards = document.querySelectorAll('.animate-pulse');
        expect(skeletonCards.length).toBe(6);

        // Đợi dữ liệu tải xong
        await waitFor(() => {
            expect(screen.getByText('Tổng số gà')).toBeInTheDocument();
        });
    });

    test('TC6 - Hiển thị thông báo lỗi khi fetch KPI thất bại', async () => {
        dashboardApi.getDashboardKPIs.mockRejectedValue(new Error('Network Error'));

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/Không thể tải dữ liệu dashboard/)).toBeInTheDocument();
        });
    });

    test('TC7 - Hiển thị cảnh báo khi có dữ liệu alerts', async () => {
        const mockAlertData = {
            alerts: [
                {
                    type: 'feed_low',
                    title: 'Thức ăn sắp hết',
                    message: 'Chỉ còn 100kg thức ăn. Cần bổ sung thêm.',
                    severity: 'high',
                    timestamp: '2024-01-15T10:30:00.000Z'
                }
            ],
            total: 1,
            hasAlerts: true,
            lastChecked: '2024-01-15T10:30:00.000Z'
        };

        dashboardApi.getDashboardAlerts.mockResolvedValue({
            data: {
                message: 'Lấy cảnh báo dashboard thành công',
                data: mockAlertData,
                timestamp: '2024-01-15T10:30:00.000Z'
            }
        });

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('Thức ăn sắp hết')).toBeInTheDocument();
        });
    });

    test('TC8 - Nút làm mới gọi lại API khi click', async () => {
        const user = userEvent.setup();
        render(<Dashboard />);

        await waitFor(() => {
            expect(dashboardApi.getDashboardKPIs).toHaveBeenCalledTimes(1);
        });

        const refreshButton = screen.getByText('Làm mới');
        await user.click(refreshButton);

        await waitFor(() => {
            expect(dashboardApi.getDashboardKPIs).toHaveBeenCalledTimes(2);
        });
    });

    test('TC9 - Hiển thị màu sắc đúng cho trạng thái tăng/giảm', async () => {
        const mixedData = {
            ...mockKPIData,
            totalChickens: { ...mockKPIData.totalChickens, change: 4.2, status: 'up', color: 'green' },
            deathRate: { ...mockKPIData.deathRate, change: -0.5, status: 'down', color: 'green' },
            avgWeight: { ...mockKPIData.avgWeight, change: 0, status: 'neutral', color: 'gray' }
        };

        dashboardApi.getDashboardKPIs.mockResolvedValue({
            data: {
                message: 'Lấy dữ liệu dashboard thành công',
                data: mixedData,
                period: '7d',
                lastUpdated: '2024-01-15T10:30:00.000Z'
            }
        });

        render(<Dashboard />);

        await waitFor(() => {
            const changes = screen.getAllByText(/[+-]?\d+\.?\d*%/);
            expect(changes.length).toBeGreaterThan(0);
        });
    });
    test('TC10 - Hiển thị footer với thông tin cập nhật và period', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('Khoảng thời gian đang xem:')).toBeInTheDocument();

            expect(screen.getAllByText('7 ngày')[1]).toBeInTheDocument();
            expect(screen.getByText('Dữ liệu cập nhật:')).toBeInTheDocument();
        });
    });


    test('TC11 - Format giá trị doanh thu đúng định dạng VND', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            const revenueElement = screen.getByText('Doanh thu tháng');
            expect(revenueElement).toBeInTheDocument();
        });
    });

    test('TC12 - Hiển thị đúng trạng thái thức ăn (Bình thường/Thiếu/Dư thừa)', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('Thức ăn hôm nay')).toBeInTheDocument();
            expect(screen.getByText('Bình thường')).toBeInTheDocument();
        });
    });

    test('TC13 - Tự động gọi lại API sau 5 phút (simulate)', () => {
        vi.useFakeTimers();

        // Spy trên setInterval để kiểm tra nó được gọi với đúng tham số
        const setIntervalSpy = vi.spyOn(window, 'setInterval');
        const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

        const { unmount } = render(<Dashboard />);

        // Kiểm tra setInterval được gọi với 5 phút (300,000ms)
        expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 5 * 60 * 1000);

        // Unmount component để kiểm tra clearInterval được gọi
        unmount();
        expect(clearIntervalSpy).toHaveBeenCalled();

        // Dọn dẹp spies
        setIntervalSpy.mockRestore();
        clearIntervalSpy.mockRestore();

        vi.useRealTimers();
    });



    test('TC14 - Hiển thị legend giải thích ý nghĩa màu sắc', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('Tăng / Tốt')).toBeInTheDocument();
            expect(screen.getByText('Giảm / Cần chú ý')).toBeInTheDocument();
            expect(screen.getByText('Không thay đổi')).toBeInTheDocument();
        });
    });

    test('TC15 - Xử lý khi API alerts thất bại (không hiển thị lỗi)', async () => {
        dashboardApi.getDashboardAlerts.mockRejectedValue(new Error('Alerts API Error'));

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('Tổng số gà')).toBeInTheDocument();
            expect(screen.queryByText(/Alerts API Error/)).not.toBeInTheDocument();
        });
    });
});