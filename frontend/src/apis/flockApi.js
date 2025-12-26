import axios from "~/apis/index";


export const flockApi = {
  // Lấy danh sách đàn gà
  getList: (params = {}) => axios.get("/flocks", { params }),
  
  // Lấy chi tiết đàn
  getDetail: (id) => axios.get(`/flocks/${id}`),
  
  // Tạo đàn mới
  create: (data) => axios.post("/flocks", data),
  
  // Cập nhật đàn
  update: (id, data) => axios.put(`/flocks/${id}`, data),
  
  // Xóa đàn
  delete: (id) => axios.delete(`/flocks/${id}`),
};