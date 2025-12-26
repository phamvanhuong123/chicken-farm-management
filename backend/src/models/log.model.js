import Joi from "joi";
import { GET_DB } from "../config/mongodb.js";
import { ObjectId } from "mongodb";

const LOG_COLLECTION_NAME = "logs";

// Schema Joi cho Collection (Validate tầng DB)
const LOG_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required(), // Bắt buộc có người ghi
  areaId: Joi.string().required(),
  type: Joi.string()
    .valid("FOOD", "MEDICINE", "WATER", "DEATH", "WEIGHT", "HEALTH")
    .required(),
  quantity: Joi.number().min(0).default(0), // Thay amount bằng quantity
  unit: Joi.string().allow("").default(""),
  note: Joi.string().allow("").max(500).optional(),

  // Tự động tạo thời gian
  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().default(null),
});

// Validate trước khi Create
const validateBeforeCreate = async (data) => {
  return await LOG_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};

// Validate trước khi Update
const validateBeforeUpdate = async (data) => {
  const updateSchema = Joi.object({
    areaId: Joi.string().required(),
    type: Joi.string().optional(),
    quantity: Joi.number().min(0).optional(), // Update quantity
    unit: Joi.string().allow("").optional(),
    note: Joi.string().allow("").max(500).optional(),
    updatedAt: Joi.date().default(() => new Date()),
  });

  return await updateSchema.validateAsync(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

// Tạo mới
const create = async (data) => {
  try {
    const validData = await validateBeforeCreate(data);

    if (ObjectId.isValid(validData.areaId)) {
      validData.areaId = new ObjectId(validData.areaId);
    }
    if (ObjectId.isValid(validData.userId)) {
      validData.userId = new ObjectId(validData.userId);
    }

    // 2. Insert vào DB
    const result = await GET_DB()
      .collection(LOG_COLLECTION_NAME)
      .insertOne(validData);

    // Lấy lại dữ liệu vừa tạo kèm theo thông tin Join (User, Area)
    const [newLog] = await GET_DB()
      .collection(LOG_COLLECTION_NAME)
      .aggregate([
        // Chỉ lấy đúng bản ghi vừa tạo
        { $match: { _id: result.insertedId } },

        // Join User
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userInfo",
          },
        },

        // Join Area
        {
          $lookup: {
            from: "areas",
            localField: "areaId",
            foreignField: "_id",
            as: "areaInfo",
          },
        },

        // Unwind
        { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$areaInfo", preserveNullAndEmptyArrays: true } },

        // Project: Định dạng dữ liệu trả về
        {
          $project: {
            _id: 1,
            type: 1,
            quantity: 1,
            unit: 1,
            note: 1,
            createdAt: 1,
            userId: 1,
            areaId: 1,
            // Lấy tên map ra
            userName: { $ifNull: ["$userInfo.username", "Unknown User"] },
            areaName: { $ifNull: ["$areaInfo.name", "Unknown Area"] },
          },
        },
      ])
      .toArray();

    return newLog;
  } catch (error) {
    if (error.isJoi) {
      const err = new Error("Dữ liệu log không hợp lệ: " + error.message);
      err.statusCode = 400;
      throw err;
    }
    throw new Error("Lỗi model create log: " + error.message);
  }
};

// Cập nhật
const update = async (id, updateData) => {
  try {
    // 1. Validate ID
    if (!ObjectId.isValid(id)) {
      const err = new Error("ID Log không hợp lệ");
      err.statusCode = 400;
      throw err;
    }
    const objectId = new ObjectId(String(id));

    // 2. Validate dữ liệu update
    const validUpdate = await validateBeforeUpdate(updateData);

    // 3. Convert String -> ObjectId (Chỉ cần quan tâm areaId để join)
    if (validUpdate.areaId && ObjectId.isValid(validUpdate.areaId)) {
      validUpdate.areaId = new ObjectId(validUpdate.areaId);
    }
    // Nếu vẫn muốn lưu userId đúng chuẩn ObjectId thì giữ dòng này, không thì bỏ
    if (validUpdate.userId && ObjectId.isValid(validUpdate.userId)) {
      validUpdate.userId = new ObjectId(validUpdate.userId);
    }

    validUpdate.updatedAt = new Date();

    // 4. Update dữ liệu thô vào DB
    const result = await GET_DB()
      .collection(LOG_COLLECTION_NAME)
      .updateOne({ _id: objectId }, { $set: validUpdate });

    if (result.matchedCount === 0) {
      const err = new Error("Không tìm thấy nhật ký để cập nhật");
      err.statusCode = 404;
      throw err;
    }

    // 5. Aggregate: CHỈ JOIN VỚI AREAS
    const [updatedLog] = await GET_DB()
      .collection(LOG_COLLECTION_NAME)
      .aggregate([
        // Tìm bản ghi vừa sửa
        { $match: { _id: objectId } },

        // Join bảng Areas (Lấy tên khu vực)
        {
          $lookup: {
            from: "areas", // Tên collection Area
            localField: "areaId",
            foreignField: "_id",
            as: "areaInfo",
          },
        },

        // Gỡ mảng areaInfo
        { $unwind: { path: "$areaInfo", preserveNullAndEmptyArrays: true } },

        // Chọn các trường trả về
        {
          $project: {
            _id: 1,
            areaId: 1,
            type: 1,
            quantity: 1,
            unit: 1,
            note: 1,
            userId: 1, // Vẫn trả về userId thô nếu cần
            createdAt: 1,
            updatedAt: 1,

            // CHỈ LẤY AREA NAME, bỏ User Name
            areaName: { $ifNull: ["$areaInfo.name", "Unknown Area"] },
          },
        },
      ])
      .toArray();

    return updatedLog;
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    throw error;
  }
};

// Tìm theo ID
const findOneById = async (id) => {
  try {
    if (!ObjectId.isValid(id)) return null;
    return await GET_DB()
      .collection(LOG_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(String(id)) });
  } catch (error) {
    throw new Error("Lỗi model findOneById: " + error.message);
  }
};

