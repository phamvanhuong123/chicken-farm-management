import Joi from "joi";
import { GET_DB } from "../config/mongodb.js";
import { ObjectId } from "mongodb";

const TRANSACTION_COLLECTION_NAME = "transactions";

// Schema cho giao dịch nhập/xuất chuồng
const TRANSACTION_SCHEMA = Joi.object({
  type: Joi.string().valid("import", "export").required(), // Nhập hoặc Xuất
  flockId: Joi.string().required(), // ID đàn gà
  flockCode: Joi.string().allow("").optional(), // Mã đàn (để hiển thị)
  quantity: Joi.number().integer().min(1).required(), // Số lượng (con)
  avgWeight: Joi.number().min(0.01).required(), // Trọng lượng TB (kg/con)
  pricePerKg: Joi.number().min(0).default(0), // Giá/kg (VNĐ)
  totalRevenue: Joi.number().min(0).default(0), // Doanh thu = quantity * avgWeight * pricePerKg
  
  // Thông tin khách hàng/nhà cung cấp
  customerName: Joi.string().allow("").optional(), // Tên khách hàng (xuất)
  supplierName: Joi.string().allow("").optional(), // Tên nhà cung cấp (nhập)
  
  // Loại giao dịch
  transactionType: Joi.string().valid("Bán", "Tặng", "Tiêu hủy", "Nhập mới", "Chuyển đàn").default("Bán"),
  
  // Thanh toán
  paymentMethod: Joi.string().valid("Tiền mặt", "Chuyển khoản", "Chưa thanh toán").default("Tiền mặt"),
  paymentStatus: Joi.string().valid("Đã thanh toán", "Chưa thanh toán", "Thanh toán một phần").default("Chưa thanh toán"),
  
  // Trạng thái đơn
  status: Joi.string().valid("Đang xử lý", "Hoàn thành", "Đã hủy").default("Đang xử lý"),
  
  // Ghi chú
  note: Joi.string().max(255).allow("").optional(),
  
  // Timestamps
  transactionDate: Joi.date().required(), // Ngày giao dịch
  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().default(null),
});

// Validate dữ liệu trước khi tạo
const validateBeforeCreate = async (data) => {
  return await TRANSACTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

// Tạo giao dịch mới
const create = async (data) => {
  try {
    const validData = await validateBeforeCreate(data);
    const result = await GET_DB()
      .collection(TRANSACTION_COLLECTION_NAME)
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
    const err = new Error("Không thể tạo giao dịch: " + error.message);
    err.statusCode = 500;
    throw err;
  }
};

// Lấy danh sách giao dịch
const findAll = async (filter = {}, sort = "transactionDate", order = "desc", skip = 0, limit = 20) => {
  try {
    const transactions = await GET_DB()
      .collection(TRANSACTION_COLLECTION_NAME)
      .find(filter)
      .sort({ [sort]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return transactions;
  } catch (error) {
    const err = new Error("Không thể tải danh sách giao dịch: " + error.message);
    err.statusCode = 500;
    throw err;
  }
};

// Đếm số lượng giao dịch
const count = async (filter = {}) => {
  return await GET_DB()
    .collection(TRANSACTION_COLLECTION_NAME)
    .countDocuments(filter);
};

// Lấy chi tiết giao dịch theo ID
const findById = async (id) => {
  try {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    return await GET_DB()
      .collection(TRANSACTION_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });
  } catch (error) {
    throw new Error("Không thể lấy chi tiết giao dịch: " + error.message);
  }
};

// Cập nhật giao dịch
const update = async (id, updateData) => {
  try {
    if (!ObjectId.isValid(id)) {
      const err = new Error("ID không hợp lệ");
      err.statusCode = 400;
      throw err;
    }

    const result = await GET_DB()
      .collection(TRANSACTION_COLLECTION_NAME)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updatedAt: new Date() } }
      );

    if (result.matchedCount === 0) {
      const err = new Error("Không tìm thấy giao dịch");
      err.statusCode = 404;
      throw err;
    }

    return result;
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    throw error;
  }
};

// Thống kê KPI theo tháng
const getMonthlyStats = async (month, year) => {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const pipeline = [
      {
        $match: {
          transactionDate: { $gte: startDate, $lte: endDate },
          status: { $ne: "Đã hủy" },
        },
      },
      {
        $group: {
          _id: "$type",
          totalQuantity: { $sum: "$quantity" },
          totalRevenue: { $sum: "$totalRevenue" },
          count: { $sum: 1 },
        },
      },
    ];

    const stats = await GET_DB()
      .collection(TRANSACTION_COLLECTION_NAME)
      .aggregate(pipeline)
      .toArray();

    // Đếm đơn đang xử lý
    const pendingCount = await GET_DB()
      .collection(TRANSACTION_COLLECTION_NAME)
      .countDocuments({
        transactionDate: { $gte: startDate, $lte: endDate },
        status: "Đang xử lý",
      });

    // Format kết quả
    const result = {
      totalImport: 0,
      totalExport: 0,
      totalRevenue: 0,
      pendingOrders: pendingCount,
    };

    stats.forEach((s) => {
      if (s._id === "import") {
        result.totalImport = s.totalQuantity;
      } else if (s._id === "export") {
        result.totalExport = s.totalQuantity;
        result.totalRevenue = s.totalRevenue;
      }
    });

    return result;
  } catch (error) {
    const err = new Error("Không thể tải thống kê: " + error.message);
    err.statusCode = 500;
    throw err;
  }
};

export const transactionModel = {
  TRANSACTION_COLLECTION_NAME,
  TRANSACTION_SCHEMA,
  validateBeforeCreate,
  create,
  findAll,
  count,
  findById,
  update,
  getMonthlyStats,
};
