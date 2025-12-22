import { dashboardService } from "../../services/dashboard.service.js";
import { vi, describe, it, expect, beforeEach } from "vitest";

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
        updatedAt: null,
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
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ]),
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
    getTotalQuantityByTypeAndPeriod: vi.fn().mockImplementation((type, startDate, endDate) => {
      if (type === "DEATH") {
        const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
        if (daysDiff <= 7) return Promise.resolve(20);
        if (daysDiff <= 30) return Promise.resolve(50);
        return Promise.resolve(100);
      }
      return Promise.resolve(0);
    }),
    getTrendDataForDashboard: vi.fn().mockImplementation((chartType, period) => {
      const mockData = [];
      const now = new Date();
      let dataPoints = 7;
      if (period === "30d") dataPoints = 30;
      if (period === "90d") dataPoints = 12;

      if (["weight", "death", "feed"].includes(chartType)) {
        for (let i = dataPoints - 1; i >= 0; i--) {
          const date = new Date(now);
          if (period === "90d") {
            date.setDate(date.getDate() - i * 7);
          } else {
            date.setDate(date.getDate() - i);
          }

          let value;
          switch (chartType) {
            case "weight": value = 1.5 + Math.random() * 0.5; break;
            case "death": value = Math.random() * 5; break;
            case "feed": value = 500 + Math.random() * 500; break;
            default: value = Math.random() * 100;
          }

          mockData.push({
            date: date.toISOString().split("T")[0],
            value: parseFloat(value.toFixed(2)),
          });
        }
      }
      return Promise.resolve(mockData);
    }),
    getAlertsFromLogs: vi.fn().mockResolvedValue([
      {
        type: "high_death_rate",
        title: "Tỷ lệ chết cao",
        message: "Có 20 con gà chết trong 7 ngày qua. Cần kiểm tra sức khỏe đàn.",
        severity: "high",
        timestamp: new Date().toISOString(),
        source: "log",
      },
    ]),
  },
}));

