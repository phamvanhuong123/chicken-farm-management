import express from "express";
import {
  getFinancialOverview,
  getExpenseBreakdown,
  getFinancialTrend,
  getRecentTransactions,
  createTransaction,
  getTransactionById,
  deleteTransaction,
  searchTransactions,
} from "../../controllers/finance.controller.js";
import { validateCreateTransaction } from "../../validators/finance.validation.js";

const router = express.Router();

// KPI - Tổng quan tài chính
router.get("/overview", getFinancialOverview);

// Cơ cấu chi phí
router.get("/expense-breakdown", getExpenseBreakdown);

// Xu hướng tài chính
router.get("/trend", getFinancialTrend);

// Giao dịch gần đây
router.get("/recent-transactions", getRecentTransactions);

// Tìm kiếm & lọc giao dịch
router.get("/transactions/search", searchTransactions);

// CRUD Giao dịch
router.post("/transactions", validateCreateTransaction, createTransaction);
router.get("/transactions/:id", getTransactionById);
router.delete("/transactions/:id", deleteTransaction);

export default router;
