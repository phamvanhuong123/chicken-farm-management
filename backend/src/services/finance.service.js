import { financeModel } from "../models/finance.model.js";

const createFinance = async (data) => {
  if (new Date(data.financeDate) > new Date()) {
    const error = new Error("Ngày giao dịch không hợp lệ.");
    error.statusCode = 400;
    throw error;
  }

  if (Number(data.amount) <= 0) {
    const error = new Error("Số tiền phải lớn hơn 0.");
    error.statusCode = 400;
    throw error;
  }

  return await financeModel.create(data);
};

// LẤY DANH SÁCH QUA MODEL
const getFinanceList = async () => {
  try {
    return await financeModel.find({}, { sort: { financeDate: -1 } });
  } catch (error) {
    error.statusCode = 500;
    error.message = "Không thể lấy danh sách giao dịch.";
    throw error;
  }
};

export const financeService = {
  createFinance,
  getFinanceList,
};
