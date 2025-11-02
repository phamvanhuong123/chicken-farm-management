/**
 * TEAM-87: Cập nhật thông tin đàn
 */

import Joi from 'joi'
import { GET_DB } from '../config/mongodb.js'
import { ObjectId } from 'mongodb'

// TEAM-93: Cung cấp API chi tiết đàn và nhật ký liên quan
import { logService } from '../services/log.service.js'

const FLOCK_COLLECTION_NAME = 'flocks'

const FLOCK_COLLECTION_SCHEMA = Joi.object({
    importDate: Joi.date().required(),
    initialCount: Joi.number().integer().min(1).required(),
    speciesId: Joi.string().required(),
    areaId: Joi.string().required(),
    ownerId: Joi.string().required(),
    avgWeight: Joi.number().min(0).default(0),
    status: Joi.string().valid('Raising', 'Sold', 'Closed').default('Raising'),
    currentCount: Joi.number().integer().min(0).default(Joi.ref('initialCount')),
    createdAt: Joi.date().default(() => new Date()),
    updatedAt: Joi.date().default(null)
})
// Validate dữ liệu trước khi thêm mới
const validateBeforeCreate = async (data) => {
    return await FLOCK_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

// Validate dữ liệu khi cập nhật
const validateBeforeUpdate = async (data) => {
    const updateSchema = Joi.object({
        currentCount: Joi.number().integer().min(0).optional(),
        avgWeight: Joi.number().min(0).optional(),
        status: Joi.string().valid('Raising', 'Sold', 'Closed').optional()
    })
    return await updateSchema.validateAsync(data, {
        abortEarly: false,
        stripUnknown: true
    })
}

// Hàm cập nhật đàn
const update = async (id, updateData) => {
    try {
        if (!ObjectId.isValid(id)) {
            const err = new Error('ID không hợp lệ, phải là ObjectId 24 ký tự')
            err.statusCode = 400
            throw err
        }

        const objectId = new ObjectId(String(id).trim())

        const validUpdate = await validateBeforeUpdate(updateData)

        const result = await GET_DB()
            .collection(FLOCK_COLLECTION_NAME)
            .updateOne(
                { _id: objectId },
                { $set: { ...validUpdate, updatedAt: new Date() } }
            )

        if (result.matchedCount === 0) {
            const err = new Error('Không tìm thấy đàn cần cập nhật')
            err.statusCode = 404
            throw err
        }

        return result
    } catch (error) {
        if (!error.statusCode) error.statusCode = 500
        error.message = 'Không thể cập nhật đàn: ' + error.message
        throw error
    }
}


const findOneById = async (id) => {
    try {
        if (!ObjectId.isValid(id)) {
            return null
        }

        return await GET_DB()
            .collection(FLOCK_COLLECTION_NAME)
            .findOne({ _id: new ObjectId(String(id)) })
    } catch (error) {
        throw new Error('Không thể lấy chi tiết đàn: ' + error.message)
    }
}

// Hàm lấy chi tiết đàn và nhật ký liên quan
const findDetailById = async (id) => {
    try {
        if (!ObjectId.isValid(id)) {
            const err = new Error('ID đàn không hợp lệ')
            err.statusCode = 400
            throw err
        }

        const db = GET_DB()

        // Lấy chi tiết đàn
        const flock = await db
            .collection(FLOCK_COLLECTION_NAME)
            .findOne({ _id: new ObjectId(id) })

        if (!flock) {
            const err = new Error('Không tìm thấy thông tin đàn')
            err.statusCode = 404
            throw err
        }

        // Lấy danh sách nhật ký liên quan
        const logs = await logService.getLogsByFlockId(id)

        return { flock, logs }
    } catch (error) {
        if (!error.statusCode) error.statusCode = 500
        error.message = 'Không thể tải thông tin đàn: ' + error.message
        throw error
    }
}

export const flockModel = {
    FLOCK_COLLECTION_NAME,
    FLOCK_COLLECTION_SCHEMA,
    validateBeforeCreate,
    validateBeforeUpdate,
    findOneById,
    update,
    findDetailById
}
