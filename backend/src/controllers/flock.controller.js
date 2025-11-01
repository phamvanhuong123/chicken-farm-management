/**
 * Flock Controller
 * TEAM-87: Cập nhật thông tin đàn
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
