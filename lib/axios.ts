import axios, { AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

// 🔹 Buat instance axios utama
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 60000,
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
});

// 🔹 Interceptor request → kirim token otomatis
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message?.toLowerCase();
    const url = error.config?.url;

    console.log("🔍 Interceptor Error Detail:", {
      status,
      message,
      url,
      data: error.response?.data,
    });

    // 🔥 HANYA handle token invalid yang spesifik
    const isTokenInvalid = status === 400 && message?.includes("akses token tidak valid");

    if (isTokenInvalid) {
      console.warn("🚨 Token invalid, redirect ke login");
      Cookies.remove("token");
      Cookies.remove("role");

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    // Error lainnya, biarkan component handle
    return Promise.reject(error);
  }
);

// 🔹 Helper function untuk request API
export async function apiRequest<T = any>(path: string, options?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await api({
      url: path,
      ...options,
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Terjadi kesalahan pada server";

    if (process.env.NODE_ENV === "development") {
      console.warn("API Error:", message);
    }

    throw new Error(message);
  }
}
