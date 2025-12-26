// src/apis/material.api.js
import axios from "~/apis/index";
export const materialAPI = {
  // Lấy danh sách vật tư
  getAll: (params = {}) => axios.get('/materials', { params }),

  // 🟡 Lấy chi tiết 1 vật tư theo ID (TEAM-104)
  getById: (id) => axios.get(`/materials/${id}`), // 👈 thêm dòng này

  // ➕ Thêm vật tư mới
  create: (data) => axios.post("/materials", data),

  // Nhập Excel
  importExcel: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axios.post(`/materials/import`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Xuất Excel
  exportExcel: (params = {}) =>
    axios.get("/materials", {
      params: { ...params, export: true },
      responseType: "blob",
    }),
};