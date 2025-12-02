import axios from "axios";

const FLOCK_API = "http://localhost:8071/v1/flocks";

export const flockApi = {
  // Lấy danh sách đàn gà
  getList: (params = {}) => axios.get(FLOCK_API, { params }),
  
  // Lấy chi tiết đàn
  getDetail: (id) => axios.get(`${FLOCK_API}/${id}`),
  
  // Tạo đàn mới
  create: (data) => axios.post(FLOCK_API, data),
  
  // Cập nhật đàn
  update: (id, data) => axios.put(`${FLOCK_API}/${id}`, data),
  
  // Xóa đàn
  delete: (id) => axios.delete(`${FLOCK_API}/${id}`),
};