import express from "express";
import {
  createExportTransaction,
  createImportTransaction,
  getTransactions,
  getMonthlyStats,
  getTransactionById,
  updateTransactionStatus,
  exportInvoicePDF,
} from "../../controllers/transaction.controller.js";

const router = express.Router();

// [GET] /v1/transactions/stats - Lấy thống kê KPI
router.get("/stats", getMonthlyStats);

// [GET] /v1/transactions - Lấy danh sách giao dịch
router.get("/", getTransactions);

// [POST] /v1/transactions/export - Tạo đơn xuất chuồng
router.post("/export", createExportTransaction);

// [POST] /v1/transactions/import - Tạo đơn nhập chuồng
router.post("/import", createImportTransaction);

// [GET] /v1/transactions/:id/invoice - Xuất hóa đơn PDF
router.get("/:id/invoice", exportInvoicePDF);

// [GET] /v1/transactions/:id - Lấy chi tiết giao dịch
router.get("/:id", getTransactionById);

// [PATCH] /v1/transactions/:id/status - Cập nhật trạng thái
router.patch("/:id/status", updateTransactionStatus);

export default router;
