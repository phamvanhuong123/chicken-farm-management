import { transactionService } from "../services/transaction.service.js";
import PDFDocument from "pdfkit";

/**
 * [POST] /v1/transactions/export
 * Tạo đơn xuất chuồng mới
 */
export const createExportTransaction = async (req, res, next) => {
  try {
    const newTransaction = await transactionService.createExportTransaction(req.body);

    res.status(201).json({
      statusCode: 201,
      message: "Tạo đơn xuất thành công.",
      data: newTransaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [POST] /v1/transactions/import
 * Tạo đơn nhập chuồng mới
 */
export const createImportTransaction = async (req, res, next) => {
  try {
    const newTransaction = await transactionService.createImportTransaction(req.body);

    res.status(201).json({
      statusCode: 201,
      message: "Tạo đơn nhập thành công.",
      data: newTransaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [GET] /v1/transactions
 * Lấy danh sách giao dịch
 */
export const getTransactions = async (req, res, next) => {
  try {
    const result = await transactionService.getTransactions(req.query);

    res.status(200).json({
      statusCode: 200,
      message: "Lấy danh sách giao dịch thành công.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [GET] /v1/transactions/stats
 * Lấy thống kê KPI theo tháng
 */
export const getMonthlyStats = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const m = month ? parseInt(month) : currentDate.getMonth() + 1;
    const y = year ? parseInt(year) : currentDate.getFullYear();

    const stats = await transactionService.getMonthlyStats(m, y);

    res.status(200).json({
      statusCode: 200,
      message: "Lấy thống kê thành công.",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [GET] /v1/transactions/:id
 * Lấy chi tiết giao dịch
 */
export const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransactionById(req.params.id);

    res.status(200).json({
      statusCode: 200,
      message: "Lấy chi tiết giao dịch thành công.",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [PATCH] /v1/transactions/:id/status
 * Cập nhật trạng thái giao dịch
 */
export const updateTransactionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const transaction = await transactionService.updateTransactionStatus(req.params.id, status);

    res.status(200).json({
      statusCode: 200,
      message: "Cập nhật trạng thái thành công.",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [GET] /v1/transactions/:id/invoice
 * Xuất hóa đơn PDF
 */
export const exportInvoicePDF = async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransactionById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        statusCode: 404,
        message: "Không tìm thấy giao dịch.",
      });
    }

    // Format helpers
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    };

    const formatCurrency = (value) => {
      return (value || 0).toLocaleString("vi-VN") + " VND";
    };

    // Create PDF
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    // Set response headers
    const invoiceNumber = transaction.invoiceNumber || `HD-${transaction._id.toString().slice(-8).toUpperCase()}`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=hoa-don-${invoiceNumber}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // ===== Header =====
    doc.fontSize(18).font("Helvetica-Bold").text("TRANG TRAI GA ABC", { align: "center" });
    doc.fontSize(10).font("Helvetica").text("Dia chi: 123 Duong XYZ, Huyen ABC, Tinh DEF", { align: "center" });
    doc.text("Dien thoai: 0123 456 789 | Email: trangtrai@abc.vn", { align: "center" });
    doc.moveDown();

    // Line separator
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // ===== Title =====
    doc.fontSize(20).font("Helvetica-Bold").text("HOA DON XUAT CHUONG", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(11).font("Helvetica").text(`So: ${invoiceNumber}`, { align: "center" });
    doc.text(`Ngay: ${formatDate(transaction.transactionDate)}`, { align: "center" });
    doc.moveDown();

    // ===== Customer Info =====
    doc.fontSize(11).font("Helvetica-Bold").text("THONG TIN KHACH HANG:", { underline: true });
    doc.moveDown(0.5);
    doc.font("Helvetica");
    doc.text(`Khach hang: ${transaction.customerName}`);
    doc.text(`Dia chi: ${transaction.customerAddress || "—"}`);
    doc.text(`SDT: ${transaction.customerPhone || "—"}`);
    doc.moveDown();

    // ===== Transaction Info =====
    doc.font("Helvetica-Bold").text("THONG TIN GIAO DICH:", { underline: true });
    doc.moveDown(0.5);
    doc.font("Helvetica");
    doc.text(`Loai giao dich: ${transaction.transactionType}`);
    doc.text(`Hinh thuc thanh toan: ${transaction.paymentMethod}`);
    doc.text(`Trang thai: ${transaction.status}`);
    doc.moveDown();

    // ===== Items Table =====
    const tableTop = doc.y;
    const tableLeft = 50;
    const colWidths = [40, 80, 70, 70, 70, 80, 85];
    const headers = ["STT", "Ma dan", "SL (con)", "TL TB (kg)", "Tong TL", "Don gia/kg", "Thanh tien"];

    // Table header
    doc.font("Helvetica-Bold").fontSize(10);
    let x = tableLeft;
    headers.forEach((h, i) => {
      doc.text(h, x, tableTop, { width: colWidths[i], align: "center" });
      x += colWidths[i];
    });

    // Header line
    doc.moveTo(tableLeft, tableTop + 15).lineTo(tableLeft + colWidths.reduce((a, b) => a + b, 0), tableTop + 15).stroke();

    // Table row
    const rowTop = tableTop + 20;
    const totalWeight = transaction.quantity * transaction.avgWeight;
    const values = [
      "1",
      transaction.flockCode,
      transaction.quantity.toString(),
      transaction.avgWeight.toString(),
      totalWeight.toFixed(1),
      formatCurrency(transaction.pricePerKg),
      formatCurrency(transaction.totalRevenue),
    ];

    doc.font("Helvetica").fontSize(10);
    x = tableLeft;
    values.forEach((v, i) => {
      doc.text(v, x, rowTop, { width: colWidths[i], align: "center" });
      x += colWidths[i];
    });

    // Bottom line
    doc.moveTo(tableLeft, rowTop + 15).lineTo(tableLeft + colWidths.reduce((a, b) => a + b, 0), rowTop + 15).stroke();
    doc.moveDown(3);

    // ===== Total =====
    doc.font("Helvetica-Bold").fontSize(12);
    doc.text(`TONG CONG: ${formatCurrency(transaction.totalRevenue)}`, { align: "right" });
    doc.moveDown();

    // ===== Notes =====
    if (transaction.notes) {
      doc.font("Helvetica").fontSize(10);
      doc.text(`Ghi chu: ${transaction.notes}`);
      doc.moveDown();
    }

    // ===== Signatures =====
    const sigY = doc.y + 50;
    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("Nguoi lap phieu", 70, sigY, { align: "center", width: 150 });
    doc.text("Khach hang", 220, sigY, { align: "center", width: 150 });
    doc.text("Thu kho", 370, sigY, { align: "center", width: 150 });

    doc.font("Helvetica").fontSize(9);
    doc.text("(Ky, ghi ro ho ten)", 70, sigY + 15, { align: "center", width: 150 });
    doc.text("(Ky, ghi ro ho ten)", 220, sigY + 15, { align: "center", width: 150 });
    doc.text("(Ky, ghi ro ho ten)", 370, sigY + 15, { align: "center", width: 150 });

    // ===== Footer =====
    doc.fontSize(8).text(`In luc: ${new Date().toLocaleString("vi-VN")}`, 50, 750, { align: "center", width: 495 });
    doc.text("He thong Quan ly Trang trai Ga v1.0", 50, 760, { align: "center", width: 495 });

    // Finalize PDF
    doc.end();
  } catch (error) {
    next(error);
  }
};
