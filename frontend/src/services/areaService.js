// src/services/areaService.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8071/v1/areas";

// Lấy danh sách khu nuôi
export const getAreaList = async (params) => {
  const res = await axios.get(API_BASE_URL, { params });
  return res.data; // backend trả { status, data, pagination }
};

// Lấy overview (KPI + biểu đồ)
export const getAreaOverview = async () => {
  const res = await axios.get(`${API_BASE_URL}/overview`);
  return res.data; // backend trả { status, data }
};

// Xuất Excel
export const exportAreasExcel = async (params = {}) => {
  const res = await axios.get(`${API_BASE_URL}/export`, {
    params,
    responseType: "blob",
  });
  return res.data; // blob file
};

//  TẠO KHU NUÔI MỚI
export const createArea = async (data) => {
  const res = await axios.post(API_BASE_URL, data);
  return res.data; // backend trả { status, message, data }
};
// Xóa khu nuôi
export const deleteArea = async (id) => {
  const res = await axios.delete(`${API_BASE_URL}/${id}`);
  return res.data; // backend trả status + message
};
