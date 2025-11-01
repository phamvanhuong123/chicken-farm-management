/**
 * Flock Service
 * TEAM-87: Cập nhật thông tin đàn
 */

import { flockModel } from '../models/flock.model.js'
/**
 * Lấy chi tiết 1 đàn theo ID
 */
const getFlockDetail = async (id) => {
    const flock = await flockModel.findOneById(id)
    if (!flock) throw new Error('Không tìm thấy đàn')
    return flock
}

/**
 * Cập nhật thông tin đàn
 */
const updateFlock = async (id, updateData) => {
    // Validate dữ liệu đầu vào
    await flockModel.validateBeforeUpdate(updateData)

    // Thực hiện cập nhật trong DB
    await flockModel.update(id, updateData)

    // Trả lại document mới nhất sau khi cập nhật
    const updatedFlock = await flockModel.findOneById(id)
    return updatedFlock
}

export const flockService = { getFlockDetail, updateFlock }
