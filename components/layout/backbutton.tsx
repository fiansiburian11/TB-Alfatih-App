"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <Button className="bg-red-500 mt-6 hover:bg-red-600" onClick={() => router.back()}>
      Kembali
    </Button>
  );
}
