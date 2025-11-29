import express from "express";
import {
  createArea,
  getOverviewController,
  getAreaList,
  exportAreas,
} from "../../controllers/area.controller.js";

const router = express.Router();

// Team 130 + 132 - Khu nuôi
router.post("/", createArea); // Thêm khu nuôi mới
router.get("/overview", getOverviewController); // KPI + biểu đồ
router.get("/", getAreaList); // Danh sách + filter + paging
router.get("/export", exportAreas); // Xuất Excel

export default router;
