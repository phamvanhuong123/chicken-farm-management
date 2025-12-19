import { dashboardService } from "../../services/dashboard.service";

// Mock các service phụ thuộc
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
    it("should return all KPI data for 7d period", async () => {
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

    it("should handle different periods correctly", async () => {
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
    it("should return trend data for weight chart", async () => {
      const trendData = await dashboardService.getTrendData("7d", "weight");

      expect(trendData).toHaveProperty("data");
      expect(trendData).toHaveProperty("period", "7d");
      expect(trendData).toHaveProperty("chartType", "weight");
      expect(trendData).toHaveProperty("unit", "kg/con");
      expect(Array.isArray(trendData.data)).toBe(true);
      expect(trendData.data.length).toBeGreaterThan(0);
    });

    it("should handle different chart types", async () => {
      const chartTypes = ["weight", "feed", "revenue", "death"];

      for (const chartType of chartTypes) {
        const trendData = await dashboardService.getTrendData("30d", chartType);
        expect(trendData.chartType).toBe(chartType);
        expect(Array.isArray(trendData.data)).toBe(true);
      }
    });
  });

  describe("getDashboardAlerts", () => {
    it("should return alerts structure", async () => {
      const alerts = await dashboardService.getDashboardAlerts();

      expect(alerts).toHaveProperty("alerts");
      expect(alerts).toHaveProperty("total");
      expect(alerts).toHaveProperty("hasAlerts");
      expect(alerts).toHaveProperty("lastChecked");
      expect(Array.isArray(alerts.alerts)).toBe(true);
    });
  });

  describe("Helper Functions", () => {
    it("should correctly determine change status", () => {
      expect(dashboardService._getChangeStatus(5)).toBe("up");
      expect(dashboardService._getChangeStatus(-5)).toBe("down");
      expect(dashboardService._getChangeStatus(0)).toBe("neutral");
      expect(dashboardService._getChangeStatus(0.05)).toBe("neutral");
    });

    it("should correctly determine feed status", () => {
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

    it("should format currency correctly", () => {
      const formatted = dashboardService._formatCurrency(245000000);
      expect(formatted).toContain("₫");
      expect(formatted).toContain("245");
    });
  });

  describe("Death Rate Logic", () => {
    it("should show green and down arrow when death rate decreases", () => {
      // Test với change âm
      const result = dashboardService._getDeathRateStatus(-0.5);
      expect(result.status).toBe("down");
      expect(result.color).toBe("green");
      expect(result.trend).toBe("improving");
    });

    it("should show red and up arrow when death rate increases", () => {
      // Test với change dương
      const result = dashboardService._getDeathRateStatus(1.2);
      expect(result.status).toBe("up");
      expect(result.color).toBe("red");
      expect(result.trend).toBe("worsening");
    });
  });
});