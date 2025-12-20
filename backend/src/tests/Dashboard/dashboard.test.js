import { dashboardService } from "../../services/dashboard.service.js";

// Mock tất cả các service phụ thuộc
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
        updatedAt: null,
      },
    ]),
  },
}));

vi.mock("../../services/material.service.js", () => ({
  materialService: {
    getFeedInfoForDashboard: vi.fn().mockResolvedValue({
      value: 850,
      unit: "kg",
      status: "normal",
      label: "Bình thường",
      threshold: { LOW: 500, NORMAL: 800, HIGH: 1200 },
      source: "mock",
    }),
  },
}));

// Mock log service với các hàm mới
vi.mock("../../services/log.service.js", () => ({
  logService: {
    getTotalQuantityByTypeAndPeriod: vi.fn().mockImplementation((type, startDate, endDate) => {
      // Mock dữ liệu cho tổng số gà chết
      if (type === "DEATH") {
        return Promise.resolve(20); // 20 con gà chết
      }
      if (type === "FOOD") {
        return Promise.resolve(500);
      }
      if (type === "WEIGHT") {
        return Promise.resolve(3500);
      }
      return Promise.resolve(0);
    }),
    getTrendDataForDashboard: vi.fn().mockImplementation((chartType, period) => {
      // Mock dữ liệu biểu đồ - chỉ mock cho weight, death, feed
      const mockData = [];
      const now = new Date();

      // Chỉ trả về dữ liệu cho các chartType từ log service
      if (["weight", "death", "feed"].includes(chartType)) {
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);

          let value;
          switch (chartType) {
            case "weight":
              value = 1.5 + Math.random() * 0.5;
              break;
            case "death":
              value = Math.random() * 5;
              break;
            case "feed":
              value = 500 + Math.random() * 500;
              break;
            default:
              value = Math.random() * 100;
          }

          mockData.push({
            date: date.toISOString().split("T")[0],
            value: parseFloat(value.toFixed(2)),
            count: 1,
            avg: value,
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
      {
        type: "health_warning",
        title: "Cảnh báo sức khỏe đàn",
        message: "Có 2 ghi chú về vấn đề sức khỏe trong 7 ngày qua.",
        severity: "medium",
        timestamp: new Date().toISOString(),
        source: "log",
      },
    ]),
    getLogStatistics: vi.fn().mockResolvedValue([
      {
        type: "DEATH",
        totalQuantity: 20,
        count: 5,
        avgQuantity: 4,
      },
      {
        type: "FOOD",
        totalQuantity: 5000,
        count: 20,
        avgQuantity: 250,
      },
      {
        type: "WEIGHT",
        totalQuantity: 3500,
        count: 30,
        avgQuantity: 116.67,
      },
    ]),
  },
}));

describe("Dashboard Service", () => {
  // Reset mocks trước mỗi test
  beforeEach(() => {
    vi.clearAllMocks();
    // Set test environment
    process.env.NODE_ENV = "test";

    // Reset config mặc định
    dashboardService.config.MOCK_DATA = {
      DAILY_FEED: 850,
      DAILY_FEED_CHANGE: 0,
      MONTHLY_REVENUE: 245000000,
      REVENUE_CHANGE: 123,
      DEATH_RATE_7D: 3.0, // Giữ 3.0 để test change âm
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
          updatedAt: null,
        },
      ],
    };
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

      // Kiểm tra cụ thể KPI todayFeed có change
      expect(kpis.todayFeed.change).toBeDefined();
      expect(typeof kpis.todayFeed.change).toBe("number");

      // Kiểm tra deathRate có source từ log
      expect(kpis.deathRate.source).toBe("log");
    });

    it("nên xử lý các khoảng thời gian khác nhau chính xác", async () => {
      const periods = ["24h", "7d", "30d", "90d", "all"];

      for (const period of periods) {
        const kpis = await dashboardService.getDashboardKPIs(period);
        expect(kpis.period).toBe(period);

        // Đảm bảo tất cả KPI đều có change
        expect(kpis.todayFeed.change).toBeDefined();

        // Kiểm tra deathRate có thông tin đầy đủ
        expect(kpis.deathRate).toHaveProperty("totalDeath");
        expect(kpis.deathRate).toHaveProperty("totalChickens");
      }
    });

    it("nên gọi log service để lấy dữ liệu tỷ lệ chết", async () => {
      const { logService } = await import("../../services/log.service.js");

      const kpis = await dashboardService.getDashboardKPIs("7d");

      // Kiểm tra logService.getTotalQuantityByTypeAndPeriod được gọi
      expect(logService.getTotalQuantityByTypeAndPeriod).toHaveBeenCalled();

      // Kiểm tra deathRate có dữ liệu từ log service
      expect(kpis.deathRate.value).toBeDefined();
      expect(kpis.deathRate.source).toBe("log");
    });
  });

  describe("getTrendData", () => {
    it("nên trả về dữ liệu xu hướng cho biểu đồ trọng lượng từ log service", async () => {
      const { logService } = await import("../../services/log.service.js");

      const trendData = await dashboardService.getTrendData("7d", "weight");

      expect(trendData).toHaveProperty("data");
      expect(trendData).toHaveProperty("period", "7d");
      expect(trendData).toHaveProperty("chartType", "weight");
      expect(trendData).toHaveProperty("unit", "kg/con");
      expect(trendData).toHaveProperty("source", "log");
      expect(Array.isArray(trendData.data)).toBe(true);
      expect(trendData.data.length).toBeGreaterThan(0);

      // Kiểm tra logService.getTrendDataForDashboard được gọi
      expect(logService.getTrendDataForDashboard).toHaveBeenCalledWith("weight", "7d");
    });

    it("nên xử lý các loại biểu đồ khác nhau", async () => {
      const { logService } = await import("../../services/log.service.js");

      const chartTypes = ["weight", "feed", "death"];

      for (const chartType of chartTypes) {
        const trendData = await dashboardService.getTrendData("30d", chartType);
        expect(trendData.chartType).toBe(chartType);
        expect(Array.isArray(trendData.data)).toBe(true);
        expect(logService.getTrendDataForDashboard).toHaveBeenCalledWith(chartType, "30d");
      }
    });

    it("nên sử dụng mock data cho biểu đồ revenue", async () => {
      const { logService } = await import("../../services/log.service.js");

      const trendData = await dashboardService.getTrendData("30d", "revenue");

      expect(trendData.chartType).toBe("revenue");
      expect(trendData.source).toBe("mock");
      expect(trendData.note).toBe("Mock data for revenue chart");
      // logService.getTrendDataForDashboard không được gọi cho revenue
      expect(logService.getTrendDataForDashboard).not.toHaveBeenCalledWith("revenue", "30d");
    });

    it("nên xử lý lỗi từ log service và fallback về mock data", async () => {
      const { logService } = await import("../../services/log.service.js");

      // Mock lỗi từ log service
      logService.getTrendDataForDashboard.mockRejectedValueOnce(new Error("Service unavailable"));

      const trendData = await dashboardService.getTrendData("7d", "weight");

      // Vẫn trả về dữ liệu (mock data fallback)
      expect(trendData.data).toBeDefined();
      expect(Array.isArray(trendData.data)).toBe(true);
      expect(trendData.source).toBe("mock");
      expect(trendData.note).toContain("Fallback");
    });
  });

  describe("getDashboardAlerts", () => {
    it("nên trả về cấu trúc cảnh báo từ log service", async () => {
      const { logService } = await import("../../services/log.service.js");

      const alerts = await dashboardService.getDashboardAlerts();

      expect(alerts).toHaveProperty("alerts");
      expect(alerts).toHaveProperty("total");
      expect(alerts).toHaveProperty("hasAlerts");
      expect(alerts).toHaveProperty("lastChecked");
      expect(Array.isArray(alerts.alerts)).toBe(true);

      // Kiểm tra logService.getAlertsFromLogs được gọi
      expect(logService.getAlertsFromLogs).toHaveBeenCalled();

      // Kiểm tra có cảnh báo từ log service
      const logAlerts = alerts.alerts.filter(alert => alert.source === "log");
      expect(logAlerts.length).toBeGreaterThan(0);
    });

    it("nên kết hợp cảnh báo từ log service và các nguồn khác", async () => {
      const alerts = await dashboardService.getDashboardAlerts();

      // Kiểm tra có nhiều loại cảnh báo
      const alertTypes = alerts.alerts.map(alert => alert.type);
      expect(alertTypes).toContain("high_death_rate");
      expect(alertTypes).toContain("health_warning");

      // Feed status là normal nên không có cảnh báo feed_low
      const feedData = await dashboardService._getFeedData("today");
      if (feedData.status === "low") {
        expect(alertTypes).toContain("feed_low");
      }
    });

    it("nên xử lý lỗi khi lấy cảnh báo từ log service", async () => {
      const { logService } = await import("../../services/log.service.js");

      // Mock lỗi từ log service
      logService.getAlertsFromLogs.mockRejectedValueOnce(new Error("Service unavailable"));

      const alerts = await dashboardService.getDashboardAlerts();

      // Vẫn trả về cấu trúc cảnh báo
      expect(alerts).toHaveProperty("alerts");
      expect(alerts).toHaveProperty("total");
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

    it("nên xác định màu cho thay đổi chính xác", () => {
      expect(dashboardService._getChangeColor(5)).toBe("green");
      expect(dashboardService._getChangeColor(-5)).toBe("red");
      expect(dashboardService._getChangeColor(0)).toBe("gray");
    });

    it("nên xác định trạng thái thức ăn chính xác", () => {
      expect(dashboardService._getFeedStatus(400)).toEqual({
        status: "low",
        label: "Thiếu",
        color: "red",
      });
      expect(dashboardService._getFeedStatus(900)).toEqual({
        status: "normal",
        label: "Bình thường",
        color: "green",
      });
      expect(dashboardService._getFeedStatus(1300)).toEqual({
        status: "high",
        label: "Dư thừa",
        color: "orange",
      });
    });

    it("nên định dạng tiền tệ chính xác", () => {
      const formatted = dashboardService._formatCurrency(245000000);
      expect(formatted).toContain("₫");
      expect(formatted).toContain("245");
      expect(formatted).toContain("000");
    });

    it("nên filter flocks theo period chính xác", () => {
      const flocks = [
        {
          _id: "1",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 ngày trước
        },
        {
          _id: "2",
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 ngày trước
        },
        {
          _id: "3",
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 ngày trước
        },
      ];

      const filtered24h = dashboardService._filterFlocksByPeriod(flocks, "24h");
      expect(filtered24h.length).toBe(1);
      expect(filtered24h[0]._id).toBe("1");

      const filtered7d = dashboardService._filterFlocksByPeriod(flocks, "7d");
      expect(filtered7d.length).toBe(1);
      expect(filtered7d[0]._id).toBe("1");

      const filteredAll = dashboardService._filterFlocksByPeriod(flocks, "all");
      expect(filteredAll.length).toBe(3);
    });
  });

  describe("Logic Tỷ Lệ Chết", () => {
    it("nên hiển thị màu xanh và mũi tên xuống khi tỷ lệ chết giảm", async () => {
      // Test với change âm (currentRate ≈ 2.105%, previousRate = 3.0%)
      const result = await dashboardService._getDeathRateData("7d");

      // Tổng số gà trong 7 ngày: chỉ flock 1 (950 con)
      // Tổng số chết từ mock: 20
      // currentRate = (20 / 950) * 100 ≈ 2.105%
      // previousRate = 3.0% (từ MOCK_DATA.DEATH_RATE_7D)
      // change = 2.105 - 3.0 = -0.895% (âm)
      expect(result.status).toBe("down");
      expect(result.color).toBe("green");
      expect(result.trend).toBe("improving");
      expect(result.note).toContain("Giảm");
    });

    it("nên hiển thị màu đỏ và mũi tên lên khi tỷ lệ chết tăng", async () => {
      // Test với change dương - thay đổi mock để trả về nhiều gà chết hơn
      const { logService } = await import("../../services/log.service.js");

      // Mock trả về 50 con gà chết để currentRate > previousRate
      logService.getTotalQuantityByTypeAndPeriod.mockResolvedValueOnce(50);

      // Giảm previousRate xuống 1.0%
      dashboardService.config.MOCK_DATA.DEATH_RATE_7D = 1.0;

      const result = await dashboardService._getDeathRateData("7d");

      // currentRate = (50 / 950) * 100 ≈ 5.263%
      // previousRate = 1.0%
      // change = 5.263 - 1.0 = 4.263% (dương)
      expect(result.status).toBe("up");
      expect(result.color).toBe("red");
      expect(result.trend).toBe("worsening");
      expect(result.note).toContain("Tăng");
    });

    it("nên sử dụng log service để tính tỷ lệ chết", async () => {
      const { logService } = await import("../../services/log.service.js");

      const result = await dashboardService._getDeathRateData("7d");

      // Kiểm tra logService.getTotalQuantityByTypeAndPeriod được gọi
      expect(logService.getTotalQuantityByTypeAndPeriod).toHaveBeenCalledWith(
        "DEATH",
        expect.any(Date),
        expect.any(Date)
      );

      // Kiểm tra kết quả có thông tin từ log service
      expect(result).toHaveProperty("totalDeath", 20);
      expect(result).toHaveProperty("totalChickens", 950); // Chỉ flock trong 7 ngày
      expect(result.source).toBe("log");
    });

    it("nên fallback về mock data khi log service lỗi", async () => {
      const { logService } = await import("../../services/log.service.js");

      // Mock lỗi từ log service
      logService.getTotalQuantityByTypeAndPeriod.mockRejectedValueOnce(new Error("Service unavailable"));

      const result = await dashboardService._getDeathRateData("7d");

      // Kiểm tra fallback về mock data
      expect(result.source).toBe("mock");
      expect(result.value).toBe(3.0); // Giá trị từ _getMockDeathRateData (DEATH_RATE_7D = 3.0)
    });
  });

  describe("Test Môi Trường", () => {
    it("nên sử dụng mock data trong môi trường test", () => {
      // Môi trường đã được set là 'test' trong beforeEach
      expect(dashboardService.isTestEnvironment).toBe(true);
    });

    it("nên trả về mock KPIs khi có lỗi trong getDashboardKPIs", async () => {
      // Lưu lại hàm gốc
      const originalGetFlocksData = dashboardService._getFlocksData;

      // Mock lỗi
      dashboardService._getFlocksData = vi.fn().mockRejectedValue(new Error("Database error"));

      const kpis = await dashboardService.getDashboardKPIs("7d");

      // Vẫn trả về mock data
      expect(kpis).toHaveProperty("totalChickens");
      expect(kpis).toHaveProperty("totalFlocks");
      expect(kpis.period).toBe("7d");
      expect(kpis.calculatedAt).toBeDefined();

      // Khôi phục hàm gốc
      dashboardService._getFlocksData = originalGetFlocksData;
    });
  });
});