// Tìm theo Area ID (Đã đổi tên từ findByFlockId)
const findByAreaId = async (areaId) => {
  try {
    let query = {};
    if (ObjectId.isValid(areaId)) {
      query = { areaId: new ObjectId(String(areaId)) };
    } else {
      query = { areaId: String(areaId) };
    }

    const logs = await GET_DB()
      .collection(LOG_COLLECTION_NAME)
      .find(query)
      .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo mới nhất
      .toArray();

    return logs;
  } catch (error) {
    throw new Error("Lỗi model findByAreaId: " + error.message);
  }
};

// Lấy tất cả
const getAllLogs = async () => {
  try {
    return await GET_DB()
      .collection(LOG_COLLECTION_NAME)
      .aggregate([
        // 1. Sắp xếp mới nhất lên đầu
        { $sort: { createdAt: -1 } },

        // 2. Join với bảng Users (Lấy tên người dùng)
        {
          $lookup: {
            from: "users", // Tên collection trong DB (phải chính xác)
            localField: "userId", // Trường trong logs (đã convert ObjectId ở hàm create)
            foreignField: "_id", // Trường khóa chính bên users
            as: "userInfo", // Tên field tạm để chứa kết quả
          },
        },
        // 3. Join với bảng Areas (Lấy tên khu vực)
        {
          $lookup: {
            from: "areas", // Tên collection khu vực
            localField: "areaId",
            foreignField: "_id",
            as: "areaInfo",
          },
        },

        // 4. "Gỡ" mảng ra thành object (Unwind)
        // preserveNullAndEmptyArrays: true -> Giữ lại log ngay cả khi không tìm thấy user/area
        { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$areaInfo", preserveNullAndEmptyArrays: true } },

        // 5. Chọn các trường muốn trả về (Project)
        {
          $project: {
            _id: 1,
            type: 1,
            quantity: 1,
            unit: 1,
            note: 1,
            createdAt: 1,
            userId: 1,
            areaId: 1,
            userName: { $ifNull: ["$userInfo.username", "Unknown User"] },
            areaName: { $ifNull: ["$areaInfo.name", "Unknown Area"] },
          },
        },
      ])
      .toArray();
  } catch (error) {
    throw new Error("Lỗi model getAllLogs: " + error.message);
  }
};

// Xóa
const deleteById = async (id) => {
  try {
    if (!ObjectId.isValid(id)) {
      const err = new Error("ID không hợp lệ");
      err.statusCode = 400;
      throw err;
    }
    const result = await GET_DB()
      .collection(LOG_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(String(id)) });

    if (result.deletedCount === 0) {
      const err = new Error("Không tìm thấy nhật ký xóa");
      err.statusCode = 404;
      throw err;
    }
    return { _id: id, deleted: true };
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    throw error;
  }
};

