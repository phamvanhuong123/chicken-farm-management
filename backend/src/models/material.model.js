/**
 * TEAM-102: Material Model (tìm kiếm tiếng Việt, có normalized fields)
 */

import Joi from "joi";
import { GET_DB } from "../config/mongodb.js";
import { differenceInDays } from "date-fns";
import { ObjectId } from "mongodb"; // 🧠 thêm dòng này

export const MATERIAL_COLLECTION_NAME = "materials";

export const MATERIAL_SCHEMA = Joi.object({
  name: Joi.string().required(),
  normalizedName: Joi.string().allow(""),
  type: Joi.string().required(),
  normalizedType: Joi.string().allow(""),
  quantity: Joi.number().integer().min(0).required(),
  unit: Joi.string().required(),
  expiryDate: Joi.date().required(),
  threshold: Joi.number().integer().min(0).default(0),
  storageLocation: Joi.string().allow("", null),
  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().default(null),
});

export const validateBeforeCreateMaterial = async (data) => {
  return await MATERIAL_SCHEMA.validateAsync(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

/**
 *  Chuẩn hóa tiếng Việt (bỏ dấu, chuyển thường)
 */
const normalizeVietnamese = (str = "") => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
};

/**
 *  Lấy danh sách vật tư (lọc, phân trang, tính trạng thái)
 */
const findAll = async (
  filter = {},
  sort = "createdAt",
  order = "desc",
  skip = 0,
  limit = 10
) => {
  try {
    const db = GET_DB();
    const docs = await db
      .collection(MATERIAL_COLLECTION_NAME)
      .find(filter)
      .project({
        name: 1,
        normalizedName: 1,
        type: 1,
        normalizedType: 1,
        quantity: 1,
        unit: 1,
        expiryDate: 1,
        threshold: 1,
        storageLocation: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .sort({ [sort]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const now = new Date();
    const materials = docs.map((m) => {
      const daysLeft = differenceInDays(new Date(m.expiryDate), now);
      let statusInfo = { label: "Bình thường", color: "" };

      if (m.quantity <= m.threshold) {
        statusInfo = { label: "Sắp hết", color: "red" };
      } else if (daysLeft < 7) {
        statusInfo = { label: "Gần hết hạn", color: "orange" };
      }

      return { ...m, statusInfo };
    });

    return materials;
  } catch (error) {
    const err = new Error("Không thể tải danh sách vật tư: " + error.message);
    err.statusCode = 500;
    throw err;
  }
};

/**
 *  Đếm tổng số vật tư theo filter
 */
const count = async (filter = {}) => {
  const db = GET_DB();
  return await db.collection(MATERIAL_COLLECTION_NAME).countDocuments(filter);
};

/**
 *  Tạo vật tư mới (tự thêm normalizedName / normalizedType)
 */
const create = async (data) => {
  const db = GET_DB();
  const normalizedData = {
    ...data,
    normalizedName: normalizeVietnamese(data.name),
    normalizedType: normalizeVietnamese(data.type),
  };
  return await db
    .collection(MATERIAL_COLLECTION_NAME)
    .insertOne(normalizedData);
};
/**
 * TEAM-104:  Lấy chi tiết vật tư theo ID
 */
const findById = async (id) => {
  try {
    const db = GET_DB();
    const doc = await db
      .collection(MATERIAL_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });
    if (!doc) return null;

    const now = new Date();
    const daysLeft = differenceInDays(new Date(doc.expiryDate), now);
    let statusInfo = { label: "Bình thường", color: "" };

    if (doc.quantity <= doc.threshold) {
      statusInfo = { label: "Sắp hết", color: "red" };
    } else if (daysLeft < 7) {
      statusInfo = { label: "Gần hết hạn", color: "orange" };
    }

    return {
      ...doc,
      statusInfo,
    };
  } catch (error) {
    const err = new Error("Không thể lấy chi tiết vật tư: " + error.message);
    err.statusCode = 500;
    throw err;
  }
};
//Chỉnh sửa vật tư
const updateById = async (id, data) => {
  const db = GET_DB();
  const updateData = {
    ...data,
    normalizedName: normalizeVietnamese(data.name),
    normalizedType: normalizeVietnamese(data.type),
    updatedAt: new Date(),
  };

  const result = await db
    .collection(MATERIAL_COLLECTION_NAME)
    .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

  return result;
};
//Xóa vật tư

const deleteById = async (id) => {
  return await GET_DB()
    .collection(MATERIAL_COLLECTION_NAME)
    .deleteOne({ _id: new ObjectId(id) });
};
export const materialModel = {
  MATERIAL_COLLECTION_NAME,
  MATERIAL_SCHEMA,
  validateBeforeCreateMaterial,
  findAll,
  count,
  create,
  findById,
  updateById,
  deleteById,
};
