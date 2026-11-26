import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 90000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ascendai_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Something went wrong";
    if (error.response?.status === 401 && !String(error.config?.url).includes("/auth/login")) {
      localStorage.removeItem("ascendai_token");
      localStorage.removeItem("ascendai_user");
      window.dispatchEvent(new Event("ascendai:unauthorized"));
    }
    return Promise.reject(new Error(message));
  },
);

export default api;
