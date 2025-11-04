/**
 * TEAM-102: Material Model
 */

import Joi from 'joi'
import { GET_DB } from '../config/mongodb.js'
import { differenceInDays } from 'date-fns'

export const MATERIAL_COLLECTION_NAME = 'materials'

export const MATERIAL_SCHEMA = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  quantity: Joi.number().integer().min(0).required(),
  unit: Joi.string().required(),
  expiryDate: Joi.date().required(),
  threshold: Joi.number().integer().min(0).default(0),
  storageLocation: Joi.string().required(),
  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().default(null)
})

export const validateBeforeCreateMaterial = async (data) => {
  return await MATERIAL_SCHEMA.validateAsync(data, { abortEarly: false, stripUnknown: true })
}

/**
 * Lấy danh sách vật tư theo filter, sort, paginate
 * và tính trạng thái hiển thị
 */
const findAll = async (filter = {}, sort = 'createdAt', order = 'desc', skip = 0, limit = 10) => {
  try {
    const db = GET_DB()
    const docs = await db
      .collection(MATERIAL_COLLECTION_NAME)
      .find(filter)
      .project({
        name: 1,
        type: 1,
        quantity: 1,
        unit: 1,
        expiryDate: 1,
        threshold: 1,
        storageLocation: 1,
        createdAt: 1,
        updatedAt: 1
      })
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Tính trạng thái vật tư
    const now = new Date()
    const materials = docs.map((m) => {
      const daysLeft = differenceInDays(new Date(m.expiryDate), now)
      let statusInfo = { label: 'Bình thường', color: '' }

      if (m.quantity <= m.threshold) {
        statusInfo = { label: 'Sắp hết', color: 'red' }
      } else if (daysLeft < 7) {
        statusInfo = { label: 'Gần hết hạn', color: 'orange' }
      }

      return { ...m, statusInfo }
    })

    return materials
  } catch (error) {
    const err = new Error('Không thể tải danh sách vật tư: ' + error.message)
    err.statusCode = 500
    throw err
  }
}

/** Đếm tổng số vật tư theo filter (phân trang) */
const count = async (filter = {}) => {
  const db = GET_DB()
  return await db.collection(MATERIAL_COLLECTION_NAME).countDocuments(filter)
}

const create = async (data) => {
  const db = GET_DB()
  return await db.collection(MATERIAL_COLLECTION_NAME).insertOne(data)
}

export const materialModel = {
  MATERIAL_COLLECTION_NAME,
  MATERIAL_SCHEMA,
  validateBeforeCreateMaterial,
  findAll,
  count,
  create
}
