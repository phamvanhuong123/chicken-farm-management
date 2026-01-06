import { financeService } from "../services/finance.service.js";

/**
 * [GET] /v1/finance/overview?month=12&year=2025
 * Lấy tổng quan tài chính (4 KPI)
 */
export const getFinancialOverview = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const overview = await financeService.getFinancialOverview(
      month ? parseInt(month) : null,
      year ? parseInt(year) : null
    );

    res.status(200).json({
      statusCode: 200,
      message: "Lấy tổng quan tài chính thành công",
      data: overview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [GET] /v1/finance/expense-breakdown?month=12&year=2025
 * Lấy cơ cấu chi phí theo danh mục
 */
export const getExpenseBreakdown = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const breakdown = await financeService.getExpenseBreakdown(
      month ? parseInt(month) : null,
      year ? parseInt(year) : null
    );

    res.status(200).json({
      statusCode: 200,
      message: "Lấy cơ cấu chi phí thành công",
      data: breakdown,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [GET] /v1/finance/trend?months=6&year=2025
 * Lấy xu hướng tài chính
 */
export const getFinancialTrend = async (req, res, next) => {
  try {
    const { months, year } = req.query;
    const trend = await financeService.getFinancialTrend(
      months ? parseInt(months) : 6,
      year ? parseInt(year) : null
    );

    res.status(200).json({
      statusCode: 200,
      message: "Lấy xu hướng tài chính thành công",
      data: trend,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [GET] /v1/finance/recent-transactions?limit=10
 * Lấy giao dịch gần đây
 */
export const getRecentTransactions = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const transactions = await financeService.getRecentTransactions(
      limit ? parseInt(limit) : 10
    );

    res.status(200).json({
      statusCode: 200,
      message: "Lấy giao dịch gần đây thành công",
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [POST] /v1/finance/transactions
 * Tạo giao dịch mới
 */
export const createTransaction = async (req, res, next) => {
  try {
    const { invoiceNumber, ...payload } = req.body;
    const newTransaction = await financeService.createTransaction(payload);

    res.status(201).json({
      statusCode: 201,
      message: "Tạo giao dịch thành công",
      data: newTransaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [GET] /v1/finance/transactions/:id
 * Lấy chi tiết giao dịch
 */
export const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await financeService.getTransactionById(id);

    res.status(200).json({
      statusCode: 200,
      message: "Lấy chi tiết giao dịch thành công",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [DELETE] /v1/finance/transactions/:id
 * Xóa giao dịch
 */
export const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await financeService.deleteTransaction(id);

    res.status(200).json({
      statusCode: 200,
      message: "Xóa giao dịch thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [GET] /v1/finance/transactions/search?type=income&category=Thức ăn&search=gà&page=1&limit=20
 * Tìm kiếm và lọc giao dịch
 */
export const searchTransactions = async (req, res, next) => {
  try {
    const { type, category, search, page, limit } = req.query;

    const result = await financeService.searchTransactions({
      type: type || "all",
      category: category || "all",
      search: search || "",
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });

    res.status(200).json({
      statusCode: 200,
      message: "Tìm kiếm giao dịch thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
