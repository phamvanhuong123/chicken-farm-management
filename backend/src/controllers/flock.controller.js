/**
 * Flock Controller
 * TEAM-87: Cập nhật thông tin đàn
 */

import { flockService } from '../services/flock.service.js'
/**
 * [GET] /v1/flocks/:id
 * Xem chi tiết đàn
 */
export const getFlockDetail = async (req, res) => {
    try {
        const { id } = req.params
        const flock = await flockService.getFlockDetail(id)
        res.status(200).json({ message: 'Lấy chi tiết đàn thành công', data: flock })
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

/**
 * [PUT] /v1/flocks/:id
 * Cập nhật thông tin đàn
 */
export const updateFlock = async (req, res) => {
    try {
        const { id } = req.params
        const updateData = req.body

        const updatedFlock = await flockService.updateFlock(id, updateData)
        res.status(200).json({ message: 'Cập nhật thông tin đàn thành công', data: updatedFlock })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}
