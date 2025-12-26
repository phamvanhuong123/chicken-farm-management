import axios from "~/apis/index";

const AREA_API = "http://localhost:8071/v1/areas";

export const areaApi = {
  getList() {
    return axios.get('/areas');
  },

  create(data) {
    return axios.post("/areas", data);
  },

  getDetail(id) {
    return axios.get(`/areas/${id}`);
  },

  update(id, data) {
    return axios.put(`/areas/${id}`, data);
  },

  delete(id) {
    return axios.delete(`/areas/${id}`);
  },
};