/**
 * Lấy tổng quantity theo type và khoảng thời gian (CHO DASHBOARD)
 */
const getTotalQuantityByTypeAndTimeRange = async (type, startDate, endDate) => {
  try {
    const result = await GET_DB()
      .collection(LOG_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            type: type,
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$quantity" },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    return result.length > 0 ? result[0].total : 0;
  } catch (error) {
    throw new Error(
      "Lỗi model getTotalQuantityByTypeAndTimeRange: " + error.message
    );
  }
};

/**
 * Lấy log theo type và khoảng thời gian (CHO DASHBOARD)
 */
const getLogsByTypeAndTimeRange = async (type, startDate, endDate) => {
  try {
    const logs = await GET_DB()
      .collection(LOG_COLLECTION_NAME)
      .find({
        type: type,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ createdAt: -1 })
      .toArray();

    return logs;
  } catch (error) {
    throw new Error("Lỗi model getLogsByTypeAndTimeRange: " + error.message);
  }
};

/**
 * Lấy dữ liệu cho biểu đồ trend (CHO DASHBOARD)
 */
const getTrendData = async (chartType, startDate, endDate) => {
  try {
    let matchStage = {};

    switch (chartType) {
      case "weight":
        matchStage = { type: "WEIGHT" };
        break;
      case "death":
        matchStage = { type: "DEATH" };
        break;
      case "feed":
        matchStage = { type: "FOOD" };
        break;
      default:
        matchStage = { type: "WEIGHT" };
    }

    const trendData = await GET_DB()
      .collection(LOG_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            ...matchStage,
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            total: { $sum: "$quantity" },
            count: { $sum: 1 },
            avg: { $avg: "$quantity" },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            date: "$_id",
            value: "$total",
            count: 1,
            avg: 1,
            _id: 0,
          },
        },
      ])
      .toArray();

    return trendData;
  } catch (error) {
    throw new Error("Lỗi model getTrendData: " + error.message);
  }
};

/**
 * Lấy thống kê log (CHO DASHBOARD)
 */
const getLogStatistics = async (startDate, endDate) => {
  try {
    const stats = await GET_DB()
      .collection(LOG_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: "$type",
            totalQuantity: { $sum: "$quantity" },
            count: { $sum: 1 },
            avgQuantity: { $avg: "$quantity" },
          },
        },
        {
          $project: {
            type: "$_id",
            totalQuantity: 1,
            count: 1,
            avgQuantity: 1,
            _id: 0,
          },
        },
        {
          $sort: { totalQuantity: -1 },
        },
      ])
      .toArray();

    return stats;
  } catch (error) {
    throw new Error("Lỗi model getLogStatistics: " + error.message);
  }
};

export const logModel = {
  LOG_COLLECTION_NAME,
  LOG_COLLECTION_SCHEMA,
  validateBeforeCreate,
  validateBeforeUpdate,
  create,
  update,
  findOneById,
  findByAreaId,
  getAllLogs,
  deleteById,
  getTotalQuantityByTypeAndTimeRange,
  getLogsByTypeAndTimeRange,
  getTrendData,
  getLogStatistics,
};