/**
 * TEAM-102: Material Routes
 */
import express from "express";
import {
  getAllMaterials,
  importExcel,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "../../controllers/material.controller";
import multer from "multer";
import { authorize } from "~/middlewares/authorizeMiddleware";
import { ROLE } from "~/utils/constants";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// [GET] /v1/materials - Lấy danh sách vật tư
router.get("/", getAllMaterials);
// [POST] /v1/materials - Thêm vật tư mới
router.post("/",authorize(ROLE.EMPLOYER), createMaterial);
// [POST] /v1/materials - Nhập dữ liệu vật tư từ excel
router.post("/import",authorize(ROLE.EMPLOYER), upload.single("file"), importExcel);
// [GET] /v1/materials/:id - Xem chi tiết 1 vật tư  
router.get("/:id", getMaterialById);
// [PUT] /v1/materials/:id - Cập nhật thông tin vật tư
router.put("/:id",authorize(ROLE.EMPLOYER), updateMaterial);
// [DELETE] /v1/materials/:id - Xóa vật tư
router.delete("/:id",authorize(ROLE.EMPLOYER), deleteMaterial);

export default router;