describe("Dashboard Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = "test";

    dashboardService.config.MOCK_DATA = {
      DAILY_FEED: 850,
      DAILY_FEED_CHANGE: 0,
      MONTHLY_REVENUE: 245000000,
      REVENUE_CHANGE: 123,
      DEATH_RATE_7D: 2.1,
      DEATH_RATE_CHANGE: -0.5,
      AVG_WEIGHT_CHANGE: 42,
      MOCK_FLOCKS: [
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
          updatedAt: null,
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
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      ],
    };
  });

  describe("getDashboardKPIs", () => {
    it("nên trả về tất cả dữ liệu KPI cho khoảng thời gian 7 ngày", async () => {
      const kpis = await dashboardService.getDashboardKPIs("7d");

      expect(kpis).toHaveProperty("totalChickens");
      expect(kpis).toHaveProperty("totalFlocks");
      expect(kpis).toHaveProperty("deathRate");
      expect(kpis).toHaveProperty("avgWeight");
      expect(kpis).toHaveProperty("todayFeed");
      expect(kpis).toHaveProperty("monthlyRevenue");
      expect(kpis).toHaveProperty("period", "7d");
      expect(kpis).toHaveProperty("calculatedAt");

      const kpiKeys = [
        "totalChickens",
        "totalFlocks",
        "deathRate",
        "avgWeight",
        "todayFeed",
        "monthlyRevenue",
      ];

      kpiKeys.forEach((kpiKey) => {
        expect(kpis[kpiKey]).toHaveProperty("value");
        expect(kpis[kpiKey]).toHaveProperty("change");
        expect(kpis[kpiKey]).toHaveProperty("status");
        expect(kpis[kpiKey]).toHaveProperty("description");
      });

      expect(kpis.todayFeed.source).toBe("material_service");
      expect(kpis.todayFeed.value).toBe(950);
      expect(kpis.todayFeed.period).toBe("today");
      expect(kpis.monthlyRevenue.period).toBe("month");
    });

    it("nên xử lý các khoảng thời gian hợp lệ", async () => {
      const periods = ["7d", "30d", "90d", "all"];

      for (const period of periods) {
        const kpis = await dashboardService.getDashboardKPIs(period);
        expect(kpis.period).toBe(period);
        expect(kpis.todayFeed.period).toBe("today");
        expect(kpis.monthlyRevenue.period).toBe("month");
        expect(kpis.deathRate).toHaveProperty("totalDeath");
        expect(kpis.deathRate).toHaveProperty("totalChickens");
      }
    });
  });

  describe("_filterFlocksByPeriod", () => {
    it("nên filter flocks theo period dựa trên updatedAt nếu có", () => {
      const flocks = [
        {
          _id: "1",
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 ngày trước - NẰM TRONG 7 ngày
        },
        {
          _id: "2",
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 ngày trước - NẰM TRONG
        },
        {
          _id: "3",
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 ngày trước - NẰM TRONG
          updatedAt: null,
        },
      ];

      const filtered7d = dashboardService._filterFlocksByPeriod(flocks, "7d");
      expect(filtered7d.length).toBe(3); // THAY ĐỔI TỪ 2 THÀNH 3
      expect(filtered7d.map(f => f._id)).toEqual(["1", "2", "3"]); // THÊM "1"

      const filtered30d = dashboardService._filterFlocksByPeriod(flocks, "30d");
      expect(filtered30d.length).toBe(3);

      const filteredAll = dashboardService._filterFlocksByPeriod(flocks, "all");
      expect(filteredAll.length).toBe(3);
    });
  });

  describe("Feed Data from Material Service", () => {
    it("nên lấy dữ liệu thức ăn từ material service", async () => {
      const { materialService } = await import("../../services/material.service.js");

      const kpis = await dashboardService.getDashboardKPIs("7d");

      expect(materialService.getFeedInfoForDashboard).toHaveBeenCalled();
      expect(kpis.todayFeed.source).toBe("material_service");
      expect(kpis.todayFeed.value).toBe(950);
      expect(kpis.todayFeed.unit).toBe("kg");
      expect(kpis.todayFeed.period).toBe("today");
      expect(kpis.todayFeed.materialCount).toBe(3);
    });

    it("nên xử lý khi material service trả về fallback", async () => {
      const { materialService } = await import("../../services/material.service.js");

      materialService.getFeedInfoForDashboard.mockResolvedValueOnce({
        source: "fallback",
        note: "Không có dữ liệu"
      });

      const kpis = await dashboardService.getDashboardKPIs("7d");

      expect(kpis.todayFeed.source).toBe("mock");
      expect(kpis.todayFeed.value).toBe(850);
    });

    it("nên xử lý lỗi từ material service", async () => {
      const { materialService } = await import("../../services/material.service.js");

      materialService.getFeedInfoForDashboard.mockRejectedValueOnce(
        new Error("Material service unavailable")
      );

      const kpis = await dashboardService.getDashboardKPIs("7d");

      expect(kpis.todayFeed.source).toBe("mock");
      expect(kpis.todayFeed.implementLater).toBeDefined();
    });
  });

  describe("Logic Tỷ Lệ Chết", () => {
    it("nên hiển thị màu xanh và mũi tên xuống khi tỷ lệ chết giảm", async () => {
      const { logService } = await import("../../services/log.service.js");

      // Mock để kỳ hiện tại có 20 con chết, kỳ trước có 30 con chết
      logService.getTotalQuantityByTypeAndPeriod
        .mockResolvedValueOnce(20)  // Kỳ hiện tại
        .mockResolvedValueOnce(30); // Kỳ trước

      const result = await dashboardService._getDeathRateData("7d");

      expect(result.status).toBe("down");
      expect(result.color).toBe("green");
      expect(result.trend).toBe("improving");
      expect(result.note).toContain("So sánh");
    });

    it("nên hiển thị màu đỏ và mũi tên lên khi tỷ lệ chết tăng", async () => {
      const { logService } = await import("../../services/log.service.js");

      // Mock để kỳ hiện tại có 30 con chết, kỳ trước có 20 con chết
      logService.getTotalQuantityByTypeAndPeriod
        .mockResolvedValueOnce(30)  // Kỳ hiện tại
        .mockResolvedValueOnce(20); // Kỳ trước

      const result = await dashboardService._getDeathRateData("7d");

      expect(result.status).toBe("up");
      expect(result.color).toBe("red");
      expect(result.trend).toBe("worsening");
    });

    it("nên sử dụng log service để tính tỷ lệ chết", async () => {
      const { logService } = await import("../../services/log.service.js");

      // Reset mock để test mặc định
      logService.getTotalQuantityByTypeAndPeriod.mockReset();
      logService.getTotalQuantityByTypeAndPeriod
        .mockResolvedValueOnce(20)  // Kỳ hiện tại
        .mockResolvedValueOnce(20); // Kỳ trước

      const result = await dashboardService._getDeathRateData("7d");

      expect(logService.getTotalQuantityByTypeAndPeriod).toHaveBeenCalledWith(
        "DEATH",
        expect.any(Date),
        expect.any(Date)
      );

      expect(result).toHaveProperty("totalDeath", 20);
      expect(result).toHaveProperty("totalChickens", 1730);
      expect(result.source).toBe("log");
      expect(result.status).toBe("neutral");
    });
  });

  describe("Test Môi Trường", () => {
    it("nên sử dụng mock data trong môi trường test", () => {
      expect(dashboardService.isTestEnvironment).toBe(true);
    });

    it("nên trả về mock KPIs khi có lỗi trong getDashboardKPIs", async () => {
      const originalGetFlocksData = dashboardService._getFlocksData;

      dashboardService._getFlocksData = vi.fn().mockRejectedValue(new Error("Database error"));

      const kpis = await dashboardService.getDashboardKPIs("7d");

      expect(kpis).toHaveProperty("totalChickens");
      expect(kpis).toHaveProperty("totalFlocks");
      expect(kpis.period).toBe("7d");
      expect(kpis.calculatedAt).toBeDefined();

      dashboardService._getFlocksData = originalGetFlocksData;
    });
  });
});