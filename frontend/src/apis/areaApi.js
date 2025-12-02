import axios from "axios";

const AREA_API = "http://localhost:8071/v1/areas";

export const areaApi = {
  getList() {
    return axios.get(AREA_API);
  },

  create(data) {
    return axios.post(AREA_API, data);
  },

  getDetail(id) {
    return axios.get(`${AREA_API}/${id}`);
  },

  update(id, data) {
    return axios.put(`${AREA_API}/${id}`, data);
  },

  delete(id) {
    return axios.delete(`${AREA_API}/${id}`);
  },
};