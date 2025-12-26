import { transactionModel } from "../models/transaction.model.js";
import { flockModel } from "../models/flock.model.js";
import { ObjectId } from "mongodb";

/**
 * Tạo đơn xuất chuồng mới
 */
const createExportTransaction = async (data) => {
  try {
    // Kiểm tra đàn gà tồn tại
    const flock = await flockModel.findOneById(data.flockId);
    if (!flock) {
      const err = new Error("Không tìm thấy đàn gà.");
      err.statusCode = 404;
      throw err;
    }

    // Kiểm tra số lượng xuất không vượt quá số gà còn lại
    if (data.quantity > flock.currentCount) {
      const err = new Error("Số lượng vượt quá số gà còn lại.");
      err.statusCode = 400;
      throw err;
    }

    // Tính doanh thu
    const totalRevenue = data.quantity * data.avgWeight * data.pricePerKg;

    // Tạo giao dịch
    const transactionData = {
      type: "export",
      flockId: data.flockId,
      flockCode: flock.code || flock._id.toString(),
      quantity: data.quantity,
      avgWeight: data.avgWeight,
      pricePerKg: data.pricePerKg || 0,
      totalRevenue: totalRevenue,
      customerName: data.customerName || "",
      transactionType: data.transactionType || "Bán",
      paymentMethod: data.paymentMethod || "Tiền mặt",
      paymentStatus: data.paymentStatus || "Chưa thanh toán",
      status: "Đang xử lý",
      note: data.note || "",
      transactionDate: new Date(data.transactionDate),
    };

    const newTransaction = await transactionModel.create(transactionData);

    // Cập nhật số lượng còn lại của đàn
    const newCurrentCount = flock.currentCount - data.quantity;
    await flockModel.update(data.flockId, {
      currentCount: newCurrentCount,
      // Nếu hết gà, đổi trạng thái
      ...(newCurrentCount === 0 && { status: "Sold" }),
    });

    return newTransaction;
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Không thể tạo đơn xuất: " + error.message;
    }
    throw error;
  }
};

/**
 * Tạo đơn nhập chuồng mới
 */
const createImportTransaction = async (data) => {
  try {
    // Kiểm tra đàn gà tồn tại
    const flock = await flockModel.findOneById(data.flockId);
    if (!flock) {
      const err = new Error("Không tìm thấy đàn gà.");
      err.statusCode = 404;
      throw err;
    }

    // Tạo giao dịch nhập
    const transactionData = {
      type: "import",
      flockId: data.flockId,
      flockCode: flock.code || flock._id.toString(),
      quantity: data.quantity,
      avgWeight: data.avgWeight,
      pricePerKg: data.pricePerKg || 0,
      totalRevenue: 0, // Nhập không có doanh thu
      supplierName: data.supplierName || "",
      transactionType: data.transactionType || "Nhập mới",
      paymentMethod: data.paymentMethod || "Tiền mặt",
      paymentStatus: data.paymentStatus || "Chưa thanh toán",
      status: "Đang xử lý",
      note: data.note || "",
      transactionDate: new Date(data.transactionDate),
    };

    const newTransaction = await transactionModel.create(transactionData);

    // Cập nhật số lượng đàn
    const newCurrentCount = flock.currentCount + data.quantity;
    await flockModel.update(data.flockId, {
      currentCount: newCurrentCount,
      // Nếu đàn đã bán/đóng, đổi về đang nuôi
      ...(flock.status !== "Raising" && { status: "Raising" }),
    });

    return newTransaction;
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Không thể tạo đơn nhập: " + error.message;
    }
    throw error;
  }
};

/**
 * Lấy danh sách giao dịch
 */
const getTransactions = async (query) => {
  const {
    page = 1,
    limit = 20,
    type, // "import" | "export"
    status,
    month,
    year,
  } = query;

  const filters = {};

  if (type) filters.type = type;
  if (status) filters.status = status;

  // Lọc theo tháng/năm
  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    filters.transactionDate = { $gte: startDate, $lte: endDate };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const items = await transactionModel.findAll(filters, "transactionDate", "desc", skip, Number(limit));
  const totalItems = await transactionModel.count(filters);
  const totalPages = Math.ceil(totalItems / limit);

  return { items, totalItems, totalPages, currentPage: Number(page) };
};

/**
 * Lấy thống kê KPI theo tháng
 */
const getMonthlyStats = async (month, year) => {
  return await transactionModel.getMonthlyStats(month, year);
};

/**
 * Lấy chi tiết giao dịch
 */
const getTransactionById = async (id) => {
  const transaction = await transactionModel.findById(id);
  if (!transaction) {
    const err = new Error("Không tìm thấy giao dịch.");
    err.statusCode = 404;
    throw err;
  }
  return transaction;
};

/**
 * Cập nhật trạng thái giao dịch
 */
const updateTransactionStatus = async (id, status) => {
  const validStatuses = ["Đang xử lý", "Hoàn thành", "Đã hủy"];
  if (!validStatuses.includes(status)) {
    const err = new Error("Trạng thái không hợp lệ.");
    err.statusCode = 400;
    throw err;
  }

  await transactionModel.update(id, { status });
  return await transactionModel.findById(id);
};

export const transactionService = {
  createExportTransaction,
  createImportTransaction,
  getTransactions,
  getMonthlyStats,
  getTransactionById,
  updateTransactionStatus,
};
