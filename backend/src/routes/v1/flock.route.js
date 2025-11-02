import express from 'express'
import { updateFlock, getFlockDetail } from '../../controllers/flock.controller'
import { validateFlockUpdate } from '../../validators/flock.validation'
const router = express.Router()

// Kiểm tra API hoạt động
router.get('/status', (req, res) => res.json({ data: 'ok' }))

// [GET] /v1/flocks/:id - Chi tiết đàn và nhật ký liên quan
router.get('/:id', getFlockDetail)


// Cập nhật thông tin đàn
router.put('/:id', validateFlockUpdate, updateFlock)
export default router
