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
    // Không dùng trong _getFeedData hiện tại
  },
}));

vi.mock("../../services/log.service.js", () => ({
  logService: {
    getAllLogs: vi.fn().mockResolvedValue([]),
    getLogsByTypeAndTimeRange: vi.fn().mockResolvedValue([]),
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
    getFinancialTrend: vi.fn().mockResolvedValue([
      { month: 1, monthLabel: "Tháng 1", income: 200000000, expense: 150000000 },
      { month: 2, monthLabel: "Tháng 2", income: 220000000, expense: 160000000 },
      { month: 3, monthLabel: "Tháng 3", income: 240000000, expense: 180000000 },
    ]),
  },
}));

describe("Dashboard Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = "test";
  });

  describe("getDashboardKPIs", () => {
    it("nên xử lý các khoảng thời gian hợp lệ", async () => {
      const periods = ["7d", "30d", "90d", "all"];

      for (const period of periods) {
        const kpis = await dashboardService.getDashboardKPIs(period);
        expect(kpis.period).toBe(period);
        expect(kpis.todayFeed.period).toBe("today");
        expect(kpis.monthlyRevenue.period).toBe("month");

        // Kiểm tra dữ liệu tỷ lệ chết
        expect(kpis.deathRate).toHaveProperty("totalDeath");
        expect(kpis.deathRate).toHaveProperty("totalChickens");
        expect(kpis.deathRate.source).toBe("log");
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
      expect(filtered7d.length).toBe(3);
      expect(filtered7d.map(f => f._id)).toEqual(["1", "2", "3"]);

      const filtered30d = dashboardService._filterFlocksByPeriod(flocks, "30d");
      expect(filtered30d.length).toBe(3);

      const filteredAll = dashboardService._filterFlocksByPeriod(flocks, "all");
      expect(filteredAll.length).toBe(3);
    });
  });

  describe("Feed Data từ Log Service", () => {
    it("nên lấy dữ liệu thức ăn từ log service", async () => {
      const { logService } = await import("../../services/log.service.js");

      // Tính toán thời gian hôm nay theo UTC+7 (giống logic trong code)
      const now = new Date();
      const vnOffset = 7 * 60 * 60 * 1000; // GMT+7
      const todayVN = new Date(now.getTime() + vnOffset);
      todayVN.setHours(0, 0, 0, 0);
      const todayStart = new Date(todayVN);
      const todayEnd = new Date(todayVN);
      todayEnd.setHours(23, 59, 59, 999);
      const todayStartUTC = new Date(todayStart.getTime() - vnOffset);
      const todayEndUTC = new Date(todayEnd.getTime() - vnOffset);

      // Tạo log nằm trong khoảng thời gian hôm nay
      const logTime = new Date(todayStartUTC.getTime() + 60 * 60 * 1000); // 1 giờ sau

      logService.getLogsByTypeAndTimeRange.mockResolvedValueOnce([
        {
          _id: "1",
          type: "FOOD",
          quantity: 150,
          createdAt: logTime,
          updatedAt: logTime,
        }
      ]);

      const kpis = await dashboardService.getDashboardKPIs("7d");

      expect(logService.getLogsByTypeAndTimeRange).toHaveBeenCalled();
      expect(kpis.todayFeed.source).toBe("log_service");
      expect(kpis.todayFeed.value).toBe(150);
      expect(kpis.todayFeed.unit).toBe("kg");
      expect(kpis.todayFeed.period).toBe("today");
    });

    it("nên xử lý khi không có dữ liệu log thức ăn", async () => {
      const { logService } = await import("../../services/log.service.js");

      // Mock trả về mảng rỗng
      logService.getLogsByTypeAndTimeRange.mockResolvedValueOnce([]);
      logService.getAllLogs.mockResolvedValueOnce([]);

      const kpis = await dashboardService.getDashboardKPIs("7d");

      expect(kpis.todayFeed.source).toBe("log_service");
      expect(kpis.todayFeed.value).toBe(0);
      expect(kpis.todayFeed.label).toBe("Không có dữ liệu");
    });

    it("nên xử lý lỗi từ log service trong _getFeedData", async () => {
      const { logService } = await import("../../services/log.service.js");

      // Lưu lại mock gốc
      const originalGetAllLogs = logService.getAllLogs;
      const originalGetLogsByTypeAndTimeRange = logService.getLogsByTypeAndTimeRange;

      try {
        // Mock cả hai hàm đều lỗi chỉ cho _getFeedData
        logService.getLogsByTypeAndTimeRange.mockRejectedValueOnce(
          new Error("Log service error")
        );
        logService.getAllLogs.mockRejectedValueOnce(
          new Error("Cannot get all logs")
        );

        // Test riêng hàm _getFeedData
        const feedData = await dashboardService._getFeedData("today");

        expect(feedData.source).toBe("error");
        expect(feedData.value).toBe(0);
        expect(feedData.label).toBe("Không có dữ liệu");
      } finally {
        // Khôi phục mock gốc
        logService.getAllLogs = originalGetAllLogs;
        logService.getLogsByTypeAndTimeRange = originalGetLogsByTypeAndTimeRange;
      }
    });
  });

  describe("Logic Tỷ Lệ Chết", () => {
    it("nên tính tỷ lệ chết dựa trên initialCount thay vì currentCount", async () => {
      const { logService } = await import("../../services/log.service.js");

      // Mock logs cho kỳ hiện tại
      logService.getAllLogs.mockResolvedValueOnce([
        {
          _id: "1",
          type: "DEATH",
          quantity: 20,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          flockId: "1"
        }
      ]);

      // Mock flocks data
      const originalGetFlocksData = dashboardService._getFlocksData;
      dashboardService._getFlocksData = vi.fn().mockResolvedValue([
        {
          _id: "1",
          initialCount: 1000,
          currentCount: 950,
          avgWeight: 1.8,
          status: "Raising",
          speciesId: "ri",
          areaId: "khu-a",
          ownerId: "user1",
          // Thay đổi: 6 ngày trước thay vì 7 ngày trước để chắc chắn nằm trong kỳ 7d
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
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
          // Đàn 2 có updatedAt là 10 ngày trước, nằm ngoài kỳ 7d
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
      ]);

      const result = await dashboardService._getDeathRateData("7d");

      // Khôi phục
      dashboardService._getFlocksData = originalGetFlocksData;

      // Kiểm tra tính toán
      expect(result.totalDeath).toBe(20);
      // Kỳ hiện tại có 1 đàn với 1000 gà
      expect(result.totalChickens).toBe(1000);
      // Tỷ lệ chết: (20 / 1000) * 100 = 2%
      expect(result.value).toBeCloseTo(2.0, 2);
      expect(result.unit).toBe("%");
    });

    it("nên hiển thị màu xanh khi tỷ lệ chết giảm", async () => {
      const { logService } = await import("../../services/log.service.js");

      // Mock logs với ít gà chết hơn
      logService.getAllLogs.mockResolvedValueOnce([
        {
          _id: "1",
          type: "DEATH",
          quantity: 0, // Không có gà chết
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          flockId: "1"
        }
      ]);

      // Mock flocks data
      const originalGetFlocksData = dashboardService._getFlocksData;
      dashboardService._getFlocksData = vi.fn().mockResolvedValue([
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
      ]);

      const result = await dashboardService._getDeathRateData("7d");

      // Khôi phục
      dashboardService._getFlocksData = originalGetFlocksData;

      // Với 0 con chết trên 1000 gà -> tỷ lệ 0%
      expect(result.value).toBe(0);
      expect(result.color).toBe("green");
      expect(result.note).toContain("Không có gà chết");
    });
  });

  describe("Log Service Integration cho dữ liệu thức ăn", () => {
    it("nên gọi log service để lấy dữ liệu thức ăn", async () => {
      const { logService } = await import("../../services/log.service.js");

      // Tính toán thời gian hôm nay theo UTC+7
      const now = new Date();
      const vnOffset = 7 * 60 * 60 * 1000;
      const todayVN = new Date(now.getTime() + vnOffset);
      todayVN.setHours(0, 0, 0, 0);
      const todayStart = new Date(todayVN);
      const todayEnd = new Date(todayVN);
      todayEnd.setHours(23, 59, 59, 999);
      const todayStartUTC = new Date(todayStart.getTime() - vnOffset);

      // Tạo log nằm trong khoảng thời gian hôm nay
      const logTime = new Date(todayStartUTC.getTime() + 2 * 60 * 60 * 1000); // 2 giờ sau

      logService.getLogsByTypeAndTimeRange.mockResolvedValueOnce([
        {
          _id: "1",
          type: "FOOD",
          quantity: 200,
          createdAt: logTime,
          updatedAt: logTime,
        }
      ]);

      const feedData = await dashboardService._getFeedData("today");

      expect(logService.getLogsByTypeAndTimeRange).toHaveBeenCalled();
      expect(feedData.source).toBe("log_service");
      expect(feedData.value).toBe(200);
    });

    it("nên fallback về getAllLogs khi getLogsByTypeAndTimeRange lỗi", async () => {
      const { logService } = await import("../../services/log.service.js");

      // Lưu lại mock gốc
      const originalGetAllLogs = logService.getAllLogs;
      const originalGetLogsByTypeAndTimeRange = logService.getLogsByTypeAndTimeRange;

      try {
        // Mock lỗi từ getLogsByTypeAndTimeRange
        logService.getLogsByTypeAndTimeRange.mockRejectedValueOnce(
          new Error("Service error")
        );
        // Mock getAllLogs trả về dữ liệu hôm nay
        logService.getAllLogs.mockResolvedValueOnce([
          {
            _id: "1",
            type: "FOOD",
            quantity: 100,
            createdAt: new Date(), // Thời gian hiện tại (hôm nay)
            updatedAt: new Date(),
          }
        ]);

        const feedData = await dashboardService._getFeedData("today");

        expect(logService.getAllLogs).toHaveBeenCalled();
        expect(feedData.source).toBe("log_service");
        expect(feedData.value).toBe(100);
      } finally {
        // Khôi phục mock gốc
        logService.getAllLogs = originalGetAllLogs;
        logService.getLogsByTypeAndTimeRange = originalGetLogsByTypeAndTimeRange;
      }
    });
  });

  describe("Test Môi Trường", () => {
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