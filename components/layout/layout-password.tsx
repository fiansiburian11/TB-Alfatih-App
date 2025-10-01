"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      {/* beri padding-right supaya tombol tidak menimpa teks */}
      <Input
        {...props}
        type={show ? "text" : "password"}
        className={`${props.className ?? ""}   border border-[#0892D8]/40
    focus-visible:border-[#067ab1]
    focus-visible:ring-[#067ab1]/50
    placeholder-shown:border-[#0892D8]/40
    not-placeholder-shown:border-[#0892D8] placeholder:text-slate-300 bg-slate-50 pr-10`} // ruang untuk tombol
      />

      {/* tombol toggle */}
      <button
        type="button"
        aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#067ab1] "
      >
        {/* Icon: eye / eye-off (inline SVG sederhana) */}
        {show ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-5 0-9.27-3-11-7 1.1-2.4 3-4.3 5.25-5.5" />
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c5 0 9.27 3 11 7-1.11 2.39-3 4.3-5.25 5.5" />
            <circle cx="12" cy="12" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
}
