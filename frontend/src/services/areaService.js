// src/services/areaService.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8071/v1/areas";

// Lấy danh sách khu nuôi
export const getAreaList = async (params) => {
  const res = await axios.get(API_BASE_URL, { params });
  // backend trả { status, data, pagination }
  return res.data;
};

// Lấy overview (KPI + biểu đồ)
export const getAreaOverview = async () => {
  const res = await axios.get(`${API_BASE_URL}/overview`);
  // backend trả { status, data }
  return res.data;
};

// Xuất Excel
export const exportAreasExcel = async (params = {}) => {
  const res = await axios.get(`${API_BASE_URL}/export`, {
    params,
    responseType: "blob",
  });
  return res.data; // blob file, tí nữa FE handle tải xuống
};
