import { dashboardService } from '../../services/dashboard.service.js';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock các service
vi.mock("../../services/flock.service.js", () => ({
  flockService: {
    getAllFlocks: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("../../services/material.service.js", () => ({
  materialService: {
    getFeedInfoForDashboard: vi.fn().mockResolvedValue({
      source: 'material_service',
      value: 950,
      unit: 'kg',
      status: 'normal',
      label: 'Bình thường',
      threshold: { LOW: 500, NORMAL: 800, HIGH: 1200 },
      change: 0,
      materialCount: 3,
      note: 'Tổng hợp từ 3 loại thức ăn'
    }),
  },
}));

vi.mock("../../services/log.service.js", () => ({
  logService: {
    getAllLogs: vi.fn().mockResolvedValue([
      {
        _id: "1",
        type: "FOOD",
        quantity: 150,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        flockId: "1"
      },
      {
        _id: "2",
        type: "FOOD",
        quantity: 120,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        flockId: "1"
      },
      {
        _id: "3",
        type: "MEDICINE",
        quantity: 5,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        flockId: "1"
      },
      {
        _id: "4",
        type: "VACCINE",
        quantity: 3,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        flockId: "1"
      },
    ]),
    getLogsByTypeAndTimeRange: vi.fn().mockResolvedValue([]),
    getAlertsFromLogs: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("../../services/finance.service.js", () => ({
  financeService: {
    getFinancialOverview: vi.fn().mockResolvedValue({
      totalIncome: 245000000,
      totalExpense: 200000000,
      profit: 45000000,
      profitMargin: 18.37
    }),
    getExpenseBreakdown: vi.fn().mockResolvedValue([
      { category: "Thức ăn", amount: 100000000, percentage: 50 },
      { category: "Thuốc", amount: 30000000, percentage: 15 },
      { category: "Nhân công", amount: 40000000, percentage: 20 },
      { category: "Điện nước", amount: 20000000, percentage: 10 },
      { category: "Chi phí khác", amount: 10000000, percentage: 5 },
    ]),
    getFinancialTrend: vi.fn().mockResolvedValue([]),
  },
}));

describe('Unit Test: Dashboard Chart Service (U1.2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });


  describe('Biểu đồ Tiêu thụ hàng tuần', () => {
    it('TestCase 1: Thành công - Trả về dữ liệu biểu đồ tiêu thụ hàng tuần (Stacked Column)', async () => {
      const data = await dashboardService.getWeeklyConsumptionChart();

      expect(data).toHaveProperty('chartType', 'stacked_column');
      expect(data).toHaveProperty('title', 'Tiêu thụ hàng tuần');
      expect(data).toHaveProperty('period', '7d');

      // Kiểm tra có đủ 7 ngày
      expect(data.data).toHaveLength(7);

      // Kiểm tra mỗi ngày có đủ các trường cần thiết
      data.data.forEach(item => {
        expect(item).toHaveProperty('day');
        expect(item).toHaveProperty('food');
        expect(item).toHaveProperty('medicine');
        expect(item).toHaveProperty('total');
        expect(item).toHaveProperty('date');
        expect(item.food).toBeGreaterThanOrEqual(0);
        expect(item.medicine).toBeGreaterThanOrEqual(0);
        expect(item.total).toBeGreaterThanOrEqual(0);
      });

      // Kiểm tra series
      expect(data.series).toHaveLength(2);
      expect(data.series[0]).toMatchObject({
        name: 'Thức ăn',
        key: 'food',
        color: '#4CAF50',
        unit: 'kg'
      });

      // Kiểm tra tổng
      expect(data.total).toBeDefined();
      expect(data.total.overall).toBeGreaterThanOrEqual(0);
      expect(data.total.food).toBeGreaterThanOrEqual(0);
      expect(data.total.medicine).toBeGreaterThanOrEqual(0);
    });
  });


  describe('Biểu đồ Cơ cấu chi phí', () => {
    it('TestCase 2: Thành công - Trả về dữ liệu biểu đồ phân bổ chi phí (Cost Structure)', async () => {
      const data = await dashboardService.getCostStructureChart();

      expect(data).toHaveProperty('chartType', 'cost_structure');
      expect(data).toHaveProperty('title', 'Cơ cấu chi phí');
      expect(data).toHaveProperty('displayType', 'pie');

      // Kiểm tra có dữ liệu và cấu trúc đúng
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data.length).toBeGreaterThan(0);

      data.data.forEach(item => {
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('value');
        expect(item).toHaveProperty('percentage');
        expect(item).toHaveProperty('color');
        expect(item).toHaveProperty('formattedValue');
        expect(item.value).toBeGreaterThanOrEqual(0);
        expect(item.percentage).toBeGreaterThanOrEqual(0);
      });

      expect(data.total).toBeDefined();
      expect(data.total).toHaveProperty('value');
      expect(data.total).toHaveProperty('formatted');
      expect(data.total.value).toBeGreaterThanOrEqual(0);
    });
  });


  describe('Lấy tất cả biểu đồ', () => {
    it('TestCase 3: Thành công - Trả về tổng hợp tất cả biểu đồ cho Dashboard', async () => {
      const data = await dashboardService.getDashboardCharts();

      expect(data).toHaveProperty('weeklyConsumption');
      expect(data).toHaveProperty('costStructure');
      expect(data).toHaveProperty('period', 'current');

      // Kiểm tra biểu đồ tiêu thụ hàng tuần
      expect(data.weeklyConsumption.chartType).toBe('stacked_column');
      expect(data.weeklyConsumption.data).toHaveLength(7);

      // Kiểm tra biểu đồ cơ cấu chi phí
      expect(data.costStructure.chartType).toBe('cost_structure');
      expect(data.costStructure.data.length).toBeGreaterThan(0);

      expect(data.summary).toBeDefined();
    });
  });
});