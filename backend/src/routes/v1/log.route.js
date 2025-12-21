import express from "express";
import {
  createLog,
  updateLog,
  deleteLog,
  getLogDetail,
  getAllLogs,
} from "../../controllers/log.controller.js";
import {
  validateLogCreate,
  validateLogUpdate,
} from "../../validators/log.validation.js";

const router = express.Router();

// [GET] /v1/logs - Lấy danh sách nhật ký (có thể filter theo flockId qua query)
router.get("/", getAllLogs);

// [GET] /v1/logs/:id - Xem chi tiết nhật ký
router.get("/:id", getLogDetail);

// [POST] /v1/logs - Tạo nhật ký mới
router.post("/", validateLogCreate, createLog);

// [PUT] /v1/logs/:id - Cập nhật nhật ký
router.put("/:id", validateLogUpdate, updateLog);

// [DELETE] /v1/logs/:id - Xóa nhật ký
router.delete("/:id", deleteLog);

export const logRoute = router