import { flockService } from "./flock.service.js";
import { materialService } from "./material.service.js";
import { logService } from "./log.service.js";
import { financeService } from "./finance.service.js";

class DashboardService {
  constructor() {
    this.config = {
      FEED_THRESHOLD: {
        LOW: 500,
        NORMAL: 800,
        HIGH: 1200,
      },
      MAX_REASONABLE_WEIGHT: 10 // Thêm giới hạn trọng lượng hợp lý (kg)
    };
  }

  async getDashboardKPIs(period = "7d") {
    try {
      const [
        totalChickensKPI,
        totalFlocksKPI,
        deathRateKPI,
        avgWeightKPI,
        feedKPI,
        revenueKPI,
      ] = await Promise.all([
        this._calculateTotalChickens(period),
        this._calculateTotalFlocks(period),
        this._getDeathRateData(period),
        this._calculateAvgWeight(period),
        this._getFeedData(period),
        this._getRevenueData(period),
      ]);

      const kpis = {
        totalChickens: totalChickensKPI,
        totalFlocks: totalFlocksKPI,
        deathRate: deathRateKPI,
        avgWeight: avgWeightKPI,
        todayFeed: feedKPI,
        monthlyRevenue: revenueKPI,
        period,
        calculatedAt: new Date().toISOString(),
      };

      return kpis;
    } catch (error) {
      console.error("Lỗi khi tính toán KPI dashboard:", error);
      return this._getEmptyKPIs(period);
    }
  }

  async _getFlocksData() {
    try {
      const flocks = await flockService.getAllFlocks();
      // Chỉ lấy đàn đang nuôi
      return flocks.filter(flock => flock.status === "Raising" || flock.status === "Đang nuôi");
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu đàn:", error);
      return [];
    }
  }

  async _calculateTotalChickens(period) {
    try {
      const flocks = await this._getFlocksData();
      const filteredFlocks = this._filterFlocksByPeriod(flocks, period);

      if (filteredFlocks.length === 0) {
        return {
          value: 0,
          change: 0,
          status: "neutral",
          previousValue: 0,
          period,
          unit: "con",
          description: `Tổng số gà đang nuôi (${period})`,
          color: "gray",
          note: `Không có đàn nào trong khoảng thời gian ${period}`,
        };
      }

      const totalCurrent = filteredFlocks.reduce(
        (sum, flock) => sum + (flock.currentCount || 0),
        0
      );

      return {
        value: totalCurrent,
        change: 0,
        status: "neutral",
        previousValue: 0,
        period,
        unit: "con",
        description: `Tổng số gà đang nuôi (${period})`,
        color: "gray",
        note: `Dựa trên ${filteredFlocks.length} đàn`,
      };
    } catch (error) {
      console.error("Lỗi khi tính tổng số gà:", error);
      return {
        value: 0,
        change: 0,
        status: "neutral",
        previousValue: 0,
        period,
        unit: "con",
        description: `Tổng số gà đang nuôi (${period})`,
        color: "gray",
      };
    }
  }

  _filterFlocksByPeriod(flocks, period) {
    const now = new Date();
    let cutoffDate = new Date();

    switch (period) {
      case "7d":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case "all":
        // Lấy tất cả đàn
        return flocks;
      default:
        return flocks;
    }

    return flocks.filter((flock) => {
      const dateToCheck = flock.updatedAt
        ? new Date(flock.updatedAt)
        : new Date(flock.createdAt);
      return dateToCheck >= cutoffDate;
    });
  }

  async _calculateTotalFlocks(period) {
    try {
      const flocks = await this._getFlocksData();
      const filteredFlocks = this._filterFlocksByPeriod(flocks, period);

      const totalCurrent = filteredFlocks.length;

      return {
        value: totalCurrent,
        change: 0,
        status: "neutral",
        previousValue: 0,
        period,
        unit: "đàn",
        description: `Tổng số đàn đang nuôi (${period})`,
        color: "gray",
      };
    } catch (error) {
      console.error("Lỗi khi tính tổng số đàn:", error);
      return {
        value: 0,
        change: 0,
        status: "neutral",
        previousValue: 0,
        period,
        unit: "đàn",
        description: `Tổng số đàn đang nuôi (${period})`,
        color: "gray",
      };
    }
  }

