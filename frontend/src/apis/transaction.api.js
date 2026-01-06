// src/apis/transaction.api.js
import axios from "~/apis/index";


export const transactionAPI = {
  // Lấy danh sách giao dịch xuất chuồng
  getAll: (params = {}) => axios.get("transactions", { params }),

  // Lấy thống kê KPI theo tháng
  getStats: (params = {}) => axios.get(`transactions/stats`, { params }),

  // Lấy chi tiết giao dịch
  getById: (id) => axios.get(`transactions/${id}`),

  // Tạo đơn xuất chuồng
  createExport: (data) => axios.post(`transactions/export`, data),

  // Cập nhật trạng thái
updateStatus: (id, data) =>
  axios.patch(`transactions/${id}/status`, data, {
    headers: { "Content-Type": "application/json" }
  }),

  // Xuất hóa đơn PDF
  exportInvoice: (id) =>
    axios.get(`transactions/${id}/invoice`, { responseType: "blob" }),

};
