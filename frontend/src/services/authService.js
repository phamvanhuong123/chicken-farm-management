import axios from 'axios';

function resolveApiUrl() {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
  } catch (e) {
  }

  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  if (typeof window !== 'undefined' && window.__REACT_APP_API_URL__) {
    return window.__REACT_APP_API_URL__;
  }

  return 'http://localhost:8071/auth';
}

const API_URL = resolveApiUrl();


export const register = async (data) => {
  const res = await axios.post(`${API_URL}/register`, data);
  return res.data;
};

export const verifyOtp = async (email, otp) => {
  const res = await axios.post(`${API_URL}/verify-otp`, { email, otp });
  return res.data;
};

export const resendOtp = async (email) => {
  const res = await axios.post(`${API_URL}/resend-otp`, { email });
  return res.data;
};

export const login = async (data) => {
  const res = await axios.post(`${API_URL}/login`, data);
  return res.data;
};

export default { register, verifyOtp, resendOtp, login };