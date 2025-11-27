/**
 * TEAM-122: Nhập Chuồng Routes
 */
import express from "express";
import {
  getImportList,
  createImport,
} from "../../controllers/import.controller.js";

const router = express.Router();

// Kiểm tra API hoạt động
router.get("/status", (req, res) => res.json({ data: "ok" }));

// [GET] danh sách nhập chuồng
router.get("/", getImportList);

// [POST] thêm lứa nhập 
router.post("/", createImport);

export default router;
