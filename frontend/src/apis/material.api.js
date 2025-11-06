// src/apis/material.api.js
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8071/v1/materials' // ✅ backend port 8071

export const materialAPI = {
  // Lấy danh sách vật tư
  getAll: (params = {}) => axios.get(API_BASE_URL, { params }),

  // Nhập Excel
  importExcel: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return axios.post(`${API_BASE_URL}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Xuất Excel
  exportExcel: (params = {}) =>
    axios.get(API_BASE_URL, {
      params: { ...params, export: true },
      responseType: 'blob'
    })
}
