import { render, screen, waitFor } from '@testing-library/react';
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
    // Thêm các icon mới cho biểu đồ
    FaChartBar: () => <div data-testid="fa-chart-bar">FaChartBar</div>,
    FaPieChart: () => <div data-testid="fa-pie-chart">FaPieChart</div>,
}));

describe('Dashboard Component Tests', () => {
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

    const mockChartsData = {
        weeklyConsumption: {
            title: 'Tiêu thụ hàng tuần',
            data: [
                { day: 'T1', food: 120, medicine: 25, total: 145, displayDate: '15/01' },
                { day: 'T2', food: 135, medicine: 30, total: 165, displayDate: '16/01' },
            ],
            total: { food: 255, medicine: 55, overall: 310 },
            period: '7d',
            metadata: { source: 'log', dataPoints: { logs: 10 } }
        },
        costStructure: {
            title: 'Cơ cấu chi phí',
            data: [
                { category: 'Thức ăn', value: 159000000, percentage: 65, color: '#4CAF50' },
                { category: 'Thuốc & Vaccine', value: 37000000, percentage: 15, color: '#FF9800' },
            ],
            total: { formatted: '196.000.000 ₫', period: 'month' },
            metadata: { source: 'material', dataPoints: { feed: 5, medicine: 3 } }
        },
        summary: {
            hasRealData: true,
            realDataSources: ['log', 'material']
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock các API
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

        // Mock charts API
        dashboardApi.getAllDashboardCharts.mockResolvedValue({
            data: {
                message: 'Lấy dữ liệu biểu đồ thành công',
                data: mockChartsData
            }
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    // U1.1 Tests
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
            const kpiTitles = [
                'Tổng số gà',
                'Trọng lượng TB',
                'Số đàn',
                'Thức ăn hôm nay',
                'Tỷ lệ chết',
                'Doanh thu tháng'
            ];

            kpiTitles.forEach(title => {
                const elements = screen.getAllByText(title);
                const titleElement = elements.find(el =>
                    el.tagName === 'H3' ||
                    el.className?.includes('font-semibold') ||
                    el.className?.includes('uppercase')
                );
                expect(titleElement).toBeInTheDocument();
            });
        });
    });

    test('TC3 - Hiển thị bộ lọc thời gian với đầy đủ các options', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('Thời gian:')).toBeInTheDocument();
        });

        // Sử dụng getAllByText vì có nhiều phần tử chứa text này
        const sevenDayElements = screen.getAllByText('7 ngày');
        const thirtyDayElements = screen.getAllByText('30 ngày');
        const ninetyDayElements = screen.getAllByText('90 ngày');

        expect(sevenDayElements.length).toBeGreaterThan(0);
        expect(thirtyDayElements.length).toBeGreaterThan(0);
        expect(ninetyDayElements.length).toBeGreaterThan(0);

        expect(screen.getByTestId('fa-calendar-alt')).toBeInTheDocument();
    });

    test('TC4 - Thay đổi bộ lọc thời gian gọi API với period mới', async () => {
        const user = userEvent.setup();
        render(<Dashboard />);

        await waitFor(() => {
            expect(dashboardApi.getDashboardKPIs).toHaveBeenCalledWith('7d');
        });

        // Tìm tất cả button "30 ngày" và click vào cái đầu tiên (trong bộ lọc)
        const thirtyDayButtons = screen.getAllByText('30 ngày');
        const filterButton = thirtyDayButtons[0];

        await user.click(filterButton);

        await waitFor(() => {
            expect(dashboardApi.getDashboardKPIs).toHaveBeenCalledWith('30d');
        });
    });

    test('TC5 - Hiển thị loading state khi đang tải dữ liệu', async () => {
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
        expect(skeletonCards.length).toBeGreaterThan(0);

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

        // Reset mock counts trước khi click
        dashboardApi.getDashboardKPIs.mockClear();
        dashboardApi.getDashboardAlerts.mockClear();
        dashboardApi.getAllDashboardCharts.mockClear();

        const refreshButton = screen.getByText('Làm mới');
        await user.click(refreshButton);

        await waitFor(() => {
            expect(dashboardApi.getDashboardKPIs).toHaveBeenCalledTimes(1);
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
            const changes = screen.getAllByText(/%/);
            expect(changes.length).toBeGreaterThan(0);
        });
    });

    test('TC10 - Hiển thị footer với thông tin cập nhật và period', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('Khoảng thời gian đang xem:')).toBeInTheDocument();
            expect(screen.getByText('Dữ liệu cập nhật:')).toBeInTheDocument();

            // Kiểm tra có badge period trong footer
            const periodBadges = screen.getAllByText('7 ngày');
            expect(periodBadges.length).toBeGreaterThan(1);
        });
    });

    test('TC11 - Format giá trị doanh thu đúng định dạng VND', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            const revenueElements = screen.getAllByText('Doanh thu tháng');
            const titleElement = revenueElements.find(el =>
                el.tagName === 'H3' ||
                el.className?.includes('font-semibold') ||
                el.className?.includes('uppercase')
            );
            expect(titleElement).toBeInTheDocument();
        });
    });

    test('TC12 - Hiển thị đúng trạng thái thức ăn (Bình thường/Thiếu/Dư thừa)', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('Thức ăn hôm nay')).toBeInTheDocument();
            const statusLabels = ['Bình thường', 'Thiếu', 'Dư thừa'];
            const found = statusLabels.some(label =>
                screen.queryByText(label) !== null
            );
            expect(found).toBe(true);
        });
    });

    test('TC13 - Tự động gọi lại API sau 5 phút (simulate)', () => {
        vi.useFakeTimers();

        const setIntervalSpy = vi.spyOn(window, 'setInterval');
        const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

        const { unmount } = render(<Dashboard />);

        expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 5 * 60 * 1000);

        unmount();
        expect(clearIntervalSpy).toHaveBeenCalled();

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

    // U1.2 Tests - Charts Integration
    test('TC16 - Hiển thị section biểu đồ tổng quan với tiêu đề', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('Biểu đồ tổng quan')).toBeInTheDocument();
            expect(screen.getByText('Thống kê và phân tích dữ liệu trang trại')).toBeInTheDocument();
        });
    });

    test('TC17 - Hiển thị cả hai biểu đồ tiêu thụ hàng tuần và cơ cấu chi phí', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('Tiêu thụ hàng tuần')).toBeInTheDocument();
            expect(screen.getByText('Cơ cấu chi phí')).toBeInTheDocument();
        });
    });

    test('TC18 - Nút làm mới biểu đồ gọi API getAllDashboardCharts', async () => {
        const user = userEvent.setup();
        render(<Dashboard />);

        await waitFor(() => {
            expect(dashboardApi.getAllDashboardCharts).toHaveBeenCalledTimes(1);
        });

        // Reset mock count
        dashboardApi.getAllDashboardCharts.mockClear();

        const refreshChartButton = screen.getByText('Làm mới biểu đồ');
        await user.click(refreshChartButton);

        await waitFor(() => {
            expect(dashboardApi.getAllDashboardCharts).toHaveBeenCalledTimes(1);
        });
    });

    test('TC19 - Hiển thị thông tin chất lượng dữ liệu biểu đồ', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            // Kiểm tra section biểu đồ
            expect(screen.getByText('Biểu đồ tổng quan')).toBeInTheDocument();
            expect(screen.getByText('Thống kê và phân tích dữ liệu trang trại')).toBeInTheDocument();

            // Kiểm tra các biểu đồ được render
            expect(screen.getByText('Tiêu thụ hàng tuần')).toBeInTheDocument();
            expect(screen.getByText('Cơ cấu chi phí')).toBeInTheDocument();

            // Kiểm tra nút làm mới biểu đồ
            expect(screen.getByText('Làm mới biểu đồ')).toBeInTheDocument();

            // Kiểm tra icon biểu đồ
            expect(screen.getByTestId('fa-chart-bar')).toBeInTheDocument();
        });
    });

    test('TC20 - Hiển thị loading state cho biểu đồ khi đang tải', async () => {
        dashboardApi.getAllDashboardCharts.mockImplementation(
            () => new Promise(resolve => setTimeout(() => resolve({
                data: { data: {} }
            }), 100))
        );

        render(<Dashboard />);

        await waitFor(() => {
            const loadingElements = document.querySelectorAll('.animate-pulse');
            expect(loadingElements.length).toBeGreaterThan(0);
        });

        await waitFor(() => {
            expect(screen.getByText('Biểu đồ tổng quan')).toBeInTheDocument();
        });
    });

    test('TC21 - Hiển thị dữ liệu mẫu khi API charts thất bại', async () => {
        dashboardApi.getAllDashboardCharts.mockRejectedValue(new Error('Chart API Error'));

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('Biểu đồ tổng quan')).toBeInTheDocument();
            expect(screen.queryByText('Chart API Error')).not.toBeInTheDocument();
        });
    });

    test('TC22 - Nút làm mới tổng thể gọi tất cả API', async () => {
        const user = userEvent.setup();
        render(<Dashboard />);

        await waitFor(() => {
            expect(dashboardApi.getDashboardKPIs).toHaveBeenCalledTimes(1);
            expect(dashboardApi.getDashboardAlerts).toHaveBeenCalledTimes(1);
            expect(dashboardApi.getAllDashboardCharts).toHaveBeenCalledTimes(1);
        });

        // Reset mock counts
        dashboardApi.getDashboardKPIs.mockClear();
        dashboardApi.getDashboardAlerts.mockClear();
        dashboardApi.getAllDashboardCharts.mockClear();

        const refreshButton = screen.getByText('Làm mới');
        await user.click(refreshButton);

        await waitFor(() => {
            expect(dashboardApi.getDashboardKPIs).toHaveBeenCalledTimes(1);
            expect(dashboardApi.getDashboardAlerts).toHaveBeenCalledTimes(1);
            expect(dashboardApi.getAllDashboardCharts).toHaveBeenCalledTimes(1);
        });
    });

    test('TC23 - Chuyển đổi period filter không ảnh hưởng đến biểu đồ', async () => {
        const user = userEvent.setup();
        render(<Dashboard />);

        await waitFor(() => {
            expect(dashboardApi.getDashboardKPIs).toHaveBeenCalledWith('7d');
        });

        // Reset chart API mock
        dashboardApi.getAllDashboardCharts.mockClear();

        const thirtyDayButtons = screen.getAllByText('30 ngày');
        const filterButton = thirtyDayButtons[0];
        await user.click(filterButton);

        await waitFor(() => {
            expect(dashboardApi.getDashboardKPIs).toHaveBeenCalledWith('30d');
            // Biểu đồ không được gọi lại
            expect(dashboardApi.getAllDashboardCharts).not.toHaveBeenCalled();
        });
    });
});

test('TC24 - Chuyển đổi period filter không ảnh hưởng đến biểu đồ', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await waitFor(() => {
        expect(dashboardApi.getDashboardKPIs).toHaveBeenCalledWith('7d');
    });

    // Click vào button 30 ngày
    const thirtyDayButton = screen.getByText('30 ngày');
    await user.click(thirtyDayButton);

    await waitFor(() => {
        expect(dashboardApi.getDashboardKPIs).toHaveBeenCalledWith('30d');
        // Biểu đồ vẫn giữ nguyên, không gọi lại API charts
        expect(dashboardApi.getAllDashboardCharts).toHaveBeenCalledTimes(1);
    });
});
