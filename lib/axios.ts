// lib/axios.ts
import axios, { AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

// 🔹 Buat instance axios utama
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 60000, // ⏱️ 60 detik agar upload tidak timeout
  maxBodyLength: Infinity, // 🚀 izinkan file besar
  maxContentLength: Infinity, // 🚀 izinkan response besar
});

// 🔹 Tambahkan interceptor untuk otomatis kirim token
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

// 🔹 Helper function untuk request API yang aman
export async function apiRequest<T = any>(path: string, options?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await api({
      url: path,
      ...options,
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Terjadi kesalahan pada server";

    // Hanya tampilkan di development
    if (process.env.NODE_ENV === "development") {
      console.warn("API Error:", message);
    }

    throw new Error(message);
  }
}

