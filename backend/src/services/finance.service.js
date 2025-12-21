import { financialTransactionModel } from "../models/financial-transaction.model.js";

/**
 * Lấy tổng quan tài chính (4 KPI)
 * @param {number} month - Tháng (1-12)
 * @param {number} year - Năm
 * @returns {Object} - { totalIncome, totalExpense, profit, profitMargin }
 */
const getFinancialOverview = async (month, year) => {
  try {
    const currentDate = new Date();
    const selectedMonth = month || currentDate.getMonth() + 1;
    const selectedYear = year || currentDate.getFullYear();

    // Ngày đầu và cuối tháng
    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);

    const pipeline = [
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
            }
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0]
            }
          }
        }
      }
    ];

    const result = await financialTransactionModel.aggregate(pipeline);

    if (!result || result.length === 0) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        profit: 0,
        profitMargin: 0
      };
    }

    const { totalIncome, totalExpense } = result[0];
    const profit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 
      ? ((profit / totalIncome) * 100).toFixed(2) 
      : 0;

    return {
      totalIncome,
      totalExpense,
      profit,
      profitMargin: parseFloat(profitMargin)
    };
  } catch (error) {
    throw new Error("Không thể tính toán KPI tài chính: " + error.message);
  }
};

/**
 * Lấy cơ cấu chi phí (theo danh mục)
 * @param {number} month 
 * @param {number} year 
 * @returns {Array} - [{ category, amount, percentage }]
 */
const getExpenseBreakdown = async (month, year) => {
  try {
    const currentDate = new Date();
    const selectedMonth = month || currentDate.getMonth() + 1;
    const selectedYear = year || currentDate.getFullYear();

    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);

    const pipeline = [
      {
        $match: {
          type: "expense",
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$category",
          amount: { $sum: "$amount" }
        }
      },
      {
        $sort: { amount: -1 }
      }
    ];

    const result = await financialTransactionModel.aggregate(pipeline);

    if (!result || result.length === 0) {
      return [];
    }

    // Tính tổng chi phí
    const totalExpense = result.reduce((sum, item) => sum + item.amount, 0);

    // Tính % cho từng danh mục
    const breakdown = result.map(item => ({
      category: item._id,
      amount: item.amount,
      percentage: totalExpense > 0 
        ? parseFloat(((item.amount / totalExpense) * 100).toFixed(2))
        : 0
    }));

    return breakdown;
  } catch (error) {
    throw new Error("Không thể tải cơ cấu chi phí: " + error.message);
  }
};

/**
 * Lấy xu hướng tài chính (Thu vs Chi theo tháng)
 * @param {number} months - Số tháng lùi lại (mặc định 6)
 * @param {number} year 
 * @returns {Array} - [{ month, monthLabel, income, expense }]
 */
const getFinancialTrend = async (months = 6, year) => {
  try {
    const currentDate = new Date();
    const selectedYear = year || currentDate.getFullYear();

    // Tính tháng bắt đầu
    const currentMonth = currentDate.getMonth() + 1;
    const startMonth = Math.max(1, currentMonth - months + 1);

    const startDate = new Date(selectedYear, startMonth - 1, 1);
    const endDate = new Date(selectedYear, currentMonth, 0, 23, 59, 59);

    const pipeline = [
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $month: "$date" },
          income: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
            }
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ];

    const result = await financialTransactionModel.aggregate(pipeline);

    // Tạo mảng đầy đủ các tháng (kể cả tháng không có dữ liệu)
    const trend = [];
    for (let m = startMonth; m <= currentMonth; m++) {
      const monthData = result.find(r => r._id === m);
      trend.push({
        month: m,
        monthLabel: `T${m}`,
        income: monthData?.income || 0,
        expense: monthData?.expense || 0
      });
    }

    return trend;
  } catch (error) {
    throw new Error("Không thể tải xu hướng tài chính: " + error.message);
  }
};

/**
 * Lấy danh sách giao dịch gần đây
 * @param {number} limit - Số lượng giao dịch (mặc định 10)
 * @returns {Array}
 */
const getRecentTransactions = async (limit = 10) => {
  try {
    const transactions = await financialTransactionModel.findAll(
      {},
      {
        sort: "date",
        order: "desc",
        limit: parseInt(limit),
        skip: 0
      }
    );

    return transactions;
  } catch (error) {
    throw new Error("Không thể tải giao dịch gần đây: " + error.message);
  }
};

/**
 * Tạo giao dịch mới
 */
const createTransaction = async (data) => {
  try {
    const newTransaction = await financialTransactionModel.create(data);
    return newTransaction;
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Không thể tạo giao dịch: " + error.message;
    }
    throw error;
  }
};

/**
 * Xóa giao dịch
 */
const deleteTransaction = async (id) => {
  try {
    const result = await financialTransactionModel.deleteById(id);
    return result;
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Không thể xóa giao dịch: " + error.message;
    }
    throw error;
  }
};

/**
 * Lấy chi tiết giao dịch
 */
const getTransactionById = async (id) => {
  try {
    const transaction = await financialTransactionModel.findById(id);
    if (!transaction) {
      const err = new Error("Không tìm thấy giao dịch");
      err.statusCode = 404;
      throw err;
    }
    return transaction;
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    throw error;
  }
};

export const financeService = {
  getFinancialOverview,
  getExpenseBreakdown,
  getFinancialTrend,
  getRecentTransactions,
  createTransaction,
  deleteTransaction,
  getTransactionById
};
