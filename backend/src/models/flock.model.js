/**
 * Flock Model (Phiên bản CRUD rút gọn)
 * TEAM-84: Xử lý lưu thông tin đàn mới
 */

import Joi from 'joi'
import { GET_DB } from '../config/mongodb.js'
import { ObjectId } from 'mongodb'

const FLOCK_COLLECTION_NAME = 'flocks'

// Định nghĩa schema Joi
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

// Validate dữ liệu trước khi tạo đàn
const validateBeforeCreate = async (data) => {
    return await FLOCK_COLLECTION_SCHEMA.validateAsync(data, {
        abortEarly: false,
        stripUnknown: true
    })
}

// ✅ Hàm tạo đàn mới
const create = async (data) => {
    try {
        if (data._id) delete data._id

        const validData = await validateBeforeCreate(data)

        const result = await GET_DB().collection(FLOCK_COLLECTION_NAME).insertOne(validData)

        return {
            _id: result.insertedId,
            ...validData
        }
    } catch (error) {
        if (error.isJoi) {
            const err = new Error('Dữ liệu không hợp lệ: ' + error.message)
            err.statusCode = 400
            throw err
        }
        const err = new Error('Không thể lưu thông tin đàn: ' + error.message)
        err.statusCode = 500
        throw err
    }
}

export const flockModel = {
    FLOCK_COLLECTION_NAME,
    FLOCK_COLLECTION_SCHEMA,
    validateBeforeCreate,
    create
}
