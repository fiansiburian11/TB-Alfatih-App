// lib/axios-server.ts
import axios from "axios";

export const apiServer = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
});
