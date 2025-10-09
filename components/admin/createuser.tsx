"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/axios";
import { Plus } from "lucide-react";

type DialogTambahUserProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onUserAdded?: (newUser: any) => void;
};

export default function DialogTambahUser({ open, onOpenChange, onUserAdded }: DialogTambahUserProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const handleOpenChange = onOpenChange || setInternalOpen;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("");
  const [status, setStatus] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const roleOptions = [
    { label: "Super Visor", value: "supervisor" },
    { label: "Admin", value: "admin" },
    { label: "Staff", value: "staff" },
  ];

  const handleCreate = async () => {
    if (!username.trim() || !password.trim() || !role) return;

    try {
      setIsSaving(true);

      const payload = {
        username,
        password,
        role,
        status,
      };

      const res = await api.post("/private/admin/users", payload);

      // Mapping data API agar sesuai tipe User
      const data = res.data.data || res.data; // fallback kalau nested
      const newUser = {
        id: data.id,
        username: data.username,
        status: data.status,
        avatar: data.img_profile ? `https://api.rusnandapurnama.com/${data.img_profile}` : "/assets/genteng.jpg",
        role: data.role,
        created_at: data.created_at,
        updated_at: data.updated_at,
        password: "******",
      };

      // Callback ke parent
      if (onUserAdded) onUserAdded(newUser);

      // Reset form
      handleOpenChange(false);
      setUsername("");
      setPassword("");
      setRole("");
      setStatus(false);
    } catch (err: any) {
      console.error("Gagal menambah user:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Gagal menambahkan user");
    } finally {
      setIsSaving(false);
    }
  };

  const dialogContent = (
    <DialogContent className="max-w-md rounded-xl p-6">
      <DialogHeader className="border-b">
        <DialogTitle className="text-lg font-semibold">Tambah User</DialogTitle>
      </DialogHeader>

      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" placeholder="Masukkan Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Masukkan Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Role User</Label>
          <div className="flex gap-4">
            {roleOptions.map(({ label, value }) => (
              <div key={value} className="flex items-center space-x-2">
                <Checkbox id={value} checked={role === value} onCheckedChange={(checked) => checked && setRole(value)} />
                <Label htmlFor={value}>{label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Switch checked={status} onCheckedChange={setStatus} />
        </div>
      </div>

      <DialogFooter className="mt-6 flex justify-end gap-2">
        <Button variant="destructive" onClick={() => handleOpenChange(false)} disabled={isSaving}>
          Kembali
        </Button>
        <Button className="bg-[#0892D8] hover:bg-[#0892D8]/80 text-white" onClick={handleCreate} disabled={isSaving || !username || !password || !role}>
          {isSaving ? "Menyimpan..." : "Tambah"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-[#0892D8] hover:bg-[#067ab1] text-white font-semibold flex gap-2 cursor-pointer">
          <Plus size={18} /> Tambah User
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
