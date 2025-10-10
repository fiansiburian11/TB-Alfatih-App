"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Files } from "lucide-react";

export default function DraftPenawaran() {
  const pesan = {
    salam: "Assalamualaikum Kak, terima kasih sudah menghubungi kami. Lagi cari bahan bangunan apa hari ini?",
    tawar: "Kak, boleh saya bantu tawarkan produk terbaik untuk kebutuhan Kakak?",
    cocok: "Produk ini sangat cocok untuk proyek pembangunan rumah maupun renovasi Kakak.",
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-1 text-[#0892D8]">
        {/* Tombol Salam */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="items-center text-xs font-extralight border-[#0892D8] rounded-[4px] w-fit"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(pesan.salam);
              }}
            >
              <Files className="mr-1 h-4 w-4" />
              Salam
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs bg-gray-600 text-white text-sm p-2 rounded-md shadow-md">{pesan.salam}</TooltipContent>
        </Tooltip>

        {/* Tombol Tawar Produk */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="items-center text-xs font-extralight border-[#0892D8] rounded-[4px] w-fit"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(pesan.tawar);
              }}
            >
              <Files className="mr-1 h-4 w-4" />
              Tawar Produk
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs bg-gray-600 text-white text-sm p-2 rounded-md shadow-md">{pesan.tawar}</TooltipContent>
        </Tooltip>

        {/* Tombol Cocok Untuk */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="items-center text-xs font-extralight border-[#0892D8] rounded-[4px] w-fit"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(pesan.cocok);
              }}
            >
              <Files className="mr-1 h-4 w-4" />
              Cocok Untuk
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs bg-gray-600 text-white text-sm p-2 rounded-md shadow-md">{pesan.cocok}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
