/**
 * TEAM-102: Material API Routes
 */

import express from 'express'
import { getAllMaterials } from '../../controllers/material.controller.js'

const router = express.Router()

// [GET] /v1/materials - Lấy danh sách vật tư
router.get('/', getAllMaterials)

export default router
