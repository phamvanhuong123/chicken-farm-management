// src/apis/transaction.api.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8071/v1/transactions";

export const transactionAPI = {
  // Lấy danh sách giao dịch xuất chuồng
  getAll: (params = {}) => axios.get(API_BASE_URL, { params }),

  // Lấy thống kê KPI theo tháng
  getStats: (params = {}) => axios.get(`${API_BASE_URL}/stats`, { params }),

  // Lấy chi tiết giao dịch
  getById: (id) => axios.get(`${API_BASE_URL}/${id}`),

  // Tạo đơn xuất chuồng
  createExport: (data) => axios.post(`${API_BASE_URL}/export`, data),

  // Cập nhật trạng thái
updateStatus: (id, data) =>
  axios.patch(`${API_BASE_URL}/${id}/status`, data, {
    headers: { "Content-Type": "application/json" }
  }),

  // Xuất hóa đơn PDF
  exportInvoice: (id) =>
    axios.get(`${API_BASE_URL}/${id}/invoice`, { responseType: "blob" }),

};
