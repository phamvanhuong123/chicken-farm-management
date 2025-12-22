import express from "express";
import { dashboardChartController } from "../../controllers/dashboard.chart.controller";

const router = express.Router();

/**
 * @route GET /api/dashboard/charts/weekly-consumption
 * @desc Lấy dữ liệu biểu đồ tiêu thụ hàng tuần (Stacked column)
 * @access Private
 */
router.get("/weekly-consumption", dashboardChartController.getWeeklyConsumption);

/**
 * @route GET /api/dashboard/charts/cost-structure
 * @desc Lấy dữ liệu biểu đồ cơ cấu chi phí (Pie/Donut chart)
 * @access Private
 */
router.get("/cost-structure", dashboardChartController.getCostStructure);

/**
 * @route GET /api/dashboard/charts/all
 * @desc Lấy tất cả dữ liệu biểu đồ (2 biểu đồ)
 * @access Private
 */
router.get("/all", dashboardChartController.getAllCharts);

export default router;