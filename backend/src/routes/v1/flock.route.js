import express from 'express'
import { getFlockDetail, updateFlock } from '../../controllers/flock.controller'
import { validateFlockUpdate } from '../../validators/flock.validation'
const router = express.Router()

// Kiểm tra API hoạt động
router.get('/status', (req, res) => res.json({ data: 'ok' }))

// Cập nhật thông tin đàn
router.put('/:id', validateFlockUpdate, updateFlock)
export default router
