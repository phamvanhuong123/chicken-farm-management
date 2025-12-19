import { financeService } from "../services/finance.service.js";

export const createFinance = async (req, res) => {
  try {
    const {
      financeDate,
      type,
      category,
      amount,
      flockId,
      description,
      invoiceNumber,
    } = req.body;

    //  Thiếu field bắt buộc
    if (!financeDate || !type || !category || !amount || !description) {
      return res.status(400).json({
        status: "error",
        message: "Vui lòng nhập đầy đủ thông tin bắt buộc.",
      });
    }

    const payload = {
      financeDate,
      type,
      category,
      amount: Number(amount),
      flockId: flockId || null,
      description: description.trim(),
      invoiceNumber: invoiceNumber || null,
    };

    const result = await financeService.createFinance(payload);

    return res.status(201).json({
      status: "success",
      message: "Thêm giao dịch thành công.",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message || "Không thể thêm giao dịch, vui lòng thử lại.",
    });
  }
};

//Lấy danh sách giao dịch tài chính
export const getFinanceList = async (req, res) => {
  try {
    const data = await financeService.getFinanceList();

    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Không thể lấy danh sách giao dịch.",
    });
  }
};
