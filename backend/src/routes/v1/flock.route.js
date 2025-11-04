import express from 'express'
import { updateFlock, getFlockDetail, createFlock } from '../../controllers/flock.controller'
import { validateFlockUpdate, validateFlockCreate } from '../../validators/flock.validation'
const router = express.Router()

// Kiểm tra API hoạt động
router.get('/status', (req, res) => res.json({ data: 'ok' }))

// [GET] /v1/flocks/:id - Chi tiết đàn và nhật ký liên quan
router.get('/:id', getFlockDetail)

// [POST] /v1/flocks - Lưu thông tin đàn mới
router.post('/', validateFlockCreate, createFlock)

// Cập nhật thông tin đàn
router.put('/:id', validateFlockUpdate, updateFlock)
export default router
