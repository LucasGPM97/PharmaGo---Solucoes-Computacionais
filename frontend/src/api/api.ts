import axios from "axios";

export const API_URL = "http://192.168.1.16:3000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
