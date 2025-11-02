/**
 * Flock Service
 * TEAM-84: Xử lý lưu thông tin đàn mới
 */

import { flockModel } from '../models/flock.model.js'

const createFlock = async (data) => {
    try {
        const createdFlock = await flockModel.create(data)
        return createdFlock
    } catch (error) {
        if (error.statusCode) throw error

        const err = new Error('Không thể lưu thông tin đàn: ' + error.message)
        err.statusCode = 500
        throw err
    }
}

export const flockService = { createFlock }
