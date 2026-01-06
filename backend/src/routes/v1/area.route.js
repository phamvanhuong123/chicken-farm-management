import express from "express";
import {
  createArea,
  getOverviewController,
  getAreaList,
  exportAreas,
  updateArea,
  deleteArea, 
} from "../../controllers/area.controller.js";
import { authorize } from "~/middlewares/authorizeMiddleware.js";
import { ROLE } from "~/utils/constants.js";

const router = express.Router();

router.post("/",authorize(ROLE.EMPLOYER), createArea); // Thêm khu nuôi mới
router.get("/overview", getOverviewController); // KPI + biểu đồ
router.get("/", getAreaList); // Danh sách + filter + paging
router.get("/export", exportAreas); // Xuất Excel

// Team 135 - Chỉnh sửa khu nuôi
router.put("/:id",authorize(ROLE.EMPLOYER), updateArea);
// TEAM-136 Xóa khu nuôi
router.delete("/:id",authorize(ROLE.EMPLOYER), deleteArea); // TEAM-136

export default router;
