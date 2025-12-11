import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.VITE_APP_BASE_URL || "http://localhost:5000",
  withCredentials: true,
});
