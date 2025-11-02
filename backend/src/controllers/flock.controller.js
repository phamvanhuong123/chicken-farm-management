/**
 * Flock Controller
 * TEAM-84: Xử lý lưu thông tin đàn mới
 */

import { flockService } from '../services/flock.service.js'

/**
 * [POST] /v1/flocks
 * Lưu thông tin đàn mới
 */
export const createFlock = async (req, res, next) => {
    try {
        const newFlock = await flockService.createFlock(req.body)
        res.status(201).json({
            message: 'Tạo đàn mới thành công',
            data: newFlock
        })
    } catch (error) {
        next(error)
    }
}
