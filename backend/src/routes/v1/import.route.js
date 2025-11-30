/**
 * TEAM-122: Nhập Chuồng Routes
 */
import express from "express";
import {
  getImportList,
  createImport,
  getImportDetail,
  updateImport,
  deleteImport,
} from "../../controllers/import.controller.js";

import {
  validateImportCreate,
  validateImportUpdate,
} from "../../validators/import.validation.js";

const router = express.Router();

// Kiểm tra API hoạt động
router.get("/status", (req, res) => res.json({ data: "ok" }));

// [GET] danh sách nhập chuồng
router.get("/", getImportList);
// [GET] Chi tiết 
router.get("/:id", getImportDetail);
// [POST] thêm lứa nhập 
router.post("/", validateImportCreate, createImport);
// [PUT] update đàn
router.put("/:id", updateImport);
// [DELETE] xóa đàn
router.delete("/:id", deleteImport);

export default router;
