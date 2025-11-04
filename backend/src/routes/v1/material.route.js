/**
 * TEAM-102: Material Routes
 */
import express from 'express'
import { getAllMaterials, importExcel } from '../../controllers/material.controller'
import multer from 'multer'

const router = express.Router()
const upload = multer({ dest: 'uploads/' })

// [GET] /v1/materials - Lấy danh sách vật tư
router.get('/', getAllMaterials)
// [POST] /v1/materials - Nhập dữ liệu vật tư từ excel
router.post('/import', upload.single('file'), importExcel)

export default router
