import axios from "axios";

const FINANCE_API = "http://localhost:8071/v1/finance";

export const financeApi = {
  // Lấy tổng quan tài chính (4 KPI)
  getOverview: (month, year) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    return axios.get(`${FINANCE_API}/overview`, { params });
  },

  // Lấy cơ cấu chi phí
  getExpenseBreakdown: (month, year) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    return axios.get(`${FINANCE_API}/expense-breakdown`, { params });
  },

  // Lấy xu hướng tài chính
  getTrend: (months = 6, year) => {
    const params = { months };
    if (year) params.year = year;
    return axios.get(`${FINANCE_API}/trend`, { params });
  },

  // Lấy giao dịch gần đây
  getRecentTransactions: (limit = 10) => {
    return axios.get(`${FINANCE_API}/recent-transactions`, {
      params: { limit },
    });
  },

  // Tạo giao dịch mới
  createTransaction: (data) => {
    return axios.post(`${FINANCE_API}/transactions`, data);
  },

  // Xóa giao dịch
  deleteTransaction: (id) => {
    return axios.delete(`${FINANCE_API}/transactions/${id}`);
  },

  // Lấy chi tiết giao dịch
  getTransactionById: (id) => {
    return axios.get(`${FINANCE_API}/transactions/${id}`);
  },

  // Lấy danh sách giao dịch (PHÂN TRANG)
  getTransactions: ({ page = 1, limit = 10 }) => {
    return axios.get(`${FINANCE_API}/transactions`, {
      params: { page, limit },
    });
  },

  // Tìm kiếm & lọc giao dịch
  searchTransactions: (filters = {}) => {
    const params = {};
    if (filters.type && filters.type !== "all") params.type = filters.type;
    if (filters.category && filters.category !== "all")
      params.category = filters.category;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    return axios.get(`${FINANCE_API}/transactions/search`, { params });
  },
};
