import { dashboardService } from "../../services/dashboard.service.js";

vi.mock("../../services/flock.service.js", () => ({
  flockService: {
    getAllFlocks: vi.fn().mockResolvedValue([
      {
        _id: "1",
        initialCount: 1000,
        currentCount: 950,
        avgWeight: 1.8,
        status: "Raising",
        speciesId: "ri",
        areaId: "khu-a",
        ownerId: "user1",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: null
      },
      {
        _id: "2",
        initialCount: 800,
        currentCount: 780,
        avgWeight: 2.1,
        status: "Raising",
        speciesId: "tam-hoang",
        areaId: "khu-b",
        ownerId: "user1",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: null
      }
    ])
  }
}));

vi.mock("../../services/material.service.js", () => ({
  materialService: {
    getFeedInfoForDashboard: vi.fn().mockResolvedValue({
      value: 850,
      unit: "kg",
      status: "normal",
      label: "Bình thường",
      threshold: { LOW: 500, NORMAL: 800, HIGH: 1200 },
      source: "mock"
    })
  }
}));

describe("Dashboard Service", () => {
  // Reset mocks trước mỗi test
  beforeEach(() => {
    vi.clearAllMocks();
    // Set test environment
    process.env.NODE_ENV = 'test';
  });

  describe("getDashboardKPIs", () => {
    it("nên trả về tất cả dữ liệu KPI cho khoảng thời gian 7 ngày", async () => {
      const kpis = await dashboardService.getDashboardKPIs("7d");

      // Kiểm tra cấu trúc KPI
      expect(kpis).toHaveProperty("totalChickens");
      expect(kpis).toHaveProperty("totalFlocks");
      expect(kpis).toHaveProperty("deathRate");
      expect(kpis).toHaveProperty("avgWeight");
      expect(kpis).toHaveProperty("todayFeed");
      expect(kpis).toHaveProperty("monthlyRevenue");
      expect(kpis).toHaveProperty("period", "7d");
      expect(kpis).toHaveProperty("calculatedAt");

      // Kiểm tra từng KPI có đủ fields cần thiết
      const kpiKeys = ["totalChickens", "totalFlocks", "deathRate", "avgWeight", "todayFeed", "monthlyRevenue"];

      kpiKeys.forEach(kpiKey => {
        expect(kpis[kpiKey]).toHaveProperty("value");
        expect(kpis[kpiKey]).toHaveProperty("change");
        expect(kpis[kpiKey]).toHaveProperty("status");
        expect(kpis[kpiKey]).toHaveProperty("description");
      });

      // Kiểm tra cụ thể KPI todayFeed có change
      expect(kpis.todayFeed.change).toBeDefined();
      expect(typeof kpis.todayFeed.change).toBe("number");
    });

    it("nên xử lý các khoảng thời gian khác nhau chính xác", async () => {
      const periods = ["24h", "7d", "30d", "90d", "all"];

      for (const period of periods) {
        const kpis = await dashboardService.getDashboardKPIs(period);
        expect(kpis.period).toBe(period);

        // Đảm bảo tất cả KPI đều có change
        expect(kpis.todayFeed.change).toBeDefined();
      }
    });
  });

  describe("getTrendData", () => {
    it("nên trả về dữ liệu xu hướng cho biểu đồ trọng lượng", async () => {
      const trendData = await dashboardService.getTrendData("7d", "weight");

      expect(trendData).toHaveProperty("data");
      expect(trendData).toHaveProperty("period", "7d");
      expect(trendData).toHaveProperty("chartType", "weight");
      expect(trendData).toHaveProperty("unit", "kg/con");
      expect(Array.isArray(trendData.data)).toBe(true);
      expect(trendData.data.length).toBeGreaterThan(0);
    });

    it("nên xử lý các loại biểu đồ khác nhau", async () => {
      const chartTypes = ["weight", "feed", "revenue", "death"];

      for (const chartType of chartTypes) {
        const trendData = await dashboardService.getTrendData("30d", chartType);
        expect(trendData.chartType).toBe(chartType);
        expect(Array.isArray(trendData.data)).toBe(true);
      }
    });
  });

  describe("getDashboardAlerts", () => {
    it("nên trả về cấu trúc cảnh báo", async () => {
      const alerts = await dashboardService.getDashboardAlerts();

      expect(alerts).toHaveProperty("alerts");
      expect(alerts).toHaveProperty("total");
      expect(alerts).toHaveProperty("hasAlerts");
      expect(alerts).toHaveProperty("lastChecked");
      expect(Array.isArray(alerts.alerts)).toBe(true);
    });
  });

  describe("Các Hàm Helper", () => {
    it("nên xác định trạng thái thay đổi chính xác", () => {
      expect(dashboardService._getChangeStatus(5)).toBe("up");
      expect(dashboardService._getChangeStatus(-5)).toBe("down");
      expect(dashboardService._getChangeStatus(0)).toBe("neutral");
      expect(dashboardService._getChangeStatus(0.05)).toBe("neutral");
    });

    it("nên xác định trạng thái thức ăn chính xác", () => {
      expect(dashboardService._getFeedStatus(400)).toEqual({
        status: "low",
        label: "Thiếu",
        color: "red"
      });
      expect(dashboardService._getFeedStatus(900)).toEqual({
        status: "normal",
        label: "Bình thường",
        color: "green"
      });
      expect(dashboardService._getFeedStatus(1300)).toEqual({
        status: "high",
        label: "Dư thừa",
        color: "orange"
      });
    });

    it("nên định dạng tiền tệ chính xác", () => {
      const formatted = dashboardService._formatCurrency(245000000);
      expect(formatted).toContain("₫");
      expect(formatted).toContain("245");
    });
  });

  describe("Logic Tỷ Lệ Chết", () => {
    it("nên hiển thị màu xanh và mũi tên xuống khi tỷ lệ chết giảm", async () => {
      // Test với change âm
      const originalMockData = dashboardService.config.MOCK_DATA;
      dashboardService.config.MOCK_DATA = {
        ...originalMockData,
        DEATH_RATE_7D: 2.0,
        DEATH_RATE_CHANGE: -0.5
      };

      const result = await dashboardService._getDeathRateData("7d");

      expect(result.status).toBe("down");
      expect(result.color).toBe("green");
      expect(result.trend).toBe("improving");

      // Khôi phục mock data
      dashboardService.config.MOCK_DATA = originalMockData;
    });

    it("nên hiển thị màu đỏ và mũi tên lên khi tỷ lệ chết tăng", async () => {
      // Test với change dương
      const originalMockData = dashboardService.config.MOCK_DATA;
      dashboardService.config.MOCK_DATA = {
        ...originalMockData,
        DEATH_RATE_7D: 2.5,
        DEATH_RATE_CHANGE: 1.2
      };

      const result = await dashboardService._getDeathRateData("7d");

      expect(result.status).toBe("up");
      expect(result.color).toBe("red");
      expect(result.trend).toBe("worsening");

      // Khôi phục mock data
      dashboardService.config.MOCK_DATA = originalMockData;
    });
  });
});