import axios from "axios";

const API = "http://localhost:8071/v1/imports";

export const importApi = {
  getList(params = {}) {
    return axios.get(API, { params });
  },

  create(data) {
    return axios.post(API, data);
  },

  getDetail(id) {
    return axios.get(`${API}/${id}`);
  },

  update(id, data) {
    return axios.put(`${API}/${id}`, data);
  },

  delete(id) {
    return axios.delete(`${API}/${id}`);
  },
};
