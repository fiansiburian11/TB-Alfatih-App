"use client";

import PasswordInput from "@/components/layout/input-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { showErrorToast, showSuccessToast } from "../layout/snackbar";

type LoginResponse = {
  status: number;
  message: string;
  data: {
    access_token: string;
    user_details: {
      id: string;
      username: string;
      role: string;
      status: boolean;
      img_profile: string;
      created_at: string;
      updated_at: string;
    };
  };
  refrence: null;
  error: boolean;
};

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    // 🧩 Validasi sebelum kirim request
    if (!username || !password) {
      showErrorToast("Username dan password tidak boleh kosong");
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest<LoginResponse>("/public/users/auth", {
        method: "POST",
        data: { username, password },
      });

      // ✅ Simpan token & role ke cookie (1 hari)
      Cookies.set("token", data.data.access_token, {
        expires: 1,
        path: "/",
        sameSite: "strict",
      });
      Cookies.set("role", data.data.user_details.role, {
        expires: 1,
        path: "/",
        sameSite: "strict",
      });

      showSuccessToast("Berhasil masuk ke akun kliksales!");

      // 🧭 Arahkan sesuai role
      switch (data.data.user_details.role) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "staff":
          router.push("/staff/dashboard");
          break;
        case "supervisor":
          router.push("/supervisor/dashboard");
          break;
        default:
          router.push("/login");
          break;
      }
    } catch (err: any) {
      showErrorToast(err.response?.data?.message || "Username atau password salah");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-[400px] p-6 space-y-4">
      <h1 className="font-bold text-[#0892D8] text-center text-2xl">KLIKSALES</h1>
      <h1 className="text-center">Masuk Ke Akun Kliksales</h1>
      <Tabs defaultValue="account" className="space-y-3">
        <TabsContent value="account" className="space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-3"
          >
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-[#0892D8]/40 focus-visible:border-[#067ab1]
              focus-visible:ring-[#067ab1]/50 placeholder-shown:border-[#0892D8]/40
              not-placeholder-shown:border-[#0892D8] placeholder:text-slate-300 bg-slate-50 pr-10"
            />

            <PasswordInput value={password} onChange={(e: any) => setPassword(e.target.value)} />

            <Button type="submit" disabled={loading} className="w-full bg-[#0892D8] text-white hover:bg-[#067ab1] font-extralight cursor-pointer">
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
