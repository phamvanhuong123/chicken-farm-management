/**
 * Flock Controller
 * TEAM-87: Cập nhật thông tin đàn
 * TEAM-93: Cung cấp API chi tiết đàn và nhật ký liên quan
 */

import { flockService } from '../services/flock.service.js'

/**
 * [PUT] /v1/flocks/:id
 * Cập nhật thông tin đàn
 */
export const updateFlock = async (req, res, next) => {
    try {
        const { id } = req.params
        const updateData = req.body
        const updatedFlock = await flockService.updateFlock(id, updateData)

        res.status(200).json({
            message: 'Cập nhật thông tin đàn thành công',
            data: updatedFlock
        })
    } catch (error) {
        next(error)
    }
}

/**
 * [GET] /v1/flocks/:id
 * Xem chi tiết đàn và nhật ký liên quan
 */
export const getFlockDetail = async (req, res, next) => {
    try {
        const { id } = req.params
        const { flock, logs } = await flockService.getFlockDetail(id)

        res.status(200).json({
            message: 'Tải thông tin đàn thành công',
            data: {
                flock,
                logs: Array.isArray(logs) ? logs : []
            }
        })
    } catch (error) {
        next(error)
    }
}