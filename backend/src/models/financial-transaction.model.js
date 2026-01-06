import Joi from "joi";
import { GET_DB } from "../config/mongodb.js";
import { ObjectId } from "mongodb";

const FINANCIAL_TRANSACTION_COLLECTION = "financial_transactions";

// Danh mục giao dịch
export const TRANSACTION_CATEGORIES = {
  // Chi phí
  FOOD: "Thức ăn",
  MEDICINE: "Thuốc",
  LABOR: "Nhân công",
  UTILITIES: "Điện nước",
  OTHER_EXPENSE: "Khác",

  // Thu nhập
  SALES: "Bán hàng",
  OTHER_INCOME: "Khác",
};

// Schema validation
const FINANCIAL_TRANSACTION_SCHEMA = Joi.object({
  date: Joi.date().required(),
  type: Joi.string().valid("income", "expense").required(), // Thu/Chi
  category: Joi.string()
    .valid(...Object.values(TRANSACTION_CATEGORIES))
    .required(),
  amount: Joi.number().min(0).required(),
  flockId: Joi.string().allow("", null).optional(), // Đàn liên quan (nếu có)
  flockCode: Joi.string().allow("", null).optional(), // Mã đàn
  description: Joi.string().max(500).allow("").optional(),
  invoiceCode: Joi.string().max(100).allow("", null).optional(), // Mã hóa đơn
  invoiceUrl: Joi.string().uri().allow("", null).optional(), // Link hóa đơn
  createdBy: Joi.string().optional(), // User ID
  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().default(null),
});

// Validate trước khi create
const validateBeforeCreate = async (data) => {
  return await FINANCIAL_TRANSACTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

// Tạo giao dịch mới
const create = async (data) => {
  try {
    const validData = await validateBeforeCreate(data);

    const result = await GET_DB()
      .collection(FINANCIAL_TRANSACTION_COLLECTION)
      .insertOne(validData);

    return {
      _id: result.insertedId,
      ...validData,
    };
  } catch (error) {
    if (error.isJoi) {
      const err = new Error("Dữ liệu không hợp lệ: " + error.message);
      err.statusCode = 400;
      throw err;
    }
    throw error;
  }
};

// Lấy danh sách giao dịch (có filter, sort, pagination)
const findAll = async (filter = {}, options = {}) => {
  const { sort = "date", order = "desc", skip = 0, limit = 20 } = options;

  try {
    const transactions = await GET_DB()
      .collection(FINANCIAL_TRANSACTION_COLLECTION)
      .find(filter)
      .sort({ [sort]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return transactions;
  } catch (error) {
    throw new Error("Không thể tải danh sách giao dịch: " + error.message);
  }
};

// Đếm số lượng giao dịch
const count = async (filter = {}) => {
  return await GET_DB()
    .collection(FINANCIAL_TRANSACTION_COLLECTION)
    .countDocuments(filter);
};

// Lấy chi tiết giao dịch theo ID
const findById = async (id) => {
  try {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    return await GET_DB()
      .collection(FINANCIAL_TRANSACTION_COLLECTION)
      .findOne({ _id: new ObjectId(id) });
  } catch (error) {
    throw new Error("Không thể lấy chi tiết giao dịch: " + error.message);
  }
};

// Xóa giao dịch
const deleteById = async (id) => {
  try {
    if (!ObjectId.isValid(id)) {
      const err = new Error("ID không hợp lệ");
      err.statusCode = 400;
      throw err;
    }

    const result = await GET_DB()
      .collection(FINANCIAL_TRANSACTION_COLLECTION)
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      const err = new Error("Không tìm thấy giao dịch");
      err.statusCode = 404;
      throw err;
    }

    return { _id: id, deleted: true };
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    throw error;
  }
};

// Aggregation - Tổng hợp dữ liệu
const aggregate = async (pipeline = []) => {
  try {
    return await GET_DB()
      .collection(FINANCIAL_TRANSACTION_COLLECTION)
      .aggregate(pipeline)
      .toArray();
  } catch (error) {
    throw new Error("Không thể thực hiện aggregation: " + error.message);
  }
};
//
const findLatest = async () => {
  return await GET_DB()
    .collection(FINANCIAL_TRANSACTION_COLLECTION)
    .find({})
    .sort({ createdAt: -1 })
    .limit(1)
    .next();
};

export const financialTransactionModel = {
  FINANCIAL_TRANSACTION_COLLECTION,
  TRANSACTION_CATEGORIES,
  validateBeforeCreate,
  create,
  findAll,
  count,
  findById,
  deleteById,
  aggregate,
  findLatest,
};
