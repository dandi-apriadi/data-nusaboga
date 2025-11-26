import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

if (!BASE_URL) {
  // Keep consistent with authSlice expectation
  throw new Error("REACT_APP_API_BASE_URL environment variable is required");
}

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default api;
