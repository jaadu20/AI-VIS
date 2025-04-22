import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const { accessToken, isTokenExpired, refreshAuth } =
      useAuthStore.getState();

    if (accessToken && isTokenExpired()) {
      try {
        await refreshAuth();
      } catch (error) {
        useAuthStore.getState().autoLogout();
        return Promise.reject(error);
      }
    }

    const currentToken = useAuthStore.getState().accessToken;
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { logout } = useAuthStore.getState();

    if (!error.response) {
      console.error("Network Error:", error.message);
      return Promise.reject({
        message: "Network Error - Please check your internet connection",
      });
    }

    if (error.response.status === 401) {
      logout();
      window.location.href = "/login";
      return Promise.reject({
        message: "Session expired - Please login again",
      });
    }

    const errorMessage =
      error.response.data?.detail ||
      error.response.data?.message ||
      "An unexpected error occurred";
    return Promise.reject({
      message: errorMessage,
      status: error.response.status,
      data: error.response.data,
    });
  }
);

export default api;
