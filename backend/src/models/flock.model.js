import Joi from "joi";
import { GET_DB } from "../config/mongodb.js";
import { ObjectId } from "mongodb";



const FLOCK_COLLECTION_NAME = "flocks";

const FLOCK_COLLECTION_SCHEMA = Joi.object({
  initialCount: Joi.number().integer().min(1).required(),
  speciesId: Joi.string().required(),
  areaId: Joi.string().required(),
  ownerId: Joi.string().required(),
  avgWeight: Joi.number().min(0).default(0),
  status: Joi.string().valid("Raising", "Sold", "Closed").default("Raising"),
  currentCount: Joi.number().integer().min(0).default(Joi.ref("initialCount")),
  createdAt: Joi.date().default(() => new Date()),
  note: Joi.string().allow("").min(0).max(255).optional(),
  price: Joi.number().min(0).default(0),
  updatedAt: Joi.date().default(null),
});

// Validate dữ liệu trước khi thêm mới
const validateBeforeCreate = async (data) => {
  return await FLOCK_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};

// Validate dữ liệu khi cập nhật
const validateBeforeUpdate = async (data) => {
  const updateSchema = Joi.object({
    createdAt: Joi.date().max('now').optional().messages({
      'date.max': 'Ngày nhập không hợp lệ.'
    }),
    supplierId: Joi.string().optional(),
    speciesId: Joi.string().optional(),
    initialCount: Joi.number().integer().min(1).optional().messages({
      'number.min': 'Số lượng phải lớn hơn 0.'
    }),
    currentCount: Joi.number().integer().min(0).optional(),
    avgWeight: Joi.number().min(0.01).optional().messages({
      'number.min': 'Trọng lượng trung bình phải lớn hơn 0.'
    }),
    areaId: Joi.string().optional(),
    status: Joi.string().valid("Raising", "Sold", "Closed").optional(),
    note: Joi.string().max(255).trim().allow('').optional(),
  });
  return await updateSchema.validateAsync(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

//  Hàm tạo đàn mới
const create = async (data) => {
  try {

    console.log("[Model] Data validate trước khi tạo:", data); // THÊM LOG

    if (data._id) delete data._id;

    const validData = await validateBeforeCreate(data);

    console.log("[Model] Data sau khi validate:", validData); // THÊM LOG

    const result = await GET_DB()
      .collection(FLOCK_COLLECTION_NAME)
      .insertOne(validData);
      
      console.log("[Model] Kết quả insert:", result); // THÊM LOG

    return {
      _id: result.insertedId,
      ...validData,
    };
  } catch (error) {
     console.error("🔥 [Model] Lỗi khi tạo:", error.message); // THÊM LOG
    if (error.isJoi) {
      const err = new Error("Dữ liệu không hợp lệ: " + error.message);
      err.statusCode = 400;
      throw err;
    }
    const err = new Error("Không thể lưu thông tin đàn: " + error.message);
    err.statusCode = 500;
    throw err;
  }
};
// Hàm cập nhật đàn
const update = async (id, updateData) => {
  try {
    if (!ObjectId.isValid(id)) {
      const err = new Error("ID không hợp lệ, phải là ObjectId 24 ký tự");
      err.statusCode = 400;
      throw err;
    }

    const objectId = new ObjectId(String(id).trim());

    const validUpdate = await validateBeforeUpdate(updateData);

    const result = await GET_DB()
      .collection(FLOCK_COLLECTION_NAME)
      .updateOne(
        { _id: objectId },
        { $set: { ...validUpdate, updatedAt: new Date() } }
      );

    if (result.matchedCount === 0) {
      const err = new Error("Không tìm thấy đàn cần cập nhật");
      err.statusCode = 404;
      throw err;
    }

    return result;
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    error.message = "Không thể cập nhật đàn: " + error.message;
    throw error;
  }
};

const findOneById = async (id) => {
  try {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    return await GET_DB()
      .collection(FLOCK_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(String(id)) });
  } catch (error) {
    throw new Error("Không thể lấy chi tiết đàn: " + error.message);
  }
};

// Hàm lấy chi tiết đàn và nhật ký liên quan
const findDetailById = async (id) => {
  try {
    if (!ObjectId.isValid(id)) {
      const err = new Error("ID đàn không hợp lệ");
      err.statusCode = 400;
      throw err;
    }

    const db = GET_DB();

    // Lấy chi tiết đàn
    const flock = await db
      .collection(FLOCK_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(String(id)) });

    if (!flock) {
      const err = new Error("Không tìm thấy thông tin đàn");
      err.statusCode = 404;
      throw err;
    }

    

    return { flock };
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    error.message = "Không thể tải thông tin đàn: " + error.message;
    throw error;
  }
};

// TEAM-81: Cung cấp dữ liệu danh sách đàn
const getAllFlocks = async () => {
  try {
    const flocks = await GET_DB()
      .collection(FLOCK_COLLECTION_NAME)
      .find({})
      .sort({ importDate: -1 }) // sắp xếp giảm dần theo ngày nhập
      .toArray();

    return flocks;
  } catch (error) {
    const err = new Error("Không thể tải danh sách đàn: " + error.message);
    err.statusCode = 500;
    throw err;
  }
};
// TEAM-90: Xóa đàn theo ID
const deleteById = async (id) => {
  try {
    if (!ObjectId.isValid(id)) {
      const err = new Error("ID không hợp lệ");
      err.statusCode = 400;
      throw err;
    }

    const result = await GET_DB()
      .collection(FLOCK_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      const err = new Error("Không tìm thấy đàn để xóa");
      err.statusCode = 404;
      throw err;
    }

    return { _id: id, deleted: true };
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    error.message = "Không thể xóa đàn: " + error.message;
    throw error;
  }
};

export const flockModel = {
  FLOCK_COLLECTION_NAME,
  FLOCK_COLLECTION_SCHEMA,
  validateBeforeCreate,
  create,
  validateBeforeUpdate,
  findOneById,
  update,
  findDetailById,
  getAllFlocks,
  deleteById,
};