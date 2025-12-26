import express from "express";
import {
  getDashboardSummary,
  getDashboardTrend,
  getDashboardAlerts
} from "../../controllers/dashboard.controller.js";

const router = express.Router();

// [GET] /v1/dashboard/summary - U1.1: Lấy KPI dashboard
router.get("/summary", getDashboardSummary);

// [GET] /v1/dashboard/trend - U1.2: Lấy dữ liệu biểu đồ
router.get("/trend", getDashboardTrend);

// [GET] /v1/dashboard/alerts - Lấy cảnh báo dashboard
router.get("/alerts", getDashboardAlerts);

// [GET] /v1/dashboard/status - Kiểm tra API
router.get("/status", (req, res) => {
  res.json({
    status: "active",
    version: "1.0",
    endpoints: ["/summary", "/trend", "/alerts"],
    description: "Dashboard API - U1.1: Xem KPI & lọc thời gian",
    lastUpdated: new Date().toISOString()
  });
});

export default router;