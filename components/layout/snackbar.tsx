"use client";

import { toast } from "sonner";
import {  XCircle } from "lucide-react";


export const showSuccessToast = (message: string) => {
  toast.custom(
    () => (
      <div
        className="flex items-center gap-3 text-black font-semibold px-4 py-3 rounded-lg border-l-4 border-[#0892D8] bg-white shadow-md"
        style={{
          boxShadow: "0px 4px 15px rgba(8, 146, 216, 0.4)",
        }}
      >
        <img src="/assets/snackbaricon.png" alt="icon" className="w-5 h-5" />
        <span>{message}</span>
      </div>
    ),
    {
      unstyled: true, 
    }
  );
};

export const showErrorToast = (message: string) => {
  toast.custom(() => (
    <div
      className="flex items-center gap-3 bg-white text-black font-semibold px-4 py-3 rounded-lg border-l-4 border-red-500"
      style={{
        boxShadow: "0px 4px 15px rgba(239, 68, 68, 0.4)",
      }}
    >
      <XCircle className="text-red-500" size={22} />
      <span>{message}</span>
    </div>
  ));
};
