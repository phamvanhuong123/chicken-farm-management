import express from 'express'
import { createFlock } from '../../controllers/flock.controller'
import { validateFlockCreate } from '../../validators/flock.validation'

const router = express.Router()

// [POST] /v1/flocks - Lưu thông tin đàn mới
router.post('/', validateFlockCreate, createFlock)

export default router
