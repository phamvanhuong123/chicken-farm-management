/**
 * Flock Service
 * TEAM-87: Cập nhật thông tin đàn
 * TEAM-93: Cung cấp API chi tiết đàn và nhật ký liên quan
 */

import { flockModel } from '../models/flock.model.js'
/**
 * Lấy chi tiết 1 đàn theo ID
 */
const getFlockOnly = async (id) => {
  const flock = await flockModel.findOneById(id)
  if (!flock) {
    const err = new Error('Không tìm thấy đàn')
    err.statusCode = 404
    throw err
  }
  return flock
}


/**
 * Cập nhật thông tin đàn
 */
const updateFlock = async (id, updateData) => {
  try {
    await flockModel.validateBeforeUpdate(updateData)
    await flockModel.update(id, updateData)
    const updatedFlock = await flockModel.findOneById(id)
    return updatedFlock
  } catch (error) {
    throw error
  }
}

/**
 * Lấy chi tiết đàn và nhật ký liên quan
 * TEAM-93
 */
const getFlockDetail = async (id) => {
  try {
    const result = await flockModel.findDetailById(id)
    return result
  } catch (error) {
    throw error
  }
}
export const flockService = { getFlockOnly, updateFlock, getFlockDetail }
