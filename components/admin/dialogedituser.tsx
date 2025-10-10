"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/axios";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import UserSwitch from "./dialogconfirm";

export default function DialogEditUser({ user, open, onOpenChange, onUserUpdate }: { user: any; open?: boolean; onOpenChange?: (open: boolean) => void; onUserUpdate?: (updatedData: any) => void }) {
  // Jika open dan onOpenChange tidak disediakan, gunakan state internal
  const [internalOpen, setInternalOpen] = useState(false);
  const [username, setUsername] = useState(user.username || "");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(user.status ?? false);
  const [role, setRole] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Gunakan prop jika ada,否则 gunakan state internal
  const isOpen = open !== undefined ? open : internalOpen;
  const handleOpenChange = onOpenChange || setInternalOpen;

  // Normalisasi role awal
  useEffect(() => {
    if (Array.isArray(user.roles) && user.roles.length > 0) {
      setRole(user.roles[0].toLowerCase());
    } else if (typeof user.role === "string") {
      setRole(user.role.toLowerCase());
    }
  }, [user]);

  const roleOptions = [
    { label: "Super Visor", value: "supervisor" },
    { label: "Admin", value: "admin" },
    { label: "Staff", value: "staff" },
  ];

  // ✅ Simpan ke API
  const handleSave = async () => {
    try {
      setIsSaving(true);

      const payload: any = {
        id: user.id,
        username,
        role: role || user.role,
        status: status ? "true" : "false",
      };

      if (password.trim() !== "") {
        payload.password = password;
      }

      await api.put(`/private/admin/users`, payload);

      if (onUserUpdate) {
        onUserUpdate({
          username,
          status,
          role: role || user.role,
        });
      }

      handleOpenChange(false);
      setPassword(""); // Reset password field setelah save berhasil
    } catch (error: any) {
      console.error("Gagal menyimpan user:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Gagal menyimpan perubahan user");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form ketika dialog dibuka
  useEffect(() => {
    if (isOpen) {
      setUsername(user.username || "");
      setPassword("");
      setStatus(user.status ?? false);

      // Reset role
      if (Array.isArray(user.roles) && user.roles.length > 0) {
        setRole(user.roles[0].toLowerCase());
      } else if (typeof user.role === "string") {
        setRole(user.role.toLowerCase());
      }
    }
  }, [isOpen, user]);

  const dialogContent = (
    <DialogContent className="max-w-md rounded-xl p-6">
      <DialogHeader className="border-b">
        <DialogTitle className="text-lg font-semibold">Edit User</DialogTitle>
      </DialogHeader>

      <div className="mt-4 space-y-4">
        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Masukkan Username" />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Kosongkan jika tidak ingin ubah" />
        </div>

        {/* Role */}
        <div className="space-y-2">
          <Label>Role User</Label>
          <div className="flex gap-4">
            {roleOptions.map(({ label, value }) => (
              <div key={value} className="flex items-center space-x-2">
                <Checkbox
                  id={value}
                  checked={role === value}
                  onCheckedChange={(checked) => {
                    if (checked) setRole(value);
                  }}
                />
                <Label htmlFor={value}>{label}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>Status</Label>
          <UserSwitch
            user={user}
            onStatusChange={(newStatus) => {
              setStatus(newStatus);
            }}
          />
        </div>
      </div>

      <DialogFooter className="mt-6 flex justify-end gap-2">
        <Button variant="destructive" onClick={() => handleOpenChange(false)}>
          Kembali
        </Button>
        <Button className="bg-[#FEB941] hover:bg-[#FEB941]/80" onClick={handleSave} disabled={isSaving || !username.trim()}>
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  // Jika menggunakan controlled mode (open dan onOpenChange disediakan)
  if (open !== undefined) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        {dialogContent}
      </Dialog>
    );
  }

  // Jika menggunakan uncontrolled mode (untuk tombol edit di tabel)
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="icon" className="bg-[#F9A825] hover:bg-[#d48f1d] text-white rounded-md">
          <Pencil size={18} />
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}