"use client";

import { ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";

interface ChangeKatalogProps {
  isStatusMode: boolean;
  onToggle: () => void;
}

export default function ChangeKatalog({ isStatusMode, onToggle }: ChangeKatalogProps) {
  return (
    <div>
      <Button onClick={onToggle} variant="outline">
        <ArrowUpDown className="mr-2 h-4 w-4" />
        {isStatusMode ? "Katalog Produk" : "Status Pengajuan"}
      </Button>
    </div>
  );
}