  async _getDeathRateData(period) {
    try {
      // Lấy logs từ service
      const logs = await logService.getAllLogs();

      // Lấy logs trong khoảng thời gian
      const endDate = new Date();
      let startDate = new Date();
      switch (period) {
        case "7d":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(startDate.getDate() - 90);
          break;
        case "all":
          // Lấy tất cả logs
          startDate = new Date(0); // Từ ngày đầu tiên
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      const deathLogs = logs.filter(log => {
        if (!log.createdAt) return false;
        const logDate = new Date(log.createdAt);
        return log.type === "DEATH" && logDate >= startDate && logDate <= endDate;
      });

      const totalDeath = deathLogs.reduce((sum, log) => sum + (log.quantity || 0), 0);

      // Lấy tổng số gà trong kỳ
      const flocks = await this._getFlocksData();
      const filteredFlocks = this._filterFlocksByPeriod(flocks, period);
      const totalChickensInPeriod = filteredFlocks.reduce(
        (sum, f) => sum + (f.initialCount || 0), 0
      );

      const currentRate = totalChickensInPeriod > 0 ? (totalDeath / totalChickensInPeriod) * 100 : 0;

      return {
        value: parseFloat(currentRate.toFixed(2)),
        change: 0,
        status: currentRate > 5 ? "up" : currentRate > 0 ? "neutral" : "down",
        period: period,
        unit: "%",
        description: `Tỷ lệ chết (${period} gần nhất)`,
        color: currentRate > 5 ? "red" : currentRate > 0 ? "gray" : "green",
        note: totalDeath > 0 ? `Có ${totalDeath} con chết trong ${period}` : "Không có gà chết",
        source: "log",
        totalDeath: totalDeath,
        totalChickens: totalChickensInPeriod,
        hasPreviousData: false
      };
    } catch (error) {
      console.error("Lỗi khi tính tỷ lệ chết:", error);
      return {
        value: 0,
        change: 0,
        status: "neutral",
        period: period,
        unit: "%",
        description: `Tỷ lệ chết (${period} gần nhất)`,
        color: "gray",
        source: "log",
        totalDeath: 0,
        totalChickens: 0,
        note: "Không thể tính tỷ lệ chết"
      };
    }
  }

  async _calculateAvgWeight(period) {
    try {
      const flocks = await this._getFlocksData();
      const filteredFlocks = this._filterFlocksByPeriod(flocks, period);

      // Lọc các đàn có trọng lượng hợp lý (≤ MAX_REASONABLE_WEIGHT kg)
      const flocksWithReasonableWeight = filteredFlocks.filter(
        (f) => (f.avgWeight || 0) > 0 && (f.avgWeight || 0) <= this.config.MAX_REASONABLE_WEIGHT
      );

      if (flocksWithReasonableWeight.length === 0) {
        // Nếu không có đàn nào có trọng lượng hợp lý, thử lấy tất cả
        const flocksWithAnyWeight = filteredFlocks.filter(
          (f) => (f.avgWeight || 0) > 0
        );

        if (flocksWithAnyWeight.length === 0) {
          return {
            value: 0,
            change: 0,
            status: "neutral",
            period,
            unit: "kg/con",
            description: "Trọng lượng trung bình",
            note: "Không có dữ liệu trọng lượng hợp lý"
          };
        }

        // Sử dụng tất cả dữ liệu có trọng lượng > 0
        let totalWeight = 0;
        let totalChickens = 0;

        flocksWithAnyWeight.forEach((flock) => {
          const chickens = flock.currentCount || flock.initialCount || 0;
          // Giới hạn trọng lượng tối đa
          const weight = Math.min(flock.avgWeight || 0, this.config.MAX_REASONABLE_WEIGHT);
          totalWeight += weight * chickens;
          totalChickens += chickens;
        });

        const currentAvg = totalChickens > 0 ? totalWeight / totalChickens : 0;

        return {
          value: parseFloat(currentAvg.toFixed(2)),
          change: 0,
          status: "neutral",
          previousValue: 0,
          period,
          unit: "kg/con",
          description: `Trọng lượng trung bình (${period})`,
          color: "gray",
          sampleSize: flocksWithAnyWeight.length,
          totalChickensInSample: totalChickens,
          note: `Tính từ ${flocksWithAnyWeight.length} đàn (đã giới hạn trọng lượng ≤ ${this.config.MAX_REASONABLE_WEIGHT}kg)`
        };
      }

      let totalWeight = 0;
      let totalChickens = 0;

      flocksWithReasonableWeight.forEach((flock) => {
        const chickens = flock.currentCount || flock.initialCount || 0;
        totalWeight += (flock.avgWeight || 0) * chickens;
        totalChickens += chickens;
      });

      const currentAvg = totalChickens > 0 ? totalWeight / totalChickens : 0;

      return {
        value: parseFloat(currentAvg.toFixed(2)),
        change: 0,
        status: "neutral",
        previousValue: 0,
        period,
        unit: "kg/con",
        description: `Trọng lượng trung bình (${period})`,
        color: "gray",
        sampleSize: flocksWithReasonableWeight.length,
        totalChickensInSample: totalChickens,
        note: `Tính từ ${flocksWithReasonableWeight.length} đàn có trọng lượng hợp lý`
      };
    } catch (error) {
      console.error("Lỗi khi tính trọng lượng trung bình:", error);
      return {
        value: 0,
        change: 0,
        status: "neutral",
        previousValue: 0,
        period,
        unit: "kg/con",
        description: "Trọng lượng trung bình",
        color: "gray",
        sampleSize: 0,
        totalChickensInSample: 0,
        note: "Lỗi khi tính toán trọng lượng"
      };
    }
  }

  async _getFeedData(period) {
    try {
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);

      // Lấy tất cả logs FOOD
      let foodLogs = [];
      try {
        // Sử dụng hàm getLogsByTypeAndTimeRange với khoảng thời gian rộng (30 ngày)
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30); // Lấy logs 30 ngày gần nhất

        foodLogs = await logService.getLogsByTypeAndTimeRange("FOOD", startDate, new Date());
      } catch (error) {
        // Fallback: lấy tất cả logs và filter
        const allLogs = await logService.getAllLogs();
        foodLogs = allLogs.filter(log => log.type === 'FOOD');
      }

      // Lọc logs có trong ngày hôm nay
      const todayFoodLogs = foodLogs.filter(log => {
        if (!log.createdAt) return false;

        // Ưu tiên sử dụng updatedAt, nếu không có thì dùng createdAt
        const logTime = log.updatedAt ? new Date(log.updatedAt) : new Date(log.createdAt);

        // Kiểm tra xem logTime có nằm trong hôm nay không
        return logTime >= todayStart && logTime <= todayEnd;
      });

      // Tính tổng quantity thức ăn tiêu thụ hôm nay
      const totalQuantity = todayFoodLogs.reduce((sum, log) => sum + (log.quantity || 0), 0);

      // Xác định trạng thái dựa trên ngưỡng
      const { LOW, NORMAL, HIGH } = this.config.FEED_THRESHOLD;
      let status = "normal";
      let label = "Bình thường";
      let color = "green";

      if (totalQuantity === 0) {
        status = "normal";
        label = "Không có dữ liệu";
        color = "gray";
      } else if (totalQuantity <= LOW) {
        status = "low";
        label = "Thiếu";
        color = "red";
      } else if (totalQuantity >= HIGH) {
        status = "high";
        label = "Dư thừa";
        color = "orange";
      }

      return {
        value: totalQuantity,
        change: 0,
        unit: "kg",
        status: status,
        label: label,
        description: "Lượng thức ăn tiêu thụ hôm nay",
        color: color,
        threshold: this.config.FEED_THRESHOLD,
        source: "log_service",
        date: now.toISOString().split("T")[0],
        period: "today",
        logCount: todayFoodLogs.length,
        note: todayFoodLogs.length > 0
          ? `Tổng hợp từ ${todayFoodLogs.length} log thức ăn hôm nay`
          : "Không có dữ liệu thức ăn tiêu thụ hôm nay",
      };
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu thức ăn từ logs:", error);
      return {
        value: 0,
        change: 0,
        unit: "kg",
        status: "low",
        label: "Không có dữ liệu",
        description: "Lượng thức ăn tiêu thụ hôm nay",
        color: "gray",
        threshold: this.config.FEED_THRESHOLD,
        source: "error",
        date: new Date().toISOString().split("T")[0],
        period: "today",
        note: "Lỗi khi lấy dữ liệu thức ăn từ logs"
      };
    }
  }

  async _getRevenueData(period) {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Lấy dữ liệu từ finance service
      const financialOverview = await financeService.getFinancialOverview(currentMonth, currentYear);

      const currentRevenue = financialOverview.totalIncome || 0;

      return {
        value: currentRevenue,
        change: 0,
        status: "neutral",
        description: "Doanh thu tháng này",
        period: "month",
        currency: "VND",
        formatted: this._formatCurrency(currentRevenue),
        color: "gray",
        source: "finance_service",
        previousValue: 0,
        profit: financialOverview.profit || 0,
        profitMargin: financialOverview.profitMargin || 0,
        totalExpense: financialOverview.totalExpense || 0,
        note: `Doanh thu tháng ${currentMonth}/${currentYear} từ hệ thống tài chính`,
      };
    } catch (error) {
      console.error("Lỗi khi lấy doanh thu:", error);
      return {
        value: 0,
        change: 0,
        status: "neutral",
        description: "Doanh thu tháng này",
        period: "month",
        currency: "VND",
        formatted: this._formatCurrency(0),
        color: "gray",
        source: "error",
        note: "Không thể lấy dữ liệu doanh thu",
      };
    }
  }

  async getTrendData(period, chartType) {
    try {
      let data = [];

      if (chartType === "revenue") {
        try {
          const months = this._getMonthCountFromPeriod(period);
          const financialTrend = await financeService.getFinancialTrend(months);

          data = financialTrend.map(item => ({
            date: item.monthLabel,
            timestamp: this._getFirstDayOfMonth(item.month),
            value: item.income,
            expense: item.expense,
            profit: item.income - item.expense,
          }));

          return {
            data,
            period,
            chartType,
            unit: "VND",
            source: "finance",
          };
        } catch (error) {
          return {
            data: [],
            period,
            chartType,
            unit: "VND",
            source: "finance",
            note: "Không có dữ liệu doanh thu",
          };
        }
      }
      else if (["weight", "death", "feed"].includes(chartType)) {
        try {
          // Sử dụng phương thức mới để lấy dữ liệu trend
          data = await this._getLogTrendData(chartType, period);
          return {
            data,
            period,
            chartType,
            unit: this._getChartUnit(chartType),
            source: "log",
            note: data.length === 0 ? "Không có dữ liệu log cho biểu đồ này" : ""
          };
        } catch (error) {
          return {
            data: [],
            period,
            chartType,
            unit: this._getChartUnit(chartType),
            source: "log",
            note: "Không có dữ liệu log",
          };
        }
      } else {
        return {
          data: [],
          period,
          chartType,
          unit: this._getChartUnit(chartType),
          source: "no_data",
          note: "Không có dữ liệu",
        };
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu biểu đồ:", error);
      return {
        data: [],
        period,
        chartType,
        unit: "",
        source: "error",
        error: error.message,
        note: "Lỗi khi lấy dữ liệu biểu đồ"
      };
    }
  }

  async _getLogTrendData(chartType, period) {
    try {
      // Tính toán startDate dựa trên period
      const endDate = new Date();
      let startDate = new Date();

      switch (period) {
        case "24h":
          startDate.setDate(startDate.getDate() - 1);
          break;
        case "7d":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(startDate.getDate() - 90);
          break;
        case "all":
          startDate = new Date(0); // Từ ngày đầu tiên
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      // Xác định loại log cần lấy
      let logType;
      switch (chartType) {
        case "weight":
          logType = "WEIGHT";
          break;
        case "death":
          logType = "DEATH";
          break;
        case "feed":
          logType = "FOOD";
          break;
        default:
          logType = "WEIGHT";
      }

      // Lấy logs từ service
      let logs = [];
      try {
        logs = await logService.getLogsByTypeAndTimeRange(logType, startDate, endDate);
      } catch (error) {
        // Fallback: lấy tất cả logs và filter
        const allLogs = await logService.getAllLogs();
        logs = allLogs.filter(log => {
          if (!log.createdAt) return false;
          const logDate = new Date(log.createdAt);
          return log.type === logType && logDate >= startDate && logDate <= endDate;
        });
      }

      if (logs.length === 0) {
        return [];
      }

      // Nhóm theo ngày
      const groupedByDate = {};
      logs.forEach(log => {
        const date = new Date(log.createdAt).toISOString().split('T')[0];
        if (!groupedByDate[date]) {
          groupedByDate[date] = {
            date: date,
            value: 0,
            count: 0
          };
        }
        groupedByDate[date].value += log.quantity || 0;
        groupedByDate[date].count += 1;
      });

      // Chuyển thành mảng và sắp xếp
      const trendData = Object.values(groupedByDate)
        .map(item => ({
          date: item.date,
          value: chartType === "weight" && item.count > 0
            ? (item.value / item.count).toFixed(2)
            : item.value,
          count: item.count
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return trendData;
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu trend từ log:", error);
      return [];
    }
  }

  async getDashboardAlerts() {
    try {
      const alerts = [];

      try {
        const logAlerts = await logService.getAlertsFromLogs();
        alerts.push(...logAlerts);
      } catch (error) {
        // Bỏ qua lỗi
      }

      const feedData = await this._getFeedData("today");
      if (feedData.status === "low") {
        alerts.push({
          type: "feed_low",
          title: "Thức ăn sắp hết",
          message: `Chỉ còn ${feedData.value}${feedData.unit} thức ăn. Cần bổ sung thêm.`,
          severity: "high",
          timestamp: new Date().toISOString(),
          source: "feed",
        });
      }

      const deathData = await this._getDeathRateData("7d");
      if (deathData.value > 5) {
        alerts.push({
          type: "high_death_rate_kpi",
          title: "Tỷ lệ chết cao",
          message: `Tỷ lệ chết 7 ngày là ${deathData.value}%, cần kiểm tra sức khỏe đàn.`,
          severity: "medium",
          timestamp: new Date().toISOString(),
          source: "kpi",
        });
      }

      // Kiểm tra cảnh báo tài chính
      try {
        const currentDate = new Date();
        const financialOverview = await financeService.getFinancialOverview(
          currentDate.getMonth() + 1,
          currentDate.getFullYear()
        );

        // Cảnh báo nếu lợi nhuận âm
        if (financialOverview.profit < 0) {
          alerts.push({
            type: "negative_profit",
            title: "Lợi nhuận âm",
            message: `Lợi nhuận tháng này âm ${this._formatCurrency(Math.abs(financialOverview.profit))}. Cần xem xét chi phí.`,
            severity: "high",
            timestamp: new Date().toISOString(),
            source: "finance",
          });
        }

        // Cảnh báo nếu chi phí quá cao so với doanh thu
        if (financialOverview.totalIncome > 0 &&
          (financialOverview.totalExpense / financialOverview.totalIncome) > 0.8) {
          alerts.push({
            type: "high_expense_ratio",
            title: "Tỷ lệ chi phí cao",
            message: `Chi phí chiếm ${((financialOverview.totalExpense / financialOverview.totalIncome) * 100).toFixed(1)}% doanh thu.`,
            severity: "medium",
            timestamp: new Date().toISOString(),
            source: "finance",
          });
        }
      } catch (financeError) {
        // Bỏ qua lỗi finance service
      }

      return {
        alerts,
        total: alerts.length,
        hasAlerts: alerts.length > 0,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        alerts: [],
        total: 0,
        hasAlerts: false,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  _getEmptyKPIs(period) {
    return {
      totalChickens: {
        value: 0,
        change: 0,
        status: "neutral",
        previousValue: 0,
        period,
        unit: "con",
        description: `Tổng số gà đang nuôi (${period})`,
        color: "gray",
      },
      totalFlocks: {
        value: 0,
        change: 0,
        status: "neutral",
        previousValue: 0,
        period,
        unit: "đàn",
        description: `Tổng số đàn đang nuôi (${period})`,
        color: "gray",
      },
      deathRate: {
        value: 0,
        change: 0,
        status: "neutral",
        period: period,
        unit: "%",
        description: `Tỷ lệ chết (${period} gần nhất)`,
        color: "gray",
        source: "log",
      },
      avgWeight: {
        value: 0,
        change: 0,
        status: "neutral",
        previousValue: 0,
        period,
        unit: "kg/con",
        description: "Trọng lượng trung bình",
        color: "gray",
        sampleSize: 0,
        totalChickensInSample: 0,
      },
      todayFeed: {
        value: 0,
        change: 0,
        unit: "kg",
        status: "low",
        label: "Không có dữ liệu",
        description: "Tổng lượng thức ăn trong kho",
        color: "gray",
        period: "today",
      },
      monthlyRevenue: {
        value: 0,
        change: 0,
        status: "neutral",
        description: "Doanh thu tháng này",
        period: "month",
        currency: "VND",
        formatted: this._formatCurrency(0),
        color: "gray",
        source: "error",
      },
      period,
      calculatedAt: new Date().toISOString(),
    };
  }

  _getChangeStatus(change) {
    if (change > 0.1) return "up";
    if (change < -0.1) return "down";
    return "neutral";
  }

  _getChangeColor(change) {
    if (change > 0.1) return "green";
    if (change < -0.1) return "red";
    return "gray";
  }

  _getFeedStatus(quantity) {
    const { LOW, NORMAL, HIGH } = this.config.FEED_THRESHOLD;

    if (quantity <= LOW) {
      return { status: "low", label: "Thiếu", color: "red" };
    } else if (quantity >= HIGH) {
      return { status: "high", label: "Dư thừa", color: "orange" };
    } else {
      return { status: "normal", label: "Bình thường", color: "green" };
    }
  }

  _getFeedColor(status) {
    const colors = {
      low: "red",
      normal: "green",
      high: "orange",
      error: "gray",
    };
    return colors[status] || "gray";
  }

  _formatCurrency(value) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  }

  _getChartUnit(chartType) {
    const units = {
      weight: "kg/con",
      feed: "kg",
      revenue: "VND",
      death: "%",
    };
    return units[chartType] || "";
  }

  _getMonthCountFromPeriod(period) {
    const monthMap = {
      "7d": 1,
      "30d": 1,
      "90d": 3,
      "all": 12,
    };
    return monthMap[period] || 6;
  }

  _getFirstDayOfMonth(month) {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    return new Date(year, month - 1, 1).toISOString();
  }

  async getWeeklyConsumptionChart() {
    try {
      const allLogs = await logService.getAllLogs();

      const weeklyData = [];

      // Lấy thời điểm hiện tại
      const now = new Date();
      // Tạo ngày hôm nay theo UTC, bắt đầu từ 00:00:00
      const todayUTC = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0, 0, 0, 0
      ));

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        // Tạo ngày cho mỗi offset (từ hôm nay trở về trước)
        const targetDate = new Date(todayUTC);
        targetDate.setUTCDate(todayUTC.getUTCDate() - dayOffset);

        // Lấy các thành phần UTC
        const year = targetDate.getUTCFullYear();
        const month = String(targetDate.getUTCMonth() + 1).padStart(2, "0");
        const day = String(targetDate.getUTCDate()).padStart(2, "0");

        const dateKey = `${year}-${month}-${day}`;
        const displayDate = `${day}-${month}`;
        // Tạo ISO string từ targetDate (đảm bảo là 00:00:00 UTC)
        const isoDate = targetDate.toISOString();

        // Lọc log theo UTC dateKey
        const dayLogs = allLogs.filter(log => {
          if (!log.createdAt) return false;

          const logDate = new Date(log.createdAt);
          const logKey = `${logDate.getUTCFullYear()}-${String(
            logDate.getUTCMonth() + 1
          ).padStart(2, "0")}-${String(
            logDate.getUTCDate()
          ).padStart(2, "0")}`;

          return logKey === dateKey;
        });

        let food = 0;
        let medicine = 0;

        dayLogs.forEach(log => {
          if (log.type === "FOOD") {
            food += log.quantity || 0;
          } else if (log.type === "MEDICINE" || log.type === "VACCINE") {
            medicine += log.quantity || 0;
          }
        });

        // Thêm vào đầu mảng để sau này đảo ngược
        weeklyData.unshift({
          dayNumber: dayOffset + 1,
          dayLabel: `Ngày ${dayOffset + 1}`,
          food,
          medicine,
          total: food + medicine,
          date: isoDate,
          displayDate,
          dateKey
        });
      }

      // Đảo ngược mảng để có thứ tự từ ngày mới nhất (1) đến cũ nhất (7)
      weeklyData.reverse();

      // Điều chỉnh lại dayNumber để Ngày 1 là hôm nay
      weeklyData.forEach((item, index) => {
        item.dayNumber = index + 1;
        item.dayLabel = `Ngày ${index + 1}`;
      });

      const totalFood = weeklyData.reduce((s, d) => s + d.food, 0);
      const totalMedicine = weeklyData.reduce((s, d) => s + d.medicine, 0);

      return {
        chartType: "stacked_column",
        title: "Tiêu thụ 7 ngày gần nhất",
        description: "Thống kê tiêu thụ thức ăn và thuốc 7 ngày gần nhất",
        data: weeklyData,
        series: [
          {
            name: "Thức ăn",
            key: "food",
            color: "#4CAF50",
            unit: "kg",
            description: "Khối lượng thức ăn tiêu thụ"
          },
          {
            name: "Thuốc & Vaccine",
            key: "medicine",
            color: "#FF9800",
            unit: "kg",
            description: "Khối lượng thuốc và vaccine sử dụng"
          }
        ],
        period: "7d",
        calculatedAt: new Date().toISOString(),
        total: {
          food: totalFood,
          medicine: totalMedicine,
          overall: totalFood + totalMedicine
        },
        metadata: {
          source: allLogs.length ? "log" : "no_data",
          dataQuality: allLogs.length ? "real" : "no_data",
          dataPoints: {
            logs: allLogs.length,
            foodLogs: allLogs.filter(l => l.type === "FOOD").length,
            medicineLogs: allLogs.filter(
              l => l.type === "MEDICINE" || l.type === "VACCINE"
            ).length
          },
          timestamp: new Date().toISOString(),
          note: allLogs.length
            ? `Dữ liệu từ ${allLogs.length} logs`
            : "Không có dữ liệu logs"
        }
      };
    } catch (error) {
      console.error("Lỗi weekly consumption:", error);
      return this._getEmptyWeeklyConsumptionData();
    }
  }


  _getEmptyWeeklyConsumptionData() {
    const weeklyData = [];
    const now = new Date();
    const todayUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ));

    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(todayUTC);
      targetDate.setUTCDate(todayUTC.getUTCDate() - i);

      const year = targetDate.getUTCFullYear();
      const month = String(targetDate.getUTCMonth() + 1).padStart(2, "0");
      const day = String(targetDate.getUTCDate()).padStart(2, "0");

      const dateKey = `${year}-${month}-${day}`;
      const displayDate = `${day}-${month}`;
      const isoDate = targetDate.toISOString();

      weeklyData.unshift({
        dayNumber: i + 1,
        dayLabel: `Ngày ${i + 1}`,
        food: 0,
        medicine: 0,
        total: 0,
        date: isoDate,
        displayDate,
        dateKey
      });
    }

    // Đảo ngược để có thứ tự đúng
    weeklyData.reverse();

    // Đảm bảo dayNumber từ 1 đến 7
    weeklyData.forEach((item, index) => {
      item.dayNumber = index + 1;
      item.dayLabel = `Ngày ${index + 1}`;
    });

    return {
      chartType: "stacked_column",
      title: "Tiêu thụ 7 ngày gần nhất",
      description: "Thống kê tiêu thụ thức ăn và thuốc 7 ngày gần nhất",
      data: weeklyData,
      period: "7d",
      calculatedAt: new Date().toISOString(),
      total: { food: 0, medicine: 0, overall: 0 },
      metadata: {
        source: "no_data",
        note: "Không có dữ liệu logs"
      }
    };
  }

  async getCostStructureChart() {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Lấy dữ liệu cơ cấu chi phí từ finance service
      const expenseBreakdown = await financeService.getExpenseBreakdown(currentMonth, currentYear);

      let costStructure = [];
      let hasRealData = false;

      if (expenseBreakdown && expenseBreakdown.length > 0) {
        hasRealData = true;

        // Map dữ liệu từ finance service sang định dạng dashboard
        const categoryConfig = {
          "Thức ăn": { color: "#4CAF50", icon: "restaurant" },
          "Thuốc": { color: "#FF9800", icon: "medication" },
          "Nhân công": { color: "#2196F3", icon: "groups" },
          "Điện nước": { color: "#9C27B0", icon: "bolt" },
          "Chi phí khác": { color: "#607D8B", icon: "payments" },
          "Thu nhập khác": { color: "#4CAF50", icon: "attach_money" },
          "Bán hàng": { color: "#4CAF50", icon: "attach_money" },
        };

        costStructure = expenseBreakdown.map(item => ({
          category: item.category,
          value: item.amount,
          percentage: item.percentage,
          color: categoryConfig[item.category]?.color || this._getRandomColor(),
          icon: categoryConfig[item.category]?.icon || "category",
          description: `Chi phí ${item.category.toLowerCase()}`,
          formattedValue: this._formatCurrency(item.amount),
        }));
      }

      const totalCost = costStructure.reduce((sum, item) => sum + item.value, 0);

      return {
        chartType: "cost_structure",
        title: "Cơ cấu chi phí",
        description: "Phân bổ chi phí hoạt động trang trại",
        data: costStructure,
        total: {
          value: totalCost,
          formatted: this._formatCurrency(totalCost),
          period: "month",
          currency: "VND"
        },
        displayType: "pie",
        calculatedAt: new Date().toISOString(),
        metadata: {
          period: `Tháng ${currentMonth}/${currentYear}`,
          lastUpdated: new Date().toISOString(),
          source: hasRealData ? "finance" : "no_data",
          dataQuality: hasRealData ? "real" : "no_data",
          note: hasRealData
            ? `Dữ liệu từ hệ thống tài chính tháng ${currentMonth}/${currentYear}`
            : "Không có dữ liệu tài chính."
        }
      };

    } catch (error) {
      console.error("Lỗi khi lấy cơ cấu chi phí:", error);
      return this._getEmptyCostStructureData();
    }
  }

  _getEmptyCostStructureData() {
    return {
      chartType: "cost_structure",
      title: "Cơ cấu chi phí",
      description: "Phân bổ chi phí hoạt động trang trại",
      data: [],
      total: {
        value: 0,
        formatted: this._formatCurrency(0),
        period: "month",
        currency: "VND"
      },
      displayType: "pie",
      calculatedAt: new Date().toISOString(),
      metadata: {
        period: "Tháng hiện tại",
        lastUpdated: new Date().toISOString(),
        source: "no_data",
        note: "Không có dữ liệu tài chính."
      }
    };
  }

  async getDashboardCharts() {
    try {
      const [weeklyConsumption, costStructure] = await Promise.all([
        this.getWeeklyConsumptionChart(),
        this.getCostStructureChart()
      ]);

      return {
        weeklyConsumption,
        costStructure,
        period: "current",
        calculatedAt: new Date().toISOString(),
        summary: {
          hasRealData: weeklyConsumption.metadata.source !== "no_data" || costStructure.metadata.source !== "no_data",
          realDataSources: [
            ...(weeklyConsumption.metadata.source !== "no_data" ? ["log"] : []),
            ...(costStructure.metadata.source !== "no_data" ? ["finance"] : [])
          ],
          dataQuality: {
            weeklyConsumption: weeklyConsumption.metadata.dataQuality || "no_data",
            costStructure: costStructure.metadata.dataQuality || "no_data"
          }
        }
      };
    } catch (error) {
      throw new Error("Không thể lấy dữ liệu biểu đồ: " + error.message);
    }
  }

  _getRandomColor() {
    const colors = [
      "#4CAF50", "#2196F3", "#FF9800", "#9C27B0",
      "#3F51B5", "#009688", "#FF5722", "#795548"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

export const dashboardService = new DashboardService();