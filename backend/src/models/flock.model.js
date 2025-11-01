/**
 * Flock Model (Phiên bản CRUD rút gọn)
 * TEAM-87: Cập nhật thông tin đàn
 */

import Joi from 'joi'
import { GET_DB } from '../config/mongodb.js'
import { ObjectId } from 'mongodb'

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
        // 1️⃣ Kiểm tra ID hợp lệ trước khi tạo ObjectId
        if (!ObjectId.isValid(id)) {
            const err = new Error('ID không hợp lệ, phải là ObjectId 24 ký tự')
            err.statusCode = 400 // Bad Request
            throw err
        }

        const objectId = new ObjectId(String(id).trim())

        // 2️⃣ Validate dữ liệu đầu vào
        const validUpdate = await validateBeforeUpdate(updateData)

        // 3️⃣ Thực hiện cập nhật trong DB
        const result = await GET_DB()
            .collection(FLOCK_COLLECTION_NAME)
            .updateOne(
                { _id: objectId },
                { $set: { ...validUpdate, updatedAt: new Date() } }
            )

        // 4️⃣ Không tìm thấy bản ghi phù hợp
        if (result.matchedCount === 0) {
            const err = new Error('Không tìm thấy đàn cần cập nhật')
            err.statusCode = 404 // Not Found
            throw err
        }

        // 5️⃣ Thành công
        return result
    } catch (error) {
        // 6️⃣ Nếu chưa có statusCode, xem như lỗi hệ thống
        if (!error.statusCode) error.statusCode = 500
        error.message = 'Không thể cập nhật đàn: ' + error.message
        throw error
    }
}


// Hàm lấy chi tiết đàn
const findOneById = async (id) => {
    try {
        // 1. KIỂM TRA TÍNH HỢP LỆ CỦA ID TRƯỚC
        if (!ObjectId.isValid(id)) {
            // Trả về null nếu ID không hợp lệ (thay vì ném lỗi)
            return null
        }

        return await GET_DB()
            .collection(FLOCK_COLLECTION_NAME)
            // 2. Tạo ObjectId chỉ khi ID hợp lệ
            .findOne({ _id: new ObjectId(String(id)) })
    } catch (error) {
        // Nên sử dụng throw error để middleware xử lý
        throw new Error('Không thể lấy chi tiết đàn: ' + error.message)
    }
}
export const flockModel = {
    FLOCK_COLLECTION_NAME,
    FLOCK_COLLECTION_SCHEMA,
    validateBeforeCreate,
    validateBeforeUpdate,
    findOneById,
    update
}
