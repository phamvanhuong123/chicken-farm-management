import axios from "~/apis/index";

const API = "http://localhost:8071/v1/imports";

export const importApi = {
  getList(params = {}) {
    return axios.get("/imports", { params });
  },

  create(data) {
    return axios.post("/imports", data);
  },

  getDetail(id) {
    return axios.get(`/imports/${id}`);
  },

  update(id, data) {
    return axios.put(`/imports/${id}`, data);
  },

  delete(id) {
    return axios.delete(`/imports/${id}`);
  },
};
