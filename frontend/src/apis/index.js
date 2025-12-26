import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8071/v1", 
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token hết hạn / không hợp lệ
      localStorage.removeItem("authToken");

      // Redirect về login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);
export default axiosInstance;