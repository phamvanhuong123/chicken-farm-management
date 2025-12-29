import express from "express";
import {
  updateFlock,
  getFlockDetail,
  createFlock,
  getAllFlocks,
  deleteFlock,
  deleteFlockByImport
} from "../../controllers/flock.controller.js";
import {
  validateFlockUpdate,
  validateFlockCreate,
} from "../../validators/flock.validation.js";
import { authorize } from "~/middlewares/authorizeMiddleware.js";
import { ROLE } from "~/utils/constants.js";

const router = express.Router();

// Kiểm tra API hoạt động
router.get("/status", (req, res) => res.json({ data: "ok" }));

// [GET] /v1/flocks - TEAM-81: Lấy danh sách đàn
router.get("/", getAllFlocks);

// [GET] /v1/flocks/:id - Chi tiết đàn và nhật ký liên quan (TEAM-93)
router.get("/:id", getFlockDetail);

// [POST] /v1/flocks - Lưu thông tin đàn mới
router.post("/", authorize(ROLE.EMPLOYER), validateFlockCreate, createFlock);

// [PUT] /v1/flocks/:id - Cập nhật thông tin đàn
router.put("/:id", validateFlockUpdate, updateFlock);
// [DELETE] /v1/flocks/:id - TEAM-90: Xóa đàn
router.delete("/:id", deleteFlock);

router.delete("/by-import/:importId", deleteFlockByImport);

export default router;
