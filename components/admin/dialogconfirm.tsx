"use client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

export default function UserSwitch({ user, onStatusChange }: { user: any; onStatusChange?: (newStatus: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"confirm" | "success">("confirm");
  const [pendingStatus, setPendingStatus] = useState<boolean | null>(null);
  const [status, setStatus] = useState(user.status);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setStatus(user.status);
  }, [user.status]);


  // Tutup otomatis setelah sukses
  useEffect(() => {
    if (step === "success") {
      const timer = setTimeout(() => {
        setOpen(false);
        // jeda sebentar supaya modal confirm tidak muncul sekilas
        setTimeout(() => setStep("confirm"), 300);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleStatusChange = async (userId: string, newStatus: boolean) => {
    try {
      setIsLoading(true);
      await api.put(`/private/admin/users`, { id: userId, status: newStatus });
      setStatus(newStatus);
      setStep("success");

      // 🔹 panggil callback agar parent tahu perubahan status
      if (onStatusChange) onStatusChange(newStatus);
    } catch (err) {
      console.error(err);
      alert("Gagal mengupdate status user");
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (pendingStatus !== null) {
      await handleStatusChange(user.id, pendingStatus);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setStep("confirm");
  };

  return (
    <>
      {/* Switch trigger */}
      <Switch
        checked={status}
        onCheckedChange={(val) => {
          setPendingStatus(val);
          setOpen(true);
        }}
      />

      {/* Modal */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-sm text-center">
          {step === "confirm" ? (
            <>
              <AlertDialogHeader>
                <Image src="/assets/notifsurat.png" width={200} height={200} alt="confirmation" className="mx-auto" />
                <AlertDialogTitle className="text-center">{pendingStatus ? "Ingin Mengaktifkan akun user?" : "Ingin menonaktifkan akun user?"}</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter className="bg-gray-100 -mx-6 p-2 -mb-6 rounded-b-md justify-center space-x-2">
                <Button variant="destructive" onClick={handleClose}>
                  Batal
                </Button>
                <Button className="bg-[#0892D8] hover:bg-[#0892D8]/90" onClick={handleConfirm} disabled={isLoading}>
                  {isLoading ? "Memproses..." : pendingStatus ? "Aktifkan" : "Nonaktifkan"}
                </Button>
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <div className="flex justify-center my-3">
                  <Image src="/assets/check.png" alt="Success" width={100} height={100} />
                </div>
                <AlertDialogTitle className="text-center">Berhasil {status ? "mengaktifkan" : "menonaktifkan"} akun user</AlertDialogTitle>
              </AlertDialogHeader>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
