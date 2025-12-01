// src/apis/transaction.api.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8071/v1/transactions";

export const transactionAPI = {
  // Lấy danh sách giao dịch xuất chuồng
  getAll: (params = {}) => axios.get(API_BASE_URL, { params }),

  // Lấy thống kê KPI theo tháng
  getStats: (params = {}) => axios.get(`${API_BASE_URL}/stats`, { params }),

  // Tạo đơn xuất chuồng
  createExport: (data) => axios.post(`${API_BASE_URL}/export`, data),
};
