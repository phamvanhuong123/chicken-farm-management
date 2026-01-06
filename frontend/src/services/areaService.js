// src/services/areaService.js
import axios from "~/apis/index";


// Lấy danh sách khu nuôi
export const getAreaList = async (params) => {
  const res = await axios.get("/areas", { params });
  return res.data; // backend trả { status, data, pagination }
};

// Lấy overview (KPI + biểu đồ)
export const getAreaOverview = async () => {
  const res = await axios.get(`/areas/overview`);
  return res.data; // backend trả { status, data }
};

// Xuất Excel
export const exportAreasExcel = async (params = {}) => {
  const res = await axios.get(`/areas/export`, {
    params,
    responseType: "blob",
  });
  return res.data; // blob file
};

//  TẠO KHU NUÔI MỚI
export const createArea = async (data) => {
  const res = await axios.post("/areas", data);
  return res.data; // backend trả { status, message, data }
};
// Xóa khu nuôi
export const deleteArea = async (id) => {
  const res = await axios.delete(`/areas/${id}`);
  return res.data; // backend trả status + message
};
