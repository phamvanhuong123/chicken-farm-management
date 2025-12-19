import { dashboardService } from "../services/dashboard.service.js";

/**
 * [GET] /v1/dashboard/summary
 * U1.1: Lấy tổng quan KPI Dashboard với bộ lọc thời gian
 */
export const getDashboardSummary = async (req, res, next) => {
  try {
    const { period = "7d" } = req.query;
    
    // Validate period
    const validPeriods = ["24h", "7d", "30d", "90d", "all"];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        message: "Khoảng thời gian không hợp lệ. Chọn: 24h, 7d, 30d, 90d, all",
      });
    }

    const kpiData = await dashboardService.getDashboardKPIs(period);
    
    res.status(200).json({
      message: "Lấy dữ liệu dashboard thành công",
      data: kpiData,
      period,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [GET] /v1/dashboard/trend
 * U1.2: Lấy dữ liệu cho biểu đồ xu hướng
 */
export const getDashboardTrend = async (req, res, next) => {
  try {
    const { period = "30d", chartType = "weight" } = req.query;
    
    const validChartTypes = ["weight", "feed", "revenue", "death"];
    if (!validChartTypes.includes(chartType)) {
      return res.status(400).json({
        message: "Loại biểu đồ không hợp lệ. Chọn: weight, feed, revenue, death"
      });
    }
    
    const trendData = await dashboardService.getTrendData(period, chartType);
    
    res.status(200).json({
      message: "Lấy dữ liệu biểu đồ thành công",
      data: trendData,
      period,
      chartType,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [GET] /v1/dashboard/alerts
 * Lấy các cảnh báo cho dashboard
 */
export const getDashboardAlerts = async (req, res, next) => {
  try {
    const alerts = await dashboardService.getDashboardAlerts();
    
    res.status(200).json({
      message: "Lấy cảnh báo dashboard thành công",
      data: alerts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};