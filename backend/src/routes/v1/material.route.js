/**
 * TEAM-102: Material Routes
 */
import express from "express";
import {
  getAllMaterials,
  importExcel,
  getMaterialById,
  createMaterial,
} from "../../controllers/material.controller";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// [GET] /v1/materials - Lấy danh sách vật tư
router.get("/", getAllMaterials);
// [POST] /v1/materials - Thêm vật tư mới
router.post("/", createMaterial);
// [POST] /v1/materials - Nhập dữ liệu vật tư từ excel
router.post("/import", upload.single("file"), importExcel);
// [GET] /v1/materials/:id - Xem chi tiết 1 vật tư  🆕 TEAM-104
router.get("/:id", getMaterialById);

export default router;
