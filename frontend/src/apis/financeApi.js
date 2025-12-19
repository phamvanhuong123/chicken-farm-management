import axios from "axios";

const FINANCE_API = "http://localhost:8071/v1/finances";

export const financeApi = {
  getList(params) {
    return axios.get(FINANCE_API, { params });
  },

  create(data) {
    return axios.post(FINANCE_API, data);
  },
};
